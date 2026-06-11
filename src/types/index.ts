export type Currency = 'USD' | 'EUR' | 'PLN' | 'UAH'

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  PLN: 'zł',
  UAH: '₴',
}

export const CURRENCIES: Currency[] = ['USD', 'EUR', 'PLN', 'UAH']

export type ExpenseCategory = 'housing' | 'food' | 'transport' | 'trips' | 'savings' | 'subscriptions' | 'games' | 'other'
export const EXPENSE_CATEGORIES: ExpenseCategory[] = ['housing', 'food', 'transport', 'trips', 'savings', 'subscriptions', 'games', 'other']

export type GrowthArea = 'english' | 'technical' | 'interview' | 'jobs'
export const GROWTH_AREAS: GrowthArea[] = ['english', 'technical', 'interview', 'jobs']

export type JobStatus = 'applied' | 'response' | 'interview' | 'offer' | 'rejected'
export const JOB_STATUSES: JobStatus[] = ['applied', 'response', 'interview', 'offer', 'rejected']

export interface UserSettings {
  id: string
  user_id: string
  name: string | null
  base_currency: Currency
  current_salary: number | null
  target_salary: number | null
  salary_currency: Currency
  reminder_enabled: boolean
  reminder_time: string  // HH:MM UTC, e.g. "09:00"
  created_at: string
}

export interface MonthlyIncome {
  id: string
  user_id: string
  amount: number
  currency: Currency
  month: string
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  category: ExpenseCategory
  amount: number
  currency: Currency
  amount_usd: number
  note: string | null
  date: string
  created_at: string
}

export interface SavingsGoal {
  id: string
  user_id: string
  title: string
  target_amount: number
  current_amount: number
  currency: Currency
  deadline: string | null
  created_at: string
}

export interface GrowthStreak {
  id: string
  user_id: string
  area: GrowthArea
  streak_count: number
  last_activity_date: string | null
}

export interface DailyTask {
  id: string
  user_id: string
  title: string
  area: GrowthArea
  completed: boolean
  date: string
  created_at: string
}

export interface JobApplication {
  id: string
  user_id: string
  company: string
  position: string
  salary_min: number | null
  salary_max: number | null
  salary_currency: Currency
  status: JobStatus
  applied_date: string
  notes: string | null
  created_at: string
}

export interface ExchangeRates {
  base: Currency
  rates: Record<string, number>
  updatedAt: number
}

export interface Habit {
  id: string
  user_id: string
  title: string
  order_index: number
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  date: string
  completed: boolean
  created_at: string
}
