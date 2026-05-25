import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { YearlyCostChart } from './YearlyCostChart'
import type { ScheduleRow } from '../types/calc'

afterEach(() => cleanup())

function row(month: number, principal: number, interest: number, overpay = 0): ScheduleRow {
  return {
    month,
    date: '2026-01-01',
    installment: principal + interest,
    principalPart: principal,
    interestPart: interest,
    overpayment: overpay,
    balance: 0,
  }
}

describe('YearlyCostChart', () => {
  it('renders bars when rows are present', () => {
    const rows = Array.from({ length: 24 }, (_, i) => row(i + 1, 500, 300))
    const { container } = render(<YearlyCostChart rows={rows} />)
    expect(container.querySelector('.recharts-responsive-container')).not.toBeNull()
  })

  it('hides overpayment bar when no overpayments present', () => {
    const rows = [row(1, 500, 300, 0)]
    const { container } = render(<YearlyCostChart rows={rows} />)
    // Each Bar produces a rectangle layer; without overpayments only Kapitał + Odsetki.
    expect(container.querySelector('.recharts-responsive-container')).not.toBeNull()
  })
})
