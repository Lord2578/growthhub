'use client'

import { useMemo } from 'react'
import { Habit, HabitLog } from '@/types'
import { BarChart3 } from 'lucide-react'
import { useTranslation } from '@/lib/hooks/useTranslation'

function getLast7Days(): string[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function getStreak(habitId: string, completedDates: Set<string>): number {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (completedDates.has(d.toISOString().split('T')[0])) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function getCompletionRate(habitId: string, logs: HabitLog[]): number {
  const habitLogs = logs.filter((l) => l.habit_id === habitId)
  if (habitLogs.length === 0) return 0
  const done = habitLogs.filter((l) => l.completed).length
  return Math.round((done / habitLogs.length) * 100)
}

interface Props {
  habits: Habit[]
  recentLogs: HabitLog[]
}

export function HabitStats({ habits, recentLogs }: Props) {
  const { t } = useTranslation()
  const last7 = useMemo(() => getLast7Days(), [])

  // Build per-habit Set<date> once — O(N) — reused by both getStreak and grid rendering
  const completedByHabit = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const log of recentLogs) {
      if (!log.completed) continue
      if (!map.has(log.habit_id)) map.set(log.habit_id, new Set())
      map.get(log.habit_id)!.add(log.date)
    }
    return map
  }, [recentLogs])

  if (habits.length === 0) return null

  return (
    <div className="animate-fade-in-up rounded-2xl ring-1 ring-white/[0.07] bg-card shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.06]">
          <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <span className="font-semibold text-sm">{t('habits.statsTitle')}</span>
      </div>

      <div className="p-4">
        {/* Day headers */}
        <div className="flex items-center gap-1 mb-2 px-1">
          <div className="flex-1 min-w-0" />
          {last7.map((day) => (
            <div key={day} className="w-8 text-center text-xs text-muted-foreground/50">
              {new Date(day + 'T12:00:00').toLocaleDateString('en', { weekday: 'narrow' })}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {habits.map((habit) => {
            const doneSet = completedByHabit.get(habit.id) ?? new Set<string>()
            const streak = getStreak(habit.id, doneSet)
            const rate = getCompletionRate(habit.id, recentLogs)

            return (
              <div key={habit.id} className="flex items-center gap-1 px-1 py-1.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-sm font-medium truncate">{habit.title}</div>
                  <div className="text-xs text-muted-foreground/50 mt-0.5">
                    {streak > 0 ? `🔥 ${streak}d` : `${rate}%`}
                  </div>
                </div>
                {last7.map((day) => {
                  const done = doneSet.has(day)
                  return (
                    <div
                      key={day}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
                        done
                          ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                          : 'bg-white/[0.04] text-muted-foreground/30'
                      }`}
                    >
                      {done ? '✓' : '·'}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
