import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { BonusAnalysisResult } from '../hooks/useBonusAnalysis'
import { formatPLN } from '../lib/format'

const SERIES_COLORS = [
  '#15803d',
  '#1e40af',
  '#b45309',
  '#7c3aed',
  '#be185d',
  '#0891b2',
]

function monthsLabel(months: number): string {
  if (months % 12 === 0) {
    const years = months / 12
    return years === 1 ? '1 rok' : `${years} lat`
  }
  return `${months} mies.`
}

export function BonusChart({ result }: { result: BonusAnalysisResult | null | undefined }) {
  if (!result || result.cells.length === 0) {
    return (
      <p className="py-8 text-center text-slate-500">
        Brak danych — sprawdź zakres bonusu i wybrane okresy.
      </p>
    )
  }

  const data = result.bonuses.map((bonus) => {
    const row: Record<string, number> = { bonus }
    for (const dur of result.durationsMonths) {
      const cell = result.cells.find((c) => c.bonus === bonus && c.durationMonths === dur)
      row[monthsLabel(dur)] = cell ? cell.interestSaved : 0
    }
    return row
  })

  return (
    <div data-testid="bonus-chart" className="h-80 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 36, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="bonus"
            tick={{ fontSize: 11 }}
            label={{
              value: 'Bonus (PLN/mies)',
              position: 'insideBottom',
              offset: -4,
              fontSize: 11,
            }}
          />
          <YAxis
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11 }}
            label={{
              value: 'Oszczędność odsetek (PLN)',
              angle: -90,
              position: 'insideLeft',
              fontSize: 11,
              style: { textAnchor: 'middle' },
            }}
            width={48}
          />
          <Tooltip
            formatter={(v: number) => formatPLN(v)}
            labelFormatter={(b) => `Bonus ${formatPLN(Number(b))}/mies`}
          />
          <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {result.durationsMonths.map((dur, idx) => (
            <Line
              key={dur}
              type="monotone"
              dataKey={monthsLabel(dur)}
              stroke={SERIES_COLORS[idx % SERIES_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
