// src/pages/games/pitaco-nerdle/PitacoNerdleGame.tsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Delete, CornerDownLeft, RefreshCw, Home, Trophy, Skull } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/Header'
import { StarsBackground } from '@/components/animate-ui/components/backgrounds/stars'
import { APP_VERSION } from '@/lib/version'
import { getTodayDateKey } from '@/lib/dates'
import { cn } from '@/lib/utils'
import {
  NerdleState,
  NerdleTileState,
  NerdleKeyState,
  NERDLE_LENGTH,
  NERDLE_MAX_ATTEMPTS,
} from './types'
import {
  createInitialNerdleState,
  processNerdleGuess,
  isValidEquation,
  isValidChars,
} from './engine'
import { NERDLE_EQUATIONS } from './equations'

const STORAGE_KEY = (dateKey: string) => `pitaco:nerdle:state:${dateKey}`

function loadNerdleState(dateKey: string): NerdleState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(dateKey))
    if (!raw) return null
    const parsed = JSON.parse(raw) as NerdleState
    if (!parsed.solution || !Array.isArray(parsed.guesses)) return null
    return parsed
  } catch (e) {
    console.error('pitaco-nerdle: error reading state', e)
    return null
  }
}

function saveNerdleState(dateKey: string, state: NerdleState): void {
  try {
    localStorage.setItem(STORAGE_KEY(dateKey), JSON.stringify(state))
  } catch (e) {
    console.error('pitaco-nerdle: error saving state', e)
  }
}

const KEYBOARD_ROWS: string[][] = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
  ['+', '-', '*', '/'],
  ['0', '=', 'BACKSPACE', 'ENTER'],
]

const TILE_COLOR_CLASSES: Record<NerdleTileState, string> = {
  empty: 'bg-transparent border-slate-600',
  filled: 'bg-transparent border-slate-400',
  correct: 'bg-[#00B2A9] border-[#00B2A9] text-white',
  present: 'bg-[#A78BFA] border-[#A78BFA] text-[#1A2C40]',
  absent: 'bg-[#243447] border-[#243447] text-white',
}

const KEY_COLOR_CLASSES: Record<NerdleKeyState, string> = {
  unused: 'bg-[#2A4060] text-white border-[#2A4060]',
  correct: 'bg-[#00B2A9] text-white border-[#00B2A9]',
  present: 'bg-[#A78BFA] text-[#1A2C40] border-[#A78BFA]',
  absent: 'bg-[#243447] text-white border-[#243447]',
}

function NerdleTile({
  char,
  state,
  isRevealing,
  index,
  highContrast = false,
}: {
  char: string
  state: NerdleTileState
  isRevealing: boolean
  index: number
  highContrast?: boolean
}) {
  const colorClass = useMemo(() => {
    if (highContrast) {
      if (state === 'correct') return 'bg-[#E25F38] border-[#E25F38] text-white'
      if (state === 'present') return 'bg-[#00B2A9] border-[#00B2A9] text-white'
      if (state === 'absent') return 'bg-[#243447] border-[#243447] text-white'
      if (state === 'filled') return 'bg-transparent border-slate-400'
      return 'bg-transparent border-slate-600'
    }
    return TILE_COLOR_CLASSES[state]
  }, [state, highContrast])

  return (
    <motion.div
      initial={false}
      animate={isRevealing ? { rotateX: [0, -90, 0] } : { rotateX: 0 }}
      transition={isRevealing ? { duration: 0.45, delay: index * 0.08, times: [0, 0.5, 1] } : { duration: 0.2 }}
      className={cn(
        'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center font-mono font-extrabold rounded-md border-2 text-base sm:text-lg md:text-xl select-none',
        !isRevealing && colorClass,
        isRevealing && state !== 'empty' && state !== 'filled' && colorClass,
        isRevealing && (state === 'empty' || state === 'filled') && 'bg-transparent border-slate-400'
      )}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {char}
    </motion.div>
  )
}

function NerdleKeyButton({
  label,
  onClick,
  state,
  wide,
  disabled,
}: {
  label: string
  onClick: () => void
  state: NerdleKeyState
  wide?: boolean
  disabled?: boolean
}) {
  const colorClass = KEY_COLOR_CLASSES[state]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label === 'BACKSPACE' ? 'Apagar' : label === 'ENTER' ? 'Enviar' : label}
      className={cn(
        'h-11 sm:h-12 md:h-14 font-mono font-bold text-base sm:text-lg border-2 rounded-md transition-all duration-200 flex items-center justify-center',
        'hover:brightness-110 active:scale-95',
        wide ? 'flex-1 px-2 sm:px-4 min-w-[60px] sm:min-w-[80px]' : 'w-8 sm:w-10 md:w-12',
        disabled && 'opacity-50 cursor-not-allowed',
        colorClass
      )}
    >
      {label === 'BACKSPACE' ? (
        <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
      ) : label === 'ENTER' ? (
        <CornerDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      ) : (
        <span>{label}</span>
      )}
    </button>
  )
}

function EndDialog({
  open,
  isWin,
  solution,
  attempts,
  maxAttempts,
  onPlayAgain,
  onHome,
  onClose,
}: {
  open: boolean
  isWin: boolean
  solution: string
  attempts: number
  maxAttempts: number
  onPlayAgain: () => void
  onHome: () => void
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
            style={{
              background: 'linear-gradient(to bottom, #1A2C40, #243447)',
              borderColor: isWin ? 'rgba(0,178,169,0.5)' : 'rgba(167,139,250,0.5)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="nerdle-gameover-title"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onHome()
            }}
            tabIndex={-1}
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  background: isWin ? 'rgba(0,178,169,0.18)' : 'rgba(167,139,250,0.18)',
                }}
              >
                {isWin ? (
                  <Trophy className="h-7 w-7" style={{ color: '#00B2A9' }} />
                ) : (
                  <Skull className="h-7 w-7" style={{ color: '#A78BFA' }} />
                )}
              </div>
              <h2
                id="nerdle-gameover-title"
                className="font-mono text-xl font-black"
                style={{ color: isWin ? '#00B2A9' : '#A78BFA' }}
              >
                {isWin ? 'CALCULADO!' : 'SEM SOLUCAO'}
              </h2>
              <p className="text-sm text-[#cbd5e1] font-mono">
                {isWin
                  ? `Resolveu em ${attempts}/${maxAttempts} tentativas.`
                  : `A equacao de hoje era:`}
              </p>
              {!isWin && (
                <div
                  className="font-mono text-2xl font-extrabold tracking-wider"
                  style={{ color: '#00B2A9' }}
                >
                  {solution}
                </div>
              )}
              <div className="mt-3 flex w-full gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onHome}
                  className="min-h-[44px] flex-1 font-mono"
                >
                  <Home className="mr-2 h-4 w-4" />
                  hall
                </Button>
                <Button
                  type="button"
                  onClick={onPlayAgain}
                  className="min-h-[44px] flex-1 font-mono"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  reabrir
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function PitacoNerdleGame() {
  const navigate = useNavigate()
  const [dateKey] = useState(() => getTodayDateKey())
  const [state, setState] = useState<NerdleState | null>(null)
  const [error, setError] = useState('')
  const [revealingRow, setRevealingRow] = useState(-1)
  const [happyRow, setHappyRow] = useState(-1)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Inicializa ou recupera o estado do dia
  useEffect(() => {
    const saved = loadNerdleState(dateKey)
    if (saved) {
      setState(saved)
      if (saved.isGameOver) {
        setTimeout(() => setDialogOpen(true), 400)
      }
    } else {
      const initial = createInitialNerdleState(dateKey, NERDLE_EQUATIONS)
      setState(initial)
      saveNerdleState(dateKey, initial)
    }
  }, [dateKey])

  // Persiste a cada mudanca
  useEffect(() => {
    if (state) saveNerdleState(dateKey, state)
  }, [state, dateKey])

  const handleKey = useCallback(
    (key: string) => {
      setState(prev => {
        if (!prev || prev.isGameOver) return prev

        if (key === 'BACKSPACE') {
          if (revealingRow !== -1) return prev
          const newGuess = [...prev.currentGuess]
          for (let i = newGuess.length - 1; i >= 0; i--) {
            if (newGuess[i] !== '') {
              newGuess[i] = ''
              break
            }
          }
          return { ...prev, currentGuess: newGuess }
        }

        if (key === 'ENTER') {
          if (revealingRow !== -1) return prev
          const guessStr = prev.currentGuess.join('')
          if (guessStr.length !== NERDLE_LENGTH) {
            setError('Equacao incompleta')
            setTimeout(() => setError(''), 1200)
            return prev
          }
          if (!isValidChars(guessStr) || !isValidEquation(guessStr)) {
            setError('Equacao nao fecha')
            setTimeout(() => setError(''), 1200)
            return prev
          }
          const result = processNerdleGuess(prev, guessStr)
          if (result.error) {
            setError(result.error)
            setTimeout(() => setError(''), 1200)
            return prev
          }
          const submittedRow = prev.currentRow
          setRevealingRow(submittedRow)
          setTimeout(() => {
            setRevealingRow(-1)
            if (result.newState.isWin) {
              setHappyRow(submittedRow)
              setTimeout(() => {
                setHappyRow(-1)
                setDialogOpen(true)
              }, 700)
            } else if (result.newState.isGameOver) {
              setDialogOpen(true)
            }
          }, NERDLE_LENGTH * 80 + 500)
          return result.newState
        }

        if (revealingRow !== -1) return prev
        if (!/^[0-9+\-*/=]$/.test(key)) return prev
        const newGuess = [...prev.currentGuess]
        const filled = newGuess.filter(c => c !== '').length
        if (filled >= NERDLE_LENGTH) return prev
        for (let i = 0; i < newGuess.length; i++) {
          if (newGuess[i] === '') {
            newGuess[i] = key
            break
          }
        }
        return { ...prev, currentGuess: newGuess }
      })
    },
    [revealingRow]
  )

  // Teclado fisico
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (dialogOpen) return
      if (e.key === 'Enter') {
        e.preventDefault()
        handleKey('ENTER')
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        handleKey('BACKSPACE')
      } else if (e.key.length === 1 && /^[0-9+\-*/=]$/.test(e.key)) {
        handleKey(e.key)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKey, dialogOpen])

  const handlePlayAgain = useCallback(() => {
    const initial = createInitialNerdleState(dateKey, NERDLE_EQUATIONS)
    setState(initial)
    setRevealingRow(-1)
    setHappyRow(-1)
    setDialogOpen(false)
  }, [dateKey])

  const handleHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  if (!state) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40)' }}
      >
        <div className="text-white text-xl font-mono">Carregando...</div>
      </div>
    )
  }

  const remaining = NERDLE_MAX_ATTEMPTS - state.currentRow

  return (
    <div
      className="h-dvh flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40, #243447)' }}
    >
      <Header
        title="PITACO Nerdle"
        onHelp={() => {}}
        onStats={() => {}}
        onSettings={() => {}}
        onAbout={() => {}}
        onArchive={() => {}}
        onToggleTabs={() => {}}
        isArchive={false}
      />

      <main className="flex-1 flex flex-col items-center justify-between px-2 py-2 sm:px-4 sm:py-4 max-w-2xl mx-auto w-full overflow-hidden">
        <div className="w-full flex items-center justify-between font-mono text-sm sm:text-base">
          <div role="status" aria-live="polite" className="flex items-center gap-2 text-[#cbd5e1]">
            <span>Tentativas:</span>
            <span
              className={cn(
                'font-extrabold',
                state.isGameOver
                  ? state.isWin
                    ? 'text-[#00B2A9]'
                    : 'text-[#A78BFA]'
                  : 'text-white'
              )}
            >
              {state.isGameOver
                ? `${state.currentRow}/${NERDLE_MAX_ATTEMPTS}`
                : `${remaining} restantes`}
            </span>
          </div>
          {state.isGameOver && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setDialogOpen(true)}
              className="font-mono"
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              reabrir
            </Button>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-[#E25F38] text-white px-4 py-2 rounded-lg shadow-lg z-50 font-mono text-sm"
            role="alert"
          >
            {error}
          </motion.div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
          <div className="flex flex-col gap-1.5 sm:gap-2 w-full items-center">
            {Array.from({ length: NERDLE_MAX_ATTEMPTS }).map((_, rowIdx) => {
              const guess = state.guesses[rowIdx]
              const isRevealing = rowIdx === revealingRow
              const isHappy = rowIdx === happyRow

              if (guess) {
                return (
                  <motion.div
                    key={rowIdx}
                    className="flex justify-center gap-1 sm:gap-1.5"
                    animate={isHappy ? { y: [0, -8, 0] } : { y: 0 }}
                    transition={isHappy ? { duration: 0.5 } : {}}
                  >
                    {guess.tiles.map((tile, i) => (
                      <NerdleTile
                        key={i}
                        char={tile.char}
                        state={tile.state}
                        isRevealing={isRevealing}
                        index={i}
                      />
                    ))}
                  </motion.div>
                )
              }

              if (rowIdx === state.currentRow && !state.isGameOver) {
                return (
                  <div
                    key={rowIdx}
                    className="flex justify-center gap-1 sm:gap-1.5"
                  >
                    {Array.from({ length: NERDLE_LENGTH }).map((_, i) => {
                      const ch = state.currentGuess[i] ?? ''
                      return (
                        <NerdleTile
                          key={i}
                          char={ch}
                          state={ch ? 'filled' : 'empty'}
                          isRevealing={false}
                          index={i}
                        />
                      )
                    })}
                  </div>
                )
              }

              return (
                <div
                  key={rowIdx}
                  className="flex justify-center gap-1 sm:gap-1.5"
                >
                  {Array.from({ length: NERDLE_LENGTH }).map((_, i) => (
                    <NerdleTile
                      key={i}
                      char=""
                      state="empty"
                      isRevealing={false}
                      index={i}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        <div className="w-full mt-2 sm:mt-4 flex-shrink-0 z-10">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {KEYBOARD_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-1.5 sm:gap-2 justify-center">
                {row.map(label => (
                  <NerdleKeyButton
                    key={label}
                    label={label}
                    onClick={() => handleKey(label)}
                    state={(state.keyStates[label] as NerdleKeyState) || 'unused'}
                    wide={label === 'BACKSPACE' || label === 'ENTER'}
                    disabled={state.isGameOver || revealingRow !== -1}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <StarsBackground
          className="fixed inset-0 z-0 max-h-dvh max-w-full opacity-30"
          pointerEvents={false}
        />

        <div className="fixed bottom-2 right-2 z-[5] pointer-events-none">
          <span className="text-[8px] md:text-xs text-[#94A3B8]/50 font-mono">
            v{APP_VERSION}
          </span>
        </div>
      </main>

      <EndDialog
        open={dialogOpen}
        isWin={state.isWin}
        solution={state.solution}
        attempts={state.currentRow}
        maxAttempts={NERDLE_MAX_ATTEMPTS}
        onPlayAgain={handlePlayAgain}
        onHome={handleHome}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  )
}

export default PitacoNerdleGame
