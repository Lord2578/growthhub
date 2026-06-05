'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CURRENCIES, Currency } from '@/types'

const STEPS = [
  { emoji: '👋', title: "Welcome to GrowthHub!", desc: "What's your name?" },
  { emoji: '💰', title: 'Salary goals', desc: 'Track your progress toward financial freedom' },
  { emoji: '🌍', title: 'Currency preference', desc: 'All amounts will be shown in this currency' },
]

const CURRENCY_LABELS: Record<Currency, string> = {
  USD: '$ USD — US Dollar',
  EUR: '€ EUR — Euro',
  PLN: 'zł PLN — Polish Zloty',
  UAH: '₴ UAH — Ukrainian Hryvnia',
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [currentSalary, setCurrentSalary] = useState('')
  const [targetSalary, setTargetSalary] = useState('')
  const [salaryCurrency, setSalaryCurrency] = useState<Currency>('USD')
  const [baseCurrency, setBaseCurrency] = useState<Currency>('USD')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        name: name.trim() || null,
        current_salary: currentSalary ? parseFloat(currentSalary) : null,
        target_salary: targetSalary ? parseFloat(targetSalary) : null,
        salary_currency: salaryCurrency,
        base_currency: baseCurrency,
      }, { onConflict: 'user_id' })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const current = STEPS[step - 1]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -5%, hsl(258 90% 66% / 0.15), transparent)' }}
      />
      <div className="fixed inset-0 dot-grid pointer-events-none opacity-40" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-primary shadow-glow-primary mb-4">
            <span className="text-xl">✦</span>
          </div>
          <p className="text-sm text-muted-foreground/60">Step {step} of 3</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                s <= step ? 'bg-gradient-primary' : 'bg-white/[0.08]'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl ring-1 ring-white/[0.08] bg-card shadow-card overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-white/[0.05]">
            <div className="text-3xl mb-3">{current.emoji}</div>
            <h1 className="text-xl font-bold tracking-tight">{current.title}</h1>
            <p className="text-sm text-muted-foreground/70 mt-1">{current.desc}</p>
          </div>

          <div className="p-6">
            <form onSubmit={step === 3 ? handleSubmit : undefined} className="space-y-4">
              {step === 1 && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Alex"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
              )}

              {step === 2 && (
                <>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor="current-salary">Current salary / mo</Label>
                      <Input
                        id="current-salary"
                        type="number"
                        min="0"
                        placeholder="2000"
                        value={currentSalary}
                        onChange={(e) => setCurrentSalary(e.target.value)}
                      />
                    </div>
                    <div className="w-28 space-y-1.5">
                      <Label>Currency</Label>
                      <Select value={salaryCurrency} onValueChange={(v) => setSalaryCurrency(v as Currency)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="target-salary">Target salary / mo</Label>
                    <Input
                      id="target-salary"
                      type="number"
                      min="0"
                      placeholder="4000"
                      value={targetSalary}
                      onChange={(e) => setTargetSalary(e.target.value)}
                    />
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="grid grid-cols-2 gap-2">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBaseCurrency(c)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all text-left ${
                        baseCurrency === c
                          ? 'bg-primary/15 ring-1 ring-primary/40 text-primary'
                          : 'bg-white/[0.03] ring-1 ring-white/[0.07] text-muted-foreground hover:ring-white/[0.15] hover:text-foreground'
                      }`}
                    >
                      {CURRENCY_LABELS[c]}
                    </button>
                  ))}
                </div>
              )}

              {error && (
                <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-xl">
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                {step > 1 && (
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button type="button" className="flex-1" onClick={() => setStep(s => s + 1)}>
                    Continue
                  </Button>
                ) : (
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Saving...' : 'Go to Dashboard →'}
                  </Button>
                )}
              </div>

              {step === 1 && (
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full text-sm text-muted-foreground/50 hover:text-muted-foreground text-center transition-colors"
                >
                  Skip for now
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
