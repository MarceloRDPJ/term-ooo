// src/pages/games/narutodle/silhouette/SilhouettePanel.tsx
//
// Placeholder do modo Silhueta. Mostra a primeira letra do nome do
// personagem + emoji + texto "silhueta em breve". Sem imagem real.

import { motion } from 'framer-motion'

export function NarutodleSilhouettePanel({
  characterName,
  revealed,
}: {
  characterName: string
  revealed: boolean
}) {
  const firstLetter = characterName.trim().charAt(0).toUpperCase() || '?'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed border-[#2A4060] bg-gradient-to-br from-[#0F1A2E] to-[#1A2C40] p-6 text-center"
      style={{ minHeight: 180 }}
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-5xl sm:text-6xl font-black"
        style={{ color: '#FCD34D' }}
        aria-hidden="true"
      >
        {firstLetter}
      </motion.span>
      <span className="text-4xl sm:text-5xl" aria-hidden="true">
        👤
      </span>
      <p className="font-mono text-xs uppercase tracking-wider text-[#cbd5e1] sm:text-sm">
        silhueta em breve
      </p>
      {revealed && (
        <p
          className="rounded-full px-3 py-1 font-mono text-base font-black sm:text-lg"
          style={{ background: 'rgba(245,158,11,0.2)', color: '#FCD34D' }}
        >
          {characterName}
        </p>
      )}
    </motion.div>
  )
}
