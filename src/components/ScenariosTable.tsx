import type { CompareResult } from '../types/calc'
import { formatMonths, formatPLN } from '../lib/format'

export function ScenariosTable({
  result,
}: {
  result: CompareResult | undefined
}) {
  if (!result || result.scenarios.length === 0) return null

  const sorted = [...result.scenarios].sort(
    (a, b) => a.summary.totalPaid - b.summary.totalPaid,
  )

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-100">
          <tr className="border-b-2 border-slate-300 text-left text-slate-700">
            <th className="px-3 py-2">Scenariusz</th>
            <th className="px-3 py-2 text-right">Czas</th>
            <th className="px-3 py-2 text-right">Łącznie</th>
            <th className="px-3 py-2 text-right">Odsetki</th>
            <th className="px-3 py-2 text-right">Nadpłaty</th>
            <th className="px-3 py-2 text-right">Oszczędność</th>
            <th className="px-3 py-2 text-right">ROI</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200 bg-slate-50">
            <td className="px-3 py-1.5">
              <div className="font-medium text-slate-700">Bez nadpłat</div>
              <div className="text-xs text-slate-500">punkt odniesienia</div>
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums text-slate-600">
              {result.baseline.months} mies.
            </td>
            <td className="px-3 py-1.5 text-right font-medium tabular-nums text-slate-700">
              {formatPLN(result.baseline.totalPaid)}
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums text-slate-600">
              {formatPLN(result.baseline.totalInterest)}
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums text-slate-400">—</td>
            <td className="px-3 py-1.5 text-right tabular-nums text-slate-400">—</td>
            <td className="px-3 py-1.5 text-right tabular-nums text-slate-400">—</td>
          </tr>
          {sorted.map((s) => {
            const totalDiff = result.baseline.totalPaid - s.summary.totalPaid
            return (
              <tr
                key={s.name}
                className="border-b border-slate-200 last:border-0 hover:bg-slate-50"
              >
                <td className="px-3 py-1.5">
                  <div className="font-medium text-slate-900">{s.name}</div>
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {s.summary.months} mies.
                  {s.monthsSaved > 0 && (
                    <div className="text-xs text-emerald-700">
                      −{formatMonths(s.monthsSaved)}
                    </div>
                  )}
                </td>
                <td className="px-3 py-1.5 text-right font-medium tabular-nums">
                  {formatPLN(s.summary.totalPaid)}
                  {totalDiff > 0 && (
                    <div className="text-xs text-emerald-700">−{formatPLN(totalDiff)}</div>
                  )}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {formatPLN(s.summary.totalInterest)}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {formatPLN(s.summary.totalOverpayment)}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-emerald-700">
                  {s.interestSaved > 0 ? formatPLN(s.interestSaved) : '—'}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {s.roi > 0 ? `${(s.roi * 100).toFixed(0)}%` : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
