// src/pages/games/narutodle/modes.ts

import type { NarutodleMode } from './types'

export const NARUTODLE_MODE_COLORS: Record<NarutodleMode, { border: string; bg: string; text: string }> = {
  classic: { border: '#38b9ff', bg: 'rgba(56,185,255,0.15)', text: '#7dd3fc' },
  jutsu: { border: '#3DA75E', bg: 'rgba(61,167,94,0.15)', text: '#86efac' },
  quote: { border: '#F59E0B', bg: 'rgba(245,158,11,0.15)', text: '#FCD34D' },
  eye: { border: '#C026D3', bg: 'rgba(192,38,211,0.15)', text: '#f0abfc' },
}

export interface NarutodleModeMeta {
  id: NarutodleMode
  label: string
  icon: string
  available: boolean
  path: string
}

export const NARUTODLE_MODES: NarutodleModeMeta[] = [
  { id: 'classic', label: 'Classic', icon: '🔍', available: true, path: '/play/narutodle' },
  { id: 'jutsu', label: 'Jutsu', icon: '🌀', available: true, path: '/play/narutodle-jutsu' },
  { id: 'quote', label: 'Quote', icon: '💬', available: true, path: '/play/narutodle-quote' },
  { id: 'eye', label: 'Eye', icon: '👁', available: true, path: '/play/narutodle-eye' },
]

export const DEFAULT_NARUTODLE_MODE: NarutodleMode = 'classic'

export function parseNarutodleModeFromPathname(pathname: string): NarutodleMode {
  if (pathname.endsWith('/narutodle-jutsu')) return 'jutsu'
  if (pathname.endsWith('/narutodle-quote') || pathname.endsWith('/narutodle-citacao')) return 'quote'
  if (pathname.endsWith('/narutodle-eye') || pathname.endsWith('/narutodle-silhouette')) return 'eye'
  return 'classic'
}

export function parseNarutodleModeFromUrl(search: string): NarutodleMode {
  const raw = new URLSearchParams(search).get('mode')
  if (raw === 'jutsu') return 'jutsu'
  if (raw === 'quote' || raw === 'citacao') return 'quote'
  if (raw === 'eye' || raw === 'silhouette') return 'eye'
  return 'classic'
}
