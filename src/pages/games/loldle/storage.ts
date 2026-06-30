// src/pages/games/loldle/storage.ts
//
// Persistencia do Loldle no localStorage. Chave: loldle:state:${dateKey}

import type { LoldleState } from './types'

const STORAGE_KEY_PREFIX = 'loldle:state'

export function loldleStorageKey(dateKey: string): string {
  return `${STORAGE_KEY_PREFIX}:${dateKey}`
}

export function loadLoldleState(dateKey: string): LoldleState | null {
  try {
    const raw = localStorage.getItem(loldleStorageKey(dateKey))
    if (!raw) return null
    const parsed = JSON.parse(raw) as LoldleState
    if (!parsed.targetId || !Array.isArray(parsed.guesses)) return null
    return parsed
  } catch (e) {
    console.error('loldle: error reading state', e)
    return null
  }
}

export function saveLoldleState(dateKey: string, state: LoldleState): void {
  try {
    localStorage.setItem(loldleStorageKey(dateKey), JSON.stringify(state))
  } catch (e) {
    console.error('loldle: error saving state', e)
  }
}

export function clearLoldleState(dateKey: string): void {
  try {
    localStorage.removeItem(loldleStorageKey(dateKey))
  } catch (e) {
    console.error('loldle: error clearing state', e)
  }
}
