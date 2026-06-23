/**
 * AboutDialog.tsx
 *
 * Dialog "Sobre" do PITACO: narrativa de escritório, vocabulário corporativo
 * (pauta, pitaco, homologado, relatório) e Sabiá Auditor como mascote.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Bird, Keyboard, Users, Coffee } from 'lucide-react'
import { useDialogAnimations } from '@/hooks/useDialogAnimations'
import { DialogShell } from './DialogShell'
import { ResponsiveScrollArea } from './ui/responsive-scroll-area'

interface AboutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PITACO_CIANO = '#00B2A9'
const PITACO_AMARELO = '#E3C275'

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const { containerVariants, itemVariants } = useDialogAnimations({
    staggerDelay: 0.15,
    childrenDelay: 0.1,
    itemDuration: 0.5,
    itemDistance: 20,
  })

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 260,
        damping: 20,
      },
    },
  }

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Sobre o PITACO"
      description="Um jogo de palavras para quem já sobreviveu a reunião demais."
      borderColor="border-[#00B2A9]"
      titleGradientClassName="bg-gradient-to-r from-[#00B2A9] to-[#E3C275]"
      maxWidth="2xl"
      maxHeight="90vh"
    >
      <ResponsiveScrollArea
        desktopClassName="max-h-[calc(90vh-80px)] px-6"
        mobileClassName="h-[calc(100dvh-8rem)] px-4"
      >
          <AnimatePresence>
            {open && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 py-4 pr-4"
              >
                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <motion.div variants={iconVariants}>
                      <Bird className="w-7 h-7" style={{ color: PITACO_CIANO }} />
                    </motion.div>
                    <h3 className="text-xl font-bold" style={{ color: PITACO_CIANO }}>O que é</h3>
                  </div>
                  <p className="text-slate-200 leading-relaxed pl-10">
                    PITACO é um jogo de palavras em português. Você tenta descobrir o termo do dia,
                    sozinho ou em pauta com o time.
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <motion.div variants={iconVariants}>
                      <Keyboard className="w-7 h-7" style={{ color: PITACO_AMARELO }} />
                    </motion.div>
                    <h3 className="text-xl font-bold" style={{ color: PITACO_AMARELO }}>Como funciona</h3>
                  </div>
                  <p className="text-slate-200 leading-relaxed pl-10">
                    Digite um pitaco, veja o que foi homologado, ajuste a rota e tente fechar
                    a pauta antes das tentativas acabarem.
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <motion.div variants={iconVariants}>
                      <Users className="w-7 h-7" style={{ color: PITACO_CIANO }} />
                    </motion.div>
                    <h3 className="text-xl font-bold" style={{ color: PITACO_CIANO }}>Pautas com amigos</h3>
                  </div>
                  <p className="text-slate-200 leading-relaxed pl-10">
                    Abra uma pauta, chame o time, receba sugestões, vote nos melhores pitacos
                    e tente homologar a resposta em grupo.
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <motion.div variants={iconVariants}>
                      <Coffee className="w-7 h-7" style={{ color: PITACO_AMARELO }} />
                    </motion.div>
                    <h3 className="text-xl font-bold" style={{ color: PITACO_AMARELO }}>Sabiá Auditor</h3>
                  </div>
                  <p className="text-slate-200 leading-relaxed pl-10">
                    O Sabiá Auditor acompanha tudo com a energia de quem revisou planilha
                    até 18h07 numa sexta-feira.
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="border-t pt-4 space-y-3 text-center"
                  style={{ borderColor: 'rgba(42,64,96,0.6)' }}
                >
                  <p className="text-base font-mono font-semibold tracking-wide">
                    <span style={{ color: PITACO_CIANO }}>HOMOLOGADO</span>
                    <span className="mx-2 text-slate-500">quando dá certo</span>
                    <span className="mx-2 text-slate-500">·</span>
                    <span style={{ color: PITACO_AMARELO }}>PAUTA SEM CONSENSO</span>
                    <span className="mx-2 text-slate-500">quando não dá</span>
                  </p>
                  <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5" />
                    feito com café, humor de escritório e muito prazo estourado
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
      </ResponsiveScrollArea>
    </DialogShell>
  )
}
