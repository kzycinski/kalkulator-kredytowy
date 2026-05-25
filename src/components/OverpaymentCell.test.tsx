import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { OverpaymentCell } from './OverpaymentCell'
import { useLoanStore } from '../store/loanStore'
import type { ScheduleRow } from '../types/calc'

beforeEach(() => {
  localStorage.clear()
  useLoanStore.setState({
    customOverpayments: {},
    recurringOverpayment: 500,
    termMonths: 360,
    copyToNextCount: null,
  })
})

afterEach(() => cleanup())

function row(month: number, overpayment: number): ScheduleRow {
  return {
    month,
    date: '2026-06-01',
    installment: 3413,
    principalPart: 393,
    interestPart: 3020,
    overpayment,
    balance: 499607,
  }
}

describe('OverpaymentCell', () => {
  it('shows backend overpayment when no custom set', () => {
    render(<OverpaymentCell row={row(5, 500)} />)
    const input = screen.getByLabelText(/Nadpłata miesiąc 5/i) as HTMLInputElement
    expect(input.value).toBe('500')
    expect(screen.queryByLabelText(/własna nadpłata/i)).not.toBeInTheDocument()
  })

  it('shows custom value when set', () => {
    useLoanStore.getState().setCustomOverpayment(5, 1234)
    render(<OverpaymentCell row={row(5, 500)} />)
    const input = screen.getByLabelText(/Nadpłata miesiąc 5/i) as HTMLInputElement
    expect(input.value).toBe('1234')
  })

  it('shows custom indicator when overridden', () => {
    useLoanStore.getState().setCustomOverpayment(5, 1234)
    render(<OverpaymentCell row={row(5, 500)} />)
    expect(screen.getByLabelText(/własna nadpłata/i)).toBeInTheDocument()
  })

  it('input change updates store', () => {
    render(<OverpaymentCell row={row(5, 500)} />)
    const input = screen.getByLabelText(/Nadpłata miesiąc 5/i)
    fireEvent.change(input, { target: { value: '2000' } })
    expect(useLoanStore.getState().customOverpayments[5]).toBe(2000)
  })

  it('clicking copy button opens dialog', () => {
    render(<OverpaymentCell row={row(5, 500)} />)
    fireEvent.click(screen.getByLabelText(/Kopiuj nadpłatę z miesiąca 5/i))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
