import { useLoanStore } from '../store/loanStore'

export function useSavedScenariosList() {
  return useLoanStore((s) => s.savedScenarios)
}

export function useCreateScenario() {
  return useLoanStore((s) => s.addSavedScenario)
}

export function useDeleteScenario() {
  return useLoanStore((s) => s.deleteSavedScenario)
}
