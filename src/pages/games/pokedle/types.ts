// src/pages/games/pokedle/types.ts

export type PokedleFeedbackStatus = 'correct' | 'near' | 'wrong'

export type PokedleAttributeKey =
  | 'types'
  | 'generation'
  | 'color'
  | 'habitat'
  | 'shape'
  | 'evolutionStage'

export interface PokedlePokemon {
  id: number
  slug: string
  name: string
  types: string[]
  generation: number
  color: string
  habitat: string
  shape: string
  evolutionStage: 'Baby' | 'Base' | 'Middle' | 'Final' | 'Single'
}

export type PokedleFeedback = Record<PokedleAttributeKey, PokedleFeedbackStatus>

export interface PokedleGuess {
  pokemonId: number
  pokemonName: string
  feedback: PokedleFeedback
}

export interface PokedleState {
  targetId: number
  guesses: PokedleGuess[]
  currentRow: number
  maxAttempts: number
  isGameOver: boolean
  isWin: boolean
  dateKey: string
  dayNumber: number
  history: number[]
}

export interface PokedleProcessResult {
  newState: PokedleState
  error?: string
}

export const MAX_POKEDLE_ATTEMPTS = 8

export const POKEDLE_ATTRIBUTES: PokedleAttributeKey[] = [
  'types',
  'generation',
  'color',
  'habitat',
  'shape',
  'evolutionStage',
]

export const ATTRIBUTE_LABELS: Record<PokedleAttributeKey, string> = {
  types: 'Types',
  generation: 'Gen',
  color: 'Color',
  habitat: 'Habitat',
  shape: 'Shape',
  evolutionStage: 'Evolution',
}
