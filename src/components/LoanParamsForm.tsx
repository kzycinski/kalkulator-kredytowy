import { useLoanStore } from '../store/loanStore'
import { cn } from '../lib/utils'

function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  error,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  max?: number
  error?: string | null
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <input
          type="number"
          value={Number.isFinite(value) ? value : ''}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const next = Number(e.target.value)
            if (Number.isFinite(next)) onChange(next)
          }}
          className={cn(
            'rounded border px-3 py-2 focus:outline-none',
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-slate-300 focus:border-slate-500',
          )}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export function LoanParamsForm() {
  const principal = useLoanStore((s) => s.principal)
  const annualRate = useLoanStore((s) => s.annualRate)
  const termMonths = useLoanStore((s) => s.termMonths)
  const startDate = useLoanStore((s) => s.startDate)
  const installmentType = useLoanStore((s) => s.installmentType)
  const overpaymentStrategy = useLoanStore((s) => s.overpaymentStrategy)
  const recurringOverpayment = useLoanStore((s) => s.recurringOverpayment)

  const setPrincipal = useLoanStore((s) => s.setPrincipal)
  const setAnnualRate = useLoanStore((s) => s.setAnnualRate)
  const setTermMonths = useLoanStore((s) => s.setTermMonths)
  const setStartDate = useLoanStore((s) => s.setStartDate)
  const setInstallmentType = useLoanStore((s) => s.setInstallmentType)
  const setOverpaymentStrategy = useLoanStore((s) => s.setOverpaymentStrategy)
  const setRecurringOverpayment = useLoanStore((s) => s.setRecurringOverpayment)

  const principalError = principal < 0.01 ? 'Kwota musi być większa niż 0' : null
  const rateError =
    annualRate < 0 || annualRate > 0.3
      ? 'Oprocentowanie musi być w zakresie 0–30%'
      : null
  const termError =
    termMonths < 1 || termMonths > 600 ? 'Okres musi mieścić się w 1–600 miesięcy' : null
  const overpayError = recurringOverpayment < 0 ? 'Nadpłata nie może być ujemna' : null

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Parametry kredytu</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Kwota kredytu (PLN)"
          value={principal}
          onChange={setPrincipal}
          min={0}
          step={1000}
          error={principalError}
        />
        <NumberField
          label="Oprocentowanie roczne (%)"
          value={Number.isFinite(annualRate) ? Math.round(annualRate * 10000) / 100 : annualRate}
          onChange={(v) => setAnnualRate(Math.round(v * 100) / 10000)}
          step={0.01}
          min={0}
          max={30}
          error={rateError}
        />
        <NumberField
          label="Liczba rat (miesięcy)"
          value={termMonths}
          onChange={setTermMonths}
          min={1}
          max={600}
          step={1}
          error={termError}
        />
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Data startu</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-slate-700">Typ raty</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={installmentType === 'EQUAL'}
              onChange={() => setInstallmentType('EQUAL')}
            />
            <span>Stała (annuitetowa)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={installmentType === 'DECREASING'}
              onChange={() => setInstallmentType('DECREASING')}
            />
            <span>Malejąca</span>
          </label>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-slate-700">
            Strategia nadpłat
          </legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={overpaymentStrategy === 'SHORTEN_TERM'}
              onChange={() => setOverpaymentStrategy('SHORTEN_TERM')}
            />
            <span>Skrócenie kredytu</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={overpaymentStrategy === 'LOWER_INSTALLMENT'}
              onChange={() => setOverpaymentStrategy('LOWER_INSTALLMENT')}
            />
            <span>Niższa rata</span>
          </label>
        </fieldset>

        <NumberField
          label="Nadpłata cykliczna (PLN/mies.)"
          value={recurringOverpayment}
          onChange={setRecurringOverpayment}
          min={0}
          step={100}
          error={overpayError}
        />
      </div>
    </div>
  )
}
