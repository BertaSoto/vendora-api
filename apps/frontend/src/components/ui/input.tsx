'use client'

import clsx from 'clsx'
import { forwardRef, type InputHTMLAttributes } from 'react'

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={clsx(
      'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-150',
      'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'
