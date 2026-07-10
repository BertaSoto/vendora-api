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
    <div className="min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="pl-[64px] transition-all duration-200 lg:pl-[240px]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
