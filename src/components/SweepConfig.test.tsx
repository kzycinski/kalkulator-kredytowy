import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { SweepConfig } from './SweepConfig'

afterEach(() => cleanup())

const defaultValue = { from: 0, to: 5000, step: 250, threshold: 0.5 }

describe('SweepConfig', () => {
  it('renders all four inputs', () => {
    render(<SweepConfig value={defaultValue} onChange={() => {}} />)
    expect(screen.getByLabelText(/Sweep od/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Sweep do/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Sweep krok/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Sweep próg/i)).toBeInTheDocument()
  })

  it('changing "to" calls onChange', () => {
    const onChange = vi.fn()
    render(<SweepConfig value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText(/Sweep do/i), { target: { value: '10000' } })
    expect(onChange).toHaveBeenCalledWith({ ...defaultValue, to: 10000 })
  })

  it('rejects threshold above 1', () => {
    const onChange = vi.fn()
    render(<SweepConfig value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText(/Sweep próg/i), { target: { value: '1.5' } })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('rejects negative from', () => {
    const onChange = vi.fn()
    render(<SweepConfig value={defaultValue} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText(/Sweep od/i), { target: { value: '-100' } })
    expect(onChange).not.toHaveBeenCalled()
  })
})
