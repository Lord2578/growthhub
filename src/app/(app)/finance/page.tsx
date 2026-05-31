import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { IncomeForm } from '@/components/finance/IncomeForm'
import { ExpenseForm } from '@/components/finance/ExpenseForm'
import { MonthlyChart } from '@/components/finance/MonthlyChart'
import { SavingsGoals } from '@/components/finance/SavingsGoals'
import { ExpensePie } from '@/components/finance/ExpensePie'
import { MonthSelector } from '@/components/finance/MonthSelector'

export default async function FinancePage({
  searchParams,
}: {
  searchParams: { month?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date()
  const selectedMonth = searchParams.month ?? today.toISOString().slice(0, 7)
  const monthStart = `${selectedMonth}-01`

  const [
    { data: income },
    { data: expenses },
    { data: goals },
    { data: allIncome },
  ] = await Promise.all([
    supabase.from('monthly_income').select('*').eq('user_id', user.id).eq('month', monthStart).single(),
    supabase.from('expenses').select('*').eq('user_id', user.id).gte('date', monthStart).lt('date', getNextMonth(monthStart)).order('date', { ascending: false }),
    supabase.from('savings_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('monthly_income').select('*').eq('user_id', user.id).order('month', { ascending: false }).limit(6),
  ])

  return (
    <div className="flex flex-col">
      <Header title="Finance" />
      <div className="p-4 md:p-6 space-y-6">
        <MonthSelector currentMonth={selectedMonth} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeForm userId={user.id} currentIncome={income} selectedMonth={monthStart} />
          <ExpenseForm userId={user.id} selectedMonth={monthStart} />
        </div>

        <MonthlyChart income={allIncome ?? []} expenses={expenses ?? []} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpensePie expenses={expenses ?? []} />
          <SavingsGoals goals={goals ?? []} userId={user.id} />
        </div>
      </div>
    </div>
  )
}

function getNextMonth(monthStart: string): string {
  const d = new Date(monthStart)
  d.setMonth(d.getMonth() + 1)
  return d.toISOString().split('T')[0]
}
