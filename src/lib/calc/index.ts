import type {
  CompareResult,
  CompareScenariosRequest,
  CompareSweepRequest,
  Schedule,
  ScheduleRequest,
  SweepResult,
} from '../../types/calc'
import { computeSchedule as syncComputeSchedule } from './mortgageCalculator'
import { computeSweep as syncComputeSweep } from './sweepCalculator'
import { computeCompareScenarios as syncCompareScenarios } from './scenarios'

export function computeSchedule(req: ScheduleRequest): Promise<Schedule> {
  return Promise.resolve(syncComputeSchedule(req))
}

export function computeSweep(req: CompareSweepRequest): Promise<SweepResult> {
  return Promise.resolve(syncComputeSweep(req))
}

export function computeScenarios(req: CompareScenariosRequest): Promise<CompareResult> {
  return Promise.resolve(syncCompareScenarios(req))
}
