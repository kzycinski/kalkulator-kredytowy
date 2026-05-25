import { useMemo } from 'react'
import { useCompareScenarios } from './useCompareScenarios'
import type { ScenarioSpec, ScheduleRequest } from '../types/calc'
import {
  computeAnnuityInvestmentFV,
  computeReinvestedInstallmentProfit,
} from '../lib/calc/investment'
import { round2, round4 } from '../lib/calc/rounding'

export interface BonusAnalysisConfig {
  base: ScheduleRequest
  baseRecurring: number
  bonusFrom: number
  bonusTo: number
  bonusStep: number
  durationsMonths: number[]
  investmentRate: number
}

export interface BonusCell {
  bonus: number
  durationMonths: number
  months: number
  monthsSaved: number
  interestSaved: number
  totalOverpayment: number
  totalPaid: number
  totalInterest: number
  roi: number
  investmentFV: number
  investmentProfit: number
  reinvestedInstallmentProfit: number
}

export interface BonusAnalysisResult {
  bonuses: number[]
  durationsMonths: number[]
  cells: BonusCell[]
  baselineMonths: number
  baselineInterest: number
  baselineTotalPaid: number
}

const KEY_BASELINE = '__baseline__'

export function useBonusAnalysis(config: BonusAnalysisConfig) {
  const scenarios: ScenarioSpec[] = useMemo(() => {
    const out: ScenarioSpec[] = []
    out.push({ name: KEY_BASELINE, recurringOverpayment: config.baseRecurring })
    if (
      config.bonusTo <= config.bonusFrom ||
      config.bonusStep <= 0 ||
      config.durationsMonths.length === 0
    ) {
      return out
    }
    for (const dur of config.durationsMonths) {
      for (let b = config.bonusFrom; b <= config.bonusTo + 1e-9; b += config.bonusStep) {
        const bonus = round2(b)
        if (bonus === 0) continue
        out.push({
          name: encodeKey(bonus, dur),
          recurringOverpayment: config.baseRecurring,
          timeBands: [
            {
              fromMonth: 1,
              toMonth: dur,
              amount: config.baseRecurring + bonus,
            },
          ],
        })
      }
    }
    return out
  }, [config])

  const request = useMemo(
    () => ({ base: config.base, scenarios }),
    [config.base, scenarios],
  )

  const query = useCompareScenarios(request)

  const result = useMemo<BonusAnalysisResult | null>(() => {
    if (!query.data) return null
    const baseline = query.data.scenarios.find((s) => s.name === KEY_BASELINE)
    if (!baseline) return null

    const bonuses = bonusesFromConfig(config)
    const avgInstallment = round2(baseline.summary.totalInstallments / baseline.summary.months)
    const cells: BonusCell[] = []
    for (const dur of config.durationsMonths) {
      for (const bonus of bonuses) {
        if (bonus === 0) continue
        const entry = query.data.scenarios.find((s) => s.name === encodeKey(bonus, dur))
        if (!entry) continue
        const interestSaved = round2(
          baseline.summary.totalInterest - entry.summary.totalInterest,
        )
        const monthsSaved = baseline.summary.months - entry.summary.months
        const totalOverpayment = entry.summary.totalOverpayment
        const bonusTotalSpent = bonus * dur
        const roi = bonusTotalSpent > 0 ? round4(interestSaved / bonusTotalSpent) : 0
        const investment = computeAnnuityInvestmentFV(
          bonus,
          dur,
          baseline.summary.months,
          config.investmentRate,
        )
        const reinvestedInstallmentProfit = computeReinvestedInstallmentProfit(
          avgInstallment,
          monthsSaved,
          config.investmentRate,
        )
        cells.push({
          bonus,
          durationMonths: dur,
          months: entry.summary.months,
          monthsSaved,
          interestSaved,
          totalOverpayment,
          totalPaid: entry.summary.totalPaid,
          totalInterest: entry.summary.totalInterest,
          roi,
          investmentFV: investment.fv,
          investmentProfit: investment.profitNet,
          reinvestedInstallmentProfit,
        })
      }
    }

    return {
      bonuses: bonuses.filter((b) => b !== 0),
      durationsMonths: config.durationsMonths,
      cells,
      baselineMonths: baseline.summary.months,
      baselineInterest: baseline.summary.totalInterest,
      baselineTotalPaid: baseline.summary.totalPaid,
    }
  }, [query.data, config])

  return {
    data: result,
    isLoading: query.isLoading,
    error: query.error,
    scenarioCount: scenarios.length,
  }
}

function encodeKey(bonus: number, dur: number): string {
  return `b${bonus}_d${dur}`
}

function bonusesFromConfig(c: BonusAnalysisConfig): number[] {
  const out: number[] = []
  for (let b = c.bonusFrom; b <= c.bonusTo + 1e-9; b += c.bonusStep) {
    out.push(round2(b))
  }
  return out
}
