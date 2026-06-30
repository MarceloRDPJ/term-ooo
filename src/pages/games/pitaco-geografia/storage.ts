// src/pages/games/pitaco-geografia/storage.ts
//
// Persistencia do PITACO Geografia no localStorage. Chave: pitaco:geografia:state:${dateKey}

import type { GeoState } from './types'

const STORAGE_KEY_PREFIX = 'pitaco:geografia:state'

export function geoStorageKey(dateKey: string): string {
  return `${STORAGE_KEY_PREFIX}:${dateKey}`
}

export function loadGeoState(dateKey: string): GeoState | null {
  try {
    const data = localStorage.getItem(geoStorageKey(dateKey))
    if (!data) return null
    return JSON.parse(data) as GeoState
  } catch (e) {
    console.error('Error loading geo state:', e)
    return null
  }
}

export function saveGeoState(dateKey: string, state: GeoState): void {
  try {
    localStorage.setItem(geoStorageKey(dateKey), JSON.stringify(state))
  } catch (e) {
    console.error('Error saving geo state:', e)
  }
}

export function clearGeoState(dateKey: string): void {
  try {
    localStorage.removeItem(geoStorageKey(dateKey))
  } catch (e) {
    console.error('Error clearing geo state:', e)
  }
}
