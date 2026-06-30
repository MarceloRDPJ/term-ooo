// src/pages/games/loldle/LoldleGame.tsx
//
// Tela principal do Loldle. Inspirado em loldle.net (Classic mode):
// o jogador tenta adivinhar o campeao-alvo do dia em ate 8 tentativas
// recebendo feedback de 6 atributos (regiao, classe, recurso, alcance,
// genero, ano).
//
// Layout:
//   - header: voltar + titulo + dia
//   - board: 8 rows x 6 cols de tiles coloridos (1 row por chute)
//   - input: autocomplete com os 40 campeoes do dataset
//   - game over card: aparece quando isGameOver

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Search,
  Send,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarsBackground } from '@/components/animate-ui/components/backgrounds/stars'
import { APP_VERSION } from '@/lib/version'
import { getTodayDateKey } from '@/lib/dates'
import { cn, normalizeString } from '@/lib/utils'
import { CHAMPIONS, findChampionById, searchChampions } from './champions'
import {
  createInitialLoldleState,
  processLoldleGuess,
  yearArrow,
} from './engine'
import { loadLoldleState, saveLoldleState } from './storage'
import type { LoldleFeedback, LoldleFeedbackStatus, LoldleState } from './types'
import type { LoldleChampion } from './types'

type AttributeKey = 'region' | 'classe' | 'recurso' | 'alcance' | 'genero' | 'ano'

const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  region: 'Regiao',
  classe: 'Classe',
  recurso: 'Recurso',
  alcance: 'Alcance',
  genero: 'Genero',
  ano: 'Ano',
}

const ATTRIBUTE_SHORT: Record<AttributeKey, string> = {
  region: 'Regiao',
  classe: 'Classe',
  recurso: 'Recurso',
  alcance: 'Alcance',
  genero: 'Genero',
  ano: 'Ano',
}

function statusClasses(status: LoldleFeedbackStatus): string {
  switch (status) {
    case 'correct':
      return 'bg-[#00B2A9]/20 border-[#00B2A9]/60 text-[#5BE0D8]'
    case 'near':
      return 'bg-[#E3C275]/20 border-[#E3C275]/60 text-[#E3C275]'
    case 'partial':
      return 'bg-[#00B2A9]/20 border-[#00B2A9]/60 text-[#5BE0D8]'
    case 'far':
      return 'bg-[#E25F38]/20 border-[#E25F38]/60 text-[#F1A28A]'
    case 'wrong':
    default:
      return 'bg-[#243447] border-[#2A4060] text-slate-300'
  }
}

function statusText(status: LoldleFeedbackStatus): string {
  switch (status) {
    case 'correct':
      return 'correto'
    case 'near':
      return 'proximo'
    case 'partial':
      return 'parcial'
    case 'far':
      return 'longe'
    case 'wrong':
    default:
      return 'errado'
  }
}

function getAttributeValue(
  champion: LoldleChampion,
  key: AttributeKey
): string {
  switch (key) {
    case 'region':
      return champion.region
    case 'classe':
      return champion.classe
    case 'recurso':
      return champion.recurso
    case 'alcance':
      return champion.alcance
    case 'genero':
      return champion.genero
    case 'ano':
      return String(champion.ano)
  }
}

function ChampionAutocomplete({
  value,
  onChange,
  onSubmit,
  disabled,
  history,
  error,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: (championId: string) => void
  disabled: boolean
  history: string[]
  error: string | null
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const matches = useMemo(() => {
    const norm = normalizeString(value)
    if (!norm) return []
    return searchChampions(norm, 8).filter((c) => !history.includes(c.id))
  }, [value, history])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-xl border border-[#2A4060] bg-[#0F1A2E]/80 px-3 py-2 shadow-lg focus-within:border-[#00B2A9]">
        <Search className="h-4 w-4 text-[#00B2A9]" />
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
                onSubmit(matches[0].id)
                onChange('')
                setOpen(false)
              } else if (value.trim()) {
                onSubmit(value.trim())
              }
            }
          }}
          disabled={disabled}
          placeholder="Digite o nome do campeao (ex: Ahri, Yasuo)..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none font-mono"
          aria-label="Chutar campeao"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            if (matches.length > 0) {
              onSubmit(matches[0].id)
              onChange('')
              setOpen(false)
            } else if (value.trim()) {
              onSubmit(value.trim())
            }
          }}
          disabled={disabled || !value.trim()}
          className="h-8 w-8 text-[#00B2A9] hover:text-[#5BE0D8]"
          aria-label="Enviar chute"
        >
          <Send className="h-4 w-4" />
        </Button>
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
            {matches.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSubmit(c.id)
                    onChange('')
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-slate-200 hover:bg-[#1A2C40] font-mono"
                >
                  <span className="flex items-center gap-2">
                    <span className="rounded-md bg-[#00B2A9]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#5BE0D8]">
                      {c.classe}
                    </span>
                    <span>{c.name}</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-300">
                    {c.region}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-2 rounded-lg border border-[#E25F38]/50 bg-[#E25F38]/10 p-2 font-mono text-xs text-[#F1A28A]">
          {error}
        </div>
      )}
    </div>
  )
}

function GuessRow({
  champion,
  feedback,
  index,
  target,
  yearDelta,
}: {
  champion: LoldleChampion
  feedback: LoldleFeedback
  index: number
  target: LoldleChampion | null
  yearDelta?: number
}) {
  const keys: AttributeKey[] = ['region', 'classe', 'recurso', 'alcance', 'genero', 'ano']

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/60 p-3 shadow-lg"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#0F1A2E]/80 px-2 py-1 font-mono text-sm font-black text-white">
            #{index + 1}
          </span>
          <span className="font-mono text-sm font-bold text-white sm:text-base">
            {champion.name}
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-300">
          {champion.classe} · {champion.alcance}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 sm:gap-2">
        {keys.map((k) => {
          const status = feedback[k]
          const value = getAttributeValue(champion, k)
          const showArrow = k === 'ano' && target && status !== 'correct' && champion.ano !== target.ano
          const arrow = target && showArrow ? yearArrow(champion.ano, target.ano) : null
          return (
            <div
              key={k}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-2 text-center',
                statusClasses(status)
              )}
              title={`${ATTRIBUTE_LABELS[k]}: ${value} (${statusText(status)})`}
            >
              <span className="font-mono text-[8px] uppercase tracking-wider opacity-70 sm:text-[9px]">
                {ATTRIBUTE_SHORT[k]}
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] font-bold sm:text-xs">
                {value}
                {arrow === 'up' && <ArrowUp className="h-3 w-3" aria-label="ano alvo e maior" />}
                {arrow === 'down' && <ArrowDown className="h-3 w-3" aria-label="ano alvo e menor" />}
              </span>
              {k === 'ano' && yearDelta !== undefined && status !== 'correct' && (
                <span className="font-mono text-[8px] opacity-70 sm:text-[9px]">
                  {status === 'near' ? `±${yearDelta}` : `Δ${yearDelta}`}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function EmptyRow({ index }: { index: number }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-dashed border-[#2A4060]/60 bg-[#0F1A2E]/30 px-3 py-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">
      <span className="rounded-md bg-[#0F1A2E]/80 px-2 py-0.5 font-black text-slate-400">
        #{index + 1}
      </span>
      <span>tentativa {index + 1}</span>
    </div>
  )
}

function GameOverCard({
  state,
  onBack,
}: {
  state: LoldleState
  onBack: () => void
}) {
  const target = findChampionById(state.targetId)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'rounded-2xl border-2 p-5 shadow-2xl sm:p-6',
        state.isWin
          ? 'border-[#00B2A9]/60 bg-[#00B2A9]/10'
          : 'border-[#E25F38]/60 bg-[#E25F38]/10'
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
              {state.isWin ? 'PENTAKILL!' : 'GAME OVER'}
            </h2>
            <p className="font-mono text-xs text-slate-300 sm:text-sm">
              {state.isWin
                ? `Voce acertou em ${state.currentRow}/${state.maxAttempts} tentativas.`
                : 'Amanha tem mais. GG WP.'}
            </p>
          </div>
        </div>
      </div>

      {target && (
        <div className="mt-4 rounded-xl border border-[#2A4060] bg-[#0F1A2E]/70 p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-300">o campeao era</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="rounded-lg bg-[#00B2A9]/20 px-2.5 py-1 font-mono text-base font-black text-[#5BE0D8]">
              {target.name}
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold text-white">
                {target.classe} · {target.alcance}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-300">
                {target.region} · {target.recurso} · {target.genero} · {target.ano}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-[#2A4060] bg-transparent font-mono text-xs text-slate-200"
          size="lg"
          style={{ minHeight: 44 }}
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5" /> voltar ao hall
        </Button>
      </div>
    </motion.div>
  )
}

export function LoldleGame() {
  const navigate = useNavigate()
  const dateKey = useMemo(() => getTodayDateKey(), [])

  const [state, setState] = useState<LoldleState>(() => {
    const persisted = loadLoldleState(dateKey)
    if (persisted) return persisted
    return createInitialLoldleState(dateKey)
  })
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const target = useMemo(() => {
    if (state.isGameOver) {
      return findChampionById(state.targetId) ?? null
    }
    return null
  }, [state.isGameOver, state.targetId])

  useEffect(() => {
    saveLoldleState(dateKey, state)
  }, [state, dateKey])

  const attemptsLeft = state.maxAttempts - state.currentRow

  function handleSubmit(rawGuess: string) {
    if (state.isGameOver) return
    setError(null)
    const result = processLoldleGuess(state, rawGuess)
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
            <span className="text-xl sm:text-2xl" aria-hidden="true">⚔️</span>
            <h1 className="font-mono text-base font-black tracking-tight text-white sm:text-xl">
              LOLDLE <span style={{ color: '#00B2A9' }}>Classic</span>
            </h1>
          </div>
          <span className="rounded-full border border-[#2A4060] bg-[#0F1A2E]/70 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-300">
            {dateKey}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" style={{ color: '#00B2A9' }} />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                alvo do dia
              </h2>
              <span className="ml-auto rounded-full bg-[#0F1A2E]/80 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                {state.isGameOver
                  ? state.isWin
                    ? `${state.currentRow}/${state.maxAttempts}`
                    : 'acabou'
                  : `${attemptsLeft} restantes`}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#2A4060] bg-gradient-to-br from-[#0F1A2E] to-[#1A2C40] p-6 text-center">
              <span className="text-5xl" aria-hidden="true">❓</span>
              <p className="font-mono text-sm font-bold text-[#5BE0D8] sm:text-base">
                Campeao oculto
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-300 sm:text-xs">
                {state.isGameOver && target
                  ? 'spoiler abaixo'
                  : `pool: ${CHAMPIONS.length} campeoes`}
              </p>
            </div>
            <p className="mt-3 font-mono text-[10px] text-slate-300 sm:text-xs">
              Adivinhe o campeao pelos seus atributos. 6 atributos, 8 tentativas.
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
                <ChampionAutocomplete
                  value={input}
                  onChange={setInput}
                  onSubmit={handleSubmit}
                  disabled={state.isGameOver}
                  history={state.history}
                  error={error}
                />

                <div className="mt-3 space-y-1.5 font-mono text-[10px] text-slate-300 sm:text-xs">
                  <p>
                    <Check className="mr-1 inline h-3 w-3 text-[#5BE0D8]" />
                    digite o <strong>nome</strong> do campeao (autocomplete sugere).
                  </p>
                  <p>
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#E3C275] align-middle" />
                    <strong className="text-[#E3C275]">amarelo</strong> no ano = proximo (±2).
                  </p>
                  <p>
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#00B2A9] align-middle" />
                    <strong className="text-[#5BE0D8]">verde</strong> = atributo correto.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>

        <section className="mt-5">
          <h3 className="mb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
            tentativas
            <span className="text-slate-500">
              ({guessedCount}/{state.maxAttempts})
            </span>
          </h3>
          <div className="grid gap-2">
            {state.guesses.map((g, i) => {
              const champ = findChampionById(g.championId)
              if (!champ) return null
              return (
                <GuessRow
                  key={`${g.championId}-${i}`}
                  champion={champ}
                  feedback={g.feedback}
                  index={i}
                  target={target}
                  yearDelta={g.yearDelta}
                />
              )
            })}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <EmptyRow key={`empty-${i}`} index={guessedCount + i} />
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/50 p-4 text-xs text-slate-300 sm:text-sm">
          <h4 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
            legenda
          </h4>
          <ul className="space-y-1 font-mono">
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#00B2A9] align-middle" />
              <strong className="text-[#5BE0D8]">verde</strong> · atributo exato
            </li>
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#E3C275] align-middle" />
              <strong className="text-[#E3C275]">amarelo</strong> · ano proximo (±2)
            </li>
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-slate-500 align-middle" />
              <strong className="text-slate-300">cinza</strong> · atributo errado
            </li>
            <li>
              <ArrowUp className="mr-1 inline h-3 w-3 text-[#E3C275] align-middle" />
              / <ArrowDown className="mr-1 inline h-3 w-3 text-[#E3C275] align-middle" />
              no ano: alvo maior / alvo menor
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
