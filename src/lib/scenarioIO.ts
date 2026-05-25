import type { SavedScenario } from '../types/calc'

const EXPORT_VERSION = 1

export interface ScenarioExport {
  version: number
  exportedAt: string
  scenarios: SavedScenario[]
}

export function buildExportPayload(scenarios: SavedScenario[]): ScenarioExport {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    scenarios,
  }
}

export function downloadScenarios(scenarios: SavedScenario[]): void {
  const payload = buildExportPayload(scenarios)
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `kredyt-scenariusze-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export class InvalidScenarioImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidScenarioImportError'
  }
}

export function parseScenarioImport(raw: string): SavedScenario[] {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    throw new InvalidScenarioImportError('Plik nie jest poprawnym JSON-em')
  }
  if (!data || typeof data !== 'object') {
    throw new InvalidScenarioImportError('Brak obiektu w pliku')
  }
  const obj = data as Partial<ScenarioExport>
  if (obj.version !== EXPORT_VERSION) {
    throw new InvalidScenarioImportError(
      `Nieobsługiwana wersja eksportu: ${obj.version ?? 'brak'}`,
    )
  }
  if (!Array.isArray(obj.scenarios)) {
    throw new InvalidScenarioImportError('Brak listy scenariuszy')
  }
  obj.scenarios.forEach((s, idx) => {
    if (!isValidScenario(s)) {
      throw new InvalidScenarioImportError(`Niepoprawny scenariusz #${idx + 1}`)
    }
  })
  return obj.scenarios
}

function isValidScenario(s: unknown): s is SavedScenario {
  if (!s || typeof s !== 'object') return false
  const o = s as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.principal === 'number' &&
    typeof o.annualRate === 'number' &&
    typeof o.termMonths === 'number' &&
    typeof o.installmentType === 'string' &&
    typeof o.overpaymentStrategy === 'string' &&
    typeof o.recurringOverpayment === 'number' &&
    typeof o.createdAt === 'string' &&
    typeof o.updatedAt === 'string' &&
    Array.isArray(o.timeBands) &&
    o.customOverpayments !== null &&
    typeof o.customOverpayments === 'object'
  )
}
