import { Decimal } from 'decimal.js'
import { describe, expect, it } from 'vitest'
import { computeSchedule, equalInstallment } from './mortgageCalculator'
import type { ScheduleRequest } from '../../types/calc'

function req(over: Partial<ScheduleRequest> = {}): ScheduleRequest {
  return {
    principal: 500_000,
    annualRate: 0.0725,
    termMonths: 360,
    startDate: '2026-06-01',
    installmentType: 'EQUAL',
    overpaymentStrategy: 'SHORTEN_TERM',
    ...over,
  }
}

describe('equalInstallment', () => {
  it('matches Java reference: 100k @ 6% / 12m → 8606.64', () => {
    const result = equalInstallment(new Decimal(100_000), new Decimal('0.06'), 12)
    expect(result.toFixed(2)).toBe('8606.64')
  })

  it('zero rate divides equally', () => {
    const result = equalInstallment(new Decimal(12_000), new Decimal(0), 12)
    expect(result.toFixed(2)).toBe('1000.00')
  })

  it('zero principal returns zero', () => {
    const result = equalInstallment(new Decimal(0), new Decimal('0.06'), 12)
    expect(result.toFixed(2)).toBe('0.00')
  })

  it('zero term throws', () => {
    expect(() => equalInstallment(new Decimal(100_000), new Decimal('0.06'), 0)).toThrow()
  })
})

describe('computeSchedule', () => {
  it('no overpayment: principal sum equals principal exactly', () => {
    const result = computeSchedule(req())
    expect(result.summary.totalPrincipalPaid).toBe(500_000)
    expect(result.summary.months).toBe(360)
    expect(result.summary.totalInterest).toBeGreaterThan(0)
    expect(result.summary.totalOverpayment).toBe(0)
  })

  it('recurring overpayment shortens term', () => {
    const withOver = computeSchedule(req({ recurringOverpayment: 500 }))
    const baseline = computeSchedule(req())
    expect(withOver.summary.months).toBeLessThan(baseline.summary.months)
    expect(withOver.summary.totalInterest).toBeLessThan(baseline.summary.totalInterest)
  })

  it('huge custom overpayment closes loan, no negative balance', () => {
    const result = computeSchedule(
      req({
        principal: 100_000,
        annualRate: 0.06,
        termMonths: 60,
        customOverpayments: { 2: 1_000_000 },
      }),
    )
    const last = result.rows[result.rows.length - 1]
    expect(last?.balance).toBe(0)
    expect(result.summary.months).toBeLessThanOrEqual(2)
    for (const r of result.rows) {
      expect(r.balance).toBeGreaterThanOrEqual(0)
    }
  })

  it('LOWER_INSTALLMENT reduces installment after overpayment', () => {
    const result = computeSchedule(
      req({
        overpaymentStrategy: 'LOWER_INSTALLMENT',
        customOverpayments: { 1: 50_000 },
      }),
    )
    const m1 = result.rows[0]
    const m2 = result.rows[1]
    expect(m2?.installment).toBeLessThan(m1!.installment)
  })

  it('DECREASING has constant principal part', () => {
    const result = computeSchedule(
      req({
        principal: 120_000,
        annualRate: 0.06,
        termMonths: 120,
        installmentType: 'DECREASING',
      }),
    )
    const expected = 120_000 / 120
    for (let i = 0; i < result.rows.length - 1; i++) {
      expect(result.rows[i]?.principalPart).toBeCloseTo(expected, 2)
    }
  })

  it('zero rate produces equal installments', () => {
    const result = computeSchedule(
      req({ principal: 12_000, annualRate: 0, termMonths: 12 }),
    )
    expect(result.rows).toHaveLength(12)
    expect(result.summary.totalInterest).toBe(0)
  })

  it('single month term produces one row', () => {
    const result = computeSchedule(req({ principal: 1_000, annualRate: 0.06, termMonths: 1 }))
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]?.balance).toBe(0)
  })

  it('negative principal throws', () => {
    expect(() => computeSchedule(req({ principal: -1 }))).toThrow()
  })

  it('rows have sequential dates', () => {
    const result = computeSchedule(
      req({ principal: 60_000, annualRate: 0.06, termMonths: 12 }),
    )
    for (let i = 0; i < result.rows.length - 1; i++) {
      const cur = result.rows[i]?.date
      const next = result.rows[i + 1]?.date
      expect(cur).not.toBe(next)
    }
  })

  it('precedence: custom > timeBand > recurring', () => {
    const result = computeSchedule(
      req({
        recurringOverpayment: 100,
        timeBands: [{ fromMonth: 1, toMonth: 12, amount: 500 }],
        customOverpayments: { 5: 9999 },
      }),
    )
    expect(result.rows[0]?.overpayment).toBe(500)
    expect(result.rows[4]?.overpayment).toBe(9999)
    expect(result.rows[12]?.overpayment).toBe(100)
  })
})
