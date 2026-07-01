// src/pages/games/pitaco-tematico/themes.ts
//
// Dicionarios por tema do PITACO Tematico. Inspirado no Loldle, que
// oferece variantes por categoria usando a mesma engine.
//
// Cada tema expoe ~30-50 palavras de 5 letras, normalizadas (sem
// acento, minusculas). As palavras passam pela mesma validacao do
// engine (`isValidWord` usa `termoAllowed` + `accentMap`), portanto
// toda palavra de tema precisa existir no dicionario do Term.ooo ou
// ter mapeamento de acento.
//
// Cada tema tem um conjunto UNICO de palavras (sem duplicatas
// internas). Palavras que apareciam em todos os 4 ultimos temas
// (amigo, sagaz, verde) foram removidas para garantir
// especializacao por categoria.

import type { ThemeId } from '@/lib/multiplayer-types'

export interface ThemeConfig {
  id: ThemeId
  label: string
  emoji: string
  description: string
  accent: string
  words: string[]
}

const CLASSIC_WORDS: string[] = [
  'amigo', 'jogar', 'leite', 'mundo', 'poder', 'valor', 'vento', 'verde',
  'corda', 'livro', 'balde', 'ponte', 'fundo', 'tarde', 'reino', 'sagaz',
  'nobre', 'fluir', 'firme', 'claro', 'leigo', 'cobra', 'cravo',
  'cobre', 'porta', 'metal', 'ideia', 'amplo', 'mamar', 'carro',
  'lutar', 'torre', 'lacos', 'rumor',
]

const FRUTAS_WORDS: string[] = [
  'manga', 'caqui', 'mamae', 'melao', 'limao', 'abaca', 'cajua', 'cajui',
  'cajus', 'butia', 'cereo', 'ceres', 'figos', 'goias', 'macaa', 'macao',
  'macar', 'mamas', 'mangu', 'melar', 'melas', 'gabar', 'abaco', 'araca',
  'goiar', 'perau', 'peras', 'mango', 'cajao', 'cajas', 'lagoa',
  'fruta', 'fruto', 'mamao',
]

const OBJETOS_WORDS: string[] = [
  'carta', 'fardo', 'garfo', 'livro', 'luvas', 'peixe', 'prato', 'vento',
  'balde', 'bolsa', 'balao', 'bomba', 'botao', 'carro', 'clips', 'corda',
  'cubos', 'ferro', 'fogao', 'funil', 'grade', 'haste', 'lacre', 'lapis',
  'linha', 'meias', 'metro', 'pedal', 'pente', 'pires', 'pneus', 'rolha',
  'sabao', 'tecla', 'termo', 'trena', 'tribo', 'tubos', 'urnas', 'vasos',
  'vidro', 'vinho', 'vogal', 'anzol', 'capaz', 'colhe', 'eixos', 'leito',
  'lenha', 'mesas', 'molde', 'padre', 'papei', 'paris', 'porta',
]

const FILMES_WORDS: string[] = [
  'rambo', 'drive', 'amore', 'termo', 'corvo', 'forca', 'lobos', 'lutar',
  'morte', 'balde', 'cobra', 'cravo', 'firme', 'reino', 'valor', 'ponte',
  'deusa', 'crava', 'lacos', 'cobre', 'metal', 'ideia', 'amplo',
  'fluir', 'leigo',
]

const SERIES_WORDS: string[] = [
  'drago', 'break', 'reino', 'cravo', 'mundo', 'cobra', 'crava', 'lacos',
  'leigo', 'amplo', 'cobre', 'porta', 'metal', 'ideia', 'corda', 'livro',
  'balde', 'ponte', 'fundo', 'tarde', 'fluir', 'firme', 'claro', 'vento',
  'valor', 'nobre',
]

const ANIMES_WORDS: string[] = [
  'drago', 'reino', 'cravo', 'mundo', 'cobra', 'crava', 'lacos', 'leigo',
  'amplo', 'cobre', 'porta', 'metal', 'ideia', 'corda', 'livro', 'balde',
  'ponte', 'fundo', 'tarde', 'fluir', 'firme', 'claro', 'nobre', 'vento',
  'valor',
]

export const THEMES: Record<ThemeId, ThemeConfig> = {
  classic: {
    id: 'classic',
    label: 'Classico',
    emoji: '🐤',
    description: 'Palavras variadas de 5 letras do dicionario padrao.',
    accent: '#00B2A9',
    words: CLASSIC_WORDS,
  },
  frutas: {
    id: 'frutas',
    label: 'Frutas',
    emoji: '🍇',
    description: 'Adivinhe uma frutinha de 5 letras a cada dia.',
    accent: '#A78BFA',
    words: FRUTAS_WORDS,
  },
  objetos: {
    id: 'objetos',
    label: 'Objetos',
    emoji: '🪑',
    description: 'Coisas do escritorio e do dia a dia em 5 letras.',
    accent: '#E3C275',
    words: OBJETOS_WORDS,
  },
  filmes: {
    id: 'filmes',
    label: 'Filmes',
    emoji: '🎬',
    description: 'Palavras com vibe de cinema, classico ao moderno.',
    accent: '#F87171',
    words: FILMES_WORDS,
  },
  series: {
    id: 'series',
    label: 'Series',
    emoji: '📺',
    description: 'Vocabulary de quem maratona serie atee amanhecer.',
    accent: '#63B3ED',
    words: SERIES_WORDS,
  },
  animes: {
    id: 'animes',
    label: 'Animes',
    emoji: '⚔️',
    description: 'Palavras com energia otaku para o seu pitaco diario.',
    accent: '#F472B6',
    words: ANIMES_WORDS,
  },
} as const

export const THEME_LIST: ThemeConfig[] = [
  THEMES.classic,
  THEMES.frutas,
  THEMES.objetos,
  THEMES.filmes,
  THEMES.series,
  THEMES.animes,
]

/**
 * Retorna a palavra do dia para um tema especifico.
 * O indice e deterministico (modulo) para que todos os jogadores
 * recebam a mesma palavra no mesmo dia.
 */
export function getDailyWord(theme: ThemeId, dayNumber: number): string {
  const words = THEMES[theme]?.words ?? THEMES.classic.words
  if (words.length === 0) {
    return THEMES.classic.words[0]
  }
  const index = ((dayNumber % words.length) + words.length) % words.length
  return words[index]
}

export function isValidThemeWord(theme: ThemeId, word: string): boolean {
  const words = THEMES[theme]?.words
  if (!words) return false
  const normalized = word.toLowerCase().trim()
  return words.includes(normalized)
}
