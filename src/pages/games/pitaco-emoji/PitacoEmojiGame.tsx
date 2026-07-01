// src/pages/games/pitaco-emoji/PitacoEmojiGame.tsx
//
// Tela principal do PITACO Emoji. Inspirado em Loldle Emoji:
// o jogador recebe uma combinacao de 3-5 emojis e tenta adivinhar
// qual auditor do escritorio ela representa, em ate 6 tentativas.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  HelpCircle,
  Send,
  Smile,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarsBackground } from '@/components/animate-ui/components/backgrounds/stars'
import { APP_VERSION } from '@/lib/version'
import { getTodayDateKey, getDayNumber } from '@/lib/dates'
import { cn, normalizeString } from '@/lib/utils'
import {
  EMOJI_AUDITORES,
  findAuditorById,
  findAuditorByQuery,
} from './data'
import {
  createInitialEmojiState,
  processEmojiGuess,
} from './engine'
import { clearEmojiState, loadEmojiState, saveEmojiState } from './storage'
import type { EmojiAuditor, EmojiGuess, EmojiState } from './types'

function AuditorAutocomplete({
  value,
  onChange,
  onSubmit,
  disabled,
  history,
  error,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: (auditorId: string) => void
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
    return EMOJI_AUDITORES.filter((a) => {
      if (history.includes(a.id)) return false
      const nameNorm = normalizeString(a.name)
      const nickNorm = normalizeString(a.nickname)
      return nameNorm.includes(norm) || nickNorm.includes(norm)
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
        <Smile className="h-5 w-5" style={{ color: '#00B2A9' }} />
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
          placeholder="Digite o nome ou apelido..."
          className="flex-1 bg-transparent text-base sm:text-lg text-white placeholder:text-[#cbd5e1] outline-none font-mono caret-[#00B2A9] min-h-[32px] cursor-text"
          aria-label="Chutar auditor"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="emoji-listbox"
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
          <motion.ul
            id="emoji-listbox"
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[#2A4060] bg-[#0F1A2E]/95 shadow-2xl backdrop-blur"
          >
            {matches.map((a) => (
              <li key={a.id} role="option" aria-selected={value === a.nickname}>
                <button
                  type="button"
                  onClick={() => {
                    onSubmit(a.id)
                    onChange('')
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-[#cbd5e1] hover:bg-[#1A2C40] hover:text-white font-mono"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base" aria-hidden="true">
                      {a.emojis[0]}
                    </span>
                    <span>{a.nickname}</span>
                    <span className="text-[10px] text-[#cbd5e1]">· {a.role}</span>
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

function EmojiDisplay({ emojis, size = 'lg', revealed }: { emojis: string[]; size?: 'sm' | 'md' | 'lg'; revealed: boolean }) {
  const dim =
    size === 'lg'
      ? 'text-5xl sm:text-6xl'
      : size === 'md'
      ? 'text-3xl'
      : 'text-xl'
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#2A4060] bg-gradient-to-br from-[#0F1A2E] to-[#1A2C40] p-4 sm:p-5',
        size === 'lg' ? 'min-h-[120px] sm:min-h-[150px]' : 'min-h-[60px]'
      )}
      aria-label={revealed ? 'emojis do auditor' : 'emojis misteriosos'}
    >
      {emojis.map((e, i) => (
        <motion.span
          key={`${e}-${i}`}
          initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.35, delay: i * 0.08, type: 'spring', stiffness: 220 }}
          className={cn('leading-none', dim)}
          aria-hidden="true"
        >
          {e}
        </motion.span>
      ))}
    </div>
  )
}

function GuessCard({ guess }: { guess: EmojiGuess }) {
  const auditor = findAuditorById(guess.auditorId)
  const isCorrect = guess.status === 'correct'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'flex items-center gap-3 rounded-2xl border p-3 shadow-lg sm:p-4',
        isCorrect
          ? 'border-[#00B2A9]/60 bg-[#00B2A9]/10'
          : 'border-[#2A4060]/60 bg-[#0F1A2E]/40'
      )}
    >
      <span className="text-3xl sm:text-4xl" aria-hidden="true">
        {auditor?.emojis[0] ?? '❓'}
      </span>
      <div className="flex flex-1 flex-col">
        <span className="font-mono text-sm font-bold text-white sm:text-base">
          {guess.auditorName}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1] sm:text-xs">
          {auditor?.role ?? 'auditor'}
        </span>
      </div>
      <span
        className={cn(
          'flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
          isCorrect
            ? 'border-[#00B2A9]/60 bg-[#00B2A9]/20 text-[#5BE0D8]'
            : 'border-[#2A4060]/60 bg-[#243447]/60 text-[#cbd5e1]'
        )}
      >
        {isCorrect ? (
          <>
            <Check className="h-3 w-3" /> homologado
          </>
        ) : (
          <>
            <X className="h-3 w-3" /> errado
          </>
        )}
      </span>
    </motion.div>
  )
}

function GameOverCard({
  state,
  onBack,
  onReopen,
}: {
  state: EmojiState
  onBack: () => void
  onReopen: () => void
}) {
  const target = findAuditorById(state.targetId)

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
      aria-labelledby="emoji-gameover-title"
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
      <div className="flex items-start gap-3">
        {state.isWin ? (
          <Trophy className="h-7 w-7 text-[#fbbf24]" />
        ) : (
          <X className="h-7 w-7 text-[#F1A28A]" />
        )}
        <div>
          <h2 id="emoji-gameover-title" className="font-mono text-lg font-black text-white sm:text-xl">
            {state.isWin ? 'HOMOLOGADO!' : 'PAUTA SEM CONSENSO'}
          </h2>
          <p className="font-mono text-xs text-[#cbd5e1] sm:text-sm">
            {state.isWin
              ? `Voce decifrou em ${state.currentRow}/${state.maxAttempts} tentativas.`
              : 'Amanha tem mais. Bora ler o chat?'}
          </p>
        </div>
      </div>

      {target && (
        <div className="mt-4 rounded-xl border border-[#2A4060] bg-[#0F1A2E]/70 p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1]">o auditor era</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              {target.emojis[0]}
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold text-white sm:text-base">
                {target.name}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1] sm:text-xs">
                {target.role}
              </span>
            </div>
          </div>
          <p className="mt-2 font-mono text-[10px] italic text-[#cbd5e1] sm:text-xs">
            {target.emojiHint}
          </p>
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

export function PitacoEmojiGame() {
  const navigate = useNavigate()
  const dateKey = useMemo(() => getTodayDateKey(), [])
  const dayNumber = useMemo(() => getDayNumber(), [])

  const [state, setState] = useState<EmojiState>(() => {
    const persisted = loadEmojiState(dateKey)
    if (persisted) return persisted
    return createInitialEmojiState(dateKey, dayNumber)
  })
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const target: EmojiAuditor | undefined = useMemo(
    () => findAuditorById(state.targetId),
    [state.targetId]
  )

  // Debounce 100ms para evitar travamento em trocas rapidas de state.
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current)
    }
    saveDebounceRef.current = setTimeout(() => {
      saveEmojiState(dateKey, state)
      saveDebounceRef.current = null
    }, 100)
    return () => {
      if (saveDebounceRef.current) {
        clearTimeout(saveDebounceRef.current)
        saveDebounceRef.current = null
      }
    }
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
    const result = processEmojiGuess(state, rawGuess)
    if (result.error) {
      setError(result.error)
      return
    }
    setState(result.newState)
    setInput('')
  }

  function handleAutocompleteSubmit(value: string) {
    const found = findAuditorByQuery(value)
    if (found) {
      handleSubmit(found.name)
    } else {
      handleSubmit(value)
    }
  }

  function handleReopen() {
    clearEmojiState(dateKey)
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
            <span className="text-xl sm:text-2xl" aria-hidden="true">😀</span>
            <h1 className="font-mono text-base font-black tracking-tight text-white sm:text-xl">
              PITACO <span style={{ color: '#00B2A9' }}>Emoji</span>
            </h1>
          </div>
          <span
            className={cn(
              'rounded-full border bg-[#0F1A2E]/70 px-2 py-1 font-mono text-[10px] uppercase tracking-wider',
              state.isWin
                ? 'border-[#00B2A9] text-[#fbbf24]'
                : 'border-[#2A4060] text-[#cbd5e1]'
            )}
          >
            dia #{dayNumber}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: '#E3C275' }} />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                emojis do dia
              </h2>
              <span className="ml-auto rounded-full bg-[#0F1A2E]/80 px-2 py-0.5 font-mono text-[10px] text-[#cbd5e1]">
                {state.isGameOver
                  ? state.isWin
                    ? `${state.currentRow}/${state.maxAttempts}`
                    : 'acabou'
                  : `${attemptsLeft} restantes`}
              </span>
            </div>
            <EmojiDisplay emojis={target?.emojis ?? []} size="lg" revealed={state.isGameOver} />
            <p className="mt-3 font-mono text-[10px] text-[#cbd5e1] sm:text-xs">
              {state.isGameOver
                ? state.isWin
                  ? 'Os emojis acima era o auditor que voce acertou.'
                  : 'Os emojis acima era a resposta. Bora ler o chat!'
                : 'Decifre o auditor pela combinacao de emojis. Pense em hobby, funcao e personalidade.'}
            </p>
          </section>

          <section className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" style={{ color: '#00B2A9' }} />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                chute
              </h2>
            </div>

            {state.isGameOver ? (
              <GameOverCard state={state} onBack={() => navigate('/')} onReopen={handleReopen} />
            ) : (
              <>
                <AuditorAutocomplete
                  value={input}
                  onChange={setInput}
                  onSubmit={handleAutocompleteSubmit}
                  disabled={state.isGameOver}
                  history={state.history}
                  error={error}
                />

                <div className="mt-3 space-y-1.5 font-mono text-[10px] text-[#cbd5e1] sm:text-xs">
                  <p>
                    <Check className="mr-1 inline h-3 w-3 text-[#5BE0D8]" />
                    digite o <strong>nome</strong> ou o <strong>apelido</strong> do auditor.
                  </p>
                  <p>
                    <ChevronDown className="mr-1 inline h-3 w-3 text-[#cbd5e1]" />
                    acerto = verde. erro = cinza. o auditor fica revelado no fim.
                  </p>
                </div>
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
              <GuessCard key={`${g.auditorId}-${i}`} guess={g} />
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
            como jogar
          </h4>
          <ul className="space-y-1 font-mono">
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#00B2A9] align-middle" />
              <strong className="text-[#5BE0D8]">verde</strong> · acertou o auditor
            </li>
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#94A3B8] align-middle" />
              <strong className="text-[#cbd5e1]">cinza</strong> · auditor diferente do alvo
            </li>
            <li className="text-[#cbd5e1]">
              cada emoji e uma pista. pense em hobby, funcao, manias do escritorio.
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
