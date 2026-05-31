'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CURRENCIES, Currency } from '@/types'

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
      })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">
            {step === 1 ? '' : step === 2 ? '' : ''}
          </div>
          <CardTitle className="text-2xl">
            {step === 1 ? "Welcome! Let's get started" : step === 2 ? 'Your salary goals' : 'Currency preference'}
          </CardTitle>
          <CardDescription>
            {step === 1 ? "What's your name?" : step === 2 ? 'This helps track your progress toward financial goals' : 'Pick your preferred display currency'}
          </CardDescription>
          <div className="flex gap-2 justify-center mt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-8 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
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
              <div className="space-y-1.5">
                <Label>Base currency for all amounts</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBaseCurrency(c)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        baseCurrency === c
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {c === 'USD' && '$ USD - US Dollar'}
                      {c === 'EUR' && '€ EUR - Euro'}
                      {c === 'PLN' && 'zł PLN - Polish Zloty'}
                      {c === 'UAH' && '₴ UAH - Ukrainian Hryvnia'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
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
                  {loading ? 'Saving...' : 'Go to Dashboard'}
                </Button>
              )}
            </div>

            {step === 1 && (
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full text-sm text-muted-foreground hover:text-foreground text-center"
              >
                Skip for now
              </button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
