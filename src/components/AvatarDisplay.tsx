// src/components/AvatarDisplay.tsx

import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import { avataaars, bottts, lorelei, micah } from '@dicebear/collection'

export type AvatarStyle = 'avataaars' | 'bottts' | 'lorelei' | 'micah'

export const AVATAR_STYLES: readonly AvatarStyle[] = ['avataaars', 'bottts', 'lorelei', 'micah']

export interface AvatarConfig {
  style?: string
  seed?: string
}

export interface AvatarDisplayProps {
  config?: AvatarConfig | Record<string, unknown> | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP: Record<NonNullable<AvatarDisplayProps['size']>, number> = {
  sm: 32,
  md: 44,
  lg: 64,
}

const LEGACY_STYLE: AvatarStyle = 'avataaars'

function isLegacyConfig(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.bodyColor === 'string' ||
    typeof v.eyeStyle === 'string' ||
    typeof v.accessory === 'string'
  )
}

function resolveStyle(style: string | undefined | null): AvatarStyle {
  if (style && (AVATAR_STYLES as readonly string[]).includes(style)) {
    return style as AvatarStyle
  }
  return 'avataaars'
}

function resolveSeed(seed: string | undefined | null, name: string | null): string {
  if (seed && seed.trim()) return seed.trim()
  if (name && name.trim()) return name.trim()
  return 'Pitaco'
}

function resolveConfig(
  config: AvatarConfig | Record<string, unknown> | null | undefined,
  name: string | null
): { style: AvatarStyle; seed: string } {
  if (isLegacyConfig(config)) {
    return { style: LEGACY_STYLE, seed: resolveSeed(null, name) }
  }
  const c = config && typeof config === 'object' ? (config as Record<string, unknown>) : null
  return {
    style: resolveStyle(typeof c?.style === 'string' ? c.style : null),
    seed: resolveSeed(typeof c?.seed === 'string' ? c.seed : null, name),
  }
}

function buildSvg(style: AvatarStyle, seed: string, size: number): string {
  const options = { seed, size, radius: 50 }
  switch (style) {
    case 'avataaars':
      return createAvatar(avataaars, options).toString()
    case 'bottts':
      return createAvatar(bottts, options).toString()
    case 'lorelei':
      return createAvatar(lorelei, options).toString()
    case 'micah':
      return createAvatar(micah, options).toString()
    default:
      return createAvatar(avataaars, options).toString()
  }
}

export function AvatarDisplay({ config, name, size = 'md', className }: AvatarDisplayProps) {
  const box = SIZE_MAP[size]
  const { style, seed } = resolveConfig(config ?? null, name ?? null)

  const svg = useMemo(() => buildSvg(style, seed, box * 2), [style, seed, box])

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-full ${className ?? ''}`}
      style={{
        width: box,
        height: box,
        background: 'rgba(15, 26, 46, 0.6)',
        border: '2px solid rgba(0, 178, 169, 0.35)',
      }}
      aria-label={name ? `Avatar de ${name}` : 'Avatar'}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
