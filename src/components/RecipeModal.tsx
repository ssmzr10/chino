import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  X, 
  Plus, 
  Trash2, 
  Clock, 
  Layers, 
  BookOpen, 
  Sparkles,
  Check
} from 'lucide-react';
import { Category, RecipeIngredient, RecipeItem } from '../types';
import { toPersianDigits } from '../utils/persianDate';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeToEdit?: RecipeItem | null;
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
  onAddNewCategory?: (newCat: string) => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  recipeToEdit,
  categories,
  inventoryCategories,
  onSaveRecipe,
  onAddNewCategory,
}) => {
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'قهوه');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [notes, setNotes] = useState('');

  // Dynamic Ingredients List
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { id: '1', name: '', amount: '' },
  ]);

  // Dynamic Steps List
  const [steps, setSteps] = useState<string[]>(['']);

  useEffect(() => {
    if (recipeToEdit) {
      setName(recipeToEdit.name);
      setSelectedCategory(recipeToEdit.category);
      setIsCustomCategory(false);
      setCustomCategoryName('');
      setPrepTime(recipeToEdit.prepTime || '');
      setNotes(recipeToEdit.notes || '');
      setIngredients(
        recipeToEdit.ingredients.length > 0
          ? [...recipeToEdit.ingredients]
          : [{ id: '1', name: '', amount: '' }]
      );
      setSteps(
        recipeToEdit.steps.length > 0 ? [...recipeToEdit.steps] : ['']
      );
    } else {
      setName('');
      setSelectedCategory(categories[0] || 'قهوه');
      setIsCustomCategory(false);
      setCustomCategoryName('');
      setPrepTime('');
      setNotes('');
      setIngredients([
        { id: `ing-${Date.now()}-1`, name: '', amount: '' },
        { id: `ing-${Date.now()}-2`, name: '', amount: '' },
      ]);
      setSteps(['', '']);
    }
  }, [recipeToEdit, categories, isOpen]);

  if (!isOpen) return null;

  // Handlers for Ingredients
  const handleAddIngredientRow = () => {
    setIngredients((prev) => [
      ...prev,
      { id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, name: '', amount: '' },
    ]);
  };

  const handleUpdateIngredient = (index: number, field: 'name' | 'amount', value: string) => {
    setIngredients((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Handlers for Steps
  const handleAddStepRow = () => {
    setSteps((prev) => [...prev, '']);
  };

  const handleUpdateStep = (index: number, value: string) => {
    setSteps((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalCategory = selectedCategory;
    if (isCustomCategory && customCategoryName.trim()) {
      finalCategory = customCategoryName.trim();
      if (onAddNewCategory) {
        onAddNewCategory(finalCategory);
      }
    }

    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim().length > 0 || ing.amount.trim().length > 0
    );

    const validSteps = steps.filter((s) => s.trim().length > 0);

    onSaveRecipe({
      id: recipeToEdit?.id,
      name: name.trim(),
      category: finalCategory || 'سایر',
      prepTime: prepTime.trim() || undefined,
      ingredients: validIngredients.length > 0 ? validIngredients : [{ id: '1', name: 'مواد اولیه', amount: '۱ واحد' }],
      steps: validSteps.length > 0 ? validSteps : ['آماده‌سازی طبق روال استاندارد بار.'],
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fadeIn">
      <div 
        className="bg-[#FAF8F5] text-[#201A19] w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-slideUp border border-[#EFEBE9]"
        dir="rtl"
      >
        {/* Top Bar */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#EFEBE9] bg-[#FAF8F5] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-[#F5F2EC] text-[#201A19] transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <h2 className="font-extrabold text-lg text-[#201A19] tracking-tight">
              {recipeToEdit ? 'ویرایش رسپی منو' : 'افزودن رسپی جدید'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8D6E63] hover:bg-[#F5F2EC] hover:text-[#201A19]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Recipe Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#5D4037]">
              نام آیتم / رسپی <span className="text-[#BA1A1A]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلا: آیس کارامل ماکیاتو"
              className="w-full bg-[#F5F2EC] border border-[#E6DFD5] focus:border-[#3E2723] focus:bg-white rounded-2xl px-4 py-3 text-sm text-[#201A19] transition-all placeholder:text-[#A1887F] outline-none"
            />
          </div>

          {/* Category & Prep Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#5D4037]">دسته‌بندی</label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-[11px] text-[#3E2723] font-bold hover:underline"
                >
                  {isCustomCategory ? 'انتخاب از لیست' : '+ ایجاد دسته جدید'}
                </button>
              </div>

              {!isCustomCategory ? (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#F5F2EC] border border-[#E6DFD5] focus:border-[#3E2723] focus:bg-white rounded-2xl px-3 py-2.5 text-xs text-[#201A19] outline-none"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="نام دسته جدید..."
                  className="w-full bg-[#F5F2EC] border border-[#E6DFD5] focus:border-[#3E2723] focus:bg-white rounded-2xl px-3 py-2.5 text-xs text-[#201A19] outline-none"
                />
              )}
            </div>

            {/* Prep Time */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#5D4037] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#8D6E63]" />
                <span>زمان تقریبی آماده‌سازی</span>
              </label>
              <input
                type="text"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="مثلا: ۳ دقیقه"
                className="w-full bg-[#F5F2EC] border border-[#E6DFD5] focus:border-[#3E2723] focus:bg-white rounded-2xl px-3 py-2.5 text-xs text-[#201A19] outline-none"
              />
            </div>
          </div>

          {/* DYNAMIC INGREDIENTS */}
          <div className="space-y-3 bg-[#F5F2EC] p-4 rounded-3xl border border-[#E6DFD5]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#3E2723] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#8D6E63]" />
                <span>مواد اولیه و مقدار (Ingredients)</span>
              </h3>
              <button
                type="button"
                onClick={handleAddIngredientRow}
                className="text-[11px] font-bold bg-white text-[#3E2723] px-3 py-1 rounded-xl border border-[#E6DFD5] hover:bg-[#EAE4DC] transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن سطر</span>
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={ing.id || idx} className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#8D6E63] w-4 text-center">
                    {toPersianDigits(idx + 1)}
                  </span>
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => handleUpdateIngredient(idx, 'name', e.target.value)}
                    placeholder="نام ماده (مثلا: شیر پرچرب)"
                    className="flex-1 bg-white border border-[#E6DFD5] focus:border-[#3E2723] rounded-xl px-3 py-2 text-xs text-[#201A19] outline-none"
                  />
                  <input
                    type="text"
                    value={ing.amount}
                    onChange={(e) => handleUpdateIngredient(idx, 'amount', e.target.value)}
                    placeholder="مقدار (مثلا: ۲۰۰ میلی‌لیتر)"
                    className="w-32 sm:w-36 bg-white border border-[#E6DFD5] focus:border-[#3E2723] rounded-xl px-3 py-2 text-xs text-[#201A19] outline-none"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="w-8 h-8 rounded-xl bg-white text-[#BA1A1A] hover:bg-[#FFDAD6]/40 flex items-center justify-center border border-[#E6DFD5] shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC STEPS */}
          <div className="space-y-3 bg-[#F5F2EC] p-4 rounded-3xl border border-[#E6DFD5]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#3E2723] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#8D6E63]" />
                <span>مراحل آماده‌سازی گام‌به‌گام</span>
              </h3>
              <button
                type="button"
                onClick={handleAddStepRow}
                className="text-[11px] font-bold bg-white text-[#3E2723] px-3 py-1 rounded-xl border border-[#E6DFD5] hover:bg-[#EAE4DC] transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن گام</span>
              </button>
            </div>

            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[11px] font-bold text-[#8D6E63] w-4 text-center mt-2">
                    {toPersianDigits(idx + 1)}
                  </span>
                  <textarea
                    rows={2}
                    value={step}
                    onChange={(e) => handleUpdateStep(idx, e.target.value)}
                    placeholder={`شرح مرحله ${toPersianDigits(idx + 1)}...`}
                    className="flex-1 bg-white border border-[#E6DFD5] focus:border-[#3E2723] rounded-xl px-3 py-2 text-xs text-[#201A19] outline-none resize-none"
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="w-8 h-8 rounded-xl bg-white text-[#BA1A1A] hover:bg-[#FFDAD6]/40 flex items-center justify-center border border-[#E6DFD5] shrink-0 mt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes / Special Instructions */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5D4037]">
              نکات باریستا، شرایط نگهداری و جایگزین‌های حساسیت (اختیاری)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلا: برای مشتری بدون لاکتوز با شیر جو دوسر سرو شود..."
              className="w-full bg-[#F5F2EC] border border-[#E6DFD5] focus:border-[#3E2723] focus:bg-white rounded-2xl px-4 py-2.5 text-xs text-[#201A19] outline-none resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 sticky bottom-0 bg-[#FAF8F5] pb-2">
            <button
              type="submit"
              className="w-full h-12 bg-[#201A19] hover:bg-[#3E2723] active:scale-[0.99] text-white font-bold text-base rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(32,26,25,0.2)] transition-all duration-150"
            >
              ذخیره رسپی در منو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
