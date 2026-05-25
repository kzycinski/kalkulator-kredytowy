import type { SweetSpot } from '../types/calc'
import { formatMonths, formatPLN } from '../lib/format'

export function SweetSpotCard({
  sweetSpot,
  baselineMonths,
}: {
  sweetSpot: SweetSpot | null
  baselineMonths?: number
}) {
  if (!sweetSpot) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Sweet spot nie znaleziony — rozszerz zakres sweep lub obniż próg.
      </div>
    )
  }
  const finalMonths =
    baselineMonths !== undefined ? baselineMonths - sweetSpot.monthsSaved : undefined
  return (
    <div className="rounded-lg border border-green-300 bg-green-50 p-4">
      <h3 className="mb-2 text-base font-semibold text-green-900">💡 Sweet spot</h3>
      <p className="text-sm text-green-900">
        Rekomendowana nadpłata: <strong>{formatPLN(sweetSpot.overpayment)} / mies.</strong>
      </p>
      <dl className="mt-2 inline-grid grid-cols-[auto_auto] gap-x-3 gap-y-1 text-sm text-green-900">
        <dt>Oszczędność odsetek:</dt>
        <dd className="font-semibold">{formatPLN(sweetSpot.interestSaved)}</dd>
        <dt>Skrócenie kredytu:</dt>
        <dd className="font-semibold">{formatMonths(sweetSpot.monthsSaved)}</dd>
        {finalMonths !== undefined && (
          <>
            <dt>Całkowita długość:</dt>
            <dd className="font-semibold">
              {finalMonths} mies. ({formatMonths(finalMonths)})
            </dd>
          </>
        )}
      </dl>
      <p className="mt-2 text-xs text-green-700">{sweetSpot.reason}</p>
    </div>
  )
}
