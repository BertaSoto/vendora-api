'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Store,
  Package,
  ShoppingCart,
  ArrowRight,
  Plus,
  TrendingUp,
} from 'lucide-react'
import { storesApi } from '@/api/stores'
import { dashboardApi } from '@/api/dashboard'
import { KpiCard } from '@/components/kpi-card'
import { KpiSkeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Store as StoreType } from '@/types'

const quickActions = [
  {
    icon: Plus,
    title: 'Nueva tienda',
    description: 'Crea una tienda y empieza a vender en minutos.',
    href: '/dashboard/tiendas',
    label: 'Ir a tiendas',
  },
  {
    icon: Package,
    title: 'Catálogo',
    description: 'Administra productos, precios y stock.',
    href: '/dashboard/productos',
    label: 'Ver productos',
  },
  {
    icon: ShoppingCart,
    title: 'Órdenes',
    description: 'Revisa y gestiona todas las órdenes de compra.',
    href: '/dashboard/ordenes',
    label: 'Ver órdenes',
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [stores, setStores] = useState<StoreType[]>([])
  const [totalProducts, setTotalProducts] = useState<number | null>(null)
  const [totalOrders, setTotalOrders] = useState<number | null>(null)
  const [pendingOrders, setPendingOrders] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    try {
      const storesData = await storesApi.list()
      setStores(storesData)

      const summaries = await Promise.all(
        storesData.map((s) => dashboardApi.get(s.id)),
      )
      setTotalProducts(summaries.reduce((sum, d) => sum + d.summary.productsCount, 0))
      setTotalOrders(summaries.reduce((sum, d) => sum + d.summary.ordersCount, 0))
      setPendingOrders(summaries.reduce((sum, d) => sum + d.summary.pendingOrders, 0))
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const activeStores = stores.filter((s) => s.status === 'ACTIVE').length

  if (error) return <ErrorState message={error} onRetry={loadDashboard} />

  return (
    <div>
      {/* ─── Hero header ─── */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 shadow-sm shadow-brand-500/20">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Panel de control
            </h1>
            <p className="mt-1 max-w-lg text-sm leading-relaxed text-slate-500">
              Resumen general de tu negocio. Visualiza tus métricas principales
              y accede rápidamente a las secciones de gestión.
            </p>
          </div>
        </div>
      </div>

      {/* ─── KPI cards ─── */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Tiendas"
            value={stores.length}
            subtitle={`${activeStores} activas`}
            icon={Store}
          />
          <KpiCard
            title="Productos"
            value={totalProducts ?? '—'}
            icon={Package}
          />
          <KpiCard
            title="Órdenes"
            value={totalOrders ?? '—'}
            icon={ShoppingCart}
          />
          <KpiCard
            title="Pendientes"
            value={pendingOrders ?? '—'}
            icon={ShoppingCart}
          />
        </div>
      )}

      {/* ─── Quick actions ─── */}
      {!loading && (
        <div className="mt-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Accesos rápidos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Card key={action.href} hover className="flex flex-col gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 ring-1 ring-brand-100">
                  <action.icon className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{action.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(action.href)}
                  className="mt-auto self-start"
                >
                  {action.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
