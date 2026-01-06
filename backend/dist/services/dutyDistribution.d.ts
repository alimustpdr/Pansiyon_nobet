import { DayType, DormitoryType, Gender, Teacher, DutyRecord, MonthlyDutyList, TeacherDutyStats } from '../types/index.js';
/**
 * Tarihin gün tipini belirle
 */
export declare function getDayType(date: Date): DayType;
/**
 * Belirli bir pansiyon ve gün tipi için nöbetçi sayısını al
 */
export declare function getDutyCount(academicYearId: number, dormitoryType: DormitoryType, dayType: DayType): number;
/**
 * Bir pansiyon için maksimum nöbetçi sayısını al (tüm gün tipleri arasından)
 */
export declare function getMaxDutyCount(academicYearId: number, dormitoryType: DormitoryType): number;
/**
 * Tüm pansiyon ayarlarını al
 */
export declare function getAllDormitorySettings(academicYearId: number): unknown[];
/**
 * Belirli bir cinsiyete göre aktif öğretmenleri al
 */
export declare function getTeachersByGender(gender: Gender): Teacher[];
/**
 * Belirli bir tarihte öğretmenin mazereti var mı kontrol et
 */
export declare function hasExcuseOnDate(teacherId: number, date: string): boolean;
/**
 * Belirli bir tarih tatil mi kontrol et
 */
export declare function isHoliday(academicYearId: number, date: string): {
    isHoliday: boolean;
    description?: string;
    hasDuty?: boolean;
};
/**
 * Öğretmenin toplam nöbet sayısını al
 */
export declare function getTeacherDutyCount(academicYearId: number, teacherId: number, dormitoryType: DormitoryType): number;
/**
 * Öğretmenin belirli bir gün tipindeki nöbet sayısını al
 */
export declare function getTeacherDutyCountByDayType(academicYearId: number, teacherId: number, dormitoryType: DormitoryType, dayType: DayType): number;
/**
 * Öğretmenin son nöbet tarihini al
 */
export declare function getTeacherLastDutyDate(academicYearId: number, teacherId: number, dormitoryType: DormitoryType): string | null;
/**
 * Öğretmenin belirli bir tarihte zaten nöbeti var mı kontrol et
 */
export declare function hasExistingDuty(academicYearId: number, teacherId: number, date: string): boolean;
/**
 * Öğretmenin önceki gün nöbeti var mı kontrol et
 */
export declare function hasPreviousDayDuty(academicYearId: number, teacherId: number, date: string): boolean;
/**
 * ADALET SKORU HESAPLAMA
 * Düşük skor = Öncelikli atama
 */
export declare function calculateFairnessScore(academicYearId: number, teacherId: number, dormitoryType: DormitoryType, targetDate: string, targetDayType: DayType): number;
/**
 * Belirli bir pansiyon için müsait öğretmenleri al ve adalet skoruna göre sırala
 *
 * KRİTİK KURAL:
 * - Erkek pansiyonu için SADECE erkek öğretmenler
 * - Kız pansiyonu için SADECE kadın öğretmenler
 */
export declare function getAvailableTeachers(academicYearId: number, dormitoryType: DormitoryType, date: string, dayType: DayType): {
    teacher: Teacher;
    score: number;
}[];
/**
 * BİR GÜN İÇİN NÖBET DAĞITIMI YAP
 *
 * TEMEL KURAL: Erkek ve Kız pansiyonları TAMAMEN BAĞIMSIZ
 */
export declare function distributeDutiesForDay(academicYearId: number, date: string): {
    erkek: (Teacher | null)[];
    kiz: (Teacher | null)[];
    warnings: string[];
};
/**
 * Nöbet kaydını veritabanına kaydet
 */
export declare function saveDutyRecord(academicYearId: number, teacherId: number, date: string, dayType: DayType, dormitoryType: DormitoryType, slotIndex: number, isAutoAssigned?: boolean): void;
/**
 * Belirli bir tarih için nöbet kaydını sil
 */
export declare function deleteDutyRecord(academicYearId: number, date: string, dormitoryType: DormitoryType, slotIndex: number): void;
/**
 * BİR AY İÇİN NÖBET DAĞITIMI YAP VE KAYDET
 */
export declare function distributeAndSaveMonthlyDuties(academicYearId: number, year: number, month: number): {
    success: boolean;
    warnings: string[];
};
/**
 * Belirli bir ay için mevcut nöbet kayıtlarını al
 */
export declare function getMonthlyDutyRecords(academicYearId: number, year: number, month: number): DutyRecord[];
/**
 * Öğretmen bilgisini ID'ye göre al
 */
export declare function getTeacherById(teacherId: number): Teacher | null;
/**
 * AYLIK NÖBET LİSTESİ VERİSİNİ OLUŞTUR (UI için)
 */
export declare function getMonthlyDutyList(academicYearId: number, year: number, month: number): MonthlyDutyList;
/**
 * Öğretmen nöbet istatistiklerini al
 */
export declare function getTeacherStats(academicYearId: number, dormitoryType: DormitoryType): TeacherDutyStats[];
/**
 * Belirli bir ay için nöbet kayıtlarını sil
 */
export declare function clearMonthlyDuties(academicYearId: number, year: number, month: number): void;
//# sourceMappingURL=dutyDistribution.d.ts.map