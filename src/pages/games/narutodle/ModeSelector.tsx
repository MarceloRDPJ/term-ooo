// src/pages/games/narutodle/ModeSelector.tsx
//
// Pills horizontais com 4 modos (classic, silhueta, jutsu, citacao).
// Apenas 'classic' e 'silhouette' sao funcionais. Os outros mostram
// "em breve" com cadeado. Visual inspirado em narutodle.net:
// borda laranja + fundo sutil no modo ativo, borda cinza nos demais.

import { Lock } from 'lucide-react'
import { NARUTODLE_MODES, type NarutodleMode } from './modes'
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
              'flex min-h-[32px] items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors',
              isCurrent
                ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#FCD34D] shadow-[0_0_0_1px_rgba(245,158,11,0.25)]'
                : isDisabled
                ? 'cursor-not-allowed border-[#2A4060] bg-transparent text-[#94A3B8] opacity-60'
                : 'border-[#2A4060] bg-[#0F1A2E]/70 text-[#cbd5e1] hover:border-[#F59E0B] hover:text-white'
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
