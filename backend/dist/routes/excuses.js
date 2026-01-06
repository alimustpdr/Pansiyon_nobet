"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const init_js_1 = require("../database/init.js");
const router = (0, express_1.Router)();
// Tüm mazeretleri listele
router.get('/', (req, res) => {
    try {
        const { teacherId } = req.query;
        let query = `
      SELECT e.*, t.full_name as teacher_name 
      FROM teacher_excuses e
      JOIN teachers t ON e.teacher_id = t.id
      WHERE 1=1
    `;
        const params = [];
        if (teacherId) {
            query += ' AND e.teacher_id = ?';
            params.push(teacherId);
        }
        query += ' ORDER BY e.start_date DESC';
        const rows = init_js_1.db.prepare(query).all(...params);
        const excuses = rows.map(row => ({
            id: row.id,
            teacherId: row.teacher_id,
            teacherName: row.teacher_name,
            startDate: row.start_date,
            endDate: row.end_date,
            excuseType: row.excuse_type,
            description: row.description,
            createdAt: row.created_at
        }));
        const response = { success: true, data: excuses };
        res.json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Mazeret ekle
router.post('/', (req, res) => {
    try {
        const { teacherId, startDate, endDate, excuseType, description } = req.body;
        if (!teacherId || !startDate || !endDate || !excuseType) {
            const response = { success: false, error: 'Gerekli alanlar eksik' };
            return res.status(400).json(response);
        }
        // Tarih kontrolü
        if (new Date(endDate) < new Date(startDate)) {
            const response = { success: false, error: 'Bitiş tarihi başlangıç tarihinden önce olamaz' };
            return res.status(400).json(response);
        }
        const result = init_js_1.db.prepare(`
      INSERT INTO teacher_excuses (teacher_id, start_date, end_date, excuse_type, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(teacherId, startDate, endDate, excuseType, description || null);
        const newExcuse = init_js_1.db.prepare(`
      SELECT e.*, t.full_name as teacher_name 
      FROM teacher_excuses e
      JOIN teachers t ON e.teacher_id = t.id
      WHERE e.id = ?
    `).get(result.lastInsertRowid);
        const excuse = {
            id: newExcuse.id,
            teacherId: newExcuse.teacher_id,
            teacherName: newExcuse.teacher_name,
            startDate: newExcuse.start_date,
            endDate: newExcuse.end_date,
            excuseType: newExcuse.excuse_type,
            description: newExcuse.description,
            createdAt: newExcuse.created_at
        };
        const response = { success: true, data: excuse };
        res.status(201).json(response);
    }
    catch (error) {
        const response = { success: false, error: String(error) };
        res.status(500).json(response);
    }
});
// Mazeret güncelle
router.put('/:id', (req, res) => {
    try {
        const { startDate, endDate, excuseType, description } = req.body;
        const result = init_js_1.db.prepare(`
      UPDATE teacher_excuses 
      SET start_date = ?, end_date = ?, excuse_type = ?, description = ?
      WHERE id = ?
    `).run(startDate, endDate, excuseType, description, req.params.id);
        if (result.changes === 0) {
            const response = { success: false, error: 'Mazeret bulunamadı' };
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
// Mazeret sil
router.delete('/:id', (req, res) => {
    try {
        const result = init_js_1.db.prepare('DELETE FROM teacher_excuses WHERE id = ?').run(req.params.id);
        if (result.changes === 0) {
            const response = { success: false, error: 'Mazeret bulunamadı' };
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
//# sourceMappingURL=excuses.js.map