import type { ScheduleRow } from '../types/calc'
import { Tabs } from './ui/Tabs'
import { BalanceChart } from './BalanceChart'
import { InstallmentBreakdownChart } from './InstallmentBreakdownChart'
import { CumulativeChart } from './CumulativeChart'
import { OverpaymentValueChart } from './OverpaymentValueChart'
import { formatMonths, pluralRat } from '../lib/format'

export function Charts({ rows, annualRate }: { rows: ScheduleRow[]; annualRate: number }) {
  const months = rows.length
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-semibold">Wykresy</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {months} {pluralRat(months)} • {formatMonths(months)}
        </span>
      </div>
      <Tabs
        defaultTab="balance"
        tabs={[
          { id: 'balance', label: 'Saldo', content: <BalanceChart rows={rows} /> },
          {
            id: 'breakdown',
            label: 'Struktura raty',
            content: <InstallmentBreakdownChart rows={rows} />,
          },
          {
            id: 'cumulative',
            label: 'Skumulowane',
            content: <CumulativeChart rows={rows} />,
          },
          {
            id: 'value',
            label: 'Wartość nadpłaty',
            content: <OverpaymentValueChart rows={rows} annualRate={annualRate} />,
          },
        ]}
      />
    </div>
  )
}
