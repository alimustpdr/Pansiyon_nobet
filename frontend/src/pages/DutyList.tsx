import { useEffect, useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  X
} from 'lucide-react';
import { useLayoutContext } from '../components/Layout';
import { dutyApi, teacherApi, settingsApi } from '../services/api';
import { generatePDF, generateExcel } from '../services/reportService';
import { 
  MonthlyDutyList, 
  DormitoryType, 
  DayType,
  Teacher, 
  Gender,
  MONTH_NAMES,
  DormitorySettings
} from '../types';

export default function DutyList() {
  const { activeYear, schoolName } = useLayoutContext();
  
  // Tarih state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  // Data state
  const [dutyList, setDutyList] = useState<MonthlyDutyList | null>(null);
  const [settings, setSettings] = useState<DormitorySettings[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  
  // Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    date: string;
    dormitoryType: DormitoryType;
    slotIndex: number;
    dayType: DayType;
  } | null>(null);

  // Maksimum slot sayılarını hesapla (ayarlardan)
  const maxSlots = useMemo(() => {
    const erkekMax = settings
      .filter(s => s.dormitoryType === DormitoryType.ERKEK)
      .reduce((max, s) => Math.max(max, s.dutyCount), 1);
    
    const kizMax = settings
      .filter(s => s.dormitoryType === DormitoryType.KIZ)
      .reduce((max, s) => Math.max(max, s.dutyCount), 1);
    
    return { erkek: erkekMax, kiz: kizMax };
  }, [settings]);

  // Gün tipine göre izin verilen slot sayısı
  const getAllowedSlots = (dayType: DayType, dormitoryType: DormitoryType): number => {
    const setting = settings.find(
      s => s.dormitoryType === dormitoryType && s.dayType === dayType
    );
    return setting?.dutyCount ?? 1;
  };

  useEffect(() => {
    if (activeYear) {
      loadData();
    }
  }, [activeYear, selectedYear, selectedMonth]);

  const loadData = async () => {
    if (!activeYear) return;
    
    setLoading(true);
    
    const [dutyRes, settingsRes, teachersRes] = await Promise.all([
      dutyApi.getMonthly(activeYear.id, selectedYear, selectedMonth),
      settingsApi.getDormitory(activeYear.id),
      teacherApi.getAll(undefined, true)
    ]);
    
    if (settingsRes.success && settingsRes.data) {
      setSettings(settingsRes.data);
    }
    
    if (dutyRes.success && dutyRes.data) {
      setDutyList(dutyRes.data);
    }
    
    if (teachersRes.success && teachersRes.data) {
      setTeachers(teachersRes.data);
    }
    
    setLoading(false);
  };

  const handleDistribute = async () => {
    if (!activeYear) return;
    
    if (!confirm('Bu ay için nöbet dağıtımı yapılacak. Mevcut atamalar silinecek. Devam etmek istiyor musunuz?')) {
      return;
    }
    
    setDistributing(true);
    setWarnings([]);
    
    const res = await dutyApi.distribute(activeYear.id, selectedYear, selectedMonth);
    
    if (res.success && res.data) {
      setDutyList(res.data.dutyList);
      if (res.data.warnings.length > 0) {
        setWarnings(res.data.warnings);
      }
    } else {
      alert(res.error || 'Dağıtım başarısız');
    }
    
    setDistributing(false);
  };

  const handleCellClick = (
    date: string, 
    dormitoryType: DormitoryType, 
    slotIndex: number,
    dayType: DayType,
    isHoliday: boolean
  ) => {
    if (isHoliday) return;
    
    // Slot index kontrolü
    const allowedSlots = getAllowedSlots(dayType, dormitoryType);
    if (slotIndex >= allowedSlots) {
      return; // Bu slot bu gün için kullanılamaz
    }
    
    setSelectedCell({ date, dormitoryType, slotIndex, dayType });
    setShowAssignModal(true);
  };

  const handleAssign = async (teacherId: number | null) => {
    if (!activeYear || !selectedCell) return;
    
    if (teacherId === null) {
      // Silme işlemi
      const res = await dutyApi.unassign({
        academicYearId: activeYear.id,
        date: selectedCell.date,
        dormitoryType: selectedCell.dormitoryType,
        slotIndex: selectedCell.slotIndex
      });
      
      if (!res.success) {
        alert(res.error || 'Silme başarısız');
        return;
      }
    } else {
      // Atama işlemi
      const res = await dutyApi.assign({
        academicYearId: activeYear.id,
        teacherId,
        date: selectedCell.date,
        dormitoryType: selectedCell.dormitoryType,
        slotIndex: selectedCell.slotIndex
      });
      
      if (!res.success) {
        alert(res.error || 'Atama başarısız');
        return;
      }
    }
    
    setShowAssignModal(false);
    setSelectedCell(null);
    loadData();
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleExportPDF = () => {
    if (!dutyList || !activeYear) return;
    generatePDF(dutyList, schoolName, activeYear.name);
  };

  const handleExportExcel = () => {
    if (!dutyList || !activeYear) return;
    generateExcel(dutyList, schoolName, activeYear.name);
  };

  // Uygun öğretmenleri filtrele
  const getAvailableTeachers = (dormitoryType: DormitoryType): Teacher[] => {
    const gender = dormitoryType === DormitoryType.ERKEK ? Gender.ERKEK : Gender.KADIN;
    return teachers.filter(t => t.gender === gender && t.isActive);
  };

  // Tablo İskeleti - Her zaman sabit sütun sayısı
  const renderTableSkeleton = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          {/* Üst başlık satırı */}
          <tr>
            <th rowSpan={2} className="border border-gray-300 bg-gray-100 px-2 py-2 w-12 text-center">
              Gün
            </th>
            <th rowSpan={2} className="border border-gray-300 bg-gray-100 px-2 py-2 w-16 text-center">
              Tarih
            </th>
            <th 
              colSpan={maxSlots.erkek} 
              className="border border-gray-300 bg-blue-600 text-white px-2 py-2 text-center"
            >
              ERKEK PANSİYONU
            </th>
            <th 
              colSpan={maxSlots.kiz} 
              className="border border-gray-300 bg-pink-600 text-white px-2 py-2 text-center"
            >
              KIZ PANSİYONU
            </th>
          </tr>
          {/* Alt başlık satırı - nöbetçi numaraları */}
          <tr>
            {Array.from({ length: maxSlots.erkek }, (_, i) => (
              <th 
                key={`erkek-${i}`} 
                className="border border-gray-300 bg-blue-100 px-2 py-1 text-center text-xs font-medium text-blue-800"
              >
                Nöbetçi {i + 1}
              </th>
            ))}
            {Array.from({ length: maxSlots.kiz }, (_, i) => (
              <th 
                key={`kiz-${i}`} 
                className="border border-gray-300 bg-pink-100 px-2 py-1 text-center text-xs font-medium text-pink-800"
              >
                Nöbetçi {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Yükleniyor durumu */}
          {loading && (
            <tr>
              <td 
                colSpan={2 + maxSlots.erkek + maxSlots.kiz} 
                className="border border-gray-300 px-4 py-8 text-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-500">Yükleniyor...</span>
                </div>
              </td>
            </tr>
          )}
          
          {/* Veri yok durumu */}
          {!loading && (!dutyList || dutyList.days.length === 0) && (
            <tr>
              <td 
                colSpan={2 + maxSlots.erkek + maxSlots.kiz} 
                className="border border-gray-300 px-4 py-8 text-center text-gray-500"
              >
                Henüz nöbet dağıtımı yapılmamış. "Nöbet Dağıt" butonuna tıklayın.
              </td>
            </tr>
          )}
          
          {/* Veri var */}
          {!loading && dutyList && dutyList.days.map((day) => {
            const isWeekend = day.dayType === DayType.CUMARTESI || day.dayType === DayType.PAZAR;
            const isFriday = day.dayType === DayType.CUMA;
            const erkekAllowed = getAllowedSlots(day.dayType, DormitoryType.ERKEK);
            const kizAllowed = getAllowedSlots(day.dayType, DormitoryType.KIZ);
            
            return (
              <tr 
                key={day.date} 
                className={`
                  ${isWeekend ? 'bg-amber-50' : ''}
                  ${isFriday ? 'bg-orange-50' : ''}
                  ${day.isHoliday ? 'bg-red-50' : ''}
                `}
              >
                {/* Gün adı */}
                <td className={`
                  border border-gray-300 px-2 py-1.5 text-center font-medium
                  ${isWeekend ? 'text-amber-700' : ''}
                  ${isFriday ? 'text-orange-700' : ''}
                `}>
                  {day.dayName.substring(0, 3)}
                </td>
                
                {/* Tarih */}
                <td className="border border-gray-300 px-2 py-1.5 text-center">
                  {day.dayOfMonth}
                </td>
                
                {/* Erkek Pansiyonu Hücreleri */}
                {Array.from({ length: maxSlots.erkek }, (_, i) => {
                  const teacher = day.erkekDuties[i];
                  const isDisabled = i >= erkekAllowed;
                  
                  return (
                    <td 
                      key={`erkek-${i}`}
                      onClick={() => !isDisabled && handleCellClick(day.date, DormitoryType.ERKEK, i, day.dayType, day.isHoliday)}
                      className={`
                        border border-gray-300 px-1 py-1.5 text-center text-xs
                        ${day.isHoliday ? 'bg-red-100 text-red-600' : ''}
                        ${isDisabled ? 'bg-gray-100 text-gray-400' : 'hover:bg-blue-50 cursor-pointer'}
                        ${teacher ? 'bg-blue-50' : ''}
                      `}
                    >
                      {day.isHoliday ? (
                        <span className="text-red-500 text-xs">TATİL</span>
                      ) : isDisabled ? (
                        <span className="text-gray-300">-</span>
                      ) : teacher ? (
                        <span className="font-medium text-blue-800">{teacher.fullName}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  );
                })}
                
                {/* Kız Pansiyonu Hücreleri */}
                {Array.from({ length: maxSlots.kiz }, (_, i) => {
                  const teacher = day.kizDuties[i];
                  const isDisabled = i >= kizAllowed;
                  
                  return (
                    <td 
                      key={`kiz-${i}`}
                      onClick={() => !isDisabled && handleCellClick(day.date, DormitoryType.KIZ, i, day.dayType, day.isHoliday)}
                      className={`
                        border border-gray-300 px-1 py-1.5 text-center text-xs
                        ${day.isHoliday ? 'bg-red-100 text-red-600' : ''}
                        ${isDisabled ? 'bg-gray-100 text-gray-400' : 'hover:bg-pink-50 cursor-pointer'}
                        ${teacher ? 'bg-pink-50' : ''}
                      `}
                    >
                      {day.isHoliday ? (
                        <span className="text-red-500 text-xs">TATİL</span>
                      ) : isDisabled ? (
                        <span className="text-gray-300">-</span>
                      ) : teacher ? (
                        <span className="font-medium text-pink-800">{teacher.fullName}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (!activeYear) {
    return (
      <div className="card p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Aktif Dönem Bulunamadı</h3>
        <p className="text-gray-500">Lütfen önce Ayarlar sayfasından bir eğitim-öğretim yılı tanımlayın.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Başlık ve Kontroller */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Nöbet Listesi</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Ay Seçimi */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium min-w-[140px] text-center">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </span>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {/* Aksiyonlar */}
          <button
            onClick={handleDistribute}
            disabled={distributing}
            className="btn btn-primary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${distributing ? 'animate-spin' : ''}`} />
            {distributing ? 'Dağıtılıyor...' : 'Nöbet Dağıt'}
          </button>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleExportPDF}
              disabled={!dutyList}
              className="btn btn-secondary flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleExportExcel}
              disabled={!dutyList}
              className="btn btn-secondary flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Uyarılar */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-2">Dağıtım Uyarıları</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                {warnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
            </div>
            <button 
              onClick={() => setWarnings([])}
              className="ml-auto p-1 hover:bg-amber-100 rounded"
            >
              <X className="w-4 h-4 text-amber-600" />
            </button>
          </div>
        </div>
      )}

      {/* Açıklama */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
          Erkek Pansiyonu
        </span>
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 bg-pink-100 border border-pink-300 rounded"></div>
          Kız Pansiyonu
        </span>
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 bg-amber-50 border border-amber-300 rounded"></div>
          Hafta Sonu
        </span>
        <span className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          Pasif Slot
        </span>
        <span className="text-gray-400">|</span>
        <span>Hücreye tıklayarak manuel düzenleme yapabilirsiniz</span>
      </div>

      {/* Nöbet Tablosu */}
      <div className="card overflow-hidden">
        {renderTableSkeleton()}
      </div>

      {/* Manuel Atama Modal */}
      {showAssignModal && selectedCell && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                Nöbetçi Ata - {selectedCell.date}
              </h3>
              <button 
                onClick={() => setShowAssignModal(false)} 
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCell.dormitoryType === DormitoryType.ERKEK
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-pink-100 text-pink-800'
                }`}>
                  {selectedCell.dormitoryType === DormitoryType.ERKEK ? 'Erkek' : 'Kız'} Pansiyonu - 
                  Nöbetçi {selectedCell.slotIndex + 1}
                </span>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {/* Boş seçeneği - silme için */}
                <button
                  onClick={() => handleAssign(null)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-left"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="text-gray-500">Nöbetçiyi Kaldır</span>
                </button>
                
                {/* Öğretmen listesi */}
                {getAvailableTeachers(selectedCell.dormitoryType).map(teacher => (
                  <button
                    key={teacher.id}
                    onClick={() => handleAssign(teacher.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 text-left ${
                      selectedCell.dormitoryType === DormitoryType.ERKEK
                        ? 'border-blue-200 hover:bg-blue-50'
                        : 'border-pink-200 hover:bg-pink-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      selectedCell.dormitoryType === DormitoryType.ERKEK
                        ? 'bg-blue-600'
                        : 'bg-pink-600'
                    }`}>
                      {teacher.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{teacher.fullName}</div>
                      <div className="text-sm text-gray-500">{teacher.branch || 'Branş belirtilmemiş'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
