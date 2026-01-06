import { db } from '../database/init.js';
import { 
  DayType, 
  DormitoryType, 
  Gender, 
  Teacher, 
  DutyRecord,
  DailyDutyData,
  MonthlyDutyList,
  TeacherDutyStats
} from '../types/index.js';

// Türkçe gün isimleri
const DAY_NAMES: { [key: number]: string } = {
  0: 'Pazar',
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
  6: 'Cumartesi'
};

// Türkçe ay isimleri
const MONTH_NAMES: { [key: number]: string } = {
  0: 'Ocak',
  1: 'Şubat',
  2: 'Mart',
  3: 'Nisan',
  4: 'Mayıs',
  5: 'Haziran',
  6: 'Temmuz',
  7: 'Ağustos',
  8: 'Eylül',
  9: 'Ekim',
  10: 'Kasım',
  11: 'Aralık'
};

/**
 * Tarihin gün tipini belirle
 */
export function getDayType(date: Date): DayType {
  const dayOfWeek = date.getDay();
  
  switch (dayOfWeek) {
    case 0: return DayType.PAZAR;
    case 5: return DayType.CUMA;
    case 6: return DayType.CUMARTESI;
    default: return DayType.HAFTA_ICI;
  }
}

/**
 * Belirli bir pansiyon ve gün tipi için nöbetçi sayısını al
 */
export function getDutyCount(academicYearId: number, dormitoryType: DormitoryType, dayType: DayType): number {
  const result = db.prepare(`
    SELECT duty_count FROM dormitory_settings
    WHERE academic_year_id = ? AND dormitory_type = ? AND day_type = ?
  `).get(academicYearId, dormitoryType, dayType) as { duty_count: number } | undefined;
  
  return result?.duty_count ?? 1;
}

/**
 * Bir pansiyon için maksimum nöbetçi sayısını al (tüm gün tipleri arasından)
 */
export function getMaxDutyCount(academicYearId: number, dormitoryType: DormitoryType): number {
  const result = db.prepare(`
    SELECT MAX(duty_count) as max_count FROM dormitory_settings
    WHERE academic_year_id = ? AND dormitory_type = ?
  `).get(academicYearId, dormitoryType) as { max_count: number } | undefined;
  
  return result?.max_count ?? 1;
}

/**
 * Tüm pansiyon ayarlarını al
 */
export function getAllDormitorySettings(academicYearId: number) {
  return db.prepare(`
    SELECT * FROM dormitory_settings WHERE academic_year_id = ?
  `).all(academicYearId);
}

/**
 * Belirli bir cinsiyete göre aktif öğretmenleri al
 */
export function getTeachersByGender(gender: Gender): Teacher[] {
  const rows = db.prepare(`
    SELECT * FROM teachers WHERE gender = ? AND is_active = 1 ORDER BY full_name
  `).all(gender) as any[];
  
  return rows.map(row => ({
    id: row.id,
    tcNo: row.tc_no,
    fullName: row.full_name,
    gender: row.gender as Gender,
    branch: row.branch,
    phone: row.phone,
    email: row.email,
    isActive: row.is_active === 1,
    createdAt: row.created_at
  }));
}

/**
 * Belirli bir tarihte öğretmenin mazereti var mı kontrol et
 */
export function hasExcuseOnDate(teacherId: number, date: string): boolean {
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM teacher_excuses
    WHERE teacher_id = ? AND ? BETWEEN start_date AND end_date
  `).get(teacherId, date) as { count: number };
  
  return result.count > 0;
}

/**
 * Belirli bir tarih tatil mi kontrol et
 */
export function isHoliday(academicYearId: number, date: string): { isHoliday: boolean; description?: string; hasDuty?: boolean } {
  const result = db.prepare(`
    SELECT description, has_duty FROM holidays
    WHERE academic_year_id = ? AND date = ?
  `).get(academicYearId, date) as { description: string; has_duty: number } | undefined;
  
  if (result) {
    return { isHoliday: true, description: result.description, hasDuty: result.has_duty === 1 };
  }
  return { isHoliday: false };
}

/**
 * Öğretmenin toplam nöbet sayısını al
 */
export function getTeacherDutyCount(academicYearId: number, teacherId: number, dormitoryType: DormitoryType): number {
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM duty_records
    WHERE academic_year_id = ? AND teacher_id = ? AND dormitory_type = ?
  `).get(academicYearId, teacherId, dormitoryType) as { count: number };
  
  return result.count;
}

/**
 * Öğretmenin belirli bir gün tipindeki nöbet sayısını al
 */
export function getTeacherDutyCountByDayType(
  academicYearId: number, 
  teacherId: number, 
  dormitoryType: DormitoryType,
  dayType: DayType
): number {
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM duty_records
    WHERE academic_year_id = ? AND teacher_id = ? AND dormitory_type = ? AND day_type = ?
  `).get(academicYearId, teacherId, dormitoryType, dayType) as { count: number };
  
  return result.count;
}

/**
 * Öğretmenin son nöbet tarihini al
 */
export function getTeacherLastDutyDate(academicYearId: number, teacherId: number, dormitoryType: DormitoryType): string | null {
  const result = db.prepare(`
    SELECT date FROM duty_records
    WHERE academic_year_id = ? AND teacher_id = ? AND dormitory_type = ?
    ORDER BY date DESC LIMIT 1
  `).get(academicYearId, teacherId, dormitoryType) as { date: string } | undefined;
  
  return result?.date ?? null;
}

/**
 * Öğretmenin belirli bir tarihte zaten nöbeti var mı kontrol et
 */
export function hasExistingDuty(academicYearId: number, teacherId: number, date: string): boolean {
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM duty_records
    WHERE academic_year_id = ? AND teacher_id = ? AND date = ?
  `).get(academicYearId, teacherId, date) as { count: number };
  
  return result.count > 0;
}

/**
 * Öğretmenin önceki gün nöbeti var mı kontrol et
 */
export function hasPreviousDayDuty(academicYearId: number, teacherId: number, date: string): boolean {
  const prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevDateStr = prevDate.toISOString().split('T')[0];
  
  return hasExistingDuty(academicYearId, teacherId, prevDateStr);
}

/**
 * ADALET SKORU HESAPLAMA
 * Düşük skor = Öncelikli atama
 */
export function calculateFairnessScore(
  academicYearId: number,
  teacherId: number,
  dormitoryType: DormitoryType,
  targetDate: string,
  targetDayType: DayType
): number {
  let score = 0;
  
  // 1. Toplam nöbet sayısı (çok tutan geriye)
  const totalDuties = getTeacherDutyCount(academicYearId, teacherId, dormitoryType);
  score += totalDuties * 100;
  
  // 2. Son nöbetten geçen gün (uzun süre tutmayan öne)
  const lastDutyDate = getTeacherLastDutyDate(academicYearId, teacherId, dormitoryType);
  if (lastDutyDate) {
    const daysSinceLastDuty = Math.floor(
      (new Date(targetDate).getTime() - new Date(lastDutyDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    score -= daysSinceLastDuty * 10;
  } else {
    // Hiç nöbet tutmamış - çok öncelikli
    score -= 1000;
  }
  
  // 3. Hafta sonu nöbet sayısı (dengele)
  const saturdayDuties = getTeacherDutyCountByDayType(academicYearId, teacherId, dormitoryType, DayType.CUMARTESI);
  const sundayDuties = getTeacherDutyCountByDayType(academicYearId, teacherId, dormitoryType, DayType.PAZAR);
  score += (saturdayDuties + sundayDuties) * 50;
  
  // 4. Cuma nöbet sayısı (dengele)
  const fridayDuties = getTeacherDutyCountByDayType(academicYearId, teacherId, dormitoryType, DayType.CUMA);
  score += fridayDuties * 30;
  
  return score;
}

/**
 * Belirli bir pansiyon için müsait öğretmenleri al ve adalet skoruna göre sırala
 * 
 * KRİTİK KURAL:
 * - Erkek pansiyonu için SADECE erkek öğretmenler
 * - Kız pansiyonu için SADECE kadın öğretmenler
 */
export function getAvailableTeachers(
  academicYearId: number,
  dormitoryType: DormitoryType,
  date: string,
  dayType: DayType
): { teacher: Teacher; score: number }[] {
  // KRİTİK: Pansiyon tipine göre cinsiyet belirleme
  const gender = dormitoryType === DormitoryType.ERKEK ? Gender.ERKEK : Gender.KADIN;
  
  // O cinsiyetteki aktif öğretmenleri al
  const teachers = getTeachersByGender(gender);
  
  const availableTeachers: { teacher: Teacher; score: number }[] = [];
  
  for (const teacher of teachers) {
    // Mazeret kontrolü
    if (hasExcuseOnDate(teacher.id, date)) {
      continue;
    }
    
    // Aynı gün zaten nöbeti var mı
    if (hasExistingDuty(academicYearId, teacher.id, date)) {
      continue;
    }
    
    // Önceki gün nöbeti var mı (opsiyonel - art arda nöbet engeli)
    // if (hasPreviousDayDuty(academicYearId, teacher.id, date)) {
    //   continue;
    // }
    
    // Adalet skorunu hesapla
    const score = calculateFairnessScore(academicYearId, teacher.id, dormitoryType, date, dayType);
    
    availableTeachers.push({ teacher, score });
  }
  
  // Skora göre sırala (düşük skor = öncelikli)
  availableTeachers.sort((a, b) => a.score - b.score);
  
  return availableTeachers;
}

/**
 * BİR GÜN İÇİN NÖBET DAĞITIMI YAP
 * 
 * TEMEL KURAL: Erkek ve Kız pansiyonları TAMAMEN BAĞIMSIZ
 */
export function distributeDutiesForDay(
  academicYearId: number,
  date: string
): { erkek: (Teacher | null)[]; kiz: (Teacher | null)[]; warnings: string[] } {
  const warnings: string[] = [];
  const dayType = getDayType(new Date(date));
  
  // Tatil kontrolü
  const holidayCheck = isHoliday(academicYearId, date);
  if (holidayCheck.isHoliday && !holidayCheck.hasDuty) {
    return { erkek: [], kiz: [], warnings: [`${date} tatil günü, nöbet yok.`] };
  }
  
  // ERKEK PANSİYONU DAĞITIMI - BAĞIMSIZ
  const erkekDutyCount = getDutyCount(academicYearId, DormitoryType.ERKEK, dayType);
  const availableErkek = getAvailableTeachers(academicYearId, DormitoryType.ERKEK, date, dayType);
  const erkekAssignments: (Teacher | null)[] = [];
  
  for (let i = 0; i < erkekDutyCount; i++) {
    if (i < availableErkek.length) {
      erkekAssignments.push(availableErkek[i].teacher);
    } else {
      erkekAssignments.push(null);
      warnings.push(`${date} - Erkek pansiyonu: ${i + 1}. nöbetçi için yeterli erkek öğretmen yok!`);
    }
  }
  
  // KIZ PANSİYONU DAĞITIMI - BAĞIMSIZ
  const kizDutyCount = getDutyCount(academicYearId, DormitoryType.KIZ, dayType);
  const availableKiz = getAvailableTeachers(academicYearId, DormitoryType.KIZ, date, dayType);
  const kizAssignments: (Teacher | null)[] = [];
  
  for (let i = 0; i < kizDutyCount; i++) {
    if (i < availableKiz.length) {
      kizAssignments.push(availableKiz[i].teacher);
    } else {
      kizAssignments.push(null);
      warnings.push(`${date} - Kız pansiyonu: ${i + 1}. nöbetçi için yeterli kadın öğretmen yok!`);
    }
  }
  
  return { erkek: erkekAssignments, kiz: kizAssignments, warnings };
}

/**
 * Nöbet kaydını veritabanına kaydet
 */
export function saveDutyRecord(
  academicYearId: number,
  teacherId: number,
  date: string,
  dayType: DayType,
  dormitoryType: DormitoryType,
  slotIndex: number,
  isAutoAssigned: boolean = true
): void {
  // Önce varsa sil
  db.prepare(`
    DELETE FROM duty_records 
    WHERE academic_year_id = ? AND date = ? AND dormitory_type = ? AND slot_index = ?
  `).run(academicYearId, date, dormitoryType, slotIndex);
  
  // Yeni kayıt ekle
  db.prepare(`
    INSERT INTO duty_records (academic_year_id, teacher_id, date, day_type, dormitory_type, slot_index, is_auto_assigned)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(academicYearId, teacherId, date, dayType, dormitoryType, slotIndex, isAutoAssigned ? 1 : 0);
}

/**
 * Belirli bir tarih için nöbet kaydını sil
 */
export function deleteDutyRecord(
  academicYearId: number,
  date: string,
  dormitoryType: DormitoryType,
  slotIndex: number
): void {
  db.prepare(`
    DELETE FROM duty_records 
    WHERE academic_year_id = ? AND date = ? AND dormitory_type = ? AND slot_index = ?
  `).run(academicYearId, date, dormitoryType, slotIndex);
}

/**
 * BİR AY İÇİN NÖBET DAĞITIMI YAP VE KAYDET
 */
export function distributeAndSaveMonthlyDuties(
  academicYearId: number,
  year: number,
  month: number
): { success: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // Ayın ilk ve son gününü hesapla
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Her gün için dağıtım yap
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const currentDate = new Date(year, month, day);
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayType = getDayType(currentDate);
    
    const result = distributeDutiesForDay(academicYearId, dateStr);
    warnings.push(...result.warnings);
    
    // Erkek pansiyonu kayıtları
    result.erkek.forEach((teacher, index) => {
      if (teacher) {
        saveDutyRecord(academicYearId, teacher.id, dateStr, dayType, DormitoryType.ERKEK, index, true);
      }
    });
    
    // Kız pansiyonu kayıtları
    result.kiz.forEach((teacher, index) => {
      if (teacher) {
        saveDutyRecord(academicYearId, teacher.id, dateStr, dayType, DormitoryType.KIZ, index, true);
      }
    });
  }
  
  return { success: true, warnings };
}

/**
 * Belirli bir ay için mevcut nöbet kayıtlarını al
 */
export function getMonthlyDutyRecords(
  academicYearId: number,
  year: number,
  month: number
): DutyRecord[] {
  const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0);
  const lastDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
  
  const rows = db.prepare(`
    SELECT * FROM duty_records
    WHERE academic_year_id = ? AND date >= ? AND date <= ?
    ORDER BY date, dormitory_type, slot_index
  `).all(academicYearId, firstDay, lastDayStr) as any[];
  
  return rows.map(row => ({
    id: row.id,
    academicYearId: row.academic_year_id,
    teacherId: row.teacher_id,
    date: row.date,
    dayType: row.day_type as DayType,
    dormitoryType: row.dormitory_type as DormitoryType,
    slotIndex: row.slot_index,
    isAutoAssigned: row.is_auto_assigned === 1,
    isManuallyEdited: row.is_manually_edited === 1,
    createdAt: row.created_at
  }));
}

/**
 * Öğretmen bilgisini ID'ye göre al
 */
export function getTeacherById(teacherId: number): Teacher | null {
  const row = db.prepare('SELECT * FROM teachers WHERE id = ?').get(teacherId) as any;
  
  if (!row) return null;
  
  return {
    id: row.id,
    tcNo: row.tc_no,
    fullName: row.full_name,
    gender: row.gender as Gender,
    branch: row.branch,
    phone: row.phone,
    email: row.email,
    isActive: row.is_active === 1,
    createdAt: row.created_at
  };
}

/**
 * AYLIK NÖBET LİSTESİ VERİSİNİ OLUŞTUR (UI için)
 */
export function getMonthlyDutyList(
  academicYearId: number,
  year: number,
  month: number
): MonthlyDutyList {
  // Maksimum sütun sayılarını al
  const erkekMaxSlots = getMaxDutyCount(academicYearId, DormitoryType.ERKEK);
  const kizMaxSlots = getMaxDutyCount(academicYearId, DormitoryType.KIZ);
  
  // Mevcut nöbet kayıtlarını al
  const dutyRecords = getMonthlyDutyRecords(academicYearId, year, month);
  
  // Kayıtları tarih ve pansiyon tipine göre grupla
  const dutyMap = new Map<string, { erkek: Map<number, Teacher>; kiz: Map<number, Teacher> }>();
  
  for (const record of dutyRecords) {
    if (!dutyMap.has(record.date)) {
      dutyMap.set(record.date, { erkek: new Map(), kiz: new Map() });
    }
    
    const dayData = dutyMap.get(record.date)!;
    const teacher = getTeacherById(record.teacherId);
    
    if (teacher) {
      if (record.dormitoryType === DormitoryType.ERKEK) {
        dayData.erkek.set(record.slotIndex, teacher);
      } else {
        dayData.kiz.set(record.slotIndex, teacher);
      }
    }
  }
  
  // Ayın günlerini oluştur
  const lastDay = new Date(year, month + 1, 0);
  const days: DailyDutyData[] = [];
  
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const currentDate = new Date(year, month, day);
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayType = getDayType(currentDate);
    const dayOfWeek = currentDate.getDay();
    
    // Tatil kontrolü
    const holidayInfo = isHoliday(academicYearId, dateStr);
    
    // O gün için nöbetçi sayıları
    const erkekDutyCount = getDutyCount(academicYearId, DormitoryType.ERKEK, dayType);
    const kizDutyCount = getDutyCount(academicYearId, DormitoryType.KIZ, dayType);
    
    // Nöbet kayıtlarını al
    const dayDuties = dutyMap.get(dateStr) || { erkek: new Map(), kiz: new Map() };
    
    // Erkek pansiyonu için slot'ları doldur
    const erkekDuties: (Teacher | null)[] = [];
    for (let i = 0; i < erkekMaxSlots; i++) {
      if (i < erkekDutyCount) {
        erkekDuties.push(dayDuties.erkek.get(i) || null);
      } else {
        erkekDuties.push(null); // Boş hücre (o gün için gerekli değil)
      }
    }
    
    // Kız pansiyonu için slot'ları doldur
    const kizDuties: (Teacher | null)[] = [];
    for (let i = 0; i < kizMaxSlots; i++) {
      if (i < kizDutyCount) {
        kizDuties.push(dayDuties.kiz.get(i) || null);
      } else {
        kizDuties.push(null);
      }
    }
    
    days.push({
      date: dateStr,
      dayType,
      dayName: DAY_NAMES[dayOfWeek],
      dayOfMonth: day,
      isHoliday: holidayInfo.isHoliday && !holidayInfo.hasDuty,
      holidayDescription: holidayInfo.description,
      erkekDuties,
      kizDuties
    });
  }
  
  return {
    year,
    month,
    monthName: MONTH_NAMES[month],
    erkekMaxSlots,
    kizMaxSlots,
    days
  };
}

/**
 * Öğretmen nöbet istatistiklerini al
 */
export function getTeacherStats(academicYearId: number, dormitoryType: DormitoryType): TeacherDutyStats[] {
  const gender = dormitoryType === DormitoryType.ERKEK ? Gender.ERKEK : Gender.KADIN;
  const teachers = getTeachersByGender(gender);
  
  const stats: TeacherDutyStats[] = [];
  
  for (const teacher of teachers) {
    const totalDuties = getTeacherDutyCount(academicYearId, teacher.id, dormitoryType);
    const weekdayDuties = getTeacherDutyCountByDayType(academicYearId, teacher.id, dormitoryType, DayType.HAFTA_ICI);
    const fridayDuties = getTeacherDutyCountByDayType(academicYearId, teacher.id, dormitoryType, DayType.CUMA);
    const saturdayDuties = getTeacherDutyCountByDayType(academicYearId, teacher.id, dormitoryType, DayType.CUMARTESI);
    const sundayDuties = getTeacherDutyCountByDayType(academicYearId, teacher.id, dormitoryType, DayType.PAZAR);
    const lastDutyDate = getTeacherLastDutyDate(academicYearId, teacher.id, dormitoryType);
    const fairnessScore = calculateFairnessScore(academicYearId, teacher.id, dormitoryType, new Date().toISOString().split('T')[0], DayType.HAFTA_ICI);
    
    stats.push({
      teacherId: teacher.id,
      teacherName: teacher.fullName,
      totalDuties,
      weekdayDuties,
      fridayDuties,
      saturdayDuties,
      sundayDuties,
      lastDutyDate: lastDutyDate ?? undefined,
      fairnessScore
    });
  }
  
  return stats.sort((a, b) => a.fairnessScore - b.fairnessScore);
}

/**
 * Belirli bir ay için nöbet kayıtlarını sil
 */
export function clearMonthlyDuties(academicYearId: number, year: number, month: number): void {
  const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0);
  const lastDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
  
  db.prepare(`
    DELETE FROM duty_records
    WHERE academic_year_id = ? AND date >= ? AND date <= ?
  `).run(academicYearId, firstDay, lastDayStr);
}
