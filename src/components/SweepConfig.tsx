import type { SweepConfigValue } from '../types/calc'
import { NumericInput } from './ui/NumericInput'

export type { SweepConfigValue }

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
        <NumericInput
          value={value.from}
          min={0}
          step={100}
          aria-label="Sweep od"
          onChange={(v) => { if (v >= 0) onChange({ ...value, from: v }) }}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-600">Do (PLN/mies)</span>
        <NumericInput
          value={value.to}
          min={1}
          step={100}
          aria-label="Sweep do"
          onChange={(v) => { if (v > 0) onChange({ ...value, to: v }) }}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-600">Krok (PLN)</span>
        <NumericInput
          value={value.step}
          min={1}
          step={50}
          aria-label="Sweep krok"
          onChange={(v) => { if (v > 0) onChange({ ...value, step: v }) }}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-600">Próg sweet spot (0-1)</span>
        <NumericInput
          value={value.threshold}
          min={0.05}
          max={0.95}
          step={0.05}
          aria-label="Sweep próg"
          onChange={(v) => { if (v > 0 && v <= 1) onChange({ ...value, threshold: v }) }}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        />
      </label>
    </div>
  )
}
