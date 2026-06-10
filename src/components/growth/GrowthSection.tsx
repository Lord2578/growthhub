'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DailyTask, GrowthArea, GrowthStreak } from '@/types'
import { Check, Plus, Flame, Trash2 } from 'lucide-react'
import { AREA_CONFIG, TASK_SUGGESTIONS, isStreakActive } from '@/lib/growth'
import { useTranslation } from '@/lib/hooks/useTranslation'

interface Props {
  area: GrowthArea
  streak: GrowthStreak | null
  tasks: DailyTask[]
  userId: string
  today: string
}

export function GrowthSection({ area, streak, tasks: initialTasks, userId, today }: Props) {
  const router = useRouter()
  const { t } = useTranslation()
  const [tasks, setTasks] = useState(initialTasks)
  const [newTask, setNewTask] = useState('')
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestions = TASK_SUGGESTIONS[area].filter(
    (s) => !tasks.some((task) => task.title === s)
  )
  const config = AREA_CONFIG[area]
  const active = isStreakActive(streak?.last_activity_date ?? null)

  async function toggleTask(task: DailyTask) {
    const supabase = createClient()
    const updated = { ...task, completed: !task.completed }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
    await supabase.from('daily_tasks').update({ completed: updated.completed }).eq('id', task.id)

    if (updated.completed && streak) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const newCount =
        streak.last_activity_date === today
          ? streak.streak_count
          : streak.last_activity_date === yesterdayStr
            ? streak.streak_count + 1
            : 1

      await supabase
        .from('growth_streaks')
        .update({ streak_count: newCount, last_activity_date: today })
        .eq('id', streak.id)

      router.refresh()
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.trim()) return
    setLoading(true)
    await insertTask(newTask.trim())
    setNewTask('')
    setAdding(false)
    setLoading(false)
  }

  async function insertTask(title: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from('daily_tasks')
      .insert({ user_id: userId, title, area, date: today })
      .select()
      .single()
    if (data) setTasks((prev) => [...prev, data])
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id))
    const supabase = createClient()
    await supabase.from('daily_tasks').delete().eq('id', id)
  }

  const completedCount = tasks.filter((task) => task.completed).length

  return (
    <div className={`animate-fade-in-up relative rounded-2xl ring-1 bg-card shadow-card overflow-hidden transition-all duration-300 ${
      active ? 'ring-primary/25 shadow-glow-sm' : 'ring-white/[0.07]'
    }`}>
      {active && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent pointer-events-none rounded-2xl" />
      )}
      <div className="relative flex items-start justify-between px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-9 h-9 rounded-xl text-xl ${
            active ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-white/[0.06] ring-1 ring-white/[0.07]'
          }`}>
            {config.icon}
          </div>
          <div>
            <div className="text-sm font-semibold">{t(`growth.areas.${area}`)}</div>
            <div className="text-xs text-muted-foreground/60 mt-0.5">{config.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {active && <Flame className="w-4 h-4 text-orange-400" />}
          <div className="text-right">
            <div className={`text-xl font-bold tracking-tight ${active ? 'text-gradient-primary' : 'text-muted-foreground/60'}`}>
              {streak?.streak_count ?? 0}
            </div>
            <div className="text-xs text-muted-foreground/50">{t('growth.dayStreak')}</div>
          </div>
        </div>
      </div>

      <div className="relative p-4 space-y-1">
        {tasks.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground/50 py-2 px-1">{t('growth.noTasks')}</p>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group"
          >
            <button
              onClick={() => toggleTask(task)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
                task.completed
                  ? 'bg-gradient-primary border-transparent shadow-glow-sm'
                  : 'border-white/20 hover:border-primary/50'
              }`}
            >
              {task.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </button>
            <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground/50' : ''}`}>
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-6 h-6 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {showSuggestions && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1 pb-1 px-1">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => insertTask(s)}
                className="text-xs px-2.5 py-1 rounded-lg border border-white/[0.08] hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all text-muted-foreground"
              >
                + {s}
              </button>
            ))}
          </div>
        )}

        {adding ? (
          <form onSubmit={addTask} className="flex gap-2 pt-1 px-1">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What will you do today?"
              className="flex-1 h-8 text-sm"
              autoFocus
            />
            <Button type="submit" size="sm" className="h-8" disabled={loading}>{t('growth.add')}</Button>
            <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => setAdding(false)}>
              {t('growth.cancel')}
            </Button>
          </form>
        ) : (
          <div className="flex gap-2 pt-1 px-1">
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-foreground flex-1 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center justify-center w-5 h-5 rounded-md border-2 border-dashed border-white/15 hover:border-primary/40 transition-colors">
                <Plus className="w-3 h-3" />
              </div>
              {t('growth.addTask')}
            </button>
            {suggestions.length > 0 && (
              <button
                onClick={() => setShowSuggestions((v) => !v)}
                className={`text-xs px-3 py-2 rounded-xl transition-colors ${
                  showSuggestions
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                    : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04]'
                }`}
              >
                {t('growth.suggestions')}
              </button>
            )}
          </div>
        )}

        {completedCount > 0 && (
          <div className="pt-2 px-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-primary/80 font-medium bg-primary/10 ring-1 ring-primary/20 px-2.5 py-1 rounded-lg">
              {completedCount}/{tasks.length} {t('growth.doneTodayOf')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
