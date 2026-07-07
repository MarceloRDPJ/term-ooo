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
import {
  getChampionIconUrl,
  getChampionSplashUrl,
} from './lol-assets'

type AttributeKey = 'region' | 'classe' | 'recurso' | 'alcance' | 'genero' | 'ano'
type EffectiveLoldleMode = 'classic' | 'quote' | 'splash'

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

function ChampionIcon({
  champion,
  className,
}: {
  champion: LoldleChampion
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const initials = champion.name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <span
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#2A4060] bg-[#0F1A2E] font-mono text-xs font-black text-[#5BE0D8]',
        className
      )}
      aria-hidden="true"
    >
      {failed ? (
        initials
      ) : (
        <img
          src={getChampionIconUrl(champion)}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  )
}

function SplashClue({
  champion,
  revealed,
  guesses,
}: {
  champion: LoldleChampion
  revealed: boolean
  guesses: number
}) {
  const [failed, setFailed] = useState(false)
  const blur = revealed ? 0 : Math.max(2, 18 - guesses * 2)
  const scale = revealed ? 1 : 1.08 + Math.max(0, 5 - guesses) * 0.03

  return (
    <div className="relative min-h-[250px] overflow-hidden rounded-2xl border-2 border-[#2A4060] bg-[#0F1A2E] shadow-2xl">
      {failed ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0F1A2E] to-[#1A2C40] p-6 text-center">
          <span className="font-mono text-7xl font-black text-[#fb923c]">?</span>
          <span className="font-mono text-xs uppercase tracking-wider text-[#cbd5e1]">splash indisponivel</span>
        </div>
      ) : (
        <img
          src={getChampionSplashUrl(champion)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: `blur(${blur}px) saturate(${revealed ? 1 : 0.55})`, transform: `scale(${scale})` }}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060b18]/95 via-[#060b18]/25 to-transparent" />
      <div className="relative flex min-h-[250px] flex-col justify-end p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#cbd5e1]">
          splash art clue
        </p>
        <h3 className="mt-1 font-mono text-xl font-black text-white">
          {revealed ? champion.name : `${guesses}/8 tentativas usadas`}
        </h3>
        {!revealed && (
          <p className="mt-1 font-mono text-xs text-[#5BE0D8]">
            A imagem fica menos borrada a cada chute.
          </p>
        )}
      </div>
    </div>
  )
}

function ChampionPreviewStrip() {
  return (
    <div className="mt-1 flex flex-wrap justify-center gap-1.5" aria-hidden="true">
      {CHAMPIONS.slice(0, 6).map((champion) => (
        <ChampionIcon key={champion.id} champion={champion} className="h-9 w-9 rounded-lg opacity-90" />
      ))}
    </div>
  )
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
                    <ChampionIcon champion={c} className="h-8 w-8 rounded-lg" />
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

  if (mode === 'quote' || mode === 'splash') {
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
        <ChampionIcon champion={champion} />
        <span className="rounded-md bg-[#0F1A2E]/80 px-2 py-0.5 font-mono text-[10px] font-black text-white">
          #{index + 1}
        </span>
        <span className="font-mono text-sm font-bold text-white sm:text-base">
          {champion.name}
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1]">
          {isCorrect ? (
            <span className="text-[#5BE0D8]">campeao correto</span>
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
          <ChampionIcon champion={champion} />
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
      <span className="font-bold text-[#cbd5e1]">tentativa {index + 1}</span>
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
        <div className="mt-4 overflow-hidden rounded-xl border border-[#2A4060] bg-[#0F1A2E]/70">
          <div className="relative min-h-[120px]">
            <img
              src={getChampionSplashUrl(target)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-70"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F1A2E] via-[#0F1A2E]/80 to-[#0F1A2E]/20" />
            <div className="relative flex min-h-[120px] items-center gap-3 p-3">
              <ChampionIcon champion={target} className="h-14 w-14 rounded-2xl" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1]">o campeao era</p>
                <p className="font-mono text-lg font-black text-[#5BE0D8]">{target.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3">
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
  const effectiveMode: EffectiveLoldleMode = mode === 'quote' || mode === 'splash' ? mode : 'classic'

  const [state, setState] = useState<LoldleState>(() => {
    const initialKey = getTodayDateKey()
    const persisted = loadLoldleState(initialKey, effectiveMode)
    if (persisted) return persisted
    return createInitialLoldleState(initialKey, effectiveMode)
  })
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const tentativasRef = useRef<HTMLDivElement | null>(null)

  const targetChampion = useMemo(() => findChampionById(state.targetId) ?? null, [state.targetId])
  const target = state.isGameOver ? targetChampion : null

  const targetQuote = useMemo(() => {
    if (effectiveMode !== 'quote') return ''
    return getQuoteForChampionForDate(state.targetId, state.dateKey)
  }, [effectiveMode, state.targetId, state.dateKey])

  const setMode = useCallback(
    (next: LoldleMode) => {
      setModeState(next)
      const newMode: EffectiveLoldleMode = next === 'quote' || next === 'splash' ? next : 'classic'
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
  const modeLabel = effectiveMode === 'quote' ? 'Quote' : effectiveMode === 'splash' ? 'Splash' : 'Classic'

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #0d1830 0%, #0a1224 45%, #060b18 100%)' }}
    >
      <StarsBackground
        className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-80"
        starColor="#cbd5e1"
        pointerEvents={false}
      />

      <div className="pointer-events-none fixed inset-0 z-0 h-full w-full bg-[radial-gradient(ellipse_at_center,_rgba(91,224,216,0.08)_0%,_transparent_55%)]" />

      <div className="relative z-10">
        <header
          className="border-b border-[#2A4060]/40"
          style={{ background: 'rgba(10,18,36,0.85)', backdropFilter: 'blur(10px)' }}
        >
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex min-h-[40px] items-center gap-1.5 px-2 text-sm text-[#cbd5e1] hover:text-white font-mono"
              aria-label="Voltar ao hall"
            >
              <ArrowLeft className="h-4 w-4" /> hall
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl" aria-hidden="true">⚔️</span>
              <h1 className="font-mono text-sm font-black uppercase tracking-wider text-white sm:text-base">
                Loldle <span style={{ color: '#00B2A9' }}>{modeLabel}</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded-md border bg-[#0F1A2E]/70 px-2 py-1 font-mono text-[10px] uppercase tracking-wider',
                  state.isWin
                    ? 'border-[#fbbf24] text-[#fbbf24]'
                    : 'border-[#2A4060] text-[#cbd5e1]'
                )}
              >
                {dateKey}
              </span>
            </div>
          </div>
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-1.5 border-t border-[#2A4060]/30 px-3 py-2 sm:px-4">
            <LoldleModeSelector current={mode} onSelect={setMode} />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-2xl border border-[#2A4060]/40 bg-[#0F1A2E]/70 p-4 shadow-2xl backdrop-blur sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full border-2"
                  style={{ borderColor: '#5BE0D8' }}
                  aria-hidden="true"
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#5BE0D8' }} />
                </span>
                <h2 className="font-mono text-sm font-black uppercase tracking-wider text-white sm:text-base">
                  alvo do dia
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
              ) : effectiveMode === 'splash' && targetChampion ? (
                <>
                  <SplashClue
                    champion={targetChampion}
                    revealed={state.isGameOver}
                    guesses={state.guesses.length}
                  />
                  <p className="mt-3 font-mono text-[10px] text-[#cbd5e1] sm:text-xs">
                    {state.isGameOver && target
                      ? `o campeao era: ${target.name}`
                      : `adivinhe o campeao pela splash art em ate ${state.maxAttempts} tentativas.`}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#2A4060]/80 bg-gradient-to-br from-[#0F1A2E]/80 to-[#1A2C40]/60 p-6 text-center">
                    <span
                      className="font-mono text-6xl font-black leading-none sm:text-7xl"
                      style={{ color: '#fb923c' }}
                      aria-hidden="true"
                    >
                      ?
                    </span>
                    <p className="font-mono text-base font-black text-[#5BE0D8] sm:text-lg">
                      Campeao oculto
                    </p>
                    <p
                      className="font-mono text-[10px] font-bold uppercase tracking-widest sm:text-xs"
                      style={{ color: '#fbbf24' }}
                    >
                      pool: {CHAMPIONS.length} campeoes
                    </p>
                    <ChampionPreviewStrip />
                  </div>
                  <p className="mt-3 font-mono text-[10px] text-[#cbd5e1] sm:text-xs">
                    Adivinhe o campeao pelos seus atributos. 6 atributos, 8 tentativas.
                  </p>
                </>
              )}
            </section>

            <section className="rounded-2xl border border-[#2A4060]/40 bg-[#0F1A2E]/70 p-4 shadow-2xl backdrop-blur sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: '#E3C275' }} />
                <h2 className="font-mono text-sm font-black uppercase tracking-wider text-white sm:text-base">
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
                    {effectiveMode === 'quote' || effectiveMode === 'splash' ? (
                      <>
                        <p>
                          <Check className="mr-1 inline h-3 w-3 text-[#22c55e]" />
                          digite o <strong>nome</strong> do campeao {effectiveMode === 'quote' ? 'que falou a frase' : 'da splash art'}.
                        </p>
                        <p>
                          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#22c55e] align-middle" />
                          <strong className="text-[#86efac]">verde</strong> = campeao correto.
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          <Check className="mr-1 inline h-3 w-3 text-[#22c55e]" />
                          digite o <strong>nome</strong> do campeao (autocomplete sugere).
                        </p>
                        <p>
                          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#eab308] align-middle" />
                          <strong className="text-[#fbbf24]">amarelo</strong> no ano = proximo (±2).
                        </p>
                        <p>
                          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#22c55e] align-middle" />
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
            <h3 className="mb-2 flex items-center gap-2 font-mono text-sm font-black uppercase tracking-wider sm:text-base">
              <span
                className="font-mono text-sm font-black sm:text-base"
                style={{ color: '#5BE0D8' }}
              >
                tentativas
              </span>
              <span className="text-[10px] text-[#94A3B8] sm:text-xs">
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
                    target={targetChampion}
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

          <section className="mt-6 rounded-2xl border border-[#2A4060]/40 bg-[#0F1A2E]/50 p-4 text-xs text-[#cbd5e1] backdrop-blur sm:text-sm">
            <h4 className="mb-2 font-mono text-sm font-black uppercase tracking-wider text-white sm:text-base">
              legenda
            </h4>
            {effectiveMode === 'quote' || effectiveMode === 'splash' ? (
              <ul className="space-y-1.5 font-mono">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-sm bg-[#22c55e]" />
                  <span>
                    <strong className="text-[#86efac]">verde</strong> · campeao correto
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-sm bg-[#6b7280]" />
                  <span>
                    <strong className="text-[#cbd5e1]">cinza</strong> · chute errado
                  </span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-1.5 font-mono">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-sm bg-[#22c55e]" />
                  <span>
                    <strong className="text-[#86efac]">verde</strong> · atributo exato
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-sm bg-[#eab308]" />
                  <span>
                    <strong className="text-[#fbbf24]">amarelo</strong> · ano proximo (±2)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-sm bg-[#6b7280]" />
                  <span>
                    <strong className="text-[#cbd5e1]">cinza</strong> · atributo errado
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowUp className="h-3 w-3 text-[#fbbf24]" />
                  <ArrowDown className="h-3 w-3 text-[#fbbf24]" />
                  <span>
                    no ano: <strong className="text-[#fbbf24]">alvo maior</strong> /{' '}
                    <strong className="text-[#fbbf24]">alvo menor</strong>
                  </span>
                </li>
              </ul>
            )}
          </section>
        </main>

        <div className="fixed bottom-2 right-2 z-[5] pointer-events-none">
          <span className="font-mono text-[8px] text-[#94A3B8]/50 md:text-xs">v{APP_VERSION}</span>
        </div>
      </div>
    </div>
  )
}
