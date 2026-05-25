import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  InstallmentType,
  OverpaymentStrategy,
  SaveScenarioRequest,
  SavedScenario,
  ScheduleRequest,
  TimeBand,
} from '../types/calc'

export interface CopyResult {
  conflicts: number
  written: number
}

export interface ImportResult {
  added: number
  replaced: number
}

export interface LoanState {
  principal: number
  annualRate: number
  termMonths: number
  startDate: string
  installmentType: InstallmentType
  overpaymentStrategy: OverpaymentStrategy
  recurringOverpayment: number
  customOverpayments: Record<number, number>
  timeBands: TimeBand[]
  copyToNextCount: number | null
  savedScenarios: SavedScenario[]

  setPrincipal: (v: number) => void
  setAnnualRate: (v: number) => void
  setTermMonths: (v: number) => void
  setStartDate: (v: string) => void
  setInstallmentType: (v: InstallmentType) => void
  setOverpaymentStrategy: (v: OverpaymentStrategy) => void
  setRecurringOverpayment: (v: number) => void
  setCustomOverpayment: (month: number, amount: number) => void
  removeCustomOverpayment: (month: number) => void
  clearCustomOverpayments: () => void
  setTimeBands: (bands: TimeBand[]) => void
  setCopyToNextCount: (v: number | null) => void
  copyOverpaymentToNext: (sourceMonth: number, count: number, override: boolean) => CopyResult
  loadScenario: (scenario: SavedScenario) => void
  addSavedScenario: (input: SaveScenarioRequest) => SavedScenario
  deleteSavedScenario: (id: string) => void
  clearSavedScenarios: () => void
  importSavedScenarios: (scenarios: SavedScenario[]) => ImportResult
}

const today = new Date().toISOString().slice(0, 10)

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const useLoanStore = create<LoanState>()(
  persist(
    (set, get) => ({
      principal: 500_000,
      annualRate: 0.0725,
      termMonths: 360,
      startDate: today,
      installmentType: 'EQUAL',
      overpaymentStrategy: 'SHORTEN_TERM',
      recurringOverpayment: 0,
      customOverpayments: {},
      timeBands: [],
      copyToNextCount: null,
      savedScenarios: [],

      setPrincipal: (v) => set({ principal: v }),
      setAnnualRate: (v) => set({ annualRate: v }),
      setTermMonths: (v) => set({ termMonths: v }),
      setStartDate: (v) => set({ startDate: v }),
      setInstallmentType: (v) => set({ installmentType: v }),
      setOverpaymentStrategy: (v) => set({ overpaymentStrategy: v }),
      setRecurringOverpayment: (v) => set({ recurringOverpayment: v }),
      setCustomOverpayment: (month, amount) =>
        set((s) => ({ customOverpayments: { ...s.customOverpayments, [month]: amount } })),
      removeCustomOverpayment: (month) =>
        set((s) => {
          const next = { ...s.customOverpayments }
          delete next[month]
          return { customOverpayments: next }
        }),
      clearCustomOverpayments: () => set({ customOverpayments: {} }),
      setTimeBands: (bands) => set({ timeBands: bands }),
      setCopyToNextCount: (v) => set({ copyToNextCount: v }),
      copyOverpaymentToNext: (sourceMonth, count, override) => {
        const state = get()
        const sourceAmount =
          state.customOverpayments[sourceMonth] ?? state.recurringOverpayment
        const next = { ...state.customOverpayments }
        const lastMonth = Math.min(sourceMonth + count, state.termMonths)
        let conflicts = 0
        let written = 0
        for (let m = sourceMonth + 1; m <= lastMonth; m++) {
          if (m in next && !override) {
            conflicts++
            continue
          }
          next[m] = sourceAmount
          written++
        }
        set({ customOverpayments: next })
        return { conflicts, written }
      },
      loadScenario: (scenario) =>
        set({
          principal: scenario.principal,
          annualRate: scenario.annualRate,
          termMonths: scenario.termMonths,
          startDate: scenario.startDate ?? today,
          installmentType: scenario.installmentType,
          overpaymentStrategy: scenario.overpaymentStrategy,
          recurringOverpayment: scenario.recurringOverpayment,
          customOverpayments: { ...scenario.customOverpayments },
          timeBands: [...scenario.timeBands],
        }),
      addSavedScenario: (input) => {
        const now = new Date().toISOString()
        const saved: SavedScenario = {
          id: generateId(),
          name: input.name,
          principal: input.principal,
          annualRate: input.annualRate,
          termMonths: input.termMonths,
          startDate: input.startDate ?? null,
          installmentType: input.installmentType,
          overpaymentStrategy: input.overpaymentStrategy,
          recurringOverpayment: input.recurringOverpayment ?? 0,
          customOverpayments: { ...(input.customOverpayments ?? {}) },
          timeBands: [...(input.timeBands ?? [])],
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ savedScenarios: [saved, ...s.savedScenarios] }))
        return saved
      },
      deleteSavedScenario: (id) =>
        set((s) => ({ savedScenarios: s.savedScenarios.filter((sc) => sc.id !== id) })),
      clearSavedScenarios: () => set({ savedScenarios: [] }),
      importSavedScenarios: (scenarios) => {
        const state = get()
        const existing = new Map(state.savedScenarios.map((s) => [s.id, s]))
        let added = 0
        let replaced = 0
        scenarios.forEach((s) => {
          if (existing.has(s.id)) replaced++
          else added++
          existing.set(s.id, s)
        })
        const merged = Array.from(existing.values()).sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        )
        set({ savedScenarios: merged })
        return { added, replaced }
      },
    }),
    {
      name: 'kredyt-loan',
      partialize: (state) => ({
        copyToNextCount: state.copyToNextCount,
        savedScenarios: state.savedScenarios,
      }),
    },
  ),
)

export function buildRequest(state: LoanState): ScheduleRequest {
  return {
    principal: state.principal,
    annualRate: state.annualRate,
    termMonths: state.termMonths,
    startDate: state.startDate,
    installmentType: state.installmentType,
    overpaymentStrategy: state.overpaymentStrategy,
    recurringOverpayment: state.recurringOverpayment,
    customOverpayments: state.customOverpayments,
    timeBands: state.timeBands,
  }
}
