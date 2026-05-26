import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLoanStore } from '../store/loanStore'
import { useAdvisor } from '../hooks/useAdvisor'
import { useBaseRequest } from '../hooks/useLoanRequests'
import { AdvisorConfig } from '../components/AdvisorConfig'
import { AdvisorTable } from '../components/AdvisorTable'
import { formatMonths, formatPercent, formatPLN } from '../lib/format'

export function Advisor() {
  const principal = useLoanStore((s) => s.principal)
  const annualRate = useLoanStore((s) => s.annualRate)
  const termMonths = useLoanStore((s) => s.termMonths)
  const cfg = useLoanStore((s) => s.advisorCfg)
  const setCfg = useLoanStore((s) => s.setAdvisorCfg)

  const baseReq = useBaseRequest()

  const targetMonths = cfg.hasTarget ? cfg.targetYears * 12 : null
  const analysisCfg = useMemo(
    () => ({
      base: baseReq,
      comfortable: cfg.comfortable,
      max: cfg.max,
      targetMonths: targetMonths ?? undefined,
      investmentRate: cfg.investmentRate,
    }),
    [baseReq, cfg, targetMonths],
  )

  const { data, isLoading, error, scenarioCount } = useAdvisor(analysisCfg)

  const tooMany = scenarioCount > 200

  const bestCostStrategy = data?.strategies.find((s) => s.key === data.bestByCost)
  const bestAbsoluteCostStrategy = data?.strategies.find((s) => s.key === data.bestByAbsoluteCost)
  const bestROIStrategy = data?.strategies.find((s) => s.key === data.bestByROI)
  const bestTargetStrategy = data?.strategies.find((s) => s.key === data.bestHittingTarget)

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border bg-slate-100 px-4 py-2 text-sm text-slate-700">
        Bazowy kredyt: <strong>{formatPLN(principal)}</strong> @{' '}
        {formatPercent(annualRate)} / {termMonths} mies. (zmień w{' '}
        <Link to="/" className="underline">
          Kalkulatorze
        </Link>
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
          <em> schodek (max → połowa dystansu → komfort)</em>. Możesz też dać cel — ile lat chcesz spłacać —
          a algorytm znajdzie strategie, które dowiozą cel przy Twoich limitach.
        </p>
        <details className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <summary className="cursor-pointer font-medium text-slate-800">
            💡 Jak czytać wyniki?
          </summary>
          <div className="mt-3 space-y-3 text-slate-600">
            <div>
              <p className="font-semibold text-slate-800">Koszty kredytu</p>
              <ul className="ml-4 mt-1 list-disc space-y-1">
                <li>
                  <strong>Łącznie</strong> — ile <em>realnie</em> wyjmiesz z portfela: kapitał +
                  odsetki + nadpłaty. Całość kosztu kredytu w tej strategii.
                </li>
                <li>
                  <strong>Suma nadpłat</strong> ≠ stracony kapitał. Każda złotówka nadpłaty spłaca
                  kapitał — bez niej i tak musiałbyś go oddać. Różnica idzie w mniejsze odsetki.
                </li>
                <li>
                  <strong>🏆 Najtaniej</strong> — najmniejsze „Łącznie zapłacisz".{' '}
                  <strong>⚡ Najlepsze ROI</strong> — każda złotówka nadpłaty zwraca najwięcej
                  odsetek. Klasyczny trade-off: ROI często wygrywają „lekkie" strategie, najtaniej
                  zazwyczaj „ciężkie" (max przez cały czas).
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-slate-800">
                Inwestycja vs Nadpłata — porównanie „equal cash flow"
              </p>
              <p className="mt-1">
                Punkt odniesienia: <strong>te same kwoty, w tych samych miesiącach</strong>, co
                w strategii nadpłaty — tylko zamiast do banku idą do brokerki. Horyzont = długość{' '}
                <em>kredytu bez nadpłat</em> (czyli moment, w którym i tak musiałbyś go spłacić).
              </p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <div className="rounded border border-slate-300 bg-white p-2">
                  <p className="font-semibold text-amber-700">A) Inwestujesz nadpłatę</p>
                  <ul className="ml-3 list-disc space-y-0.5">
                    <li>kredyt biegnie pełną długością; ratę płacisz dalej</li>
                    <li>nadpłatę (każdą złotówkę z każdego miesiąca) wkładasz do brokerki</li>
                    <li>portfel rośnie do końca pierwotnego kredytu</li>
                    <li>kolumna „zysk" = wynik netto po Belce (19%)</li>
                  </ul>
                </div>
                <div className="rounded border border-slate-300 bg-white p-2">
                  <p className="font-semibold text-green-700">B) Nadpłacasz (oddajesz bankowi)</p>
                  <ul className="ml-3 list-disc space-y-0.5">
                    <li>nadpłata + rata → kredyt kończy się o M mies. wcześniej</li>
                    <li>oszczędzasz odsetki (kolumna „Oszczędność")</li>
                    <li>uwolnioną ratę reinwestujesz przez M mies. (po Belce)</li>
                    <li>korzyść = zaoszczędzone odsetki + zysk z reinwestycji</li>
                  </ul>
                </div>
              </div>
              <p className="mt-2 text-xs">
                W obu ścieżkach co miesiąc wychodzi z portfela ta sama kwota (rata + nadpłata),
                tylko nadpłata trafia w inne miejsce. <strong>📈 Lepiej inwestować</strong> = zysk
                inwestycji przewyższa pełną korzyść nadpłaty (odsetki + reinwestycja). Dla
                strategii zmiennych (sprint, schodek) liczymy <em>faktyczny</em> cash flow miesiąc
                po miesiącu — wcześniejsze wpłaty mają więcej czasu na kapitalizację.
              </p>
            </div>
          </div>
        </details>

        <AdvisorConfig value={cfg} onChange={setCfg} />

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
            {data.strategies.length === 0 && (
              <p className="text-sm text-slate-500">
                Ustaw kwotę nadpłaty komfortowej lub max, aby zobaczyć rekomendacje.
              </p>
            )}
            {bestAbsoluteCostStrategy && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
                <h3 className="mb-1 text-base font-semibold text-emerald-900">
                  💰 Najtaniej łącznie
                </h3>
                <p className="text-sm text-emerald-900">
                  <strong>{bestAbsoluteCostStrategy.name}</strong> — najmniejsza suma wszystkiego
                  co wyjmiesz z portfela. Zapłacisz łącznie{' '}
                  <strong>{formatPLN(bestAbsoluteCostStrategy.totalPaid)}</strong> (o{' '}
                  <strong>{formatPLN(data.baselineTotalPaid - bestAbsoluteCostStrategy.totalPaid)}</strong>{' '}
                  mniej niż bez nadpłat), kredyt trwa{' '}
                  <strong>{formatMonths(bestAbsoluteCostStrategy.months)}</strong>.
                </p>
              </div>
            )}
            {bestCostStrategy && bestCostStrategy.key !== bestAbsoluteCostStrategy?.key && (
              <div className="rounded-lg border border-green-300 bg-green-50 p-4">
                <h3 className="mb-1 text-base font-semibold text-green-900">
                  🏆 Optymalny balans
                </h3>
                <p className="text-sm text-green-900">
                  <strong>{bestCostStrategy.name}</strong> — sweet spot między wysiłkiem a
                  oszczędnością. Zapłacisz łącznie{' '}
                  <strong>{formatPLN(bestCostStrategy.totalPaid)}</strong> (o{' '}
                  <strong>{formatPLN(data.baselineTotalPaid - bestCostStrategy.totalPaid)}</strong>{' '}
                  mniej niż bez nadpłat), kredyt trwa{' '}
                  <strong>{formatMonths(bestCostStrategy.months)}</strong>. Dalsze zwiększanie nadpłaty
                  przynosi już proporcjonalnie mniej.
                </p>
              </div>
            )}
            {bestROIStrategy && bestROIStrategy.key !== bestAbsoluteCostStrategy?.key && bestROIStrategy.key !== bestCostStrategy?.key && (
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
                  🎯 Najlepsza strategia osiągająca cel
                </h3>
                <p className="text-sm text-purple-900">
                  <strong>{bestTargetStrategy.name}</strong> — najlepsze ROI spośród strategii
                  trafiających w cel. Każdy 1 PLN nadpłaty zwraca{' '}
                  <strong>
                    {(
                      (bestTargetStrategy.interestSaved /
                        Math.max(bestTargetStrategy.totalOverpayment, 1)) *
                      100
                    ).toFixed(0)}
                    %
                  </strong>{' '}
                  oszczędności odsetek. Kredyt skończy się po{' '}
                  <strong>{formatMonths(bestTargetStrategy.months)}</strong>, łącznie zapłacisz{' '}
                  <strong>{formatPLN(bestTargetStrategy.totalPaid)}</strong>.
                </p>
              </div>
            )}

            <AdvisorTable result={data} showTargetCol={cfg.hasTarget} targetMonths={targetMonths} />
          </div>
        )}
      </div>
    </div>
  )
}
