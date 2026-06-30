// src/pages/games/pitaco-geografia/engine.ts
//
// Engine do PITACO Geografia. Responsavel por:
//  - calcular distancia (Haversine) entre o chute e o alvo
//  - calcular bearing (0-360, Norte=0)
//  - converter bearing em direcao cardinal (N/NE/L/SE/S/SO/O/NO)
//  - calcular % de proximidade
//  - gerenciar estado do jogo (criar/processar guess/detectar vitoria)

import { findStateByQuery, findStateByUf, BRAZILIAN_STATES } from './states'
import {
  type DirectionCode,
  type GeoFeedback,
  type GeoGuess,
  type GeoProcessResult,
  type GeoState,
  MAX_GEO_ATTEMPTS,
} from './types'

const EARTH_RADIUS_KM = 6371

/**
 * Distancia em km entre 2 pontos (formula de Haversine).
 */
export function distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Bearing (0-360) de (lat1,lon1) para (lat2,lon2). Norte=0, Leste=90, Sul=180, Oeste=270.
 */
export function bearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180)
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLon)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

/**
 * Converte um bearing (0-360) em uma direcao cardinal em portugues.
 */
export function bearingToDirection(bearingValue: number): DirectionCode {
  const b = ((bearingValue % 360) + 360) % 360
  if (b >= 337.5 || b < 22.5) return 'Norte'
  if (b >= 22.5 && b < 67.5) return 'Nordeste'
  if (b >= 67.5 && b < 112.5) return 'Leste'
  if (b >= 112.5 && b < 157.5) return 'Sudeste'
  if (b >= 157.5 && b < 202.5) return 'Sul'
  if (b >= 202.5 && b < 247.5) return 'Sudoeste'
  if (b >= 247.5 && b < 292.5) return 'Oeste'
  return 'Noroeste'
}

/**
 * Calcula % de proximidade (0-100) a partir de distancia em km.
 *
 * Inspirado no Worldle: a escala comprime distancias curtas (para dar feedback
 * util quando estamos perto) e se estica ate ~5000 km (meia circunferencia do
 * Brasil). A formula produz 100 quando a distancia e 0, ~80 em 50 km, ~50 em
 * 500 km, ~10 em 3000 km, e ~0 em distancias muito grandes.
 */
export function calculateProximity(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 100
  if (distanceKm >= 5000) return 0
  const proximity = Math.round(100 * (1 - distanceKm / 5000))
  return Math.max(0, Math.min(100, proximity))
}

/**
 * Cria o estado inicial do jogo. O estado-alvo (target) e selecionado
 * deterministicamente pelo dayNumber para que todos os jogadores do escritorio
 * recebam o mesmo estado no mesmo dia (padrao Worldle).
 */
export function createInitialGeoState(dateKey: string, dayNumber: number): GeoState {
  const target = pickTargetForDay(dayNumber)
  return {
    targetUf: target.uf,
    guesses: [],
    currentGuess: '',
    currentRow: 0,
    maxAttempts: MAX_GEO_ATTEMPTS,
    isGameOver: false,
    isWin: false,
    dateKey,
    dayNumber,
    history: [],
  }
}

/**
 * Escolhe o estado-alvo de forma deterministica pelo dayNumber.
 * Usa o mesmo padrao do PITACO principal: (dayNumber + i) % length.
 */
export function pickTargetForDay(dayNumber: number) {
  const index = ((dayNumber % BRAZILIAN_STATES.length) + BRAZILIAN_STATES.length) % BRAZILIAN_STATES.length
  return BRAZILIAN_STATES[index]
}

/**
 * Verifica se o chute venceu (alvo == chute por UF ou nome normalizado).
 */
export function isGeoWon(state: GeoState, guessUf: string): boolean {
  return state.targetUf.toUpperCase() === guessUf.toUpperCase()
}

/**
 * Processa um chute. Retorna novo estado + feedback (distancia, bearing, direcao, proximidade).
 */
export function processGeoGuess(state: GeoState, rawGuess: string): GeoProcessResult {
  if (state.isGameOver) {
    return {
      newState: state,
      feedback: emptyFeedback(),
      error: 'Jogo encerrado',
    }
  }

  const trimmed = rawGuess.trim()
  if (!trimmed) {
    return {
      newState: state,
      feedback: emptyFeedback(),
      error: 'Digite um estado',
    }
  }

  const guessed = findStateByQuery(trimmed)
  if (!guessed) {
    return {
      newState: state,
      feedback: emptyFeedback(),
      error: 'Estado nao reconhecido',
    }
  }

  if (state.history.includes(guessed.uf)) {
    return {
      newState: state,
      feedback: emptyFeedback(),
      error: 'Voce ja chutou esse estado',
    }
  }

  const target = findStateByUf(state.targetUf)
  if (!target) {
    return {
      newState: state,
      feedback: emptyFeedback(),
      error: 'Alvo invalido',
    }
  }

  const km = distance(guessed.lat, guessed.lng, target.lat, target.lng)
  const bear = bearing(guessed.lat, guessed.lng, target.lat, target.lng)
  const dir = bearingToDirection(bear)
  const prox = calculateProximity(km)

  const guessRecord: GeoGuess = {
    uf: guessed.uf,
    name: guessed.name,
    capital: guessed.capital,
    region: guessed.region,
    distance: Math.round(km),
    bearing: Math.round(bear),
    direction: dir,
    proximity: prox,
  }

  const won = isGeoWon(state, guessed.uf)
  const newRow = state.currentRow + 1
  const gameOver = won || newRow >= state.maxAttempts

  const newState: GeoState = {
    ...state,
    guesses: [...state.guesses, guessRecord],
    currentGuess: '',
    currentRow: newRow,
    isGameOver: gameOver,
    isWin: won,
    history: [...state.history, guessed.uf],
  }

  return {
    newState,
    feedback: {
      distance: guessRecord.distance,
      bearing: guessRecord.bearing,
      direction: dir,
      proximity: prox,
    },
  }
}

function emptyFeedback(): GeoFeedback {
  return { distance: 0, bearing: 0, direction: 'Norte', proximity: 0 }
}

/**
 * Cor do feedback baseada na distancia em km.
 * Ciano = perto (ate 500 km), Amarelo = medio (500-1500), Vermelho Alerta RH = longe (acima).
 */
export function proximityBand(distanceKm: number): 'perto' | 'medio' | 'longe' {
  if (distanceKm <= 500) return 'perto'
  if (distanceKm <= 1500) return 'medio'
  return 'longe'
}
