import { NextResponse } from 'next/server'

const CURRENCIES = ['USD', 'EUR', 'PLN', 'UAH']

// Cache in-memory for serverless (per instance, short-lived)
let cache: { data: Record<string, number>; base: string; ts: number } | null = null
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const base = searchParams.get('base') ?? 'USD'

  if (cache && cache.base === base && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json({ base, rates: cache.data, cached: true })
  }

  // Primary: fawazahmed0/currency-api via jsDelivr — free, no key, no limits, 150+ currencies incl. UAH
  // Fallback: open.er-api.com
  const rates = await tryFawazahmed(base) ?? await tryErApi(base)

  if (!rates) {
    return NextResponse.json({ error: 'All rate sources unavailable' }, { status: 503 })
  }

  cache = { data: rates, base, ts: Date.now() }

  return NextResponse.json(
    { base, rates, cached: false },
    { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=300' } }
  )
}

// https://github.com/fawazahmed0/exchange-api — free, unlimited, daily updates
async function tryFawazahmed(base: string): Promise<Record<string, number> | null> {
  const baseLower = base.toLowerCase()
  // Two mirrors: jsdelivr CDN and direct GitHub
  const urls = [
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseLower}.json`,
    `https://latest.currency-api.pages.dev/v1/currencies/${baseLower}.json`,
  ]
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) continue
      const data = await res.json()
      // Response shape: { date: "...", [baseLower]: { eur: 0.92, uah: 41.0, ... } }
      const ratesRaw = data[baseLower]
      if (!ratesRaw) continue
      const filtered: Record<string, number> = { [base]: 1 }
      for (const c of CURRENCIES) {
        const val = ratesRaw[c.toLowerCase()]
        if (val !== undefined) filtered[c] = val
      }
      // Validate all required currencies are present
      if (CURRENCIES.some((c) => !(c in filtered))) continue
      return filtered
    } catch {
      continue
    }
  }
  return null
}

async function tryErApi(base: string): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(
      `https://open.er-api.com/v6/latest/${base}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.result !== 'success') return null
    const filtered: Record<string, number> = {}
    for (const c of CURRENCIES) {
      if (data.rates[c] !== undefined) filtered[c] = data.rates[c]
    }
    if (CURRENCIES.some((c) => !(c in filtered))) return null
    return filtered
  } catch {
    return null
  }
}
