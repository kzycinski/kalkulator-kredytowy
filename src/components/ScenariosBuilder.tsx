import {
  BONUS_LABEL,
  type BonusConfig,
  type BonusDuration,
  type UIScenario,
} from '../lib/scenarioModel'

export function ScenariosBuilder({
  scenarios,
  onChange,
}: {
  scenarios: UIScenario[]
  onChange: (next: UIScenario[]) => void
}) {

  function updateAt(idx: number, patch: Partial<UIScenario>) {
    const next = scenarios.slice()
    const current = next[idx]
    if (!current) return
    next[idx] = { ...current, ...patch }
    onChange(next)
  }

  function updateBonusAt(idx: number, bonus: BonusConfig | null) {
    updateAt(idx, { bonus })
  }

  function setBonusDuration(idx: number, value: '' | BonusDuration) {
    const current = scenarios[idx]
    if (!current) return
    if (value === '') {
      updateBonusAt(idx, null)
    } else {
      updateBonusAt(idx, {
        duration: value,
        amount: current.bonus?.amount ?? 500,
      })
    }
  }

  function setBonusAmount(idx: number, amount: number) {
    const current = scenarios[idx]
    if (!current?.bonus) return
    updateBonusAt(idx, { ...current.bonus, amount })
  }

  function removeAt(idx: number) {
    onChange(scenarios.filter((_, i) => i !== idx))
  }

  function addScenario() {
    onChange([
      ...scenarios,
      {
        name: `Scenariusz ${scenarios.length + 1}`,
        recurring: 500,
        bonus: null,
      },
    ])
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Scenariusze do porównania</h3>
        <button
          type="button"
          onClick={addScenario}
          className="rounded border px-3 py-1 text-sm hover:bg-slate-50"
        >
          + Dodaj scenariusz
        </button>
      </div>
      {scenarios.length === 0 && (
        <p className="text-sm italic text-slate-400">Dodaj co najmniej jeden scenariusz.</p>
      )}
      {scenarios.map((s, idx) => (
        <div
          key={idx}
          className="grid grid-cols-1 gap-2 rounded border border-slate-200 p-2 sm:grid-cols-[1.5fr_1fr_1.3fr_1fr_auto] sm:items-end"
        >
          <label className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-600">Nazwa</span>
            <input
              type="text"
              value={s.name}
              aria-label={`Scenariusz ${idx + 1} - nazwa`}
              onChange={(e) => updateAt(idx, { name: e.target.value })}
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-600">Cykliczna (PLN/mies)</span>
            <input
              type="number"
              min={0}
              step={100}
              value={s.recurring}
              aria-label={`Scenariusz ${idx + 1} - cykliczna`}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (Number.isFinite(v) && v >= 0) updateAt(idx, { recurring: v })
              }}
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-600">Bonus na początku</span>
            <select
              value={s.bonus?.duration ?? ''}
              aria-label={`Scenariusz ${idx + 1} - okres bonusu`}
              onChange={(e) => setBonusDuration(idx, e.target.value as '' | BonusDuration)}
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            >
              <option value="">Bez bonusu</option>
              {Object.entries(BONUS_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-600">Bonus (PLN/mies)</span>
            <input
              type="number"
              min={0}
              step={100}
              value={s.bonus?.amount ?? 0}
              disabled={s.bonus === null}
              aria-label={`Scenariusz ${idx + 1} - kwota bonusu`}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (Number.isFinite(v) && v >= 0) setBonusAmount(idx, v)
              }}
              className="rounded border border-slate-300 px-2 py-1 text-sm disabled:bg-slate-100 disabled:text-slate-400"
            />
          </label>
          <button
            type="button"
            onClick={() => removeAt(idx)}
            aria-label={`Usuń scenariusz ${idx + 1}`}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      ))}
      <p className="mt-2 text-xs text-slate-500">
        Bonus = dodatkowa kwota nadpłaty doliczana <strong>na wierzch cyklicznej</strong> w pierwszych
        miesiącach. Scenariusze zapisują się automatycznie.
      </p>
    </div>
  )
}
