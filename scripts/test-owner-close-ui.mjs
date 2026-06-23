// scripts/test-owner-close-ui.mjs
// E2E test for the owner_close_room RPC + the corresponding PautasRecentesList UI flow.
// 1. Creates 2 anon users (owner + other).
// 2. owner creates a room.
// 3. other tries owner_close_room (must fail with NOT_OWNER_OR_ADMIN).
// 4. owner closes (must succeed, status=abandoned).
// 5. owner retries (must fail with ROOM_NOT_OPEN).
// 6. Cleanup via admin_delete_room with service_role (if available).
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function randomCode(len = 6) {
  return Array.from({ length: len }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('')
}

let failed = 0
function expect(label, condition, detail) {
  if (condition) {
    console.log(`  OK  ${label}`)
  } else {
    console.log(`  FAIL ${label}${detail ? ` -- ${detail}` : ''}`)
    failed += 1
  }
}

function extractErrorCode(message) {
  if (!message) return null
  const m = message.match(/\b(NOT_OWNER_OR_ADMIN|ROOM_NOT_OPEN|ROOM_NOT_FOUND|NOT_AUTH|NOT_ADMIN)\b/)
  return m ? m[1] : null
}

async function signUpAnon(label, email, password) {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { nickname: label } },
  })
  if (error) throw new Error(`signUp ${label}: ${error.message}`)
  if (!data.user) throw new Error(`signUp ${label}: no user returned`)
  if (!data.session) {
    throw new Error(
      `signUp ${label}: no session (project may require email confirmation). ` +
        `Disable "Confirm email" in Supabase Auth settings to run this script.`,
    )
  }
  return { client, user: data.user, session: data.session }
}

async function main() {
  const stamp = Date.now()
  const ownerEmail = `term.ooo.owner.close.${stamp}@gmail.com`
  const otherEmail = `term.ooo.other.close.${stamp}@gmail.com`
  const password = `OwnerClose-${stamp}-Aa1!`

  console.log('--- 1) Sign up owner + other ---')
  const owner = await signUpAnon('OwnerClose', ownerEmail, password)
  const other = await signUpAnon('OtherClose', otherEmail, password)
  console.log(`  owner.id = ${owner.user.id}`)
  console.log(`  other.id = ${other.user.id}`)

  console.log('\n--- 2) owner creates a room ---')
  const code = randomCode()
  const { data: room, error: createError } = await owner.client.rpc('create_room', {
    p_code: code,
    p_room_mode: 'multi_brain',
    p_game_mode: 'termo',
    p_theme: 'classic',
    p_max_players: 8,
    p_total_rounds: 1,
    p_settings: { autoSubmitMajorityVote: true, allowOwnerSubmit: true },
  })
  if (createError) throw new Error(`create_room: ${createError.message}`)
  expect('room created', !!room?.id && room.status === 'lobby', `room=${JSON.stringify(room)}`)
  const roomId = room.id
  console.log(`  room.code = ${room.code}  status = ${room.status}`)

  console.log('\n--- 3) other tries owner_close_room (must fail with NOT_OWNER_OR_ADMIN) ---')
  const { data: otherRes, error: otherErr } = await other.client.rpc('owner_close_room', {
    p_room_id: roomId,
  })
  expect('other rejected', !!otherErr, `data=${JSON.stringify(otherRes)} err=${otherErr?.message ?? '-'}`)
  const otherCode = extractErrorCode(otherErr?.message)
  expect('error code = NOT_OWNER_OR_ADMIN', otherCode === 'NOT_OWNER_OR_ADMIN', `code=${otherCode}`)

  // Confirm the room was NOT touched
  const { data: roomAfter3 } = await owner.client.from('rooms').select('status').eq('id', roomId).maybeSingle()
  expect('room still in lobby after failed attempt', roomAfter3?.status === 'lobby', `status=${roomAfter3?.status}`)

  console.log('\n--- 4) owner closes the room (must succeed, status=abandoned) ---')
  const { data: closeRes, error: closeErr } = await owner.client.rpc('owner_close_room', {
    p_room_id: roomId,
  })
  expect('owner close ok', !closeErr, `err=${closeErr?.message ?? '-'}`)
  expect('returned room.status = abandoned', closeRes?.status === 'abandoned', `status=${closeRes?.status}`)

  console.log('\n--- 5) owner retries (must fail with ROOM_NOT_OPEN) ---')
  const { data: retryRes, error: retryErr } = await owner.client.rpc('owner_close_room', {
    p_room_id: roomId,
  })
  expect('retry rejected', !!retryErr, `data=${JSON.stringify(retryRes)} err=${retryErr?.message ?? '-'}`)
  const retryCode = extractErrorCode(retryErr?.message)
  expect('error code = ROOM_NOT_OPEN', retryCode === 'ROOM_NOT_OPEN', `code=${retryCode}`)

  console.log('\n--- 6) Cleanup ---')
  if (supabaseServiceKey) {
    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { error: delErr } = await admin.rpc('admin_delete_room', { p_room_id: roomId })
    if (delErr) {
      console.log(`  WARN cleanup failed: ${delErr.message}`)
    } else {
      console.log('  OK admin_delete_room removed the abandoned room')
    }
  } else {
    console.log('  SKIP (SUPABASE_SERVICE_ROLE_KEY not set) -- leaving abandoned room in place')
  }

  if (failed > 0) {
    console.log(`\n=== FAILED (${failed} assertion(s)) ===`)
    process.exit(1)
  }
  console.log('\n=== ALL OK ===')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
