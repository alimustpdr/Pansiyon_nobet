import * as XLSX from 'xlsx';
import type { MonthlyDutyRoster, AppSettings, ColumnConfig } from '../types';
import { TURKISH_DAY_NAMES, TURKISH_MONTH_NAMES } from '../types';

interface ExportExcelOptions {
  dutyRoster: MonthlyDutyRoster;
  settings: AppSettings;
  columnConfig: ColumnConfig;
}

export function exportToExcel({ dutyRoster, settings, columnConfig }: ExportExcelOptions): void {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Calculate total columns
  const totalDataColumns = columnConfig.maleDormitoryMaxColumns + columnConfig.femaleDormitoryMaxColumns;
  const totalColumns = 2 + totalDataColumns;

  // Prepare data array
  const data: (string | number)[][] = [];

  // Row 1: School name (merged across all columns)
  const row1: string[] = [settings.schoolName];
  for (let i = 1; i < totalColumns; i++) row1.push('');
  data.push(row1);

  // Row 2: Active period
  const row2: string[] = [settings.activePeriod];
  for (let i = 1; i < totalColumns; i++) row2.push('');
  data.push(row2);

  // Row 3: Month title
  const monthName = TURKISH_MONTH_NAMES[dutyRoster.month - 1];
  const row3: string[] = [`${monthName} ${dutyRoster.year} Ayı Pansiyon Nöbet Listesi`];
  for (let i = 1; i < totalColumns; i++) row3.push('');
  data.push(row3);

  // Row 4: Empty row
  data.push([]);

  // Row 5: Main headers (Tarih, Gün, Erkek Pansiyonu, Kız Pansiyonu)
  const headerRow1: string[] = ['Tarih', 'Gün'];
  headerRow1.push('Erkek Pansiyonu');
  for (let i = 1; i < columnConfig.maleDormitoryMaxColumns; i++) headerRow1.push('');
  headerRow1.push('Kız Pansiyonu');
  for (let i = 1; i < columnConfig.femaleDormitoryMaxColumns; i++) headerRow1.push('');
  data.push(headerRow1);

  // Row 6: Sub-headers (Nöbetçi 1, Nöbetçi 2, ...)
  const headerRow2: string[] = ['', ''];
  for (let i = 0; i < columnConfig.maleDormitoryMaxColumns; i++) {
    headerRow2.push(`Nöbetçi ${i + 1}`);
  }
  for (let i = 0; i < columnConfig.femaleDormitoryMaxColumns; i++) {
    headerRow2.push(`Nöbetçi ${i + 1}`);
  }
  data.push(headerRow2);

  // Data rows
  for (let i = 0; i < dutyRoster.maleDormitory.length; i++) {
    const maleDay = dutyRoster.maleDormitory[i];
    const femaleDay = dutyRoster.femaleDormitory[i];
    
    const row: (string | number)[] = [
      new Date(maleDay.date).getDate(),
      TURKISH_DAY_NAMES[maleDay.dayOfWeek],
    ];

    // Male dormitory guards
    for (const guard of maleDay.guards) {
      row.push(guard.teacherName || '-');
    }

    // Female dormitory guards
    for (const guard of femaleDay.guards) {
      row.push(guard.teacherName || '-');
    }

    data.push(row);
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const colWidths: XLSX.ColInfo[] = [
    { wch: 8 },  // Tarih
    { wch: 12 }, // Gün
  ];
  for (let i = 0; i < totalDataColumns; i++) {
    colWidths.push({ wch: 18 }); // Guard columns
  }
  ws['!cols'] = colWidths;

  // Set row heights
  ws['!rows'] = [
    { hpt: 20 }, // School name
    { hpt: 18 }, // Active period
    { hpt: 20 }, // Month title
    { hpt: 10 }, // Empty row
    { hpt: 22 }, // Main headers
    { hpt: 18 }, // Sub-headers
  ];

  // Merge cells for headers
  ws['!merges'] = [
    // School name (row 1)
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalColumns - 1 } },
    // Active period (row 2)
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalColumns - 1 } },
    // Month title (row 3)
    { s: { r: 2, c: 0 }, e: { r: 2, c: totalColumns - 1 } },
    // Tarih header (rows 5-6)
    { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } },
    // Gün header (rows 5-6)
    { s: { r: 4, c: 1 }, e: { r: 5, c: 1 } },
    // Erkek Pansiyonu header
    { s: { r: 4, c: 2 }, e: { r: 4, c: 1 + columnConfig.maleDormitoryMaxColumns } },
    // Kız Pansiyonu header
    { s: { r: 4, c: 2 + columnConfig.maleDormitoryMaxColumns }, e: { r: 4, c: totalColumns - 1 } },
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Nöbet Listesi');

  // Set print options for proper orientation
  // Auto-determine orientation based on column count
  if (!ws['!print']) {
    ws['!print'] = {};
  }
  
  // Note: Page orientation is set in the page setup for proper print preview
  // totalColumns > 6 suggests landscape orientation
  
  // Write workbook with proper encoding for Turkish characters
  const wbout = XLSX.write(wb, { 
    bookType: 'xlsx', 
    type: 'array',
    bookSST: true,
  });

  // Create blob and download
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `nobet_listesi_${dutyRoster.year}_${String(dutyRoster.month).padStart(2, '0')}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export with styled cells (requires xlsx-style or similar for full styling)
export function exportToExcelStyled({ dutyRoster, settings, columnConfig }: ExportExcelOptions): void {
  const wb = XLSX.utils.book_new();
  const totalDataColumns = columnConfig.maleDormitoryMaxColumns + columnConfig.femaleDormitoryMaxColumns;
  const totalColumns = 2 + totalDataColumns;

  // Prepare data
  const data: (string | number)[][] = [];

  // Headers
  data.push([settings.schoolName]);
  data.push([settings.activePeriod]);
  const monthName = TURKISH_MONTH_NAMES[dutyRoster.month - 1];
  data.push([`${monthName} ${dutyRoster.year} Ayı Pansiyon Nöbet Listesi`]);
  data.push([]);

  // Table headers
  const mainHeader: string[] = ['Tarih', 'Gün'];
  mainHeader.push('ERKEK PANSİYONU');
  for (let i = 1; i < columnConfig.maleDormitoryMaxColumns; i++) mainHeader.push('');
  mainHeader.push('KIZ PANSİYONU');
  for (let i = 1; i < columnConfig.femaleDormitoryMaxColumns; i++) mainHeader.push('');
  data.push(mainHeader);

  const subHeader: string[] = ['', ''];
  for (let i = 0; i < columnConfig.maleDormitoryMaxColumns; i++) {
    subHeader.push(`Nöbetçi ${i + 1}`);
  }
  for (let i = 0; i < columnConfig.femaleDormitoryMaxColumns; i++) {
    subHeader.push(`Nöbetçi ${i + 1}`);
  }
  data.push(subHeader);

  // Data rows
  dutyRoster.maleDormitory.forEach((maleDay, i) => {
    const femaleDay = dutyRoster.femaleDormitory[i];
    const row: (string | number)[] = [
      new Date(maleDay.date).getDate(),
      TURKISH_DAY_NAMES[maleDay.dayOfWeek],
      ...maleDay.guards.map((g) => g.teacherName || '-'),
      ...femaleDay.guards.map((g) => g.teacherName || '-'),
    ];
    data.push(row);
  });

  // Footer
  data.push([]);
  data.push([`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`]);

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Column widths
  ws['!cols'] = [
    { wch: 8 },
    { wch: 12 },
    ...Array(totalDataColumns).fill({ wch: 18 }),
  ];

  // Merges
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalColumns - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalColumns - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: totalColumns - 1 } },
    { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } },
    { s: { r: 4, c: 1 }, e: { r: 5, c: 1 } },
    { s: { r: 4, c: 2 }, e: { r: 4, c: 1 + columnConfig.maleDormitoryMaxColumns } },
    { s: { r: 4, c: 2 + columnConfig.maleDormitoryMaxColumns }, e: { r: 4, c: totalColumns - 1 } },
  ];

  // Print setup - set page orientation based on columns
  if (totalColumns > 6) {
    // Landscape orientation for many columns
    ws['!pageSetup'] = {
      orientation: 'landscape',
      paperSize: 9, // A4
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    };
  } else {
    ws['!pageSetup'] = {
      orientation: 'portrait',
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    };
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Nöbet Listesi');

  // Download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `nobet_listesi_${dutyRoster.year}_${String(dutyRoster.month).padStart(2, '0')}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
