import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Calendar, 
  FileText, 
  UtensilsCrossed, 
  PackageOpen, 
  Coffee, 
  AlertTriangle,
  Check,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Category, RequirementItem } from '../types';
import { getTodayJalaliDate, toPersianDigits, formatTimePersian } from '../utils/persianDate';
import { exportReportToPdf } from '../utils/pdfExport';

interface ReportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  requirements: RequirementItem[];
  onClearShiftRequirements: () => void;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  isOpen,
  onClose,
  categories,
  requirements,
  onClearShiftRequirements,
}) => {
  const visibleReportRef = useRef<HTMLDivElement>(null);
  const pdfExportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const todayInfo = getTodayJalaliDate();
  const timeNow = formatTimePersian();

  if (!isOpen) return null;

  // Calculate counts for quick review
  let totalItems = 0;
  let outOfStockCount = 0;
  let inStockCount = 0;

  categories.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      sub.items.forEach((item) => {
        totalItems++;
        if (item.type === 'numeric') {
          const val = Number(item.value) || 0;
          if (val === 0) outOfStockCount++;
          else inStockCount++;
        } else if (item.type === 'level') {
          if (item.value === 'empty') outOfStockCount++;
          else inStockCount++;
        } else if (item.type === 'boolean') {
          if (!item.value) outOfStockCount++;
          else inStockCount++;
        }
      });
    });
  });

  const getCategoryIcon = (id: string) => {
    if (id === 'kitchen') return <UtensilsCrossed className="w-4 h-4 text-[#3E2723]" />;
    if (id === 'storage') return <PackageOpen className="w-4 h-4 text-[#3E2723]" />;
    return <Coffee className="w-4 h-4 text-[#3E2723]" />;
  };

  const getItemBadge = (item: any) => {
    if (item.type === 'numeric') {
      const val = Number(item.value) || 0;
      if (val === 0) {
        return (
          <span className="bg-[#FFDAD6] text-[#BA1A1A] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#FFB4AB] shrink-0 whitespace-nowrap">
            ناموجود
          </span>
        );
      }
      return (
        <span className="bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#C8E6C9] shrink-0 whitespace-nowrap">
          موجود
        </span>
      );
    }

    if (item.type === 'level') {
      if (item.value === 'empty') {
        return (
          <span className="bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFB4AB] px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 whitespace-nowrap">
            کلا نداریم
          </span>
        );
      }
      if (item.value === 'low') {
        return (
          <span className="bg-[#FFF3E0] text-[#E65100] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#FFE0B2] shrink-0 whitespace-nowrap">
            کم داریم
          </span>
        );
      }
      if (item.value === 'full') {
        return (
          <span className="bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#C8E6C9] shrink-0 whitespace-nowrap">
            پر / کامل
          </span>
        );
      }
      return (
        <span className="bg-[#E0F2FE] text-[#0288D1] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#B3E5FC] shrink-0 whitespace-nowrap">
          متوسط
        </span>
      );
    }

    if (item.type === 'boolean') {
      return Boolean(item.value) ? (
        <span className="bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#C8E6C9] shrink-0 whitespace-nowrap">
          موجود
        </span>
      ) : (
        <span className="bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFB4AB] px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 whitespace-nowrap">
          ناموجود
        </span>
      );
    }

    return null;
  };

  const getItemValueDisplay = (item: any) => {
    if (item.type === 'numeric') {
      const val = Number(item.value) || 0;
      return (
        <span className="font-extrabold text-[#201A19] text-sm shrink-0 whitespace-nowrap">
          {toPersianDigits(val)}{' '}
          <span className="text-[11px] font-normal text-[#6F5A52]">{item.unit || 'عدد'}</span>
        </span>
      );
    }
    if (item.type === 'level') {
      const labels: Record<string, string> = {
        empty: 'کلا نداریم (۰٪)',
        low: 'کم (۲۵٪)',
        medium: 'متوسط (۵۰٪)',
        full: 'پر (۱۰۰٪)',
      };
      const isOut = item.value === 'empty';
      return (
        <span className={`font-bold text-xs shrink-0 whitespace-nowrap ${isOut ? 'text-[#BA1A1A]' : 'text-[#201A19]'}`}>
          {labels[item.value as string] || 'متوسط'}
        </span>
      );
    }
    return null;
  };

  const handleDownloadPDF = async () => {
    const targetEl = pdfExportRef.current || visibleReportRef.current;
    if (!targetEl) return;
    
    setIsExporting(true);
    setExportProgress('در حال بررسی قلم‌ها و آماده‌سازی سند...');

    try {
      const fileName = `گزارش-موجودی-کافه-چینو-${todayInfo.standardString.replace(/\//g, '-')}.pdf`;
      const success = await exportReportToPdf({
        element: targetEl,
        filename: fileName,
        onProgress: (status) => setExportProgress(status),
      });

      if (success) {
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#3E2723', '#D7CCC8', '#8D6E63', '#4CAF50'],
          });
        } catch {
          // Safe fallback
        }

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      } else {
        alert('خطا در تولید PDF. لطفاً از گزینه «چاپ مستقیم» استفاده نمایید.');
      }
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('خطا در ایجاد فایل PDF. می‌توانید از دکمه «چاپ مستقیم» نیز استفاده فرمایید.');
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex flex-col items-center justify-start p-0 sm:p-4">
      {/* Top Floating Control Bar (Hidden on Print) */}
      <div 
        className="no-print sticky top-0 z-20 w-full max-w-3xl bg-[#201A19] text-white px-4 py-3 sm:rounded-2xl shadow-xl flex items-center justify-between gap-3 mb-3 border border-[#3E2723]"
        dir="rtl"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#3E2723] flex items-center justify-center text-[#FADCD2] border border-[#5D4037] shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base leading-tight">پیش‌نمایش و چاپ گزارش موجودی</h2>
            <p className="text-[11px] text-[#D7CCC8]">{todayInfo.fullDate} | شناسه: {todayInfo.reportId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-[#3E2723] hover:bg-[#4E342E] rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-[#5D4037] active:scale-95"
            title="چاپ مستقیم با پرینتر یا ذخیره مرورگر"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">چاپ</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="px-4 py-2 bg-[#FADCD2] hover:bg-[#F3CEBF] text-[#3E2723] rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <span>{exportProgress || 'در حال ساخت PDF...'}</span>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-[#2E7D32]" />
                <span>دانلود شد!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>دانلود فایل PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-[#3E2723] rounded-xl text-[#D7CCC8] hover:text-white transition-colors"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Stat Cards (Hidden on Print) */}
      <div className="no-print w-full max-w-3xl px-2 mb-3 grid grid-cols-3 gap-2.5 text-center" dir="rtl">
        <div className="bg-white rounded-2xl p-2.5 border border-[#EFEBE9] shadow-xs">
          <span className="text-[11px] font-medium text-[#6F5A52] block">کل اقلام بررسی شده</span>
          <span className="text-base font-extrabold text-[#201A19]">{toPersianDigits(totalItems)} قلم</span>
        </div>
        <div className="bg-white rounded-2xl p-2.5 border border-[#C8E6C9] bg-[#E8F5E9]/30 shadow-xs">
          <span className="text-[11px] font-bold text-[#2E7D32] block">اقلام موجود</span>
          <span className="text-base font-extrabold text-[#2E7D32]">{toPersianDigits(inStockCount)} قلم</span>
        </div>
        <div className="bg-white rounded-2xl p-2.5 border border-[#FFB4AB] bg-[#FFDAD6]/30 shadow-xs">
          <span className="text-[11px] font-bold text-[#BA1A1A] block">کسری و نیازمندی</span>
          <span className="text-base font-extrabold text-[#BA1A1A]">{toPersianDigits(outOfStockCount + requirements.length)} قلم</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. VISIBLE ON-SCREEN REPORT CONTAINER (Responsive for UX) */}
      {/* ========================================================= */}
      <div 
        id="printable-report-container"
        ref={visibleReportRef}
        className="w-full max-w-3xl bg-white text-[#201A19] p-6 sm:p-9 shadow-2xl rounded-2xl sm:rounded-3xl border border-[#E6DFD5] mb-20 pdf-render-canvas"
        dir="rtl"
      >
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-[#3E2723] pb-4 mb-5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#3E2723] text-white flex items-center justify-center font-bold shadow-xs">
                <Coffee className="w-5 h-5 text-[#FADCD2]" />
              </div>
              <div>
                <h1 className="font-extrabold text-2xl text-[#201A19] tracking-tight leading-none">
                  کافه چینو
                </h1>
                <span className="text-[11px] text-[#8D6E63] font-semibold mt-0.5 block">
                  سامانه مدیریت شیفت و کنترل موجودی
                </span>
              </div>
            </div>
          </div>

          <div className="text-left flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-[#201A19] bg-[#F5F2EC] rounded-xl px-3 py-1.5 border border-[#E6DFD5]">
              <Calendar className="w-3.5 h-3.5 text-[#6F5A52]" />
              <span className="text-xs font-bold tracking-tight">{todayInfo.formattedPersian}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#8D6E63] font-medium" dir="ltr">
              <Clock className="w-3 h-3" />
              <span>{timeNow}</span>
              <span>• {todayInfo.reportId}</span>
            </div>
          </div>
        </div>

        {/* Categories Sections */}
        <div className="space-y-5">
          {categories.map((cat) => (
            <section key={cat.id} className="border border-[#EFEBE9] rounded-2xl p-3.5 bg-[#FAF8F5]/60">
              {/* Category Title */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#EFEBE9]">
                <div className="bg-[#3E2723] text-[#FADCD2] p-1.5 rounded-xl">
                  {getCategoryIcon(cat.id)}
                </div>
                <h2 className="font-extrabold text-base text-[#201A19]">{cat.name}</h2>
              </div>

              {/* Items List in this category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cat.subcategories.flatMap((sub) =>
                  sub.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_auto] items-center bg-white rounded-xl p-2.5 border border-[#E6DFD5] shadow-2xs gap-2"
                    >
                      <div className="min-w-0 pr-1">
                        <span className="font-bold text-xs sm:text-sm text-[#201A19] block leading-tight break-words">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-[#8D6E63] block leading-normal break-words mt-0.5">
                          {item.description || sub.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 justify-end">
                        {getItemBadge(item)}
                        {getItemValueDisplay(item)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Requirements Box (خرید فوری) */}
        <section className="mt-5 bg-[#FFF8F7] rounded-2xl p-4 border border-[#FFB4AB]">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#BA1A1A] text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-[#93000A]">
              اقلام کسری و نیازمندی‌های خرید فوری
            </h3>
          </div>

          {requirements.length === 0 ? (
            <p className="text-xs text-[#6F5A52] italic pr-1">
              هیچ مورد کسری برای خرید اضطراری در این شیفت ثبت نشده است.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pr-1">
              {requirements.map((req) => (
                <div key={req.id} className="text-xs font-bold text-[#93000A] flex items-center gap-1.5 bg-white p-2 rounded-xl border border-[#FFCDD2]">
                  <span className="w-2 h-2 rounded-full bg-[#BA1A1A] shrink-0" />
                  <span className="break-words">{req.text}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Signatures Footer */}
        <div className="mt-8 pt-5 border-t border-[#EFEBE9] flex justify-between px-4 sm:px-10 text-xs text-[#6F5A52]">
          <div className="text-center flex flex-col items-center gap-7">
            <span className="font-bold text-[#201A19]">امضای سرپرست شیفت / انبار</span>
            <div className="w-32 sm:w-40 border-b-2 border-dashed border-[#8D6E63]" />
          </div>
          <div className="text-center flex flex-col items-center gap-7">
            <span className="font-bold text-[#201A19]">تایید نهایی مدیریت کافه</span>
            <div className="w-32 sm:w-40 border-b-2 border-dashed border-[#8D6E63]" />
          </div>
        </div>

        {/* Print Footer Notice */}
        <div className="mt-6 text-center text-[10px] text-[#A1887F] border-t border-[#F5F2EC] pt-3">
          <span>این سند توسط سامانه رسمی مدیریت کافه چینو در تاریخ {todayInfo.fullDate} ساعت {timeNow} صادر گردیده است.</span>
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
        {/* PDF Header Table (800px total width, zero RTL flex-gap issues) */}
        <table style={{ width: '100%', borderBottom: '2px solid #3E2723', paddingBottom: '14px', marginBottom: '18px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'middle', width: '60%' }}>
                <table style={{ borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: 'middle', paddingLeft: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#3E2723', color: '#FADCD2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          <Coffee style={{ width: '22px', height: '22px' }} />
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div style={{ fontSize: '22px', fontWeight: '900', color: '#201A19', lineHeight: '1.1' }}>
                          کافه چینو
                        </div>
                        <div style={{ fontSize: '11px', color: '#8D6E63', fontWeight: '600', marginTop: '4px' }}>
                          سامانه مدیریت شیفت و کنترل موجودی
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
                  <span>ساعت {timeNow} • {todayInfo.reportId}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Categories Loop */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {categories.map((cat) => (
            <div 
              key={`pdf-${cat.id}`}
              style={{
                backgroundColor: '#FAF8F5',
                border: '1px solid #EAE3DC',
                borderRadius: '14px',
                padding: '12px 14px',
                boxSizing: 'border-box',
              }}
            >
              {/* Category Title Header */}
              <div style={{ borderBottom: '1px solid #E2D9D0', paddingBottom: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: '#3E2723', color: '#FADCD2', padding: '5px', borderRadius: '8px', display: 'inline-flex' }}>
                  {getCategoryIcon(cat.id)}
                </div>
                <span style={{ fontSize: '15px', fontWeight: '900', color: '#201A19' }}>
                  {cat.name}
                </span>
              </div>

              {/* Items 2-Column Grid (Fixed Pixel Widths to prevent overlapping) */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '350px 350px', 
                  columnGap: '12px', 
                  rowGap: '8px',
                  boxSizing: 'border-box',
                }}
              >
                {cat.subcategories.flatMap((sub) =>
                  sub.items.map((item) => (
                    <div
                      key={`pdf-item-${item.id}`}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #E0D7CE',
                        borderRadius: '10px',
                        padding: '8px 10px',
                        display: 'grid',
                        gridTemplateColumns: '215px 125px',
                        alignItems: 'center',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Right side: Item Title & Description (allow wrapping, NO truncate) */}
                      <div style={{ paddingLeft: '6px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#201A19', lineHeight: '1.3', wordBreak: 'break-word' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#8D6E63', marginTop: '2px', lineHeight: '1.2', wordBreak: 'break-word' }}>
                          {item.description || sub.name}
                        </div>
                      </div>

                      {/* Left side: Status badge & Quantity / Value (Fixed alignment, no clipping) */}
                      <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        {getItemBadge(item)}
                        {getItemValueDisplay(item)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Requirements Box (خرید فوری) */}
        <div 
          style={{
            marginTop: '16px',
            backgroundColor: '#FFF8F7',
            border: '1px solid #FFB4AB',
            borderRadius: '14px',
            padding: '12px 16px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '8px', backgroundColor: '#BA1A1A', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle style={{ width: '14px', height: '14px' }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '900', color: '#93000A' }}>
              اقلام کسری و نیازمندی‌های خرید فوری
            </span>
          </div>

          {requirements.length === 0 ? (
            <div style={{ fontSize: '11px', color: '#6F5A52', fontStyle: 'italic', paddingRight: '4px' }}>
              هیچ مورد کسری برای خرید اضطراری در این شیفت ثبت نشده است.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '350px 350px', columnGap: '12px', rowGap: '6px' }}>
              {requirements.map((req) => (
                <div 
                  key={`pdf-req-${req.id}`}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #FFCDD2',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#93000A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#BA1A1A', flexShrink: 0 }} />
                  <span style={{ wordBreak: 'break-word' }}>{req.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Signatures Row */}
        <table style={{ width: '100%', marginTop: '24px', borderTop: '1px solid #EFEBE9', paddingTop: '16px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', textAlign: 'center', padding: '12px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#201A19', marginBottom: '24px' }}>
                  امضای سرپرست شیفت / انبار
                </div>
                <div style={{ width: '140px', margin: '0 auto', borderBottom: '2px dashed #8D6E63' }} />
              </td>

              <td style={{ width: '50%', textAlign: 'center', padding: '12px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#201A19', marginBottom: '24px' }}>
                  تایید نهایی مدیریت کافه
                </div>
                <div style={{ width: '140px', margin: '0 auto', borderBottom: '2px dashed #8D6E63' }} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer info line */}
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '10px', color: '#8D6E63', borderTop: '1px solid #F0EAE1', paddingTop: '8px' }}>
          این سند توسط سامانه رسمی مدیریت کافه چینو در تاریخ {todayInfo.fullDate} ساعت {timeNow} صادر گردیده است.
        </div>
      </div>

      {/* Bottom Sticky Action Bar (Hidden on Print) */}
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
          <span>{isExporting ? (exportProgress || 'در حال تولید سند PDF...') : 'دانلود مستقیم فایل PDF'}</span>
        </button>

        {requirements.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('آیا مایلید لیست نیازمندی‌های این شیفت پاکسازی شود؟')) {
                onClearShiftRequirements();
              }
            }}
            className="px-4 h-12 bg-[#F5F2EC] hover:bg-[#EAE4DC] text-[#6F5A52] text-xs font-bold rounded-2xl border border-[#E6DFD5] transition-colors"
            title="پاکسازی نیازمندی‌های شیفت برای شیفت جدید"
          >
            ریست نیازمندی‌ها
          </button>
        )}
      </div>
    </div>
  );
};

