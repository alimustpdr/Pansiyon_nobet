"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const init_js_1 = require("../database/init.js");
const index_js_1 = require("../types/index.js");
const dutyDistribution_js_1 = require("../services/dutyDistribution.js");
const router = (0, express_1.Router)();
// Aylık nöbet listesini getir
router.get('/monthly/:academicYearId/:year/:month', (req, res) => {
    try {
        const academicYearId = parseInt(req.params.academicYearId);
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month) - 1; // 0-indexed
        const dutyList = (0, dutyDistribution_js_1.getMonthlyDutyList)(academicYearId, year, month);
        const response = { success: true, data: dutyList };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Aylık nöbet dağıtımı yap
router.post('/distribute/:academicYearId/:year/:month', (req, res) => {
    try {
        const academicYearId = parseInt(req.params.academicYearId);
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month) - 1; // 0-indexed
        // Önce mevcut kayıtları temizle
        (0, dutyDistribution_js_1.clearMonthlyDuties)(academicYearId, year, month);
        // Yeni dağıtım yap
        const result = (0, dutyDistribution_js_1.distributeAndSaveMonthlyDuties)(academicYearId, year, month);
        // Güncel listeyi getir
        const dutyList = (0, dutyDistribution_js_1.getMonthlyDutyList)(academicYearId, year, month);
        const response = {
            success: true,
            data: { dutyList, warnings: result.warnings }
        };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Aylık nöbet kayıtlarını temizle
router.delete('/monthly/:academicYearId/:year/:month', (req, res) => {
    try {
        const academicYearId = parseInt(req.params.academicYearId);
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month) - 1; // 0-indexed
        (0, dutyDistribution_js_1.clearMonthlyDuties)(academicYearId, year, month);
        const response = { success: true };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Tek bir nöbet kaydı ekle/güncelle (manuel düzenleme)
router.post('/assign', (req, res) => {
    try {
        const { academicYearId, teacherId, date, dormitoryType, slotIndex } = req.body;
        if (!academicYearId || !teacherId || !date || !dormitoryType || slotIndex === undefined) {
            const response = { success: false, error: 'Tüm alanlar zorunludur' };
            return res.status(400).json(response);
        }
        // Öğretmeni kontrol et
        const teacher = (0, dutyDistribution_js_1.getTeacherById)(teacherId);
        if (!teacher) {
            const response = { success: false, error: 'Öğretmen bulunamadı' };
            return res.status(404).json(response);
        }
        // CİNSİYET KONTROLÜ - KRİTİK!
        if (dormitoryType === index_js_1.DormitoryType.ERKEK && teacher.gender !== index_js_1.Gender.ERKEK) {
            const response = {
                success: false,
                error: 'Erkek pansiyonuna sadece ERKEK öğretmen atanabilir!'
            };
            return res.status(400).json(response);
        }
        if (dormitoryType === index_js_1.DormitoryType.KIZ && teacher.gender !== index_js_1.Gender.KADIN) {
            const response = {
                success: false,
                error: 'Kız pansiyonuna sadece KADIN öğretmen atanabilir!'
            };
            return res.status(400).json(response);
        }
        // Slot index kontrolü - izin verilen nöbetçi sayısını aşamaz
        const dayType = (0, dutyDistribution_js_1.getDayType)(new Date(date));
        const maxSlots = (0, dutyDistribution_js_1.getDutyCount)(academicYearId, dormitoryType, dayType);
        if (slotIndex >= maxSlots) {
            const response = {
                success: false,
                error: `Bu gün için maksimum ${maxSlots} nöbetçi atanabilir!`
            };
            return res.status(400).json(response);
        }
        // Kaydet
        (0, dutyDistribution_js_1.saveDutyRecord)(academicYearId, teacherId, date, dayType, dormitoryType, slotIndex, false // Manuel atama
        );
        // Manuel düzenleme olarak işaretle
        init_js_1.db.prepare(`
      UPDATE duty_records 
      SET is_manually_edited = 1 
      WHERE academic_year_id = ? AND date = ? AND dormitory_type = ? AND slot_index = ?
    `).run(academicYearId, date, dormitoryType, slotIndex);
        const response = { success: true };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Tek bir nöbet kaydını sil
router.delete('/assign', (req, res) => {
    try {
        const { academicYearId, date, dormitoryType, slotIndex } = req.body;
        if (!academicYearId || !date || !dormitoryType || slotIndex === undefined) {
            const response = { success: false, error: 'Tüm alanlar zorunludur' };
            return res.status(400).json(response);
        }
        (0, dutyDistribution_js_1.deleteDutyRecord)(academicYearId, date, dormitoryType, slotIndex);
        const response = { success: true };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Öğretmen istatistiklerini getir
router.get('/stats/:academicYearId/:dormitoryType', (req, res) => {
    try {
        const academicYearId = parseInt(req.params.academicYearId);
        const dormitoryType = req.params.dormitoryType;
        const stats = (0, dutyDistribution_js_1.getTeacherStats)(academicYearId, dormitoryType);
        const response = { success: true, data: stats };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
exports.default = router;
//# sourceMappingURL=duties.js.map