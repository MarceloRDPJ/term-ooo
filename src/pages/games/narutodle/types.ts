// src/pages/games/narutodle/types.ts
//
// Tipos do Narutodle. Inspirado em narutodle.net (clássico): o jogador
// tenta adivinhar um personagem de Naruto Shippuden a partir de
// 7 atributos categoricos (cla, vila, rank, kekkei genkai, elemento,
// afiliacao, genero) em ate 8 tentativas.
//
// Isolado do types.ts do PITACO principal: este jogo nao e baseado em
// letras/palavras, e em atributos categoricos. O unico "acerto total" e
// adivinhar o personagem (id igual ao target).

export type NarutodleClan =
  | 'Uzumaki'
  | 'Uchiha'
  | 'Hyuga'
  | 'Nara'
  | 'Yamanaka'
  | 'Inuzuka'
  | 'Aburame'
  | 'Akimichi'
  | 'Haruno'
  | 'Senju'
  | 'Hatake'
  | 'Sarutobi'
  | 'Namikaze'
  | 'Nenhum'
  | 'Otsutsuki'
  | 'Hoshigaki'
  | 'Shimura'
  | 'Nohara'
  | 'Kaguya'
  | 'Momochi'
  | 'Yuki'

export type NarutodleVila =
  | 'Konoha'
  | 'Suna'
  | 'Kiri'
  | 'Kumo'
  | 'Iwa'
  | 'Otogakure'
  | 'Akatsuki'

export type NarutodleRank =
  | 'Genin'
  | 'Chunin'
  | 'Jonin'
  | 'ANBU'
  | 'Kage'
  | 'Sannin'

export type NarutodleKekkeiGenkai =
  | 'Nenhum'
  | 'Sharingan'
  | 'Byakugan'
  | 'Rinnegan'
  | 'Wood Release'
  | 'Lava Release'
  | 'Boil Release'
  | 'Magnet Release'
  | 'Storm Release'
  | 'Dust Release'
  | 'Shikotsumyaku'
  | 'Ice Release'

export type NarutodleElemento =
  | 'Fogo'
  | 'Vento'
  | 'Trovão'
  | 'Trovao'
  | 'Terra'
  | 'Água'
  | 'Agua'
  | 'Yin'
  | 'Yang'
  | 'Yin-Yang'
  | 'Nenhum'
  | 'Som'
  | 'Teia'
  | 'Veneno'

export type NarutodleAfiliacao =
  | 'Konoha'
  | 'Akatsuki'
  | 'Sannin'
  | 'Kara'
  | 'Nenhuma'
  | 'Outros'

export type NarutodleGenero = 'M' | 'F' | 'Outro' | 'divers'

export type NarutodleFeedbackStatus = 'correct' | 'near' | 'wrong'

export interface NarutodleCharacter {
  id: string
  name: string
  clan: NarutodleClan
  vila: NarutodleVila
  rank: NarutodleRank
  kekkeiGenkai: NarutodleKekkeiGenkai
  elemento: NarutodleElemento
  afiliacao: NarutodleAfiliacao
  genero: NarutodleGenero
}

export interface NarutodleFeedback {
  clan: NarutodleFeedbackStatus
  vila: NarutodleFeedbackStatus
  rank: NarutodleFeedbackStatus
  kekkeiGenkai: NarutodleFeedbackStatus
  elemento: NarutodleFeedbackStatus
  afiliacao: NarutodleFeedbackStatus
  genero: NarutodleFeedbackStatus
}

export interface NarutodleGuess {
  characterId: string
  characterName: string
  feedback: NarutodleFeedback
}

export interface NarutodleState {
  targetId: string
  guesses: NarutodleGuess[]
  currentGuess: string
  currentRow: number
  maxAttempts: number
  isGameOver: boolean
  isWin: boolean
  dateKey: string
  dayNumber: number
  history: string[]
  /** Modo de jogo. 'classic' e 'silhouette' sao persistidos. */
  mode?: 'classic' | 'silhouette'
}

export interface NarutodleProcessResult {
  newState: NarutodleState
  error?: string
}

export const MAX_NARUTODLE_ATTEMPTS = 8

/**
 * Ordem dos ranks (do mais baixo ao mais alto) usada para calcular
 * feedback "near" (diferenca de exatamente 1 nivel = perto).
 */
export const RANK_ORDER: Record<NarutodleRank, number> = {
  Genin: 0,
  Chunin: 1,
  Jonin: 2,
  ANBU: 3,
  Kage: 4,
  Sannin: 5,
}

/**
 * Lista de atributos (ordem = colunas do board 8x7).
 * Usada pela engine e pela UI para renderizar tiles e cores.
 */
export const NARUTODLE_ATTRIBUTES = [
  'clan',
  'vila',
  'rank',
  'kekkeiGenkai',
  'elemento',
  'afiliacao',
  'genero',
] as const

export type NarutodleAttributeKey = (typeof NARUTODLE_ATTRIBUTES)[number]

export const ATTRIBUTE_LABELS: Record<NarutodleAttributeKey, string> = {
  clan: 'Clã',
  vila: 'Vila',
  rank: 'Rank',
  kekkeiGenkai: 'Kekkei Genkai',
  elemento: 'Elemento',
  afiliacao: 'Afiliação',
  genero: 'Gênero',
}
