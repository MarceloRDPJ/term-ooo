// src/components/HallOfGames.tsx
//
// Hall de entrada do PITACO. Lista os jogos disponiveis + em breve.
// Cracha rapido no header se o user estiver logado.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Gamepad2, Sparkles, Trophy } from 'lucide-react'
import { Button } from './ui/button'
import { GameCard } from './GameCard'
import { AvatarDisplay } from './AvatarDisplay'
import { AuthPanel } from './AuthPanel'
import { getEnabledGames, getComingSoonGames } from '@/lib/games'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

interface PartnerGame {
  slug: string
  name: string
  description: string
  icon: string
  url: string
}

const PARTNER_GAMES: readonly PartnerGame[] = [
  {
    slug: 'loldle',
    name: 'LoLdle',
    description: 'adivinhe campeoes de League of Legends',
    icon: '⚔️',
    url: 'https://loldle.net',
  },
  {
    slug: 'pokedle',
    name: 'Pokedle',
    description: 'descubra o pokemon do dia',
    icon: '⚡',
    url: 'https://pokedle.net',
  },
  {
    slug: 'smashdle',
    name: 'Smashdle',
    description: 'personagens de Super Smash Bros',
    icon: '💥',
    url: 'https://smashdle.net',
  },
  {
    slug: 'dotadle',
    name: 'Dotadle',
    description: 'herois de Dota 2',
    icon: '🗡️',
    url: 'https://dotadle.app',
  },
  {
    slug: 'onepiecdle',
    name: 'OnePiecdle',
    description: 'adivinhe personagens de One Piece',
    icon: '🏴\u200d☠️',
    url: 'https://onepiecedle.net',
  },
]

/** Redirecionamentos de path para jogos que tem uma landing page
 *  intermediaria antes de cair no jogo. Hoje apenas o narutodle,
 *  que abre um hall proprio (4 modos) em /narutodle/landing. */
const GAME_PATH_OVERRIDES: Readonly<Record<string, string>> = {
  narutodle: '/narutodle/landing',
}

export function HallOfGames() {
  const navigate = useNavigate()
  const auth = useSupabaseAuth()
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const enabled = getEnabledGames()
  const coming = getComingSoonGames()
  const profile = auth.profile

  const handlePlayPitaco = () => {
    navigate('/play/pitaco')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111F] text-slate-100">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,178,169,0.14),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(227,194,117,0.08),_transparent_30%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-32 bg-gradient-to-b from-[#0F1A2E] to-transparent" />
      <header
        className="relative z-10 border-b border-[#20364A]"
        style={{ background: 'rgba(7,17,31,0.92)', backdropFilter: 'blur(10px)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-4">
          <button
            onClick={() => navigate('/salas')}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white font-mono"
          >
            <ArrowLeft className="h-4 w-4" /> pautas
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <Gamepad2 className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#00B2A9' }} />
            <h1
              className="text-xl sm:text-2xl font-black tracking-tight font-mono"
              style={{ color: '#00B2A9' }}
            >
              PITACO
            </h1>
            <span className="hidden text-xs text-slate-500 font-mono sm:inline">
              · sala de entrada
            </span>
          </div>
          {auth.user ? (
            <button
              onClick={() => navigate('/salas')}
              className="flex items-center gap-2"
              aria-label="Cracha do usuario"
            >
              <AvatarDisplay
                config={(profile?.avatar_config as Record<string, unknown> | null | undefined) ?? null}
                name={profile?.nickname ?? auth.user.email ?? null}
                size="sm"
              />
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <section className="mb-8 rounded-3xl border border-[#20364A] bg-[#0B1628]/95 p-5 shadow-xl shadow-black/25 sm:mb-10 sm:p-7">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
            bem-vindo ao escritorio
          </h2>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
            o hub de <span style={{ color: '#00B2A9' }}>pitacos</span> do escritorio. aqui voce joga mini-games de palavras, logica e geografia.
            da seu palpite solo ou abre uma <span style={{ color: '#E3C275' }}>pauta</span> com o time e homologue o resultado.
          </p>
        </section>

        {enabled.length > 0 && (
          <section className="mb-10">
            <header className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" style={{ color: '#E3C275' }} />
                <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300">
                  disponivel agora
                </h3>
              </div>
              <Button
                onClick={handlePlayPitaco}
                className="font-mono text-xs"
                size="lg"
                style={{ background: '#00B2A9', color: '#0F1A2E', minHeight: 44 }}
              >
                jogar PITACO agora
              </Button>
            </header>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enabled.map((game) => (
                <GameCard
                  key={game.slug}
                  game={game}
                  pathOverride={GAME_PATH_OVERRIDES[game.slug]}
                />
              ))}
            </div>
          </section>
        )}

        {coming.length > 0 && (
          <section className="mb-10">
            <header className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: '#00B2A9' }} />
              <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300">em breve</h3>
            </header>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coming.map((game) => (
                <GameCard key={game.slug} game={game} />
              ))}
            </div>
          </section>
        )}

        <section className="mb-10">
          <header className="mb-4 flex items-center gap-2">
            <ExternalLink className="h-4 w-4" style={{ color: '#E3C275' }} />
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300">
              joga os nossos outros jogos
            </h3>
          </header>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {PARTNER_GAMES.map((partner) => (
              <a
                key={partner.slug}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-3 rounded-xl border border-[#20364A] bg-[#101C2E] p-4 shadow-lg shadow-black/15 transition-all hover:-translate-y-0.5 hover:border-[#00B2A9]/45 hover:bg-[#132338] motion-reduce:transform-none motion-reduce:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B2A9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1A2E]"
                aria-label={`${partner.name}, abre em nova aba`}
                data-testid={`partner-card-${partner.slug}`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{ background: 'rgba(7,17,31,0.72)' }}
                    aria-hidden="true"
                  >
                    {partner.icon}
                  </div>
                  <ExternalLink
                    className="h-3.5 w-3.5 text-slate-500 transition-colors group-hover:text-[#00B2A9]"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h4 className="font-mono text-sm font-bold text-white">{partner.name}</h4>
                  <p className="mt-0.5 text-xs text-slate-300 leading-relaxed">
                    {partner.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-[#20364A] bg-[#0B1628]/95 p-5 shadow-xl shadow-black/25 sm:p-6">
          <h2 className="text-lg font-mono font-bold text-white">acessar o escritorio</h2>
          <p className="mt-1 text-sm text-slate-300">
            faca login pra abrir pautas, jogar contra o time e homologar resultados.
          </p>
          <div className="mt-5">
            {auth.user ? (
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <AvatarDisplay
                    config={(profile?.avatar_config as Record<string, unknown> | null | undefined) ?? null}
                    name={profile?.nickname ?? auth.user.email ?? null}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-bold" style={{ color: '#00B2A9' }}>
                        {profile?.nickname || 'Estagiario'}
                      </p>
                      {profile?.role === 'admin' && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider"
                          style={{
                            background: 'rgba(0, 178, 169, 0.18)',
                            color: '#00B2A9',
                            borderColor: 'rgba(0, 178, 169, 0.45)',
                          }}
                          aria-label="papel de admin"
                        >
                          admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-mono">{auth.user.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:ml-auto">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/salas')}
                    className="border-[#2A4060] bg-transparent text-slate-200 font-mono text-xs"
                    size="lg"
                    style={{ minHeight: 44 }}
                  >
                    abrir pauta
                  </Button>
                  {profile?.role === 'admin' && (
                    <Button
                      onClick={() => navigate('/admin')}
                      className="font-mono text-xs"
                      size="lg"
                      style={{ minHeight: 44 }}
                    >
                      painel de admin
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <AuthPanel
                auth={auth}
                isSubmitting={isSubmitting}
                onSubmittingChange={setIsSubmitting}
                onMessage={setMessage}
              />
            )}
            {(auth.error || message) && (
              <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100 font-mono">
                {auth.error || message}
              </div>
            )}
          </div>
        </section>

        <section className="mt-12 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-[#20364A] bg-[#0B1628]/90 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-300">1 · jogue</p>
            <p className="mt-1 text-sm text-slate-300">
              escolha um jogo da lista, de seu palpite e ganhe crachas.
            </p>
          </article>
          <article className="rounded-xl border border-[#20364A] bg-[#0B1628]/90 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-300">2 · abra pauta</p>
            <p className="mt-1 text-sm text-slate-300">
              convide o time, votem nos melhores pitacos e o dono envia pro tabuleiro.
            </p>
          </article>
          <article className="rounded-xl border border-[#20364A] bg-[#0B1628]/90 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-300">3 · homologue</p>
            <p className="mt-1 text-sm text-slate-300">
              pontue o cracha, suba no relatorio e compare com o escritorio.
            </p>
          </article>
        </section>
      </main>
    </div>
  )
}
