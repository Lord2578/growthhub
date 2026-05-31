'use client'

import { useCurrency } from '@/lib/hooks/useCurrency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import { Expense, MonthlyIncome, UserSettings } from '@/types'

interface Props {
  income: MonthlyIncome | null
  expenses: Expense[]
  settings: UserSettings | null
}

export function OverviewCards({ income, expenses }: Props) {
  const { convert, format, baseCurrency } = useCurrency()

  const incomeConverted = income
    ? convert(income.amount, income.currency)
    : 0

  const totalSpent = expenses.reduce((sum, e) => {
    return sum + convert(e.amount_usd, 'USD')
  }, 0)

  const saved = Math.max(0, incomeConverted - totalSpent)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Income this month</CardTitle>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{format(incomeConverted)}</div>
          {income && income.currency !== baseCurrency && (
            <p className="text-xs text-muted-foreground mt-1">
              {income.amount} {income.currency} original
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Spent this month</CardTitle>
          <TrendingDown className="w-4 h-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{format(totalSpent)}</div>
          {incomeConverted > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((totalSpent / incomeConverted) * 100)}% of income
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Saved this month</CardTitle>
          <PiggyBank className="w-4 h-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500">{format(saved)}</div>
          {incomeConverted > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((saved / incomeConverted) * 100)}% saved
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
