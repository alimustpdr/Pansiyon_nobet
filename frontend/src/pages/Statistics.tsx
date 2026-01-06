import { useEffect, useState } from 'react';
import { BarChart3, Download } from 'lucide-react';
import { useLayoutContext } from '../components/Layout';
import { dutyApi } from '../services/api';
import { generateStatsPDF } from '../services/reportService';
import { DormitoryType, TeacherDutyStats } from '../types';

export default function Statistics() {
  const { activeYear, schoolName } = useLayoutContext();
  const [erkekStats, setErkekStats] = useState<TeacherDutyStats[]>([]);
  const [kizStats, setKizStats] = useState<TeacherDutyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeYear) {
      loadStats();
    }
  }, [activeYear]);

  const loadStats = async () => {
    if (!activeYear) return;
    
    setLoading(true);
    
    const [erkekRes, kizRes] = await Promise.all([
      dutyApi.getStats(activeYear.id, DormitoryType.ERKEK),
      dutyApi.getStats(activeYear.id, DormitoryType.KIZ)
    ]);
    
    if (erkekRes.success && erkekRes.data) {
      setErkekStats(erkekRes.data);
    }
    
    if (kizRes.success && kizRes.data) {
      setKizStats(kizRes.data);
    }
    
    setLoading(false);
  };

  const handleExportPDF = () => {
    if (!activeYear) return;
    generateStatsPDF({ erkek: erkekStats, kiz: kizStats }, schoolName, activeYear.name);
  };

  // Maksimum nöbet sayısını bul (bar grafik için)
  const maxDuty = Math.max(
    ...erkekStats.map(s => s.totalDuties),
    ...kizStats.map(s => s.totalDuties),
    1
  );

  if (!activeYear) {
    return (
      <div className="card p-8 text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Aktif Dönem Bulunamadı</h3>
        <p className="text-gray-500">Lütfen önce Ayarlar sayfasından bir eğitim-öğretim yılı tanımlayın.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Nöbet İstatistikleri</h2>
          <p className="text-gray-500 mt-1">{activeYear.name} Dönemi</p>
        </div>
        <button 
          onClick={handleExportPDF}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          PDF İndir
        </button>
      </div>

      {/* Erkek Pansiyonu İstatistikleri */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-blue-50">
          <h3 className="font-semibold text-blue-800 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            Erkek Pansiyonu
          </h3>
        </div>
        <div className="p-5">
          {erkekStats.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Henüz nöbet verisi yok</p>
          ) : (
            <div className="space-y-4">
              {erkekStats.map((stat) => (
                <div key={stat.teacherId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{stat.teacherName}</span>
                    <span className="text-gray-600">
                      Toplam: {stat.totalDuties} | H.İçi: {stat.weekdayDuties} | Cuma: {stat.fridayDuties} | Cmt: {stat.saturdayDuties} | Paz: {stat.sundayDuties}
                    </span>
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${(stat.totalDuties / maxDuty) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Kız Pansiyonu İstatistikleri */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-pink-50">
          <h3 className="font-semibold text-pink-800 flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
            Kız Pansiyonu
          </h3>
        </div>
        <div className="p-5">
          {kizStats.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Henüz nöbet verisi yok</p>
          ) : (
            <div className="space-y-4">
              {kizStats.map((stat) => (
                <div key={stat.teacherId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{stat.teacherName}</span>
                    <span className="text-gray-600">
                      Toplam: {stat.totalDuties} | H.İçi: {stat.weekdayDuties} | Cuma: {stat.fridayDuties} | Cmt: {stat.saturdayDuties} | Paz: {stat.sundayDuties}
                    </span>
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full transition-all duration-500"
                      style={{ width: `${(stat.totalDuties / maxDuty) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detaylı Tablo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Erkek Detay */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h4 className="font-medium text-gray-800">Erkek Öğretmen Detayları</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Öğretmen</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">Toplam</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">H.İçi</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">Cuma</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">Cmt</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">Paz</th>
                </tr>
              </thead>
              <tbody>
                {erkekStats.map((stat, idx) => (
                  <tr key={stat.teacherId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 font-medium">{stat.teacherName}</td>
                    <td className="px-3 py-2 text-center">{stat.totalDuties}</td>
                    <td className="px-3 py-2 text-center">{stat.weekdayDuties}</td>
                    <td className="px-3 py-2 text-center">{stat.fridayDuties}</td>
                    <td className="px-3 py-2 text-center">{stat.saturdayDuties}</td>
                    <td className="px-3 py-2 text-center">{stat.sundayDuties}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kız Detay */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h4 className="font-medium text-gray-800">Kadın Öğretmen Detayları</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Öğretmen</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">Toplam</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">H.İçi</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">Cuma</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">Cmt</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">Paz</th>
                </tr>
              </thead>
              <tbody>
                {kizStats.map((stat, idx) => (
                  <tr key={stat.teacherId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 font-medium">{stat.teacherName}</td>
                    <td className="px-3 py-2 text-center">{stat.totalDuties}</td>
                    <td className="px-3 py-2 text-center">{stat.weekdayDuties}</td>
                    <td className="px-3 py-2 text-center">{stat.fridayDuties}</td>
                    <td className="px-3 py-2 text-center">{stat.saturdayDuties}</td>
                    <td className="px-3 py-2 text-center">{stat.sundayDuties}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Adalet Analizi */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-2">📊 Adalet Analizi</h4>
        <p className="text-sm text-green-700">
          Nöbet dağıtım algoritması, her öğretmenin toplam nöbet sayısı, hafta sonu nöbetleri 
          ve son nöbet tarihini dikkate alarak adaletli bir dağıtım yapmaya çalışır. 
          Yukarıdaki grafiklerde nöbet sayıları yakın değerlerde olmalıdır.
        </p>
      </div>
    </div>
  );
}
