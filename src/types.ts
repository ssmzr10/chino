export type MeasurementType = 'numeric' | 'level' | 'boolean';

export type LevelValue = 'empty' | 'low' | 'medium' | 'full';
export type LevelOption = 'empty' | 'low' | 'medium' | 'full';

export interface InventoryItem {
  id: string;
  name: string;
  type: MeasurementType;
  value: number | LevelValue | boolean | string;
  description?: string;
  unit?: string;
  icon?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  items: InventoryItem[];
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  subcategories: SubCategory[];
}

export interface RequirementItem {
  id: string;
  text: string;
  urgent?: boolean;
  createdAt?: string;
}

export type TabId = 'kitchen' | 'storage' | 'bar' | 'requirements';
export type TabType = TabId;

export interface InventoryData {
  categories: Category[];
  requirements: RequirementItem[];
  lastSavedAt?: string;
}

// ──────────────────────────────────────────
// AUTHENTICATION / ACCESS CONTROL TYPES
// ──────────────────────────────────────────
export type AuthRole = 'manager' | 'dishwasher' | 'waiter1' | 'waiter2' | 'waiter3';

// ──────────────────────────────────────────
// APP NAVIGATION SECTIONS
// ──────────────────────────────────────────
export type AppSection = 'home' | 'inventory' | 'tasks' | 'recipes';

// ──────────────────────────────────────────
// TASKS MODULE TYPES
// ──────────────────────────────────────────
export type TaskType = 'shift_start' | 'shift_end' | 'recurring_weekly' | 'one_time';
export type TaskRole = 'dishwasher' | 'waiter' | 'both';

export interface TaskItem {
  id: string;
  title: string;
  notes?: string;
  taskType: TaskType;
  role: TaskRole;
  weekdays?: string[]; // e.g. ["شنبه", "سه‌شنبه"]
  fixedDate?: string; // Jalali date string: "1405/06/11"
  completed?: boolean;
  completedAt?: string;
  createdAt?: string;
}

export interface TaskCompletionDetail {
  completed: boolean;
  completedAt?: string; // e.g. "08:30"
  completedBy?: string; // e.g. "سالندار اول", "سالندار دوم", "سالندار سوم", "ظرفشور", "مدیر"
  completedByRole?: AuthRole;
}

export interface TaskCompletionRecord {
  [taskDateKey: string]: TaskCompletionDetail;
}

// ──────────────────────────────────────────
// RECIPES MODULE TYPES
// ──────────────────────────────────────────
export interface RecipeIngredient {
  id: string;
  name: string;
  amount: string; // e.g. "200 میلی‌لیتر" or "18 گرم"
  matchedInventoryId?: string; // Optional stock link
}

export interface RecipeItem {
  id: string;
  name: string;
  category: string; // e.g. "قهوه", "اسموتی و شیک", "غذا", "دسر"
  prepTime?: string; // e.g. "۵ دقیقه"
  ingredients: RecipeIngredient[];
  steps: string[];
  notes?: string;
  createdAt?: string;
}
