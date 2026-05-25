import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { RateSensitivityChart, type RateSensitivityPoint } from './RateSensitivityChart'

afterEach(() => cleanup())

describe('RateSensitivityChart', () => {
  it('renders bars for given points', () => {
    const points: RateSensitivityPoint[] = [
      { label: '-1%', totalInterest: 200_000, isCurrent: false },
      { label: 'Teraz', totalInterest: 300_000, isCurrent: true },
      { label: '+1%', totalInterest: 400_000, isCurrent: false },
    ]
    const { container } = render(<RateSensitivityChart points={points} />)
    expect(container.querySelector('.recharts-responsive-container')).not.toBeNull()
  })

  it('renders empty container for no points', () => {
    const { container } = render(<RateSensitivityChart points={[]} />)
    expect(container.querySelector('.recharts-responsive-container')).not.toBeNull()
  })
})
