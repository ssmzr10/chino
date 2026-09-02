import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratePdfOptions {
  element: HTMLElement;
  filename?: string;
  onProgress?: (status: string) => void;
}

export async function exportReportToPdf({
  element,
  filename = 'گزارش-موجودی-کافه-چینو.pdf',
  onProgress
}: GeneratePdfOptions): Promise<boolean> {
  try {
    onProgress?.('در حال آماده‌سازی و بررسی فونت‌های سند...');

    // 1. Ensure fonts (Vazirmatn) are completely loaded
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // 2. Extra frame + buffer for layout engine stabilization
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(() => resolve(), 150);
      });
    });

    onProgress?.('در حال رندر و پردازش حروف فارسی...');

    // 3. Capture with html2canvas using exact 800px width and high scale
    const canvas = await html2canvas(element, {
      scale: 2.5, // Crisp 300dpi-like output for high readability
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 800,
      windowWidth: 800,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
    });

    onProgress?.('در حال قالب‌بندی و تولید فایل PDF...');
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // 4. A4 dimensions in mm: 210 x 297
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

    // First page
    pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight, undefined, 'FAST');
    heightLeft -= (pageHeight - margin * 2);

    // Additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - printHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight, undefined, 'FAST');
      heightLeft -= (pageHeight - margin * 2);
    }

    onProgress?.('در حال دانلود سند...');
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return false;
  }
}

