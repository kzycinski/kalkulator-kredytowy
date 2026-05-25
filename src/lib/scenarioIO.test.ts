import { describe, expect, it } from 'vitest'
import {
  InvalidScenarioImportError,
  buildExportPayload,
  parseScenarioImport,
} from './scenarioIO'
import type { SavedScenario } from '../types/calc'

const sampleScenario: SavedScenario = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Sample',
  principal: 500_000,
  annualRate: 0.0725,
  termMonths: 360,
  startDate: '2026-06-01',
  installmentType: 'EQUAL',
  overpaymentStrategy: 'SHORTEN_TERM',
  recurringOverpayment: 500,
  customOverpayments: { 12: 5000 },
  timeBands: [{ fromMonth: 1, toMonth: 12, amount: 1000 }],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('buildExportPayload', () => {
  it('wraps scenarios with version and timestamp', () => {
    const payload = buildExportPayload([sampleScenario])
    expect(payload.version).toBe(1)
    expect(payload.scenarios).toEqual([sampleScenario])
    expect(Date.parse(payload.exportedAt)).not.toBeNaN()
  })
})

describe('parseScenarioImport', () => {
  it('returns scenarios for valid payload', () => {
    const json = JSON.stringify({
      version: 1,
      exportedAt: '2026-01-01T00:00:00Z',
      scenarios: [sampleScenario],
    })
    const result = parseScenarioImport(json)
    expect(result).toEqual([sampleScenario])
  })

  it('returns empty array for empty scenarios list', () => {
    const json = JSON.stringify({
      version: 1,
      exportedAt: '2026-01-01T00:00:00Z',
      scenarios: [],
    })
    expect(parseScenarioImport(json)).toEqual([])
  })

  it('rejects malformed JSON', () => {
    expect(() => parseScenarioImport('{not json')).toThrow(InvalidScenarioImportError)
  })

  it('rejects wrong version', () => {
    const json = JSON.stringify({ version: 999, scenarios: [] })
    expect(() => parseScenarioImport(json)).toThrow(/wersja/i)
  })

  it('rejects missing scenarios list', () => {
    const json = JSON.stringify({ version: 1 })
    expect(() => parseScenarioImport(json)).toThrow(/listy/i)
  })

  it('rejects scenarios with missing required fields', () => {
    const json = JSON.stringify({
      version: 1,
      scenarios: [{ id: 'x', name: 'incomplete' }],
    })
    expect(() => parseScenarioImport(json)).toThrow(/Niepoprawny/i)
  })

  it('round-trips export -> parse', () => {
    const payload = buildExportPayload([sampleScenario])
    const json = JSON.stringify(payload)
    expect(parseScenarioImport(json)).toEqual([sampleScenario])
  })
})
