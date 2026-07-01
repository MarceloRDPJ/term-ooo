// src/pages/games/loldle/ModeSelector.tsx
//
// Pills horizontais com 5 modos (classic, quote, splash, emoji, ability).
// Visual inspirado no loldle.net: pill com border rounded, ativa com
// borda amarela e fundo ciano escuro, inativa com border cinza, e
// cadeado nos modos em breve.

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
      className="flex flex-wrap items-center gap-1.5 sm:gap-2"
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
              'flex min-h-[34px] items-center gap-1.5 rounded-full border-2 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors sm:text-[11px]',
              isCurrent
                ? 'border-[#fbbf24] bg-[#00B2A9]/15 text-[#5BE0D8] shadow-[0_0_0_1px_rgba(251,191,36,0.25)]'
                : isDisabled
                ? 'cursor-not-allowed border-[#2A4060] bg-transparent text-[#94A3B8]/70'
                : 'border-[#2A4060] bg-[#0F1A2E]/60 text-[#cbd5e1] hover:border-[#5BE0D8] hover:text-white'
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
