import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-[28px] font-bold leading-none tracking-tight text-slate-900">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1.5 text-xs text-slate-400">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="mt-3 flex items-center gap-1">
              {trend === 'up' ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
              )}
              <span
                className={`text-xs font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 ring-1 ring-brand-100">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
      </div>
    </div>
  )
}
