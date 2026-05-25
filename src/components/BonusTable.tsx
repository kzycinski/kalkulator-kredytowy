import type { BonusAnalysisResult } from '../hooks/useBonusAnalysis'
import { formatMonths, formatPLN } from '../lib/format'

function monthsLabel(months: number): string {
  if (months % 12 === 0) {
    const years = months / 12
    return years === 1 ? '1 rok' : `${years} lat`
  }
  return `${months} mies.`
}

export function BonusTable({ result }: { result: BonusAnalysisResult | null | undefined }) {
  if (!result || result.cells.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-600">
            <th rowSpan={2} className="px-3 py-2 align-bottom">
              Bonus
              <br />
              (PLN/mies)
            </th>
            {result.durationsMonths.map((dur) => (
              <th key={dur} colSpan={3} className="border-l px-3 py-1 text-center">
                {monthsLabel(dur)}
              </th>
            ))}
          </tr>
          <tr className="border-b text-xs text-slate-500">
            {result.durationsMonths.map((dur) => (
              <th key={`${dur}-h`} colSpan={3} className="border-l p-0">
                <div className="flex">
                  <div className="flex-1 px-2 py-1 text-right">Oszczędność</div>
                  <div className="flex-1 border-l px-2 py-1 text-right">Skrócenie</div>
                  <div className="flex-1 border-l px-2 py-1 text-right">ROI bonusu</div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.bonuses.map((bonus) => (
            <tr key={bonus} className="border-b last:border-0 hover:bg-slate-50">
              <td className="px-3 py-1.5 font-medium tabular-nums">
                {formatPLN(bonus)}
              </td>
              {result.durationsMonths.map((dur) => {
                const cell = result.cells.find(
                  (c) => c.bonus === bonus && c.durationMonths === dur,
                )
                if (!cell) {
                  return (
                    <td key={dur} colSpan={3} className="border-l px-2 py-1.5 text-slate-300">
                      —
                    </td>
                  )
                }
                return (
                  <td key={dur} colSpan={3} className="border-l p-0">
                    <div className="flex text-xs">
                      <div className="flex-1 px-2 py-1.5 text-right tabular-nums text-green-700">
                        {formatPLN(cell.interestSaved)}
                      </div>
                      <div className="flex-1 border-l px-2 py-1.5 text-right tabular-nums">
                        {cell.monthsSaved > 0 ? formatMonths(cell.monthsSaved) : '—'}
                      </div>
                      <div className="flex-1 border-l px-2 py-1.5 text-right tabular-nums">
                        {cell.roi > 0 ? `${(cell.roi * 100).toFixed(1)}%` : '—'}
                      </div>
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-500">
        <strong>Oszczędność</strong> — ile mniej odsetek zapłacisz vs. sama cykliczna baza bez bonusu.{' '}
        <strong>Skrócenie</strong> — o ile krócej spłacasz kredyt.{' '}
        <strong>ROI bonusu</strong> — oszczędność odsetek podzielona przez całą sumę bonusu
        wydaną w okresie (bonus × miesiące). Wyższe = bonus efektywniejszy.
      </p>
    </div>
  )
}
