// scripts/test-e2e.mjs
// Testa os fluxos de regra de negocio:
//  1. Login com senha Prego1223@ (que foi resetada no turno anterior)
//  2. Magic link login (simula link de reset de senha)
//  3. setSession com tokens de recovery (simula o ResetPasswordPage)
//  4. updateUser({ password }) para trocar a senha
//  5. Login com a NOVA senha para confirmar
//  6. Login com a senha ANTIGA (deve falhar)
//  7. Cargo: profile.role = admin -> "Admin"
//  8. RPC admin_close_room funciona via sessao do admin
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
if (!url || !serviceKey || !anonKey) { console.error('Faltando envs'); process.exit(1) }

const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
const user = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })

const target = 'marcelorodriguesd017@gmail.com'
const oldPassword = 'Prego1223@'
const newPassword = 'PitacoSeguro2026!'

function log(label, fn) {
  try {
    const r = fn()
    console.log(`${label}: OK ${r ? '(' + JSON.stringify(r).slice(0, 80) + ')' : ''}`)
    return r
  } catch (e) {
    console.log(`${label}: ERR ${e?.message ?? e}`)
    return null
  }
}

async function section(name, fn) {
  console.log(`\n--- ${name} ---`)
  await fn()
}

await section('1) Login com senha atual Prego1223@', async () => {
  const r = await user.auth.signInWithPassword({ email: target, password: oldPassword })
  if (r.error) throw new Error(r.error.message)
  console.log('session.expires_at =', r.data.session?.expires_at)
})

await section('2) Cargo Admin (via magic link)', async () => {
  const link = await admin.auth.admin.generateLink({ type: 'magiclink', email: target })
  if (link.error) throw new Error(link.error.message)
  const v = await user.auth.verifyOtp({ email: target, token: link.data.properties.email_otp, type: 'magiclink' })
  if (v.error) throw new Error(v.error.message)
  const prof = await user.from('profiles').select('*').eq('id', v.data.user.id).maybeSingle()
  if (prof.error) throw new Error(prof.error.message)
  console.log('profile.role =', prof.data?.role)
  console.log('cargo renderizado =', prof.data?.role === 'admin' ? 'Admin' : (prof.data?.role === 'banned' ? 'Banido' : 'Auditor/Estagiario'))
})

await section('3) Gera recovery link (simula Supabase resetPasswordForEmail)', async () => {
  const link = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: target,
    options: { redirectTo: 'https://marcelordpj.github.io/term-ooo/redefinir-senha' },
  })
  if (link.error) throw new Error(link.error.message)
  const actionLink = link.data.properties.action_link
  const actionUrl = new URL(actionLink)
  const tokenHash = actionUrl.searchParams.get('token')
  if (!tokenHash) throw new Error('action_link nao tem ?token=')
  console.log('token_hash.len =', tokenHash.length)
  await section('3a) verifyOtp({ token_hash, type: recovery }) (simula o click no link)', async () => {
    const v = await user.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
    if (v.error) throw new Error(v.error.message)
    console.log('sessao de recovery criada, user.id =', v.data.user?.id, 'expires_at =', v.data.session?.expires_at)
  })
  await section('3b) updateUser({ password }) (simula submit do form)', async () => {
    const u = await user.auth.updateUser({ password: newPassword })
    if (u.error) throw new Error(u.error.message)
    console.log('senha atualizada. user.email =', u.data.user?.email)
  })
})

await section('4) Login com NOVA senha (deve dar certo)', async () => {
  const r = await user.auth.signInWithPassword({ email: target, password: newPassword })
  if (r.error) throw new Error(r.error.message)
  console.log('OK user.id =', r.data.user?.id)
})

await section('5) Login com senha ANTIGA (deve falhar)', async () => {
  const r = await user.auth.signInWithPassword({ email: target, password: oldPassword })
  if (!r.error) throw new Error('senha antiga nao foi invalidada!')
  console.log('OK rejeitado:', r.error.message)
})

await section('6) close room + delete room via admin', async () => {
  const code = Math.random().toString(36).slice(2, 7).toUpperCase()
  // Re-login com a NOVA senha para garantir sessao fresca
  await user.auth.signOut()
  const s = await user.auth.signInWithPassword({ email: target, password: newPassword })
  if (s.error) throw new Error('re-login failed')
  // Cria sala
  const create = await user.rpc('create_room', {
    p_code: code, p_room_mode: 'multi_brain', p_game_mode: 'termo', p_theme: 'classic',
    p_max_players: 8, p_total_rounds: 1, p_settings: {},
  })
  if (create.error) throw new Error('create_room: ' + create.error.message)
  const roomId = create.data.id
  console.log('sala criada code =', create.data.code, 'status =', create.data.status)
  // Fecha
  const close = await user.rpc('admin_close_room', { p_room_id: roomId })
  if (close.error) throw new Error('admin_close_room: ' + close.error.message)
  console.log('sala fechada, novo status =', close.data?.status)
  // Tenta fechar de novo (deve falhar)
  const close2 = await user.rpc('admin_close_room', { p_room_id: roomId })
  if (!close2.error) throw new Error('segunda chamada devia ter falhado!')
  console.log('segunda chamada rejeitada:', close2.error.message)
  // Cleanup
  const del = await user.rpc('admin_delete_room', { p_room_id: roomId })
  if (del.error) throw new Error('admin_delete_room: ' + del.error.message)
  console.log('cleanup OK')
})

console.log('\n=== TUDO OK ===')
console.log(`Senha final apos o teste: ${newPassword}`)
console.log('(mude de novo antes de comitar se quiser outra)')
