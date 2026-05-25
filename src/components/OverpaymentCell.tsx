import { useState } from 'react'
import { useLoanStore } from '../store/loanStore'
import { CopyToNextDialog } from './CopyToNextDialog'
import type { ScheduleRow } from '../types/calc'

export function OverpaymentCell({ row }: { row: ScheduleRow }) {
  const customOver = useLoanStore((s) => s.customOverpayments[row.month])
  const setCustom = useLoanStore((s) => s.setCustomOverpayment)
  const [dialogOpen, setDialogOpen] = useState(false)

  const isCustom = customOver !== undefined
  const displayValue = isCustom ? customOver : row.overpayment

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        {isCustom && (
          <span
            className="text-xs text-blue-600"
            title="Własna nadpłata"
            aria-label="własna nadpłata"
          >
            ●
          </span>
        )}
        <input
          type="number"
          min={0}
          step={50}
          value={displayValue}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (Number.isFinite(v) && v >= 0) {
              setCustom(row.month, v)
            }
          }}
          aria-label={`Nadpłata miesiąc ${row.month}`}
          className="w-24 rounded border border-slate-300 px-2 py-0.5 text-right text-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          aria-label={`Kopiuj nadpłatę z miesiąca ${row.month}`}
          title="Kopiuj do następnych miesięcy"
          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          📋
        </button>
      </div>
      {dialogOpen && (
        <CopyToNextDialog
          sourceMonth={row.month}
          sourceAmount={displayValue}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  )
}
