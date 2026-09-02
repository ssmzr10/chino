import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Calendar, 
  Clock, 
  Check, 
  Sparkles, 
  Utensils, 
  Coffee, 
  Sun, 
  Moon, 
  Repeat, 
  Users, 
  CalendarDays,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TaskItem, TaskRole, AuthRole } from '../types';
import { 
  getTodayJalaliDate, 
  toPersianDigits, 
  formatTimePersian, 
  PERSIAN_WEEKDAYS_FULL,
  normalizePersianWeekday
} from '../utils/persianDate';
import { exportReportToPdf } from '../utils/pdfExport';

interface StaffSchedulePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'dishwasher' | 'waiter' | 'waiter1' | 'waiter2' | 'waiter3';
  tasks: TaskItem[];
}

export const StaffSchedulePdfModal: React.FC<StaffSchedulePdfModalProps> = ({
  isOpen,
  onClose,
  role,
  tasks,
}) => {
  const visibleReportRef = useRef<HTMLDivElement>(null);
  const pdfExportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');

  const todayInfo = getTodayJalaliDate();
  const timeNow = formatTimePersian();

  if (!isOpen) return null;

  const isWaiter = role === 'waiter' || role === 'waiter1' || role === 'waiter2' || role === 'waiter3';
  const roleName = isWaiter ? 'سالنداری و پذیرایی' : 'ظرفشویی و نظافت';
  const roleShortTitle = isWaiter ? 'سالندار' : 'ظرفشور';

  // Filter tasks belonging to this role or shared ('both')
  const myRoleTasks = tasks.filter((t) => {
    if (!isWaiter) {
      return t.role === 'dishwasher' || t.role === 'both';
    }
    return t.role === 'waiter' || t.role === 'both';
  });

  const shiftStartTasks = myRoleTasks.filter((t) => t.taskType === 'shift_start');
  const shiftEndTasks = myRoleTasks.filter((t) => t.taskType === 'shift_end');
  const recurringTasks = myRoleTasks.filter((t) => t.taskType === 'recurring_weekly');
  const oneTimeTasks = myRoleTasks.filter((t) => t.taskType === 'one_time');

  const handleDownloadPDF = async () => {
    if (!pdfExportRef.current || isExporting) return;

    try {
      setIsExporting(true);
      const filename = `برنامه-هفتگی-${roleShortTitle}-کافه-چینو-${todayInfo.standardString.replace(/\//g, '-')}.pdf`;

      const success = await exportReportToPdf({
        element: pdfExportRef.current,
        filename,
        onProgress: (status) => setExportProgress(status),
      });

      if (success) {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#3E2723', '#8D6E63', '#4CAF50', '#0288D1'],
          });
        } catch {}
      }
    } catch (err) {
      console.error('Failed to generate staff schedule PDF:', err);
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#201A19]/70 backdrop-blur-sm flex flex-col items-center justify-start overflow-y-auto p-2 sm:p-4 animate-fadeIn" dir="rtl">
      {/* Top Floating Control Bar */}
      <div className="no-print sticky top-2 z-20 w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-[#E6DFD5] shadow-lg flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3E2723] text-white flex items-center justify-center">
            {isWaiter ? <Coffee className="w-5 h-5 text-[#FADCD2]" /> : <Utensils className="w-5 h-5 text-[#FADCD2]" />}
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-[#201A19]">
              برنامه هفتگی {roleShortTitle}
            </h2>
            <p className="text-[11px] text-[#8D6E63] font-medium">
              پیش‌نمایش سند رسمی و دانلود نسخه چاپی A4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNativePrint}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#FAF8F5] hover:bg-[#F5F2EC] text-[#5D4037] text-xs font-bold rounded-xl border border-[#E6DFD5] transition-colors"
            title="چاپ مستقیم با مرورگر"
          >
            <Printer className="w-4 h-4" />
            <span>پرینت</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#3E2723] hover:bg-[#201A19] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[#FADCD2]" />
            <span>{isExporting ? (exportProgress || 'در حال تولید...') : 'دانلود PDF'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#8D6E63] hover:text-[#201A19] hover:bg-[#F5F2EC] rounded-xl transition-colors"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. VISIBLE ON-SCREEN PREVIEW (Styled for modern responsive viewing)       */}
      {/* ========================================================================= */}
      <div 
        ref={visibleReportRef}
        className="print-content w-full max-w-4xl bg-white rounded-3xl p-4 sm:p-8 border border-[#E6DFD5] shadow-xl space-y-6 mb-20"
      >
        {/* Document Header */}
        <div className="border-b-2 border-[#3E2723] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3E2723] text-white flex items-center justify-center shadow-xs">
              {isWaiter ? <Coffee className="w-6 h-6 text-[#FADCD2]" /> : <Utensils className="w-6 h-6 text-[#FADCD2]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#201A19]">کافه چینو</h1>
                <span className="text-[11px] bg-[#F5F2EC] text-[#5D4037] font-bold px-2.5 py-0.5 rounded-full border border-[#E6DFD5]">
                  شیفت {roleShortTitle}
                </span>
              </div>
              <p className="text-xs text-[#8D6E63] font-medium mt-0.5">
                برنامه جامع هفتگی، روتین شروع و پایان شیفت و چک‌لیست وظایف
              </p>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E6DFD5] text-right sm:text-left space-y-1 self-start sm:self-auto">
            <div className="text-xs font-extrabold text-[#201A19] flex items-center gap-1.5 sm:justify-end">
              <Calendar className="w-3.5 h-3.5 text-[#8D6E63]" />
              <span>{todayInfo.formattedPersian}</span>
            </div>
            <div className="text-[11px] text-[#8D6E63] font-medium flex items-center gap-1.5 sm:justify-end">
              <Clock className="w-3.5 h-3.5 text-[#8D6E63]" />
              <span>ساعت صدور: {timeNow}</span>
            </div>
          </div>
        </div>

        {/* Summary Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E6DFD5] text-center">
            <span className="text-[11px] text-[#8D6E63] font-semibold block">کل وظایف شیفت</span>
            <span className="text-lg font-black text-[#201A19] mt-0.5 block">{toPersianDigits(myRoleTasks.length)} تسک</span>
          </div>
          <div className="bg-[#FFF8F0] p-3 rounded-2xl border border-[#FFE0B2] text-center">
            <span className="text-[11px] text-[#E65100] font-semibold block">شروع شیفت روزانه</span>
            <span className="text-lg font-black text-[#E65100] mt-0.5 block">{toPersianDigits(shiftStartTasks.length)} کار</span>
          </div>
          <div className="bg-[#F5F0FA] p-3 rounded-2xl border border-[#D1C4E9] text-center">
            <span className="text-[11px] text-[#5E35B1] font-semibold block">پایان شیفت روزانه</span>
            <span className="text-lg font-black text-[#5E35B1] mt-0.5 block">{toPersianDigits(shiftEndTasks.length)} کار</span>
          </div>
          <div className="bg-[#EBF7FC] p-3 rounded-2xl border border-[#B3E5FC] text-center">
            <span className="text-[11px] text-[#0288D1] font-semibold block">وظایف دوره‌ای هفته</span>
            <span className="text-lg font-black text-[#0288D1] mt-0.5 block">{toPersianDigits(recurringTasks.length)} مورد</span>
          </div>
        </div>

        {/* Section 1: Daily Shift Start */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EFEBE9]">
            <div className="w-7 h-7 rounded-lg bg-[#FFF3E0] text-[#E65100] flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#201A19]">
                ۱. روتین روزانه شروع شیفت (کارهای ثابت هر روز قبل از شروع سرویس)
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {shiftStartTasks.map((t) => (
              <div key={t.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6DFD5] flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-extrabold text-[#201A19]">{t.title}</span>
                    {t.role === 'both' && (
                      <span className="text-[10px] bg-[#EFEBE9] text-[#5D4037] font-bold px-1.5 py-0.2 rounded border border-[#D7CCC8]">
                        مشترک
                      </span>
                    )}
                  </div>
                  {t.notes && <p className="text-[11px] text-[#6F5A52] leading-snug">{t.notes}</p>}
                </div>
                <div className="w-4 h-4 rounded border-2 border-[#8D6E63] shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Daily Shift End */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EFEBE9]">
            <div className="w-7 h-7 rounded-lg bg-[#EDE7F6] text-[#5E35B1] flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#201A19]">
                ۲. روتین روزانه پایان شیفت (کارهای ثابت هر روز در پایان کار و نظافت نهایی)
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {shiftEndTasks.map((t) => (
              <div key={t.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6DFD5] flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-extrabold text-[#201A19]">{t.title}</span>
                    {t.role === 'both' && (
                      <span className="text-[10px] bg-[#EFEBE9] text-[#5D4037] font-bold px-1.5 py-0.2 rounded border border-[#D7CCC8]">
                        مشترک
                      </span>
                    )}
                  </div>
                  {t.notes && <p className="text-[11px] text-[#6F5A52] leading-snug">{t.notes}</p>}
                </div>
                <div className="w-4 h-4 rounded border-2 border-[#8D6E63] shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Weekly Recurring per Day */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EFEBE9]">
            <div className="w-7 h-7 rounded-lg bg-[#E0F2FE] text-[#0288D1] flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#201A19]">
                ۳. جدول تفکیکی وظایف هفتگی (شنبه تا جمعه)
              </h3>
            </div>
          </div>

          <div className="space-y-2.5">
            {PERSIAN_WEEKDAYS_FULL.map((weekdayName) => {
              const dayTasks = recurringTasks.filter((t) =>
                t.weekdays?.some((d) => normalizePersianWeekday(d) === normalizePersianWeekday(weekdayName))
              );

              return (
                <div key={weekdayName} className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E6DFD5] space-y-2">
                  <div className="flex items-center justify-between border-b border-[#EFEBE9] pb-1.5">
                    <span className="font-extrabold text-xs sm:text-sm text-[#201A19]">{weekdayName}</span>
                    <span className="text-[11px] text-[#8D6E63] font-bold">
                      {dayTasks.length > 0 ? `${toPersianDigits(dayTasks.length)} تسک دوره‌ای` : 'بدون تسک دوره‌ای'}
                    </span>
                  </div>

                  {dayTasks.length === 0 ? (
                    <p className="text-[11px] text-[#A1887F] italic pr-1">تسک هفتگی خاصی در این روز ثبت نشده است.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dayTasks.map((t) => (
                        <div key={t.id} className="p-2.5 bg-white rounded-xl border border-[#E6DFD5] flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-[#201A19]">{t.title}</span>
                              {t.role === 'both' && (
                                <span className="text-[10px] bg-[#EFEBE9] text-[#5D4037] font-semibold px-1.5 py-0.2 rounded">
                                  مشترک
                                </span>
                              )}
                            </div>
                            {t.notes && <p className="text-[10.5px] text-[#6F5A52] leading-snug">{t.notes}</p>}
                          </div>
                          <div className="w-4 h-4 rounded border-2 border-[#8D6E63] shrink-0 mt-0.5" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: One-time tasks if any */}
        {oneTimeTasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#EFEBE9]">
              <div className="w-7 h-7 rounded-lg bg-[#FCE4EC] text-[#C2185B] flex items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#201A19]">
                ۴. وظایف موردی و تقویمی ثبت‌شده
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {oneTimeTasks.map((t) => (
                <div key={t.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6DFD5] flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-[#201A19] block">{t.title}</span>
                    {t.fixedDate && (
                      <span className="text-[10px] text-[#8D6E63] font-semibold block">
                        تاریخ: {toPersianDigits(t.fixedDate)}
                      </span>
                    )}
                    {t.notes && <p className="text-[11px] text-[#6F5A52]">{t.notes}</p>}
                  </div>
                  <div className="w-4 h-4 rounded border-2 border-[#8D6E63] shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="pt-6 border-t border-[#EFEBE9] flex justify-between gap-8 text-center">
          <div className="flex-1 space-y-6">
            <span className="text-xs font-bold text-[#201A19] block">امضای پرسنل شیفت ({roleShortTitle})</span>
            <div className="w-36 mx-auto border-b-2 border-dashed border-[#8D6E63]" />
          </div>
          <div className="flex-1 space-y-6">
            <span className="text-xs font-bold text-[#201A19] block">تایید مدیریت کافه چینو</span>
            <div className="w-36 mx-auto border-b-2 border-dashed border-[#8D6E63]" />
          </div>
        </div>

        <div className="text-center text-[10px] text-[#A1887F] pt-3 border-t border-[#F5F2EC]">
          این سند توسط سامانه مدیریت کافه چینو در تاریخ {todayInfo.fullDate} ساعت {timeNow} صادر گردیده است.
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DEDICATED OFF-SCREEN PDF EXPORT CONTAINER (Deterministic 800px Layout) */}
      {/* ========================================================================= */}
      <div 
        ref={pdfExportRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: '-9999px',
          width: '800px',
          minWidth: '800px',
          maxWidth: '800px',
          backgroundColor: '#ffffff',
          color: '#201A19',
          padding: '24px 30px',
          direction: 'rtl',
          textAlign: 'right',
          fontFamily: "'Vazirmatn', sans-serif",
          zIndex: -9999,
          boxSizing: 'border-box',
          opacity: 1,
          pointerEvents: 'none',
        }}
      >
        {/* PDF Header Table */}
        <table style={{ width: '100%', borderBottom: '2px solid #3E2723', paddingBottom: '14px', marginBottom: '16px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'middle', width: '60%' }}>
                <table style={{ borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: 'middle', paddingLeft: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#3E2723', color: '#FADCD2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {isWaiter ? <Coffee style={{ width: '24px', height: '24px' }} /> : <Utensils style={{ width: '24px', height: '24px' }} />}
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div style={{ fontSize: '22px', fontWeight: '900', color: '#201A19', lineHeight: '1.1' }}>
                          کافه چینو
                        </div>
                        <div style={{ fontSize: '12px', color: '#8D6E63', fontWeight: '700', marginTop: '4px' }}>
                          برنامه جامع هفتگی و شیفت کاری • {roleName}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>

              <td style={{ verticalAlign: 'middle', textAlign: 'left', width: '40%' }}>
                <div style={{ display: 'inline-block', backgroundColor: '#F5F2EC', border: '1px solid #E6DFD5', borderRadius: '10px', padding: '6px 14px', fontSize: '12px', fontWeight: '800', color: '#201A19' }}>
                  <span>{todayInfo.formattedPersian}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#8D6E63', marginTop: '4px', fontWeight: '600' }} dir="ltr">
                  <span>ساعت {timeNow} • شیفت {roleShortTitle}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Summary Table 4 Columns */}
        <table style={{ width: '100%', marginBottom: '16px', borderCollapse: 'separate', borderSpacing: '8px 0' }}>
          <tbody>
            <tr>
              <td style={{ width: '25%', backgroundColor: '#FAF8F5', border: '1px solid #E6DFD5', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '10.5px', color: '#8D6E63', fontWeight: '700' }}>کل وظایف شیفت</div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#201A19', marginTop: '2px' }}>{toPersianDigits(myRoleTasks.length)} تسک</div>
              </td>
              <td style={{ width: '25%', backgroundColor: '#FFF8F0', border: '1px solid #FFE0B2', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '10.5px', color: '#E65100', fontWeight: '700' }}>شروع شیفت روزانه</div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#E65100', marginTop: '2px' }}>{toPersianDigits(shiftStartTasks.length)} کار</div>
              </td>
              <td style={{ width: '25%', backgroundColor: '#F5F0FA', border: '1px solid #D1C4E9', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '10.5px', color: '#5E35B1', fontWeight: '700' }}>پایان شیفت روزانه</div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#5E35B1', marginTop: '2px' }}>{toPersianDigits(shiftEndTasks.length)} کار</div>
              </td>
              <td style={{ width: '25%', backgroundColor: '#EBF7FC', border: '1px solid #B3E5FC', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '10.5px', color: '#0288D1', fontWeight: '700' }}>وظایف دوره‌ای هفته</div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#0288D1', marginTop: '2px' }}>{toPersianDigits(recurringTasks.length)} مورد</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 1. Daily Shift Start Routine */}
        <div style={{ backgroundColor: '#FAF8F5', border: '1px solid #EAE3DC', borderRadius: '12px', padding: '12px 14px', marginBottom: '14px', boxSizing: 'border-box' }}>
          <div style={{ borderBottom: '1px solid #E2D9D0', paddingBottom: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '900', color: '#201A19', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ backgroundColor: '#FFF3E0', color: '#E65100', padding: '3px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>بخش ۱</span>
            <span>روتین روزانه شروع شیفت (کارهای ثابت هر روز قبل از شروع سرویس)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '350px 350px', columnGap: '12px', rowGap: '6px', boxSizing: 'border-box' }}>
            {shiftStartTasks.map((t) => (
              <div
                key={`pdf-start-${t.id}`}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E0D7CE',
                  borderRadius: '8px',
                  padding: '7px 9px',
                  display: 'grid',
                  gridTemplateColumns: '305px 25px',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#201A19', lineHeight: '1.3', wordBreak: 'break-word' }}>
                    {t.title}
                    {t.role === 'both' && (
                      <span style={{ marginRight: '6px', fontSize: '9px', backgroundColor: '#EFEBE9', color: '#5D4037', padding: '1px 5px', borderRadius: '4px', border: '1px solid #D7CCC8' }}>
                        مشترک
                      </span>
                    )}
                  </div>
                  {t.notes && (
                    <div style={{ fontSize: '9.5px', color: '#6F5A52', marginTop: '2px', lineHeight: '1.2', wordBreak: 'break-word' }}>
                      {t.notes}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'left', display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ width: '14px', height: '14px', border: '1.5px solid #8D6E63', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Daily Shift End Routine */}
        <div style={{ backgroundColor: '#FAF8F5', border: '1px solid #EAE3DC', borderRadius: '12px', padding: '12px 14px', marginBottom: '14px', boxSizing: 'border-box' }}>
          <div style={{ borderBottom: '1px solid #E2D9D0', paddingBottom: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '900', color: '#201A19', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ backgroundColor: '#EDE7F6', color: '#5E35B1', padding: '3px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>بخش ۲</span>
            <span>روتین روزانه پایان شیفت (کارهای ثابت هر روز در پایان کار و نظافت نهایی)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '350px 350px', columnGap: '12px', rowGap: '6px', boxSizing: 'border-box' }}>
            {shiftEndTasks.map((t) => (
              <div
                key={`pdf-end-${t.id}`}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E0D7CE',
                  borderRadius: '8px',
                  padding: '7px 9px',
                  display: 'grid',
                  gridTemplateColumns: '305px 25px',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#201A19', lineHeight: '1.3', wordBreak: 'break-word' }}>
                    {t.title}
                    {t.role === 'both' && (
                      <span style={{ marginRight: '6px', fontSize: '9px', backgroundColor: '#EFEBE9', color: '#5D4037', padding: '1px 5px', borderRadius: '4px', border: '1px solid #D7CCC8' }}>
                        مشترک
                      </span>
                    )}
                  </div>
                  {t.notes && (
                    <div style={{ fontSize: '9.5px', color: '#6F5A52', marginTop: '2px', lineHeight: '1.2', wordBreak: 'break-word' }}>
                      {t.notes}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'left', display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ width: '14px', height: '14px', border: '1.5px solid #8D6E63', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Weekly Schedule per Day (شنبه تا جمعه) */}
        <div style={{ backgroundColor: '#FAF8F5', border: '1px solid #EAE3DC', borderRadius: '12px', padding: '12px 14px', marginBottom: '14px', boxSizing: 'border-box' }}>
          <div style={{ borderBottom: '1px solid #E2D9D0', paddingBottom: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '900', color: '#201A19', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ backgroundColor: '#E0F2FE', color: '#0288D1', padding: '3px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>بخش ۳</span>
            <span>جدول تفکیکی وظایف هفتگی (شنبه تا جمعه)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {PERSIAN_WEEKDAYS_FULL.map((weekdayName) => {
              const dayTasks = recurringTasks.filter((t) =>
                t.weekdays?.some((d) => normalizePersianWeekday(d) === normalizePersianWeekday(weekdayName))
              );

              return (
                <div
                  key={`pdf-day-${weekdayName}`}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E0D7CE',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0EAE1', paddingBottom: '4px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '900', color: '#201A19' }}>
                      {weekdayName}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#8D6E63' }}>
                      {dayTasks.length > 0 ? `${toPersianDigits(dayTasks.length)} تسک دوره‌ای` : 'بدون تسک دوره‌ای'}
                    </span>
                  </div>

                  {dayTasks.length === 0 ? (
                    <div style={{ fontSize: '10px', color: '#A1887F', fontStyle: 'italic', paddingRight: '4px' }}>
                      تسک هفتگی خاصی در این روز تعریف نشده است.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '340px 340px', columnGap: '12px', rowGap: '4px' }}>
                      {dayTasks.map((t) => (
                        <div
                          key={`pdf-rectask-${t.id}`}
                          style={{
                            backgroundColor: '#FAF8F5',
                            border: '1px solid #EAE3DC',
                            borderRadius: '6px',
                            padding: '5px 8px',
                            display: 'grid',
                            gridTemplateColumns: '300px 20px',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#201A19', lineHeight: '1.2', wordBreak: 'break-word' }}>
                              {t.title}
                              {t.role === 'both' && (
                                <span style={{ marginRight: '4px', fontSize: '8.5px', backgroundColor: '#EFEBE9', color: '#5D4037', padding: '1px 4px', borderRadius: '3px' }}>
                                  مشترک
                                </span>
                              )}
                            </div>
                            {t.notes && (
                              <div style={{ fontSize: '9px', color: '#6F5A52', marginTop: '1px', lineHeight: '1.1', wordBreak: 'break-word' }}>
                                {t.notes}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'left', display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ width: '12px', height: '12px', border: '1.5px solid #8D6E63', borderRadius: '3px' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Signatures Row */}
        <table style={{ width: '100%', marginTop: '20px', borderTop: '1px solid #EFEBE9', paddingTop: '14px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', textAlign: 'center', padding: '10px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#201A19', marginBottom: '22px' }}>
                  امضای پرسنل شیفت ({roleShortTitle})
                </div>
                <div style={{ width: '140px', margin: '0 auto', borderBottom: '2px dashed #8D6E63' }} />
              </td>

              <td style={{ width: '50%', textAlign: 'center', padding: '10px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#201A19', marginBottom: '22px' }}>
                  تایید نهایی مدیریت کافه چینو
                </div>
                <div style={{ width: '140px', margin: '0 auto', borderBottom: '2px dashed #8D6E63' }} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer info line */}
        <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '9.5px', color: '#8D6E63', borderTop: '1px solid #F0EAE1', paddingTop: '6px' }}>
          این سند توسط سامانه رسمی مدیریت کافه چینو در تاریخ {todayInfo.fullDate} ساعت {timeNow} صادر گردیده است.
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div 
        className="no-print fixed bottom-0 left-0 right-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#EFEBE9] px-4 py-3 flex items-center justify-center gap-3"
        dir="rtl"
      >
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className="w-full max-w-sm h-12 bg-[#3E2723] hover:bg-[#201A19] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(62,39,35,0.2)] transition-all disabled:opacity-50"
        >
          <Download className="w-5 h-5 text-[#FADCD2]" />
          <span>{isExporting ? (exportProgress || 'در حال تولید سند PDF...') : `دانلود فایل PDF برنامه هفتگی ${roleShortTitle}`}</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="px-5 h-12 bg-[#F5F2EC] hover:bg-[#EAE4DC] text-[#6F5A52] text-xs font-bold rounded-2xl border border-[#E6DFD5] transition-colors"
        >
          بستن
        </button>
      </div>
    </div>
  );
};
