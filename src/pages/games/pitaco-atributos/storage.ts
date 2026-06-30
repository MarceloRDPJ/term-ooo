// src/pages/games/pitaco-atributos/storage.ts
//
// Persistencia do PITACO Atributos no localStorage.
// Chave: pitaco:atributos:state:${dateKey}

import type { AtributosState } from './types'

const STORAGE_KEY_PREFIX = 'pitaco:atributos:state'

export function atributosStorageKey(dateKey: string): string {
  return `${STORAGE_KEY_PREFIX}:${dateKey}`
}

export function loadAtributosState(dateKey: string): AtributosState | null {
  try {
    const data = localStorage.getItem(atributosStorageKey(dateKey))
    if (!data) return null
    return JSON.parse(data) as AtributosState
  } catch (e) {
    console.error('Error loading atributos state:', e)
    return null
  }
}

export function saveAtributosState(dateKey: string, state: AtributosState): void {
  try {
    localStorage.setItem(atributosStorageKey(dateKey), JSON.stringify(state))
  } catch (e) {
    console.error('Error saving atributos state:', e)
  }
}

export function clearAtributosState(dateKey: string): void {
  try {
    localStorage.removeItem(atributosStorageKey(dateKey))
  } catch (e) {
    console.error('Error clearing atributos state:', e)
  }
}
