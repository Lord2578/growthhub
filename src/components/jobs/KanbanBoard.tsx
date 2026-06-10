'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { JobApplication, JobStatus, JOB_STATUSES, Currency, CURRENCIES } from '@/types'
import { exportJobsCSV } from '@/lib/csv'
import { Plus, Building2, Banknote, Download } from 'lucide-react'

const STATUS_COLORS: Record<JobStatus, string> = {
  applied:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  response:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  interview: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  offer:     'bg-green-500/10 text-green-400 border-green-500/20',
  rejected:  'bg-red-500/10 text-red-400 border-red-500/20',
}

function JobCard({ job, onStatusChange }: { job: JobApplication; onStatusChange: (id: string, status: JobStatus) => void }) {
  const { convert, format } = useCurrency()
  const { t } = useTranslation()

  const salary =
    job.salary_min || job.salary_max
      ? (() => {
          const min = job.salary_min ? convert(job.salary_min, job.salary_currency) : null
          const max = job.salary_max ? convert(job.salary_max, job.salary_currency) : null
          if (min && max) return `${format(min)} – ${format(max)}`
          return format(min ?? max ?? 0)
        })()
      : null

  return (
    <div className="rounded-xl p-3 ring-1 ring-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:ring-white/[0.12] transition-all space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium leading-tight">{job.position}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground/70 mt-0.5">
            <Building2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{job.company}</span>
          </div>
        </div>
        <Select value={job.status} onValueChange={(v) => onStatusChange(job.id, v as JobStatus)}>
          <SelectTrigger className="h-6 w-24 text-xs border-0 bg-transparent p-0 pr-2 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JOB_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">{t(`jobs.status.${s}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {salary && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
          <Banknote className="w-3 h-3" />
          {salary}/mo
        </div>
      )}
      {job.notes && (
        <p className="text-xs text-muted-foreground/60 line-clamp-2">{job.notes}</p>
      )}
      <div className="text-xs text-muted-foreground/50">
        {new Date(job.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </div>
    </div>
  )
}

function AddJobDialog({ userId, onAdd }: { userId: string; onAdd: (job: JobApplication) => void }) {
  const router = useRouter()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [salaryCurrency, setSalaryCurrency] = useState<Currency>('USD')
  const [notes, setNotes] = useState('')
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('job_applications')
      .insert({
        user_id: userId,
        company: company.trim(),
        position: position.trim(),
        salary_min: salaryMin ? parseFloat(salaryMin) : null,
        salary_max: salaryMax ? parseFloat(salaryMax) : null,
        salary_currency: salaryCurrency,
        notes: notes.trim() || null,
        applied_date: appliedDate,
        status: 'applied',
      })
      .select()
      .single()

    if (data) {
      onAdd(data)
      setOpen(false)
      setCompany('')
      setPosition('')
      setSalaryMin('')
      setSalaryMax('')
      setNotes('')
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-xl bg-gradient-primary text-white shadow-glow-sm hover:shadow-glow-primary h-9 px-4 text-sm font-medium transition-all">
        <Plus className="w-4 h-4 mr-1.5" /> {t('jobs.addApplication')}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('jobs.newApplication')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label>{t('jobs.company')}</Label>
            <Input placeholder="Acme Corp" value={company} onChange={(e) => setCompany(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>{t('jobs.position')}</Label>
            <Input placeholder="Frontend Developer" value={position} onChange={(e) => setPosition(e.target.value)} required />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label>{t('jobs.salaryMin')}</Label>
              <Input type="number" min="0" placeholder="3000" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label>{t('jobs.salaryMax')}</Label>
              <Input type="number" min="0" placeholder="5000" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
            </div>
            <div className="w-20 space-y-1.5">
              <Label>{t('finance.currency')}</Label>
              <Select value={salaryCurrency} onValueChange={(v) => setSalaryCurrency(v as Currency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t('jobs.appliedDate')}</Label>
            <Input type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('jobs.notes')}</Label>
            <Input placeholder="Referral from John, remote-friendly..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('finance.saving') : t('jobs.addApplication')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function KanbanBoard({ initialJobs, userId }: { initialJobs: JobApplication[]; userId: string }) {
  const [jobs, setJobs] = useState(initialJobs)
  const { t } = useTranslation()

  async function handleStatusChange(id: string, status: JobStatus) {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)))
    const supabase = createClient()
    await supabase.from('job_applications').update({ status }).eq('id', id)
  }

  function handleAdd(job: JobApplication) {
    setJobs((prev) => [job, ...prev])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{t('jobs.board')}</h3>
        <div className="flex items-center gap-2">
          {jobs.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => exportJobsCSV(jobs)}
              title={t('common.exportCSV')}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          <AddJobDialog userId={userId} onAdd={handleAdd} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto">
        {JOB_STATUSES.map((status) => {
          const statusJobs = jobs.filter((j) => j.status === status)

          return (
            <div key={status} className="min-w-[180px]">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border mb-3 ${STATUS_COLORS[status]}`}>
                <span className="text-xs font-semibold">{t(`jobs.status.${status}`)}</span>
                <span className="text-xs opacity-60 ml-auto font-medium">{statusJobs.length}</span>
              </div>
              <div className="space-y-2">
                {statusJobs.map((job) => (
                  <JobCard key={job.id} job={job} onStatusChange={handleStatusChange} />
                ))}
                {statusJobs.length === 0 && (
                  <div className="h-16 rounded-xl border border-dashed border-white/[0.08] flex items-center justify-center">
                    <span className="text-xs text-muted-foreground/40">{t('jobs.empty')}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
