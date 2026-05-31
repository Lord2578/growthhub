'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { convertToUSD } from '@/lib/currency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Currency, CURRENCIES, ExpenseCategory, EXPENSE_CATEGORIES } from '@/types'
import { Plus } from 'lucide-react'

export function ExpenseForm({ userId }: { userId: string; selectedMonth: string }) {
  const router = useRouter()
  const { rates } = useCurrency()
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
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Plus className="w-4 h-4 text-red-500" />
        <CardTitle className="text-base">Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label>Amount</Label>
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
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Label>Note (optional)</Label>
              <Input
                placeholder="e.g. Groceries"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="w-36 space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !rates}>
            {loading ? 'Adding...' : 'Add Expense'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
