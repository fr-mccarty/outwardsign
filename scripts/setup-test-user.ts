#!/usr/bin/env tsx
/**
 * Script to create a test user for Playwright tests
 *
 * This script:
 * 1. Creates a test user in Supabase Auth
 * 2. Creates a test parish
 * 3. Seeds parish data using seedParishData (event types, petition templates, group roles, etc.)
 * 4. Links the user to the parish with 'admin' role
 * 5. Creates user settings with the parish selected
 *
 * Credentials:
 * - When called from run-tests-with-temp-user.js: Uses dynamic credentials passed via environment variables
 * - When called standalone: Falls back to .env.local credentials
 *
 * Usage:
 *   npx tsx scripts/setup-test-user.ts
 *   TEST_USER_EMAIL=test@example.com npx tsx scripts/setup-test-user.ts
 */

import { createClient } from '@supabase/supabase-js';
import { seedParishData } from '../src/lib/onboarding-seeding/parish-seed-data';
import { logSuccess, logError, logInfo } from '../src/lib/utils/console';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules don't have __dirname, so we need to create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import test env config
const TEST_ENV_PATH = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: TEST_ENV_PATH });

// Configuration from environment
// Priority: process.env (dynamic) > .env.local (fallback)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test-staff@outwardsign.test';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
const PARISH_NAME = process.env.TEST_PARISH_NAME || 'Playwright Test Parish';
const PARISH_CITY = process.env.TEST_PARISH_CITY || 'Test City';
const PARISH_STATE = process.env.TEST_PARISH_STATE || 'TS';
const PARISH_COUNTRY = process.env.TEST_PARISH_COUNTRY || 'United States';

async function setupTestUser() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    logError('Missing required environment variables');
    logError('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    logError('Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file');
    process.exit(1);
  }

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('Starting test user setup...\n');

  try {
    // Step 1: Check if user already exists (try via auth admin API)
    logInfo(`1. Checking if user ${TEST_EMAIL} exists...`);

    let userId: string;

    // Try to create the user - if it exists, we'll get an error and handle it
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true, // Auto-confirm email
    });

    if (userError) {
      // User likely already exists - try to find them
      logInfo('   User may already exist, looking up...');

      // List all users and find ours
      const { data: allUsers } = await supabase.auth.admin.listUsers();
      const found = allUsers?.users?.find(u => u.email === TEST_EMAIL);
      if (found) {
        userId = found.id;
        logSuccess(`Found existing user with ID: ${userId}`);
      } else {
        // User doesn't exist but we got an error - this is a real problem
        logError('Error details:' + JSON.stringify(userError, null, 2));
        throw new Error(`Failed to create user: ${userError.message}`);
      }
    } else {
      // User created successfully
      userId = newUser.user.id;
      logSuccess(`User created with ID: ${userId}`);
    }

    // Step 2: Check if parish exists
    logInfo('');
    logInfo(`2. Checking if test parish exists...`);
    const { data: existingParishes } = await supabase
      .from('parishes')
      .select('id, name')
      .eq('name', PARISH_NAME);

    let parishId: string;
    let isNewParish = false;

    if (existingParishes && existingParishes.length > 0) {
      parishId = existingParishes[0].id;
      logSuccess(`Parish already exists with ID: ${parishId}`);
    } else {
      // Create new parish
      logInfo('   Creating new parish...');
      const { data: newParish, error: parishError } = await supabase
        .from('parishes')
        .insert({
          name: PARISH_NAME,
          city: PARISH_CITY,
          state: PARISH_STATE,
          country: PARISH_COUNTRY,
        })
        .select()
        .single();

      if (parishError) {
        throw new Error(`Failed to create parish: ${parishError.message}`);
      }

      parishId = newParish.id;
      isNewParish = true;
      logSuccess(`Parish created with ID: ${parishId}`);
    }

    // Step 2.5: Seed parish data (if new parish)
    // This uses the SAME seeder as dev-seed.ts and onboarding
    if (isNewParish) {
      logInfo('');
      logInfo('2.5 Seeding parish data (event types, petition templates, group roles, etc.)...');
      try {
        const result = await seedParishData(supabase, parishId);
        logSuccess(`Petition templates: ${result.petitionTemplates.length}`);
        logSuccess(`Group roles: ${result.groupRoles.length}`);
        logSuccess(`Event types: ${result.eventTypes.length}`);
        logSuccess(`  - General event types: ${result.generalEventTypesCount}`);
        logSuccess(`  - Mass event types: ${result.massEventTypesCount}`);
        logSuccess(`  - Special liturgy event types: ${result.specialLiturgyEventTypesCount}`);
      } catch (seedError) {
        logError(`Error seeding parish data: ${seedError}`);
        throw seedError;
      }
    } else {
      logInfo('');
      logInfo('2.5 Skipping parish data seeding (parish already exists)');
    }

    // Step 3: Link user to parish with admin role
    logInfo('');
    logInfo('3. Linking user to parish with admin role...');
    const { data: existingLink } = await supabase
      .from('parish_users')
      .select('*')
      .eq('user_id', userId)
      .eq('parish_id', parishId)
      .single();

    if (existingLink) {
      // Update existing link to ensure admin role
      const { error: updateError } = await supabase
        .from('parish_users')
        .update({ roles: ['admin'] })
        .eq('user_id', userId)
        .eq('parish_id', parishId);

      if (updateError) {
        throw new Error(`Failed to update parish user link: ${updateError.message}`);
      }
      logSuccess('Updated existing parish user link with admin role');
    } else {
      // Create new link
      const { error: linkError } = await supabase
        .from('parish_users')
        .insert({
          user_id: userId,
          parish_id: parishId,
          roles: ['admin'],
        });

      if (linkError) {
        throw new Error(`Failed to link user to parish: ${linkError.message}`);
      }
      logSuccess('User linked to parish with admin role');
    }

    // Step 4: Create or update user settings
    logInfo('');
    logInfo('4. Setting up user settings...');
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingSettings) {
      // Update existing settings
      const { error: updateError } = await supabase
        .from('user_settings')
        .update({
          selected_parish_id: parishId,
          language: 'en',
        })
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(`Failed to update user settings: ${updateError.message}`);
      }
      logSuccess('Updated user settings');
    } else {
      // Create new settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          selected_parish_id: parishId,
          language: 'en',
        });

      if (settingsError) {
        throw new Error(`Failed to create user settings: ${settingsError.message}`);
      }
      logSuccess('Created user settings');
    }

    // Success summary
    console.log('');
    console.log('Test user setup complete!\n');
    console.log('=======================================');
    console.log('Email:', TEST_EMAIL);
    console.log('Password:', TEST_PASSWORD);
    console.log('Parish:', PARISH_NAME);
    console.log('User ID:', userId);
    console.log('Parish ID:', parishId);
    console.log('Role: admin');
    console.log('=======================================\n');
    console.log('[OK] You can now run Playwright tests!');
    console.log('     npx playwright test\n');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError('');
    logError(`Error setting up test user: ${errorMessage}`);
    process.exit(1);
  }
}

// Run the setup
setupTestUser();
