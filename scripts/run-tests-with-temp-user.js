/**
 * Test runner with temporary user - automatic setup and cleanup
 *
 * This script handles the complete test lifecycle:
 * 1. Creates a temporary test user and parish
 * 2. Runs Playwright tests with authenticated state
 * 3. Automatically cleans up all test data when done
 *
 * Usage:
 *   npm run test:with-temp-user
 *   npm run test:with-temp-user:headed
 *   npm run test:with-temp-user presentation.spec.ts
 *   npm run test:with-temp-user -- --grep "should create"
 */

const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let testUserId = null;
let testParishId = null;

async function cleanup() {
  if (!testUserId || !testParishId) {
    console.log('\n⚠️  No test data to clean up');
    return;
  }

  console.log('\n🧹 Cleaning up test data...');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // Delete in reverse order of creation (respect foreign keys)
    await supabase.from('parish_users').delete().eq('user_id', testUserId);
    await supabase.from('user_settings').delete().eq('user_id', testUserId);
    await supabase.from('presentations').delete().eq('parish_id', testParishId);
    await supabase.from('people').delete().eq('parish_id', testParishId);
    await supabase.from('events').delete().eq('parish_id', testParishId);
    await supabase.from('parish_settings').delete().eq('parish_id', testParishId);
    await supabase.from('parishes').delete().eq('id', testParishId);

    // Delete from auth schema
    const { error } = await supabase.auth.admin.deleteUser(testUserId);
    if (error) {
      console.log(`   ⚠️  Error deleting auth user: ${error.message}`);
    }

    console.log('   ✅ Test data cleaned up successfully');
  } catch (error) {
    console.error('   ❌ Error during cleanup:', error.message);
  }
}

async function main() {
  try {
    // Step 1: Run setup script and capture user/parish IDs
    console.log('📦 Setting up test environment...\n');

    const setupOutput = execSync('node scripts/setup-test-user.js', {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    console.log(setupOutput);

    // Extract user and parish IDs from setup output
    const userIdMatch = setupOutput.match(/User ID: ([a-f0-9-]+)/);
    const parishIdMatch = setupOutput.match(/Parish ID: ([a-f0-9-]+)/);

    if (userIdMatch) testUserId = userIdMatch[1];
    if (parishIdMatch) testParishId = parishIdMatch[1];

    // Step 2: Run Playwright tests with any arguments passed to this script
    console.log('\n🎭 Running Playwright tests...\n');

    const testArgs = process.argv.slice(2).join(' ');
    const playwrightCommand = testArgs
      ? `npx playwright test ${testArgs}`
      : 'npx playwright test';

    try {
      execSync(playwrightCommand, {
        encoding: 'utf-8',
        stdio: 'inherit' // Show test output in real-time
      });
      console.log('\n✅ Tests completed successfully');
    } catch (testError) {
      console.log('\n❌ Some tests failed');
      // Continue to cleanup even if tests fail
    }

    // Step 3: Cleanup
    await cleanup();

    console.log('\n✨ Test run complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    // Try to cleanup even if there was an error
    await cleanup();

    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Test run interrupted');
  await cleanup();
  process.exit(0);
});

main();
