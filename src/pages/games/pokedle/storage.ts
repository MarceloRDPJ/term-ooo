// src/pages/games/pokedle/storage.ts

import type { PokedleState } from './types'

const STORAGE_KEY_PREFIX = 'pokedle:state:v1'

export function pokedleStorageKey(dateKey: string): string {
  return `${STORAGE_KEY_PREFIX}:${dateKey}`
}

export function loadPokedleState(dateKey: string): PokedleState | null {
  try {
    const data = localStorage.getItem(pokedleStorageKey(dateKey))
    if (!data) return null
    const parsed = JSON.parse(data) as PokedleState
    return parsed.dateKey === dateKey ? parsed : null
  } catch (error) {
    console.error('[pokedle] load failed:', error)
    return null
  }
}

export function savePokedleState(dateKey: string, state: PokedleState): void {
  try {
    localStorage.setItem(pokedleStorageKey(dateKey), JSON.stringify(state))
  } catch (error) {
    console.error('[pokedle] save failed:', error)
  }
}

export function clearPokedleState(dateKey: string): void {
  try {
    localStorage.removeItem(pokedleStorageKey(dateKey))
  } catch (error) {
    console.error('[pokedle] clear failed:', error)
  }
}
