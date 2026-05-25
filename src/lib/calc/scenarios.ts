import type {
  CompareResult,
  CompareScenariosRequest,
  ScenarioResult,
  ScheduleRequest,
} from '../../types/calc'
import { computeSchedule } from './mortgageCalculator'
import { round2, round4 } from './rounding'

export function computeCompareScenarios(req: CompareScenariosRequest): CompareResult {
  const baselineReq: ScheduleRequest = {
    ...req.base,
    recurringOverpayment: 0,
    customOverpayments: {},
    timeBands: [],
  }
  const baseline = computeSchedule(baselineReq)

  const scenarios: ScenarioResult[] = req.scenarios.map((spec) => {
    const schedule = computeSchedule({
      ...req.base,
      recurringOverpayment: spec.recurringOverpayment ?? 0,
      customOverpayments: spec.customOverpayments ?? {},
      timeBands: spec.timeBands ?? [],
    })
    const interestSaved = round2(
      baseline.summary.totalInterest - schedule.summary.totalInterest,
    )
    const monthsSaved = baseline.summary.months - schedule.summary.months
    const roi =
      schedule.summary.totalOverpayment > 0
        ? round4(interestSaved / schedule.summary.totalOverpayment)
        : 0
    return {
      name: spec.name,
      summary: schedule.summary,
      rows: schedule.rows,
      monthsSaved,
      interestSaved,
      roi,
    }
  })

  return { scenarios, baseline: baseline.summary }
}
