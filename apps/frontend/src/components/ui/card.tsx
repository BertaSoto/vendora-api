import clsx from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm',
        hover && 'transition-all duration-200 hover:shadow-md hover:border-slate-300',
        className,
      )}
    >
      {children}
    </div>
  )
}
