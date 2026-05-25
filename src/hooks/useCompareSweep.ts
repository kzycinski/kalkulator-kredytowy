import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { computeSweep } from '../lib/calc'
import type { CompareSweepRequest, SweepResult } from '../types/calc'
import { useDebounce } from './useDebounce'

const isValid = (req: CompareSweepRequest) =>
  req.base.principal > 0 &&
  req.base.annualRate >= 0 &&
  req.base.annualRate <= 0.3 &&
  req.base.termMonths >= 1 &&
  req.base.termMonths <= 600 &&
  req.sweep.from >= 0 &&
  req.sweep.to > req.sweep.from &&
  req.sweep.step > 0

export function useCompareSweep(request: CompareSweepRequest) {
  const debounced = useDebounce(request, 400)
  return useQuery<SweepResult>({
    queryKey: ['sweep', debounced],
    queryFn: () => computeSweep(debounced),
    enabled: isValid(debounced),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })
}
