import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api
 * Enhanced health check endpoint z sistemskimi informacijami
 * 
 * Vrne:
 * - status: ok/degraded/down
 * - timestamp
 * - version
 * - uptime
 * - database: connected/disconnected
 * - environment
 * - features: kateri API-ji so omogočeni
 * - counts: število zapisov v bazi
 */
export async function GET() {
  const startTime = Date.now()
  
  try {
    // Preveri bazo
    let dbStatus: 'connected' | 'disconnected' = 'disconnected'
    let dbLatency: number | null = null
    let counts = {
      organizations: 0,
      users: 0,
      projects: 0,
      visualizations: 0,
      materials: 0,
    }

    try {
      const dbStart = Date.now()
      await db.$queryRaw`SELECT 1`
      dbLatency = Date.now() - dbStart
      dbStatus = 'connected'

      // Pridobi število zapisov (ne-obvezno, samo če baza deluje)
      try {
        const [orgs, users, projects, viz, mats] = await Promise.all([
          db.organization.count(),
          db.user.count(),
          db.project.count(),
          db.visualization.count(),
          db.material.count(),
        ])
        counts = {
          organizations: orgs,
          users: users,
          projects: projects,
          visualizations: viz,
          materials: mats,
        }
      } catch {
        // Štetje ni kritično
      }
    } catch (err) {
      console.error('Health check: DB napaka:', err)
    }

    // Preveri memory
    const memUsage = process.memoryUsage()
    const memMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    }

    // Določi status
    const status = dbStatus === 'connected' ? 'ok' : 'degraded'
    const responseTime = Date.now() - startTime

    return NextResponse.json(
      {
        status,
        timestamp: new Date().toISOString(),
        version: '1.4.0',
        uptime: process.uptime ? Math.floor(process.uptime()) : null,
        responseTime: `${responseTime}ms`,
        environment: process.env.NODE_ENV || 'development',
        
        database: {
          status: dbStatus,
          latency: dbLatency ? `${dbLatency}ms` : null,
          counts,
        },
        
        memory: memMB,
        
        features: {
          aiVisualization: !!process.env.REPLICATE_API_TOKEN,
          email: !!process.env.RESEND_API_KEY,
          sentry: !!process.env.SENTRY_DSN,
          analytics: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
          nextauth: !!process.env.NEXTAUTH_SECRET,
        },
        
        endpoints: {
          visualize: '/api/visualize',
          lead: '/api/lead',
          materials: '/api/materials',
          auth: '/api/auth/[...nextauth]',
          register: '/api/auth/register',
          dashboard: '/api/dashboard',
          organization: '/api/organization/invite',
          health: '/api',
        },
        
        limits: {
          rateLimit: {
            visualize: '10 req/min',
            lead: '5 req/min',
            auth: '10 req/min',
            default: '100 req/min',
          },
          maxImageSize: '8MB',
          maxUploadSize: '15MB',
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Response-Time': `${responseTime}ms`,
        },
      }
    )
  } catch (error) {
    console.error('Health check napaka:', error)
    return NextResponse.json(
      {
        status: 'down',
        timestamp: new Date().toISOString(),
        error: 'Sistem ni na voljo',
        details: error instanceof Error ? error.message : 'Neznana napaka',
      },
      { status: 503 }
    )
  }
}
