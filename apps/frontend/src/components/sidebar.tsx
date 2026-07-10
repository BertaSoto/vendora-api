'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  User,
  LogOut,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/tiendas', label: 'Tiendas', icon: Store },
  { href: '/dashboard/productos', label: 'Productos', icon: Package },
  { href: '/dashboard/ordenes', label: 'Órdenes', icon: ShoppingCart },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('vendora_token')
    document.cookie = 'vendora_token=; path=/; max-age=0'
    router.push('/auth/login')
  }

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-200 w-[64px] lg:w-[240px]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-3 lg:px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-600">
          <span className="text-sm font-bold text-white">V</span>
        </div>
        <Link href="/dashboard" className="hidden lg:block text-lg font-bold tracking-tight text-slate-900">
          Vendora
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin lg:px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.label}
                  className={clsx(
                    'group flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-150 lg:px-3',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
                  )}
                >
                  <item.icon
                    className={clsx(
                      'h-[18px] w-[18px] flex-shrink-0 transition-colors',
                      isActive
                        ? 'text-brand-600'
                        : 'text-slate-400 group-hover:text-slate-500',
                    )}
                  />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 px-2 py-4 lg:px-3">
        <p className="mb-2 hidden px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 lg:block">
          Cuenta
        </p>
        <div className="space-y-1">
          <Link
            href="/dashboard"
            title="Usuario"
            className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 lg:px-3"
          >
            <User className="h-[18px] w-[18px] flex-shrink-0 text-slate-400" />
            <span className="hidden lg:inline">Usuario</span>
          </Link>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 lg:px-3"
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
            <span className="hidden lg:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
