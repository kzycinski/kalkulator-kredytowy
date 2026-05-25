import { describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDoradca, type DoradcaConfig } from './useDoradca'
import type { ScheduleRequest } from '../types/calc'

function wrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

const base: ScheduleRequest = {
  principal: 500_000,
  annualRate: 0.05,
  termMonths: 360,
  startDate: '2026-01-01',
  installmentType: 'EQUAL',
  overpaymentStrategy: 'SHORTEN_TERM',
}

function cfg(over: Partial<DoradcaConfig> = {}): DoradcaConfig {
  return {
    base,
    comfortable: 500,
    max: 2000,
    investmentRate: 5,
    ...over,
  }
}

describe('useDoradca', () => {
  it('returns strategies with comfort + max + sprint + tapered when max > comfort', async () => {
    const { result } = renderHook(() => useDoradca(cfg()), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.data).not.toBeNull(), { timeout: 3000 })
    const data = result.current.data!
    const cats = new Set(data.strategies.map((s) => s.category))
    expect(cats.has('comfort')).toBe(true)
    expect(cats.has('sprint')).toBe(true)
    expect(cats.has('tapered')).toBe(true)
  })

  it('omits max when max == comfortable', async () => {
    const { result } = renderHook(() => useDoradca(cfg({ comfortable: 500, max: 500 })), {
      wrapper: wrapper(),
    })
    await waitFor(() => expect(result.current.data).not.toBeNull(), { timeout: 3000 })
    const data = result.current.data!
    expect(data.strategies.some((s) => s.key === 'max-all')).toBe(false)
    expect(data.strategies.some((s) => s.key === 'comfort-all')).toBe(true)
  })

  it('marks strategies as hitsTarget when below targetMonths', async () => {
    const { result } = renderHook(
      () => useDoradca(cfg({ targetMonths: 240 })),
      { wrapper: wrapper() },
    )
    await waitFor(() => expect(result.current.data).not.toBeNull(), { timeout: 3000 })
    const data = result.current.data!
    const target = data.strategies.filter((s) => s.category === 'target')
    expect(target.length).toBeGreaterThan(0)
    for (const t of target.filter((s) => s.hitsTarget)) {
      expect(t.months).toBeLessThanOrEqual(240)
    }
  })

  it('picks bestByAbsoluteCost as the strategy with lowest totalPaid', async () => {
    const { result } = renderHook(() => useDoradca(cfg()), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.data).not.toBeNull(), { timeout: 3000 })
    const data = result.current.data!
    const best = data.strategies.find((s) => s.key === data.bestByAbsoluteCost)!
    const explorationOnly = data.strategies.filter(
      (s) => s.category !== 'target' && s.totalOverpayment > 0,
    )
    for (const s of explorationOnly) {
      expect(best.totalPaid).toBeLessThanOrEqual(s.totalPaid)
    }
  })

  it('picks bestByROI as strategy with highest interestSaved / totalOverpayment', async () => {
    const { result } = renderHook(() => useDoradca(cfg()), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.data).not.toBeNull(), { timeout: 3000 })
    const data = result.current.data!
    const best = data.strategies.find((s) => s.key === data.bestByROI)!
    const bestROI = best.interestSaved / Math.max(best.totalOverpayment, 1)
    const explorationOnly = data.strategies.filter(
      (s) => s.category !== 'target' && s.totalOverpayment > 0,
    )
    for (const s of explorationOnly) {
      const roi = s.interestSaved / Math.max(s.totalOverpayment, 1)
      expect(bestROI).toBeGreaterThanOrEqual(roi)
    }
  })

  it('bestHittingTarget is null when no target set', async () => {
    const { result } = renderHook(() => useDoradca(cfg()), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.data).not.toBeNull(), { timeout: 3000 })
    expect(result.current.data!.bestHittingTarget).toBeNull()
  })
})
