// src/pages/games/pokedle/engine.ts

import { normalizeString } from '@/lib/utils'
import { findPokemonById, POKEMON } from './pokemon'
import {
  MAX_POKEDLE_ATTEMPTS,
  POKEDLE_ATTRIBUTES,
  type PokedleAttributeKey,
  type PokedleFeedback,
  type PokedleFeedbackStatus,
  type PokedlePokemon,
  type PokedleProcessResult,
  type PokedleState,
} from './types'

export function createInitialPokedleState(dateKey: string, dayNumber: number): PokedleState {
  const target = pickPokemonForDay(dayNumber)
  return {
    targetId: target.id,
    guesses: [],
    currentRow: 0,
    maxAttempts: MAX_POKEDLE_ATTEMPTS,
    isGameOver: false,
    isWin: false,
    dateKey,
    dayNumber,
    history: [],
  }
}

export function pickPokemonForDay(dayNumber: number): PokedlePokemon {
  const index = (((dayNumber * 29) % POKEMON.length) + POKEMON.length) % POKEMON.length
  return POKEMON[index]
}

export function findPokemonByQuery(query: string): PokedlePokemon | undefined {
  const normalized = normalizeString(query)
  if (!normalized) return undefined
  return (
    POKEMON.find((pokemon) => String(pokemon.id) === normalized) ??
    POKEMON.find((pokemon) => normalizeString(pokemon.slug) === normalized) ??
    POKEMON.find((pokemon) => normalizeString(pokemon.name) === normalized) ??
    POKEMON.find((pokemon) => normalizeString(pokemon.name).includes(normalized))
  )
}

export function searchPokemon(query: string, limit = 10): PokedlePokemon[] {
  const normalized = normalizeString(query)
  if (!normalized) return []
  const exact: PokedlePokemon[] = []
  const prefix: PokedlePokemon[] = []
  const contains: PokedlePokemon[] = []

  for (const pokemon of POKEMON) {
    const name = normalizeString(pokemon.name)
    const slug = normalizeString(pokemon.slug)
    if (name === normalized || slug === normalized || String(pokemon.id) === normalized) exact.push(pokemon)
    else if (name.startsWith(normalized) || slug.startsWith(normalized)) prefix.push(pokemon)
    else if (name.includes(normalized) || slug.includes(normalized)) contains.push(pokemon)
  }

  return [...exact, ...prefix, ...contains].slice(0, limit)
}

export function processPokedleGuess(state: PokedleState, rawGuess: string): PokedleProcessResult {
  if (state.isGameOver) return { newState: state, error: 'Game over' }

  const guessed = findPokemonByQuery(rawGuess.trim())
  if (!guessed) return { newState: state, error: 'No Pokemon found.' }
  if (state.history.includes(guessed.id)) return { newState: state, error: 'You already tried this Pokemon.' }

  const target = findPokemonById(state.targetId)
  if (!target) return { newState: state, error: 'Invalid target.' }

  const won = guessed.id === target.id
  const currentRow = state.currentRow + 1
  return {
    newState: {
      ...state,
      guesses: [
        ...state.guesses,
        {
          pokemonId: guessed.id,
          pokemonName: guessed.name,
          feedback: computeFeedback(guessed, target),
        },
      ],
      currentRow,
      isGameOver: won || currentRow >= state.maxAttempts,
      isWin: won,
      history: [...state.history, guessed.id],
    },
  }
}

export function computeFeedback(guessed: PokedlePokemon, target: PokedlePokemon): PokedleFeedback {
  return POKEDLE_ATTRIBUTES.reduce((acc, attr) => {
    acc[attr] = attributeStatus(attr, guessed, target)
    return acc
  }, {} as PokedleFeedback)
}

export function formatAttributeValue(pokemon: PokedlePokemon, attr: PokedleAttributeKey): string {
  const value = pokemon[attr]
  if (attr === 'generation') return `Gen ${value}`
  return Array.isArray(value) ? value.join(' / ') : String(value)
}

function attributeStatus(attr: PokedleAttributeKey, guessed: PokedlePokemon, target: PokedlePokemon): PokedleFeedbackStatus {
  if (attr === 'types') return listStatus(guessed.types, target.types)
  if (attr === 'generation') {
    if (guessed.generation === target.generation) return 'correct'
    return Math.abs(guessed.generation - target.generation) <= 1 ? 'near' : 'wrong'
  }
  return guessed[attr] === target[attr] ? 'correct' : 'wrong'
}

function listStatus(guessed: string[], target: string[]): PokedleFeedbackStatus {
  if (guessed.length === target.length && guessed.every((item) => target.includes(item))) return 'correct'
  return guessed.some((item) => target.includes(item)) ? 'near' : 'wrong'
}
