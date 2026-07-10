import clsx from 'clsx'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-indigo-50 text-indigo-700 border-indigo-200',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function statusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'active':
    case 'ACTIVE':
    case 'delivered':
      return 'success'
    case 'pending':
    case 'trial':
    case 'TRIAL':
      return 'warning'
    case 'confirmed':
      return 'info'
    case 'suspended':
    case 'SUSPENDED':
    case 'cancelled':
      return 'danger'
    default:
      return 'default'
  }
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Activo',
    ACTIVE: 'Activo',
    suspended: 'Suspendido',
    SUSPENDED: 'Suspendido',
    trial: 'Prueba',
    TRIAL: 'Prueba',
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  }
  return labels[status] ?? status
}
