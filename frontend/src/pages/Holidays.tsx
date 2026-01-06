import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Calendar } from 'lucide-react';
import { useLayoutContext } from '../components/Layout';
import { holidayApi } from '../services/api';
import { Holiday } from '../types';

export default function Holidays() {
  const { activeYear } = useLayoutContext();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    hasDuty: false
  });

  useEffect(() => {
    if (activeYear) {
      loadHolidays();
    }
  }, [activeYear]);

  const loadHolidays = async () => {
    if (!activeYear) return;
    
    setLoading(true);
    const res = await holidayApi.getAll(activeYear.id);
    if (res.success && res.data) {
      setHolidays(res.data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeYear) return;
    
    const res = await holidayApi.create(activeYear.id, formData);
    if (res.success) {
      loadHolidays();
      setShowModal(false);
      setFormData({ date: '', description: '', hasDuty: false });
    } else {
      alert(res.error || 'Ekleme başarısız');
    }
  };

  const handleDelete = async (holiday: Holiday) => {
    if (!confirm(`${holiday.date} tarihli tatili silmek istediğinize emin misiniz?`)) {
      return;
    }
    
    const res = await holidayApi.delete(holiday.id);
    if (res.success) {
      loadHolidays();
    } else {
      alert(res.error || 'Silme başarısız');
    }
  };

  if (!activeYear) {
    return (
      <div className="card p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Aktif Dönem Bulunamadı</h3>
        <p className="text-gray-500">Lütfen önce Ayarlar sayfasından bir eğitim-öğretim yılı tanımlayın.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tatil Günleri</h2>
          <p className="text-gray-500 mt-1">{activeYear.name} Dönemi</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tatil Ekle
        </button>
      </div>

      {/* Tatil Listesi */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Tarih</th>
                <th className="table-header">Açıklama</th>
                <th className="table-header">Nöbet Durumu</th>
                <th className="table-header text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="table-cell text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : holidays.length === 0 ? (
                <tr>
                  <td colSpan={4} className="table-cell text-center py-8 text-gray-500">
                    Henüz tatil tanımlanmamış
                  </td>
                </tr>
              ) : (
                holidays.map((holiday) => (
                  <tr key={holiday.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">
                      {new Date(holiday.date).toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="table-cell">{holiday.description || '-'}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        holiday.hasDuty 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {holiday.hasDuty ? 'Nöbet Var' : 'Nöbet Yok'}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <button
                        onClick={() => handleDelete(holiday)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bilgi Kutusu */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-medium text-amber-800 mb-2">⚠️ Tatil Günleri Hakkında</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Tatil günlerinde varsayılan olarak nöbet ataması yapılmaz.</li>
          <li>• "Nöbet Var" seçeneği ile tatilde de nöbet ataması yapılabilir.</li>
          <li>• Tatil eklendikten sonra nöbet dağıtımını yeniden yapmanız önerilir.</li>
        </ul>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Tatil Ekle</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarih *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <input
                  type="text"
                  placeholder="Örn: Cumhuriyet Bayramı"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasDuty"
                  checked={formData.hasDuty}
                  onChange={(e) => setFormData({ ...formData, hasDuty: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasDuty" className="text-sm text-gray-700">
                  Bu tatilde de nöbet tutulacak
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">
                  İptal
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
