// src/lib/password-validation.ts

export interface PasswordCheck {
  valid: boolean
  errors: string[]
  strength: 'fraca' | 'media' | 'forte'
}

export const MIN_PASSWORD_LENGTH = 8

export function validatePassword(raw: string): PasswordCheck {
  const pwd = raw ?? ''
  const errors: string[] = []

  if (pwd.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Minimo ${MIN_PASSWORD_LENGTH} caracteres`)
  }
  if (!/[a-z]/.test(pwd)) {
    errors.push('Pelo menos 1 letra minuscula')
  }
  if (!/[A-Z]/.test(pwd)) {
    errors.push('Pelo menos 1 letra maiuscula')
  }
  if (!/\d/.test(pwd)) {
    errors.push('Pelo menos 1 numero')
  }

  let strength: PasswordCheck['strength'] = 'fraca'
  if (errors.length === 0) {
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
    const longEnough = pwd.length >= 12
    if (hasSpecial && longEnough) strength = 'forte'
    else if (hasSpecial || longEnough) strength = 'media'
    else strength = 'media'
  }

  return { valid: errors.length === 0, errors, strength }
}

const STRENGTH_COLOR: Record<PasswordCheck['strength'], string> = {
  fraca: '#E25F38',
  media: '#E3C275',
  forte: '#00B2A9',
}

export function strengthColor(strength: PasswordCheck['strength']): string {
  return STRENGTH_COLOR[strength]
}
