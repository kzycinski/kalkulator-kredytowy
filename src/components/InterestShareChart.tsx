import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ScheduleRow } from '../types/calc'

export function InterestShareChart({
  rows,
  crossoverMonth,
}: {
  rows: ScheduleRow[]
  crossoverMonth: number | null
}) {
  const byYear: Record<number, { interest: number; principal: number }> = {}
  for (const r of rows) {
    const year = Math.max(1, Math.ceil(r.month / 12))
    if (!byYear[year]) byYear[year] = { interest: 0, principal: 0 }
    byYear[year].interest += r.interestPart
    byYear[year].principal += r.principalPart
  }

  const data = Object.entries(byYear).map(([y, d]) => {
    const total = d.interest + d.principal
    const interestPct = total > 0 ? Math.round((d.interest / total) * 100) : 0
    return {
      year: Number(y),
      Odsetki: interestPct,
      Kapitał: 100 - interestPct,
    }
  })

  const crossoverYear = crossoverMonth ? Math.ceil(crossoverMonth / 12) : null

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11 }}
            label={{ value: 'Rok', position: 'insideBottom', offset: -4, fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: 11 }}
            domain={[0, 100]}
          />
          <Tooltip
            formatter={(v: number, name: string) => [`${v}%`, name]}
            labelFormatter={(y) => `Rok ${y}`}
          />
          <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Area
            type="monotone"
            dataKey="Odsetki"
            stackId="1"
            fill="#fca5a5"
            stroke="#ef4444"
            fillOpacity={0.7}
          />
          <Area
            type="monotone"
            dataKey="Kapitał"
            stackId="1"
            fill="#93c5fd"
            stroke="#3b82f6"
            fillOpacity={0.7}
          />
          {crossoverYear && (
            <ReferenceLine
              x={crossoverYear}
              stroke="#6b7280"
              strokeDasharray="4 3"
              label={{
                value: 'przełom',
                position: 'insideTopRight',
                fontSize: 10,
                fill: '#6b7280',
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
