import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import { useLayoutContext } from '../components/Layout';
import { teacherApi, dutyApi } from '../services/api';
import { Teacher, MonthlyDutyList, Gender, MONTH_NAMES } from '../types';

export default function Dashboard() {
  const { activeYear } = useLayoutContext();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [dutyList, setDutyList] = useState<MonthlyDutyList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeYear]);

  const loadData = async () => {
    if (!activeYear) return;
    
    setLoading(true);
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const [teacherRes, dutyRes] = await Promise.all([
      teacherApi.getAll(undefined, true),
      dutyApi.getMonthly(activeYear.id, year, month)
    ]);
    
    if (teacherRes.success && teacherRes.data) {
      setTeachers(teacherRes.data);
    }
    
    if (dutyRes.success && dutyRes.data) {
      setDutyList(dutyRes.data);
    }
    
    setLoading(false);
  };

  const erkekCount = teachers.filter(t => t.gender === Gender.ERKEK).length;
  const kadinCount = teachers.filter(t => t.gender === Gender.KADIN).length;

  // Bugünün nöbetçileri
  const today = new Date().toISOString().split('T')[0];
  const todayDuty = dutyList?.days.find(d => d.date === today);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Ana Sayfa</h2>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{erkekCount}</div>
              <div className="text-sm text-gray-500">Erkek Öğretmen</div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{kadinCount}</div>
              <div className="text-sm text-gray-500">Kadın Öğretmen</div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {dutyList?.days.filter(d => !d.isHoliday).length || 0}
              </div>
              <div className="text-sm text-gray-500">Bu Ay Nöbet Günü</div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {dutyList ? MONTH_NAMES[dutyList.month] : '-'}
              </div>
              <div className="text-sm text-gray-500">Aktif Ay</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bugünün Nöbetçileri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Erkek Pansiyonu */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-200 bg-blue-50 rounded-t-xl">
            <h3 className="font-semibold text-blue-800 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              Bugün - Erkek Pansiyonu Nöbetçileri
            </h3>
          </div>
          <div className="p-5">
            {todayDuty ? (
              todayDuty.isHoliday ? (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>Bugün tatil - {todayDuty.holidayDescription}</span>
                </div>
              ) : todayDuty.erkekDuties.filter(Boolean).length > 0 ? (
                <ul className="space-y-2">
                  {todayDuty.erkekDuties.map((teacher, idx) => (
                    teacher && (
                      <li key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{teacher.fullName}</div>
                          <div className="text-sm text-gray-500">{teacher.branch}</div>
                        </div>
                      </li>
                    )
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Henüz nöbetçi atanmamış</p>
              )
            ) : (
              <p className="text-gray-500">Nöbet verisi yok</p>
            )}
          </div>
        </div>

        {/* Kız Pansiyonu */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-200 bg-pink-50 rounded-t-xl">
            <h3 className="font-semibold text-pink-800 flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
              Bugün - Kız Pansiyonu Nöbetçileri
            </h3>
          </div>
          <div className="p-5">
            {todayDuty ? (
              todayDuty.isHoliday ? (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>Bugün tatil - {todayDuty.holidayDescription}</span>
                </div>
              ) : todayDuty.kizDuties.filter(Boolean).length > 0 ? (
                <ul className="space-y-2">
                  {todayDuty.kizDuties.map((teacher, idx) => (
                    teacher && (
                      <li key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white font-medium">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{teacher.fullName}</div>
                          <div className="text-sm text-gray-500">{teacher.branch}</div>
                        </div>
                      </li>
                    )
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Henüz nöbetçi atanmamış</p>
              )
            ) : (
              <p className="text-gray-500">Nöbet verisi yok</p>
            )}
          </div>
        </div>
      </div>

      {/* Hızlı Erişim */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Hızlı Erişim</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link 
            to="/duties" 
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Nöbet Listesi</span>
          </Link>
          <Link 
            to="/teachers" 
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Users className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Öğretmenler</span>
          </Link>
          <Link 
            to="/statistics" 
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Clock className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">İstatistikler</span>
          </Link>
          <Link 
            to="/settings" 
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <AlertCircle className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Ayarlar</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
