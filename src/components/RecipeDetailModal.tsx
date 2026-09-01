import React, { useState } from 'react';
import { 
  ArrowRight, 
  X, 
  Clock, 
  Layers, 
  ChefHat, 
  Edit3, 
  Trash2, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Share2,
  Check,
  Sparkles,
  Coffee
} from 'lucide-react';
import { Category, RecipeItem } from '../types';
import { toPersianDigits } from '../utils/persianDate';

interface RecipeDetailModalProps {
  recipe: RecipeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (recipe: RecipeItem) => void;
  onDelete: (recipeId: string) => void;
  inventoryCategories?: Category[];
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  inventoryCategories,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !recipe) return null;

  // Helper to check if ingredient matches an inventory item
  const findInventoryStockStatus = (ingredientName: string) => {
    if (!inventoryCategories) return null;
    const cleanName = ingredientName.trim().toLowerCase();
    for (const cat of inventoryCategories) {
      for (const sub of cat.subcategories) {
        for (const item of sub.items) {
          if (
            item.name.toLowerCase().includes(cleanName) ||
            cleanName.includes(item.name.toLowerCase())
          ) {
            return item;
          }
        }
      }
    }
    return null;
  };

  const handleShareOrCopy = () => {
    const text = `☕ رسپی رسمی کافه چینو: ${recipe.name} (${recipe.category})
⏱️ زمان آماده‌سازی: ${recipe.prepTime || 'استاندارد'}

مواد لازم:
${recipe.ingredients.map((ing, idx) => `${idx + 1}. ${ing.name}: ${ing.amount}`).join('\n')}

مراحل تهیه:
${recipe.steps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}
${recipe.notes ? `\nنکات و استاندارد باریستا: ${recipe.notes}` : ''}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fadeIn">
      <div 
        className="bg-[#FAF8F5] text-[#201A19] w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-slideUp border border-[#EFEBE9]"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#EFEBE9] bg-[#FAF8F5] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-[#F5F2EC] text-[#201A19] transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-extrabold text-lg text-[#201A19] leading-tight">
                {recipe.name}
              </h2>
              <span className="text-xs text-[#8D6E63] font-medium">
                دستورالعمل استاندارد آماده‌سازی
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShareOrCopy}
              className="w-9 h-9 rounded-2xl bg-[#F5F2EC] hover:bg-[#EAE4DC] flex items-center justify-center text-[#5D4037] transition-colors"
              title="کپی کردن متن دستورالعمل"
            >
              {copied ? <Check className="w-4 h-4 text-[#2E7D32]" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(recipe);
              }}
              className="w-9 h-9 rounded-2xl bg-[#F5F2EC] hover:bg-[#EAE4DC] flex items-center justify-center text-[#5D4037] transition-colors"
              title="ویرایش رسپی"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-[#8D6E63] hover:bg-[#F5F2EC] hover:text-[#201A19]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#3E2723] text-[#FAF8F5] text-xs font-bold px-3.5 py-1 rounded-full shadow-xs">
              {recipe.category}
            </span>
            {recipe.prepTime && (
              <span className="bg-[#F5F2EC] text-[#5D4037] text-xs font-semibold px-3 py-1 rounded-full border border-[#E6DFD5] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#8D6E63]" />
                <span>زمان آماده‌سازی: {recipe.prepTime}</span>
              </span>
            )}
          </div>

          {/* 1. INGREDIENTS LIST */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#3E2723] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8D6E63]" />
                مواد اولیه و مقادیر (Ingredients)
              </h3>
              <span className="text-[11px] font-bold text-[#8D6E63] bg-[#F5F2EC] px-2.5 py-0.5 rounded-full border border-[#E6DFD5]">
                {toPersianDigits(recipe.ingredients.length)} قلم
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-[#E6DFD5] divide-y divide-[#EFEBE9] overflow-hidden shadow-xs">
              {recipe.ingredients.map((ing, idx) => {
                const stockItem = findInventoryStockStatus(ing.name);

                return (
                  <div key={ing.id || idx} className="p-3.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#FAF8F5] text-[#8D6E63] text-xs font-bold flex items-center justify-center border border-[#E6DFD5]">
                        {toPersianDigits(idx + 1)}
                      </span>
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-[#201A19]">
                          {ing.name}
                        </span>
                        {stockItem && (
                          <div className="text-[10px] text-[#8D6E63] flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                            <span>موجود در انبار کافه ({stockItem.name})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-extrabold text-[#3E2723] bg-[#F5F2EC] px-3 py-1 rounded-xl border border-[#E6DFD5]">
                      {ing.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. PREPARATION STEPS */}
          <section className="space-y-3">
            <h3 className="font-extrabold text-sm text-[#3E2723] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8D6E63]" />
              مراحل تهیه و آماده‌سازی گام‌به‌گام
            </h3>

            <div className="space-y-2.5">
              {recipe.steps.map((step, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-[#E6DFD5] flex items-start gap-3.5 shadow-xs"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#3E2723] text-[#FAF8F5] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {toPersianDigits(idx + 1)}
                  </div>
                  <p className="text-xs sm:text-sm text-[#201A19] font-medium leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. NOTES / SUBSTITUTIONS */}
          {recipe.notes && (
            <section className="space-y-2 bg-[#FFF8E1] border border-[#FFE082] p-4 rounded-2xl">
              <h4 className="font-bold text-xs text-[#F57F17] flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                نکات باریستا و شرایط سرو:
              </h4>
              <p className="text-xs text-[#5D4037] leading-relaxed">
                {recipe.notes}
              </p>
            </section>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-[#EFEBE9] flex gap-2">
            <button
              type="button"
              onClick={() => {
                onDelete(recipe.id);
              }}
              className="flex-1 py-3 text-xs text-[#BA1A1A] hover:bg-[#FFDAD6]/50 bg-[#FFDAD6]/20 border border-[#FFB4AB] rounded-2xl font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف این رسپی</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(recipe);
              }}
              className="flex-1 py-3 text-xs text-[#3E2723] hover:bg-[#EAE4DC] bg-[#F5F2EC] border border-[#E6DFD5] rounded-2xl font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98"
            >
              <Edit3 className="w-4 h-4" />
              <span>ویرایش دستور</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
