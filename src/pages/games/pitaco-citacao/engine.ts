// src/pages/games/pitaco-citacao/engine.ts
//
// Engine do PITACO Citacao. Pura, sem React, sem DOM.
// - createInitialCitacaoState: pega a citacao-alvo do dia
// - processCitacaoGuess: valida o chute (pelo autor), atualiza tentativas
// - pickCitacaoForDay: selecao deterministica por dayNumber

import {
  CITACOES,
  findCitacaoById,
  pickCitacaoForDay,
} from './data'
import { EMOJI_AUDITORES, findAuditorByQuery } from '../pitaco-emoji/data'
import {
  type CitacaoProcessResult,
  type CitacaoState,
  type QuoteGuess,
  MAX_CITACAO_ATTEMPTS,
} from './types'

export function createInitialCitacaoState(dateKey: string, dayNumber: number): CitacaoState {
  const target = pickCitacaoForDay(dayNumber)
  return {
    targetCitacaoId: target.id,
    guesses: [],
    currentGuess: '',
    currentRow: 0,
    maxAttempts: MAX_CITACAO_ATTEMPTS,
    isGameOver: false,
    isWin: false,
    dateKey,
    dayNumber,
    history: [],
  }
}

export function processCitacaoGuess(state: CitacaoState, rawGuess: string): CitacaoProcessResult {
  if (state.isGameOver) {
    return { newState: state, error: 'Jogo encerrado' }
  }

  const trimmed = rawGuess.trim()
  if (!trimmed) {
    return { newState: state, error: 'Digite um auditor' }
  }

  const guessed = findAuditorByQuery(trimmed)
  if (!guessed) {
    return { newState: state, error: 'Auditor nao reconhecido' }
  }

  if (state.history.includes(guessed.id)) {
    return { newState: state, error: 'Voce ja chutou esse auditor' }
  }

  const target = findCitacaoById(state.targetCitacaoId)
  if (!target) {
    return { newState: state, error: 'Citacao invalida' }
  }

  const won = guessed.id === target.authorId
  const guessRecord: QuoteGuess = {
    authorId: guessed.id,
    authorName: guessed.name,
    status: won ? 'correct' : 'wrong',
  }

  const newRow = state.currentRow + 1
  const gameOver = won || newRow >= state.maxAttempts

  const newState: CitacaoState = {
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

export function isCitacaoWon(state: CitacaoState): boolean {
  return state.isWin
}

export { CITACOES, findCitacaoById, pickCitacaoForDay, EMOJI_AUDITORES, findAuditorByQuery }
