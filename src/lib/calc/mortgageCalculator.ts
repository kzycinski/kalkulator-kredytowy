import { Decimal } from 'decimal.js'
import type {
  InstallmentType,
  Schedule,
  ScheduleRequest,
  ScheduleRow,
  ScheduleSummary,
  TimeBand,
} from '../../types/calc'

const ZERO = new Decimal(0)
const ONE = new Decimal(1)
const TWELVE = new Decimal(12)
const ROUND = Decimal.ROUND_HALF_EVEN

function round2(d: Decimal): Decimal {
  return d.toDecimalPlaces(2, ROUND)
}

function toNum(d: Decimal): number {
  return round2(d).toNumber()
}

function nonNegative(d: Decimal): Decimal {
  return d.isNegative() ? ZERO : d
}

function addMonths(isoDate: string, months: number): string {
  const parts = isoDate.split('-').map(Number)
  const y = parts[0] ?? 2026
  const m = parts[1] ?? 1
  const d = parts[2] ?? 1
  const date = new Date(Date.UTC(y, m - 1 + months, d))
  return date.toISOString().slice(0, 10)
}

export function equalInstallment(
  principal: Decimal,
  annualRate: Decimal,
  termMonths: number,
): Decimal {
  if (termMonths <= 0) throw new Error('termMonths must be positive')
  if (principal.isZero()) return ZERO
  if (annualRate.isZero()) {
    return principal.dividedBy(termMonths).toDecimalPlaces(2, ROUND)
  }
  const monthlyRate = annualRate.dividedBy(TWELVE)
  const onePlusR = ONE.plus(monthlyRate)
  const pow = onePlusR.pow(termMonths)
  const numerator = principal.times(monthlyRate).times(pow)
  const denominator = pow.minus(ONE)
  return numerator.dividedBy(denominator).toDecimalPlaces(2, ROUND)
}

function resolveOverpayment(
  month: number,
  recurring: Decimal,
  customMap: Map<number, Decimal>,
  timeBands: TimeBand[],
): Decimal {
  const custom = customMap.get(month)
  if (custom !== undefined) return nonNegative(custom)
  for (const band of timeBands) {
    if (month >= band.fromMonth && month <= band.toMonth) {
      return nonNegative(new Decimal(band.amount))
    }
  }
  return nonNegative(recurring)
}

function validate(req: ScheduleRequest): void {
  if (req.principal == null || req.principal < 0) {
    throw new Error('principal must be non-negative')
  }
  if (req.annualRate == null || req.annualRate < 0) {
    throw new Error('annualRate must be non-negative')
  }
  if (req.termMonths == null || req.termMonths <= 0) {
    throw new Error('termMonths must be positive')
  }
  if (!req.installmentType) throw new Error('installmentType required')
  if (!req.overpaymentStrategy) throw new Error('overpaymentStrategy required')
}

function buildCustomMap(custom: Record<number, number> | undefined): Map<number, Decimal> {
  const map = new Map<number, Decimal>()
  if (!custom) return map
  for (const [k, v] of Object.entries(custom)) {
    if (v == null) continue
    map.set(Number(k), new Decimal(v))
  }
  return map
}

function row(
  month: number,
  start: string,
  installment: Decimal,
  principalPart: Decimal,
  interestPart: Decimal,
  overpayment: Decimal,
  balance: Decimal,
): ScheduleRow {
  return {
    month,
    date: addMonths(start, month - 1),
    installment: toNum(installment),
    principalPart: toNum(principalPart),
    interestPart: toNum(interestPart),
    overpayment: toNum(overpayment),
    balance: toNum(balance),
  }
}

function buildSummary(rows: ScheduleRow[]): ScheduleSummary {
  let totalInstallments = ZERO
  let totalInterest = ZERO
  let totalOverpayment = ZERO
  let totalPrincipalPaid = ZERO
  for (const r of rows) {
    totalInstallments = totalInstallments.plus(r.installment)
    totalInterest = totalInterest.plus(r.interestPart)
    totalOverpayment = totalOverpayment.plus(r.overpayment)
    totalPrincipalPaid = totalPrincipalPaid.plus(r.principalPart)
  }
  const totalPaid = totalInstallments.plus(totalOverpayment)
  return {
    months: rows.length,
    totalInstallments: toNum(totalInstallments),
    totalInterest: toNum(totalInterest),
    totalOverpayment: toNum(totalOverpayment),
    totalPrincipalPaid: toNum(totalPrincipalPaid),
    totalPaid: toNum(totalPaid),
  }
}

function monthlyRate(annualRate: Decimal): Decimal {
  if (annualRate.isZero()) return ZERO
  return annualRate.dividedBy(TWELVE)
}

function computeEqual(req: ScheduleRequest): Schedule {
  const principal = new Decimal(req.principal)
  const annualRate = new Decimal(req.annualRate)
  const recurring = new Decimal(req.recurringOverpayment ?? 0)
  const customMap = buildCustomMap(req.customOverpayments)
  const bands = req.timeBands ?? []
  const start = req.startDate ?? new Date().toISOString().slice(0, 10)
  const mRate = monthlyRate(annualRate)

  let balance = principal
  let installment = equalInstallment(principal, annualRate, req.termMonths)
  const rows: ScheduleRow[] = []

  for (let m = 1; m <= req.termMonths && balance.gt(ZERO); m++) {
    const interest = balance.times(mRate).toDecimalPlaces(2, ROUND)
    let principalPart = installment.minus(interest)
    let overpay = resolveOverpayment(m, recurring, customMap, bands)

    const isLastIteration = m === req.termMonths
    const canCloseEarly = balance.lte(principalPart.plus(overpay))

    if (isLastIteration || canCloseEarly) {
      principalPart = balance
      const lastInstallment = principalPart.plus(interest)
      rows.push(row(m, start, lastInstallment, principalPart, interest, ZERO, ZERO))
      balance = ZERO
      break
    }

    balance = balance.minus(principalPart).minus(overpay)
    rows.push(row(m, start, installment, principalPart, interest, overpay, balance))

    if (
      req.overpaymentStrategy === 'LOWER_INSTALLMENT' &&
      overpay.gt(ZERO)
    ) {
      const remaining = req.termMonths - m
      if (remaining > 0 && balance.gt(ZERO)) {
        installment = equalInstallment(balance, annualRate, remaining)
      }
    }
  }

  return { summary: buildSummary(rows), rows }
}

function computeDecreasing(req: ScheduleRequest): Schedule {
  const principal = new Decimal(req.principal)
  const annualRate = new Decimal(req.annualRate)
  const recurring = new Decimal(req.recurringOverpayment ?? 0)
  const customMap = buildCustomMap(req.customOverpayments)
  const bands = req.timeBands ?? []
  const start = req.startDate ?? new Date().toISOString().slice(0, 10)
  const mRate = monthlyRate(annualRate)
  const constPrincipal = principal.dividedBy(req.termMonths).toDecimalPlaces(2, ROUND)

  let balance = principal
  const rows: ScheduleRow[] = []

  for (let m = 1; m <= req.termMonths && balance.gt(ZERO); m++) {
    const interest = balance.times(mRate).toDecimalPlaces(2, ROUND)
    let principalPart = constPrincipal
    let overpay = resolveOverpayment(m, recurring, customMap, bands)

    const isLastIteration = m === req.termMonths
    const canCloseEarly = balance.lte(principalPart.plus(overpay))

    if (isLastIteration || canCloseEarly) {
      principalPart = balance
      const lastInstallment = principalPart.plus(interest)
      rows.push(row(m, start, lastInstallment, principalPart, interest, ZERO, ZERO))
      balance = ZERO
      break
    }

    const installment = principalPart.plus(interest)
    balance = balance.minus(principalPart).minus(overpay)
    rows.push(row(m, start, installment, principalPart, interest, overpay, balance))
  }

  return { summary: buildSummary(rows), rows }
}

export function computeSchedule(req: ScheduleRequest): Schedule {
  validate(req)
  const type: InstallmentType = req.installmentType
  return type === 'EQUAL' ? computeEqual(req) : computeDecreasing(req)
}
