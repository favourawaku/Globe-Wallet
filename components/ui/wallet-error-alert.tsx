import * as React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface WalletErrorAlertProps {
  id?: string
  message: string
  'data-testid'?: string
  onRetry?: () => void
}

export function WalletErrorAlert({ id, message, 'data-testid': dataTestId, onRetry }: WalletErrorAlertProps) {
  return (
    <Alert
      id={id}
      variant="destructive"
      role="alert"
      aria-live="assertive"
      data-testid={dataTestId}
      className="flex flex-col gap-3 items-start md:flex-row md:items-center md:justify-between"
    >
      <div className="flex gap-2 items-start">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
        <AlertDescription className="font-medium">{message}</AlertDescription>
      </div>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="text-xs flex items-center gap-1 border-destructive/30 hover:bg-destructive/10 hover:text-destructive shrink-0 mt-2 md:mt-0"
          data-testid="error-retry-btn"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden />
          Retry
        </Button>
      )}
    </Alert>
  )
}
