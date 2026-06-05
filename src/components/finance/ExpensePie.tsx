'use client'

import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Expense } from '@/types'
import { PieChart as PieChartIcon } from 'lucide-react'

const COLORS: Record<string, string> = {
  housing: 'hsl(220, 70%, 50%)',
  food: 'hsl(142, 70%, 45%)',
  transport: 'hsl(38, 90%, 50%)',
  trips: 'hsl(280, 60%, 55%)',
  savings: 'hsl(170, 70%, 40%)',
  subscriptions: 'hsl(200, 80%, 50%)',
  games: 'hsl(320, 70%, 55%)',
  other: 'hsl(0, 0%, 55%)',
}

export function ExpensePie({ expenses }: { expenses: Expense[] }) {
  const { convert, format } = useCurrency()
  const { t } = useTranslation()

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    const val = convert(e.amount_usd, 'USD')
    acc[e.category] = (acc[e.category] ?? 0) + val
    return acc
  }, {})

  const data = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="animate-fade-in-up rounded-2xl ring-1 ring-white/[0.07] bg-card shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.06]">
          <PieChartIcon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <span className="font-semibold text-sm">{t('finance.expensesByCategory')}</span>
      </div>
      <div className="p-5">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 text-center py-8">{t('finance.noExpenses')}</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name] ?? COLORS.other} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [format(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: 'hsl(224 22% 8%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {data.map((d) => (
                <div key={d.name} className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-white/[0.02] transition-colors text-sm">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[d.name] ?? COLORS.other }}
                    />
                    <span className="text-muted-foreground">{t(`categories.${d.name}`)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{format(d.value)}</span>
                    <span className="text-xs text-muted-foreground/50 w-8 text-right">
                      {Math.round((d.value / total) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
