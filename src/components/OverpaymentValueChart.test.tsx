import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { OverpaymentValueChart, computeValuePoints } from './OverpaymentValueChart'
import type { ScheduleRow } from '../types/calc'

afterEach(() => cleanup())

function makeRow(month: number, balance = 100): ScheduleRow {
  return {
    month,
    date: '2026-01-01',
    installment: 1000,
    principalPart: 800,
    interestPart: 200,
    overpayment: 0,
    balance,
  }
}

describe('computeValuePoints', () => {
  it('returns empty array for empty rows', () => {
    expect(computeValuePoints([], 0.06)).toEqual([])
  })

  it('returns empty array for zero rate', () => {
    expect(computeValuePoints([makeRow(1), makeRow(2)], 0)).toEqual([])
  })

  it('computes value linearly: (remaining months) × monthly rate', () => {
    const rows = [makeRow(1), makeRow(2), makeRow(3)]
    const result = computeValuePoints(rows, 0.12)
    expect(result).toHaveLength(3)
    expect(result[0]?.valuePerZloty).toBeCloseTo(3 * 0.01)
    expect(result[1]?.valuePerZloty).toBeCloseTo(2 * 0.01)
    expect(result[2]?.valuePerZloty).toBeCloseTo(1 * 0.01)
  })

  it('value decreases over time', () => {
    const rows = Array.from({ length: 12 }, (_, i) => makeRow(i + 1))
    const result = computeValuePoints(rows, 0.06)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!.valuePerZloty).toBeLessThan(result[i - 1]!.valuePerZloty)
    }
  })
})

describe('OverpaymentValueChart', () => {
  it('renders chart wrapper when data present', () => {
    const rows = [makeRow(1), makeRow(2), makeRow(3)]
    render(<OverpaymentValueChart rows={rows} annualRate={0.06} />)
    expect(screen.getByTestId('value-chart')).toBeInTheDocument()
  })

  it('shows empty state for no rows', () => {
    render(<OverpaymentValueChart rows={[]} annualRate={0.06} />)
    expect(screen.getByText(/Brak danych/)).toBeInTheDocument()
  })

  it('shows empty state for zero rate', () => {
    render(<OverpaymentValueChart rows={[makeRow(1)]} annualRate={0} />)
    expect(screen.getByText(/Brak danych/)).toBeInTheDocument()
  })
})
