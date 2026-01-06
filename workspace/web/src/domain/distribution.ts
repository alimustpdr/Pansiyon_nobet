import type { DutySettings, RosterTable } from './types'
import { parseISO } from 'date-fns'
import { requiredCountForDay } from './roster'

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function clearRosterAssignments(table: RosterTable): RosterTable {
  return {
    shape: table.shape,
    rows: table.rows.map((r) => ({
      ...r,
      male: r.male.map(() => ''),
      female: r.female.map(() => ''),
    })),
  }
}

export function distributeRoster(params: {
  table: RosterTable
  settings: DutySettings
  malePool: readonly string[]
  femalePool: readonly string[]
}): RosterTable {
  const { table, settings, malePool, femalePool } = params

  let maleIdx = 0
  let femaleIdx = 0

  const nextFrom = (pool: readonly string[], idx: number): string => {
    if (pool.length === 0) return ''
    return pool[idx % pool.length] ?? ''
  }

  return {
    shape: table.shape,
    rows: table.rows.map((r) => {
      const d = parseISO(r.dateISO)

      const maleRequired = clamp(
        requiredCountForDay(settings, 'male', d),
        0,
        table.shape.maleColumns,
      )
      const femaleRequired = clamp(
        requiredCountForDay(settings, 'female', d),
        0,
        table.shape.femaleColumns,
      )

      const male = r.male.map((_, i) => {
        if (i >= maleRequired) return ''
        const v = nextFrom(malePool, maleIdx)
        maleIdx += 1
        return v
      })

      const female = r.female.map((_, i) => {
        if (i >= femaleRequired) return ''
        const v = nextFrom(femalePool, femaleIdx)
        femaleIdx += 1
        return v
      })

      return { ...r, male, female }
    }),
  }
}

