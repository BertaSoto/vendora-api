'use client'

import { useState, useEffect, useCallback } from 'react'

const AUTH_URL =
  process.env.NODE_ENV === 'production'
    ? `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/auth/login`
    : '/api/auth/login'

const TOKEN_KEY = 'vendora_token'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
    expiresAt: number
    user: {
      id: string
      email: string
      fullName: string | null
    }
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (stored) {
      setState((prev) => ({
        ...prev,
        token: stored,
        isAuthenticated: true,
      }))
    }
  }, [])

  const login = useCallback(
    async ({ email, password }: LoginCredentials): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const res = await fetch(AUTH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as Record<
            string,
            unknown
          >

          const message =
            typeof errData.error === 'string'
              ? errData.error
              : 'Credenciales incorrectas'

          throw new Error(message)
        }

        const data = (await res.json()) as LoginResponse
        const token = data.data.accessToken

        localStorage.setItem(TOKEN_KEY, token)
        document.cookie = `vendora_token=${token}; path=/; max-age=${
          60 * 60 * 24 * 7
        }; SameSite=Strict`

        setState({
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        return true
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al iniciar sesión'

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }))

        return false
      }
    },
    [],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    document.cookie = 'vendora_token=; path=/; max-age=0'

    setState({
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return { ...state, login, logout, clearError }
}