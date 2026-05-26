import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  BonusConfigValue,
  AdvisorConfigValue,
  InstallmentType,
  OverpaymentStrategy,
  SaveScenarioRequest,
  SavedScenario,
  ScheduleRequest,
  SweepConfigValue,
  TimeBand,
  UIScenario,
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
  sweepCfg: SweepConfigValue
  compareScenarios: UIScenario[]
  advisorCfg: AdvisorConfigValue
  bonusCfg: BonusConfigValue

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
  setSweepCfg: (v: SweepConfigValue) => void
  setCompareScenarios: (v: UIScenario[]) => void
  setAdvisorCfg: (v: AdvisorConfigValue) => void
  setBonusCfg: (v: BonusConfigValue) => void
  resetToDefaults: () => void
}

const today = new Date().toISOString().slice(0, 10)

const DEFAULT_COMPARE_SCENARIOS: UIScenario[] = [
  { name: '500/mies', recurring: 500, bonus: null },
  { name: '1000/mies', recurring: 1000, bonus: null },
  { name: '500/mies + 1000 przez 1. rok', recurring: 500, bonus: { duration: 'first-year', amount: 1000 } },
  { name: '500/mies + 500 przez 2 lata', recurring: 500, bonus: { duration: 'first-two-years', amount: 500 } },
]

const DEFAULT_SWEEP_CFG: SweepConfigValue = { from: 0, to: 5000, step: 250, threshold: 0.5 }
const DEFAULT_ADVISOR_CFG: AdvisorConfigValue = { comfortable: 1000, max: 5000, hasTarget: false, targetYears: 15, investmentRate: 5 }
const DEFAULT_BONUS_CFG: BonusConfigValue = { bonusFrom: 0, bonusTo: 5000, bonusStep: 500, durationsMonths: [12, 24, 36, 60], investmentRate: 5 }

const DEFAULT_LOAN_STATE = {
  principal: 500_000,
  annualRate: 0.055,
  termMonths: 360,
  startDate: today,
  installmentType: 'EQUAL' as InstallmentType,
  overpaymentStrategy: 'SHORTEN_TERM' as OverpaymentStrategy,
  recurringOverpayment: 0,
  customOverpayments: {} as Record<number, number>,
  timeBands: [] as TimeBand[],
  copyToNextCount: null as number | null,
  sweepCfg: DEFAULT_SWEEP_CFG,
  compareScenarios: DEFAULT_COMPARE_SCENARIOS,
  advisorCfg: DEFAULT_ADVISOR_CFG,
  bonusCfg: DEFAULT_BONUS_CFG,
}

function generateId(): string {
  return crypto.randomUUID()
}

export const useLoanStore = create<LoanState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_LOAN_STATE,
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
          ...(scenario.sweepCfg !== undefined && { sweepCfg: scenario.sweepCfg }),
          ...(scenario.compareScenarios !== undefined && { compareScenarios: scenario.compareScenarios }),
          ...(scenario.advisorCfg !== undefined && { advisorCfg: scenario.advisorCfg }),
          ...(scenario.bonusCfg !== undefined && { bonusCfg: scenario.bonusCfg }),
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
          sweepCfg: input.sweepCfg ?? get().sweepCfg,
          compareScenarios: input.compareScenarios ?? get().compareScenarios,
          advisorCfg: input.advisorCfg ?? get().advisorCfg,
          bonusCfg: input.bonusCfg ?? get().bonusCfg,
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ savedScenarios: [saved, ...s.savedScenarios] }))
        return saved
      },
      deleteSavedScenario: (id) =>
        set((s) => ({ savedScenarios: s.savedScenarios.filter((sc) => sc.id !== id) })),
      clearSavedScenarios: () => set({ savedScenarios: [] }),
      setSweepCfg: (v) => set({ sweepCfg: v }),
      setCompareScenarios: (v) => set({ compareScenarios: v }),
      setAdvisorCfg: (v) => set({ advisorCfg: v }),
      setBonusCfg: (v) => set({ bonusCfg: v }),
      resetToDefaults: () => {
        useLoanStore.persist.clearStorage()
        set({ ...DEFAULT_LOAN_STATE, savedScenarios: [] })
      },
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
        principal: state.principal,
        annualRate: state.annualRate,
        termMonths: state.termMonths,
        startDate: state.startDate,
        installmentType: state.installmentType,
        overpaymentStrategy: state.overpaymentStrategy,
        recurringOverpayment: state.recurringOverpayment,
        customOverpayments: state.customOverpayments,
        timeBands: state.timeBands,
        copyToNextCount: state.copyToNextCount,
        savedScenarios: state.savedScenarios,
        sweepCfg: state.sweepCfg,
        compareScenarios: state.compareScenarios,
        advisorCfg: state.advisorCfg,
        bonusCfg: state.bonusCfg,
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
