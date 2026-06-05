'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/nav'
import { useTranslation } from '@/lib/hooks/useTranslation'

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useTranslation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/[0.06]">
      <div className="flex">
        {NAV_ITEMS.map(({ href, tKey, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-all duration-200 relative',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-primary" />
              )}
              <span className={cn(
                'flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200',
                active ? 'bg-primary/15' : ''
              )}>
                <Icon className={cn('w-4.5 h-4.5', active ? 'text-primary' : '')} style={{ width: '18px', height: '18px' }} />
              </span>
              <span className="hidden xs:block">{t(tKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
