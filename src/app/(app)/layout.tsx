import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { CurrencyProvider } from '@/lib/context/CurrencyContext'
import { LanguageProvider } from '@/lib/context/LanguageContext'
import { Currency } from '@/types'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: settings } = await supabase
    .from('user_settings')
    .select('base_currency')
    .eq('user_id', user.id)
    .single()

  const baseCurrency = (settings?.base_currency ?? 'USD') as Currency

  return (
    <LanguageProvider>
      <CurrencyProvider initialCurrency={baseCurrency}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-56 flex flex-col min-h-screen pb-16 md:pb-0">
            {children}
          </main>
          <BottomNav />
        </div>
      </CurrencyProvider>
    </LanguageProvider>
  )
}
