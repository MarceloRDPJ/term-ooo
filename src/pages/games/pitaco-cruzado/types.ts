// src/pages/games/pitaco-cruzado/types.ts
//
// Tipos dedicados do PITACO Cruzado. Mantemos um CrosswordState proprio
// (em vez de reusar GameState) porque o Cruzado tem identidade de produto
// separada: armazenamento proprio, numero de tentativas proprio (9) e
// requisitos futuros (modo duro, variantes) que nao devem vazar para o
// engine generico de GameState.
//
// Reutilizamos Board, Guess, KeyState do engine generico para nao
// duplicar contratos.

import type { Board, KeyState } from '@/game/types'

export interface CrosswordState {
  boards: Board[]
  currentGuess: string[]
  currentRow: number
  maxAttempts: number
  isGameOver: boolean
  isWin: boolean
  keyStates: Record<string, KeyState[]>
  dateKey: string
  dayNumber: number
}
