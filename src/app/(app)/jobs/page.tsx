import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { KanbanBoard } from '@/components/jobs/KanbanBoard'
import { JobStats } from '@/components/jobs/JobStats'

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: jobs } = await supabase
    .from('job_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col">
      <Header title="Job Search" />
      <div className="p-4 md:p-6 space-y-6">
        <JobStats jobs={jobs ?? []} />
        <KanbanBoard initialJobs={jobs ?? []} userId={user.id} />
      </div>
    </div>
  )
}
