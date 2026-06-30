// src/pages/games/pitaco-cruzado/engine.ts
//
// Logica pura (sem React) do PITACO Cruzado - 4 grids 5x9 jogados em
// paralelo, inspirado em Quordle. Reaproveitamos evaluateGuess, isValidWord
// e updateKeyStates do engine generico; o Cruzado so precisa coordenar 4
// boards a partir de um unico palpite por turno.
//
// Determinismo: as 4 palavras do dia vem de um offset no array de solucoes
// do modo quarteto (dayNumber + OFFSET, dayNumber + 1 + OFFSET, ...). O
// offset garante que Cruzado e Quarteto nao compartilhem a mesma palavra
// no mesmo dia (cada um tem sua "pauta").

import type { Board, Guess } from '@/game/types'
import { evaluateGuess, isValidWord, updateKeyStates } from '@/game/engine'
import { quartetoSolutions } from '@/game/words-quarteto'
import { normalizeString } from '@/lib/utils'
import type { CrosswordState } from './types'

export const CROSSWORD_NUM_BOARDS = 4
export const CROSSWORD_MAX_ATTEMPTS = 9
export const CROSSWORD_STORAGE_PREFIX = 'pitaco:crossword'

// Offset grande o suficiente para que o primeiro bloco de 4 palavras do
// Cruzado nunca coincida com o primeiro bloco do Quarteto. Pode ser
// ajustado sem quebrar save (apenas muda o "dia 0" do produto).
const CROSSWORD_SOLUTION_OFFSET = 137

/**
 * Escolhe 4 palavras secretas do dia de forma deterministica.
 * Usa o mesmo vocabulario 5-letras do Quarteto mas com offset proprio
 * para nao coincidir com o Quarteto.
 */
export function getCrosswordWords(dayNumber: number): string[] {
  const words: string[] = []
  for (let i = 0; i < CROSSWORD_NUM_BOARDS; i++) {
    const index = (dayNumber + i + CROSSWORD_SOLUTION_OFFSET) % quartetoSolutions.length
    words.push(normalizeString(quartetoSolutions[index]))
  }
  return words
}

/**
 * Estado inicial de um dia: 4 boards vazios, currentGuess limpo,
 * 9 tentativas maximas. Idempotente: mesma dateKey + words -> mesmo estado.
 */
export function createInitialCrosswordState(
  dateKey: string,
  dayNumber: number,
  words: string[]
): CrosswordState {
  if (words.length !== CROSSWORD_NUM_BOARDS) {
    throw new Error(
      `createInitialCrosswordState: esperado ${CROSSWORD_NUM_BOARDS} palavras, recebi ${words.length}`
    )
  }

  const boards: Board[] = words.map(solution => ({
    guesses: [],
    solution,
    isComplete: false,
  }))

  return {
    boards,
    currentGuess: ['', '', '', '', ''],
    currentRow: 0,
    maxAttempts: CROSSWORD_MAX_ATTEMPTS,
    isGameOver: false,
    isWin: false,
    keyStates: {},
    dateKey,
    dayNumber,
  }
}

/**
 * Processa um palpite aplicado a TODOS os 4 boards simultaneamente.
 * Reusa evaluateGuess do engine generico (mesma logica de correct/
 * present/absent do Term.ooo original). Reusa updateKeyStates para o
 * teclado compartilhado com gradiente conic por board.
 *
 * Erros possiveis: palavra incompleta, palavra fora do dicionario.
 */
export function processCrosswordGuess(
  state: CrosswordState
): { newState: CrosswordState; error?: string } {
  if (state.isGameOver) {
    return { newState: state, error: 'Jogo encerrado' }
  }

  const guessWord = state.currentGuess.join('')

  if (guessWord.length !== 5) {
    return { newState: state, error: 'Palavra incompleta' }
  }

  // O vocabulario do Cruzado e o mesmo do Quarteto (5 letras, acentos
  // normalizados). Usamos o modo 'quarteto' como referencia para o
  // dicionario - a UI nao precisa saber disso.
  if (!isValidWord(guessWord, 'quarteto')) {
    return { newState: state, error: 'Palavra desconhecida' }
  }

  const newBoards: Board[] = state.boards.map(board => {
    if (board.isComplete) return board

    const tiles = evaluateGuess(guessWord, board.solution)
    const guess: Guess = { word: guessWord, tiles }
    const isCorrect = tiles.every(t => t.state === 'correct')

    return {
      ...board,
      guesses: [...board.guesses, guess],
      isComplete: isCorrect,
    }
  })

  const allComplete = newBoards.every(b => b.isComplete)
  const newRow = state.currentRow + 1
  const isGameOver = allComplete || newRow >= state.maxAttempts

  const newState: CrosswordState = {
    ...state,
    boards: newBoards,
    currentGuess: ['', '', '', '', ''],
    currentRow: newRow,
    isGameOver,
    isWin: allComplete,
    keyStates: updateKeyStates(newBoards),
  }

  return { newState }
}

/**
 * Venceu = todos os 4 boards completos. Atalho de leitura.
 */
export function isCrosswordWon(state: CrosswordState): boolean {
  return state.boards.length === CROSSWORD_NUM_BOARDS &&
    state.boards.every(b => b.isComplete)
}

/**
 * Quantos boards ja foram resolvidos (0..4). Util para o header
 * "X/4 boards completos" sem precisar varrer o array na UI.
 */
export function getCompletedBoardsCount(state: CrosswordState): number {
  return state.boards.filter(b => b.isComplete).length
}

/**
 * Persistencia por dia. Chave dedicada `pitaco:crossword:state:${dateKey}`
 * (escopo do Cruzado, nao colide com `termo:state:quarteto:...`).
 */
export const crosswordStorage = {
  load(dateKey: string): CrosswordState | null {
    try {
      const raw = localStorage.getItem(`${CROSSWORD_STORAGE_PREFIX}:state:${dateKey}`)
      if (!raw) return null
      const parsed = JSON.parse(raw) as CrosswordState
      // Validacao minima de shape: protege contra saves antigos/corrompidos
      if (!parsed.boards || parsed.boards.length !== CROSSWORD_NUM_BOARDS) {
        return null
      }
      return parsed
    } catch (e) {
      console.error('[pitaco-cruzado] erro ao carregar estado:', e)
      return null
    }
  },

  save(dateKey: string, state: CrosswordState): void {
    try {
      localStorage.setItem(
        `${CROSSWORD_STORAGE_PREFIX}:state:${dateKey}`,
        JSON.stringify(state)
      )
    } catch (e) {
      console.error('[pitaco-cruzado] erro ao salvar estado:', e)
    }
  },

  clear(dateKey: string): void {
    try {
      localStorage.removeItem(`${CROSSWORD_STORAGE_PREFIX}:state:${dateKey}`)
    } catch (e) {
      console.error('[pitaco-cruzado] erro ao limpar estado:', e)
    }
  },
}
