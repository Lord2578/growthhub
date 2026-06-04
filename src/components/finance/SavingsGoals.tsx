'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <CardTitle className="text-base">{t('finance.goals')}</CardTitle>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 px-2 text-xs font-medium transition-colors">
            <Plus className="w-3 h-3 mr-1" /> {t('finance.add')}
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
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">{t('finance.noGoals')}</p>
        )}
        {goals.map((goal) => {
          const currentConverted = convert(goal.current_amount, goal.currency)
          const targetConverted = convert(goal.target_amount, goal.currency)
          const pct = Math.min(100, Math.round((currentConverted / targetConverted) * 100)) || 0
          const days = daysUntil(goal.deadline, t('finance.overdue'), t('finance.today2'), t('finance.dLeft'))

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{goal.title}</span>
                {days && (
                  <span className={`text-xs ${days === t('finance.overdue') ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {days}
                  </span>
                )}
              </div>
              <Progress value={pct} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{format(currentConverted)} {t('finance.savedLabel')}</span>
                <span>{pct}% {t('finance.pctOf')} {format(targetConverted)}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
