import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_REQUIREMENTS, 
  STORAGE_KEY_CATEGORIES, 
  STORAGE_KEY_REQUIREMENTS 
} from './data/initialData';
import { getInitialTasks, getInitialTaskCompletions } from './data/initialTasks';
import { INITIAL_RECIPES, INITIAL_RECIPE_CATEGORIES } from './data/initialRecipes';
import { 
  AppSection, 
  AuthRole,
  Category, 
  InventoryItem, 
  MeasurementType, 
  RecipeIngredient, 
  RecipeItem, 
  RequirementItem, 
  TaskCompletionRecord, 
  TaskItem, 
  TaskRole, 
  TaskType 
} from './types';
import { 
  supabase, 
  isSupabaseConfigured, 
  fetchAllAppState, 
  upsertAppState 
} from './lib/supabaseClient';
import { HomeScreen } from './components/HomeScreen';
import { InventorySection } from './components/InventorySection';
import { TasksSection } from './components/TasksSection';
import { RecipesSection } from './components/RecipesSection';
import { PinLoginScreen, SESSION_STORAGE_AUTH_KEY } from './components/PinLoginScreen';
import { StaffScheduleSection } from './components/StaffScheduleSection';
import { 
  getTodayJalaliDate, 
  formatTimePersian, 
  doesTaskApplyToday 
} from './utils/persianDate';

// Independent localStorage persistence keys (offline & instant cache)
const STORAGE_KEY_TASKS = 'cafe_tasks_v1';
const STORAGE_KEY_TASK_COMPLETIONS = 'cafe_task_completions_v1';
const STORAGE_KEY_RECIPES = 'cafe_recipes_v1';
const STORAGE_KEY_RECIPE_CATEGORIES = 'cafe_recipe_categories_v1';
const STORAGE_KEY_LAST_CHECK = 'cafe_last_inventory_check_v1';

const ROLE_DISPLAY_NAMES: Record<AuthRole, string> = {
  waiter1: 'سالندار اول',
  waiter2: 'سالندار دوم',
  waiter3: 'سالندار سوم',
  dishwasher: 'ظرفشور',
  manager: 'مدیریت',
};

export default function App() {
  // 0. AUTHENTICATION & ACCESS CONTROL (sessionStorage - device specific)
  const [sessionRole, setSessionRole] = useState<AuthRole | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_AUTH_KEY);
      if (
        saved === 'manager' ||
        saved === 'dishwasher' ||
        saved === 'waiter1' ||
        saved === 'waiter2' ||
        saved === 'waiter3'
      ) {
        return saved as AuthRole;
      }
    } catch (e) {
      console.error('Failed to read session role', e);
    }
    return null;
  });

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_AUTH_KEY);
    } catch (e) {
      console.error('Failed to clear session', e);
    }
    setSessionRole(null);
    setActiveSection('home');
  };

  // Top-level Navigation for Manager: 'home' | 'inventory' | 'tasks' | 'recipes'
  const [activeSection, setActiveSection] = useState<AppSection>('home');

  // 1. INVENTORY STATE
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load categories from localStorage', e);
    }
    return INITIAL_CATEGORIES;
  });

  const [requirements, setRequirements] = useState<RequirementItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REQUIREMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load requirements from localStorage', e);
    }
    return INITIAL_REQUIREMENTS;
  });

  const [lastInventoryDate, setLastInventoryDate] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_LAST_CHECK) || '';
  });

  // 2. TASKS STATE
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load tasks from localStorage', e);
    }
    return getInitialTasks();
  });

  const [completions, setCompletions] = useState<TaskCompletionRecord>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASK_COMPLETIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load task completions from localStorage', e);
    }
    return getInitialTaskCompletions();
  });

  // 3. RECIPES STATE
  const [recipes, setRecipes] = useState<RecipeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECIPES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load recipes from localStorage', e);
    }
    return INITIAL_RECIPES;
  });

  const [recipeCategories, setRecipeCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECIPE_CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load recipe categories from localStorage', e);
    }
    return INITIAL_RECIPE_CATEGORIES;
  });

  // Reference trackers to prevent echo loops during Realtime synchronization
  const isRemoteUpdateRef = useRef<Record<string, boolean>>({});
  const categoriesRef = useRef(categories);
  const requirementsRef = useRef(requirements);
  const tasksRef = useRef(tasks);
  const completionsRef = useRef(completions);
  const recipesRef = useRef(recipes);
  const recipeCategoriesRef = useRef(recipeCategories);
  const lastInventoryDateRef = useRef(lastInventoryDate);

  // Keep refs up-to-date
  categoriesRef.current = categories;
  requirementsRef.current = requirements;
  tasksRef.current = tasks;
  completionsRef.current = completions;
  recipesRef.current = recipes;
  recipeCategoriesRef.current = recipeCategories;
  lastInventoryDateRef.current = lastInventoryDate;

  // ──────────────────────────────────────────
  // SUPABASE INITIAL MOUNT FETCH & SEED
  // ──────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;
    (async () => {
      try {
        const remoteData = await fetchAllAppState();
        if (!isMounted || !remoteData) return;

        if (remoteData.categories !== undefined) {
          isRemoteUpdateRef.current.categories = true;
          setCategories(remoteData.categories);
          try {
            localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(remoteData.categories));
          } catch {}
        } else {
          upsertAppState('categories', categoriesRef.current);
        }

        if (remoteData.requirements !== undefined) {
          isRemoteUpdateRef.current.requirements = true;
          setRequirements(remoteData.requirements);
          try {
            localStorage.setItem(STORAGE_KEY_REQUIREMENTS, JSON.stringify(remoteData.requirements));
          } catch {}
        } else {
          upsertAppState('requirements', requirementsRef.current);
        }

        if (remoteData.tasks !== undefined) {
          isRemoteUpdateRef.current.tasks = true;
          setTasks(remoteData.tasks);
          try {
            localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(remoteData.tasks));
          } catch {}
        } else {
          upsertAppState('tasks', tasksRef.current);
        }

        if (remoteData.completions !== undefined) {
          isRemoteUpdateRef.current.completions = true;
          setCompletions(remoteData.completions);
          try {
            localStorage.setItem(STORAGE_KEY_TASK_COMPLETIONS, JSON.stringify(remoteData.completions));
          } catch {}
        } else {
          upsertAppState('completions', completionsRef.current);
        }

        if (remoteData.recipes !== undefined) {
          isRemoteUpdateRef.current.recipes = true;
          setRecipes(remoteData.recipes);
          try {
            localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(remoteData.recipes));
          } catch {}
        } else {
          upsertAppState('recipes', recipesRef.current);
        }

        if (remoteData.recipeCategories !== undefined) {
          isRemoteUpdateRef.current.recipeCategories = true;
          setRecipeCategories(remoteData.recipeCategories);
          try {
            localStorage.setItem(STORAGE_KEY_RECIPE_CATEGORIES, JSON.stringify(remoteData.recipeCategories));
          } catch {}
        } else {
          upsertAppState('recipeCategories', recipeCategoriesRef.current);
        }

        if (remoteData.lastInventoryDate !== undefined) {
          isRemoteUpdateRef.current.lastInventoryDate = true;
          setLastInventoryDate(String(remoteData.lastInventoryDate || ''));
          try {
            localStorage.setItem(STORAGE_KEY_LAST_CHECK, String(remoteData.lastInventoryDate || ''));
          } catch {}
        } else if (lastInventoryDateRef.current) {
          upsertAppState('lastInventoryDate', lastInventoryDateRef.current);
        }
      } catch (err) {
        console.error('Error during initial Supabase sync:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // ──────────────────────────────────────────
  // SUPABASE REALTIME SUBSCRIPTION (CROSS-DEVICE)
  // ──────────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('app_state_realtime_sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_state',
        },
        (payload) => {
          const newRow = payload.new as { key: string; value: any } | null;
          if (!newRow || !newRow.key) return;

          const { key, value } = newRow;

          if (key === 'categories' && value) {
            const jsonStr = JSON.stringify(value);
            if (JSON.stringify(categoriesRef.current) !== jsonStr) {
              isRemoteUpdateRef.current.categories = true;
              setCategories(value);
              try {
                localStorage.setItem(STORAGE_KEY_CATEGORIES, jsonStr);
              } catch {}
            }
          } else if (key === 'requirements' && value) {
            const jsonStr = JSON.stringify(value);
            if (JSON.stringify(requirementsRef.current) !== jsonStr) {
              isRemoteUpdateRef.current.requirements = true;
              setRequirements(value);
              try {
                localStorage.setItem(STORAGE_KEY_REQUIREMENTS, jsonStr);
              } catch {}
            }
          } else if (key === 'tasks' && value) {
            const jsonStr = JSON.stringify(value);
            if (JSON.stringify(tasksRef.current) !== jsonStr) {
              isRemoteUpdateRef.current.tasks = true;
              setTasks(value);
              try {
                localStorage.setItem(STORAGE_KEY_TASKS, jsonStr);
              } catch {}
            }
          } else if (key === 'completions' && value) {
            const jsonStr = JSON.stringify(value);
            if (JSON.stringify(completionsRef.current) !== jsonStr) {
              isRemoteUpdateRef.current.completions = true;
              setCompletions(value);
              try {
                localStorage.setItem(STORAGE_KEY_TASK_COMPLETIONS, jsonStr);
              } catch {}
            }
          } else if (key === 'recipes' && value) {
            const jsonStr = JSON.stringify(value);
            if (JSON.stringify(recipesRef.current) !== jsonStr) {
              isRemoteUpdateRef.current.recipes = true;
              setRecipes(value);
              try {
                localStorage.setItem(STORAGE_KEY_RECIPES, jsonStr);
              } catch {}
            }
          } else if (key === 'recipeCategories' && value) {
            const jsonStr = JSON.stringify(value);
            if (JSON.stringify(recipeCategoriesRef.current) !== jsonStr) {
              isRemoteUpdateRef.current.recipeCategories = true;
              setRecipeCategories(value);
              try {
                localStorage.setItem(STORAGE_KEY_RECIPE_CATEGORIES, jsonStr);
              } catch {}
            }
          } else if (key === 'lastInventoryDate') {
            const strVal = String(value || '');
            if (lastInventoryDateRef.current !== strVal) {
              isRemoteUpdateRef.current.lastInventoryDate = true;
              setLastInventoryDate(strVal);
              try {
                localStorage.setItem(STORAGE_KEY_LAST_CHECK, strVal);
              } catch {}
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ Supabase Realtime connected: listening to app_state');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ──────────────────────────────────────────
  // DEBOUNCED AUTO-PERSIST (500ms TO SUPABASE + LOCALSTORAGE)
  // ──────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to persist categories to localStorage', e);
    }

    if (isRemoteUpdateRef.current.categories) {
      isRemoteUpdateRef.current.categories = false;
      return;
    }

    if (!isSupabaseConfigured) return;
    const timer = setTimeout(() => {
      upsertAppState('categories', categories);
    }, 500);

    return () => clearTimeout(timer);
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REQUIREMENTS, JSON.stringify(requirements));
    } catch (e) {
      console.error('Failed to persist requirements to localStorage', e);
    }

    if (isRemoteUpdateRef.current.requirements) {
      isRemoteUpdateRef.current.requirements = false;
      return;
    }

    if (!isSupabaseConfigured) return;
    const timer = setTimeout(() => {
      upsertAppState('requirements', requirements);
    }, 500);

    return () => clearTimeout(timer);
  }, [requirements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to persist tasks to localStorage', e);
    }

    if (isRemoteUpdateRef.current.tasks) {
      isRemoteUpdateRef.current.tasks = false;
      return;
    }

    if (!isSupabaseConfigured) return;
    const timer = setTimeout(() => {
      upsertAppState('tasks', tasks);
    }, 500);

    return () => clearTimeout(timer);
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASK_COMPLETIONS, JSON.stringify(completions));
    } catch (e) {
      console.error('Failed to persist completions to localStorage', e);
    }

    if (isRemoteUpdateRef.current.completions) {
      isRemoteUpdateRef.current.completions = false;
      return;
    }

    if (!isSupabaseConfigured) return;
    const timer = setTimeout(() => {
      upsertAppState('completions', completions);
    }, 500);

    return () => clearTimeout(timer);
  }, [completions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(recipes));
    } catch (e) {
      console.error('Failed to persist recipes to localStorage', e);
    }

    if (isRemoteUpdateRef.current.recipes) {
      isRemoteUpdateRef.current.recipes = false;
      return;
    }

    if (!isSupabaseConfigured) return;
    const timer = setTimeout(() => {
      upsertAppState('recipes', recipes);
    }, 500);

    return () => clearTimeout(timer);
  }, [recipes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECIPE_CATEGORIES, JSON.stringify(recipeCategories));
    } catch (e) {
      console.error('Failed to persist recipe categories to localStorage', e);
    }

    if (isRemoteUpdateRef.current.recipeCategories) {
      isRemoteUpdateRef.current.recipeCategories = false;
      return;
    }

    if (!isSupabaseConfigured) return;
    const timer = setTimeout(() => {
      upsertAppState('recipeCategories', recipeCategories);
    }, 500);

    return () => clearTimeout(timer);
  }, [recipeCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LAST_CHECK, lastInventoryDate);
    } catch (e) {
      console.error('Failed to persist lastInventoryDate to localStorage', e);
    }

    if (isRemoteUpdateRef.current.lastInventoryDate) {
      isRemoteUpdateRef.current.lastInventoryDate = false;
      return;
    }

    if (!isSupabaseConfigured || !lastInventoryDate) return;
    const timer = setTimeout(() => {
      upsertAppState('lastInventoryDate', lastInventoryDate);
    }, 500);

    return () => clearTimeout(timer);
  }, [lastInventoryDate]);


  // Inventory stats
  const totalInventoryItems = useMemo(() => {
    return categories.reduce(
      (total, cat) =>
        total +
        cat.subcategories.reduce((subTotal, sub) => subTotal + sub.items.length, 0),
      0
    );
  }, [categories]);

  const completedInventoryItems = useMemo(() => {
    return categories.reduce(
      (total, cat) =>
        total +
        cat.subcategories.reduce((subTotal, sub) => {
          const validItems = sub.items.filter((item) => {
            if (item.type === 'numeric') return (Number(item.value) || 0) > 0;
            if (item.type === 'level') return Boolean(item.value);
            if (item.type === 'boolean') return item.value === true;
            return false;
          });
          return subTotal + validItems.length;
        }, 0),
      0
    );
  }, [categories]);

  // Today Tasks stats for home tile
  const todayDateInfo = useMemo(() => getTodayJalaliDate(), []);
  const todayDateStr = todayDateInfo.standardString;
  const todayWeekday = todayDateInfo.weekday;
  
  const todayTasksList = useMemo(() => {
    return tasks.filter((t) => doesTaskApplyToday(t, todayDateStr, todayWeekday));
  }, [tasks, todayDateStr, todayWeekday]);

  const todayCompletedTasksCount = useMemo(() => {
    return todayTasksList.filter((t) => {
      const key = `${t.id}_${todayDateStr}`;
      return completions[key]?.completed;
    }).length;
  }, [todayTasksList, todayDateStr, completions]);

  const remainingTasksCount = Math.max(0, todayTasksList.length - todayCompletedTasksCount);

  // ──────────────────────────────────────────
  // INVENTORY HANDLERS
  // ──────────────────────────────────────────
  const handleUpdateInventoryValue = (itemId: string, newValue: number | string | boolean) => {
    const timeNow = `امروز ساعت ${formatTimePersian()}`;
    setLastInventoryDate(timeNow);
    localStorage.setItem(STORAGE_KEY_LAST_CHECK, timeNow);

    setCategories((prevCategories) =>
      prevCategories.map((cat) => ({
        ...cat,
        subcategories: cat.subcategories.map((sub) => ({
          ...sub,
          items: sub.items.map((item) =>
            item.id === itemId ? { ...item, value: newValue } : item
          ),
        })),
      }))
    );
  };

  const handleSaveInventoryItem = (
    categoryId: string,
    subCategoryName: string,
    itemData: {
      id?: string;
      name: string;
      type: MeasurementType;
      value: number | string | boolean;
      description?: string;
      unit?: string;
    }
  ) => {
    setCategories((prevCategories) => {
      let updated = prevCategories.map((cat) => ({
        ...cat,
        subcategories: cat.subcategories.map((sub) => ({
          ...sub,
          items: sub.items.filter((i) => i.id !== itemData.id),
        })),
      }));

      const targetCatIndex = updated.findIndex((c) => c.id === categoryId);
      if (targetCatIndex === -1) return updated;

      const targetCat = updated[targetCatIndex];
      const targetSubIndex = targetCat.subcategories.findIndex(
        (s) => s.name.trim() === subCategoryName.trim()
      );

      const newItem: InventoryItem = {
        id: itemData.id || `custom-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: itemData.name,
        type: itemData.type,
        value: itemData.value,
        description: itemData.description,
        unit: itemData.unit,
      };

      if (targetSubIndex === -1) {
        targetCat.subcategories.push({
          id: `sub-${Date.now()}`,
          name: subCategoryName,
          items: [newItem],
        });
      } else {
        targetCat.subcategories[targetSubIndex].items.push(newItem);
      }

      return [...updated];
    });
  };

  const handleDeleteInventoryItem = (itemId: string) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat) => ({
        ...cat,
        subcategories: cat.subcategories.map((sub) => ({
          ...sub,
          items: sub.items.filter((item) => item.id !== itemId),
        })),
      }))
    );
  };

  const handleAddRequirement = (text: string) => {
    const newReq: RequirementItem = {
      id: `req-${Date.now()}`,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setRequirements((prev) => [newReq, ...prev]);
  };

  const handleDeleteRequirement = (id: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearShiftRequirements = () => {
    setRequirements([]);
    localStorage.removeItem(STORAGE_KEY_REQUIREMENTS);
  };

  const handleResetInventoryToDefault = () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید تمام اقلام موجودی انبار به مقادیر پیش‌فرض بازگردد؟')) {
      localStorage.removeItem(STORAGE_KEY_CATEGORIES);
      localStorage.removeItem(STORAGE_KEY_REQUIREMENTS);
      localStorage.removeItem(STORAGE_KEY_LAST_CHECK);
      setCategories(INITIAL_CATEGORIES);
      setRequirements(INITIAL_REQUIREMENTS);
      setLastInventoryDate('');
    }
  };

  // ──────────────────────────────────────────
  // TASKS HANDLERS
  // ──────────────────────────────────────────
  const handleToggleTaskCompletion = (taskId: string, targetDateStr: string) => {
    const key = `${taskId}_${targetDateStr}`;
    setCompletions((prev) => {
      const current = prev[key];
      if (current?.completed) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      const roleName = sessionRole ? ROLE_DISPLAY_NAMES[sessionRole] : 'مدیریت';
      return {
        ...prev,
        [key]: {
          completed: true,
          completedAt: formatTimePersian(),
          completedBy: roleName,
          completedByRole: sessionRole || 'manager',
        },
      };
    });
  };

  const handleSaveTask = (taskData: {
    id?: string;
    title: string;
    notes?: string;
    taskType: TaskType;
    role: TaskRole;
    weekdays?: string[];
    fixedDate?: string;
  }) => {
    if (taskData.id) {
      // Edit existing task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskData.id
            ? {
                ...t,
                title: taskData.title,
                notes: taskData.notes,
                taskType: taskData.taskType,
                role: taskData.role,
                weekdays: taskData.weekdays,
                fixedDate: taskData.fixedDate,
              }
            : t
        )
      );
    } else {
      // Add new task
      const newTask: TaskItem = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: taskData.title,
        notes: taskData.notes,
        taskType: taskData.taskType,
        role: taskData.role,
        weekdays: taskData.weekdays,
        fixedDate: taskData.fixedDate,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, newTask]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setCompletions((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(`${taskId}_`)) {
          delete next[k];
        }
      });
      return next;
    });
  };

  // ──────────────────────────────────────────
  // RECIPES HANDLERS
  // ──────────────────────────────────────────
  const handleSaveRecipe = (recipeData: {
    id?: string;
    name: string;
    category: string;
    prepTime?: string;
    ingredients: RecipeIngredient[];
    steps: string[];
    notes?: string;
  }) => {
    if (recipeData.id) {
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === recipeData.id
            ? {
                ...r,
                name: recipeData.name,
                category: recipeData.category,
                prepTime: recipeData.prepTime,
                ingredients: recipeData.ingredients,
                steps: recipeData.steps,
                notes: recipeData.notes,
              }
            : r
        )
      );
    } else {
      const newRecipe: RecipeItem = {
        id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: recipeData.name,
        category: recipeData.category,
        prepTime: recipeData.prepTime,
        ingredients: recipeData.ingredients,
        steps: recipeData.steps,
        notes: recipeData.notes,
        createdAt: new Date().toISOString(),
      };
      setRecipes((prev) => [newRecipe, ...prev]);
    }
  };

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  };

  const handleAddNewRecipeCategory = (newCategory: string) => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    setRecipeCategories((prev) => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed];
    });
  };

  // ──────────────────────────────────────────
  // SECTION RENDERING WITH ACCESS CONTROL
  // ──────────────────────────────────────────
  // 1. PIN Login Screen if not authenticated
  if (!sessionRole) {
    return <PinLoginScreen onLoginSuccess={(role) => setSessionRole(role)} />;
  }

  // 2. Restricted Staff Views (Dishwasher / Waiter 1, 2, 3)
  if (
    sessionRole === 'dishwasher' ||
    sessionRole === 'waiter1' ||
    sessionRole === 'waiter2' ||
    sessionRole === 'waiter3'
  ) {
    return (
      <StaffScheduleSection
        role={sessionRole}
        tasks={tasks}
        completions={completions}
        onToggleTaskCompletion={handleToggleTaskCompletion}
        onLogout={handleLogout}
      />
    );
  }

  // 3. Manager Full Access View
  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-[#201A19]" dir="rtl">
      {activeSection === 'home' && (
        <HomeScreen
          onNavigate={setActiveSection}
          onLogout={handleLogout}
          totalInventoryItems={totalInventoryItems}
          completedInventoryItems={completedInventoryItems}
          remainingTasksCount={remainingTasksCount}
          totalTodayTasksCount={todayTasksList.length}
          totalRecipesCount={recipes.length}
          requirementsCount={requirements.length}
          lastInventoryDate={lastInventoryDate}
        />
      )}

      {activeSection === 'inventory' && (
        <InventorySection
          onBackToHome={() => setActiveSection('home')}
          categories={categories}
          requirements={requirements}
          totalItemsCount={totalInventoryItems}
          completedItemsCount={completedInventoryItems}
          onUpdateValue={handleUpdateInventoryValue}
          onSaveItem={handleSaveInventoryItem}
          onDeleteItem={handleDeleteInventoryItem}
          onAddRequirement={handleAddRequirement}
          onDeleteRequirement={handleDeleteRequirement}
          onClearShiftRequirements={handleClearShiftRequirements}
          onResetToDefault={handleResetInventoryToDefault}
        />
      )}

      {activeSection === 'tasks' && (
        <TasksSection
          onBackToHome={() => setActiveSection('home')}
          tasks={tasks}
          completions={completions}
          onToggleTaskCompletion={handleToggleTaskCompletion}
          onSaveTask={handleSaveTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {activeSection === 'recipes' && (
        <RecipesSection
          onBackToHome={() => setActiveSection('home')}
          recipes={recipes}
          categories={recipeCategories}
          inventoryCategories={categories}
          onSaveRecipe={handleSaveRecipe}
          onDeleteRecipe={handleDeleteRecipe}
          onAddNewCategory={handleAddNewRecipeCategory}
        />
      )}
    </div>
  );
}
