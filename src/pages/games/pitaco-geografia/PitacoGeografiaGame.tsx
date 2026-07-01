// src/pages/games/pitaco-geografia/PitacoGeografiaGame.tsx
//
// Tela principal do PITACO Geografia. Inspirado em Worldle:
// o jogador tenta adivinhar o estado-alvo do dia (6 tentativas) e
// recebe feedback de distancia em km, direcao (N/NE/L/SE/S/SO/O/NO) e
// % de proximidade para cada chute.
//
// MVP: a "silhueta" do estado-alvo e um placeholder (texto grande + emoji).
// SVG real das silhuetas fica para iteracao futura.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  MapPin,
  Send,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarsBackground } from '@/components/animate-ui/components/backgrounds/stars'
import { APP_VERSION } from '@/lib/version'
import { getTodayDateKey, getDayNumber } from '@/lib/dates'
import { BRAZILIAN_STATES, REGION_LABELS, findStateByUf, type RegionCode } from './states'
import {
  createInitialGeoState,
  processGeoGuess,
  proximityBand,
} from './engine'
import { clearGeoState, loadGeoState, saveGeoState } from './storage'
import type { GeoGuess, GeoState } from './types'
import { normalizeString } from '@/lib/utils'
import { cn } from '@/lib/utils'

function formatDistance(km: number): string {
  if (km < 1000) return `${km} km`
  return `${(km / 1000).toFixed(1)} mil km`
}

function directionArrow(bearing: number): string {
  const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖']
  const idx = Math.round(bearing / 45) % 8
  return arrows[idx]
}

function bandClasses(band: 'perto' | 'medio' | 'longe'): { bg: string; border: string; text: string } {
  if (band === 'perto') {
    return {
      bg: 'bg-[#00B2A9]/15',
      border: 'border-[#00B2A9]/50',
      text: 'text-[#5BE0D8]',
    }
  }
  if (band === 'medio') {
    return {
      bg: 'bg-[#E3C275]/15',
      border: 'border-yellow-400/50',
      text: 'text-[#E3C275]',
    }
  }
  return {
    bg: 'bg-[#E25F38]/15',
    border: 'border-[#E25F38]/50',
    text: 'text-[#F1A28A]',
  }
}

function StateAutocomplete({
  value,
  onChange,
  onSubmit,
  disabled,
  history,
  error,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: (uf: string) => void
  disabled: boolean
  history: string[]
  error?: string | null
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const matches = useMemo(() => {
    const norm = normalizeString(value)
    if (!norm) return []
    return BRAZILIAN_STATES.filter((s) => {
      if (history.includes(s.uf)) return false
      const nameNorm = normalizeString(s.name)
      const capNorm = normalizeString(s.capital)
      return (
        s.uf.toLowerCase().includes(norm) ||
        nameNorm.includes(norm) ||
        capNorm.includes(norm)
      )
    }).slice(0, 8)
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
        <MapPin className="h-5 w-5" style={{ color: '#00B2A9' }} />
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
              if (value.trim()) onSubmit(value.trim())
              return
            }
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault()
              setOpen(true)
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          disabled={disabled}
          placeholder="Digite UF, nome do estado ou capital..."
          className="flex-1 bg-transparent text-base sm:text-lg text-white placeholder:text-[#cbd5e1] outline-none font-mono caret-[#00B2A9] min-h-[32px] cursor-text"
          aria-label="Chutar estado"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="geografia-listbox"
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
          onClick={() => value.trim() && onSubmit(value.trim())}
          disabled={disabled || !value.trim()}
          className="h-11 w-11 text-[#00B2A9] hover:text-[#5BE0D8]"
          aria-label="Enviar chute"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {open && matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-30 mt-1 w-full"
          >
            <ul
              id="geografia-listbox"
              role="listbox"
              className="max-h-64 w-full overflow-auto rounded-xl border border-[#2A4060] bg-[#0F1A2E]/95 shadow-2xl backdrop-blur"
            >
              {matches.map((s) => (
                <li key={s.uf} role="option" aria-selected={value === s.uf || value === s.name}>
                  <button
                    type="button"
                    onClick={() => {
                      onSubmit(s.uf)
                      onChange('')
                      setOpen(false)
                    }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-[#cbd5e1] hover:bg-[#1A2C40] hover:text-white font-mono"
                  >
                    <span className="flex items-center gap-2">
                      <span className="rounded-md bg-[#00B2A9]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#5BE0D8]">
                        {s.uf}
                      </span>
                      <span>{s.name}</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#cbd5e1]">
                      {s.capital}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
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

function SilhouettePlaceholder({ uf, size = 'lg' }: { uf: string; size?: 'sm' | 'md' | 'lg' }) {
  const state = findStateByUf(uf)
  const dim = size === 'lg' ? 'h-44 sm:h-56' : size === 'md' ? 'h-28' : 'h-16'
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-[#2A4060] bg-gradient-to-br from-[#0F1A2E] to-[#1A2C40]',
        dim
      )}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-3 text-center">
        <span className="text-4xl sm:text-5xl" aria-hidden="true">🗺️</span>
        {state ? (
          <>
            <span className="font-mono text-sm font-bold text-[#5BE0D8] sm:text-base">{state.uf}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1] sm:text-xs">
              silhueta do estado
            </span>
            <span className="font-mono text-[9px] text-[#94A3B8]">(placeholder — SVG em breve)</span>
          </>
        ) : (
          <span className="font-mono text-xs text-[#cbd5e1]">???</span>
        )}
      </div>
    </div>
  )
}

function GuessCard({ guess, index }: { guess: GeoGuess; index: number }) {
  const band = proximityBand(guess.distance)
  const colors = bandClasses(band)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className={cn(
        'flex flex-col gap-2 rounded-2xl border p-3 shadow-lg sm:p-4',
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-[#0F1A2E]/80 px-2.5 py-1 font-mono text-base font-black text-white sm:text-lg">
            {guess.uf}
          </span>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-bold text-white sm:text-base">
              {guess.name}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1] sm:text-xs">
              capital: {guess.capital}
            </span>
          </div>
        </div>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
            colors.border,
            colors.text
          )}
        >
          {REGION_LABELS[guess.region as RegionCode]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-[#0F1A2E]/60 p-2 text-center">
          <p className="font-mono text-[9px] uppercase tracking-wider text-[#cbd5e1]">distancia</p>
          <p className={cn('font-mono text-sm font-bold sm:text-base', colors.text)}>
            {formatDistance(guess.distance)}
          </p>
        </div>
        <div className="rounded-lg bg-[#0F1A2E]/60 p-2 text-center">
          <p className="font-mono text-[9px] uppercase tracking-wider text-[#cbd5e1]">direcao</p>
          <p className={cn('flex items-center justify-center gap-1 font-mono text-sm font-bold sm:text-base', colors.text)}>
            <span aria-hidden="true" className="text-lg leading-none">{directionArrow(guess.bearing)}</span>
            <span>{guess.direction}</span>
          </p>
        </div>
        <div className="rounded-lg bg-[#0F1A2E]/60 p-2 text-center">
          <p className="font-mono text-[9px] uppercase tracking-wider text-[#cbd5e1]">proximidade</p>
          <p className={cn('font-mono text-sm font-bold sm:text-base', colors.text)}>
            {guess.proximity}%
          </p>
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0F1A2E]/80">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${guess.proximity}%` }}
          transition={{ duration: 0.6, delay: index * 0.05 + 0.1 }}
          className={cn(
            'h-full rounded-full',
            band === 'perto' && 'bg-[#00B2A9]',
            band === 'medio' && 'bg-[#E3C275]',
            band === 'longe' && 'bg-[#E25F38]'
          )}
        />
      </div>
    </motion.div>
  )
}

function GameOverCard({
  state,
  onBack,
  onReopen,
}: {
  state: GeoState
  onBack: () => void
  onReopen: () => void
}) {
  const target = findStateByUf(state.targetUf)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="geografia-gameover-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onBack()
      }}
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
            <h2 id="geografia-gameover-title" className="font-mono text-lg font-black text-white sm:text-xl">
              {state.isWin ? 'HOMOLOGADO!' : 'PAUTA SEM CONSENSO'}
            </h2>
            <p className="font-mono text-xs text-[#cbd5e1] sm:text-sm">
              {state.isWin
                ? `Voce achou em ${state.currentRow}/${state.maxAttempts} tentativas.`
                : 'Amanha tem mais. Bora estudar geografia?'}
            </p>
          </div>
        </div>
      </div>

      {target && (
        <div className="mt-4 rounded-xl border border-[#2A4060] bg-[#0F1A2E]/70 p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1]">o estado era</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="rounded-lg bg-[#00B2A9]/20 px-2.5 py-1 font-mono text-base font-black text-[#5BE0D8]">
              {target.uf}
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold text-white">{target.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1]">
                capital {target.capital} · {REGION_LABELS[target.region]}
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

export function PitacoGeografiaGame() {
  const navigate = useNavigate()
  const dateKey = useMemo(() => getTodayDateKey(), [])
  const dayNumber = useMemo(() => getDayNumber(), [])

  const [state, setState] = useState<GeoState>(() => {
    const persisted = loadGeoState(dateKey)
    if (persisted) return persisted
    return createInitialGeoState(dateKey, dayNumber)
  })
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const target = useMemo(() => findStateByUf(state.targetUf), [state.targetUf])

  useEffect(() => {
    saveGeoState(dateKey, state)
  }, [state, dateKey])

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 2500)
    return () => clearTimeout(t)
  }, [error])

  const attemptsLeft = state.maxAttempts - state.currentRow

  function handleSubmit(rawGuess: string) {
    if (state.isGameOver) return
    setError(null)
    const result = processGeoGuess(state, rawGuess)
    if (result.error) {
      setError(result.error)
      return
    }
    setState(result.newState)
    setInput('')
  }

  function handleReopen() {
    clearGeoState(dateKey)
    window.location.reload()
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
            type="button"
            onClick={() => navigate('/')}
            className="flex min-h-[44px] items-center gap-1.5 px-2 text-sm text-[#cbd5e1] hover:text-white font-mono"
            aria-label="Voltar ao hall"
          >
            <ArrowLeft className="h-4 w-4" /> hall
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl" aria-hidden="true">🗺️</span>
            <h1 className="font-mono text-base font-black tracking-tight text-white sm:text-xl">
              PITACO <span style={{ color: '#00B2A9' }}>Geografia</span>
            </h1>
          </div>
          <span className="rounded-full border border-[#2A4060] bg-[#0F1A2E]/70 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1]">
            dia #{dayNumber}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" style={{ color: '#00B2A9' }} />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                silhueta do dia
              </h2>
              <span className="ml-auto rounded-full bg-[#0F1A2E]/80 px-2 py-0.5 font-mono text-[10px] text-[#cbd5e1]">
                {state.isGameOver
                  ? state.isWin
                    ? `${state.currentRow}/${state.maxAttempts}`
                    : 'acabou'
                  : `${attemptsLeft} restantes`}
              </span>
            </div>
            <SilhouettePlaceholder uf={state.isGameOver ? state.targetUf : '???'} size="lg" />
            <p className="mt-3 font-mono text-[10px] text-[#cbd5e1] sm:text-xs">
              {state.isGameOver
                ? state.isWin
                  ? 'A silhueta acima era o estado que voce acertou.'
                  : 'A silhueta acima era a resposta. Bora estudar mais!'
                : 'Adivinhe o estado pela silhueta. Vence quem acertar a UF ou o nome em ate 6 tentativas.'}
            </p>
            <p className="mt-1 font-mono text-[9px] text-[#94A3B8]">
              (placeholder: a silhueta real (SVG) entra em uma proxima iteracao)
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
              <GameOverCard state={state} onBack={() => navigate('/')} onReopen={handleReopen} />
            ) : (
              <>
                <StateAutocomplete
                  value={input}
                  onChange={setInput}
                  onSubmit={handleSubmit}
                  disabled={state.isGameOver}
                  history={state.history}
                  error={error}
                />

                <div className="mt-3 space-y-1.5 font-mono text-[10px] text-[#cbd5e1] sm:text-xs">
                  <p>
                    <Check className="mr-1 inline h-3 w-3 text-[#5BE0D8]" />
                    digite a <strong>UF</strong>, o <strong>nome do estado</strong> ou a
                    <strong> capital</strong>.
                  </p>
                  <p>
                    <ChevronDown className="mr-1 inline h-3 w-3 text-[#cbd5e1]" />
                    feedback mostra distancia, direcao (seta) e % de proximidade.
                  </p>
                </div>

                {target && state.isGameOver && (
                  <div className="mt-3 rounded-lg border border-[#2A4060] bg-[#0F1A2E]/60 p-2 font-mono text-[10px] text-[#cbd5e1]">
                    alvo: {target.uf} · {target.name} · {target.capital}
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        <section className="mt-5">
          <h3 className="mb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#cbd5e1]">
            tentativas
            <span className="text-[#94A3B8]">
              ({guessedCount}/{state.maxAttempts})
            </span>
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {state.guesses.map((g, i) => (
              <GuessCard key={`${g.uf}-${i}`} guess={g} index={i} />
            ))}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center rounded-2xl border border-dashed border-[#2A4060]/60 bg-[#0F1A2E]/30 p-4 font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]"
              >
                tentativa {guessedCount + i + 1}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/50 p-4 text-xs text-[#cbd5e1] sm:text-sm">
          <h4 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#cbd5e1]">
            legenda
          </h4>
          <ul className="space-y-1 font-mono">
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#00B2A9] align-middle" />
              <strong className="text-[#5BE0D8]">perto</strong> · menos de 500 km
            </li>
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#E3C275] align-middle" />
              <strong className="text-[#E3C275]">medio</strong> · entre 500 e 1500 km
            </li>
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#E25F38] align-middle" />
              <strong className="text-[#F1A28A]">Alerta RH</strong> · mais de 1500 km
            </li>
          </ul>
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
