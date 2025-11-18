/**
 * Server Action Authorization Tests
 *
 * Tests that server actions properly enforce permissions and reject unauthorized attempts.
 *
 * This test suite verifies that:
 * 1. Server actions check permissions before performing operations
 * 2. Users with insufficient permissions receive appropriate errors
 * 3. Ministry-leaders can only perform actions on enabled modules
 * 4. Parishioners cannot perform CRUD operations on any modules
 *
 * These tests use authenticated browser sessions to call server actions
 * through the UI, simulating real user interactions.
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface TestUser {
  userId: string;
  email: string;
  password: string;
  role: string;
  enabledModules?: string[];
}

interface TestData {
  parishId: string;
  ministryLeaderWeddings: TestUser;
  ministryLeaderFunerals: TestUser;
  parishioner: TestUser;
  testPersonId: string;
}

let testData: TestData;

test.describe.serial('Server Action Authorization', () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Helper function to login as a specific user
  async function loginAsUser(page: any, email: string, password: string) {
    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 15000 });
  }

  test.beforeAll(async () => {
    console.log('\n🏗️  Setting up test parish for server action authorization tests...\n');

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const parishName = `Server Action Test Parish ${timestamp}`;

    // Create parish
    console.log(`   Creating parish: ${parishName}`);
    const { data: createdParish, error: parishError } = await supabase
      .from('parishes')
      .insert({ name: parishName, city: 'Test City', state: 'TS' })
      .select()
      .single();

    if (parishError || !createdParish) {
      throw new Error(`Failed to create parish: ${parishError?.message}`);
    }

    const parishId = createdParish.id;
    console.log(`   ✅ Parish created: ${parishId}\n`);

    // Create group roles for the parish
    await supabase.from('group_roles').insert([
      { parish_id: parishId, name: 'LECTOR', description: 'Proclaims the Word of God during liturgies' },
    ]);

    // Helper to create a user
    async function createUser(role: string, enabledModules?: string[]): Promise<TestUser> {
      const email = `test-${role.toLowerCase()}-${timestamp}-${random}@outwardsign.test`;
      const password = 'TestPassword123!';

      console.log(`   Creating ${role} user: ${email}`);

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError || !authUser.user) {
        throw new Error(`Failed to create ${role} user: ${authError?.message}`);
      }

      const userId = authUser.user.id;

      await supabase.from('parish_users').insert({
        parish_id: parishId,
        user_id: userId,
        roles: [role],
        enabled_modules: enabledModules || [],
      });

      await supabase.from('user_settings').insert({
        user_id: userId,
        selected_parish_id: parishId,
        language: 'en',
      });

      console.log(`   ✅ ${role} user created: ${userId}`);

      return { userId, email, password, role, enabledModules };
    }

    // Create test users
    const ministryLeaderWeddings = await createUser('ministry-leader', ['weddings']);
    const ministryLeaderFunerals = await createUser('ministry-leader', ['funerals']);
    const parishioner = await createUser('parishioner');

    // Create a test person for use in tests
    console.log('\n   Creating test person...');
    const { data: person, error: personError } = await supabase
      .from('people')
      .insert({ parish_id: parishId, first_name: 'Test', last_name: 'Person' })
      .select()
      .single();

    if (personError || !person) {
      throw new Error(`Failed to create person: ${personError?.message}`);
    }

    console.log(`   ✅ Test person created: ${person.id}\n`);

    testData = {
      parishId,
      ministryLeaderWeddings,
      ministryLeaderFunerals,
      parishioner,
      testPersonId: person.id,
    };
  });

  test.afterAll(async () => {
    console.log('\n🧹 Cleaning up server action authorization test data...\n');

    try {
      // Clean up all weddings and funerals created during tests
      await supabase.from('weddings').delete().eq('parish_id', testData.parishId);
      await supabase.from('funerals').delete().eq('parish_id', testData.parishId);
      await supabase.from('people').delete().eq('parish_id', testData.parishId);

      // Delete users and their settings
      const allUsers = [
        testData.ministryLeaderWeddings,
        testData.ministryLeaderFunerals,
        testData.parishioner,
      ];

      for (const user of allUsers) {
        await supabase.from('parish_users').delete().eq('user_id', user.userId);
        await supabase.from('user_settings').delete().eq('user_id', user.userId);
        await supabase.auth.admin.deleteUser(user.userId);
      }

      // Delete parish
      await supabase.from('group_roles').delete().eq('parish_id', testData.parishId);
      await supabase.from('parish_settings').delete().eq('parish_id', testData.parishId);
      await supabase.from('parishes').delete().eq('id', testData.parishId);

      console.log('   ✅ All test data cleaned up successfully\n');
    } catch (error) {
      console.error('   ❌ Error during cleanup:', error);
    }
  });

  test.describe('Wedding Module Server Actions', () => {
    test('ministry-leader with weddings enabled can create wedding', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderWeddings.email, testData.ministryLeaderWeddings.password);

      // Navigate to create wedding page
      await page.goto('/weddings/create');
      await expect(page).toHaveURL('/weddings/create');

      // Fill in minimal wedding data
      await page.fill('textarea[name="notes"]', 'Test wedding created by ministry-leader');

      // Submit form
      await page.click('button[type="submit"]:has-text("Save")');

      // Should successfully create and redirect to view page
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/weddings/');
      expect(page.url()).not.toContain('/create');
      expect(page.url()).not.toContain('/edit');

      await context.close();
    });

    test('ministry-leader without weddings enabled cannot create wedding', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderFunerals.email, testData.ministryLeaderFunerals.password);

      // Attempt to navigate to create wedding page (should be blocked at page level)
      await page.goto('/weddings/create');
      await page.waitForTimeout(1000);

      // Should be redirected to dashboard with error
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);

      await context.close();
    });

    test('parishioner cannot create wedding', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.parishioner.email, testData.parishioner.password);

      // Attempt to navigate to create wedding page
      await page.goto('/weddings/create');
      await page.waitForTimeout(1000);

      // Should be redirected to dashboard with error
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);

      await context.close();
    });

    test('ministry-leader with weddings enabled can update wedding', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderWeddings.email, testData.ministryLeaderWeddings.password);

      // Create a wedding first
      const { data: wedding, error } = await supabase
        .from('weddings')
        .insert({ parish_id: testData.parishId, status: 'ACTIVE', notes: 'Original notes' })
        .select()
        .single();

      if (error || !wedding) {
        throw new Error(`Failed to create wedding: ${error?.message}`);
      }

      // Navigate to edit page
      await page.goto(`/weddings/${wedding.id}/edit`);
      await expect(page).toHaveURL(`/weddings/${wedding.id}/edit`);

      // Update the notes
      await page.fill('textarea[name="notes"]', 'Updated notes by ministry-leader');

      // Submit form
      await page.click('button[type="submit"]:has-text("Save")');

      // Should successfully update and redirect to view page
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(`/weddings/${wedding.id}`);

      // Verify the update
      const noteText = page.getByText('Updated notes by ministry-leader');
      await expect(noteText).toBeVisible();

      await context.close();
    });

    test('ministry-leader without weddings enabled cannot update wedding', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      // Create a wedding first
      const { data: wedding, error } = await supabase
        .from('weddings')
        .insert({ parish_id: testData.parishId, status: 'ACTIVE', notes: 'Original notes' })
        .select()
        .single();

      if (error || !wedding) {
        throw new Error(`Failed to create wedding: ${error?.message}`);
      }

      await loginAsUser(page, testData.ministryLeaderFunerals.email, testData.ministryLeaderFunerals.password);

      // Attempt to navigate to edit page
      await page.goto(`/weddings/${wedding.id}/edit`);
      await page.waitForTimeout(1000);

      // Should be redirected to dashboard with error
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);

      await context.close();
    });

    test('ministry-leader with weddings enabled can delete wedding', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderWeddings.email, testData.ministryLeaderWeddings.password);

      // Create a wedding first
      const { data: wedding, error } = await supabase
        .from('weddings')
        .insert({ parish_id: testData.parishId, status: 'ACTIVE', notes: 'To be deleted' })
        .select()
        .single();

      if (error || !wedding) {
        throw new Error(`Failed to create wedding: ${error?.message}`);
      }

      // Navigate to view page
      await page.goto(`/weddings/${wedding.id}`);
      await expect(page).toHaveURL(`/weddings/${wedding.id}`);

      // Click delete button
      await page.click('button:has-text("Delete")');

      // Confirm deletion in dialog
      await page.waitForTimeout(500);
      await page.click('button:has-text("Delete"):not([data-testid])'); // Click confirm button in dialog

      // Should redirect to list page
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL('/weddings');

      // Verify wedding is deleted
      const { data: deletedWedding } = await supabase
        .from('weddings')
        .select()
        .eq('id', wedding.id)
        .single();

      expect(deletedWedding).toBeNull();

      await context.close();
    });
  });

  test.describe('Funeral Module Server Actions', () => {
    test('ministry-leader with funerals enabled can create funeral', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderFunerals.email, testData.ministryLeaderFunerals.password);

      // Navigate to create funeral page
      await page.goto('/funerals/create');
      await expect(page).toHaveURL('/funerals/create');

      // Fill in minimal funeral data
      await page.fill('textarea[name="note"]', 'Test funeral created by ministry-leader');

      // Submit form
      await page.click('button[type="submit"]:has-text("Save")');

      // Should successfully create and redirect to view page
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/funerals/');
      expect(page.url()).not.toContain('/create');
      expect(page.url()).not.toContain('/edit');

      await context.close();
    });

    test('ministry-leader without funerals enabled cannot create funeral', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderWeddings.email, testData.ministryLeaderWeddings.password);

      // Attempt to navigate to create funeral page
      await page.goto('/funerals/create');
      await page.waitForTimeout(1000);

      // Should be redirected to dashboard with error
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);

      await context.close();
    });

    test('ministry-leader with funerals enabled can update funeral', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderFunerals.email, testData.ministryLeaderFunerals.password);

      // Create a funeral first
      const { data: funeral, error } = await supabase
        .from('funerals')
        .insert({ parish_id: testData.parishId, status: 'ACTIVE', note: 'Original note' })
        .select()
        .single();

      if (error || !funeral) {
        throw new Error(`Failed to create funeral: ${error?.message}`);
      }

      // Navigate to edit page
      await page.goto(`/funerals/${funeral.id}/edit`);
      await expect(page).toHaveURL(`/funerals/${funeral.id}/edit`);

      // Update the note
      await page.fill('textarea[name="note"]', 'Updated note by ministry-leader');

      // Submit form
      await page.click('button[type="submit"]:has-text("Save")');

      // Should successfully update and redirect to view page
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(`/funerals/${funeral.id}`);

      // Verify the update
      const noteText = page.getByText('Updated note by ministry-leader');
      await expect(noteText).toBeVisible();

      await context.close();
    });

    test('ministry-leader without funerals enabled cannot update funeral', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      // Create a funeral first
      const { data: funeral, error } = await supabase
        .from('funerals')
        .insert({ parish_id: testData.parishId, status: 'ACTIVE', note: 'Original note' })
        .select()
        .single();

      if (error || !funeral) {
        throw new Error(`Failed to create funeral: ${error?.message}`);
      }

      await loginAsUser(page, testData.ministryLeaderWeddings.email, testData.ministryLeaderWeddings.password);

      // Attempt to navigate to edit page
      await page.goto(`/funerals/${funeral.id}/edit`);
      await page.waitForTimeout(1000);

      // Should be redirected to dashboard with error
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);

      await context.close();
    });
  });

  test.describe('Cross-Module Access Control', () => {
    test('ministry-leader can only access their enabled modules', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderWeddings.email, testData.ministryLeaderWeddings.password);

      // Can access weddings
      await page.goto('/weddings');
      await expect(page).toHaveURL('/weddings');

      // Cannot access funerals
      await page.goto('/funerals');
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);

      // Cannot access baptisms
      await page.goto('/baptisms');
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);

      await context.close();
    });
  });
});
