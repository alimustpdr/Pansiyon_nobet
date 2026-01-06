import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { DutyRosterTable } from './components/DutyRosterTable';
import { CellEditModal } from './components/CellEditModal';
import { SettingsModal } from './components/SettingsModal';
import { MonthSelector } from './components/MonthSelector';
import { exportToPdfWithTurkish } from './utils/pdfExport';
import { exportToExcel } from './utils/excelExport';
import type { DormitoryType } from './types';
import { TURKISH_MONTH_NAMES } from './types';

function App() {
  const {
    settings,
    dutyRoster,
    columnConfig,
    distributionState,
    selectedYear,
    selectedMonth,
    initializeEmptyRoster,
    distributeGuards,
    clearDistribution,
    cellEditState,
    openCellEdit,
    closeCellEdit,
  } = useStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Initialize roster on first load
  useEffect(() => {
    if (!dutyRoster) {
      initializeEmptyRoster();
    }
  }, [dutyRoster, initializeEmptyRoster]);

  // Handle cell click for editing
  const handleCellClick = (
    dormitory: DormitoryType,
    dayIndex: number,
    guardIndex: number,
    currentValue: string,
    maxAllowed: number,
    currentCount: number
  ) => {
    openCellEdit(dormitory, dayIndex, guardIndex, currentValue, maxAllowed, currentCount);
  };

  // Handle PDF export
  const handlePdfExport = async () => {
    if (!dutyRoster) return;
    
    setIsExporting(true);
    try {
      exportToPdfWithTurkish({
        dutyRoster,
        settings,
        columnConfig,
      });
    } catch (error) {
      console.error('PDF export error:', error);
      alert('PDF oluşturulurken bir hata oluştu.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Excel export
  const handleExcelExport = async () => {
    if (!dutyRoster) return;
    
    setIsExporting(true);
    try {
      exportToExcel({
        dutyRoster,
        settings,
        columnConfig,
      });
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Excel dosyası oluşturulurken bir hata oluştu.');
    } finally {
      setIsExporting(false);
    }
  };

  const monthName = TURKISH_MONTH_NAMES[selectedMonth - 1];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pansiyon Nöbet Sistemi
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {settings.schoolName} - {settings.activePeriod}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <MonthSelector />
              
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ayarlar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {monthName} {selectedYear} Nöbet Listesi
              </h2>
              <p className="text-sm text-gray-500">
                {distributionState.isDistributed 
                  ? `Dağıtım yapıldı: ${new Date(distributionState.lastDistributedAt!).toLocaleString('tr-TR')}`
                  : 'Henüz dağıtım yapılmadı'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Distribution buttons */}
              <button
                onClick={distributeGuards}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {distributionState.isDistributed ? 'Yeniden Dağıt' : 'Dağıtım Yap'}
              </button>

              {distributionState.isDistributed && (
                <button
                  onClick={clearDistribution}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                >
                  Temizle
                </button>
              )}

              {/* Divider */}
              <div className="h-8 w-px bg-gray-300 hidden md:block"></div>

              {/* Export buttons */}
              <button
                onClick={handlePdfExport}
                disabled={isExporting || !dutyRoster}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF İndir
              </button>

              <button
                onClick={handleExcelExport}
                disabled={isExporting || !dutyRoster}
                className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel İndir
              </button>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Kullanım Bilgisi</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Tablo yapısı sayfa yüklendiğinde hazır olarak görünür</li>
                <li>Dağıtım yapıldığında sadece hücreler doldurulur, sütun sayısı değişmez</li>
                <li>Hücrelere tıklayarak manuel düzenleme yapabilirsiniz</li>
                <li>Sarı satırlar Cuma, turuncu satırlar hafta sonunu gösterir</li>
                <li>PDF/Excel rapor yönü sütun sayısına göre otomatik belirlenir</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span>Erkek Pansiyonu</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-600 rounded"></div>
              <span>Kız Pansiyonu</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>Cuma</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
              <span>Hafta Sonu</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span>Pasif Hücre (Gerekli Değil)</span>
            </div>
          </div>
        </div>

        {/* Duty Roster Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <DutyRosterTable onCellClick={handleCellClick} />
        </div>

        {/* Statistics */}
        {distributionState.isDistributed && dutyRoster && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dağıtım İstatistikleri</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-600">Erkek Pansiyon Toplam</p>
                <p className="text-2xl font-bold text-blue-700">
                  {dutyRoster.maleDormitory.reduce((sum, day) => 
                    sum + day.guards.filter(g => g.teacherName).length, 0
                  )}
                </p>
              </div>
              <div className="bg-pink-50 rounded-lg p-3">
                <p className="text-sm text-pink-600">Kız Pansiyon Toplam</p>
                <p className="text-2xl font-bold text-pink-700">
                  {dutyRoster.femaleDormitory.reduce((sum, day) => 
                    sum + day.guards.filter(g => g.teacherName).length, 0
                  )}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-green-600">Toplam Gün</p>
                <p className="text-2xl font-bold text-green-700">
                  {dutyRoster.maleDormitory.length}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-sm text-purple-600">Hafta Sonu Günleri</p>
                <p className="text-2xl font-bold text-purple-700">
                  {dutyRoster.maleDormitory.filter(d => 
                    d.dayOfWeek === 0 || d.dayOfWeek === 6
                  ).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Cell Edit Modal */}
      <CellEditModal
        isOpen={cellEditState.isOpen}
        dormitory={cellEditState.dormitory}
        dayIndex={cellEditState.dayIndex}
        guardIndex={cellEditState.guardIndex}
        currentValue={cellEditState.currentValue}
        maxAllowed={cellEditState.maxAllowed}
        currentCount={cellEditState.currentCount}
        onClose={closeCellEdit}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
