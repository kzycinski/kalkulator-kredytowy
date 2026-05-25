import type { ScheduleRow } from '../../types/calc'
import { round2 } from './rounding'

export const BELKA_TAX = 0.19

export interface InvestmentFV {
  fv: number
  principal: number
  profitNet: number
}

function monthlyRate(annualRatePct: number): number {
  return annualRatePct / 100 / 12
}

function netProfit(grossFV: number, principal: number): number {
  const gross = grossFV - principal
  return Math.max(0, gross) * (1 - BELKA_TAX)
}

export function computeAnnuityInvestmentFV(
  monthly: number,
  depositMonths: number,
  horizonMonths: number,
  annualRatePct: number,
): InvestmentFV {
  const effectiveDur = Math.min(depositMonths, horizonMonths)
  const principal = monthly * effectiveDur
  if (monthly <= 0 || effectiveDur <= 0) {
    return { fv: 0, principal: 0, profitNet: 0 }
  }
  const r = monthlyRate(annualRatePct)
  if (r === 0) {
    return { fv: round2(principal), principal: round2(principal), profitNet: 0 }
  }
  const fvAtEnd = monthly * ((Math.pow(1 + r, effectiveDur) - 1) / r)
  const growthMonths = Math.max(0, horizonMonths - effectiveDur)
  const grossFV = fvAtEnd * Math.pow(1 + r, growthMonths)
  const profitNet = netProfit(grossFV, principal)
  return {
    fv: round2(principal + profitNet),
    principal: round2(principal),
    profitNet: round2(profitNet),
  }
}

export function computeOverpaymentFlowInvestmentFV(
  rows: ScheduleRow[],
  horizonMonths: number,
  annualRatePct: number,
): InvestmentFV {
  let principal = 0
  let grossFV = 0
  const r = monthlyRate(annualRatePct)
  for (const row of rows) {
    if (row.overpayment <= 0) continue
    if (row.month > horizonMonths) continue
    principal += row.overpayment
    const growth = horizonMonths - row.month
    grossFV += row.overpayment * Math.pow(1 + r, growth)
  }
  if (principal <= 0) return { fv: 0, principal: 0, profitNet: 0 }
  if (r === 0) {
    return { fv: round2(principal), principal: round2(principal), profitNet: 0 }
  }
  const profitNet = netProfit(grossFV, principal)
  return {
    fv: round2(principal + profitNet),
    principal: round2(principal),
    profitNet: round2(profitNet),
  }
}

export function computeReinvestedInstallmentProfit(
  installment: number,
  monthsSaved: number,
  annualRatePct: number,
): number {
  if (monthsSaved <= 0 || installment <= 0) return 0
  const r = monthlyRate(annualRatePct)
  if (r === 0) return 0
  const fv = installment * ((Math.pow(1 + r, monthsSaved) - 1) / r)
  const principal = installment * monthsSaved
  return round2(netProfit(fv, principal))
}
