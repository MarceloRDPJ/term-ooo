// src/pages/games/narutodle/storage.ts
//
// Persistencia do Narutodle no localStorage.
// Chave: `narutodle:state:${mode}:${dateKey}`. O mode entra na chave
// para que o save de cada modo seja independente.
//
// Padrao igual ao PITACO Geografia (`pitaco:geografia:state:${dateKey}`) e
// PITACO Cruzado (`pitaco:crossword:state:${dateKey}`) — escopo proprio
// nao colide com outros jogos do app.

import type { NarutodleState } from './types'

const STORAGE_KEY_PREFIX = 'narutodle:state'

export function narutodleStorageKey(
  dateKey: string,
  mode: 'classic' | 'silhouette' = 'classic'
): string {
  return `${STORAGE_KEY_PREFIX}:${mode}:${dateKey}`
}

export function loadNarutodleState(
  dateKey: string,
  mode: 'classic' | 'silhouette' = 'classic'
): NarutodleState | null {
  try {
    const data = localStorage.getItem(narutodleStorageKey(dateKey, mode))
    if (!data) return null
    return JSON.parse(data) as NarutodleState
  } catch (e) {
    console.error('[narutodle] erro ao carregar estado:', e)
    return null
  }
}

export function saveNarutodleState(
  dateKey: string,
  state: NarutodleState,
  mode: 'classic' | 'silhouette' = 'classic'
): void {
  try {
    localStorage.setItem(narutodleStorageKey(dateKey, mode), JSON.stringify(state))
  } catch (e) {
    console.error('[narutodle] erro ao salvar estado:', e)
  }
}

export function clearNarutodleState(
  dateKey: string,
  mode: 'classic' | 'silhouette' = 'classic'
): void {
  try {
    localStorage.removeItem(narutodleStorageKey(dateKey, mode))
  } catch (e) {
    console.error('[narutodle] erro ao limpar estado:', e)
  }
}
