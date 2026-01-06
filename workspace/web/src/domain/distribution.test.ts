import { describe, expect, it } from 'vitest'

import { distributeRoster } from './distribution'
import type { DutySettings, RosterTable } from './types'

describe('distributeRoster', () => {
  it('fills left-to-right based on day type and leaves extra columns empty', () => {
    const settings: DutySettings = {
      schoolName: 'X',
      activeTerm: 'Y',
      male: { weekday: 1, friday: 2, saturday: 3, sunday: 0 },
      female: { weekday: 2, friday: 1, saturday: 1, sunday: 1 },
    }

    const table: RosterTable = {
      shape: { month: '2026-01', maleColumns: 3, femaleColumns: 2 },
      rows: [
        { dateISO: '2026-01-02', dayLabel: 'Cuma', male: ['', '', ''], female: ['', ''] },
        { dateISO: '2026-01-05', dayLabel: 'Pazartesi', male: ['', '', ''], female: ['', ''] },
      ],
    }

    const out = distributeRoster({
      table,
      settings,
      malePool: ['A', 'B', 'C'],
      femalePool: ['X', 'Y', 'Z'],
    })

    expect(out.shape).toEqual(table.shape)

    // Friday: male required=2, female required=1
    expect(out.rows[0]?.male).toEqual(['A', 'B', ''])
    expect(out.rows[0]?.female).toEqual(['X', ''])

    // Weekday: male required=1, female required=2
    expect(out.rows[1]?.male).toEqual(['C', '', ''])
    expect(out.rows[1]?.female).toEqual(['Y', 'Z'])
  })
})

