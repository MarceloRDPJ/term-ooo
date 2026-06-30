// src/pages/games/pitaco-emoji/types.ts
//
// Tipos do PITACO Emoji. Inspirado em Loldle Emoji:
// o jogador recebe uma combinacao de 3-5 emojis e tem 6 tentativas
// para adivinhar qual auditor do escritorio ela representa.

export type EmojiGuessStatus = 'correct' | 'wrong'

export interface EmojiAuditor {
  id: string
  name: string
  nickname: string
  role: string
  emojis: string[]
  emojiHint: string
}

export interface EmojiGuess {
  auditorId: string
  auditorName: string
  status: EmojiGuessStatus
}

export interface EmojiState {
  targetId: string
  guesses: EmojiGuess[]
  currentGuess: string
  currentRow: number
  maxAttempts: number
  isGameOver: boolean
  isWin: boolean
  dateKey: string
  dayNumber: number
  history: string[]
}

export interface EmojiProcessResult {
  newState: EmojiState
  error?: string
}

export const MAX_EMOJI_ATTEMPTS = 6
