import React from 'react';
import { UtensilsCrossed, PackageOpen, Coffee, ClipboardList, FileSpreadsheet } from 'lucide-react';
import { toPersianDigits } from '../utils/persianDate';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  requirementsCount: number;
  onOpenReport: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  requirementsCount,
  onOpenReport,
}) => {
  const tabs = [
    {
      id: 'kitchen' as TabType,
      label: 'آشپزخانه',
      icon: UtensilsCrossed,
    },
    {
      id: 'storage' as TabType,
      label: 'انبار',
      icon: PackageOpen,
    },
    {
      id: 'bar' as TabType,
      label: 'بار سرد و گرم',
      icon: Coffee,
    },
    {
      id: 'requirements' as TabType,
      label: 'نیازمندی‌ها',
      icon: ClipboardList,
      badge: requirementsCount > 0 ? requirementsCount : undefined,
    },
  ];

  return (
    <>
      {/* Sticky Bottom Submit Button: "ثبت و ساخت گزارش" */}
      <div className="fixed bottom-16 sm:bottom-20 left-0 right-0 z-30 px-4 pointer-events-none flex justify-center">
        <div className="w-full max-w-2xl pointer-events-auto">
          <button
            type="button"
            onClick={onOpenReport}
            className="w-full h-12 bg-[#201A19] hover:bg-[#3E2723] active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2.5 shadow-[0_8px_24px_rgba(32,26,25,0.25)] border border-[#4E342E] transition-all duration-150 group"
          >
            <FileSpreadsheet className="w-5 h-5 text-[#FADCD2] group-hover:scale-110 transition-transform" />
            <span>ثبت و ساخت گزارش PDF</span>
          </button>
        </div>
      </div>

      {/* Main Bottom Navigation Bar (RTL 4 Tabs) */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#EFEBE9] px-2 sm:px-4 py-2 shadow-[0_-4px_20px_rgba(32,26,25,0.06)]"
        dir="rtl"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-w-[70px] sm:min-w-[84px] transition-all duration-200 ${
                  isActive
                    ? 'bg-[#3E2723] text-white shadow-sm scale-100'
                    : 'text-[#6F5A52] hover:bg-[#EFEBE9]/60 active:scale-95'
                }`}
              >
                {/* Tab Icon with potential badge */}
                <div className="relative mb-1">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#FADCD2]' : 'text-[#8D6E63]'}`} />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2.5 bg-[#BA1A1A] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white shadow-xs">
                      {toPersianDigits(tab.badge)}
                    </span>
                  )}
                </div>

                <span className={`text-[11px] font-medium leading-none ${isActive ? 'font-bold text-white' : 'text-[#6F5A52]'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
