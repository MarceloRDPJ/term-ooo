// src/pages/games/pitaco-nerdle/engine.ts
//
// Logica pura do PITACO Nerdle. Sem React, sem DOM.
// - createInitialNerdleState: estado inicial a partir de uma dataKey + pool
// - processNerdleGuess: valida e avalia um palpite
// - isNerdleWon: checa vitoria
// - isValidEquation: checa formato + aritmetica correta
// - isValidChars: checa que todos os caracteres estao no alfabeto

import {
  NerdleState,
  NerdleGuess,
  NerdleTile,
  NerdleKeyState,
  NERDLE_LENGTH,
  NERDLE_MAX_ATTEMPTS,
} from './types'

const NERDLE_START_YEAR = 2022
const NERDLE_START_MONTH = 0
const NERDLE_START_DAY = 1

const NERDLE_ALPHABET_SET = new Set([
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '+', '-', '*', '/', '=',
])

function dateKeyToDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getNerdleDayNumber(dateKey: string): number {
  const today = dateKeyToDate(dateKey)
  const start = new Date(NERDLE_START_YEAR, NERDLE_START_MONTH, NERDLE_START_DAY)
  const diff = today.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
}

export function pickNerdleSolution(dateKey: string, equations: readonly string[]): string {
  if (equations.length === 0) {
    throw new Error('pitaco-nerdle: equations pool is empty')
  }
  const dayNumber = getNerdleDayNumber(dateKey)
  return equations[dayNumber % equations.length]
}

export function createInitialNerdleState(
  dateKey: string,
  equations: readonly string[]
): NerdleState {
  return {
    solution: pickNerdleSolution(dateKey, equations),
    guesses: [],
    currentGuess: Array(NERDLE_LENGTH).fill(''),
    currentRow: 0,
    maxAttempts: NERDLE_MAX_ATTEMPTS,
    isGameOver: false,
    isWin: false,
    keyStates: {},
    dateKey,
  }
}

export function isValidChars(guess: string): boolean {
  if (guess.length !== NERDLE_LENGTH) return false
  for (const c of guess) {
    if (!NERDLE_ALPHABET_SET.has(c)) return false
  }
  return true
}

export function isValidEquation(guess: string): boolean {
  if (guess.length !== NERDLE_LENGTH) return false
  if (guess[5] !== '=') return false

  const left = guess.substring(0, 5)
  const right = guess.substring(6)

  if (!/^\d{2}$/.test(right)) return false

  const match = left.match(/^(\d{2})([+\-*/])(\d{2})$/)
  if (!match) return false

  const a = parseInt(match[1], 10)
  const op = match[2]
  const b = parseInt(match[3], 10)
  const result = parseInt(right, 10)

  let computed: number
  switch (op) {
    case '+':
      computed = a + b
      break
    case '-':
      computed = a - b
      break
    case '*':
      computed = a * b
      break
    case '/':
      if (b === 0) return false
      if (a % b !== 0) return false
      computed = a / b
      break
    default:
      return false
  }

  return computed === result
}

export function evaluateNerdleGuess(guess: string, solution: string): NerdleTile[] {
  const tiles: NerdleTile[] = Array.from({ length: NERDLE_LENGTH }, () => ({
    char: '',
    state: 'absent' as const,
  }))

  const solutionChars = solution.split('')
  const available: Record<string, number> = {}
  for (const c of solutionChars) {
    available[c] = (available[c] || 0) + 1
  }

  // Primeira passada: marca corretos (mesma posicao)
  for (let i = 0; i < NERDLE_LENGTH; i++) {
    tiles[i].char = guess[i] ?? ''
    if (guess[i] === solutionChars[i]) {
      tiles[i].state = 'correct'
      available[guess[i]] = (available[guess[i]] || 0) - 1
    }
  }

  // Segunda passada: marca presentes (existe mas em outra posicao) ou ausentes
  for (let i = 0; i < NERDLE_LENGTH; i++) {
    if (tiles[i].state === 'correct') continue
    const c = guess[i]
    const remaining = available[c] || 0
    if (remaining > 0) {
      tiles[i].state = 'present'
      available[c] = remaining - 1
    } else {
      tiles[i].state = 'absent'
    }
  }

  return tiles
}

export function updateNerdleKeyStates(
  guesses: NerdleGuess[]
): Record<string, NerdleKeyState> {
  const keyStates: Record<string, NerdleKeyState> = {}

  for (const guess of guesses) {
    for (const tile of guess.tiles) {
      const c = tile.char
      const current = keyStates[c]
      if (tile.state === 'correct') {
        keyStates[c] = 'correct'
      } else if (tile.state === 'present') {
        if (current !== 'correct') {
          keyStates[c] = 'present'
        }
      } else if (tile.state === 'absent') {
        if (current === undefined) {
          keyStates[c] = 'absent'
        }
      }
    }
  }

  return keyStates
}

export function processNerdleGuess(
  state: NerdleState,
  guess: string
): { newState: NerdleState; error?: string } {
  if (state.isGameOver) {
    return { newState: state, error: 'Jogo encerrado' }
  }

  if (guess.length !== NERDLE_LENGTH) {
    return { newState: state, error: 'Equacao incompleta' }
  }

  if (!isValidChars(guess)) {
    return { newState: state, error: 'Caracteres invalidos' }
  }

  if (!isValidEquation(guess)) {
    return { newState: state, error: 'Equacao nao fecha' }
  }

  const tiles = evaluateNerdleGuess(guess, state.solution)
  const nerdleGuess: NerdleGuess = { guess, tiles }

  const isCorrect = tiles.every(t => t.state === 'correct')
  const newGuesses = [...state.guesses, nerdleGuess]
  const newRow = state.currentRow + 1
  const isWin = isCorrect
  const isGameOver = isWin || newRow >= state.maxAttempts

  const newState: NerdleState = {
    ...state,
    guesses: newGuesses,
    currentGuess: Array(NERDLE_LENGTH).fill(''),
    currentRow: newRow,
    isGameOver,
    isWin,
    keyStates: updateNerdleKeyStates(newGuesses),
  }

  return { newState }
}

export function isNerdleWon(state: NerdleState): boolean {
  return state.isWin
}
