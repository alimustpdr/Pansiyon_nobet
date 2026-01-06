import { Router, Request, Response } from 'express';
import { db } from '../database/init.js';
import { AcademicYear, ApiResponse } from '../types/index.js';

const router = Router();

// Tüm eğitim-öğretim yıllarını listele
router.get('/', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM academic_years ORDER BY start_date DESC').all() as any[];
    
    const years: AcademicYear[] = rows.map(row => ({
      id: row.id,
      name: row.name,
      startDate: row.start_date,
      endDate: row.end_date,
      isActive: row.is_active === 1,
      createdAt: row.created_at
    }));
    
    const response: ApiResponse<AcademicYear[]> = { success: true, data: years };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Aktif eğitim-öğretim yılını getir
router.get('/active', (req: Request, res: Response) => {
  try {
    const row = db.prepare('SELECT * FROM academic_years WHERE is_active = 1').get() as any;
    
    if (!row) {
      const response: ApiResponse<null> = { success: false, error: 'Aktif eğitim-öğretim yılı bulunamadı' };
      return res.status(404).json(response);
    }
    
    const year: AcademicYear = {
      id: row.id,
      name: row.name,
      startDate: row.start_date,
      endDate: row.end_date,
      isActive: row.is_active === 1,
      createdAt: row.created_at
    };
    
    const response: ApiResponse<AcademicYear> = { success: true, data: year };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Tek eğitim-öğretim yılı getir
router.get('/:id', (req: Request, res: Response) => {
  try {
    const row = db.prepare('SELECT * FROM academic_years WHERE id = ?').get(req.params.id) as any;
    
    if (!row) {
      const response: ApiResponse<null> = { success: false, error: 'Eğitim-öğretim yılı bulunamadı' };
      return res.status(404).json(response);
    }
    
    const year: AcademicYear = {
      id: row.id,
      name: row.name,
      startDate: row.start_date,
      endDate: row.end_date,
      isActive: row.is_active === 1,
      createdAt: row.created_at
    };
    
    const response: ApiResponse<AcademicYear> = { success: true, data: year };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Yeni eğitim-öğretim yılı ekle
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, startDate, endDate, isActive } = req.body;
    
    if (!name || !startDate || !endDate) {
      const response: ApiResponse<null> = { success: false, error: 'Tüm alanlar zorunludur' };
      return res.status(400).json(response);
    }
    
    // Eğer aktif yapılıyorsa, diğerlerini pasif yap
    if (isActive) {
      db.prepare('UPDATE academic_years SET is_active = 0').run();
    }
    
    const result = db.prepare(`
      INSERT INTO academic_years (name, start_date, end_date, is_active)
      VALUES (?, ?, ?, ?)
    `).run(name, startDate, endDate, isActive ? 1 : 0);
    
    const newYear = db.prepare('SELECT * FROM academic_years WHERE id = ?').get(result.lastInsertRowid) as any;
    
    const year: AcademicYear = {
      id: newYear.id,
      name: newYear.name,
      startDate: newYear.start_date,
      endDate: newYear.end_date,
      isActive: newYear.is_active === 1,
      createdAt: newYear.created_at
    };
    
    const response: ApiResponse<AcademicYear> = { success: true, data: year };
    res.status(201).json(response);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      const response: ApiResponse<null> = { success: false, error: 'Bu isimde bir eğitim-öğretim yılı zaten var' };
      return res.status(400).json(response);
    }
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Eğitim-öğretim yılını aktif yap
router.post('/:id/activate', (req: Request, res: Response) => {
  try {
    // Önce tüm yılları pasif yap
    db.prepare('UPDATE academic_years SET is_active = 0').run();
    
    // Seçilen yılı aktif yap
    const result = db.prepare('UPDATE academic_years SET is_active = 1 WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      const response: ApiResponse<null> = { success: false, error: 'Eğitim-öğretim yılı bulunamadı' };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<null> = { success: true };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Eğitim-öğretim yılı güncelle
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { name, startDate, endDate } = req.body;
    
    const result = db.prepare(`
      UPDATE academic_years 
      SET name = ?, start_date = ?, end_date = ?
      WHERE id = ?
    `).run(name, startDate, endDate, req.params.id);
    
    if (result.changes === 0) {
      const response: ApiResponse<null> = { success: false, error: 'Eğitim-öğretim yılı bulunamadı' };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<null> = { success: true };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

export default router;
