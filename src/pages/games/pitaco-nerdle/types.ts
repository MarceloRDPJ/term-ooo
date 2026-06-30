// src/pages/games/pitaco-nerdle/types.ts

export const NERDLE_LENGTH = 8
export const NERDLE_MAX_ATTEMPTS = 6

export const NERDLE_ALPHABET = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '+', '-', '*', '/', '=',
] as const

export type NerdleChar = (typeof NERDLE_ALPHABET)[number]

export type NerdleTileState = 'empty' | 'filled' | 'correct' | 'present' | 'absent'

export type NerdleKeyState = 'unused' | 'correct' | 'present' | 'absent'

export interface NerdleTile {
  char: string
  state: NerdleTileState
}

export interface NerdleGuess {
  guess: string
  tiles: NerdleTile[]
}

export interface NerdleState {
  solution: string
  guesses: NerdleGuess[]
  currentGuess: string[]
  currentRow: number
  maxAttempts: number
  isGameOver: boolean
  isWin: boolean
  keyStates: Record<string, NerdleKeyState>
  dateKey: string
}
