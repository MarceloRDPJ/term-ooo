// src/pages/games/narutodle/modes.ts
//
// Definicao dos modos do Narutodle. 'classic' e 'silhouette' estao
// implementados. 'jutsu' fica como 'em breve' (dados ja existem em
// jutsu/jutsu.ts para uso futuro).

export type NarutodleMode = 'classic' | 'silhouette' | 'jutsu'

export const NARUTODLE_MODES: { id: NarutodleMode; label: string; available: boolean }[] = [
  { id: 'classic', label: 'Classic', available: true },
  { id: 'silhouette', label: 'Silhueta', available: true },
  { id: 'jutsu', label: 'Jutsu', available: false },
]

export const DEFAULT_NARUTODLE_MODE: NarutodleMode = 'classic'

/**
 * Mapeia o pathname (ex: '/play/narutodle-silhouette') para o modo.
 * Usado para suportar rotas dedicadas como /play/narutodle-silhouette.
 */
export function parseNarutodleModeFromPathname(pathname: string): NarutodleMode {
  if (pathname.endsWith('/narutodle-silhouette')) return 'silhouette'
  if (pathname.endsWith('/narutodle-jutsu')) return 'jutsu'
  return 'classic'
}

export function parseNarutodleModeFromUrl(search: string): NarutodleMode {
  const params = new URLSearchParams(search)
  const raw = params.get('mode')
  if (raw === 'silhouette') return 'silhouette'
  if (raw === 'jutsu') return 'jutsu'
  return 'classic'
}
