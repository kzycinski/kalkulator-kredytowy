export interface SweepConfigValue {
  from: number
  to: number
  step: number
  threshold: number
}

export function SweepConfig({
  value,
  onChange,
}: {
  value: SweepConfigValue
  onChange: (next: SweepConfigValue) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-600">Od (PLN/mies)</span>
        <input
          type="number"
          min={0}
          step={100}
          value={value.from}
          aria-label="Sweep od"
          onChange={(e) => {
            const v = Number(e.target.value)
            if (Number.isFinite(v) && v >= 0) onChange({ ...value, from: v })
          }}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-600">Do (PLN/mies)</span>
        <input
          type="number"
          min={1}
          step={100}
          value={value.to}
          aria-label="Sweep do"
          onChange={(e) => {
            const v = Number(e.target.value)
            if (Number.isFinite(v) && v > 0) onChange({ ...value, to: v })
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
          value={value.step}
          aria-label="Sweep krok"
          onChange={(e) => {
            const v = Number(e.target.value)
            if (Number.isFinite(v) && v > 0) onChange({ ...value, step: v })
          }}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-600">Próg sweet spot (0-1)</span>
        <input
          type="number"
          min={0.05}
          max={0.95}
          step={0.05}
          value={value.threshold}
          aria-label="Sweep próg"
          onChange={(e) => {
            const v = Number(e.target.value)
            if (Number.isFinite(v) && v > 0 && v <= 1) onChange({ ...value, threshold: v })
          }}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        />
      </label>
    </div>
  )
}
