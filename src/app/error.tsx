'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { captureError } from '@/lib/sentry'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Pošlji napako v Sentry
    captureError(error, {
      digest: error.digest,
      page: 'global-error-boundary',
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Nekaj je šlo narobe
          </h1>
          <p className="text-muted-foreground mb-6">
            Prišlo je do napake pri obdelavi zahteve. Naša ekipa je bila obveščena.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6 w-full text-left">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground mb-2">
                Podrobnosti napake (samo v razvoju)
              </summary>
              <div className="rounded-lg bg-muted p-4 text-xs font-mono overflow-auto max-h-48">
                <p className="text-destructive">{error.message}</p>
                {error.digest && (
                  <p className="text-muted-foreground mt-2">Digest: {error.digest}</p>
                )}
              </div>
            </details>
          )}

          <div className="flex gap-3 w-full">
            <Button
              onClick={reset}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Poskusi znova
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Na začetek
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1">
            <Bug className="h-3 w-3" />
            Napaka je bila samodejno prijavljena
          </p>
        </div>
      </Card>
    </div>
  )
}
