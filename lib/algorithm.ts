import { Teacher, DutySettings, DutyAssignment, ScheduleResult, DayType, Gender } from '@/types';
import { getDaysInMonth, startOfMonth, format, isFriday, isSaturday, isSunday, addDays, parseISO, isSameDay } from 'date-fns';

const POINTS_WEEKDAY = 1;
const POINTS_WEEKEND = 1.5;

function getDayType(date: Date): DayType {
  if (isFriday(date)) return 'FRIDAY';
  if (isSaturday(date)) return 'SATURDAY';
  if (isSunday(date)) return 'SUNDAY';
  return 'WEEKDAY';
}

function getRequiredCount(settings: DutySettings, gender: Gender, dayType: DayType): number {
  if (gender === 'MALE') {
    return settings.maleCounts[dayType];
  }
  return settings.femaleCounts[dayType];
}

function selectTeachers(
  date: Date,
  candidates: Teacher[],
  count: number,
  lastAssignments: Map<string, Date>, // teacherId -> lastDutyDate
  points: Map<string, number>,
  dayType: DayType
): Teacher[] {
  // 1. Filter out exempt teachers
  let available = candidates.filter(t => {
    if (!t.isActive) return false;
    
    // Check specific date exemption
    const dateStr = format(date, 'yyyy-MM-dd');
    if (t.exemptions.includes(dateStr)) return false;

    // Check strict rule: No duty if they had duty yesterday
    const lastDate = lastAssignments.get(t.id);
    if (lastDate) {
      const yesterday = addDays(date, -1);
      if (isSameDay(lastDate, yesterday)) return false;
    }

    return true;
  });

  // 2. Sort by fairness (Points ascending - those with fewer points go first)
  // Add randomness for tie-breaking
  available.sort((a, b) => {
    const pointsA = points.get(a.id) || 0;
    const pointsB = points.get(b.id) || 0;
    if (Math.abs(pointsA - pointsB) < 0.1) {
      return Math.random() - 0.5;
    }
    return pointsA - pointsB;
  });

  // 3. Select top N
  return available.slice(0, count);
}

export function generateSchedule(
  year: number,
  month: number, // 0-11
  teachers: Teacher[],
  settings: DutySettings
): ScheduleResult {
  const assignments: DutyAssignment[] = [];
  const errors: string[] = [];
  
  // Initialize tracking
  const teacherPoints = new Map<string, number>();
  teachers.forEach(t => teacherPoints.set(t.id, t.totalPoints));
  
  const lastAssignments = new Map<string, Date>();
  
  // Separate pools strictly
  const maleTeachers = teachers.filter(t => t.gender === 'MALE');
  const femaleTeachers = teachers.filter(t => t.gender === 'FEMALE');

  const startDate = startOfMonth(new Date(year, month));
  const daysInMonth = getDaysInMonth(startDate);

  for (let i = 0; i < daysInMonth; i++) {
    const currentDate = addDays(startDate, i);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayType = getDayType(currentDate);
    const isWeekend = dayType !== 'WEEKDAY';
    const pointValue = isWeekend ? POINTS_WEEKEND : POINTS_WEEKDAY;

    // --- MALE ASSIGNMENTS ---
    const maleCount = getRequiredCount(settings, 'MALE', dayType);
    const selectedMales = selectTeachers(
      currentDate, 
      maleTeachers, 
      maleCount, 
      lastAssignments, 
      teacherPoints,
      dayType
    );

    if (selectedMales.length < maleCount) {
      errors.push(`${dateStr}: Not enough MALE teachers. Needed ${maleCount}, found ${selectedMales.length}.`);
    }

    selectedMales.forEach(t => {
      assignments.push({
        id: crypto.randomUUID(),
        date: dateStr,
        teacherId: t.id,
        dayType: dayType
      });
      lastAssignments.set(t.id, currentDate);
      teacherPoints.set(t.id, (teacherPoints.get(t.id) || 0) + pointValue);
    });

    // --- FEMALE ASSIGNMENTS ---
    const femaleCount = getRequiredCount(settings, 'FEMALE', dayType);
    const selectedFemales = selectTeachers(
      currentDate, 
      femaleTeachers, 
      femaleCount, 
      lastAssignments, 
      teacherPoints,
      dayType
    );

    if (selectedFemales.length < femaleCount) {
      errors.push(`${dateStr}: Not enough FEMALE teachers. Needed ${femaleCount}, found ${selectedFemales.length}.`);
    }

    selectedFemales.forEach(t => {
      assignments.push({
        id: crypto.randomUUID(),
        date: dateStr,
        teacherId: t.id,
        dayType: dayType
      });
      lastAssignments.set(t.id, currentDate);
      teacherPoints.set(t.id, (teacherPoints.get(t.id) || 0) + pointValue);
    });
  }

  return { assignments, errors };
}
