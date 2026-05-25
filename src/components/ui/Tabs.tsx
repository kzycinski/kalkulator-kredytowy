import { type ReactNode, useState } from 'react'
import { cn } from '../../lib/utils'

export interface TabItem {
  id: string
  label: string
  content: ReactNode
}

export function Tabs({
  defaultTab,
  tabs,
}: {
  defaultTab?: string
  tabs: TabItem[]
}) {
  const initial = defaultTab ?? tabs[0]?.id ?? ''
  const [active, setActive] = useState(initial)
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0]

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === active}
            onClick={() => setActive(t.id)}
            className={cn(
              'px-3 py-2 text-sm transition-colors',
              t.id === active
                ? '-mb-px border-b-2 border-slate-900 font-semibold text-slate-900'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-4">
        {activeTab?.content}
      </div>
    </div>
  )
}
