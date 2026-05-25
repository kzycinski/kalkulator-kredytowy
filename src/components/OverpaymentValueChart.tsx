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

export interface ValuePoint {
  month: number
  valuePerZloty: number
}

export function computeValuePoints(rows: ScheduleRow[], annualRate: number): ValuePoint[] {
  if (rows.length === 0 || annualRate <= 0) return []
  const monthlyRate = annualRate / 12
  const total = rows.length
  return rows.map((r) => ({
    month: r.month,
    valuePerZloty: (total - r.month + 1) * monthlyRate,
  }))
}

export function OverpaymentValueChart({
  rows,
  annualRate,
}: {
  rows: ScheduleRow[]
  annualRate: number
}) {
  const data = computeValuePoints(rows, annualRate)

  if (data.length === 0) {
    return <p className="py-8 text-center text-slate-500">Brak danych.</p>
  }

  return (
    <div data-testid="value-chart" className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 30, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11 }}
            label={{
              value: 'Miesiąc',
              position: 'insideBottom',
              offset: -4,
              fontSize: 11,
            }}
          />
          <YAxis
            tickFormatter={(v: number) => v.toFixed(2)}
            tick={{ fontSize: 11 }}
            label={{
              value: 'zł oszczędności / 1 zł nadpłaty',
              angle: -90,
              position: 'insideLeft',
              fontSize: 11,
              offset: 8,
              style: { textAnchor: 'middle' },
            }}
            width={64}
          />
          <Tooltip
            formatter={(v: number) => [`${v.toFixed(3)} zł`, 'Wartość 1 zł nadpłaty']}
            labelFormatter={(m) => `Miesiąc ${m}`}
          />
          <Line
            type="monotone"
            dataKey="valuePerZloty"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={false}
            name="zł / 1 zł"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
