import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, Loader2, MessageCircle, Play, Send, ThumbsUp, Trophy, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GameLayout } from '@/components/GameLayout'
import { Keyboard } from '@/components/Keyboard'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { ChatMessage, GuessSuggestion, GuessVote, Room, RoomGameState, RoomPlayer } from '@/lib/multiplayer-types'
import {
  getRoomByCode,
  getRoomGameState,
  getRoomInviteUrl,
  getRoomMessages,
  getRoomPlayers,
  getSuggestions,
  getVotes,
  isSharedGameState,
  joinRoom,
  sendRoomMessage,
  startRoomGame,
  subscribeToRoom,
  suggestGuess,
  submitRoomGuess,
  voteSuggestion,
} from '@/lib/rooms'

export function RoomPage() {
  const { roomCode = '' } = useParams()
  const navigate = useNavigate()
  const auth = useSupabaseAuth()
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<RoomPlayer[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [gameState, setGameState] = useState<RoomGameState | null>(null)
  const [suggestions, setSuggestions] = useState<GuessSuggestion[]>([])
  const [votes, setVotes] = useState<GuessVote[]>([])
  const [chatText, setChatText] = useState('')
  const [guessText, setGuessText] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const normalizedCode = roomCode.trim().toUpperCase()
  const inviteUrl = useMemo(() => normalizedCode ? getRoomInviteUrl(normalizedCode) : '', [normalizedCode])
  const isOwner = auth.user?.id === room?.owner_id
  const sharedGameState = isSharedGameState(gameState?.game_state) ? gameState.game_state : null
  const voteCountBySuggestion = useMemo(() => {
    return votes.reduce<Record<string, number>>((acc, vote) => {
      acc[vote.suggestion_id] = (acc[vote.suggestion_id] || 0) + 1
      return acc
    }, {})
  }, [votes])

  const loadRoomData = useCallback(async (targetRoom: Room) => {
    const [nextPlayers, nextMessages, nextGameState, nextSuggestions, nextVotes] = await Promise.all([
      getRoomPlayers(targetRoom.id),
      getRoomMessages(targetRoom.id),
      getRoomGameState(targetRoom.id),
      getSuggestions(targetRoom.id),
      getVotes(targetRoom.id),
    ])

    setPlayers(nextPlayers)
    setMessages(nextMessages)
    setGameState(nextGameState)
    setSuggestions(nextSuggestions)
    setVotes(nextVotes)
  }, [])

  useEffect(() => {
    if (auth.loading) return

    let cancelled = false

    async function bootstrap() {
      if (!auth.user) {
        setLoading(false)
        return
      }

      setLoading(true)
      setStatus(null)

      try {
        let currentRoom = await getRoomByCode(normalizedCode)
        if (!currentRoom) throw new Error('Sala nao encontrada')

        currentRoom = await joinRoom(currentRoom.code)
        if (cancelled) return

        setRoom(currentRoom)
        await loadRoomData(currentRoom)
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error ? error.message : 'Erro ao carregar sala')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [auth.loading, auth.user, loadRoomData, normalizedCode])

  useEffect(() => {
    if (!room) return

    const channel = subscribeToRoom(room.id, () => {
      void loadRoomData(room)
    })

    return () => {
      void channel.unsubscribe()
    }
  }, [loadRoomData, room])

  const handleCopyInvite = async () => {
    await navigator.clipboard.writeText(inviteUrl)
    setStatus('Convite copiado.')
  }

  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault()
    if (!room || !chatText.trim()) return

    try {
      await sendRoomMessage(room.id, chatText, auth.profile?.nickname)
      setChatText('')
      await loadRoomData(room)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erro ao enviar mensagem')
    }
  }

  const handleSuggestGuess = async (event: FormEvent) => {
    event.preventDefault()
    if (!room || !guessText.trim()) return

    try {
      await suggestGuess(room.id, guessText)
      setGuessText('')
      await loadRoomData(room)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erro ao sugerir palavra')
    }
  }

  const handleStartGame = async () => {
    if (!room) return

    setStatus(null)
    try {
      await startRoomGame(room)
      const nextRoom = await getRoomByCode(room.code)
      if (nextRoom) setRoom(nextRoom)
      await loadRoomData(nextRoom || room)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erro ao iniciar partida')
    }
  }

  const handleSubmitSuggestion = async (suggestion: GuessSuggestion) => {
    if (!room || !gameState) return

    setStatus(null)
    try {
      await submitRoomGuess(room, gameState, suggestion.normalized_word, suggestion.id)
      const nextRoom = await getRoomByCode(room.code)
      if (nextRoom) setRoom(nextRoom)
      await loadRoomData(nextRoom || room)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erro ao enviar palpite')
    }
  }

  const handleVote = async (suggestionId: string) => {
    if (!room) return

    try {
      await voteSuggestion(room.id, suggestionId)
      await loadRoomData(room)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erro ao votar')
    }
  }

  if (auth.loading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando sala...
      </div>
    )
  }

  if (!auth.user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-center text-white">
        <h1 className="text-2xl font-bold">Entre para acessar a sala</h1>
        <p className="max-w-md text-slate-400">Use a tela de salas para fazer login por e-mail e volte pelo convite.</p>
        <Button onClick={() => navigate('/salas')}>Ir para login</Button>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-center text-white">
        <h1 className="text-2xl font-bold">Sala indisponivel</h1>
        <p className="max-w-md text-slate-400">{status || 'Nao foi possivel carregar essa sala.'}</p>
        <Button onClick={() => navigate('/salas')}>Criar outra sala</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/salas')} className="text-slate-300 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Salas
          </Button>
          <div className="text-right">
            <p className="text-xs text-slate-400">Codigo da sala</p>
            <button onClick={handleCopyInvite} className="text-2xl font-black tracking-[0.35em] text-cyan-200">
              {room.code}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 xl:grid-cols-[280px_1fr_360px]">
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Sala</h2>
              <Button size="sm" onClick={handleCopyInvite}>
                <Copy className="mr-2 h-4 w-4" /> Convite
              </Button>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Modo:</span> {room.room_mode}</p>
              <p><span className="text-slate-500">Tabuleiro:</span> {room.game_mode}</p>
              <p><span className="text-slate-500">Tema:</span> {room.theme}</p>
              <p><span className="text-slate-500">Status:</span> {room.status}</p>
              <p><span className="text-slate-500">Rodada:</span> {room.current_round}/{room.total_rounds}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-300" />
              <h2 className="font-semibold">Jogadores</h2>
            </div>
            <div className="space-y-2">
              {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between rounded-lg bg-slate-950/60 px-3 py-2 text-sm">
                  <span>{player.profiles?.nickname || 'Jogador'}</span>
                  <span className="text-xs text-slate-500">{player.role}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4">
            <h1 className="text-2xl font-black font-mono tracking-tight" style={{ color: '#00B2A9' }}>bando</h1>
            <p className="text-sm text-slate-400">Sugiram palavras, votem e deixem o dono enviar o palpite para o tabuleiro compartilhado.</p>
          </div>

          <div className="mb-5 rounded-xl bg-slate-950/60 p-4 text-sm text-slate-300">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-white">Estado da partida</p>
                <p>Versao: {gameState?.state_version ?? 0}</p>
                <p>Status: {sharedGameState?.isGameOver ? 'finalizada' : sharedGameState ? 'jogando' : room.status}</p>
              </div>
              {isOwner && !sharedGameState && room.status === 'lobby' && (
                <Button onClick={handleStartGame} className="bg-cyan-500 text-cyan-950 hover:bg-cyan-400">
                  <Play className="mr-2 h-4 w-4" /> Iniciar partida
                </Button>
              )}
            </div>
          </div>

          {sharedGameState ? (
            <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
              <GameLayout
                gameState={sharedGameState}
                highContrast={false}
                cursorPosition={-1}
                shouldShake={false}
                revealingRow={-1}
                lastTypedIndex={-1}
                happyRow={-1}
                happyBoards={[]}
              />
              <div className="mx-auto mt-4 max-w-2xl">
                <Keyboard
                  keyStates={sharedGameState.keyStates}
                  onKeyPress={() => {}}
                  highContrast={false}
                  disabled
                />
              </div>
              {sharedGameState.isGameOver && (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-emerald-100">
                  <Trophy className="mx-auto mb-2 h-6 w-6" />
                  {sharedGameState.isWin ? 'A sala venceu!' : 'Fim de jogo. Criem outra sala para tentar de novo.'}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-5 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center text-slate-400">
              {isOwner ? 'Inicie a partida quando seus amigos entrarem.' : 'Aguardando o dono iniciar a partida.'}
            </div>
          )}

          <form onSubmit={handleSuggestGuess} className="mb-5 flex gap-2">
            <input
              value={guessText}
              onChange={(event) => setGuessText(event.target.value.toLowerCase())}
              placeholder="sugerir palavra"
              maxLength={5}
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
            />
            <Button type="submit">Sugerir</Button>
          </form>

          <div className="grid gap-3 md:grid-cols-2">
            {suggestions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-5 text-center text-slate-400 md:col-span-2">
                Nenhuma sugestao ainda. Seja o primeiro brain da sala.
              </div>
            ) : suggestions.map((suggestion) => (
              <div key={suggestion.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black uppercase tracking-widest">{suggestion.normalized_word}</p>
                    <p className="text-xs text-slate-500">por {suggestion.profiles?.nickname || 'Jogador'}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" onClick={() => handleVote(suggestion.id)}>
                      <ThumbsUp className="mr-2 h-4 w-4" /> {voteCountBySuggestion[suggestion.id] || 0}
                    </Button>
                    {isOwner && sharedGameState && !sharedGameState.isGameOver && (
                      <Button size="sm" variant="outline" onClick={() => handleSubmitSuggestion(suggestion)} className="border-cyan-500/40 bg-transparent text-cyan-100 hover:bg-cyan-500/10">
                        Enviar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-violet-300" />
            <h2 className="font-semibold">Chat da sala</h2>
          </div>
          <div className="mb-3 h-[420px] space-y-2 overflow-y-auto rounded-xl bg-slate-950/60 p-3">
            {messages.map((message) => (
              <div key={message.id} className="rounded-lg bg-slate-900 px-3 py-2 text-sm">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{message.nickname || 'Sistema'}</span>
                  <span>{new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className={message.type === 'system' || message.type === 'join' ? 'text-cyan-200' : 'text-slate-100'}>{message.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              value={chatText}
              onChange={(event) => setChatText(event.target.value)}
              placeholder="mensagem"
              maxLength={1000}
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-violet-400"
            />
            <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
          </form>
          {status && <div className="mt-3 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-100">{status}</div>}
        </aside>
      </main>
    </div>
  )
}
