'use client'

import { useCurrency } from '@/lib/hooks/useCurrency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CURRENCIES, CURRENCY_SYMBOLS } from '@/types'
import { RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react'

export function ExchangeRatesPanel() {
  const { rates, ratesError, isLoading, lastUpdated, refresh, baseCurrency } = useCurrency()

  const otherCurrencies = CURRENCIES.filter((c) => c !== baseCurrency)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <CardTitle className="text-base">Exchange Rates</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading} className="h-7 text-xs">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {ratesError && (
          <div className="flex items-center gap-2 text-sm text-yellow-500 bg-yellow-500/10 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{ratesError}</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Base: <span className="font-medium text-foreground">{baseCurrency}</span>
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
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-muted-foreground">
                      {CURRENCY_SYMBOLS[currency]}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{currency}</div>
                      <div className="text-xs text-muted-foreground">
                        {currency === 'EUR' && 'Euro'}
                        {currency === 'USD' && 'US Dollar'}
                        {currency === 'PLN' && 'Polish Zloty'}
                        {currency === 'UAH' && 'Ukrainian Hryvnia'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {rate.toFixed(4)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">Loading rates...</div>
        )}

        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span>Last updated:</span>
          <Badge variant="secondary" className="text-xs">{lastUpdated}</Badge>
          <span className="ml-1">• Cached for 1 hour</span>
        </div>

        <div className="text-xs text-muted-foreground">
          Rates provided by{' '}
          <span className="text-primary">frankfurter.app</span>
        </div>
      </CardContent>
    </Card>
  )
}
