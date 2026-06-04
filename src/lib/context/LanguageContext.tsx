'use client'

import React, { createContext, useCallback, useEffect, useState } from 'react'
import { translations, Language } from '@/lib/i18n/translations'

interface LanguageContextValue {
  lang: Language
  setLang: (l: Language) => void
  t: (key: string) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Language | null
    if (stored === 'uk' || stored === 'en') setLangState(stored)
  }, [])

  const setLang = useCallback((l: Language) => {
    setLangState(l)
    localStorage.setItem('lang', l)
  }, [])

  const t = useCallback(
    (key: string): string => {
      const keys = key.split('.')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = translations[lang]
      for (const k of keys) {
        if (current && typeof current === 'object') {
          current = current[k]
        } else {
          return key
        }
      }
      return typeof current === 'string' ? current : key
    },
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
