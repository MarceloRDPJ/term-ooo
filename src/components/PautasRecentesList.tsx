// src/components/PautasRecentesList.tsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, DoorClosed, History, Loader2, LogIn } from 'lucide-react'
import { Button } from './ui/button'
import { listMyRooms, ownerCloseRoom } from '@/lib/rooms'
import { RoomSummary } from '@/lib/multiplayer-types'

interface PautasRecentesListProps {
  userId: string | null
  refreshKey?: number
  onAfterClose?: () => void
}

const STATUS_LABEL: Record<RoomSummary['status'], string> = {
  lobby: 'aguardando',
  playing: 'em jogo',
  finished: 'encerrada',
  abandoned: 'abandonada',
}

const STATUS_COLOR: Record<RoomSummary['status'], string> = {
  lobby: '#00B2A9',
  playing: '#E3C275',
  finished: '#94A3B8',
  abandoned: '#E25F38',
}

const MODE_LABEL: Record<RoomSummary['game_mode'], string> = {
  termo: '1 palavra',
  dueto: '2 palavras',
  quarteto: '4 palavras',
}

const ROLE_LABEL: Record<RoomSummary['role'], string> = {
  owner: 'dono',
  moderator: 'mod',
  player: 'auditor',
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `ha ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `ha ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `ha ${days} d`
  return new Date(iso).toLocaleDateString('pt-BR')
}

function canShowCloseButton(room: RoomSummary): boolean {
  return room.role === 'owner' && (room.status === 'lobby' || room.status === 'playing')
}

export function PautasRecentesList({ userId, refreshKey = 0, onAfterClose }: PautasRecentesListProps) {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<RoomSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setRooms([])
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    listMyRooms(userId)
      .then((list) => {
        if (cancelled) return
        setRooms(list)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Erro ao listar pautas')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId, refreshKey])

  const handleCloseRoom = async (room: RoomSummary) => {
    const ok = window.confirm(
      `Fechar a pauta ${room.code}? O status passa para 'abandonada' e nenhum jogador podera mais enviar pitaco.`,
    )
    if (!ok) return
    setPendingRoomId(room.id)
    try {
      await ownerCloseRoom(room.id)
      onAfterClose?.()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Erro ao fechar pauta')
    } finally {
      setPendingRoomId(null)
    }
  }

  if (!userId) return null

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-4 text-sm text-slate-300 font-mono">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando pautas...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#E25F38]/30 bg-[#E25F38]/10 p-4 text-sm text-amber-100 font-mono">
        {error}
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#2A4060] bg-[#0F1A2E]/60 p-5 text-center text-sm text-slate-400 font-mono">
        <History className="mx-auto mb-2 h-5 w-5" style={{ color: '#00B2A9' }} />
        Voce ainda nao abriu nenhuma pauta. Convoca o time e comeca a reuniao.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {rooms.map((room) => {
        const statusColor = STATUS_COLOR[room.status]
        const isPending = pendingRoomId === room.id
        const showClose = canShowCloseButton(room)
        return (
          <div
            key={room.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-[#2A4060]/40 bg-[#0F1A2E]/60 p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-lg font-black tracking-[0.25em]"
                  style={{ color: '#00B2A9' }}
                >
                  {room.code}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold uppercase"
                  style={{ background: `${statusColor}22`, color: statusColor }}
                >
                  {STATUS_LABEL[room.status]}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400 font-mono">
                {MODE_LABEL[room.game_mode]} &middot; rodada {room.current_round}/{room.total_rounds} &middot; {room.player_count}/{room.max_players} no time &middot; voce e {ROLE_LABEL[room.role]} &middot; {formatRelative(room.created_at)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void navigator.clipboard.writeText(room.code).catch(() => {})}
                className="border-[#2A4060] bg-transparent font-mono text-xs text-slate-200"
              >
                <Copy className="mr-1 h-3.5 w-3.5" /> codigo
              </Button>
              {showClose && (
                <button
                  type="button"
                  onClick={() => void handleCloseRoom(room)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#00B2A9]/40 bg-[#00B2A9]/10 px-2.5 py-1 text-[11px] font-mono text-[#5BE0D8] transition-colors hover:bg-[#00B2A9]/20 disabled:opacity-50"
                  aria-label={`Fechar pauta ${room.code}`}
                >
                  {isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <DoorClosed className="h-3 w-3" />
                  )}
                  fechar
                </button>
              )}
              <Button
                type="button"
                size="sm"
                onClick={() => navigate(`/sala/${room.code}`)}
                className="font-mono text-xs"
              >
                <LogIn className="mr-1 h-3.5 w-3.5" /> entrar
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
