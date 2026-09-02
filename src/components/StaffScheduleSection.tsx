import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  Check, 
  LogOut, 
  Sun, 
  Moon, 
  Repeat, 
  Bookmark, 
  Info,
  CalendarDays,
  Utensils,
  Coffee,
  Users,
  UserCheck,
  Download,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuthRole, TaskCompletionRecord, TaskCompletionDetail, TaskItem, TaskRole } from '../types';
import { 
  getTodayJalaliDate, 
  toPersianDigits, 
  doesTaskApplyToday, 
  PERSIAN_WEEKDAYS_FULL,
  normalizePersianWeekday
} from '../utils/persianDate';
import { StaffSchedulePdfModal } from './StaffSchedulePdfModal';

interface StaffScheduleSectionProps {
  role: 'dishwasher' | 'waiter1' | 'waiter2' | 'waiter3';
  tasks: TaskItem[];
  completions: TaskCompletionRecord;
  onToggleTaskCompletion: (taskId: string, targetDateStr: string) => void;
  onLogout: () => void;
}

type StaffTab = 'today' | 'weekly';

export const StaffScheduleSection: React.FC<StaffScheduleSectionProps> = ({
  role,
  tasks,
  completions,
  onToggleTaskCompletion,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<StaffTab>('today');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const todayInfo = useMemo(() => getTodayJalaliDate(), []);
  const todayStr = todayInfo.standardString;
  const todayWeekday = todayInfo.weekday;

  const isWaiter = role === 'waiter1' || role === 'waiter2' || role === 'waiter3';

  // Filter all tasks relevant to this staff role (role match OR 'both')
  const myRoleTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (role === 'dishwasher') {
        return t.role === 'dishwasher' || t.role === 'both';
      }
      if (isWaiter) {
        return t.role === 'waiter' || t.role === 'both';
      }
      return false;
    });
  }, [tasks, role, isWaiter]);

  // 1. TODAY'S APPLICABLE TASKS
  const todayTasks = useMemo(() => {
    return myRoleTasks.filter((t) => doesTaskApplyToday(t, todayStr, todayWeekday));
  }, [myRoleTasks, todayStr, todayWeekday]);

  const completedTodayCount = useMemo(() => {
    return todayTasks.filter((t) => completions[`${t.id}_${todayStr}`]?.completed).length;
  }, [todayTasks, completions, todayStr]);

  const progressPercent = todayTasks.length > 0
    ? Math.round((completedTodayCount / todayTasks.length) * 100)
    : 0;

  const handleToggle = (taskId: string) => {
    const isCurrentlyDone = completions[`${taskId}_${todayStr}`]?.completed;
    onToggleTaskCompletion(taskId, todayStr);

    if (!isCurrentlyDone && completedTodayCount + 1 === todayTasks.length && todayTasks.length > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3E2723', '#D7CCC8', '#8D6E63', '#4CAF50'],
        });
      } catch {
        // Safe fallback
      }
    }
  };

  const getRoleBadge = (taskRole: TaskRole) => {
    if (taskRole === 'both') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] bg-[#F5F2EC] text-[#5D4037] border border-[#E6DFD5] px-2 py-0.2 rounded-full font-semibold">
          <Users className="w-2.5 h-2.5" />
          <span>مشترک</span>
        </span>
      );
    }
    return null;
  };

  // Role metadata for header
  const roleMeta = useMemo(() => {
    switch (role) {
      case 'waiter1':
        return {
          title: 'شیفت سالنداری',
          roleLabel: 'سالندار اول',
          icon: Coffee,
          badgeBg: 'bg-[#E1F5FE] text-[#0288D1] border-[#B3E5FC]',
        };
      case 'waiter2':
        return {
          title: 'شیفت سالنداری',
          roleLabel: 'سالندار دوم',
          icon: Coffee,
          badgeBg: 'bg-[#EDE7F6] text-[#6A1B9A] border-[#D1C4E9]',
        };
      case 'waiter3':
        return {
          title: 'شیفت سالنداری',
          roleLabel: 'سالندار سوم',
          icon: Coffee,
          badgeBg: 'bg-[#E0F2F1] text-[#00695C] border-[#B2DFDB]',
        };
      case 'dishwasher':
      default:
        return {
          title: 'شیفت ظرفشویی',
          roleLabel: 'ظرفشور',
          icon: Utensils,
          badgeBg: 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]',
        };
    }
  }, [role]);

  const RoleIcon = roleMeta.icon;

  // Group today's tasks
  const shiftStartTasks = todayTasks.filter((t) => t.taskType === 'shift_start');
  const shiftEndTasks = todayTasks.filter((t) => t.taskType === 'shift_end');
  const weeklyTodayTasks = todayTasks.filter((t) => t.taskType === 'recurring_weekly');
  const oneTimeTodayTasks = todayTasks.filter((t) => t.taskType === 'one_time');

  // Recurring weekly tasks for Weekly Schedule Tab
  const recurringTasks = useMemo(() => {
    return myRoleTasks.filter((t) => t.taskType === 'recurring_weekly');
  }, [myRoleTasks]);

  const dailyShiftStartCount = useMemo(() => {
    return myRoleTasks.filter((t) => t.taskType === 'shift_start').length;
  }, [myRoleTasks]);

  const dailyShiftEndCount = useMemo(() => {
    return myRoleTasks.filter((t) => t.taskType === 'shift_end').length;
  }, [myRoleTasks]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#201A19] flex flex-col" dir="rtl">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EFEBE9] px-4 py-3 shadow-[0_2px_8px_rgba(62,39,35,0.03)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs ${roleMeta.badgeBg}`}>
              <RoleIcon className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-[#201A19] leading-none">
                  کافه چینو
                </h1>
                <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleMeta.badgeBg}`}>
                  {roleMeta.title}
                </span>
              </div>
              <p className="text-xs text-[#6F5A52] mt-0.5 font-medium flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-[#8D6E63]" />
                <span>{todayInfo.weekday} {toPersianDigits(todayInfo.day)} {todayInfo.monthName}</span>
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-[#F5F2EC] active:scale-95 text-[#3E2723] text-xs font-bold px-3 py-2 rounded-2xl border border-[#E6DFD5] transition-all shadow-xs"
              title="دانلود فایل PDF برنامه هفتگی"
            >
              <Download className="w-4 h-4 text-[#8D6E63]" />
              <span className="hidden sm:inline">دانلود PDF برنامه</span>
              <span className="sm:hidden">PDF</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-white hover:bg-[#FFDAD6]/30 active:scale-95 text-[#BA1A1A] hover:text-[#93000A] text-xs font-bold px-3 py-2 rounded-2xl border border-[#E6DFD5] transition-all shadow-xs"
              title="خروج از حساب کاربری"
            >
              <LogOut className="w-4 h-4 rotate-180" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2 Staff Tabs Switcher: "امروز" & "هفتگی" */}
      <div className="bg-[#FAF8F5] border-b border-[#EFEBE9] px-4 py-2 sticky top-[61px] z-30">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          {/* TAB 1: امروز */}
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'today'
                ? 'bg-[#3E2723] text-white shadow-sm'
                : 'bg-white text-[#6F5A52] hover:bg-[#F5F2EC] border border-[#E6DFD5]'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${activeTab === 'today' ? 'text-[#FADCD2]' : 'text-[#8D6E63]'}`} />
            <span>کارهای امروز</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
              activeTab === 'today' ? 'bg-[#5D4037] text-white' : 'bg-[#EFEBE9] text-[#5D4037]'
            }`}>
              {toPersianDigits(todayTasks.length - completedTodayCount)} مانده
            </span>
          </button>

          {/* TAB 2: برنامه هفتگی */}
          <button
            type="button"
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'weekly'
                ? 'bg-[#3E2723] text-white shadow-sm'
                : 'bg-white text-[#6F5A52] hover:bg-[#F5F2EC] border border-[#E6DFD5]'
            }`}
          >
            <CalendarDays className={`w-4 h-4 ${activeTab === 'weekly' ? 'text-[#FADCD2]' : 'text-[#8D6E63]'}`} />
            <span>برنامه هفتگی</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
              activeTab === 'weekly' ? 'bg-[#5D4037] text-white' : 'bg-[#EFEBE9] text-[#5D4037]'
            }`}>
              کل هفته
            </span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 pb-20">
        {/* ========================================================= */}
        {/* TAB 1: کارهای امروز */}
        {/* ========================================================= */}
        {activeTab === 'today' && (
          <div className="space-y-5">
            {/* Shift Progress Card */}
            <div className="bg-white rounded-3xl p-5 border border-[#EFEBE9] shadow-[0_4px_16px_rgba(62,39,35,0.04)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8D6E63]" />
                  <span className="font-bold text-sm text-[#201A19]">پیشرفت کارهای شیفت شما</span>
                </div>
                <span className="text-xs font-extrabold bg-[#F5F2EC] text-[#3E2723] px-3 py-1 rounded-full border border-[#E6DFD5]">
                  {toPersianDigits(completedTodayCount)} از {toPersianDigits(todayTasks.length)} کار ({toPersianDigits(progressPercent)}٪)
                </span>
              </div>

              {/* Progress bar line */}
              <div className="w-full bg-[#EFEBE9] h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#3E2723] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {progressPercent === 100 && todayTasks.length > 0 && (
                <div className="bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] px-3 py-2 rounded-xl text-xs font-bold text-center animate-fadeIn">
                  خسته نباشید! تمامی تسک‌های شیفت امروز با موفقیت انجام شدند 🎉
                </div>
              )}

              {todayTasks.length === 0 && (
                <p className="text-xs text-[#8D6E63] text-center py-2">
                  تسک فعالی برای شیفت امروز ثبت نشده است.
                </p>
              )}
            </div>

            {/* 1. شروع شیفت */}
            {shiftStartTasks.length > 0 && (
              <StaffTaskGroup
                title="شروع شیفت (اول وقت)"
                subtitle="کارهای ابتدای روز کاری و آماده‌سازی"
                icon={Sun}
                iconBg="bg-[#FFF3E0] text-[#E65100]"
                tasks={shiftStartTasks}
                todayStr={todayStr}
                completions={completions}
                onToggle={handleToggle}
                getRoleBadge={getRoleBadge}
              />
            )}

            {/* 2. پایان شیفت */}
            {shiftEndTasks.length > 0 && (
              <StaffTaskGroup
                title="پایان شیفت (بستن کافه)"
                subtitle="نظافت نهایی، تحویل و شستشوی ابزارها"
                icon={Moon}
                iconBg="bg-[#EDE7F6] text-[#5E35B1]"
                tasks={shiftEndTasks}
                todayStr={todayStr}
                completions={completions}
                onToggle={handleToggle}
                getRoleBadge={getRoleBadge}
              />
            )}

            {/* 3. کارهای هفتگی امروز */}
            {weeklyTodayTasks.length > 0 && (
              <StaffTaskGroup
                title="کارهای هفتگی امروز"
                subtitle={`برنامه‌ریزی شده برای روزهای ${todayWeekday}`}
                icon={Repeat}
                iconBg="bg-[#E0F2FE] text-[#0369A1]"
                tasks={weeklyTodayTasks}
                todayStr={todayStr}
                completions={completions}
                onToggle={handleToggle}
                getRoleBadge={getRoleBadge}
              />
            )}

            {/* 4. کارهای یکباره امروز */}
            {oneTimeTodayTasks.length > 0 && (
              <StaffTaskGroup
                title="کارهای یکباره امروز"
                subtitle={`زمان‌بندی شده برای تاریخ ${toPersianDigits(todayStr)}`}
                icon={Bookmark}
                iconBg="bg-[#FCE4EC] text-[#C2185B]"
                tasks={oneTimeTodayTasks}
                todayStr={todayStr}
                completions={completions}
                onToggle={handleToggle}
                getRoleBadge={getRoleBadge}
              />
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: برنامه هفتگی (READ-ONLY WEEKLY SCHEDULE) */}
        {/* ========================================================= */}
        {activeTab === 'weekly' && (
          <div className="space-y-4">
            {/* Download PDF Card Banner */}
            <div className="bg-[#3E2723] text-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(62,39,35,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-[#5D4037] text-[#FADCD2] px-2.5 py-0.5 rounded-full border border-[#8D6E63]/30">
                    نسخه رسمی چاپی
                  </span>
                  <h3 className="font-black text-sm sm:text-base text-white">دانلود برنامه جامع هفتگی (PDF)</h3>
                </div>
                <p className="text-xs text-[#D7CCC8] leading-relaxed">
                  شامل روتین‌های روزانه شروع و پایان شیفت، جدول تفکیکی روزهای هفته و بخش امضا
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPdfModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-[#FAF8F5] hover:bg-white active:scale-95 text-[#3E2723] font-extrabold text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-xs transition-all shrink-0"
              >
                <Download className="w-4 h-4 text-[#8D6E63]" />
                <span>دانلود و پرینت PDF</span>
              </button>
            </div>

            {/* Daily Shift Routine Info Card */}
            <div className="bg-white rounded-3xl p-5 border border-[#EFEBE9] shadow-[0_4px_16px_rgba(62,39,35,0.04)] space-y-2.5">
              <div className="flex items-center gap-2 text-[#3E2723]">
                <Info className="w-4 h-4 text-[#8D6E63]" />
                <h3 className="font-extrabold text-sm text-[#201A19]">وظایف ثابت روزانه (هر روز کاری)</h3>
              </div>
              <p className="text-xs text-[#6F5A52] leading-relaxed">
                تسک‌های «شروع شیفت» ({toPersianDigits(dailyShiftStartCount)} مورد) و «پایان شیفت» ({toPersianDigits(dailyShiftEndCount)} مورد) در تمامی روزهای کاری ثابت هستند. جدول زیر برنامه تسک‌های هفتگی دوره‌ای شما را نشان می‌دهد.
              </p>
            </div>

            {/* 7 Days of the Week */}
            <div className="space-y-3">
              {PERSIAN_WEEKDAYS_FULL.map((weekdayName) => {
                const isToday = normalizePersianWeekday(weekdayName) === normalizePersianWeekday(todayWeekday);
                const dayTasks = recurringTasks.filter((t) =>
                  t.weekdays?.some((d) => normalizePersianWeekday(d) === normalizePersianWeekday(weekdayName))
                );

                return (
                  <div
                    key={weekdayName}
                    className={`rounded-2xl p-4 border transition-all duration-200 ${
                      isToday
                        ? 'bg-white border-[#3E2723] shadow-sm ring-1 ring-[#3E2723]/15'
                        : 'bg-white/80 border-[#E6DFD5]'
                    }`}
                  >
                    {/* Weekday Row Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#EFEBE9]">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#201A19]">
                          {weekdayName}
                        </span>
                        {isToday && (
                          <span className="text-[10px] bg-[#3E2723] text-white font-bold px-2 py-0.5 rounded-full">
                            امروز
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-[#8D6E63] font-semibold">
                        {dayTasks.length > 0 ? `${toPersianDigits(dayTasks.length)} تسک دوره‌ای` : 'بدون تسک دوره‌ای'}
                      </span>
                    </div>

                    {/* Day's Tasks */}
                    <div className="pt-2.5 space-y-2">
                      {dayTasks.length === 0 ? (
                        <p className="text-xs text-[#A1887F] font-normal italic">
                          تسک هفتگی خاصی برای این روز تعریف نشده است.
                        </p>
                      ) : (
                        dayTasks.map((t) => (
                          <div
                            key={t.id}
                            className="bg-[#FAF8F5] rounded-xl p-2.5 border border-[#E6DFD5] flex items-start justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-[#201A19]">
                                  {t.title}
                                </span>
                                {getRoleBadge(t.role)}
                              </div>
                              {t.notes && (
                                <p className="text-[11px] text-[#6F5A52] leading-snug">
                                  {t.notes}
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] bg-white text-[#8D6E63] border border-[#E6DFD5] px-2 py-0.5 rounded-md font-medium shrink-0">
                              هفتگی
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Weekly Staff Schedule PDF Modal */}
      <StaffSchedulePdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        role={role}
        tasks={tasks}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// HELPER: RENDER COMPLETED INFO IN STAFF VIEW
// ─────────────────────────────────────────────────────────────
const renderStaffCompletedInfo = (detail?: TaskCompletionDetail) => {
  if (!detail || !detail.completed) return null;
  const by = detail.completedBy || 'نامشخص';
  const role = detail.completedByRole;

  let bgClass = 'bg-[#EFEBE9] text-[#5D4037] border-[#D7CCC8]';
  if (role === 'waiter1') bgClass = 'bg-[#E1F5FE] text-[#0288D1] border-[#B3E5FC]';
  else if (role === 'waiter2') bgClass = 'bg-[#EDE7F6] text-[#6A1B9A] border-[#D1C4E9]';
  else if (role === 'waiter3') bgClass = 'bg-[#E0F2F1] text-[#00695C] border-[#B2DFDB]';
  else if (role === 'dishwasher') bgClass = 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]';
  else if (role === 'manager') bgClass = 'bg-[#FBE9E7] text-[#D84315] border-[#FFCCBC]';

  return (
    <div className="flex items-center gap-2 flex-wrap pt-0.5">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${bgClass}`}>
        <UserCheck className="w-3 h-3" />
        <span>توسط: {by}</span>
      </span>
      {detail.completedAt && (
        <span className="text-[10px] text-[#2E7D32] font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>ساعت {detail.completedAt}</span>
        </span>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENT: STAFF TASK GROUP SECTION
// ─────────────────────────────────────────────────────────────
interface StaffTaskGroupProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  tasks: TaskItem[];
  todayStr: string;
  completions: TaskCompletionRecord;
  onToggle: (taskId: string) => void;
  getRoleBadge: (role: TaskRole) => React.ReactNode;
}

const StaffTaskGroup: React.FC<StaffTaskGroupProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconBg,
  tasks,
  todayStr,
  completions,
  onToggle,
  getRoleBadge,
}) => {
  const completedCount = tasks.filter((t) => completions[`${t.id}_${todayStr}`]?.completed).length;

  return (
    <section className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shadow-2xs`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#201A19] leading-tight">{title}</h3>
            <span className="text-[11px] text-[#8D6E63] font-medium">{subtitle}</span>
          </div>
        </div>

        <span className="text-[11px] font-bold bg-white text-[#5D4037] px-2.5 py-1 rounded-full border border-[#E6DFD5]">
          {toPersianDigits(completedCount)} از {toPersianDigits(tasks.length)}
        </span>
      </div>

      {/* Cards List */}
      <div className="space-y-2">
        {tasks.map((task) => {
          const key = `${task.id}_${todayStr}`;
          const compDetail = completions[key];
          const isDone = compDetail?.completed;

          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onToggle(task.id)}
              className={`w-full text-right p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 ${
                isDone
                  ? 'bg-[#F9F7F5] border-[#E6DFD5] opacity-80'
                  : 'bg-white border-[#E6DFD5] hover:border-[#3E2723]/30 shadow-xs active:scale-[0.99]'
              }`}
            >
              {/* Checkbox */}
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <div className="w-5 h-5 rounded-lg bg-[#3E2723] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-lg border-2 border-[#8D6E63] hover:border-[#3E2723]" />
                )}
              </div>

              {/* Text info */}
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs sm:text-sm font-bold block leading-snug ${
                    isDone ? 'line-through text-[#8D6E63]' : 'text-[#201A19]'
                  }`}>
                    {task.title}
                  </span>
                  {getRoleBadge(task.role)}
                </div>

                {task.notes && (
                  <p className="text-[11px] text-[#6F5A52] leading-relaxed">
                    {task.notes}
                  </p>
                )}

                {isDone && renderStaffCompletedInfo(compDetail)}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
