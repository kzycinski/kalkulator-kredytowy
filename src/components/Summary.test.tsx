import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { Summary } from './Summary'
import type { Schedule, ScheduleSummary } from '../types/calc'

afterEach(() => cleanup())

function summaryOf(over: Partial<ScheduleSummary> = {}): ScheduleSummary {
  return {
    months: 360,
    totalInstallments: 1_228_755,
    totalInterest: 728_755,
    totalOverpayment: 0,
    totalPrincipalPaid: 500_000,
    totalPaid: 1_228_755,
    ...over,
  }
}

function scheduleOf(s: Partial<ScheduleSummary>): Schedule {
  return { summary: summaryOf(s), rows: [] }
}

describe('Summary', () => {
  it('shows placeholder when no schedule', () => {
    render(<Summary schedule={undefined} baseline={undefined} />)
    expect(screen.getByText(/Sprawdź parametry/i)).toBeInTheDocument()
  })

  it('renders months in "X lat Y mies" format', () => {
    const schedule = scheduleOf({ months: 360 })
    render(<Summary schedule={schedule} baseline={undefined} />)
    expect(screen.getByText(/30 lat/)).toBeInTheDocument()
  })

  it('computes monthsSaved correctly (360 - 246 = 9 lat 6 mies)', () => {
    const schedule = scheduleOf({ months: 246, totalInterest: 500_000, totalOverpayment: 100_000 })
    const baseline = scheduleOf({ months: 360, totalInterest: 728_755 })
    render(<Summary schedule={schedule} baseline={baseline} />)
    expect(screen.getByText(/9 lat 6 mies/)).toBeInTheDocument()
  })

  it('does not show monthsSaved when baseline equals or exceeds schedule months', () => {
    const schedule = scheduleOf({ months: 360 })
    const baseline = scheduleOf({ months: 360 })
    render(<Summary schedule={schedule} baseline={baseline} />)
    expect(screen.queryByText(/Skrócenie kredytu/i)).not.toBeInTheDocument()
  })

  it('computes interestSaved correctly', () => {
    const schedule = scheduleOf({ months: 246, totalInterest: 500_000, totalOverpayment: 100_000 })
    const baseline = scheduleOf({ months: 360, totalInterest: 728_755 })
    render(<Summary schedule={schedule} baseline={baseline} />)
    const saving = screen.getByText(/Oszczędność/i).nextElementSibling
    expect(saving?.textContent).toMatch(/228\s*755/)
  })

  it('computes ROI as percentage (interestSaved / overpayment)', () => {
    const schedule = scheduleOf({
      months: 246,
      totalInterest: 500_000,
      totalOverpayment: 100_000,
    })
    const baseline = scheduleOf({ months: 360, totalInterest: 728_755 })
    render(<Summary schedule={schedule} baseline={baseline} />)
    expect(screen.getByText(/228\.8%/)).toBeInTheDocument()
  })

  it('hides ROI when no overpayment', () => {
    const schedule = scheduleOf({ totalOverpayment: 0, totalInterest: 600_000 })
    const baseline = scheduleOf({ totalInterest: 700_000 })
    render(<Summary schedule={schedule} baseline={baseline} />)
    expect(screen.queryByText(/ROI nadpłat/i)).not.toBeInTheDocument()
  })

  it('renders donut chart', () => {
    const schedule = scheduleOf({})
    render(<Summary schedule={schedule} baseline={undefined} />)
    expect(screen.getByTestId('capital-interest-donut')).toBeInTheDocument()
  })
})
