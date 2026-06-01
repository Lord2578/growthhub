'use client'

import { Card, CardContent } from '@/components/ui/card'
import { GrowthStreak } from '@/types'
import { AREA_CONFIG, isStreakActive } from '@/lib/growth'

export function StreakCards({ streaks }: { streaks: GrowthStreak[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Growth Streaks</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {streaks.map((streak) => {
          const config = AREA_CONFIG[streak.area]
          const active = isStreakActive(streak.last_activity_date)
          return (
            <Card key={streak.id} className={active ? 'border-primary/30' : ''}>
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl mb-1">{config.icon}</div>
                <div className={`text-2xl font-bold ${active ? config.color : 'text-muted-foreground'}`}>
                  {streak.streak_count}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{config.label}</div>
                <div className="text-xs mt-1 h-4">
                  {active && <span className="text-primary">🔥 Active</span>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
