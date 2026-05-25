import { describe, expect, it } from 'vitest'
import { computeSweep } from './sweepCalculator'
import type { CompareSweepRequest } from '../../types/calc'

function req(over: Partial<CompareSweepRequest> = {}): CompareSweepRequest {
  return {
    base: {
      principal: 500_000,
      annualRate: 0.0725,
      termMonths: 360,
      startDate: '2026-06-01',
      installmentType: 'EQUAL',
      overpaymentStrategy: 'SHORTEN_TERM',
    },
    sweep: { from: 0, to: 3000, step: 500 },
    ...over,
  }
}

describe('computeSweep', () => {
  it('produces correct number of points (0..3000 step 500 → 7)', () => {
    const result = computeSweep(req())
    expect(result.points).toHaveLength(7)
  })

  it('interestSaved is non-decreasing', () => {
    const result = computeSweep(req({ sweep: { from: 0, to: 2000, step: 200 } }))
    for (let i = 1; i < result.points.length; i++) {
      expect(result.points[i]!.interestSaved).toBeGreaterThanOrEqual(
        result.points[i - 1]!.interestSaved,
      )
    }
  })

  it('first point is baseline', () => {
    const result = computeSweep(req({ sweep: { from: 0, to: 1000, step: 500 } }))
    expect(result.points[0]?.overpayment).toBe(0)
    expect(result.points[0]?.interestSaved).toBe(0)
    expect(result.points[0]?.monthsSaved).toBe(0)
  })

  it('baseline matches first point', () => {
    const result = computeSweep(req({ sweep: { from: 0, to: 1000, step: 500 } }))
    expect(result.baselineInterest).toBe(result.points[0]?.totalInterest)
    expect(result.baselineMonths).toBe(360)
  })

  it('sweet spot identified for realistic loan with fine step', () => {
    const result = computeSweep(req({ sweep: { from: 0, to: 5000, step: 250 } }))
    expect(result.sweetSpot).not.toBeNull()
    expect(result.sweetSpot!.overpayment).toBeGreaterThan(0)
  })

  it('rejects non-positive step', () => {
    expect(() => computeSweep(req({ sweep: { from: 0, to: 1000, step: 0 } }))).toThrow()
  })

  it('rejects to <= from', () => {
    expect(() => computeSweep(req({ sweep: { from: 1000, to: 500, step: 100 } }))).toThrow()
  })

  it('rejects range producing too many points', () => {
    expect(() =>
      computeSweep(req({ sweep: { from: 0, to: 10000, step: 1 } })),
    ).toThrow(/200 points/)
  })
})
