'use client'

import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { JobApplication, JobStatus } from '@/types'

export function JobStats({ jobs }: { jobs: JobApplication[] }) {
  const { convert, format } = useCurrency()
  const { t } = useTranslation()

  const total = jobs.length
  const RESPONDED_STATUSES: JobStatus[] = ['response', 'interview', 'offer']
  const responded = jobs.filter((j) => RESPONDED_STATUSES.includes(j.status)).length
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

  const stats = [
    { value: total, label: t('jobs.totalApplied'), color: 'text-primary', bg: 'from-primary/[0.07]', glow: 'bg-primary/[0.06]' },
    { value: `${responseRate}%`, label: t('jobs.responseRate'), color: 'text-blue-400', bg: 'from-blue-500/[0.07]', glow: 'bg-blue-500/[0.06]' },
    { value: offers, label: t('jobs.offers'), color: 'text-emerald-400', bg: 'from-emerald-500/[0.07]', glow: 'bg-emerald-500/[0.06]' },
    { value: avgSalary !== null ? format(Math.round(avgSalary)) : '—', label: t('jobs.avgSalary'), color: 'text-yellow-400', bg: 'from-yellow-500/[0.07]', glow: 'bg-yellow-500/[0.06]' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="animate-fade-in-up relative overflow-hidden rounded-2xl p-4 ring-1 ring-white/[0.07] shadow-card"
          style={{ animationDelay: `${i * 75}ms` }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} via-transparent to-transparent`} />
          <div className={`absolute -right-3 -top-3 w-14 h-14 rounded-full ${stat.glow} blur-xl`} />
          <div className="relative">
            <div className={`text-2xl font-bold tracking-tight animate-count-up ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground/70 mt-1">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
