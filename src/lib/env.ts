import { z } from 'zod'

/**
 * Environment validacija z Zod
 * 
 * Preveri da so vse obvezne okoljske spremenljivke prisotne
 * in da imajo pravilen format.
 * 
 * Če validacija ne uspe, aplikacija ne zažene (fail-fast).
 */

const envSchema = z.object({
  // Baza (obvezno)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL je obvezen'),

  // NextAuth (obvezno za multi-tenant)
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET je obvezen'),
  NEXTAUTH_URL: z
    .string()
    .url('NEXTAUTH_SECRET mora biti veljaven URL')
    .default('http://localhost:3000'),

  // AI vizualizacija (opcijsko - brez tega deluje demo mode)
  REPLICATE_API_TOKEN: z.string().optional(),

  // Email (opcijsko - brez tega se emaili samo log-ajo)
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional().or(z.literal('')),
  NOTIFICATION_EMAIL: z.string().email().optional().or(z.literal('')),

  // Error tracking (opcijsko)
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),

  // Analytics (opcijsko)
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z
    .string()
    .url()
    .default('https://app.posthog.com'),

  // Admin (opcijsko)
  ADMIN_PASSWORD: z.string().optional(),

  // Node environment (samodejno nastavi Next.js)
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
})

export type Env = z.infer<typeof envSchema>

// Parsaj in validiraj environment
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Napaka v okoljskih spremenljivkah:')
  console.error(parsed.error.flatten().fieldErrors)
  
  // V razvoju samo opozori, v produkciji ustavi
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Neveljavne okoljske spremenljivke')
  } else {
    console.warn('⚠️  Nekatere okoljske spremenljivke manjkajo (demo mode)')
  }
}

export const env = parsed.success ? parsed.data : (process.env as Env)

/**
 * Helper funkcije
 */
export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test'

export const isReplicateEnabled = !!env.REPLICATE_API_TOKEN
export const isResendEnabled = !!env.RESEND_API_KEY
export const isSentryEnabled = !!env.SENTRY_DSN && isProduction
export const isAnalyticsEnabled = !!env.NEXT_PUBLIC_POSTHOG_KEY

/**
 * Pridobi varno konfiguracijo za client-side
 * (samo NEXT_PUBLIC_ spremenljivke so dostopne v brskalniku)
 */
export const publicEnv = {
  NEXT_PUBLIC_POSTHOG_KEY: env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: env.NEXT_PUBLIC_POSTHOG_HOST,
  NODE_ENV: env.NODE_ENV,
}
