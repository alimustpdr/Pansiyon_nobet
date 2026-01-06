import React, { useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { DayDuty, DormitoryType } from '../types';
import { getGuardCountForDayType, TURKISH_DAY_NAMES } from '../types';

interface DutyRosterTableProps {
  onCellClick?: (
    dormitory: DormitoryType,
    dayIndex: number,
    guardIndex: number,
    currentValue: string,
    maxAllowed: number,
    currentCount: number
  ) => void;
}

export const DutyRosterTable: React.FC<DutyRosterTableProps> = ({ onCellClick }) => {
  const {
    dutyRoster,
    columnConfig,
    settings,
    distributionState,
    initializeEmptyRoster,
    selectedYear,
    selectedMonth,
  } = useStore();

  // Initialize roster on mount and when month changes
  useEffect(() => {
    if (!dutyRoster || dutyRoster.year !== selectedYear || dutyRoster.month !== selectedMonth) {
      initializeEmptyRoster();
    }
  }, [selectedYear, selectedMonth, initializeEmptyRoster, dutyRoster]);

  // Generate column headers for guard positions
  const maleGuardHeaders = useMemo(() => {
    const headers: string[] = [];
    for (let i = 0; i < columnConfig.maleDormitoryMaxColumns; i++) {
      headers.push(`Nöbetçi ${i + 1}`);
    }
    return headers;
  }, [columnConfig.maleDormitoryMaxColumns]);

  const femaleGuardHeaders = useMemo(() => {
    const headers: string[] = [];
    for (let i = 0; i < columnConfig.femaleDormitoryMaxColumns; i++) {
      headers.push(`Nöbetçi ${i + 1}`);
    }
    return headers;
  }, [columnConfig.femaleDormitoryMaxColumns]);

  // Calculate total columns for table width stability
  const totalColumns = useMemo(() => {
    return 2 + columnConfig.maleDormitoryMaxColumns + columnConfig.femaleDormitoryMaxColumns;
  }, [columnConfig]);

  // Render a single cell
  const renderCell = (
    day: DayDuty,
    dayIndex: number,
    guardIndex: number,
    dormitory: DormitoryType,
    dormSettings: typeof settings.maleDormitory
  ) => {
    const guard = day.guards[guardIndex];
    const requiredCount = getGuardCountForDayType(dormSettings, day.dayType);
    const isActiveCell = guardIndex < requiredCount;
    const hasValue = guard && guard.teacherName.length > 0;
    
    // Count current filled guards
    const currentCount = day.guards.filter((g) => g.teacherName.length > 0).length;

    const handleClick = () => {
      if (onCellClick && isActiveCell) {
        onCellClick(
          dormitory,
          dayIndex,
          guardIndex,
          guard?.teacherName || '',
          requiredCount,
          currentCount
        );
      }
    };

    return (
      <td
        key={`${dormitory}-${dayIndex}-${guardIndex}`}
        className={`
          border border-gray-300 px-2 py-1 text-center text-sm
          min-w-[100px] max-w-[120px]
          ${isActiveCell ? 'bg-white cursor-pointer hover:bg-blue-50' : 'bg-gray-100'}
          ${hasValue ? 'text-gray-900' : 'text-gray-400'}
          ${!distributionState.isDistributed && isActiveCell ? 'bg-gray-50' : ''}
        `}
        onClick={handleClick}
        title={isActiveCell ? 'Düzenlemek için tıklayın' : 'Bu gün için gerekli değil'}
      >
        {hasValue ? guard.teacherName : (isActiveCell ? '-' : '')}
      </td>
    );
  };

  // Render day row
  const renderDayRow = (dayIndex: number) => {
    if (!dutyRoster) return null;

    const maleDay = dutyRoster.maleDormitory[dayIndex];
    const femaleDay = dutyRoster.femaleDormitory[dayIndex];

    if (!maleDay || !femaleDay) return null;

    const isWeekend = maleDay.dayOfWeek === 0 || maleDay.dayOfWeek === 6;
    const isFriday = maleDay.dayOfWeek === 5;

    return (
      <tr
        key={dayIndex}
        className={`
          ${isWeekend ? 'bg-orange-50' : ''}
          ${isFriday ? 'bg-yellow-50' : ''}
        `}
      >
        {/* Date column */}
        <td className="border border-gray-300 px-3 py-1 text-center font-medium bg-gray-50 sticky left-0 z-10">
          {new Date(maleDay.date).getDate()}
        </td>
        
        {/* Day name column */}
        <td className={`
          border border-gray-300 px-3 py-1 text-center font-medium
          sticky left-[60px] z-10
          ${isWeekend ? 'bg-orange-100 text-orange-800' : 'bg-gray-50'}
          ${isFriday ? 'bg-yellow-100 text-yellow-800' : ''}
        `}>
          {TURKISH_DAY_NAMES[maleDay.dayOfWeek]}
        </td>

        {/* Male dormitory cells */}
        {Array.from({ length: columnConfig.maleDormitoryMaxColumns }).map((_, guardIndex) =>
          renderCell(maleDay, dayIndex, guardIndex, 'male', settings.maleDormitory)
        )}

        {/* Female dormitory cells */}
        {Array.from({ length: columnConfig.femaleDormitoryMaxColumns }).map((_, guardIndex) =>
          renderCell(femaleDay, dayIndex, guardIndex, 'female', settings.femaleDormitory)
        )}
      </tr>
    );
  };

  // Calculate column widths for stable layout
  const dateColumnWidth = 60;
  const dayColumnWidth = 100;
  const guardColumnWidth = 120;
  const tableWidth = dateColumnWidth + dayColumnWidth + 
    (columnConfig.maleDormitoryMaxColumns + columnConfig.femaleDormitoryMaxColumns) * guardColumnWidth;

  return (
    <div className="overflow-x-auto">
      <table
        className="border-collapse border border-gray-400 bg-white"
        style={{ minWidth: `${tableWidth}px`, tableLayout: 'fixed' }}
      >
        {/* Column width definitions for stable layout */}
        <colgroup>
          <col style={{ width: `${dateColumnWidth}px` }} />
          <col style={{ width: `${dayColumnWidth}px` }} />
          {Array.from({ length: columnConfig.maleDormitoryMaxColumns }).map((_, i) => (
            <col key={`male-col-${i}`} style={{ width: `${guardColumnWidth}px` }} />
          ))}
          {Array.from({ length: columnConfig.femaleDormitoryMaxColumns }).map((_, i) => (
            <col key={`female-col-${i}`} style={{ width: `${guardColumnWidth}px` }} />
          ))}
        </colgroup>

        <thead>
          {/* Main header row */}
          <tr>
            <th
              rowSpan={2}
              className="border border-gray-400 px-3 py-2 bg-gray-200 font-bold sticky left-0 z-20"
              style={{ width: `${dateColumnWidth}px` }}
            >
              Tarih
            </th>
            <th
              rowSpan={2}
              className="border border-gray-400 px-3 py-2 bg-gray-200 font-bold sticky left-[60px] z-20"
              style={{ width: `${dayColumnWidth}px` }}
            >
              Gün
            </th>
            <th
              colSpan={columnConfig.maleDormitoryMaxColumns}
              className="border border-gray-400 px-3 py-2 bg-blue-600 text-white font-bold"
            >
              Erkek Pansiyonu
            </th>
            <th
              colSpan={columnConfig.femaleDormitoryMaxColumns}
              className="border border-gray-400 px-3 py-2 bg-pink-600 text-white font-bold"
            >
              Kız Pansiyonu
            </th>
          </tr>

          {/* Sub-header row for guard positions */}
          <tr>
            {maleGuardHeaders.map((header, i) => (
              <th
                key={`male-header-${i}`}
                className="border border-gray-400 px-2 py-1 bg-blue-100 text-blue-800 font-semibold text-sm"
              >
                {header}
              </th>
            ))}
            {femaleGuardHeaders.map((header, i) => (
              <th
                key={`female-header-${i}`}
                className="border border-gray-400 px-2 py-1 bg-pink-100 text-pink-800 font-semibold text-sm"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Render skeleton or filled rows */}
          {dutyRoster ? (
            dutyRoster.maleDormitory.map((_, dayIndex) => renderDayRow(dayIndex))
          ) : (
            // Skeleton rows while loading
            Array.from({ length: 31 }).map((_, dayIndex) => (
              <tr key={dayIndex}>
                <td className="border border-gray-300 px-3 py-1 bg-gray-50 h-8">
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                </td>
                <td className="border border-gray-300 px-3 py-1 bg-gray-50 h-8">
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                </td>
                {Array.from({ length: totalColumns - 2 }).map((_, i) => (
                  <td key={i} className="border border-gray-300 px-2 py-1 h-8">
                    <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DutyRosterTable;
