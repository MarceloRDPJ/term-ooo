// src/pages/games/pitaco-emoji/engine.ts
//
// Engine do PITACO Emoji. Pura, sem React, sem DOM.
// - createInitialEmojiState: pega o auditor-alvo do dia
// - processEmojiGuess: valida o chute, atualiza tentativas, detecta vitoria
// - pickEmojiTargetForDay: selecao deterministica por dayNumber

import { EMOJI_AUDITORES, findAuditorById, findAuditorByQuery } from './data'
import {
  type EmojiGuess,
  type EmojiProcessResult,
  type EmojiState,
  MAX_EMOJI_ATTEMPTS,
} from './types'

export function pickEmojiTargetForDay(dayNumber: number) {
  const index = ((dayNumber % EMOJI_AUDITORES.length) + EMOJI_AUDITORES.length) % EMOJI_AUDITORES.length
  return EMOJI_AUDITORES[index]
}

export function createInitialEmojiState(dateKey: string, dayNumber: number): EmojiState {
  const target = pickEmojiTargetForDay(dayNumber)
  return {
    targetId: target.id,
    guesses: [],
    currentGuess: '',
    currentRow: 0,
    maxAttempts: MAX_EMOJI_ATTEMPTS,
    isGameOver: false,
    isWin: false,
    dateKey,
    dayNumber,
    history: [],
  }
}

export function processEmojiGuess(state: EmojiState, rawGuess: string): EmojiProcessResult {
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

  const won = guessed.id === state.targetId
  const guessRecord: EmojiGuess = {
    auditorId: guessed.id,
    auditorName: guessed.name,
    status: won ? 'correct' : 'wrong',
  }

  const newRow = state.currentRow + 1
  const gameOver = won || newRow >= state.maxAttempts

  const newState: EmojiState = {
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

export function isEmojiWon(state: EmojiState): boolean {
  return state.isWin
}

export { findAuditorById, findAuditorByQuery }
