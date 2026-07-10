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
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Panel de control
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Resumen general de tu negocio
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
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

      <div className="mt-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card hover className="flex flex-col gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 ring-1 ring-brand-100">
              <Plus className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Nueva tienda</h3>
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                Crea una tienda y empieza a vender en minutos.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/tiendas')}
              className="mt-auto self-start"
            >
              Ir a tiendas
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>

          <Card hover className="flex flex-col gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 ring-1 ring-brand-100">
              <Package className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Catálogo</h3>
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                Administra productos, precios y stock.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/productos')}
              className="mt-auto self-start"
            >
              Ver productos
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>

          <Card hover className="flex flex-col gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 ring-1 ring-brand-100">
              <ShoppingCart className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Órdenes</h3>
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                Revisa y gestiona todas las órdenes de compra.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/ordenes')}
              className="mt-auto self-start"
            >
              Ver órdenes
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
