// src/components/CrachaPanel.tsx

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Loader2, LogOut, Save, UserCircle2 } from 'lucide-react'
import { Button } from './ui/button'
import { AvatarDisplay, AvatarConfig } from './AvatarDisplay'
import { AvatarPicker } from './AvatarPicker'
import { Profile } from '@/lib/multiplayer-types'
import { storage } from '@/game/storage'

interface CrachaPanelProps {
  profile: Profile | null
  email: string | null
  isSubmitting: boolean
  onSubmittingChange: (value: boolean) => void
  onSaveNickname: (nickname: string) => Promise<boolean>
  onSaveAvatar: (config: AvatarConfig) => Promise<boolean>
  onSignOut: () => void | Promise<void>
  onMessage: (message: string | null) => void
}

type Cargo = 'Admin' | 'Auditor' | 'Estagiario' | 'Banido'

const CARGO_STYLE: Record<Cargo, { label: string; bg: string; color: string; border: string }> = {
  Admin: {
    label: 'Admin',
    bg: 'rgba(0, 178, 169, 0.18)',
    color: '#00B2A9',
    border: 'rgba(0, 178, 169, 0.45)',
  },
  Auditor: {
    label: 'Auditor',
    bg: 'rgba(227, 194, 117, 0.18)',
    color: '#E3C275',
    border: 'rgba(227, 194, 117, 0.45)',
  },
  Estagiario: {
    label: 'Estagiario',
    bg: 'rgba(148, 163, 184, 0.15)',
    color: '#94A3B8',
    border: 'rgba(148, 163, 184, 0.35)',
  },
  Banido: {
    label: 'Banido',
    bg: 'rgba(226, 95, 56, 0.18)',
    color: '#E25F38',
    border: 'rgba(226, 95, 56, 0.45)',
  },
}

function normalizeAvatarConfig(value: unknown, nickname: string | null, email: string | null): AvatarConfig {
  if (value && typeof value === 'object') {
    const v = value as Record<string, unknown>
    const style = typeof v.style === 'string' ? v.style : undefined
    const seed = typeof v.seed === 'string' && v.seed.trim() ? v.seed : undefined
    if (style || seed) {
      return { style, seed }
    }
  }
  const fallbackSeed = nickname || (email ? email.split('@')[0] : null) || 'Pitaco'
  return { style: 'avataaars', seed: fallbackSeed }
}

function resolveCargo(role: string | null | undefined, hasPlayed: boolean): Cargo {
  if (role === 'admin') return 'Admin'
  if (role === 'banned') return 'Banido'
  return hasPlayed ? 'Auditor' : 'Estagiario'
}

export function CrachaPanel({
  profile,
  email,
  isSubmitting,
  onSubmittingChange,
  onSaveNickname,
  onSaveAvatar,
  onSignOut,
  onMessage,
}: CrachaPanelProps) {
  const [nickname, setNickname] = useState(profile?.nickname ?? '')
  const [showAvatar, setShowAvatar] = useState(false)
  const [avatarDraft, setAvatarDraft] = useState<AvatarConfig>(() =>
    normalizeAvatarConfig(profile?.avatar_config, profile?.nickname ?? null, email ?? null)
  )

  useEffect(() => {
    setNickname(profile?.nickname ?? '')
  }, [profile?.nickname])

  useEffect(() => {
    setAvatarDraft(
      normalizeAvatarConfig(profile?.avatar_config, profile?.nickname ?? null, email ?? null)
    )
  }, [profile?.avatar_config, profile?.nickname, email])

  const currentAvatar = useMemo<AvatarConfig>(
    () => normalizeAvatarConfig(profile?.avatar_config, profile?.nickname ?? null, email ?? null),
    [profile?.avatar_config, profile?.nickname, email]
  )

  const hasCustomAvatar = useMemo(() => {
    if (!profile?.avatar_config || typeof profile.avatar_config !== 'object') return false
    const v = profile.avatar_config as Record<string, unknown>
    if (typeof v.style === 'string' && v.style) return true
    if (typeof v.seed === 'string' && v.seed.trim()) return true
    if (typeof v.bodyColor === 'string' || typeof v.eyeStyle === 'string' || typeof v.accessory === 'string') return true
    return false
  }, [profile?.avatar_config])

  const role = (profile as (Profile & { role?: string | null }) | null)?.role ?? null

  const hasPlayed = useMemo(() => {
    if (typeof window === 'undefined') return false
    const total =
      storage.getStats('termo').gamesPlayed +
      storage.getStats('dueto').gamesPlayed +
      storage.getStats('quarteto').gamesPlayed
    return total > 0
  }, [])

  const cargo = resolveCargo(role, hasPlayed)
  const cargoStyle = CARGO_STYLE[cargo]

  const handleNicknameSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (nickname.trim().length < 2) {
      onMessage('Apelido precisa ter pelo menos 2 caracteres.')
      return
    }
    onSubmittingChange(true)
    const ok = await onSaveNickname(nickname.trim())
    onSubmittingChange(false)
    if (ok) onMessage('Cracha atualizado.')
  }

  const handleSaveAvatar = async (config: AvatarConfig) => {
    onSubmittingChange(true)
    const ok = await onSaveAvatar(config)
    onSubmittingChange(false)
    return ok
  }

  return (
    <div className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-5 shadow-2xl">
      <div className="mb-5 flex items-center gap-3">
        <AvatarDisplay
          config={currentAvatar}
          name={profile?.nickname ?? email ?? null}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500">cracha</p>
          <p className="truncate font-mono text-lg font-bold" style={{ color: '#00B2A9' }}>
            {profile?.nickname || 'Estagiario'}
          </p>
          <p className="truncate text-xs text-slate-500">{email || 'sem sessao'}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-lg border border-[#2A4060] bg-[#0F1A2E]/60 px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <UserCircle2 className="h-4 w-4" style={{ color: '#E3C275' }} />
          cargo
        </div>
        <span
          className="rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider"
          style={{
            background: cargoStyle.bg,
            color: cargoStyle.color,
            borderColor: cargoStyle.border,
          }}
        >
          {cargoStyle.label}
        </span>
      </div>

      <form onSubmit={handleNicknameSubmit} className="mb-4 space-y-2">
        <label className="text-xs font-medium text-slate-300 font-mono" htmlFor="cracha-nickname">apelido</label>
        <input
          id="cracha-nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder={profile?.nickname || 'Seu apelido'}
          maxLength={20}
          className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-sm text-white outline-none focus:border-[#00B2A9]"
        />
        <Button type="submit" disabled={isSubmitting || nickname.trim().length < 2} className="w-full font-mono text-xs">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          salvar apelido
        </Button>
      </form>

      <div className="mb-4 space-y-2">
        <p className="text-xs font-mono text-slate-300">avatar</p>
        <div className="flex items-center gap-3 rounded-lg border border-[#2A4060] bg-[#0F1A2E]/60 p-3">
          <AvatarDisplay config={currentAvatar} name={profile?.nickname ?? email ?? null} size="md" />
          <div className="min-w-0 flex-1 text-xs text-slate-400 font-mono">
            {hasCustomAvatar
              ? 'Avatar customizado salvo.'
              : 'Sem avatar customizado. Escolha estilo e seed.'}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAvatar((prev) => !prev)}
            className="border-[#2A4060] bg-transparent font-mono text-xs text-slate-200"
          >
            {showAvatar ? 'fechar' : 'editar'}
          </Button>
        </div>

        {showAvatar && (
          <div className="rounded-lg border border-[#2A4060] bg-[#0F1A2E]/60 p-3">
            <AvatarPicker
              config={avatarDraft}
              nickname={profile?.nickname ?? null}
              email={email ?? null}
              isSubmitting={isSubmitting}
              onChange={setAvatarDraft}
              onSave={handleSaveAvatar}
              onMessage={onMessage}
            />
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => void onSignOut()}
        className="w-full border-[#2A4060] bg-transparent font-mono text-xs text-slate-300"
      >
        <LogOut className="mr-2 h-4 w-4" /> pedir exoneracao
      </Button>
    </div>
  )
}
