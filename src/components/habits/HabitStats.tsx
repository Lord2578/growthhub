'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Habit, HabitLog } from '@/types'
import { BarChart3 } from 'lucide-react'

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function getStreak(habitId: string, logs: HabitLog[]): number {
  const completed = new Set(
    logs.filter((l) => l.habit_id === habitId && l.completed).map((l) => l.date)
  )
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (completed.has(d.toISOString().split('T')[0])) {
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
  const last7 = getLast7Days()

  if (habits.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Stats — last 7 days
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Day headers */}
        <div className="flex items-center mb-2">
          <div className="flex-1" />
          {last7.map((day) => (
            <div key={day} className="w-8 text-center text-xs text-muted-foreground">
              {new Date(day + 'T12:00:00').toLocaleDateString('en', { weekday: 'narrow' })}
            </div>
          ))}
        </div>

        {habits.map((habit) => {
          const streak = getStreak(habit.id, recentLogs)
          const rate = getCompletionRate(habit.id, recentLogs)

          return (
            <div key={habit.id} className="flex items-center gap-1 py-1">
              <div className="flex-1 min-w-0 pr-2">
                <div className="text-sm font-medium truncate">{habit.title}</div>
                <div className="text-xs text-muted-foreground">
                  {streak > 0 ? `🔥 ${streak}d streak` : `${rate}% done`}
                </div>
              </div>
              {last7.map((day) => {
                const log = recentLogs.find(
                  (l) => l.habit_id === habit.id && l.date === day
                )
                const done = log?.completed ?? false
                return (
                  <div
                    key={day}
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-colors ${
                      done
                        ? 'bg-primary/20 text-primary'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {done ? '✓' : '·'}
                  </div>
                )
              })}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
