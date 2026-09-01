import React, { useState } from 'react';
import { InventoryItem, LevelValue } from '../types';
import { toPersianDigits } from '../utils/persianDate';
import { 
  Minus, 
  Plus, 
  Info, 
  Edit3, 
  Check, 
  X,
  Flame,
  Utensils,
  Package,
  Milk,
  Coffee,
  Apple,
  Fish,
  Cookie,
  Wine
} from 'lucide-react';

interface ItemCardProps {
  item: InventoryItem;
  onUpdateValue: (itemId: string, newValue: number | LevelValue | boolean) => void;
  onEditItem: (item: InventoryItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onUpdateValue,
  onEditItem
}) => {
  const [showDescription, setShowDescription] = useState(false);

  // Helper icon generator based on item name / icon field
  const renderItemIcon = () => {
    const name = item.name.toLowerCase();
    if (name.includes('تند') || name.includes('فلفل')) return <Flame className="w-6 h-6 text-[#ba1a1a]" />;
    if (name.includes('شیر') || name.includes('خامه') || name.includes('پنیر')) return <Milk className="w-6 h-6 text-[#6f5a52]" />;
    if (name.includes('قهوه') || name.includes('اسپرسو')) return <Coffee className="w-6 h-6 text-[#3e2723]" />;
    if (name.includes('سس') || name.includes('آلفردو') || name.includes('مایونز')) return <Utensils className="w-6 h-6 text-[#766057]" />;
    if (name.includes('مرغ') || name.includes('گوشت') || name.includes('فیله') || name.includes('برگر') || name.includes('استیک')) return <Fish className="w-6 h-6 text-[#56423b]" />;
    if (name.includes('میوه') || name.includes('لیمو') || name.includes('نعنا') || name.includes('موز') || name.includes('گوجه') || name.includes('ریحان') || name.includes('کاهو')) return <Apple className="w-6 h-6 text-[#2e7d32]" />;
    if (name.includes('سیروپ') || name.includes('دلستر') || name.includes('نوشابه') || name.includes('آب')) return <Wine className="w-6 h-6 text-[#8e24aa]" />;
    if (name.includes('بیسکویت') || name.includes('خاک‌گلدون') || name.includes('نان') || name.includes('خمیر') || name.includes('آرد')) return <Cookie className="w-6 h-6 text-[#8d6e63]" />;
    return <Package className="w-6 h-6 text-[#6f5a52]" />;
  };

  const handleNumericChange = (delta: number) => {
    const current = typeof item.value === 'number' ? item.value : 0;
    const next = Math.max(0, current + delta);
    onUpdateValue(item.id, next);
  };

  const handleLevelChange = (level: LevelValue) => {
    onUpdateValue(item.id, level);
  };

  const handleBooleanToggle = () => {
    const current = typeof item.value === 'boolean' ? item.value : Boolean(item.value);
    onUpdateValue(item.id, !current);
  };

  const levelOptions: { id: LevelValue; label: string }[] = [
    { id: 'empty', label: 'کلا نداریم' },
    { id: 'low', label: 'کم' },
    { id: 'medium', label: 'متوسط' },
    { id: 'full', label: 'پر' }
  ];

  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-[0_2px_8px_rgba(62,39,35,0.03)] border border-[#EFEBE9] hover:border-[#D7CCC8] transition-all flex flex-col gap-2 relative group">
      <div className="flex items-center justify-between gap-3">
        {/* Right side in RTL: Icon + Name + Subtitle / Description */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F2EC] flex items-center justify-center shrink-0 shadow-xs border border-[#E6DFD5]/50">
            {renderItemIcon()}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-[#201A19] text-[15px] sm:text-base leading-tight truncate">
                {item.name}
              </h3>

              {item.description && (
                <button
                  type="button"
                  onClick={() => setShowDescription(!showDescription)}
                  className="text-[#8D6E63] hover:text-[#3E2723] p-1 rounded-full hover:bg-[#F5F2EC] transition-colors"
                  title="مشاهده توضیحات"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onEditItem(item)}
                className="opacity-50 hover:opacity-100 text-[#8D6E63] hover:text-[#3E2723] p-1 rounded-full hover:bg-[#FADCD2]/40 transition-all"
                title="ویرایش کالا"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {item.description && !showDescription && (
              <span className="text-[12px] text-[#6F5A52] truncate max-w-[180px] sm:max-w-xs mt-0.5">
                {item.description}
              </span>
            )}
          </div>
        </div>

        {/* Left side in RTL: The Interactive Measurement Control */}
        <div className="shrink-0 flex items-center">
          {/* Numeric Stepper */}
          {item.type === 'numeric' && (
            <div className="flex items-center gap-1 bg-[#F5F2EC] p-1 rounded-full border border-[#E6DFD5]">
              <button
                type="button"
                onClick={() => handleNumericChange(-1)}
                disabled={(typeof item.value === 'number' ? item.value : 0) <= 0}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white hover:bg-[#EAE4DC] disabled:opacity-30 disabled:hover:bg-white text-[#201A19] flex items-center justify-center shadow-xs transition-all active:scale-90 touch-manipulation border border-[#E6DFD5]/50"
                aria-label="کاهش"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="w-9 sm:w-11 text-center font-bold text-lg sm:text-xl text-[#201A19] select-none tracking-tight">
                {toPersianDigits(typeof item.value === 'number' ? item.value : 0)}
              </div>

              <button
                type="button"
                onClick={() => handleNumericChange(1)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#3E2723] hover:bg-[#201A19] text-[#FADCD2] flex items-center justify-center shadow-xs transition-all active:scale-90 touch-manipulation"
                aria-label="افزایش"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Level 4-Segment Control */}
          {item.type === 'level' && (
            <div className="flex items-center bg-[#F5F2EC] p-1 rounded-xl border border-[#E6DFD5] gap-0.5">
              {levelOptions.map((lvl) => {
                const isSelected = item.value === lvl.id;
                const isEmptyOption = lvl.id === 'empty';

                let buttonClass = 'text-[#6F5A52] hover:bg-white/80';
                if (isSelected) {
                  buttonClass = isEmptyOption 
                    ? 'bg-[#BA1A1A] text-white shadow-xs font-bold' 
                    : 'bg-[#3E2723] text-white shadow-xs font-bold';
                } else if (isEmptyOption) {
                  buttonClass = 'text-[#BA1A1A] hover:bg-[#FFDAD6]/40 font-medium';
                }

                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => handleLevelChange(lvl.id)}
                    className={`min-h-[38px] px-2 sm:px-2.5 text-[11px] sm:text-xs rounded-lg transition-all touch-manipulation whitespace-nowrap ${buttonClass}`}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Boolean Switch / Choice */}
          {item.type === 'boolean' && (
            <button
              type="button"
              onClick={handleBooleanToggle}
              className={`min-h-[44px] px-3.5 py-1.5 rounded-full flex items-center gap-2 transition-all font-bold shadow-xs border ${
                Boolean(item.value)
                  ? 'bg-[#E8F5E9] border-[#A5D6A7] text-[#1B5E20]'
                  : 'bg-[#FFEBEE] border-[#FFCDD2] text-[#B71C1C]'
              }`}
            >
              {Boolean(item.value) ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">موجود</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">ناموجود</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded description area */}
      {item.description && showDescription && (
        <div className="mt-1 pt-2 border-t border-[#F5F2EC] text-xs text-[#6F5A52] bg-[#FAF8F5] p-2.5 rounded-xl animate-fadeIn border border-[#EFEBE9]">
          {item.description}
        </div>
      )}
    </div>
  );
};
