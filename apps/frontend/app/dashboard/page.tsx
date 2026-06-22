'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Store,
  Package,
  ShoppingCart,
  ArrowRight,
  Plus,
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
        <h1 className="text-2xl font-bold text-slate-900">
          Bienvenido a Vendora
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestiona tus tiendas, productos y órdenes desde un solo lugar.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            title="Total Tiendas"
            value={stores.length}
            subtitle={`${activeStores} activas`}
            icon={Store}
          />
          <KpiCard
            title="Total Productos"
            value={totalProducts ?? '—'}
            icon={Package}
          />
          <KpiCard
            title="Total Órdenes"
            value={totalOrders ?? '—'}
            icon={ShoppingCart}
          />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col items-start gap-3">
          <div className="rounded-lg bg-brand-50 p-2.5">
            <Plus className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Nueva tienda</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Crea una tienda y empieza a vender.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/tiendas')}
            className="mt-auto"
          >
            Crear tienda
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>

        <Card className="flex flex-col items-start gap-3">
          <div className="rounded-lg bg-brand-50 p-2.5">
            <Package className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Productos</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Administra el catálogo de productos.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/productos')}
            className="mt-auto"
          >
            Ver productos
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>

        <Card className="flex flex-col items-start gap-3">
          <div className="rounded-lg bg-brand-50 p-2.5">
            <ShoppingCart className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Órdenes</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Revisa y gestiona las órdenes de compra.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/ordenes')}
            className="mt-auto"
          >
            Ver órdenes
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>
      </div>
    </div>
  )
}
