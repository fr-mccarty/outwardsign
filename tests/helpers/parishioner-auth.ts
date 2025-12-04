import { Page } from '@playwright/test';
import { createAdminClient } from '@/lib/supabase/admin';
import { randomBytes } from 'crypto';
import { hash } from 'bcryptjs';

/**
 * Helper to create a parishioner test user and generate a valid session
 *
 * This creates:
 * - A person record with parishioner_portal_enabled = true
 * - A valid magic link session token
 * - A session cookie in the browser
 *
 * Usage in tests:
 * ```typescript
 * const parishioner = await setupParishionerAuth(page);
 * // Now the page has an authenticated parishioner session
 * ```
 */
export async function setupParishionerAuth(page: Page): Promise<{
  personId: string;
  parishId: string;
  email: string;
  name: string;
}> {
  const supabase = createAdminClient();

  // Get the test parish ID from the staff user's parish
  // (created by auth.setup.ts)
  const { data: parishes } = await supabase
    .from('parishes')
    .select('id')
    .limit(1)
    .single();

  if (!parishes) {
    throw new Error('No test parish found - run auth.setup.ts first');
  }

  const parishId = parishes.id;

  // Create a unique test parishioner
  const timestamp = Date.now();
  const email = `parishioner-test-${timestamp}@outwardsign.test`;
  const name = `Test Parishioner ${timestamp}`;

  const { data: person, error: personError } = await supabase
    .from('people')
    .insert({
      parish_id: parishId,
      full_name: name,
      email: email,
      parishioner_portal_enabled: true,
    })
    .select()
    .single();

  if (personError || !person) {
    throw new Error(`Failed to create test parishioner: ${personError?.message}`);
  }

  // Generate a valid session token (similar to generateMagicLink)
  const token = randomBytes(32).toString('hex');
  const hashedToken = await hash(token, 10);

  // Create session that expires in 30 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { data: session, error: sessionError } = await supabase
    .from('parishioner_auth_sessions')
    .insert({
      token: hashedToken,
      person_id: person.id,
      parish_id: parishId,
      email_or_phone: email,
      delivery_method: 'email',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (sessionError || !session) {
    throw new Error(`Failed to create session: ${sessionError?.message}`);
  }

  // Set the session cookie in the browser
  await page.context().addCookies([
    {
      name: 'parishioner_session_id',
      value: session.id,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      expires: Math.floor(expiresAt.getTime() / 1000),
    },
  ]);

  return {
    personId: person.id,
    parishId: parishId,
    email: email,
    name: name,
  };
}

/**
 * Clean up parishioner test data
 */
export async function cleanupParishioner(personId: string) {
  const supabase = createAdminClient();

  // Delete sessions
  await supabase
    .from('parishioner_auth_sessions')
    .delete()
    .eq('person_id', personId);

  // Delete person
  await supabase
    .from('people')
    .delete()
    .eq('id', personId);
}

/**
 * Get parishioner test credentials from environment
 * Used for magic link generation tests
 */
export function getParishionerTestEmail() {
  // For magic link tests, we need an email that exists in the database
  // We'll create it in the test setup
  return `test-parishioner-${Date.now()}@outwardsign.test`;
}
