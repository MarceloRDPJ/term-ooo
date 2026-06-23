import { FormEvent, useMemo, useState } from 'react'
import { Bird, KeyRound, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { validatePassword, strengthColor, MIN_PASSWORD_LENGTH } from '@/lib/password-validation'
import { translateAuthError } from '@/lib/auth-errors'

type AuthController = ReturnType<typeof import('@/hooks/useSupabaseAuth')['useSupabaseAuth']>
type Mode = 'login' | 'signup' | 'forgot'

interface AuthPanelProps {
  auth: AuthController
  isSubmitting: boolean
  onSubmittingChange: (next: boolean) => void
  onMessage?: (message: string | null) => void
}

export function AuthPanel({ auth, isSubmitting, onSubmittingChange, onMessage }: AuthPanelProps) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')

  const passwordCheck = useMemo(() => validatePassword(password), [password])
  const submitting = isSubmitting || auth.loading

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    onSubmittingChange(true)
    const ok = await auth.signInWithPassword(email, password)
    onSubmittingChange(false)
    if (ok) onMessage?.('Login realizado.')
  }

  const handleSignUp = async () => {
    if (!email.trim() || !passwordCheck.valid) return
    onSubmittingChange(true)
    const ok = await auth.signUpWithPassword(
      email,
      password,
      nickname.trim() || email.split('@')[0].slice(0, 20) || 'Estagiario',
    )
    onSubmittingChange(false)
    if (ok) onMessage?.('Conta criada e login realizado.')
  }

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault()
    onSubmittingChange(true)
    const ok = await auth.resetPasswordForEmail(email)
    onSubmittingChange(false)
    if (ok) {
      onMessage?.('Se o email existir, enviamos um link de redefinicao.')
      setMode('login')
    }
  }

  const canSubmitLogin = !submitting && email.trim() && password.length >= 1
  const canSubmitSignup = !submitting && email.trim() && passwordCheck.valid
  const canSubmitForgot = !submitting && email.trim()

  const errorToShow = translateAuthError(auth.error)

  return (
    <div className="space-y-3">
      <div className="mb-1 flex items-center gap-3">
        <div
          className="rounded-xl p-2"
          style={{ background: 'rgba(0,178,169,0.12)', color: '#00B2A9' }}
        >
          {mode === 'forgot' ? <KeyRound className="h-5 w-5" /> : <Bird className="h-5 w-5" />}
        </div>
        <p className="text-sm text-slate-400 font-mono">
          {mode === 'forgot' ? 'informe seu email para receber o link de redefinicao.' : 'entre no escritorio pra dar pitacos.'}
        </p>
      </div>

      {mode === 'forgot' ? (
        <form onSubmit={handleForgot} className="space-y-3">
          <label className="text-sm font-medium text-slate-300 font-mono" htmlFor="email">e-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
            autoComplete="email"
            className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white outline-none focus:border-[#00B2A9]"
          />
          <Button
            type="submit"
            disabled={!canSubmitForgot}
            className="w-full font-mono text-xs"
          >
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
            enviar link de redefinicao
          </Button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className="block w-full text-center text-xs text-slate-400 hover:text-[#00B2A9] font-mono"
          >
            voltar para entrar
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-3">
          <label className="text-sm font-medium text-slate-300 font-mono" htmlFor="email">e-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
            autoComplete="email"
            className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white outline-none focus:border-[#00B2A9]"
          />
          <label className="text-sm font-medium text-slate-300 font-mono" htmlFor="password">senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={`minimo ${MIN_PASSWORD_LENGTH} caracteres`}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            minLength={mode === 'signup' ? MIN_PASSWORD_LENGTH : undefined}
            className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white outline-none focus:border-[#00B2A9]"
          />

          {mode === 'signup' && password.length > 0 && (
            <div
              className="rounded-md border px-3 py-2 text-[11px] font-mono"
              style={{
                borderColor: 'rgba(42,64,96,0.6)',
                background: 'rgba(15,26,46,0.5)',
                color: passwordCheck.valid ? strengthColor(passwordCheck.strength) : '#F1A28A',
              }}
            >
              {passwordCheck.valid ? (
                <p>
                  forca: <strong>{passwordCheck.strength}</strong>
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {passwordCheck.errors.map((err) => (
                    <li key={err}>- {err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <>
              <label className="text-sm font-medium text-slate-300 font-mono" htmlFor="signup-nickname">apelido pra cadastro</label>
              <input
                id="signup-nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="Seu apelido"
                maxLength={20}
                className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white outline-none focus:border-[#00B2A9]"
              />
            </>
          )}

          <Button
            type="submit"
            disabled={mode === 'signup' ? !canSubmitSignup : !canSubmitLogin}
            className="w-full font-mono text-xs"
          >
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            entrar
          </Button>

          {mode === 'login' ? (
            <>
              <Button
                type="button"
                onClick={handleSignUp}
                disabled={!canSubmitSignup}
                variant="outline"
                className="w-full border-[#2A4060] bg-transparent text-slate-300 font-mono text-xs"
              >
                criar conta
              </Button>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="hover:text-[#00B2A9]"
                >
                  esqueci a senha
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="hover:text-[#00B2A9]"
                >
                  cadastrar
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="block w-full text-center text-xs text-slate-400 hover:text-[#00B2A9] font-mono"
            >
              ja tenho conta
            </button>
          )}
        </form>
      )}

      {errorToShow && (
        <div className="rounded-lg border border-[#E25F38]/30 bg-[#E25F38]/10 p-3 text-sm text-[#F1A28A] font-mono">
          {errorToShow}
        </div>
      )}
    </div>
  )
}
