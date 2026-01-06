// Day types for duty scheduling
export type DayType = 'weekday' | 'friday' | 'saturday' | 'sunday';

// Dormitory types
export type DormitoryType = 'male' | 'female';

// Guard assignment for a single cell
export interface GuardAssignment {
  teacherId: string | null;
  teacherName: string;
}

// Single day's duty assignment for a dormitory
export interface DayDuty {
  date: string; // ISO date string
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  dayType: DayType;
  guards: GuardAssignment[];
}

// Complete duty roster for a month
export interface MonthlyDutyRoster {
  year: number;
  month: number; // 1-12
  maleDormitory: DayDuty[];
  femaleDormitory: DayDuty[];
}

// Teacher information
export interface Teacher {
  id: string;
  name: string;
  gender: 'male' | 'female';
  isActive: boolean;
}

// Settings for guard counts per day type
export interface DormitorySettings {
  weekdayGuardCount: number;
  fridayGuardCount: number;
  saturdayGuardCount: number;
  sundayGuardCount: number;
}

// Application settings
export interface AppSettings {
  schoolName: string;
  activePeriod: string;
  maleDormitory: DormitorySettings;
  femaleDormitory: DormitorySettings;
}

// Column configuration for table
export interface ColumnConfig {
  maleDormitoryMaxColumns: number;
  femaleDormitoryMaxColumns: number;
}

// Cell edit modal state
export interface CellEditState {
  isOpen: boolean;
  dormitory: DormitoryType | null;
  dayIndex: number | null;
  guardIndex: number | null;
  currentValue: string;
  maxAllowed: number;
  currentCount: number;
}

// Distribution state
export interface DistributionState {
  isDistributed: boolean;
  lastDistributedAt: string | null;
}

// Export options
export interface ExportOptions {
  format: 'pdf' | 'excel';
  orientation: 'portrait' | 'landscape' | 'auto';
  includeHeader: boolean;
}

// Helper function to determine day type from date
export function getDayType(date: Date): DayType {
  const dayOfWeek = date.getDay();
  switch (dayOfWeek) {
    case 0: return 'sunday';
    case 5: return 'friday';
    case 6: return 'saturday';
    default: return 'weekday';
  }
}

// Get guard count for a specific day type from settings
export function getGuardCountForDayType(settings: DormitorySettings, dayType: DayType): number {
  switch (dayType) {
    case 'weekday': return settings.weekdayGuardCount;
    case 'friday': return settings.fridayGuardCount;
    case 'saturday': return settings.saturdayGuardCount;
    case 'sunday': return settings.sundayGuardCount;
  }
}

// Calculate maximum columns needed for a dormitory
export function calculateMaxColumns(settings: DormitorySettings): number {
  return Math.max(
    settings.weekdayGuardCount,
    settings.fridayGuardCount,
    settings.saturdayGuardCount,
    settings.sundayGuardCount
  );
}

// Turkish day names
export const TURKISH_DAY_NAMES = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi'
];

// Turkish month names
export const TURKISH_MONTH_NAMES = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık'
];
