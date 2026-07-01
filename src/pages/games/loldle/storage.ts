// src/pages/games/loldle/storage.ts
//
// Persistencia do Loldle no localStorage. Chave: loldle:state:${mode}:${dateKey}.
// O mode ('classic' | 'quote') entra na chave para que o save de cada
// modo seja independente.

import type { LoldleState } from './types'

const STORAGE_KEY_PREFIX = 'loldle:state'

export function loldleStorageKey(dateKey: string, mode: 'classic' | 'quote' = 'classic'): string {
  return `${STORAGE_KEY_PREFIX}:${mode}:${dateKey}`
}

export function loadLoldleState(dateKey: string, mode: 'classic' | 'quote' = 'classic'): LoldleState | null {
  try {
    const raw = localStorage.getItem(loldleStorageKey(dateKey, mode))
    if (!raw) return null
    const parsed = JSON.parse(raw) as LoldleState
    if (!parsed.targetId || !Array.isArray(parsed.guesses)) return null
    return parsed
  } catch (e) {
    console.error('loldle: error reading state', e)
    return null
  }
}

export function saveLoldleState(dateKey: string, state: LoldleState, mode: 'classic' | 'quote' = 'classic'): void {
  try {
    localStorage.setItem(loldleStorageKey(dateKey, mode), JSON.stringify(state))
  } catch (e) {
    console.error('loldle: error saving state', e)
  }
}

export function clearLoldleState(dateKey: string, mode: 'classic' | 'quote' = 'classic'): void {
  try {
    localStorage.removeItem(loldleStorageKey(dateKey, mode))
  } catch (e) {
    console.error('loldle: error clearing state', e)
  }
}
