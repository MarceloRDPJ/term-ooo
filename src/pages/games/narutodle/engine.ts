// src/pages/games/narutodle/engine.ts

import { normalizeString } from '@/lib/utils'
import {
  DEBUT_ARCS,
  MAX_NARUTODLE_ATTEMPTS,
  NARUTODLE_ATTRIBUTES,
  type NarutodleAttributeKey,
  type NarutodleCharacter,
  type NarutodleFeedback,
  type NarutodleFeedbackStatus,
  type NarutodleMode,
  type NarutodleProcessResult,
  type NarutodleState,
} from './types'

export function createInitialNarutodleState(
  dateKey: string,
  dayNumber: number,
  characters: NarutodleCharacter[],
  mode: NarutodleMode = 'classic'
): NarutodleState {
  if (characters.length === 0) {
    throw new Error('createInitialNarutodleState: lista de personagens vazia')
  }
  const target = pickTargetForDay(dayNumber, characters, mode)
  return {
    targetId: target.id,
    guesses: [],
    currentGuess: '',
    currentRow: 0,
    maxAttempts: MAX_NARUTODLE_ATTEMPTS,
    isGameOver: false,
    isWin: false,
    dateKey,
    dayNumber,
    history: [],
    mode,
  }
}

export function pickTargetForDay(
  dayNumber: number,
  characters: NarutodleCharacter[],
  mode: NarutodleMode = 'classic'
): NarutodleCharacter {
  if (characters.length === 0) {
    throw new Error('pickTargetForDay: lista de personagens vazia')
  }
  const modeOffset = { classic: 0, jutsu: 11, quote: 23, eye: 37 }[mode]
  const index = (((dayNumber * 17 + modeOffset) % characters.length) + characters.length) % characters.length
  return characters[index]
}

export function findCharacterById(id: string, characters: NarutodleCharacter[]): NarutodleCharacter | undefined {
  return characters.find((c) => c.id === id)
}

export function findCharacterByQuery(query: string, characters: NarutodleCharacter[]): NarutodleCharacter | undefined {
  const normalized = normalizeString(query)
  if (!normalized) return undefined
  return (
    characters.find((c) => c.id.toLowerCase() === normalized) ??
    characters.find((c) => normalizeString(c.name) === normalized) ??
    characters.find((c) => normalizeString(c.name).includes(normalized))
  )
}

export function processNarutodleGuess(
  state: NarutodleState,
  rawGuess: string,
  characters: NarutodleCharacter[]
): NarutodleProcessResult {
  if (state.isGameOver) return { newState: state, error: 'Jogo encerrado' }

  const guessed = findCharacterByQuery(rawGuess.trim(), characters)
  if (!guessed) return { newState: state, error: 'No character found.' }
  if (state.history.includes(guessed.id)) return { newState: state, error: 'Voce ja tentou esse personagem.' }

  const target = findCharacterById(state.targetId, characters)
  if (!target) return { newState: state, error: 'Alvo invalido' }

  const won = guessed.id === target.id
  const newRow = state.currentRow + 1
  const isGameOver = won || newRow >= state.maxAttempts

  return {
    newState: {
      ...state,
      guesses: [
        ...state.guesses,
        {
          characterId: guessed.id,
          characterName: guessed.name,
          feedback: computeFeedback(guessed, target),
        },
      ],
      currentGuess: '',
      currentRow: newRow,
      isGameOver,
      isWin: won,
      history: [...state.history, guessed.id],
    },
  }
}

export function computeFeedback(guessed: NarutodleCharacter, target: NarutodleCharacter): NarutodleFeedback {
  return NARUTODLE_ATTRIBUTES.reduce((acc, attr) => {
    acc[attr] = attributeStatus(attr, guessed, target)
    return acc
  }, {} as NarutodleFeedback)
}

export function formatAttributeValue(character: NarutodleCharacter, attr: NarutodleAttributeKey): string {
  const value = character[attr]
  return Array.isArray(value) ? value.join(', ') : String(value)
}

export function clueForMode(character: NarutodleCharacter, mode: NarutodleMode, dateKey: string): string {
  if (mode === 'jutsu') return pickDated(character.jutsuClues, dateKey, character.id)
  if (mode === 'quote') return pickDated(character.quoteClues, dateKey, character.id)
  if (mode === 'eye') return character.eyeHint
  return "Guess today's character from Naruto!"
}

function attributeStatus(
  attr: NarutodleAttributeKey,
  guessed: NarutodleCharacter,
  target: NarutodleCharacter
): NarutodleFeedbackStatus {
  if (attr === 'debut') return debutStatus(guessed.debut, target.debut)
  const guessedValue = guessed[attr]
  const targetValue = target[attr]
  if (Array.isArray(guessedValue) && Array.isArray(targetValue)) return listStatus(guessedValue, targetValue)
  return guessedValue === targetValue ? 'correct' : 'wrong'
}

function listStatus(guessed: string[], target: string[]): NarutodleFeedbackStatus {
  const cleanGuess = guessed.filter((v) => v !== 'None')
  const cleanTarget = target.filter((v) => v !== 'None')
  if (sameSet(cleanGuess, cleanTarget)) return 'correct'
  if (cleanGuess.some((v) => cleanTarget.includes(v))) return 'near'
  if (cleanGuess.length === 0 && cleanTarget.length === 0) return 'correct'
  return 'wrong'
}

function debutStatus(guessed: string, target: string): NarutodleFeedbackStatus {
  if (guessed === target) return 'correct'
  const guessedIndex = DEBUT_ARCS.indexOf(guessed)
  const targetIndex = DEBUT_ARCS.indexOf(target)
  if (guessedIndex >= 0 && targetIndex >= 0 && Math.abs(guessedIndex - targetIndex) <= 1) return 'near'
  return 'wrong'
}

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((item) => b.includes(item))
}

function pickDated(values: string[], dateKey: string, seed: string): string {
  if (values.length === 0) return 'No clue available.'
  let hash = 0
  for (const char of `${dateKey}:${seed}`) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return values[hash % values.length]
}
