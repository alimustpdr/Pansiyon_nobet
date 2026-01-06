import { Router, Request, Response } from 'express';
import { db } from '../database/init.js';
import { 
  DormitoryType, 
  DayType, 
  Gender,
  ApiResponse,
  MonthlyDutyList,
  TeacherDutyStats
} from '../types/index.js';
import {
  distributeAndSaveMonthlyDuties,
  getMonthlyDutyList,
  clearMonthlyDuties,
  saveDutyRecord,
  deleteDutyRecord,
  getDayType,
  getTeacherById,
  getDutyCount,
  getTeacherStats
} from '../services/dutyDistribution.js';

const router = Router();

// Aylık nöbet listesini getir
router.get('/monthly/:academicYearId/:year/:month', (req: Request, res: Response) => {
  try {
    const academicYearId = parseInt(req.params.academicYearId);
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month) - 1; // 0-indexed
    
    const dutyList = getMonthlyDutyList(academicYearId, year, month);
    
    const response: ApiResponse<MonthlyDutyList> = { success: true, data: dutyList };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Aylık nöbet dağıtımı yap
router.post('/distribute/:academicYearId/:year/:month', (req: Request, res: Response) => {
  try {
    const academicYearId = parseInt(req.params.academicYearId);
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month) - 1; // 0-indexed
    
    // Önce mevcut kayıtları temizle
    clearMonthlyDuties(academicYearId, year, month);
    
    // Yeni dağıtım yap
    const result = distributeAndSaveMonthlyDuties(academicYearId, year, month);
    
    // Güncel listeyi getir
    const dutyList = getMonthlyDutyList(academicYearId, year, month);
    
    const response: ApiResponse<{ dutyList: MonthlyDutyList; warnings: string[] }> = {
      success: true,
      data: { dutyList, warnings: result.warnings }
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Aylık nöbet kayıtlarını temizle
router.delete('/monthly/:academicYearId/:year/:month', (req: Request, res: Response) => {
  try {
    const academicYearId = parseInt(req.params.academicYearId);
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month) - 1; // 0-indexed
    
    clearMonthlyDuties(academicYearId, year, month);
    
    const response: ApiResponse<null> = { success: true };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Tek bir nöbet kaydı ekle/güncelle (manuel düzenleme)
router.post('/assign', (req: Request, res: Response) => {
  try {
    const { academicYearId, teacherId, date, dormitoryType, slotIndex } = req.body;
    
    if (!academicYearId || !teacherId || !date || !dormitoryType || slotIndex === undefined) {
      const response: ApiResponse<null> = { success: false, error: 'Tüm alanlar zorunludur' };
      return res.status(400).json(response);
    }
    
    // Öğretmeni kontrol et
    const teacher = getTeacherById(teacherId);
    if (!teacher) {
      const response: ApiResponse<null> = { success: false, error: 'Öğretmen bulunamadı' };
      return res.status(404).json(response);
    }
    
    // CİNSİYET KONTROLÜ - KRİTİK!
    if (dormitoryType === DormitoryType.ERKEK && teacher.gender !== Gender.ERKEK) {
      const response: ApiResponse<null> = { 
        success: false, 
        error: 'Erkek pansiyonuna sadece ERKEK öğretmen atanabilir!' 
      };
      return res.status(400).json(response);
    }
    
    if (dormitoryType === DormitoryType.KIZ && teacher.gender !== Gender.KADIN) {
      const response: ApiResponse<null> = { 
        success: false, 
        error: 'Kız pansiyonuna sadece KADIN öğretmen atanabilir!' 
      };
      return res.status(400).json(response);
    }
    
    // Slot index kontrolü - izin verilen nöbetçi sayısını aşamaz
    const dayType = getDayType(new Date(date));
    const maxSlots = getDutyCount(academicYearId, dormitoryType as DormitoryType, dayType);
    
    if (slotIndex >= maxSlots) {
      const response: ApiResponse<null> = { 
        success: false, 
        error: `Bu gün için maksimum ${maxSlots} nöbetçi atanabilir!` 
      };
      return res.status(400).json(response);
    }
    
    // Kaydet
    saveDutyRecord(
      academicYearId,
      teacherId,
      date,
      dayType,
      dormitoryType as DormitoryType,
      slotIndex,
      false // Manuel atama
    );
    
    // Manuel düzenleme olarak işaretle
    db.prepare(`
      UPDATE duty_records 
      SET is_manually_edited = 1 
      WHERE academic_year_id = ? AND date = ? AND dormitory_type = ? AND slot_index = ?
    `).run(academicYearId, date, dormitoryType, slotIndex);
    
    const response: ApiResponse<null> = { success: true };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Tek bir nöbet kaydını sil
router.delete('/assign', (req: Request, res: Response) => {
  try {
    const { academicYearId, date, dormitoryType, slotIndex } = req.body;
    
    if (!academicYearId || !date || !dormitoryType || slotIndex === undefined) {
      const response: ApiResponse<null> = { success: false, error: 'Tüm alanlar zorunludur' };
      return res.status(400).json(response);
    }
    
    deleteDutyRecord(academicYearId, date, dormitoryType, slotIndex);
    
    const response: ApiResponse<null> = { success: true };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

// Öğretmen istatistiklerini getir
router.get('/stats/:academicYearId/:dormitoryType', (req: Request, res: Response) => {
  try {
    const academicYearId = parseInt(req.params.academicYearId);
    const dormitoryType = req.params.dormitoryType as DormitoryType;
    
    const stats = getTeacherStats(academicYearId, dormitoryType);
    
    const response: ApiResponse<TeacherDutyStats[]> = { success: true, data: stats };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = { success: false, error: String(error) };
    res.status(500).json(response);
  }
});

export default router;
