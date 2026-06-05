'use client'

import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { MonthlyIncome, Expense } from '@/types'
import { BarChart2 } from 'lucide-react'

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
    <div className="animate-fade-in-up rounded-2xl ring-1 ring-white/[0.07] bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.06]">
            <BarChart2 className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="font-semibold text-sm">{t('finance.incomeVsExpenses')}</span>
        </div>
        <span className="text-xs text-muted-foreground/60 bg-white/[0.04] px-2.5 py-1 rounded-lg">{baseCurrency}</span>
      </div>
      <div className="p-5">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 text-center py-8">{t('finance.noData')}</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(224 22% 8%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
              <Bar dataKey="income" name={t('finance.incomeLabel')} fill="hsl(142, 76%, 46%)" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="expenses" name={t('finance.expensesLabel')} fill="hsl(0, 84%, 60%)" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
