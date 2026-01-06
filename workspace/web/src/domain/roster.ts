import type { DutySettings, MonthKey, RosterRow, RosterShape, RosterTable } from './types'
import { getDayType } from './dayType'
import { formatISODate, formatTurkishDayLabel, getMonthDays } from './month'

export function requiredCountForDay(settings: DutySettings, dorm: 'male' | 'female', date: Date): number {
  const dayType = getDayType(date)
  const rules = dorm === 'male' ? settings.male : settings.female
  return rules[dayType]
}

export function createEmptyRosterTable(shape: RosterShape): RosterTable {
  const days = getMonthDays(shape.month)
  const rows: RosterRow[] = days.map((d) => ({
    dateISO: formatISODate(d),
    dayLabel: formatTurkishDayLabel(d),
    male: Array.from({ length: shape.maleColumns }, () => ''),
    female: Array.from({ length: shape.femaleColumns }, () => ''),
  }))

  return { shape, rows }
}

export function monthKeyFromDate(d: Date): MonthKey {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}` as MonthKey
}

