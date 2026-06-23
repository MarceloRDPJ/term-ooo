// src/pages/ResetPasswordPage.tsx

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { validatePassword, strengthColor, MIN_PASSWORD_LENGTH } from '@/lib/password-validation'
import { translateAuthError } from '@/lib/auth-errors'

type RecoveryState = 'loading' | 'ready' | 'invalid' | 'success' | 'error'

function parseHash(hash: string): { accessToken: string; refreshToken: string; type: string } | null {
  const cleaned = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(cleaned)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  const type = params.get('type')
  if (!accessToken || !refreshToken) return null
  return { accessToken, refreshToken, type: type ?? '' }
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const auth = useSupabaseAuth()
  const [state, setState] = useState<RecoveryState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const passwordCheck = useMemo(() => validatePassword(newPassword), [newPassword])

  useEffect(() => {
    let mounted = true
    const parsed = parseHash(window.location.hash)
    if (!parsed) {
      setError('Link invalido ou expirado. Solicite um novo.')
      setState('invalid')
      return
    }
    if (parsed.type !== 'recovery' && parsed.type !== '') {
      setError('Tipo de link nao suportado.')
      setState('invalid')
      return
    }
    supabase.auth
      .setSession({ access_token: parsed.accessToken, refresh_token: parsed.refreshToken })
      .then(({ data, error: e }) => {
        if (!mounted) return
        if (e || !data.session) {
          setError(translateAuthError(e?.message) || 'Sessao nao pode ser restaurada. Solicite um novo link.')
          setState('invalid')
          return
        }
        setState('ready')
      })
      .catch((e) => {
        if (!mounted) return
        setError(translateAuthError(e?.message) || 'Erro inesperado.')
        setState('error')
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!passwordCheck.valid) {
      setError(`Senha fraca. Corrija: ${passwordCheck.errors.join(', ')}.`)
      return
    }
    if (newPassword !== confirmPassword) {
      setError('A confirmacao nao confere com a nova senha.')
      return
    }
    setSubmitting(true)
    setError(null)
    const ok = await auth.updatePassword(newPassword)
    setSubmitting(false)
    if (ok) {
      setState('success')
      setTimeout(() => {
        void supabase.auth.signOut()
        navigate('/salas', { replace: true })
      }, 1500)
    } else {
      setError(translateAuthError(auth.error) || 'Erro ao redefinir senha.')
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'linear-gradient(to bottom, #0F1A2E, #1A2C40, #243447)' }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[#2A4060]/40 bg-[#1A2C40]/80 p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div
            className="rounded-xl p-2"
            style={{ background: 'rgba(0,178,169,0.15)', color: '#00B2A9' }}
          >
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black font-mono" style={{ color: '#00B2A9' }}>
              redefinir senha
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              escolha uma senha nova com pelo menos {MIN_PASSWORD_LENGTH} caracteres.
            </p>
          </div>
        </div>

        {state === 'loading' && (
          <div className="flex items-center gap-2 text-slate-300 font-mono text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> validando link...
          </div>
        )}

        {(state === 'invalid' || state === 'error') && (
          <div className="space-y-3">
            <div className="rounded-lg border border-[#E25F38]/30 bg-[#E25F38]/10 p-3 text-sm text-[#F1A28A] font-mono">
              {error || 'Link invalido.'}
            </div>
            <Button onClick={() => navigate('/salas')} className="w-full font-mono text-xs">
              voltar para o login
            </Button>
          </div>
        )}

        {state === 'ready' && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="text-sm font-medium text-slate-300 font-mono" htmlFor="new-password">
              nova senha
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              autoFocus
              minLength={MIN_PASSWORD_LENGTH}
              className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white outline-none focus:border-[#00B2A9]"
            />

            <label className="text-sm font-medium text-slate-300 font-mono" htmlFor="confirm-password">
              confirmar nova senha
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              className="w-full rounded-lg border border-[#2A4060] bg-[#0F1A2E] px-3 py-2 font-mono text-white outline-none focus:border-[#00B2A9]"
            />

            {newPassword.length > 0 && (
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

            <Button
              type="submit"
              disabled={submitting || !passwordCheck.valid}
              className="w-full font-mono text-xs"
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              redefinir senha
            </Button>
          </form>
        )}

        {state === 'success' && (
          <div className="space-y-2 text-center">
            <ShieldCheck className="mx-auto h-10 w-10" style={{ color: '#00B2A9' }} />
            <p className="font-mono text-sm" style={{ color: '#00B2A9' }}>
              senha redefinida. redirecionando...
            </p>
          </div>
        )}

        {error && state !== 'invalid' && state !== 'error' && (
          <div className="mt-3 rounded-lg border border-[#E25F38]/30 bg-[#E25F38]/10 p-3 text-sm text-[#F1A28A] font-mono">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
