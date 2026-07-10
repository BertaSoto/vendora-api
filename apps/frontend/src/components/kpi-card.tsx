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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] lg:text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
            {title}
          </p>
          <p className="mt-1.5 lg:mt-2 text-xl lg:text-[28px] font-bold leading-none tracking-tight text-slate-900 tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 lg:mt-1.5 text-[11px] lg:text-xs text-slate-400">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="mt-2 lg:mt-3 flex items-center gap-1">
              {trend === 'up' ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
              )}
              <span className={`text-[11px] lg:text-xs font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className="flex h-9 w-9 lg:h-11 lg:w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 ring-1 ring-brand-100">
          <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-brand-600" />
        </div>
      </div>
    </div>
  )
}
