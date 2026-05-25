import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLoanStore } from '../store/loanStore'
import { useBonusAnalysis } from '../hooks/useBonusAnalysis'
import { useBaseRequest } from '../hooks/useLoanRequests'
import { BonusConfig } from '../components/BonusConfig'
import { BonusChart } from '../components/BonusChart'
import { BonusTable } from '../components/BonusTable'
import { formatPercent, formatPLN } from '../lib/format'

export function BonusAnalysis() {
  const principal = useLoanStore((s) => s.principal)
  const annualRate = useLoanStore((s) => s.annualRate)
  const termMonths = useLoanStore((s) => s.termMonths)
  const recurringOverpayment = useLoanStore((s) => s.recurringOverpayment)
  const cfg = useLoanStore((s) => s.bonusCfg)
  const setCfg = useLoanStore((s) => s.setBonusCfg)

  const baseReq = useBaseRequest()

  const analysisCfg = useMemo(
    () => ({
      base: baseReq,
      baseRecurring: recurringOverpayment,
      bonusFrom: cfg.bonusFrom,
      bonusTo: cfg.bonusTo,
      bonusStep: cfg.bonusStep,
      durationsMonths: cfg.durationsMonths,
      investmentRate: cfg.investmentRate,
    }),
    [baseReq, recurringOverpayment, cfg],
  )

  const { data, isLoading, error, scenarioCount } = useBonusAnalysis(analysisCfg)

  const tooManyScenarios = scenarioCount > 200

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border bg-slate-100 px-4 py-2 text-sm text-slate-700">
        Bazowy kredyt: <strong>{formatPLN(principal)}</strong> @ {formatPercent(annualRate)} /{' '}
        {termMonths} mies. · cykliczna nadpłata z kalkulatora:{' '}
        <strong>{formatPLN(recurringOverpayment)}/mies.</strong>{' '}
        (zmień w{' '}
        <Link to="/" className="underline">
          Kalkulatorze
        </Link>
        )
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">
          Bonus na start — czy „sprint" w pierwszych latach się opłaca?
        </h2>
        <p className="mb-3 text-sm text-slate-600">
          Każdy scenariusz zakłada cykliczną nadpłatę z Kalkulatora przez cały okres. Co jeśli{' '}
          <strong>dorzucisz dodatkowy bonus tylko przez pierwsze X miesięcy</strong>?
          Tabela i wykres pokazują: ile zaoszczędzisz odsetek, o ile skrócisz kredyt i jaki ROI
          ma każda dodatkowa złotówka bonusu — dla różnych okresów (1 rok, 2 lata, ...).
        </p>
        <details className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <summary className="cursor-pointer font-medium text-slate-800">
            💡 Jak to czytać? (metodologia)
          </summary>
          <div className="mt-3 space-y-3 text-slate-600">
            <div>
              <p className="font-semibold text-slate-800">Pojęcia</p>
              <ul className="ml-4 mt-1 list-disc space-y-1">
                <li>
                  <strong>Cykliczna baza</strong> — ile nadpłacasz co miesiąc przez cały kredyt.
                  Występuje w <em>każdej</em> ścieżce (i bazowej, i z bonusem), więc się znosi.
                </li>
                <li>
                  <strong>Bonus</strong> — dodatkowa kwota doliczana <em>tylko</em> przez pierwsze N miesięcy.
                  Przykład: baza 1000 + bonus 4000 przez rok = pierwsze 12 mies. nadpłacasz 5000, potem 1000.
                </li>
                <li>
                  <strong>ROI bonusu</strong> — odsetki zaoszczędzone / (bonus × miesiące). Powyżej 100% =
                  każda złotówka bonusu zwraca więcej niż 1 zł.
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-slate-800">
                Inwestycja vs Nadpłata — porównanie „equal cash flow"
              </p>
              <p className="mt-1">
                Punkt odniesienia: <strong>bonus PLN/mies przez N miesięcy</strong>. Te same
                pieniądze, ten sam moment ich wydania — pytanie tylko: do banku jako nadpłata,
                czy do brokerki jako inwestycja? Horyzont porównania = długość kredytu{' '}
                <em>z samą bazą, bez bonusu</em> (czyli moment, w którym kredyt by się skończył,
                gdybyś bonusu nie dorzucał).
              </p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <div className="rounded border border-slate-300 bg-white p-2">
                  <p className="font-semibold text-amber-700">A) Inwestujesz bonus</p>
                  <ul className="ml-3 list-disc space-y-0.5">
                    <li>bonus → brokerka, baza nadal idzie na nadpłatę</li>
                    <li>portfel rośnie aż do końca kredytu z samą bazą</li>
                    <li>kolumna pokazuje <em>zysk netto</em> po podatku Belki (19%)</li>
                  </ul>
                </div>
                <div className="rounded border border-slate-300 bg-white p-2">
                  <p className="font-semibold text-green-700">B) Nadpłacasz bonusem</p>
                  <ul className="ml-3 list-disc space-y-0.5">
                    <li>bonus + baza → nadpłata, kredyt kończy się o M mies. wcześniej</li>
                    <li>w tych M uwolnionych miesiącach reinwestujesz ratę (kol. <em>reinw.</em>)</li>
                    <li>łączna korzyść = zaoszczędzone odsetki + zysk z reinwestycji raty (po Belce)</li>
                  </ul>
                </div>
              </div>
              <p className="mt-2 text-xs">
                W obu ścieżkach co miesiąc wychodzi z portfela ta sama kwota
                (rata + baza + bonus), tylko bonus trafia w inne miejsce. Pomarańczowy (↑) =
                inwestycja wygrywa; szary (↓) = nadpłata wygrywa.
              </p>
            </div>
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
