import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  X, 
  Trash2, 
  AlertTriangle,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Users,
  Utensils,
  Coffee,
  Check
} from 'lucide-react';
import { TaskItem, TaskRole, TaskType } from '../types';
import { 
  PERSIAN_WEEKDAYS_FULL, 
  PERSIAN_MONTH_NAMES,
  getTodayJalaliDate, 
  toPersianDigits 
} from '../utils/persianDate';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: TaskItem | null;
  onSaveTask: (taskData: {
    id?: string;
    title: string;
    notes?: string;
    taskType: TaskType;
    role: TaskRole;
    weekdays?: string[];
    fixedDate?: string;
  }) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  onSaveTask,
  onDeleteTask,
}) => {
  const todayInfo = getTodayJalaliDate();
  const todayStr = todayInfo.standardString;

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [role, setRole] = useState<TaskRole>('both');
  const [taskType, setTaskType] = useState<TaskType>('shift_start');
  const [weekdays, setWeekdays] = useState<string[]>(['شنبه', 'دوشنبه', 'چهارشنبه']);
  const [fixedDate, setFixedDate] = useState(todayStr);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setNotes(taskToEdit.notes || '');
      setRole(taskToEdit.role || 'both');
      setTaskType(taskToEdit.taskType || 'shift_start');
      setWeekdays(taskToEdit.weekdays || ['شنبه', 'دوشنبه', 'چهارشنبه']);
      setFixedDate(taskToEdit.fixedDate || todayStr);
    } else {
      setTitle('');
      setNotes('');
      setRole('both');
      setTaskType('shift_start');
      setWeekdays(['شنبه', 'دوشنبه', 'چهارشنبه']);
      setFixedDate(todayStr);
    }
    setShowDeleteConfirm(false);
  }, [taskToEdit, todayStr, isOpen]);

  if (!isOpen) return null;

  const toggleWeekday = (dayName: string) => {
    setWeekdays((prev) =>
      prev.includes(dayName)
        ? prev.filter((d) => d !== dayName)
        : [...prev, dayName]
    );
  };

  const handleSelectAllWeekdays = () => {
    if (weekdays.length === PERSIAN_WEEKDAYS_FULL.length) {
      setWeekdays([]);
    } else {
      setWeekdays([...PERSIAN_WEEKDAYS_FULL]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveTask({
      id: taskToEdit?.id,
      title: title.trim(),
      notes: notes.trim() || undefined,
      role,
      taskType,
      weekdays: taskType === 'recurring_weekly' ? weekdays : undefined,
      fixedDate: taskType === 'one_time' ? fixedDate : undefined,
    });

    onClose();
  };

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
              {taskToEdit ? 'ویرایش تسک' : 'افزودن تسک جدید'}
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
          {/* Title Field */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#5D4037]">
              عنوان تسک <span className="text-[#BA1A1A]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلا: شستشو و جرم‌گیری ماشین ظرفشویی"
              className="w-full bg-[#F5F2EC] border border-[#E6DFD5] focus:border-[#3E2723] focus:bg-white rounded-2xl px-4 py-3 text-sm text-[#201A19] transition-all placeholder:text-[#A1887F] outline-none"
            />
          </div>

          {/* Role (مسئول انجام / نقش) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#5D4037]">
              مسئول انجام (نقش)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('dishwasher')}
                className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center gap-1.5 text-center ${
                  role === 'dishwasher'
                    ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-xs'
                    : 'bg-white text-[#6F5A52] border-[#E6DFD5] hover:bg-[#F5F2EC]'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>ظرفشور</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('waiter')}
                className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center gap-1.5 text-center ${
                  role === 'waiter'
                    ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-xs'
                    : 'bg-white text-[#6F5A52] border-[#E6DFD5] hover:bg-[#F5F2EC]'
                }`}
              >
                <Coffee className="w-4 h-4" />
                <span>سالندار</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('both')}
                className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center gap-1.5 text-center ${
                  role === 'both'
                    ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-xs'
                    : 'bg-white text-[#6F5A52] border-[#E6DFD5] hover:bg-[#F5F2EC]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>هر دو (مشترک)</span>
              </button>
            </div>
          </div>

          {/* Task Type (نوع تسک) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#5D4037]">
              نوع و زمان‌بندی تسک
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTaskType('shift_start')}
                className={`p-3 rounded-2xl text-right border transition-all ${
                  taskType === 'shift_start'
                    ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-xs'
                    : 'bg-white text-[#6F5A52] border-[#E6DFD5] hover:bg-[#F5F2EC]'
                }`}
              >
                <span className="text-sm font-bold block mb-0.5">🌅 شروع شیفت</span>
                <span className={`text-[11px] block ${taskType === 'shift_start' ? 'text-[#D7CCC8]' : 'text-[#8D6E63]'}`}>
                  روزانه در اول وقت کاری
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTaskType('shift_end')}
                className={`p-3 rounded-2xl text-right border transition-all ${
                  taskType === 'shift_end'
                    ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-xs'
                    : 'bg-white text-[#6F5A52] border-[#E6DFD5] hover:bg-[#F5F2EC]'
                }`}
              >
                <span className="text-sm font-bold block mb-0.5">🌙 پایان شیفت</span>
                <span className={`text-[11px] block ${taskType === 'shift_end' ? 'text-[#D7CCC8]' : 'text-[#8D6E63]'}`}>
                  روزانه هنگام بستن شیفت
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTaskType('recurring_weekly')}
                className={`p-3 rounded-2xl text-right border transition-all ${
                  taskType === 'recurring_weekly'
                    ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-xs'
                    : 'bg-white text-[#6F5A52] border-[#E6DFD5] hover:bg-[#F5F2EC]'
                }`}
              >
                <span className="text-sm font-bold block mb-0.5">🔄 تکرارشونده هفتگی</span>
                <span className={`text-[11px] block ${taskType === 'recurring_weekly' ? 'text-[#D7CCC8]' : 'text-[#8D6E63]'}`}>
                  در روزهای مشخص هفته
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTaskType('one_time')}
                className={`p-3 rounded-2xl text-right border transition-all ${
                  taskType === 'one_time'
                    ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-xs'
                    : 'bg-white text-[#6F5A52] border-[#E6DFD5] hover:bg-[#F5F2EC]'
                }`}
              >
                <span className="text-sm font-bold block mb-0.5">📌 یکباره (موردی)</span>
                <span className={`text-[11px] block ${taskType === 'one_time' ? 'text-[#D7CCC8]' : 'text-[#8D6E63]'}`}>
                  در یک تاریخ خاص
                </span>
              </button>
            </div>
          </div>

          {/* Conditional 1: Recurring Weekly Days Selector */}
          {taskType === 'recurring_weekly' && (
            <div className="space-y-2.5 bg-[#F5F2EC] p-4 rounded-2xl border border-[#E6DFD5] animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5D4037]">
                  انتخاب روزهای اجرای تسک:
                </span>
                <button
                  type="button"
                  onClick={handleSelectAllWeekdays}
                  className="text-[11px] text-[#3E2723] font-bold hover:underline"
                >
                  {weekdays.length === PERSIAN_WEEKDAYS_FULL.length ? 'عدم انتخاب همه' : 'انتخاب همه روزها'}
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {PERSIAN_WEEKDAYS_FULL.map((dayName) => {
                  const isSelected = weekdays.includes(dayName);
                  return (
                    <button
                      key={dayName}
                      type="button"
                      onClick={() => toggleWeekday(dayName)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all ${
                        isSelected
                          ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-xs'
                          : 'bg-white text-[#6F5A52] border-[#E6DFD5] hover:bg-[#EAE4DC]'
                      }`}
                    >
                      {dayName}
                    </button>
                  );
                })}
              </div>

              {weekdays.length === 0 && (
                <p className="text-[11px] text-[#BA1A1A] font-medium">
                  لطفا حداقل یک روز از هفته را انتخاب کنید.
                </p>
              )}
            </div>
          )}

          {/* Conditional 2: One-time Date Picker */}
          {taskType === 'one_time' && (
            <div className="space-y-2 bg-[#F5F2EC] p-4 rounded-2xl border border-[#E6DFD5] animate-fadeIn">
              <label className="block text-xs font-semibold text-[#5D4037] flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-[#8D6E63]" />
                <span>تاریخ اجرای تسک (شمسی):</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={fixedDate}
                  onChange={(e) => setFixedDate(e.target.value)}
                  placeholder="مثلا: 1405/06/11"
                  className="flex-1 bg-white border border-[#E6DFD5] focus:border-[#3E2723] rounded-xl px-3 py-2 text-xs text-[#201A19] outline-none"
                />

                <button
                  type="button"
                  onClick={() => setFixedDate(todayStr)}
                  className="px-3 py-2 bg-white hover:bg-[#FAF8F5] text-[#3E2723] border border-[#E6DFD5] rounded-xl text-xs font-bold transition-colors shrink-0"
                >
                  امروز
                </button>
              </div>
              <p className="text-[11px] text-[#8D6E63]">
                این تسک تنها در این تاریخ فعال خواهد شد و پس از انجام بایگانی می‌شود.
              </p>
            </div>
          )}

          {/* Notes / Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5D4037]">
              نکات و توضیحات تکمیلی (اختیاری)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="نحوه انجام کار یا استانداردهای بهداشتی مورد نظر..."
              className="w-full bg-[#F5F2EC] border border-[#E6DFD5] focus:border-[#3E2723] focus:bg-white rounded-2xl px-4 py-3 text-xs text-[#201A19] transition-all placeholder:text-[#A1887F] outline-none resize-none"
            />
          </div>

          {/* Delete section if editing */}
          {taskToEdit && onDeleteTask && (
            <div className="pt-2 border-t border-[#EFEBE9]">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 text-xs text-[#BA1A1A] hover:bg-[#FFDAD6]/40 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف این تسک
                </button>
              ) : (
                <div className="bg-[#FFDAD6]/30 border border-[#FFDAD6] p-3.5 rounded-2xl text-center space-y-2">
                  <p className="text-xs text-[#93000A] font-medium flex items-center justify-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    آیا از حذف تسک «{taskToEdit.title}» مطمئن هستید؟
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteTask(taskToEdit.id);
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
              ذخیره تسک
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
