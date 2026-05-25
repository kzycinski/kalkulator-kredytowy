import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBaseRequest, useCurrentRequest } from './useLoanRequests'
import { useLoanStore } from '../store/loanStore'

beforeEach(() => {
  localStorage.clear()
  useLoanStore.setState({
    principal: 500_000,
    annualRate: 0.05,
    termMonths: 360,
    startDate: '2026-01-01',
    installmentType: 'EQUAL',
    overpaymentStrategy: 'SHORTEN_TERM',
    recurringOverpayment: 500,
    customOverpayments: { 12: 5000 },
    timeBands: [{ fromMonth: 1, toMonth: 12, amount: 1000 }],
  })
})

describe('useBaseRequest', () => {
  it('returns ScheduleRequest with no overpayments', () => {
    const { result } = renderHook(() => useBaseRequest())
    expect(result.current.recurringOverpayment).toBe(0)
    expect(result.current.customOverpayments).toEqual({})
    expect(result.current.timeBands).toEqual([])
  })

  it('copies loan params from store', () => {
    const { result } = renderHook(() => useBaseRequest())
    expect(result.current.principal).toBe(500_000)
    expect(result.current.annualRate).toBe(0.05)
    expect(result.current.termMonths).toBe(360)
    expect(result.current.installmentType).toBe('EQUAL')
  })

  it('returns same reference when params unchanged', () => {
    const { result, rerender } = renderHook(() => useBaseRequest())
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })
})

describe('useCurrentRequest', () => {
  it('includes recurring overpayment from store', () => {
    const { result } = renderHook(() => useCurrentRequest())
    expect(result.current.recurringOverpayment).toBe(500)
  })

  it('includes custom overpayments and timeBands', () => {
    const { result } = renderHook(() => useCurrentRequest())
    expect(result.current.customOverpayments).toEqual({ 12: 5000 })
    expect(result.current.timeBands).toEqual([{ fromMonth: 1, toMonth: 12, amount: 1000 }])
  })
})
