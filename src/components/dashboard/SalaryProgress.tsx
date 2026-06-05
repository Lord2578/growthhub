'use client'

import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { UserSettings } from '@/types'
import { Target } from 'lucide-react'

export function SalaryProgress({ settings }: { settings: UserSettings | null }) {
  const { convert, format } = useCurrency()
  const { t } = useTranslation()

  if (!settings?.current_salary || !settings?.target_salary) return null

  const current = convert(settings.current_salary, settings.salary_currency)
  const target = convert(settings.target_salary, settings.salary_currency)
  const pct = Math.min(100, Math.round((current / target) * 100))
  const remaining = Math.max(0, target - current)

  return (
    <div className="animate-fade-in-up relative overflow-hidden rounded-2xl p-5 ring-1 ring-white/[0.07] shadow-card">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.04] via-transparent to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-primary shadow-glow-sm">
              <Target className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold">{t('dashboard.salaryGoal')}</span>
          </div>
          <span className="text-xs font-bold text-gradient-primary">{pct}%</span>
        </div>

        <div className="flex justify-between text-sm mb-2.5">
          <span className="font-semibold text-foreground">{format(current)} <span className="text-muted-foreground font-normal text-xs">{t('dashboard.perMo')}</span></span>
          <span className="text-muted-foreground text-xs">{t('dashboard.goal')} {format(target)} {t('dashboard.perMo')}</span>
        </div>

        {/* Progress track */}
        <div className="relative h-2 w-full rounded-full bg-white/[0.07] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-primary shadow-glow-sm transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span className="text-primary/80 font-medium">{pct}{t('dashboard.towardGoal')}</span>
          <span>{format(remaining)} {t('dashboard.toGo')}</span>
        </div>
      </div>
    </div>
  )
}
