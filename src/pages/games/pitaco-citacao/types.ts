// src/pages/games/pitaco-citacao/types.ts
//
// Tipos do PITACO Citacao. Inspirado em Loldle Quote:
// o jogador recebe uma citacao do chat do escritorio e tem 6
// tentativas para adivinhar qual auditor a mandou.

export type QuoteGuessStatus = 'correct' | 'wrong'

export interface Citacao {
  id: string
  authorId: string
  text: string
  context: string
}

export interface QuoteGuess {
  authorId: string
  authorName: string
  status: QuoteGuessStatus
}

export interface CitacaoState {
  targetCitacaoId: string
  guesses: QuoteGuess[]
  currentGuess: string
  currentRow: number
  maxAttempts: number
  isGameOver: boolean
  isWin: boolean
  dateKey: string
  dayNumber: number
  history: string[]
}

export interface CitacaoProcessResult {
  newState: CitacaoState
  error?: string
}

export const MAX_CITACAO_ATTEMPTS = 6
