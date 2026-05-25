import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Charts } from './Charts'
import type { ScheduleRow } from '../types/calc'

afterEach(() => cleanup())

function makeRows(n: number): ScheduleRow[] {
  return Array.from({ length: n }, (_, i) => ({
    month: i + 1,
    date: `2026-${String(((i % 12) + 1)).padStart(2, '0')}-01`,
    installment: 3413,
    principalPart: 393,
    interestPart: 3020,
    overpayment: 0,
    balance: 500000 - (i + 1) * 393,
  }))
}

describe('Charts', () => {
  it('renders balance chart on default tab', () => {
    render(<Charts rows={makeRows(12)} annualRate={0.06} />)
    expect(screen.getByTestId('balance-chart')).toBeInTheDocument()
    expect(screen.queryByTestId('breakdown-chart')).not.toBeInTheDocument()
  })

  it('switches to breakdown chart on tab click', () => {
    render(<Charts rows={makeRows(12)} annualRate={0.06} />)
    fireEvent.click(screen.getByRole('tab', { name: /Struktura/i }))
    expect(screen.getByTestId('breakdown-chart')).toBeInTheDocument()
  })

  it('switches to cumulative chart on tab click', () => {
    render(<Charts rows={makeRows(12)} annualRate={0.06} />)
    fireEvent.click(screen.getByRole('tab', { name: /Skumulowane/i }))
    expect(screen.getByTestId('cumulative-chart')).toBeInTheDocument()
  })

  it('switches to value chart on tab click', () => {
    render(<Charts rows={makeRows(12)} annualRate={0.06} />)
    fireEvent.click(screen.getByRole('tab', { name: /Wartość nadpłaty/i }))
    expect(screen.getByTestId('value-chart')).toBeInTheDocument()
  })

  it('renders heading with loan length', () => {
    render(<Charts rows={makeRows(12)} annualRate={0.06} />)
    expect(screen.getByRole('heading', { name: /Wykresy/ })).toBeInTheDocument()
    expect(screen.getByText(/12 rat • 1 rok/)).toBeInTheDocument()
  })
})
