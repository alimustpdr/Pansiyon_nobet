'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Gender, Teacher } from '@/types';
import { Trash2, UserPlus } from 'lucide-react';

export default function TeachersPage() {
  const { teachers, addTeacher, deleteTeacher, updateTeacher } = useStore();
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherGender, setNewTeacherGender] = useState<Gender>('MALE');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim()) return;

    const newTeacher: Teacher = {
      id: crypto.randomUUID(),
      name: newTeacherName,
      gender: newTeacherGender,
      isActive: true,
      exemptions: [],
      totalPoints: 0,
    };

    addTeacher(newTeacher);
    setNewTeacherName('');
  };

  const maleTeachers = teachers.filter(t => t.gender === 'MALE');
  const femaleTeachers = teachers.filter(t => t.gender === 'FEMALE');

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <UserPlus size={20} />
          Yeni Öğretmen Ekle
        </h2>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
            <input
              type="text"
              value={newTeacherName}
              onChange={(e) => setNewTeacherName(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Örn: Ahmet Yılmaz"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
            <select
              value={newTeacherGender}
              onChange={(e) => setNewTeacherGender(e.target.value as Gender)}
              className="w-full border rounded px-3 py-2 bg-white"
            >
              <option value="MALE">Erkek</option>
              <option value="FEMALE">Kadın</option>
            </select>
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
            Ekle
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Male List */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Erkek Öğretmenler ({maleTeachers.length})</h3>
          <ul className="space-y-2">
            {maleTeachers.map(t => (
              <li key={t.id} className="bg-white p-3 rounded shadow-sm flex justify-between items-center">
                <span className={!t.isActive ? 'text-gray-400 line-through' : ''}>{t.name}</span>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => updateTeacher(t.id, { isActive: !t.isActive })}
                    className={`text-xs px-2 py-1 rounded ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                  >
                    {t.isActive ? 'Aktif' : 'Pasif'}
                  </button>
                  <button onClick={() => deleteTeacher(t.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
            {maleTeachers.length === 0 && <p className="text-sm text-blue-400">Henüz eklenmedi.</p>}
          </ul>
        </div>

        {/* Female List */}
        <div className="bg-pink-50 p-6 rounded-lg border border-pink-100">
          <h3 className="text-lg font-bold text-pink-900 mb-4">Kadın Öğretmenler ({femaleTeachers.length})</h3>
          <ul className="space-y-2">
            {femaleTeachers.map(t => (
              <li key={t.id} className="bg-white p-3 rounded shadow-sm flex justify-between items-center">
                <span className={!t.isActive ? 'text-gray-400 line-through' : ''}>{t.name}</span>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => updateTeacher(t.id, { isActive: !t.isActive })}
                    className={`text-xs px-2 py-1 rounded ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                  >
                    {t.isActive ? 'Aktif' : 'Pasif'}
                  </button>
                  <button onClick={() => deleteTeacher(t.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
             {femaleTeachers.length === 0 && <p className="text-sm text-pink-400">Henüz eklenmedi.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
