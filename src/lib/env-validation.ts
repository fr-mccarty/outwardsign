/**
 * Environment variable validation for parishioner portal
 * Call this early in the application lifecycle to fail fast if required vars are missing
 */

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'ANTHROPIC_API_KEY',
  'NEXT_PUBLIC_APP_URL',
]

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for parishioner portal: ${missing.join(', ')}\n` +
      `Please check your .env.local file and ensure all required variables are set.`
    )
  }
}

/**
 * Validate environment variables and return status
 * Use this for non-critical checks where you want to handle the error gracefully
 */
export function checkEnv(): { valid: boolean; missing: string[] } {
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key])

  return {
    valid: missing.length === 0,
    missing,
  }
}
