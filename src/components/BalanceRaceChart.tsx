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
import { formatPLN } from '../lib/format'

function buildYearlyBalance(rows: ScheduleRow[]): Map<number, number> {
  const map = new Map<number, number>()
  for (const r of rows) {
    const year = Math.ceil(r.month / 12)
    map.set(year, r.balance)
  }
  return map
}

export function BalanceRaceChart({
  baselineRows,
  currentRows,
  principal,
}: {
  baselineRows: ScheduleRow[]
  currentRows: ScheduleRow[]
  principal: number
}) {
  const baseMap = buildYearlyBalance(baselineRows)
  const curMap = buildYearlyBalance(currentRows)
  if (baseMap.size === 0) return null
  const maxYear = Math.max(...baseMap.keys())

  const data: { year: number; 'Bez nadpłat': number; 'Z nadpłatami': number }[] = [
    { year: 0, 'Bez nadpłat': principal, 'Z nadpłatami': principal },
  ]
  for (let y = 1; y <= maxYear; y++) {
    data.push({
      year: y,
      'Bez nadpłat': baseMap.get(y) ?? 0,
      'Z nadpłatami': curMap.get(y) ?? 0,
    })
  }

  const currentEndsYear = Math.ceil((currentRows[currentRows.length - 1]?.month ?? 0) / 12)
  const baselineEndsYear = maxYear

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 30, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11 }}
            label={{ value: 'Rok', position: 'insideBottom', offset: -4, fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(v: number, name: string) => [formatPLN(v), name]}
            labelFormatter={(y) => (y === 0 ? 'Start' : `Rok ${y}`)}
          />
          <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Area
            type="monotone"
            dataKey="Bez nadpłat"
            fill="#fca5a5"
            stroke="#ef4444"
            fillOpacity={0.25}
            strokeWidth={2}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="Z nadpłatami"
            fill="#6ee7b7"
            stroke="#10b981"
            fillOpacity={0.4}
            strokeWidth={2}
            dot={false}
          />
          {currentEndsYear < baselineEndsYear && (
            <ReferenceLine
              x={currentEndsYear}
              stroke="#10b981"
              strokeDasharray="4 3"
              label={{ value: 'spłacono', position: 'top', fontSize: 10, fill: '#10b981' }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
