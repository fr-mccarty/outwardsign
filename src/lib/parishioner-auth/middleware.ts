import { getParishionerSession } from './actions'
import { redirect } from 'next/navigation'

/**
 * Middleware to require parishioner authentication
 * Use in server components that require parishioner auth
 *
 * Returns personId and parishId if authenticated
 * Redirects to /parishioner/login if not authenticated
 */
export async function requireParishionerAuth(): Promise<{
  personId: string
  parishId: string
}> {
  const session = await getParishionerSession()

  if (!session) {
    redirect('/parishioner/login')
  }

  return session
}

/**
 * Get parishioner session without redirecting
 * Useful for optional auth checks
 */
export async function getOptionalParishionerAuth(): Promise<{
  personId: string
  parishId: string
} | null> {
  return await getParishionerSession()
}
