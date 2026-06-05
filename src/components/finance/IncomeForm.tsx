'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MonthlyIncome, Currency, CURRENCIES } from '@/types'
import { TrendingUp, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/hooks/useTranslation'

interface Props {
  userId: string
  currentIncome: MonthlyIncome | null
  selectedMonth: string
}

export function IncomeForm({ userId, currentIncome, selectedMonth }: Props) {
  const router = useRouter()
  const { t } = useTranslation()
  const [amount, setAmount] = useState(currentIncome?.amount?.toString() ?? '')
  const [currency, setCurrency] = useState<Currency>((currentIncome?.currency as Currency) ?? 'USD')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount) return
    setLoading(true)

    const supabase = createClient()
    await supabase.from('monthly_income').upsert({
      user_id: userId,
      amount: parseFloat(amount),
      currency,
      month: selectedMonth,
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!currentIncome) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('monthly_income').delete().eq('id', currentIncome.id)
    setAmount('')
    setDeleting(false)
    router.refresh()
  }

  return (
    <div className="animate-fade-in-up rounded-2xl ring-1 ring-white/[0.07] bg-card shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/20">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <span className="font-semibold text-sm">{t('finance.addIncome')}</span>
      </div>
      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="income-amount">{t('finance.amount')}</Label>
              <Input
                id="income-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="3000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="w-28 space-y-1.5">
              <Label>{t('finance.currency')}</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {saved ? t('finance.saved') : loading ? t('finance.saving') : currentIncome ? t('finance.updateIncome') : t('finance.setIncome')}
            </Button>
            {currentIncome && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleDelete}
                disabled={deleting}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
