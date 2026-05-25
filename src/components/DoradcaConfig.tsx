import type { DoradcaConfigValue } from '../types/calc'
import { NumericInput } from './ui/NumericInput'

export type { DoradcaConfigValue }

export function DoradcaConfig({
  value,
  onChange,
}: {
  value: DoradcaConfigValue
  onChange: (next: DoradcaConfigValue) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-600">Komfort (PLN/mies)</span>
        <NumericInput
          value={value.comfortable}
          min={0}
          step={100}
          aria-label="Komfortowa nadpłata"
          onChange={(v) => { if (v >= 0) onChange({ ...value, comfortable: v }) }}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        />
        <span className="text-xs text-slate-500">Ile dorzucasz bez bólu</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-600">Max (PLN/mies)</span>
        <NumericInput
          value={value.max}
          min={0}
          step={100}
          aria-label="Max nadpłata"
          onChange={(v) => { if (v >= 0) onChange({ ...value, max: v }) }}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        />
        <span className="text-xs text-slate-500">Górny limit wysiłku</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={value.hasTarget}
            aria-label="Czy chcesz cel długości kredytu"
            onChange={(e) => onChange({ ...value, hasTarget: e.target.checked })}
          />
          Cel: spłacić w (lat)
        </span>
        <NumericInput
          value={value.targetYears}
          min={1}
          max={50}
          step={1}
          disabled={!value.hasTarget}
          aria-label="Cel — liczba lat"
          onChange={(v) => { if (v > 0) onChange({ ...value, targetYears: v }) }}
          className="rounded border border-slate-300 px-2 py-1 text-sm disabled:bg-slate-100 disabled:text-slate-400"
        />
        <span className="text-xs text-slate-500">
          {value.hasTarget
            ? `Strategie kończące kredyt w ≤ ${value.targetYears} lat`
            : 'Bez celu — tylko eksploracja'}
        </span>
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
            className="w-16 rounded border border-slate-300 px-2 py-1 text-sm"
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
        <span className="text-xs text-slate-500">Alternatywa: zysk po Belce</span>
      </div>
    </div>
  )
}
