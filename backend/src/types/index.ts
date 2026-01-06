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
  name: string;           // örn: "2025-2026"
  startDate: string;      // ISO date string
  endDate: string;        // ISO date string
  isActive: boolean;
  createdAt: string;
}

// Öğretmen
export interface Teacher {
  id: number;
  tcNo: string;
  fullName: string;
  gender: Gender;
  branch: string;         // Branş
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
  dutyCount: number;      // O gün için gereken nöbetçi sayısı
}

// Tatil/Özel Gün
export interface Holiday {
  id: number;
  academicYearId: number;
  date: string;           // ISO date string
  description: string;
  hasDuty: boolean;       // Nöbet var mı?
}

// Öğretmen Mazeret
export interface TeacherExcuse {
  id: number;
  teacherId: number;
  startDate: string;
  endDate: string;
  excuseType: string;     // rapor, izin, görev vb.
  description?: string;
  createdAt: string;
}

// Nöbet Kaydı
export interface DutyRecord {
  id: number;
  academicYearId: number;
  teacherId: number;
  date: string;           // ISO date string
  dayType: DayType;
  dormitoryType: DormitoryType;
  slotIndex: number;      // Hangi sırada (0, 1, 2...)
  isAutoAssigned: boolean;
  isManuallyEdited: boolean;
  createdAt: string;
}

// Okul Ayarları
export interface SchoolSettings {
  id: number;
  schoolName: string;
  academicYearId: number;
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
