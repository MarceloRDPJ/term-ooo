// scripts/test-owner-close.mjs
// Testa a RPC public.owner_close_room com 3 cenarios:
//   1) User anonimo (sem sessao) nao deve conseguir fechar
//   2) User autenticado que NAO e dono deve receber NOT_OWNER_OR_ADMIN
//   3) User que E dono deve conseguir fechar (status=abandoned)
//   4) Segunda chamada do mesmo dono deve falhar com ROOM_NOT_OPEN
//
// service_role -> cria users, faz cleanup
// anon key     -> testes com sessao (owner, other, anon)
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
if (!url || !serviceKey || !anonKey) {
  console.error('Faltando envs (VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })

const password = 'TestPass123!'

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function genCode() {
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

const results = []
function record(label, status, detail) {
  const line = { label, status, detail }
  results.push(line)
  console.log(`[${status}] ${label} :: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`)
}

async function signUpAndLogin(email, nickname) {
  const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { nickname } },
  })
  if (error) throw new Error(`signUp ${email}: ${error.message}`)
  if (!data.user) throw new Error(`signUp ${email}: sem user`)
  if (!data.session) throw new Error(`signUp ${email}: sem session (email confirmation habilitada?)`)
  return { user: data.user, session: data.session, client }
}

async function cleanup({ owner, other, roomId }) {
  console.log('\n--- CLEANUP ---')
  if (roomId) {
    const { error } = await admin.rpc('admin_delete_room', { p_room_id: roomId })
    if (error) console.log('  admin_delete_room ERR:', error.message)
    else console.log('  admin_delete_room OK para', roomId)
  }
  for (const u of [owner, other]) {
    if (!u) continue
    const { error } = await admin.auth.admin.deleteUser(u.id)
    if (error) console.log(`  deleteUser ${u.email} ERR:`, error.message)
    else console.log(`  deleteUser ${u.email} OK`)
  }
}

async function main() {
  const ts = Date.now()
  const ownerEmail = `diag-owner-${ts}@pitaco-test.local`
  const otherEmail = `diag-other-${ts}@pitaco-test.local`
  const ownerNick = 'DiagOwner'
  const otherNick = 'DiagOther'

  let owner, other, roomId
  try {
    console.log('--- 1) Criar users de teste ---')
    owner = (await signUpAndLogin(ownerEmail, ownerNick)).user
    other = (await signUpAndLogin(otherEmail, otherNick)).user
    console.log(`  owner.id=${owner.id}  other.id=${other.id}`)

    console.log('\n--- 2) Owner cria sala via create_room ---')
    const ownerClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { error: sErr } = await ownerClient.auth.signInWithPassword({ email: ownerEmail, password })
    if (sErr) throw new Error(`owner signIn: ${sErr.message}`)

    const code = genCode()
    const { data: room, error: cErr } = await ownerClient.rpc('create_room', {
      p_code: code,
      p_room_mode: 'multi_brain',
      p_game_mode: 'termo',
      p_theme: 'classic',
      p_max_players: 8,
      p_total_rounds: 1,
      p_settings: {},
    })
    if (cErr) throw new Error(`create_room: ${cErr.message}`)
    if (!room?.id) throw new Error('create_room: sem room')
    roomId = room.id
    console.log(`  room.id=${roomId}  code=${code}  status=${room.status}`)

    // -------- Cenario A: anon sem sessao --------
    console.log('\n--- 3) Cenario A: anon sem sessao tenta fechar ---')
    {
      const { data, error } = await anon.rpc('owner_close_room', { p_room_id: roomId })
      if (error && /NOT_AUTH/.test(error.message)) {
        record('A.anon → NOT_AUTH', 'OK', error.message)
      } else if (data) {
        record('A.anon → NAO BLOQUEOU', 'FAIL', data)
      } else {
        record('A.anon → erro inesperado', 'FAIL', error?.message)
      }
    }

    // -------- Cenario B: other user (autenticado, nao dono) --------
    console.log('\n--- 4) Cenario B: other (autenticado, nao dono) tenta fechar ---')
    {
      const otherClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
      const { error: sErr2 } = await otherClient.auth.signInWithPassword({ email: otherEmail, password })
      if (sErr2) throw new Error(`other signIn: ${sErr2.message}`)

      const { data, error } = await otherClient.rpc('owner_close_room', { p_room_id: roomId })
      if (error && /NOT_OWNER_OR_ADMIN/.test(error.message)) {
        record('B.other → NOT_OWNER_OR_ADMIN', 'OK', error.message)
      } else if (data) {
        record('B.other → NAO BLOQUEOU', 'FAIL', data)
      } else {
        record('B.other → erro inesperado', 'FAIL', error?.message)
      }
    }

    // -------- Cenario C: dono fecha --------
    console.log('\n--- 5) Cenario C: owner fecha a sala ---')
    {
      const { data, error } = await ownerClient.rpc('owner_close_room', { p_room_id: roomId })
      if (error) {
        record('C.owner → erro', 'FAIL', error.message)
      } else if (data?.status === 'abandoned') {
        record('C.owner → status=abandoned', 'OK', { id: data.id, status: data.status })
      } else {
        record('C.owner → status inesperado', 'FAIL', data)
      }
    }

    // -------- Cenario D: owner tenta fechar de novo --------
    console.log('\n--- 6) Cenario D: owner tenta fechar de novo (sala ja abandoned) ---')
    {
      const { data, error } = await ownerClient.rpc('owner_close_room', { p_room_id: roomId })
      if (error && /ROOM_NOT_OPEN/.test(error.message)) {
        record('D.owner2x → ROOM_NOT_OPEN', 'OK', error.message)
      } else if (data) {
        record('D.owner2x → NAO BLOQUEOU', 'FAIL', data)
      } else {
        record('D.owner2x → erro inesperado', 'FAIL', error?.message)
      }
    }
  } catch (e) {
    record('setup', 'FATAL', e.message ?? String(e))
  } finally {
    await cleanup({ owner, other, roomId })
  }

  const fails = results.filter((r) => r.status !== 'OK' && r.status !== 'FATAL')
  const fatals = results.filter((r) => r.status === 'FATAL')
  console.log('\n--- RESUMO ---')
  console.log(JSON.stringify(results, null, 2))
  if (fatals.length || fails.length) {
    process.exit(1)
  }
  process.exit(0)
}

main()
