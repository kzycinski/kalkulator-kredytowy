import { useRef, useState } from 'react'
import { useLoanStore } from '../store/loanStore'
import {
  InvalidScenarioImportError,
  downloadScenarios,
  parseScenarioImport,
} from '../lib/scenarioIO'
import { pluralScenariuszy } from '../lib/format'

export function ImportExportButtons() {
  const scenarios = useLoanStore((s) => s.savedScenarios)
  const importScenarios = useLoanStore((s) => s.importSavedScenarios)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  function handleExport() {
    if (scenarios.length === 0) {
      setMessage({ type: 'error', text: 'Brak scenariuszy do pobrania' })
      return
    }
    downloadScenarios(scenarios)
    setMessage({ type: 'ok', text: `Pobrano ${scenarios.length} ${pluralScenariuszy(scenarios.length)}` })
  }

  function handlePick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const imported = parseScenarioImport(text)
      const result = importScenarios(imported)
      setMessage({
        type: 'ok',
        text: `Wgrano ${imported.length} ${pluralScenariuszy(imported.length)} (dodano ${result.added}, zaktualizowano ${result.replaced})`,
      })
    } catch (err) {
      const msg =
        err instanceof InvalidScenarioImportError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Nieznany błąd'
      setMessage({ type: 'error', text: `Błąd importu: ${msg}` })
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
        >
          📥 Pobierz JSON
        </button>
        <button
          type="button"
          onClick={handlePick}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
        >
          📤 Wgraj JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Wgraj plik JSON"
        />
      </div>
      {message && (
        <p
          role="status"
          className={message.type === 'ok' ? 'text-xs text-green-700' : 'text-xs text-red-600'}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
