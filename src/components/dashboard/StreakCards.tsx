'use client'

import { Card, CardContent } from '@/components/ui/card'
import { GrowthStreak, GrowthArea } from '@/types'

const AREA_CONFIG: Record<GrowthArea, { label: string; icon: string; color: string }> = {
  english: { label: 'English', icon: '', color: 'text-blue-400' },
  technical: { label: 'Technical', icon: '', color: 'text-purple-400' },
  interview: { label: 'Interview', icon: '‍', color: 'text-yellow-400' },
  jobs: { label: 'Job Search', icon: '', color: 'text-green-400' },
}

function isStreakActive(lastDate: string | null): boolean {
  if (!lastDate) return false
  const last = new Date(lastDate)
  const today = new Date()
  const diff = Math.floor((today.getTime() - last.getTime()) / 86400000)
  return diff <= 1
}

export function StreakCards({ streaks }: { streaks: GrowthStreak[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Growth Streaks</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {streaks.map((streak) => {
          const config = AREA_CONFIG[streak.area]
          const active = isStreakActive(streak.last_activity_date)
          return (
            <Card key={streak.id} className={`${active ? 'border-primary/30' : ''}`}>
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl mb-1">{config.icon}</div>
                <div className={`text-2xl font-bold ${active ? config.color : 'text-muted-foreground'}`}>
                  {streak.streak_count}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{config.label}</div>
                {active && (
                  <div className="text-xs text-primary mt-1">🔥 Active</div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
