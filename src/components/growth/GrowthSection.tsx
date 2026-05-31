'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DailyTask, GrowthArea, GrowthStreak } from '@/types'
import { Check, Plus, Flame } from 'lucide-react'

const AREA_CONFIG: Record<GrowthArea, { label: string; icon: string; color: string; description: string }> = {
  english: {
    label: 'English',
    icon: '',
    color: 'text-blue-400',
    description: 'Reading, writing, vocabulary, speaking practice',
  },
  technical: {
    label: 'Technical Skills',
    icon: '',
    color: 'text-purple-400',
    description: 'Coding, system design, algorithms',
  },
  interview: {
    label: 'Interview Prep',
    icon: '‍',
    color: 'text-yellow-400',
    description: 'Behavioral questions, mock interviews, STAR stories',
  },
  jobs: {
    label: 'Job Search',
    icon: '',
    color: 'text-green-400',
    description: 'Applications, networking, LinkedIn, referrals',
  },
}

function isStreakActive(lastDate: string | null): boolean {
  if (!lastDate) return false
  const last = new Date(lastDate)
  const today = new Date()
  const diff = Math.floor((today.getTime() - last.getTime()) / 86400000)
  return diff <= 1
}

interface Props {
  area: GrowthArea
  streak: GrowthStreak | null
  tasks: DailyTask[]
  userId: string
  today: string
}

export function GrowthSection({ area, streak, tasks: initialTasks, userId, today }: Props) {
  const router = useRouter()
  const [tasks, setTasks] = useState(initialTasks)
  const [newTask, setNewTask] = useState('')
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const config = AREA_CONFIG[area]
  const active = isStreakActive(streak?.last_activity_date ?? null)

  async function toggleTask(task: DailyTask) {
    const supabase = createClient()
    const updated = { ...task, completed: !task.completed }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
    await supabase.from('daily_tasks').update({ completed: updated.completed }).eq('id', task.id)

    // Update streak if completing a task
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

    const supabase = createClient()
    const { data } = await supabase
      .from('daily_tasks')
      .insert({ user_id: userId, title: newTask.trim(), area, date: today })
      .select()
      .single()

    if (data) {
      setTasks((prev) => [...prev, data])
      setNewTask('')
      setAdding(false)
    }
    setLoading(false)
  }

  const completedCount = tasks.filter((t) => t.completed).length

  return (
    <Card className={active ? 'border-primary/30' : ''}>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{config.icon}</div>
          <div>
            <CardTitle className="text-base">{config.label}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {active && <Flame className="w-4 h-4 text-orange-500" />}
          <div className="text-center">
            <div className={`text-xl font-bold ${active ? config.color : 'text-muted-foreground'}`}>
              {streak?.streak_count ?? 0}
            </div>
            <div className="text-xs text-muted-foreground">day streak</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {tasks.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground py-1">No tasks today.</p>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
          >
            <button
              onClick={() => toggleTask(task)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                task.completed ? 'bg-primary border-primary' : 'border-border hover:border-primary'
              }`}
            >
              {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
            </button>
            <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </span>
          </div>
        ))}

        {adding ? (
          <form onSubmit={addTask} className="flex gap-2 pt-1">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What will you do today?"
              className="flex-1 h-8 text-sm"
              autoFocus
            />
            <Button type="submit" size="sm" className="h-8" disabled={loading}>Add</Button>
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

        {completedCount > 0 && (
          <div className="pt-1">
            <Badge variant="secondary" className="text-xs">
              {completedCount}/{tasks.length} done today
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
