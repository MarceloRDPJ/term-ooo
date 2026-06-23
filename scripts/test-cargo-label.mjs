// scripts/test-cargo-label.mjs
// Simula a leitura que o useSupabaseAuth faz ao logar como voce
// e mostra o cargo que o CrachaPanel renderizaria.
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
if (!url || !serviceKey || !anonKey) { console.error('Faltando envs'); process.exit(1) }

const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
const user = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })

const target = 'marcelorodriguesd017@gmail.com'

console.log('--- 1) Magic link login como voce ---')
const { data: link, error: lErr } = await admin.auth.admin.generateLink({ type: 'magiclink', email: target })
if (lErr) { console.log('ERR:', lErr.message); process.exit(1) }
const { data: verify, error: vErr } = await user.auth.verifyOtp({ email: target, token: link.properties.email_otp, type: 'magiclink' })
if (vErr) { console.log('ERR verify:', vErr.message); process.exit(1) }
console.log('logado, user.id =', verify.user.id)

console.log('\n--- 2) Profile via sessao real (simula o useSupabaseAuth.loadProfile) ---')
const { data: prof, error: pErr } = await user.from('profiles').select('*').eq('id', verify.user.id).maybeSingle()
if (pErr) { console.log('ERR profile:', pErr.message); process.exit(1) }
console.log('profile.role =', prof?.role)
console.log('profile.nickname =', prof?.nickname)
console.log('profile.email =', verify.user.email)

console.log('\n--- 3) Simula resolveCargo(profile.role, hasPlayed) ---')
const role = prof?.role ?? null
const hasPlayed = false // cracha novo sem jogos
let cargo
if (role === 'admin') cargo = 'Admin'
else if (role === 'banned') cargo = 'Banido'
else cargo = hasPlayed ? 'Auditor' : 'Estagiario'
console.log('cargo que o CrachaPanel renderizaria:', cargo)

console.log('\n--- 4) Login com senha Prego1223@ ---')
const { data: pw, error: pErr2 } = await user.auth.signInWithPassword({ email: target, password: 'Prego1223@' })
if (pErr2) { console.log('ERR signIn:', pErr2.message); process.exit(1) }
console.log('signIn OK, user.id =', pw.user.id)
