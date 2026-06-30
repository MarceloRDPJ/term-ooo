// src/pages/games/narutodle/NarutodleGame.tsx
//
// Tela principal do Narutodle. Inspirado em narutodle.net (modo classico):
// 8 tentativas para adivinhar um personagem de Naruto Shippuden a partir
// de 7 atributos categoricos (cla, vila, rank, kekkei genkai, elemento,
// afiliacao, genero). Feedback colorido por atributo (verde = correto,
// amarelo = perto apenas no rank, vermelho = errado).
//
// Persistencia: localStorage com chave `narutodle:state:${dateKey}`.
// Auto-save em todo useEffect de mudanca de state.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  ChevronDown,
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
import { normalizeString, cn } from '@/lib/utils'
import { NARUTO_CHARACTERS } from './characters'
import {
  createInitialNarutodleState,
  processNarutodleGuess,
} from './engine'
import {
  loadNarutodleState,
  saveNarutodleState,
} from './storage'
import {
  ATTRIBUTE_LABELS,
  NARUTODLE_ATTRIBUTES,
  type NarutodleAttributeKey,
  type NarutodleCharacter,
  type NarutodleFeedbackStatus,
  type NarutodleGuess,
  type NarutodleState,
} from './types'

// Cores do tema Naruto (laranja + preto, paleta da roupa do protagonista)
const THEME = {
  accent: '#F59E0B',
  accentSoft: '#FBBF24',
  near: '#FBBF24',
  wrong: '#E25F38',
  wrongText: '#F1A28A',
}

function feedbackClasses(status: NarutodleFeedbackStatus): {
  bg: string
  border: string
  text: string
} {
  if (status === 'correct') {
    return {
      bg: 'bg-[#00B2A9]/20',
      border: 'border-[#00B2A9]/60',
      text: 'text-[#5BE0D8]',
    }
  }
  if (status === 'near') {
    return {
      bg: 'bg-[#E3C275]/20',
      border: 'border-[#E3C275]/60',
      text: 'text-[#E3C275]',
    }
  }
  return {
    bg: 'bg-[#E25F38]/15',
    border: 'border-[#E25F38]/50',
    text: 'text-[#F1A28A]',
  }
}

function CharacterAutocomplete({
  value,
  onChange,
  onSubmit,
  disabled,
  history,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: (id: string) => void
  disabled: boolean
  history: string[]
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const matches = useMemo(() => {
    const norm = normalizeString(value)
    if (!norm) return []
    return NARUTO_CHARACTERS.filter((c) => {
      if (history.includes(c.id)) return false
      return (
        c.id.toLowerCase().includes(norm) ||
        normalizeString(c.name).includes(norm)
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
      <div className="flex items-center gap-2 rounded-xl border border-[#2A4060] bg-[#0F1A2E]/80 px-3 py-2 shadow-lg focus-within:border-[#F59E0B]">
        <Target className="h-4 w-4" style={{ color: '#F59E0B' }} />
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
              if (value.trim()) onSubmit(value.trim())
            }
          }}
          disabled={disabled}
          placeholder="Digite o nome do personagem (ex: Naruto, Sasuke)..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none font-mono"
          aria-label="Chutar personagem"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => value.trim() && onSubmit(value.trim())}
          disabled={disabled || !value.trim()}
          className="h-8 w-8 text-[#F59E0B] hover:text-[#E3C275]"
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
                  <span>{c.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-300">
                    {c.clan === 'Nenhum' ? '—' : c.clan} · {c.vila}
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

function AttributeCell({
  label,
  value,
  status,
  index,
}: {
  label: string
  value: string
  status: NarutodleFeedbackStatus
  index: number
}) {
  const colors = feedbackClasses(status)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={cn(
        'flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-xl border p-2 shadow-md sm:min-h-[80px] sm:p-3',
        colors.bg,
        colors.border
      )}
      title={`${label}: ${value}`}
    >
      <span className="font-mono text-[8px] uppercase tracking-wider text-slate-300 sm:text-[9px]">
        {label}
      </span>
      <span
        className={cn(
          'text-center font-mono text-[10px] font-bold leading-tight sm:text-xs',
          colors.text
        )}
      >
        {value}
      </span>
    </motion.div>
  )
}

function GuessRow({
  guess,
  guessedCharacter,
  index,
}: {
  guess: NarutodleGuess
  guessedCharacter: NarutodleCharacter | undefined
  index: number
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 px-1">
        <span className="rounded-md bg-[#0F1A2E]/80 px-2 py-0.5 font-mono text-[10px] font-bold text-white sm:text-xs">
          #{index + 1}
        </span>
        <span className="font-mono text-xs font-bold text-white sm:text-sm">
          {guess.characterName}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {NARUTODLE_ATTRIBUTES.map((attr, i) => {
          const status = guess.feedback[attr]
          const value = guessedCharacter
            ? String(guessedCharacter[attr])
            : '?'
          return (
            <AttributeCell
              key={attr}
              label={ATTRIBUTE_LABELS[attr]}
              value={value}
              status={status}
              index={i}
            />
          )
        })}
      </div>
    </div>
  )
}

function GameOverCard({
  state,
  characters,
  onBack,
}: {
  state: NarutodleState
  characters: NarutodleCharacter[]
  onBack: () => void
}) {
  const target = characters.find((c) => c.id === state.targetId)
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
            <X className="h-7 w-7" style={{ color: THEME.wrongText }} />
          )}
          <div>
            <h2 className="font-mono text-lg font-black text-white sm:text-xl">
              {state.isWin ? 'BELA JOGADA, HOKAGE!' : 'FIM DE JOGO'}
            </h2>
            <p className="font-mono text-xs text-slate-300 sm:text-sm">
              {state.isWin
                ? `Voce descobriu o personagem em ${state.currentRow}/${state.maxAttempts} tentativas.`
                : 'Amanha tem mais ninja pra adivinhar. Bora estudar a aldeia?'}
            </p>
          </div>
        </div>
      </div>

      {target && (
        <div className="mt-4 rounded-xl border border-[#2A4060] bg-[#0F1A2E]/70 p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-300">
            o ninja era
          </p>
          <div className="mt-1 flex items-center gap-3">
            <span
              className="rounded-lg px-2.5 py-1 font-mono text-base font-black"
              style={{ background: 'rgba(245,158,11,0.2)', color: '#FCD34D' }}
            >
              {target.name}
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-300">
                {target.clan === 'Nenhum' ? 'sem cla' : target.clan} · {target.vila} · {target.rank}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-300">
                {target.kekkeiGenkai === 'Nenhum' ? 'sem KG' : target.kekkeiGenkai} · {target.elemento}
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

export function NarutodleGame() {
  const navigate = useNavigate()
  const dateKey = useMemo(() => getTodayDateKey(), [])
  const dayNumber = useMemo(() => getDayNumber(), [])

  const [state, setState] = useState<NarutodleState>(() => {
    const persisted = loadNarutodleState(dateKey)
    if (persisted) return persisted
    return createInitialNarutodleState(dateKey, dayNumber, NARUTO_CHARACTERS)
  })
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Auto-save sempre que o state muda
  useEffect(() => {
    saveNarutodleState(dateKey, state)
  }, [state, dateKey])

  const attemptsLeft = state.maxAttempts - state.currentRow
  const target = useMemo(
    () => NARUTO_CHARACTERS.find((c) => c.id === state.targetId),
    [state.targetId]
  )

  function handleSubmit(rawGuess: string) {
    if (state.isGameOver) return
    setError(null)
    const result = processNarutodleGuess(state, rawGuess, NARUTO_CHARACTERS)
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
            <span className="text-xl sm:text-2xl" aria-hidden="true">🍥</span>
            <h1 className="font-mono text-base font-black tracking-tight text-white sm:text-xl">
              NARUTO<span style={{ color: '#F59E0B' }}>DLE</span>
            </h1>
          </div>
          <span
            className="rounded-full border border-[#2A4060] bg-[#0F1A2E]/70 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-300"
          >
            dia #{dayNumber}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" style={{ color: '#F59E0B' }} />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                ninja do dia
              </h2>
              <span className="ml-auto rounded-full bg-[#0F1A2E]/80 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                {state.isGameOver
                  ? state.isWin
                    ? `${state.currentRow}/${state.maxAttempts}`
                    : 'acabou'
                  : `${attemptsLeft} restantes`}
              </span>
            </div>
            <div
              className="relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-[#2A4060] bg-gradient-to-br from-[#0F1A2E] to-[#1A2C40] p-5 sm:p-6"
              style={{ minHeight: 180 }}
            >
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <span className="text-5xl sm:text-6xl" aria-hidden="true">
                  {state.isGameOver ? '🍥' : '?'}
                </span>
                {state.isGameOver && target ? (
                  <>
                    <span
                      className="font-mono text-lg font-black sm:text-xl"
                      style={{ color: '#FCD34D' }}
                    >
                      {target.name}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-300 sm:text-xs">
                      {target.clan === 'Nenhum' ? 'sem cla' : target.clan} · {target.vila}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-300 sm:text-xs">
                      rank {target.rank} · {target.kekkeiGenkai === 'Nenhum' ? 'sem KG' : target.kekkeiGenkai}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-300 sm:text-xs">
                      elemento {target.elemento} · {target.afiliacao}
                    </span>
                  </>
                ) : (
                  <span className="font-mono text-xs text-slate-300 sm:text-sm">
                    Quem e o ninja do dia? Chute um personagem abaixo.
                  </span>
                )}
              </div>
            </div>
            <p className="mt-3 font-mono text-[10px] text-slate-300 sm:text-xs">
              {state.isGameOver
                ? state.isWin
                  ? 'Voce descobriu o ninja antes de acabar as tentativas.'
                  : 'O ninja acima era a resposta. Bora estudar a vila oculta!'
                : 'Adivinhe o ninja do dia em ate 8 tentativas. Feedback colorido por atributo.'}
            </p>
          </section>

          <section className="rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: '#F59E0B' }} />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                chute
              </h2>
            </div>

            {state.isGameOver ? (
              <GameOverCard
                state={state}
                characters={NARUTO_CHARACTERS}
                onBack={() => navigate('/')}
              />
            ) : (
              <>
                <CharacterAutocomplete
                  value={input}
                  onChange={setInput}
                  onSubmit={handleSubmit}
                  disabled={state.isGameOver}
                  history={state.history}
                />
                {error && (
                  <div className="mt-2 rounded-lg border border-[#E25F38]/50 bg-[#E25F38]/10 p-2 font-mono text-xs" style={{ color: THEME.wrongText }}>
                    {error}
                  </div>
                )}

                <div className="mt-3 space-y-1.5 font-mono text-[10px] text-slate-300 sm:text-xs">
                  <p>
                    <Check className="mr-1 inline h-3 w-3 text-[#5BE0D8]" />
                    digite o <strong>nome do personagem</strong> (autocomplete aparece).
                  </p>
                  <p>
                    <ChevronDown className="mr-1 inline h-3 w-3 text-slate-300" />
                    feedback mostra 7 atributos: verde = certo, amarelo = perto (so no rank), vermelho = errado.
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
          <div className="space-y-3">
            {state.guesses.map((g, i) => {
              const ch = NARUTO_CHARACTERS.find((c) => c.id === g.characterId)
              return <GuessRow key={`${g.characterId}-${i}`} guess={g} guessedCharacter={ch} index={i} />
            })}
            {Array.from({ length: emptyRows }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="grid grid-cols-7 gap-1 sm:gap-1.5"
                aria-hidden="true"
              >
                {NARUTODLE_ATTRIBUTES.map((attr) => (
                  <div
                    key={attr}
                    className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#2A4060]/60 bg-[#0F1A2E]/30 p-2 sm:min-h-[80px]"
                  >
                    <span className="font-mono text-[8px] uppercase tracking-wider text-slate-500 sm:text-[9px]">
                      {ATTRIBUTE_LABELS[attr as NarutodleAttributeKey]}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 sm:text-xs">
                      ?
                    </span>
                  </div>
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
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#00B2A9] align-middle" />
              <strong className="text-[#5BE0D8]">correto</strong> · atributo bate com o alvo
            </li>
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#E3C275] align-middle" />
              <strong className="text-[#E3C275]">perto</strong> · apenas no rank (diferenca de 1 nivel)
            </li>
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#E25F38] align-middle" />
              <strong className="text-[#F1A28A]">errado</strong> · atributo nao bate
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
