// src/components/GameCard.tsx
//
// Card de jogo no Hall. Mostra thumbnail, titulo, descricao, categoria,
// dificuldade, e botao Jogar/Em breve.

import { useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, Sparkles, Star } from 'lucide-react'
import { Button } from './ui/button'
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type GameDefinition,
} from '@/lib/platform-types'

interface GameCardProps {
  game: GameDefinition
}

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Dificuldade ${level} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="h-3 w-3"
          style={{
            color: i <= level ? '#E3C275' : 'rgba(148,163,184,0.25)',
            fill: i <= level ? '#E3C275' : 'transparent',
          }}
        />
      ))}
    </div>
  )
}

export function GameCard({ game }: GameCardProps) {
  const navigate = useNavigate()
  const cat = CATEGORY_COLORS[game.category]
  const label = CATEGORY_LABELS[game.category]

  const handleClick = () => {
    if (!game.enabled) return
    navigate(game.path)
  }

  return (
    <article
      className={`group relative flex flex-col gap-4 rounded-2xl border p-5 shadow-2xl transition-all ${
        game.enabled
          ? 'cursor-pointer border-[#2A4060]/40 bg-[#1A2C40]/70 hover:-translate-y-0.5 hover:border-[#00B2A9]/40'
          : 'cursor-not-allowed border-[#2A4060]/20 bg-[#1A2C40]/40 opacity-90'
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={game.enabled ? 0 : -1}
      onKeyDown={(event) => {
        if (game.enabled && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          handleClick()
        }
      }}
      aria-label={`${game.title}${game.enabled ? '' : ' (em breve)'}`}
      data-testid={`game-card-${game.slug}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl"
          style={{ background: 'rgba(15,26,46,0.6)' }}
          aria-hidden="true"
        >
          {game.thumbnail}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider"
            style={{ background: cat.bg, color: cat.fg }}
          >
            {label}
          </span>
          <DifficultyStars level={game.difficulty} />
        </div>
      </div>

      <div className="flex-1">
        <h3
          className="font-mono text-lg font-black tracking-tight"
          style={{ color: game.enabled ? '#FFFFFF' : 'rgba(226,232,240,0.7)' }}
        >
          {game.title}
        </h3>
        <p className="mt-1 text-sm text-slate-300 leading-relaxed">{game.description}</p>
        {game.hint && !game.enabled && (
          <p className="mt-2 text-[11px] font-mono text-slate-500 italic">dica: {game.hint}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        {game.enabled ? (
          <Button
            className="w-full font-mono text-xs"
            onClick={(event) => {
              event.stopPropagation()
              handleClick()
            }}
          >
            jogar
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Button>
        ) : (
          <div
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#2A4060] py-2 text-[11px] font-mono text-slate-500"
          >
            <Lock className="h-3 w-3" />
            em breve
            <Sparkles className="h-3 w-3" />
          </div>
        )}
      </div>
    </article>
  )
}
