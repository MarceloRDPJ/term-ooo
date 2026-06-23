// src/components/AvatarDisplay.tsx

import { Bird } from 'lucide-react'

const DEFAULT_AVATAR = {
  bodyColor: '#6B4F35',
  eyeStyle: 'serio',
  accessory: 'none',
}

export interface AvatarConfig {
  bodyColor?: string
  eyeStyle?: string
  accessory?: string
}

export interface AvatarDisplayProps {
  config: AvatarConfig | null | undefined
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP: Record<NonNullable<AvatarDisplayProps['size']>, { box: number; bird: number; font: string }> = {
  sm: { box: 32, bird: 20, font: 'text-xs' },
  md: { box: 44, bird: 28, font: 'text-sm' },
  lg: { box: 64, bird: 40, font: 'text-base' },
}

function pickColor(name?: string | null): string {
  if (!name) return DEFAULT_AVATAR.bodyColor
  const colors = ['#00B2A9', '#E3C275', '#E25F38', '#6B4F35', '#243447']
  const code = name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0)
  return colors[code % colors.length]
}

function initials(name?: string | null): string {
  if (!name) return '??'
  const cleaned = name.trim()
  if (!cleaned) return '??'
  const parts = cleaned.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function AvatarDisplay({ config, name, size = 'md', className }: AvatarDisplayProps) {
  const { box, bird, font } = SIZE_MAP[size]
  const bodyColor = config?.bodyColor || pickColor(name)
  const accessory = config?.accessory || 'none'
  const fallbackInitials = initials(name)

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-full font-mono font-bold ${className ?? ''}`}
      style={{
        width: box,
        height: box,
        background: `radial-gradient(circle at 30% 30%, ${bodyColor}99, ${bodyColor} 70%)`,
        border: '2px solid rgba(0, 178, 169, 0.35)',
        color: '#0F1A2E',
      }}
      aria-label={name ? `Avatar de ${name}` : 'Avatar'}
    >
      {config?.bodyColor ? (
        <>
          <Bird
            style={{ width: bird, height: bird, color: bodyColor, filter: 'brightness(1.15)' }}
            aria-hidden="true"
          />
          {accessory === 'tie' && (
            <span
              className="absolute"
              style={{
                bottom: box * 0.12,
                left: '50%',
                transform: 'translateX(-50%)',
                width: box * 0.08,
                height: box * 0.18,
                background: '#00B2A9',
                borderRadius: 2,
              }}
            />
          )}
          {accessory === 'glasses' && (
            <span
              className="absolute"
              style={{
                top: box * 0.32,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 2,
              }}
            >
              <span style={{ width: box * 0.14, height: box * 0.14, borderRadius: '50%', border: '1.5px solid #1A2C40' }} />
              <span style={{ width: box * 0.14, height: box * 0.14, borderRadius: '50%', border: '1.5px solid #1A2C40' }} />
            </span>
          )}
        </>
      ) : (
        <span className={font}>{fallbackInitials}</span>
      )}
    </div>
  )
}
