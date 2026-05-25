import type { BonusAnalysisResult } from '../hooks/useBonusAnalysis'
import { formatMonths, formatPLN, yearsWord } from '../lib/format'

function durationLabel(months: number): string {
  if (months % 12 === 0) {
    const years = months / 12
    return `${years} ${yearsWord(years)}`
  }
  return `${months} mies.`
}

export function BonusTable({ result }: { result: BonusAnalysisResult | null | undefined }) {
  if (!result || result.cells.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <strong>Bez bonusu (sama cykliczna baza):</strong> kredyt zakończy się po{' '}
        <strong>{result.baselineMonths} mies. ({formatMonths(result.baselineMonths)})</strong>.
        Łącznie zapłacisz <strong>{formatPLN(result.baselineTotalPaid)}</strong>, w tym{' '}
        <strong>{formatPLN(result.baselineInterest)}</strong> odsetek. Każde „Oszczędność" poniżej
        to ile <em>mniej</em> zapłacisz vs. ta baza.
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-300">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-slate-300 bg-slate-100 text-left text-slate-700">
              <th
                rowSpan={2}
                className="border-r-2 border-slate-300 px-3 py-2 align-bottom font-semibold"
              >
                Bonus
                <br />
                <span className="text-xs font-normal text-slate-500">(PLN/mies)</span>
              </th>
              {result.durationsMonths.map((dur, idx) => (
                <th
                  key={dur}
                  colSpan={2}
                  className={
                    'px-3 py-2 text-center font-semibold ' +
                    (idx < result.durationsMonths.length - 1
                      ? 'border-r-2 border-slate-300'
                      : '')
                  }
                >
                  {durationLabel(dur)}
                </th>
              ))}
            </tr>
            <tr className="border-b-2 border-slate-300 bg-slate-50 text-xs text-slate-500">
              {result.durationsMonths.map((dur, idx) => (
                <th
                  key={`${dur}-h`}
                  colSpan={2}
                  className={
                    'p-0 ' +
                    (idx < result.durationsMonths.length - 1
                      ? 'border-r-2 border-slate-300'
                      : '')
                  }
                >
                  <div className="flex">
                    <div className="flex-1 px-2 py-1 text-right font-medium">Oszczędność</div>
                    <div className="flex-1 border-l border-slate-200 px-2 py-1 text-right font-medium">
                      Łącznie
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.bonuses.map((bonus) => (
              <tr key={bonus} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                <td className="border-r-2 border-slate-300 bg-slate-50 px-3 py-1.5 text-right font-medium tabular-nums">
                  {formatPLN(bonus)}
                </td>
                {result.durationsMonths.map((dur, idx) => {
                  const cell = result.cells.find(
                    (c) => c.bonus === bonus && c.durationMonths === dur,
                  )
                  const groupBorder =
                    idx < result.durationsMonths.length - 1 ? 'border-r-2 border-slate-300' : ''
                  if (!cell) {
                    return (
                      <td
                        key={dur}
                        colSpan={2}
                        className={`px-2 py-1.5 text-center text-slate-300 ${groupBorder}`}
                      >
                        —
                      </td>
                    )
                  }
                  return (
                    <td key={dur} colSpan={2} className={`p-0 ${groupBorder}`}>
                      <div className="flex">
                        <div className="flex flex-1 flex-col items-end px-2 py-1.5 leading-tight">
                          <span className="text-sm font-semibold tabular-nums text-green-700">
                            {formatPLN(cell.interestSaved)}
                          </span>
                          <span className="text-xs tabular-nums text-slate-500">
                            {cell.monthsSaved > 0
                              ? `−${formatMonths(cell.monthsSaved)}`
                              : '—'}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col items-end border-l border-slate-200 px-2 py-1.5 leading-tight">
                          <span className="text-sm tabular-nums text-slate-900">
                            {formatPLN(cell.totalPaid)}
                          </span>
                          <span className="text-xs tabular-nums text-slate-500">
                            ROI {cell.roi > 0 ? `${(cell.roi * 100).toFixed(0)}%` : '—'}
                          </span>
                        </div>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">
        <strong>Oszczędność</strong> (kolor zielony) — różnica w odsetkach vs. sama baza.
        Pod nią: <strong>skrócenie kredytu</strong>.{' '}
        <strong>Łącznie</strong> — pełna kwota do spłaty z tym bonusem (kapitał + odsetki + nadpłaty,
        czyli ile <em>realnie zapłacisz</em>).{' '}
        <strong>ROI</strong> — efektywność każdej złotówki bonusu (oszczędność odsetek / suma
        bonusu w okresie).
      </p>
    </div>
  )
}
