import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Plus, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Sparkles, 
  Check,
  Utensils,
  Coffee,
  Users,
  Repeat,
  Bookmark,
  Sun,
  Moon,
  Filter,
  UserCheck,
  History,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TaskCompletionRecord, TaskCompletionDetail, TaskItem, TaskRole, TaskType } from '../types';
import { 
  getTodayJalaliDate, 
  toPersianDigits, 
  doesTaskApplyToday 
} from '../utils/persianDate';
import { TaskModal } from './TaskModal';
import { TaskHistorySection } from './TaskHistorySection';
import { StaffSchedulePdfModal } from './StaffSchedulePdfModal';

interface TasksSectionProps {
  onBackToHome: () => void;
  tasks: TaskItem[];
  completions: TaskCompletionRecord;
  onToggleTaskCompletion: (taskId: string, targetDateStr: string) => void;
  onSaveTask: (taskData: {
    id?: string;
    title: string;
    notes?: string;
    taskType: TaskType;
    role: TaskRole;
    weekdays?: string[];
    fixedDate?: string;
  }) => void;
  onDeleteTask: (taskId: string) => void;
}

type MainViewTab = 'today' | 'history' | 'dishwasher' | 'waiter';

export const TasksSection: React.FC<TasksSectionProps> = ({
  onBackToHome,
  tasks,
  completions,
  onToggleTaskCompletion,
  onSaveTask,
  onDeleteTask,
}) => {
  const [activeTab, setActiveTab] = useState<MainViewTab>('today');
  const [roleFilter, setRoleFilter] = useState<'all' | TaskRole>('all');
  const [pdfModalRole, setPdfModalRole] = useState<'dishwasher' | 'waiter' | null>(null);

  const todayInfo = useMemo(() => getTodayJalaliDate(), []);
  const todayStr = todayInfo.standardString;
  const todayWeekday = todayInfo.weekday;

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);

  // 1. ALL TASKS THAT APPLY TODAY
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => doesTaskApplyToday(t, todayStr, todayWeekday));
  }, [tasks, todayStr, todayWeekday]);

  // Today tasks filtered by sub-role
  const filteredTodayTasks = useMemo(() => {
    if (roleFilter === 'all') return todayTasks;
    if (roleFilter === 'both') return todayTasks.filter((t) => t.role === 'both');
    return todayTasks.filter((t) => t.role === roleFilter || t.role === 'both');
  }, [todayTasks, roleFilter]);

  const completedTodayCount = useMemo(() => {
    return todayTasks.filter((t) => completions[`${t.id}_${todayStr}`]?.completed).length;
  }, [todayTasks, completions, todayStr]);

  const progressPercent = todayTasks.length > 0 
    ? Math.round((completedTodayCount / todayTasks.length) * 100) 
    : 0;

  // Toggle completion with confetti on 100% completion
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

  // 2. DISHWASHER VIEW (All tasks assigned to dishwasher or both)
  const dishwasherTasks = useMemo(() => {
    return tasks.filter((t) => t.role === 'dishwasher' || t.role === 'both');
  }, [tasks]);

  // 3. WAITER VIEW (All tasks assigned to waiter or both)
  const waiterTasks = useMemo(() => {
    return tasks.filter((t) => t.role === 'waiter' || t.role === 'both');
  }, [tasks]);

  const getRoleBadge = (role: TaskRole) => {
    switch (role) {
      case 'dishwasher':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2] px-2 py-0.5 rounded-full font-bold">
            <Utensils className="w-3 h-3" />
            <span>ظرفشور</span>
          </span>
        );
      case 'waiter':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] bg-[#E1F5FE] text-[#0288D1] border border-[#B3E5FC] px-2 py-0.5 rounded-full font-bold">
            <Coffee className="w-3 h-3" />
            <span>سالندار</span>
          </span>
        );
      case 'both':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] bg-[#F5F2EC] text-[#5D4037] border border-[#E6DFD5] px-2 py-0.5 rounded-full font-semibold">
            <Users className="w-3 h-3" />
            <span>مشترک</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#201A19] flex flex-col" dir="rtl">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EFEBE9] px-4 py-3 shadow-[0_2px_8px_rgba(62,39,35,0.03)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="w-10 h-10 rounded-2xl bg-white hover:bg-[#F5F2EC] active:scale-95 text-[#201A19] flex items-center justify-center transition-all border border-[#E6DFD5] shadow-xs"
              title="بازگشت به صفحه اصلی"
            >
              <ArrowRight className="w-5 h-5 text-[#3E2723]" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg text-[#201A19] leading-none">تسک‌ها و برنامه شیفت</h1>
                <span className="text-[10px] bg-[#F3EBE7] text-[#5D4037] font-bold px-2 py-0.5 rounded-full border border-[#E6DDD8]">
                  کافه چینو
                </span>
              </div>
              <p className="text-xs text-[#6F5A52] mt-0.5 font-medium flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-[#8D6E63]" />
                <span>{todayInfo.weekday} {toPersianDigits(todayInfo.day)} {todayInfo.monthName}</span>
              </p>
            </div>
          </div>

          {/* Add Task Button */}
          <button
            type="button"
            onClick={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#3E2723] hover:bg-[#201A19] active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-2xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#FADCD2]" />
            <span>تسک جدید</span>
          </button>
        </div>
      </header>

      {/* 4 Main Display Views Tab Switcher */}
      <div className="bg-[#FAF8F5] border-b border-[#EFEBE9] px-3 sm:px-4 py-2 sticky top-[61px] z-30">
        <div className="max-w-2xl mx-auto grid grid-cols-4 gap-1 sm:gap-2">
          {/* VIEW 1: کارهای امروز */}
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-2 rounded-2xl text-[11px] sm:text-xs font-bold transition-all ${
              activeTab === 'today'
                ? 'bg-[#3E2723] text-white shadow-sm'
                : 'bg-white text-[#6F5A52] hover:bg-[#F5F2EC] border border-[#E6DFD5]'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'today' ? 'text-[#FADCD2]' : 'text-[#8D6E63]'}`} />
            <span className="truncate">کارهای امروز</span>
            <span className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
              activeTab === 'today' ? 'bg-[#5D4037] text-white' : 'bg-[#EFEBE9] text-[#5D4037]'
            }`}>
              {toPersianDigits(todayTasks.length - completedTodayCount)}
            </span>
          </button>

          {/* VIEW 2: تاریخچه ۵ روز اخیر */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-2 rounded-2xl text-[11px] sm:text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-[#3E2723] text-white shadow-sm'
                : 'bg-white text-[#6F5A52] hover:bg-[#F5F2EC] border border-[#E6DFD5]'
            }`}
          >
            <History className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'history' ? 'text-[#FADCD2]' : 'text-[#8D6E63]'}`} />
            <span className="truncate">تاریخچه ۵ روز</span>
          </button>

          {/* VIEW 3: وظایف ظرفشور */}
          <button
            type="button"
            onClick={() => setActiveTab('dishwasher')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-2 rounded-2xl text-[11px] sm:text-xs font-bold transition-all ${
              activeTab === 'dishwasher'
                ? 'bg-[#3E2723] text-white shadow-sm'
                : 'bg-white text-[#6F5A52] hover:bg-[#F5F2EC] border border-[#E6DFD5]'
            }`}
          >
            <Utensils className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'dishwasher' ? 'text-[#FADCD2]' : 'text-[#8D6E63]'}`} />
            <span className="truncate">ظرفشور</span>
            <span className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
              activeTab === 'dishwasher' ? 'bg-[#5D4037] text-white' : 'bg-[#EFEBE9] text-[#5D4037]'
            }`}>
              {toPersianDigits(dishwasherTasks.length)}
            </span>
          </button>

          {/* VIEW 4: وظایف سالندار */}
          <button
            type="button"
            onClick={() => setActiveTab('waiter')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-2 rounded-2xl text-[11px] sm:text-xs font-bold transition-all ${
              activeTab === 'waiter'
                ? 'bg-[#3E2723] text-white shadow-sm'
                : 'bg-white text-[#6F5A52] hover:bg-[#F5F2EC] border border-[#E6DFD5]'
            }`}
          >
            <Coffee className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'waiter' ? 'text-[#FADCD2]' : 'text-[#8D6E63]'}`} />
            <span className="truncate">سالندار</span>
            <span className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
              activeTab === 'waiter' ? 'bg-[#5D4037] text-white' : 'bg-[#EFEBE9] text-[#5D4037]'
            }`}>
              {toPersianDigits(waiterTasks.length)}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 pb-28">
        {/* ========================================================= */}
        {/* VIEW 1: کارهای امروز (TODAY'S APPLICABLE TASKS) */}
        {/* ========================================================= */}
        {activeTab === 'today' && (
          <div className="space-y-5">
            {/* Shift Progress Card */}
            <div className="bg-white rounded-3xl p-5 border border-[#EFEBE9] shadow-[0_4px_16px_rgba(62,39,35,0.04)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8D6E63]" />
                  <span className="font-bold text-sm text-[#201A19]">پیشرفت تسک‌های شیفت امروز</span>
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
                  خسته نباشید! تمامی تسک‌های شیفت امروز کافه با موفقیت انجام شدند 🎉
                </div>
              )}
            </div>

            {/* Role Filter Pills for Today */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-[#8D6E63] font-semibold flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                فیلتر:
              </span>
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                  roleFilter === 'all'
                    ? 'bg-[#3E2723] text-white'
                    : 'bg-white text-[#6F5A52] border border-[#E6DFD5] hover:bg-[#F5F2EC]'
                }`}
              >
                همه ({toPersianDigits(todayTasks.length)})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('dishwasher')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                  roleFilter === 'dishwasher'
                    ? 'bg-[#3E2723] text-white'
                    : 'bg-white text-[#6F5A52] border border-[#E6DFD5] hover:bg-[#F5F2EC]'
                }`}
              >
                ظرفشور ({toPersianDigits(todayTasks.filter(t => t.role === 'dishwasher' || t.role === 'both').length)})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('waiter')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                  roleFilter === 'waiter'
                    ? 'bg-[#3E2723] text-white'
                    : 'bg-white text-[#6F5A52] border border-[#E6DFD5] hover:bg-[#F5F2EC]'
                }`}
              >
                سالندار ({toPersianDigits(todayTasks.filter(t => t.role === 'waiter' || t.role === 'both').length)})
              </button>
            </div>

            {/* 4 Grouped Sections of Today's Tasks */}
            <TodayTasksGroupSection
              title="شروع شیفت (اول وقت)"
              subtitle="کارهای ابتدای روز کاری و آماده‌سازی"
              icon={Sun}
              iconBg="bg-[#FFF3E0] text-[#E65100]"
              tasks={filteredTodayTasks.filter((t) => t.taskType === 'shift_start')}
              todayStr={todayStr}
              completions={completions}
              onToggle={handleToggle}
              getRoleBadge={getRoleBadge}
              onEdit={(task) => {
                setTaskToEdit(task);
                setIsTaskModalOpen(true);
              }}
            />

            <TodayTasksGroupSection
              title="پایان شیفت (بستن کافه)"
              subtitle="نظافت نهایی، تحویل و شستشوی ابزارها"
              icon={Moon}
              iconBg="bg-[#EDE7F6] text-[#5E35B1]"
              tasks={filteredTodayTasks.filter((t) => t.taskType === 'shift_end')}
              todayStr={todayStr}
              completions={completions}
              onToggle={handleToggle}
              getRoleBadge={getRoleBadge}
              onEdit={(task) => {
                setTaskToEdit(task);
                setIsTaskModalOpen(true);
              }}
            />

            <TodayTasksGroupSection
              title="کارهای هفتگی امروز"
              subtitle={`برنامه‌ریزی شده برای روزهای ${todayWeekday}`}
              icon={Repeat}
              iconBg="bg-[#E0F2FE] text-[#0369A1]"
              tasks={filteredTodayTasks.filter((t) => t.taskType === 'recurring_weekly')}
              todayStr={todayStr}
              completions={completions}
              onToggle={handleToggle}
              getRoleBadge={getRoleBadge}
              onEdit={(task) => {
                setTaskToEdit(task);
                setIsTaskModalOpen(true);
              }}
            />

            <TodayTasksGroupSection
              title="کارهای یکباره امروز"
              subtitle={`زمان‌بندی شده برای تاریخ ${toPersianDigits(todayStr)}`}
              icon={Bookmark}
              iconBg="bg-[#FCE4EC] text-[#C2185B]"
              tasks={filteredTodayTasks.filter((t) => t.taskType === 'one_time')}
              todayStr={todayStr}
              completions={completions}
              onToggle={handleToggle}
              getRoleBadge={getRoleBadge}
              onEdit={(task) => {
                setTaskToEdit(task);
                setIsTaskModalOpen(true);
              }}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: تاریخچه ۵ روز اخیر (5-DAY AUDIT & HISTORY VIEW) */}
        {/* ========================================================= */}
        {activeTab === 'history' && (
          <TaskHistorySection
            tasks={tasks}
            completions={completions}
          />
        )}

        {/* ========================================================= */}
        {/* VIEW 3: وظایف ظرفشور (DISHWASHER REFERENCE VIEW) */}
        {/* ========================================================= */}
        {activeTab === 'dishwasher' && (
          <RoleReferenceView
            roleTitle="ظرفشور"
            roleDescription="فهرست مرجع کلیه وظایف محوله به مسئول ظرفشویی و تسک‌های مشترک کافه چینو"
            icon={Utensils}
            iconBg="bg-[#FFF3E0] text-[#E65100]"
            tasks={dishwasherTasks}
            todayStr={todayStr}
            todayWeekday={todayWeekday}
            completions={completions}
            onToggle={handleToggle}
            getRoleBadge={getRoleBadge}
            onEdit={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onDownloadPdf={() => setPdfModalRole('dishwasher')}
          />
        )}

        {/* ========================================================= */}
        {/* VIEW 3: وظایف سالندار (WAITER REFERENCE VIEW) */}
        {/* ========================================================= */}
        {activeTab === 'waiter' && (
          <RoleReferenceView
            roleTitle="سالندار"
            roleDescription="فهرست مرجع کلیه وظایف محوله به سالندار و تسک‌های مشترک کافه چینو"
            icon={Coffee}
            iconBg="bg-[#E1F5FE] text-[#0288D1]"
            tasks={waiterTasks}
            todayStr={todayStr}
            todayWeekday={todayWeekday}
            completions={completions}
            onToggle={handleToggle}
            getRoleBadge={getRoleBadge}
            onEdit={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onDownloadPdf={() => setPdfModalRole('waiter')}
          />
        )}
      </main>

      {/* Task Modal for Add / Edit */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        onSaveTask={onSaveTask}
        onDeleteTask={onDeleteTask}
      />

      {/* Weekly Staff Schedule PDF Export Modal */}
      <StaffSchedulePdfModal
        isOpen={Boolean(pdfModalRole)}
        onClose={() => setPdfModalRole(null)}
        role={pdfModalRole || 'dishwasher'}
        tasks={tasks}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// HELPER: RENDER COMPLETED BY BADGE & TIME
// ─────────────────────────────────────────────────────────────
const renderCompletedInfo = (detail?: TaskCompletionDetail) => {
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
        <span>انجام توسط: {by}</span>
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
// SUB-COMPONENT: GROUP SECTION FOR TODAY'S TASKS
// ─────────────────────────────────────────────────────────────
interface TodayTasksGroupSectionProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  tasks: TaskItem[];
  todayStr: string;
  completions: TaskCompletionRecord;
  onToggle: (taskId: string) => void;
  getRoleBadge: (role: TaskRole) => React.ReactNode;
  onEdit: (task: TaskItem) => void;
}

const TodayTasksGroupSection: React.FC<TodayTasksGroupSectionProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconBg,
  tasks,
  todayStr,
  completions,
  onToggle,
  getRoleBadge,
  onEdit,
}) => {
  if (tasks.length === 0) return null;

  const completedCount = tasks.filter((t) => completions[`${t.id}_${todayStr}`]?.completed).length;

  return (
    <section className="space-y-3">
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
      <div className="space-y-2.5">
        {tasks.map((task) => {
          const key = `${task.id}_${todayStr}`;
          const compDetail = completions[key];
          const isDone = compDetail?.completed;

          return (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                isDone
                  ? 'bg-[#F9F7F5] border-[#E6DFD5] opacity-80'
                  : 'bg-white border-[#E6DFD5] hover:border-[#3E2723]/30 shadow-xs'
              }`}
            >
              {/* Checkbox and Task Title */}
              <button
                type="button"
                onClick={() => onToggle(task.id)}
                className="flex items-start gap-3.5 text-right flex-1"
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <div className="w-5 h-5 rounded-lg bg-[#3E2723] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-lg border-2 border-[#8D6E63] hover:border-[#3E2723]" />
                  )}
                </div>

                <div className="space-y-1">
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

                  {isDone && renderCompletedInfo(compDetail)}
                </div>
              </button>

              {/* Edit Button */}
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="p-1.5 text-[#8D6E63] hover:text-[#3E2723] hover:bg-[#F5F2EC] rounded-xl transition-colors shrink-0"
                title="ویرایش تسک"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENT: ROLE REFERENCE VIEW (DISHWASHER / WAITER)
// ─────────────────────────────────────────────────────────────
interface RoleReferenceViewProps {
  roleTitle: string;
  roleDescription: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  tasks: TaskItem[];
  todayStr: string;
  todayWeekday: string;
  completions: TaskCompletionRecord;
  onToggle: (taskId: string) => void;
  getRoleBadge: (role: TaskRole) => React.ReactNode;
  onEdit: (task: TaskItem) => void;
  onDownloadPdf?: () => void;
}

const RoleReferenceView: React.FC<RoleReferenceViewProps> = ({
  roleTitle,
  roleDescription,
  icon: Icon,
  iconBg,
  tasks,
  todayStr,
  todayWeekday,
  completions,
  onToggle,
  getRoleBadge,
  onEdit,
  onDownloadPdf,
}) => {
  const shiftStartTasks = tasks.filter((t) => t.taskType === 'shift_start');
  const shiftEndTasks = tasks.filter((t) => t.taskType === 'shift_end');
  const weeklyTasks = tasks.filter((t) => t.taskType === 'recurring_weekly');
  const oneTimeTasks = tasks.filter((t) => t.taskType === 'one_time');

  return (
    <div className="space-y-6">
      {/* Role Intro Banner */}
      <div className="bg-white rounded-3xl p-5 border border-[#EFEBE9] shadow-[0_4px_16px_rgba(62,39,35,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-[#201A19]">وظایف شیفت {roleTitle}</h2>
              <span className="text-[11px] bg-[#F5F2EC] text-[#5D4037] font-bold px-2.5 py-0.5 rounded-full border border-[#E6DFD5]">
                {toPersianDigits(tasks.length)} وظیفه
              </span>
            </div>
            <p className="text-xs text-[#6F5A52] leading-relaxed">
              {roleDescription}
            </p>
          </div>
        </div>

        {onDownloadPdf && (
          <button
            type="button"
            onClick={onDownloadPdf}
            className="flex items-center justify-center gap-2 bg-[#FAF8F5] hover:bg-[#3E2723] hover:text-white text-[#3E2723] font-bold text-xs px-4 py-2.5 rounded-2xl border border-[#E6DFD5] transition-all shrink-0 shadow-xs active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>دانلود PDF برنامه هفتگی</span>
          </button>
        )}
      </div>

      {/* 1. شروع شیفت */}
      <RoleTaskCategoryGroup
        categoryTitle="وظایف شروع شیفت (هر روز)"
        categoryBadge="روزانه"
        tasks={shiftStartTasks}
        todayStr={todayStr}
        todayWeekday={todayWeekday}
        completions={completions}
        onToggle={onToggle}
        getRoleBadge={getRoleBadge}
        onEdit={onEdit}
      />

      {/* 2. پایان شیفت */}
      <RoleTaskCategoryGroup
        categoryTitle="وظایف پایان شیفت و تحویل (هر روز)"
        categoryBadge="روزانه"
        tasks={shiftEndTasks}
        todayStr={todayStr}
        todayWeekday={todayWeekday}
        completions={completions}
        onToggle={onToggle}
        getRoleBadge={getRoleBadge}
        onEdit={onEdit}
      />

      {/* 3. کارهای هفتگی */}
      <RoleTaskCategoryGroup
        categoryTitle="کارهای هفتگی و دوره‌ای"
        categoryBadge="برنامه هفتگی"
        tasks={weeklyTasks}
        todayStr={todayStr}
        todayWeekday={todayWeekday}
        completions={completions}
        onToggle={onToggle}
        getRoleBadge={getRoleBadge}
        onEdit={onEdit}
      />

      {/* 4. کارهای یکباره */}
      <RoleTaskCategoryGroup
        categoryTitle="کارهای یکباره و پروژه‌ای"
        categoryBadge="تاریخ‌دار"
        tasks={oneTimeTasks}
        todayStr={todayStr}
        todayWeekday={todayWeekday}
        completions={completions}
        onToggle={onToggle}
        getRoleBadge={getRoleBadge}
        onEdit={onEdit}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENT: ROLE CATEGORY GROUP IN ROLE REFERENCE VIEW
// ─────────────────────────────────────────────────────────────
interface RoleTaskCategoryGroupProps {
  categoryTitle: string;
  categoryBadge: string;
  tasks: TaskItem[];
  todayStr: string;
  todayWeekday: string;
  completions: TaskCompletionRecord;
  onToggle: (taskId: string) => void;
  getRoleBadge: (role: TaskRole) => React.ReactNode;
  onEdit: (task: TaskItem) => void;
}

const RoleTaskCategoryGroup: React.FC<RoleTaskCategoryGroupProps> = ({
  categoryTitle,
  categoryBadge,
  tasks,
  todayStr,
  todayWeekday,
  completions,
  onToggle,
  getRoleBadge,
  onEdit,
}) => {
  if (tasks.length === 0) return null;

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-extrabold text-sm text-[#201A19]">{categoryTitle}</h3>
        <span className="text-[10px] font-bold bg-[#F5F2EC] text-[#6F5A52] px-2 py-0.5 rounded-full border border-[#E6DFD5]">
          {categoryBadge} ({toPersianDigits(tasks.length)})
        </span>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => {
          const appliesToday = doesTaskApplyToday(task, todayStr, todayWeekday);
          const key = `${task.id}_${todayStr}`;
          const compDetail = completions[key];
          const isDoneToday = compDetail?.completed;

          return (
            <div
              key={task.id}
              className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                appliesToday
                  ? isDoneToday
                    ? 'bg-[#F9F7F5] border-[#E6DFD5] opacity-80'
                    : 'bg-white border-[#E6DFD5] shadow-xs hover:border-[#3E2723]/30'
                  : 'bg-white/70 border-[#EFEBE9]'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                {/* Interactive Checkbox if applies today, otherwise schedule icon */}
                {appliesToday ? (
                  <button
                    type="button"
                    onClick={() => onToggle(task.id)}
                    className="mt-0.5 shrink-0"
                  >
                    {isDoneToday ? (
                      <div className="w-5 h-5 rounded-lg bg-[#3E2723] text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-lg border-2 border-[#8D6E63] hover:border-[#3E2723]" />
                    )}
                  </button>
                ) : (
                  <div className="mt-0.5 w-5 h-5 rounded-lg bg-[#F5F2EC] border border-[#E6DFD5] flex items-center justify-center shrink-0 text-[#8D6E63]">
                    <Clock className="w-3 h-3" />
                  </div>
                )}

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs sm:text-sm font-bold block ${
                      appliesToday && isDoneToday ? 'line-through text-[#8D6E63]' : 'text-[#201A19]'
                    }`}>
                      {task.title}
                    </span>
                    {getRoleBadge(task.role)}

                    {/* Applies Today pill */}
                    {appliesToday && (
                      <span className="text-[10px] bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] font-bold px-2 py-0.2 rounded-full">
                        امروز فعال
                      </span>
                    )}
                  </div>

                  {/* Schedule Details if Weekly or One-time */}
                  {task.taskType === 'recurring_weekly' && task.weekdays && (
                    <div className="flex items-center gap-1 text-[11px] text-[#6F5A52]">
                      <Repeat className="w-3 h-3 text-[#8D6E63]" />
                      <span>روزهای اجرا: {task.weekdays.join('، ')}</span>
                    </div>
                  )}

                  {task.taskType === 'one_time' && task.fixedDate && (
                    <div className="flex items-center gap-1 text-[11px] text-[#6F5A52]">
                      <CalendarIcon className="w-3 h-3 text-[#8D6E63]" />
                      <span>تاریخ اجرا: {toPersianDigits(task.fixedDate)}</span>
                    </div>
                  )}

                  {task.notes && (
                    <p className="text-[11px] text-[#8D6E63] leading-relaxed">
                      {task.notes}
                    </p>
                  )}

                  {appliesToday && isDoneToday && renderCompletedInfo(compDetail)}
                </div>
              </div>

              {/* Edit button */}
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="p-1.5 text-[#8D6E63] hover:text-[#3E2723] hover:bg-[#F5F2EC] rounded-xl transition-colors shrink-0"
                title="ویرایش تسک"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
