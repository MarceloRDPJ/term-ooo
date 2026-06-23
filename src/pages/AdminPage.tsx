import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Ban,
  Bird,
  DoorClosed,
  Loader2,
  Shield,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Users as UsersIcon,
  Hash,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import {
  type AdminRoom,
  type AdminUser,
  type UserRole,
  adminBanUser,
  adminCloseRoom,
  adminDeleteRoom,
  canCloseRoom,
  isUserAdmin,
  listAdminRooms,
  listAdminUsers,
} from '@/lib/admin'
import type { Profile } from '@/lib/multiplayer-types'

type Tab = 'users' | 'rooms'

type ProfileWithRole = Profile & { role?: UserRole | null }

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'auditor',
  admin: 'chefe',
  banned: 'banido',
}

const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  user: 'border-slate-500/30 bg-slate-500/10 text-slate-200',
  admin: 'border-[#00B2A9]/40 bg-[#00B2A9]/15 text-[#5BE0D8]',
  banned: 'border-[#E25F38]/40 bg-[#E25F38]/15 text-[#F1A28A]',
}

const STATUS_LABELS: Record<AdminRoom['status'], string> = {
  lobby: 'lobby',
  playing: 'em jogo',
  finished: 'finalizada',
  abandoned: 'abandonada',
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatId(value: string): string {
  if (!value) return '-'
  if (value.length <= 12) return value
  return `${value.slice(0, 8)}...${value.slice(-4)}`
}

export function AdminPage() {
  const navigate = useNavigate()
  const auth = useSupabaseAuth()
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [rooms, setRooms] = useState<AdminRoom[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [roomsError, setRoomsError] = useState<string | null>(null)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null)

  const profile = auth.profile as ProfileWithRole | null
  const currentRole = profile?.role ?? null
  const isAdmin = isUserAdmin(currentRole)

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    setUsersError(null)
    try {
      const data = await listAdminUsers()
      setUsers(data)
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : 'Erro ao listar usuarios')
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  const loadRooms = useCallback(async () => {
    setLoadingRooms(true)
    setRoomsError(null)
    try {
      const data = await listAdminRooms()
      setRooms(data)
    } catch (error) {
      setRoomsError(error instanceof Error ? error.message : 'Erro ao listar salas')
    } finally {
      setLoadingRooms(false)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    if (tab === 'users') void loadUsers()
    if (tab === 'rooms') void loadRooms()
  }, [isAdmin, tab, loadUsers, loadRooms])

  const handleBan = useCallback(
    async (user: AdminUser) => {
      const ok = window.confirm(
        `Banir o usuario "${user.nickname || user.email}"? Ele nao podera mais criar pautas nem mandar mensagens.`,
      )
      if (!ok) return
      setPendingUserId(user.id)
      try {
        await adminBanUser(user.id)
        await loadUsers()
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Erro ao banir usuario')
      } finally {
        setPendingUserId(null)
      }
    },
    [loadUsers],
  )

  const handleCloseRoom = useCallback(
    async (room: AdminRoom) => {
      const ok = window.confirm(
        `Fechar a pauta ${room.code}? O status passa a "abandonada" e nenhum jogador podera mais enviar pitaco.`,
      )
      if (!ok) return
      setPendingRoomId(room.id)
      try {
        await adminCloseRoom(room.id)
        await loadRooms()
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Erro ao fechar pauta')
      } finally {
        setPendingRoomId(null)
      }
    },
    [loadRooms],
  )

  const handleDeleteRoom = useCallback(
    async (room: AdminRoom) => {
      const ok = window.confirm(
        `Excluir a sala ${room.code}? Todos os jogadores, mensagens e pitacos serao removidos de verdade.`,
      )
      if (!ok) return
      setPendingRoomId(room.id)
      try {
        await adminDeleteRoom(room.id)
        await loadRooms()
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Erro ao excluir sala')
      } finally {
        setPendingRoomId(null)
      }
    },
    [loadRooms],
  )

  const userCount = useMemo(() => users.length, [users])
  const roomCount = useMemo(() => rooms.length, [rooms])

  if (auth.loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-white"
        style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40, #243447)' }}
      >
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> carregando...
      </div>
    )
  }

  if (!auth.user) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center text-white"
        style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40, #243447)' }}
      >
        <ShieldOff className="h-10 w-10 text-[#E25F38]" />
        <h1 className="text-2xl font-bold font-mono">acesso restrito</h1>
        <p className="max-w-md text-slate-300 font-mono text-sm">
          Entre com sua conta para acessar o painel do chefe.
        </p>
        <Button onClick={() => navigate('/salas')} className="font-mono text-xs">
          <ArrowLeft className="mr-2 h-4 w-4" /> ir para o login
        </Button>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center text-white"
        style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40, #243447)' }}
      >
        <ShieldOff className="h-10 w-10 text-[#E25F38]" />
        <h1 className="text-2xl font-bold font-mono">acesso restrito</h1>
        <p className="max-w-md text-slate-300 font-mono text-sm">
          Esta area e so para chefes. Se voce acha que deveria ter acesso, fale com o time.
        </p>
        <Button onClick={() => navigate('/salas')} className="font-mono text-xs">
          <ArrowLeft className="mr-2 h-4 w-4" /> voltar para as pautas
        </Button>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40, #243447)' }}
    >
      <header
        className="border-b border-[#2A4060]/40"
        style={{ background: 'rgba(15,26,46,0.85)', backdropFilter: 'blur(8px)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/salas')}
            className="text-slate-300 hover:text-white font-mono text-xs"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> voltar
          </Button>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <ShieldCheck className="h-5 w-5" style={{ color: '#00B2A9' }} />
              <h1
                className="text-2xl font-black tracking-tight"
                style={{ fontFamily: 'var(--font-mono)', color: '#00B2A9' }}
              >
                CHEFE
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              gerencie usuarios e pautas. {auth.user.email}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div
                className="rounded-xl p-2"
                style={{ background: 'rgba(0,178,169,0.15)', color: '#00B2A9' }}
              >
                <UsersIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-mono">usuarios</p>
                <p className="text-2xl font-black font-mono" style={{ color: '#00B2A9' }}>
                  {userCount}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div
                className="rounded-xl p-2"
                style={{ background: 'rgba(0,178,169,0.15)', color: '#00B2A9' }}
              >
                <Hash className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-mono">salas</p>
                <p className="text-2xl font-black font-mono" style={{ color: '#00B2A9' }}>
                  {roomCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 inline-flex rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-1 shadow-2xl">
          <button
            type="button"
            onClick={() => setTab('users')}
            className="flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs transition-colors"
            style={{
              background: tab === 'users' ? 'rgba(0,178,169,0.15)' : 'transparent',
              color: tab === 'users' ? '#00B2A9' : '#94a3b8',
            }}
            aria-pressed={tab === 'users'}
          >
            <UsersIcon className="h-4 w-4" /> usuarios
          </button>
          <button
            type="button"
            onClick={() => setTab('rooms')}
            className="flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs transition-colors"
            style={{
              background: tab === 'rooms' ? 'rgba(0,178,169,0.15)' : 'transparent',
              color: tab === 'rooms' ? '#00B2A9' : '#94a3b8',
            }}
            aria-pressed={tab === 'rooms'}
          >
            <Hash className="h-4 w-4" /> salas
          </button>
        </div>

        {tab === 'users' ? (
          <section className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="rounded-xl p-2"
                  style={{ background: 'rgba(0,178,169,0.15)', color: '#00B2A9' }}
                >
                  <Bird className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold font-mono">usuarios</h2>
                  <p className="text-xs text-slate-400 font-mono">ate 100 contas mais recentes.</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void loadUsers()}
                disabled={loadingUsers}
                className="border-[#2A4060] bg-transparent text-slate-200 font-mono text-xs"
                aria-label="Atualizar lista de usuarios"
              >
                {loadingUsers ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                atualizar
              </Button>
            </div>

            {usersError && (
              <div className="mb-3 rounded-lg border border-[#E25F38]/40 bg-[#E25F38]/10 p-3 text-sm text-[#F1A28A] font-mono">
                {usersError}
              </div>
            )}

            {loadingUsers ? (
              <div className="flex items-center justify-center gap-2 py-12 text-slate-300 font-mono text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> carregando usuarios...
              </div>
            ) : users.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#2A4060]/60 p-8 text-center text-slate-400 font-mono text-sm">
                Nenhum usuario encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] font-mono text-xs text-slate-200">
                  <thead>
                    <tr className="border-b border-[#2A4060]/40 text-left text-slate-400">
                      <th className="px-3 py-2 font-medium">id</th>
                      <th className="px-3 py-2 font-medium">email</th>
                      <th className="px-3 py-2 font-medium">apelido</th>
                      <th className="px-3 py-2 font-medium">cargo</th>
                      <th className="px-3 py-2 font-medium">criado em</th>
                      <th className="px-3 py-2 font-medium text-right">acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-[#2A4060]/20 last:border-b-0 hover:bg-[#0F1A2E]/40"
                      >
                        <td className="px-3 py-2 text-slate-400" title={user.id}>
                          {formatId(user.id)}
                        </td>
                        <td className="px-3 py-2 text-slate-100">{user.email || '-'}</td>
                        <td className="px-3 py-2 text-slate-100">{user.nickname}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${ROLE_BADGE_CLASS[user.role]}`}
                          >
                            {user.role === 'admin' ? (
                              <Shield className="h-3 w-3" />
                            ) : user.role === 'banned' ? (
                              <Ban className="h-3 w-3" />
                            ) : null}
                            {ROLE_LABELS[user.role]}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-300">{formatDate(user.created_at)}</td>
                        <td className="px-3 py-2 text-right">
                          {user.role !== 'banned' ? (
                            <button
                              type="button"
                              onClick={() => void handleBan(user)}
                              disabled={pendingUserId === user.id || user.id === auth.user?.id}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#E25F38]/40 bg-[#E25F38]/10 px-2.5 py-1 text-[11px] font-mono text-[#F1A28A] transition-colors hover:bg-[#E25F38]/20 disabled:opacity-50"
                              aria-label={`Banir ${user.nickname}`}
                            >
                              {pendingUserId === user.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Ban className="h-3 w-3" />
                              )}
                              banir
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500">ja banido</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="rounded-xl p-2"
                  style={{ background: 'rgba(0,178,169,0.15)', color: '#00B2A9' }}
                >
                  <Hash className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold font-mono">salas</h2>
                  <p className="text-xs text-slate-400 font-mono">ate 100 pautas mais recentes.</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void loadRooms()}
                disabled={loadingRooms}
                className="border-[#2A4060] bg-transparent text-slate-200 font-mono text-xs"
                aria-label="Atualizar lista de salas"
              >
                {loadingRooms ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                atualizar
              </Button>
            </div>

            {roomsError && (
              <div className="mb-3 rounded-lg border border-[#E25F38]/40 bg-[#E25F38]/10 p-3 text-sm text-[#F1A28A] font-mono">
                {roomsError}
              </div>
            )}

            {loadingRooms ? (
              <div className="flex items-center justify-center gap-2 py-12 text-slate-300 font-mono text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> carregando salas...
              </div>
            ) : rooms.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#2A4060]/60 p-8 text-center text-slate-400 font-mono text-sm">
                Nenhuma sala encontrada.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] font-mono text-xs text-slate-200">
                  <thead>
                    <tr className="border-b border-[#2A4060]/40 text-left text-slate-400">
                      <th className="px-3 py-2 font-medium">codigo</th>
                      <th className="px-3 py-2 font-medium">status</th>
                      <th className="px-3 py-2 font-medium">modo</th>
                      <th className="px-3 py-2 font-medium">tema</th>
                      <th className="px-3 py-2 font-medium">dono</th>
                      <th className="px-3 py-2 font-medium text-right">jogadores</th>
                      <th className="px-3 py-2 font-medium">criada em</th>
                      <th className="px-3 py-2 font-medium text-right">acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr
                        key={room.id}
                        className="border-b border-[#2A4060]/20 last:border-b-0 hover:bg-[#0F1A2E]/40"
                      >
                        <td className="px-3 py-2">
                          <span
                            className="font-black tracking-[0.25em]"
                            style={{ color: '#00B2A9' }}
                          >
                            {room.code}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-200">{STATUS_LABELS[room.status]}</td>
                        <td className="px-3 py-2 text-slate-200">{room.game_mode}</td>
                        <td className="px-3 py-2 text-slate-200">{room.theme}</td>
                        <td className="px-3 py-2 text-slate-300" title={room.owner_id}>
                          {room.owner_nickname || formatId(room.owner_id)}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-200">
                          {room.player_count}/{room.max_players}
                        </td>
                        <td className="px-3 py-2 text-slate-300">{formatDate(room.created_at)}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {canCloseRoom(room.status) && (
                              <button
                                type="button"
                                onClick={() => void handleCloseRoom(room)}
                                disabled={pendingRoomId === room.id}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#00B2A9]/40 bg-[#00B2A9]/10 px-2.5 py-1 text-[11px] font-mono text-[#5BE0D8] transition-colors hover:bg-[#00B2A9]/20 disabled:opacity-50"
                                aria-label={`Fechar pauta ${room.code}`}
                              >
                                {pendingRoomId === room.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <DoorClosed className="h-3 w-3" />
                                )}
                                fechar
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => void handleDeleteRoom(room)}
                              disabled={pendingRoomId === room.id}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#E25F38]/40 bg-[#E25F38]/10 px-2.5 py-1 text-[11px] font-mono text-[#F1A28A] transition-colors hover:bg-[#E25F38]/20 disabled:opacity-50"
                              aria-label={`Excluir sala ${room.code}`}
                            >
                              {pendingRoomId === room.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                              excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
