// src/lib/auth-errors.ts

const MAP: Record<string, string> = {
  'Invalid login credentials': 'Email ou senha incorretos.',
  'Email not confirmed': 'Confirme seu email antes de entrar.',
  'User already registered': 'Esse email ja tem conta. Tente entrar.',
  'User not found': 'Conta nao encontrada.',
  'Auth session missing': 'Sessao expirada. Faca login de novo.',
  'Auth session expired': 'Sessao expirada. Faca login de novo.',
  'Network request failed': 'Sem conexao. Tente de novo.',
  'Password should be at least 6 characters': `Senha precisa ter pelo menos 6 caracteres.`,
  'Password should be at least 8 characters': `Senha precisa ter pelo menos 8 caracteres.`,
  'Signup requires a valid password': 'Senha invalida.',
  'Signup not allowed': 'Cadastro desabilitado. Fale com o chefe.',
  'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos.',
  'For security purposes, you can only request this after': 'Muitas tentativas. Aguarde alguns minutos.',
  'New password should be different from the old password.': 'A nova senha precisa ser diferente da atual.',
}

const PREFIX_MAP: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
  [/^Password should be at least (\d+) characters/, (m) => `Senha precisa ter pelo menos ${m[1]} caracteres.`],
  [/^New password should be different from the old password/, () => 'A nova senha precisa ser diferente da atual.'],
]

export function translateAuthError(message: string | null | undefined): string {
  if (!message) return ''
  if (MAP[message]) return MAP[message]
  for (const [re, fn] of PREFIX_MAP) {
    const match = message.match(re)
    if (match) return fn(match)
  }
  return message
}
