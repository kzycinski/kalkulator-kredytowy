import { useMemo, useState } from 'react'
import { useLoanStore } from '../store/loanStore'
import { useBonusAnalysis } from '../hooks/useBonusAnalysis'
import { BonusConfig, type BonusConfigValue } from '../components/BonusConfig'
import { BonusChart } from '../components/BonusChart'
import { BonusTable } from '../components/BonusTable'
import { formatPLN } from '../lib/format'
import type { ScheduleRequest } from '../types/calc'

export function BonusAnalysis() {
  const principal = useLoanStore((s) => s.principal)
  const annualRate = useLoanStore((s) => s.annualRate)
  const termMonths = useLoanStore((s) => s.termMonths)
  const startDate = useLoanStore((s) => s.startDate)
  const installmentType = useLoanStore((s) => s.installmentType)
  const overpaymentStrategy = useLoanStore((s) => s.overpaymentStrategy)
  const recurringFromStore = useLoanStore((s) => s.recurringOverpayment)

  const [cfg, setCfg] = useState<BonusConfigValue>({
    baseRecurring: recurringFromStore || 1000,
    bonusFrom: 0,
    bonusTo: 5000,
    bonusStep: 500,
    durationsMonths: [12, 24, 36, 60],
  })

  const baseReq = useMemo<ScheduleRequest>(
    () => ({
      principal,
      annualRate,
      termMonths,
      startDate,
      installmentType,
      overpaymentStrategy,
      recurringOverpayment: 0,
      customOverpayments: {},
      timeBands: [],
    }),
    [principal, annualRate, termMonths, startDate, installmentType, overpaymentStrategy],
  )

  const analysisCfg = useMemo(
    () => ({
      base: baseReq,
      baseRecurring: cfg.baseRecurring,
      bonusFrom: cfg.bonusFrom,
      bonusTo: cfg.bonusTo,
      bonusStep: cfg.bonusStep,
      durationsMonths: cfg.durationsMonths,
    }),
    [baseReq, cfg],
  )

  const { data, isLoading, error, scenarioCount } = useBonusAnalysis(analysisCfg)

  const tooManyScenarios = scenarioCount > 200

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border bg-slate-100 px-4 py-2 text-sm text-slate-700">
        Bazowy kredyt: <strong>{formatPLN(principal)}</strong> @ {(annualRate * 100).toFixed(2)}% /{' '}
        {termMonths} mies. (zmień w{' '}
        <a href="/" className="underline">
          Kalkulatorze
        </a>
        )
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">
          Bonus na start — czy „sprint" w pierwszych latach się opłaca?
        </h2>
        <p className="mb-3 text-sm text-slate-600">
          Załóżmy że płacisz cykliczną bazę co miesiąc (np. 1000 PLN). Co jeśli{' '}
          <strong>dorzucisz dodatkowy bonus tylko przez pierwsze X miesięcy</strong>?
          Tabela i wykres pokazują: ile zaoszczędzisz odsetek, o ile skrócisz kredyt i jaki ROI
          ma każda dodatkowa złotówka bonusu — dla różnych okresów (1 rok, 2 lata, ...).
        </p>
        <details className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <summary className="cursor-pointer font-medium text-slate-800">
            💡 Jak to czytać?
          </summary>
          <div className="mt-2 space-y-2 text-slate-600">
            <p>
              <strong>Cykliczna baza</strong> = ile nadpłacasz co miesiąc przez cały okres kredytu.
              Wszystkie scenariusze ją zachowują.
            </p>
            <p>
              <strong>Bonus</strong> = dodatkowa kwota doliczana tylko w pierwszych N miesiącach.
              Np. baza 1000 + bonus 4000 przez 1 rok = przez pierwsze 12 mies. nadpłacasz 5000
              miesięcznie, potem 1000.
            </p>
            <p>
              <strong>ROI bonusu</strong> = oszczędność odsetek / (bonus × miesiące).
              Wskazuje czy każdy zł bonusu jest efektywny. Powyżej 100% = każdy zł bonusu zwraca
              więcej niż 1 zł oszczędności.
            </p>
          </div>
        </details>
        <BonusConfig value={cfg} onChange={setCfg} />
        <p className="mt-3 text-xs text-slate-500">
          Liczba scenariuszy do policzenia:{' '}
          <strong>{scenarioCount}</strong>
          {tooManyScenarios && (
            <span className="ml-2 text-red-600">
              ⚠ Powyżej 200 — zmniejsz zakres albo zwiększ krok.
            </span>
          )}
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-600">Błąd: {error.message}</p>
        )}
        {isLoading && !data && <p className="mt-4 text-slate-500">Liczenie...</p>}

        <div className="mt-6">
          <BonusChart result={data} />
        </div>
        <div className="mt-4">
          <BonusTable result={data} />
        </div>
      </div>
    </div>
  )
}
