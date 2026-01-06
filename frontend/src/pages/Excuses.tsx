import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useLayoutContext } from '../components/Layout';
import { excuseApi, teacherApi } from '../services/api';
import { TeacherExcuse, Teacher } from '../types';

const EXCUSE_TYPES = [
  { value: 'rapor', label: 'Sağlık Raporu' },
  { value: 'izin', label: 'İzin' },
  { value: 'gorev', label: 'Görev' },
  { value: 'mazeret', label: 'Diğer Mazeret' }
];

export default function Excuses() {
  useLayoutContext();
  const [excuses, setExcuses] = useState<TeacherExcuse[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    teacherId: 0,
    startDate: '',
    endDate: '',
    excuseType: 'rapor',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const [excuseRes, teacherRes] = await Promise.all([
      excuseApi.getAll(),
      teacherApi.getAll(undefined, true)
    ]);
    
    if (excuseRes.success && excuseRes.data) {
      setExcuses(excuseRes.data);
    }
    
    if (teacherRes.success && teacherRes.data) {
      setTeachers(teacherRes.data);
    }
    
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await excuseApi.create(formData);
    if (res.success) {
      loadData();
      setShowModal(false);
      setFormData({
        teacherId: 0,
        startDate: '',
        endDate: '',
        excuseType: 'rapor',
        description: ''
      });
    } else {
      alert(res.error || 'Ekleme başarısız');
    }
  };

  const handleDelete = async (excuse: TeacherExcuse) => {
    if (!confirm('Bu mazereti silmek istediğinize emin misiniz?')) {
      return;
    }
    
    const res = await excuseApi.delete(excuse.id);
    if (res.success) {
      loadData();
    } else {
      alert(res.error || 'Silme başarısız');
    }
  };

  const getExcuseTypeLabel = (type: string) => {
    return EXCUSE_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Öğretmen Mazeretleri</h2>
          <p className="text-gray-500 mt-1">Toplam: {excuses.length} mazeret</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Mazeret Ekle
        </button>
      </div>

      {/* Mazeret Listesi */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Öğretmen</th>
                <th className="table-header">Mazeret Türü</th>
                <th className="table-header">Başlangıç</th>
                <th className="table-header">Bitiş</th>
                <th className="table-header">Açıklama</th>
                <th className="table-header text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : excuses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center py-8 text-gray-500">
                    Henüz mazeret kaydı yok
                  </td>
                </tr>
              ) : (
                excuses.map((excuse) => (
                  <tr key={excuse.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{excuse.teacherName}</td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {getExcuseTypeLabel(excuse.excuseType)}
                      </span>
                    </td>
                    <td className="table-cell">
                      {new Date(excuse.startDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="table-cell">
                      {new Date(excuse.endDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="table-cell text-gray-500">{excuse.description || '-'}</td>
                    <td className="table-cell text-right">
                      <button
                        onClick={() => handleDelete(excuse)}
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
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-800 mb-2">📋 Mazeret Sistemi Hakkında</h4>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Mazereti olan öğretmenler o tarih aralığında nöbete atanmaz.</li>
          <li>• Mazeret tarihleri dahildir (başlangıç ve bitiş günleri de dahil).</li>
          <li>• Mazeret eklendikten sonra dağıtım yapılırsa otomatik dikkate alınır.</li>
        </ul>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Mazeret Ekle</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Öğretmen *
                </label>
                <select
                  required
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: parseInt(e.target.value) })}
                  className="select"
                >
                  <option value={0}>Seçiniz...</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.fullName} ({teacher.gender === 'ERKEK' ? 'E' : 'K'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mazeret Türü *
                </label>
                <select
                  required
                  value={formData.excuseType}
                  onChange={(e) => setFormData({ ...formData, excuseType: e.target.value })}
                  className="select"
                >
                  {EXCUSE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlangıç *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bitiş *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <input
                  type="text"
                  placeholder="Opsiyonel açıklama"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                />
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
