import { useState } from 'react'
import type { ScheduleRow } from '../types/calc'
import { formatDate, formatMonths, formatPLN, pluralRat } from '../lib/format'
import { useLoanStore } from '../store/loanStore'
import { OverpaymentCell } from './OverpaymentCell'

const PAGE_SIZE = 60

export function ScheduleTable({ rows }: { rows: ScheduleRow[] }) {
  const [page, setPage] = useState(0)
  const customCount = useLoanStore((s) => Object.keys(s.customOverpayments).length)
  const clearCustom = useLoanStore((s) => s.clearCustomOverpayments)

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const slice = rows.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="text-lg font-semibold">Harmonogram spłaty</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {rows.length} {pluralRat(rows.length)} • {formatMonths(rows.length)}
          </span>
        </div>
        {customCount > 0 && (
          <button
            type="button"
            onClick={clearCustom}
            className="rounded border px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
          >
            Wyczyść własne nadpłaty ({customCount})
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-600">
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Data</th>
              <th className="px-2 py-2 text-right">Rata</th>
              <th className="px-2 py-2 text-right">Kapitał</th>
              <th className="px-2 py-2 text-right">Odsetki</th>
              <th className="px-2 py-2 text-right">Nadpłata</th>
              <th className="px-2 py-2 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <tr key={r.month} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-2 py-1.5">{r.month}</td>
                <td className="px-2 py-1.5">{formatDate(r.date)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatPLN(r.installment)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {formatPLN(r.principalPart)}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatPLN(r.interestPart)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  <OverpaymentCell row={r} />
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">{formatPLN(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setPage(Math.max(0, safePage - 1))}
            disabled={safePage === 0}
            className="rounded border px-3 py-1 disabled:opacity-50"
          >
            Poprzednia
          </button>
          <span>
            Strona {safePage + 1} z {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
            disabled={safePage === totalPages - 1}
            className="rounded border px-3 py-1 disabled:opacity-50"
          >
            Następna
          </button>
        </div>
      )}
    </div>
  )
}
