import { FormEvent, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bird, Copy, Loader2, LogOut, Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const handlePasswordLogin = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    const ok = await auth.signInWithPassword(email, password)
    setIsSubmitting(false)
    if (ok) setMessage('Login realizado.')
  }

  const handlePasswordSignUp = async () => {
    setIsSubmitting(true)
    const ok = await auth.signUpWithPassword(email, password, nickname || email.split('@')[0] || 'Jogador')
    setIsSubmitting(false)
    if (ok) setMessage('Conta criada e login realizado.')
  }

  const handleNicknameSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    const ok = await auth.updateProfile({ nickname })
    setIsSubmitting(false)
    if (ok) setNickname('')
  }

  const handleCreateRoom = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    try {
      const room = await createRoom(form)
      setCreatedCode(room.code)
      navigate(`/sala/${room.code}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao criar sala')
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

  const gameModeEmoji = gameModeOptions.find((o) => o.value === form.gameMode)?.emoji ?? '🐤'

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40, #243447)' }}>
      <header className="border-b border-[#2A4060]/40" style={{ background: 'rgba(15,26,46,0.85)', backdropFilter: 'blur(8px)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-300 hover:text-white font-mono text-xs">
            <ArrowLeft className="mr-2 h-4 w-4" /> voltar ao jogo
          </Button>
          <div className="text-right">
            <h1 className="text-xl font-black tracking-tight" style={{ fontFamily: 'var(--font-mono)', color: '#00B2A9' }}>
              bando
            </h1>
            <p className="text-xs text-slate-500 font-mono">salas de pitacos com amigos</p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-5 shadow-2xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl p-3" style={{ background: 'rgba(0,178,169,0.15)', color: '#00B2A9' }}>
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold font-mono">perfil</h2>
              <p className="text-sm text-slate-400">Login simples pra salvar progresso e jogar com amigos.</p>
            </div>
          </div>

          {auth.loading ? (
            <div className="flex items-center gap-2 text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
            </div>
          ) : auth.user ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#0F1A2E]/80 p-4">
                <p className="text-sm text-slate-400">logado como</p>
                <p className="font-semibold" style={{ color: '#00B2A9' }}>{auth.profile?.nickname || auth.user.email}</p>
                <p className="mt-1 text-xs text-slate-500 font-mono">{auth.user.email}</p>
              </div>

              <form onSubmit={handleNicknameSubmit} className="space-y-2">
                <label className="text-sm font-medium text-slate-300 font-mono" htmlFor="nickname">apelido</label>
                <input
                  id="nickname"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder={auth.profile?.nickname || 'Seu apelido'}
                  maxLength={20}
                  className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white outline-none focus:border-[#00B2A9]"
                />
                <Button type="submit" disabled={isSubmitting || nickname.trim().length < 2} className="w-full font-mono text-xs">
                  salvar apelido
                </Button>
              </form>

              <Button variant="outline" onClick={auth.signOut} className="w-full border-[#2A4060] bg-transparent text-slate-300 font-mono text-xs">
                <LogOut className="mr-2 h-4 w-4" /> sair
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-3">
              <label className="text-sm font-medium text-slate-300 font-mono" htmlFor="email">e-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@email.com"
                className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white outline-none focus:border-[#00B2A9]"
              />
              <label className="text-sm font-medium text-slate-300 font-mono" htmlFor="password">senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="minimo 6 caracteres"
                className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white outline-none focus:border-[#00B2A9]"
              />
              <label className="text-sm font-medium text-slate-300 font-mono" htmlFor="signup-nickname">apelido pra cadastro</label>
              <input
                id="signup-nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="Seu apelido"
                maxLength={20}
                className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white outline-none focus:border-[#00B2A9]"
              />
              <Button type="submit" disabled={isSubmitting || password.length < 6} className="w-full font-mono text-xs">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                entrar
              </Button>
              <Button type="button" onClick={handlePasswordSignUp} disabled={isSubmitting || password.length < 6 || !email.trim()} variant="outline" className="w-full border-[#2A4060] bg-transparent text-slate-300 font-mono text-xs">
                criar conta
              </Button>
            </form>
          )}

          {(auth.error || message) && (
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100 font-mono">
              {auth.error || message}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <form onSubmit={handleCreateRoom} className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-5 shadow-2xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl p-3" style={{ background: 'rgba(0,178,169,0.15)', color: '#00B2A9' }}>
                <Bird className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold font-mono">abrir bando</h2>
                <p className="text-sm text-slate-400">Todo mundo sugere, vota e o dono envia o palpite.</p>
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
                <span className="text-slate-300 font-mono text-xs">passaros</span>
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

            <div className="mt-4 rounded-xl bg-[#0F1A2E]/80 p-4 text-sm text-slate-300 font-mono">
              {gameModeEmoji} modo de jogo: <strong style={{ color: '#00B2A9' }}>{form.gameMode}</strong> &middot; os amigos sugerem palavras de 5 letras, votam na melhor e o dono envia pro tabuleiro.
            </div>

            <Button type="submit" disabled={!auth.user || isSubmitting} className="mt-5 w-full font-mono text-xs">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              abrir bando
            </Button>
          </form>

          <form onSubmit={handleJoinRoom} className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-5 shadow-2xl">
            <h2 className="mb-3 text-lg font-semibold font-mono">entrar com codigo</h2>
            <div className="flex gap-2">
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="K7X9Q"
                maxLength={8}
                className="min-w-0 flex-1 rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white outline-none focus:border-[#00B2A9]"
              />
              <Button type="submit" disabled={!auth.user || isSubmitting} className="font-mono text-xs">entrar</Button>
            </div>
          </form>

          {createdCode && (
            <div className="rounded-2xl border border-[#00B2A9]/30 p-5 text-emerald-50" style={{ background: 'rgba(0,178,169,0.08)' }}>
              <p className="text-sm font-mono text-slate-400">bando criado</p>
              <p className="text-3xl font-black tracking-[0.3em] font-mono" style={{ color: '#00B2A9' }}>{createdCode}</p>
              <Button onClick={handleCopyInvite} className="mt-3 text-sm font-mono" style={{ background: '#00B2A9', color: '#0F1A2E' }}>
                <Copy className="mr-2 h-4 w-4" /> copiar convite
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
