import React, { useState, useMemo } from 'react';
import { Plus, Search, Layers } from 'lucide-react';
import { Category, InventoryItem } from '../types';
import { ItemCard } from './ItemCard';
import { toPersianDigits } from '../utils/persianDate';

interface CategoryViewProps {
  category: Category;
  onUpdateValue: (itemId: string, newValue: number | string | boolean) => void;
  onAddNewItem: (categoryId: string) => void;
  onEditItem: (item: InventoryItem) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  category,
  onUpdateValue,
  onAddNewItem,
  onEditItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter subcategories and items by search query
  const filteredSubcategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return category.subcategories;
    }
    const query = searchQuery.trim().toLowerCase();
    return category.subcategories
      .map((sub) => {
        const matchingItems = sub.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query)) ||
            sub.name.toLowerCase().includes(query)
        );
        return {
          ...sub,
          items: matchingItems,
        };
      })
      .filter((sub) => sub.items.length > 0);
  }, [category, searchQuery]);

  const totalItemsInCategory = category.subcategories.reduce(
    (acc, sub) => acc + sub.items.length,
    0
  );

  return (
    <div className="flex-1 pb-32 pt-2 px-4 max-w-2xl mx-auto w-full">
      {/* Category Subheader with Search */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#3E2723]" />
            <h2 className="font-bold text-xl text-[#201A19] tracking-tight">{category.name}</h2>
          </div>
          <span className="text-xs bg-[#F5F2EC] text-[#6F5A52] px-3 py-1 rounded-full font-semibold border border-[#E6DFD5]">
            {toPersianDigits(totalItemsInCategory)} کالا
          </span>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`جستجو در اقلام ${category.name}...`}
            className="w-full bg-white border border-[#E6DFD5] focus:border-[#3E2723] focus:ring-2 focus:ring-[#3E2723]/10 rounded-2xl px-10 py-3 text-sm text-[#201A19] placeholder:text-[#A1887F] transition-all shadow-[0_2px_8px_rgba(62,39,35,0.03)] outline-none"
          />
          <Search className="w-4 h-4 text-[#8D6E63] absolute right-3.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#6F5A52] hover:text-[#201A19] absolute left-3.5 top-1/2 -translate-y-1/2 bg-[#F5F2EC] hover:bg-[#EAE4DC] px-2 py-0.5 rounded-full transition-colors"
            >
              پاک کردن
            </button>
          )}
        </div>
      </div>

      {/* Subcategories & Items List */}
      <div className="space-y-6">
        {filteredSubcategories.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-[#EFEBE9] shadow-[0_4px_16px_rgba(62,39,35,0.04)]">
            <p className="text-sm text-[#6F5A52] mb-4 font-medium">موردی یافت نشد!</p>
            <button
              onClick={() => onAddNewItem(category.id)}
              className="inline-flex items-center gap-2 bg-[#3E2723] text-white px-5 py-2.5 rounded-2xl text-xs font-semibold hover:bg-[#201A19] transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              افزودن کالای جدید به این بخش
            </button>
          </div>
        ) : (
          filteredSubcategories.map((subCategory) => (
            <section key={subCategory.id} className="space-y-3">
              {/* Section Header */}
              <div className="flex items-center justify-between pr-1">
                <h3 className="font-bold text-sm sm:text-base text-[#3E2723] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8D6E63]" />
                  {subCategory.name}
                </h3>
                <span className="text-[11px] font-medium text-[#8D6E63] bg-[#F5F2EC] px-2.5 py-0.5 rounded-full border border-[#E6DFD5]">
                  {toPersianDigits(subCategory.items.length)} قلم
                </span>
              </div>

              {/* Items in this subcategory */}
              <div className="space-y-2.5">
                {subCategory.items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    subCategoryName={subCategory.name}
                    onUpdateValue={onUpdateValue}
                    onEditItem={onEditItem}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Floating Action Button for adding item to this category */}
      <button
        type="button"
        onClick={() => onAddNewItem(category.id)}
        aria-label="افزودن کالای جدید"
        className="fixed bottom-24 right-5 sm:right-8 z-30 w-14 h-14 bg-[#3E2723] hover:bg-[#201A19] active:scale-95 text-white rounded-2xl shadow-[0_8px_20px_rgba(62,39,35,0.25)] flex items-center justify-center transition-all duration-200 group border border-[#D7CCC8]/30"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300 text-[#FADCD2]" />
      </button>
    </div>
  );
};
