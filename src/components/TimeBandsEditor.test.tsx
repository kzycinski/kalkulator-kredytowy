import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { TimeBandsEditor } from './TimeBandsEditor'
import { useLoanStore } from '../store/loanStore'

beforeEach(() => {
  localStorage.clear()
  useLoanStore.setState({ timeBands: [], termMonths: 360 })
})

afterEach(() => cleanup())

describe('TimeBandsEditor', () => {
  it('shows empty state when no bands', () => {
    render(<TimeBandsEditor />)
    expect(screen.getByText(/Brak zdefiniowanych okresów/i)).toBeInTheDocument()
  })

  it('adding a band creates an entry in store', () => {
    render(<TimeBandsEditor />)
    fireEvent.click(screen.getByRole('button', { name: /Dodaj okres/i }))
    expect(useLoanStore.getState().timeBands).toHaveLength(1)
    expect(useLoanStore.getState().timeBands[0]).toEqual({
      fromMonth: 1,
      toMonth: 12,
      amount: 1000,
    })
  })

  it('updating fromMonth updates store', () => {
    useLoanStore.setState({ timeBands: [{ fromMonth: 1, toMonth: 12, amount: 1000 }] })
    render(<TimeBandsEditor />)
    fireEvent.change(screen.getByLabelText(/Okres 1 - od miesiąca/i), { target: { value: '6' } })
    expect(useLoanStore.getState().timeBands[0]?.fromMonth).toBe(6)
  })

  it('updating amount updates store', () => {
    useLoanStore.setState({ timeBands: [{ fromMonth: 1, toMonth: 12, amount: 1000 }] })
    render(<TimeBandsEditor />)
    fireEvent.change(screen.getByLabelText(/Okres 1 - kwota/i), { target: { value: '2500' } })
    expect(useLoanStore.getState().timeBands[0]?.amount).toBe(2500)
  })

  it('removing a band drops it from store', () => {
    useLoanStore.setState({
      timeBands: [
        { fromMonth: 1, toMonth: 12, amount: 1000 },
        { fromMonth: 13, toMonth: 24, amount: 500 },
      ],
    })
    render(<TimeBandsEditor />)
    fireEvent.click(screen.getByLabelText(/Usuń okres 1/i))
    expect(useLoanStore.getState().timeBands).toHaveLength(1)
    expect(useLoanStore.getState().timeBands[0]?.amount).toBe(500)
  })
})
