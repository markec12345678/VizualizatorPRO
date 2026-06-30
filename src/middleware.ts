import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Rate Limiting Middleware za VizualizatorPRO
 * 
 * Uporablja in-memory counter (za razvoj) ali Upstash Redis (za produkcijo).
 * 
 * Limiti:
 * - /api/visualize: 10 req/min na IP
 * - /api/lead: 5 req/min na IP
 * - /api/auth/*: 10 req/min na IP
 * - Ostali /api/*: 100 req/min na IP
 * - Static files: unlimited
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (za razvoj - v produkciji uporabi Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Čiščenje starejših vnosov vsakih 5 minut
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

// Rate limit konfiguracija
const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/api/visualize': { limit: 10, windowMs: 60 * 1000 }, // 10 req/min
  '/api/lead': { limit: 5, windowMs: 60 * 1000 }, // 5 req/min
  '/api/auth': { limit: 10, windowMs: 60 * 1000 }, // 10 req/min
  '/api': { limit: 100, windowMs: 60 * 1000 }, // 100 req/min (default)
}

function getRateLimitConfig(pathname: string): { limit: number; windowMs: number } {
  for (const [prefix, config] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) {
      return config
    }
  }
  return RATE_LIMITS['/api']
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  return 'unknown'
}

function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime < now) {
    // Nov window
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs }
  }

  if (entry.count >= limit) {
    // Rate limit presežen
    return { allowed: false, remaining: 0, resetTime: entry.resetTime }
  }

  // Povečaj counter
  entry.count++
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetTime: entry.resetTime,
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip non-API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip health check
  if (pathname === '/api' || pathname === '/api/') {
    return NextResponse.next()
  }

  // Skip v razvoju (lahko omogočiš za testiranje)
  if (process.env.NODE_ENV === 'development' && !process.env.ENABLE_RATE_LIMIT) {
    return NextResponse.next()
  }

  const config = getRateLimitConfig(pathname)
  const clientIP = getClientIP(request)
  const rateLimitKey = `${clientIP}:${pathname.split('/').slice(0, 3).join('/')}`
  
  const { allowed, remaining, resetTime } = checkRateLimit(
    rateLimitKey,
    config.limit,
    config.windowMs
  )

  if (!allowed) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)
    
    return NextResponse.json(
      {
        error: 'Preveč zahtevkov. Poskusi znova čez nekaj sekund.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(config.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(resetTime / 1000)),
        },
      }
    )
  }

  // Dodaj rate limit headers
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', String(config.limit))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.floor(resetTime / 1000)))

  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
