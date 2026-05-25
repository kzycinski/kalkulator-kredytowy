import { describe, expect, it } from 'vitest'
import { findSweetSpot } from './sweetSpotAnalyzer'
import type { SweepPoint } from '../../types/calc'

function point(over: number, interestSaved: number, marginal: number): SweepPoint {
  return {
    overpayment: over,
    months: 300,
    totalInterest: 0,
    totalOverpayment: over * 100,
    interestSaved,
    monthsSaved: 0,
    marginalInterestSaved: marginal,
  }
}

describe('findSweetSpot', () => {
  it('returns end of last worthwhile step', () => {
    const points = [
      point(0, 0, 100),
      point(100, 100, 100),
      point(200, 200, 80),
      point(300, 280, 50),
      point(400, 330, 40),
      point(500, 370, 30),
      point(600, 400, 0),
    ]
    const result = findSweetSpot(points, 0.5)
    expect(result?.overpayment).toBe(400)
  })

  it('uses default threshold 0.5 when null', () => {
    const points = [
      point(0, 0, 100),
      point(100, 100, 100),
      point(200, 200, 60),
      point(300, 260, 30),
      point(400, 290, 0),
    ]
    const result = findSweetSpot(points, null)
    expect(result?.overpayment).toBe(300)
  })

  it('returns null for empty', () => {
    expect(findSweetSpot([], 0.5)).toBeNull()
  })

  it('returns null for single point', () => {
    expect(findSweetSpot([point(0, 0, 0)], 0.5)).toBeNull()
  })

  it('returns null when all marginals zero', () => {
    expect(findSweetSpot([point(0, 0, 0), point(100, 0, 0)], 0.5)).toBeNull()
  })

  it('higher threshold picks earlier point', () => {
    const points = [
      point(0, 0, 100),
      point(100, 100, 90),
      point(200, 190, 70),
      point(300, 260, 50),
      point(400, 310, 0),
    ]
    const lenient = findSweetSpot(points, 0.4)
    const strict = findSweetSpot(points, 0.8)
    expect(lenient?.overpayment).toBe(400)
    expect(strict?.overpayment).toBe(200)
  })
})
