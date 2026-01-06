import { Router, Request, Response } from 'express';
import { db } from '../database/init.js';
import { Gender, Teacher, ApiResponse } from '../types/index.js';

const router = Router();

// Tüm öğretmenleri listele
router.get('/', (req: Request, res: Response) => {
  try {
    const { gender, active } = req.query;
    
    let query = 'SELECT * FROM teachers WHERE 1=1';
    const params: any[] = [];
    
    if (gender) {
      query += ' AND gender = ?';
      params.push(gender);
    }
    
    if (active !== undefined) {
      query += ' AND is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }
    
    query += ' ORDER BY full_name';
    
    const rows = db.prepare(query).all(...params) as any[];
    
    const teachers: Teacher[] = rows.map(row => ({
      id: row.id,
      tcNo: row.tc_no,
      fullName: row.full_name,
      gender: row.gender as Gender,
      branch: row.branch,
      phone: row.phone,
      email: row.email,
      isActive: row.is_active === 1,
      createdAt: row.created_at
    }));
    
    const response: ApiResponse<Teacher[]> = { success: true, data: teachers };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Tek öğretmen getir
router.get('/:id', (req: Request, res: Response) => {
  try {
    const row = db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id) as any;
    
    if (!row) {
      const response: ApiResponse<null> = { success: false, error: 'Öğretmen bulunamadı' };
      return res.status(404).json(response);
    }
    
    const teacher: Teacher = {
      id: row.id,
      tcNo: row.tc_no,
      fullName: row.full_name,
      gender: row.gender as Gender,
      branch: row.branch,
      phone: row.phone,
      email: row.email,
      isActive: row.is_active === 1,
      createdAt: row.created_at
    };
    
    const response: ApiResponse<Teacher> = { success: true, data: teacher };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Yeni öğretmen ekle
router.post('/', (req: Request, res: Response) => {
  try {
    const { tcNo, fullName, gender, branch, phone, email } = req.body;
    
    if (!fullName || !gender) {
      const response: ApiResponse<null> = { success: false, error: 'Ad soyad ve cinsiyet zorunludur' };
      return res.status(400).json(response);
    }
    
    if (gender !== Gender.ERKEK && gender !== Gender.KADIN) {
      const response: ApiResponse<null> = { success: false, error: 'Geçersiz cinsiyet değeri' };
      return res.status(400).json(response);
    }
    
    const result = db.prepare(`
      INSERT INTO teachers (tc_no, full_name, gender, branch, phone, email, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(tcNo || null, fullName, gender, branch || null, phone || null, email || null);
    
    const newTeacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(result.lastInsertRowid) as any;
    
    const teacher: Teacher = {
      id: newTeacher.id,
      tcNo: newTeacher.tc_no,
      fullName: newTeacher.full_name,
      gender: newTeacher.gender as Gender,
      branch: newTeacher.branch,
      phone: newTeacher.phone,
      email: newTeacher.email,
      isActive: newTeacher.is_active === 1,
      createdAt: newTeacher.created_at
    };
    
    const response: ApiResponse<Teacher> = { success: true, data: teacher };
    res.status(201).json(response);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      const response: ApiResponse<null> = { success: false, error: 'Bu TC numarası zaten kayıtlı' };
      return res.status(400).json(response);
    }
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Öğretmen güncelle
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { tcNo, fullName, branch, phone, email, isActive } = req.body;
    
    // Önce mevcut kaydı kontrol et
    const existing = db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
    if (!existing) {
      const response: ApiResponse<null> = { success: false, error: 'Öğretmen bulunamadı' };
      return res.status(404).json(response);
    }
    
    // NOT: Cinsiyet değiştirilemez!
    db.prepare(`
      UPDATE teachers 
      SET tc_no = ?, full_name = ?, branch = ?, phone = ?, email = ?, is_active = ?
      WHERE id = ?
    `).run(
      tcNo || null,
      fullName,
      branch || null,
      phone || null,
      email || null,
      isActive ? 1 : 0,
      req.params.id
    );
    
    const updated = db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id) as any;
    
    const teacher: Teacher = {
      id: updated.id,
      tcNo: updated.tc_no,
      fullName: updated.full_name,
      gender: updated.gender as Gender,
      branch: updated.branch,
      phone: updated.phone,
      email: updated.email,
      isActive: updated.is_active === 1,
      createdAt: updated.created_at
    };
    
    const response: ApiResponse<Teacher> = { success: true, data: teacher };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Öğretmen sil
router.delete('/:id', (req: Request, res: Response) => {
  try {
    // Önce nöbet kayıtlarını kontrol et
    const dutyCount = db.prepare('SELECT COUNT(*) as count FROM duty_records WHERE teacher_id = ?').get(req.params.id) as { count: number };
    
    if (dutyCount.count > 0) {
      const response: ApiResponse<null> = { 
        success: false, 
        error: 'Bu öğretmenin nöbet kayıtları var. Önce nöbet kayıtlarını silmelisiniz.' 
      };
      return res.status(400).json(response);
    }
    
    const result = db.prepare('DELETE FROM teachers WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      const response: ApiResponse<null> = { success: false, error: 'Öğretmen bulunamadı' };
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
