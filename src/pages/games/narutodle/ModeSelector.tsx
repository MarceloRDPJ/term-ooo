// src/pages/games/narutodle/ModeSelector.tsx
//
// Pills horizontais com 4 modos jogaveis (classic, jutsu, quote, eye).

import { Lock } from 'lucide-react'
import { NARUTODLE_MODES, NARUTODLE_MODE_COLORS } from './modes'
import type { NarutodleMode } from './types'
import { cn } from '@/lib/utils'

export function NarutodleModeSelector({
  current,
  onSelect,
}: {
  current: NarutodleMode
  onSelect: (mode: NarutodleMode) => void
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="tablist"
      aria-label="Selecao de modo do Narutodle"
    >
      {NARUTODLE_MODES.map((m) => {
        const isCurrent = m.id === current
        const isDisabled = !m.available && !isCurrent
        const color = NARUTODLE_MODE_COLORS[m.id]
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
              'flex min-h-[32px] items-center gap-1.5 rounded-full border-2 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors sm:text-[11px]',
              isCurrent
                ? 'shadow-[0_0_0_1px_var(--mode-glow)]'
                : isDisabled
                ? 'cursor-not-allowed border-[#2A4060] bg-transparent text-[#94A3B8] opacity-60'
                : 'border-[#2A4060] bg-[#0F1A2E]/70 text-[#cbd5e1] hover:text-white'
            )}
            style={
              isCurrent
                ? ({
                    borderColor: color.border,
                    backgroundColor: color.bg,
                    color: color.text,
                    '--mode-glow': `${color.border}55`,
                  } as React.CSSProperties)
                : isDisabled
                ? undefined
                : undefined
            }
          >
            <span aria-hidden="true">{m.icon}</span>
            <span>{m.label}</span>
            {isDisabled && <Lock className="h-3 w-3" aria-hidden="true" />}
          </button>
        )
      })}
    </div>
  )
}
