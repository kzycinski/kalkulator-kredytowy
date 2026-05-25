import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { InterestShareChart } from './InterestShareChart'
import type { ScheduleRow } from '../types/calc'

afterEach(() => cleanup())

function row(month: number, interest: number, principal: number): ScheduleRow {
  return {
    month,
    date: '2026-01-01',
    installment: interest + principal,
    principalPart: principal,
    interestPart: interest,
    overpayment: 0,
    balance: 0,
  }
}

describe('InterestShareChart', () => {
  it('renders chart for non-empty rows', () => {
    const rows = Array.from({ length: 24 }, (_, i) => row(i + 1, 100, 100))
    const { container } = render(<InterestShareChart rows={rows} crossoverMonth={12} />)
    expect(container.querySelector('.recharts-responsive-container')).not.toBeNull()
  })

  it('handles rows without crossover', () => {
    const rows = [row(1, 100, 50)]
    const { container } = render(<InterestShareChart rows={rows} crossoverMonth={null} />)
    expect(container.querySelector('.recharts-responsive-container')).not.toBeNull()
  })
})
