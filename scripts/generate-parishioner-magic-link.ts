/**
 * Development script to generate parishioner portal magic links
 *
 * Usage:
 *   tsx scripts/generate-parishioner-magic-link.ts <email>
 *
 * Example:
 *   tsx scripts/generate-parishioner-magic-link.ts fr.mccarty@gmail.com
 */

import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { hash } from 'bcryptjs'
import { logSuccess, logError, logInfo, logWarning } from '../src/lib/utils/console'

const MAGIC_LINK_EXPIRY_HOURS = 48
const BCRYPT_ROUNDS = 10

async function generateMagicLink(email: string) {
  // Load environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!supabaseUrl || !supabaseServiceKey) {
    logError('Missing required environment variables')
    logError('   NEXT_PUBLIC_SUPABASE_URL: ' + (!!supabaseUrl))
    logError('   SUPABASE_SERVICE_ROLE_KEY: ' + (!!supabaseServiceKey))
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Look up person by email
  const { data: person, error: personError } = await supabase
    .from('people')
    .select('id, parish_id, full_name, email, parishioner_portal_enabled')
    .eq('email', email)
    .single()

  if (personError || !person) {
    logError(`Person not found with email: ${email}`)
    process.exit(1)
  }

  if (!person.parishioner_portal_enabled) {
    logWarning(`Parishioner portal is NOT enabled for ${person.full_name}`)
    logInfo('   Enabling portal access...')

    await supabase
      .from('people')
      .update({ parishioner_portal_enabled: true })
      .eq('id', person.id)

    logSuccess('   Portal access enabled')
  }

  // Generate secure token
  const token = randomBytes(32).toString('hex')
  const hashedToken = await hash(token, BCRYPT_ROUNDS)

  // Create session
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + MAGIC_LINK_EXPIRY_HOURS)

  const { error: sessionError } = await supabase
    .from('parishioner_auth_sessions')
    .insert({
      token: hashedToken,
      person_id: person.id,
      parish_id: person.parish_id,
      email_or_phone: email,
      delivery_method: 'email',
      expires_at: expiresAt.toISOString(),
    })

  if (sessionError) {
    logError('Error creating session: ' + sessionError)
    process.exit(1)
  }

  // Generate magic link URL
  const magicLinkUrl = `${appUrl}/parishioner/auth?token=${token}&parish=${person.parish_id}`

  logSuccess('\nMagic link generated successfully!')
  logInfo('-'.repeat(80))
  logInfo(`Person: ${person.full_name}`)
  logInfo(`Email: ${person.email}`)
  logInfo(`Expires: ${expiresAt.toLocaleString()}`)
  logInfo('-'.repeat(80))
  logInfo(`\nMagic Link:\n\n${magicLinkUrl}\n`)
  logInfo('-'.repeat(80))
}

// Get email from command line arguments or use DEV_USER_EMAIL from .env
const email = process.argv[2] || process.env.DEV_USER_EMAIL

if (!email) {
  logError('Usage: tsx scripts/generate-parishioner-magic-link.ts <email>')
  logError('   Example: tsx scripts/generate-parishioner-magic-link.ts fr.mccarty@gmail.com')
  logError('')
  logError('   Or set DEV_USER_EMAIL in your .env.local file')
  process.exit(1)
}

generateMagicLink(email)
  .then(() => process.exit(0))
  .catch((error) => {
    logError('Error: ' + error)
    process.exit(1)
  })
