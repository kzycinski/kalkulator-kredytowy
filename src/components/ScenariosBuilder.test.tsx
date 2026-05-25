import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ScenariosBuilder } from './ScenariosBuilder'
import { toScenarioSpec, type UIScenario } from '../lib/scenarioModel'

afterEach(() => cleanup())

describe('toScenarioSpec', () => {
  it('maps scenario without bonus to recurring only', () => {
    const spec = toScenarioSpec({ name: 'Plain', recurring: 500, bonus: null })
    expect(spec).toEqual({ name: 'Plain', recurringOverpayment: 500 })
  })

  it('maps first-year bonus as timeBand[1..12] with recurring+bonus amount', () => {
    const spec = toScenarioSpec({
      name: 'Combo',
      recurring: 500,
      bonus: { duration: 'first-year', amount: 1000 },
    })
    expect(spec.recurringOverpayment).toBe(500)
    expect(spec.timeBands).toEqual([{ fromMonth: 1, toMonth: 12, amount: 1500 }])
  })

  it('maps first-two-years bonus as timeBand[1..24] with recurring+bonus amount', () => {
    const spec = toScenarioSpec({
      name: 'Long',
      recurring: 300,
      bonus: { duration: 'first-two-years', amount: 700 },
    })
    expect(spec.recurringOverpayment).toBe(300)
    expect(spec.timeBands).toEqual([{ fromMonth: 1, toMonth: 24, amount: 1000 }])
  })

  it('treats zero-amount bonus as no bonus', () => {
    const spec = toScenarioSpec({
      name: 'No bonus',
      recurring: 500,
      bonus: { duration: 'first-year', amount: 0 },
    })
    expect(spec.timeBands).toBeUndefined()
    expect(spec.recurringOverpayment).toBe(500)
  })
})

describe('ScenariosBuilder', () => {
  it('shows empty state when no scenarios', () => {
    render(<ScenariosBuilder scenarios={[]} onChange={() => {}} />)
    expect(screen.getByText(/Dodaj co najmniej jeden/i)).toBeInTheDocument()
  })

  it('clicking add creates new scenario with default recurring 500', () => {
    const onChange = vi.fn()
    render(<ScenariosBuilder scenarios={[]} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /Dodaj scenariusz/i }))
    expect(onChange).toHaveBeenCalledWith([
      { name: 'Scenariusz 1', recurring: 500, bonus: null },
    ])
  })

  it('editing recurring calls onChange', () => {
    const onChange = vi.fn()
    const scenarios: UIScenario[] = [{ name: 'A', recurring: 500, bonus: null }]
    render(<ScenariosBuilder scenarios={scenarios} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText(/Scenariusz 1 - cykliczna/i), {
      target: { value: '750' },
    })
    expect(onChange).toHaveBeenCalledWith([{ name: 'A', recurring: 750, bonus: null }])
  })

  it('selecting bonus duration creates bonus with default amount 500', () => {
    const onChange = vi.fn()
    const scenarios: UIScenario[] = [{ name: 'A', recurring: 500, bonus: null }]
    render(<ScenariosBuilder scenarios={scenarios} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText(/Scenariusz 1 - okres bonusu/i), {
      target: { value: 'first-year' },
    })
    expect(onChange).toHaveBeenCalledWith([
      { name: 'A', recurring: 500, bonus: { duration: 'first-year', amount: 500 } },
    ])
  })

  it('selecting "Bez bonusu" clears bonus', () => {
    const onChange = vi.fn()
    const scenarios: UIScenario[] = [
      { name: 'A', recurring: 500, bonus: { duration: 'first-year', amount: 1000 } },
    ]
    render(<ScenariosBuilder scenarios={scenarios} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText(/Scenariusz 1 - okres bonusu/i), {
      target: { value: '' },
    })
    expect(onChange).toHaveBeenCalledWith([{ name: 'A', recurring: 500, bonus: null }])
  })

  it('editing bonus amount updates only the amount', () => {
    const onChange = vi.fn()
    const scenarios: UIScenario[] = [
      { name: 'A', recurring: 500, bonus: { duration: 'first-year', amount: 500 } },
    ]
    render(<ScenariosBuilder scenarios={scenarios} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText(/Scenariusz 1 - kwota bonusu/i), {
      target: { value: '1500' },
    })
    expect(onChange).toHaveBeenCalledWith([
      { name: 'A', recurring: 500, bonus: { duration: 'first-year', amount: 1500 } },
    ])
  })

  it('bonus amount input is disabled when no bonus', () => {
    const scenarios: UIScenario[] = [{ name: 'A', recurring: 500, bonus: null }]
    render(<ScenariosBuilder scenarios={scenarios} onChange={() => {}} />)
    const input = screen.getByLabelText(/Scenariusz 1 - kwota bonusu/i) as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  it('removing scenario calls onChange without it', () => {
    const onChange = vi.fn()
    const scenarios: UIScenario[] = [
      { name: 'A', recurring: 500, bonus: null },
      { name: 'B', recurring: 1000, bonus: null },
    ]
    render(<ScenariosBuilder scenarios={scenarios} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText(/Usuń scenariusz 1/i))
    expect(onChange).toHaveBeenCalledWith([{ name: 'B', recurring: 1000, bonus: null }])
  })
})
