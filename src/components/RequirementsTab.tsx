import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  ShoppingBag, 
  Clock
} from 'lucide-react';
import { RequirementItem } from '../types';
import { toPersianDigits } from '../utils/persianDate';

interface RequirementsTabProps {
  requirements: RequirementItem[];
  onAddRequirement: (text: string) => void;
  onDeleteRequirement: (id: string) => void;
  onOpenReport: () => void;
}

export const RequirementsTab: React.FC<RequirementsTabProps> = ({
  requirements,
  onAddRequirement,
  onDeleteRequirement,
  onOpenReport,
}) => {
  const [inputText, setInputText] = useState('');

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onAddRequirement(inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex-1 pb-36 pt-2 px-4 max-w-2xl mx-auto w-full">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-2xl text-[#201A19] flex items-center gap-2 tracking-tight">
            <AlertCircle className="w-6 h-6 text-[#BA1A1A]" />
            نیازمندی‌ها
          </h2>
          <span className="text-xs bg-[#FFDAD6]/60 text-[#93000A] px-3 py-1 rounded-full font-bold border border-[#FFCDD2]">
            {toPersianDigits(requirements.length)} مورد ثبت شده
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#6F5A52] mt-1.5 leading-relaxed">
          لیست مواردی که باید در شیفت بعد یا توسط مسئول خرید برای کافه تهیه شود.
        </p>
      </div>

      {/* Input Section */}
      <form onSubmit={handleAdd} className="mb-6">
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#E6DFD5] shadow-[0_2px_8px_rgba(62,39,35,0.03)] focus-within:border-[#3E2723] focus-within:ring-2 focus-within:ring-[#3E2723]/10 transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="نیازمندی جدید وارد کنید (مثلا: شیشه‌پاک‌کن نداریم)..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-[#201A19] outline-none placeholder:text-[#A1887F]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="h-11 px-5 bg-[#3E2723] hover:bg-[#201A19] disabled:opacity-40 disabled:hover:bg-[#3E2723] text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-sm active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 text-[#FADCD2]" />
            افزودن
          </button>
        </div>
      </form>

      {/* Requirements List */}
      <div className="space-y-3">
        {requirements.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-[#EFEBE9] shadow-[0_4px_16px_rgba(62,39,35,0.04)]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F5F2EC] border border-[#E6DFD5] flex items-center justify-center mb-3.5 text-[#3E2723]">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-[#201A19] text-base mb-1.5">لیست نیازمندی‌ها خالی است</h3>
            <p className="text-xs text-[#6F5A52] max-w-xs mx-auto leading-relaxed">
              اگر در طول شیفت متوجه کمبود یا اتمام کالایی شدید، آن را اینجا ثبت کنید تا در گزارش نهایی خرید درج شود.
            </p>
          </div>
        ) : (
          requirements.map((req, index) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-[0_2px_8px_rgba(62,39,35,0.03)] border border-[#EFEBE9] hover:border-[#D7CCC8] transition-all group"
            >
              {/* Text & Icon */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FFDAD6]/50 text-[#BA1A1A] flex items-center justify-center flex-shrink-0 border border-[#FFCDD2]/60">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm sm:text-base text-[#201A19] block break-words">
                    {req.text}
                  </span>
                  <span className="text-[11px] text-[#8D6E63] flex items-center gap-1 mt-0.5 font-medium">
                    <Clock className="w-3 h-3" />
                    مورد {toPersianDigits(index + 1)}
                  </span>
                </div>
              </div>

              {/* Trash Delete Action */}
              <button
                type="button"
                onClick={() => onDeleteRequirement(req.id)}
                className="text-[#8D6E63] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/40 p-2 rounded-xl transition-colors flex-shrink-0"
                title="حذف از لیست"
                aria-label="حذف نیازمندی"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Informative shift badge */}
      <div className="mt-6 p-3.5 bg-[#F5F2EC] rounded-2xl border border-[#E6DFD5] text-center text-xs text-[#6F5A52] font-medium leading-relaxed">
        نکته: لیست نیازمندی‌ها مختص همین شیفت است و همراه گزارش برای مدیریت و انباردار خروجی گرفته می‌شود.
      </div>
    </div>
  );
};
