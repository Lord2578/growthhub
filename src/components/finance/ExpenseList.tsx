'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { convertToUSD } from '@/lib/currency'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Expense, Currency, CURRENCIES, ExpenseCategory, EXPENSE_CATEGORIES } from '@/types'
import { exportExpensesCSV } from '@/lib/csv'
import { Trash2, Receipt, Pencil, Download } from 'lucide-react'

export function ExpenseList({ initialExpenses }: { initialExpenses: Expense[] }) {
  const router = useRouter()
  const { convert, format, rates } = useCurrency()
  const { t } = useTranslation()
  const [expenses, setExpenses] = useState(initialExpenses)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editing, setEditing] = useState<Expense | null>(null)
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

  const empty = (
    <div className="rounded-2xl ring-1 ring-white/[0.07] bg-card shadow-card p-8 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.07] mx-auto mb-3">
        <Receipt className="w-5 h-5 text-muted-foreground/50" />
      </div>
      <p className="text-sm text-muted-foreground/60">{t('finance.noExpenses')}</p>
    </div>
  )

  if (expenses.length === 0) return empty

  return (
    <>
      <div className="rounded-2xl ring-1 ring-white/[0.07] bg-card shadow-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.06]">
              <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="font-semibold text-sm">{t('finance.expenses')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground/60 bg-white/[0.04] px-2.5 py-1 rounded-lg">
              {expenses.length} {t('finance.items')}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => exportExpensesCSV(expenses)}
              title={t('common.exportCSV')}
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-white/[0.04]">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className={`flex items-center justify-between px-5 py-3.5 transition-all duration-200 hover:bg-white/[0.02] group ${
                deleting === expense.id ? 'opacity-30' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t(`categories.${expense.category}`)}</span>
                    {expense.note && (
                      <span className="text-xs text-muted-foreground/50 truncate max-w-[120px]">
                        {expense.note}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground/50 mt-0.5">
                    {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-semibold">{format(convert(expense.amount_usd, 'USD'))}</div>
                  {expense.currency !== 'USD' && (
                    <div className="text-xs text-muted-foreground/50">{expense.amount} {expense.currency}</div>
                  )}
                </div>
                <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(expense)}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={deleting === expense.id}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('finance.editExpense')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-3 mt-2">
            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <Label>{t('finance.amount')}</Label>
                <Input type="number" min="0" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} required />
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
                <Input value={editNote} onChange={(e) => setEditNote(e.target.value)} maxLength={100} />
              </div>
              <div className="w-36 space-y-1.5">
                <Label>{t('finance.date')}</Label>
                <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
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
