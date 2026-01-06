import { Router, Request, Response } from 'express';
import { db } from '../database/init.js';
import { Holiday, ApiResponse } from '../types/index.js';

const router = Router();

// Tatil günlerini listele
router.get('/:academicYearId', (req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM holidays 
      WHERE academic_year_id = ?
      ORDER BY date
    `).all(req.params.academicYearId) as any[];
    
    const holidays: Holiday[] = rows.map(row => ({
      id: row.id,
      academicYearId: row.academic_year_id,
      date: row.date,
      description: row.description,
      hasDuty: row.has_duty === 1
    }));
    
    const response: ApiResponse<Holiday[]> = { success: true, data: holidays };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Tatil günü ekle
router.post('/:academicYearId', (req: Request, res: Response) => {
  try {
    const academicYearId = parseInt(req.params.academicYearId);
    const { date, description, hasDuty } = req.body;
    
    if (!date) {
      const response: ApiResponse<null> = { success: false, error: 'Tarih zorunludur' };
      return res.status(400).json(response);
    }
    
    const result = db.prepare(`
      INSERT INTO holidays (academic_year_id, date, description, has_duty)
      VALUES (?, ?, ?, ?)
    `).run(academicYearId, date, description || '', hasDuty ? 1 : 0);
    
    const newHoliday = db.prepare('SELECT * FROM holidays WHERE id = ?').get(result.lastInsertRowid) as any;
    
    const holiday: Holiday = {
      id: newHoliday.id,
      academicYearId: newHoliday.academic_year_id,
      date: newHoliday.date,
      description: newHoliday.description,
      hasDuty: newHoliday.has_duty === 1
    };
    
    const response: ApiResponse<Holiday> = { success: true, data: holiday };
    res.status(201).json(response);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      const response: ApiResponse<null> = { success: false, error: 'Bu tarih için zaten tatil tanımlanmış' };
      return res.status(400).json(response);
    }
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Tatil günü güncelle
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { date, description, hasDuty } = req.body;
    
    const result = db.prepare(`
      UPDATE holidays 
      SET date = ?, description = ?, has_duty = ?
      WHERE id = ?
    `).run(date, description, hasDuty ? 1 : 0, req.params.id);
    
    if (result.changes === 0) {
      const response: ApiResponse<null> = { success: false, error: 'Tatil bulunamadı' };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<null> = { success: true };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Tatil günü sil
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM holidays WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      const response: ApiResponse<null> = { success: false, error: 'Tatil bulunamadı' };
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
