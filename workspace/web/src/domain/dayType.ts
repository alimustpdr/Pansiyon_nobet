import type { DayType } from './types'

// JS Date: Sunday=0 ... Saturday=6
export function getDayType(date: Date): DayType {
  const dow = date.getDay()
  if (dow === 0) return 'sunday'
  if (dow === 6) return 'saturday'
  if (dow === 5) return 'friday'
  return 'weekday'
}

