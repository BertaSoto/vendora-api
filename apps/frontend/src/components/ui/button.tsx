'use client'

import clsx from 'clsx'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500/40 shadow-sm shadow-brand-500/10',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400/40',
  outline:
    'border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-brand-500/40 bg-white',
  danger:
    'border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 focus:ring-red-400/40 bg-white',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400/40',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-2.5 py-1.5 text-xs rounded-lg gap-1',
  md: 'px-4 py-2 text-sm rounded-lg gap-1.5',
  lg: 'px-5 py-2.5 text-sm rounded-xl gap-2',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98]',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
