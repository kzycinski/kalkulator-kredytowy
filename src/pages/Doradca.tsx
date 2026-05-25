import { useMemo, useState } from 'react'
import { useLoanStore } from '../store/loanStore'
import { useDoradca } from '../hooks/useDoradca'
import { DoradcaConfig, type DoradcaConfigValue } from '../components/DoradcaConfig'
import { DoradcaTable } from '../components/DoradcaTable'
import { formatMonths, formatPLN } from '../lib/format'
import type { ScheduleRequest } from '../types/calc'

export function Doradca() {
  const principal = useLoanStore((s) => s.principal)
  const annualRate = useLoanStore((s) => s.annualRate)
  const termMonths = useLoanStore((s) => s.termMonths)
  const startDate = useLoanStore((s) => s.startDate)
  const installmentType = useLoanStore((s) => s.installmentType)
  const overpaymentStrategy = useLoanStore((s) => s.overpaymentStrategy)
  const recurringFromStore = useLoanStore((s) => s.recurringOverpayment)

  const [cfg, setCfg] = useState<DoradcaConfigValue>({
    comfortable: recurringFromStore || 1000,
    max: 5000,
    hasTarget: false,
    targetYears: 15,
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
      comfortable: cfg.comfortable,
      max: cfg.max,
      targetMonths: cfg.hasTarget ? cfg.targetYears * 12 : undefined,
    }),
    [baseReq, cfg],
  )

  const { data, isLoading, error, scenarioCount } = useDoradca(analysisCfg)

  const tooMany = scenarioCount > 200

  const bestCostStrategy = data?.strategies.find((s) => s.key === data.bestByCost)
  const bestROIStrategy = data?.strategies.find((s) => s.key === data.bestByROI)
  const bestTargetStrategy = data?.strategies.find((s) => s.key === data.bestHittingTarget)

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border bg-slate-100 px-4 py-2 text-sm text-slate-700">
        Bazowy kredyt: <strong>{formatPLN(principal)}</strong> @{' '}
        {(annualRate * 100).toFixed(2)}% / {termMonths} mies. (zmień w{' '}
        <a href="/" className="underline">
          Kalkulatorze
        </a>
        )
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">
          Doradca — co mi się najbardziej opłaca?
        </h2>
        <p className="mb-3 text-sm text-slate-600">
          Podaj{' '}
          <strong>komfortową</strong> nadpłatę (tyle dasz radę dorzucać na bieżąco) i{' '}
          <strong>max</strong> (limit, przy którym zaciśniesz pasa). Doradca pokaże{' '}
          różne kombinacje: <em>sam komfort cały czas</em>, <em>sprint maxem przez X miesięcy</em>,
          <em> schodek (max → 50% max → komfort)</em>. Możesz też dać cel — ile lat chcesz spłacać —
          a algorytm znajdzie strategie, które dowiozą cel przy Twoich limitach.
        </p>
        <details className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <summary className="cursor-pointer font-medium text-slate-800">
            💡 Jak czytać wyniki?
          </summary>
          <div className="mt-2 space-y-2 text-slate-600">
            <p>
              <strong>Łącznie</strong> = ile <em>realnie</em> wyjmiesz z portfela: kapitał + odsetki
              + nadpłaty. To jest <em>całość kosztu</em> kredytu z Twoimi nadpłatami.
            </p>
            <p>
              <strong>Suma nadpłat</strong> ≠ stracony kapitał. Każda złotówka nadpłaty spłaca
              kapitał, więc bez niej i tak by ją oddał — różnica idzie w mniejsze odsetki.
            </p>
            <p>
              <strong>🏆 Najtaniej</strong> — najmniejsze „Łącznie zapłacisz".{' '}
              <strong>⚡ Najlepsze ROI</strong> — każda złotówka nadpłaty zwraca najwięcej odsetek.
              Często ROI jest najlepszy dla „lekkich" strategii (np. tylko komfort), a najtaniej dla
              „ciężkich" (max cały czas) — to klasyczny trade-off między wysiłkiem a oszczędnością.
            </p>
          </div>
        </details>

        <DoradcaConfig value={cfg} onChange={setCfg} />

        <p className="mt-3 text-xs text-slate-500">
          Liczba scenariuszy: <strong>{scenarioCount}</strong>
          {tooMany && (
            <span className="ml-2 text-red-600">⚠ Powyżej 200, ograniczam grid.</span>
          )}
        </p>

        {error && <p className="mt-4 text-sm text-red-600">Błąd: {error.message}</p>}
        {isLoading && !data && <p className="mt-4 text-slate-500">Liczenie...</p>}

        {data && (
          <div className="mt-6 flex flex-col gap-6">
            {bestCostStrategy && (
              <div className="rounded-lg border border-green-300 bg-green-50 p-4">
                <h3 className="mb-1 text-base font-semibold text-green-900">
                  🏆 Najtaniej w eksploracji
                </h3>
                <p className="text-sm text-green-900">
                  <strong>{bestCostStrategy.name}</strong> — zapłacisz łącznie{' '}
                  <strong>{formatPLN(bestCostStrategy.totalPaid)}</strong>, czyli o{' '}
                  <strong>{formatPLN(data.baselineTotalPaid - bestCostStrategy.totalPaid)}</strong>{' '}
                  mniej niż bez nadpłat. Kredyt skończy się po{' '}
                  <strong>{formatMonths(bestCostStrategy.months)}</strong>.
                </p>
              </div>
            )}
            {bestROIStrategy && bestROIStrategy.key !== bestCostStrategy?.key && (
              <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
                <h3 className="mb-1 text-base font-semibold text-blue-900">
                  ⚡ Najlepsze ROI nadpłat
                </h3>
                <p className="text-sm text-blue-900">
                  <strong>{bestROIStrategy.name}</strong> — każdy 1 PLN nadpłaty zwraca{' '}
                  <strong>
                    {(
                      (bestROIStrategy.interestSaved /
                        Math.max(bestROIStrategy.totalOverpayment, 1)) *
                      100
                    ).toFixed(0)}
                    %
                  </strong>{' '}
                  oszczędności odsetek. Mniej wysiłku, dobry zwrot.
                </p>
              </div>
            )}
            {bestTargetStrategy && (
              <div className="rounded-lg border border-purple-300 bg-purple-50 p-4">
                <h3 className="mb-1 text-base font-semibold text-purple-900">
                  🎯 Najtańsza strategia osiągająca cel
                </h3>
                <p className="text-sm text-purple-900">
                  <strong>{bestTargetStrategy.name}</strong> — kredyt skończy się po{' '}
                  <strong>{formatMonths(bestTargetStrategy.months)}</strong>, łącznie zapłacisz{' '}
                  <strong>{formatPLN(bestTargetStrategy.totalPaid)}</strong>.
                </p>
              </div>
            )}

            <DoradcaTable result={data} showTargetCol={cfg.hasTarget} />
          </div>
        )}
      </div>
    </div>
  )
}
