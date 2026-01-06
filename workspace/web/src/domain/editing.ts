import { parseISO } from 'date-fns'
import type { Dormitory, DutySettings, RosterTable } from './types'
import { requiredCountForDay } from './roster'

export type CellEdit = Readonly<{
  dateISO: string
  dorm: Dormitory
  columnIndex: number // 0-based within dorm columns
  value: string // empty means clear
}>

export function validateCellEdit(settings: DutySettings, edit: CellEdit): { ok: true } | { ok: false; message: string } {
  // Clearing is always allowed.
  if (edit.value.trim() === '') return { ok: true }

  const d = parseISO(edit.dateISO)
  const required = requiredCountForDay(settings, edit.dorm, d)

  // Allowed cells are 0..required-1. Anything beyond stays empty.
  if (edit.columnIndex + 1 > required) {
    return {
      ok: false,
      message: `Bu gün için izin verilen nöbetçi sayısı aşılamaz (izin: ${required}).`,
    }
  }

  return { ok: true }
}

export function applyCellEdit(table: RosterTable, edit: CellEdit): RosterTable {
  return {
    shape: table.shape,
    rows: table.rows.map((r) => {
      if (r.dateISO !== edit.dateISO) return r
      if (edit.dorm === 'male') {
        const male = r.male.map((v, i) => (i === edit.columnIndex ? edit.value : v))
        return { ...r, male }
      }
      const female = r.female.map((v, i) => (i === edit.columnIndex ? edit.value : v))
      return { ...r, female }
    }),
  }
}

