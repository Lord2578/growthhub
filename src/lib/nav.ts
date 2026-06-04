import { LayoutDashboard, Wallet, TrendingUp, Repeat, Briefcase, Settings } from 'lucide-react'

export const NAV_ITEMS = [
  { href: '/dashboard', tKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/finance',   tKey: 'nav.finance',   icon: Wallet },
  { href: '/growth',    tKey: 'nav.growth',    icon: TrendingUp },
  { href: '/habits',    tKey: 'nav.habits',    icon: Repeat },
  { href: '/jobs',      tKey: 'nav.jobs',      icon: Briefcase },
  { href: '/settings',  tKey: 'nav.settings',  icon: Settings },
]
