'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SavingsGoal, Currency, CURRENCIES } from '@/types'
import { Plus, Target } from 'lucide-react'

function daysUntil(deadline: string | null, overdue: string, today: string, dLeft: string): string {
  if (!deadline) return ''
  const d = new Date(deadline)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000)
  if (diff < 0) return overdue
  if (diff === 0) return today
  return `${diff}${dLeft}`
}

export function SavingsGoals({ goals, userId }: { goals: SavingsGoal[]; userId: string }) {
  const router = useRouter()
  const { convert, format } = useCurrency()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [deadline, setDeadline] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.from('savings_goals').insert({
      user_id: userId,
      title: title.trim(),
      target_amount: parseFloat(target),
      current_amount: current ? parseFloat(current) : 0,
      currency,
      deadline: deadline || null,
    })
    setOpen(false)
    setTitle('')
    setTarget('')
    setCurrent('')
    setDeadline('')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="animate-fade-in-up rounded-2xl ring-1 ring-white/[0.07] bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-primary shadow-glow-sm">
            <Target className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm">{t('finance.goals')}</span>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary bg-white/[0.04] hover:bg-primary/10 border border-white/[0.07] hover:border-primary/30 px-2.5 py-1.5 rounded-lg transition-all">
              <Plus className="w-3 h-3" /> {t('finance.add')}
            </button>
          </DialogTrigger>
          <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('finance.newGoal')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label>{t('finance.goalTitle')}</Label>
              <Input placeholder="Emergency fund" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <Label>{t('finance.targetAmount')}</Label>
                <Input type="number" min="0" placeholder="5000" value={target} onChange={(e) => setTarget(e.target.value)} required />
              </div>
              <div className="w-24 space-y-1.5">
                <Label>{t('finance.currency')}</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t('finance.currentSaved')}</Label>
              <Input type="number" min="0" placeholder="0" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('finance.deadline')}</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('finance.saving') : t('finance.createGoal')}
            </Button>
          </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-5 space-y-4">
        {goals.length === 0 && (
          <p className="text-sm text-muted-foreground/60 text-center py-4">{t('finance.noGoals')}</p>
        )}
        {goals.map((goal) => {
          const currentConverted = convert(goal.current_amount, goal.currency)
          const targetConverted = convert(goal.target_amount, goal.currency)
          const pct = Math.min(100, Math.round((currentConverted / targetConverted) * 100)) || 0
          const days = daysUntil(goal.deadline, t('finance.overdue'), t('finance.today2'), t('finance.dLeft'))

          return (
            <div key={goal.id} className="space-y-2 p-3 rounded-xl bg-white/[0.02] ring-1 ring-white/[0.05]">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{goal.title}</span>
                {days && (
                  <span className={`text-xs px-2 py-0.5 rounded-md ${
                    days === t('finance.overdue')
                      ? 'text-destructive bg-destructive/10'
                      : 'text-muted-foreground bg-white/[0.04]'
                  }`}>
                    {days}
                  </span>
                )}
              </div>
              <Progress value={pct} className="h-1.5" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{format(currentConverted)} {t('finance.savedLabel')}</span>
                <span className="font-medium text-foreground/70">{pct}% {t('finance.pctOf')} {format(targetConverted)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
