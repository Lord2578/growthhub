'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { NAV_ITEMS } from '@/lib/nav'
import { useTranslation } from '@/lib/hooks/useTranslation'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen fixed left-0 top-0 z-20 dot-grid">
      {/* gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(224_22%_6%)] via-[hsl(224_20%_5%)] to-[hsl(224_22%_4%)] -z-10" />
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/[0.07] to-transparent" />

      {/* Logo */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-3 px-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-primary shadow-glow-sm shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gradient-primary tracking-tight">GrowthHub</p>
            <p className="text-[10px] text-muted-foreground/70 leading-none mt-0.5">Personal tracker</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, tKey, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* active bg */}
              {active && (
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20" />
              )}
              {/* hover bg */}
              {!active && (
                <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/[0.04] transition-colors" />
              )}
              {/* left accent */}
              {active && (
                <span className="absolute left-0 inset-y-2 w-0.5 rounded-full bg-gradient-primary" />
              )}
              {/* icon */}
              <span className={cn(
                'relative flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200',
                active
                  ? 'bg-gradient-primary shadow-glow-sm'
                  : 'bg-white/[0.05] group-hover:bg-white/[0.08]'
              )}>
                <Icon className={cn('w-3.5 h-3.5', active ? 'text-white' : 'text-muted-foreground group-hover:text-foreground')} />
              </span>
              <span className="relative">{t(tKey)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground w-full transition-all duration-200 hover:text-red-400"
        >
          <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-red-500/[0.08] transition-colors" />
          <span className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.05] group-hover:bg-red-500/10 transition-all">
            <LogOut className="w-3.5 h-3.5" />
          </span>
          <span className="relative">{t('nav.signOut')}</span>
        </button>
      </div>
    </aside>
  )
}
