import type { CompareResult } from '../types/calc'
import { formatMonths, formatPLN } from '../lib/format'

export function ScenariosTable({ result }: { result: CompareResult | undefined }) {
  if (!result || result.scenarios.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-600">
            <th className="px-2 py-2">Scenariusz</th>
            <th className="px-2 py-2 text-right">Miesięcy</th>
            <th className="px-2 py-2 text-right">Skrócenie</th>
            <th className="px-2 py-2 text-right">Suma odsetek</th>
            <th className="px-2 py-2 text-right">Suma nadpłat</th>
            <th className="px-2 py-2 text-right">Oszczędność</th>
            <th className="px-2 py-2 text-right">ROI</th>
          </tr>
        </thead>
        <tbody>
          {result.scenarios.map((s) => (
            <tr key={s.name} className="border-b last:border-0 hover:bg-slate-50">
              <td className="px-2 py-1.5">{s.name}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{s.summary.months}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">
                {s.monthsSaved > 0 ? formatMonths(s.monthsSaved) : '—'}
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums">
                {formatPLN(s.summary.totalInterest)}
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums">
                {formatPLN(s.summary.totalOverpayment)}
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums text-green-700">
                {s.interestSaved > 0 ? formatPLN(s.interestSaved) : '—'}
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums">
                {s.roi > 0 ? `${(s.roi * 100).toFixed(1)}%` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
