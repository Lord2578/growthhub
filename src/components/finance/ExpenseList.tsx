'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { convertToUSD } from '@/lib/currency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Expense, Currency, CURRENCIES, ExpenseCategory, EXPENSE_CATEGORIES } from '@/types'
import { Trash2, Receipt, Pencil } from 'lucide-react'

export function ExpenseList({ initialExpenses }: { initialExpenses: Expense[] }) {
  const router = useRouter()
  const { convert, format, rates } = useCurrency()
  const { t } = useTranslation()
  const [expenses, setExpenses] = useState(initialExpenses)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editing, setEditing] = useState<Expense | null>(null)

  // Edit form state
  const [editAmount, setEditAmount] = useState('')
  const [editCurrency, setEditCurrency] = useState<Currency>('USD')
  const [editCategory, setEditCategory] = useState<ExpenseCategory>('food')
  const [editNote, setEditNote] = useState('')
  const [editDate, setEditDate] = useState('')
  const [saving, setSaving] = useState(false)

  function openEdit(expense: Expense) {
    setEditing(expense)
    setEditAmount(expense.amount.toString())
    setEditCurrency(expense.currency)
    setEditCategory(expense.category)
    setEditNote(expense.note ?? '')
    setEditDate(expense.date)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    const supabase = createClient()
    await supabase.from('expenses').delete().eq('id', id)
    setDeleting(null)
    router.refresh()
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing || !rates) return
    setSaving(true)

    const amountNum = parseFloat(editAmount)
    const amountUsd = convertToUSD(amountNum, editCurrency, rates)

    const supabase = createClient()
    await supabase.from('expenses').update({
      amount: amountNum,
      currency: editCurrency,
      amount_usd: amountUsd,
      category: editCategory,
      note: editNote.trim() || null,
      date: editDate,
    }).eq('id', editing.id)

    setSaving(false)
    setEditing(null)
    router.refresh()
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            {t('finance.expenses')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">{t('finance.noExpenses')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              {t('finance.expenses')}
            </CardTitle>
            <span className="text-xs text-muted-foreground">{expenses.length} {t('finance.items')}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className={`flex items-center justify-between px-6 py-3 transition-opacity ${
                  deleting === expense.id ? 'opacity-40' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{t(`categories.${expense.category}`)}</span>
                      {expense.note && (
                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                          {expense.note}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {format(convert(expense.amount_usd, 'USD'))}
                    </div>
                    {expense.currency !== 'USD' && (
                      <div className="text-xs text-muted-foreground">
                        {expense.amount} {expense.currency}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => openEdit(expense)}
                    className="text-muted-foreground hover:text-primary transition-colors p-1 rounded"
                    aria-label="Edit expense"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={deleting === expense.id}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                    aria-label="Delete expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('finance.editExpense')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-3 mt-2">
            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <Label>{t('finance.amount')}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  required
                />
              </div>
              <div className="w-24 space-y-1.5">
                <Label>{t('finance.currency')}</Label>
                <Select value={editCurrency} onValueChange={(v) => setEditCurrency(v as Currency)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t('finance.category')}</Label>
              <Select value={editCategory} onValueChange={(v) => setEditCategory(v as ExpenseCategory)}>
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
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="w-36 space-y-1.5">
                <Label>{t('finance.date')}</Label>
                <Input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={saving || !rates}>
                {saving ? t('finance.saving') : t('finance.saveChanges')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
