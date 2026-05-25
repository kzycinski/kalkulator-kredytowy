import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ScheduleRow } from '../types/calc'
import { formatPLN } from '../lib/format'

export function BalanceChart({ rows }: { rows: ScheduleRow[] }) {
  const data = rows.map((r) => ({ month: r.month, balance: r.balance }))

  return (
    <div data-testid="balance-chart" className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 24, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            label={{ value: 'Miesiąc', position: 'insideBottom', offset: -2, fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(v: number) => formatPLN(v)}
            labelFormatter={(m) => `Miesiąc ${m}`}
          />
          <Line type="monotone" dataKey="balance" stroke="#0f172a" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
