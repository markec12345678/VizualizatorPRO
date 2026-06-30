/**
 * PostHog analytics - optional, env-based
 * 
 * Aktivacija:
 * 1. npm install posthog-js posthog-node
 * 2. Dodaj NEXT_PUBLIC_POSTHOG_KEY in NEXT_PUBLIC_POSTHOG_HOST v .env
 * 3. Import v layout.tsx: import { PostHogProvider } from '@/lib/analytics'
 * 
 * Brez env spremenljivk je to no-op (ne naredi nič)
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

export function isAnalyticsEnabled(): boolean {
  return !!POSTHOG_KEY
}

/**
 * Track event v PostHog (ali console v dev)
 */
export function track(event: string, properties?: Record<string, any>) {
  if (isAnalyticsEnabled() && typeof window !== 'undefined') {
    // V produkciji s PostHog:
    // import posthog from 'posthog-js'
    // posthog.capture(event, properties)
    console.log('[Analytics]', event, properties)
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics:dev]', event, properties)
  }
}

/**
 * Identify user v PostHog
 */
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (isAnalyticsEnabled() && typeof window !== 'undefined') {
    // import posthog from 'posthog-js'
    // posthog.identify(userId, traits)
    console.log('[Analytics] identify', userId, traits)
  }
}

/**
 * Reset user session (ob odjavi)
 */
export function resetAnalytics() {
  if (isAnalyticsEnabled() && typeof window !== 'undefined') {
    // import posthog from 'posthog-js'
    // posthog.reset()
    console.log('[Analytics] reset')
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string) {
  track('$pageview', { $current_url: path })
}

// === Pogosti eventi ===

export const analytics = {
  // Vizualizacije
  visualizationStarted: (materialId: string, materialName: string) =>
    track('visualization_started', { materialId, materialName }),
  
  visualizationCompleted: (materialId: string, mode: string, processingTime: number) =>
    track('visualization_completed', { materialId, mode, processingTime }),
  
  visualizationFailed: (materialId: string, error: string) =>
    track('visualization_failed', { materialId, error }),

  // AR
  arStarted: () => track('ar_started'),
  arSnapshot: (profileId: string) => track('ar_snapshot', { profileId }),

  // Lead
  leadSubmitted: (hasMaterial: boolean) =>
    track('lead_submitted', { hasMaterial }),

  // Auth
  userRegistered: (orgName: string, plan: string) =>
    track('user_registered', { orgName, plan }),
  
  userLoggedIn: (role: string) => track('user_logged_in', { role }),
  
  userLoggedOut: () => track('user_logged_out'),

  // PDF
  pdfGenerated: (materialId: string, totalAmount: number) =>
    track('pdf_generated', { materialId, totalAmount }),

  // Material
  materialSelected: (materialId: string, category: string) =>
    track('material_selected', { materialId, category }),

  customMaterialAdded: (category: string) =>
    track('custom_material_added', { category }),

  // Team
  userInvited: (role: string) => track('user_invited', { role }),
  userRemoved: () => track('user_removed'),

  // Language
  languageChanged: (locale: string) => track('language_changed', { locale }),
}
