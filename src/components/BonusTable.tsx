import { useMemo } from 'react'
import type { BonusAnalysisResult, BonusCell } from '../hooks/useBonusAnalysis'
import { formatMonths, formatPLN } from '../lib/format'

function cellKey(bonus: number, dur: number): string {
  return `${bonus}|${dur}`
}

export function BonusTable({ result }: { result: BonusAnalysisResult | null | undefined }) {
  const cellMap = useMemo(() => {
    const map = new Map<string, BonusCell>()
    if (!result) return map
    for (const c of result.cells) {
      map.set(cellKey(c.bonus, c.durationMonths), c)
    }
    return map
  }, [result])

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
                  colSpan={3}
                  className={
                    'px-3 py-2 text-center font-semibold ' +
                    (idx < result.durationsMonths.length - 1
                      ? 'border-r-2 border-slate-300'
                      : '')
                  }
                >
                  {formatMonths(dur)}
                </th>
              ))}
            </tr>
            <tr className="border-b-2 border-slate-300 bg-slate-50 text-xs text-slate-500">
              {result.durationsMonths.map((dur, idx) => (
                <th
                  key={`${dur}-h`}
                  colSpan={3}
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
                    <div className="flex-1 border-l border-slate-200 px-2 py-1 text-right font-medium">
                      Inwestycja bonusu
                      <div className="font-normal text-slate-400">(zysk netto po Belce)</div>
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
                  const cell = cellMap.get(cellKey(bonus, dur))
                  const groupBorder =
                    idx < result.durationsMonths.length - 1 ? 'border-r-2 border-slate-300' : ''
                  if (!cell) {
                    return (
                      <td
                        key={dur}
                        colSpan={3}
                        className={`px-2 py-1.5 text-center text-slate-300 ${groupBorder}`}
                      >
                        —
                      </td>
                    )
                  }
                  const prepayBenefit = cell.interestSaved + cell.reinvestedInstallmentProfit
                  const investWins = cell.investmentProfit > prepayBenefit
                  const diff = Math.abs(cell.investmentProfit - prepayBenefit)
                  return (
                    <td key={dur} colSpan={3} className={`p-0 ${groupBorder}`}>
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
                          {cell.reinvestedInstallmentProfit > 0 && (
                            <span className="text-xs tabular-nums text-green-600">
                              +{formatPLN(cell.reinvestedInstallmentProfit)} reinw.
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col items-end border-l border-slate-200 px-2 py-1.5 leading-tight">
                          <span className="text-sm tabular-nums text-slate-900">
                            {formatPLN(cell.totalPaid)}
                          </span>
                          <span className="text-xs tabular-nums text-slate-500">
                            ROI {cell.roi > 0 ? `${(cell.roi * 100).toFixed(0)}%` : '—'}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col items-end border-l border-slate-200 px-2 py-1.5 leading-tight">
                          <span className={`text-sm tabular-nums font-semibold ${investWins ? 'text-amber-600' : 'text-slate-400'}`}>
                            {formatPLN(cell.investmentProfit)}
                          </span>
                          <span className="text-xs tabular-nums text-slate-400">
                            portfel {formatPLN(cell.investmentFV)}
                          </span>
                          <span className={`text-xs tabular-nums ${investWins ? 'text-amber-600' : 'text-green-700'}`}>
                            {investWins ? `↑ +${formatPLN(diff)}` : `↓ −${formatPLN(diff)}`}
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

      <div className="space-y-1 text-xs text-slate-500">
        <p>
          <strong className="text-green-700">Oszczędność</strong> — odsetki, których nie zapłacisz
          vs. sama baza (pod liczbą: o ile skróci się kredyt). <em>Reinw.</em> — gdy kredyt skończy
          się wcześniej, uwolnioną ratę wkładasz do brokerki przez te zaoszczędzone miesiące;
          to dodatkowy zysk po Belce. Suma obu daje pełną korzyść nadpłaty.
        </p>
        <p>
          <strong>Łącznie</strong> — całość spłaty z bonusem (kapitał + odsetki + nadpłaty).{' '}
          <strong>ROI</strong> — ile odsetek odzyskuje każda złotówka bonusu (powyżej 100% =
          bonus zwraca się z naddatkiem).
        </p>
        <p>
          <strong className="text-amber-700">Inwestycja bonusu</strong> — zysk netto po Belce
          (19%), gdybyś tę samą kwotę bonusu zamiast nadpłacać włożył miesięcznie do brokerki,
          a portfel rósł aż do dnia, w którym i tak skończyłby się Twój kredyt z samą bazą.
          Pomarańczowy (↑) = inwestycja wygrywa; szary (↓) = nadpłata wygrywa.
        </p>
      </div>
    </div>
  )
}
