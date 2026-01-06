import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { teacherApi } from '../services/api';
import { Teacher, Gender } from '../types';

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    tcNo: '',
    fullName: '',
    gender: Gender.ERKEK,
    branch: '',
    phone: '',
    email: '',
    isActive: true
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    const res = await teacherApi.getAll();
    if (res.success && res.data) {
      setTeachers(res.data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTeacher) {
      const res = await teacherApi.update(editingTeacher.id, formData);
      if (res.success) {
        loadTeachers();
        closeModal();
      } else {
        alert(res.error || 'Güncelleme başarısız');
      }
    } else {
      const res = await teacherApi.create(formData);
      if (res.success) {
        loadTeachers();
        closeModal();
      } else {
        alert(res.error || 'Ekleme başarısız');
      }
    }
  };

  const handleDelete = async (teacher: Teacher) => {
    if (!confirm(`${teacher.fullName} öğretmenini silmek istediğinize emin misiniz?`)) {
      return;
    }
    
    const res = await teacherApi.delete(teacher.id);
    if (res.success) {
      loadTeachers();
    } else {
      alert(res.error || 'Silme başarısız');
    }
  };

  const openModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        tcNo: teacher.tcNo || '',
        fullName: teacher.fullName,
        gender: teacher.gender,
        branch: teacher.branch || '',
        phone: teacher.phone || '',
        email: teacher.email || '',
        isActive: teacher.isActive
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        tcNo: '',
        fullName: '',
        gender: Gender.ERKEK,
        branch: '',
        phone: '',
        email: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.branch?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = !genderFilter || t.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  const erkekCount = teachers.filter(t => t.gender === Gender.ERKEK && t.isActive).length;
  const kadinCount = teachers.filter(t => t.gender === Gender.KADIN && t.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Öğretmenler</h2>
          <p className="text-gray-500 mt-1">
            Toplam: {teachers.length} | Erkek: {erkekCount} | Kadın: {kadinCount}
          </p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Yeni Öğretmen
        </button>
      </div>

      {/* Filtreler */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="İsim veya branş ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="select w-full sm:w-48"
          >
            <option value="">Tüm Cinsiyetler</option>
            <option value={Gender.ERKEK}>Erkek</option>
            <option value={Gender.KADIN}>Kadın</option>
          </select>
        </div>
      </div>

      {/* Tablo */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Ad Soyad</th>
                <th className="table-header">Cinsiyet</th>
                <th className="table-header">Branş</th>
                <th className="table-header">Telefon</th>
                <th className="table-header">Durum</th>
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
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center py-8 text-gray-500">
                    Öğretmen bulunamadı
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{teacher.fullName}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        teacher.gender === Gender.ERKEK 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-pink-100 text-pink-800'
                      }`}>
                        {teacher.gender === Gender.ERKEK ? 'Erkek' : 'Kadın'}
                      </span>
                    </td>
                    <td className="table-cell">{teacher.branch || '-'}</td>
                    <td className="table-cell">{teacher.phone || '-'}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        teacher.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {teacher.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(teacher)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingTeacher ? 'Öğretmen Düzenle' : 'Yeni Öğretmen'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cinsiyet *
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                  className="select"
                  disabled={!!editingTeacher} // Düzenleme modunda cinsiyet değiştirilemez
                >
                  <option value={Gender.ERKEK}>Erkek</option>
                  <option value={Gender.KADIN}>Kadın</option>
                </select>
                {editingTeacher && (
                  <p className="text-xs text-gray-500 mt-1">Cinsiyet değiştirilemez</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TC Kimlik No
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={formData.tcNo}
                  onChange={(e) => setFormData({ ...formData, tcNo: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branş
                </label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                />
              </div>

              {editingTeacher && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Aktif (nöbet tutabilir)
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">
                  İptal
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {editingTeacher ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
