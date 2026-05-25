import { Decimal } from 'decimal.js'
import type { SweepPoint, SweetSpot } from '../../types/calc'

const DEFAULT_THRESHOLD = new Decimal('0.5')

export function findSweetSpot(
  points: SweepPoint[],
  thresholdRatio: number | null | undefined,
): SweetSpot | null {
  if (!points || points.length < 2) return null

  const threshold = thresholdRatio != null ? new Decimal(thresholdRatio) : DEFAULT_THRESHOLD

  let maxMarginal = new Decimal(0)
  for (const p of points) {
    const m = new Decimal(p.marginalInterestSaved)
    if (m.gt(maxMarginal)) maxMarginal = m
  }
  if (maxMarginal.lte(0)) return null

  const cutoff = maxMarginal.times(threshold)

  let chosenIdx = -1
  for (let i = 0; i < points.length - 1; i++) {
    const m = new Decimal(points[i]!.marginalInterestSaved)
    if (m.gte(cutoff)) chosenIdx = i + 1
  }
  if (chosenIdx < 0) return null
  const chosen = points[chosenIdx]!

  const reason =
    `Marginalna oszczędność ${chosen.marginalInterestSaved.toFixed(2)} PLN ≥ ` +
    `${threshold.times(100).toFixed(1)}% z maks. marginalnej ` +
    `(${maxMarginal.toFixed(2)} PLN)`

  return {
    overpayment: chosen.overpayment,
    interestSaved: chosen.interestSaved,
    monthsSaved: chosen.monthsSaved,
    marginalInterestSaved: chosen.marginalInterestSaved,
    reason,
  }
}
