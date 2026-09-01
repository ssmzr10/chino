import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Trash2, 
  Hash, 
  Droplets, 
  CheckCircle2, 
  Plus, 
  X,
  AlertTriangle
} from 'lucide-react';
import { Category, InventoryItem, MeasurementType } from '../types';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialCategoryId?: string;
  itemToEdit?: InventoryItem | null;
  onSaveItem: (
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
  ) => void;
  onDeleteItem?: (itemId: string) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialCategoryId,
  itemToEdit,
  onSaveItem,
  onDeleteItem,
}) => {
  const [name, setName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialCategoryId || categories[0]?.id || 'kitchen'
  );
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState('');
  const [isCustomSubCategory, setIsCustomSubCategory] = useState(false);
  const [customSubCategoryName, setCustomSubCategoryName] = useState('');
  const [measurementType, setMeasurementType] = useState<MeasurementType>('numeric');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize or reset form when opening or changing itemToEdit
  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setMeasurementType(itemToEdit.type);
      setDescription(itemToEdit.description || '');
      setUnit(itemToEdit.unit || '');

      // Find which category and subcategory this item belongs to
      for (const cat of categories) {
        for (const sub of cat.subcategories) {
          if (sub.items.some((i) => i.id === itemToEdit.id)) {
            setSelectedCategoryId(cat.id);
            setSelectedSubCategoryName(sub.name);
            setIsCustomSubCategory(false);
            break;
          }
        }
      }
    } else {
      setName('');
      setSelectedCategoryId(initialCategoryId || categories[0]?.id || 'kitchen');
      setMeasurementType('numeric');
      setDescription('');
      setUnit('');
      setIsCustomSubCategory(false);
      setCustomSubCategoryName('');

      const targetCat = categories.find((c) => c.id === (initialCategoryId || categories[0]?.id));
      if (targetCat && targetCat.subcategories.length > 0) {
        setSelectedSubCategoryName(targetCat.subcategories[0].name);
      } else {
        setSelectedSubCategoryName('');
      }
    }
    setShowDeleteConfirm(false);
  }, [itemToEdit, initialCategoryId, categories, isOpen]);

  // When category changes, set first available subcategory
  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat && cat.subcategories.length > 0) {
      setSelectedSubCategoryName(cat.subcategories[0].name);
      setIsCustomSubCategory(false);
    } else {
      setIsCustomSubCategory(true);
      setSelectedSubCategoryName('');
    }
  };

  const currentCategory = categories.find((c) => c.id === selectedCategoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const subName = isCustomSubCategory
      ? customSubCategoryName.trim() || 'سایر اقلام'
      : selectedSubCategoryName || 'سایر اقلام';

    let defaultValue: number | string | boolean = 0;
    if (measurementType === 'level') defaultValue = 'medium';
    if (measurementType === 'boolean') defaultValue = true;

    if (itemToEdit && itemToEdit.type === measurementType) {
      defaultValue = itemToEdit.value;
    }

    onSaveItem(selectedCategoryId, subName, {
      id: itemToEdit?.id,
      name: name.trim(),
      type: measurementType,
      value: defaultValue,
      description: description.trim(),
      unit: unit.trim(),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fadeIn">
      <div 
        className="bg-[#FAF8F5] text-[#201A19] w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-slideUp border border-[#EFEBE9]"
        dir="rtl"
      >
        {/* Modal Top App Bar */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#EFEBE9] bg-[#FAF8F5] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-[#F5F2EC] text-[#201A19] transition-colors"
              aria-label="بازگشت"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-lg text-[#201A19] tracking-tight">
              {itemToEdit ? 'ویرایش کالا' : 'افزودن کالای جدید'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8D6E63] hover:bg-[#F5F2EC] hover:text-[#201A19] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label htmlFor="item-name-input" className="block text-sm font-semibold text-[#5D4037]">
              نام کالا <span className="text-[#BA1A1A]">*</span>
            </label>
            <input
              id="item-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلا: شیر پرچرب کاله"
              className="w-full bg-[#F5F2EC] border border-[#E6DFD5] focus:border-[#3E2723] focus:bg-white rounded-2xl px-4 py-3 text-sm text-[#201A19] transition-all placeholder:text-[#A1887F] outline-none"
            />
          </div>

          {/* Category Chips */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#5D4037]">دسته‌بندی اصلی</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    selectedCategoryId === cat.id
                      ? 'bg-[#3E2723] text-white shadow-sm'
                      : 'bg-[#F5F2EC] text-[#6F5A52] hover:bg-[#EAE4DC] border border-[#E6DFD5]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory Selection / Creation */}
          <div className="space-y-1.5 bg-[#F5F2EC] p-4 rounded-2xl border border-[#E6DFD5]">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#5D4037]">
                زیردسته در «{currentCategory?.name}»
              </label>
              <button
                type="button"
                onClick={() => setIsCustomSubCategory(!isCustomSubCategory)}
                className="text-[11px] text-[#3E2723] font-bold hover:underline"
              >
                {isCustomSubCategory ? 'انتخاب از لیست موجود' : '+ ایجاد زیردسته جدید'}
              </button>
            </div>

            {!isCustomSubCategory ? (
              <select
                value={selectedSubCategoryName}
                onChange={(e) => setSelectedSubCategoryName(e.target.value)}
                className="w-full bg-white border border-[#E6DFD5] rounded-xl px-3 py-2.5 text-xs text-[#201A19] outline-none focus:border-[#3E2723]"
              >
                {currentCategory?.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={customSubCategoryName}
                onChange={(e) => setCustomSubCategoryName(e.target.value)}
                placeholder="نام زیردسته جدید را بنویسید..."
                className="w-full bg-white border border-[#E6DFD5] rounded-xl px-3 py-2.5 text-xs text-[#201A19] outline-none focus:border-[#3E2723]"
              />
            )}
          </div>

          {/* Measurement Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#5D4037]">نوع اندازه‌گیری</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Type 1: Numeric */}
              <button
                type="button"
                onClick={() => setMeasurementType('numeric')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-right sm:text-center ${
                  measurementType === 'numeric'
                    ? 'border-[#3E2723] bg-white shadow-sm ring-1 ring-[#3E2723]'
                    : 'border-[#E6DFD5] bg-white hover:bg-[#F5F2EC]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 ${
                    measurementType === 'numeric'
                      ? 'bg-[#3E2723] text-[#FADCD2]'
                      : 'bg-[#F5F2EC] text-[#8D6E63]'
                  }`}
                >
                  <Hash className="w-5 h-5 font-bold" />
                </div>
                <span className="font-bold text-sm text-[#201A19] mb-0.5">عددی</span>
                <span className="text-[11px] text-[#6F5A52]">شمارش دانه به دانه (مثل بطری)</span>
              </button>

              {/* Type 2: Level */}
              <button
                type="button"
                onClick={() => setMeasurementType('level')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-right sm:text-center ${
                  measurementType === 'level'
                    ? 'border-[#3E2723] bg-white shadow-sm ring-1 ring-[#3E2723]'
                    : 'border-[#E6DFD5] bg-white hover:bg-[#F5F2EC]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 ${
                    measurementType === 'level'
                      ? 'bg-[#3E2723] text-[#FADCD2]'
                      : 'bg-[#F5F2EC] text-[#8D6E63]'
                  }`}
                >
                  <Droplets className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-[#201A19] mb-0.5">سطحی</span>
                <span className="text-[11px] text-[#6F5A52]">اندازه‌گیری چشمی (مثل سیروپ)</span>
              </button>

              {/* Type 3: Boolean */}
              <button
                type="button"
                onClick={() => setMeasurementType('boolean')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-right sm:text-center ${
                  measurementType === 'boolean'
                    ? 'border-[#3E2723] bg-white shadow-sm ring-1 ring-[#3E2723]'
                    : 'border-[#E6DFD5] bg-white hover:bg-[#F5F2EC]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 ${
                    measurementType === 'boolean'
                      ? 'bg-[#3E2723] text-[#FADCD2]'
                      : 'bg-[#F5F2EC] text-[#8D6E63]'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-[#201A19] mb-0.5">موجودی</span>
                <span className="text-[11px] text-[#6F5A52]">فقط دارد/ندارد (مثل دستمال)</span>
              </button>
            </div>
          </div>

          {/* Unit helper (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="item-unit-input" className="block text-xs font-semibold text-[#5D4037]">
              واحد شمارش (اختیاری)
            </label>
            <input
              id="item-unit-input"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="مثلا: بطری، بسته، کیلو، قوطی، ظرف"
              className="w-full bg-[#F5F2EC] border border-[#E6DFD5] focus:border-[#3E2723] focus:bg-white rounded-2xl px-4 py-2.5 text-xs text-[#201A19] transition-all placeholder:text-[#A1887F] outline-none"
            />
          </div>

          {/* Manager's Note / Description */}
          <div className="space-y-1.5">
            <label htmlFor="item-note-input" className="block text-xs font-semibold text-[#5D4037]">
              یادداشت مدیر (اختیاری)
            </label>
            <textarea
              id="item-note-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="توضیحات تکمیلی برای همکاران..."
              className="w-full bg-[#F5F2EC] border border-[#E6DFD5] focus:border-[#3E2723] focus:bg-white rounded-2xl px-4 py-3 text-xs text-[#201A19] transition-all placeholder:text-[#A1887F] outline-none resize-none"
            />
          </div>

          {/* Delete section if editing */}
          {itemToEdit && onDeleteItem && (
            <div className="pt-2 border-t border-[#EFEBE9]">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 text-xs text-[#BA1A1A] hover:bg-[#FFDAD6]/40 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف این کالا از انبار
                </button>
              ) : (
                <div className="bg-[#FFDAD6]/30 border border-[#FFDAD6] p-3.5 rounded-2xl text-center space-y-2">
                  <p className="text-xs text-[#93000A] font-medium flex items-center justify-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    آیا از حذف «{itemToEdit.name}» مطمئن هستید؟
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteItem(itemToEdit.id);
                        onClose();
                      }}
                      className="bg-[#BA1A1A] text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-[#93000A] transition-colors"
                    >
                      بله، حذف شود
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-white border border-[#E6DFD5] text-[#6F5A52] px-4 py-1.5 rounded-xl text-xs"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Save Action Button */}
          <div className="pt-2 sticky bottom-0 bg-[#FAF8F5] pb-2">
            <button
              type="submit"
              className="w-full h-12 bg-[#201A19] hover:bg-[#3E2723] active:scale-[0.99] text-white font-bold text-base rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(32,26,25,0.2)] transition-all duration-150"
            >
              ذخیره کالا
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
