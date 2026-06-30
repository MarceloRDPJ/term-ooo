// src/pages/games/narutodle/storage.ts
//
// Persistencia do Narutodle no localStorage. Chave: `narutodle:state:${dateKey}`.
// Padrao igual ao PITACO Geografia (`pitaco:geografia:state:${dateKey}`) e
// PITACO Cruzado (`pitaco:crossword:state:${dateKey}`) — escopo proprio
// nao colide com outros jogos do app.

import type { NarutodleState } from './types'

const STORAGE_KEY_PREFIX = 'narutodle:state'

export function narutodleStorageKey(dateKey: string): string {
  return `${STORAGE_KEY_PREFIX}:${dateKey}`
}

export function loadNarutodleState(dateKey: string): NarutodleState | null {
  try {
    const data = localStorage.getItem(narutodleStorageKey(dateKey))
    if (!data) return null
    return JSON.parse(data) as NarutodleState
  } catch (e) {
    console.error('[narutodle] erro ao carregar estado:', e)
    return null
  }
}

export function saveNarutodleState(dateKey: string, state: NarutodleState): void {
  try {
    localStorage.setItem(narutodleStorageKey(dateKey), JSON.stringify(state))
  } catch (e) {
    console.error('[narutodle] erro ao salvar estado:', e)
  }
}

export function clearNarutodleState(dateKey: string): void {
  try {
    localStorage.removeItem(narutodleStorageKey(dateKey))
  } catch (e) {
    console.error('[narutodle] erro ao limpar estado:', e)
  }
}
