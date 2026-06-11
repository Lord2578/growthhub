'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Habit, HabitLog } from '@/types'
import { Check, Plus, Trash2, Sparkles } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/hooks/useTranslation'

interface Props {
  initialHabits: Habit[]
  todayLogs: HabitLog[]
  userId: string
  today: string
}

export function HabitChecklist({ initialHabits, todayLogs, userId, today }: Props) {
  const router = useRouter()
  const { t } = useTranslation()
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
    <div className="animate-fade-in-up rounded-2xl ring-1 ring-white/[0.07] bg-card shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-primary shadow-glow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">{t('habits.today')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-primary font-semibold">{completed}</span>
            <span className="text-muted-foreground">/ {total}</span>
            <span className="text-muted-foreground/60 ml-0.5">{t('habits.done')}</span>
          </div>
        </div>
        {total > 0 && <Progress value={pct} className="h-1" />}
      </div>

      <div className="p-4 space-y-1">
        {habits.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground/50 text-center py-4">
            {t('habits.noHabits')}
          </p>
        )}

        {habits.map((habit) => {
          const done = logs[habit.id] ?? false
          return (
            <div
              key={habit.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group"
            >
              <button
                onClick={() => toggleHabit(habit.id)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                  done
                    ? 'bg-gradient-primary border-transparent shadow-glow-sm'
                    : 'border-white/20 hover:border-primary/50'
                }`}
              >
                {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </button>
              <span className={`flex-1 text-sm ${done ? 'line-through text-muted-foreground/50' : ''}`}>
                {habit.title}
              </span>
              <button
                onClick={() => deleteHabit(habit.id)}
                className="sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center w-6 h-6 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}

        {adding ? (
          <form onSubmit={addHabit} className="flex flex-wrap gap-2 pt-1 px-1">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t('habits.newHabit')}
              className="flex-1 min-w-[140px] h-8 text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="h-8" disabled={loading}>
                {t('habits.add')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => setAdding(false)}
              >
                {t('habits.cancel')}
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-foreground w-full px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-md border-2 border-dashed border-white/15 group-hover:border-primary/40 transition-colors">
              <Plus className="w-3 h-3" />
            </div>
            {t('habits.addHabit')}
          </button>
        )}
      </div>
    </div>
  )
}
