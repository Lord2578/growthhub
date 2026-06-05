'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/onboarding` },
    })
  }

  const bg = (
    <>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -5%, hsl(258 90% 66% / 0.15), transparent)' }}
      />
      <div className="fixed inset-0 dot-grid pointer-events-none opacity-40" />
    </>
  )

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
        {bg}
        <div className="w-full max-w-sm relative text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 ring-1 ring-primary/20 text-3xl mb-2">
            📬
          </div>
          <h2 className="text-xl font-bold">Check your email</h2>
          <p className="text-sm text-muted-foreground/70 max-w-xs mx-auto">
            Sent a confirmation link to <strong className="text-foreground">{email}</strong>.
            Click it to activate your account.
          </p>
          <Link href="/login" className="inline-block text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {bg}

      <div className="w-full max-w-sm relative">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-primary shadow-glow-primary mb-4">
            <span className="text-xl font-bold text-white">✦</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">GrowthHub</h1>
          <p className="text-sm text-muted-foreground/60 mt-1">Start tracking your growth</p>
        </div>

        <div className="rounded-2xl ring-1 ring-white/[0.08] bg-card shadow-card overflow-hidden">
          <div className="p-6 space-y-4">
            <Button variant="outline" className="w-full h-10" onClick={handleGoogleLogin}>
              <svg className="w-4 h-4 mr-2 shrink-0" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-xs text-muted-foreground/50">
                <span className="bg-card px-2">or</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 8 characters"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-xl">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground/60 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
