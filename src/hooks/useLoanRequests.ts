import { useMemo } from 'react'
import { useLoanStore } from '../store/loanStore'
import type { ScheduleRequest } from '../types/calc'

export function useBaseRequest(): ScheduleRequest {
  const principal = useLoanStore((s) => s.principal)
  const annualRate = useLoanStore((s) => s.annualRate)
  const termMonths = useLoanStore((s) => s.termMonths)
  const startDate = useLoanStore((s) => s.startDate)
  const installmentType = useLoanStore((s) => s.installmentType)
  const overpaymentStrategy = useLoanStore((s) => s.overpaymentStrategy)

  return useMemo<ScheduleRequest>(
    () => ({
      principal,
      annualRate,
      termMonths,
      startDate,
      installmentType,
      overpaymentStrategy,
      recurringOverpayment: 0,
      customOverpayments: {},
      timeBands: [],
    }),
    [principal, annualRate, termMonths, startDate, installmentType, overpaymentStrategy],
  )
}

export function useCurrentRequest(): ScheduleRequest {
  const principal = useLoanStore((s) => s.principal)
  const annualRate = useLoanStore((s) => s.annualRate)
  const termMonths = useLoanStore((s) => s.termMonths)
  const startDate = useLoanStore((s) => s.startDate)
  const installmentType = useLoanStore((s) => s.installmentType)
  const overpaymentStrategy = useLoanStore((s) => s.overpaymentStrategy)
  const recurringOverpayment = useLoanStore((s) => s.recurringOverpayment)
  const customOverpayments = useLoanStore((s) => s.customOverpayments)
  const timeBands = useLoanStore((s) => s.timeBands)

  return useMemo<ScheduleRequest>(
    () => ({
      principal,
      annualRate,
      termMonths,
      startDate,
      installmentType,
      overpaymentStrategy,
      recurringOverpayment,
      customOverpayments,
      timeBands,
    }),
    [
      principal,
      annualRate,
      termMonths,
      startDate,
      installmentType,
      overpaymentStrategy,
      recurringOverpayment,
      customOverpayments,
      timeBands,
    ],
  )
}
