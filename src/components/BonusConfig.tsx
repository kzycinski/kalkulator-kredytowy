export interface BonusConfigValue {
  baseRecurring: number
  bonusFrom: number
  bonusTo: number
  bonusStep: number
  durationsMonths: number[]
}

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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-600">Cykliczna baza (PLN/mies)</span>
          <input
            type="number"
            min={0}
            step={100}
            value={value.baseRecurring}
            aria-label="Cykliczna baza"
            onChange={(e) => {
              const v = Number(e.target.value)
              if (Number.isFinite(v) && v >= 0) onChange({ ...value, baseRecurring: v })
            }}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-600">Bonus od (PLN/mies)</span>
          <input
            type="number"
            min={0}
            step={100}
            value={value.bonusFrom}
            aria-label="Bonus od"
            onChange={(e) => {
              const v = Number(e.target.value)
              if (Number.isFinite(v) && v >= 0) onChange({ ...value, bonusFrom: v })
            }}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-600">Bonus do (PLN/mies)</span>
          <input
            type="number"
            min={1}
            step={100}
            value={value.bonusTo}
            aria-label="Bonus do"
            onChange={(e) => {
              const v = Number(e.target.value)
              if (Number.isFinite(v) && v > 0) onChange({ ...value, bonusTo: v })
            }}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-600">Krok (PLN)</span>
          <input
            type="number"
            min={1}
            step={50}
            value={value.bonusStep}
            aria-label="Krok"
            onChange={(e) => {
              const v = Number(e.target.value)
              if (Number.isFinite(v) && v > 0) onChange({ ...value, bonusStep: v })
            }}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          />
        </label>
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
