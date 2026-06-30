/**
 * Analytics utility - optional, env-based
 * Brez env spremenljivk je to no-op (ne naredi nič)
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY

export function isAnalyticsEnabled(): boolean {
  return !!POSTHOG_KEY
}

export function track(event: string, properties?: Record<string, any>) {
  if (isAnalyticsEnabled() && typeof window !== 'undefined') {
    console.log('[Analytics]', event, properties)
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics:dev]', event, properties)
  }
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (isAnalyticsEnabled() && typeof window !== 'undefined') {
    console.log('[Analytics] identify', userId, traits)
  }
}

export function resetAnalytics() {
  if (isAnalyticsEnabled() && typeof window !== 'undefined') {
    console.log('[Analytics] reset')
  }
}

export function trackPageView(path: string) {
  track('$pageview', { $current_url: path })
}

export const analytics = {
  visualizationStarted: (materialId: string, materialName: string) =>
    track('visualization_started', { materialId, materialName }),
  visualizationCompleted: (materialId: string, mode: string, processingTime: number) =>
    track('visualization_completed', { materialId, mode, processingTime }),
  visualizationFailed: (materialId: string, error: string) =>
    track('visualization_failed', { materialId, error }),
  arStarted: () => track('ar_started'),
  arSnapshot: (profileId: string) => track('ar_snapshot', { profileId }),
  leadSubmitted: (hasMaterial: boolean) => track('lead_submitted', { hasMaterial }),
  userRegistered: (orgName: string, plan: string) => track('user_registered', { orgName, plan }),
  userLoggedIn: (role: string) => track('user_logged_in', { role }),
  userLoggedOut: () => track('user_logged_out'),
  pdfGenerated: (materialId: string, totalAmount: number) => track('pdf_generated', { materialId, totalAmount }),
  materialSelected: (materialId: string, category: string) => track('material_selected', { materialId, category }),
  customMaterialAdded: (category: string) => track('custom_material_added', { category }),
  userInvited: (role: string) => track('user_invited', { role }),
  userRemoved: () => track('user_removed'),
  languageChanged: (locale: string) => track('language_changed', { locale }),
}
