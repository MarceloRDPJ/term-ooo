// src/pages/games/pitaco-citacao/storage.ts
//
// Persistencia do PITACO Citacao. Chave: pitaco:citacao:state:${dateKey}

import type { CitacaoState } from './types'

const STORAGE_KEY_PREFIX = 'pitaco:citacao:state'

export function citacaoStorageKey(dateKey: string): string {
  return `${STORAGE_KEY_PREFIX}:${dateKey}`
}

export function loadCitacaoState(dateKey: string): CitacaoState | null {
  try {
    const data = localStorage.getItem(citacaoStorageKey(dateKey))
    if (!data) return null
    return JSON.parse(data) as CitacaoState
  } catch (e) {
    console.error('Error loading citacao state:', e)
    return null
  }
}

export function saveCitacaoState(dateKey: string, state: CitacaoState): void {
  try {
    localStorage.setItem(citacaoStorageKey(dateKey), JSON.stringify(state))
  } catch (e) {
    console.error('Error saving citacao state:', e)
  }
}

export function clearCitacaoState(dateKey: string): void {
  try {
    localStorage.removeItem(citacaoStorageKey(dateKey))
  } catch (e) {
    console.error('Error clearing citacao state:', e)
  }
}
