import clsx from 'clsx'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-xl bg-slate-200',
        className,
      )}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <Skeleton className="mb-4 h-5 w-2/3" />
      <Skeleton className="mb-3 h-4 w-full" />
      <Skeleton className="mb-3 h-4 w-1/2" />
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-1">
      <Skeleton className="mb-1 h-10 w-full rounded-none" />
      <div className="space-y-1 px-1 pb-1">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="mb-1 h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  )
}
