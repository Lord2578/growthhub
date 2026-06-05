'use client'

import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { CURRENCIES, CURRENCY_SYMBOLS } from '@/types'
import { RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react'

export function ExchangeRatesPanel() {
  const { rates, ratesError, isLoading, lastUpdated, refresh, baseCurrency } = useCurrency()
  const { t } = useTranslation()

  const otherCurrencies = CURRENCIES.filter((c) => c !== baseCurrency)

  return (
    <div className="animate-fade-in-up rounded-2xl ring-1 ring-white/[0.07] bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-primary shadow-glow-sm">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm">{t('settings.exchangeRates')}</span>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading} className="h-7 text-xs">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          {t('settings.refresh')}
        </Button>
      </div>
      <div className="p-5 space-y-3">
        {ratesError && (
          <div className="flex items-center gap-2 text-sm text-yellow-500 bg-yellow-500/10 ring-1 ring-yellow-500/20 rounded-xl px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{ratesError}</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground/70">
          {t('settings.base')} <span className="font-semibold text-foreground">{baseCurrency}</span>
          {' — '}1 {baseCurrency} = ...
        </div>

        {rates ? (
          <div className="space-y-2">
            {otherCurrencies.map((currency) => {
              const rate = rates.rates[currency]
              if (!rate) return null
              return (
                <div
                  key={currency}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06] hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.06] text-base font-bold">
                      {CURRENCY_SYMBOLS[currency]}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{currency}</div>
                      <div className="text-xs text-muted-foreground/60">
                        {currency === 'EUR' && 'Euro'}
                        {currency === 'USD' && 'US Dollar'}
                        {currency === 'PLN' && 'Polish Zloty'}
                        {currency === 'UAH' && 'Ukrainian Hryvnia'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    {rate.toFixed(4)}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground/50 text-center py-4">{t('settings.loadingRates')}</div>
        )}

        <div className="text-xs text-muted-foreground/50 flex items-center gap-1.5 pt-1">
          <span>{t('settings.lastUpdated')}</span>
          <span className="bg-white/[0.06] text-muted-foreground px-2 py-0.5 rounded-md">{lastUpdated}</span>
          <span>• {t('settings.cachedFor')}</span>
        </div>

        <div className="text-xs text-muted-foreground/50">
          {t('settings.ratesBy')}{' '}
          <span className="text-primary/70">frankfurter.app</span>
        </div>
      </div>
    </div>
  )
}
