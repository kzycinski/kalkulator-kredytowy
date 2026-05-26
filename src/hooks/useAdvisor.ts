import { useMemo } from 'react'
import { useCompareScenarios } from './useCompareScenarios'
import type { ScenarioSpec, ScheduleRequest } from '../types/calc'
import {
  computeOverpaymentFlowInvestmentFV,
  computeReinvestedInstallmentProfit,
} from '../lib/calc/investment'
import { round2 } from '../lib/calc/rounding'
import { formatMonths } from '../lib/format'

export interface AdvisorConfig {
  base: ScheduleRequest
  comfortable: number
  max: number
  targetMonths?: number
  investmentRate: number
}

export type StrategyCategory = 'baseline' | 'comfort' | 'sprint' | 'tapered' | 'target'

export interface AdvisorStrategy {
  key: string
  name: string
  description: string
  category: StrategyCategory
  recurringOverpayment: number
  timeBands: { fromMonth: number; toMonth: number; amount: number }[]
  months: number
  totalPaid: number
  totalInterest: number
  totalOverpayment: number
  monthsSaved: number
  interestSaved: number
  avgOverpaymentPerMonth: number
  effortRatio: number
  hitsTarget: boolean
  investmentProfit: number
  investmentFV: number
  reinvestedInstallmentProfit: number
  investWins: boolean
}

export interface AdvisorResult {
  strategies: AdvisorStrategy[]
  baselineMonths: number
  baselineTotalPaid: number
  baselineInterest: number
  bestByCost: string | null
  bestByAbsoluteCost: string | null
  bestByROI: string | null
  bestHittingTarget: string | null
}

interface RawSpec {
  key: string
  name: string
  description: string
  category: StrategyCategory
  recurring: number
  timeBands: { fromMonth: number; toMonth: number; amount: number }[]
}

const BASELINE_KEY = '__baseline__'

export function useAdvisor(config: AdvisorConfig) {
  const rawSpecs = useMemo(() => generateSpecs(config), [config])

  const scenarios: ScenarioSpec[] = useMemo(() => {
    return rawSpecs.map((s) => ({
      name: s.key,
      recurringOverpayment: s.recurring,
      timeBands: s.timeBands,
    }))
  }, [rawSpecs])

  const request = useMemo(
    () => ({ base: config.base, scenarios }),
    [config.base, scenarios],
  )

  const query = useCompareScenarios(request)

  const result = useMemo<AdvisorResult | null>(() => {
    if (!query.data) return null
    const baseline = query.data.scenarios.find((s) => s.name === BASELINE_KEY)
    if (!baseline) return null

    const avgInstallment =
      baseline.summary.months > 0
        ? round2(baseline.summary.totalInstallments / baseline.summary.months)
        : 0
    const strategies: AdvisorStrategy[] = []
    for (const spec of rawSpecs) {
      if (spec.key === BASELINE_KEY) continue
      const entry = query.data.scenarios.find((s) => s.name === spec.key)
      if (!entry) continue
      const monthsSaved = baseline.summary.months - entry.summary.months
      const interestSaved = round2(
        baseline.summary.totalInterest - entry.summary.totalInterest,
      )
      const avg =
        entry.summary.months > 0
          ? round2(entry.summary.totalOverpayment / entry.summary.months)
          : 0
      const effortRatio = config.max > 0 ? Math.min(avg / config.max, 1) : 0
      const hitsTarget =
        config.targetMonths !== undefined && entry.summary.months <= config.targetMonths
      const investment = computeOverpaymentFlowInvestmentFV(
        entry.rows,
        baseline.summary.months,
        config.investmentRate,
      )
      const reinvestedInstallmentProfit = computeReinvestedInstallmentProfit(
        avgInstallment,
        monthsSaved,
        config.investmentRate,
      )
      strategies.push({
        key: spec.key,
        name: spec.name,
        description: spec.description,
        category: spec.category,
        recurringOverpayment: spec.recurring,
        timeBands: spec.timeBands,
        months: entry.summary.months,
        totalPaid: entry.summary.totalPaid,
        totalInterest: entry.summary.totalInterest,
        totalOverpayment: entry.summary.totalOverpayment,
        monthsSaved,
        interestSaved,
        avgOverpaymentPerMonth: avg,
        effortRatio,
        hitsTarget,
        investmentProfit: investment.profitNet,
        investmentFV: investment.fv,
        reinvestedInstallmentProfit,
        investWins: investment.profitNet > interestSaved + reinvestedInstallmentProfit,
      })
    }

    const bestByCost = pickBestByCost(strategies)
    const bestByAbsoluteCost = pickBestByAbsoluteCost(strategies)
    const bestByROI = pickBestByROI(strategies)
    const bestHittingTarget = config.targetMonths
      ? pickBestHittingTarget(strategies)
      : null

    return {
      strategies,
      baselineMonths: baseline.summary.months,
      baselineTotalPaid: baseline.summary.totalPaid,
      baselineInterest: baseline.summary.totalInterest,
      bestByCost,
      bestByAbsoluteCost,
      bestByROI,
      bestHittingTarget,
    }
  }, [query.data, rawSpecs, config])

  return {
    data: result,
    isLoading: query.isLoading,
    error: query.error,
    scenarioCount: scenarios.length,
  }
}

function generateSpecs(config: AdvisorConfig): RawSpec[] {
  const out: RawSpec[] = []
  const { comfortable, max } = config
  const sprintDurations = [6, 12, 24, 36, 60]
  const midPoint = round2((comfortable + max) / 2)

  out.push({
    key: BASELINE_KEY,
    name: 'Bez nadpłat',
    description: 'Punkt odniesienia — spłacasz tylko ratą.',
    category: 'baseline',
    recurring: 0,
    timeBands: [],
  })

  if (comfortable > 0) {
    out.push({
      key: 'comfort-all',
      name: `Komfort: ${comfortable} PLN/mies cały czas`,
      description: 'Stała komfortowa nadpłata przez cały okres kredytu.',
      category: 'comfort',
      recurring: comfortable,
      timeBands: [],
    })
  }

  if (max > 0 && max !== comfortable) {
    out.push({
      key: 'max-all',
      name: `Max: ${max} PLN/mies cały czas`,
      description: 'Sprintem przez cały kredyt — zero oszczędności.',
      category: 'sprint',
      recurring: max,
      timeBands: [],
    })
  }

  if (max > comfortable) {
    for (const dur of sprintDurations) {
      out.push({
        key: `sprint-${dur}`,
        name: `Max przez ${formatMonths(dur)} → komfort`,
        description: `Pierwsze ${formatMonths(dur)} po ${max} PLN/mies, potem ${comfortable} PLN/mies.`,
        category: 'sprint',
        recurring: comfortable,
        timeBands: [{ fromMonth: 1, toMonth: dur, amount: max }],
      })
    }

    for (const dur of [12, 24]) {
      out.push({
        key: `tapered-${dur}`,
        name: `Max przez ${formatMonths(dur)} → ${midPoint} PLN → komfort`,
        description: `${formatMonths(dur)} po ${max}, potem ${midPoint} (połowa dystansu) przez ${formatMonths(dur)}, potem ${comfortable}.`,
        category: 'tapered',
        recurring: comfortable,
        timeBands: [
          { fromMonth: 1, toMonth: dur, amount: max },
          { fromMonth: dur + 1, toMonth: dur * 2, amount: midPoint },
        ],
      })
    }
  }

  if (config.targetMonths !== undefined && max > 0) {
    const constantCandidates = 30
    for (let i = 1; i <= constantCandidates; i++) {
      const value = round2((max * i) / constantCandidates)
      if (value <= 0) continue
      out.push({
        key: `target-const-${value}`,
        name: `Stała ${value} PLN/mies`,
        description: 'Kandydat do osiągnięcia celu przy stałej nadpłacie.',
        category: 'target',
        recurring: value,
        timeBands: [],
      })
    }
    if (max > comfortable) {
      const sprintCandidates = [3, 6, 12, 18, 24, 36, 48, 60, 84, 120]
      for (const dur of sprintCandidates) {
        out.push({
          key: `target-sprint-${dur}`,
          name: `Max przez ${formatMonths(dur)} → komfort`,
          description: 'Kandydat: sprint na początku potem komfort.',
          category: 'target',
          recurring: comfortable,
          timeBands: [{ fromMonth: 1, toMonth: dur, amount: max }],
        })
      }
      const taperedCandidates = [6, 12, 18, 24, 36, 48, 60]
      for (const dur of taperedCandidates) {
        out.push({
          key: `target-tapered-${dur}`,
          name: `Max przez ${formatMonths(dur)} → ${midPoint} PLN → komfort`,
          description: 'Kandydat: schodek na początku potem komfort.',
          category: 'target',
          recurring: comfortable,
          timeBands: [
            { fromMonth: 1, toMonth: dur, amount: max },
            { fromMonth: dur + 1, toMonth: dur * 2, amount: midPoint },
          ],
        })
      }
    }
  }

  return out
}

function pickBestByCost(strategies: AdvisorStrategy[]): string | null {
  const sorted = strategies
    .filter((s) => s.category !== 'target' && s.totalOverpayment > 0)
    .sort((a, b) => a.avgOverpaymentPerMonth - b.avgOverpaymentPerMonth)

  if (sorted.length === 0) return null
  if (sorted.length === 1) return sorted[0]!.key

  let maxMarginal = 0
  const marginals: number[] = [0]
  for (let i = 1; i < sorted.length; i++) {
    const dEffort = sorted[i]!.avgOverpaymentPerMonth - sorted[i - 1]!.avgOverpaymentPerMonth
    const dSaved = sorted[i]!.interestSaved - sorted[i - 1]!.interestSaved
    const m = dEffort > 0 ? dSaved / dEffort : 0
    marginals.push(m)
    if (m > maxMarginal) maxMarginal = m
  }

  if (maxMarginal <= 0) return sorted[0]!.key

  let bestIdx = 0
  for (let i = 1; i < sorted.length; i++) {
    if (marginals[i]! >= 0.4 * maxMarginal) bestIdx = i
  }

  return sorted[bestIdx]!.key
}

function pickBestByROI(strategies: AdvisorStrategy[]): string | null {
  const candidates = strategies.filter(
    (s) => s.category !== 'target' && s.totalOverpayment > 0,
  )
  if (candidates.length === 0) return null
  return candidates.reduce((best, s) =>
    s.interestSaved / Math.max(s.totalOverpayment, 1) >
    best.interestSaved / Math.max(best.totalOverpayment, 1)
      ? s
      : best,
  ).key
}

function pickBestByAbsoluteCost(strategies: AdvisorStrategy[]): string | null {
  const candidates = strategies.filter((s) => s.category !== 'target' && s.totalOverpayment > 0)
  if (candidates.length === 0) return null
  return candidates.reduce((best, s) => (s.totalPaid < best.totalPaid ? s : best)).key
}

function pickBestHittingTarget(strategies: AdvisorStrategy[]): string | null {
  const candidates = strategies.filter((s) => s.hitsTarget)
  if (candidates.length === 0) return null
  return candidates.reduce((best, s) =>
    s.interestSaved / Math.max(s.totalOverpayment, 1) >
    best.interestSaved / Math.max(best.totalOverpayment, 1)
      ? s
      : best,
  ).key
}
