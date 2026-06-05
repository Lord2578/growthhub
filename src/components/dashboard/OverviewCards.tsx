'use client'

import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import { Expense, MonthlyIncome, UserSettings } from '@/types'

interface Props {
  income: MonthlyIncome | null
  expenses: Expense[]
  settings: UserSettings | null
}

export function OverviewCards({ income, expenses }: Props) {
  const { convert, format, baseCurrency } = useCurrency()
  const { t } = useTranslation()

  const incomeConverted = income ? convert(income.amount, income.currency) : 0
  const totalSpent = expenses.reduce((sum, e) => sum + convert(e.amount_usd, 'USD'), 0)
  const saved = Math.max(0, incomeConverted - totalSpent)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Income */}
      <div className="animate-fade-in-up relative overflow-hidden rounded-2xl p-5 ring-1 ring-white/[0.07] shadow-card transition-all duration-200 hover:ring-white/[0.12] hover:shadow-card-hover group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.07] via-transparent to-transparent" />
        <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-emerald-500/[0.06] blur-xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('dashboard.income')}</p>
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-income tracking-tight animate-count-up">{format(incomeConverted)}</p>
          {income && income.currency !== baseCurrency && (
            <p className="text-xs text-muted-foreground/60 mt-1">{income.amount} {income.currency}</p>
          )}
        </div>
      </div>

      {/* Spent */}
      <div className="animate-fade-in-up delay-100 relative overflow-hidden rounded-2xl p-5 ring-1 ring-white/[0.07] shadow-card transition-all duration-200 hover:ring-white/[0.12] hover:shadow-card-hover group">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.07] via-transparent to-transparent" />
        <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-rose-500/[0.06] blur-xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('dashboard.spent')}</p>
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-500/10 ring-1 ring-rose-500/20">
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-spent tracking-tight animate-count-up">{format(totalSpent)}</p>
          {incomeConverted > 0 && (
            <p className="text-xs text-muted-foreground/60 mt-1">
              {Math.round((totalSpent / incomeConverted) * 100)}{t('dashboard.ofIncome')}
            </p>
          )}
        </div>
      </div>

      {/* Saved */}
      <div className="animate-fade-in-up delay-200 relative overflow-hidden rounded-2xl p-5 ring-1 ring-white/[0.07] shadow-card transition-all duration-200 hover:ring-white/[0.12] hover:shadow-card-hover group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.07] via-transparent to-transparent" />
        <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-blue-500/[0.06] blur-xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('dashboard.saved')}</p>
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
              <PiggyBank className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-savings tracking-tight animate-count-up">{format(saved)}</p>
          {incomeConverted > 0 && (
            <p className="text-xs text-muted-foreground/60 mt-1">
              {Math.round((saved / incomeConverted) * 100)}{t('dashboard.pctSaved')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
