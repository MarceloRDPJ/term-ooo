// src/pages/games/narutodle/modes.ts
//
// Definicao dos modos do Narutodle. 'classic' e 'silhouette' estao
// implementados. 'jutsu' e 'citacao' ficam como 'em breve' (dados ja
// existem em jutsu/jutsu.ts para uso futuro).

export type NarutodleMode = 'classic' | 'silhouette' | 'jutsu' | 'citacao'

/**
 * Cor tematica de cada modo (extraida dos PNGs oficiais do narutodle.net).
 * Usada pelo ModeSelector para bordas e fundo sutil do modo ativo.
 */
export const NARUTODLE_MODE_COLORS: Record<NarutodleMode, { border: string; bg: string; text: string }> = {
  classic:    { border: '#38b9ff', bg: 'rgba(56,185,255,0.15)', text: '#7dd3fc' },
  silhouette: { border: '#C026D3', bg: 'rgba(192,38,211,0.15)', text: '#f0abfc' },
  jutsu:      { border: '#3DA75E', bg: 'rgba(61,167,94,0.15)',  text: '#86efac' },
  citacao:    { border: '#F59E0B', bg: 'rgba(245,158,11,0.15)', text: '#FCD34D' },
}

export interface NarutodleModeMeta {
  id: NarutodleMode
  /** Label exibida no ModeSelector. Bate com os botoes PNG do narutodle.net. */
  label: string
  /** Emoji exibido ao lado do label no pill do seletor. */
  icon: string
  available: boolean
}

export const NARUTODLE_MODES: NarutodleModeMeta[] = [
  { id: 'classic',    label: 'Clássico', icon: '🔍', available: true  },
  { id: 'silhouette', label: 'Eye',      icon: '👁', available: true  },
  { id: 'jutsu',      label: 'Jutsu',    icon: '🌀', available: false },
  { id: 'citacao',    label: 'Quote',    icon: '💬', available: false },
]

export const DEFAULT_NARUTODLE_MODE: NarutodleMode = 'classic'

/**
 * Mapeia o pathname (ex: '/play/narutodle-silhouette') para o modo.
 * Usado para suportar rotas dedicadas como /play/narutodle-silhouette.
 * Tambem aceita os aliases publicos da landing page: /narutodle-eye
 * (== silhouette) e /narutodle-quote (== citacao).
 */
export function parseNarutodleModeFromPathname(pathname: string): NarutodleMode {
  if (pathname.endsWith('/narutodle-silhouette') || pathname.endsWith('/narutodle-eye')) return 'silhouette'
  if (pathname.endsWith('/narutodle-jutsu')) return 'jutsu'
  if (pathname.endsWith('/narutodle-citacao') || pathname.endsWith('/narutodle-quote')) return 'citacao'
  return 'classic'
}

export function parseNarutodleModeFromUrl(search: string): NarutodleMode {
  const params = new URLSearchParams(search)
  const raw = params.get('mode')
  if (raw === 'silhouette' || raw === 'eye') return 'silhouette'
  if (raw === 'jutsu') return 'jutsu'
  if (raw === 'citacao' || raw === 'quote') return 'citacao'
  return 'classic'
}
