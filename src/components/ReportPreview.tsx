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
  Building2,
  Clock
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import { Category, RequirementItem } from '../types';
import { getTodayJalaliDate, toPersianDigits, formatTimePersian } from '../utils/persianDate';

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
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
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
          <span className="bg-[#FFDAD6] text-[#BA1A1A] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#FFB4AB]">
            ناموجود
          </span>
        );
      }
      return (
        <span className="bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#C8E6C9]">
          موجود
        </span>
      );
    }

    if (item.type === 'level') {
      if (item.value === 'empty') {
        return (
          <span className="bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFB4AB] px-2.5 py-0.5 rounded-full text-xs font-bold">
            کلا نداریم
          </span>
        );
      }
      if (item.value === 'low') {
        return (
          <span className="bg-[#FFF3E0] text-[#E65100] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#FFE0B2]">
            کم داریم
          </span>
        );
      }
      if (item.value === 'full') {
        return (
          <span className="bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#C8E6C9]">
            پر / کامل
          </span>
        );
      }
      return (
        <span className="bg-[#E0F2FE] text-[#0288D1] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#B3E5FC]">
          متوسط
        </span>
      );
    }

    if (item.type === 'boolean') {
      return Boolean(item.value) ? (
        <span className="bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#C8E6C9]">
          موجود
        </span>
      ) : (
        <span className="bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFB4AB] px-2.5 py-0.5 rounded-full text-xs font-bold">
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
        <span className="font-extrabold text-[#201A19] text-sm">
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
        <span className={`font-bold text-xs ${isOut ? 'text-[#BA1A1A]' : 'text-[#201A19]'}`}>
          {labels[item.value as string] || 'متوسط'}
        </span>
      );
    }
    return null;
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const element = reportRef.current;

      // Capture with high quality and sharp text
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 850,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = 210; // A4 width mm
      const pageHeight = 297; // A4 height mm
      const margin = 8; // 8mm margin
      const printWidth = pageWidth - (margin * 2);
      const printHeight = (canvas.height * printWidth) / canvas.width;

      let heightLeft = printHeight;
      let position = margin;

      pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight, undefined, 'FAST');
      heightLeft -= (pageHeight - margin * 2);

      while (heightLeft > 0) {
        position = heightLeft - printHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight, undefined, 'FAST');
        heightLeft -= (pageHeight - margin * 2);
      }

      const fileName = `گزارش-موجودی-کافه-چینو-${todayInfo.standardString.replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);

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
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('خطا در ایجاد فایل PDF. می‌توانید از دکمه «چاپ مستقیم» نیز استفاده فرمایید.');
    } finally {
      setIsExporting(false);
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
              <span>در حال ساخت PDF...</span>
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

      {/* A4 Printable Document Container */}
      <div 
        id="printable-report-container"
        ref={reportRef}
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
                      className="flex justify-between items-center bg-white rounded-xl p-2.5 border border-[#E6DFD5] shadow-2xs"
                    >
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-1">
                        <span className="font-bold text-xs sm:text-sm text-[#201A19] truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-[#8D6E63] truncate">
                          {item.description || sub.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
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
                  <span>{req.text}</span>
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
          <span>{isExporting ? 'در حال تولید سند PDF...' : 'دانلود مستقیم فایل PDF'}</span>
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
