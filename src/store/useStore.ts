import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppSettings,
  Teacher,
  MonthlyDutyRoster,
  DayDuty,
  GuardAssignment,
  DormitoryType,
  ColumnConfig,
  CellEditState,
  DistributionState,
} from '../types';
import { getDayType, getGuardCountForDayType, calculateMaxColumns } from '../types';
import { getDaysInMonth, startOfMonth, addDays, format } from 'date-fns';

// Default settings
const defaultSettings: AppSettings = {
  schoolName: 'Örnek Anadolu Lisesi',
  activePeriod: '2025-2026 Eğitim Yılı',
  maleDormitory: {
    weekdayGuardCount: 2,
    fridayGuardCount: 3,
    saturdayGuardCount: 3,
    sundayGuardCount: 2,
  },
  femaleDormitory: {
    weekdayGuardCount: 2,
    fridayGuardCount: 3,
    saturdayGuardCount: 3,
    sundayGuardCount: 2,
  },
};

// Sample teachers for demo
const sampleTeachers: Teacher[] = [
  { id: '1', name: 'Ahmet Yılmaz', gender: 'male', isActive: true },
  { id: '2', name: 'Mehmet Öztürk', gender: 'male', isActive: true },
  { id: '3', name: 'Ali Kaya', gender: 'male', isActive: true },
  { id: '4', name: 'Mustafa Şahin', gender: 'male', isActive: true },
  { id: '5', name: 'Hüseyin Çelik', gender: 'male', isActive: true },
  { id: '6', name: 'İbrahim Demir', gender: 'male', isActive: true },
  { id: '7', name: 'Fatma Güneş', gender: 'female', isActive: true },
  { id: '8', name: 'Ayşe Yıldız', gender: 'female', isActive: true },
  { id: '9', name: 'Zeynep Arslan', gender: 'female', isActive: true },
  { id: '10', name: 'Hatice Koç', gender: 'female', isActive: true },
  { id: '11', name: 'Elif Özdemir', gender: 'female', isActive: true },
  { id: '12', name: 'Emine Aydın', gender: 'female', isActive: true },
];

interface AppState {
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Teachers
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  removeTeacher: (id: string) => void;
  
  // Selected month
  selectedYear: number;
  selectedMonth: number;
  setSelectedMonth: (year: number, month: number) => void;
  
  // Duty roster
  dutyRoster: MonthlyDutyRoster | null;
  columnConfig: ColumnConfig;
  distributionState: DistributionState;
  
  // Actions
  initializeEmptyRoster: () => void;
  distributeGuards: () => void;
  updateGuardAssignment: (
    dormitory: DormitoryType,
    dayIndex: number,
    guardIndex: number,
    teacherId: string | null,
    teacherName: string
  ) => void;
  clearDistribution: () => void;
  
  // Cell edit modal
  cellEditState: CellEditState;
  openCellEdit: (
    dormitory: DormitoryType,
    dayIndex: number,
    guardIndex: number,
    currentValue: string,
    maxAllowed: number,
    currentCount: number
  ) => void;
  closeCellEdit: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Settings
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      
      // Teachers
      teachers: sampleTeachers,
      addTeacher: (teacher) =>
        set((state) => ({
          teachers: [
            ...state.teachers,
            { ...teacher, id: Date.now().toString() },
          ],
        })),
      updateTeacher: (id, updates) =>
        set((state) => ({
          teachers: state.teachers.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      removeTeacher: (id) =>
        set((state) => ({
          teachers: state.teachers.filter((t) => t.id !== id),
        })),
      
      // Selected month
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      setSelectedMonth: (year, month) => {
        set({ selectedYear: year, selectedMonth: month });
        // Reinitialize roster when month changes
        get().initializeEmptyRoster();
      },
      
      // Duty roster
      dutyRoster: null,
      columnConfig: {
        maleDormitoryMaxColumns: 3,
        femaleDormitoryMaxColumns: 3,
      },
      distributionState: {
        isDistributed: false,
        lastDistributedAt: null,
      },
      
      // Initialize empty roster with skeleton
      initializeEmptyRoster: () => {
        const { selectedYear, selectedMonth, settings } = get();
        const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth - 1));
        const firstDay = startOfMonth(new Date(selectedYear, selectedMonth - 1));
        
        // Calculate max columns for each dormitory
        const maleDormitoryMaxColumns = calculateMaxColumns(settings.maleDormitory);
        const femaleDormitoryMaxColumns = calculateMaxColumns(settings.femaleDormitory);
        
        // Create empty days
        const createEmptyDays = (maxColumns: number): DayDuty[] => {
          const days: DayDuty[] = [];
          for (let i = 0; i < daysInMonth; i++) {
            const currentDate = addDays(firstDay, i);
            const dayType = getDayType(currentDate);
            
            // Create empty guard slots for max columns
            const guards: GuardAssignment[] = [];
            for (let j = 0; j < maxColumns; j++) {
              guards.push({ teacherId: null, teacherName: '' });
            }
            
            days.push({
              date: format(currentDate, 'yyyy-MM-dd'),
              dayOfWeek: currentDate.getDay(),
              dayType,
              guards,
            });
          }
          return days;
        };
        
        set({
          dutyRoster: {
            year: selectedYear,
            month: selectedMonth,
            maleDormitory: createEmptyDays(maleDormitoryMaxColumns),
            femaleDormitory: createEmptyDays(femaleDormitoryMaxColumns),
          },
          columnConfig: {
            maleDormitoryMaxColumns,
            femaleDormitoryMaxColumns,
          },
          distributionState: {
            isDistributed: false,
            lastDistributedAt: null,
          },
        });
      },
      
      // Distribute guards
      distributeGuards: () => {
        const { dutyRoster, teachers, settings, columnConfig } = get();
        if (!dutyRoster) return;
        
        const maleTeachers = teachers.filter((t) => t.gender === 'male' && t.isActive);
        const femaleTeachers = teachers.filter((t) => t.gender === 'female' && t.isActive);
        
        // Track duty counts for fair distribution
        const maleDutyCounts = new Map<string, number>();
        const femaleDutyCounts = new Map<string, number>();
        
        maleTeachers.forEach((t) => maleDutyCounts.set(t.id, 0));
        femaleTeachers.forEach((t) => femaleDutyCounts.set(t.id, 0));
        
        // Helper to get teacher with least duties
        const getNextTeacher = (
          availableTeachers: Teacher[],
          dutyCounts: Map<string, number>,
          excludeIds: string[]
        ): Teacher | null => {
          const filtered = availableTeachers.filter(
            (t) => !excludeIds.includes(t.id)
          );
          if (filtered.length === 0) return null;
          
          // Sort by duty count (ascending) to ensure fair distribution
          filtered.sort((a, b) => {
            const countA = dutyCounts.get(a.id) || 0;
            const countB = dutyCounts.get(b.id) || 0;
            return countA - countB;
          });
          
          return filtered[0];
        };
        
        // Distribute for a dormitory
        const distributeForDormitory = (
          days: DayDuty[],
          availableTeachers: Teacher[],
          dormSettings: typeof settings.maleDormitory,
          dutyCounts: Map<string, number>,
          maxColumns: number
        ): DayDuty[] => {
          return days.map((day) => {
            const requiredCount = getGuardCountForDayType(dormSettings, day.dayType);
            const assignedIds: string[] = [];
            
            // Create new guards array with max columns
            const newGuards: GuardAssignment[] = [];
            
            // Fill from left to right up to required count
            for (let i = 0; i < maxColumns; i++) {
              if (i < requiredCount) {
                const teacher = getNextTeacher(availableTeachers, dutyCounts, assignedIds);
                if (teacher) {
                  newGuards.push({
                    teacherId: teacher.id,
                    teacherName: teacher.name,
                  });
                  assignedIds.push(teacher.id);
                  dutyCounts.set(teacher.id, (dutyCounts.get(teacher.id) || 0) + 1);
                } else {
                  newGuards.push({ teacherId: null, teacherName: '' });
                }
              } else {
                // Extra columns remain empty
                newGuards.push({ teacherId: null, teacherName: '' });
              }
            }
            
            return { ...day, guards: newGuards };
          });
        };
        
        const newMaleDormitory = distributeForDormitory(
          dutyRoster.maleDormitory,
          maleTeachers,
          settings.maleDormitory,
          maleDutyCounts,
          columnConfig.maleDormitoryMaxColumns
        );
        
        const newFemaleDormitory = distributeForDormitory(
          dutyRoster.femaleDormitory,
          femaleTeachers,
          settings.femaleDormitory,
          femaleDutyCounts,
          columnConfig.femaleDormitoryMaxColumns
        );
        
        set({
          dutyRoster: {
            ...dutyRoster,
            maleDormitory: newMaleDormitory,
            femaleDormitory: newFemaleDormitory,
          },
          distributionState: {
            isDistributed: true,
            lastDistributedAt: new Date().toISOString(),
          },
        });
      },
      
      // Update guard assignment
      updateGuardAssignment: (dormitory, dayIndex, guardIndex, teacherId, teacherName) => {
        const { dutyRoster } = get();
        if (!dutyRoster) return;
        
        const updateDormitory = (days: DayDuty[]): DayDuty[] => {
          return days.map((day, idx) => {
            if (idx !== dayIndex) return day;
            
            const newGuards = [...day.guards];
            newGuards[guardIndex] = { teacherId, teacherName };
            return { ...day, guards: newGuards };
          });
        };
        
        if (dormitory === 'male') {
          set({
            dutyRoster: {
              ...dutyRoster,
              maleDormitory: updateDormitory(dutyRoster.maleDormitory),
            },
          });
        } else {
          set({
            dutyRoster: {
              ...dutyRoster,
              femaleDormitory: updateDormitory(dutyRoster.femaleDormitory),
            },
          });
        }
      },
      
      // Clear distribution
      clearDistribution: () => {
        get().initializeEmptyRoster();
      },
      
      // Cell edit modal
      cellEditState: {
        isOpen: false,
        dormitory: null,
        dayIndex: null,
        guardIndex: null,
        currentValue: '',
        maxAllowed: 0,
        currentCount: 0,
      },
      
      openCellEdit: (dormitory, dayIndex, guardIndex, currentValue, maxAllowed, currentCount) => {
        set({
          cellEditState: {
            isOpen: true,
            dormitory,
            dayIndex,
            guardIndex,
            currentValue,
            maxAllowed,
            currentCount,
          },
        });
      },
      
      closeCellEdit: () => {
        set({
          cellEditState: {
            isOpen: false,
            dormitory: null,
            dayIndex: null,
            guardIndex: null,
            currentValue: '',
            maxAllowed: 0,
            currentCount: 0,
          },
        });
      },
    }),
    {
      name: 'pansiyon-nobet-storage',
      partialize: (state) => ({
        settings: state.settings,
        teachers: state.teachers,
        selectedYear: state.selectedYear,
        selectedMonth: state.selectedMonth,
      }),
    }
  )
);
