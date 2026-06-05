'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserSettings, Currency, CURRENCIES } from '@/types'
import { Language } from '@/lib/i18n/translations'
import { User } from 'lucide-react'

interface Props {
  settings: UserSettings | null
  userId: string
  userEmail: string
}

export function SettingsForm({ settings, userId, userEmail }: Props) {
  const router = useRouter()
  const { setBaseCurrency } = useCurrency()
  const { t, lang, setLang } = useTranslation()

  const [name, setName] = useState(settings?.name ?? '')
  const [currentSalary, setCurrentSalary] = useState(settings?.current_salary?.toString() ?? '')
  const [targetSalary, setTargetSalary] = useState(settings?.target_salary?.toString() ?? '')
  const [salaryCurrency, setSalaryCurrency] = useState<Currency>((settings?.salary_currency as Currency) ?? 'USD')
  const [baseCurrency, setBaseCurrencyLocal] = useState<Currency>((settings?.base_currency as Currency) ?? 'USD')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    await supabase.from('user_settings').upsert({
      user_id: userId,
      name: name.trim() || null,
      current_salary: currentSalary ? parseFloat(currentSalary) : null,
      target_salary: targetSalary ? parseFloat(targetSalary) : null,
      salary_currency: salaryCurrency,
      base_currency: baseCurrency,
    }, { onConflict: 'user_id' })

    setBaseCurrency(baseCurrency)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="animate-fade-in-up rounded-2xl ring-1 ring-white/[0.07] bg-card shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-primary shadow-glow-sm">
          <User className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-semibold text-sm">{t('settings.profile')}</span>
      </div>
      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label>{t('settings.email')}</Label>
            <Input value={userEmail} disabled className="opacity-50" />
          </div>

          <div className="space-y-1.5">
            <Label>{t('settings.displayName')}</Label>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('settings.language')}</Label>
            <div className="flex gap-2">
              {(['en', 'uk'] as Language[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    lang === l
                      ? 'bg-primary/15 ring-1 ring-primary/40 text-primary'
                      : 'bg-white/[0.03] ring-1 ring-white/[0.07] text-muted-foreground hover:ring-white/[0.15] hover:text-foreground'
                  }`}
                >
                  {l === 'en' ? '🇬🇧 English' : '🇺🇦 Українська'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('settings.baseCurrency')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBaseCurrencyLocal(c)}
                  className={`p-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    baseCurrency === c
                      ? 'bg-primary/15 ring-1 ring-primary/40 text-primary'
                      : 'bg-white/[0.03] ring-1 ring-white/[0.07] text-muted-foreground hover:ring-white/[0.15] hover:text-foreground'
                  }`}
                >
                  {c === 'USD' && '$ USD — US Dollar'}
                  {c === 'EUR' && '€ EUR — Euro'}
                  {c === 'PLN' && 'zł PLN — Polish Zloty'}
                  {c === 'UAH' && '₴ UAH — Ukrainian Hryvnia'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('settings.salary')}</Label>
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t('settings.current')}</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="2000"
                  value={currentSalary}
                  onChange={(e) => setCurrentSalary(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t('settings.target')}</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="4000"
                  value={targetSalary}
                  onChange={(e) => setTargetSalary(e.target.value)}
                />
              </div>
              <div className="w-24 space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t('finance.currency')}</Label>
                <Select value={salaryCurrency} onValueChange={(v) => setSalaryCurrency(v as Currency)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {saved ? t('settings.saved') : loading ? t('settings.saving') : t('settings.saveChanges')}
          </Button>
        </form>
      </div>
    </div>
  )
}
