'use client'

import React, { createContext, useCallback, useEffect, useState } from 'react'
import { Currency, ExchangeRates } from '@/types'
import { fetchExchangeRates, convertAmount, formatCurrency, formatUpdatedAt } from '@/lib/currency'

interface CurrencyContextValue {
  baseCurrency: Currency
  setBaseCurrency: (c: Currency) => void
  rates: ExchangeRates | null
  ratesError: string | undefined
  isLoading: boolean
  convert: (amount: number, from: Currency) => number
  format: (amount: number, currency?: Currency) => string
  lastUpdated: string
  refresh: () => void
}

export const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({
  children,
  initialCurrency = 'USD',
}: {
  children: React.ReactNode
  initialCurrency?: Currency
}) {
  const [baseCurrency, setBaseCurrencyState] = useState<Currency>(initialCurrency)
  const [rates, setRates] = useState<ExchangeRates | null>(null)
  const [ratesError, setRatesError] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  const loadRates = useCallback(async (currency: Currency) => {
    setIsLoading(true)
    const { rates: r, error } = await fetchExchangeRates(currency)
    setRates(r)
    setRatesError(error)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadRates(baseCurrency)
  }, [baseCurrency, loadRates])

  const setBaseCurrency = useCallback(
    (c: Currency) => {
      setBaseCurrencyState(c)
    },
    []
  )

  const convert = useCallback(
    (amount: number, from: Currency): number => {
      if (!rates) return amount
      return convertAmount(amount, from, baseCurrency, rates)
    },
    [rates, baseCurrency]
  )

  const format = useCallback(
    (amount: number, currency?: Currency): string => {
      return formatCurrency(amount, currency ?? baseCurrency)
    },
    [baseCurrency]
  )

  const lastUpdated = rates?.updatedAt ? formatUpdatedAt(rates.updatedAt) : 'never'

  return (
    <CurrencyContext.Provider
      value={{
        baseCurrency,
        setBaseCurrency,
        rates,
        ratesError,
        isLoading,
        convert,
        format,
        lastUpdated,
        refresh: () => loadRates(baseCurrency),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}
