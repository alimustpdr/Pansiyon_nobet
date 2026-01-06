import { 
  ApiResponse, 
  Teacher, 
  AcademicYear, 
  DormitorySettings, 
  Holiday, 
  TeacherExcuse,
  MonthlyDutyList,
  TeacherDutyStats,
  DormitoryType,
  DayType
} from '../types';

const API_BASE = '/api';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Öğretmenler
export const teacherApi = {
  getAll: (gender?: string, active?: boolean) => {
    const params = new URLSearchParams();
    if (gender) params.append('gender', gender);
    if (active !== undefined) params.append('active', String(active));
    return fetchApi<Teacher[]>(`/teachers?${params}`);
  },
  
  getById: (id: number) => fetchApi<Teacher>(`/teachers/${id}`),
  
  create: (teacher: Partial<Teacher>) => 
    fetchApi<Teacher>('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacher)
    }),
  
  update: (id: number, teacher: Partial<Teacher>) =>
    fetchApi<Teacher>(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacher)
    }),
  
  delete: (id: number) =>
    fetchApi<null>(`/teachers/${id}`, { method: 'DELETE' })
};

// Eğitim-Öğretim Yılları
export const academicYearApi = {
  getAll: () => fetchApi<AcademicYear[]>('/academic-years'),
  
  getActive: () => fetchApi<AcademicYear>('/academic-years/active'),
  
  getById: (id: number) => fetchApi<AcademicYear>(`/academic-years/${id}`),
  
  create: (year: Partial<AcademicYear>) =>
    fetchApi<AcademicYear>('/academic-years', {
      method: 'POST',
      body: JSON.stringify(year)
    }),
  
  activate: (id: number) =>
    fetchApi<null>(`/academic-years/${id}/activate`, { method: 'POST' }),
  
  update: (id: number, year: Partial<AcademicYear>) =>
    fetchApi<AcademicYear>(`/academic-years/${id}`, {
      method: 'PUT',
      body: JSON.stringify(year)
    })
};

// Pansiyon Ayarları
export const settingsApi = {
  getDormitory: (academicYearId: number) =>
    fetchApi<DormitorySettings[]>(`/settings/dormitory/${academicYearId}`),
  
  updateDormitory: (academicYearId: number, setting: { dormitoryType: DormitoryType; dayType: DayType; dutyCount: number }) =>
    fetchApi<null>(`/settings/dormitory/${academicYearId}`, {
      method: 'POST',
      body: JSON.stringify(setting)
    }),
  
  updateDormitoryBulk: (academicYearId: number, settings: { dormitoryType: DormitoryType; dayType: DayType; dutyCount: number }[]) =>
    fetchApi<null>(`/settings/dormitory/${academicYearId}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ settings })
    }),
  
  getSchool: () => fetchApi<{ schoolName: string; academicYearId: number | null }>('/settings/school'),
  
  updateSchool: (schoolName: string) =>
    fetchApi<null>('/settings/school', {
      method: 'PUT',
      body: JSON.stringify({ schoolName })
    })
};

// Nöbetler
export const dutyApi = {
  getMonthly: (academicYearId: number, year: number, month: number) =>
    fetchApi<MonthlyDutyList>(`/duties/monthly/${academicYearId}/${year}/${month}`),
  
  distribute: (academicYearId: number, year: number, month: number) =>
    fetchApi<{ dutyList: MonthlyDutyList; warnings: string[] }>(`/duties/distribute/${academicYearId}/${year}/${month}`, {
      method: 'POST'
    }),
  
  clearMonthly: (academicYearId: number, year: number, month: number) =>
    fetchApi<null>(`/duties/monthly/${academicYearId}/${year}/${month}`, {
      method: 'DELETE'
    }),
  
  assign: (data: { academicYearId: number; teacherId: number; date: string; dormitoryType: DormitoryType; slotIndex: number }) =>
    fetchApi<null>('/duties/assign', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  unassign: (data: { academicYearId: number; date: string; dormitoryType: DormitoryType; slotIndex: number }) =>
    fetchApi<null>('/duties/assign', {
      method: 'DELETE',
      body: JSON.stringify(data)
    }),
  
  getStats: (academicYearId: number, dormitoryType: DormitoryType) =>
    fetchApi<TeacherDutyStats[]>(`/duties/stats/${academicYearId}/${dormitoryType}`)
};

// Tatiller
export const holidayApi = {
  getAll: (academicYearId: number) => fetchApi<Holiday[]>(`/holidays/${academicYearId}`),
  
  create: (academicYearId: number, holiday: Partial<Holiday>) =>
    fetchApi<Holiday>(`/holidays/${academicYearId}`, {
      method: 'POST',
      body: JSON.stringify(holiday)
    }),
  
  update: (id: number, holiday: Partial<Holiday>) =>
    fetchApi<null>(`/holidays/${id}`, {
      method: 'PUT',
      body: JSON.stringify(holiday)
    }),
  
  delete: (id: number) =>
    fetchApi<null>(`/holidays/${id}`, { method: 'DELETE' })
};

// Mazeretler
export const excuseApi = {
  getAll: (teacherId?: number) => {
    const params = teacherId ? `?teacherId=${teacherId}` : '';
    return fetchApi<TeacherExcuse[]>(`/excuses${params}`);
  },
  
  create: (excuse: Partial<TeacherExcuse>) =>
    fetchApi<TeacherExcuse>('/excuses', {
      method: 'POST',
      body: JSON.stringify(excuse)
    }),
  
  update: (id: number, excuse: Partial<TeacherExcuse>) =>
    fetchApi<null>(`/excuses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(excuse)
    }),
  
  delete: (id: number) =>
    fetchApi<null>(`/excuses/${id}`, { method: 'DELETE' })
};
