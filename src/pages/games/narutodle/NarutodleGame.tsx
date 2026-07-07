// src/pages/games/narutodle/NarutodleGame.tsx

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { ArrowLeft, Check, ChevronDown, Send, Sparkles, Target, Trophy, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarsBackground } from '@/components/animate-ui/components/backgrounds/stars'
import { APP_VERSION } from '@/lib/version'
import { getDayNumber, getTodayDateKey } from '@/lib/dates'
import { cn, normalizeString } from '@/lib/utils'
import { NARUTO_CHARACTERS } from './characters'
import { clueForMode, createInitialNarutodleState, formatAttributeValue, processNarutodleGuess } from './engine'
import { loadNarutodleState, saveNarutodleState } from './storage'
import { ATTRIBUTE_LABELS, NARUTODLE_ATTRIBUTES, type NarutodleAttributeKey, type NarutodleCharacter, type NarutodleFeedbackStatus, type NarutodleGuess, type NarutodleMode, type NarutodleState } from './types'
import { DEFAULT_NARUTODLE_MODE, NARUTODLE_MODES, parseNarutodleModeFromPathname, parseNarutodleModeFromUrl } from './modes'
import { NarutodleModeSelector } from './ModeSelector'
import { getNarutoCharacterImageUrl, getNarutoCharacterInitials } from './naruto-assets'

const MODE_COPY: Record<NarutodleMode, { title: string; desc: string; end: string }> = {
  classic: { title: 'Classic', desc: "Guess today's character from Naruto!", end: 'in classic mode' },
  jutsu: { title: 'Jutsu', desc: 'Guess with a jutsu clue.', end: 'with a Jutsu' },
  quote: { title: 'Quote', desc: 'Guess with a dialogue.', end: 'with a quote' },
  eye: { title: 'Eye', desc: 'Guess with an eye clue.', end: 'with an eye' },
}

function statusClasses(status: NarutodleFeedbackStatus): string {
  if (status === 'correct') return 'border-[#24D475]/80 bg-[#24D475]/25 text-[#86efac]'
  if (status === 'near') return 'border-[#F6D44E]/80 bg-[#F6D44E]/20 text-[#F6D44E]'
  return 'border-[#737373]/70 bg-[#737373]/25 text-[#d4d4d4]'
}

function CharacterPortrait({ character, className, alt = '' }: { character: NarutodleCharacter; className?: string; alt?: string }) {
  const [failed, setFailed] = useState(false)
  const imageUrl = getNarutoCharacterImageUrl(character)

  return (
    <span className={cn('inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#2A4060] bg-[#0F1A2E] font-mono text-xs font-black text-[#FDBA74]', className)}>
      {imageUrl && !failed ? (
        <img src={imageUrl} alt={alt} className="h-full w-full object-cover object-top" loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : (
        getNarutoCharacterInitials(character)
      )}
    </span>
  )
}

function EyeClueImage({ character, guesses, revealed }: { character: NarutodleCharacter; guesses: number; revealed: boolean }) {
  const [failed, setFailed] = useState(false)
  const imageUrl = getNarutoCharacterImageUrl(character)
  const blur = revealed ? 0 : Math.max(0, 10 - guesses * 2)
  const scale = revealed ? 1.18 : 1.95

  return (
    <div className="relative flex h-28 w-56 items-center justify-center overflow-hidden rounded-[50%] border-4 border-[#C026D3] bg-gradient-to-r from-[#f7d4c7] via-[#fdf2e9] to-[#f7d4c7]">
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: `blur(${blur}px) saturate(${revealed ? 1 : 0.75})`, objectPosition: 'center 20%', transform: `scale(${scale})` }}
          loading="eager"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="h-16 w-16 rounded-full bg-[#101827] ring-8 ring-[#D5369A]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#181C20]/80 via-transparent to-[#181C20]/20" />
      <span className="absolute bottom-2 rounded bg-[#181C20]/75 px-1.5 font-mono text-xs font-black text-[#f0abfc]">
        {revealed ? character.name : character.name.split(' ').map((part) => part[0]).join('')}
      </span>
    </div>
  )
}

function CharacterAutocomplete({ value, onChange, onSubmit, disabled, history }: {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  disabled: boolean
  history: string[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const matches = useMemo(() => {
    const normalized = normalizeString(value)
    if (!normalized) return []
    return NARUTO_CHARACTERS.filter((character) => {
      if (history.includes(character.id)) return false
      return character.id.includes(normalized) || normalizeString(character.name).includes(normalized)
    }).slice(0, 10)
  }, [history, value])

  useEffect(() => {
    function close(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={ref} className="relative w-full">
      <div className="flex min-h-[56px] items-center gap-2 rounded-xl border-2 border-[#2A4060] bg-[#0F1A2E]/95 px-3 focus-within:border-[#FF601B] focus-within:ring-2 focus-within:ring-[#FF601B]/30">
        <Target className="h-5 w-5 text-[#FF601B]" />
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && value.trim()) onSubmit(value.trim())
          }}
          disabled={disabled}
          placeholder="Type character name ..."
          className="min-h-[40px] flex-1 bg-transparent font-mono text-base text-white outline-none placeholder:text-slate-400"
          aria-label="Type character name"
        />
        <Button size="icon" variant="ghost" disabled={disabled || !value.trim()} onClick={() => onSubmit(value.trim())} className="text-[#FF601B] hover:text-[#FDBA74]">
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {open && matches.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-[#2A4060] bg-[#0F1A2E] shadow-2xl">
          {matches.map((character) => (
            <li key={character.id}>
              <button
                type="button"
                onClick={() => {
                  onSubmit(character.name)
                  onChange('')
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left font-mono text-sm text-slate-200 hover:bg-[#1A2C40]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <CharacterPortrait character={character} className="h-8 w-8 rounded-lg" />
                  <span className="truncate">{character.name}</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">{character.gender} · {character.affiliations.join(', ')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ModeClue({ mode, target, dateKey, guesses, revealed }: { mode: NarutodleMode; target?: NarutodleCharacter; dateKey: string; guesses: number; revealed: boolean }) {
  if (!target) return null
  if (mode === 'classic') {
    return <div className="flex min-h-[172px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#FF601B]/40 bg-[#181C20]/80 p-5 text-center"><span className="text-7xl">?</span><p className="font-mono text-sm uppercase tracking-wider text-[#FDBA74]">Type any character to begin.</p></div>
  }
  if (mode === 'eye') {
    return (
      <div className="flex min-h-[172px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-[#C026D3]/70 bg-[#181C20]/80 p-5 text-center">
        <EyeClueImage character={target} guesses={guesses} revealed={revealed} />
        <p className="font-mono text-xs uppercase tracking-wider text-[#f0abfc]">{revealed ? target.name : guesses > 0 ? target.eyeHint : 'Eye clue becomes clearer after each try.'}</p>
      </div>
    )
  }
  const clue = clueForMode(target, mode, dateKey)
  return (
    <div className="flex min-h-[172px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-[#FF601B]/50 bg-[#181C20]/80 p-5 text-center">
      <span className="text-5xl">{mode === 'jutsu' ? '🌀' : '💬'}</span>
      <blockquote className="max-w-xl font-mono text-xl font-black text-white">{mode === 'quote' ? `"${clue}"` : clue}</blockquote>
    </div>
  )
}

function AttributeCell({ attr, character, status }: { attr: NarutodleAttributeKey; character: NarutodleCharacter; status: NarutodleFeedbackStatus }) {
  return (
    <div className={cn('flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-lg border p-2 text-center shadow-md', statusClasses(status))}>
      <span className="font-mono text-[8px] uppercase tracking-wider text-slate-200/80">{ATTRIBUTE_LABELS[attr]}</span>
      <span className="font-mono text-[10px] font-bold leading-tight sm:text-xs">{formatAttributeValue(character, attr)}</span>
    </div>
  )
}

function GuessRow({ guess, index }: { guess: NarutodleGuess; index: number }) {
  const character = NARUTO_CHARACTERS.find((item) => item.id === guess.characterId)
  if (!character) return null
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 px-1 font-mono text-sm font-black text-white"><CharacterPortrait character={character} className="h-8 w-8 rounded-lg" /><span className="rounded bg-[#0F1A2E] px-2 py-0.5 text-xs">#{index + 1}</span>{guess.characterName}</div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
        {NARUTODLE_ATTRIBUTES.map((attr) => <AttributeCell key={attr} attr={attr} character={character} status={guess.feedback[attr]} />)}
      </div>
    </div>
  )
}

function GameOverCard({ state, target, mode, onBack }: { state: NarutodleState; target?: NarutodleCharacter; mode: NarutodleMode; onBack: () => void }) {
  useEffect(() => {
    if (!state.isWin) return
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.65 } })
  }, [state.isWin])

  return (
    <div className={cn('rounded-2xl border-2 p-5 shadow-2xl', state.isWin ? 'border-[#FF601B] bg-[#FF601B]/10' : 'border-[#737373]/60 bg-[#737373]/20')}>
      <div className="flex items-center gap-3">
        {state.isWin ? <Trophy className="h-7 w-7 text-[#FF601B]" /> : <X className="h-7 w-7 text-[#A3A3A3]" />}
        <div>
          <h2 className="font-mono text-xl font-black text-white">{state.isWin ? 'You found it!' : 'Game over'}</h2>
          <p className="font-mono text-xs text-slate-300">I found #Narutodle character #{state.dayNumber} {state.currentRow}/{state.maxAttempts} {MODE_COPY[mode].end}</p>
        </div>
      </div>
      {target && <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#2A4060] bg-[#0F1A2E]/80 p-3 font-mono text-sm text-slate-200"><CharacterPortrait character={target} className="h-14 w-14 rounded-2xl" alt={target.name} /><div>Answer: <strong className="text-[#F6D44E]">{target.name}</strong><div className="mt-1 text-xs text-slate-400">{target.gender} · {target.affiliations.join(', ')} · {target.debut}</div></div></div>}
      <Button onClick={onBack} variant="outline" className="mt-4 border-[#2A4060] bg-transparent font-mono text-xs text-slate-200"><ArrowLeft className="mr-2 h-4 w-4" />hall</Button>
    </div>
  )
}

export function NarutodleGame() {
  const navigate = useNavigate()
  const dateKey = useMemo(() => getTodayDateKey(), [])
  const dayNumber = useMemo(() => getDayNumber(), [])
  const [mode, setModeState] = useState<NarutodleMode>(() => {
    const fromPath = parseNarutodleModeFromPathname(window.location.pathname)
    return fromPath === DEFAULT_NARUTODLE_MODE ? parseNarutodleModeFromUrl(window.location.search) : fromPath
  })
  const [state, setState] = useState<NarutodleState>(() => loadNarutodleState(dateKey, mode) ?? createInitialNarutodleState(dateKey, dayNumber, NARUTO_CHARACTERS, mode))
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const attemptsRef = useRef<HTMLDivElement | null>(null)
  const target = useMemo(() => NARUTO_CHARACTERS.find((character) => character.id === state.targetId), [state.targetId])

  useEffect(() => saveNarutodleState(dateKey, state, mode), [dateKey, mode, state])
  useEffect(() => {
    if (state.guesses.length > 0) attemptsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [state.guesses.length])

  function setMode(next: NarutodleMode) {
    const meta = NARUTODLE_MODES.find((item) => item.id === next)
    setModeState(next)
    setState(loadNarutodleState(dateKey, next) ?? createInitialNarutodleState(dateKey, dayNumber, NARUTO_CHARACTERS, next))
    setInput('')
    setError(null)
    if (meta) navigate(meta.path, { replace: true })
  }

  function handleSubmit(rawGuess: string) {
    const result = processNarutodleGuess(state, rawGuess, NARUTO_CHARACTERS)
    if (result.error) {
      setError(result.error)
      return
    }
    setState(result.newState)
    setInput('')
    setError(null)
  }

  const copy = MODE_COPY[mode]
  const emptyRows = Math.max(0, state.maxAttempts - state.guesses.length)

  return (
    <div className="min-h-screen w-full text-white" style={{ background: 'linear-gradient(180deg, #78CED7 0%, #3A6B7A 12%, #181C20 28%, #181C20 100%)' }}>
      <header className="relative z-10 border-b border-[#2A4060]/50 bg-[#181C20]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 font-mono text-sm text-slate-300 hover:text-white"><ArrowLeft className="h-4 w-4" />hall</button>
          <div className="text-center"><h1 className="font-mono text-2xl font-black text-[#FF601B]">NARUTODLE</h1><p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#FDBA74]">Daily Naruto Game · {copy.title}</p></div>
          <NarutodleModeSelector current={mode} onSelect={setMode} />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-3 py-5 sm:px-4">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border border-[#2A4060]/50 bg-[#1A2C40]/75 p-4 shadow-2xl">
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#FF601B]/40 bg-[#181C20]/80 px-3 py-2"><Sparkles className="h-4 w-4 text-[#FF601B]" /><h2 className="font-mono text-lg font-black uppercase text-[#FF601B]">{copy.title}</h2><span className="ml-auto font-mono text-xs text-slate-300">{state.maxAttempts - state.currentRow} tries left</span></div>
            <ModeClue mode={mode} target={target} dateKey={dateKey} guesses={state.guesses.length} revealed={state.isGameOver} />
            <p className="mt-3 font-mono text-xs text-slate-300">{copy.desc}</p>
          </section>

          <section className="rounded-2xl border border-[#2A4060]/50 bg-[#1A2C40]/75 p-4 shadow-2xl">
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#F6D44E]/40 bg-[#181C20]/80 px-3 py-2"><Target className="h-4 w-4 text-[#F6D44E]" /><h2 className="font-mono text-lg font-black uppercase text-[#F6D44E]">Guess</h2></div>
            {state.isGameOver ? <GameOverCard state={state} target={target} mode={mode} onBack={() => navigate('/')} /> : <><CharacterAutocomplete value={input} onChange={setInput} onSubmit={handleSubmit} disabled={state.isGameOver} history={state.history} />{error && <div className="mt-2 rounded-lg border border-[#737373]/60 bg-[#737373]/20 p-2 font-mono text-xs text-[#d4d4d4]">{error}</div>}<div className="mt-3 space-y-1.5 font-mono text-xs text-slate-300"><p><Check className="mr-1 inline h-3 w-3 text-[#86efac]" />Select a character and compare attributes.</p><p><ChevronDown className="mr-1 inline h-3 w-3 text-[#F6D44E]" />Yellow means partial match or nearby debut arc.</p></div></>}
          </section>
        </div>

        <section className="mt-5">
          <h3 className="mb-2 flex items-center gap-2 font-mono text-base font-bold uppercase tracking-wider text-slate-300">Attempts <span className="text-slate-500">({state.guesses.length}/{state.maxAttempts})</span></h3>
          <div ref={attemptsRef} className="space-y-3">
            {state.guesses.map((guess, index) => <GuessRow key={`${guess.characterId}-${index}`} guess={guess} index={index} />)}
            {Array.from({ length: emptyRows }).map((_, row) => <div key={row} className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7" aria-hidden="true">{NARUTODLE_ATTRIBUTES.map((attr) => <div key={attr} className="flex min-h-[76px] flex-col items-center justify-center rounded-lg border border-dashed border-[#2A4060]/70 bg-[#0F1A2E]/35 p-2 text-center"><span className="font-mono text-[8px] uppercase tracking-wider text-slate-500">{ATTRIBUTE_LABELS[attr]}</span><span className="font-mono text-xs text-slate-500">?</span></div>)}</div>)}
          </div>
        </section>

        <section className="mt-6 grid gap-2 rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/60 p-4 font-mono text-xs text-slate-300 sm:grid-cols-3">
          <div className="rounded-lg border border-[#24D475]/60 bg-[#24D475]/15 p-3"><strong className="text-[#86efac]">Green</strong><span className="block">exact attribute match</span></div>
          <div className="rounded-lg border border-[#F6D44E]/60 bg-[#F6D44E]/15 p-3"><strong className="text-[#F6D44E]">Yellow</strong><span className="block">partial match or adjacent debut arc</span></div>
          <div className="rounded-lg border border-[#737373]/60 bg-[#737373]/15 p-3"><strong className="text-[#d4d4d4]">Gray</strong><span className="block">no match</span></div>
        </section>
      </main>

      <StarsBackground className="fixed inset-0 z-0 max-h-dvh max-w-full opacity-30" pointerEvents={false} />
      <div className="fixed bottom-2 right-2 z-[5] pointer-events-none"><span className="font-mono text-[8px] text-slate-500/50 md:text-xs">v{APP_VERSION}</span></div>
    </div>
  )
}
