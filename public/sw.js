// VizualizatorPRO Service Worker
// Strategija: Cache-First za statične resurse, Network-First za API

const CACHE_VERSION = 'vizualizatorpro-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const API_CACHE = `${CACHE_VERSION}-api`
const IMAGE_CACHE = `${CACHE_VERSION}-images`

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/logo.svg',
  '/materials/wpc-h-line.jpg',
  '/materials/wpc-v-line.jpg',
  '/materials/wpc-panel.jpg',
  '/materials/inox-line.jpg',
  '/materials/steklo-full.jpg',
  '/materials/alu-klasik.jpg',
  '/materials/keramika-wood.jpg',
  '/materials/keramika-stone.jpg',
  '/materials/keramika-marble.jpg',
  '/materials/keramika-mozaik.jpg',
  '/materials/keramika-metro.jpg',
  '/materials/keramika-terracotta.jpg',
  '/materials/keramika-cement.jpg',
  '/materials/keramika-large.jpg',
]

// Install - predpomni statične resurse
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.error('[SW] Cache failed:', err))
  )
})

// Activate - počisti stare cache
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('vizualizatorpro-') && !name.startsWith(CACHE_VERSION))
            .map((name) => caches.delete(name))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch - različne strategije za različne tipe zahtevkov
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return

  // API requests - Network-First z API cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  // Image requests - Cache-First z network fallback
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
    return
  }

  // Static assets - Cache-First
  if (url.pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/i)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Navigation requests - Network-First z offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOffline(request, STATIC_CACHE))
    return
  }

  // Default - Cache-First
  event.respondWith(cacheFirst(request, STATIC_CACHE))
})

// Cache-First strategija
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) {
    // Osveži cache v ozadju
    fetch(request).then((response) => {
      if (response.ok) cache.put(request, response.clone())
    }).catch(() => {})
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (err) {
    return new Response('Offline', { status: 503, statusText: 'Offline' })
  }
}

// Network-First strategija
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (err) {
    const cached = await cache.match(request)
    if (cached) return cached
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Network-First z offline fallback stran
async function networkFirstWithOffline(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (err) {
    const cached = await cache.match(request)
    if (cached) return cached
    // Fallback na cached root
    const root = await cache.match('/')
    if (root) return root
    return new Response(offlineHTML(), {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

function offlineHTML() {
  return `<!DOCTYPE html>
<html lang="sl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VizualizatorPRO - Offline</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #0a0a0a;
      color: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 1rem;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .icon {
      width: 80px;
      height: 80px;
      background: #f59e0b;
      border-radius: 16px;
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    h1 { font-size: 1.5rem; margin-bottom: 8px; }
    p { color: #a3a3a3; line-height: 1.5; }
    .btn {
      display: inline-block;
      margin-top: 24px;
      padding: 12px 24px;
      background: #f59e0b;
      color: #0a0a0a;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📱</div>
    <h1>Delate offline</h1>
    <p>Vaša aplikacija VizualizatorPRO je nameščena na napravi. Ko bo povezava nazaj, boste lahko nadaljevali z delom.</p>
    <a href="/" class="btn">Poskusi znova</a>
  </div>
</body>
</html>`
}

// Background sync za lead form
self.addEventListener('sync', (event) => {
  if (event.tag === 'lead-submit') {
    event.waitUntil(syncLeads())
  }
})

async function syncLeads() {
  const cache = await caches.open(API_CACHE)
  // Pošlji pending leade ko je povezava nazaj
  // (implementacija je odvisna od backend strategije)
  console.log('[SW] Background sync: leads')
}

// Push notifications (pripravljeno za prihodnost)
self.addEventListener('push', (event) => {
  if (!event.data) return
  
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'VizualizatorPRO', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  )
})
