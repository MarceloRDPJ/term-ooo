import { FormEvent, useState } from 'react'
import { Bird, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type AuthController = ReturnType<typeof import('@/hooks/useSupabaseAuth')['useSupabaseAuth']>

interface AuthPanelProps {
  auth: AuthController
  isSubmitting: boolean
  onSubmittingChange: (next: boolean) => void
  onMessage?: (message: string | null) => void
}

export function AuthPanel({ auth, isSubmitting, onSubmittingChange, onMessage }: AuthPanelProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    onSubmittingChange(true)
    const ok = await auth.signInWithPassword(email, password)
    onSubmittingChange(false)
    if (ok) onMessage?.('Login realizado.')
  }

  const handleSignUp = async () => {
    if (password.length < 6 || !email.trim()) return
    onSubmittingChange(true)
    const ok = await auth.signUpWithPassword(
      email,
      password,
      nickname.trim() || email.split('@')[0].slice(0, 20) || 'Estagiario',
    )
    onSubmittingChange(false)
    if (ok) onMessage?.('Conta criada e login realizado.')
  }

  const submitting = isSubmitting || auth.loading

  if (auth.loading) {
    return (
      <div className="flex items-center gap-2 text-slate-300 font-mono text-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="mb-1 flex items-center gap-3">
        <div
          className="rounded-xl p-2"
          style={{ background: 'rgba(0,178,169,0.12)', color: '#00B2A9' }}
        >
          <Bird className="h-5 w-5" />
        </div>
        <p className="text-sm text-slate-400 font-mono">entre no escritorio pra dar pitacos.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-3">
        <label className="text-sm font-medium text-slate-300 font-mono" htmlFor="email">e-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@email.com"
          className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white outline-none focus:border-[#00B2A9]"
        />
        <label className="text-sm font-medium text-slate-300 font-mono" htmlFor="password">senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="minimo 6 caracteres"
          className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white outline-none focus:border-[#00B2A9]"
        />
        <label className="text-sm font-medium text-slate-300 font-mono" htmlFor="signup-nickname">apelido pra cadastro</label>
        <input
          id="signup-nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="Seu apelido"
          maxLength={20}
          className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white outline-none focus:border-[#00B2A9]"
        />
        <Button
          type="submit"
          disabled={submitting || !email.trim() || password.length < 6}
          className="w-full font-mono text-xs"
        >
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          entrar
        </Button>
        <Button
          type="button"
          onClick={handleSignUp}
          disabled={submitting || !email.trim() || password.length < 6}
          variant="outline"
          className="w-full border-[#2A4060] bg-transparent text-slate-300 font-mono text-xs"
        >
          criar conta
        </Button>
      </form>

      {auth.error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 font-mono">
          {auth.error}
        </div>
      )}
    </div>
  )
}
