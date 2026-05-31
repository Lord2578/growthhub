import { Currency, ExchangeRates, CURRENCY_SYMBOLS } from '@/types'

const CACHE_KEY = 'exchange_rates_cache'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

// Fallback rates relative to USD
const FALLBACK_RATES: Record<string, number> = {
  EUR: 0.92,
  PLN: 4.0,
  UAH: 41.0,
  USD: 1.0,
}

function getCached(): ExchangeRates | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached: ExchangeRates = JSON.parse(raw)
    if (Date.now() - cached.updatedAt < CACHE_TTL) return cached
    return null
  } catch {
    return null
  }
}

function setCache(rates: ExchangeRates) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates))
  } catch {
    // storage full or unavailable
  }
}

export function getCachedRates(): ExchangeRates | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function fetchExchangeRates(baseCurrency: Currency = 'USD'): Promise<{
  rates: ExchangeRates
  fromCache: boolean
  error?: string
}> {
  const cached = getCached()
  if (cached && cached.base === baseCurrency) {
    return { rates: cached, fromCache: true }
  }

  try {
    const targets = (['USD', 'EUR', 'PLN', 'UAH'] as Currency[])
      .filter((c) => c !== baseCurrency)
      .join(',')

    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targets}`,
      { signal: AbortSignal.timeout(5000) }
    )

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    const ratesWithBase = { ...data.rates, [baseCurrency]: 1 }

    const result: ExchangeRates = {
      base: baseCurrency,
      rates: ratesWithBase,
      updatedAt: Date.now(),
    }

    setCache(result)
    return { rates: result, fromCache: false }
  } catch {
    // Use last cached (possibly stale) or fallback
    const stale = getCachedRates()
    if (stale) {
      return { rates: stale, fromCache: true, error: 'Using cached rates (API unavailable)' }
    }

    // Build fallback rates relative to baseCurrency
    const baseToUSD = 1 / (FALLBACK_RATES[baseCurrency] ?? 1)
    const fallbackRates: Record<string, number> = {}
    for (const [currency, usdRate] of Object.entries(FALLBACK_RATES)) {
      fallbackRates[currency] = usdRate * baseToUSD
    }
    fallbackRates[baseCurrency] = 1

    const fallback: ExchangeRates = {
      base: baseCurrency,
      rates: fallbackRates,
      updatedAt: 0,
    }

    return { rates: fallback, fromCache: false, error: 'Using fallback rates (API unavailable)' }
  }
}

export function convertAmount(
  amount: number,
  from: Currency,
  to: Currency,
  rates: ExchangeRates
): number {
  if (from === to) return amount

  // Convert: from → base → to
  // rates are relative to `rates.base`
  const base = rates.base

  let amountInBase: number
  if (from === base) {
    amountInBase = amount
  } else {
    const fromRate = rates.rates[from]
    if (!fromRate) return amount
    // If base is USD and from is EUR: amountInBase = amount / rates.EUR (rates[EUR] = EUR per USD = 0.92)
    // Actually rates from frankfurter: from=USD gives rates={EUR: 0.92, ...} meaning 1 USD = 0.92 EUR
    // So to go from EUR to USD: amount / 0.92
    amountInBase = amount / fromRate
  }

  if (to === base) return amountInBase

  const toRate = rates.rates[to]
  if (!toRate) return amountInBase

  return amountInBase * toRate
}

export function convertFromUSD(amountUSD: number, to: Currency, rates: ExchangeRates): number {
  return convertAmount(amountUSD, 'USD', to, rates)
}

export function convertToUSD(amount: number, from: Currency, rates: ExchangeRates): number {
  return convertAmount(amount, from, 'USD', rates)
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency]
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)

  if (currency === 'PLN' || currency === 'UAH') {
    return `${formatted} ${symbol}`
  }
  return `${symbol}${formatted}`
}

export function formatUpdatedAt(timestamp: number): string {
  if (!timestamp) return 'never'
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(new Date(timestamp))
}
