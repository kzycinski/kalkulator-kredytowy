import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ScheduleTable } from './ScheduleTable'
import type { ScheduleRow } from '../types/calc'

afterEach(() => {
  cleanup()
})

function makeRow(month: number): ScheduleRow {
  const monthNum = ((month - 1) % 12) + 1
  return {
    month,
    date: `2026-${String(monthNum).padStart(2, '0')}-01`,
    installment: 3413.21,
    principalPart: 392.04,
    interestPart: 3021.17,
    overpayment: 0,
    balance: 500000 - month * 392.04,
  }
}

describe('ScheduleTable', () => {
  it('renders all rows on single page when count is at most page size', () => {
    const rows = Array.from({ length: 12 }, (_, i) => makeRow(i + 1))
    render(<ScheduleTable rows={rows} />)
    expect(screen.getByText(/12 rat\s+•\s+1 rok/)).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(13)
  })

  it('uses correct Polish plural for 2 rows', () => {
    const rows = [makeRow(1), makeRow(2)]
    render(<ScheduleTable rows={rows} />)
    expect(screen.getByText(/2 raty\s+•/)).toBeInTheDocument()
  })

  it('uses singular "rata" for 1 row', () => {
    const rows = [makeRow(1)]
    render(<ScheduleTable rows={rows} />)
    expect(screen.getByText(/1 rata\s+•/)).toBeInTheDocument()
  })

  it('paginates when more than 60 rows', () => {
    const rows = Array.from({ length: 100 }, (_, i) => makeRow(i + 1))
    render(<ScheduleTable rows={rows} />)
    expect(screen.getByText(/Strona 1 z 2/)).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(61)
  })

  it('navigates to next page', () => {
    const rows = Array.from({ length: 100 }, (_, i) => makeRow(i + 1))
    render(<ScheduleTable rows={rows} />)
    fireEvent.click(screen.getByRole('button', { name: /Następna/i }))
    expect(screen.getByText(/Strona 2 z 2/)).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(41)
  })
})
