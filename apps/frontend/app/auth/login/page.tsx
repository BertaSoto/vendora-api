'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const success = await login({ email, password })
    if (success) router.push('/dashboard')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600">
            <span className="text-lg font-bold text-white">V</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Iniciar sesión</h1>
          <p className="mt-1.5 text-sm text-slate-500">Ingresa a tu panel de Vendora</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Correo electrónico</label>
            <input
              type="email" placeholder="tu@correo.com"
              value={email} onChange={(e) => { setEmail(e.target.value); clearError() }} required
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Contraseña</label>
            <input
              type="password" placeholder="••••••••"
              value={password} onChange={(e) => { setPassword(e.target.value); clearError() }} required
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">{error}</p>}

          <button
            type="submit" disabled={isLoading}
            className="mt-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  )
}
