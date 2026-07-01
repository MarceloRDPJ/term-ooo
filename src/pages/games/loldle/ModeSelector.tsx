// src/pages/games/loldle/ModeSelector.tsx
//
// Pills horizontais com 5 modos (classic, quote, splash, emoji, ability).
// O modo atual tem fundo ciano (#00B2A9). Os outros tem border cinza.
// Modos nao funcionais mostram "em breve" no titulo.

import { Lock } from 'lucide-react'
import { LOLDLE_MODES, type LoldleMode } from './modes'
import { cn } from '@/lib/utils'

export function LoldleModeSelector({
  current,
  onSelect,
}: {
  current: LoldleMode
  onSelect: (mode: LoldleMode) => void
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="tablist"
      aria-label="Selecao de modo do Loldle"
    >
      {LOLDLE_MODES.map((m) => {
        const isCurrent = m.id === current
        const isDisabled = !m.available && !isCurrent
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={isCurrent}
            aria-disabled={isDisabled}
            disabled={isDisabled}
            onClick={() => {
              if (!isDisabled) onSelect(m.id)
            }}
            title={m.available ? `Modo ${m.label}` : `${m.label} - em breve`}
            className={cn(
              'flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors',
              isCurrent
                ? 'border-[#00B2A9] bg-[#00B2A9] text-[#0F1A2E]'
                : isDisabled
                ? 'cursor-not-allowed border-[#2A4060] bg-transparent text-[#94A3B8]'
                : 'border-[#2A4060] bg-[#0F1A2E]/70 text-[#cbd5e1] hover:border-[#00B2A9] hover:text-white'
            )}
          >
            <span>{m.label}</span>
            {isDisabled && <Lock className="h-3 w-3" aria-hidden="true" />}
          </button>
        )
      })}
    </div>
  )
}
