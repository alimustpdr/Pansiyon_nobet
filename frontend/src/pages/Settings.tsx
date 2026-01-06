import { useEffect, useState } from 'react';
import { Save, Plus, Check } from 'lucide-react';
import { useLayoutContext } from '../components/Layout';
import { academicYearApi, settingsApi } from '../services/api';
import { AcademicYear, DormitoryType, DayType, DAY_TYPE_NAMES } from '../types';

export default function Settings() {
  const { activeYear, refreshData } = useLayoutContext();
  
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Pansiyon ayarları
  const [erkekSettings, setErkekSettings] = useState<Record<DayType, number>>({
    [DayType.HAFTA_ICI]: 3,
    [DayType.CUMA]: 4,
    [DayType.CUMARTESI]: 1,
    [DayType.PAZAR]: 2
  });
  
  const [kizSettings, setKizSettings] = useState<Record<DayType, number>>({
    [DayType.HAFTA_ICI]: 2,
    [DayType.CUMA]: 3,
    [DayType.CUMARTESI]: 2,
    [DayType.PAZAR]: 1
  });
  
  // Yeni yıl formu
  const [showYearForm, setShowYearForm] = useState(false);
  const [newYear, setNewYear] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isActive: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const [yearsRes, schoolRes] = await Promise.all([
      academicYearApi.getAll(),
      settingsApi.getSchool()
    ]);
    
    if (yearsRes.success && yearsRes.data) {
      setAcademicYears(yearsRes.data);
    }
    
    if (schoolRes.success && schoolRes.data) {
      setSchoolName(schoolRes.data.schoolName);
    }
    
    // Aktif yıl varsa ayarlarını yükle
    if (activeYear) {
      const settingsRes = await settingsApi.getDormitory(activeYear.id);
      if (settingsRes.success && settingsRes.data) {
        const erkek: Record<DayType, number> = { ...erkekSettings };
        const kiz: Record<DayType, number> = { ...kizSettings };
        
        settingsRes.data.forEach(s => {
          if (s.dormitoryType === DormitoryType.ERKEK) {
            erkek[s.dayType] = s.dutyCount;
          } else {
            kiz[s.dayType] = s.dutyCount;
          }
        });
        
        setErkekSettings(erkek);
        setKizSettings(kiz);
      }
    }
    
    setLoading(false);
  };

  const handleSaveSchoolName = async () => {
    setSaving(true);
    const res = await settingsApi.updateSchool(schoolName);
    if (res.success) {
      refreshData();
    } else {
      alert(res.error || 'Kaydetme başarısız');
    }
    setSaving(false);
  };

  const handleSaveDormitorySettings = async () => {
    if (!activeYear) return;
    
    setSaving(true);
    
    const settings: { dormitoryType: DormitoryType; dayType: DayType; dutyCount: number }[] = [];
    
    // Erkek ayarları
    Object.entries(erkekSettings).forEach(([dayType, count]) => {
      settings.push({
        dormitoryType: DormitoryType.ERKEK,
        dayType: dayType as DayType,
        dutyCount: count
      });
    });
    
    // Kız ayarları
    Object.entries(kizSettings).forEach(([dayType, count]) => {
      settings.push({
        dormitoryType: DormitoryType.KIZ,
        dayType: dayType as DayType,
        dutyCount: count
      });
    });
    
    const res = await settingsApi.updateDormitoryBulk(activeYear.id, settings);
    
    if (res.success) {
      alert('Ayarlar kaydedildi');
    } else {
      alert(res.error || 'Kaydetme başarısız');
    }
    
    setSaving(false);
  };

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await academicYearApi.create(newYear);
    if (res.success) {
      loadData();
      refreshData();
      setShowYearForm(false);
      setNewYear({ name: '', startDate: '', endDate: '', isActive: false });
    } else {
      alert(res.error || 'Ekleme başarısız');
    }
  };

  const handleActivateYear = async (yearId: number) => {
    const res = await academicYearApi.activate(yearId);
    if (res.success) {
      loadData();
      refreshData();
    } else {
      alert(res.error || 'Aktivasyon başarısız');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-800">Ayarlar</h2>

      {/* Okul Ayarları */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Okul Bilgileri</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="Okul/Pansiyon Adı"
            className="input flex-1"
          />
          <button 
            onClick={handleSaveSchoolName}
            disabled={saving}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Kaydet
          </button>
        </div>
      </div>

      {/* Eğitim-Öğretim Yılları */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Eğitim-Öğretim Yılları</h3>
          <button 
            onClick={() => setShowYearForm(!showYearForm)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni Yıl
          </button>
        </div>
        
        {showYearForm && (
          <form onSubmit={handleCreateYear} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Yıl Adı (örn: 2025-2026)"
                value={newYear.name}
                onChange={(e) => setNewYear({ ...newYear, name: e.target.value })}
                className="input"
              />
              <input
                type="date"
                required
                value={newYear.startDate}
                onChange={(e) => setNewYear({ ...newYear, startDate: e.target.value })}
                className="input"
              />
              <input
                type="date"
                required
                value={newYear.endDate}
                onChange={(e) => setNewYear({ ...newYear, endDate: e.target.value })}
                className="input"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newYear.isActive}
                  onChange={(e) => setNewYear({ ...newYear, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Aktif yap</span>
              </label>
              <button type="submit" className="btn btn-primary">
                Ekle
              </button>
            </div>
          </form>
        )}
        
        <div className="space-y-2">
          {academicYears.map(year => (
            <div 
              key={year.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                year.isActive ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div>
                <span className="font-medium">{year.name}</span>
                <span className="text-sm text-gray-500 ml-3">
                  {new Date(year.startDate).toLocaleDateString('tr-TR')} - 
                  {new Date(year.endDate).toLocaleDateString('tr-TR')}
                </span>
              </div>
              {year.isActive ? (
                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <Check className="w-4 h-4" />
                  Aktif
                </span>
              ) : (
                <button
                  onClick={() => handleActivateYear(year.id)}
                  className="btn btn-secondary text-sm py-1"
                >
                  Aktif Yap
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pansiyon Nöbetçi Sayıları */}
      {activeYear && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Pansiyon Nöbetçi Sayıları ({activeYear.name})
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Her gün tipi için gereken nöbetçi öğretmen sayısını belirleyin.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Erkek Pansiyonu */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                Erkek Pansiyonu
              </h4>
              <div className="space-y-3">
                {Object.values(DayType).map(dayType => (
                  <div key={dayType} className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">{DAY_TYPE_NAMES[dayType]}</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={erkekSettings[dayType]}
                      onChange={(e) => setErkekSettings({
                        ...erkekSettings,
                        [dayType]: parseInt(e.target.value) || 1
                      })}
                      className="w-20 px-2 py-1 border border-blue-300 rounded text-center"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Kız Pansiyonu */}
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h4 className="font-semibold text-pink-800 mb-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
                Kız Pansiyonu
              </h4>
              <div className="space-y-3">
                {Object.values(DayType).map(dayType => (
                  <div key={dayType} className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">{DAY_TYPE_NAMES[dayType]}</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={kizSettings[dayType]}
                      onChange={(e) => setKizSettings({
                        ...kizSettings,
                        [dayType]: parseInt(e.target.value) || 1
                      })}
                      className="w-20 px-2 py-1 border border-pink-300 rounded text-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button 
              onClick={handleSaveDormitorySettings}
              disabled={saving}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
            </button>
          </div>
        </div>
      )}

      {/* Bilgi Kutusu */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">ℹ️ Önemli Bilgiler</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Erkek pansiyonu</strong>na sadece ERKEK öğretmenler atanır.</li>
          <li>• <strong>Kız pansiyonu</strong>na sadece KADIN öğretmenler atanır.</li>
          <li>• Bu kural hafta sonu dahil TÜM günler için geçerlidir.</li>
          <li>• Nöbetçi sayısı değişikliği yapıldıktan sonra nöbet dağıtımını yeniden yapın.</li>
        </ul>
      </div>
    </div>
  );
}
