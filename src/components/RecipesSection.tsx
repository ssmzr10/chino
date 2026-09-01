import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Search, 
  Plus, 
  BookOpen, 
  Clock, 
  Coffee, 
  Layers, 
  ChevronLeft,
  Filter,
  Sparkles,
  Trash2,
  Edit3,
  Share2,
  Check,
  Flame,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Category, RecipeIngredient, RecipeItem } from '../types';
import { toPersianDigits } from '../utils/persianDate';
import { RecipeDetailModal } from './RecipeDetailModal';
import { RecipeModal } from './RecipeModal';

interface RecipesSectionProps {
  onBackToHome: () => void;
  recipes: RecipeItem[];
  categories: string[];
  inventoryCategories?: Category[];
  onSaveRecipe: (recipeData: {
    id?: string;
    name: string;
    category: string;
    prepTime?: string;
    ingredients: RecipeIngredient[];
    steps: string[];
    notes?: string;
  }) => void;
  onDeleteRecipe: (recipeId: string) => void;
  onAddNewCategory: (newCategory: string) => void;
}

export const RecipesSection: React.FC<RecipesSectionProps> = ({
  onBackToHome,
  recipes,
  categories,
  inventoryCategories,
  onSaveRecipe,
  onDeleteRecipe,
  onAddNewCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState<RecipeItem | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<RecipeItem | null>(null);

  // New Category prompt
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  // Delete Confirmation Modal State (Reliable in iframe)
  const [recipeToDelete, setRecipeToDelete] = useState<RecipeItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const matchesCategory =
        selectedCategory === 'all' || r.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.trim().toLowerCase();
      const inName = r.name.toLowerCase().includes(q);
      const inCat = r.category.toLowerCase().includes(q);
      const inNotes = r.notes ? r.notes.toLowerCase().includes(q) : false;
      const inIngredients = r.ingredients.some(
        (ing) =>
          ing.name.toLowerCase().includes(q) || ing.amount.toLowerCase().includes(q)
      );

      return inName || inCat || inNotes || inIngredients;
    });
  }, [recipes, selectedCategory, searchQuery]);

  const handleOpenDetail = (recipe: RecipeItem) => {
    setSelectedRecipeForDetail(recipe);
    setIsDetailModalOpen(true);
  };

  const handleOpenAdd = () => {
    setRecipeToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (recipe: RecipeItem) => {
    setRecipeToEdit(recipe);
    setIsFormModalOpen(true);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatInput.trim()) {
      onAddNewCategory(newCatInput.trim());
      setSelectedCategory(newCatInput.trim());
      setNewCatInput('');
      setIsAddingNewCat(false);
    }
  };

  const handleConfirmDelete = () => {
    if (recipeToDelete) {
      onDeleteRecipe(recipeToDelete.id);
      if (selectedRecipeForDetail?.id === recipeToDelete.id) {
        setIsDetailModalOpen(false);
        setSelectedRecipeForDetail(null);
      }
      setRecipeToDelete(null);
    }
  };

  const handleQuickCopyRecipe = (e: React.MouseEvent, recipe: RecipeItem) => {
    e.stopPropagation();
    const text = `📋 رسپی ${recipe.name} (${recipe.category})
⏱️ زمان آماده‌سازی: ${recipe.prepTime || 'استاندارد'}

مواد اولیه:
${recipe.ingredients.map((ing, i) => `${i + 1}. ${ing.name}: ${ing.amount}`).join('\n')}

مراحل آماده‌سازی:
${recipe.steps.map((st, i) => `${i + 1}. ${st}`).join('\n')}
${recipe.notes ? `\nنکات: ${recipe.notes}` : ''}`;

    navigator.clipboard.writeText(text);
    setCopiedId(recipe.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#201A19] flex flex-col" dir="rtl">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EFEBE9] px-4 py-3 shadow-[0_2px_8px_rgba(62,39,35,0.03)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="w-10 h-10 rounded-2xl bg-white hover:bg-[#F5F2EC] active:scale-95 text-[#201A19] flex items-center justify-center transition-all border border-[#E6DFD5] shadow-xs"
              title="بازگشت به صفحه اصلی"
            >
              <ArrowRight className="w-5 h-5 text-[#3E2723]" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg text-[#201A19] leading-none">کتابچه رسپی‌ها و بار</h1>
                <span className="text-[10px] bg-[#F3EBE7] text-[#5D4037] font-bold px-2.5 py-0.5 rounded-full border border-[#E6DDD8]">
                  منوی باریستا
                </span>
              </div>
              <p className="text-xs text-[#6F5A52] mt-0.5 font-medium">
                {toPersianDigits(recipes.length)} دستورالعمل استاندارد آماده‌سازی
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-[#3E2723] hover:bg-[#201A19] active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#FADCD2]" />
            <span>رسپی جدید</span>
          </button>
        </div>
      </header>

      {/* Search & Categories Bar */}
      <div className="bg-[#FAF8F5] border-b border-[#EFEBE9] px-4 py-3 sticky top-[61px] z-30 space-y-2.5">
        <div className="max-w-3xl mx-auto space-y-2.5">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در نام نوشیدنی، غذا، مواد اولیه (شیر، سیروپ، لاته)..."
              className="w-full bg-white border border-[#E6DFD5] focus:border-[#3E2723] focus:ring-2 focus:ring-[#3E2723]/10 rounded-2xl px-10 py-2.5 text-xs sm:text-sm text-[#201A19] placeholder:text-[#A1887F] transition-all shadow-xs outline-none"
            />
            <Search className="w-4 h-4 text-[#8D6E63] absolute right-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[11px] text-[#6F5A52] hover:text-[#201A19] absolute left-3.5 top-1/2 -translate-y-1/2 bg-[#F5F2EC] hover:bg-[#EAE4DC] px-2 py-0.5 rounded-full transition-colors"
              >
                پاک کردن
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-[#3E2723] text-white shadow-xs'
                  : 'bg-white text-[#6F5A52] hover:bg-[#F5F2EC] border border-[#E6DFD5]'
              }`}
            >
              همه ({toPersianDigits(recipes.length)})
            </button>

            {categories.map((cat, idx) => {
              const count = recipes.filter((r) => r.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-[#3E2723] text-white shadow-xs'
                      : 'bg-white text-[#6F5A52] hover:bg-[#F5F2EC] border border-[#E6DFD5]'
                  }`}
                >
                  {cat} ({toPersianDigits(count)})
                </button>
              );
            })}

            {/* Quick Add Category Button */}
            {!isAddingNewCat ? (
              <button
                type="button"
                onClick={() => setIsAddingNewCat(true)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F5F2EC] hover:bg-[#EAE4DC] text-[#3E2723] border border-[#E6DFD5] transition-colors shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>دسته جدید</span>
              </button>
            ) : (
              <form onSubmit={handleCreateCategory} className="flex items-center gap-1 shrink-0">
                <input
                  type="text"
                  autoFocus
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  placeholder="نام دسته..."
                  className="bg-white border border-[#3E2723] rounded-full px-3 py-1 text-xs text-[#201A19] w-28 outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#3E2723] text-white px-2.5 py-1 rounded-full text-xs font-bold"
                >
                  ثبت
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCat(false)}
                  className="text-xs text-[#8D6E63] px-1"
                >
                  ✕
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Recipes Grid */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 pb-28">
        {filteredRecipes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-[#EFEBE9] shadow-xs space-y-3 mt-4">
            <BookOpen className="w-10 h-10 text-[#8D6E63] mx-auto opacity-50" />
            <h3 className="font-bold text-sm text-[#201A19]">رسپی با این مشخصات یافت نشد</h3>
            <p className="text-xs text-[#8D6E63]">
              می‌توانید کلمه جستجو را تغییر دهید یا یک رسپی جدید برای این بخش ایجاد نمایید.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 bg-[#3E2723] text-white px-5 py-2.5 rounded-2xl text-xs font-bold hover:bg-[#201A19] transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#FADCD2]" />
              افزودن رسپی جدید
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => handleOpenDetail(recipe)}
                className="group cursor-pointer bg-white hover:bg-[#FAF8F5] active:scale-[0.99] border border-[#E6DFD5] hover:border-[#3E2723]/50 rounded-3xl p-4 shadow-[0_2px_8px_rgba(62,39,35,0.03)] hover:shadow-[0_6px_20px_rgba(62,39,35,0.07)] transition-all duration-200 flex flex-col justify-between relative"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-[#F5F2EC] text-[#5D4037] px-2.5 py-0.5 rounded-full border border-[#E6DFD5]">
                      {recipe.category}
                    </span>

                    <div className="flex items-center gap-2">
                      {recipe.prepTime && (
                        <span className="text-[11px] text-[#8D6E63] font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{recipe.prepTime}</span>
                        </span>
                      )}

                      {/* Quick action buttons */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickCopyRecipe(e, recipe)}
                        className="w-7 h-7 rounded-xl hover:bg-[#F5F2EC] text-[#8D6E63] hover:text-[#3E2723] flex items-center justify-center transition-colors"
                        title="کپی کردن متن دستورالعمل"
                      >
                        {copiedId === recipe.id ? (
                          <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRecipeToDelete(recipe);
                        }}
                        className="w-7 h-7 rounded-xl hover:bg-[#FFDAD6]/50 text-[#8D6E63] hover:text-[#BA1A1A] flex items-center justify-center transition-colors"
                        title="حذف رسپی"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-base text-[#201A19] group-hover:text-[#3E2723] transition-colors leading-snug">
                    {recipe.name}
                  </h3>

                  {/* Ingredients Preview */}
                  <p className="text-xs text-[#6F5A52] line-clamp-2 leading-relaxed">
                    {recipe.ingredients.map((ing) => `${ing.name} (${ing.amount})`).join(' • ')}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#EFEBE9] flex items-center justify-between text-xs text-[#8D6E63] font-medium">
                  <span>{toPersianDigits(recipe.steps.length)} مرحله تهیه</span>
                  <span className="text-[#3E2723] font-bold flex items-center gap-0.5 group-hover:-translate-x-1 transition-transform">
                    مشاهده دستور و جزئیات
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={handleOpenAdd}
        aria-label="افزودن رسپی جدید"
        className="fixed bottom-6 right-5 sm:right-8 z-30 w-14 h-14 bg-[#3E2723] hover:bg-[#201A19] active:scale-95 text-white rounded-2xl shadow-[0_8px_20px_rgba(62,39,35,0.25)] flex items-center justify-center transition-all duration-200 group border border-[#D7CCC8]/30"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300 text-[#FADCD2]" />
      </button>

      {/* Detail Modal */}
      <RecipeDetailModal
        isOpen={isDetailModalOpen}
        recipe={selectedRecipeForDetail}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRecipeForDetail(null);
        }}
        onEdit={(rec) => {
          setIsDetailModalOpen(false);
          handleOpenEdit(rec);
        }}
        onDelete={(recipeId) => {
          const rec = recipes.find((r) => r.id === recipeId);
          if (rec) {
            setRecipeToDelete(rec);
          } else {
            onDeleteRecipe(recipeId);
            setIsDetailModalOpen(false);
          }
        }}
        inventoryCategories={inventoryCategories}
      />

      {/* Add / Edit Form Modal */}
      <RecipeModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setRecipeToEdit(null);
        }}
        recipeToEdit={recipeToEdit}
        categories={categories}
        inventoryCategories={inventoryCategories}
        onSaveRecipe={onSaveRecipe}
        onAddNewCategory={onAddNewCategory}
      />

      {/* Dedicated In-App Delete Confirmation Modal */}
      {recipeToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#FFDAD6] text-right space-y-4 animate-scaleUp"
            dir="rtl"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FFDAD6] text-[#BA1A1A] flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-extrabold text-lg text-[#201A19]">
                حذف رسپی «{recipeToDelete.name}»
              </h3>
              <p className="text-xs text-[#6F5A52] leading-relaxed">
                آیا از حذف این دستور پخت از کتابچه منو کافه اطمینان دارید؟ این عملیات قابل بازگشت نیست.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecipeToDelete(null)}
                className="flex-1 py-3 bg-[#F5F2EC] hover:bg-[#EAE4DC] text-[#5D4037] font-bold text-xs rounded-2xl transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-3 bg-[#BA1A1A] hover:bg-[#93000A] active:scale-95 text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>بله، حذف کن</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
