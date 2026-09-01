import React from 'react';
import { ArrowRight, Calendar, Coffee, RefreshCw } from 'lucide-react';
import { getTodayJalaliDate, toPersianDigits } from '../utils/persianDate';

interface HeaderProps {
  totalItemsCount: number;
  completedItemsCount: number;
  onResetToDefault?: () => void;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalItemsCount,
  completedItemsCount,
  onResetToDefault,
  onBack,
}) => {
  const { formattedPersian } = getTodayJalaliDate();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EFEBE9] px-4 py-3 shadow-[0_2px_8px_rgba(62,39,35,0.03)]">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Café Branding with Icon / Back Button */}
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-2xl bg-[#F5F2EC] hover:bg-[#EAE4DC] active:scale-95 text-[#3E2723] flex items-center justify-center transition-all border border-[#E6DFD5] shadow-xs"
              title="بازگشت به صفحه اصلی"
              aria-label="بازگشت"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <div className="w-10 h-10 rounded-2xl bg-[#3E2723] text-[#FAF8F5] flex items-center justify-center shadow-sm">
            <Coffee className="w-5 h-5 text-[#FADCD2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-[#201A19] leading-none tracking-tight">موجودی انبار</h1>
              <span className="text-[10px] bg-[#F3EBE7] text-[#5D4037] font-semibold px-2 py-0.5 rounded-full border border-[#E6DDD8]">
                چک شبانه
              </span>
            </div>
            <p className="text-xs text-[#6F5A52] mt-0.5 font-medium">
              شمارش: {toPersianDigits(completedItemsCount)} از {toPersianDigits(totalItemsCount)} کالا
            </p>
          </div>
        </div>

        {/* Date & Quick Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#F5F2EC] text-[#201A19] px-3 py-1.5 rounded-xl border border-[#E6DFD5] text-xs font-semibold shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#8D6E63]" />
            <span className="tracking-tight">{formattedPersian}</span>
          </div>

          {onResetToDefault && (
            <button
              onClick={onResetToDefault}
              title="بازنشانی به مقادیر پیش‌فرض"
              className="w-8 h-8 rounded-xl bg-[#F5F2EC] hover:bg-[#EAE4DC] active:scale-95 text-[#6F5A52] hover:text-[#3E2723] flex items-center justify-center transition-all border border-[#E6DFD5]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

