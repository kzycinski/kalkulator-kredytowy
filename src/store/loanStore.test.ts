import { beforeEach, describe, expect, it } from 'vitest'
import { useLoanStore } from './loanStore'
import type { SaveScenarioRequest, SavedScenario } from '../types/calc'

beforeEach(() => {
  localStorage.clear()
  useLoanStore.setState({
    principal: 500_000,
    annualRate: 0.0725,
    termMonths: 360,
    startDate: '2026-01-01',
    installmentType: 'EQUAL',
    overpaymentStrategy: 'SHORTEN_TERM',
    customOverpayments: {},
    timeBands: [],
    copyToNextCount: null,
    recurringOverpayment: 500,
    savedScenarios: [],
  })
})

describe('loanStore', () => {
  describe('setCustomOverpayment', () => {
    it('writes to customOverpayments', () => {
      useLoanStore.getState().setCustomOverpayment(5, 1000)
      expect(useLoanStore.getState().customOverpayments[5]).toBe(1000)
    })
  })

  describe('removeCustomOverpayment', () => {
    it('removes only the given month', () => {
      useLoanStore.getState().setCustomOverpayment(5, 1000)
      useLoanStore.getState().setCustomOverpayment(6, 2000)
      useLoanStore.getState().removeCustomOverpayment(5)
      expect(useLoanStore.getState().customOverpayments[5]).toBeUndefined()
      expect(useLoanStore.getState().customOverpayments[6]).toBe(2000)
    })
  })

  describe('clearCustomOverpayments', () => {
    it('resets to empty', () => {
      useLoanStore.getState().setCustomOverpayment(5, 1000)
      useLoanStore.getState().setCustomOverpayment(6, 2000)
      useLoanStore.getState().clearCustomOverpayments()
      expect(useLoanStore.getState().customOverpayments).toEqual({})
    })
  })

  describe('copyOverpaymentToNext', () => {
    it('copies source-month custom to next N months when no conflicts', () => {
      useLoanStore.getState().setCustomOverpayment(5, 1000)
      const result = useLoanStore.getState().copyOverpaymentToNext(5, 3, false)
      expect(result).toEqual({ conflicts: 0, written: 3 })
      const cust = useLoanStore.getState().customOverpayments
      expect(cust[6]).toBe(1000)
      expect(cust[7]).toBe(1000)
      expect(cust[8]).toBe(1000)
    })

    it('reports conflicts and does not overwrite when override=false', () => {
      useLoanStore.getState().setCustomOverpayment(5, 1000)
      useLoanStore.getState().setCustomOverpayment(7, 9999)
      const result = useLoanStore.getState().copyOverpaymentToNext(5, 3, false)
      expect(result.conflicts).toBe(1)
      expect(result.written).toBe(2)
      const cust = useLoanStore.getState().customOverpayments
      expect(cust[6]).toBe(1000)
      expect(cust[7]).toBe(9999)
      expect(cust[8]).toBe(1000)
    })

    it('overwrites when override=true', () => {
      useLoanStore.getState().setCustomOverpayment(5, 1000)
      useLoanStore.getState().setCustomOverpayment(7, 9999)
      const result = useLoanStore.getState().copyOverpaymentToNext(5, 3, true)
      expect(result.conflicts).toBe(0)
      expect(result.written).toBe(3)
      expect(useLoanStore.getState().customOverpayments[7]).toBe(1000)
    })

    it('falls back to recurring when source month has no custom', () => {
      const result = useLoanStore.getState().copyOverpaymentToNext(5, 2, false)
      expect(result.written).toBe(2)
      expect(useLoanStore.getState().customOverpayments[6]).toBe(500)
      expect(useLoanStore.getState().customOverpayments[7]).toBe(500)
    })

    it('clamps to termMonths', () => {
      useLoanStore.setState({ termMonths: 8 })
      useLoanStore.getState().setCustomOverpayment(5, 1000)
      const result = useLoanStore.getState().copyOverpaymentToNext(5, 100, false)
      expect(result.written).toBe(3)
      expect(useLoanStore.getState().customOverpayments[9]).toBeUndefined()
    })

    it('handles count=0 (no-op)', () => {
      useLoanStore.getState().setCustomOverpayment(5, 1000)
      const result = useLoanStore.getState().copyOverpaymentToNext(5, 0, false)
      expect(result).toEqual({ conflicts: 0, written: 0 })
    })
  })

  describe('setCopyToNextCount', () => {
    it('sets and reads the value', () => {
      useLoanStore.getState().setCopyToNextCount(24)
      expect(useLoanStore.getState().copyToNextCount).toBe(24)
    })
  })

  describe('loadScenario', () => {
    const sample: SavedScenario = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Sample',
      principal: 700_000,
      annualRate: 0.05,
      termMonths: 240,
      startDate: '2027-03-01',
      installmentType: 'DECREASING',
      overpaymentStrategy: 'LOWER_INSTALLMENT',
      recurringOverpayment: 1500,
      customOverpayments: { 12: 5000 },
      timeBands: [{ fromMonth: 1, toMonth: 12, amount: 2000 }],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }

    it('replaces all loan params with scenario values', () => {
      useLoanStore.getState().loadScenario(sample)
      const state = useLoanStore.getState()
      expect(state.principal).toBe(700_000)
      expect(state.annualRate).toBe(0.05)
      expect(state.termMonths).toBe(240)
      expect(state.startDate).toBe('2027-03-01')
      expect(state.installmentType).toBe('DECREASING')
      expect(state.overpaymentStrategy).toBe('LOWER_INSTALLMENT')
      expect(state.recurringOverpayment).toBe(1500)
      expect(state.customOverpayments).toEqual({ 12: 5000 })
      expect(state.timeBands).toEqual([{ fromMonth: 1, toMonth: 12, amount: 2000 }])
    })

    it('replaces previous custom overpayments', () => {
      useLoanStore.getState().setCustomOverpayment(5, 9999)
      useLoanStore.getState().loadScenario(sample)
      expect(useLoanStore.getState().customOverpayments[5]).toBeUndefined()
      expect(useLoanStore.getState().customOverpayments[12]).toBe(5000)
    })
  })

  describe('addSavedScenario', () => {
    const input: SaveScenarioRequest = {
      name: 'My scenario',
      principal: 500_000,
      annualRate: 0.0725,
      termMonths: 360,
      installmentType: 'EQUAL',
      overpaymentStrategy: 'SHORTEN_TERM',
      recurringOverpayment: 500,
    }

    it('generates id and timestamps', () => {
      const saved = useLoanStore.getState().addSavedScenario(input)
      expect(saved.id).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/i)
      expect(saved.createdAt).toBeDefined()
      expect(saved.updatedAt).toBeDefined()
      expect(saved.name).toBe('My scenario')
    })

    it('adds to savedScenarios list (newest first)', () => {
      useLoanStore.getState().addSavedScenario({ ...input, name: 'First' })
      useLoanStore.getState().addSavedScenario({ ...input, name: 'Second' })
      const list = useLoanStore.getState().savedScenarios
      expect(list).toHaveLength(2)
      expect(list[0]?.name).toBe('Second')
      expect(list[1]?.name).toBe('First')
    })

    it('preserves customOverpayments and timeBands', () => {
      const saved = useLoanStore.getState().addSavedScenario({
        ...input,
        customOverpayments: { 12: 5000 },
        timeBands: [{ fromMonth: 1, toMonth: 12, amount: 1000 }],
      })
      expect(saved.customOverpayments).toEqual({ 12: 5000 })
      expect(saved.timeBands).toEqual([{ fromMonth: 1, toMonth: 12, amount: 1000 }])
    })

    it('defaults recurringOverpayment to 0 when undefined', () => {
      const saved = useLoanStore.getState().addSavedScenario({
        ...input,
        recurringOverpayment: undefined,
      })
      expect(saved.recurringOverpayment).toBe(0)
    })
  })

  describe('deleteSavedScenario', () => {
    it('removes scenario by id', () => {
      const a = useLoanStore.getState().addSavedScenario({
        name: 'A',
        principal: 100,
        annualRate: 0.05,
        termMonths: 12,
        installmentType: 'EQUAL',
        overpaymentStrategy: 'SHORTEN_TERM',
      })
      const b = useLoanStore.getState().addSavedScenario({
        name: 'B',
        principal: 200,
        annualRate: 0.05,
        termMonths: 12,
        installmentType: 'EQUAL',
        overpaymentStrategy: 'SHORTEN_TERM',
      })
      useLoanStore.getState().deleteSavedScenario(a.id)
      const list = useLoanStore.getState().savedScenarios
      expect(list).toHaveLength(1)
      expect(list[0]?.id).toBe(b.id)
    })

    it('is a no-op for unknown id', () => {
      useLoanStore.getState().addSavedScenario({
        name: 'A',
        principal: 100,
        annualRate: 0.05,
        termMonths: 12,
        installmentType: 'EQUAL',
        overpaymentStrategy: 'SHORTEN_TERM',
      })
      useLoanStore.getState().deleteSavedScenario('unknown')
      expect(useLoanStore.getState().savedScenarios).toHaveLength(1)
    })
  })

  describe('importSavedScenarios', () => {
    const base: SavedScenario = {
      id: 'abc',
      name: 'Old',
      principal: 100,
      annualRate: 0.05,
      termMonths: 12,
      startDate: null,
      installmentType: 'EQUAL',
      overpaymentStrategy: 'SHORTEN_TERM',
      recurringOverpayment: 0,
      customOverpayments: {},
      timeBands: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }

    it('adds new scenarios without duplicates', () => {
      const result = useLoanStore.getState().importSavedScenarios([base])
      expect(result).toEqual({ added: 1, replaced: 0 })
      expect(useLoanStore.getState().savedScenarios).toHaveLength(1)
    })

    it('replaces scenarios with matching id', () => {
      useLoanStore.getState().importSavedScenarios([base])
      const result = useLoanStore.getState().importSavedScenarios([{ ...base, name: 'New' }])
      expect(result).toEqual({ added: 0, replaced: 1 })
      expect(useLoanStore.getState().savedScenarios[0]?.name).toBe('New')
    })

    it('sorts merged list by createdAt descending', () => {
      const earlier = { ...base, id: '1', createdAt: '2025-01-01T00:00:00Z' }
      const later = { ...base, id: '2', createdAt: '2027-01-01T00:00:00Z' }
      useLoanStore.getState().importSavedScenarios([earlier, later])
      const list = useLoanStore.getState().savedScenarios
      expect(list[0]?.id).toBe('2')
      expect(list[1]?.id).toBe('1')
    })
  })
})
