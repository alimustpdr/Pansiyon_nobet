import { format, getDaysInMonth, startOfMonth, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { TURKISH_DAY_NAMES, TURKISH_MONTH_NAMES } from '../types';

/**
 * Format date in Turkish
 */
export function formatDateTurkish(date: Date): string {
  return format(date, 'd MMMM yyyy', { locale: tr });
}

/**
 * Get Turkish day name
 */
export function getTurkishDayName(dayOfWeek: number): string {
  return TURKISH_DAY_NAMES[dayOfWeek];
}

/**
 * Get Turkish month name
 */
export function getTurkishMonthName(month: number): string {
  return TURKISH_MONTH_NAMES[month - 1];
}

/**
 * Get all days in a month
 */
export function getMonthDays(year: number, month: number): Date[] {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const firstDay = startOfMonth(new Date(year, month - 1));
  
  const days: Date[] = [];
  for (let i = 0; i < daysInMonth; i++) {
    days.push(addDays(firstDay, i));
  }
  
  return days;
}

/**
 * Check if date is weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Check if date is Friday
 */
export function isFriday(date: Date): boolean {
  return date.getDay() === 5;
}

/**
 * Format date for display in table
 */
export function formatTableDate(date: Date): string {
  return format(date, 'd');
}

/**
 * Get short Turkish day name (first 3 letters)
 */
export function getShortTurkishDayName(dayOfWeek: number): string {
  return TURKISH_DAY_NAMES[dayOfWeek].substring(0, 3);
}
