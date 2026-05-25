import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CompareResult } from '../types/calc'
import { formatPLN } from '../lib/format'

const COLORS = {
  kapital: '#94a3b8',
  nadplaty: '#10b981',
  odsetki: '#fb7185',
}

export function ScenariosBarChart({ result }: { result: CompareResult | undefined }) {
  if (!result || result.scenarios.length === 0) {
    return <p className="py-8 text-center text-slate-500">Dodaj scenariusze do porównania.</p>
  }

  const rows = [
    {
      name: 'Bez nadpłat (baza)',
      'Kapitał': result.baseline.totalInstallments - result.baseline.totalInterest,
      'Nadpłaty': 0,
      'Odsetki': result.baseline.totalInterest,
      totalPaid: result.baseline.totalPaid,
    },
    ...result.scenarios.map((s) => ({
      name: s.name,
      'Kapitał': s.summary.totalInstallments - s.summary.totalInterest,
      'Nadpłaty': s.summary.totalOverpayment,
      'Odsetki': s.summary.totalInterest,
      totalPaid: s.summary.totalPaid,
    })),
  ].sort((a, b) => a.totalPaid - b.totalPaid)

  const height = Math.max(rows.length * 52 + 110, 280)

  return (
    <div data-testid="scenarios-bar-chart" className="w-full" style={{ height }}>
      <ResponsiveContainer>
        <BarChart
          layout="vertical"
          data={rows}
          margin={{ top: 8, right: 64, bottom: 16, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            width={150}
          />
          <Tooltip
            formatter={(v: number) => formatPLN(v)}
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Bar dataKey="Kapitał" stackId="a" fill={COLORS.kapital} />
          <Bar dataKey="Nadpłaty" stackId="a" fill={COLORS.nadplaty} />
          <Bar dataKey="Odsetki" stackId="a" fill={COLORS.odsetki} radius={[0, 4, 4, 0]}>
            <LabelList
              dataKey="totalPaid"
              position="right"
              formatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              fontSize={11}
              fill="#475569"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
