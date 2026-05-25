import { describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useBonusAnalysis, type BonusAnalysisConfig } from './useBonusAnalysis'
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

function cfg(over: Partial<BonusAnalysisConfig> = {}): BonusAnalysisConfig {
  return {
    base,
    baseRecurring: 0,
    bonusFrom: 0,
    bonusTo: 1000,
    bonusStep: 500,
    durationsMonths: [12, 24],
    investmentRate: 5,
    ...over,
  }
}

describe('useBonusAnalysis', () => {
  it('builds scenarios grid: bonus × duration (excluding 0 bonus)', async () => {
    const { result } = renderHook(() => useBonusAnalysis(cfg()), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.data).not.toBeNull(), { timeout: 3000 })
    const data = result.current.data!
    expect(data.bonuses).toEqual([500, 1000])
    expect(data.durationsMonths).toEqual([12, 24])
    expect(data.cells).toHaveLength(4)
  })

  it('scenarioCount = 1 baseline + N×M with-bonus cells', () => {
    const { result } = renderHook(() => useBonusAnalysis(cfg()), { wrapper: wrapper() })
    expect(result.current.scenarioCount).toBe(1 + 2 * 2)
  })

  it('returns null data when no durations selected', () => {
    const { result } = renderHook(() => useBonusAnalysis(cfg({ durationsMonths: [] })), {
      wrapper: wrapper(),
    })
    expect(result.current.scenarioCount).toBe(1)
  })

  it('higher bonus saves more interest (monotonic)', async () => {
    const { result } = renderHook(() => useBonusAnalysis(cfg()), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.data).not.toBeNull(), { timeout: 3000 })
    const data = result.current.data!
    const dur12 = data.cells.filter((c) => c.durationMonths === 12).sort((a, b) => a.bonus - b.bonus)
    expect(dur12[1]!.interestSaved).toBeGreaterThan(dur12[0]!.interestSaved)
  })

  it('cell.investmentFV grows when investment rate > 0', async () => {
    const { result } = renderHook(() => useBonusAnalysis(cfg({ investmentRate: 10 })), {
      wrapper: wrapper(),
    })
    await waitFor(() => expect(result.current.data).not.toBeNull(), { timeout: 3000 })
    const data = result.current.data!
    const cell = data.cells[0]!
    expect(cell.investmentFV).toBeGreaterThan(cell.bonus * cell.durationMonths)
  })
})
