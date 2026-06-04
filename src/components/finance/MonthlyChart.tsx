'use client'

import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { MonthlyIncome, Expense } from '@/types'

interface Props {
  income: MonthlyIncome[]
  expenses: Expense[]
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function MonthlyChart({ income, expenses }: Props) {
  const { convert, baseCurrency } = useCurrency()
  const { t } = useTranslation()

  const data = income.map((inc) => {
    const monthDate = new Date(inc.month)
    const monthKey = inc.month.slice(0, 7)
    const label = `${MONTH_LABELS[monthDate.getMonth()]} ${monthDate.getFullYear().toString().slice(2)}`

    const monthExpenses = expenses
      .filter((e) => e.date.startsWith(monthKey))
      .reduce((sum, e) => sum + convert(e.amount_usd, 'USD'), 0)

    return {
      month: label,
      income: Math.round(convert(inc.amount, inc.currency)),
      expenses: Math.round(monthExpenses),
    }
  }).reverse()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('finance.incomeVsExpenses')} ({baseCurrency})</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t('finance.noData')}</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="income" name={t('finance.incomeLabel')} fill="hsl(142, 76%, 46%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name={t('finance.expensesLabel')} fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
