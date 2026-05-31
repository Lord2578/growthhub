import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { HabitChecklist } from '@/components/habits/HabitChecklist'
import { HabitStats } from '@/components/habits/HabitStats'

export default async function HabitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

  const [{ data: habits }, { data: todayLogs }, { data: recentLogs }] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', user.id).order('order_index'),
    supabase.from('habit_logs').select('*').eq('user_id', user.id).eq('date', today),
    supabase.from('habit_logs').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgoStr),
  ])

  return (
    <div className="flex flex-col">
      <Header title="Habits" />
      <div className="p-4 md:p-6 max-w-2xl space-y-6">
        <HabitChecklist
          initialHabits={habits ?? []}
          todayLogs={todayLogs ?? []}
          userId={user.id}
          today={today}
        />
        <HabitStats
          habits={habits ?? []}
          recentLogs={recentLogs ?? []}
        />
      </div>
    </div>
  )
}
