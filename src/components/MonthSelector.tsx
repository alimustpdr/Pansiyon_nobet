import React from 'react';
import { useStore } from '../store/useStore';
import { TURKISH_MONTH_NAMES } from '../types';

export const MonthSelector: React.FC = () => {
  const { selectedYear, selectedMonth, setSelectedMonth } = useStore();

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 1; y <= currentYear + 2; y++) {
    years.push(y);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Yıl:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value), selectedMonth)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Ay:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(selectedYear, parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {TURKISH_MONTH_NAMES.map((name, index) => (
            <option key={index + 1} value={index + 1}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MonthSelector;
