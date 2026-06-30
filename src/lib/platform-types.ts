// src/lib/platform-types.ts

export type GameCategory =
  | 'palavras'
  | 'logica'
  | 'geografia'
  | 'atributos'
  | 'som'
  | 'video'
  | 'auditivo'

export interface GameDefinition {
  slug: string
  title: string
  description: string
  category: GameCategory
  difficulty: 1 | 2 | 3 | 4 | 5
  thumbnail: string
  enabled: boolean
  path: string
  hint?: string
}

export interface GameSummary {
  slug: string
  title: string
  description: string
  category: GameCategory
  difficulty: number
  thumbnail: string
  enabled: boolean
  sort_order: number
}

export interface GameRun {
  id: string
  user_id: string
  game_slug: string
  started_at: string
  ended_at: string | null
  score: number | null
  won: boolean | null
  attempts: number | null
}

export const CATEGORY_LABELS: Record<GameCategory, string> = {
  palavras: 'palavras',
  logica: 'logica',
  geografia: 'geografia',
  atributos: 'atributos',
  som: 'som',
  video: 'video',
  auditivo: 'auditivo',
}

export const CATEGORY_COLORS: Record<GameCategory, { bg: string; fg: string }> = {
  palavras: { bg: 'rgba(0,178,169,0.18)', fg: '#00B2A9' },
  logica: { bg: 'rgba(227,194,117,0.18)', fg: '#E3C275' },
  geografia: { bg: 'rgba(99,179,237,0.18)', fg: '#63B3ED' },
  atributos: { bg: 'rgba(167,139,250,0.18)', fg: '#A78BFA' },
  som: { bg: 'rgba(244,114,182,0.18)', fg: '#F472B6' },
  video: { bg: 'rgba(248,113,113,0.18)', fg: '#F87171' },
  auditivo: { bg: 'rgba(245,158,11,0.18)', fg: '#F59E0B' },
}
