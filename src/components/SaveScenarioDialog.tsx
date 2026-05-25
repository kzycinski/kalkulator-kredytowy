import { useEffect, useState } from 'react'
import { useCreateScenario } from '../hooks/useSavedScenarios'
import { useLoanStore } from '../store/loanStore'
import { formatPercent, formatPLN } from '../lib/format'

export function SaveScenarioDialog({ onClose }: { onClose: () => void }) {
  const principal = useLoanStore((s) => s.principal)
  const annualRate = useLoanStore((s) => s.annualRate)
  const termMonths = useLoanStore((s) => s.termMonths)
  const startDate = useLoanStore((s) => s.startDate)
  const installmentType = useLoanStore((s) => s.installmentType)
  const overpaymentStrategy = useLoanStore((s) => s.overpaymentStrategy)
  const recurringOverpayment = useLoanStore((s) => s.recurringOverpayment)
  const customOverpayments = useLoanStore((s) => s.customOverpayments)
  const timeBands = useLoanStore((s) => s.timeBands)
  const sweepCfg = useLoanStore((s) => s.sweepCfg)
  const compareScenarios = useLoanStore((s) => s.compareScenarios)
  const doradcaCfg = useLoanStore((s) => s.doradcaCfg)
  const bonusCfg = useLoanStore((s) => s.bonusCfg)

  const [name, setName] = useState('')
  const createScenario = useCreateScenario()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const trimmed = name.trim()
  const isValid = trimmed.length > 0 && trimmed.length <= 200

  function handleSave() {
    if (!isValid) return
    createScenario({
      name: trimmed,
      principal,
      annualRate,
      termMonths,
      startDate,
      installmentType,
      overpaymentStrategy,
      recurringOverpayment,
      customOverpayments,
      timeBands,
      sweepCfg,
      compareScenarios,
      doradcaCfg,
      bonusCfg,
    })
    onClose()
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
        <h3 className="mb-2 text-lg font-semibold">Zapisz scenariusz</h3>
        <p className="mb-4 text-sm text-slate-600">
          Zapisze bieżące parametry i nadpłaty pod wybraną nazwą — lokalnie w tej przeglądarce.
        </p>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Nazwa</span>
          <input
            type="text"
            value={name}
            autoFocus
            maxLength={200}
            aria-label="Nazwa scenariusza"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isValid) handleSave()
            }}
            placeholder="np. Kredyt 500k @ 7.25%"
            className="rounded border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </label>

        <dl className="mt-4 inline-grid grid-cols-[auto_auto] gap-x-3 gap-y-1 text-sm text-slate-600">
          <dt>Kwota:</dt>
          <dd className="text-slate-900">{formatPLN(principal)}</dd>
          <dt>Oprocentowanie:</dt>
          <dd className="text-slate-900">{formatPercent(annualRate)}</dd>
          <dt>Okres:</dt>
          <dd className="text-slate-900">{termMonths} mies.</dd>
          <dt>Cykliczna nadpłata:</dt>
          <dd className="text-slate-900">{formatPLN(recurringOverpayment)}</dd>
          <dt>Własne nadpłaty:</dt>
          <dd className="text-slate-900">{Object.keys(customOverpayments).length}</dd>
          <dt>Okresy nadpłat:</dt>
          <dd className="text-slate-900">{timeBands.length}</dd>
        </dl>

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
            onClick={handleSave}
            disabled={!isValid}
            className="rounded bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            Zapisz
          </button>
        </div>
      </div>
    </div>
  )
}
