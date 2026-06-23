import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function code() {
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

async function main() {
  const ownerClient = createClient(supabaseUrl, supabaseAnonKey)
  const friendClient = createClient(supabaseUrl, supabaseAnonKey)
  const stamp = Date.now()
  const ownerEmail = `term.ooo.owner.${stamp}@gmail.com`
  const friendEmail = `term.ooo.friend.${stamp}@gmail.com`
  const password = `Smoke-${stamp}-Aa1!`

  const { data: ownerSignUp, error: ownerSignUpError } = await ownerClient.auth.signUp({
    email: ownerEmail,
    password,
    options: { data: { nickname: 'SmokeOwner' } },
  })

  if (ownerSignUpError) throw ownerSignUpError
  if (!ownerSignUp.user) throw new Error('Owner smoke user was not created')

  if (!ownerSignUp.session) {
    console.log('AUTH_CONFIRMATION_REQUIRED')
    return
  }

  const roomCode = code()
  const { data: room, error: createError } = await ownerClient.rpc('create_room', {
    p_code: roomCode,
    p_room_mode: 'multi_brain',
    p_game_mode: 'termo',
    p_theme: 'classic',
    p_max_players: 8,
    p_total_rounds: 1,
    p_settings: { autoSubmitMajorityVote: true, allowOwnerSubmit: true },
  })

  if (createError) throw createError
  if (!room?.id) throw new Error('Room was not created')

  const { data: friendSignUp, error: friendSignUpError } = await friendClient.auth.signUp({
    email: friendEmail,
    password,
    options: { data: { nickname: 'SmokeFriend' } },
  })

  if (friendSignUpError) throw friendSignUpError
  if (!friendSignUp.user || !friendSignUp.session) throw new Error('Friend smoke user was not created')

  const { data: joinedRoom, error: joinError } = await friendClient.rpc('join_room', { p_code: roomCode })
  if (joinError) throw joinError
  if (joinedRoom?.code !== roomCode) throw new Error('Joined room code mismatch')

  const { error: messageError } = await friendClient.from('chat_messages').insert({
    scope: 'room',
    room_id: room.id,
    user_id: friendSignUp.user.id,
    nickname: 'SmokeFriend',
    type: 'message',
    text: 'Teste automatizado de sala.',
  })
  if (messageError) throw messageError

  const { data: suggestion, error: suggestionError } = await friendClient
    .from('guess_suggestions')
    .insert({
      room_id: room.id,
      user_id: friendSignUp.user.id,
      word: 'teste',
      normalized_word: 'teste',
    })
    .select('*')
    .single()
  if (suggestionError) throw suggestionError

  const { error: voteError } = await friendClient.from('guess_votes').insert({
    room_id: room.id,
    suggestion_id: suggestion.id,
    user_id: friendSignUp.user.id,
  })
  if (voteError) throw voteError

  const fakeGameState = {
    mode: 'termo',
    boards: [{ guesses: [], solution: 'teste', isComplete: false }],
    currentGuess: ['', '', '', '', ''],
    currentRow: 0,
    maxAttempts: 6,
    isGameOver: false,
    isWin: false,
    keyStates: {},
    dateKey: `smoke-${stamp}`,
    dayNumber: 1,
  }

  const { error: gameStateError } = await ownerClient
    .from('room_game_states')
    .update({ game_state: fakeGameState, started_at: new Date().toISOString() })
    .eq('room_id', room.id)
  if (gameStateError) throw gameStateError

  const { error: roomUpdateError } = await ownerClient
    .from('rooms')
    .update({ status: 'playing' })
    .eq('id', room.id)
  if (roomUpdateError) throw roomUpdateError

  const { error: suggestionUpdateError } = await ownerClient
    .from('guess_suggestions')
    .update({ status: 'submitted' })
    .eq('id', suggestion.id)
  if (suggestionUpdateError) throw suggestionUpdateError

  const { error: voteCleanupError } = await ownerClient
    .from('guess_votes')
    .delete()
    .eq('room_id', room.id)
  if (voteCleanupError) throw voteCleanupError

  console.log(JSON.stringify({ ok: true, roomCode, ownerId: ownerSignUp.user.id, friendId: friendSignUp.user.id }))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
