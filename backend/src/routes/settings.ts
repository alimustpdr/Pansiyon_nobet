import { Router, Request, Response } from 'express';
import { db } from '../database/init.js';
import { DormitorySettings, DormitoryType, DayType, ApiResponse } from '../types/index.js';

const router = Router();

// Pansiyon ayarlarını getir
router.get('/dormitory/:academicYearId', (req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM dormitory_settings 
      WHERE academic_year_id = ?
      ORDER BY dormitory_type, day_type
    `).all(req.params.academicYearId) as any[];
    
    const settings: DormitorySettings[] = rows.map(row => ({
      id: row.id,
      academicYearId: row.academic_year_id,
      dormitoryType: row.dormitory_type as DormitoryType,
      dayType: row.day_type as DayType,
      dutyCount: row.duty_count
    }));
    
    const response: ApiResponse<DormitorySettings[]> = { success: true, data: settings };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Pansiyon ayarlarını güncelle veya ekle
router.post('/dormitory/:academicYearId', (req: Request, res: Response) => {
  try {
    const academicYearId = parseInt(req.params.academicYearId);
    const { dormitoryType, dayType, dutyCount } = req.body;
    
    if (!dormitoryType || !dayType || dutyCount === undefined) {
      const response: ApiResponse<null> = { success: false, error: 'Tüm alanlar zorunludur' };
      return res.status(400).json(response);
    }
    
    // Upsert işlemi
    const existing = db.prepare(`
      SELECT id FROM dormitory_settings 
      WHERE academic_year_id = ? AND dormitory_type = ? AND day_type = ?
    `).get(academicYearId, dormitoryType, dayType);
    
    if (existing) {
      db.prepare(`
        UPDATE dormitory_settings 
        SET duty_count = ?
        WHERE academic_year_id = ? AND dormitory_type = ? AND day_type = ?
      `).run(dutyCount, academicYearId, dormitoryType, dayType);
    } else {
      db.prepare(`
        INSERT INTO dormitory_settings (academic_year_id, dormitory_type, day_type, duty_count)
        VALUES (?, ?, ?, ?)
      `).run(academicYearId, dormitoryType, dayType, dutyCount);
    }
    
    const response: ApiResponse<null> = { success: true };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Toplu pansiyon ayarları güncelle
router.post('/dormitory/:academicYearId/bulk', (req: Request, res: Response) => {
  try {
    const academicYearId = parseInt(req.params.academicYearId);
    const { settings } = req.body as { settings: { dormitoryType: DormitoryType; dayType: DayType; dutyCount: number }[] };
    
    if (!settings || !Array.isArray(settings)) {
      const response: ApiResponse<null> = { success: false, error: 'Ayarlar dizisi zorunludur' };
      return res.status(400).json(response);
    }
    
    const updateStmt = db.prepare(`
      INSERT OR REPLACE INTO dormitory_settings (academic_year_id, dormitory_type, day_type, duty_count)
      VALUES (?, ?, ?, ?)
    `);
    
    const transaction = db.transaction(() => {
      for (const setting of settings) {
        updateStmt.run(academicYearId, setting.dormitoryType, setting.dayType, setting.dutyCount);
      }
    });
    
    transaction();
    
    const response: ApiResponse<null> = { success: true };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Okul ayarlarını getir
router.get('/school', (req: Request, res: Response) => {
  try {
    const row = db.prepare('SELECT * FROM school_settings LIMIT 1').get() as any;
    
    if (!row) {
      const response: ApiResponse<null> = { success: false, error: 'Okul ayarları bulunamadı' };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<{ schoolName: string; academicYearId: number | null }> = {
      success: true,
      data: {
        schoolName: row.school_name,
        academicYearId: row.academic_year_id
      }
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Okul ayarlarını güncelle
router.put('/school', (req: Request, res: Response) => {
  try {
    const { schoolName } = req.body;
    
    db.prepare('UPDATE school_settings SET school_name = ?').run(schoolName);
    
    const response: ApiResponse<null> = { success: true };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

export default router;
