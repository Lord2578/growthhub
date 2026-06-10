'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DailyTask, GrowthArea, GROWTH_AREAS } from '@/types'
import { Plus, Check, Calendar } from 'lucide-react'
import { useTranslation } from '@/lib/hooks/useTranslation'

function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null
  const d = new Date(deadline)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((d.getTime() - today.getTime()) / 86400000)
}

export function TodayTasks({
  initialTasks,
  userId,
  nextGoalDeadline,
}: {
  initialTasks: DailyTask[]
  userId: string
  nextGoalDeadline: string | null
}) {
  const [tasks, setTasks] = useState(initialTasks)
  const [newTitle, setNewTitle] = useState('')
  const [newArea, setNewArea] = useState<GrowthArea>('technical')
  const [adding, setAdding] = useState(false)
  const { t } = useTranslation()

  const today = new Date().toISOString().split('T')[0]
  const daysLeft = daysUntil(nextGoalDeadline)
  const completed = tasks.filter((task) => task.completed).length

  async function toggleTask(task: DailyTask) {
    const supabase = createClient()
    const updated = { ...task, completed: !task.completed }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
    await supabase.from('daily_tasks').update({ completed: updated.completed }).eq('id', task.id)
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    const supabase = createClient()
    const { data } = await supabase
      .from('daily_tasks')
      .insert({ user_id: userId, title: newTitle.trim(), area: newArea, date: today })
      .select()
      .single()
    if (data) {
      setTasks((prev) => [...prev, data])
      setNewTitle('')
      setAdding(false)
    }
  }

  return (
    <div className="animate-fade-in-up space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t('dashboard.todayTasks')}
        </h3>
        <div className="flex items-center gap-3">
          {daysLeft !== null && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span className={daysLeft <= 7 ? 'text-yellow-400 font-medium' : ''}>
                {daysLeft > 0 ? `${daysLeft} ${t('dashboard.daysToGoal')}` : t('dashboard.goalDeadline')}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-primary font-semibold">{completed}</span>
            <span className="text-muted-foreground">/ {tasks.length}</span>
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="rounded-2xl ring-1 ring-white/[0.07] bg-card shadow-card overflow-hidden">
        <div className="p-4 space-y-1">
          {tasks.length === 0 && !adding && (
            <p className="text-sm text-muted-foreground text-center py-4 opacity-60">{t('dashboard.noTasks')}</p>
          )}

          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group"
            >
              <button
                onClick={() => toggleTask(task)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
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
              <span className="text-xs text-muted-foreground/50 capitalize bg-white/[0.04] px-2 py-0.5 rounded-md">
                {task.area}
              </span>
            </div>
          ))}

          {adding ? (
            <form onSubmit={addTask} className="flex flex-wrap gap-2 pt-1 px-1">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task description..."
                className="flex-1 min-w-[140px] h-8 text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <Select value={newArea} onValueChange={(v) => setNewArea(v as GrowthArea)}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GROWTH_AREAS.map((a) => (
                      <SelectItem key={a} value={a} className="text-xs capitalize">{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" size="sm" className="h-8">{t('common.add')}</Button>
                <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => setAdding(false)}>
                  {t('common.cancel')}
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
              {t('dashboard.addTask')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
