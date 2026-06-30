// src/pages/games/loldle/types.ts
//
// Tipos do Loldle. Inspirado em loldle.net (Classic mode).
// Jogo de adivinhacao de campeao de League of Legends por atributos
// categoricos (regiao, classe, recurso, alcance, genero) + numerico (ano).

/**
 * Regioes de Runeterra cobertas pelo dataset do MVP.
 * Hardcoded para serem identicas as de champions.ts.
 */
export type LoldleRegion =
  | 'Demacia'
  | 'Noxus'
  | 'Ionia'
  | 'Freljord'
  | 'Piltover'
  | 'Zaun'
  | 'Bandle'
  | 'Shadow Isles'
  | 'Targon'
  | 'Shurima'
  | 'Bilgewater'
  | 'Ixtal'
  | 'Void'
  | 'Runeterra'

/**
 * Classes / roles primarias de League of Legends.
 * Campeoes com classe dupla (ex: Senna = Atirador/Suporte) sao
 * categorizados pela role primaria.
 */
export type LoldleClasse =
  | 'Lutador'
  | 'Mago'
  | 'Assassino'
  | 'Atirador'
  | 'Suporte'
  | 'Tanque'

/**
 * Sistema de recurso docampeao.
 * - Mana: caster padrao
 * - Energia: Ionia (Akali, Lee Sin, Shen, Zed, Kennen)
 * - Furia: Sett, Tryndamere, etc
 * - Vida: Aatrox, Vladimir, etc (custam % de HP)
 * - Sem custo: Garen, Katarina, Riven, Yasuo, Yone
 * - Calor: Rumble (heat system)
 */
export type LoldleRecurso =
  | 'Mana'
  | 'Energia'
  | 'Furia'
  | 'Vida'
  | 'Sem custo'
  | 'Calor'

/** Tipo de ataque basico. */
export type LoldleAlcance = 'Corpo-a-corpo' | 'A distancia'

/** Genero do campeao. "Outro" cobre entidades sem genero binario (ex: Aurelion Sol, Gnar). */
export type LoldleGenero = 'Masculino' | 'Feminino' | 'Outro'

/**
 * Status de feedback por atributo.
 * - 'correct': exato (verde)
 * - 'partial': util para ano (mesma "faixa" — nao usado por enquanto)
 * - 'near': amarelo (proximo) — usado para ano ±2 anos
 * - 'far': vermelho (longe) — usado para ano muito distante
 * - 'wrong': cinza (errado)
 *
 * Para os atributos categoricos (regiao/classe/recurso/alcance/genero) so
 * usamos 'correct' | 'wrong'. Para ano usamos 'correct' | 'near' | 'wrong'.
 * Mantemos 'partial' | 'far' na union para extensibilidade.
 */
export type LoldleFeedbackStatus =
  | 'correct'
  | 'partial'
  | 'near'
  | 'far'
  | 'wrong'

/**
 * Campeao de League of Legends no dataset do Loldle.
 * Dados hardcoded (40 campeoes) — sao atributos estaveis e publicos.
 */
export interface LoldleChampion {
  /** id slug (lowercase, snake_case) usado nas rotas internas e na chave de storage. */
  id: string
  /** Nome de exibicao. */
  name: string
  /** Regiao de Runeterra. */
  region: LoldleRegion
  /** Classe / role primaria. */
  classe: LoldleClasse
  /** Sistema de recurso. */
  recurso: LoldleRecurso
  /** Alcance do ataque basico. */
  alcance: LoldleAlcance
  /** Genero do campeao. */
  genero: LoldleGenero
  /** Ano de release oficial. */
  ano: number
}

/**
 * Feedback por chute. Cada atributo tem seu proprio status.
 */
export interface LoldleFeedback {
  region: LoldleFeedbackStatus
  classe: LoldleFeedbackStatus
  recurso: LoldleFeedbackStatus
  alcance: LoldleFeedbackStatus
  genero: LoldleFeedbackStatus
  ano: LoldleFeedbackStatus
}

/**
 * Registro de um chute realizado pelo jogador.
 * Persistido no estado do jogo.
 */
export interface LoldleGuess {
  /** Id do campeao chutado. */
  championId: string
  /** Feedback calculado para o chute. */
  feedback: LoldleFeedback
  /** Diferenca absoluta de anos (sempre >= 0). Util para o hint da seta. */
  yearDelta?: number
}

/**
 * Estado completo do jogo Loldle para o dia (dateKey).
 * Persistido no localStorage.
 */
export interface LoldleState {
  /** Id do campeao-alvo do dia. */
  targetId: string
  /** Lista de chutes (na ordem em que foram feitos). */
  guesses: LoldleGuess[]
  /** Id do campeao atualmente no input (ou string vazia). Nao persistimos a UI crua. */
  currentGuess: string
  /** Linha atual (0..maxAttempts). Equivalente a guesses.length enquanto joga. */
  currentRow: number
  /** Maximo de tentativas (8). */
  maxAttempts: number
  /** Jogo encerrado? */
  isGameOver: boolean
  /** Jogador venceu? */
  isWin: boolean
  /** Chave do dia (YYYY-MM-DD) para a qual o estado vale. */
  dateKey: string
  /** Historico de campeoes chutados (evita duplicata). */
  history: string[]
}

/** Resultado de processLoldleGuess. */
export interface LoldleProcessResult {
  newState: LoldleState
  error?: string
}

/** Limite duro de tentativas (Classic mode do Loldle). */
export const LOLDLE_MAX_ATTEMPTS = 8

/** Faixa de "perto" para o ano (em anos). */
export const LOLDLE_YEAR_NEAR_BAND = 2
