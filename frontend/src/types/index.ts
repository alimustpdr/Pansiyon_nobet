// Cinsiyet enum
export enum Gender {
  ERKEK = 'ERKEK',
  KADIN = 'KADIN'
}

// Pansiyon tipi enum
export enum DormitoryType {
  ERKEK = 'ERKEK',
  KIZ = 'KIZ'
}

// Gün tipi enum
export enum DayType {
  HAFTA_ICI = 'HAFTA_ICI',
  CUMA = 'CUMA',
  CUMARTESI = 'CUMARTESI',
  PAZAR = 'PAZAR'
}

// Eğitim-Öğretim Yılı
export interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

// Öğretmen
export interface Teacher {
  id: number;
  tcNo: string;
  fullName: string;
  gender: Gender;
  branch: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

// Pansiyon Ayarları
export interface DormitorySettings {
  id: number;
  academicYearId: number;
  dormitoryType: DormitoryType;
  dayType: DayType;
  dutyCount: number;
}

// Tatil/Özel Gün
export interface Holiday {
  id: number;
  academicYearId: number;
  date: string;
  description: string;
  hasDuty: boolean;
}

// Öğretmen Mazeret
export interface TeacherExcuse {
  id: number;
  teacherId: number;
  teacherName?: string;
  startDate: string;
  endDate: string;
  excuseType: string;
  description?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Nöbet dağıtım için günlük veri
export interface DailyDutyData {
  date: string;
  dayType: DayType;
  dayName: string;
  dayOfMonth: number;
  isHoliday: boolean;
  holidayDescription?: string;
  erkekDuties: (Teacher | null)[];
  kizDuties: (Teacher | null)[];
}

// Aylık nöbet listesi
export interface MonthlyDutyList {
  year: number;
  month: number;
  monthName: string;
  erkekMaxSlots: number;
  kizMaxSlots: number;
  days: DailyDutyData[];
}

// Öğretmen nöbet istatistikleri
export interface TeacherDutyStats {
  teacherId: number;
  teacherName: string;
  totalDuties: number;
  weekdayDuties: number;
  fridayDuties: number;
  saturdayDuties: number;
  sundayDuties: number;
  lastDutyDate?: string;
  fairnessScore: number;
}

// Gün tipi Türkçe isimleri
export const DAY_TYPE_NAMES: Record<DayType, string> = {
  [DayType.HAFTA_ICI]: 'Hafta İçi',
  [DayType.CUMA]: 'Cuma',
  [DayType.CUMARTESI]: 'Cumartesi',
  [DayType.PAZAR]: 'Pazar'
};

// Ay isimleri
export const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];
