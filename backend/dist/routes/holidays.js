"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const init_js_1 = require("../database/init.js");
const router = (0, express_1.Router)();
// Tatil günlerini listele
router.get('/:academicYearId', (req, res) => {
    try {
        const rows = init_js_1.db.prepare(`
      SELECT * FROM holidays 
      WHERE academic_year_id = ?
      ORDER BY date
    `).all(req.params.academicYearId);
        const holidays = rows.map(row => ({
            id: row.id,
            academicYearId: row.academic_year_id,
            date: row.date,
            description: row.description,
            hasDuty: row.has_duty === 1
        }));
        const response = { success: true, data: holidays };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Tatil günü ekle
router.post('/:academicYearId', (req, res) => {
    try {
        const academicYearId = parseInt(req.params.academicYearId);
        const { date, description, hasDuty } = req.body;
        if (!date) {
            const response = { success: false, error: 'Tarih zorunludur' };
            return res.status(400).json(response);
        }
        const result = init_js_1.db.prepare(`
      INSERT INTO holidays (academic_year_id, date, description, has_duty)
      VALUES (?, ?, ?, ?)
    `).run(academicYearId, date, description || '', hasDuty ? 1 : 0);
        const newHoliday = init_js_1.db.prepare('SELECT * FROM holidays WHERE id = ?').get(result.lastInsertRowid);
        const holiday = {
            id: newHoliday.id,
            academicYearId: newHoliday.academic_year_id,
            date: newHoliday.date,
            description: newHoliday.description,
            hasDuty: newHoliday.has_duty === 1
        };
        const response = { success: true, data: holiday };
        res.status(201).json(response);
    }
    catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            const response = { success: false, error: 'Bu tarih için zaten tatil tanımlanmış' };
            return res.status(400).json(response);
        }
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Tatil günü güncelle
router.put('/:id', (req, res) => {
    try {
        const { date, description, hasDuty } = req.body;
        const result = init_js_1.db.prepare(`
      UPDATE holidays 
      SET date = ?, description = ?, has_duty = ?
      WHERE id = ?
    `).run(date, description, hasDuty ? 1 : 0, req.params.id);
        if (result.changes === 0) {
            const response = { success: false, error: 'Tatil bulunamadı' };
            return res.status(404).json(response);
        }
        const response = { success: true };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Tatil günü sil
router.delete('/:id', (req, res) => {
    try {
        const result = init_js_1.db.prepare('DELETE FROM holidays WHERE id = ?').run(req.params.id);
        if (result.changes === 0) {
            const response = { success: false, error: 'Tatil bulunamadı' };
            return res.status(404).json(response);
        }
        const response = { success: true };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
exports.default = router;
//# sourceMappingURL=holidays.js.map