"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const init_js_1 = require("../database/init.js");
const router = (0, express_1.Router)();
// Tüm eğitim-öğretim yıllarını listele
router.get('/', (req, res) => {
    try {
        const rows = init_js_1.db.prepare('SELECT * FROM academic_years ORDER BY start_date DESC').all();
        const years = rows.map(row => ({
            id: row.id,
            name: row.name,
            startDate: row.start_date,
            endDate: row.end_date,
            isActive: row.is_active === 1,
            createdAt: row.created_at
        }));
        const response = { success: true, data: years };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Aktif eğitim-öğretim yılını getir
router.get('/active', (req, res) => {
    try {
        const row = init_js_1.db.prepare('SELECT * FROM academic_years WHERE is_active = 1').get();
        if (!row) {
            const response = { success: false, error: 'Aktif eğitim-öğretim yılı bulunamadı' };
            return res.status(404).json(response);
        }
        const year = {
            id: row.id,
            name: row.name,
            startDate: row.start_date,
            endDate: row.end_date,
            isActive: row.is_active === 1,
            createdAt: row.created_at
        };
        const response = { success: true, data: year };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Tek eğitim-öğretim yılı getir
router.get('/:id', (req, res) => {
    try {
        const row = init_js_1.db.prepare('SELECT * FROM academic_years WHERE id = ?').get(req.params.id);
        if (!row) {
            const response = { success: false, error: 'Eğitim-öğretim yılı bulunamadı' };
            return res.status(404).json(response);
        }
        const year = {
            id: row.id,
            name: row.name,
            startDate: row.start_date,
            endDate: row.end_date,
            isActive: row.is_active === 1,
            createdAt: row.created_at
        };
        const response = { success: true, data: year };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Yeni eğitim-öğretim yılı ekle
router.post('/', (req, res) => {
    try {
        const { name, startDate, endDate, isActive } = req.body;
        if (!name || !startDate || !endDate) {
            const response = { success: false, error: 'Tüm alanlar zorunludur' };
            return res.status(400).json(response);
        }
        // Eğer aktif yapılıyorsa, diğerlerini pasif yap
        if (isActive) {
            init_js_1.db.prepare('UPDATE academic_years SET is_active = 0').run();
        }
        const result = init_js_1.db.prepare(`
      INSERT INTO academic_years (name, start_date, end_date, is_active)
      VALUES (?, ?, ?, ?)
    `).run(name, startDate, endDate, isActive ? 1 : 0);
        const newYear = init_js_1.db.prepare('SELECT * FROM academic_years WHERE id = ?').get(result.lastInsertRowid);
        const year = {
            id: newYear.id,
            name: newYear.name,
            startDate: newYear.start_date,
            endDate: newYear.end_date,
            isActive: newYear.is_active === 1,
            createdAt: newYear.created_at
        };
        const response = { success: true, data: year };
        res.status(201).json(response);
    }
    catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            const response = { success: false, error: 'Bu isimde bir eğitim-öğretim yılı zaten var' };
            return res.status(400).json(response);
        }
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Eğitim-öğretim yılını aktif yap
router.post('/:id/activate', (req, res) => {
    try {
        // Önce tüm yılları pasif yap
        init_js_1.db.prepare('UPDATE academic_years SET is_active = 0').run();
        // Seçilen yılı aktif yap
        const result = init_js_1.db.prepare('UPDATE academic_years SET is_active = 1 WHERE id = ?').run(req.params.id);
        if (result.changes === 0) {
            const response = { success: false, error: 'Eğitim-öğretim yılı bulunamadı' };
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
// Eğitim-öğretim yılı güncelle
router.put('/:id', (req, res) => {
    try {
        const { name, startDate, endDate } = req.body;
        const result = init_js_1.db.prepare(`
      UPDATE academic_years 
      SET name = ?, start_date = ?, end_date = ?
      WHERE id = ?
    `).run(name, startDate, endDate, req.params.id);
        if (result.changes === 0) {
            const response = { success: false, error: 'Eğitim-öğretim yılı bulunamadı' };
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
//# sourceMappingURL=academicYears.js.map