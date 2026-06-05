'use client'

import { GrowthStreak } from '@/types'
import { AREA_CONFIG, isStreakActive } from '@/lib/growth'
import { useTranslation } from '@/lib/hooks/useTranslation'

export function StreakCards({ streaks }: { streaks: GrowthStreak[] }) {
  const { t } = useTranslation()

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {t('dashboard.streaks')}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {streaks.map((streak, i) => {
          const config = AREA_CONFIG[streak.area]
          const active = isStreakActive(streak.last_activity_date)
          return (
            <div
              key={streak.id}
              className={`animate-fade-in-up relative overflow-hidden rounded-2xl p-4 text-center ring-1 transition-all duration-300 ${
                active
                  ? 'ring-primary/25 bg-primary/[0.04] shadow-glow-sm animate-glow-pulse'
                  : 'ring-white/[0.06] bg-card shadow-card hover:ring-white/[0.10]'
              }`}
              style={{ animationDelay: `${i * 75}ms` }}
            >
              {active && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent pointer-events-none" />
              )}
              <div className={`relative text-2xl mb-2 ${active ? 'animate-float' : ''}`}>
                {config.icon}
              </div>
              <div className={`relative text-3xl font-bold tracking-tight mb-0.5 ${
                active ? 'text-gradient-primary' : 'text-muted-foreground/60'
              }`}>
                {streak.streak_count}
              </div>
              <div className="relative text-xs text-muted-foreground font-medium">
                {t(`growth.areas.${streak.area}`)}
              </div>
              <div className="relative text-xs mt-1.5 h-4">
                {active && (
                  <span className="inline-flex items-center gap-1 text-primary/80 font-medium">
                    🔥 {t('dashboard.active')}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
