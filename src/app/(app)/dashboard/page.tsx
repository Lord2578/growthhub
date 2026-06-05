import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/getUser'
import { Header } from '@/components/layout/Header'
import { OverviewCards } from '@/components/dashboard/OverviewCards'
import { StreakCards } from '@/components/dashboard/StreakCards'
import { TodayTasks } from '@/components/dashboard/TodayTasks'
import { SalaryProgress } from '@/components/dashboard/SalaryProgress'

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) return null
  const supabase = await createClient()

  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split('T')[0]

  const [
    { data: settings },
    { data: income },
    { data: expenses },
    { data: streaks },
    { data: tasks },
    { data: goals },
  ] = await Promise.all([
    supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
    supabase.from('monthly_income').select('*').eq('user_id', user.id).eq('month', monthStart).single(),
    supabase.from('expenses').select('*').eq('user_id', user.id).gte('date', monthStart),
    supabase.from('growth_streaks').select('*').eq('user_id', user.id),
    supabase.from('daily_tasks').select('*').eq('user_id', user.id).eq('date', today.toISOString().split('T')[0]),
    supabase.from('savings_goals').select('*').eq('user_id', user.id).order('deadline', { ascending: true }).limit(1),
  ])

  return (
    <div className="flex flex-col">
      <Header title={`Hey, ${settings?.name || 'there'} 👋`} />
      <div className="p-4 md:p-6 space-y-6">
        <OverviewCards
          income={income}
          expenses={expenses ?? []}
          settings={settings}
        />
        <SalaryProgress settings={settings} />
        <StreakCards streaks={streaks ?? []} />
        <TodayTasks
          initialTasks={tasks ?? []}
          userId={user.id}
          nextGoalDeadline={goals?.[0]?.deadline ?? null}
        />
      </div>
    </div>
  )
}
