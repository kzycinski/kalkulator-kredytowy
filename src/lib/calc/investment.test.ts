import { describe, expect, it } from 'vitest'
import type { ScheduleRow } from '../../types/calc'
import {
  BELKA_TAX,
  computeAnnuityInvestmentFV,
  computeOverpaymentFlowInvestmentFV,
  computeReinvestedInstallmentProfit,
} from './investment'

function makeRow(month: number, overpayment: number): ScheduleRow {
  return {
    month,
    date: '2026-01-01',
    installment: 0,
    principalPart: 0,
    interestPart: 0,
    overpayment,
    balance: 0,
  }
}

describe('computeAnnuityInvestmentFV', () => {
  it('returns zeros when monthly is zero', () => {
    expect(computeAnnuityInvestmentFV(0, 12, 360, 10)).toEqual({
      fv: 0,
      principal: 0,
      profitNet: 0,
    })
  })

  it('returns only principal at zero rate', () => {
    const result = computeAnnuityInvestmentFV(1000, 12, 360, 0)
    expect(result.principal).toBe(12000)
    expect(result.fv).toBe(12000)
    expect(result.profitNet).toBe(0)
  })

  it('caps deposits at horizon when duration exceeds it', () => {
    const long = computeAnnuityInvestmentFV(1000, 600, 360, 10)
    const capped = computeAnnuityInvestmentFV(1000, 360, 360, 10)
    expect(long).toEqual(capped)
  })

  it('grows after deposits stop until horizon', () => {
    const noGrowth = computeAnnuityInvestmentFV(1000, 360, 360, 10)
    const withGrowth = computeAnnuityInvestmentFV(1000, 12, 360, 10)
    expect(withGrowth.fv).toBeGreaterThan(0)
    expect(noGrowth.fv).toBeGreaterThan(withGrowth.principal)
  })

  it('applies Belka tax only to positive profit', () => {
    const result = computeAnnuityInvestmentFV(1000, 12, 360, 10)
    const grossProfit = (result.profitNet / (1 - BELKA_TAX))
    expect(grossProfit).toBeGreaterThan(0)
    expect(result.fv).toBeCloseTo(result.principal + result.profitNet, 2)
  })
})

describe('computeOverpaymentFlowInvestmentFV', () => {
  it('matches annuity formula for constant cash flow', () => {
    const rows: ScheduleRow[] = []
    for (let m = 1; m <= 60; m++) rows.push(makeRow(m, 1000))
    const flow = computeOverpaymentFlowInvestmentFV(rows, 360, 10)
    const annuity = computeAnnuityInvestmentFV(1000, 60, 360, 10)
    expect(flow.principal).toBe(annuity.principal)
    expect(flow.profitNet).toBeCloseTo(annuity.profitNet, 0)
    expect(flow.fv).toBeCloseTo(annuity.fv, 0)
  })

  it('values front-loaded cash flow higher than averaged annuity', () => {
    const rows: ScheduleRow[] = []
    for (let m = 1; m <= 12; m++) rows.push(makeRow(m, 5000))
    for (let m = 13; m <= 200; m++) rows.push(makeRow(m, 1000))

    const flow = computeOverpaymentFlowInvestmentFV(rows, 360, 10)
    const total = 5000 * 12 + 1000 * 188
    const avg = total / 200
    const averaged = computeAnnuityInvestmentFV(avg, 200, 360, 10)

    expect(flow.principal).toBe(total)
    expect(averaged.principal).toBe(total)
    expect(flow.profitNet).toBeGreaterThan(averaged.profitNet)
  })

  it('ignores rows past the horizon', () => {
    const rows = [makeRow(1, 1000), makeRow(2, 1000), makeRow(400, 1000)]
    const result = computeOverpaymentFlowInvestmentFV(rows, 360, 10)
    expect(result.principal).toBe(2000)
  })

  it('returns zeros when no positive overpayments', () => {
    const rows = [makeRow(1, 0), makeRow(2, 0)]
    expect(computeOverpaymentFlowInvestmentFV(rows, 360, 10)).toEqual({
      fv: 0,
      principal: 0,
      profitNet: 0,
    })
  })
})

describe('computeReinvestedInstallmentProfit', () => {
  it('returns 0 for non-positive monthsSaved', () => {
    expect(computeReinvestedInstallmentProfit(3000, 0, 10)).toBe(0)
    expect(computeReinvestedInstallmentProfit(3000, -5, 10)).toBe(0)
  })

  it('returns 0 for zero rate', () => {
    expect(computeReinvestedInstallmentProfit(3000, 24, 0)).toBe(0)
  })

  it('grows with monthsSaved', () => {
    const short = computeReinvestedInstallmentProfit(3000, 12, 10)
    const long = computeReinvestedInstallmentProfit(3000, 60, 10)
    expect(long).toBeGreaterThan(short)
  })

  it('applies Belka tax', () => {
    const r = 10 / 100 / 12
    const installment = 3000
    const monthsSaved = 24
    const fv = installment * ((Math.pow(1 + r, monthsSaved) - 1) / r)
    const principal = installment * monthsSaved
    const expectedNet = (fv - principal) * (1 - BELKA_TAX)
    expect(computeReinvestedInstallmentProfit(installment, monthsSaved, 10)).toBeCloseTo(
      expectedNet,
      0,
    )
  })
})
