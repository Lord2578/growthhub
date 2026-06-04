'use client'

import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Expense } from '@/types'

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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('finance.expensesByCategory')}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t('finance.noExpenses')}</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name] ?? COLORS.other} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [format(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {data.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[d.name] ?? COLORS.other }}
                    />
                    <span className="text-muted-foreground">{t(`categories.${d.name}`)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{format(d.value)}</span>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {Math.round((d.value / total) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
