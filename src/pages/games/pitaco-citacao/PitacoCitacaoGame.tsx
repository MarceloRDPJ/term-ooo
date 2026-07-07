// src/pages/games/pitaco-citacao/PitacoCitacaoGame.tsx
//
// Tela principal do PITACO Citacao. Inspirado em Loldle Quote:
// o jogador recebe uma citacao do chat do escritorio e tem 6 tentativas
// para adivinhar qual auditor a mandou.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  Quote,
  Send,
  Trophy,
  User,
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
} from '../pitaco-emoji/data'
import {
  findCitacaoById,
} from './data'
import {
  createInitialCitacaoState,
  processCitacaoGuess,
} from './engine'
import { clearCitacaoState, loadCitacaoState, saveCitacaoState } from './storage'
import type { Citacao, CitacaoState, QuoteGuess } from './types'

function AuthorAutocomplete({
  value,
  onChange,
  onSubmit,
  disabled,
  history,
  error,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: (authorId: string) => void
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
        className="flex items-center gap-2 rounded-xl border-2 border-[#2A4060] bg-[#0F1A2E]/90 px-3 py-3 shadow-lg focus-within:border-[#E3C275] focus-within:ring-2 focus-within:ring-[#E3C275]/30"
        onClick={() => inputRef.current?.focus()}
      >
        <User className="h-5 w-5" style={{ color: '#E3C275' }} />
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
          placeholder="Quem mandou essa citacao?..."
          className="flex-1 bg-transparent text-base sm:text-lg text-white placeholder:text-[#cbd5e1] outline-none font-mono caret-[#E3C275] min-h-[32px] cursor-text"
          aria-label="Chutar autor"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="citacao-listbox"
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
          className="h-11 w-11 text-[#F59E0B] hover:text-[#E3C275]"
          aria-label="Enviar chute"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {open && matches.length > 0 && (
          <motion.ul
            id="citacao-listbox"
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

function CitacaoCard({ citacao, revealed }: { citacao: Citacao; revealed: boolean }) {
  const author = findAuditorById(citacao.authorId)
  return (
    <motion.figure
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border-2 border-[#2A4060] bg-gradient-to-br from-[#0F1A2E] to-[#1A2C40] p-5 shadow-2xl sm:p-6"
    >
      <Quote
        className="absolute -left-2 -top-2 h-16 w-16 rotate-180 text-[#F59E0B]/10"
        aria-hidden="true"
      />
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B]/15 text-xl">
          <MessageSquare className="h-5 w-5 text-[#F59E0B]" />
        </div>
        <div className="flex-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1]">
            mensagem do chat
          </p>
          <blockquote className="mt-2 font-mono text-base font-medium italic leading-relaxed text-white sm:text-lg">
            “{citacao.text}”
          </blockquote>
          <figcaption className="mt-3 flex items-center gap-2 font-mono text-xs text-[#cbd5e1]">
            <span>— contexto:</span>
            <span className="rounded-full bg-[#0F1A2E]/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#cbd5e1]">
              {citacao.context}
            </span>
          </figcaption>
          {revealed && author && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-3">
              <span className="text-2xl" aria-hidden="true">
                {author.emojis[0]}
              </span>
              <div className="flex flex-col">
                <span className="font-mono text-sm font-bold text-white">{author.name}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1]">
                  {author.role}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.figure>
  )
}

function GuessCard({ guess }: { guess: QuoteGuess }) {
  const auditor = findAuditorById(guess.authorId)
  const isCorrect = guess.status === 'correct'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'flex items-center gap-3 rounded-2xl border p-3 shadow-lg sm:p-4',
        isCorrect
          ? 'border-[#F59E0B]/60 bg-[#F59E0B]/10'
          : 'border-[#2A4060]/60 bg-[#0F1A2E]/40'
      )}
    >
      <span className="text-3xl sm:text-4xl" aria-hidden="true">
        {auditor?.emojis[0] ?? '❓'}
      </span>
      <div className="flex flex-1 flex-col">
        <span className="font-mono text-sm font-bold text-white sm:text-base">
          {guess.authorName}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1] sm:text-xs">
          {auditor?.role ?? 'auditor'}
        </span>
      </div>
      <span
        className={cn(
          'flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
          isCorrect
            ? 'border-[#F59E0B]/60 bg-[#F59E0B]/20 text-[#E3C275]'
            : 'border-[#2A4060]/60 bg-[#243447]/60 text-[#cbd5e1]'
        )}
      >
        {isCorrect ? (
          <>
            <Check className="h-3 w-3" /> quem falou
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
  state: CitacaoState
  onBack: () => void
  onReopen: () => void
}) {
  const citacao = findCitacaoById(state.targetCitacaoId)

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
      aria-labelledby="citacao-gameover-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onBack()
      }}
      className={cn(
        'rounded-2xl border-2 p-5 shadow-2xl sm:p-6',
        state.isWin
          ? 'border-[#fbbf24] bg-[#F59E0B]/10'
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
          <h2 id="citacao-gameover-title" className="font-mono text-lg font-black text-white sm:text-xl">
            {state.isWin ? 'CITACAO HOMOLOGADA!' : 'PAUTA SEM CONSENSO'}
          </h2>
          <p className="font-mono text-xs text-[#cbd5e1] sm:text-sm">
            {state.isWin
              ? `Voce achou o autor em ${state.currentRow}/${state.maxAttempts} tentativas.`
              : 'Amanha tem mais. Bora stalkear o chat?'}
          </p>
        </div>
      </div>

      {citacao && (
        <div className="mt-4">
          <CitacaoCard citacao={citacao} revealed />
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

export function PitacoCitacaoGame() {
  const navigate = useNavigate()
  const dateKey = useMemo(() => getTodayDateKey(), [])
  const dayNumber = useMemo(() => getDayNumber(), [])

  const [state, setState] = useState<CitacaoState>(() => {
    const persisted = loadCitacaoState(dateKey)
    if (persisted) return persisted
    return createInitialCitacaoState(dateKey, dayNumber)
  })
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const target: Citacao | undefined = useMemo(
    () => findCitacaoById(state.targetCitacaoId),
    [state.targetCitacaoId]
  )

  // Debounce 100ms para evitar travamento em trocas rapidas de state.
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current)
    }
    saveDebounceRef.current = setTimeout(() => {
      saveCitacaoState(dateKey, state)
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
    const result = processCitacaoGuess(state, rawGuess)
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
    clearCitacaoState(dateKey)
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
            <span className="text-xl sm:text-2xl" aria-hidden="true">💬</span>
            <h1 className="font-mono text-base font-black tracking-tight text-white sm:text-xl">
              PITACO <span style={{ color: '#F59E0B' }}>Citacao</span>
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
              <MessageSquare className="h-4 w-4" style={{ color: '#F59E0B' }} />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                citacao do dia
              </h2>
              <span className="ml-auto rounded-full bg-[#0F1A2E]/80 px-2 py-0.5 font-mono text-[10px] text-[#cbd5e1]">
                {state.isGameOver
                  ? state.isWin
                    ? `${state.currentRow}/${state.maxAttempts}`
                    : 'acabou'
                  : `${attemptsLeft} restantes`}
              </span>
            </div>
            {target && <CitacaoCard citacao={target} revealed={state.isGameOver} />}
            <p className="mt-3 font-mono text-[10px] text-[#cbd5e1] sm:text-xs">
              {state.isGameOver
                ? state.isWin
                  ? 'Voce descobriu quem mandou essa mensagem.'
                  : 'O autor da mensagem foi revelado acima. Bora ler o chat!'
                : 'Adivinhe o auditor que mandou essa mensagem. Pense em tom, vocabulario e contexto.'}
            </p>
          </section>

          <section className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" style={{ color: '#F59E0B' }} />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                chute
              </h2>
            </div>

            {state.isGameOver ? (
              <GameOverCard state={state} onBack={() => navigate('/')} onReopen={handleReopen} />
            ) : (
              <>
                <AuthorAutocomplete
                  value={input}
                  onChange={setInput}
                  onSubmit={handleAutocompleteSubmit}
                  disabled={state.isGameOver}
                  history={state.history}
                  error={error}
                />

                <div className="mt-3 space-y-1.5 font-mono text-[10px] text-[#cbd5e1] sm:text-xs">
                  <p>
                    <Check className="mr-1 inline h-3 w-3 text-[#E3C275]" />
                    digite o <strong>nome</strong> ou o <strong>apelido</strong> do autor.
                  </p>
                  <p>
                    <ChevronDown className="mr-1 inline h-3 w-3 text-[#cbd5e1]" />
                    acerto = verde. erro = cinza. autor revelado no fim.
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
              <GuessCard key={`${g.authorId}-${i}`} guess={g} />
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
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#F59E0B] align-middle" />
              <strong className="text-[#E3C275]">amarelo</strong> · acertou o autor da citacao
            </li>
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#94A3B8] align-middle" />
              <strong className="text-[#cbd5e1]">cinza</strong> · autor diferente do alvo
            </li>
            <li className="text-[#cbd5e1]">
              as citacoes sao ficticias, mas o tom e de escritorio mesmo. pense em quem fala assim.
            </li>
          </ul>
        </section>
      </main>

      <StarsBackground
        className="fixed inset-0 z-0 max-h-dvh max-w-full opacity-10"
        pointerEvents={false}
      />

      <div className="fixed bottom-2 right-2 z-[5] pointer-events-none">
        <span className="font-mono text-[8px] text-[#94A3B8]/50 md:text-xs">v{APP_VERSION}</span>
      </div>
    </div>
  )
}
