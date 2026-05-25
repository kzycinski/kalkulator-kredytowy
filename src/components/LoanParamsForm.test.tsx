import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { LoanParamsForm } from './LoanParamsForm'
import { useLoanStore } from '../store/loanStore'

afterEach(() => {
  cleanup()
})

describe('LoanParamsForm', () => {
  it('shows error when principal is below 0.01', () => {
    useLoanStore.setState({ principal: 0 })
    render(<LoanParamsForm />)
    expect(screen.getByText(/Kwota musi być/i)).toBeInTheDocument()
  })

  it('shows error when rate exceeds 30%', () => {
    useLoanStore.setState({ principal: 500000, annualRate: 0.5 })
    render(<LoanParamsForm />)
    expect(screen.getByText(/zakresie/i)).toBeInTheDocument()
  })

  it('shows error when term is out of range', () => {
    useLoanStore.setState({ principal: 500000, annualRate: 0.05, termMonths: 700 })
    render(<LoanParamsForm />)
    expect(screen.getByText(/1–600 miesięcy/i)).toBeInTheDocument()
  })

  it('shows error when overpayment is negative', () => {
    useLoanStore.setState({
      principal: 500000,
      annualRate: 0.05,
      termMonths: 360,
      recurringOverpayment: -50,
    })
    render(<LoanParamsForm />)
    expect(screen.getByText(/Nadpłata nie może być ujemna/i)).toBeInTheDocument()
  })

  it('clicking decreasing radio updates store', () => {
    useLoanStore.setState({ installmentType: 'EQUAL' })
    render(<LoanParamsForm />)
    fireEvent.click(screen.getByLabelText(/Malejąca/i))
    expect(useLoanStore.getState().installmentType).toBe('DECREASING')
  })

  it('changing principal input updates store', () => {
    useLoanStore.setState({ principal: 100000 })
    render(<LoanParamsForm />)
    const input = screen.getByLabelText(/Kwota kredytu/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: '750000' } })
    expect(useLoanStore.getState().principal).toBe(750000)
  })
})
