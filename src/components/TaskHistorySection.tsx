import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  Filter, 
  Search, 
  Utensils, 
  Coffee, 
  Users, 
  AlertCircle,
  TrendingUp,
  ChevronLeft,
  CalendarDays,
  Sun,
  Moon,
  Repeat,
  Bookmark
} from 'lucide-react';
import { TaskCompletionRecord, TaskCompletionDetail, TaskItem, TaskRole, TaskType } from '../types';
import { 
  getPastCafeShiftDays, 
  toPersianDigits, 
  isTaskOccurringOnDate,
  PastShiftDayInfo 
} from '../utils/persianDate';

interface TaskHistorySectionProps {
  tasks: TaskItem[];
  completions: TaskCompletionRecord;
}

export const TaskHistorySection: React.FC<TaskHistorySectionProps> = ({
  tasks,
  completions,
}) => {
  // Generate 5 days of history
  const pastDays = useMemo(() => getPastCafeShiftDays(5), []);
  
  // Selected day: standardString of a day, or 'all' for all 5 days
  const [selectedDayStr, setSelectedDayStr] = useState<string>(pastDays[0]?.standardString || 'all');
  
  // Filters
  const [roleFilter, setRoleFilter] = useState<'all' | 'waiter' | 'dishwasher'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'missed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. COMPUTE DAILY STATS FOR ALL 5 DAYS
  const daysAnalytics = useMemo(() => {
    return pastDays.map((day) => {
      const dayTasks = tasks.filter((t) => isTaskOccurringOnDate(t, day.standardString));
      
      let completedCount = 0;
      let missedCount = 0;
      const completedByCounts: Record<string, number> = {
        'سالندار اول': 0,
        'سالندار دوم': 0,
        'سالندار سوم': 0,
        'ظرفشور': 0,
        'مدیریت': 0,
      };

      dayTasks.forEach((task) => {
        const key = `${task.id}_${day.standardString}`;
        const comp = completions[key];
        if (comp?.completed) {
          completedCount++;
          const by = comp.completedBy || 'نامشخص';
          if (completedByCounts[by] !== undefined) {
            completedByCounts[by]++;
          } else {
            completedByCounts[by] = (completedByCounts[by] || 0) + 1;
          }
        } else {
          missedCount++;
        }
      });

      const total = dayTasks.length;
      const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      return {
        ...day,
        totalTasks: total,
        completedCount,
        missedCount,
        percent,
        completedByCounts,
        dayTasks,
      };
    });
  }, [pastDays, tasks, completions]);

  // Total summary across 5 days
  const total5DaysSummary = useMemo(() => {
    let totalScheduled = 0;
    let totalCompleted = 0;
    let totalMissed = 0;
    const staffSummary: Record<string, number> = {};

    daysAnalytics.forEach((d) => {
      totalScheduled += d.totalTasks;
      totalCompleted += d.completedCount;
      totalMissed += d.missedCount;

      Object.entries(d.completedByCounts).forEach(([name, count]) => {
        const num = typeof count === 'number' ? count : 0;
        staffSummary[name] = (staffSummary[name] || 0) + num;
      });
    });

    const overallPercent = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

    return {
      totalScheduled,
      totalCompleted,
      totalMissed,
      overallPercent,
      staffSummary,
    };
  }, [daysAnalytics]);

  // Selected Day Data
  const currentDayData = useMemo(() => {
    if (selectedDayStr === 'all') return null;
    return daysAnalytics.find((d) => d.standardString === selectedDayStr) || daysAnalytics[0];
  }, [selectedDayStr, daysAnalytics]);

  // Task Items to Render based on Selected Day & Filters
  const displayedItems = useMemo(() => {
    const targetDays = selectedDayStr === 'all' 
      ? daysAnalytics 
      : (currentDayData ? [currentDayData] : []);

    const result: Array<{
      day: PastShiftDayInfo;
      task: TaskItem;
      completion?: TaskCompletionDetail;
      isCompleted: boolean;
    }> = [];

    targetDays.forEach((dayData) => {
      dayData.dayTasks.forEach((task) => {
        const key = `${task.id}_${dayData.standardString}`;
        const comp = completions[key];
        const isDone = !!comp?.completed;

        // Apply Role Filter
        if (roleFilter === 'dishwasher') {
          if (task.role !== 'dishwasher' && task.role !== 'both') return;
        } else if (roleFilter === 'waiter') {
          if (task.role !== 'waiter' && task.role !== 'both') return;
        }

        // Apply Status Filter
        if (statusFilter === 'completed' && !isDone) return;
        if (statusFilter === 'missed' && isDone) return;

        // Apply Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchNotes = task.notes?.toLowerCase().includes(q) || false;
          const matchExecutor = comp?.completedBy?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchNotes && !matchExecutor) return;
        }

        result.push({
          day: dayData,
          task,
          completion: comp,
          isCompleted: isDone,
        });
      });
    });

    return result;
  }, [selectedDayStr, daysAnalytics, currentDayData, completions, roleFilter, statusFilter, searchQuery]);

  // Helper for Task Type Badge
  const getTaskTypeBadge = (type: TaskType) => {
    switch (type) {
      case 'shift_start':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-[#FFF3E0] text-[#E65100] px-2 py-0.5 rounded-full font-semibold">
            <Sun className="w-2.5 h-2.5" />
            <span>شروع شیفت</span>
          </span>
        );
      case 'shift_end':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-[#EDE7F6] text-[#5E35B1] px-2 py-0.5 rounded-full font-semibold">
            <Moon className="w-2.5 h-2.5" />
            <span>پایان شیفت</span>
          </span>
        );
      case 'recurring_weekly':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full font-semibold">
            <Repeat className="w-2.5 h-2.5" />
            <span>روتین هفتگی</span>
          </span>
        );
      case 'one_time':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-[#E1F5FE] text-[#0288D1] px-2 py-0.5 rounded-full font-semibold">
            <Bookmark className="w-2.5 h-2.5" />
            <span>موردی</span>
          </span>
        );
    }
  };

  // Helper for Role Badge
  const getRoleBadge = (role: TaskRole) => {
    switch (role) {
      case 'dishwasher':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2] px-2 py-0.5 rounded-full font-bold">
            <Utensils className="w-2.5 h-2.5" />
            <span>ظرفشور</span>
          </span>
        );
      case 'waiter':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-[#E1F5FE] text-[#0288D1] border border-[#B3E5FC] px-2 py-0.5 rounded-full font-bold">
            <Coffee className="w-2.5 h-2.5" />
            <span>سالندار</span>
          </span>
        );
      case 'both':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-[#F5F2EC] text-[#5D4037] border border-[#E6DFD5] px-2 py-0.5 rounded-full font-semibold">
            <Users className="w-2.5 h-2.5" />
            <span>مشترک</span>
          </span>
        );
    }
  };

  // Helper for Completed By Pill
  const renderExecutorBadge = (comp?: TaskCompletionDetail) => {
    if (!comp || !comp.completed) return null;
    const name = comp.completedBy || 'نامشخص';
    const role = comp.completedByRole;

    let badgeClass = 'bg-[#EFEBE9] text-[#5D4037] border-[#D7CCC8]';
    if (role === 'waiter1' || name === 'سالندار اول') {
      badgeClass = 'bg-[#E1F5FE] text-[#0288D1] border-[#B3E5FC]';
    } else if (role === 'waiter2' || name === 'سالندار دوم') {
      badgeClass = 'bg-[#EDE7F6] text-[#6A1B9A] border-[#D1C4E9]';
    } else if (role === 'waiter3' || name === 'سالندار سوم') {
      badgeClass = 'bg-[#E0F2F1] text-[#00695C] border-[#B2DFDB]';
    } else if (role === 'dishwasher' || name === 'ظرفشور') {
      badgeClass = 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]';
    } else if (role === 'manager' || name === 'مدیریت') {
      badgeClass = 'bg-[#FBE9E7] text-[#D84315] border-[#FFCCBC]';
    }

    return (
      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 shadow-2xs ${badgeClass}`}>
        <UserCheck className="w-3 h-3" />
        <span>تکمیل توسط: {name}</span>
      </span>
    );
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* Overview 5-Day Trend Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#EFEBE9] shadow-[0_4px_16px_rgba(62,39,35,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#3E2723] text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4 text-[#FADCD2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#201A19]">عملکرد و تاریخچه ۵ روز اخیر</h3>
              <p className="text-[11px] text-[#8D6E63] font-medium">
                تغییر شیفت هر روز رأس ساعت ۱:۰۰ بامداد اعمال می‌شود
              </p>
            </div>
          </div>

          <div className="text-left">
            <span className="text-xs font-extrabold bg-[#F5F2EC] text-[#3E2723] px-3 py-1 rounded-full border border-[#E6DFD5]">
              مجموع: {toPersianDigits(total5DaysSummary.totalCompleted)} از {toPersianDigits(total5DaysSummary.totalScheduled)} تسک ({toPersianDigits(total5DaysSummary.overallPercent)}٪)
            </span>
          </div>
        </div>

        {/* 5-Day Mini Trend Bars */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
          {daysAnalytics.map((day) => {
            const isSelected = selectedDayStr === day.standardString;
            return (
              <button
                key={day.standardString}
                type="button"
                onClick={() => setSelectedDayStr(day.standardString)}
                className={`flex flex-col items-center p-2 rounded-2xl border transition-all text-center ${
                  isSelected
                    ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-sm ring-2 ring-[#3E2723]/20'
                    : 'bg-[#FAF8F5] text-[#201A19] border-[#E6DFD5] hover:bg-[#F5F2EC]'
                }`}
              >
                <span className={`text-[10px] font-bold truncate max-w-full ${isSelected ? 'text-[#FADCD2]' : 'text-[#8D6E63]'}`}>
                  {day.label.replace(' (شیفت جاری)', '')}
                </span>
                <span className="text-[11px] font-extrabold my-0.5">
                  {day.weekday}
                </span>
                
                {/* Mini Progress Circle / Bar */}
                <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden my-1">
                  <div 
                    className={`h-full rounded-full ${
                      day.percent >= 80 
                        ? 'bg-[#4CAF50]' 
                        : day.percent >= 50 
                          ? 'bg-[#FF9800]' 
                          : 'bg-[#F44336]'
                    }`}
                    style={{ width: `${day.percent}%` }}
                  />
                </div>

                <span className={`text-[9px] font-bold ${isSelected ? 'text-white' : 'text-[#6F5A52]'}`}>
                  {toPersianDigits(day.completedCount)}/{toPersianDigits(day.totalTasks)} ({toPersianDigits(day.percent)}٪)
                </span>
              </button>
            );
          })}
        </div>

        {/* Staff Contribution Badges across 5 Days */}
        <div className="pt-2 border-t border-[#EFEBE9]">
          <span className="text-[11px] font-bold text-[#6F5A52] block mb-2">
            تفکیک ثبت تسک‌ها توسط پرسنل:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs bg-[#E1F5FE] text-[#0288D1] border border-[#B3E5FC] px-2.5 py-1 rounded-xl font-bold">
              <Coffee className="w-3 h-3" />
              <span>سالندار اول: {toPersianDigits(total5DaysSummary.staffSummary['سالندار اول'] || 0)}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs bg-[#EDE7F6] text-[#6A1B9A] border border-[#D1C4E9] px-2.5 py-1 rounded-xl font-bold">
              <Coffee className="w-3 h-3" />
              <span>سالندار دوم: {toPersianDigits(total5DaysSummary.staffSummary['سالندار دوم'] || 0)}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs bg-[#E0F2F1] text-[#00695C] border border-[#B2DFDB] px-2.5 py-1 rounded-xl font-bold">
              <Coffee className="w-3 h-3" />
              <span>سالندار سوم: {toPersianDigits(total5DaysSummary.staffSummary['سالندار سوم'] || 0)}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2] px-2.5 py-1 rounded-xl font-bold">
              <Utensils className="w-3 h-3" />
              <span>ظرفشور: {toPersianDigits(total5DaysSummary.staffSummary['ظرفشور'] || 0)}</span>
            </span>

            {(total5DaysSummary.staffSummary['مدیریت'] || 0) > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-[#FBE9E7] text-[#D84315] border border-[#FFCCBC] px-2.5 py-1 rounded-xl font-bold">
                <Users className="w-3 h-3" />
                <span>مدیریت: {toPersianDigits(total5DaysSummary.staffSummary['مدیریت'])}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Day Selector & Search Toolbar */}
      <div className="space-y-3">
        {/* Day Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedDayStr('all')}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedDayStr === 'all'
                ? 'bg-[#3E2723] text-white shadow-sm'
                : 'bg-white text-[#6F5A52] border border-[#E6DFD5] hover:bg-[#F5F2EC]'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>همه ۵ روز اخیر ({toPersianDigits(total5DaysSummary.totalScheduled)})</span>
          </button>

          {pastDays.map((day) => {
            const isSelected = selectedDayStr === day.standardString;
            return (
              <button
                key={day.standardString}
                type="button"
                onClick={() => setSelectedDayStr(day.standardString)}
                className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#3E2723] text-white shadow-sm'
                    : 'bg-white text-[#6F5A52] border border-[#E6DFD5] hover:bg-[#F5F2EC]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{day.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#EFEBE9] text-[#5D4037]'
                }`}>
                  {day.formattedPersian.split('/')[1]}/{day.formattedPersian.split('/')[2]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls Row */}
        <div className="bg-white rounded-2xl p-3 border border-[#EFEBE9] shadow-2xs space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8D6E63] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در تسک‌ها، توضیحات یا نام سالندار/ظرفشور..."
              className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl pr-9 pl-3 py-2 text-xs text-[#201A19] placeholder:text-[#A1887F] focus:outline-hidden focus:ring-2 focus:ring-[#3E2723]/30"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#EFEBE9]">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#8D6E63] font-semibold">وضعیت:</span>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-[#3E2723] text-white'
                    : 'bg-[#FAF8F5] text-[#6F5A52] border border-[#E6DFD5]'
                }`}
              >
                همه
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 ${
                  statusFilter === 'completed'
                    ? 'bg-[#2E7D32] text-white'
                    : 'bg-[#FAF8F5] text-[#2E7D32] border border-[#C8E6C9]'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>انجام شده</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('missed')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 ${
                  statusFilter === 'missed'
                    ? 'bg-[#C62828] text-white'
                    : 'bg-[#FAF8F5] text-[#C62828] border border-[#FFCDD2]'
                }`}
              >
                <XCircle className="w-3 h-3" />
                <span>انجام نشده</span>
              </button>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#8D6E63] font-semibold">نقش:</span>
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                  roleFilter === 'all'
                    ? 'bg-[#3E2723] text-white'
                    : 'bg-[#FAF8F5] text-[#6F5A52] border border-[#E6DFD5]'
                }`}
              >
                همه
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('waiter')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                  roleFilter === 'waiter'
                    ? 'bg-[#0288D1] text-white'
                    : 'bg-[#FAF8F5] text-[#0288D1] border border-[#B3E5FC]'
                }`}
              >
                سالندار
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('dishwasher')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                  roleFilter === 'dishwasher'
                    ? 'bg-[#E65100] text-white'
                    : 'bg-[#FAF8F5] text-[#E65100] border border-[#FFE0B2]'
                }`}
              >
                ظرفشور
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Day Header Details (if single day selected) */}
      {currentDayData && selectedDayStr !== 'all' && (
        <div className="bg-[#FAF8F5] border border-[#E6DFD5] rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#3E2723]" />
            <div>
              <h4 className="font-extrabold text-xs text-[#201A19]">
                {currentDayData.fullDate} ({currentDayData.label})
              </h4>
              <p className="text-[10px] text-[#8D6E63] font-medium mt-0.5">
                تعداد کل کارهای این شیفت: {toPersianDigits(currentDayData.totalTasks)} مورد
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] px-2.5 py-1 rounded-xl flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{toPersianDigits(currentDayData.completedCount)} انجام شده</span>
            </span>

            {currentDayData.missedCount > 0 && (
              <span className="text-[11px] font-bold bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] px-2.5 py-1 rounded-xl flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                <span>{toPersianDigits(currentDayData.missedCount)} بدون تیک</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2.5">
        {displayedItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-[#EFEBE9] text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-[#8D6E63] mx-auto opacity-50" />
            <p className="text-xs font-bold text-[#201A19]">تسک یا موردی با فیلترهای انتخابی یافت نشد.</p>
            <p className="text-[11px] text-[#8D6E63]">
              می‌توانید فیلتر وضعیت، نقش یا عبارت جستجو را تغییر دهید.
            </p>
          </div>
        ) : (
          displayedItems.map(({ day, task, completion, isCompleted }, index) => {
            return (
              <div
                key={`${task.id}_${day.standardString}_${index}`}
                className={`rounded-2xl p-3.5 border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-white border-[#C8E6C9] shadow-2xs hover:border-[#81C784]'
                    : 'bg-white border-[#FFCDD2]/80 hover:border-[#E57373]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left (Right in RTL): Status Icon + Content */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Status Circle */}
                    <div className="pt-0.5 shrink-0">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A] flex items-center justify-center">
                          <XCircle className="w-4 h-4 text-[#C62828]" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      {/* Title + Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-bold ${isCompleted ? 'text-[#201A19]' : 'text-[#5D4037]'}`}>
                          {task.title}
                        </span>
                        {getRoleBadge(task.role)}
                        {getTaskTypeBadge(task.taskType)}
                        {selectedDayStr === 'all' && (
                          <span className="text-[10px] bg-[#FAF8F5] text-[#8D6E63] border border-[#E6DFD5] px-2 py-0.2 rounded-md font-semibold">
                            {day.weekday} ({day.formattedPersian})
                          </span>
                        )}
                      </div>

                      {/* Notes */}
                      {task.notes && (
                        <p className="text-[11px] text-[#6F5A52] leading-snug">
                          {task.notes}
                        </p>
                      )}

                      {/* Execution Details / Missed status */}
                      <div className="pt-1 flex items-center gap-2 flex-wrap">
                        {isCompleted ? (
                          <>
                            {renderExecutorBadge(completion)}
                            {completion?.completedAt && (
                              <span className="text-[10px] text-[#2E7D32] font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>ساعت ثبت: {completion.completedAt}</span>
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[10px] font-bold text-[#C62828] bg-[#FFEBEE] border border-[#FFCDD2] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>❌ انجام نشده / بدون تیک در شیفت این روز</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
