import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  CalendarOff, 
  FileText,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { academicYearApi, settingsApi } from '../services/api';
import { AcademicYear } from '../types';

const navItems = [
  { to: '/', icon: Home, label: 'Ana Sayfa' },
  { to: '/teachers', icon: Users, label: 'Öğretmenler' },
  { to: '/duties', icon: Calendar, label: 'Nöbet Listesi' },
  { to: '/statistics', icon: BarChart3, label: 'İstatistikler' },
  { to: '/holidays', icon: CalendarOff, label: 'Tatiller' },
  { to: '/excuses', icon: FileText, label: 'Mazeretler' },
  { to: '/settings', icon: Settings, label: 'Ayarlar' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeYear, setActiveYear] = useState<AcademicYear | null>(null);
  const [schoolName, setSchoolName] = useState('Pansiyon Nöbet Sistemi');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [yearRes, schoolRes] = await Promise.all([
      academicYearApi.getActive(),
      settingsApi.getSchool()
    ]);
    
    if (yearRes.success && yearRes.data) {
      setActiveYear(yearRes.data);
    }
    
    if (schoolRes.success && schoolRes.data) {
      setSchoolName(schoolRes.data.schoolName);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-800">Nöbet Sistemi</span>
          </div>
          <button 
            className="lg:hidden p-1 hover:bg-gray-100 rounded"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Aktif dönem bilgisi */}
        {activeYear && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 mb-1">Aktif Dönem</div>
            <div className="font-medium text-gray-800">{activeYear.name}</div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-800">{schoolName}</h1>
            </div>
            
            {activeYear && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-gray-500">Dönem:</span>
                <span className="font-medium text-blue-600">{activeYear.name}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet context={{ activeYear, schoolName, refreshData: loadData }} />
        </main>
      </div>
    </div>
  );
}

// Hook for accessing layout context
import { useOutletContext } from 'react-router-dom';

export function useLayoutContext() {
  return useOutletContext<{
    activeYear: AcademicYear | null;
    schoolName: string;
    refreshData: () => Promise<void>;
  }>();
}
