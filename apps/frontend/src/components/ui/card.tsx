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
        'rounded-xl border border-slate-200 bg-white p-5 shadow-sm',
        hover && 'transition-shadow hover:shadow-md',
        className,
      )}
    >
      {children}
    </div>
  )
}
