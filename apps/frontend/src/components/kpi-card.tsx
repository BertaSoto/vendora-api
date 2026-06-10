import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from './ui/card'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: 'up' | 'down'
  trendValue?: string
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, trendValue }: KpiCardProps) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        {trend && trendValue && (
          <div className="mt-2 flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span
              className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}
            >
              {trendValue}
            </span>
          </div>
        )}
      </div>
      <div className="rounded-lg bg-brand-50 p-2.5">
        <Icon className="h-5 w-5 text-brand-600" />
      </div>
    </Card>
  )
}
