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
    onProgress?.('در حال آماده‌سازی تصویر سند...');

    // Temporarily ensure proper rendering styles
    const originalShadow = element.style.boxShadow;
    element.style.boxShadow = 'none';

    // Wait for fonts to load
    if (document.fonts) {
      await document.fonts.ready;
    }

    onProgress?.('در حال اسکن و پردازش حروف فارسی...');
    const canvas = await html2canvas(element, {
      scale: 2, // 2x scale for sharp text in A4 PDF
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800,
    });

    element.style.boxShadow = originalShadow;

    onProgress?.('در حال تولید فایل PDF...');
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Canvas aspect ratio
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgHeight / imgWidth;

    const renderWidth = pdfWidth;
    const renderHeight = pdfWidth * ratio;

    if (renderHeight <= pdfHeight) {
      // Fits in 1 page
      pdf.addImage(imgData, 'JPEG', 0, 0, renderWidth, renderHeight, undefined, 'FAST');
    } else {
      // Multi-page splitting if content is long
      let heightLeft = renderHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, renderWidth, renderHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - renderHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, renderWidth, renderHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }

    onProgress?.('در حال دانلود سند...');
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return false;
  }
}
