'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { captureError } from '@/lib/sentry'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary - ulovi nepričakovane napake v React komponentah
 * in prikaže uporabniku prijazno error stran namesto belega zaslona.
 * 
 * Napake se avtomatsko pošljejo v Sentry (če je konfiguriran).
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Pošlji v Sentry
    captureError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ErrorBoundary',
    })
    
    this.setState({ errorInfo })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

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
                Prišlo je do nepričakovane napake. Naša ekipa je bila obveščena.
                Poskusi osvežiti stran ali se vrni na začetek.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 w-full text-left">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground mb-2">
                    Podrobnosti napake (samo v razvoju)
                  </summary>
                  <div className="rounded-lg bg-muted p-4 text-xs font-mono overflow-auto max-h-48">
                    <p className="text-destructive font-bold mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="text-muted-foreground whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-3 w-full">
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Osveži stran
                </Button>
                <Button
                  onClick={this.handleGoHome}
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

    return this.props.children
  }
}
