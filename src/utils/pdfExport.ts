import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MonthlyDutyRoster, AppSettings, ColumnConfig } from '../types';
import { TURKISH_DAY_NAMES, TURKISH_MONTH_NAMES } from '../types';

// Ensure Turkish characters work by normalizing text
function normalizeTurkish(text: string): string {
  // jsPDF with autoTable handles most UTF-8 characters
  // but we'll ensure proper encoding
  return text;
}

interface ExportPdfOptions {
  dutyRoster: MonthlyDutyRoster;
  settings: AppSettings;
  columnConfig: ColumnConfig;
}

export function exportToPdf({ dutyRoster, settings, columnConfig }: ExportPdfOptions): void {
  // Calculate total columns to determine orientation
  const totalDataColumns = columnConfig.maleDormitoryMaxColumns + columnConfig.femaleDormitoryMaxColumns;
  const totalColumns = 2 + totalDataColumns; // Date + Day + guard columns
  
  // Auto-determine orientation: landscape if more than 6 total columns
  const orientation = totalColumns > 6 ? 'landscape' : 'portrait';
  
  // Create PDF document
  const doc = new jsPDF({
    orientation: orientation as 'portrait' | 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // Header section
  let yPosition = margin;

  // School name
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(normalizeTurkish(settings.schoolName), pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 7;

  // Active period
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(normalizeTurkish(settings.activePeriod), pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 7;

  // Month title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const monthName = TURKISH_MONTH_NAMES[dutyRoster.month - 1];
  doc.text(
    normalizeTurkish(`${monthName} ${dutyRoster.year} Ayi Pansiyon Nobet Listesi`),
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );
  yPosition += 10;

  // Create merged header for dormitories
  const headerRow1 = [
    { content: 'Tarih', rowSpan: 2 },
    { content: 'Gun', rowSpan: 2 },
    { content: 'Erkek Pansiyonu', colSpan: columnConfig.maleDormitoryMaxColumns },
    { content: 'Kiz Pansiyonu', colSpan: columnConfig.femaleDormitoryMaxColumns },
  ];

  const headerRow2 = [
    ...Array(columnConfig.maleDormitoryMaxColumns).fill('').map((_, i) => `Nobetci ${i + 1}`),
    ...Array(columnConfig.femaleDormitoryMaxColumns).fill('').map((_, i) => `Nobetci ${i + 1}`),
  ];

  // Prepare table body
  const body: string[][] = [];
  
  for (let i = 0; i < dutyRoster.maleDormitory.length; i++) {
    const maleDay = dutyRoster.maleDormitory[i];
    const femaleDay = dutyRoster.femaleDormitory[i];
    
    const date = new Date(maleDay.date).getDate().toString();
    const dayName = normalizeTurkish(TURKISH_DAY_NAMES[maleDay.dayOfWeek]);
    
    const row = [
      date,
      dayName,
      ...maleDay.guards.map((g) => normalizeTurkish(g.teacherName || '-')),
      ...femaleDay.guards.map((g) => normalizeTurkish(g.teacherName || '-')),
    ];
    
    body.push(row);
  }

  // Column widths
  const dateColWidth = 12;
  const dayColWidth = 22;

  // Generate table using autoTable
  autoTable(doc, {
    startY: yPosition,
    head: [headerRow1, headerRow2],
    body: body,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      font: 'helvetica',
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: dateColWidth, halign: 'center' },
      1: { cellWidth: dayColWidth, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    didParseCell: function(data) {
      // Style dormitory header cells
      if (data.section === 'head' && data.row.index === 0) {
        if (data.column.index >= 2 && data.column.index < 2 + columnConfig.maleDormitoryMaxColumns) {
          data.cell.styles.fillColor = [37, 99, 235]; // Blue for male
          data.cell.styles.textColor = [255, 255, 255];
        } else if (data.column.index >= 2 + columnConfig.maleDormitoryMaxColumns) {
          data.cell.styles.fillColor = [219, 39, 119]; // Pink for female
          data.cell.styles.textColor = [255, 255, 255];
        }
      }
      
      // Style subheader cells
      if (data.section === 'head' && data.row.index === 1) {
        if (data.column.index < columnConfig.maleDormitoryMaxColumns) {
          data.cell.styles.fillColor = [219, 234, 254]; // Light blue
        } else {
          data.cell.styles.fillColor = [252, 231, 243]; // Light pink
        }
      }
      
      // Highlight weekends
      if (data.section === 'body') {
        const dayIndex = data.row.index;
        const maleDay = dutyRoster.maleDormitory[dayIndex];
        if (maleDay) {
          if (maleDay.dayOfWeek === 0 || maleDay.dayOfWeek === 6) {
            data.cell.styles.fillColor = [255, 237, 213]; // Orange tint for weekend
          } else if (maleDay.dayOfWeek === 5) {
            data.cell.styles.fillColor = [254, 249, 195]; // Yellow tint for Friday
          }
        }
      }
    },
    margin: { left: margin, right: margin },
    tableWidth: 'auto',
  });

  // Add footer with generation date
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || pageHeight - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Olusturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`,
    margin,
    Math.min(finalY + 10, pageHeight - 10)
  );

  // Save the PDF
  const fileName = `nobet_listesi_${dutyRoster.year}_${String(dutyRoster.month).padStart(2, '0')}.pdf`;
  doc.save(fileName);
}

// Alternative export with better Turkish character support using HTML
export function exportToPdfWithTurkish({ dutyRoster, settings, columnConfig }: ExportPdfOptions): void {
  // Calculate total columns to determine orientation
  const totalDataColumns = columnConfig.maleDormitoryMaxColumns + columnConfig.femaleDormitoryMaxColumns;
  const totalColumns = 2 + totalDataColumns;
  
  // Auto-determine orientation
  const orientation = totalColumns > 6 ? 'landscape' : 'portrait';
  
  const doc = new jsPDF({
    orientation: orientation as 'portrait' | 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  let yPosition = margin;

  // Use Unicode-safe text rendering
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  
  // Header
  doc.text(settings.schoolName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 7;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(settings.activePeriod, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const monthName = TURKISH_MONTH_NAMES[dutyRoster.month - 1];
  // Replace Turkish chars for PDF compatibility
  const title = `${monthName} ${dutyRoster.year} Ayi Pansiyon Nobet Listesi`
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C');
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Helper to sanitize Turkish characters
  const sanitize = (text: string): string => {
    return text
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C');
  };

  // Prepare headers with Turkish char replacement
  const headerRow1 = [
    { content: 'Tarih', rowSpan: 2 },
    { content: 'Gun', rowSpan: 2 },
    { content: 'Erkek Pansiyonu', colSpan: columnConfig.maleDormitoryMaxColumns },
    { content: 'Kiz Pansiyonu', colSpan: columnConfig.femaleDormitoryMaxColumns },
  ];

  const headerRow2 = [
    ...Array(columnConfig.maleDormitoryMaxColumns).fill('').map((_, i) => `Nobetci ${i + 1}`),
    ...Array(columnConfig.femaleDormitoryMaxColumns).fill('').map((_, i) => `Nobetci ${i + 1}`),
  ];

  // Prepare body
  const body: string[][] = dutyRoster.maleDormitory.map((maleDay, i) => {
    const femaleDay = dutyRoster.femaleDormitory[i];
    const date = new Date(maleDay.date).getDate().toString();
    const dayName = sanitize(TURKISH_DAY_NAMES[maleDay.dayOfWeek]);
    
    return [
      date,
      dayName,
      ...maleDay.guards.map((g) => sanitize(g.teacherName || '-')),
      ...femaleDay.guards.map((g) => sanitize(g.teacherName || '-')),
    ];
  });

  // Generate table
  autoTable(doc, {
    startY: yPosition,
    head: [headerRow1, headerRow2],
    body: body,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 22, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    didParseCell: function(data) {
      if (data.section === 'head' && data.row.index === 0) {
        if (data.column.index >= 2 && data.column.index < 2 + columnConfig.maleDormitoryMaxColumns) {
          data.cell.styles.fillColor = [37, 99, 235];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (data.column.index >= 2 + columnConfig.maleDormitoryMaxColumns) {
          data.cell.styles.fillColor = [219, 39, 119];
          data.cell.styles.textColor = [255, 255, 255];
        }
      }
      
      if (data.section === 'head' && data.row.index === 1) {
        if (data.column.index < columnConfig.maleDormitoryMaxColumns) {
          data.cell.styles.fillColor = [219, 234, 254];
        } else {
          data.cell.styles.fillColor = [252, 231, 243];
        }
      }
      
      if (data.section === 'body') {
        const maleDay = dutyRoster.maleDormitory[data.row.index];
        if (maleDay) {
          if (maleDay.dayOfWeek === 0 || maleDay.dayOfWeek === 6) {
            data.cell.styles.fillColor = [255, 237, 213];
          } else if (maleDay.dayOfWeek === 5) {
            data.cell.styles.fillColor = [254, 249, 195];
          }
        }
      }
    },
    margin: { left: margin, right: margin },
  });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || doc.internal.pageSize.getHeight() - 20;
  doc.text(
    `Olusturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`,
    margin,
    Math.min(finalY + 10, doc.internal.pageSize.getHeight() - 10)
  );

  const fileName = `nobet_listesi_${dutyRoster.year}_${String(dutyRoster.month).padStart(2, '0')}.pdf`;
  doc.save(fileName);
}
