import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { BalanceRaceChart } from './BalanceRaceChart'
import type { ScheduleRow } from '../types/calc'

afterEach(() => cleanup())

function makeRows(count: number, startBalance: number): ScheduleRow[] {
  const step = startBalance / count
  return Array.from({ length: count }, (_, i) => ({
    month: i + 1,
    date: '2026-01-01',
    installment: 3000,
    principalPart: step,
    interestPart: 0,
    overpayment: 0,
    balance: Math.max(0, startBalance - (i + 1) * step),
  }))
}

describe('BalanceRaceChart', () => {
  it('renders when both schedules have rows', () => {
    const { container } = render(
      <BalanceRaceChart
        baselineRows={makeRows(120, 500_000)}
        currentRows={makeRows(60, 500_000)}
        principal={500_000}
      />,
    )
    expect(container.querySelector('.recharts-responsive-container')).not.toBeNull()
  })

  it('returns null when baseline is empty', () => {
    const { container } = render(
      <BalanceRaceChart baselineRows={[]} currentRows={makeRows(12, 500_000)} principal={500_000} />,
    )
    expect(container.firstChild).toBeNull()
  })
})
