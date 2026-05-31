'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Expense } from '@/types'
import { Trash2, Receipt } from 'lucide-react'

export function ExpenseList({ initialExpenses }: { initialExpenses: Expense[] }) {
  const router = useRouter()
  const { convert, format } = useCurrency()
  const [expenses, setExpenses] = useState(initialExpenses)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleting(id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    const supabase = createClient()
    await supabase.from('expenses').delete().eq('id', id)
    setDeleting(null)
    router.refresh()
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">No expenses this month.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Expenses
          </CardTitle>
          <span className="text-xs text-muted-foreground">{expenses.length} items</span>
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
                    <span className="text-sm font-medium capitalize">{expense.category}</span>
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
  )
}
