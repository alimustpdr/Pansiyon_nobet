import { describe, expect, it } from 'vitest'

import { validateCellEdit } from './editing'
import type { DutySettings } from './types'

describe('validateCellEdit', () => {
  const settings: DutySettings = {
    schoolName: 'X',
    activeTerm: 'Y',
    male: { weekday: 1, friday: 2, saturday: 3, sunday: 1 },
    female: { weekday: 2, friday: 1, saturday: 2, sunday: 2 },
  }

  it('allows editing within allowed count', () => {
    const res = validateCellEdit(settings, {
      dateISO: '2026-01-02', // Friday
      dorm: 'male',
      columnIndex: 1, // Nöbetçi 2 (allowed)
      value: 'Ahmet',
    })
    expect(res.ok).toBe(true)
  })

  it('blocks saving beyond allowed count (but still allows opening/clicking)', () => {
    const res = validateCellEdit(settings, {
      dateISO: '2026-01-02', // Friday => male required=2
      dorm: 'male',
      columnIndex: 2, // Nöbetçi 3 (NOT allowed)
      value: 'Mehmet',
    })
    expect(res.ok).toBe(false)
  })

  it('always allows clearing', () => {
    const res = validateCellEdit(settings, {
      dateISO: '2026-01-02',
      dorm: 'male',
      columnIndex: 10,
      value: '',
    })
    expect(res.ok).toBe(true)
  })
})

