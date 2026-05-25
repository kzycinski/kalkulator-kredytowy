import { useEffect, useState } from 'react'
import { useLoanStore } from '../store/loanStore'
import { formatPLN } from '../lib/format'

type View = 'set' | 'confirm' | 'override'

export function CopyToNextDialog({
  sourceMonth,
  sourceAmount,
  onClose,
}: {
  sourceMonth: number
  sourceAmount: number
  onClose: () => void
}) {
  const stored = useLoanStore((s) => s.copyToNextCount)
  const setStored = useLoanStore((s) => s.setCopyToNextCount)
  const copyToNext = useLoanStore((s) => s.copyOverpaymentToNext)

  const [view, setView] = useState<View>(stored === null ? 'set' : 'confirm')
  const [count, setCount] = useState<number>(stored ?? 12)
  const [conflicts, setConflicts] = useState(0)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function attemptCopy(override: boolean) {
    const result = copyToNext(sourceMonth, count, override)
    if (result.conflicts > 0 && !override) {
      setConflicts(result.conflicts)
      setView('override')
    } else {
      setStored(count)
      onClose()
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {view === 'set' && (
          <>
            <h3 className="mb-2 text-lg font-semibold">
              Kopiuj nadpłatę {formatPLN(sourceAmount)}
            </h3>
            <p className="mb-4 text-sm text-slate-600">
              Z miesiąca <strong>{sourceMonth}</strong> do następnych X miesięcy.
            </p>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-700">Liczba miesięcy</span>
              <input
                type="number"
                min={1}
                max={600}
                value={count}
                autoFocus
                onChange={(e) => {
                  const v = Number(e.target.value)
                  if (Number.isFinite(v) && v > 0) setCount(v)
                }}
                className="rounded border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
              />
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded border px-4 py-2 hover:bg-slate-50"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={() => attemptCopy(false)}
                className="rounded bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700"
              >
                Kopiuj
              </button>
            </div>
          </>
        )}
        {view === 'confirm' && (
          <>
            <h3 className="mb-2 text-lg font-semibold">Skopiować nadpłatę?</h3>
            <p className="mb-6 text-sm text-slate-600">
              Wartość <strong>{formatPLN(sourceAmount)}</strong> z miesiąca{' '}
              <strong>{sourceMonth}</strong> → następne <strong>{count}</strong> miesięcy.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded border px-4 py-2 hover:bg-slate-50"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={() => setView('set')}
                className="rounded border px-4 py-2 hover:bg-slate-50"
              >
                Zmień X
              </button>
              <button
                type="button"
                onClick={() => attemptCopy(false)}
                className="rounded bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700"
              >
                Kopiuj
              </button>
            </div>
          </>
        )}
        {view === 'override' && (
          <>
            <h3 className="mb-2 text-lg font-semibold">Konflikt nadpłat</h3>
            <p className="mb-6 text-sm text-slate-600">
              <strong>{conflicts}</strong> z <strong>{count}</strong> miesięcy ma już własną
              wartość. Nadpisać wszystkie?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded border px-4 py-2 hover:bg-slate-50"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={() => attemptCopy(true)}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Nadpisz
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
