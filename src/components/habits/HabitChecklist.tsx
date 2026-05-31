'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Habit, HabitLog } from '@/types'
import { Check, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  initialHabits: Habit[]
  todayLogs: HabitLog[]
  userId: string
  today: string
}

export function HabitChecklist({ initialHabits, todayLogs, userId, today }: Props) {
  const router = useRouter()
  const [habits, setHabits] = useState(initialHabits)
  const [logs, setLogs] = useState<Record<string, boolean>>(
    Object.fromEntries(todayLogs.map((l) => [l.habit_id, l.completed]))
  )
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  const completed = habits.filter((h) => logs[h.id]).length
  const total = habits.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  async function toggleHabit(habitId: string) {
    const next = !logs[habitId]
    setLogs((prev) => ({ ...prev, [habitId]: next }))
    const supabase = createClient()
    await supabase.from('habit_logs').upsert(
      { habit_id: habitId, user_id: userId, date: today, completed: next },
      { onConflict: 'habit_id,date' }
    )
    router.refresh()
  }

  async function addHabit(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('habits')
      .insert({ user_id: userId, title: newTitle.trim(), order_index: habits.length })
      .select()
      .single()
    if (data) {
      setHabits((prev) => [...prev, data])
      setNewTitle('')
      setAdding(false)
    }
    setLoading(false)
    router.refresh()
  }

  async function deleteHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id))
    const supabase = createClient()
    await supabase.from('habits').delete().eq('id', id)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Today</CardTitle>
          <span className="text-sm text-muted-foreground">
            {completed}/{total} done
          </span>
        </div>
        {total > 0 && <Progress value={pct} className="h-1.5 mt-3" />}
      </CardHeader>
      <CardContent className="space-y-1">
        {habits.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No habits yet. Add your first one!
          </p>
        )}

        {habits.map((habit) => {
          const done = logs[habit.id] ?? false
          return (
            <div
              key={habit.id}
              className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-accent transition-colors group"
            >
              <button
                onClick={() => toggleHabit(habit.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  done ? 'bg-primary border-primary' : 'border-border hover:border-primary'
                }`}
              >
                {done && <Check className="w-3 h-3 text-primary-foreground" />}
              </button>
              <span className={`flex-1 text-sm ${done ? 'line-through text-muted-foreground' : ''}`}>
                {habit.title}
              </span>
              <button
                onClick={() => deleteHabit(habit.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}

        {adding ? (
          <form onSubmit={addHabit} className="flex gap-2 pt-1">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New habit..."
              className="flex-1 h-8 text-sm"
              autoFocus
            />
            <Button type="submit" size="sm" className="h-8" disabled={loading}>
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => setAdding(false)}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full px-2 py-2.5 rounded-lg hover:bg-accent transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add habit
          </button>
        )}
      </CardContent>
    </Card>
  )
}
