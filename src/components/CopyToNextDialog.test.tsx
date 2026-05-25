import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { CopyToNextDialog } from './CopyToNextDialog'
import { useLoanStore } from '../store/loanStore'

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

describe('CopyToNextDialog', () => {
  it('shows count input on first use (stored=null)', () => {
    render(<CopyToNextDialog sourceMonth={5} sourceAmount={1000} onClose={() => {}} />)
    expect(screen.getByText(/Liczba miesięcy/i)).toBeInTheDocument()
  })

  it('shows confirm view when copyToNextCount already set', () => {
    useLoanStore.setState({ copyToNextCount: 24 })
    render(<CopyToNextDialog sourceMonth={5} sourceAmount={1000} onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: /Skopiować nadpłatę/i })).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
  })

  it('"Zmień X" goes back to count input', () => {
    useLoanStore.setState({ copyToNextCount: 24 })
    render(<CopyToNextDialog sourceMonth={5} sourceAmount={1000} onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Zmień X/i }))
    expect(screen.getByText(/Liczba miesięcy/i)).toBeInTheDocument()
  })

  it('Kopiuj copies and closes when no conflicts', () => {
    const onClose = vi.fn()
    render(<CopyToNextDialog sourceMonth={5} sourceAmount={1000} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Kopiuj' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(useLoanStore.getState().customOverpayments[6]).toBe(500)
  })

  it('shows override view when target has custom', () => {
    useLoanStore.getState().setCustomOverpayment(7, 9999)
    render(<CopyToNextDialog sourceMonth={5} sourceAmount={1000} onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Kopiuj' }))
    expect(screen.getByRole('heading', { name: /Konflikt nadpłat/i })).toBeInTheDocument()
    expect(useLoanStore.getState().customOverpayments[7]).toBe(9999)
  })

  it('Nadpisz overwrites in override view', () => {
    useLoanStore.getState().setCustomOverpayment(7, 9999)
    const onClose = vi.fn()
    render(<CopyToNextDialog sourceMonth={5} sourceAmount={1000} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Kopiuj' }))
    fireEvent.click(screen.getByRole('button', { name: /Nadpisz/i }))
    expect(useLoanStore.getState().customOverpayments[7]).toBe(500)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Escape closes', () => {
    const onClose = vi.fn()
    render(<CopyToNextDialog sourceMonth={5} sourceAmount={1000} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('clicking backdrop closes', () => {
    const onClose = vi.fn()
    render(<CopyToNextDialog sourceMonth={5} sourceAmount={1000} onClose={onClose} />)
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('first use saves count to store after successful copy', () => {
    render(<CopyToNextDialog sourceMonth={5} sourceAmount={1000} onClose={() => {}} />)
    const input = screen.getByLabelText(/Liczba miesięcy/i)
    fireEvent.change(input, { target: { value: '24' } })
    fireEvent.click(screen.getByRole('button', { name: 'Kopiuj' }))
    expect(useLoanStore.getState().copyToNextCount).toBe(24)
  })
})
