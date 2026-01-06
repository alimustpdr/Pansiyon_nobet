import { describe, expect, it } from 'vitest'

import { getDayType } from './dayType'

describe('getDayType', () => {
  it('detects friday/saturday/sunday/weekday correctly', () => {
    expect(getDayType(new Date('2026-01-02T00:00:00Z'))).toBe('friday') // 2026-01-02 is Friday
    expect(getDayType(new Date('2026-01-03T00:00:00Z'))).toBe('saturday')
    expect(getDayType(new Date('2026-01-04T00:00:00Z'))).toBe('sunday')
    expect(getDayType(new Date('2026-01-05T00:00:00Z'))).toBe('weekday')
  })
})

