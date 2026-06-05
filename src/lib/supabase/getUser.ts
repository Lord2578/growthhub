import { cache } from 'react'
import { createClient } from './server'

// Deduplicated per request — layout + page share one auth call
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})
