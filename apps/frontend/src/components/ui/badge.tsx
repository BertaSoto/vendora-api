import clsx from 'clsx'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-indigo-50 text-indigo-700',
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
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
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
