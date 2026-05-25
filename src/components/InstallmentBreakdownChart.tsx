import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ScheduleRow } from '../types/calc'
import { formatPLN } from '../lib/format'

export function InstallmentBreakdownChart({ rows }: { rows: ScheduleRow[] }) {
  const data = rows.map((r) => ({
    month: r.month,
    Kapitał: r.principalPart,
    Odsetki: r.interestPart,
    Nadpłata: r.overpayment,
  }))

  return (
    <div data-testid="breakdown-chart" className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(v: number) => formatPLN(v)}
            labelFormatter={(m) => `Miesiąc ${m}`}
          />
          <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Area type="monotone" dataKey="Kapitał" stackId="1" stroke="#1e40af" fill="#3b82f6" />
          <Area type="monotone" dataKey="Odsetki" stackId="1" stroke="#b91c1c" fill="#ef4444" />
          <Area type="monotone" dataKey="Nadpłata" stackId="1" stroke="#15803d" fill="#22c55e" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
