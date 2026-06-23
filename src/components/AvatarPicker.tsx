// src/components/AvatarPicker.tsx

import { useMemo, useState } from 'react'
import { createAvatar } from '@dicebear/core'
import { avataaars, bottts, lorelei, micah } from '@dicebear/collection'
import { Loader2, Save, Shuffle, UserCircle2 } from 'lucide-react'
import { Button } from './ui/button'
import { AvatarConfig, AvatarStyle, AvatarDisplay } from './AvatarDisplay'

interface AvatarPickerProps {
  config: AvatarConfig
  nickname: string | null
  email: string | null
  isSubmitting: boolean
  onChange: (config: AvatarConfig) => void
  onSave: (config: AvatarConfig) => Promise<boolean>
  onMessage: (message: string | null) => void
}

const STYLES: { value: AvatarStyle; label: string; description: string }[] = [
  { value: 'avataaars', label: 'Avataaars', description: 'retrato cartoon classico' },
  { value: 'bottts', label: 'Bottts', description: 'robo estilizado' },
  { value: 'lorelei', label: 'Lorelei', description: 'ilustracao artistica' },
  { value: 'micah', label: 'Micah', description: 'avatar minimalista' },
]

const ALL_STYLES: readonly AvatarStyle[] = ['avataaars', 'bottts', 'lorelei', 'micah']

function pickStyle(value: string | undefined | null): AvatarStyle {
  if (value && (ALL_STYLES as readonly string[]).includes(value)) {
    return value as AvatarStyle
  }
  return 'avataaars'
}

function defaultSeed(nickname: string | null, email: string | null): string {
  if (nickname && nickname.trim()) return nickname.trim()
  if (email && email.trim()) return email.split('@')[0]?.trim() || 'Pitaco'
  return 'Pitaco'
}

function randomSeed(): string {
  const buf = new Uint8Array(8)
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(buf)
  } else {
    for (let i = 0; i < buf.length; i++) buf[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(buf)
    .map((b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 12)
}

function generateSvg(style: AvatarStyle, seed: string, size: number): string {
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

function StylePreview({ style, seed, size = 40 }: { style: AvatarStyle; seed: string; size?: number }) {
  const svg = useMemo(() => generateSvg(style, seed, size * 2), [style, seed, size])
  return (
    <div
      className="overflow-hidden rounded-full"
      style={{ width: size, height: size, background: 'rgba(15, 26, 46, 0.6)' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export function AvatarPicker({
  config,
  nickname,
  email,
  isSubmitting,
  onChange,
  onSave,
  onMessage,
}: AvatarPickerProps) {
  const currentStyle = pickStyle(config.style)
  const currentSeed = (config.seed && config.seed.trim()) || defaultSeed(nickname, email)
  const [draftSeed, setDraftSeed] = useState<string>(currentSeed)

  const handleStyleChange = (next: AvatarStyle) => {
    onChange({ style: next, seed: currentSeed })
  }

  const handleUseNickname = () => {
    const next = defaultSeed(nickname, email)
    setDraftSeed(next)
    onChange({ style: currentStyle, seed: next })
  }

  const handleRandom = () => {
    const next = randomSeed()
    setDraftSeed(next)
    onChange({ style: currentStyle, seed: next })
  }

  const handleSeedInput = (value: string) => {
    setDraftSeed(value)
    onChange({ style: currentStyle, seed: value })
  }

  const handleSave = async () => {
    const finalConfig: AvatarConfig = { style: currentStyle, seed: currentSeed }
    const ok = await onSave(finalConfig)
    if (ok) onMessage('Avatar salvo.')
    else onMessage(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full" style={{ border: '2px solid rgba(0, 178, 169, 0.35)', padding: 2 }}>
          <StylePreview style={currentStyle} seed={currentSeed} size={80} />
        </div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
          {currentStyle} - {currentSeed}
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-mono text-slate-400">estilo</p>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => {
            const active = currentStyle === s.value
            return (
              <button
                key={s.value}
                type="button"
                title={s.description}
                onClick={() => handleStyleChange(s.value)}
                className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 font-mono text-[10px] transition-colors"
                style={{
                  background: active ? 'rgba(0,178,169,0.18)' : 'rgba(255,255,255,0.05)',
                  color: active ? '#00B2A9' : '#94A3B8',
                  border: active ? '1px solid rgba(0,178,169,0.45)' : '1px solid transparent',
                  minWidth: 64,
                }}
              >
                <StylePreview style={s.value} seed={currentSeed} size={36} />
                <span>{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-mono text-slate-400">seed</p>
        <input
          value={draftSeed}
          onChange={(event) => handleSeedInput(event.target.value)}
          placeholder="apelido ou texto"
          maxLength={32}
          className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-sm text-white outline-none focus:border-[#00B2A9]"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleUseNickname}
            className="border-[#2A4060] bg-transparent font-mono text-[10px] text-slate-200"
          >
            <UserCircle2 className="mr-1 h-3 w-3" /> usar meu apelido
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleRandom}
            className="border-[#2A4060] bg-transparent font-mono text-[10px] text-slate-200"
          >
            <Shuffle className="mr-1 h-3 w-3" /> aleatorio
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-[#2A4060]/60 bg-[#0F1A2E]/60 p-3">
        <div className="flex items-center gap-3">
          <AvatarDisplay config={{ style: currentStyle, seed: currentSeed }} name={currentSeed} size="sm" />
          <p className="text-[11px] font-mono text-slate-400">este e o avatar que os outros vao ver.</p>
        </div>
        <Button type="button" onClick={handleSave} disabled={isSubmitting} className="font-mono text-xs">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          salvar avatar
        </Button>
      </div>
    </div>
  )
}
