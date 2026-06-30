import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { captureError } from '@/lib/sentry'

/**
 * API Key Authentication
 * 
 * Omogoča zunanjim klientom (skripte, mobilne aplikacije) dostop do API-ja
 * z API ključem namesto session cookie-ja.
 * 
 * Uporaba v API route:
 *   const auth = await authenticateApiKey(request)
 *   if (!auth.success) return auth.response
 *   // uporabi auth.user in auth.organization
 * 
 * Header format:
 *   Authorization: Bearer vp_live_xxxxx
 */

const API_KEY_PREFIX = 'vp_live_'

interface AuthResult {
  success: boolean
  response?: NextResponse
  user?: {
    id: string
    email: string
    role: string
    organizationId: string | null
  }
  organization?: {
    id: string
    name: string
    slug: string
    plan: string
    maxVisualizations: number
  }
}

export async function authenticateApiKey(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Manjka Authorization header. Uporabi: Bearer vp_live_xxx' },
          { status: 401 }
        ),
      }
    }

    const apiKey = authHeader.substring(7).trim()
    if (!apiKey.startsWith(API_KEY_PREFIX)) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Neveljaven API ključ format. Mora se začeti z vp_live_' },
          { status: 401 }
        ),
      }
    }

    // V produkciji: poišči API ključ v bazi (hashed)
    // Za demo: preveri v environment spremenljivkah
    const validKeys = process.env.VALID_API_KEYS?.split(',') || []
    
    if (validKeys.length === 0) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'API ključi niso konfigurirani. Dodaj VALID_API_KEYS v .env' },
          { status: 503 }
        ),
      }
    }

    if (!validKeys.includes(apiKey)) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Neveljaven API ključ' },
          { status: 401 }
        ),
      }
    }

    // V produkciji: pridobi user/org iz baze na podlagi API ključa
    // Za demo: vrni admin user prve organizacije
    const firstOrg = await db.organization.findFirst()
    if (!firstOrg) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Nobena organizacija ni najdena' },
          { status: 404 }
        ),
      }
    }

    const adminUser = await db.user.findFirst({
      where: { organizationId: firstOrg.id, role: 'ADMIN' },
    })

    return {
      success: true,
      user: adminUser
        ? {
            id: adminUser.id,
            email: adminUser.email,
            role: adminUser.role,
            organizationId: adminUser.organizationId,
          }
        : undefined,
      organization: {
        id: firstOrg.id,
        name: firstOrg.name,
        slug: firstOrg.slug,
        plan: firstOrg.plan,
        maxVisualizations: firstOrg.maxVisualizations,
      },
    }
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), {
      context: 'API key authentication',
    })
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Napaka pri avtentikaciji' },
        { status: 500 }
      ),
    }
  }
}

/**
 * Generiraj nov API ključ
 */
export function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let key = API_KEY_PREFIX
  for (let i = 0; i < 40; i++) {
    key += chars[Math.floor(Math.random() * chars.length)]
  }
  return key
}

/**
 * Hash API ključ za varno shranjevanje v bazi
 */
export async function hashApiKey(key: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.default.hash(key, 12)
}

/**
 * Preveri API ključ proti hash-u
 */
export async function verifyApiKey(key: string, hash: string): Promise<boolean> {
  try {
    const bcrypt = await import('bcryptjs')
    return bcrypt.default.compare(key, hash)
  } catch {
    return false
  }
}
