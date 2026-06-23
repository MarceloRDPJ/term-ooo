// src/components/CrachaPanel.tsx

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Loader2, LogOut, Save, UserCircle2 } from 'lucide-react'
import { Button } from './ui/button'
import { AvatarDisplay } from './AvatarDisplay'
import { AvatarConfig, AvatarPicker } from './AvatarPicker'
import { Profile } from '@/lib/multiplayer-types'

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

function isAvatarConfig(value: unknown): value is AvatarConfig {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.bodyColor === 'string' ||
    typeof v.eyeStyle === 'string' ||
    typeof v.accessory === 'string' ||
    Object.keys(v).length === 0
  )
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
  const [avatarDraft, setAvatarDraft] = useState<AvatarConfig>(() => {
    if (isAvatarConfig(profile?.avatar_config)) {
      const cfg = profile!.avatar_config as unknown as Partial<AvatarConfig>
      return {
        bodyColor: cfg.bodyColor ?? '#6B4F35',
        eyeStyle: cfg.eyeStyle ?? 'serio',
        accessory: cfg.accessory ?? 'none',
      }
    }
    return { bodyColor: '#6B4F35', eyeStyle: 'serio', accessory: 'none' }
  })

  useEffect(() => {
    setNickname(profile?.nickname ?? '')
  }, [profile?.nickname])

  useEffect(() => {
    if (isAvatarConfig(profile?.avatar_config)) {
      const cfg = profile!.avatar_config as unknown as Partial<AvatarConfig>
      setAvatarDraft({
        bodyColor: cfg.bodyColor ?? '#6B4F35',
        eyeStyle: cfg.eyeStyle ?? 'serio',
        accessory: cfg.accessory ?? 'none',
      })
    }
  }, [profile?.avatar_config])

  const currentAvatar = useMemo<AvatarConfig>(() => {
    if (isAvatarConfig(profile?.avatar_config)) {
      return profile!.avatar_config as AvatarConfig
    }
    return avatarDraft
  }, [profile?.avatar_config, avatarDraft])

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

  const handleSaveAvatar = async () => {
    onSubmittingChange(true)
    const ok = await onSaveAvatar(avatarDraft)
    onSubmittingChange(false)
    if (ok) {
      setShowAvatar(false)
      onMessage('Avatar salvo.')
    }
  }

  return (
    <div className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-5 shadow-2xl">
      <div className="mb-5 flex items-center gap-3">
              <AvatarDisplay
                config={(profile?.avatar_config as unknown as Partial<AvatarConfig> | undefined) ?? null}
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
          className="rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold uppercase"
          style={{ background: 'rgba(0, 178, 169, 0.15)', color: '#00B2A9' }}
        >
          Estagiario
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
            {isAvatarConfig(profile?.avatar_config) && Object.keys(profile!.avatar_config as object).length > 0
              ? 'Avatar customizado salvo.'
              : 'Sem avatar customizado. Escolha cor, olhar e acessorio.'}
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
            <AvatarPicker config={avatarDraft} onChange={setAvatarDraft} />
            <Button type="button" onClick={handleSaveAvatar} disabled={isSubmitting} className="mt-3 w-full font-mono text-xs">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              salvar avatar
            </Button>
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
