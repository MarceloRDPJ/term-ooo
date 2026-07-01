// src/pages/games/loldle/QuoteCard.tsx
//
// Card de exibicao da quote do campeao alvo no modo Quote.
// Inspirado no Loldle Quote: o jogador recebe a frase e precisa
// adivinhar de qual campeao e.

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

export function LoldleQuoteCard({ text, revealed }: { text: string; revealed: boolean }) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border-2 border-[#2A4060] bg-gradient-to-br from-[#0F1A2E] to-[#1A2C40] p-5 shadow-2xl sm:p-6"
    >
      <Quote
        className="absolute -left-2 -top-2 h-16 w-16 rotate-180 text-[#00B2A9]/10"
        aria-hidden="true"
      />
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00B2A9]/15 text-xl">
          <Quote className="h-5 w-5 text-[#00B2A9]" />
        </div>
        <div className="flex-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#cbd5e1]">
            frase do campeao
          </p>
          <blockquote className="mt-2 font-mono text-base font-medium italic leading-relaxed text-white sm:text-lg">
            &ldquo;{text}&rdquo;
          </blockquote>
          {revealed && (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-[#5BE0D8]">
              spoiler abaixo
            </p>
          )}
        </div>
      </div>
    </motion.figure>
  )
}
