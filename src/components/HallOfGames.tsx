// src/components/HallOfGames.tsx
//
// Hall de entrada do PITACO. Lista os jogos disponiveis + em breve.
// Cracha rapido no header se o user estiver logado.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Gamepad2, Sparkles, Trophy } from 'lucide-react'
import { Button } from './ui/button'
import { GameCard } from './GameCard'
import { AvatarDisplay } from './AvatarDisplay'
import { AuthPanel } from './AuthPanel'
import { getEnabledGames, getComingSoonGames } from '@/lib/games'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

export function HallOfGames() {
  const navigate = useNavigate()
  const auth = useSupabaseAuth()
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const enabled = getEnabledGames()
  const coming = getComingSoonGames()
  const profile = auth.profile as (typeof auth.profile & { role?: string | null }) | null

  useEffect(() => {
    if (auth.user) {
      setMessage(null)
    }
  }, [auth.user])

  const handlePlayPitaco = () => {
    navigate('/play/pitaco')
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40, #243447)' }}
    >
      <header
        className="border-b border-[#2A4060]/40"
        style={{ background: 'rgba(15,26,46,0.85)', backdropFilter: 'blur(8px)' }}
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

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <section className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
            bem-vindo ao escritorio
          </h2>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
            aqui voce da seus <span style={{ color: '#00B2A9' }}>pitacos</span> em varios jogos. alguns sao solo,
            outros viram <span style={{ color: '#E3C275' }}>pauta</span> com o time. escolha o seu e
            homologue o resultado.
          </p>
        </section>

        {enabled.length > 0 && (
          <section className="mb-10">
            <header className="mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4" style={{ color: '#E3C275' }} />
              <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300">
                disponivel agora
              </h3>
            </header>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enabled.map((game) => (
                <GameCard key={game.slug} game={game} />
              ))}
            </div>
          </section>
        )}

        {enabled.length > 0 && (
          <div className="mb-10 flex justify-center sm:justify-start">
            <Button
              onClick={handlePlayPitaco}
              className="font-mono text-xs"
              style={{ background: '#00B2A9', color: '#0F1A2E' }}
            >
              jogar PITACO agora
            </Button>
          </div>
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

        <section className="mt-12 rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/70 p-5 shadow-2xl sm:p-6">
          <h2 className="text-lg font-mono font-bold text-white">acessar o escritorio</h2>
          <p className="mt-1 text-sm text-slate-400">
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
                    <p className="font-mono text-sm font-bold" style={{ color: '#00B2A9' }}>
                      {profile?.nickname || 'Estagiario'}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">{auth.user.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:ml-auto">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/salas')}
                    className="border-[#2A4060] bg-transparent text-slate-200 font-mono text-xs"
                  >
                    abrir pauta
                  </Button>
                  {profile?.role === 'admin' && (
                    <Button
                      onClick={() => navigate('/admin')}
                      className="font-mono text-xs"
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

        <footer className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 font-mono">
          <a
            href="/docs"
            className="hover:text-[#00B2A9]"
            onClick={(event) => {
              event.preventDefault()
              navigate('/docs')
            }}
          >
            docs
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="/perfil"
            className="hover:text-[#00B2A9]"
            onClick={(event) => {
              event.preventDefault()
              navigate('/perfil')
            }}
          >
            cracha
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="/ranking"
            className="hover:text-[#00B2A9]"
            onClick={(event) => {
              event.preventDefault()
              navigate('/ranking')
            }}
          >
            relatorio
          </a>
        </footer>
      </main>
    </div>
  )
}
