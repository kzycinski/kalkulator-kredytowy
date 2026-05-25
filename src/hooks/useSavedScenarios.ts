import { useLoanStore } from '../store/loanStore'
import type { SaveScenarioRequest, SavedScenario } from '../types/calc'

export function useSavedScenariosList() {
  const scenarios = useLoanStore((s) => s.savedScenarios)
  return {
    data: scenarios,
    isLoading: false,
    error: null as Error | null,
  }
}

export interface MutationOptions<T> {
  onSuccess?: (result: T) => void
  onError?: (error: Error) => void
}

export function useCreateScenario() {
  const add = useLoanStore((s) => s.addSavedScenario)
  return {
    mutate: (input: SaveScenarioRequest, options?: MutationOptions<SavedScenario>) => {
      try {
        const saved = add(input)
        options?.onSuccess?.(saved)
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        options?.onError?.(err)
      }
    },
    isPending: false,
    error: null as Error | null,
  }
}

export function useDeleteScenario() {
  const remove = useLoanStore((s) => s.deleteSavedScenario)
  return {
    mutate: (id: string, options?: MutationOptions<void>) => {
      try {
        remove(id)
        options?.onSuccess?.()
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        options?.onError?.(err)
      }
    },
    isPending: false,
    error: null as Error | null,
  }
}
