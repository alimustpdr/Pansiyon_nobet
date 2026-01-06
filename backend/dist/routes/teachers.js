"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const init_js_1 = require("../database/init.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
// Tüm öğretmenleri listele
router.get('/', (req, res) => {
    try {
        const { gender, active } = req.query;
        let query = 'SELECT * FROM teachers WHERE 1=1';
        const params = [];
        if (gender) {
            query += ' AND gender = ?';
            params.push(gender);
        }
        if (active !== undefined) {
            query += ' AND is_active = ?';
            params.push(active === 'true' ? 1 : 0);
        }
        query += ' ORDER BY full_name';
        const rows = init_js_1.db.prepare(query).all(...params);
        const teachers = rows.map(row => ({
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
        const response = { success: true, data: teachers };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Tek öğretmen getir
router.get('/:id', (req, res) => {
    try {
        const row = init_js_1.db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
        if (!row) {
            const response = { success: false, error: 'Öğretmen bulunamadı' };
            return res.status(404).json(response);
        }
        const teacher = {
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
        const response = { success: true, data: teacher };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Yeni öğretmen ekle
router.post('/', (req, res) => {
    try {
        const { tcNo, fullName, gender, branch, phone, email } = req.body;
        if (!fullName || !gender) {
            const response = { success: false, error: 'Ad soyad ve cinsiyet zorunludur' };
            return res.status(400).json(response);
        }
        if (gender !== index_js_1.Gender.ERKEK && gender !== index_js_1.Gender.KADIN) {
            const response = { success: false, error: 'Geçersiz cinsiyet değeri' };
            return res.status(400).json(response);
        }
        const result = init_js_1.db.prepare(`
      INSERT INTO teachers (tc_no, full_name, gender, branch, phone, email, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(tcNo || null, fullName, gender, branch || null, phone || null, email || null);
        const newTeacher = init_js_1.db.prepare('SELECT * FROM teachers WHERE id = ?').get(result.lastInsertRowid);
        const teacher = {
            id: newTeacher.id,
            tcNo: newTeacher.tc_no,
            fullName: newTeacher.full_name,
            gender: newTeacher.gender,
            branch: newTeacher.branch,
            phone: newTeacher.phone,
            email: newTeacher.email,
            isActive: newTeacher.is_active === 1,
            createdAt: newTeacher.created_at
        };
        const response = { success: true, data: teacher };
        res.status(201).json(response);
    }
    catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            const response = { success: false, error: 'Bu TC numarası zaten kayıtlı' };
            return res.status(400).json(response);
        }
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Öğretmen güncelle
router.put('/:id', (req, res) => {
    try {
        const { tcNo, fullName, branch, phone, email, isActive } = req.body;
        // Önce mevcut kaydı kontrol et
        const existing = init_js_1.db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
        if (!existing) {
            const response = { success: false, error: 'Öğretmen bulunamadı' };
            return res.status(404).json(response);
        }
        // NOT: Cinsiyet değiştirilemez!
        init_js_1.db.prepare(`
      UPDATE teachers 
      SET tc_no = ?, full_name = ?, branch = ?, phone = ?, email = ?, is_active = ?
      WHERE id = ?
    `).run(tcNo || null, fullName, branch || null, phone || null, email || null, isActive ? 1 : 0, req.params.id);
        const updated = init_js_1.db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
        const teacher = {
            id: updated.id,
            tcNo: updated.tc_no,
            fullName: updated.full_name,
            gender: updated.gender,
            branch: updated.branch,
            phone: updated.phone,
            email: updated.email,
            isActive: updated.is_active === 1,
            createdAt: updated.created_at
        };
        const response = { success: true, data: teacher };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Öğretmen sil
router.delete('/:id', (req, res) => {
    try {
        // Önce nöbet kayıtlarını kontrol et
        const dutyCount = init_js_1.db.prepare('SELECT COUNT(*) as count FROM duty_records WHERE teacher_id = ?').get(req.params.id);
        if (dutyCount.count > 0) {
            const response = {
                success: false,
                error: 'Bu öğretmenin nöbet kayıtları var. Önce nöbet kayıtlarını silmelisiniz.'
            };
            return res.status(400).json(response);
        }
        const result = init_js_1.db.prepare('DELETE FROM teachers WHERE id = ?').run(req.params.id);
        if (result.changes === 0) {
            const response = { success: false, error: 'Öğretmen bulunamadı' };
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
//# sourceMappingURL=teachers.js.map