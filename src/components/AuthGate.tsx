import { FormEvent, ReactNode, useState } from 'react'
import { Bird, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

export function AuthGate({ children }: { children: ReactNode }) {
  const auth = useSupabaseAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    await auth.signInWithPassword(email, password)
  }

  const handleSignUp = async () => {
    if (password.length < 6 || !email.trim()) return
    await auth.signUpWithPassword(email, password, nickname.trim() || email.split('@')[0].slice(0, 20) || 'passaro')
  }

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#0F1A2E' }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#00B2A9' }} />
      </div>
    )
  }

  if (!auth.user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40)' }}>
        <div className="w-full max-w-sm rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/80 p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(0,178,169,0.12)' }}>
              <Bird className="h-7 w-7" style={{ color: '#00B2A9' }} />
            </div>
            <h1 className="text-2xl font-black tracking-tight font-mono" style={{ fontFamily: 'var(--font-mono)', color: '#00B2A9' }}>PITACO</h1>
            <p className="mt-2 text-sm text-slate-400">entre no escritorio pra dar pitacos.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e-mail"
              className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-sm text-white outline-none focus:border-[#00B2A9] placeholder:text-slate-600"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="senha"
              className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-sm text-white outline-none focus:border-[#00B2A9] placeholder:text-slate-600"
            />
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="apelido"
              maxLength={20}
              className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-sm text-white outline-none focus:border-[#00B2A9] placeholder:text-slate-600"
            />
            <Button type="submit" disabled={!email.trim() || password.length < 6} className="w-full font-mono text-xs">
              entrar
            </Button>
            <Button type="button" onClick={handleSignUp} disabled={!email.trim() || password.length < 6} variant="outline" className="w-full border-[#2A4060] bg-transparent text-slate-300 font-mono text-xs">
              criar conta
            </Button>
          </form>

          {auth.error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 font-mono">
              {auth.error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
