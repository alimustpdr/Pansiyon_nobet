import { describe, expect, it } from 'vitest'

import { maxColumnsForDorm } from './shape'

describe('maxColumnsForDorm', () => {
  it('returns max across weekday/friday/saturday/sunday', () => {
    expect(
      maxColumnsForDorm({
        weekday: 1,
        friday: 2,
        saturday: 4,
        sunday: 3,
      }),
    ).toBe(4)
  })
})

