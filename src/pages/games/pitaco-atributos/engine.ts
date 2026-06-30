// src/pages/games/pitaco-atributos/engine.ts
//
// Engine do PITACO Atributos. Pura, sem React/DOM.
// - createInitialAtributosState: estado inicial a partir de dateKey + dayNumber
// - pickAtributosTargetForDay: selecao deterministica do auditor-alvo
// - evaluateAtributosGuess: calcula o feedback (verde/amarelo/vermelho/cinza)
//   para cada atributo do chute em relacao ao alvo
// - processAtributosGuess: aplica um chute, atualiza tentativas, detecta vitoria
// - isAtributosWon: helper de checagem
//
// Regras de feedback (cor por atributo):
//   - cargo        : verde se igual, senao cinza
//   - equipe       : verde se igual; amarelo se algum OUTRO auditor ja chutado
//                    tambem tem essa equipe e o alvo NAO e essa equipe (sinal
//                    "voce ja descartou essa equipe"); se o chute nao foi
//                    repetido, o amarelo indica "essa equipe existe em alguem
//                    mas nao e o alvo"
//   - senioridade  : verde se igual; "near" (amarelo) se |diff| <= 1;
//                    "far" (vermelho) se |diff| >= 2; "wrong" (cinza) senao
//   - turno        : verde se igual, senao cinza
//   - cidade       : verde se igual, senao cinza
//   - hobby        : verde se igual, senao cinza
//
// Observacao: para manter o feedback deterministico e nao confundir o
// jogador, o "partial" da equipe considera o historico de chutes: se o
// jogador ja chutou alguem com a mesma equipe e NAO acertou o alvo,
// essa equipe fica amarela (voce ja confirmou que a equipe nao e o alvo
// mas outro auditor tem essa equipe - eh uma pista para diversificar).
// No momento, optamos pela versao mais estrita do Poeltl: amarelo significa
// "o atributo existe em outro auditor do escritorio", o que serve de pista
// positiva (voce sabe que existe alguem com essa equipe) e o historico
// (history) e usado para isso.

import { AUDITORES, findAuditorByQuery } from './auditors'
import type {
  AtributosFeedback,
  AtributosGuess,
  AtributosProcessResult,
  AtributosState,
  Auditor,
  AuditorEquipe,
} from './types'
import { MAX_ATRIBUTOS_ATTEMPTS } from './types'

/**
 * Selecao deterministica do auditor-alvo do dia, a partir do dayNumber.
 * Padrao: dayNumber % length (igual a Pitaco Geografia / Term.ooo).
 */
export function pickAtributosTargetForDay(dayNumber: number): Auditor {
  const index =
    ((dayNumber % AUDITORES.length) + AUDITORES.length) % AUDITORES.length
  return AUDITORES[index]
}

/**
 * Cria o estado inicial do jogo para o dia.
 */
export function createInitialAtributosState(
  dateKey: string,
  dayNumber: number,
): AtributosState {
  const target = pickAtributosTargetForDay(dayNumber)
  return {
    targetId: target.id,
    guesses: [],
    currentGuess: '',
    currentRow: 0,
    maxAttempts: MAX_ATRIBUTOS_ATTEMPTS,
    isGameOver: false,
    isWin: false,
    dateKey,
    dayNumber,
    history: [],
  }
}

/**
 * Verifica se um chute e o auditor-alvo.
 */
export function isAtributosWon(state: AtributosState, guess: Auditor): boolean {
  return state.targetId === guess.id
}

/**
 * Avalia o feedback de um chute contra o alvo.
 * Recebe o chute, o alvo e o conjunto de auditores ja chutados
 * (para decidir o "partial" da equipe).
 */
export function evaluateAtributosGuess(
  guess: Auditor,
  target: Auditor,
  historyIds: readonly string[],
): AtributosFeedback {
  // cargo: exato ou nada
  const cargo: AtributosFeedback['cargo'] =
    guess.cargo === target.cargo ? 'correct' : 'wrong'

  // equipe: se igual -> correct. senao, checa se existe OUTRO auditor
  // (ja chutado, nao o chute atual) com essa equipe. Se sim, "partial"
  // (amarelo) - pista positiva de que a equipe existe em alguem ja
  // chutado, mas nao e o alvo. Caso contrario, "wrong".
  let equipe: AtributosFeedback['equipe'] = 'wrong'
  if (guess.equipe === target.equipe) {
    equipe = 'correct'
  } else {
    const teamExistsElsewhere = AUDITORES.some(
      (a) =>
        a.id !== target.id &&
        a.id !== guess.id &&
        a.equipe === guess.equipe &&
        historyIds.includes(a.id),
    )
    if (teamExistsElsewhere) {
      equipe = 'partial'
    }
  }

  // senioridade: correct / near (|diff|<=1) / far (|diff|>=2)
  const diff = Math.abs(guess.senioridade - target.senioridade)
  let senioridade: AtributosFeedback['senioridade']
  if (diff === 0) {
    senioridade = 'correct'
  } else if (diff === 1) {
    senioridade = 'near'
  } else {
    senioridade = 'far'
  }

  // turno / cidade / hobby: binarios
  const turno: AtributosFeedback['turno'] =
    guess.turno === target.turno ? 'correct' : 'wrong'
  const cidade: AtributosFeedback['cidade'] =
    guess.cidade === target.cidade ? 'correct' : 'wrong'
  const hobby: AtributosFeedback['hobby'] =
    guess.hobby === target.hobby ? 'correct' : 'wrong'

  return { cargo, equipe, senioridade, turno, cidade, hobby }
}

/**
 * Processa um chute: valida, calcula feedback, atualiza estado.
 * Retorna { newState, error? }.
 */
export function processAtributosGuess(
  state: AtributosState,
  rawGuess: string,
): AtributosProcessResult {
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

  const target = AUDITORES.find((a) => a.id === state.targetId)
  if (!target) {
    return { newState: state, error: 'Alvo invalido' }
  }

  const feedback = evaluateAtributosGuess(guessed, target, state.history)

  const guessRecord: AtributosGuess = {
    auditorId: guessed.id,
    auditorNome: guessed.nome,
    auditorApelido: guessed.apelido,
    auditorCargo: guessed.cargo,
    auditorEquipe: guessed.equipe,
    auditorSenioridade: guessed.senioridade,
    auditorTurno: guessed.turno,
    auditorCidade: guessed.cidade,
    auditorHobby: guessed.hobby,
    auditorEmoji: guessed.emoji,
    feedback,
  }

  const won = isAtributosWon(state, guessed)
  const newRow = state.currentRow + 1
  const gameOver = won || newRow >= state.maxAttempts

  const newState: AtributosState = {
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
 * Helper: retorna a equipe do alvo (usado pela UI para mostrar a
 * equipe correta ao final do jogo, em conjunto com findAuditorById).
 */
export function getTargetEquipe(state: AtributosState): AuditorEquipe | null {
  const target = AUDITORES.find((a) => a.id === state.targetId)
  return target ? target.equipe : null
}
