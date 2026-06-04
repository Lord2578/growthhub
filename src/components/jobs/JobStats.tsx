'use client'

import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { Card, CardContent } from '@/components/ui/card'
import { JobApplication } from '@/types'

export function JobStats({ jobs }: { jobs: JobApplication[] }) {
  const { convert, format } = useCurrency()
  const { t } = useTranslation()

  const total = jobs.length
  const responded = jobs.filter((j) => ['response', 'interview', 'offer'].includes(j.status)).length
  const offers = jobs.filter((j) => j.status === 'offer').length
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0

  const jobsWithSalary = jobs.filter((j) => j.salary_min || j.salary_max)
  const avgSalary =
    jobsWithSalary.length > 0
      ? jobsWithSalary.reduce((sum, j) => {
          const mid = ((j.salary_min ?? 0) + (j.salary_max ?? j.salary_min ?? 0)) / 2
          return sum + convert(mid, j.salary_currency)
        }, 0) / jobsWithSalary.length
      : null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="text-2xl font-bold text-primary">{total}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{t('jobs.totalApplied')}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="text-2xl font-bold text-blue-400">{responseRate}%</div>
          <div className="text-xs text-muted-foreground mt-0.5">{t('jobs.responseRate')}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="text-2xl font-bold text-green-400">{offers}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{t('jobs.offers')}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="text-2xl font-bold text-yellow-400">
            {avgSalary !== null ? format(Math.round(avgSalary)) : '—'}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{t('jobs.avgSalary')}</div>
        </CardContent>
      </Card>
    </div>
  )
}
