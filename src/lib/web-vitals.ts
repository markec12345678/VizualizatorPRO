import { Metric } from 'next/web-vitals'
import { track } from '@/lib/analytics'

/**
 * Web Vitals reporting
 * 
 * Sledi Core Web Vitals metrikam in jih pošilja v PostHog (če je omogočen).
 * 
 * Metrike:
 * - CLS (Cumulative Layout Shift) - < 0.1
 * - FID (First Input Delay) - < 100ms
 * - LCP (Largest Contentful Paint) - < 2.5s
 * - FCP (First Contentful Paint) - < 1.8s
 * - TTFB (Time to First Byte) - < 600ms
 * - INP (Interaction to Next Paint) - < 200ms
 */

export function reportWebVitals(metric: Metric) {
  // Track v PostHog
  track('web_vital', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
  })

  // Console log v razvoju
  if (process.env.NODE_ENV === 'development') {
    const ratingEmoji =
      metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌'
    console.log(
      `${ratingEmoji} ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`
    )
  }

  // Sentry performance (če je omogočen)
  if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
    // import * as Sentry from '@sentry/nextjs'
    // Sentry.setMeasurement(metric.name, metric.value, 'millisecond')
  }
}

/**
 * Thresholds za Core Web Vitals
 */
export const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  LCP: { good: 2500, poor: 4000 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
} as const

/**
 * Evaluiraj metric glede na threshold
 */
export function getMetricRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS]
  if (!threshold) return 'good'
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}
