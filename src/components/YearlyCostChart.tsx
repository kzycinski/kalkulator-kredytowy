import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ScheduleRow } from '../types/calc'
import { formatPLN } from '../lib/format'

export function YearlyCostChart({ rows }: { rows: ScheduleRow[] }) {
  const byYear: Record<number, { year: number; Kapitał: number; Odsetki: number; Nadpłata: number }> = {}

  for (const r of rows) {
    const year = Math.max(1, Math.ceil(r.month / 12))
    if (!byYear[year]) byYear[year] = { year, Kapitał: 0, Odsetki: 0, Nadpłata: 0 }
    byYear[year].Kapitał += r.principalPart
    byYear[year].Odsetki += r.interestPart
    byYear[year].Nadpłata += r.overpayment
  }

  const data = Object.values(byYear)
  const hasOverpayments = data.some((d) => d.Nadpłata > 0)

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11 }}
            label={{ value: 'Rok', position: 'insideBottom', offset: -2, fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(v: number) => formatPLN(v)}
            labelFormatter={(y) => `Rok ${y}`}
          />
          <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Bar dataKey="Kapitał" stackId="a" fill="#0891b2" />
          <Bar dataKey="Odsetki" stackId="a" fill="#ef4444" />
          {hasOverpayments && <Bar dataKey="Nadpłata" stackId="a" fill="#22c55e" />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
