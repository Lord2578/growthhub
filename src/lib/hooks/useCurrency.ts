'use client'

import { useContext } from 'react'
import { CurrencyContext } from '@/lib/context/CurrencyContext'

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider')
  return ctx
}
