// src/pages/games/loldle/engine.ts
//
// Engine do Loldle. Responsavel por:
//  - selecionar o campeao-alvo do dia (deterministico por dateKey)
//  - comparar um chute contra o alvo atributo a atributo
//  - gerar o feedback colorido (correct/near/wrong) por atributo
//  - gerenciar o estado do jogo (criar / processar guess / detectar vitoria)
//
// Inspirado no Classic mode do loldle.net. Atributos:
//   - region, classe, recurso, alcance, genero: 5 atributos categoricos
//     (verdes se exato, cinzas senao — sem amarelo, igual ao loldle.net).
//   - ano: 1 atributo numerico
//     - verde se exato
//     - amarelo se |delta| <= LOLDLE_YEAR_NEAR_BAND (default = 2 anos)
//     - vermelho senao
//
// Os IDs (strings) sao embaralhados de forma deterministica por dateKey usando
// um hash numerico simples (FNV-1a 32-bit). Isso garante que:
//  - todos os jogadores do mesmo dia recebem o mesmo alvo
//  - cada dia tem um alvo diferente (boa probabilidade, mesmo com 40 campeoes)

import { CHAMPIONS, findChampionById, searchChampions } from './champions'
import type {
  LoldleChampion,
  LoldleFeedback,
  LoldleGuess,
  LoldleProcessResult,
  LoldleState,
  LoldleFeedbackStatus,
} from './types'
import {
  LOLDLE_MAX_ATTEMPTS,
  LOLDLE_YEAR_NEAR_BAND,
} from './types'

/**
 * FNV-1a 32-bit hash. Determinisco, sem dependencias.
 * Usado para mapear dateKey -> indice do campeao-alvo do dia.
 */
function fnv1a(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return h >>> 0
}

/**
 * Escolhe o campeao-alvo do dia, deterministicamente por dateKey.
 * Padrao: hash(dateKey) % CHAMPIONS.length
 */
export function pickChampionForDate(dateKey: string): LoldleChampion {
  const idx = fnv1a(dateKey) % CHAMPIONS.length
  return CHAMPIONS[idx]
}

/**
 * Resolve uma string de chute (nome, id, ou slug) para um campeao.
 * Retorna undefined se nao encontrado.
 */
export function resolveChampionGuess(rawGuess: string): LoldleChampion | undefined {
  const q = rawGuess.trim()
  if (!q) return undefined

  const direct = findChampionById(q.toLowerCase().replace(/\s+/g, '_'))
  if (direct) return direct

  const normalized = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

  const nq = normalized(q)
  // Match exato no nome ou id (com normalizacao).
  for (const c of CHAMPIONS) {
    if (normalized(c.name) === nq) return c
    if (normalized(c.id.replace(/_/g, ' ')) === nq) return c
  }
  // Ultimo recurso: pega o primeiro match do searchChampions.
  const matches = searchChampions(q, 1)
  return matches[0]
}

/**
 * Compara dois campeoes e devolve o feedback por atributo.
 * Para os 5 atributos categoricos: 'correct' | 'wrong'.
 * Para ano: 'correct' | 'near' (|delta| <= band) | 'wrong'.
 */
export function computeFeedback(
  guess: LoldleChampion,
  target: LoldleChampion
): LoldleFeedback {
  const eq = <T>(a: T, b: T): LoldleFeedbackStatus => (a === b ? 'correct' : 'wrong')

  const yearDelta = Math.abs(guess.ano - target.ano)
  let anoStatus: LoldleFeedbackStatus
  if (yearDelta === 0) {
    anoStatus = 'correct'
  } else if (yearDelta <= LOLDLE_YEAR_NEAR_BAND) {
    anoStatus = 'near'
  } else {
    anoStatus = 'wrong'
  }

  return {
    region: eq(guess.region, target.region),
    classe: eq(guess.classe, target.classe),
    recurso: eq(guess.recurso, target.recurso),
    alcance: eq(guess.alcance, target.alcance),
    genero: eq(guess.genero, target.genero),
    ano: anoStatus,
  }
}

/**
 * Cria o estado inicial do jogo para um dado dia.
 */
export function createInitialLoldleState(
  dateKey: string,
  mode: 'classic' | 'quote' = 'classic'
): LoldleState {
  const target = pickChampionForDate(dateKey)
  return {
    targetId: target.id,
    guesses: [],
    currentGuess: '',
    currentRow: 0,
    maxAttempts: LOLDLE_MAX_ATTEMPTS,
    isGameOver: false,
    isWin: false,
    dateKey,
    history: [],
    mode,
  }
}

/**
 * Verifica se o chute venceu (todos os 6 atributos sao 'correct').
 */
export function isLoldleWon(feedback: LoldleFeedback): boolean {
  return (
    feedback.region === 'correct' &&
    feedback.classe === 'correct' &&
    feedback.recurso === 'correct' &&
    feedback.alcance === 'correct' &&
    feedback.genero === 'correct' &&
    feedback.ano === 'correct'
  )
}

/**
 * Processa um chute. Valida, calcula feedback, atualiza o estado.
 * Retorna { newState, error? }. Em caso de error, newState === state (sem mutacao).
 *
 * Modo quote: o feedback e apenas correct/wrong por id (sem atributos).
 */
export function processLoldleGuess(
  state: LoldleState,
  rawGuess: string
): LoldleProcessResult {
  if (state.isGameOver) {
    return { newState: state, error: 'Jogo encerrado' }
  }

  const trimmed = rawGuess.trim()
  if (!trimmed) {
    return { newState: state, error: 'Digite o nome de um campeao' }
  }

  const guessed = resolveChampionGuess(trimmed)
  if (!guessed) {
    return { newState: state, error: 'Campeao nao reconhecido' }
  }

  if (state.history.includes(guessed.id)) {
    return { newState: state, error: 'Voce ja chutou esse campeao' }
  }

  const target = findChampionById(state.targetId)
  if (!target) {
    return { newState: state, error: 'Alvo invalido' }
  }

  const isQuoteMode = state.mode === 'quote'
  const feedback: LoldleFeedback = isQuoteMode
    ? {
        region: guessed.id === target.id ? 'correct' : 'wrong',
        classe: guessed.id === target.id ? 'correct' : 'wrong',
        recurso: guessed.id === target.id ? 'correct' : 'wrong',
        alcance: guessed.id === target.id ? 'correct' : 'wrong',
        genero: guessed.id === target.id ? 'correct' : 'wrong',
        ano: guessed.id === target.id ? 'correct' : 'wrong',
      }
    : computeFeedback(guessed, target)
  const yearDelta = Math.abs(guessed.ano - target.ano)

  const guessRecord: LoldleGuess = {
    championId: guessed.id,
    feedback,
    yearDelta,
  }

  const won = isQuoteMode
    ? guessed.id === target.id
    : isLoldleWon(feedback)
  const newRow = state.currentRow + 1
  const gameOver = won || newRow >= state.maxAttempts

  const newState: LoldleState = {
    ...state,
    guesses: [...state.guesses, guessRecord],
    currentGuess: '',
    currentRow: newRow,
    isGameOver: gameOver,
    isWin: won,
    history: [...state.history, guessed.id],
  }

  return { newState }
}

/**
 * Hint do ano: seta para cima (chute < alvo) ou para baixo (chute > alvo).
 * Retorna null se ano esta correto.
 */
export function yearArrow(guess: number, target: number): 'up' | 'down' | null {
  if (guess === target) return null
  return guess < target ? 'up' : 'down'
}
