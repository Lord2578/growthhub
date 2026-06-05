'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function MonthSelector({ currentMonth }: { currentMonth: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [year, month] = currentMonth.split('-').map(Number)
  const label = `${MONTHS[month - 1]} ${year}`

  function navigate(delta: number) {
    const d = new Date(year, month - 1 + delta, 1)
    const newMonth = d.toISOString().slice(0, 7)
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', newMonth)
    router.push(`${pathname}?${params.toString()}`)
  }

  const isCurrentMonth =
    currentMonth === new Date().toISOString().slice(0, 7)

  return (
    <div className="flex items-center gap-1 bg-white/[0.04] ring-1 ring-white/[0.07] rounded-xl p-1 w-fit">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm font-semibold w-24 text-center">{label}</span>
      <button
        onClick={() => navigate(1)}
        disabled={isCurrentMonth}
        className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
