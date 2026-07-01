// src/pages/games/pitaco-tematico/PitacoTematicoGame.tsx
//
// PITACO Tematico: mesmo tabuleiro do PITACO solo, mas com escolha
// de tema ANTES de comecar. Cada tema tem o proprio dicionario e
// uma palavra do dia independente. Inspirado no Loldle (que tambem
// oferece variantes por categoria reutilizando a mesma engine).
//
// Reutilizamos o engine (processGuess, evaluateGuess) e os
// componentes visuais (GameLayout, Keyboard, Header, dialogs) do
// jogo solo. A unica coisa que muda e a fonte de palavras e a
// chave de persistencia por tema.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, RefreshCcw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GameLayout } from '@/components/GameLayout'
import { Header } from '@/components/Header'
import { Keyboard } from '@/components/Keyboard'
import { HelpDialog } from '@/components/HelpDialog'
import { StatsDialog } from '@/components/StatsDialog'
import { SettingsDialog } from '@/components/SettingsDialog'
import { AboutDialog } from '@/components/AboutDialog'
import { StarsBackground } from '@/components/animate-ui/components/backgrounds/stars'
import { useDialogManager } from '@/hooks/useDialogManager'
import { useGameAnimations } from '@/hooks/useGameAnimations'
import { useKeyboardInput } from '@/hooks/useKeyboardInput'
import { GameState, Settings } from '@/game/types'
import { processGuess, getDayNumber, isValidWord } from '@/game/engine'
import { getTodayDateKey } from '@/lib/utils'
import { useSoundEffects } from '@/lib/sounds/useSoundEffects'
import { THEME_LIST, getDailyWord, isValidThemeWord, THEMES } from './themes'
import type { ThemeId } from '@/lib/multiplayer-types'

const STORAGE_PREFIX_THEME = 'pitaco:tematico:theme'
const STORAGE_PREFIX_STATE = 'pitaco:tematico:state'
const STORAGE_PREFIX_STATS = 'pitaco:tematico:stats'

const MAX_ATTEMPTS = 6

interface StoredStats {
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  maxStreak: number
  guessDistribution: number[]
  lastGame?: {
    won: boolean
    attempts: number
    dateKey: string
    theme: ThemeId
  }
}

const EMPTY_STATS: StoredStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: Array(MAX_ATTEMPTS + 1).fill(0),
}

function loadStoredTheme(): ThemeId | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX_THEME)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { theme?: ThemeId }
    if (parsed.theme && ['classic', 'frutas', 'objetos', 'filmes', 'series', 'animes'].includes(parsed.theme)) {
      return parsed.theme
    }
  } catch {
    // ignore
  }
  return null
}

function persistTheme(theme: ThemeId | null): void {
  try {
    if (theme === null) {
      localStorage.removeItem(STORAGE_PREFIX_THEME)
    } else {
      localStorage.setItem(STORAGE_PREFIX_THEME, JSON.stringify({ theme }))
    }
  } catch {
    // ignore
  }
}

function stateStorageKey(theme: ThemeId, dateKey: string): string {
  return `${STORAGE_PREFIX_STATE}:${theme}:${dateKey}`
}

function loadStoredState(theme: ThemeId, dateKey: string): GameState | null {
  try {
    const raw = localStorage.getItem(stateStorageKey(theme, dateKey))
    if (!raw) return null
    return JSON.parse(raw) as GameState
  } catch {
    return null
  }
}

function persistState(theme: ThemeId, state: GameState): void {
  try {
    localStorage.setItem(stateStorageKey(theme, state.dateKey), JSON.stringify(state))
  } catch {
    // ignore
  }
}

function loadStoredStats(): StoredStats {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX_STATS)
    if (!raw) return { ...EMPTY_STATS, guessDistribution: [...EMPTY_STATS.guessDistribution] }
    const parsed = JSON.parse(raw) as StoredStats
    return {
      ...EMPTY_STATS,
      ...parsed,
      guessDistribution: Array.isArray(parsed.guessDistribution)
        ? parsed.guessDistribution.length === MAX_ATTEMPTS + 1
          ? parsed.guessDistribution
          : Array(MAX_ATTEMPTS + 1).fill(0).map((_, i) => parsed.guessDistribution[i] ?? 0)
        : [...EMPTY_STATS.guessDistribution],
    }
  } catch {
    return { ...EMPTY_STATS, guessDistribution: [...EMPTY_STATS.guessDistribution] }
  }
}

function persistStats(stats: StoredStats): void {
  try {
    localStorage.setItem(STORAGE_PREFIX_STATS, JSON.stringify(stats))
  } catch {
    // ignore
  }
}

function buildInitialState(theme: ThemeId, dayNumber: number, dateKey: string): GameState {
  const solution = pickValidThemeWord(theme, dayNumber)
  return {
    mode: 'termo',
    boards: [
      {
        guesses: [],
        solution,
        isComplete: false,
      },
    ],
    currentGuess: ['', '', '', '', ''],
    currentRow: 0,
    maxAttempts: MAX_ATTEMPTS,
    isGameOver: false,
    isWin: false,
    keyStates: {},
    dateKey,
    dayNumber,
  }
}

/**
 * Sorteia uma palavra do tema que esteja no dicionario principal.
 * O engine valida `isValidWord` no chute, entao a solucao precisa
 * existir em `termoAllowed` (ou `accentMap`). Se o sorteio padrao
 * cair numa palavra nao suportada pelo engine, tenta o proximo
 * indice ate achar uma valida. Cae no sorteio original em ultimo
 * caso (defensivo).
 */
function pickValidThemeWord(theme: ThemeId, dayNumber: number): string {
  const words = THEMES[theme]?.words ?? THEMES.classic.words
  if (words.length === 0) {
    return getDailyWord(theme, dayNumber)
  }
  for (let attempt = 0; attempt < words.length; attempt++) {
    const index = ((dayNumber + attempt) % words.length + words.length) % words.length
    const candidate = words[index]
    if (candidate && isValidWord(candidate, 'termo')) return candidate
  }
  return getDailyWord(theme, dayNumber)
}

export function PitacoTematicoGame() {
  const navigate = useNavigate()
  const [settings] = useState<Settings>({
    highContrast: false,
    hardMode: false,
    soundEnabled: true,
  })
  const [selectedTheme, setSelectedTheme] = useState<ThemeId | null>(() => loadStoredTheme())
  const [error, setError] = useState<string>('')
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [stats, setStats] = useState<StoredStats>(() => loadStoredStats())
  // Flag absoluta: garante que o help dialog so apareca UMA vez no app.
  // Nao deve ser resetado quando o usuario troca de tema.
  const hasShownHelpRef = useRef<boolean>(false)

  const dialogManager = useDialogManager()
  const { play: playSound } = useSoundEffects({ settings })
  const {
    cursorPosition,
    shouldShake,
    revealingRow,
    lastTypedIndex,
    happyRow,
    happyBoards,
    actions: animActions,
  } = useGameAnimations()

  const dayNumber = useMemo(() => getDayNumber(), [])
  const dateKey = useMemo(() => getTodayDateKey(), [])

  // Persistir tema escolhido
  useEffect(() => {
    persistTheme(selectedTheme)
  }, [selectedTheme])

  // Carregar/inicializar estado do jogo quando o tema muda
  useEffect(() => {
    if (!selectedTheme) {
      setGameState(null)
      return
    }

    const saved = loadStoredState(selectedTheme, dateKey)
    if (saved && saved.dateKey === dateKey && saved.dayNumber === dayNumber) {
      setGameState(saved)
      const firstEmpty = saved.currentGuess.findIndex((c) => c === '')
      animActions.setCursorPosition(firstEmpty === -1 ? 5 : firstEmpty)

      if (saved.isGameOver) {
        setTimeout(() => dialogManager.openDialog('stats'), 800)
      }
    } else {
      const initial = buildInitialState(selectedTheme, dayNumber, dateKey)
      setGameState(initial)
      persistState(selectedTheme, initial)
      animActions.setCursorPosition(0)
    }
  }, [selectedTheme, dateKey, dayNumber, animActions, dialogManager])

  // Help dialog automatico APENAS na primeira vez absoluta (uma vez por app).
  // O ref nao e resetado quando o tema muda, entao trocar de tema nao reabre.
  useEffect(() => {
    if (!gameState || !selectedTheme) return
    if (hasShownHelpRef.current) return
    if (gameState.currentRow !== 0) return
    const timer = setTimeout(() => {
      dialogManager.openDialog('help')
      hasShownHelpRef.current = true
    }, 500)
    return () => clearTimeout(timer)
  }, [gameState?.currentRow, selectedTheme, dialogManager])

  const handleChangeTheme = useCallback(() => {
    setSelectedTheme(null)
    setGameState(null)
    setError('')
  }, [])

  const handleReopen = useCallback(() => {
    if (!selectedTheme || !dateKey) return
    try {
      localStorage.removeItem(stateStorageKey(selectedTheme, dateKey))
    } catch {
      // ignore
    }
    window.location.reload()
  }, [selectedTheme, dateKey])

  const handleSelectTheme = useCallback((theme: ThemeId) => {
    setSelectedTheme(theme)
    setError('')
  }, [])

  const handleTileClick = useCallback((position: number) => {
    if (!gameState || gameState.isGameOver) return
    animActions.setCursorPosition(position)
  }, [gameState, animActions])

  const handleGuessChange = useCallback((newGuess: string[]) => {
    setGameState((prev) => {
      if (!prev) return prev
      return { ...prev, currentGuess: newGuess }
    })
  }, [])

  const handleSubmitGuess = useCallback(() => {
    if (!gameState || !selectedTheme) return

    const result = processGuess(gameState, settings)

    if (result.error) {
      setError(result.error)
      animActions.triggerShake()
      playSound('wrongWord')
      setTimeout(() => setError(''), 500)
      return
    }

    // Validacao adicional: garantir que a palavra pertence ao tema
    const guessWord = gameState.currentGuess.join('').toLowerCase()
    if (!isValidThemeWord(selectedTheme, guessWord)) {
      setError('Palavra fora do tema')
      animActions.triggerShake()
      playSound('wrongWord')
      setTimeout(() => setError(''), 500)
      return
    }

    const submittedRow = gameState.currentRow
    animActions.triggerFlip(submittedRow)

    const newlyCompleted = result.newState.boards
      .map((b, idx) => (b.isComplete && !gameState.boards[idx].isComplete ? idx : -1))
      .filter((idx) => idx !== -1)

    setGameState(result.newState)
    persistState(selectedTheme, result.newState)
    animActions.setCursorPosition(0)

    if (newlyCompleted.length > 0) {
      setTimeout(() => {
        animActions.triggerHappy(submittedRow, newlyCompleted)
      }, 1000)
    }

    if (result.newState.isGameOver) {
      setTimeout(() => {
        if (result.newState.isWin) {
          playSound(result.newState.currentRow === 1 ? 'firstTryWin' : 'win')
        } else {
          playSound('gameOver')
        }
      }, 1200)

      // Atualizar stats por tema
      setStats((prev) => {
        const newStats: StoredStats = {
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          gamesWon: prev.gamesWon + (result.newState.isWin ? 1 : 0),
          currentStreak: result.newState.isWin ? prev.currentStreak + 1 : 0,
          maxStreak: result.newState.isWin
            ? Math.max(prev.currentStreak + 1, prev.maxStreak)
            : prev.maxStreak,
          guessDistribution: [...prev.guessDistribution],
          lastGame: {
            won: result.newState.isWin,
            attempts: result.newState.currentRow,
            dateKey: result.newState.dateKey,
            theme: selectedTheme,
          },
        }
        const idx = result.newState.isWin
          ? result.newState.currentRow - 1
          : newStats.guessDistribution.length - 1
        newStats.guessDistribution[idx] = (newStats.guessDistribution[idx] ?? 0) + 1
        persistStats(newStats)
        return newStats
      })

      setTimeout(() => dialogManager.openDialog('stats'), newlyCompleted.length > 0 ? 2200 : 1200)
    }
  }, [gameState, selectedTheme, settings, animActions, playSound, dialogManager])

  const { handleKey } = useKeyboardInput({
    gameState,
    onGuessChange: handleGuessChange,
    onSubmitGuess: handleSubmitGuess,
    onCursorMove: animActions.setCursorPosition,
    onTyping: animActions.triggerTyping,
    cursorPosition,
    disabled: dialogManager.hasOpenDialog,
  })

  // Tela de selecao de tema
  if (!selectedTheme) {
    return (
      <ThemeSelector
        onSelect={handleSelectTheme}
        onBack={() => navigate('/')}
      />
    )
  }

  if (!gameState) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40)' }}
      >
        <div className="text-white text-xl font-mono">Carregando...</div>
      </div>
    )
  }

  const themeConfig = THEME_LIST.find((t) => t.id === selectedTheme) ?? THEME_LIST[0]

  return (
    <div
      className="h-dvh flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40, #243447)' }}
    >
      <Header
        title="PITACO Tematico"
        onHelp={dialogManager.dialogs.help.onOpen}
        onStats={dialogManager.dialogs.stats.onOpen}
        onSettings={dialogManager.dialogs.settings.onOpen}
        onAbout={dialogManager.dialogs.about.onOpen}
        onArchive={() => {}}
        onToggleTabs={() => {}}
        isArchive={false}
        archiveDayNumber={undefined}
      />

      <div className="px-2 py-2 sm:px-4 flex items-center justify-between gap-2 border-b border-[#2A4060]/40 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider"
            style={{
              background: `${themeConfig.accent}26`,
              color: themeConfig.accent,
              border: `1px solid ${themeConfig.accent}55`,
            }}
            aria-label={`Tema ${themeConfig.label}`}
          >
            <span aria-hidden="true">{themeConfig.emoji}</span>
            {themeConfig.label}
          </span>
          <span className="hidden sm:inline text-[11px] font-mono text-slate-400">
            dia #{dayNumber}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {gameState.isGameOver && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReopen}
              className="min-h-[44px] border-[#2A4060] bg-transparent text-slate-200 font-mono text-[11px]"
              aria-label="Reabrir o dia (limpa o save atual)"
            >
              reabrir o dia
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleChangeTheme}
            className="min-h-[44px] border-[#2A4060] bg-transparent text-slate-200 font-mono text-[11px] h-8"
            aria-label="Trocar tema"
          >
            <RefreshCcw className="w-3 h-3 mr-1" /> trocar tema
          </Button>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-between px-2 py-2 sm:px-4 sm:py-4 md:py-6 max-w-7xl mx-auto w-full overflow-hidden">
        {error && (
          <div role="alert" className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-[#E25F38] text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
            {error}
          </div>
        )}

        <GameLayout
          gameState={gameState}
          highContrast={settings.highContrast}
          cursorPosition={cursorPosition}
          shouldShake={shouldShake}
          onTileClick={handleTileClick}
          revealingRow={revealingRow}
          lastTypedIndex={lastTypedIndex}
          happyRow={happyRow}
          happyBoards={happyBoards}
        />

        <div className="w-full mt-2 sm:mt-4 md:mt-6 max-w-2xl mx-auto flex-shrink-0 z-10">
          <Keyboard
            keyStates={gameState.keyStates}
            onKeyPress={handleKey}
            highContrast={settings.highContrast}
            disabled={gameState.isGameOver}
          />
        </div>
        <StarsBackground
          className="fixed inset-0 z-0 max-h-dvh max-w-full opacity-30"
          pointerEvents={false}
        />
      </main>

      <HelpDialog
        open={dialogManager.dialogs.help.open}
        onOpenChange={(open) => !open && dialogManager.closeDialog()}
      />

      <StatsDialog
        open={dialogManager.dialogs.stats.open}
        onOpenChange={(open) => {
          if (!open) {
            dialogManager.closeDialog()
          }
        }}
        stats={adaptStatsForDialog(stats)}
        gameState={gameState}
        onShare={() => playSound('share')}
      />

      <SettingsDialog
        open={dialogManager.dialogs.settings.open}
        onOpenChange={(open) => !open && dialogManager.closeDialog()}
        settings={settings}
        onSettingsChange={() => {}}
        onOpenStats={() => dialogManager.openDialog('stats')}
      />

      <AboutDialog
        open={dialogManager.dialogs.about.open}
        onOpenChange={(open) => !open && dialogManager.closeDialog()}
      />
    </div>
  )
}

function adaptStatsForDialog(stats: StoredStats) {
  return {
    gamesPlayed: stats.gamesPlayed,
    gamesWon: stats.gamesWon,
    currentStreak: stats.currentStreak,
    maxStreak: stats.maxStreak,
    guessDistribution: stats.guessDistribution,
    lastGame: stats.lastGame
      ? {
          won: stats.lastGame.won,
          attempts: stats.lastGame.attempts,
          dateKey: stats.lastGame.dateKey,
        }
      : undefined,
  }
}

interface ThemeSelectorProps {
  onSelect: (theme: ThemeId) => void
  onBack: () => void
}

function ThemeSelector({ onSelect, onBack }: ThemeSelectorProps) {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40, #243447)' }}
    >
      <header
        className="border-b border-[#2A4060]/40"
        style={{ background: 'rgba(15,26,46,0.85)', backdropFilter: 'blur(8px)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="min-h-[44px] text-[#cbd5e1] hover:text-white font-mono text-xs"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> voltar ao hall
          </Button>
          <div className="text-right">
            <h1
              className="text-2xl font-black tracking-tight font-mono"
              style={{ color: '#00B2A9' }}
            >
              PITACO TEMATICO
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              escolha o dicionario antes de dar o pitaco
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <section className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
            escolha um tema
          </h2>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-[#cbd5e1] leading-relaxed">
            o tabuleiro e o mesmo do <span style={{ color: '#00B2A9' }}>PITACO solo</span>, mas cada tema tem o proprio dicionario de 5 letras e a propria palavra do dia. inspirando no Loldle.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {THEME_LIST.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onSelect={() => onSelect(theme.id)}
            />
          ))}
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-[#2A4060]/40 bg-[#1A2C40]/50 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#cbd5e1]">1 · escolha</p>
            <p className="mt-1 text-sm text-[#cbd5e1]">
              selecione um dos 6 temas do hall.
            </p>
          </article>
          <article className="rounded-xl border border-[#2A4060]/40 bg-[#1A2C40]/50 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#cbd5e1]">2 · jogue</p>
            <p className="mt-1 text-sm text-[#cbd5e1]">
              chute palavras de 5 letras do tema escolhido.
            </p>
          </article>
          <article className="rounded-xl border border-[#2A4060]/40 bg-[#1A2C40]/50 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#cbd5e1]">3 · troque</p>
            <p className="mt-1 text-sm text-[#cbd5e1]">
              botao "trocar tema" no header volta para esta tela.
            </p>
          </article>
        </section>
      </main>
    </div>
  )
}

interface ThemeCardProps {
  theme: (typeof THEME_LIST)[number]
  onSelect: () => void
}

function ThemeCard({ theme, onSelect }: ThemeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex flex-col gap-3 rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-5 shadow-2xl text-left transition-all hover:-translate-y-0.5 hover:border-[#00B2A9]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B2A9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1A2E] motion-reduce:transform-none motion-reduce:hover:translate-y-0"
      aria-label={`Jogar tema ${theme.label}, ${theme.words.length} palavras`}
      data-testid={`theme-card-${theme.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
          style={{ background: `${theme.accent}1f` }}
          aria-hidden="true"
        >
          {theme.emoji}
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider"
          style={{ background: `${theme.accent}26`, color: theme.accent }}
        >
          {theme.words.length} palavras
        </span>
      </div>

      <div className="flex-1">
        <h3
          className="font-mono text-lg font-black tracking-tight text-white"
        >
          {theme.label}
        </h3>
        <p className="mt-1 text-sm text-[#cbd5e1] leading-relaxed">{theme.description}</p>
      </div>

      <div className="flex items-center gap-2 text-[11px] font-mono text-[#cbd5e1]">
        <BookOpen className="h-3 w-3" />
        <span>5 letras &middot; 6 tentativas &middot; 1 palavra por dia</span>
      </div>

      <div
        className="flex items-center justify-center gap-2 rounded-lg py-2 text-[11px] font-mono font-bold uppercase tracking-wider"
        style={{ background: theme.accent, color: '#0F1A2E' }}
      >
        <Sparkles className="h-3 w-3" />
        jogar
      </div>
    </button>
  )
}

export default PitacoTematicoGame
