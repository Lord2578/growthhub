import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { SettingsForm } from '@/components/settings/SettingsForm'
import { ExchangeRatesPanel } from '@/components/settings/ExchangeRatesPanel'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="flex flex-col">
      <Header title="Settings" />
      <div className="p-4 md:p-6 max-w-2xl space-y-6">
        <SettingsForm settings={settings} userId={user.id} userEmail={user.email ?? ''} />
        <ExchangeRatesPanel />
      </div>
    </div>
  )
}
