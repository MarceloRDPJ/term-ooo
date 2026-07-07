// src/pages/games/pokedle/PokedleGame.tsx

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { ArrowLeft, Check, RotateCcw, Search, Send, Sparkles, Target, Trophy, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarsBackground } from '@/components/animate-ui/components/backgrounds/stars'
import { getDayNumber, getTodayDateKey } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { APP_VERSION } from '@/lib/version'
import { createInitialPokedleState, formatAttributeValue, processPokedleGuess, searchPokemon } from './engine'
import { findPokemonById, POKEMON } from './pokemon'
import { getPokemonArtworkUrl, getPokemonInitials } from './pokemon-assets'
import { clearPokedleState, loadPokedleState, savePokedleState } from './storage'
import { ATTRIBUTE_LABELS, POKEDLE_ATTRIBUTES, type PokedleAttributeKey, type PokedleFeedbackStatus, type PokedleGuess, type PokedlePokemon, type PokedleState } from './types'

function statusClasses(status: PokedleFeedbackStatus): string {
  if (status === 'correct') return 'border-[#22C55E]/70 bg-[#22C55E]/20 text-[#BBF7D0]'
  if (status === 'near') return 'border-[#FACC15]/75 bg-[#FACC15]/18 text-[#FDE68A]'
  return 'border-[#334155] bg-[#0F172A]/80 text-[#CBD5E1]'
}

function PokemonPortrait({ pokemon, className, alt = '' }: { pokemon: PokedlePokemon; className?: string; alt?: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <span className={cn('inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#2A4060] bg-[#E8F8FF] font-mono text-xs font-black text-[#0F172A]', className)}>
      {!failed ? (
        <img src={getPokemonArtworkUrl(pokemon)} alt={alt} className="h-full w-full object-contain p-0.5" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      ) : (
        getPokemonInitials(pokemon)
      )}
    </span>
  )
}

function PokemonPreviewStrip() {
  return (
    <div className="mt-1 flex flex-wrap justify-center gap-1.5" aria-hidden="true">
      {POKEMON.slice(0, 6).map((pokemon) => (
        <PokemonPortrait key={pokemon.id} pokemon={pokemon} className="h-9 w-9 rounded-lg" />
      ))}
    </div>
  )
}

function PokemonAutocomplete({ value, onChange, onSubmit, disabled, history, error }: {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  disabled: boolean
  history: number[]
  error: string | null
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const matches = useMemo(() => searchPokemon(value, 10).filter((pokemon) => !history.includes(pokemon.id)), [history, value])

  useEffect(() => {
    function close(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex min-h-[64px] items-center gap-2 rounded-2xl border-2 border-[#2A4060] bg-[#07111F] px-3 shadow-lg focus-within:border-[#EF4444] focus-within:ring-2 focus-within:ring-[#EF4444]/25">
        <Search className="h-5 w-5 text-[#EF4444]" />
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && value.trim()) {
              event.preventDefault()
              onSubmit(matches[0]?.name ?? value.trim())
              onChange('')
              setOpen(false)
            }
          }}
          disabled={disabled}
          placeholder="Type Pokemon name ..."
          className="min-h-[40px] flex-1 bg-transparent font-mono text-base text-white outline-none placeholder:text-slate-400 sm:text-lg"
          aria-invalid={!!error}
          autoComplete="off"
        />
        <Button type="button" size="icon" variant="ghost" disabled={disabled || !value.trim()} onClick={() => { onSubmit(matches[0]?.name ?? value.trim()); onChange(''); setOpen(false) }} className="text-[#EF4444] hover:text-[#FCA5A5]">
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {open && matches.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-2xl border border-[#2A4060] bg-[#0B1628] shadow-2xl">
          {matches.map((pokemon) => (
            <li key={pokemon.id}>
              <button type="button" onClick={() => { onSubmit(pokemon.name); onChange(''); setOpen(false) }} className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left font-mono text-sm text-slate-200 hover:bg-[#132338]">
                <span className="flex min-w-0 items-center gap-2">
                  <PokemonPortrait pokemon={pokemon} className="h-9 w-9 rounded-lg" />
                  <span className="truncate">{pokemon.name}</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">{pokemon.types.join(' / ')} · Gen {pokemon.generation}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <div className="mt-2 rounded-lg border border-[#EF4444]/50 bg-[#EF4444]/10 p-2 font-mono text-xs text-[#FCA5A5]">{error}</div>}
    </div>
  )
}

function AttributeCell({ attr, pokemon, status }: { attr: PokedleAttributeKey; pokemon: PokedlePokemon; status: PokedleFeedbackStatus }) {
  return (
    <div className={cn('flex min-h-[78px] flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center shadow-md', statusClasses(status))}>
      <span className="font-mono text-[8px] uppercase tracking-wider text-slate-200/80">{ATTRIBUTE_LABELS[attr]}</span>
      <span className="font-mono text-[10px] font-bold leading-tight sm:text-xs">{formatAttributeValue(pokemon, attr)}</span>
    </div>
  )
}

function GuessRow({ guess, index }: { guess: PokedleGuess; index: number }) {
  const pokemon = findPokemonById(guess.pokemonId)
  if (!pokemon) return null
  return (
    <div className="rounded-2xl border border-[#20364A] bg-[#0B1628]/80 p-2 shadow-lg shadow-black/15">
      <div className="mb-2 flex items-center gap-2 px-1 font-mono text-sm font-black text-white">
        <PokemonPortrait pokemon={pokemon} className="h-10 w-10 rounded-xl" />
        <span className="rounded bg-[#07111F] px-2 py-0.5 text-xs">#{index + 1}</span>
        {guess.pokemonName}
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
        {POKEDLE_ATTRIBUTES.map((attr) => <AttributeCell key={attr} attr={attr} pokemon={pokemon} status={guess.feedback[attr]} />)}
      </div>
    </div>
  )
}

function GameOverCard({ state, target, onBack, onReopen }: { state: PokedleState; target?: PokedlePokemon; onBack: () => void; onReopen: () => void }) {
  useEffect(() => {
    if (!state.isWin) return
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.65 } })
  }, [state.isWin])

  return (
    <div className={cn('rounded-2xl border-2 p-5 shadow-xl shadow-black/25', state.isWin ? 'border-[#22C55E] bg-[#22C55E]/10' : 'border-[#EF4444]/70 bg-[#EF4444]/10')}>
      <div className="flex items-center gap-3">
        {state.isWin ? <Trophy className="h-7 w-7 text-[#FACC15]" /> : <X className="h-7 w-7 text-[#FCA5A5]" />}
        <div>
          <h2 className="font-mono text-xl font-black text-white">{state.isWin ? 'You found it!' : 'Game over'}</h2>
          <p className="font-mono text-xs text-slate-300">I found #Pokedle Pokemon #{state.dayNumber} {state.currentRow}/{state.maxAttempts}</p>
        </div>
      </div>
      {target && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#20364A] bg-[#07111F]/85 p-3 font-mono text-sm text-slate-200">
          <PokemonPortrait pokemon={target} className="h-16 w-16 rounded-2xl" alt={target.name} />
          <div>
            Answer: <strong className="text-[#FACC15]">{target.name}</strong>
            <div className="mt-1 text-xs text-slate-400">{target.types.join(' / ')} · Gen {target.generation} · {target.habitat}</div>
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onBack} variant="outline" className="border-[#2A4060] bg-transparent font-mono text-xs text-slate-200"><ArrowLeft className="mr-2 h-4 w-4" />hall</Button>
        <Button onClick={onReopen} variant="outline" className="border-[#2A4060] bg-transparent font-mono text-xs text-slate-200"><RotateCcw className="mr-2 h-4 w-4" />reopen</Button>
      </div>
    </div>
  )
}

export function PokedleGame() {
  const navigate = useNavigate()
  const dateKey = useMemo(() => getTodayDateKey(), [])
  const dayNumber = useMemo(() => getDayNumber(), [])
  const [state, setState] = useState<PokedleState>(() => loadPokedleState(dateKey) ?? createInitialPokedleState(dateKey, dayNumber))
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const attemptsRef = useRef<HTMLDivElement | null>(null)
  const target = useMemo(() => findPokemonById(state.targetId), [state.targetId])
  const emptyRows = Math.max(0, state.maxAttempts - state.guesses.length)

  useEffect(() => savePokedleState(dateKey, state), [dateKey, state])
  useEffect(() => {
    if (state.guesses.length > 0) attemptsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [state.guesses.length])

  function handleSubmit(rawGuess: string) {
    const result = processPokedleGuess(state, rawGuess)
    if (result.error) {
      setError(result.error)
      return
    }
    setState(result.newState)
    setInput('')
    setError(null)
  }

  function handleReopen() {
    clearPokedleState(dateKey)
    setState(createInitialPokedleState(dateKey, dayNumber))
    setInput('')
    setError(null)
  }

  return (
    <div className="min-h-screen w-full text-white" style={{ background: 'radial-gradient(circle at top left, rgba(239, 68, 68, 0.14), transparent 34%), linear-gradient(180deg, #07111F 0%, #0B1424 52%, #070D18 100%)' }}>
      <StarsBackground className="fixed inset-0 z-0 max-h-dvh max-w-full opacity-10" pointerEvents={false} />
      <header className="relative z-10 border-b border-[#20364A] bg-[#07111F]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 font-mono text-sm text-slate-300 hover:text-white"><ArrowLeft className="h-4 w-4" />hall</button>
          <div className="text-center"><h1 className="font-mono text-2xl font-black text-[#EF4444]">POKEDLE</h1><p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#FACC15]">Daily Pokemon Game · Classic</p></div>
          <span className="rounded-full border border-[#20364A] bg-[#0B1628] px-3 py-1 font-mono text-[10px] text-slate-300">{dateKey}</span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-3 py-5 sm:px-4">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border border-[#20364A] bg-[#0B1628]/95 p-4 shadow-xl shadow-black/25">
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#EF4444]/40 bg-[#07111F]/80 px-3 py-2"><Sparkles className="h-4 w-4 text-[#EF4444]" /><h2 className="font-mono text-lg font-black uppercase text-[#EF4444]">Classic</h2><span className="ml-auto font-mono text-xs text-slate-300">{state.maxAttempts - state.currentRow} tries left</span></div>
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#31506A] bg-[#07111F]/90 p-6 text-center">
              <span className="font-mono text-7xl font-black text-[#FACC15]">?</span>
              <PokemonPreviewStrip />
              <p className="font-mono text-sm uppercase tracking-wider text-[#FCA5A5]">Type any Pokemon to begin.</p>
            </div>
            <p className="mt-3 font-mono text-xs text-slate-300">Guess today's Pokemon from types, generation, color, habitat, shape, and evolution stage.</p>
          </section>

          <section className="rounded-2xl border border-[#20364A] bg-[#0B1628]/95 p-4 shadow-xl shadow-black/25">
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#FACC15]/40 bg-[#07111F]/80 px-3 py-2"><Target className="h-4 w-4 text-[#FACC15]" /><h2 className="font-mono text-lg font-black uppercase text-[#FACC15]">Guess</h2></div>
            {state.isGameOver ? <GameOverCard state={state} target={target} onBack={() => navigate('/')} onReopen={handleReopen} /> : <><PokemonAutocomplete value={input} onChange={setInput} onSubmit={handleSubmit} disabled={state.isGameOver} history={state.history} error={error} /><div className="mt-3 space-y-1.5 font-mono text-xs text-slate-300"><p><Check className="mr-1 inline h-3 w-3 text-[#86efac]" />Select a Pokemon and compare attributes.</p><p><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#FACC15] align-middle" />Yellow means shared type or nearby generation.</p></div></>}
          </section>
        </div>

        <section className="mt-5">
          <h3 className="mb-2 flex items-center gap-2 font-mono text-base font-bold uppercase tracking-wider text-slate-300">Attempts <span className="text-slate-500">({state.guesses.length}/{state.maxAttempts})</span></h3>
          <div ref={attemptsRef} className="space-y-3">
            {state.guesses.map((guess, index) => <GuessRow key={`${guess.pokemonId}-${index}`} guess={guess} index={index} />)}
            {Array.from({ length: emptyRows }).map((_, row) => <div key={row} className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6" aria-hidden="true">{POKEDLE_ATTRIBUTES.map((attr) => <div key={attr} className="flex min-h-[76px] flex-col items-center justify-center rounded-xl border border-dashed border-[#20364A] bg-[#07111F]/50 p-2 text-center"><span className="font-mono text-[8px] uppercase tracking-wider text-slate-500">{ATTRIBUTE_LABELS[attr]}</span><span className="font-mono text-xs text-slate-500">?</span></div>)}</div>)}
          </div>
        </section>

        <section className="mt-6 grid gap-2 rounded-2xl border border-[#20364A] bg-[#0B1628]/90 p-4 font-mono text-xs text-slate-300 sm:grid-cols-3">
          <div className="rounded-lg border border-[#22C55E]/60 bg-[#22C55E]/15 p-3"><strong className="text-[#86efac]">Green</strong><span className="block">exact attribute match</span></div>
          <div className="rounded-lg border border-[#FACC15]/60 bg-[#FACC15]/15 p-3"><strong className="text-[#FDE68A]">Yellow</strong><span className="block">shared type or adjacent generation</span></div>
          <div className="rounded-lg border border-[#334155] bg-[#334155]/35 p-3"><strong className="text-[#d4d4d4]">Gray</strong><span className="block">no match</span></div>
        </section>
      </main>

      <div className="fixed bottom-2 right-2 z-[5] pointer-events-none"><span className="font-mono text-[8px] text-slate-500/50 md:text-xs">v{APP_VERSION}</span></div>
    </div>
  )
}
