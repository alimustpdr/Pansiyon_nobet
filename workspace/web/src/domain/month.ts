import { addDays, endOfMonth, format, parse, startOfMonth } from 'date-fns'
import { parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'

import type { MonthKey } from './types'

export function parseMonthKey(month: MonthKey): Date {
  // monthKey: yyyy-MM
  return parse(`${month}-01`, 'yyyy-MM-dd', new Date())
}

export function formatMonthTitle(month: MonthKey): string {
  const d = parseMonthKey(month)
  // "Ocak 2026"
  return format(d, 'LLLL yyyy', { locale: tr })
}

export function getMonthDays(month: MonthKey): Date[] {
  const start = startOfMonth(parseMonthKey(month))
  const end = endOfMonth(start)
  const days: Date[] = []
  for (let d = start; d <= end; d = addDays(d, 1)) {
    days.push(d)
  }
  return days
}

export function formatISODate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function formatUiDate(d: Date): string {
  return format(d, 'dd.MM.yyyy')
}

export function formatUiDateFromISO(iso: string): string {
  return formatUiDate(parseISO(iso))
}

export function formatTurkishDayLabel(d: Date): string {
  // "Pazartesi"
  return format(d, 'EEEE', { locale: tr })
}

