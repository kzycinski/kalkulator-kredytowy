import { describe, expect, it } from 'vitest'
import { formatPLN, formatMonths, formatPercent } from './format'

describe('formatPLN', () => {
  it('formats integer with PL locale and currency', () => {
    const result = formatPLN(1000)
    expect(result).toMatch(/1\s*000,00/)
    expect(result).toMatch(/zł/)
  })

  it('formats decimal', () => {
    const result = formatPLN(1234.5)
    expect(result).toMatch(/1\s*234,50/)
  })

  it('handles string input', () => {
    expect(formatPLN('1234.56')).toMatch(/1\s*234,56/)
  })

  it('returns dash for null', () => {
    expect(formatPLN(null)).toBe('—')
  })

  it('returns dash for undefined', () => {
    expect(formatPLN(undefined)).toBe('—')
  })

  it('returns dash for NaN', () => {
    expect(formatPLN(Number.NaN)).toBe('—')
  })
})

describe('formatMonths', () => {
  it('formats exact years', () => {
    expect(formatMonths(120)).toBe('10 lat')
  })

  it('formats years and months', () => {
    expect(formatMonths(125)).toBe('10 lat 5 mies.')
  })

  it('formats only months when less than 12', () => {
    expect(formatMonths(5)).toBe('5 mies.')
  })

  it('returns "0 mies." for zero', () => {
    expect(formatMonths(0)).toBe('0 mies.')
  })

  it('returns "0 mies." for negative', () => {
    expect(formatMonths(-5)).toBe('0 mies.')
  })
})

describe('formatPercent', () => {
  it('formats fraction as percent', () => {
    expect(formatPercent(0.0725)).toMatch(/7,250?%/)
  })

  it('returns dash for NaN', () => {
    expect(formatPercent(Number.NaN)).toBe('—')
  })
})
