// src/pages/games/pitaco-emoji/storage.ts
//
// Persistencia do PITACO Emoji. Chave: pitaco:emoji:state:${dateKey}

import type { EmojiState } from './types'

const STORAGE_KEY_PREFIX = 'pitaco:emoji:state'

export function emojiStorageKey(dateKey: string): string {
  return `${STORAGE_KEY_PREFIX}:${dateKey}`
}

export function loadEmojiState(dateKey: string): EmojiState | null {
  try {
    const data = localStorage.getItem(emojiStorageKey(dateKey))
    if (!data) return null
    return JSON.parse(data) as EmojiState
  } catch (e) {
    console.error('Error loading emoji state:', e)
    return null
  }
}

export function saveEmojiState(dateKey: string, state: EmojiState): void {
  try {
    localStorage.setItem(emojiStorageKey(dateKey), JSON.stringify(state))
  } catch (e) {
    console.error('Error saving emoji state:', e)
  }
}

export function clearEmojiState(dateKey: string): void {
  try {
    localStorage.removeItem(emojiStorageKey(dateKey))
  } catch (e) {
    console.error('Error clearing emoji state:', e)
  }
}
