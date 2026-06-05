'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { convertToUSD } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Currency, CURRENCIES, ExpenseCategory, EXPENSE_CATEGORIES } from '@/types'
import { Receipt } from 'lucide-react'

export function ExpenseForm({ userId }: { userId: string; selectedMonth: string }) {
  const router = useRouter()
  const { rates } = useCurrency()
  const { t } = useTranslation()
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [category, setCategory] = useState<ExpenseCategory>('food')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !rates) return
    setLoading(true)

    const amountNum = parseFloat(amount)
    const amountUsd = convertToUSD(amountNum, currency, rates)

    const supabase = createClient()
    await supabase.from('expenses').insert({
      user_id: userId,
      amount: amountNum,
      currency,
      amount_usd: amountUsd,
      category,
      note: note.trim() || null,
      date,
    })

    setAmount('')
    setNote('')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="animate-fade-in-up rounded-2xl ring-1 ring-white/[0.07] bg-card shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/15 ring-1 ring-rose-500/20">
          <Receipt className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <span className="font-semibold text-sm">{t('finance.addExpense')}</span>
      </div>
      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label>{t('finance.amount')}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
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
            <Label>{t('finance.category')}</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{t(`categories.${c}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label>{t('finance.note')}</Label>
              <Input
                placeholder="e.g. Groceries"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="w-36 space-y-1.5">
              <Label>{t('finance.date')}</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !rates}>
            {loading ? t('finance.adding') : t('finance.addExpense')}
          </Button>
        </form>
      </div>
    </div>
  )
}
