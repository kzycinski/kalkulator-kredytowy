import type { DoradcaResult, DoradcaStrategy } from '../hooks/useDoradca'
import { formatMonths, formatPLN } from '../lib/format'

export function DoradcaTable({
  result,
  showTargetCol,
}: {
  result: DoradcaResult
  showTargetCol: boolean
}) {
  const strategies = result.strategies
  if (strategies.length === 0) return null

  const exploration = strategies.filter((s) => s.category !== 'target')
  const targetGroup = strategies.filter((s) => s.category === 'target' && s.hitsTarget)

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <strong>Bez nadpłat (baza):</strong> kredyt zakończy się po{' '}
        <strong>
          {result.baselineMonths} mies. ({formatMonths(result.baselineMonths)})
        </strong>
        . Łącznie zapłacisz <strong>{formatPLN(result.baselineTotalPaid)}</strong>, w tym{' '}
        <strong>{formatPLN(result.baselineInterest)}</strong> odsetek.
      </div>

      <StrategyTable
        title="Eksploracja strategii"
        rows={exploration}
        bestByCost={result.bestByCost}
        bestByROI={result.bestByROI}
        showTargetCol={showTargetCol}
      />

      {showTargetCol && (
        <StrategyTable
          title={`Strategie osiągające cel (≤ ${result.strategies.find((s) => s.hitsTarget)?.months ?? '—'} mies.)`}
          rows={targetGroup}
          bestByCost={result.bestHittingTarget}
          bestByROI={null}
          showTargetCol={false}
          emptyHint="Żadna z kandydatów nie osiąga celu w granicy max nadpłaty. Zwiększ max albo wydłuż cel."
        />
      )}
    </div>
  )
}

function StrategyTable({
  title,
  rows,
  bestByCost,
  bestByROI,
  showTargetCol,
  emptyHint,
}: {
  title: string
  rows: DoradcaStrategy[]
  bestByCost: string | null
  bestByROI: string | null
  showTargetCol: boolean
  emptyHint?: string
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-700">{title}</h3>
      {rows.length === 0 && emptyHint && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {emptyHint}
        </p>
      )}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-300">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr className="border-b-2 border-slate-300 text-left text-slate-700">
                <th className="px-3 py-2">Strategia</th>
                <th className="px-3 py-2 text-right">Czas</th>
                <th className="px-3 py-2 text-right">Łącznie</th>
                <th className="px-3 py-2 text-right">Odsetki</th>
                <th className="px-3 py-2 text-right">Suma nadpłat</th>
                <th className="px-3 py-2 text-right">Oszczędność</th>
                <th className="px-3 py-2 text-right">Skrócenie</th>
                <th className="px-3 py-2 text-right">Avg/mc</th>
                {showTargetCol && <th className="px-3 py-2 text-right">Cel?</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const isBestCost = s.key === bestByCost
                const isBestROI = s.key === bestByROI
                const rowClass =
                  isBestCost || isBestROI
                    ? 'border-b border-slate-200 last:border-0 bg-green-50/70'
                    : 'border-b border-slate-200 last:border-0 hover:bg-slate-50'
                return (
                  <tr key={s.key} className={rowClass}>
                    <td className="px-3 py-1.5">
                      <div className="font-medium text-slate-900">
                        {s.name}
                        {isBestCost && (
                          <span className="ml-2 rounded bg-green-200 px-1.5 py-0.5 text-xs text-green-800">
                            🏆 najtaniej
                          </span>
                        )}
                        {isBestROI && (
                          <span className="ml-2 rounded bg-blue-200 px-1.5 py-0.5 text-xs text-blue-800">
                            ⚡ najlepsze ROI
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{s.description}</div>
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {s.months} mies.
                      <br />
                      <span className="text-xs text-slate-500">
                        ({formatMonths(s.months)})
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right font-medium tabular-nums">
                      {formatPLN(s.totalPaid)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {formatPLN(s.totalInterest)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {formatPLN(s.totalOverpayment)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-green-700">
                      {s.interestSaved > 0 ? formatPLN(s.interestSaved) : '—'}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {s.monthsSaved > 0 ? formatMonths(s.monthsSaved) : '—'}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {formatPLN(s.avgOverpaymentPerMonth)}
                    </td>
                    {showTargetCol && (
                      <td className="px-3 py-1.5 text-right">
                        {s.hitsTarget ? (
                          <span className="text-green-700">✓</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {bestByCost && rows.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          <strong>🏆 Najtaniej</strong> — najmniejsze „Łącznie zapłacisz" (uwzględnia nadpłaty
          jako koszt poniesiony).{' '}
          <strong>⚡ Najlepsze ROI</strong> — każda złotówka nadpłaty zwraca najwięcej oszczędności
          odsetek.
        </p>
      )}
    </div>
  )
}
