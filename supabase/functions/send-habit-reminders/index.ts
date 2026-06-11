import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'GrowthHub <reminders@growthhub.app>'
const APP_URL = Deno.env.get('APP_URL') ?? 'https://growthhub.app'

Deno.serve(async (req) => {
  // Only accept POST from authorized callers (pg_cron sends service role key)
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  // Match users whose reminder_time equals the current UTC hour (:00)
  const utcHour = new Date().getUTCHours().toString().padStart(2, '0')
  const currentTime = `${utcHour}:00`
  const today = new Date().toISOString().split('T')[0]

  const { data: usersToRemind, error: usersError } = await supabase
    .from('user_settings')
    .select('user_id, name')
    .eq('reminder_enabled', true)
    .eq('reminder_time', currentTime)

  if (usersError) {
    return new Response(JSON.stringify({ error: usersError.message }), { status: 500 })
  }
  if (!usersToRemind?.length) {
    return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } })
  }

  let sent = 0

  for (const user of usersToRemind) {
    // Get email from auth admin API
    const { data: authData } = await supabase.auth.admin.getUserById(user.user_id)
    const email = authData?.user?.email
    if (!email) continue

    // Get all habits for this user
    const { data: habits } = await supabase
      .from('habits')
      .select('id, title')
      .eq('user_id', user.user_id)
      .order('order_index')

    if (!habits?.length) continue

    // Get completed habit logs for today
    const { data: logs } = await supabase
      .from('habit_logs')
      .select('habit_id')
      .eq('user_id', user.user_id)
      .eq('date', today)
      .eq('completed', true)

    const completedIds = new Set((logs ?? []).map((l) => l.habit_id))
    const incomplete = habits.filter((h) => !completedIds.has(h.id))

    if (!incomplete.length) continue

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `${incomplete.length} habit${incomplete.length > 1 ? 's' : ''} left for today`,
        html: buildEmailHtml(user.name, incomplete.map((h) => h.title), APP_URL),
      }),
    })

    if (res.ok) sent++
  }

  return new Response(JSON.stringify({ sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

function buildEmailHtml(name: string | null, habits: string[], appUrl: string): string {
  const greeting = name ? `Hi ${name}` : 'Hey there'
  const rows = habits
    .map(
      (h) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid rgba(167,139,250,0.1);">
          <span style="color:#a78bfa;margin-right:10px;">○</span>
          <span style="color:#e2e8f0;font-size:15px;">${escapeHtml(h)}</span>
        </td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0a1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:0 16px;">
    <div style="background:linear-gradient(135deg,#1a0d36 0%,#130828 100%);border-radius:20px;padding:36px;border:1px solid rgba(167,139,250,0.15);">

      <div style="margin-bottom:28px;">
        <span style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#9333ea);padding:6px 16px;border-radius:20px;color:white;font-size:12px;font-weight:700;letter-spacing:0.05em;">
          GROWTHHUB
        </span>
      </div>

      <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 6px;">${greeting}! 👋</h1>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;line-height:1.5;">
        You have <strong style="color:#a78bfa;">${habits.length} habit${habits.length > 1 ? 's' : ''}</strong> still to complete today:
      </p>

      <table style="width:100%;border-collapse:collapse;">
        ${rows}
      </table>

      <div style="margin-top:32px;">
        <a href="${appUrl}/habits"
           style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#9333ea);color:white;text-decoration:none;padding:13px 28px;border-radius:12px;font-size:15px;font-weight:600;">
          Complete habits →
        </a>
      </div>

      <p style="color:#334155;font-size:12px;margin:32px 0 0;line-height:1.6;">
        You're receiving this because habit reminders are enabled in your
        <a href="${appUrl}/settings" style="color:#6d28d9;">GrowthHub settings</a>.
      </p>
    </div>
  </div>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
