import { RealtimeChannel } from '@supabase/supabase-js'
import { createInitialGameState, getDayNumber, processGuess } from '@/game/engine'
import { GameState, Settings } from '@/game/types'
import { supabase } from './supabase'
import {
  ChatMessage,
  CreateRoomInput,
  GuessSuggestion,
  GuessVote,
  Room,
  RoomGameState,
  RoomPlayer,
  RoomSummary,
} from './multiplayer-types'
import { normalizeString } from './utils'

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRoomCode(length = 5): string {
  let code = ''
  const cryptoApi = window.crypto
  const values = new Uint32Array(length)
  cryptoApi.getRandomValues(values)

  for (let i = 0; i < length; i++) {
    code += ROOM_CODE_ALPHABET[values[i] % ROOM_CODE_ALPHABET.length]
  }

  return code
}

export function getRoomInviteUrl(code: string): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}sala/${code}`
}

export function isSharedGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<GameState>
  return (
    typeof state.mode === 'string' &&
    Array.isArray(state.boards) &&
    Array.isArray(state.currentGuess) &&
    typeof state.currentRow === 'number' &&
    typeof state.maxAttempts === 'number' &&
    typeof state.isGameOver === 'boolean' &&
    typeof state.isWin === 'boolean' &&
    typeof state.keyStates === 'object' &&
    typeof state.dateKey === 'string' &&
    typeof state.dayNumber === 'number'
  )
}

export async function createRoom(input: CreateRoomInput): Promise<Room> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode(attempt > 2 ? 6 : 5)
    const { data, error } = await supabase.rpc('create_room', {
      p_code: code,
      p_room_mode: input.roomMode,
      p_game_mode: input.gameMode,
      p_theme: input.theme,
      p_max_players: input.maxPlayers,
      p_total_rounds: input.totalRounds,
      p_settings: input.settings ?? {},
    })

    if (!error && data) return data as Room

    lastError = new Error(error?.message || 'Erro ao abrir pauta')
    if (!error?.message?.toLowerCase().includes('duplicate')) break
  }

  throw lastError || new Error('Nao foi possivel criar a sala')
}

export async function joinRoom(code: string): Promise<Room> {
  const { data, error } = await supabase.rpc('join_room', { p_code: code.trim().toUpperCase() })
  if (error) throw new Error(error.message)
  return data as Room
}

export async function getRoomByCode(code: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as Room | null
}

export async function getRoomPlayers(roomId: string): Promise<RoomPlayer[]> {
  const { data, error } = await supabase
    .from('room_players')
    .select('*, profiles(nickname, avatar_url, avatar_config)')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as RoomPlayer[]
}

export async function getRoomGameState(roomId: string): Promise<RoomGameState | null> {
  const { data, error } = await supabase
    .from('room_game_states')
    .select('*')
    .eq('room_id', roomId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as RoomGameState | null
}

export async function startRoomGame(room: Room): Promise<GameState> {
  const dayNumber = getDayNumber()
  const initialState = createInitialGameState(
    room.game_mode,
    dayNumber,
    `room-${room.id}-round-${room.current_round}`
  )

  const { error: stateError } = await supabase
    .from('room_game_states')
    .update({
      state_version: 1,
      game_state: initialState,
      started_at: new Date().toISOString(),
      finished_at: null,
    })
    .eq('room_id', room.id)

  if (stateError) throw new Error(stateError.message)

  const { error: roomError } = await supabase
    .from('rooms')
    .update({ status: 'playing' })
    .eq('id', room.id)

  if (roomError) throw new Error(roomError.message)

  return initialState
}

export async function submitRoomGuess(
  room: Room,
  roomGameState: RoomGameState,
  word: string,
  suggestionId?: string
): Promise<GameState> {
  if (!isSharedGameState(roomGameState.game_state)) {
    throw new Error('A partida ainda nao foi iniciada')
  }

  const normalizedWord = normalizeString(word)
  if (!/^[a-z]{5}$/.test(normalizedWord)) {
    throw new Error('O pitaco precisa ter exatamente 5 letras')
  }

  const stateWithGuess: GameState = {
    ...roomGameState.game_state,
    currentGuess: normalizedWord.split(''),
  }
  const settings: Settings = {
    highContrast: false,
    hardMode: false,
    soundEnabled: false,
  }
  const result = processGuess(stateWithGuess, settings)

  if (result.error) throw new Error(result.error)

  const nextState = result.newState
  const nextVersion = roomGameState.state_version + 1

  const { error: stateError } = await supabase
    .from('room_game_states')
    .update({
      state_version: nextVersion,
      game_state: nextState,
      finished_at: nextState.isGameOver ? new Date().toISOString() : null,
    })
    .eq('id', roomGameState.id)
    .eq('state_version', roomGameState.state_version)

  if (stateError) throw new Error(stateError.message)

  if (suggestionId) {
    const { error: suggestionError } = await supabase
      .from('guess_suggestions')
      .update({ status: 'submitted' })
      .eq('id', suggestionId)

    if (suggestionError) throw new Error(suggestionError.message)
  }

  const { error: expireError } = await supabase
    .from('guess_suggestions')
    .update({ status: 'expired' })
    .eq('room_id', room.id)
    .eq('status', 'active')

  if (expireError) throw new Error(expireError.message)

  const { error: voteError } = await supabase
    .from('guess_votes')
    .delete()
    .eq('room_id', room.id)

  if (voteError) throw new Error(voteError.message)

  if (nextState.isGameOver) {
    const { error: roomError } = await supabase
      .from('rooms')
      .update({ status: 'finished' })
      .eq('id', room.id)

    if (roomError) throw new Error(roomError.message)
  }

  return nextState
}

export async function getRoomMessages(roomId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('scope', 'room')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) throw new Error(error.message)
  return (data ?? []) as ChatMessage[]
}

export async function sendRoomMessage(roomId: string, text: string, nickname?: string | null): Promise<void> {
  const cleaned = text.trim()
  if (!cleaned) return

  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) throw new Error('Voce precisa estar logado para enviar mensagens')

  const { error } = await supabase.from('chat_messages').insert({
    scope: 'room',
    room_id: roomId,
    user_id: user.id,
    nickname: nickname || null,
    type: 'message',
    text: cleaned.slice(0, 1000),
  })

  if (error) throw new Error(error.message)
}

export async function getSuggestions(roomId: string): Promise<GuessSuggestion[]> {
  const { data, error } = await supabase
    .from('guess_suggestions')
    .select('*, profiles(nickname)')
    .eq('room_id', roomId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as GuessSuggestion[]
}

export async function suggestGuess(roomId: string, word: string): Promise<void> {
  const normalizedWord = normalizeString(word)
  if (!/^[a-z]{5}$/.test(normalizedWord)) {
    throw new Error('A sugestao precisa ter exatamente 5 letras')
  }

  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) throw new Error('Voce precisa estar logado para sugerir')

  const { error } = await supabase.from('guess_suggestions').insert({
    room_id: roomId,
    user_id: user.id,
    word: word.trim().toLowerCase().slice(0, 5),
    normalized_word: normalizedWord,
  })

  if (error) throw new Error(error.message)
}

export async function voteSuggestion(roomId: string, suggestionId: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) throw new Error('Voce precisa estar logado para votar')

  await supabase
    .from('guess_votes')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', user.id)

  const { error } = await supabase.from('guess_votes').insert({
    room_id: roomId,
    suggestion_id: suggestionId,
    user_id: user.id,
  })

  if (error) throw new Error(error.message)
}

export async function getVotes(roomId: string): Promise<GuessVote[]> {
  const { data, error } = await supabase
    .from('guess_votes')
    .select('*')
    .eq('room_id', roomId)

  if (error) throw new Error(error.message)
  return (data ?? []) as GuessVote[]
}

export function subscribeToRoom(roomId: string, onChange: () => void): RealtimeChannel {
  return supabase
    .channel(`room:${roomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'room_game_states', filter: `room_id=eq.${roomId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'guess_suggestions', filter: `room_id=eq.${roomId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'guess_votes', filter: `room_id=eq.${roomId}` }, onChange)
    .subscribe()
}

export async function listMyRooms(userId: string): Promise<RoomSummary[]> {
  if (!userId) return []

  const [ownedRes, joinedRes, playersRes] = await Promise.all([
    supabase
      .from('rooms')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('room_players')
      .select('room_id, role, rooms(*)')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .limit(40),
    supabase
      .from('room_players')
      .select('room_id'),
  ])

  if (ownedRes.error) throw new Error(ownedRes.error.message)
  if (joinedRes.error) throw new Error(joinedRes.error.message)
  if (playersRes.error) throw new Error(playersRes.error.message)

  const playerCountByRoom: Record<string, number> = {}
  for (const row of playersRes.data ?? []) {
    const id = (row as { room_id: string }).room_id
    playerCountByRoom[id] = (playerCountByRoom[id] ?? 0) + 1
  }

  const merged = new Map<string, { room: Room; role: RoomSummary['role'] }>()

  for (const room of (ownedRes.data ?? []) as Room[]) {
    merged.set(room.id, { room, role: 'owner' })
  }

  for (const row of (joinedRes.data ?? []) as Array<{ room_id: string; role: RoomSummary['role']; rooms: Room | Room[] | null }>) {
    const inner = Array.isArray(row.rooms) ? row.rooms[0] : row.rooms
    if (!inner) continue
    const existing = merged.get(row.room_id)
    if (existing && existing.role === 'owner') continue
    merged.set(row.room_id, { room: inner as Room, role: row.role ?? 'player' })
  }

  const summaries: RoomSummary[] = []
  for (const { room, role } of merged.values()) {
    summaries.push({
      id: room.id,
      code: room.code,
      status: room.status,
      room_mode: room.room_mode,
      game_mode: room.game_mode,
      theme: room.theme,
      max_players: room.max_players,
      current_round: room.current_round,
      total_rounds: room.total_rounds,
      created_at: room.created_at,
      role,
      player_count: playerCountByRoom[room.id] ?? (role === 'owner' ? 1 : 0),
    })
  }

  summaries.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  return summaries.slice(0, 10)
}
