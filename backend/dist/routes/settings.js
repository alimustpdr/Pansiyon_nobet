"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const init_js_1 = require("../database/init.js");
const router = (0, express_1.Router)();
// Pansiyon ayarlarını getir
router.get('/dormitory/:academicYearId', (req, res) => {
    try {
        const rows = init_js_1.db.prepare(`
      SELECT * FROM dormitory_settings 
      WHERE academic_year_id = ?
      ORDER BY dormitory_type, day_type
    `).all(req.params.academicYearId);
        const settings = rows.map(row => ({
            id: row.id,
            academicYearId: row.academic_year_id,
            dormitoryType: row.dormitory_type,
            dayType: row.day_type,
            dutyCount: row.duty_count
        }));
        const response = { success: true, data: settings };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Pansiyon ayarlarını güncelle veya ekle
router.post('/dormitory/:academicYearId', (req, res) => {
    try {
        const academicYearId = parseInt(req.params.academicYearId);
        const { dormitoryType, dayType, dutyCount } = req.body;
        if (!dormitoryType || !dayType || dutyCount === undefined) {
            const response = { success: false, error: 'Tüm alanlar zorunludur' };
            return res.status(400).json(response);
        }
        // Upsert işlemi
        const existing = init_js_1.db.prepare(`
      SELECT id FROM dormitory_settings 
      WHERE academic_year_id = ? AND dormitory_type = ? AND day_type = ?
    `).get(academicYearId, dormitoryType, dayType);
        if (existing) {
            init_js_1.db.prepare(`
        UPDATE dormitory_settings 
        SET duty_count = ?
        WHERE academic_year_id = ? AND dormitory_type = ? AND day_type = ?
      `).run(dutyCount, academicYearId, dormitoryType, dayType);
        }
        else {
            init_js_1.db.prepare(`
        INSERT INTO dormitory_settings (academic_year_id, dormitory_type, day_type, duty_count)
        VALUES (?, ?, ?, ?)
      `).run(academicYearId, dormitoryType, dayType, dutyCount);
        }
        const response = { success: true };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Toplu pansiyon ayarları güncelle
router.post('/dormitory/:academicYearId/bulk', (req, res) => {
    try {
        const academicYearId = parseInt(req.params.academicYearId);
        const { settings } = req.body;
        if (!settings || !Array.isArray(settings)) {
            const response = { success: false, error: 'Ayarlar dizisi zorunludur' };
            return res.status(400).json(response);
        }
        const updateStmt = init_js_1.db.prepare(`
      INSERT OR REPLACE INTO dormitory_settings (academic_year_id, dormitory_type, day_type, duty_count)
      VALUES (?, ?, ?, ?)
    `);
        const transaction = init_js_1.db.transaction(() => {
            for (const setting of settings) {
                updateStmt.run(academicYearId, setting.dormitoryType, setting.dayType, setting.dutyCount);
            }
        });
        transaction();
        const response = { success: true };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Okul ayarlarını getir
router.get('/school', (req, res) => {
    try {
        const row = init_js_1.db.prepare('SELECT * FROM school_settings LIMIT 1').get();
        if (!row) {
            const response = { success: false, error: 'Okul ayarları bulunamadı' };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: {
                schoolName: row.school_name,
                academicYearId: row.academic_year_id
            }
        };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Okul ayarlarını güncelle
router.put('/school', (req, res) => {
    try {
        const { schoolName } = req.body;
        init_js_1.db.prepare('UPDATE school_settings SET school_name = ?').run(schoolName);
        const response = { success: true };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
exports.default = router;
//# sourceMappingURL=settings.js.map