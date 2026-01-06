import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Teacher, DutySettings, DutyAssignment, ScheduleResult } from '@/types';

interface AppState {
  teachers: Teacher[];
  settings: DutySettings;
  schedules: Record<string, DutyAssignment[]>; // key: YYYY-MM
  
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  updateSettings: (settings: DutySettings) => void;
  saveSchedule: (year: number, month: number, assignments: DutyAssignment[]) => void;
  getSchedule: (year: number, month: number) => DutyAssignment[];
}

const DEFAULT_SETTINGS: DutySettings = {
  maleCounts: { WEEKDAY: 1, FRIDAY: 1, SATURDAY: 1, SUNDAY: 1 },
  femaleCounts: { WEEKDAY: 1, FRIDAY: 1, SATURDAY: 1, SUNDAY: 1 },
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      teachers: [],
      settings: DEFAULT_SETTINGS,
      schedules: {},

      addTeacher: (teacher) => set((state) => ({ teachers: [...state.teachers, teacher] })),
      
      updateTeacher: (id, updates) => set((state) => ({
        teachers: state.teachers.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      })),
      
      deleteTeacher: (id) => set((state) => ({
        teachers: state.teachers.filter((t) => t.id !== id),
      })),
      
      updateSettings: (settings) => set({ settings }),
      
      saveSchedule: (year, month, assignments) => set((state) => {
        const key = `${year}-${month}`;
        return {
          schedules: { ...state.schedules, [key]: assignments },
        };
      }),

      getSchedule: (year, month) => {
        const key = `${year}-${month}`;
        return get().schedules[key] || [];
      }
    }),
    {
      name: 'dorm-duty-storage',
    }
  )
);
