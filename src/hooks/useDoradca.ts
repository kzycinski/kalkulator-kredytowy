import { useMemo } from 'react'
import { useCompareScenarios } from './useCompareScenarios'
import type { ScenarioSpec, ScheduleRequest } from '../types/calc'

export interface DoradcaConfig {
  base: ScheduleRequest
  comfortable: number
  max: number
  targetMonths?: number
}

export type StrategyCategory = 'baseline' | 'comfort' | 'sprint' | 'tapered' | 'target'

export interface DoradcaStrategy {
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
}

export interface DoradcaResult {
  strategies: DoradcaStrategy[]
  baselineMonths: number
  baselineTotalPaid: number
  baselineInterest: number
  bestByCost: string | null
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

export function useDoradca(config: DoradcaConfig) {
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

  const result = useMemo<DoradcaResult | null>(() => {
    if (!query.data) return null
    const baseline = query.data.scenarios.find((s) => s.name === BASELINE_KEY)
    if (!baseline) return null

    const strategies: DoradcaStrategy[] = []
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
      })
    }

    const bestByCost = pickBestByCost(strategies)
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

function generateSpecs(config: DoradcaConfig): RawSpec[] {
  const out: RawSpec[] = []
  const { comfortable, max } = config
  const sprintDurations = [6, 12, 24, 36, 60]
  const halfMax = round2(max / 2)

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
        name: `Max przez ${labelMonths(dur)} → komfort`,
        description: `Pierwsze ${labelMonths(dur)} po ${max} PLN/mies, potem ${comfortable} PLN/mies.`,
        category: 'sprint',
        recurring: comfortable,
        timeBands: [{ fromMonth: 1, toMonth: dur, amount: max }],
      })
    }

    if (halfMax > comfortable) {
      for (const dur of [12, 24]) {
        out.push({
          key: `tapered-${dur}`,
          name: `Max przez ${labelMonths(dur)} → 50% max → komfort`,
          description: `${labelMonths(dur)} po ${max}, potem ${halfMax} przez ${labelMonths(dur)}, potem ${comfortable}.`,
          category: 'tapered',
          recurring: comfortable,
          timeBands: [
            { fromMonth: 1, toMonth: dur, amount: max },
            { fromMonth: dur + 1, toMonth: dur * 2, amount: halfMax },
          ],
        })
      }
    }
  }

  if (config.targetMonths !== undefined && max > 0) {
    const target = config.targetMonths
    const constantCandidates = 30
    for (let i = 1; i <= constantCandidates; i++) {
      const value = round2((max * i) / constantCandidates)
      if (value <= 0) continue
      out.push({
        key: `target-const-${value}`,
        name: `Stała ${value} PLN/mies (cel ${target} mies.)`,
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
          name: `Max przez ${labelMonths(dur)} → komfort (cel ${target} mies.)`,
          description: 'Kandydat: sprint na początku potem komfort.',
          category: 'target',
          recurring: comfortable,
          timeBands: [{ fromMonth: 1, toMonth: dur, amount: max }],
        })
      }
    }
  }

  return out
}

function pickBestByCost(strategies: DoradcaStrategy[]): string | null {
  const candidates = strategies.filter((s) => s.category !== 'target')
  if (candidates.length === 0) return null
  return candidates.reduce((best, s) => (s.totalPaid < best.totalPaid ? s : best)).key
}

function pickBestByROI(strategies: DoradcaStrategy[]): string | null {
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

function pickBestHittingTarget(strategies: DoradcaStrategy[]): string | null {
  const candidates = strategies.filter((s) => s.hitsTarget)
  if (candidates.length === 0) return null
  return candidates.reduce((best, s) => (s.totalPaid < best.totalPaid ? s : best)).key
}

function labelMonths(months: number): string {
  if (months === 6) return '6 mies.'
  if (months === 12) return '1 rok'
  if (months === 24) return '2 lata'
  if (months === 36) return '3 lata'
  if (months === 48) return '4 lata'
  if (months === 60) return '5 lat'
  if (months === 120) return '10 lat'
  if (months % 12 === 0) return `${months / 12} lat`
  return `${months} mies.`
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
