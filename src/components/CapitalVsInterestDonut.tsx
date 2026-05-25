import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { ScheduleSummary } from '../types/calc'
import { formatPLN } from '../lib/format'

export function CapitalVsInterestDonut({ summary }: { summary: ScheduleSummary }) {
  const capital = summary.totalPrincipalPaid + summary.totalOverpayment
  const interest = summary.totalInterest
  const data = [
    { name: 'Kapitał', value: capital, fill: '#3b82f6' },
    { name: 'Odsetki', value: interest, fill: '#ef4444' },
  ]
  const total = capital + interest
  const capitalPct = total > 0 ? (capital / total) * 100 : 0
  const interestPct = total > 0 ? (interest / total) * 100 : 0

  return (
    <div className="w-full">
      <div data-testid="capital-interest-donut" className="h-44 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="85%"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => formatPLN(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-blue-500" />
          <span>
            Kapitał {capitalPct.toFixed(1)}% ({formatPLN(capital)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-500" />
          <span>
            Odsetki {interestPct.toFixed(1)}% ({formatPLN(interest)})
          </span>
        </div>
      </div>
    </div>
  )
}
