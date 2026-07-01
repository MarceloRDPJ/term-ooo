// src/pages/games/loldle/LoldleGame.tsx
//
// Tela principal do Loldle. Inspirado em loldle.net (Classic mode):
// o jogador tenta adivinhar o campeao-alvo do dia em ate 8 tentativas
// recebendo feedback de 6 atributos (regiao, classe, recurso, alcance,
// genero, ano).
//
// Suporta dois modos via ?mode= na URL:
//   - classic (default): feedback por atributo (6 tiles coloridos por chute)
//   - quote: o jogador recebe uma frase do campeao-alvo e adivinha quem falou
//
// Layout:
//   - header: voltar + titulo + mode selector + dia
//   - board: 8 rows (1 row por chute) - tiles ou card com nome
//   - input: autocomplete com os 40 campeoes do dataset
//   - game over card: aparece quando isGameOver

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
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
import { clearLoldleState, loadLoldleState, saveLoldleState } from './storage'
import type { LoldleFeedback, LoldleFeedbackStatus, LoldleState } from './types'
import type { LoldleChampion } from './types'
import { LoldleModeSelector } from './ModeSelector'
import { LoldleQuoteCard } from './QuoteCard'
import {
  DEFAULT_LOLDLE_MODE,
  parseLoldleModeFromPathname,
  parseLoldleModeFromUrl,
  type LoldleMode,
} from './modes'
import {
  getQuoteForChampionForDate,
} from './quotes/quotes'

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
      return 'bg-[#16a34a]/25 border-[#16a34a]/70 text-[#86efac]'
    case 'near':
      return 'bg-[#E3C275]/20 border-[#E3C275]/60 text-[#E3C275]'
    case 'partial':
      return 'bg-[#16a34a]/25 border-[#16a34a]/70 text-[#86efac]'
    case 'far':
      return 'bg-[#E25F38]/20 border-[#E25F38]/60 text-[#F1A28A]'
    case 'wrong':
    default:
      return 'bg-[#243447] border-[#2A4060] text-[#cbd5e1]'
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
  const inputRef = useRef<HTMLInputElement | null>(null)

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
      <div
        className="flex items-center gap-2 rounded-xl border-2 border-[#2A4060] bg-[#0F1A2E]/90 px-3 py-3 shadow-lg focus-within:border-[#00B2A9] focus-within:ring-2 focus-within:ring-[#00B2A9]/30"
        onClick={() => inputRef.current?.focus()}
      >
        <Search className="h-5 w-5 text-[#00B2A9]" />
        <input
          ref={inputRef}
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
              return
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setOpen(true)
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          disabled={disabled}
          placeholder="Digite o nome do campeao (ex: Ahri, Yasuo)..."
          className="flex-1 bg-transparent text-base sm:text-lg text-white placeholder:text-[#cbd5e1] outline-none font-mono caret-[#00B2A9] min-h-[32px] cursor-text"
          aria-label="Chutar campeao"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="loldle-listbox"
          aria-invalid={!!error}
          autoComplete="off"
          spellCheck={false}
          inputMode="search"
          maxLength={30}
        />
        <Button
          type="button"
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
          className="h-11 w-11 text-[#00B2A9] hover:text-[#5BE0D8]"
          aria-label="Enviar chute"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {open && matches.length > 0 && (
          <motion.ul
            id="loldle-listbox"
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[#2A4060] bg-[#0F1A2E]/95 shadow-2xl backdrop-blur"
          >
            {matches.map((c) => (
              <li key={c.id} role="option" aria-selected={value === c.name}>
                <button
                  type="button"
                  onClick={() => {
                    onSubmit(c.id)
                    onChange('')
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-[#cbd5e1] hover:bg-[#1A2C40] hover:text-white font-mono"
                >
                  <span className="flex items-center gap-2">
                    <span className="rounded-md bg-[#00B2A9]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#5BE0D8]">
                      {c.classe}
                    </span>
                    <span>{c.name}</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[#cbd5e1]">
                    {c.region}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {error && (
        <div role="alert" className="mt-2 rounded-lg border border-[#E25F38]/50 bg-[#E25F38]/10 p-2 font-mono text-xs text-[#F1A28A]">
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
  mode,
}: {
  champion: LoldleChampion
  feedback: LoldleFeedback
  index: number
  target: LoldleChampion | null
  yearDelta?: number
  mode: LoldleMode
}) {
  const keys: AttributeKey[] = ['region', 'classe', 'recurso', 'alcance', 'genero', 'ano']

  if (mode === 'quote') {
    const isCorrect = feedback.ano === 'correct'
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.05 }}
        className={cn(
          'flex items-center gap-3 rounded-2xl border p-3 shadow-lg sm:p-4',
          isCorrect
            ? 'border-[#00B2A9]/60 bg-[#00B2A9]/10'
            : 'border-[#2A4060]/60 bg-[#0F1A2E]/40'
        )}
      >
        <span className="rounded-md bg-[#0F1A2E]/80 px-2 py-0.5 font-mono text-[10px] font-black text-white">
          #{index + 1}
        </span>
        <span className="font-mono text-sm font-bold text-white sm:text-base">
          {champion.name}
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1]">
          {isCorrect ? (
            <span className="text-[#5BE0D8]">autor correto</span>
          ) : (
            'errado'
          )}
        </span>
      </motion.div>
    )
  }

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
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1]">
          {champion.classe} · {champion.alcance}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 sm:gap-2">
        {keys.map((k, i) => {
          const status = feedback[k]
          const value = getAttributeValue(champion, k)
          const showArrow = k === 'ano' && target && status !== 'correct' && champion.ano !== target.ano
          const arrow = target && showArrow ? yearArrow(champion.ano, target.ano) : null
          return (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 + i * 0.04 }}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-2 text-center',
                statusClasses(status)
              )}
              title={`${ATTRIBUTE_LABELS[k]}: ${value} (${statusText(status)})`}
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider sm:text-[11px]">
                {ATTRIBUTE_SHORT[k]}
              </span>
              <span className="flex items-center gap-1 font-mono text-xs font-bold sm:text-sm">
                {value}
                {arrow === 'up' && <ArrowUp className="h-3 w-3" aria-label="ano alvo e maior" />}
                {arrow === 'down' && <ArrowDown className="h-3 w-3" aria-label="ano alvo e menor" />}
              </span>
              {k === 'ano' && yearDelta !== undefined && status !== 'correct' && (
                <span className="font-mono text-[10px] sm:text-[11px]">
                  {status === 'near' ? `±${yearDelta}` : `Δ${yearDelta}`}
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

function EmptyRow({ index }: { index: number }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-dashed border-[#2A4060]/60 bg-[#0F1A2E]/30 px-3 py-3 font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">
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
  onReopen,
}: {
  state: LoldleState
  onBack: () => void
  onReopen: () => void
}) {
  const target = findChampionById(state.targetId)

  useEffect(() => {
    if (!state.isWin) return
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    const t1 = setTimeout(
      () =>
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        }),
      250
    )
    const t2 = setTimeout(
      () =>
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        }),
      400
    )
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [state.isWin])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loldle-gameover-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onBack()
      }}
      className={cn(
        'rounded-2xl border-2 p-5 shadow-2xl sm:p-6',
        state.isWin
          ? 'border-[#fbbf24] bg-[#00B2A9]/10'
          : 'border-[#E25F38]/60 bg-[#E25F38]/10'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {state.isWin ? (
            <Trophy className="h-7 w-7 text-[#fbbf24]" />
          ) : (
            <X className="h-7 w-7 text-[#F1A28A]" />
          )}
          <div>
            <h2 id="loldle-gameover-title" className="font-mono text-lg font-black text-white sm:text-xl">
              {state.isWin ? 'PENTAKILL!' : 'GAME OVER'}
            </h2>
            <p className="font-mono text-xs text-[#cbd5e1] sm:text-sm">
              {state.isWin
                ? `Voce acertou em ${state.currentRow}/${state.maxAttempts} tentativas.`
                : 'Amanha tem mais. GG WP.'}
            </p>
          </div>
        </div>
      </div>

      {target && (
        <div className="mt-4 rounded-xl border border-[#2A4060] bg-[#0F1A2E]/70 p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1]">o campeao era</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="rounded-lg bg-[#00B2A9]/20 px-2.5 py-1 font-mono text-base font-black text-[#5BE0D8]">
              {target.name}
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold text-white">
                {target.classe} · {target.alcance}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1]">
                {target.region} · {target.recurso} · {target.genero} · {target.ano}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="min-h-[44px] border-[#2A4060] bg-transparent font-mono text-xs text-slate-200"
          size="lg"
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5" /> voltar ao hall
        </Button>
        <Button
          type="button"
          onClick={onReopen}
          variant="outline"
          className="min-h-[44px] border-[#2A4060] bg-transparent font-mono text-xs text-slate-200"
          size="lg"
        >
          reabrir o dia
        </Button>
      </div>
    </motion.div>
  )
}

export function LoldleGame() {
  const navigate = useNavigate()
  const location = useLocation()
  const [dateKey, setDateKey] = useState<string>(() => getTodayDateKey())
  const [mode, setModeState] = useState<LoldleMode>(() => {
    const fromPath = parseLoldleModeFromPathname(window.location.pathname)
    if (fromPath !== 'classic') return fromPath
    return parseLoldleModeFromUrl(window.location.search)
  })
  const effectiveMode: 'classic' | 'quote' = mode === 'quote' ? 'quote' : 'classic'

  const [state, setState] = useState<LoldleState>(() => {
    const initialKey = getTodayDateKey()
    const persisted = loadLoldleState(initialKey, effectiveMode)
    if (persisted) return persisted
    return createInitialLoldleState(initialKey, effectiveMode)
  })
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const tentativasRef = useRef<HTMLDivElement | null>(null)

  const target = useMemo(() => {
    if (state.isGameOver) {
      return findChampionById(state.targetId) ?? null
    }
    return null
  }, [state.isGameOver, state.targetId])

  const targetQuote = useMemo(() => {
    if (effectiveMode !== 'quote') return ''
    return getQuoteForChampionForDate(state.targetId, state.dateKey)
  }, [effectiveMode, state.targetId, state.dateKey])

  const setMode = useCallback(
    (next: LoldleMode) => {
      setModeState(next)
      const newMode: 'classic' | 'quote' = next === 'quote' ? 'quote' : 'classic'
      const persisted = loadLoldleState(dateKey, newMode)
      if (persisted) {
        setState(persisted)
      } else {
        setState(createInitialLoldleState(dateKey, newMode))
      }
      setInput('')
      setError(null)
      const params = new URLSearchParams(location.search)
      if (next === DEFAULT_LOLDLE_MODE) {
        params.delete('mode')
      } else {
        params.set('mode', next)
      }
      const qs = params.toString()
      const newPath = `${location.pathname}${qs ? `?${qs}` : ''}`
      window.history.replaceState(null, '', newPath)
    },
    [dateKey, location.pathname, location.search]
  )

  useEffect(() => {
    saveLoldleState(dateKey, state, effectiveMode)
  }, [state, dateKey, effectiveMode])

  useEffect(() => {
    if (state.guesses.length > 0 && tentativasRef.current) {
      tentativasRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [state.guesses.length])

  // Recarrega o estado quando o dia muda (usuario deixou a aba aberta
  // ate a meia-noite, ou voltou a tab apos virar o dia). Sem isso,
  // a `dateKey` inicial congelava e o jogador chutava no dia errado.
  useEffect(() => {
    function checkDateChange() {
      const today = getTodayDateKey()
      if (today !== dateKey) {
        setDateKey(today)
        const persisted = loadLoldleState(today, effectiveMode)
        if (persisted) {
          setState(persisted)
        } else {
          setState(createInitialLoldleState(today, effectiveMode))
        }
      }
    }
    const interval = setInterval(checkDateChange, 60_000)
    document.addEventListener('visibilitychange', checkDateChange)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', checkDateChange)
    }
  }, [dateKey, effectiveMode])

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 2500)
    return () => clearTimeout(t)
  }, [error])

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

  function handleReopen() {
    clearLoldleState(dateKey, effectiveMode)
    window.location.reload()
  }

  const guessedCount = state.guesses.length
  const emptyRows = Math.max(0, state.maxAttempts - guessedCount)
  const modeLabel = effectiveMode === 'quote' ? 'Quote' : 'Classic'

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40, #243447)' }}
    >
      <header
        className="border-b border-[#2A4060]/40"
        style={{ background: 'rgba(15,26,46,0.85)', backdropFilter: 'blur(8px)' }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex min-h-[44px] items-center gap-1.5 px-2 text-sm text-[#cbd5e1] hover:text-white font-mono"
            aria-label="Voltar ao hall"
          >
            <ArrowLeft className="h-4 w-4" /> hall
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl" aria-hidden="true">⚔️</span>
            <h1 className="font-mono text-base font-black tracking-tight text-white sm:text-xl">
              LOLDLE <span style={{ color: '#00B2A9' }}>{modeLabel}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LoldleModeSelector current={mode} onSelect={setMode} />
            <span
              className={cn(
                'rounded-full border bg-[#0F1A2E]/70 px-2 py-1 font-mono text-[10px] uppercase tracking-wider',
                state.isWin
                  ? 'border-[#00B2A9] text-[#fbbf24]'
                  : 'border-[#2A4060] text-[#cbd5e1]'
              )}
            >
              {dateKey}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" style={{ color: '#00B2A9' }} />
              <h2 className="font-mono text-lg font-bold uppercase tracking-wider text-white sm:text-xl">
                {effectiveMode === 'quote' ? 'frase do dia' : 'alvo do dia'}
              </h2>
              <span className="ml-auto rounded-full bg-[#0F1A2E]/80 px-2 py-0.5 font-mono text-[10px] text-[#cbd5e1]">
                {state.isGameOver
                  ? state.isWin
                    ? `${state.currentRow}/${state.maxAttempts}`
                    : 'acabou'
                  : `${attemptsLeft} restantes`}
              </span>
            </div>
            {effectiveMode === 'quote' ? (
              <>
                <LoldleQuoteCard text={targetQuote} revealed={state.isGameOver} />
                <p className="mt-3 font-mono text-[10px] text-[#cbd5e1] sm:text-xs">
                  {state.isGameOver && target
                    ? `o autor era: ${target.name}`
                    : `descubra quem falou a frase acima em ate ${state.maxAttempts} tentativas.`}
                </p>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#2A4060] bg-gradient-to-br from-[#0F1A2E] to-[#1A2C40] p-6 text-center">
                  <span className="text-5xl" aria-hidden="true">❓</span>
                  <p className="font-mono text-sm font-bold text-[#5BE0D8] sm:text-base">
                    Campeao oculto
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1] sm:text-xs">
                    {state.isGameOver && target
                      ? 'spoiler abaixo'
                      : `pool: ${CHAMPIONS.length} campeoes`}
                  </p>
                </div>
                <p className="mt-3 font-mono text-[10px] text-[#cbd5e1] sm:text-xs">
                  Adivinhe o campeao pelos seus atributos. 6 atributos, 8 tentativas.
                </p>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: '#E3C275' }} />
              <h2 className="font-mono text-lg font-bold uppercase tracking-wider text-white sm:text-xl">
                chute
              </h2>
            </div>

            {state.isGameOver ? (
              <GameOverCard state={state} onBack={() => navigate('/')} onReopen={handleReopen} />
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

                <div className="mt-3 space-y-1.5 font-mono text-[10px] text-[#cbd5e1] sm:text-xs">
                  {effectiveMode === 'quote' ? (
                    <>
                      <p>
                        <Check className="mr-1 inline h-3 w-3 text-[#86efac]" />
                        digite o <strong>nome</strong> do campeao que falou a frase.
                      </p>
                      <p>
                        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#16a34a] align-middle" />
                        <strong className="text-[#86efac]">verde</strong> = autor correto.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <Check className="mr-1 inline h-3 w-3 text-[#86efac]" />
                        digite o <strong>nome</strong> do campeao (autocomplete sugere).
                      </p>
                      <p>
                        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#E3C275] align-middle" />
                        <strong className="text-[#E3C275]">amarelo</strong> no ano = proximo (±2).
                      </p>
                      <p>
                        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#16a34a] align-middle" />
                        <strong className="text-[#86efac]">verde</strong> = atributo correto.
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
          </section>
        </div>

        <section className="mt-5">
          <h3 className="mb-2 flex items-center gap-2 font-mono text-base font-bold uppercase tracking-wider text-[#cbd5e1]">
            tentativas
            <span className="text-[#94A3B8]">
              ({guessedCount}/{state.maxAttempts})
            </span>
          </h3>
          <div ref={tentativasRef} className="grid gap-2">
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
                  mode={effectiveMode}
                />
              )
            })}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <EmptyRow key={`empty-${i}`} index={guessedCount + i} />
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/50 p-4 text-xs text-[#cbd5e1] sm:text-sm">
          <h4 className="mb-2 font-mono text-base font-bold uppercase tracking-wider text-[#cbd5e1]">
            legenda
          </h4>
          {effectiveMode === 'quote' ? (
            <ul className="space-y-1 font-mono">
              <li>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#16a34a] align-middle" />
                <strong className="text-[#86efac]">verde</strong> · autor da frase
              </li>
              <li>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#94A3B8] align-middle" />
                <strong className="text-[#cbd5e1]">cinza</strong> · chute errado
              </li>
            </ul>
          ) : (
            <ul className="space-y-1 font-mono">
              <li>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#16a34a] align-middle" />
                <strong className="text-[#86efac]">verde</strong> · atributo exato
              </li>
              <li>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#E3C275] align-middle" />
                <strong className="text-[#E3C275]">amarelo</strong> · ano proximo (±2)
              </li>
              <li>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#94A3B8] align-middle" />
                <strong className="text-[#cbd5e1]">cinza</strong> · atributo errado
              </li>
              <li>
                <ArrowUp className="mr-1 inline h-3 w-3 text-[#E3C275] align-middle" />
                / <ArrowDown className="mr-1 inline h-3 w-3 text-[#E3C275] align-middle" />
                no ano: alvo maior / alvo menor
              </li>
            </ul>
          )}
        </section>
      </main>

      <StarsBackground
        className="fixed inset-0 z-0 max-h-dvh max-w-full opacity-30"
        pointerEvents={false}
      />

      <div className="fixed bottom-2 right-2 z-[5] pointer-events-none">
        <span className="font-mono text-[8px] text-[#94A3B8]/50 md:text-xs">v{APP_VERSION}</span>
      </div>
    </div>
  )
}
