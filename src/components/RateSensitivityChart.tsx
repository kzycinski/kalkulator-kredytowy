import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatPLN } from '../lib/format'

export interface RateSensitivityPoint {
  label: string
  totalInterest: number
  isCurrent: boolean
}

export function RateSensitivityChart({ points }: { points: RateSensitivityPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(v: number) => [formatPLN(v), 'Suma odsetek']}
            labelFormatter={(l) => `Oprocentowanie: ${l}`}
          />
          <Bar dataKey="totalInterest" name="Suma odsetek" radius={[3, 3, 0, 0]}>
            {points.map((p, i) => (
              <Cell key={i} fill={p.isCurrent ? '#0891b2' : '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
