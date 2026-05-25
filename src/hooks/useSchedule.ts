import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { computeSchedule } from '../lib/calc'
import type { Schedule, ScheduleRequest } from '../types/calc'
import { useDebounce } from './useDebounce'

const isRequestValid = (req: ScheduleRequest) =>
  req.principal > 0 &&
  req.annualRate >= 0 &&
  req.annualRate <= 0.3 &&
  req.termMonths >= 1 &&
  req.termMonths <= 600

export function useSchedule(request: ScheduleRequest) {
  const debounced = useDebounce(request, 250)
  return useQuery<Schedule>({
    queryKey: ['schedule', debounced],
    queryFn: () => computeSchedule(debounced),
    enabled: isRequestValid(debounced),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })
}
