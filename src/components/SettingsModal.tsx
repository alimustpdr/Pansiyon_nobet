import React, { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import type { AppSettings, DormitorySettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, initializeEmptyRoster } = useStore();
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [lastSyncedSettings, setLastSyncedSettings] = useState<string>('');

  // Sync local settings when modal opens with different settings
  const settingsKey = JSON.stringify(settings);
  if (isOpen && settingsKey !== lastSyncedSettings) {
    setLocalSettings(settings);
    setLastSyncedSettings(settingsKey);
  }

  // Reset sync tracking when modal closes
  const handleClose = useCallback(() => {
    setLastSyncedSettings('');
    onClose();
  }, [onClose]);

  const handleSave = () => {
    updateSettings(localSettings);
    // Reinitialize roster with new column counts
    initializeEmptyRoster();
    handleClose();
  };

  const updateDormitorySettings = (
    dormitory: 'maleDormitory' | 'femaleDormitory',
    field: keyof DormitorySettings,
    value: number
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      [dormitory]: {
        ...prev[dormitory],
        [field]: Math.max(1, Math.min(10, value)), // Limit between 1-10
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Ayarlar</h2>
          <p className="text-sm text-gray-500 mt-1">
            Okul bilgileri ve nöbetçi sayılarını düzenleyin
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-6">
          {/* School Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Okul Bilgileri</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Okul Adı
                </label>
                <input
                  type="text"
                  value={localSettings.schoolName}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({ ...prev, schoolName: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aktif Dönem
                </label>
                <input
                  type="text"
                  value={localSettings.activePeriod}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({ ...prev, activePeriod: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Male Dormitory Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
              Erkek Pansiyonu Nöbetçi Sayıları
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hafta İçi
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={localSettings.maleDormitory.weekdayGuardCount}
                  onChange={(e) =>
                    updateDormitorySettings(
                      'maleDormitory',
                      'weekdayGuardCount',
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuma
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={localSettings.maleDormitory.fridayGuardCount}
                  onChange={(e) =>
                    updateDormitorySettings(
                      'maleDormitory',
                      'fridayGuardCount',
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cumartesi
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={localSettings.maleDormitory.saturdayGuardCount}
                  onChange={(e) =>
                    updateDormitorySettings(
                      'maleDormitory',
                      'saturdayGuardCount',
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pazar
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={localSettings.maleDormitory.sundayGuardCount}
                  onChange={(e) =>
                    updateDormitorySettings(
                      'maleDormitory',
                      'sundayGuardCount',
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Female Dormitory Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 bg-pink-600 rounded-full"></span>
              Kız Pansiyonu Nöbetçi Sayıları
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hafta İçi
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={localSettings.femaleDormitory.weekdayGuardCount}
                  onChange={(e) =>
                    updateDormitorySettings(
                      'femaleDormitory',
                      'weekdayGuardCount',
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuma
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={localSettings.femaleDormitory.fridayGuardCount}
                  onChange={(e) =>
                    updateDormitorySettings(
                      'femaleDormitory',
                      'fridayGuardCount',
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cumartesi
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={localSettings.femaleDormitory.saturdayGuardCount}
                  onChange={(e) =>
                    updateDormitorySettings(
                      'femaleDormitory',
                      'saturdayGuardCount',
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pazar
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={localSettings.femaleDormitory.sundayGuardCount}
                  onChange={(e) =>
                    updateDormitorySettings(
                      'femaleDormitory',
                      'sundayGuardCount',
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Not:</strong> Nöbetçi sayılarını değiştirdiğinizde, tablo sütun sayısı
              otomatik olarak güncellenecektir. Her pansiyon için maksimum nöbetçi sayısı
              (hafta içi, cuma, cumartesi, pazar arasından en büyük değer) tablo sütun
              sayısını belirler.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2 sticky bottom-0 bg-white">
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
  );
};

export default SettingsModal;
