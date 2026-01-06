import React, { useState, useMemo, useCallback } from 'react';
import { useStore } from '../store/useStore';
import type { DormitoryType } from '../types';

interface CellEditModalProps {
  isOpen: boolean;
  dormitory: DormitoryType | null;
  dayIndex: number | null;
  guardIndex: number | null;
  currentValue: string;
  maxAllowed: number;
  currentCount: number;
  onClose: () => void;
}

export const CellEditModal: React.FC<CellEditModalProps> = ({
  isOpen,
  dormitory,
  dayIndex,
  guardIndex,
  currentValue,
  maxAllowed,
  currentCount,
  onClose,
}) => {
  const { teachers, updateGuardAssignment, dutyRoster } = useStore();
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [lastOpenValue, setLastOpenValue] = useState<string>('');

  // Filter teachers by dormitory type
  const availableTeachers = useMemo(() => {
    return teachers.filter((t) => {
      if (!dormitory) return false;
      return t.isActive && t.gender === (dormitory === 'male' ? 'male' : 'female');
    });
  }, [teachers, dormitory]);

  // Get already assigned teachers for this day
  const assignedIds = useMemo(() => {
    if (!dutyRoster || dayIndex === null || !dormitory) return [];
    
    const dayData = dormitory === 'male' 
      ? dutyRoster.maleDormitory[dayIndex]
      : dutyRoster.femaleDormitory[dayIndex];
    
    if (!dayData) return [];
    
    return dayData.guards
      .filter((g, idx) => g.teacherId && idx !== guardIndex)
      .map((g) => g.teacherId!);
  }, [dutyRoster, dayIndex, dormitory, guardIndex]);

  // Teachers available for selection (not already assigned on this day)
  const selectableTeachers = useMemo(() => {
    return availableTeachers.filter((t) => !assignedIds.includes(t.id));
  }, [availableTeachers, assignedIds]);

  // Reset state when modal opens with new value
  if (isOpen && currentValue !== lastOpenValue) {
    const currentTeacher = availableTeachers.find((t) => t.name === currentValue);
    setSelectedTeacherId(currentTeacher?.id || '');
    setError('');
    setLastOpenValue(currentValue);
  }

  // Reset tracking when modal closes
  const handleClose = useCallback(() => {
    setLastOpenValue('');
    onClose();
  }, [onClose]);

  const handleSave = () => {
    if (dormitory === null || dayIndex === null || guardIndex === null) return;

    // Check if we're trying to add a new guard
    const isAddingNew = currentValue === '' && selectedTeacherId !== '';
    
    // Count current filled guards (excluding the one being edited)
    const currentFilledCount = currentCount - (currentValue ? 1 : 0);
    
    // If adding new and would exceed max, show error
    if (isAddingNew && currentFilledCount >= maxAllowed) {
      setError(`Bu gün için maksimum ${maxAllowed} nöbetçi atanabilir. Şu anda ${currentCount} nöbetçi atanmış durumda.`);
      return;
    }

    const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
    
    updateGuardAssignment(
      dormitory,
      dayIndex,
      guardIndex,
      selectedTeacherId || null,
      selectedTeacher?.name || ''
    );

    handleClose();
  };

  const handleClear = () => {
    if (dormitory === null || dayIndex === null || guardIndex === null) return;
    
    updateGuardAssignment(dormitory, dayIndex, guardIndex, null, '');
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Nöbetçi Düzenle
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {dormitory === 'male' ? 'Erkek Pansiyonu' : 'Kız Pansiyonu'} - Nöbetçi {(guardIndex ?? 0) + 1}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                <strong>Uyarı:</strong> {error}
              </p>
            </div>
          )}

          {/* Info about limits */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              Bu gün için izin verilen nöbetçi sayısı: <strong>{maxAllowed}</strong>
            </p>
            <p className="text-sm text-blue-700">
              Şu anda atanan nöbetçi sayısı: <strong>{currentCount}</strong>
            </p>
          </div>

          {/* Teacher selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Öğretmen Seçin
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => {
                setSelectedTeacherId(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Seçiniz --</option>
              {selectableTeachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            
            {selectableTeachers.length === 0 && (
              <p className="mt-2 text-sm text-orange-600">
                Bu gün için tüm öğretmenler zaten atanmış.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            Temizle
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CellEditModal;
