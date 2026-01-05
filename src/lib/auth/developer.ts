/**
 * Developer Authentication
 *
 * Provides developer-only features and checks.
 * Developer access is granted to the email set in DEVELOPER_EMAIL env var.
 */

import { createClient } from '@/lib/supabase/server'

// Developer email from environment variable (uses DEV_USER_EMAIL)
export const DEVELOPER_EMAIL = process.env.DEV_USER_EMAIL || ''

// The demo parish ID used for developer testing and demos
export const DEMO_PARISH_ID = '00000000-0000-0000-0000-000000000001'

/**
 * Check if an email address belongs to a developer
 */
export function isDeveloperEmail(email: string | null | undefined): boolean {
  if (!email || !DEVELOPER_EMAIL) return false
  return email.toLowerCase() === DEVELOPER_EMAIL.toLowerCase()
}

/**
 * Check if the current user is a developer (server-side)
 * Returns the user's email if they are a developer, null otherwise
 */
export async function checkIsDeveloper(): Promise<{ isDeveloper: boolean; email: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return { isDeveloper: false, email: null }
    }

    return {
      isDeveloper: isDeveloperEmail(user.email),
      email: user.email,
    }
  } catch {
    return { isDeveloper: false, email: null }
  }
}

/**
 * Require developer access - throws if not a developer
 */
export async function requireDeveloper(): Promise<string> {
  const { isDeveloper, email } = await checkIsDeveloper()

  if (!isDeveloper) {
    throw new Error('Developer access required')
  }

  return email!
}
