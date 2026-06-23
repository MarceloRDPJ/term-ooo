import { useCallback, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/multiplayer-types'

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
}

export function useSupabaseAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    error: null,
  })

  const loadProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setState((prev) => ({ ...prev, profile: null }))
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      setState((prev) => ({ ...prev, error: error.message }))
      return
    }

    if (data) {
      setState((prev) => ({ ...prev, profile: data as Profile, error: null }))
      return
    }

    const nickname = user.email?.split('@')[0]?.slice(0, 20) || 'Estagiario'
    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert({ id: user.id, nickname })
      .select('*')
      .single()

    if (createError) {
      setState((prev) => ({ ...prev, error: createError.message }))
      return
    }

    setState((prev) => ({ ...prev, profile: createdProfile as Profile, error: null }))
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!mounted) return

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }))
        return
      }

      const session = data.session
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
        error: null,
      }))
      await loadProfile(session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
        error: null,
      }))
      void loadProfile(session?.user ?? null)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signInWithEmail = useCallback(async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setState((prev) => ({ ...prev, error: 'Informe seu e-mail.' }))
      return false
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: window.location.origin + import.meta.env.BASE_URL + 'salas',
      },
    })

    if (error) {
      setState((prev) => ({ ...prev, error: error.message }))
      return false
    }

    setState((prev) => ({ ...prev, error: null }))
    return true
  }, [])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      setState((prev) => ({ ...prev, error: error.message }))
      return false
    }

    setState((prev) => ({ ...prev, error: null }))
    return true
  }, [])

  const signUpWithPassword = useCallback(async (email: string, password: string, nickname: string) => {
    const cleanedNickname = nickname.trim().slice(0, 20) || 'Estagiario'
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { nickname: cleanedNickname },
      },
    })

    if (error) {
      setState((prev) => ({ ...prev, error: error.message }))
      return false
    }

    setState((prev) => ({ ...prev, error: null }))
    return true
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setState({ session: null, user: null, profile: null, loading: false, error: null })
  }, [])

  const updateProfile = useCallback(async (values: Partial<Pick<Profile, 'nickname' | 'avatar_url' | 'avatar_config'>>) => {
    if (!state.user) return false

    const patch: Record<string, unknown> = {}
    if (typeof values.nickname === 'string') {
      const nickname = values.nickname.trim().slice(0, 20)
      if (nickname.length < 2) {
        setState((prev) => ({ ...prev, error: 'Nickname deve ter pelo menos 2 caracteres.' }))
        return false
      }
      patch.nickname = nickname
    }
    if (typeof values.avatar_url === 'string') {
      patch.avatar_url = values.avatar_url.trim() || null
    }
    if (values.avatar_config !== undefined) {
      patch.avatar_config = values.avatar_config
    }

    if (Object.keys(patch).length === 0) return true

    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', state.user.id)
      .select('*')
      .single()

    if (error) {
      setState((prev) => ({ ...prev, error: error.message }))
      return false
    }

    setState((prev) => ({ ...prev, profile: data as Profile, error: null }))
    return true
  }, [state.user])

  return {
    ...state,
    signInWithEmail,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    updateProfile,
  }
}
