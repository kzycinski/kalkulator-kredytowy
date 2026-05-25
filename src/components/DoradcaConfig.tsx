export interface DoradcaConfigValue {
  comfortable: number
  max: number
  hasTarget: boolean
  targetYears: number
}

export function DoradcaConfig({
  value,
  onChange,
}: {
  value: DoradcaConfigValue
  onChange: (next: DoradcaConfigValue) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-600">
          Komfortowa nadpłata (PLN/mies)
        </span>
        <input
          type="number"
          min={0}
          step={100}
          value={value.comfortable}
          aria-label="Komfortowa nadpłata"
          onChange={(e) => {
            const v = Number(e.target.value)
            if (Number.isFinite(v) && v >= 0) onChange({ ...value, comfortable: v })
          }}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        />
        <span className="text-xs text-slate-500">
          Ile możesz dorzucać bez bólu, na bieżąco
        </span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-600">Max nadpłata (PLN/mies)</span>
        <input
          type="number"
          min={0}
          step={100}
          value={value.max}
          aria-label="Max nadpłata"
          onChange={(e) => {
            const v = Number(e.target.value)
            if (Number.isFinite(v) && v >= 0) onChange({ ...value, max: v })
          }}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        />
        <span className="text-xs text-slate-500">
          Górny limit — przy nim zero wakacji i oszczędności
        </span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={value.hasTarget}
            aria-label="Czy chcesz cel długości kredytu"
            onChange={(e) => onChange({ ...value, hasTarget: e.target.checked })}
          />
          Cel: spłacić w
        </span>
        <input
          type="number"
          min={1}
          max={50}
          step={1}
          value={value.targetYears}
          disabled={!value.hasTarget}
          aria-label="Cel — liczba lat"
          onChange={(e) => {
            const v = Number(e.target.value)
            if (Number.isFinite(v) && v > 0) onChange({ ...value, targetYears: v })
          }}
          className="rounded border border-slate-300 px-2 py-1 text-sm disabled:bg-slate-100 disabled:text-slate-400"
        />
        <span className="text-xs text-slate-500">
          {value.hasTarget
            ? `Algorytm znajdzie strategie, które kończą kredyt w ≤ ${value.targetYears} lat`
            : 'Bez celu — tylko eksploracja strategii'}
        </span>
      </label>
    </div>
  )
}
