// src/pages/games/loldle/modes.ts
//
// Definicao dos modos extras do Loldle. Apenas 'classic' e 'quote'
// estao implementados por enquanto. Os outros ficam como 'em breve'.

export type LoldleMode = 'classic' | 'quote' | 'splash' | 'emoji' | 'ability'

export const LOLDLE_MODES: { id: LoldleMode; label: string; available: boolean }[] = [
  { id: 'classic', label: 'Classic', available: true },
  { id: 'quote', label: 'Quote', available: true },
  { id: 'splash', label: 'Splash', available: false },
  { id: 'emoji', label: 'Emoji', available: false },
  { id: 'ability', label: 'Ability', available: false },
]

export const DEFAULT_LOLDLE_MODE: LoldleMode = 'classic'

/**
 * Mapeia o pathname (ex: '/play/loldle-quote') para o modo.
 * Usado para suportar rotas dedicadas como /play/loldle-quote.
 */
export function parseLoldleModeFromPathname(pathname: string): LoldleMode {
  if (pathname.endsWith('/loldle-quote')) return 'quote'
  if (pathname.endsWith('/loldle-splash')) return 'splash'
  if (pathname.endsWith('/loldle-emoji')) return 'emoji'
  if (pathname.endsWith('/loldle-ability')) return 'ability'
  return 'classic'
}

/**
 * Mapeia query string `?mode=quote` para o modo. Fica como
 * fallback quando nao ha rota dedicada.
 */
export function parseLoldleModeFromUrl(search: string): LoldleMode {
  const params = new URLSearchParams(search)
  const raw = params.get('mode')
  if (raw === 'quote') return 'quote'
  if (raw === 'splash') return 'splash'
  if (raw === 'emoji') return 'emoji'
  if (raw === 'ability') return 'ability'
  return 'classic'
}
