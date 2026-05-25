import { useMemo, useState } from 'react'
import { useLoanStore } from '../store/loanStore'
import { useCompareSweep } from '../hooks/useCompareSweep'
import { useCompareScenarios } from '../hooks/useCompareScenarios'
import { SweepConfig, type SweepConfigValue } from '../components/SweepConfig'
import { SweepChart } from '../components/SweepChart'
import { SweetSpotCard } from '../components/SweetSpotCard'
import { ScenariosBuilder } from '../components/ScenariosBuilder'
import { toScenarioSpec, type UIScenario } from '../lib/scenarioModel'
import { ScenariosBarChart } from '../components/ScenariosBarChart'
import { ScenariosTable } from '../components/ScenariosTable'
import { formatPLN } from '../lib/format'
import type { ScheduleRequest } from '../types/calc'

const DEFAULT_SCENARIOS: UIScenario[] = [
  { name: 'Bez nadpłat', recurring: 0, bonus: null },
  { name: '500/mies', recurring: 500, bonus: null },
  { name: '1000/mies', recurring: 1000, bonus: null },
  {
    name: '500/mies + 1000 przez 1. rok',
    recurring: 500,
    bonus: { duration: 'first-year', amount: 1000 },
  },
  {
    name: '500/mies + 500 przez 2 lata',
    recurring: 500,
    bonus: { duration: 'first-two-years', amount: 500 },
  },
]

export function Compare() {
  const principal = useLoanStore((s) => s.principal)
  const annualRate = useLoanStore((s) => s.annualRate)
  const termMonths = useLoanStore((s) => s.termMonths)
  const startDate = useLoanStore((s) => s.startDate)
  const installmentType = useLoanStore((s) => s.installmentType)
  const overpaymentStrategy = useLoanStore((s) => s.overpaymentStrategy)

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

  const [sweepCfg, setSweepCfg] = useState<SweepConfigValue>({
    from: 0,
    to: 5000,
    step: 250,
    threshold: 0.5,
  })
  const sweepReq = useMemo(
    () => ({
      base: baseReq,
      sweep: { from: sweepCfg.from, to: sweepCfg.to, step: sweepCfg.step },
      sweetSpotThreshold: sweepCfg.threshold,
    }),
    [baseReq, sweepCfg],
  )
  const { data: sweep, isLoading: sweepLoading, error: sweepError } = useCompareSweep(sweepReq)

  const [scenarios, setScenarios] = useState<UIScenario[]>(DEFAULT_SCENARIOS)
  const scenariosReq = useMemo(
    () => ({
      base: baseReq,
      scenarios: scenarios.map(toScenarioSpec),
    }),
    [baseReq, scenarios],
  )
  const {
    data: scenariosResult,
    isLoading: scenariosLoading,
    error: scenariosError,
  } = useCompareScenarios(scenariosReq)

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
        <h2 className="mb-2 text-lg font-semibold">Sweep — znajdź sweet spot nadpłat</h2>
        <p className="mb-3 text-sm text-slate-600">
          Skanujemy zakres nadpłat i pokazujemy oszczędność odsetek, skrócenie kredytu i marginalną
          oszczędność z każdego kolejnego kroku. Sweet spot to ostatni poziom nadpłaty, gdzie
          marginalna oszczędność jest jeszcze powyżej progu.
        </p>
        <details className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <summary className="cursor-pointer font-medium text-slate-800">
            💡 Co to jest „marginalna oszczędność"?
          </summary>
          <div className="mt-2 space-y-2 text-slate-600">
            <p>
              To <strong>różnica w oszczędności odsetek między dwoma sąsiednimi punktami sweepu</strong>
              — czyli o ile więcej zaoszczędzisz odsetek, gdy zwiększysz nadpłatę o kolejny krok
              (np. z 500 PLN na 750 PLN).
            </p>
            <p>
              Przykład dla sweep 0–5000 step 250:
              <br />
              jeśli przy nadpłacie 500 PLN/mies. oszczędzisz 266 000 PLN odsetek, a przy 750 PLN —
              290 000 PLN, to{' '}
              <strong>marginalna oszczędność w punkcie 500 = 24 000 PLN</strong> (tyle dorzucasz
              dodając kolejne 250 PLN do nadpłaty).
            </p>
            <p>
              <strong>Wysoka</strong> — kolejna złotówka nadpłaty wciąż mocno się opłaca.{' '}
              <strong>Niska</strong> — diminishing returns, czyli kolejne nadpłaty przynoszą coraz
              mniej. Sweet spot wskazuje moment, w którym marginalna oszczędność zaczyna spadać
              znacząco — to znak, że dalsze zwiększanie nadpłaty daje proporcjonalnie mniej.
            </p>
          </div>
        </details>
        <details className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <summary className="cursor-pointer font-medium text-slate-800">
            💡 Co to jest „próg sweet spot"?
          </summary>
          <div className="mt-2 space-y-2 text-slate-600">
            <p>
              Liczba między 0 a 1 (domyślnie 0.5) która decyduje{' '}
              <strong>jak agresywnie szukamy sweet spotu</strong>. Algorytm bierze maksymalną
              marginalną oszczędność z całego sweepu i mnoży przez próg — to jest „cutoff".
              Sweet spot to ostatni punkt w sweepie, gdzie marginalna oszczędność wciąż jest powyżej
              tego cutoffu.
            </p>
            <p>
              Przykład: max marginalna oszczędność w sweepie = 80 000 PLN.
              <br />
              Próg <strong>0.5</strong> → cutoff = 40 000 PLN. Sweet spot to ostatni poziom nadpłaty,
              gdzie kolejny krok jeszcze przynosi ≥ 40 000 PLN.
              <br />
              Próg <strong>0.7</strong> → cutoff = 56 000 PLN. Bardziej restrykcyjnie — sweet spot
              przesunie się wcześniej (mniejsza nadpłata zostanie polecona).
            </p>
            <p>
              <strong>Niższy próg</strong> (np. 0.3) — bardziej tolerancyjny, sweet spot pójdzie dalej,
              dostajesz wyższą rekomendowaną nadpłatę.{' '}
              <strong>Wyższy próg</strong> (np. 0.7) — wymagamy żeby kolejny krok dawał wciąż 70%
              tego co najlepszy w całym sweepie, sweet spot będzie wcześniej.
            </p>
          </div>
        </details>
        <SweepConfig value={sweepCfg} onChange={setSweepCfg} />
        <div className="mt-4">
          {sweepError && <p className="text-sm text-red-600">Błąd: {sweepError.message}</p>}
          {sweep && (
            <SweetSpotCard sweetSpot={sweep.sweetSpot} baselineMonths={sweep.baselineMonths} />
          )}
          {sweepLoading && !sweep && <p className="text-slate-500">Liczenie sweep...</p>}
        </div>
        <div className="mt-4">
          <SweepChart result={sweep} />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Porównanie scenariuszy</h2>
        <p className="mb-4 text-sm text-slate-600">
          Każdy scenariusz to <strong>cykliczna nadpłata</strong> z opcjonalnym{' '}
          <strong>bonusem</strong> doliczanym na wierzch w pierwszych 12 lub 24 miesiącach.
        </p>
        <ScenariosBuilder scenarios={scenarios} onChange={setScenarios} />
        {scenariosError && (
          <p className="mt-4 text-sm text-red-600">Błąd: {scenariosError.message}</p>
        )}
        {scenariosLoading && !scenariosResult && (
          <p className="mt-4 text-slate-500">Liczenie scenariuszy...</p>
        )}
        <div className="mt-6">
          <ScenariosBarChart result={scenariosResult} />
        </div>
        <div className="mt-4">
          <ScenariosTable result={scenariosResult} />
        </div>
      </div>
    </div>
  )
}
