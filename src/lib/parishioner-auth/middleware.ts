import { getParishionerSession } from './actions'
import { getParishById } from './parish-lookup'
import { redirect } from 'next/navigation'

export interface ParishionerAuthResult {
  personId: string
  parishId: string
  parishSlug: string
  parishName: string
}

/**
 * Middleware to require parishioner authentication
 * Use in server components that require parishioner auth
 *
 * @param expectedParishSlug - Optional parish slug from URL to validate against
 * Returns personId, parishId, parishSlug, and parishName if authenticated
 * Redirects to login if not authenticated or parish mismatch
 */
export async function requireParishionerAuth(expectedParishSlug?: string): Promise<ParishionerAuthResult> {
  const session = await getParishionerSession()

  if (!session) {
    // Redirect to parish-specific login if we know the slug, otherwise generic error
    if (expectedParishSlug) {
      redirect(`/parishioner/${expectedParishSlug}/login`)
    }
    redirect('/parishioner/login-error?error=not_authenticated')
  }

  // Get parish info
  const parish = await getParishById(session.parishId)

  if (!parish) {
    redirect('/parishioner/login-error?error=parish_not_found')
  }

  // If expected parish slug provided, validate it matches
  if (expectedParishSlug && parish.slug !== expectedParishSlug) {
    // User is logged into a different parish - redirect to correct one
    redirect(`/parishioner/${parish.slug}/calendar`)
  }

  return {
    personId: session.personId,
    parishId: session.parishId,
    parishSlug: parish.slug,
    parishName: parish.name,
  }
}

/**
 * Get parishioner session without redirecting
 * Useful for optional auth checks
 */
export async function getOptionalParishionerAuth(): Promise<ParishionerAuthResult | null> {
  const session = await getParishionerSession()

  if (!session) {
    return null
  }

  const parish = await getParishById(session.parishId)

  if (!parish) {
    return null
  }

  return {
    personId: session.personId,
    parishId: session.parishId,
    parishSlug: parish.slug,
    parishName: parish.name,
  }
}
