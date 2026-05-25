import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { computeScenarios } from '../lib/calc'
import type { CompareResult, CompareScenariosRequest } from '../types/calc'
import { useDebounce } from './useDebounce'

export function useCompareScenarios(request: CompareScenariosRequest) {
  const debounced = useDebounce(request, 300)
  return useQuery<CompareResult>({
    queryKey: ['scenarios', debounced],
    queryFn: () => computeScenarios(debounced),
    enabled: debounced.scenarios.length > 0 && debounced.base.principal > 0,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })
}
