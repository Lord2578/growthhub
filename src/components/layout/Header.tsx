'use client'

import { RefreshCw, AlertTriangle } from 'lucide-react'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { CURRENCIES, Currency } from '@/types'
import { Button } from '@/components/ui/button'

export function Header({ title }: { title: string }) {
  const { baseCurrency, setBaseCurrency, lastUpdated, ratesError, isLoading, refresh } = useCurrency()

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
      <h2 className="text-lg font-semibold">{title}</h2>

      <div className="flex items-center gap-2">
        {ratesError && (
          <div title={ratesError}>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </div>
        )}

        <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setBaseCurrency(c as Currency)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                baseCurrency === c
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7"
          onClick={refresh}
          disabled={isLoading}
          title={`Rates updated: ${lastUpdated}`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </header>
  )
}
