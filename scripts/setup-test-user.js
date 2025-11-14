/**
 * Script to create a test user for Playwright tests
 *
 * This script:
 * 1. Creates a test user in Supabase Auth
 * 2. Creates a test parish
 * 3. Links the user to the parish with 'staff' role
 * 4. Creates user settings with the parish selected
 *
 * Credentials:
 * - When called from run-tests-with-temp-user.js: Uses dynamic credentials passed via environment variables
 * - When called standalone: Falls back to .env.production.local credentials
 *
 * Usage:
 *   node scripts/setup-test-user.js
 *   TEST_USER_EMAIL=test@example.com node scripts/setup-test-user.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production.local' });
require('dotenv').config({ path: '.env.production' });

// Configuration from environment
// Priority: process.env (dynamic) > .env.production.local (fallback)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test-staff@outwardsign.test';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
const PARISH_NAME = process.env.TEST_PARISH_NAME || 'Playwright Test Parish';
const PARISH_CITY = process.env.TEST_PARISH_CITY || 'Test City';
const PARISH_STATE = process.env.TEST_PARISH_STATE || 'TS';

async function setupTestUser() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Missing required environment variables');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    console.error('Add SUPABASE_SERVICE_ROLE_KEY to your .env.production.local file');
    process.exit(1);
  }

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🚀 Starting test user setup...\n');

  try {
    // Step 1: Check if user already exists (try via auth admin API)
    console.log(`1️⃣  Checking if user ${TEST_EMAIL} exists...`);

    let userId;

    // Try to create the user - if it exists, we'll get an error and handle it
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true, // Auto-confirm email
    });

    if (userError) {
      // User likely already exists - try to find them
      console.log('   User may already exist, looking up...');

      // List all users and find ours
      const { data: allUsers } = await supabase.auth.admin.listUsers();
      const found = allUsers?.users?.find(u => u.email === TEST_EMAIL);
      if (found) {
        userId = found.id;
        console.log(`   ✅ Found existing user with ID: ${userId}`);
      } else {
        // User doesn't exist but we got an error - this is a real problem
        console.error('   Error details:', JSON.stringify(userError, null, 2));
        throw new Error(`Failed to create user: ${userError.message}`);
      }
    } else {
      // User created successfully
      userId = newUser.user.id;
      console.log(`   ✅ User created with ID: ${userId}`);
    }

    // Step 2: Check if parish exists
    console.log(`\n2️⃣  Checking if test parish exists...`);
    const { data: existingParishes } = await supabase
      .from('parishes')
      .select('id, name')
      .eq('name', PARISH_NAME);

    let parishId;
    if (existingParishes && existingParishes.length > 0) {
      parishId = existingParishes[0].id;
      console.log(`   ✅ Parish already exists with ID: ${parishId}`);
    } else {
      // Create new parish
      console.log('   Creating new parish...');
      const { data: newParish, error: parishError } = await supabase
        .from('parishes')
        .insert({
          name: PARISH_NAME,
          city: PARISH_CITY,
          state: PARISH_STATE,
        })
        .select()
        .single();

      if (parishError) {
        throw new Error(`Failed to create parish: ${parishError.message}`);
      }

      parishId = newParish.id;
      console.log(`   ✅ Parish created with ID: ${parishId}`);
    }

    // Step 3: Link user to parish with staff role
    console.log(`\n3️⃣  Linking user to parish with staff role...`);
    const { data: existingLink } = await supabase
      .from('parish_users')
      .select('*')
      .eq('user_id', userId)
      .eq('parish_id', parishId)
      .single();

    if (existingLink) {
      // Update existing link to ensure staff role
      const { error: updateError } = await supabase
        .from('parish_users')
        .update({ roles: ['staff'] })
        .eq('user_id', userId)
        .eq('parish_id', parishId);

      if (updateError) {
        throw new Error(`Failed to update parish user link: ${updateError.message}`);
      }
      console.log('   ✅ Updated existing parish user link with staff role');
    } else {
      // Create new link
      const { error: linkError } = await supabase
        .from('parish_users')
        .insert({
          user_id: userId,
          parish_id: parishId,
          roles: ['staff'],
        });

      if (linkError) {
        throw new Error(`Failed to link user to parish: ${linkError.message}`);
      }
      console.log('   ✅ User linked to parish with staff role');
    }

    // Step 4: Create or update user settings
    console.log(`\n4️⃣  Setting up user settings...`);
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
      console.log('   ✅ Updated user settings');
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
      console.log('   ✅ Created user settings');
    }

    // Success summary
    console.log('\n✨ Test user setup complete!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:', TEST_EMAIL);
    console.log('🔑 Password:', TEST_PASSWORD);
    console.log('🏛️  Parish:', PARISH_NAME);
    console.log('👤 User ID:', userId);
    console.log('🆔 Parish ID:', parishId);
    console.log('👔 Role: staff');
    console.log('═══════════════════════════════════════\n');
    console.log('✅ You can now run Playwright tests!');
    console.log('   npx playwright test\n');

  } catch (error) {
    console.error('\n❌ Error setting up test user:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupTestUser();
