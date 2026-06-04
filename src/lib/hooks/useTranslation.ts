'use client'

import { useContext } from 'react'
import { LanguageContext } from '@/lib/context/LanguageContext'

export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useTranslation must be used inside LanguageProvider')
  return ctx
}
