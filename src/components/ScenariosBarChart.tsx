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
import type { CompareResult } from '../types/calc'
import { formatPLN } from '../lib/format'

export function ScenariosBarChart({ result }: { result: CompareResult | undefined }) {
  if (!result || result.scenarios.length === 0) {
    return <p className="py-8 text-center text-slate-500">Dodaj scenariusze do porównania.</p>
  }

  const data = result.scenarios.map((s) => ({
    name: s.name,
    'Oszczędność odsetek': s.interestSaved,
    'Suma nadpłat': s.summary.totalOverpayment,
  }))

  return (
    <div data-testid="scenarios-bar-chart" className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 16, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
          <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: number) => formatPLN(v)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Oszczędność odsetek" fill="#15803d" />
          <Bar dataKey="Suma nadpłat" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
