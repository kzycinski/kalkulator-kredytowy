import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLoanStore } from '../store/loanStore'
import { useSchedule } from '../hooks/useSchedule'
import { LoanParamsForm } from '../components/LoanParamsForm'
import { TimeBandsEditor } from '../components/TimeBandsEditor'
import { ScheduleTable } from '../components/ScheduleTable'
import { Charts } from '../components/Charts'
import { Summary } from '../components/Summary'
import { SaveScenarioDialog } from '../components/SaveScenarioDialog'
import type { ScheduleRequest } from '../types/calc'

export function Calculator() {
  const principal = useLoanStore((s) => s.principal)
  const annualRate = useLoanStore((s) => s.annualRate)
  const termMonths = useLoanStore((s) => s.termMonths)
  const startDate = useLoanStore((s) => s.startDate)
  const installmentType = useLoanStore((s) => s.installmentType)
  const overpaymentStrategy = useLoanStore((s) => s.overpaymentStrategy)
  const recurringOverpayment = useLoanStore((s) => s.recurringOverpayment)
  const customOverpayments = useLoanStore((s) => s.customOverpayments)
  const timeBands = useLoanStore((s) => s.timeBands)

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)

  const currentReq = useMemo<ScheduleRequest>(
    () => ({
      principal,
      annualRate,
      termMonths,
      startDate,
      installmentType,
      overpaymentStrategy,
      recurringOverpayment,
      customOverpayments,
      timeBands,
    }),
    [
      principal,
      annualRate,
      termMonths,
      startDate,
      installmentType,
      overpaymentStrategy,
      recurringOverpayment,
      customOverpayments,
      timeBands,
    ],
  )

  const baselineReq = useMemo<ScheduleRequest>(
    () => ({
      principal,
      annualRate,
      termMonths,
      startDate,
      installmentType,
      overpaymentStrategy,
      recurringOverpayment: 0,
      customOverpayments: {},
      timeBands: [],
    }),
    [principal, annualRate, termMonths, startDate, installmentType, overpaymentStrategy],
  )

  const { data: schedule, isLoading, error } = useSchedule(currentReq)
  const { data: baseline } = useSchedule(baselineReq)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end gap-3 text-sm">
        <Link to="/scenarios" className="text-slate-600 underline hover:text-slate-900">
          Zapisane scenariusze
        </Link>
        <button
          type="button"
          onClick={() => setSaveDialogOpen(true)}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
        >
          💾 Zapisz scenariusz
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <LoanParamsForm />
          <TimeBandsEditor />
          <Summary schedule={schedule} baseline={baseline} />
        </div>
        <div className="flex flex-col gap-6">
          {isLoading && !schedule && <p className="text-slate-500">Obliczanie...</p>}
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              Błąd: {error.message}
            </div>
          )}
          {schedule && <Charts rows={schedule.rows} annualRate={annualRate} />}
          {schedule && <ScheduleTable rows={schedule.rows} />}
        </div>
      </div>

      {saveDialogOpen && <SaveScenarioDialog onClose={() => setSaveDialogOpen(false)} />}
    </div>
  )
}
