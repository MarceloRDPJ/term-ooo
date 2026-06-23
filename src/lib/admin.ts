import { supabase } from './supabase'
import type { GameMode } from '@/game/types'
import type { RoomMode, RoomStatus, ThemeId } from './multiplayer-types'

export type UserRole = 'user' | 'admin' | 'banned'

export const CLOSABLE_ROOM_STATUSES: RoomStatus[] = ['lobby', 'playing']

export function canCloseRoom(status: RoomStatus): boolean {
  return CLOSABLE_ROOM_STATUSES.includes(status)
}

export interface AdminUser {
  id: string
  email: string
  nickname: string
  role: UserRole
  created_at: string
  last_sign_in_at: string | null
}

export interface AdminRoom {
  id: string
  code: string
  owner_id: string
  owner_nickname: string | null
  status: RoomStatus
  room_mode: RoomMode
  game_mode: GameMode
  theme: ThemeId
  max_players: number
  current_round: number
  total_rounds: number
  created_at: string
  expires_at: string
  player_count: number
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.rpc('admin_list_users')
  if (error) throw new Error(error.message)
  return (data ?? []) as AdminUser[]
}

export async function listAdminRooms(): Promise<AdminRoom[]> {
  const { data, error } = await supabase.rpc('admin_list_rooms')
  if (error) throw new Error(error.message)
  return (data ?? []) as AdminRoom[]
}

export async function adminCloseRoom(roomId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_close_room', { p_room_id: roomId })
  if (error) throw new Error(error.message)
}

export async function adminDeleteRoom(roomId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_room', { p_room_id: roomId })
  if (error) throw new Error(error.message)
}

export async function adminBanUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_ban_user', { p_user_id: userId })
  if (error) throw new Error(error.message)
}

export function isUserAdmin(role: string | null | undefined): boolean {
  return role === 'admin'
}
