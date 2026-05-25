import { describe, expect, it } from 'vitest'
import { round2, round4 } from './rounding'

describe('round2', () => {
  it('rounds to 2 decimal places', () => {
    expect(round2(1.234)).toBe(1.23)
    expect(round2(1.235)).toBe(1.24)
  })

  it('passes through whole numbers', () => {
    expect(round2(5)).toBe(5)
    expect(round2(0)).toBe(0)
  })

  it('handles negative numbers', () => {
    expect(round2(-1.234)).toBe(-1.23)
    expect(round2(-1.236)).toBe(-1.24)
  })
})

describe('round4', () => {
  it('rounds to 4 decimal places', () => {
    expect(round4(0.123456)).toBe(0.1235)
    expect(round4(0.12345)).toBe(0.1235)
  })
})
