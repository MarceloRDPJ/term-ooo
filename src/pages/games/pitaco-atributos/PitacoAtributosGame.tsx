// src/pages/games/pitaco-atributos/PitacoAtributosGame.tsx
//
// Tela principal do PITACO Atributos. Inspirado em Poeltl (NBA):
// o jogador tenta adivinhar um auditor do escritorio PITACO puramente
// por seus atributos categoricos (cargo, equipe, senioridade, turno,
// cidade, hobby). Feedback colorido:
//
//   - verde  (#00B2A9): atributo exato
//   - amarelo(#E3C275): parcial (ex: senioridade proxima, equipe existente
//                                       em outro auditor do escritorio)
//   - vermelho(#E25F38): "longe" (ex: senioridade com diff >= 2)
//   - cinza  (#94A3B8): errado
//
// 8 tentativas, persistencia por dateKey, alvo do dia deterministico
// pelo dayNumber.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Search,
  Send,
  Sparkles,
  Tag,
  Target,
  Trophy,
  X,
} from 'lucide-react'
import { StarsBackground } from '@/components/animate-ui/components/backgrounds/stars'
import { APP_VERSION } from '@/lib/version'
import { getTodayDateKey, getDayNumber } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { findAuditorById, AUDITORES } from './auditors'
import {
  createInitialAtributosState,
  processAtributosGuess,
} from './engine'
import { loadAtributosState, saveAtributosState } from './storage'
import {
  ATRIBUTOS_CARGO_LABELS,
  ATRIBUTOS_CIDADE_LABELS,
  ATRIBUTOS_EQUIPE_LABELS,
  ATRIBUTOS_HOBBY_LABELS,
  ATRIBUTOS_SENIORIDADE_LABELS,
  ATRIBUTOS_TURNO_LABELS,
  type AtributosFeedback,
  type AtributosGuess,
  type AtributosState,
  type Auditor,
} from './types'

// ---------------------------------------------------------------------------
// Estilos de cor
// ---------------------------------------------------------------------------

type TileColor = 'green' | 'yellow' | 'red' | 'gray'

const TILE_STYLES: Record<TileColor, { bg: string; border: string; text: string }> = {
  green: {
    bg: 'bg-[#00B2A9]/85',
    border: 'border-[#00B2A9]',
    text: 'text-white',
  },
  yellow: {
    bg: 'bg-[#E3C275]/85',
    border: 'border-[#E3C275]',
    text: 'text-[#0F1A2E]',
  },
  red: {
    bg: 'bg-[#E25F38]/80',
    border: 'border-[#E25F38]',
    text: 'text-white',
  },
  gray: {
    bg: 'bg-[#94A3B8]/40',
    border: 'border-[#94A3B8]/50',
    text: 'text-slate-300',
  },
}

function cargoColor(f: AtributosFeedback['cargo']): TileColor {
  return f === 'correct' ? 'green' : 'gray'
}

function equipeColor(f: AtributosFeedback['equipe']): TileColor {
  if (f === 'correct') return 'green'
  if (f === 'partial') return 'yellow'
  return 'gray'
}

function senioridadeColor(f: AtributosFeedback['senioridade']): TileColor {
  if (f === 'correct') return 'green'
  if (f === 'near') return 'yellow'
  if (f === 'far') return 'red'
  return 'gray'
}

function turnoColor(f: AtributosFeedback['turno']): TileColor {
  return f === 'correct' ? 'green' : 'gray'
}

function cidadeColor(f: AtributosFeedback['cidade']): TileColor {
  return f === 'correct' ? 'green' : 'gray'
}

function hobbyColor(f: AtributosFeedback['hobby']): TileColor {
  return f === 'correct' ? 'green' : 'gray'
}

// ---------------------------------------------------------------------------
// Componentes auxiliares
// ---------------------------------------------------------------------------

function Tile({
  label,
  color,
  size = 'sm',
}: {
  label: React.ReactNode
  color: TileColor
  size?: 'sm' | 'md'
}) {
  const s = TILE_STYLES[color]
  const sizing =
    size === 'md'
      ? 'min-h-[44px] px-2 py-1.5 text-sm'
      : 'min-h-[36px] px-1.5 py-1 text-[10px] sm:text-xs'
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-md border font-mono font-semibold uppercase tracking-wide shadow-sm',
        s.bg,
        s.border,
        s.text,
        sizing,
      )}
    >
      {label}
    </div>
  )
}

function AuditorAutocomplete({
  value,
  onChange,
  onSubmit,
  disabled,
  history,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: (auditor: Auditor) => void
  disabled: boolean
  history: string[]
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const matches = useMemo(() => {
    const norm = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .toLowerCase()
      .trim()
    if (!norm) return []
    return AUDITORES.filter((a) => {
      if (history.includes(a.id)) return false
      const full = `${a.nome} ${a.apelido}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .toLowerCase()
      return full.includes(norm)
    }).slice(0, 6)
  }, [value, history])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-xl border border-[#2A4060] bg-[#0F1A2E]/80 px-3 py-2 shadow-lg focus-within:border-[#00B2A9]">
        <Search className="h-4 w-4 text-[#A78BFA]" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (matches.length > 0) {
                onSubmit(matches[0])
                onChange('')
                setOpen(false)
              } else if (value.trim()) {
                onSubmit({
                  id: 'raw',
                  nome: value.trim(),
                  apelido: value.trim(),
                  cargo: 'Estagiario',
                  equipe: 'Plataforma',
                  senioridade: 1,
                  turno: 'manha',
                  cidade: 'SP',
                  hobby: 'cafe',
                  emoji: '👤',
                })
              }
            }
          }}
          disabled={disabled}
          placeholder="Digite o nome ou apelido do auditor..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none font-mono"
          aria-label="Chutar auditor"
        />
        <button
          type="button"
          onClick={() => {
            if (matches.length > 0) {
              onSubmit(matches[0])
              onChange('')
              setOpen(false)
            }
          }}
          disabled={disabled || matches.length === 0}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#A78BFA] hover:text-white disabled:opacity-30"
          aria-label="Enviar chute"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {open && matches.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[#2A4060] bg-[#0F1A2E]/95 shadow-2xl backdrop-blur"
          >
            {matches.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSubmit(a)
                    onChange('')
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-slate-200 hover:bg-[#1A2C40] font-mono"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">
                      {a.emoji}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-bold text-white">
                        {a.nome}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-300">
                        {a.apelido} · {ATRIBUTOS_CARGO_LABELS[a.cargo]} ·{' '}
                        {ATRIBUTOS_EQUIPE_LABELS[a.equipe]}
                      </span>
                    </span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-300">
                    {ATRIBUTOS_CIDADE_LABELS[a.cidade]}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

function GuessRow({ guess, index }: { guess: AtributosGuess; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="grid grid-cols-[1.4fr_0.9fr_0.9fr_0.7fr_0.7fr_0.7fr_0.7fr] gap-1.5 sm:gap-2"
    >
      <div className="flex items-center gap-2 rounded-md border border-[#2A4060] bg-[#0F1A2E]/70 px-2 py-1.5 font-mono">
        <span className="text-lg" aria-hidden="true">
          {guess.auditorEmoji}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[11px] font-bold text-white sm:text-xs">
            {guess.auditorNome}
          </span>
          <span className="truncate text-[9px] uppercase tracking-wider text-slate-300 sm:text-[10px]">
            {guess.auditorApelido}
          </span>
        </div>
      </div>
      <Tile label={ATRIBUTOS_CARGO_LABELS[guess.auditorCargo]} color={cargoColor(guess.feedback.cargo)} />
      <Tile label={ATRIBUTOS_EQUIPE_LABELS[guess.auditorEquipe]} color={equipeColor(guess.feedback.equipe)} />
      <Tile label={ATRIBUTOS_SENIORIDADE_LABELS[guess.auditorSenioridade]} color={senioridadeColor(guess.feedback.senioridade)} />
      <Tile label={ATRIBUTOS_TURNO_LABELS[guess.auditorTurno]} color={turnoColor(guess.feedback.turno)} />
      <Tile label={guess.auditorCidade} color={cidadeColor(guess.feedback.cidade)} />
      <Tile label={ATRIBUTOS_HOBBY_LABELS[guess.auditorHobby]} color={hobbyColor(guess.feedback.hobby)} />
    </motion.div>
  )
}

function GameOverCard({
  state,
  onBack,
}: {
  state: AtributosState
  onBack: () => void
}) {
  const target = findAuditorById(state.targetId)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'rounded-2xl border-2 p-5 shadow-2xl sm:p-6',
        state.isWin
          ? 'border-[#00B2A9]/60 bg-[#00B2A9]/10'
          : 'border-[#E25F38]/60 bg-[#E25F38]/10',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {state.isWin ? (
            <Trophy className="h-7 w-7 text-[#5BE0D8]" />
          ) : (
            <X className="h-7 w-7 text-[#F1A28A]" />
          )}
          <div>
            <h2 className="font-mono text-lg font-black text-white sm:text-xl">
              {state.isWin ? 'AUDITOR IDENTIFICADO!' : 'FICOU PRA PROXIMA'}
            </h2>
            <p className="font-mono text-xs text-slate-300 sm:text-sm">
              {state.isWin
                ? `Voce achou em ${state.currentRow}/${state.maxAttempts} tentativas.`
                : 'Amanha tem mais um(a) auditor(a) misterioso(a).'}
            </p>
          </div>
        </div>
      </div>

      {target && (
        <div className="mt-4 rounded-xl border border-[#2A4060] bg-[#0F1A2E]/70 p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-300">
            o auditor era
          </p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              {target.emoji}
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-base font-bold text-white">
                {target.nome}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-300">
                {target.apelido} · {ATRIBUTOS_CARGO_LABELS[target.cargo]} ·{' '}
                {ATRIBUTOS_EQUIPE_LABELS[target.equipe]} ·{' '}
                {ATRIBUTOS_SENIORIDADE_LABELS[target.senioridade]}
              </span>
              <span className="font-mono text-[10px] text-slate-300">
                {ATRIBUTOS_TURNO_LABELS[target.turno]} ·{' '}
                {ATRIBUTOS_CIDADE_LABELS[target.cidade]} ·{' '}
                {ATRIBUTOS_HOBBY_LABELS[target.hobby]}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg border border-[#2A4060] bg-transparent px-4 py-2 font-mono text-xs text-slate-200 hover:bg-[#1A2C40]"
          style={{ minHeight: 44 }}
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> voltar ao hall
        </button>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function PitacoAtributosGame() {
  const navigate = useNavigate()
  const dateKey = useMemo(() => getTodayDateKey(), [])
  const dayNumber = useMemo(() => getDayNumber(), [])

  const [state, setState] = useState<AtributosState>(() => {
    const persisted = loadAtributosState(dateKey)
    if (persisted) return persisted
    return createInitialAtributosState(dateKey, dayNumber)
  })
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    saveAtributosState(dateKey, state)
  }, [state, dateKey])

  const attemptsLeft = state.maxAttempts - state.currentRow

  function handleSubmit(auditor: Auditor) {
    if (state.isGameOver) return
    setError(null)
    // Garante que vamos usar o id real do auditor (autocomplete retorna
    // o objeto completo, mas caso entre um "raw" placeholder via Enter
    // sem match, ainda tentamos resolver via query).
    const result = processAtributosGuess(state, auditor.nome)
    if (result.error) {
      setError(result.error)
      return
    }
    setState(result.newState)
    setInput('')
  }

  const guessedCount = state.guesses.length
  const emptyRows = Math.max(0, state.maxAttempts - guessedCount)

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40, #243447)' }}
    >
      <header
        className="border-b border-[#2A4060]/40"
        style={{ background: 'rgba(15,26,46,0.85)', backdropFilter: 'blur(8px)' }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white font-mono"
            aria-label="Voltar ao hall"
          >
            <ArrowLeft className="h-4 w-4" /> hall
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl" aria-hidden="true">🏷️</span>
            <h1 className="font-mono text-base font-black tracking-tight text-white sm:text-xl">
              PITACO <span style={{ color: '#A78BFA' }}>Atributos</span>
            </h1>
          </div>
          <span className="rounded-full border border-[#2A4060] bg-[#0F1A2E]/70 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-300">
            dia #{dayNumber}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" style={{ color: '#A78BFA' }} />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                auditor misterioso
              </h2>
              <span className="ml-auto rounded-full bg-[#0F1A2E]/80 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                {state.isGameOver
                  ? state.isWin
                    ? `${state.currentRow}/${state.maxAttempts}`
                    : 'acabou'
                  : `${attemptsLeft} restantes`}
              </span>
            </div>
            <div className="flex h-44 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#2A4060] bg-gradient-to-br from-[#0F1A2E] to-[#1A2C40] p-3 text-center sm:h-56">
              <span className="text-5xl" aria-hidden="true">
                {state.isGameOver && findAuditorById(state.targetId)?.emoji
                  ? findAuditorById(state.targetId)?.emoji
                  : '❔'}
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-slate-300 sm:text-sm">
                {state.isGameOver
                  ? 'identidade revelada'
                  : 'quem e esse auditor?'}
              </span>
              <span className="font-mono text-[9px] text-slate-500">
                6 atributos · 8 tentativas
              </span>
            </div>
            <p className="mt-3 font-mono text-[10px] text-slate-300 sm:text-xs">
              Chute auditores do escritorio. A cada rodada voce recebe
              feedback colorido por atributo: verde, amarelo, vermelho ou
              cinza.
            </p>
          </section>

          <section className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: '#E3C275' }} />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                chute
              </h2>
            </div>

            {state.isGameOver ? (
              <GameOverCard state={state} onBack={() => navigate('/')} />
            ) : (
              <>
                <AuditorAutocomplete
                  value={input}
                  onChange={setInput}
                  onSubmit={handleSubmit}
                  disabled={state.isGameOver}
                  history={state.history}
                />
                {error && (
                  <div className="mt-2 rounded-lg border border-[#E25F38]/50 bg-[#E25F38]/10 p-2 font-mono text-xs text-[#F1A28A]">
                    {error}
                  </div>
                )}

                <div className="mt-3 space-y-1.5 font-mono text-[10px] text-slate-300 sm:text-xs">
                  <p>
                    <Check className="mr-1 inline h-3 w-3 text-[#5BE0D8]" />
                    digite o <strong>nome</strong> ou <strong>apelido</strong> do auditor.
                  </p>
                  <p>
                    <ChevronDown className="mr-1 inline h-3 w-3 text-slate-300" />
                    a tabela abaixo mostra a cor do feedback por atributo.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>

        <section className="mt-5">
          <h3 className="mb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
            <Tag className="h-3.5 w-3.5" />
            tentativas
            <span className="text-slate-500">
              ({guessedCount}/{state.maxAttempts})
            </span>
          </h3>

          <div className="mb-2 grid grid-cols-[1.4fr_0.9fr_0.9fr_0.7fr_0.7fr_0.7fr_0.7fr] gap-1.5 sm:gap-2">
            <div className="font-mono text-[9px] uppercase tracking-wider text-slate-300 sm:text-[10px]">
              auditor
            </div>
            <div className="text-center font-mono text-[9px] uppercase tracking-wider text-slate-300 sm:text-[10px]">
              cargo
            </div>
            <div className="text-center font-mono text-[9px] uppercase tracking-wider text-slate-300 sm:text-[10px]">
              equipe
            </div>
            <div className="text-center font-mono text-[9px] uppercase tracking-wider text-slate-300 sm:text-[10px]">
              senior.
            </div>
            <div className="text-center font-mono text-[9px] uppercase tracking-wider text-slate-300 sm:text-[10px]">
              turno
            </div>
            <div className="text-center font-mono text-[9px] uppercase tracking-wider text-slate-300 sm:text-[10px]">
              cidade
            </div>
            <div className="text-center font-mono text-[9px] uppercase tracking-wider text-slate-300 sm:text-[10px]">
              hobby
            </div>
          </div>

          <div className="space-y-1.5">
            {state.guesses.map((g, i) => (
              <GuessRow key={`${g.auditorId}-${i}`} guess={g} index={i} />
            ))}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="grid grid-cols-[1.4fr_0.9fr_0.9fr_0.7fr_0.7fr_0.7fr_0.7fr] gap-1.5 sm:gap-2"
              >
                <div className="flex items-center gap-2 rounded-md border border-dashed border-[#2A4060]/40 bg-[#0F1A2E]/30 px-2 py-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  <span aria-hidden="true">👤</span>
                  tentativa {guessedCount + i + 1}
                </div>
                {Array.from({ length: 6 }).map((__, j) => (
                  <div
                    key={j}
                    className="rounded-md border border-dashed border-[#2A4060]/40 bg-[#0F1A2E]/30"
                    style={{ minHeight: 36 }}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/50 p-4 text-xs text-slate-300 sm:text-sm">
          <h4 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
            legenda
          </h4>
          <ul className="space-y-1 font-mono">
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-[#00B2A9]" />
              <span className="text-[#5BE0D8]">verde</span> · atributo exato
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-[#E3C275]" />
              <span className="text-[#E3C275]">amarelo</span> · parcial (ex: senioridade proxima, equipe existe em outro auditor)
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-[#E25F38]" />
              <span className="text-[#F1A28A]">vermelho</span> · longe (apenas senioridade com diff &ge; 2)
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-[#94A3B8]/40" />
              <span className="text-slate-300">cinza</span> · atributo errado
            </li>
          </ul>
        </section>
      </main>

      <StarsBackground
        className="fixed inset-0 z-0 max-h-dvh max-w-full opacity-30"
        pointerEvents={false}
      />

      <div className="fixed bottom-2 right-2 z-[5] pointer-events-none">
        <span className="font-mono text-[8px] text-slate-500/50 md:text-xs">v{APP_VERSION}</span>
      </div>
    </div>
  )
}
