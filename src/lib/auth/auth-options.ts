import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

/**
 * NextAuth konfiguracija za VizualizatorPRO
 * 
 * - Credentials provider (email + geslo)
 * - JWT session
 * - Vloge: ADMIN, VODJA, MONTER, SKLADISCE
 * - Multi-tenant: vsak uporabnik pripada organizaciji
 */

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Geslo', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { organization: true },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          role: user.role,
          organizationId: user.organizationId,
          organizationName: user.organization?.name,
          organizationPlan: user.organization?.plan,
        } as any
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dni
  },
  pages: {
    signIn: '/auth/prijava',
    error: '/auth/prijava',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.organizationId = (user as any).organizationId
        token.organizationName = (user as any).organizationName
        token.organizationPlan = (user as any).organizationPlan
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.sub
        ;(session.user as any).role = token.role
        ;(session.user as any).organizationId = token.organizationId
        ;(session.user as any).organizationName = token.organizationName
        ;(session.user as any).organizationPlan = token.organizationPlan
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'vizualizator-pro-dev-secret-change-in-production',
}

// Razširitev TypeScript tipov za NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      organizationId?: string | null
      organizationName?: string | null
      organizationPlan?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    organizationId?: string | null
    organizationName?: string | null
    organizationPlan?: string | null
  }
}
