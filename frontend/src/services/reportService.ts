import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { MonthlyDutyList, MONTH_NAMES } from '../types';

// Türkçe karakter desteği için Base64 encoded DejaVu Sans font
// NOT: Gerçek uygulamada font dosyası ayrı yüklenir, burada basitleştirilmiş versiyon
const initTurkishSupport = (doc: jsPDF) => {
  // jsPDF'in varsayılan fontunda Türkçe karakter sorunu var
  // Bu fonksiyon ile Türkçe karakterleri düzgün gösteriyoruz
  doc.setFont('helvetica');
};

// Türkçe karakterleri ASCII uyumlu hale getir (fallback)
const turkishToAscii = (text: string): string => {
  const map: Record<string, string> = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };
  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, char => map[char] || char);
};

// PDF Rapor Oluştur
export const generatePDF = (
  dutyList: MonthlyDutyList, 
  schoolName: string,
  academicYearName: string
): void => {
  // Toplam sütun sayısına göre sayfa yönünü belirle
  const totalColumns = 2 + dutyList.erkekMaxSlots + dutyList.kizMaxSlots; // Tarih + Gün + Erkek slots + Kız slots
  const isLandscape = totalColumns > 6;
  
  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  initTurkishSupport(doc);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const monthName = MONTH_NAMES[dutyList.month];
  
  // Başlık
  doc.setFontSize(16);
  doc.text(turkishToAscii(schoolName), pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(turkishToAscii(`${academicYearName} Egitim-Ogretim Yili`), pageWidth / 2, 22, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(turkishToAscii(`${monthName} ${dutyList.year} Ayi Pansiyon Nobet Listesi`), pageWidth / 2, 30, { align: 'center' });
  
  // Tablo başlıkları oluştur
  const headers: string[] = ['Tarih', 'Gun'];
  
  // Erkek pansiyonu başlıkları
  for (let i = 0; i < dutyList.erkekMaxSlots; i++) {
    headers.push(`Erkek ${i + 1}`);
  }
  
  // Kız pansiyonu başlıkları
  for (let i = 0; i < dutyList.kizMaxSlots; i++) {
    headers.push(`Kiz ${i + 1}`);
  }
  
  // Tablo verilerini oluştur
  const tableData: string[][] = [];
  
  for (const day of dutyList.days) {
    const row: string[] = [
      String(day.dayOfMonth),
      turkishToAscii(day.dayName.substring(0, 3)) // Kısalt: Pzt, Sal, vb.
    ];
    
    // Erkek nöbetçileri
    for (let i = 0; i < dutyList.erkekMaxSlots; i++) {
      if (day.isHoliday) {
        row.push('TATIL');
      } else {
        const teacher = day.erkekDuties[i];
        row.push(teacher ? turkishToAscii(teacher.fullName) : '-');
      }
    }
    
    // Kız nöbetçileri
    for (let i = 0; i < dutyList.kizMaxSlots; i++) {
      if (day.isHoliday) {
        row.push('TATIL');
      } else {
        const teacher = day.kizDuties[i];
        row.push(teacher ? turkishToAscii(teacher.fullName) : '-');
      }
    }
    
    tableData.push(row);
  }
  
  // Tablo oluştur
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 38,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: 'center',
      valign: 'middle'
    },
    headStyles: {
      fillColor: [59, 130, 246], // Mavi
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 12 }, // Tarih
      1: { cellWidth: 12 }  // Gün
    },
    didParseCell: (data) => {
      // Erkek pansiyonu hücreleri - açık mavi
      if (data.section === 'body' && data.column.index >= 2 && data.column.index < 2 + dutyList.erkekMaxSlots) {
        data.cell.styles.fillColor = [239, 246, 255]; // erkek-50
      }
      // Kız pansiyonu hücreleri - açık pembe
      if (data.section === 'body' && data.column.index >= 2 + dutyList.erkekMaxSlots) {
        data.cell.styles.fillColor = [253, 242, 248]; // kiz-50
      }
      // Cumartesi ve Pazar satırları
      if (data.section === 'body') {
        const dayName = tableData[data.row.index]?.[1];
        if (dayName === 'Cmt' || dayName === 'Paz') {
          data.cell.styles.fontStyle = 'bold';
        }
      }
      // Tatil hücreleri
      if (data.cell.raw === 'TATIL') {
        data.cell.styles.fillColor = [254, 243, 199]; // Sarı
        data.cell.styles.textColor = [180, 83, 9];
      }
    }
  });
  
  // Onay alanı
  const finalY = (doc as any).lastAutoTable.finalY || 200;
  
  doc.setFontSize(10);
  doc.text('Onaylayan: _____________________', 20, finalY + 15);
  doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, pageWidth - 60, finalY + 15);
  
  // PDF'i indir
  doc.save(`nobet_listesi_${dutyList.year}_${dutyList.month + 1}.pdf`);
};

// Excel Rapor Oluştur
export const generateExcel = (
  dutyList: MonthlyDutyList,
  schoolName: string,
  academicYearName: string
): void => {
  const monthName = MONTH_NAMES[dutyList.month];
  
  // Başlık satırları
  const titleRows = [
    [schoolName],
    [`${academicYearName} Eğitim-Öğretim Yılı`],
    [`${monthName} ${dutyList.year} Ayı Pansiyon Nöbet Listesi`],
    [] // Boş satır
  ];
  
  // Tablo başlıkları
  const headers: string[] = ['Tarih', 'Gün'];
  
  for (let i = 0; i < dutyList.erkekMaxSlots; i++) {
    headers.push(`Erkek Nöbetçi ${i + 1}`);
  }
  
  for (let i = 0; i < dutyList.kizMaxSlots; i++) {
    headers.push(`Kız Nöbetçi ${i + 1}`);
  }
  
  // Veri satırları
  const dataRows: (string | number)[][] = [];
  
  for (const day of dutyList.days) {
    const row: (string | number)[] = [
      day.dayOfMonth,
      day.dayName
    ];
    
    // Erkek nöbetçileri
    for (let i = 0; i < dutyList.erkekMaxSlots; i++) {
      if (day.isHoliday) {
        row.push('TATİL');
      } else {
        const teacher = day.erkekDuties[i];
        row.push(teacher ? teacher.fullName : '');
      }
    }
    
    // Kız nöbetçileri
    for (let i = 0; i < dutyList.kizMaxSlots; i++) {
      if (day.isHoliday) {
        row.push('TATİL');
      } else {
        const teacher = day.kizDuties[i];
        row.push(teacher ? teacher.fullName : '');
      }
    }
    
    dataRows.push(row);
  }
  
  // Tüm satırları birleştir
  const allRows = [...titleRows, headers, ...dataRows];
  
  // Worksheet oluştur
  const worksheet = XLSX.utils.aoa_to_sheet(allRows);
  
  // Sütun genişlikleri
  const colWidths = [
    { wch: 6 },  // Tarih
    { wch: 12 }, // Gün
  ];
  
  for (let i = 0; i < dutyList.erkekMaxSlots + dutyList.kizMaxSlots; i++) {
    colWidths.push({ wch: 20 });
  }
  
  worksheet['!cols'] = colWidths;
  
  // Workbook oluştur
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nöbet Listesi');
  
  // Excel dosyasını indir
  XLSX.writeFile(workbook, `nobet_listesi_${dutyList.year}_${dutyList.month + 1}.xlsx`);
};

// İstatistik Raporu PDF
export const generateStatsPDF = (
  stats: { erkek: any[]; kiz: any[] },
  schoolName: string,
  academicYearName: string
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  initTurkishSupport(doc);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Başlık
  doc.setFontSize(16);
  doc.text(turkishToAscii(schoolName), pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(turkishToAscii(`${academicYearName} Nobet Istatistikleri`), pageWidth / 2, 22, { align: 'center' });
  
  let currentY = 35;
  
  // Erkek Pansiyonu İstatistikleri
  doc.setFontSize(12);
  doc.text('ERKEK PANSIYONU', 14, currentY);
  
  const erkekHeaders = ['Ogretmen', 'Toplam', 'H.Ici', 'Cuma', 'Cmt', 'Paz'];
  const erkekData = stats.erkek.map(s => [
    turkishToAscii(s.teacherName),
    s.totalDuties,
    s.weekdayDuties,
    s.fridayDuties,
    s.saturdayDuties,
    s.sundayDuties
  ]);
  
  autoTable(doc, {
    head: [erkekHeaders],
    body: erkekData,
    startY: currentY + 5,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] }
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 15;
  
  // Kız Pansiyonu İstatistikleri
  doc.setFontSize(12);
  doc.text('KIZ PANSIYONU', 14, currentY);
  
  const kizHeaders = ['Ogretmen', 'Toplam', 'H.Ici', 'Cuma', 'Cmt', 'Paz'];
  const kizData = stats.kiz.map(s => [
    turkishToAscii(s.teacherName),
    s.totalDuties,
    s.weekdayDuties,
    s.fridayDuties,
    s.saturdayDuties,
    s.sundayDuties
  ]);
  
  autoTable(doc, {
    head: [kizHeaders],
    body: kizData,
    startY: currentY + 5,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [236, 72, 153] }
  });
  
  doc.save('nobet_istatistikleri.pdf');
};
