import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bird, Copy, Hash, Loader2, LogIn, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthPanel } from '@/components/AuthPanel'
import { CrachaPanel } from '@/components/CrachaPanel'
import { PautasRecentesList } from '@/components/PautasRecentesList'
import { AvatarConfig } from '@/components/AvatarDisplay'
import { GameMode } from '@/game/types'
import { CreateRoomInput, ThemeId } from '@/lib/multiplayer-types'
import { createRoom, getRoomInviteUrl, joinRoom } from '@/lib/rooms'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

const gameModeOptions: { value: GameMode; label: string; emoji: string }[] = [
  { value: 'termo', label: '1 Palavra', emoji: '🐤' },
  { value: 'dueto', label: '2 Palavras', emoji: '🐤🐤' },
  { value: 'quarteto', label: '4 Palavras', emoji: '🐤🐤🐤🐤' },
]

const themeOptions: { value: ThemeId; label: string }[] = [
  { value: 'classic', label: 'Classico' },
  { value: 'frutas', label: 'Frutas' },
  { value: 'objetos', label: 'Objetos' },
  { value: 'filmes', label: 'Filmes' },
  { value: 'series', label: 'Series' },
  { value: 'animes', label: 'Animes' },
]

export function RoomsHome() {
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useSupabaseAuth()
  const [joinCode, setJoinCode] = useState('')
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recentsKey, setRecentsKey] = useState(0)
  const [form, setForm] = useState<CreateRoomInput>(() => ({
    roomMode: location.pathname.includes('mega') ? 'mega_brain' : 'multi_brain',
    gameMode: 'termo',
    theme: 'classic',
    maxPlayers: 8,
    totalRounds: location.pathname.includes('mega') ? 5 : 1,
    settings: {
      autoSubmitMajorityVote: true,
      allowOwnerSubmit: true,
      turnTimerSeconds: null,
    },
  }))

  const inviteUrl = useMemo(() => createdCode ? getRoomInviteUrl(createdCode) : '', [createdCode])

  useEffect(() => {
    if (!auth.user) {
      setCreatedCode(null)
      setJoinCode('')
    }
  }, [auth.user])

  const handleSaveNickname = async (nickname: string) => auth.updateProfile({ nickname })
  const handleSaveAvatar = async (config: AvatarConfig) =>
    auth.updateProfile({ avatar_config: config as unknown as Record<string, unknown> })

  const handleCreateRoom = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    try {
      const room = await createRoom(form)
      setCreatedCode(room.code)
      setRecentsKey((prev) => prev + 1)
      navigate(`/sala/${room.code}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao abrir pauta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJoinRoom = async (event: FormEvent) => {
    event.preventDefault()
    const code = joinCode.trim().toUpperCase()
    if (!code) return

    setIsSubmitting(true)
    setMessage(null)
    try {
      const room = await joinRoom(code)
      setRecentsKey((prev) => prev + 1)
      navigate(`/sala/${room.code}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao entrar na sala')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyInvite = async () => {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setMessage('Convite copiado.')
  }

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setMessage('Codigo copiado.')
  }

  const gameModeEmoji = gameModeOptions.find((o) => o.value === form.gameMode)?.emoji ?? '🐤'

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40, #243447)' }}>
      <header className="border-b border-[#2A4060]/40" style={{ background: 'rgba(15,26,46,0.85)', backdropFilter: 'blur(8px)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-300 hover:text-white font-mono text-xs">
            <ArrowLeft className="mr-2 h-4 w-4" /> voltar ao jogo
          </Button>
          <div className="text-right">
            <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-mono)', color: '#00B2A9' }}>
              PAUTAS
            </h1>
            <p className="text-xs text-slate-400 font-mono">abra uma pauta, chame o time e homologue o melhor pitaco.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-4">
            {auth.user ? (
              <CrachaPanel
                profile={auth.profile}
                email={auth.user.email ?? null}
                isSubmitting={isSubmitting}
                onSubmittingChange={setIsSubmitting}
                onSaveNickname={handleSaveNickname}
                onSaveAvatar={handleSaveAvatar}
                onSignOut={auth.signOut}
                onMessage={setMessage}
              />
            ) : (
              <div className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-5 shadow-2xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl p-3" style={{ background: 'rgba(0,178,169,0.15)', color: '#00B2A9' }}>
                    <Bird className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold font-mono">cracha</h2>
                    <p className="text-sm text-slate-400">Entre no escritorio pra abrir pauta e dar pitacos.</p>
                  </div>
                </div>
                <AuthPanel
                  auth={auth}
                  isSubmitting={isSubmitting}
                  onSubmittingChange={setIsSubmitting}
                  onMessage={setMessage}
                />
              </div>
            )}

            {(auth.error || message) && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100 font-mono">
                {auth.error || message}
              </div>
            )}
          </aside>

          <section className="space-y-6">
            <form onSubmit={handleCreateRoom} className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-5 shadow-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl p-3" style={{ background: 'rgba(0,178,169,0.15)', color: '#00B2A9' }}>
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold font-mono">abrir pauta</h2>
                  <p className="text-sm text-slate-400">Monte a pauta, chame o time e comece a dar pitacos.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="text-slate-300 font-mono text-xs">tabuleiro</span>
                  <select
                    value={form.gameMode}
                    onChange={(event) => setForm((prev) => ({ ...prev, gameMode: event.target.value as GameMode }))}
                    className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white"
                  >
                    {gameModeOptions.map((option) => <option key={option.value} value={option.value}>{option.emoji} {option.label}</option>)}
                  </select>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="text-slate-300 font-mono text-xs">tema</span>
                  <select
                    value={form.theme}
                    onChange={(event) => setForm((prev) => ({ ...prev, theme: event.target.value as ThemeId }))}
                    className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white"
                  >
                    {themeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="text-slate-300 font-mono text-xs">participantes</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={form.maxPlayers}
                    onChange={(event) => setForm((prev) => ({ ...prev, maxPlayers: Number(event.target.value) }))}
                    className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white"
                  />
                </label>

                <label className="space-y-2 text-sm">
                  <span className="text-slate-300 font-mono text-xs">rodadas</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={form.totalRounds}
                    onChange={(event) => setForm((prev) => ({ ...prev, totalRounds: Number(event.target.value) }))}
                    className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white"
                  />
                </label>
              </div>

              <div className="mt-4 rounded-xl border border-[#2A4060]/40 bg-[#0F1A2E]/80 p-4 text-sm text-slate-300 font-mono">
                {gameModeEmoji} modo: <strong style={{ color: '#00B2A9' }}>{form.gameMode}</strong> &middot; todos dao pitacos de 5 letras, votam na melhor e o dono envia pro tabuleiro.
              </div>

              <Button type="submit" disabled={!auth.user || isSubmitting} className="mt-5 w-full font-mono text-xs">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                abrir pauta
              </Button>
            </form>

            <form onSubmit={handleJoinRoom} className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-5 shadow-2xl">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-xl p-3" style={{ background: 'rgba(227,194,117,0.15)', color: '#E3C275' }}>
                  <Hash className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold font-mono">entrar com codigo</h2>
                  <p className="text-sm text-slate-400">Recebeu um codigo? Cola aqui e entra na reuniao.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                  placeholder="K7X9Q"
                  maxLength={8}
                  className="min-w-0 flex-1 rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white outline-none focus:border-[#00B2A9]"
                />
                <Button type="submit" disabled={!auth.user || isSubmitting} className="font-mono text-xs">
                  <LogIn className="mr-2 h-4 w-4" /> entrar
                </Button>
              </div>
            </form>

            <div className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-5 shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl p-3" style={{ background: 'rgba(0,178,169,0.15)', color: '#00B2A9' }}>
                  <Hash className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold font-mono">pautas recentes</h2>
                  <p className="text-sm text-slate-400">Suas ultimas pautas abertas ou que voce esta no time.</p>
                </div>
              </div>
              <PautasRecentesList
                userId={auth.user?.id ?? null}
                refreshKey={recentsKey}
                onAfterClose={() => setRecentsKey((prev) => prev + 1)}
              />
            </div>

            {createdCode && (
              <div className="rounded-2xl border border-[#00B2A9]/30 p-5 text-emerald-50" style={{ background: 'rgba(0,178,169,0.08)' }}>
                <p className="text-sm font-mono text-slate-400">pauta aberta</p>
                <p className="text-3xl font-black tracking-[0.3em] font-mono" style={{ color: '#00B2A9' }}>{createdCode}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={handleCopyInvite} className="text-sm font-mono" style={{ background: '#00B2A9', color: '#0F1A2E' }}>
                    <Copy className="mr-2 h-4 w-4" /> copiar convite
                  </Button>
                  <Button variant="outline" onClick={() => void handleCopyCode(createdCode)} className="border-[#2A4060] bg-transparent text-slate-200 text-sm font-mono">
                    <Copy className="mr-2 h-4 w-4" /> copiar codigo
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
