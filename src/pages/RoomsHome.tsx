import { FormEvent, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Brain, Copy, Loader2, LogOut, Sparkles, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GameMode } from '@/game/types'
import { CreateRoomInput, RoomMode, ThemeId } from '@/lib/multiplayer-types'
import { createRoom, getRoomInviteUrl, joinRoom } from '@/lib/rooms'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

const roomModeOptions: { value: RoomMode; label: string; description: string }[] = [
  { value: 'multi_brain', label: 'Multi Brain', description: 'Todo mundo sugere e vota na melhor palavra.' },
  { value: 'multi_task', label: 'Multi Task', description: 'Sala livre para combinar regras e tarefas entre amigos.' },
  { value: 'mega_brain', label: 'Mega Brain', description: 'Rodadas, placar e desafio cooperativo mais longo.' },
  { value: 'theme_team', label: 'Tema em equipe', description: 'Jogo cooperativo com tema escolhido.' },
  { value: 'daily_team', label: 'Diario em equipe', description: 'A palavra do dia jogada junto com amigos.' },
]

const gameModeOptions: { value: GameMode; label: string }[] = [
  { value: 'termo', label: 'Termo' },
  { value: 'dueto', label: 'Dueto' },
  { value: 'quarteto', label: 'Quarteto' },
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-300 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao jogo
          </Button>
          <div className="text-right">
            <h1 className="text-xl font-bold tracking-wide">Salas com amigos</h1>
            <p className="text-xs text-slate-400">Multi Brain, Multi Task e Mega Brain</p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/20 p-3 text-violet-200">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Sua conta</h2>
              <p className="text-sm text-slate-400">Login simples para salvar perfil e entrar nas salas.</p>
            </div>
          </div>

          {auth.loading ? (
            <div className="flex items-center gap-2 text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
            </div>
          ) : auth.user ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Logado como</p>
                <p className="font-semibold">{auth.profile?.nickname || auth.user.email}</p>
                <p className="mt-1 text-xs text-slate-500">{auth.user.email}</p>
              </div>

              <form onSubmit={handleNicknameSubmit} className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="nickname">Nickname</label>
                <input
                  id="nickname"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder={auth.profile?.nickname || 'Seu apelido'}
                  maxLength={20}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-violet-400"
                />
                <Button type="submit" disabled={isSubmitting || nickname.trim().length < 2} className="w-full">
                  Salvar nickname
                </Button>
              </form>

              <Button variant="outline" onClick={auth.signOut} className="w-full border-slate-700 bg-transparent text-slate-200">
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-3">
              <label className="text-sm font-medium text-slate-300" htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@email.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-violet-400"
              />
              <label className="text-sm font-medium text-slate-300" htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="minimo 6 caracteres"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-violet-400"
              />
              <label className="text-sm font-medium text-slate-300" htmlFor="signup-nickname">Nickname para cadastro</label>
              <input
                id="signup-nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="Seu apelido"
                maxLength={20}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-violet-400"
              />
              <Button type="submit" disabled={isSubmitting || password.length < 6} className="w-full">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Entrar
              </Button>
              <Button type="button" onClick={handlePasswordSignUp} disabled={isSubmitting || password.length < 6 || !email.trim()} variant="outline" className="w-full border-slate-700 bg-transparent text-slate-200">
                Criar conta
              </Button>
            </form>
          )}

          {(auth.error || message) && (
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
              {auth.error || message}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <form onSubmit={handleCreateRoom} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/20 p-3 text-cyan-200">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Criar sala</h2>
                <p className="text-sm text-slate-400">Configure as regras e compartilhe o codigo com seus amigos.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="text-slate-300">Modo da sala</span>
                <select
                  value={form.roomMode}
                  onChange={(event) => setForm((prev) => ({ ...prev, roomMode: event.target.value as RoomMode }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  {roomModeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-slate-300">Tabuleiro</span>
                <select
                  value={form.gameMode}
                  onChange={(event) => setForm((prev) => ({ ...prev, gameMode: event.target.value as GameMode }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  {gameModeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-slate-300">Tema</span>
                <select
                  value={form.theme}
                  onChange={(event) => setForm((prev) => ({ ...prev, theme: event.target.value as ThemeId }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  {themeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-slate-300">Jogadores</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.maxPlayers}
                  onChange={(event) => setForm((prev) => ({ ...prev, maxPlayers: Number(event.target.value) }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-slate-300">Rodadas</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.totalRounds}
                  onChange={(event) => setForm((prev) => ({ ...prev, totalRounds: Number(event.target.value) }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
            </div>

            <div className="mt-4 rounded-xl bg-slate-950/60 p-4 text-sm text-slate-300">
              {roomModeOptions.find((option) => option.value === form.roomMode)?.description}
            </div>

            <Button type="submit" disabled={!auth.user || isSubmitting} className="mt-5 w-full">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Criar sala
            </Button>
          </form>

          <form onSubmit={handleJoinRoom} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl">
            <h2 className="mb-3 text-lg font-semibold">Entrar com codigo</h2>
            <div className="flex gap-2">
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="K7X9Q"
                maxLength={8}
                className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-violet-400"
              />
              <Button type="submit" disabled={!auth.user || isSubmitting}>Entrar</Button>
            </div>
          </form>

          {createdCode && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-50">
              <p className="text-sm">Sala criada</p>
              <p className="text-3xl font-black tracking-widest">{createdCode}</p>
              <Button onClick={handleCopyInvite} className="mt-3 bg-emerald-500 text-emerald-950 hover:bg-emerald-400">
                <Copy className="mr-2 h-4 w-4" /> Copiar convite
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
