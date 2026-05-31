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

  const targets = CURRENCIES.filter((c) => c !== base).join(',')

  // Try frankfurter.app first
  const rates = await tryFrankfurter(base, targets) ?? await tryErApi(base)

  if (!rates) {
    return NextResponse.json({ error: 'All rate sources unavailable' }, { status: 503 })
  }

  cache = { data: rates, base, ts: Date.now() }

  return NextResponse.json(
    { base, rates, cached: false },
    { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=300' } }
  )
}

async function tryFrankfurter(base: string, targets: string): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${base}&to=${targets}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    return { ...data.rates, [base]: 1 }
  } catch {
    return null
  }
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
    return filtered
  } catch {
    return null
  }
}
