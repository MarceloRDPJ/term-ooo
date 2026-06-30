import { GameMode } from '@/game/types'
import { GameState } from '@/game/types'

export type RoomMode = 'daily_team' | 'theme_team' | 'multi_brain' | 'multi_task' | 'mega_brain'
export type ThemeId = 'classic' | 'frutas' | 'objetos' | 'filmes' | 'series' | 'animes'
export type RoomStatus = 'lobby' | 'playing' | 'finished' | 'abandoned'
export type PlayerRole = 'owner' | 'moderator' | 'player'
export type PlayerStatus = 'online' | 'offline'
export type MessageScope = 'global' | 'room'
export type RoomMessageType = 'message' | 'system' | 'join' | 'leave' | 'guess' | 'vote' | 'error'
export type SuggestionStatus = 'active' | 'submitted' | 'rejected' | 'expired'

export type AvatarConfig = { style?: string; seed?: string }

export interface Profile {
  id: string
  nickname: string
  avatar_url: string | null
  avatar_config: Record<string, unknown>
  role: 'user' | 'admin' | 'banned'
  created_at: string
  updated_at: string
}

export interface RoomSettings {
  autoSubmitMajorityVote?: boolean
  allowOwnerSubmit?: boolean
  turnTimerSeconds?: number | null
}

export interface Room {
  id: string
  code: string
  owner_id: string
  status: RoomStatus
  room_mode: RoomMode
  game_mode: GameMode
  theme: ThemeId
  max_players: number
  settings: RoomSettings
  current_round: number
  total_rounds: number
  invite_slug: string | null
  created_at: string
  updated_at: string
  expires_at: string
}

export interface RoomPlayer {
  id: string
  room_id: string
  user_id: string
  role: PlayerRole
  status: PlayerStatus
  is_ready: boolean
  is_muted: boolean
  score: number
  joined_at: string
  last_seen_at: string
  profiles?: Pick<Profile, 'nickname' | 'avatar_url' | 'avatar_config'> | null
}

export interface RoomGameState {
  id: string
  room_id: string
  state_version: number
  game_state: Record<string, unknown>
  started_at: string | null
  finished_at: string | null
  created_at: string
  updated_at: string
}

export type SharedRoomGame = GameState

export interface ChatMessage {
  id: string
  scope: MessageScope
  room_id: string | null
  user_id: string | null
  nickname: string | null
  type: RoomMessageType
  text: string
  created_at: string
}

export interface GuessSuggestion {
  id: string
  room_id: string
  user_id: string
  word: string
  normalized_word: string
  status: SuggestionStatus
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'nickname'> | null
}

export interface GuessVote {
  id: string
  suggestion_id: string
  room_id: string
  user_id: string
  created_at: string
}

export interface CreateRoomInput {
  roomMode: RoomMode
  gameMode: GameMode
  theme: ThemeId
  maxPlayers: number
  totalRounds: number
  settings?: RoomSettings
}

export interface RoomSummary {
  id: string
  code: string
  status: RoomStatus
  room_mode: RoomMode
  game_mode: GameMode
  theme: ThemeId
  max_players: number
  current_round: number
  total_rounds: number
  created_at: string
  role: PlayerRole
  player_count: number
}
