import { useLoanStore } from '../store/loanStore'

export function TimeBandsEditor() {
  const timeBands = useLoanStore((s) => s.timeBands)
  const setTimeBands = useLoanStore((s) => s.setTimeBands)
  const termMonths = useLoanStore((s) => s.termMonths)

  function addBand() {
    setTimeBands([...timeBands, { fromMonth: 1, toMonth: 12, amount: 1000 }])
  }

  function updateBand(idx: number, patch: Partial<(typeof timeBands)[number]>) {
    const next = timeBands.slice()
    const current = next[idx]
    if (!current) return
    next[idx] = { ...current, ...patch }
    setTimeBands(next)
  }

  function removeBand(idx: number) {
    setTimeBands(timeBands.filter((_, i) => i !== idx))
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Nadpłaty okresowe</h2>
        <button
          type="button"
          onClick={addBand}
          className="rounded border px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
        >
          + Dodaj okres
        </button>
      </div>
      <p className="mb-3 text-xs text-slate-500">
        Cykliczna nadpłata dla zakresu miesięcy. Custom nadpłata z tabeli ma pierwszeństwo. Bez okresów obowiązuje
        nadpłata cykliczna z parametrów.
      </p>
      {timeBands.length === 0 ? (
        <p className="text-sm italic text-slate-400">Brak zdefiniowanych okresów.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {timeBands.map((band, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 rounded border border-slate-200 p-2"
            >
              <label className="flex flex-col gap-0.5">
                <span className="text-xs text-slate-600">Od mies.</span>
                <input
                  type="number"
                  min={1}
                  max={termMonths}
                  value={band.fromMonth}
                  aria-label={`Okres ${idx + 1} - od miesiąca`}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (Number.isFinite(v)) updateBand(idx, { fromMonth: v })
                  }}
                  className="rounded border border-slate-300 px-2 py-1 text-sm"
                />
              </label>
              <label className="flex flex-col gap-0.5">
                <span className="text-xs text-slate-600">Do mies.</span>
                <input
                  type="number"
                  min={1}
                  max={termMonths}
                  value={band.toMonth}
                  aria-label={`Okres ${idx + 1} - do miesiąca`}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (Number.isFinite(v)) updateBand(idx, { toMonth: v })
                  }}
                  className="rounded border border-slate-300 px-2 py-1 text-sm"
                />
              </label>
              <label className="flex flex-col gap-0.5">
                <span className="text-xs text-slate-600">Kwota (PLN)</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={band.amount}
                  aria-label={`Okres ${idx + 1} - kwota`}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (Number.isFinite(v) && v >= 0) updateBand(idx, { amount: v })
                  }}
                  className="rounded border border-slate-300 px-2 py-1 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={() => removeBand(idx)}
                aria-label={`Usuń okres ${idx + 1}`}
                className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
