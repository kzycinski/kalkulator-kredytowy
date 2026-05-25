import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Tabs } from './Tabs'

afterEach(() => cleanup())

const sampleTabs = [
  { id: 'a', label: 'Tab A', content: <div>Content A</div> },
  { id: 'b', label: 'Tab B', content: <div>Content B</div> },
  { id: 'c', label: 'Tab C', content: <div>Content C</div> },
]

describe('Tabs', () => {
  it('renders all tab buttons', () => {
    render(<Tabs tabs={sampleTabs} />)
    expect(screen.getByRole('tab', { name: 'Tab A' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tab B' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tab C' })).toBeInTheDocument()
  })

  it('shows first tab content by default', () => {
    render(<Tabs tabs={sampleTabs} />)
    expect(screen.getByText('Content A')).toBeInTheDocument()
    expect(screen.queryByText('Content B')).not.toBeInTheDocument()
  })

  it('uses defaultTab when provided', () => {
    render(<Tabs defaultTab="b" tabs={sampleTabs} />)
    expect(screen.getByText('Content B')).toBeInTheDocument()
    expect(screen.queryByText('Content A')).not.toBeInTheDocument()
  })

  it('switches active tab on click', () => {
    render(<Tabs tabs={sampleTabs} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Tab B' }))
    expect(screen.getByText('Content B')).toBeInTheDocument()
    expect(screen.queryByText('Content A')).not.toBeInTheDocument()
  })

  it('marks active tab with aria-selected', () => {
    render(<Tabs tabs={sampleTabs} />)
    expect(screen.getByRole('tab', { name: 'Tab A' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('tab', { name: 'Tab C' }))
    expect(screen.getByRole('tab', { name: 'Tab C' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Tab A' })).toHaveAttribute('aria-selected', 'false')
  })
})
