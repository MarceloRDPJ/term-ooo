// src/pages/games/narutodle/storage.ts

import type { NarutodleMode, NarutodleState } from './types'

const STORAGE_KEY_PREFIX = 'narutodle:state:v2'

export function narutodleStorageKey(dateKey: string, mode: NarutodleMode = 'classic'): string {
  return `${STORAGE_KEY_PREFIX}:${mode}:${dateKey}`
}

export function loadNarutodleState(dateKey: string, mode: NarutodleMode = 'classic'): NarutodleState | null {
  try {
    const data = localStorage.getItem(narutodleStorageKey(dateKey, mode))
    if (!data) return null
    const parsed = JSON.parse(data) as NarutodleState
    return parsed.mode === mode ? parsed : null
  } catch (e) {
    console.error('[narutodle] erro ao carregar estado:', e)
    return null
  }
}

export function saveNarutodleState(dateKey: string, state: NarutodleState, mode: NarutodleMode = 'classic'): void {
  try {
    localStorage.setItem(narutodleStorageKey(dateKey, mode), JSON.stringify(state))
  } catch (e) {
    console.error('[narutodle] erro ao salvar estado:', e)
  }
}

export function clearNarutodleState(dateKey: string, mode: NarutodleMode = 'classic'): void {
  try {
    localStorage.removeItem(narutodleStorageKey(dateKey, mode))
  } catch (e) {
    console.error('[narutodle] erro ao limpar estado:', e)
  }
}
