'use client';

import { useStore } from '@/lib/store';
import { DayType, DutySettings } from '@/types';
import { Save } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const [localSettings, setLocalSettings] = useState<DutySettings>(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateCount = (gender: 'MALE' | 'FEMALE', dayType: DayType, val: number) => {
    setLocalSettings(prev => ({
      ...prev,
      [gender === 'MALE' ? 'maleCounts' : 'femaleCounts']: {
        ...prev[gender === 'MALE' ? 'maleCounts' : 'femaleCounts'],
        [dayType]: Math.max(0, val)
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Nöbet Kuralları ve Sayıları</h2>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          <Save size={18} />
          {saved ? 'Kaydedildi!' : 'Kaydet'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Male Settings */}
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Erkek Pansiyonu</h3>
          <div className="space-y-4">
            {[
              { key: 'WEEKDAY', label: 'Hafta İçi (Pzt-Per)' },
              { key: 'FRIDAY', label: 'Cuma' },
              { key: 'SATURDAY', label: 'Cumartesi' },
              { key: 'SUNDAY', label: 'Pazar' }
            ].map((day) => (
              <div key={day.key} className="flex justify-between items-center">
                <label className="text-gray-600 font-medium">{day.label}</label>
                <input
                  type="number"
                  min="0"
                  value={localSettings.maleCounts[day.key as DayType]}
                  onChange={(e) => updateCount('MALE', day.key as DayType, parseInt(e.target.value))}
                  className="w-20 border rounded px-2 py-1 text-center font-bold text-lg"
                />
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-500 bg-gray-50 p-3 rounded">
            * Bu ayarlar sadece erkek öğretmen havuzunu etkiler.
          </p>
        </div>

        {/* Female Settings */}
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-pink-500">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Kız Pansiyonu</h3>
          <div className="space-y-4">
            {[
              { key: 'WEEKDAY', label: 'Hafta İçi (Pzt-Per)' },
              { key: 'FRIDAY', label: 'Cuma' },
              { key: 'SATURDAY', label: 'Cumartesi' },
              { key: 'SUNDAY', label: 'Pazar' }
            ].map((day) => (
              <div key={day.key} className="flex justify-between items-center">
                <label className="text-gray-600 font-medium">{day.label}</label>
                <input
                  type="number"
                  min="0"
                  value={localSettings.femaleCounts[day.key as DayType]}
                  onChange={(e) => updateCount('FEMALE', day.key as DayType, parseInt(e.target.value))}
                  className="w-20 border rounded px-2 py-1 text-center font-bold text-lg"
                />
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-500 bg-gray-50 p-3 rounded">
            * Bu ayarlar sadece kadın öğretmen havuzunu etkiler.
          </p>
        </div>
      </div>
    </div>
  );
}
