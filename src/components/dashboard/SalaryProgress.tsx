'use client'

import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { UserSettings } from '@/types'

export function SalaryProgress({ settings }: { settings: UserSettings | null }) {
  const { convert, format } = useCurrency()
  const { t } = useTranslation()

  if (!settings?.current_salary || !settings?.target_salary) return null

  const current = convert(settings.current_salary, settings.salary_currency)
  const target = convert(settings.target_salary, settings.salary_currency)
  const pct = Math.min(100, Math.round((current / target) * 100))
  const remaining = Math.max(0, target - current)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.salaryGoal')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-semibold">{format(current)} {t('dashboard.perMo')}</span>
          <span className="text-muted-foreground">{t('dashboard.goal')} {format(target)} {t('dashboard.perMo')}</span>
        </div>
        <Progress value={pct} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="text-primary font-medium">{pct}{t('dashboard.towardGoal')}</span>
          <span>{format(remaining)} {t('dashboard.toGo')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
