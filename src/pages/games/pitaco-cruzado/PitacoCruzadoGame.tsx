// src/pages/games/pitaco-cruzado/PitacoCruzadoGame.tsx
//
// Tela do PITACO Cruzado. Equivale ao modo Quarteto (4 boards, 9
// tentativas), mas com identidade de produto separada: key no localStorage
// propria, offset proprio de palavras, e um "reabrir o dia" simples que
// recarrega a pagina apos limpar o save.
//
// A renderizacao reutiliza os componentes visuais do app (GameBoard +
// Keyboard) - so a logica de coordenacao e especifica do Cruzado.

import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Home, RefreshCw, Trophy, Skull } from 'lucide-react'
import { GameBoard } from '@/components/new/GameBoard'
import { Keyboard } from '@/components/Keyboard'
import { getDayNumber, getTodayDateKey } from '@/lib/dates'
import {
  createInitialCrosswordState,
  processCrosswordGuess,
  isCrosswordWon,
  getCompletedBoardsCount,
  getCrosswordWords,
  crosswordStorage,
  CROSSWORD_MAX_ATTEMPTS,
} from './engine'
import type { CrosswordState } from './types'

export function PitacoCruzadoGame() {
  const [state, setState] = useState<CrosswordState | null>(null)
  const [error, setError] = useState<string>('')
  const [shake, setShake] = useState<number>(0)
  // Pula o auto-save na primeira renderizacao para nao sobrescrever o
  // estado limpo que acabou de ser persistido pelo mount effect.
  const initialMountRef = useRef(false)

  // Carrega (ou cria) o estado do dia. Roda uma vez no mount.
  useEffect(() => {
    const dayNumber = getDayNumber()
    const dateKey = getTodayDateKey()
    const saved = crosswordStorage.load(dateKey)

    if (saved) {
      setState(saved)
      initialMountRef.current = true
      return
    }

    const words = getCrosswordWords(dayNumber)
    const fresh = createInitialCrosswordState(dateKey, dayNumber, words)
    setState(fresh)
    crosswordStorage.save(dateKey, fresh)
    initialMountRef.current = true
  }, [])

  // Auto-save sempre que o estado muda, exceto na primeira renderizacao
  // (o mount effect ja cuidou de criar/salvar o estado inicial).
  useEffect(() => {
    if (!state) return
    if (!initialMountRef.current) return
    crosswordStorage.save(state.dateKey, state)
  }, [state])

  const handleKey = useCallback((key: string) => {
    setState(prev => {
      if (!prev || prev.isGameOver) return prev

      if (key === 'BACKSPACE') {
        const next = [...prev.currentGuess]
        // Encontra a ultima posicao preenchida e apaga
        let lastIdx = -1
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i] !== '') { lastIdx = i; break }
        }
        if (lastIdx === -1) return prev
        next[lastIdx] = ''
        return { ...prev, currentGuess: next }
      }

      if (key === 'ENTER') {
        const result = processCrosswordGuess(prev)
        if (result.error) {
          setError(result.error)
          setShake(s => s + 1)
          setTimeout(() => setError(''), 1500)
          return prev
        }
        return result.newState
      }

      // Letra comum: ignora se ja tem 5 letras
      if (prev.currentGuess.every(l => l !== '')) return prev
      const lower = key.toLowerCase()
      // Filtra so letras a-z (defensivo contra caracteres inesperados)
      if (!/^[a-z]$/.test(lower)) return prev

      const next = [...prev.currentGuess]
      let emptyIdx = next.findIndex(l => l === '')
      if (emptyIdx === -1) return prev
      next[emptyIdx] = lower
      return { ...prev, currentGuess: next }
    })
  }, [])

  // Suporte a teclado fisico para desktop. Mobile usa os botoes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (state?.isGameOver) return
      if (e.key === 'Enter') {
        handleKey('ENTER')
        return
      }
      if (e.key === 'Backspace') {
        e.preventDefault()
        handleKey('BACKSPACE')
        return
      }
      if (/^[a-zA-Z]$/.test(e.key)) {
        handleKey(e.key.toUpperCase())
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleKey, state?.isGameOver])

  const handleReopen = () => {
    if (!state) return
    crosswordStorage.clear(state.dateKey)
    window.location.reload()
  }

  const handleCloseEndOverlay = () => {
    window.location.href = '/'
  }

  if (!state) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40)' }}
      >
        <div className="text-white text-xl font-mono">Carregando Cruzado...</div>
      </div>
    )
  }

  const completed = getCompletedBoardsCount(state)
  const won = isCrosswordWon(state)
  const showEndOverlay = state.isGameOver

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40, #243447)' }}
    >
      {/* Header enxuto do Cruzado. Sem auth/abas - so o minimo necessario. */}
      <header
        className="border-b flex-shrink-0 z-10"
        style={{ borderColor: 'rgba(42,64,96,0.4)', background: 'rgba(15,26,46,0.85)' }}
      >
        <div className="max-w-7xl mx-auto px-2 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-2">
          <Link
            to="/"
            className="flex min-h-[44px] items-center gap-1.5 px-2 text-[#94A3B8] hover:text-white font-mono text-xs sm:text-sm"
            aria-label="Voltar para o Hall"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">hall</span>
          </Link>

          <div className="flex flex-col items-center">
            <h1
              className="text-base sm:text-lg font-black uppercase tracking-wider font-mono"
              style={{ color: '#00B2A9' }}
            >
              PITACO Cruzado
            </h1>
            <div role="status" aria-live="polite" className="text-[10px] sm:text-xs text-[#94A3B8] font-mono">
              Dia #{state.dayNumber} · {completed}/4 boards · {state.currentRow}/{CROSSWORD_MAX_ATTEMPTS} tentativas
            </div>
          </div>

          <button
            type="button"
            onClick={handleReopen}
            className="flex min-h-[44px] items-center gap-1.5 px-2 text-[#94A3B8] hover:text-white font-mono text-xs sm:text-sm"
            aria-label="Reabrir o dia (limpa o save atual)"
            title="Reabrir o dia (limpa o save atual)"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">reabrir</span>
          </button>
        </div>
      </header>

      {/* Mensagem de erro flutuante. Some apos 1.5s. */}
      {error && (
        <div role="alert" className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#E25F38] text-white px-4 py-2 rounded-lg shadow-lg z-50 font-mono text-sm animate-pulse">
          {error}
        </div>
      )}

      {/* Area principal: 4 boards 2x2 (mobile) / 4x1 (desktop) */}
      <main className="flex-1 flex items-center justify-center px-2 py-3 sm:px-4 sm:py-4 md:py-6 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-0 gap-y-3 sm:gap-3 md:gap-4 lg:gap-6 w-full">
          {state.boards.map((board, index) => (
            <div
              key={index}
              className={`flex ${index % 2 === 1 ? 'justify-start pl-3' : 'justify-end pr-3'} md:justify-center md:p-0`}
            >
              <GameBoard
                board={board}
                currentGuess={state.currentGuess}
                currentRow={state.currentRow}
                maxAttempts={state.maxAttempts}
                gameMode="quadra"
                shouldShake={shake > 0}
                highContrast={false}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Teclado compartilhado: gradiente conic de 4 estados por letra. */}
      <div className="w-full pb-3 sm:pb-4 md:pb-6 max-w-2xl mx-auto flex-shrink-0 z-10 px-2">
        <Keyboard
          keyStates={state.keyStates}
          onKeyPress={handleKey}
          highContrast={false}
          disabled={state.isGameOver}
        />
      </div>

      {/* Overlay de fim de jogo: vitoria ou derrota. */}
      {showEndOverlay && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,26,46,0.85)', backdropFilter: 'blur(4px)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cruzado-gameover-title"
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleCloseEndOverlay()
          }}
          tabIndex={-1}
        >
          <div
            className="w-full max-w-sm rounded-2xl border p-6 text-center shadow-2xl"
            style={{
              background: 'rgba(26,44,64,0.95)',
              borderColor: won ? 'rgba(0,178,169,0.5)' : 'rgba(239,68,68,0.5)',
            }}
          >
            <div className="flex justify-center mb-3">
              {won ? (
                <Trophy className="w-12 h-12" style={{ color: '#00B2A9' }} />
              ) : (
                <Skull className="w-12 h-12 text-red-400" />
              )}
            </div>
            <h2
              id="cruzado-gameover-title"
              className="text-2xl font-black font-mono uppercase tracking-wider mb-2"
              style={{ color: won ? '#00B2A9' : '#f87171' }}
            >
              {won ? 'homologado' : 'sem consenso'}
            </h2>
            <p className="text-sm text-slate-200 font-mono mb-1">
              {won
                ? `${state.currentRow} tentativa${state.currentRow === 1 ? '' : 's'} · 4/4 boards`
                : `${completed}/4 boards em ${state.maxAttempts} tentativas`}
            </p>
            <p className="text-xs text-[#94A3B8] font-mono mb-5">
              {won
                ? 'Pauta fechada. O RH vai te amar.'
                : 'Amanha tem nova pauta. Abre o olho no stand-up.'}
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleReopen}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-lg font-mono text-sm font-bold transition-colors"
                style={{ background: '#00B2A9', color: '#0F1A2E' }}
              >
                reabrir o dia
              </button>
              <Link
                to="/"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-lg font-mono text-sm border border-slate-500 text-slate-200 hover:bg-slate-700/40 transition-colors inline-block"
              >
                voltar para o hall
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
