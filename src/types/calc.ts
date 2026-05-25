export type InstallmentType = 'EQUAL' | 'DECREASING'
export type OverpaymentStrategy = 'SHORTEN_TERM' | 'LOWER_INSTALLMENT'

export interface TimeBand {
  fromMonth: number
  toMonth: number
  amount: number
}

export interface ScheduleRequest {
  principal: number
  annualRate: number
  termMonths: number
  startDate?: string
  installmentType: InstallmentType
  overpaymentStrategy: OverpaymentStrategy
  recurringOverpayment?: number
  customOverpayments?: Record<number, number>
  timeBands?: TimeBand[]
}

export interface ScheduleRow {
  month: number
  date: string
  installment: number
  principalPart: number
  interestPart: number
  overpayment: number
  balance: number
}

export interface ScheduleSummary {
  months: number
  totalInstallments: number
  totalInterest: number
  totalOverpayment: number
  totalPrincipalPaid: number
  totalPaid: number
}

export interface Schedule {
  summary: ScheduleSummary
  rows: ScheduleRow[]
}

export interface SweepRange {
  from: number
  to: number
  step: number
}

export interface CompareSweepRequest {
  base: ScheduleRequest
  sweep: SweepRange
  sweetSpotThreshold?: number
}

export interface SweepPoint {
  overpayment: number
  months: number
  totalInterest: number
  totalOverpayment: number
  interestSaved: number
  monthsSaved: number
  marginalInterestSaved: number
}

export interface SweetSpot {
  overpayment: number
  interestSaved: number
  monthsSaved: number
  marginalInterestSaved: number
  reason: string
}

export interface SweepResult {
  points: SweepPoint[]
  sweetSpot: SweetSpot | null
  baselineInterest: number
  baselineMonths: number
}

export interface ScenarioSpec {
  name: string
  recurringOverpayment?: number
  customOverpayments?: Record<number, number>
  timeBands?: TimeBand[]
}

export interface CompareScenariosRequest {
  base: ScheduleRequest
  scenarios: ScenarioSpec[]
}

export interface ScenarioResult {
  name: string
  summary: ScheduleSummary
  monthsSaved: number
  interestSaved: number
  roi: number
}

export interface CompareResult {
  scenarios: ScenarioResult[]
  baseline: ScheduleSummary
}

export interface SaveScenarioRequest {
  name: string
  principal: number
  annualRate: number
  termMonths: number
  startDate?: string
  installmentType: InstallmentType
  overpaymentStrategy: OverpaymentStrategy
  recurringOverpayment?: number
  customOverpayments?: Record<number, number>
  timeBands?: TimeBand[]
}

export interface SavedScenario {
  id: string
  name: string
  principal: number
  annualRate: number
  termMonths: number
  startDate: string | null
  installmentType: InstallmentType
  overpaymentStrategy: OverpaymentStrategy
  recurringOverpayment: number
  customOverpayments: Record<number, number>
  timeBands: TimeBand[]
  createdAt: string
  updatedAt: string
}
