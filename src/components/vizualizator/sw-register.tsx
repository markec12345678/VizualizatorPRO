'use client'

import { useEffect } from 'react'

/**
 * Registrira Service Worker za PWA functionality
 * - Offline delovanje
 * - Cache statičnih resursov
 * - Push notifications (pripravljeno)
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registriran:', registration.scope)
        })
        .catch((err) => {
          console.error('[PWA] SW registracija ni uspela:', err)
        })
    }
  }, [])

  return null
}
