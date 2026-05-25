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
import type { ScheduleRow } from '../types/calc'
import { formatPLN } from '../lib/format'

export function CumulativeChart({ rows }: { rows: ScheduleRow[] }) {
  let cumPrincipal = 0
  let cumInterest = 0
  const data = rows.map((r) => {
    cumPrincipal += r.principalPart + r.overpayment
    cumInterest += r.interestPart
    return { month: r.month, Kapitał: cumPrincipal, Odsetki: cumInterest }
  })

  return (
    <div data-testid="cumulative-chart" className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(v: number) => formatPLN(v)}
            labelFormatter={(m) => `Miesiąc ${m}`}
          />
          <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Line
            type="monotone"
            dataKey="Kapitał"
            stroke="#1e40af"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Odsetki"
            stroke="#b91c1c"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
