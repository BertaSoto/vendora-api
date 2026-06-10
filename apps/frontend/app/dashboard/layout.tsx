'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('vendora_token') : null
    if (!token) {
      router.push('/auth/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="pl-[240px] transition-all duration-200">
        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
