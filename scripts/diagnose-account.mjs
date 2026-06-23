// scripts/diagnose-account.mjs
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Faltando VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

const target = 'marcelorodriguesd017@gmail.com'

console.log('--- LISTA USERS (admin.auth.listUsers) ---')
const { data: users, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 200 })
if (usersErr) {
  console.log('ERR:', usersErr.message)
} else {
  const found = users.users.find((u) => u.email === target)
  console.log('total users:', users.users.length)
  if (found) {
    console.log('FOUND:', JSON.stringify({ id: found.id, email: found.email, created_at: found.created_at, last_sign_in_at: found.last_sign_in_at, banned_until: found.banned_until }))
  } else {
    console.log('USER NOT FOUND')
  }
}

console.log('\n--- PROFILE do marcelorodriguesd017 ---')
const { data: users2, error: u2Err } = await supabase.auth.admin.listUsers({ perPage: 200 })
if (!u2Err) {
  const targetUser = users2.users.find((u) => u.email === target)
  if (targetUser) {
    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUser.id)
      .maybeSingle()
    if (profErr) {
      console.log('ERR profile:', profErr.message)
    } else if (!prof) {
      console.log('NO PROFILE ROW')
    } else {
      console.log('PROFILE:', JSON.stringify(prof, null, 2))
    }
  }
}

console.log('\n--- TODOS OS PROFILES COM role=admin ---')
const { data: admins, error: admErr } = await supabase
  .from('profiles')
  .select('id, nickname, role, created_at, updated_at')
  .eq('role', 'admin')
if (admErr) {
  console.log('ERR:', admErr.message)
} else {
  console.log('total admins:', admins?.length ?? 0)
  for (const a of admins ?? []) console.log(JSON.stringify(a))
}

console.log('\n--- TODOS OS PROFILES (resumo) ---')
const { data: all, error: allErr } = await supabase
  .from('profiles')
  .select('id, nickname, role, created_at')
  .order('created_at', { ascending: false })
  .limit(20)
if (allErr) {
  console.log('ERR:', allErr.message)
} else {
  for (const p of all ?? []) console.log(JSON.stringify(p))
}
