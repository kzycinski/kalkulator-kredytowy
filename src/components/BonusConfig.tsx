import type { BonusConfigValue } from '../types/calc'
import { NumericInput } from './ui/NumericInput'

export type { BonusConfigValue }

export const DURATION_OPTIONS: Array<{ months: number; label: string }> = [
  { months: 6, label: '6 mies.' },
  { months: 12, label: '1 rok' },
  { months: 24, label: '2 lata' },
  { months: 36, label: '3 lata' },
  { months: 60, label: '5 lat' },
  { months: 120, label: '10 lat' },
]

export function BonusConfig({
  value,
  onChange,
}: {
  value: BonusConfigValue
  onChange: (next: BonusConfigValue) => void
}) {
  function toggleDuration(months: number) {
    const set = new Set(value.durationsMonths)
    if (set.has(months)) set.delete(months)
    else set.add(months)
    onChange({
      ...value,
      durationsMonths: [...set].sort((a, b) => a - b),
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-600">Bonus od (PLN/mies)</span>
          <NumericInput
            value={value.bonusFrom}
            min={0}
            step={100}
            aria-label="Bonus od"
            onChange={(v) => { if (v >= 0) onChange({ ...value, bonusFrom: v }) }}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-600">Bonus do (PLN/mies)</span>
          <NumericInput
            value={value.bonusTo}
            min={1}
            step={100}
            aria-label="Bonus do"
            onChange={(v) => { if (v > 0) onChange({ ...value, bonusTo: v }) }}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-600">Krok (PLN)</span>
          <NumericInput
            value={value.bonusStep}
            min={1}
            step={50}
            aria-label="Krok"
            onChange={(v) => { if (v > 0) onChange({ ...value, bonusStep: v }) }}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-600">Inwestycja (% rocznie)</span>
          <div className="flex items-center gap-1">
            <NumericInput
              value={value.investmentRate}
              min={0}
              max={50}
              step={0.5}
              aria-label="Stopa zwrotu inwestycji"
              onChange={(v) => { if (v >= 0) onChange({ ...value, investmentRate: v }) }}
              className="w-14 rounded border border-slate-300 px-2 py-1 text-sm"
            />
            <span className="text-xs text-slate-400">%</span>
            {([5, 7, 10] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChange({ ...value, investmentRate: p })}
                className={`rounded px-1.5 py-0.5 text-xs ${value.investmentRate === p ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {p === 10 ? 'S&P' : `${p}%`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <span className="mb-1 block text-xs text-slate-600">Okresy bonusu</span>
        <div className="flex flex-wrap gap-3">
          {DURATION_OPTIONS.map((opt) => (
            <label key={opt.months} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={value.durationsMonths.includes(opt.months)}
                onChange={() => toggleDuration(opt.months)}
                aria-label={`Okres ${opt.label}`}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
