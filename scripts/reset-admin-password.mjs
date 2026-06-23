// scripts/reset-admin-password.mjs
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Faltando envs'); process.exit(1) }

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const anon = createClient(url, process.env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } })

const target = 'marcelorodriguesd017@gmail.com'
const newPassword = process.argv[2]
if (!newPassword) { console.error('Uso: node scripts/reset-admin-password.mjs <senha>'); process.exit(1) }

console.log('--- 1) Listar user ---')
const { data: users, error: uErr } = await admin.auth.admin.listUsers({ perPage: 200 })
if (uErr) { console.log('ERR:', uErr.message); process.exit(1) }
const u = users.users.find((x) => x.email === target)
if (!u) { console.log('USER NOT FOUND'); process.exit(1) }
console.log('user.id =', u.id)

console.log('\n--- 2) Resetar senha via admin.updateUserById ---')
const { data: updated, error: upErr } = await admin.auth.admin.updateUserById(u.id, { password: newPassword })
if (upErr) { console.log('ERR update:', upErr.message); process.exit(1) }
console.log('senha resetada. user.email =', updated.email, 'updated_at =', updated.updated_at)

console.log('\n--- 3) Verificar login com a nova senha ---')
const { data: sign, error: sErr } = await anon.auth.signInWithPassword({
  email: target,
  password: newPassword,
})
if (sErr) { console.log('ERR signIn:', sErr.message); process.exit(1) }
console.log('login OK. user.id =', sign.user?.id, 'session.expires_at =', sign.session?.expires_at)
