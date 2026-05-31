'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DailyTask, GrowthArea, GROWTH_AREAS } from '@/types'
import { Plus, Check, Calendar } from 'lucide-react'

function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null
  const d = new Date(deadline)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000)
  return diff
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

  const today = new Date().toISOString().split('T')[0]
  const daysLeft = daysUntil(nextGoalDeadline)

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

  const completed = tasks.filter((t) => t.completed).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Today&apos;s Tasks</h3>
        <div className="flex items-center gap-3">
          {daysLeft !== null && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span className={daysLeft <= 7 ? 'text-yellow-500 font-medium' : ''}>
                {daysLeft > 0 ? `${daysLeft}d to goal` : 'Goal deadline reached!'}
              </span>
            </div>
          )}
          <span className="text-xs text-muted-foreground">{completed}/{tasks.length}</span>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-2">
          {tasks.length === 0 && !adding && (
            <p className="text-sm text-muted-foreground text-center py-2">No tasks today. Add one!</p>
          )}

          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <button
                onClick={() => toggleTask(task)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.completed
                    ? 'bg-primary border-primary'
                    : 'border-border hover:border-primary'
                }`}
              >
                {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
              </button>
              <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </span>
              <span className="text-xs text-muted-foreground capitalize">{task.area}</span>
            </div>
          ))}

          {adding ? (
            <form onSubmit={addTask} className="flex gap-2 pt-1">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task description..."
                className="flex-1 h-8 text-sm"
                autoFocus
              />
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
              <Button type="submit" size="sm" className="h-8">Add</Button>
              <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add task
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
