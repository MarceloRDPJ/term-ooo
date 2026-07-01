// src/pages/games/narutodle/engine.ts
//
// Engine pura do Narutodle. Responsavel por:
//  - selecionar o personagem-alvo do dia de forma deterministica
//  - processar um chute (buscar personagem, calcular feedback, detectar vitoria)
//  - calcular feedback por atributo (correct/near/wrong)
//
// Feedback por atributo:
//  - clan, vila, kekkeiGenkai, elemento, afiliacao, genero: 'correct' ou 'wrong'
//  - rank: 'correct' se igual, 'near' se a diferenca for exatamente 1 nivel,
//    'wrong' caso contrario (baseado em RANK_ORDER).
//
// O alvo do dia e derivado do dayNumber: `dayNumber % characters.length`.
// Para uma experiencia tipo Worldle, todos os jogadores do escritorio
// recebem o mesmo personagem no mesmo dia.

import { normalizeString } from '@/lib/utils'
import {
  MAX_NARUTODLE_ATTEMPTS,
  RANK_ORDER,
  type NarutodleCharacter,
  type NarutodleFeedback,
  type NarutodleFeedbackStatus,
  type NarutodleGuess,
  type NarutodleProcessResult,
  type NarutodleRank,
  type NarutodleState,
} from './types'

/**
 * Cria o estado inicial do dia. Seleciona o alvo determinsticamente
 * pelo dayNumber.
 */
export function createInitialNarutodleState(
  dateKey: string,
  dayNumber: number,
  characters: NarutodleCharacter[],
  mode: 'classic' | 'silhouette' = 'classic'
): NarutodleState {
  if (characters.length === 0) {
    throw new Error('createInitialNarutodleState: lista de personagens vazia')
  }
  const target = pickTargetForDay(dayNumber, characters)
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

/**
 * Escolhe o personagem-alvo do dia pelo dayNumber.
 * `((n % len) + len) % len` garante comportamento positivo mesmo
 * se dayNumber for negativo (defensivo).
 */
export function pickTargetForDay(
  dayNumber: number,
  characters: NarutodleCharacter[]
): NarutodleCharacter {
  if (characters.length === 0) {
    throw new Error('pickTargetForDay: lista de personagens vazia')
  }
  const index = ((dayNumber % characters.length) + characters.length) % characters.length
  return characters[index]
}

/**
 * Verifica se um chute representa vitoria (id igual ao target).
 */
export function isNarutodleWon(
  state: NarutodleState,
  guess: NarutodleCharacter
): boolean {
  return state.targetId === guess.id
}

/**
 * Busca um personagem por id.
 */
export function findCharacterById(
  id: string,
  characters: NarutodleCharacter[]
): NarutodleCharacter | undefined {
  return characters.find((c) => c.id === id)
}

/**
 * Busca personagem por texto livre. Aceita:
 *  - id exato (case-insensitive)
 *  - nome exato normalizado (sem acento, lowercase)
 *  - nome contendo o termo (substring)
 *
 * Inspirado em findStateByQuery de pitaco-geografia/states.ts.
 */
export function findCharacterByQuery(
  query: string,
  characters: NarutodleCharacter[]
): NarutodleCharacter | undefined {
  const normalized = normalizeString(query)
  if (!normalized) return undefined

  // 1) match exato por id
  const byId = characters.find((c) => c.id.toLowerCase() === normalized)
  if (byId) return byId

  // 2) match exato por nome normalizado
  const byName = characters.find((c) => normalizeString(c.name) === normalized)
  if (byName) return byName

  // 3) match por substring no nome (autocomplete)
  return characters.find((c) => normalizeString(c.name).includes(normalized))
}

/**
 * Processa um chute. Retorna novo estado + (opcionalmente) erro.
 *
 * Erros:
 *  - 'Jogo encerrado'   se isGameOver
 *  - 'Selecione um personagem' se chute vazio
 *  - 'Personagem nao reconhecido' se nao encontrar
 *  - 'Voce ja chutou esse personagem' se duplicado
 *  - 'Alvo invalido' se state.targetId nao bate com nenhum personagem
 */
export function processNarutodleGuess(
  state: NarutodleState,
  rawGuess: string,
  characters: NarutodleCharacter[]
): NarutodleProcessResult {
  if (state.isGameOver) {
    return { newState: state, error: 'Jogo encerrado' }
  }

  const trimmed = rawGuess.trim()
  if (!trimmed) {
    return { newState: state, error: 'Selecione um personagem' }
  }

  const guessed = findCharacterByQuery(trimmed, characters)
  if (!guessed) {
    return { newState: state, error: 'Personagem nao reconhecido' }
  }

  if (state.history.includes(guessed.id)) {
    return { newState: state, error: 'Voce ja chutou esse personagem' }
  }

  const target = findCharacterById(state.targetId, characters)
  if (!target) {
    return { newState: state, error: 'Alvo invalido' }
  }

  const feedback = computeFeedback(guessed, target)
  const guessRecord: NarutodleGuess = {
    characterId: guessed.id,
    characterName: guessed.name,
    feedback,
  }

  const won = isNarutodleWon(state, guessed)
  const newRow = state.currentRow + 1
  const gameOver = won || newRow >= state.maxAttempts

  const newState: NarutodleState = {
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
 * Calcula o feedback por atributo comparando chute vs alvo.
 * Para o rank, usa a ordem canonica (RANK_ORDER): diferenca de 1 = 'near'.
 */
export function computeFeedback(
  guessed: NarutodleCharacter,
  target: NarutodleCharacter
): NarutodleFeedback {
  return {
    clan: guessed.clan === target.clan ? 'correct' : 'wrong',
    vila: guessed.vila === target.vila ? 'correct' : 'wrong',
    rank: rankStatus(guessed.rank, target.rank),
    kekkeiGenkai: guessed.kekkeiGenkai === target.kekkeiGenkai ? 'correct' : 'wrong',
    elemento: guessed.elemento === target.elemento ? 'correct' : 'wrong',
    afiliacao: guessed.afiliacao === target.afiliacao ? 'correct' : 'wrong',
    genero: guessed.genero === target.genero ? 'correct' : 'wrong',
  }
}

function rankStatus(
  guessed: NarutodleRank,
  target: NarutodleRank
): NarutodleFeedbackStatus {
  if (guessed === target) return 'correct'
  const diff = Math.abs(RANK_ORDER[guessed] - RANK_ORDER[target])
  return diff === 1 ? 'near' : 'wrong'
}
