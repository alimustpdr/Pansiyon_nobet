export type Gender = 'MALE' | 'FEMALE';

export type DayType = 'WEEKDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface DutySettings {
  maleCounts: Record<DayType, number>;
  femaleCounts: Record<DayType, number>;
}

export interface Teacher {
  id: string;
  name: string;
  gender: Gender;
  isActive: boolean;
  exemptions: string[]; // ISO date strings
  totalPoints: number; // For fairness
}

export interface DutyAssignment {
  id: string;
  date: string; // ISO date string
  teacherId: string;
  dayType: DayType;
}

export interface ScheduleResult {
  assignments: DutyAssignment[];
  errors: string[];
}
