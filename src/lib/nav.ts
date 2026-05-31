import { LayoutDashboard, Wallet, TrendingUp, Repeat, Briefcase, Settings } from 'lucide-react'

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/finance',   label: 'Finance',   icon: Wallet },
  { href: '/growth',    label: 'Growth',    icon: TrendingUp },
  { href: '/habits',    label: 'Habits',    icon: Repeat },
  { href: '/jobs',      label: 'Jobs',      icon: Briefcase },
  { href: '/settings',  label: 'Settings',  icon: Settings },
]
