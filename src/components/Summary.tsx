import type { Schedule } from '../types/calc'
import { formatMonths, formatPLN } from '../lib/format'
import { CapitalVsInterestDonut } from './CapitalVsInterestDonut'

export function Summary({
  schedule,
  baseline,
}: {
  schedule: Schedule | undefined
  baseline: Schedule | undefined
}) {
  if (!schedule) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Podsumowanie</h2>
        <p className="text-slate-500">Sprawdź parametry kredytu — brak danych do podsumowania.</p>
      </div>
    )
  }

  const monthsSaved = baseline ? baseline.summary.months - schedule.summary.months : 0
  const interestSaved = baseline
    ? baseline.summary.totalInterest - schedule.summary.totalInterest
    : 0
  const roi =
    schedule.summary.totalOverpayment > 0
      ? interestSaved / schedule.summary.totalOverpayment
      : 0

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Podsumowanie</h2>

      <CapitalVsInterestDonut summary={schedule.summary} />

      <dl className="mt-6 inline-grid grid-cols-[auto_auto] gap-x-6 gap-y-2 text-sm">
        <dt className="text-slate-600">Liczba rat</dt>
        <dd className="tabular-nums">
          {schedule.summary.months} ({formatMonths(schedule.summary.months)})
        </dd>

        {monthsSaved > 0 && (
          <>
            <dt className="text-slate-600">Skrócenie kredytu</dt>
            <dd className="tabular-nums text-green-700">{formatMonths(monthsSaved)}</dd>
          </>
        )}

        <dt className="text-slate-600">Suma odsetek</dt>
        <dd className="tabular-nums">{formatPLN(schedule.summary.totalInterest)}</dd>

        <dt className="text-slate-600">Suma nadpłat</dt>
        <dd className="tabular-nums">{formatPLN(schedule.summary.totalOverpayment)}</dd>

        {interestSaved > 0 && (
          <>
            <dt className="text-slate-600">Oszczędność (odsetki)</dt>
            <dd className="tabular-nums text-green-700">{formatPLN(interestSaved)}</dd>
          </>
        )}

        {roi > 0 && (
          <>
            <dt className="text-slate-600">ROI nadpłat</dt>
            <dd className="tabular-nums">{(roi * 100).toFixed(1)}%</dd>
          </>
        )}

        <dt className="border-t pt-2 text-slate-600">Suma do spłaty</dt>
        <dd className="border-t pt-2 font-semibold tabular-nums">
          {formatPLN(schedule.summary.totalPaid)}
        </dd>
      </dl>
    </div>
  )
}
