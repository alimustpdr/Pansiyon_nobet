export declare enum Gender {
    ERKEK = "ERKEK",
    KADIN = "KADIN"
}
export declare enum DormitoryType {
    ERKEK = "ERKEK",
    KIZ = "KIZ"
}
export declare enum DayType {
    HAFTA_ICI = "HAFTA_ICI",
    CUMA = "CUMA",
    CUMARTESI = "CUMARTESI",
    PAZAR = "PAZAR"
}
export interface AcademicYear {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
}
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
export interface DormitorySettings {
    id: number;
    academicYearId: number;
    dormitoryType: DormitoryType;
    dayType: DayType;
    dutyCount: number;
}
export interface Holiday {
    id: number;
    academicYearId: number;
    date: string;
    description: string;
    hasDuty: boolean;
}
export interface TeacherExcuse {
    id: number;
    teacherId: number;
    startDate: string;
    endDate: string;
    excuseType: string;
    description?: string;
    createdAt: string;
}
export interface DutyRecord {
    id: number;
    academicYearId: number;
    teacherId: number;
    date: string;
    dayType: DayType;
    dormitoryType: DormitoryType;
    slotIndex: number;
    isAutoAssigned: boolean;
    isManuallyEdited: boolean;
    createdAt: string;
}
export interface SchoolSettings {
    id: number;
    schoolName: string;
    academicYearId: number;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
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
export interface MonthlyDutyList {
    year: number;
    month: number;
    monthName: string;
    erkekMaxSlots: number;
    kizMaxSlots: number;
    days: DailyDutyData[];
}
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
//# sourceMappingURL=index.d.ts.map