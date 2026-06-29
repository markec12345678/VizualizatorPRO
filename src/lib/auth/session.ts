import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import { db } from '@/lib/db'

/**
 * Server-side auth helperji
 */

export async function getAuthSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  
  const user = session.user as any
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationId: user.organizationId,
    organizationName: user.organizationName,
    organizationPlan: user.organizationPlan,
  }
}

export async function getCurrentOrganization() {
  const user = await getCurrentUser()
  if (!user?.organizationId) return null
  
  return await db.organization.findUnique({
    where: { id: user.organizationId },
  })
}

/**
 * Preveri ali ima uporabnik določeno vlogo
 */
export function hasRole(userRole: string | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}

/**
 * Preveri ali je uporabnik admin ali vodja
 */
export function isManager(userRole: string | undefined): boolean {
  return hasRole(userRole, ['ADMIN', 'VODJA'])
}

/**
 * Preveri ali je uporabnik admin
 */
export function isAdmin(userRole: string | undefined): boolean {
  return userRole === 'ADMIN'
}
