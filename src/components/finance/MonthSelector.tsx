'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(-1)}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm font-medium w-24 text-center">{label}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => navigate(1)}
        disabled={isCurrentMonth}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
