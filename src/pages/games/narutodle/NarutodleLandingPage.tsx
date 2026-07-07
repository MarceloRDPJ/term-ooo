// src/pages/games/narutodle/NarutodleLandingPage.tsx
//
// Landing page do Narutodle dentro do PITACO. Inspirada em narutodle.net:
// header com botao "hall" + titulo "NARUTODLE" estilizado, 4 cards de
// modo (Classic, Jutsu, Quote, Eye), secao de cross-promo com 5 jogos
// parceiros e footer com links sociais.
//
// Os 4 cards de modo navegam para as rotas do NarutodleGame existente:
//   - Classico -> /play/narutodle
//   - Jutsu    -> /play/narutodle-jutsu
//   - Quote    -> /play/narutodle-quote
//   - Eye      -> /play/narutodle-eye
//
// Cores: laranja Naruto #FF601B, bg #181C20 -> teal #78CED7, card
// rgba(0,0,0,0.4) com borda colorida por modo.

import { ArrowLeft, Coffee, ExternalLink, Info, Twitter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const NARUTO_ORANGE = '#FF601B'
const NARUTO_ORANGE_DARK = '#D55E00'
const NARUTO_BG = '#181C20'
const NARUTO_TEAL = '#78CED7'
const NARUTO_GOLD = '#AF9767'

interface ModeCard {
  id: 'classico' | 'jutsu' | 'quote' | 'eye'
  label: string
  description: string
  icon: string
  color: string
  path: string
}

const MODES: readonly ModeCard[] = [
  {
    id: 'classico',
    label: 'Classic',
    description: 'Get clues on every try',
    icon: '🔍',
    color: '#38B9FF',
    path: '/play/narutodle',
  },
  {
    id: 'jutsu',
    label: 'Jutsu',
    description: 'Guess with a jutsu clue',
    icon: '🌀',
    color: '#3DA75E',
    path: '/play/narutodle-jutsu',
  },
  {
    id: 'quote',
    label: 'Quote',
    description: 'Guess with a dialogue',
    icon: '💬',
    color: '#F6D44E',
    path: '/play/narutodle-quote',
  },
  {
    id: 'eye',
    label: 'Eye',
    description: 'Guess with an eye',
    icon: '👁',
    color: '#D5369A',
    path: '/play/narutodle-eye',
  },
]

interface PartnerGame {
  slug: string
  name: string
  description: string
  url: string
}

const PARTNER_GAMES: readonly PartnerGame[] = [
  {
    slug: 'loldle',
    name: 'LoLdle',
    description: 'League of Legends',
    url: 'https://loldle.net',
  },
  {
    slug: 'pokedle',
    name: 'Pokedle',
    description: 'Pokemon',
    url: 'https://pokedle.net',
  },
  {
    slug: 'smashdle',
    name: 'Smashdle',
    description: 'Super Smash Bros.',
    url: 'https://smashdle.net',
  },
  {
    slug: 'dotadle',
    name: 'Dotadle',
    description: 'DOTA 2',
    url: 'https://dotadle.app',
  },
  {
    slug: 'onepiecdle',
    name: 'OnePiecdle',
    description: 'One Piece',
    url: 'https://onepiecedle.net',
  },
]

export function NarutodleLandingPage() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen text-white font-mono"
      style={{
        background: `radial-gradient(ellipse at top, ${NARUTO_TEAL}22 0%, transparent 55%), linear-gradient(180deg, ${NARUTO_BG} 0%, #0E1E25 45%, #111A22 100%)`,
      }}
    >
      <header
        className="border-b"
        style={{
          background: 'rgba(24, 28, 32, 0.85)',
          backdropFilter: 'blur(8px)',
          borderColor: 'rgba(255, 96, 27, 0.3)',
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white font-mono"
            aria-label="Voltar para o hall do PITACO"
            data-testid="narutodle-back-hall"
          >
            <ArrowLeft className="h-4 w-4" /> hall
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              🍥
            </span>
            <span
              className="text-xs font-mono uppercase tracking-[0.25em]"
              style={{ color: NARUTO_ORANGE }}
            >
              narutodle
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="mb-10 flex flex-col items-center text-center sm:mb-14">
          <h1
            className="font-black tracking-tight leading-none"
            style={{
              color: NARUTO_ORANGE,
              fontSize: 'clamp(3rem, 12vw, 7rem)',
              letterSpacing: '-0.04em',
              textShadow: `0 0 24px rgba(255, 96, 27, 0.35), 3px 3px 0 ${NARUTO_ORANGE_DARK}`,
            }}
            data-testid="narutodle-logo"
          >
            NARUTODLE
          </h1>
          <div
            className="mt-3 text-xs font-mono uppercase tracking-[0.35em] sm:text-sm"
            style={{ color: 'rgba(255, 96, 27, 0.85)' }}
          >
            Daily Naruto Game
          </div>
          <div
            className="mt-2 h-1 w-24 rounded-full"
            style={{ background: `linear-gradient(90deg, transparent, ${NARUTO_ORANGE}, transparent)` }}
            aria-hidden="true"
          />
        </div>

        <section className="mb-12" aria-labelledby="narutodle-modes-heading">
          <h2
            id="narutodle-modes-heading"
            className="mb-5 text-center font-mono text-xs uppercase tracking-[0.25em] text-slate-300 sm:text-sm"
          >
            choose a mode
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => navigate(mode.path)}
                className="group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-all hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderColor: mode.color,
                  ['--tw-ring-color' as string]: mode.color,
                  ['--tw-ring-offset-color' as string]: NARUTO_BG,
                }}
                aria-label={`Jogar modo ${mode.label}: ${mode.description}`}
                data-testid={`mode-card-${mode.id}`}
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-xl text-3xl transition-transform group-hover:scale-110"
                  style={{
                    background: 'rgba(24, 28, 32, 0.85)',
                    boxShadow: `0 0 0 2px ${mode.color}55 inset`,
                  }}
                  aria-hidden="true"
                >
                  {mode.icon}
                </div>
                <div>
                  <h3
                    className="font-black tracking-tight"
                    style={{ color: NARUTO_ORANGE, fontSize: '1.5rem', lineHeight: 1.1 }}
                  >
                    {mode.label}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-300 font-mono leading-relaxed">
                    {mode.description}
                  </p>
                </div>
                <div
                  className="absolute inset-x-3 bottom-2 h-0.5 rounded-full opacity-60 transition-opacity group-hover:opacity-100"
                  style={{ background: mode.color }}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </section>

        <section className="mb-10" aria-labelledby="narutodle-partners-heading">
          <header className="mb-4 flex items-center justify-center gap-2">
            <h3
              id="narutodle-partners-heading"
              className="font-mono text-xs uppercase tracking-[0.25em] text-slate-300 sm:text-sm"
            >
              joga os nossos outros jogos
            </h3>
          </header>
          <div
            className="rounded-2xl border-2 p-4 shadow-2xl sm:p-5"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: NARUTO_ORANGE,
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {PARTNER_GAMES.map((partner) => (
                <a
                  key={partner.slug}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-2 rounded-xl border p-3 transition-all hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    background: 'rgba(24, 28, 32, 0.7)',
                    borderColor: 'rgba(255, 96, 27, 0.35)',
                    ['--tw-ring-color' as string]: NARUTO_ORANGE,
                    ['--tw-ring-offset-color' as string]: NARUTO_BG,
                  }}
                  aria-label={`${partner.name} (${partner.description}), abre em nova aba`}
                  data-testid={`partner-card-${partner.slug}`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
                      aria-hidden="true"
                    >
                      🎮
                    </div>
                    <ExternalLink
                      className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-[#FF601B]"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h4 className="font-mono text-sm font-bold text-white">{partner.name}</h4>
                    <p className="text-[10px] text-slate-300 font-mono">{partner.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer
        className="mt-6 border-t"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderColor: 'rgba(255, 96, 27, 0.3)',
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-5 sm:flex-row sm:justify-between">
          <p
            className="font-mono text-xs"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            narutodle.net — 2025
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs text-slate-300">
            <a
              href="https://twitter.com/narutodle"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#FF601B]"
              aria-label="Twitter do Narutodle"
              data-testid="narutodle-footer-twitter"
            >
              <Twitter className="h-3.5 w-3.5" aria-hidden="true" /> twitter
            </a>
            <a
              href="https://narutodle.net/about"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#FF601B]"
              aria-label="Sobre o Narutodle"
              data-testid="narutodle-footer-about"
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" /> about
            </a>
            <a
              href="https://ko-fi.com/narutodle"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#FF601B]"
              aria-label="Apoie no Ko-fi"
              data-testid="narutodle-footer-kofi"
            >
              <Coffee className="h-3.5 w-3.5" aria-hidden="true" /> ko-fi
            </a>
          </div>
        </div>
        <div
          className="mx-auto h-px max-w-6xl"
          style={{
            background: `linear-gradient(90deg, transparent, ${NARUTO_GOLD}, transparent)`,
          }}
          aria-hidden="true"
        />
      </footer>
    </div>
  )
}
