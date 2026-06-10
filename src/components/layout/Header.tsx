'use client'

import { RefreshCw, AlertTriangle } from 'lucide-react'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/lib/nav'
import { CURRENCIES, Currency } from '@/types'
import { Button } from '@/components/ui/button'

export function Header({ title }: { title?: string }) {
  const { baseCurrency, setBaseCurrency, lastUpdated, ratesError, isLoading, refresh } = useCurrency()
  const { t } = useTranslation()
  const pathname = usePathname()
  const routeTKey = NAV_ITEMS.find(item => item.href === pathname)?.tKey
  const displayTitle = title ?? (routeTKey ? t(routeTKey) : '')

  return (
    <header className="flex items-center justify-between px-5 py-3.5 sticky top-0 z-10 glass border-b border-white/[0.06] gap-3">
      <h2 className="text-lg font-semibold tracking-tight min-w-0 truncate">{displayTitle}</h2>

      <div className="flex items-center gap-2 shrink-0">
        {ratesError && (
          <div title={ratesError} className="text-yellow-400/80">
            <AlertTriangle className="w-4 h-4" />
          </div>
        )}

        {/* Currency switcher */}
        <div className="flex items-center gap-0.5 bg-white/[0.05] border border-white/[0.07] rounded-xl p-1">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setBaseCurrency(c as Currency)}
              className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                baseCurrency === c
                  ? 'bg-gradient-primary text-white shadow-glow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.06]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={refresh}
          disabled={isLoading}
          title={`Rates updated: ${lastUpdated}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </header>
  )
}
