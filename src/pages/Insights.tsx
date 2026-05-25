import { useMemo } from 'react'
import { useLoanStore } from '../store/loanStore'
import { useSchedule } from '../hooks/useSchedule'
import { useBaseRequest, useCurrentRequest } from '../hooks/useLoanRequests'
import { formatMonths, formatPLN } from '../lib/format'
import { computeSchedule } from '../lib/calc/mortgageCalculator'
import type { Schedule, ScheduleRow } from '../types/calc'
import { Charts } from '../components/Charts'
import { YearlyCostChart } from '../components/YearlyCostChart'
import { RateSensitivityChart, type RateSensitivityPoint } from '../components/RateSensitivityChart'
import { BalanceRaceChart } from '../components/BalanceRaceChart'
import { InterestShareChart } from '../components/InterestShareChart'

// Asymetryczny rozkład: gęściej blisko 0, żeby pokazać czułość przy małych zmianach stopy.
const RATE_DELTAS = [-0.02, -0.01, -0.005, 0, 0.005, 0.01, 0.02]

export function Insights() {
  const principal = useLoanStore((s) => s.principal)
  const annualRate = useLoanStore((s) => s.annualRate)
  const recurringOverpayment = useLoanStore((s) => s.recurringOverpayment)
  const customOverpayments = useLoanStore((s) => s.customOverpayments)
  const timeBands = useLoanStore((s) => s.timeBands)

  const baselineReq = useBaseRequest()
  const currentReq = useCurrentRequest()

  const { data: baseline } = useSchedule(baselineReq)
  const { data: current } = useSchedule(currentReq)

  const hasOverpayments =
    recurringOverpayment > 0 ||
    Object.keys(customOverpayments).length > 0 ||
    timeBands.length > 0

  const baselineSensitivity = useMemo<RateSensitivityPoint[]>(() => {
    if (!baseline) return []
    return RATE_DELTAS
      .map((d) => {
        const rate = annualRate + d
        if (rate <= 0) return null
        const s = computeSchedule({ ...baselineReq, annualRate: rate })
        return {
          label: d === 0 ? 'Teraz' : `${d > 0 ? '+' : ''}${(d * 100).toFixed(1)}%`,
          totalInterest: s.summary.totalInterest,
          isCurrent: d === 0,
        }
      })
      .filter((p): p is RateSensitivityPoint => p !== null)
  }, [baseline, annualRate, baselineReq])

  const currentSensitivity = useMemo<RateSensitivityPoint[]>(() => {
    if (!current || !hasOverpayments) return []
    return RATE_DELTAS
      .map((d) => {
        const rate = annualRate + d
        if (rate <= 0) return null
        const s = computeSchedule({ ...currentReq, annualRate: rate })
        return {
          label: d === 0 ? 'Teraz' : `${d > 0 ? '+' : ''}${(d * 100).toFixed(1)}%`,
          totalInterest: s.summary.totalInterest,
          isCurrent: d === 0,
        }
      })
      .filter((p): p is RateSensitivityPoint => p !== null)
  }, [current, hasOverpayments, annualRate, currentReq])

  if (!baseline) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-slate-500">Sprawdź parametry kredytu — brak danych.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-12">
      {hasOverpayments && current && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold">Wyścig spłaty</h2>
          <p className="mb-4 text-sm text-slate-500">
            Saldo kredytu rok po roku — bez nadpłat (czerwony) vs z nadpłatami (zielony).
            Im większa zielona przestrzeń między krzywymi, tym więcej zaoszczędzasz.
          </p>
          <BalanceRaceChart
            baselineRows={baseline.rows}
            currentRows={current.rows}
            principal={principal}
          />
        </div>
      )}

      <InsightPanel
        title="Bez nadpłat"
        subtitle="Harmonogram bazowy — tylko rata, żadnych nadpłat"
        data={baseline}
        annualRate={annualRate}
        principal={principal}
        sensitivityPoints={baselineSensitivity}
      />
      {hasOverpayments && current && (
        <>
          <hr className="border-slate-200" />
          <InsightPanel
            title="Z nadpłatami z kalkulatora"
            subtitle="Harmonogram z nadpłatami ustawionymi w Kalkulatorze"
            data={current}
            annualRate={annualRate}
            principal={principal}
            sensitivityPoints={currentSensitivity}
          />
        </>
      )}
    </div>
  )
}

interface InsightPanelProps {
  title: string
  subtitle: string
  data: Schedule
  annualRate: number
  principal: number
  sensitivityPoints: RateSensitivityPoint[]
}

function InsightPanel({ title, subtitle, data, annualRate, principal, sensitivityPoints }: InsightPanelProps) {
  const s = data.summary
  const rows = data.rows

  const crossoverMonth = rows.find((r: ScheduleRow) => r.principalPart > r.interestPart)?.month ?? null
  const dailyCost = s.months > 0 ? s.totalPaid / (s.months * 30.44) : 0
  const perHundred = ((s.totalPaid / principal) * 100).toFixed(0)
  const firstYearInterest = rows.slice(0, 12).reduce((acc: number, r: ScheduleRow) => acc + r.interestPart, 0)
  const firstYearInterestPct = s.totalInterest > 0 ? ((firstYearInterest / s.totalInterest) * 100).toFixed(1) : '0.0'
  const interestRatio = ((s.totalInterest / principal) * 100).toFixed(0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Całkowity koszt"
          value={formatPLN(s.totalPaid)}
          sub="kapitał + odsetki"
          accent
        />
        <StatCard
          label="Łączne odsetki"
          value={formatPLN(s.totalInterest)}
          sub={`${interestRatio}% pożyczonej kwoty`}
        />
        <StatCard
          label="Punkt przełomowy"
          value={crossoverMonth ? `${crossoverMonth}. miesiąc` : '—'}
          sub={crossoverMonth ? formatMonths(crossoverMonth) : ''}
        />
        <StatCard
          label="Dzienny koszt"
          value={formatPLN(dailyCost)}
          sub="średni koszt kredytu na dobę"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FactCard
          emoji="💸"
          title={`Za każde pożyczone 100 zł oddajesz ${perHundred} zł`}
          desc={`Całkowity koszt jest o ${((s.totalPaid / principal - 1) * 100).toFixed(0)}% wyższy niż pożyczona kwota.`}
        />
        <FactCard
          emoji="📅"
          title={`Pierwsze 12 miesięcy to ${firstYearInterestPct}% wszystkich odsetek`}
          desc={`W pierwszym roku płacisz ${formatPLN(firstYearInterest)} samych odsetek. Na początku kredyt jest najdroższy.`}
        />
        <FactCard
          emoji="📉"
          title={
            crossoverMonth
              ? `Dopiero w ${crossoverMonth}. miesiącu kapitał przebija odsetki`
              : 'Brak danych o punkcie przełomowym'
          }
          desc={
            crossoverMonth
              ? `Przez pierwsze ${formatMonths(crossoverMonth)} większość raty to odsetki. Potem zaczyna dominować spłata kapitału.`
              : ''
          }
        />
      </div>

      <Charts rows={rows} annualRate={annualRate} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-base font-semibold">Roczny koszt kredytu</h3>
          <p className="mb-4 text-sm text-slate-500">
            Ile płacisz łącznie w każdym roku — kapitał, odsetki
            {s.totalOverpayment > 0 ? ' i nadpłaty' : ''}.
          </p>
          <YearlyCostChart rows={rows} />
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-base font-semibold">Wrażliwość na zmianę stopy</h3>
          <p className="mb-4 text-sm text-slate-500">
            Jak suma odsetek zmienia się przy innych oprocentowaniach. Aktualny poziom zaznaczony
            na niebiesko.
          </p>
          <RateSensitivityChart points={sensitivityPoints} />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-base font-semibold">Udział odsetek vs kapitału w racie</h3>
        <p className="mb-4 text-sm text-slate-500">
          Jak zmienia się proporcja odsetek do kapitału rok po roku. Na początku większość raty to
          koszt — z czasem coraz więcej idzie na spłatę długu. Linia przerywana to punkt przełomowy.
        </p>
        <InterestShareChart rows={rows} crossoverMonth={crossoverMonth} />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string
  value: string
  sub: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-5 shadow-sm ${accent ? 'border-t-4 border-t-cyan-500' : ''}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${accent ? 'text-cyan-700' : 'text-slate-900'}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

function FactCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-5">
      <div className="mb-2 text-2xl">{emoji}</div>
      <p className="text-sm font-semibold text-cyan-900">{title}</p>
      {desc && <p className="mt-1 text-xs leading-relaxed text-cyan-700">{desc}</p>}
    </div>
  )
}
