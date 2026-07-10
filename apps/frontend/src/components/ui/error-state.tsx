import { AlertTriangle } from 'lucide-react'
import { Button } from './button'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100">
        <AlertTriangle className="h-6 w-6 text-rose-500" />
      </div>
      <p className="text-sm font-medium text-rose-700">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          Reintentar
        </Button>
      )}
    </div>
  )
}
