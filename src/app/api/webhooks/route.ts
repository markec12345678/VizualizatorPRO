import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, isAdmin } from '@/lib/auth/session'
import { captureError } from '@/lib/sentry'

/**
 * Webhook API - registracija in upravljanje webhook endpointov
 * 
 * Omogoča zunanjim sistemom prejemanje obvestil o dogodkih:
 * - lead.created - nov lead
 * - visualization.completed - AI vizualizacija končana
 * - visualization.failed - AI vizualizacija spodletela
 * - user.invited - nov uporabnik dodan
 * - user.removed - uporabnik odstranjen
 * - project.created - nov projekt
 * - project.updated - projekt posodobljen
 * 
 * POST /api/webhooks - registriraj nov webhook
 * GET /api/webhooks - seznam webhookov
 * DELETE /api/webhooks?id=xxx - izbriši webhook
 */

interface WebhookConfig {
  id: string
  url: string
  events: string[]
  secret: string
  active: boolean
  createdAt: string
}

// In-memory store (v produkciji: Prisma model Webhook)
const webhookStore = new Map<string, WebhookConfig>()

const ALLOWED_EVENTS = [
  'lead.created',
  'visualization.completed',
  'visualization.failed',
  'user.invited',
  'user.removed',
  'project.created',
  'project.updated',
] as const

/**
 * Pošlji webhook na registrirane endpointe
 * (kliče se iz drugih API-jev ob dogodkih)
 */
export async function triggerWebhooks(
  event: string,
  payload: Record<string, any>,
  organizationId?: string
) {
  const webhooks = Array.from(webhookStore.values()).filter(
    (w) => w.active && w.events.includes(event)
  )

  for (const webhook of webhooks) {
    try {
      const body = JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data: payload,
      })

      // HMAC SHA-256 podpis
      const crypto = await import('crypto')
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(body)
        .digest('hex')

      await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Signature': `sha256=${signature}`,
          'X-Webhook-Id': webhook.id,
          'User-Agent': 'VizualizatorPRO-Webhook/1.0',
        },
        body,
        signal: AbortSignal.timeout(10000), // 10s timeout
      })
    } catch (err) {
      captureError(`Webhook delivery failed: ${webhook.url}`, {
        event,
        webhookId: webhook.id,
        error: err instanceof Error ? err.message : 'Unknown',
      })
    }
  }
}

// === API ROUTES ===

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Nisi prijavljen' }, { status: 401 })
    }

    if (!isAdmin(user.role)) {
      return NextResponse.json(
        { error: 'Samo admin lahko upravlja webhook-e' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { url, events, secret } = body

    // Validacija
    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Manjkajoči podatki: url in events sta obvezna' },
        { status: 400 }
      )
    }

    // Preveri URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Neveljaven URL format' },
        { status: 400 }
      )
    }

    // Preveri evente
    const invalidEvents = events.filter((e: string) => !ALLOWED_EVENTS.includes(e as any))
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        {
          error: `Neveljavni eventi: ${invalidEvents.join(', ')}`,
          allowed: ALLOWED_EVENTS,
        },
        { status: 400 }
      )
    }

    // Generiraj ID in secret
    const id = `whk_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const webhookSecret = secret || generateSecret()

    const webhook: WebhookConfig = {
      id,
      url,
      events,
      secret: webhookSecret,
      active: true,
      createdAt: new Date().toISOString(),
    }

    webhookStore.set(id, webhook)

    // Pošlji test webhook
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': 'webhook.test',
          'X-Webhook-Id': id,
          'User-Agent': 'VizualizatorPRO-Webhook/1.0',
        },
        body: JSON.stringify({
          event: 'webhook.test',
          timestamp: new Date().toISOString(),
          data: { message: 'Webhook uspešno registriran!' },
        }),
        signal: AbortSignal.timeout(5000),
      })
    } catch {
      // Test webhook ni kritičen
    }

    return NextResponse.json({
      success: true,
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        active: webhook.active,
        createdAt: webhook.createdAt,
      },
      secret: webhookSecret,
      message: 'Webhook uspešno registriran. Shrani secret na varno mesto.',
    })
  } catch (error) {
    console.error('Napaka v /api/webhooks POST:', error)
    return NextResponse.json(
      { error: 'Napaka pri registraciji webhook-a' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Nisi prijavljen' }, { status: 401 })
    }

    if (!isAdmin(user.role)) {
      return NextResponse.json(
        { error: 'Samo admin lahko pregleda webhook-e' },
        { status: 403 }
      )
    }

    const webhooks = Array.from(webhookStore.values()).map((w) => ({
      id: w.id,
      url: w.url,
      events: w.events,
      active: w.active,
      createdAt: w.createdAt,
    }))

    return NextResponse.json({
      total: webhooks.length,
      webhooks,
      allowedEvents: ALLOWED_EVENTS,
    })
  } catch (error) {
    console.error('Napaka v /api/webhooks GET:', error)
    return NextResponse.json(
      { error: 'Napaka pri pridobivanju webhook-ov' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Nisi prijavljen' }, { status: 401 })
    }

    if (!isAdmin(user.role)) {
      return NextResponse.json(
        { error: 'Samo admin lahko briše webhook-e' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Manjka id parameter' },
        { status: 400 }
      )
    }

    if (!webhookStore.has(id)) {
      return NextResponse.json(
        { error: 'Webhook ni najden' },
        { status: 404 }
      )
    }

    webhookStore.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Webhook uspešno izbrisan',
    })
  } catch (error) {
    console.error('Napaka v /api/webhooks DELETE:', error)
    return NextResponse.json(
      { error: 'Napaka pri brisanju webhook-a' },
      { status: 500 }
    )
  }
}

function generateSecret(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'whsec_'
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}
