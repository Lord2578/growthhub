import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { GrowthSection } from '@/components/growth/GrowthSection'
import { GROWTH_AREAS } from '@/types'

export default async function GrowthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]

  const [{ data: streaks }, { data: tasks }] = await Promise.all([
    supabase.from('growth_streaks').select('*').eq('user_id', user.id),
    supabase.from('daily_tasks').select('*').eq('user_id', user.id).eq('date', today),
  ])

  return (
    <div className="flex flex-col">
      <Header title="Growth" />
      <div className="p-4 md:p-6 space-y-6">
        {GROWTH_AREAS.map((area) => {
          const streak = streaks?.find((s) => s.area === area) ?? null
          const areaTasks = tasks?.filter((t) => t.area === area) ?? []
          return (
            <GrowthSection
              key={area}
              area={area}
              streak={streak}
              tasks={areaTasks}
              userId={user.id}
              today={today}
            />
          )
        })}
      </div>
    </div>
  )
}
