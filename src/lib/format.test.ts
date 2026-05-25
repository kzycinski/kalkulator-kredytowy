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
  it('formats exact 10 years as "10 lat"', () => {
    expect(formatMonths(120)).toBe('10 lat')
  })

  it('formats 1 year as "1 rok"', () => {
    expect(formatMonths(12)).toBe('1 rok')
  })

  it('formats 2, 3, 4 years as "lata" (Polish plural)', () => {
    expect(formatMonths(24)).toBe('2 lata')
    expect(formatMonths(36)).toBe('3 lata')
    expect(formatMonths(48)).toBe('4 lata')
  })

  it('formats 5+ years as "lat"', () => {
    expect(formatMonths(60)).toBe('5 lat')
    expect(formatMonths(132)).toBe('11 lat')
  })

  it('formats 12–14 as "lat" (special case)', () => {
    expect(formatMonths(144)).toBe('12 lat')
    expect(formatMonths(156)).toBe('13 lat')
    expect(formatMonths(168)).toBe('14 lat')
  })

  it('formats 22 as "22 lata" (ends in 2 but not 12)', () => {
    expect(formatMonths(264)).toBe('22 lata')
  })

  it('formats years and months', () => {
    expect(formatMonths(125)).toBe('10 lat 5 mies.')
    expect(formatMonths(27)).toBe('2 lata 3 mies.')
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
