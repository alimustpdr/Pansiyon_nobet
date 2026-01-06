'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { generateSchedule } from '@/lib/algorithm';
import { getDaysInMonth, startOfMonth, addDays, format, getDay, isWeekend } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Download, Play, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function SchedulePage() {
  const { teachers, settings, saveSchedule, getSchedule } = useStore();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [schedule, setSchedule] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Load schedule when date changes
  useEffect(() => {
    setSchedule(getSchedule(year, month));
    setErrors([]);
  }, [year, month, getSchedule]);

  const handleGenerate = () => {
    // Basic validation
    if (teachers.length === 0) {
      alert('Önce öğretmen eklemelisiniz!');
      return;
    }

    const result = generateSchedule(year, month, teachers, settings);
    setSchedule(result.assignments);
    setErrors(result.errors);
    saveSchedule(year, month, result.assignments);
  };

  const handleExportExcel = () => {
    if (schedule.length === 0) return;

    // Prepare Data for Horizontal View
    const startDate = startOfMonth(new Date(year, month));
    const daysInMonth = getDaysInMonth(startDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => addDays(startDate, i));

    // We need to group by Day -> Slots
    // But for Excel, usually rows are teachers or rows are days?
    // User asked for "Horizontal 1 page". Usually that means:
    // Columns: Days (1..31)
    // Rows: Duty Slots (Male 1, Male 2, Female 1, Female 2...)
    
    // Let's create a visual mapping
    // Header: Date
    // Row 1: Erkek Nöbetçi 1
    // Row 2: Erkek Nöbetçi 2 ...
    // Row X: Kız Nöbetçi 1 ...
    
    // To do this dynamically, we find max counts
    const maxMale = Math.max(...Object.values(settings.maleCounts));
    const maxFemale = Math.max(...Object.values(settings.femaleCounts));
    
    const wb = XLSX.utils.book_new();
    const wsData = [];
    
    // Header Row
    const headerRow = ['Nöbet Yeri / Tarih'];
    days.forEach(d => headerRow.push(format(d, 'd MMM eee', { locale: tr })));
    wsData.push(headerRow);

    // Male Rows
    for (let i = 0; i < maxMale; i++) {
      const row = [`Erkek Nöbetçi ${i + 1}`];
      days.forEach(d => {
        const dateStr = format(d, 'yyyy-MM-dd');
        // Find assignment for this date, gender MALE
        const assignmentsForDay = schedule.filter(a => a.date === dateStr);
        const maleAssignments = assignmentsForDay
          .filter(a => teachers.find(t => t.id === a.teacherId)?.gender === 'MALE');
        
        const teacher = teachers.find(t => t.id === maleAssignments[i]?.teacherId);
        row.push(teacher ? teacher.name : '-');
      });
      wsData.push(row);
    }

    // Separator
    wsData.push([]);

    // Female Rows
    for (let i = 0; i < maxFemale; i++) {
      const row = [`Kız Nöbetçi ${i + 1}`];
      days.forEach(d => {
        const dateStr = format(d, 'yyyy-MM-dd');
        const assignmentsForDay = schedule.filter(a => a.date === dateStr);
        const femaleAssignments = assignmentsForDay
          .filter(a => teachers.find(t => t.id === a.teacherId)?.gender === 'FEMALE');
        
        const teacher = teachers.find(t => t.id === femaleAssignments[i]?.teacherId);
        row.push(teacher ? teacher.name : '-');
      });
      wsData.push(row);
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Nöbet Listesi");
    XLSX.writeFile(wb, `Nobet_Listesi_${MONTHS[month]}_${year}.xlsx`);
  };

  const daysInView = Array.from({ length: getDaysInMonth(new Date(year, month)) }, (_, i) => 
    addDays(new Date(year, month), i)
  );

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow flex flex-wrap gap-4 items-end justify-between">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yıl</label>
            <input 
              type="number" 
              value={year} 
              onChange={e => setYear(parseInt(e.target.value))}
              className="border rounded px-3 py-2 w-24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ay</label>
            <select 
              value={month} 
              onChange={e => setMonth(parseInt(e.target.value))}
              className="border rounded px-3 py-2 w-32 bg-white"
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleGenerate}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            <Play size={18} />
            Dağıtımı Başlat
          </button>
          
          {schedule.length > 0 && (
             <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              <Download size={18} />
              Excel İndir
            </button>
          )}
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded text-sm">
          <h4 className="font-bold flex items-center gap-2 mb-2">
            <AlertTriangle size={16} />
            Dağıtım Uyarıları
          </h4>
          <ul className="list-disc pl-5">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Schedule Grid */}
      {schedule.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-100 min-w-[100px] sticky left-0 z-10">Gün</th>
                <th className="border p-2 bg-gray-100 min-w-[200px]">Erkek Pansiyonu</th>
                <th className="border p-2 bg-gray-100 min-w-[200px]">Kız Pansiyonu</th>
              </tr>
            </thead>
            <tbody>
              {daysInView.map(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const isWknd = isWeekend(date);
                
                const dayAssignments = schedule.filter(a => a.date === dateStr);
                const males = dayAssignments
                  .filter(a => teachers.find(t => t.id === a.teacherId)?.gender === 'MALE')
                  .map(a => teachers.find(t => t.id === a.teacherId)?.name);
                
                const females = dayAssignments
                  .filter(a => teachers.find(t => t.id === a.teacherId)?.gender === 'FEMALE')
                  .map(a => teachers.find(t => t.id === a.teacherId)?.name);

                return (
                  <tr key={dateStr} className={isWknd ? 'bg-orange-50' : 'hover:bg-gray-50'}>
                    <td className="border p-2 font-medium sticky left-0 bg-inherit">
                      <div className="flex flex-col">
                        <span className="font-bold">{format(date, 'd')}</span>
                        <span className="text-xs text-gray-500">{format(date, 'EEEE', { locale: tr })}</span>
                      </div>
                    </td>
                    <td className="border p-2 align-top">
                      <div className="flex flex-wrap gap-1">
                        {males.map((name, i) => (
                          <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-200">
                            {name}
                          </span>
                        ))}
                         {males.length === 0 && <span className="text-gray-300 text-xs">-</span>}
                      </div>
                    </td>
                    <td className="border p-2 align-top">
                      <div className="flex flex-wrap gap-1">
                        {females.map((name, i) => (
                          <span key={i} className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded border border-pink-200">
                            {name}
                          </span>
                        ))}
                        {females.length === 0 && <span className="text-gray-300 text-xs">-</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
