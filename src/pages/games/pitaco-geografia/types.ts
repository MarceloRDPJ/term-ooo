// src/pages/games/pitaco-geografia/types.ts
//
// Tipos do PITACO Geografia. Isolado do types.ts do PITACO principal
// (que e baseado em palavras/letras). Este jogo usa atributos
// geograficos (distancia, direcao, proximidade).

import type { RegionCode } from './states'

export type DirectionCode = 'Norte' | 'Nordeste' | 'Leste' | 'Sudeste' | 'Sul' | 'Sudoeste' | 'Oeste' | 'Noroeste'

export interface GeoGuess {
  uf: string
  name: string
  capital: string
  region: RegionCode
  distance: number
  bearing: number
  direction: DirectionCode
  proximity: number
}

export interface GeoState {
  targetUf: string
  guesses: GeoGuess[]
  currentGuess: string
  currentRow: number
  maxAttempts: number
  isGameOver: boolean
  isWin: boolean
  dateKey: string
  dayNumber: number
  history: string[]
}

export interface GeoFeedback {
  distance: number
  bearing: number
  direction: DirectionCode
  proximity: number
}

export interface GeoProcessResult {
  newState: GeoState
  feedback: GeoFeedback
  error?: string
}

export const MAX_GEO_ATTEMPTS = 6
