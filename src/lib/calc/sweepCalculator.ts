import type {
  CompareSweepRequest,
  ScheduleRequest,
  SweepPoint,
  SweepResult,
} from '../../types/calc'
import { computeSchedule } from './mortgageCalculator'
import { findSweetSpot } from './sweetSpotAnalyzer'

const MAX_POINTS = 200

export function computeSweep(req: CompareSweepRequest): SweepResult {
  const { from, to, step } = req.sweep
  if (from == null || to == null || step == null) {
    throw new Error('from/to/step are required')
  }
  if (from < 0) throw new Error('from must be non-negative')
  if (to <= from) throw new Error('to must be greater than from')
  if (step <= 0) throw new Error('step must be positive')

  const baselineReq: ScheduleRequest = {
    ...req.base,
    recurringOverpayment: 0,
    customOverpayments: {},
    timeBands: [],
  }
  const baseline = computeSchedule(baselineReq)
  const baselineInterest = baseline.summary.totalInterest
  const baselineMonths = baseline.summary.months

  const overpaymentLevels: number[] = []
  for (let v = from; v <= to + 1e-9; v += step) {
    overpaymentLevels.push(Number(v.toFixed(8)))
    if (overpaymentLevels.length > MAX_POINTS) {
      throw new Error(
        `Sweep would produce more than ${MAX_POINTS} points — narrow the range or increase step`,
      )
    }
  }

  const rawPoints: SweepPoint[] = overpaymentLevels.map((over) => {
    const schedule = computeSchedule({
      ...req.base,
      recurringOverpayment: over,
      customOverpayments: {},
      timeBands: [],
    })
    return {
      overpayment: over,
      months: schedule.summary.months,
      totalInterest: schedule.summary.totalInterest,
      totalOverpayment: schedule.summary.totalOverpayment,
      interestSaved: round2(baselineInterest - schedule.summary.totalInterest),
      monthsSaved: baselineMonths - schedule.summary.months,
      marginalInterestSaved: 0,
    }
  })

  const points: SweepPoint[] = rawPoints.map((p, i) => {
    const next = rawPoints[i + 1]
    const marginal = next ? round2(next.interestSaved - p.interestSaved) : 0
    return { ...p, marginalInterestSaved: marginal }
  })

  const sweetSpot = findSweetSpot(points, req.sweetSpotThreshold ?? null)

  return {
    points,
    sweetSpot,
    baselineInterest,
    baselineMonths,
  }
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}
