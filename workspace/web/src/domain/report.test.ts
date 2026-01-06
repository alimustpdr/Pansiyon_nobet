import { describe, expect, it } from 'vitest'

import { decideOrientation } from './report'

describe('decideOrientation', () => {
  it('uses portrait for low column counts', () => {
    expect(decideOrientation(8)).toBe('portrait')
    expect(decideOrientation(9)).toBe('portrait')
  })

  it('uses landscape for high column counts', () => {
    expect(decideOrientation(10)).toBe('landscape')
    expect(decideOrientation(14)).toBe('landscape')
  })
})

