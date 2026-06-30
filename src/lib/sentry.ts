/**
 * Sentry error tracking - optional, env-based
 * Brez SENTRY_DSN je to no-op (ne naredi nič)
 */

const SENTRY_DSN = process.env.SENTRY_DSN

export function isSentryEnabled(): boolean {
  return !!SENTRY_DSN && process.env.NODE_ENV === 'production'
}

export function captureError(error: Error | string, context?: Record<string, any>) {
  if (isSentryEnabled()) {
    console.error('[Sentry]', error, context)
  } else {
    console.error('[Error]', error, context)
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (isSentryEnabled()) {
    console.log(`[Sentry:${level}]`, message)
  } else {
    console.log(`[${level}]`, message)
  }
}

export function setSentryUser(user: { id: string; email: string; role?: string } | null) {
  if (isSentryEnabled()) {
    // Sentry.setUser(...)
  }
}

export async function withErrorTracking<T>(
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), context)
    throw error
  }
}
