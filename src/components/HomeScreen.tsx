import React from 'react';
import { 
  Boxes, 
  CheckSquare, 
  BookOpen, 
  ArrowLeft, 
  Coffee, 
  Calendar as CalendarIcon, 
  AlertCircle,
  Sparkles,
  ChevronLeft,
  LogOut,
  Cloud,
  CloudOff
} from 'lucide-react';
import { AppSection } from '../types';
import { getTodayJalaliDate, toPersianDigits } from '../utils/persianDate';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface HomeScreenProps {
  onNavigate: (section: AppSection) => void;
  onLogout?: () => void;
  totalInventoryItems: number;
  completedInventoryItems: number;
  remainingTasksCount: number;
  totalTodayTasksCount: number;
  totalRecipesCount: number;
  requirementsCount: number;
  lastInventoryDate: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onLogout,
  totalInventoryItems,
  completedInventoryItems,
  remainingTasksCount,
  totalTodayTasksCount,
  totalRecipesCount,
  requirementsCount,
  lastInventoryDate,
}) => {
  const todayInfo = getTodayJalaliDate();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#201A19] flex flex-col justify-between p-4 sm:p-6 max-w-xl mx-auto" dir="rtl">
      {/* Top Header & Café Identity */}
      <div className="space-y-5 pt-2">
        {/* Branding Bar */}
        <div className="flex items-center justify-between bg-white border border-[#EFEBE9] rounded-3xl p-4 shadow-[0_4px_20px_rgba(62,39,35,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3E2723] text-[#FAF8F5] flex items-center justify-center shadow-md shadow-[#3E2723]/10">
              <Coffee className="w-6 h-6 text-[#FADCD2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl text-[#201A19] tracking-tight">کافه چینو</h1>
                <span className="text-[11px] bg-[#F3EBE7] text-[#5D4037] font-bold px-2.5 py-0.5 rounded-full border border-[#E6DDD8]">
                  پنل مدیریت
                </span>
                {isSupabaseConfigured ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-[#E8F5E9] text-[#2E7D32] font-bold px-2 py-0.5 rounded-full border border-[#C8E6C9]" title="داده‌ها به صورت زنده با دیتابیس Supabase همگام می‌شوند">
                    <Cloud className="w-3 h-3 text-[#2E7D32]" />
                    <span>Realtime Sync</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-[#FFF3E0] text-[#E65100] font-medium px-2 py-0.5 rounded-full border border-[#FFE0B2]" title="داده‌ها در حافظه محلی ذخیره می‌شوند">
                    <CloudOff className="w-3 h-3 text-[#E65100]" />
                    <span>محلی (آفلاین)</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8D6E63] font-medium mt-0.5 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-[#8D6E63]" />
                <span>{todayInfo.fullDate}</span>
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-[#FFDAD6]/40 active:scale-95 text-[#BA1A1A] hover:text-[#93000A] text-xs font-bold px-3.5 py-2.5 rounded-2xl border border-[#E6DFD5] transition-all shadow-xs"
              title="خروج از حساب مدیر"
            >
              <LogOut className="w-4 h-4 rotate-180" />
              <span>خروج</span>
            </button>
          )}
        </div>

        {/* Quick Shift Summary / Notification Banner */}
        {requirementsCount > 0 ? (
          <div className="bg-[#FFF4E5] border border-[#FFE0B2] text-[#B76E00] px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#E65100]" />
              <span>
                {toPersianDigits(requirementsCount)} مورد نیازمندی خرید در شیفت جاری ثبت شده است.
              </span>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-[11px] font-bold text-[#E65100] underline hover:text-[#BF360C]"
            >
              مشاهده لیست
            </button>
          </div>
        ) : (
          <div className="bg-[#EFEBE9]/60 border border-[#E6DFD5] text-[#5D4037] px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#8D6E63]" />
            <span>آماده شروع شیفت کاری، ثبت تسک‌ها و کنترل موجودی اقلام</span>
          </div>
        )}
      </div>

      {/* 3 Main Action Tiles */}
      <main className="my-6 space-y-4 flex-1 flex flex-col justify-center">
        {/* TILE 1: موجودی (INVENTORY) */}
        <button
          type="button"
          onClick={() => onNavigate('inventory')}
          className="group relative w-full text-right bg-white hover:bg-[#FAF8F5] active:scale-[0.985] border border-[#E6DFD5] hover:border-[#3E2723]/30 rounded-3xl p-5 shadow-[0_4px_16px_rgba(62,39,35,0.04)] hover:shadow-[0_8px_24px_rgba(62,39,35,0.08)] transition-all duration-200 flex items-center justify-between overflow-hidden"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F5F2EC] group-hover:bg-[#3E2723] text-[#3E2723] group-hover:text-[#FADCD2] flex items-center justify-center transition-colors duration-200 shrink-0 shadow-xs">
              <Boxes className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">📦</span>
                <h2 className="font-extrabold text-lg text-[#201A19] group-hover:text-[#3E2723] transition-colors">
                  موجودی
                </h2>
              </div>
              <p className="text-xs text-[#6F5A52] font-medium leading-relaxed">
                بررسی موجودی یخچال و انبار
              </p>

              {/* Sub-badge / Live Stat */}
              <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="bg-[#F5F2EC] text-[#5D4037] font-semibold px-2.5 py-0.5 rounded-full border border-[#E6DFD5]">
                  {toPersianDigits(completedInventoryItems)} از {toPersianDigits(totalInventoryItems)} کالا شمارش شده
                </span>
                {lastInventoryDate && (
                  <span className="text-[#8D6E63] font-normal">
                    {lastInventoryDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] group-hover:bg-[#3E2723] text-[#8D6E63] group-hover:text-white flex items-center justify-center transition-all duration-200 shrink-0 border border-[#E6DFD5]/60">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* TILE 2: تسک‌ها (TASKS) */}
        <button
          type="button"
          onClick={() => onNavigate('tasks')}
          className="group relative w-full text-right bg-white hover:bg-[#FAF8F5] active:scale-[0.985] border border-[#E6DFD5] hover:border-[#3E2723]/30 rounded-3xl p-5 shadow-[0_4px_16px_rgba(62,39,35,0.04)] hover:shadow-[0_8px_24px_rgba(62,39,35,0.08)] transition-all duration-200 flex items-center justify-between overflow-hidden"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F5F2EC] group-hover:bg-[#3E2723] text-[#3E2723] group-hover:text-[#FADCD2] flex items-center justify-center transition-colors duration-200 shrink-0 shadow-xs">
              <CheckSquare className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <h2 className="font-extrabold text-lg text-[#201A19] group-hover:text-[#3E2723] transition-colors">
                  تسک‌ها
                </h2>
              </div>
              <p className="text-xs text-[#6F5A52] font-medium leading-relaxed">
                کارهای روزانه و برنامه کاری
              </p>

              {/* Sub-badge / Live Stat */}
              <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                {remainingTasksCount === 0 && totalTodayTasksCount > 0 ? (
                  <span className="bg-[#E8F5E9] text-[#2E7D32] font-bold px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
                    تمام {toPersianDigits(totalTodayTasksCount)} تسک امروز انجام شد ✓
                  </span>
                ) : (
                  <span className="bg-[#F3EBE7] text-[#5D4037] font-semibold px-2.5 py-0.5 rounded-full border border-[#E6DDD8]">
                    {toPersianDigits(remainingTasksCount)} کار امروز باقی مانده
                  </span>
                )}
                <span className="text-[#8D6E63]">
                  ۳ گروه شیفت
                </span>
              </div>
            </div>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] group-hover:bg-[#3E2723] text-[#8D6E63] group-hover:text-white flex items-center justify-center transition-all duration-200 shrink-0 border border-[#E6DFD5]/60">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* TILE 3: رسپی‌ها (RECIPES) */}
        <button
          type="button"
          onClick={() => onNavigate('recipes')}
          className="group relative w-full text-right bg-white hover:bg-[#FAF8F5] active:scale-[0.985] border border-[#E6DFD5] hover:border-[#3E2723]/30 rounded-3xl p-5 shadow-[0_4px_16px_rgba(62,39,35,0.04)] hover:shadow-[0_8px_24px_rgba(62,39,35,0.08)] transition-all duration-200 flex items-center justify-between overflow-hidden"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F5F2EC] group-hover:bg-[#3E2723] text-[#3E2723] group-hover:text-[#FADCD2] flex items-center justify-center transition-colors duration-200 shrink-0 shadow-xs">
              <BookOpen className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">📖</span>
                <h2 className="font-extrabold text-lg text-[#201A19] group-hover:text-[#3E2723] transition-colors">
                  رسپی‌ها
                </h2>
              </div>
              <p className="text-xs text-[#6F5A52] font-medium leading-relaxed">
                دستور پخت آیتم‌های منو
              </p>

              {/* Sub-badge / Live Stat */}
              <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="bg-[#F5F2EC] text-[#5D4037] font-semibold px-2.5 py-0.5 rounded-full border border-[#E6DFD5]">
                  {toPersianDigits(totalRecipesCount)} رسپی ثبت‌شده
                </span>
                <span className="text-[#8D6E63]">
                  همراه با مواد اولیه و مراحل
                </span>
              </div>
            </div>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] group-hover:bg-[#3E2723] text-[#8D6E63] group-hover:text-white flex items-center justify-center transition-all duration-200 shrink-0 border border-[#E6DFD5]/60">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </div>
        </button>
      </main>

      {/* Footer Info */}
      <footer className="text-center py-3 text-[11px] text-[#A1887F] font-medium border-t border-[#EFEBE9]/80">
        سیستم مدیریت داخلی باریستا و شیفت کافه چینو
      </footer>
    </div>
  );
};
