/**
 * Sentry error tracking - optional, env-based
 * 
 * Aktivacija:
 * 1. npm install @sentry/nextjs
 * 2. Dodaj SENTRY_DSN v .env
 * 3. Import v layout.tsx: import { SentryErrorBoundary } from '@/lib/sentry'
 * 
 * Brez SENTRY_DSN je to no-op (ne naredi nič)
 */

const SENTRY_DSN = process.env.SENTRY_DSN

export function isSentryEnabled(): boolean {
  return !!SENTRY_DSN && process.env.NODE_ENV === 'production'
}

/**
 * Capture error v Sentry (ali console v dev)
 */
export function captureError(error: Error | string, context?: Record<string, any>) {
  if (isSentryEnabled()) {
    // V produkciji s Sentry:
    // import * as Sentry from '@sentry/nextjs'
    // Sentry.captureException(error, { extra: context })
    console.error('[Sentry]', error, context)
  } else {
    console.error('[Error]', error, context)
  }
}

/**
 * Capture message v Sentry
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (isSentryEnabled()) {
    // import * as Sentry from '@sentry/nextjs'
    // Sentry.captureMessage(message, level)
    console.log(`[Sentry:${level}]`, message)
  } else {
    console.log(`[${level}]`, message)
  }
}

/**
 * Set user context za Sentry
 */
export function setSentryUser(user: { id: string; email: string; role?: string } | null) {
  if (isSentryEnabled()) {
    // import * as Sentry from '@sentry/nextjs'
    // if (user) {
    //   Sentry.setUser({ id: user.id, email: user.email, role: user.role })
    // } else {
    //   Sentry.setUser(null)
    // }
  }
}

/**
 * Wrapper za async funkcije z avtomatskim error tracking
 */
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
