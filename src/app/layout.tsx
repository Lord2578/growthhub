import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { cn } from '@/lib/utils'
import './globals.css'

const geist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'GrowthHub',
  description: 'Personal growth & finance tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('dark font-sans', geist.variable)}>
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
