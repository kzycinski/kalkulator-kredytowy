import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SweepResult } from '../types/calc'
import { formatPLN } from '../lib/format'

export function SweepChart({ result }: { result: SweepResult | undefined }) {
  if (!result || result.points.length === 0) {
    return <p className="py-8 text-center text-slate-500">Brak danych — sprawdź zakres sweep.</p>
  }

  return (
    <div data-testid="sweep-chart" className="h-80 w-full">
      <ResponsiveContainer>
        <LineChart data={result.points} margin={{ top: 8, right: 24, bottom: 48, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="overpayment"
            tick={{ fontSize: 11 }}
            label={{
              value: 'Nadpłata miesięczna (PLN)',
              position: 'insideBottom',
              offset: -4,
              fontSize: 11,
            }}
          />
          <YAxis
            yAxisId="pln"
            orientation="left"
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11 }}
            width={48}
          />
          <YAxis
            yAxisId="months"
            orientation="left"
            tick={{ fontSize: 11 }}
            width={36}
          />
          <Tooltip
            formatter={(v: number, name) => {
              if (name === 'Skrócenie (mies.)') return [`${v} mies.`, name]
              return [formatPLN(v), name]
            }}
            labelFormatter={(o) => `Nadpłata ${formatPLN(Number(o))}/mies`}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} verticalAlign="bottom" />
          <Line
            yAxisId="pln"
            type="monotone"
            dataKey="interestSaved"
            name="Oszczędność odsetek"
            stroke="#15803d"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="pln"
            type="monotone"
            dataKey="marginalInterestSaved"
            name="Marginalna oszczędność"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            yAxisId="months"
            type="monotone"
            dataKey="monthsSaved"
            name="Skrócenie (mies.)"
            stroke="#1e40af"
            strokeWidth={2}
            dot={false}
          />
          {result.sweetSpot && (
            <ReferenceDot
              yAxisId="pln"
              x={result.sweetSpot.overpayment}
              y={result.sweetSpot.interestSaved}
              r={6}
              fill="#dc2626"
              stroke="white"
              strokeWidth={2}
              ifOverflow="extendDomain"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
