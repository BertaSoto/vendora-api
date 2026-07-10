import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'danger'
}

const variantStyles = {
  default: { bg: 'bg-slate-50', text: 'text-slate-600', ring: 'ring-slate-200' },
  brand: { bg: 'bg-brand-50', text: 'text-brand-600', ring: 'ring-brand-200' },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-200' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200' },
  danger: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-200' },
}

export function StatCard({ label, value, icon: Icon, variant = 'default' }: StatCardProps) {
  const s = variantStyles[variant]
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.bg} ring-1 ${s.ring}`}>
        <Icon className={`h-5 w-5 ${s.text}`} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-xl font-bold tracking-tight text-slate-900 tabular-nums">
          {value}
        </p>
      </div>
    </div>
  )
}
