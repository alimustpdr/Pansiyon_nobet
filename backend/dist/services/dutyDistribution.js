"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDayType = getDayType;
exports.getDutyCount = getDutyCount;
exports.getMaxDutyCount = getMaxDutyCount;
exports.getAllDormitorySettings = getAllDormitorySettings;
exports.getTeachersByGender = getTeachersByGender;
exports.hasExcuseOnDate = hasExcuseOnDate;
exports.isHoliday = isHoliday;
exports.getTeacherDutyCount = getTeacherDutyCount;
exports.getTeacherDutyCountByDayType = getTeacherDutyCountByDayType;
exports.getTeacherLastDutyDate = getTeacherLastDutyDate;
exports.hasExistingDuty = hasExistingDuty;
exports.hasPreviousDayDuty = hasPreviousDayDuty;
exports.calculateFairnessScore = calculateFairnessScore;
exports.getAvailableTeachers = getAvailableTeachers;
exports.distributeDutiesForDay = distributeDutiesForDay;
exports.saveDutyRecord = saveDutyRecord;
exports.deleteDutyRecord = deleteDutyRecord;
exports.distributeAndSaveMonthlyDuties = distributeAndSaveMonthlyDuties;
exports.getMonthlyDutyRecords = getMonthlyDutyRecords;
exports.getTeacherById = getTeacherById;
exports.getMonthlyDutyList = getMonthlyDutyList;
exports.getTeacherStats = getTeacherStats;
exports.clearMonthlyDuties = clearMonthlyDuties;
const init_js_1 = require("../database/init.js");
const index_js_1 = require("../types/index.js");
// Türkçe gün isimleri
const DAY_NAMES = {
    0: 'Pazar',
    1: 'Pazartesi',
    2: 'Salı',
    3: 'Çarşamba',
    4: 'Perşembe',
    5: 'Cuma',
    6: 'Cumartesi'
};
// Türkçe ay isimleri
const MONTH_NAMES = {
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
function getDayType(date) {
    const dayOfWeek = date.getDay();
    switch (dayOfWeek) {
        case 0: return index_js_1.DayType.PAZAR;
        case 5: return index_js_1.DayType.CUMA;
        case 6: return index_js_1.DayType.CUMARTESI;
        default: return index_js_1.DayType.HAFTA_ICI;
    }
}
/**
 * Belirli bir pansiyon ve gün tipi için nöbetçi sayısını al
 */
function getDutyCount(academicYearId, dormitoryType, dayType) {
    const result = init_js_1.db.prepare(`
    SELECT duty_count FROM dormitory_settings
    WHERE academic_year_id = ? AND dormitory_type = ? AND day_type = ?
  `).get(academicYearId, dormitoryType, dayType);
    return result?.duty_count ?? 1;
}
/**
 * Bir pansiyon için maksimum nöbetçi sayısını al (tüm gün tipleri arasından)
 */
function getMaxDutyCount(academicYearId, dormitoryType) {
    const result = init_js_1.db.prepare(`
    SELECT MAX(duty_count) as max_count FROM dormitory_settings
    WHERE academic_year_id = ? AND dormitory_type = ?
  `).get(academicYearId, dormitoryType);
    return result?.max_count ?? 1;
}
/**
 * Tüm pansiyon ayarlarını al
 */
function getAllDormitorySettings(academicYearId) {
    return init_js_1.db.prepare(`
    SELECT * FROM dormitory_settings WHERE academic_year_id = ?
  `).all(academicYearId);
}
/**
 * Belirli bir cinsiyete göre aktif öğretmenleri al
 */
function getTeachersByGender(gender) {
    const rows = init_js_1.db.prepare(`
    SELECT * FROM teachers WHERE gender = ? AND is_active = 1 ORDER BY full_name
  `).all(gender);
    return rows.map(row => ({
        id: row.id,
        tcNo: row.tc_no,
        fullName: row.full_name,
        gender: row.gender,
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
function hasExcuseOnDate(teacherId, date) {
    const result = init_js_1.db.prepare(`
    SELECT COUNT(*) as count FROM teacher_excuses
    WHERE teacher_id = ? AND ? BETWEEN start_date AND end_date
  `).get(teacherId, date);
    return result.count > 0;
}
/**
 * Belirli bir tarih tatil mi kontrol et
 */
function isHoliday(academicYearId, date) {
    const result = init_js_1.db.prepare(`
    SELECT description, has_duty FROM holidays
    WHERE academic_year_id = ? AND date = ?
  `).get(academicYearId, date);
    if (result) {
        return { isHoliday: true, description: result.description, hasDuty: result.has_duty === 1 };
    }
    return { isHoliday: false };
}
/**
 * Öğretmenin toplam nöbet sayısını al
 */
function getTeacherDutyCount(academicYearId, teacherId, dormitoryType) {
    const result = init_js_1.db.prepare(`
    SELECT COUNT(*) as count FROM duty_records
    WHERE academic_year_id = ? AND teacher_id = ? AND dormitory_type = ?
  `).get(academicYearId, teacherId, dormitoryType);
    return result.count;
}
/**
 * Öğretmenin belirli bir gün tipindeki nöbet sayısını al
 */
function getTeacherDutyCountByDayType(academicYearId, teacherId, dormitoryType, dayType) {
    const result = init_js_1.db.prepare(`
    SELECT COUNT(*) as count FROM duty_records
    WHERE academic_year_id = ? AND teacher_id = ? AND dormitory_type = ? AND day_type = ?
  `).get(academicYearId, teacherId, dormitoryType, dayType);
    return result.count;
}
/**
 * Öğretmenin son nöbet tarihini al
 */
function getTeacherLastDutyDate(academicYearId, teacherId, dormitoryType) {
    const result = init_js_1.db.prepare(`
    SELECT date FROM duty_records
    WHERE academic_year_id = ? AND teacher_id = ? AND dormitory_type = ?
    ORDER BY date DESC LIMIT 1
  `).get(academicYearId, teacherId, dormitoryType);
    return result?.date ?? null;
}
/**
 * Öğretmenin belirli bir tarihte zaten nöbeti var mı kontrol et
 */
function hasExistingDuty(academicYearId, teacherId, date) {
    const result = init_js_1.db.prepare(`
    SELECT COUNT(*) as count FROM duty_records
    WHERE academic_year_id = ? AND teacher_id = ? AND date = ?
  `).get(academicYearId, teacherId, date);
    return result.count > 0;
}
/**
 * Öğretmenin önceki gün nöbeti var mı kontrol et
 */
function hasPreviousDayDuty(academicYearId, teacherId, date) {
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    return hasExistingDuty(academicYearId, teacherId, prevDateStr);
}
/**
 * ADALET SKORU HESAPLAMA
 * Düşük skor = Öncelikli atama
 */
function calculateFairnessScore(academicYearId, teacherId, dormitoryType, targetDate, targetDayType) {
    let score = 0;
    // 1. Toplam nöbet sayısı (çok tutan geriye)
    const totalDuties = getTeacherDutyCount(academicYearId, teacherId, dormitoryType);
    score += totalDuties * 100;
    // 2. Son nöbetten geçen gün (uzun süre tutmayan öne)
    const lastDutyDate = getTeacherLastDutyDate(academicYearId, teacherId, dormitoryType);
    if (lastDutyDate) {
        const daysSinceLastDuty = Math.floor((new Date(targetDate).getTime() - new Date(lastDutyDate).getTime()) / (1000 * 60 * 60 * 24));
        score -= daysSinceLastDuty * 10;
    }
    else {
        // Hiç nöbet tutmamış - çok öncelikli
        score -= 1000;
    }
    // 3. Hafta sonu nöbet sayısı (dengele)
    const saturdayDuties = getTeacherDutyCountByDayType(academicYearId, teacherId, dormitoryType, index_js_1.DayType.CUMARTESI);
    const sundayDuties = getTeacherDutyCountByDayType(academicYearId, teacherId, dormitoryType, index_js_1.DayType.PAZAR);
    score += (saturdayDuties + sundayDuties) * 50;
    // 4. Cuma nöbet sayısı (dengele)
    const fridayDuties = getTeacherDutyCountByDayType(academicYearId, teacherId, dormitoryType, index_js_1.DayType.CUMA);
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
function getAvailableTeachers(academicYearId, dormitoryType, date, dayType) {
    // KRİTİK: Pansiyon tipine göre cinsiyet belirleme
    const gender = dormitoryType === index_js_1.DormitoryType.ERKEK ? index_js_1.Gender.ERKEK : index_js_1.Gender.KADIN;
    // O cinsiyetteki aktif öğretmenleri al
    const teachers = getTeachersByGender(gender);
    const availableTeachers = [];
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
function distributeDutiesForDay(academicYearId, date) {
    const warnings = [];
    const dayType = getDayType(new Date(date));
    // Tatil kontrolü
    const holidayCheck = isHoliday(academicYearId, date);
    if (holidayCheck.isHoliday && !holidayCheck.hasDuty) {
        return { erkek: [], kiz: [], warnings: [`${date} tatil günü, nöbet yok.`] };
    }
    // ERKEK PANSİYONU DAĞITIMI - BAĞIMSIZ
    const erkekDutyCount = getDutyCount(academicYearId, index_js_1.DormitoryType.ERKEK, dayType);
    const availableErkek = getAvailableTeachers(academicYearId, index_js_1.DormitoryType.ERKEK, date, dayType);
    const erkekAssignments = [];
    for (let i = 0; i < erkekDutyCount; i++) {
        if (i < availableErkek.length) {
            erkekAssignments.push(availableErkek[i].teacher);
        }
        else {
            erkekAssignments.push(null);
            warnings.push(`${date} - Erkek pansiyonu: ${i + 1}. nöbetçi için yeterli erkek öğretmen yok!`);
        }
    }
    // KIZ PANSİYONU DAĞITIMI - BAĞIMSIZ
    const kizDutyCount = getDutyCount(academicYearId, index_js_1.DormitoryType.KIZ, dayType);
    const availableKiz = getAvailableTeachers(academicYearId, index_js_1.DormitoryType.KIZ, date, dayType);
    const kizAssignments = [];
    for (let i = 0; i < kizDutyCount; i++) {
        if (i < availableKiz.length) {
            kizAssignments.push(availableKiz[i].teacher);
        }
        else {
            kizAssignments.push(null);
            warnings.push(`${date} - Kız pansiyonu: ${i + 1}. nöbetçi için yeterli kadın öğretmen yok!`);
        }
    }
    return { erkek: erkekAssignments, kiz: kizAssignments, warnings };
}
/**
 * Nöbet kaydını veritabanına kaydet
 */
function saveDutyRecord(academicYearId, teacherId, date, dayType, dormitoryType, slotIndex, isAutoAssigned = true) {
    // Önce varsa sil
    init_js_1.db.prepare(`
    DELETE FROM duty_records 
    WHERE academic_year_id = ? AND date = ? AND dormitory_type = ? AND slot_index = ?
  `).run(academicYearId, date, dormitoryType, slotIndex);
    // Yeni kayıt ekle
    init_js_1.db.prepare(`
    INSERT INTO duty_records (academic_year_id, teacher_id, date, day_type, dormitory_type, slot_index, is_auto_assigned)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(academicYearId, teacherId, date, dayType, dormitoryType, slotIndex, isAutoAssigned ? 1 : 0);
}
/**
 * Belirli bir tarih için nöbet kaydını sil
 */
function deleteDutyRecord(academicYearId, date, dormitoryType, slotIndex) {
    init_js_1.db.prepare(`
    DELETE FROM duty_records 
    WHERE academic_year_id = ? AND date = ? AND dormitory_type = ? AND slot_index = ?
  `).run(academicYearId, date, dormitoryType, slotIndex);
}
/**
 * BİR AY İÇİN NÖBET DAĞITIMI YAP VE KAYDET
 */
function distributeAndSaveMonthlyDuties(academicYearId, year, month) {
    const warnings = [];
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
                saveDutyRecord(academicYearId, teacher.id, dateStr, dayType, index_js_1.DormitoryType.ERKEK, index, true);
            }
        });
        // Kız pansiyonu kayıtları
        result.kiz.forEach((teacher, index) => {
            if (teacher) {
                saveDutyRecord(academicYearId, teacher.id, dateStr, dayType, index_js_1.DormitoryType.KIZ, index, true);
            }
        });
    }
    return { success: true, warnings };
}
/**
 * Belirli bir ay için mevcut nöbet kayıtlarını al
 */
function getMonthlyDutyRecords(academicYearId, year, month) {
    const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0);
    const lastDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
    const rows = init_js_1.db.prepare(`
    SELECT * FROM duty_records
    WHERE academic_year_id = ? AND date >= ? AND date <= ?
    ORDER BY date, dormitory_type, slot_index
  `).all(academicYearId, firstDay, lastDayStr);
    return rows.map(row => ({
        id: row.id,
        academicYearId: row.academic_year_id,
        teacherId: row.teacher_id,
        date: row.date,
        dayType: row.day_type,
        dormitoryType: row.dormitory_type,
        slotIndex: row.slot_index,
        isAutoAssigned: row.is_auto_assigned === 1,
        isManuallyEdited: row.is_manually_edited === 1,
        createdAt: row.created_at
    }));
}
/**
 * Öğretmen bilgisini ID'ye göre al
 */
function getTeacherById(teacherId) {
    const row = init_js_1.db.prepare('SELECT * FROM teachers WHERE id = ?').get(teacherId);
    if (!row)
        return null;
    return {
        id: row.id,
        tcNo: row.tc_no,
        fullName: row.full_name,
        gender: row.gender,
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
function getMonthlyDutyList(academicYearId, year, month) {
    // Maksimum sütun sayılarını al
    const erkekMaxSlots = getMaxDutyCount(academicYearId, index_js_1.DormitoryType.ERKEK);
    const kizMaxSlots = getMaxDutyCount(academicYearId, index_js_1.DormitoryType.KIZ);
    // Mevcut nöbet kayıtlarını al
    const dutyRecords = getMonthlyDutyRecords(academicYearId, year, month);
    // Kayıtları tarih ve pansiyon tipine göre grupla
    const dutyMap = new Map();
    for (const record of dutyRecords) {
        if (!dutyMap.has(record.date)) {
            dutyMap.set(record.date, { erkek: new Map(), kiz: new Map() });
        }
        const dayData = dutyMap.get(record.date);
        const teacher = getTeacherById(record.teacherId);
        if (teacher) {
            if (record.dormitoryType === index_js_1.DormitoryType.ERKEK) {
                dayData.erkek.set(record.slotIndex, teacher);
            }
            else {
                dayData.kiz.set(record.slotIndex, teacher);
            }
        }
    }
    // Ayın günlerini oluştur
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(year, month, day);
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayType = getDayType(currentDate);
        const dayOfWeek = currentDate.getDay();
        // Tatil kontrolü
        const holidayInfo = isHoliday(academicYearId, dateStr);
        // O gün için nöbetçi sayıları
        const erkekDutyCount = getDutyCount(academicYearId, index_js_1.DormitoryType.ERKEK, dayType);
        const kizDutyCount = getDutyCount(academicYearId, index_js_1.DormitoryType.KIZ, dayType);
        // Nöbet kayıtlarını al
        const dayDuties = dutyMap.get(dateStr) || { erkek: new Map(), kiz: new Map() };
        // Erkek pansiyonu için slot'ları doldur
        const erkekDuties = [];
        for (let i = 0; i < erkekMaxSlots; i++) {
            if (i < erkekDutyCount) {
                erkekDuties.push(dayDuties.erkek.get(i) || null);
            }
            else {
                erkekDuties.push(null); // Boş hücre (o gün için gerekli değil)
            }
        }
        // Kız pansiyonu için slot'ları doldur
        const kizDuties = [];
        for (let i = 0; i < kizMaxSlots; i++) {
            if (i < kizDutyCount) {
                kizDuties.push(dayDuties.kiz.get(i) || null);
            }
            else {
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
function getTeacherStats(academicYearId, dormitoryType) {
    const gender = dormitoryType === index_js_1.DormitoryType.ERKEK ? index_js_1.Gender.ERKEK : index_js_1.Gender.KADIN;
    const teachers = getTeachersByGender(gender);
    const stats = [];
    for (const teacher of teachers) {
        const totalDuties = getTeacherDutyCount(academicYearId, teacher.id, dormitoryType);
        const weekdayDuties = getTeacherDutyCountByDayType(academicYearId, teacher.id, dormitoryType, index_js_1.DayType.HAFTA_ICI);
        const fridayDuties = getTeacherDutyCountByDayType(academicYearId, teacher.id, dormitoryType, index_js_1.DayType.CUMA);
        const saturdayDuties = getTeacherDutyCountByDayType(academicYearId, teacher.id, dormitoryType, index_js_1.DayType.CUMARTESI);
        const sundayDuties = getTeacherDutyCountByDayType(academicYearId, teacher.id, dormitoryType, index_js_1.DayType.PAZAR);
        const lastDutyDate = getTeacherLastDutyDate(academicYearId, teacher.id, dormitoryType);
        const fairnessScore = calculateFairnessScore(academicYearId, teacher.id, dormitoryType, new Date().toISOString().split('T')[0], index_js_1.DayType.HAFTA_ICI);
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
function clearMonthlyDuties(academicYearId, year, month) {
    const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0);
    const lastDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
    init_js_1.db.prepare(`
    DELETE FROM duty_records
    WHERE academic_year_id = ? AND date >= ? AND date <= ?
  `).run(academicYearId, firstDay, lastDayStr);
}
//# sourceMappingURL=dutyDistribution.js.map