import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDeleteScenario, useSavedScenariosList } from '../hooks/useSavedScenarios'
import { useLoanStore } from '../store/loanStore'
import { ImportExportButtons } from '../components/ImportExportButtons'
import { SaveScenarioDialog } from '../components/SaveScenarioDialog'
import { formatDate, formatMonths, formatPercent, formatPLN } from '../lib/format'

export function Scenarios() {
  const scenarios = useSavedScenariosList()
  const deleteScenario = useDeleteScenario()
  const loadScenario = useLoanStore((s) => s.loadScenario)
  const navigate = useNavigate()
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)

  function handleOpen(id: string) {
    const scenario = scenarios.find((s) => s.id === id)
    if (!scenario) return
    loadScenario(scenario)
    navigate('/')
  }

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Usunąć scenariusz „${name}"?`)) return
    deleteScenario(id)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="mb-2 text-lg font-semibold">Zapisane scenariusze</h2>
            <p className="text-sm text-slate-600">
              Zapisane lokalnie w Twojej przeglądarce. Pobierz JSON żeby zrobić kopię zapasową lub
              przenieść na inne urządzenie.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => setSaveDialogOpen(true)}
              className="rounded bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-700"
            >
              💾 Zapisz scenariusz
            </button>
            <ImportExportButtons />
          </div>
        </div>
      </div>

      {saveDialogOpen && <SaveScenarioDialog onClose={() => setSaveDialogOpen(false)} />}

      {scenarios.length === 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-slate-500">
            Brak zapisanych scenariuszy. Wejdź do Kalkulatora i kliknij „Zapisz scenariusz" lub
            wgraj plik JSON.
          </p>
        </div>
      )}

      {scenarios.length > 0 && (
        <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-600">
                <th className="px-4 py-3">Nazwa</th>
                <th className="px-4 py-3 text-right">Kwota</th>
                <th className="px-4 py-3 text-right">Oproc.</th>
                <th className="px-4 py-3 text-right">Okres</th>
                <th className="px-4 py-3 text-right">Cykl. nadp.</th>
                <th className="px-4 py-3 text-right">Custom</th>
                <th className="px-4 py-3 text-right">Okresy</th>
                <th className="px-4 py-3">Zapisano</th>
                <th className="px-4 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPLN(s.principal)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatPercent(s.annualRate)}
                  </td>
                  <td
                    className="px-4 py-3 text-right tabular-nums"
                    title={formatMonths(s.termMonths)}
                  >
                    {s.termMonths} m
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatPLN(s.recurringOverpayment)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {Object.keys(s.customOverpayments).length}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.timeBands.length}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpen(s.id)}
                        className="rounded bg-cyan-600 px-3 py-1 text-xs text-white hover:bg-cyan-700"
                      >
                        Otwórz
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id, s.name)}
                        className="rounded border px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
