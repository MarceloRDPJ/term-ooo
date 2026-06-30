// src/pages/games/pitaco-atributos/types.ts
//
// Tipos do PITACO Atributos. Inspirado em Poeltl (NBA):
// o jogador tenta adivinhar um auditor do escritorio PITACO
// puramente por seus atributos categoricos (cargo, equipe,
// senioridade, turno, cidade, hobby). Nao envolve palavras.
//
// A cor de cada atributo no feedback segue o padrao:
//   - verde  : atributo exato
//   - amarelo: match em outro auditor (parcial)
//   - cinza  : atributo errado
//   - vermelho: fora de faixa (apenas senioridade, "longe")
//
// O jogo tem 8 tentativas (MAX_ATRIBUTOS_ATTEMPTS) e o alvo
// do dia e selecionado deterministicamente a partir do
// dayNumber, igual ao PITACO principal.

export type AuditorCargo =
  | 'Estagiario'
  | 'Auditor'
  | 'Analista'
  | 'Chefe'
  | 'Gerente'
  | 'Diretor'

export type AuditorEquipe =
  | 'Plataforma'
  | 'Growth'
  | 'Compliance'
  | 'Operacoes'
  | 'RH'
  | 'Financeiro'
  | 'Marketing'
  | 'Tech'

/**
 * Senioridade em escala numerica (1=Estagiario, ..., 5=Diretor).
 * Como o cargo ja tem faixas amplas, mantemos a numerica para
 * possibilitar o feedback "near" (diferenca <= 1) do tipo
 * Worldle/Poeltl.
 */
export type AuditorSenioridade = 1 | 2 | 3 | 4 | 5

export type AuditorTurno = 'manha' | 'tarde' | 'integral' | 'flex'

export type AuditorCidade = 'SP' | 'RJ' | 'MG' | 'RS' | 'BA' | 'PR' | 'PE'

export type AuditorHobby =
  | 'futebol'
  | 'leitura'
  | 'games'
  | 'cozinha'
  | 'caminhada'
  | 'cafe'

export interface Auditor {
  id: string
  nome: string
  apelido: string
  cargo: AuditorCargo
  equipe: AuditorEquipe
  senioridade: AuditorSenioridade
  turno: AuditorTurno
  cidade: AuditorCidade
  hobby: AuditorHobby
  emoji: string
}

export type AtributosCargoStatus = 'correct' | 'wrong'
export type AtributosEquipeStatus = 'correct' | 'partial' | 'wrong'
export type AtributosSenioridadeStatus = 'correct' | 'near' | 'far' | 'wrong'
export type AtributosTurnoStatus = 'correct' | 'wrong'
export type AtributosCidadeStatus = 'correct' | 'wrong'
export type AtributosHobbyStatus = 'correct' | 'wrong'

export interface AtributosFeedback {
  cargo: AtributosCargoStatus
  equipe: AtributosEquipeStatus
  senioridade: AtributosSenioridadeStatus
  turno: AtributosTurnoStatus
  cidade: AtributosCidadeStatus
  hobby: AtributosHobbyStatus
}

export interface AtributosGuess {
  auditorId: string
  auditorNome: string
  auditorApelido: string
  auditorCargo: AuditorCargo
  auditorEquipe: AuditorEquipe
  auditorSenioridade: AuditorSenioridade
  auditorTurno: AuditorTurno
  auditorCidade: AuditorCidade
  auditorHobby: AuditorHobby
  auditorEmoji: string
  feedback: AtributosFeedback
}

export interface AtributosState {
  targetId: string
  guesses: AtributosGuess[]
  currentGuess: string
  currentRow: number
  maxAttempts: number
  isGameOver: boolean
  isWin: boolean
  dateKey: string
  dayNumber: number
  history: string[]
}

export interface AtributosProcessResult {
  newState: AtributosState
  error?: string
}

export const MAX_ATRIBUTOS_ATTEMPTS = 8

export const ATRIBUTOS_CARGO_LABELS: Record<AuditorCargo, string> = {
  Estagiario: 'Estagiario',
  Auditor: 'Auditor',
  Analista: 'Analista',
  Chefe: 'Chefe',
  Gerente: 'Gerente',
  Diretor: 'Diretor',
}

export const ATRIBUTOS_EQUIPE_LABELS: Record<AuditorEquipe, string> = {
  Plataforma: 'Plataforma',
  Growth: 'Growth',
  Compliance: 'Compliance',
  Operacoes: 'Operacoes',
  RH: 'RH',
  Financeiro: 'Financeiro',
  Marketing: 'Marketing',
  Tech: 'Tech',
}

export const ATRIBUTOS_SENIORIDADE_LABELS: Record<AuditorSenioridade, string> = {
  1: 'Junior',
  2: 'Pleno',
  3: 'Senior',
  4: 'Lead',
  5: 'Principal',
}

export const ATRIBUTOS_TURNO_LABELS: Record<AuditorTurno, string> = {
  manha: 'Manha',
  tarde: 'Tarde',
  integral: 'Integral',
  flex: 'Flex',
}

export const ATRIBUTOS_CIDADE_LABELS: Record<AuditorCidade, string> = {
  SP: 'Sao Paulo',
  RJ: 'Rio de Janeiro',
  MG: 'Minas Gerais',
  RS: 'Rio Grande do Sul',
  BA: 'Bahia',
  PR: 'Parana',
  PE: 'Pernambuco',
}

export const ATRIBUTOS_HOBBY_LABELS: Record<AuditorHobby, string> = {
  futebol: 'Futebol',
  leitura: 'Leitura',
  games: 'Games',
  cozinha: 'Cozinha',
  caminhada: 'Caminhada',
  cafe: 'Cafe',
}
