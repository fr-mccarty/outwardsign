/**
 * Permissions System Tests
 *
 * Tests the role-based access control system to ensure:
 * 1. Users with different roles (admin, staff, ministry-leader, parishioner) have appropriate access
 * 2. Ministry-leaders only see modules they're enabled for
 * 3. Sidebar shows/hides modules based on permissions
 * 4. Direct URL access is blocked for unauthorized users
 * 5. Server actions reject unauthorized attempts
 *
 * This test suite creates users with different roles within a single parish
 * and verifies that permissions are enforced correctly.
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
  parishName: string;
  admin: TestUser;
  staff: TestUser;
  ministryLeaderWeddings: TestUser; // Ministry leader with only weddings enabled
  ministryLeaderMultiple: TestUser; // Ministry leader with weddings + funerals enabled
  parishioner: TestUser;
  testWeddingId: string;
  testFuneralId: string;
}

let testData: TestData;

test.describe.serial('Permissions System', () => {
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
    console.log('\n🏗️  Setting up test parish with users of different roles...\n');

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const parishName = `Permission Test Parish ${timestamp}`;

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
      { parish_id: parishId, name: 'EMHC', description: 'Extraordinary Minister of Holy Communion' },
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

      // Create parish_users entry with role
      await supabase.from('parish_users').insert({
        parish_id: parishId,
        user_id: userId,
        roles: [role],
        enabled_modules: enabledModules || [],
      });

      // Create user_settings
      await supabase.from('user_settings').insert({
        user_id: userId,
        selected_parish_id: parishId,
        language: 'en',
      });

      console.log(`   ✅ ${role} user created: ${userId}`);

      return { userId, email, password, role, enabledModules };
    }

    // Create users with different roles
    const admin = await createUser('admin');
    const staff = await createUser('staff');
    const ministryLeaderWeddings = await createUser('ministry-leader', ['weddings']);
    const ministryLeaderMultiple = await createUser('ministry-leader', ['weddings', 'funerals']);
    const parishioner = await createUser('parishioner');

    // Create test data (wedding and funeral)
    console.log('\n   Creating test wedding and funeral...');

    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .insert({ parish_id: parishId, status: 'ACTIVE', notes: 'Test wedding for permissions' })
      .select()
      .single();

    if (weddingError || !wedding) {
      throw new Error(`Failed to create wedding: ${weddingError?.message}`);
    }

    const { data: funeral, error: funeralError } = await supabase
      .from('funerals')
      .insert({ parish_id: parishId, status: 'ACTIVE', note: 'Test funeral for permissions' })
      .select()
      .single();

    if (funeralError || !funeral) {
      throw new Error(`Failed to create funeral: ${funeralError?.message}`);
    }

    console.log(`   ✅ Test wedding created: ${wedding.id}`);
    console.log(`   ✅ Test funeral created: ${funeral.id}\n`);

    testData = {
      parishId,
      parishName,
      admin,
      staff,
      ministryLeaderWeddings,
      ministryLeaderMultiple,
      parishioner,
      testWeddingId: wedding.id,
      testFuneralId: funeral.id,
    };
  });

  test.afterAll(async () => {
    console.log('\n🧹 Cleaning up permissions test data...\n');

    try {
      // Delete test records
      await supabase.from('weddings').delete().eq('id', testData.testWeddingId);
      await supabase.from('funerals').delete().eq('id', testData.testFuneralId);

      // Delete users and their settings
      const allUsers = [
        testData.admin,
        testData.staff,
        testData.ministryLeaderWeddings,
        testData.ministryLeaderMultiple,
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

  test.describe('Sidebar Visibility', () => {
    test('admin should see all modules in sidebar', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.admin.email, testData.admin.password);

      // Verify all modules are visible in the sidebar
      const modules = [
        'Masses',
        'Mass Intentions',
        'Weddings',
        'Funerals',
        'Baptisms',
        'Presentations',
        'Quinceañeras',
        'Groups'
      ];

      for (const moduleName of modules) {
        const moduleLink = page.locator(`nav a:has-text("${moduleName}")`);
        await expect(moduleLink).toBeVisible();
      }

      await context.close();
    });

    test('staff should see all modules in sidebar', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.staff.email, testData.staff.password);

      // Verify all modules are visible in the sidebar
      const modules = [
        'Masses',
        'Mass Intentions',
        'Weddings',
        'Funerals',
        'Baptisms',
        'Presentations',
        'Quinceañeras',
        'Groups'
      ];

      for (const moduleName of modules) {
        const moduleLink = page.locator(`nav a:has-text("${moduleName}")`);
        await expect(moduleLink).toBeVisible();
      }

      await context.close();
    });

    test('ministry-leader should only see enabled modules in sidebar', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderWeddings.email, testData.ministryLeaderWeddings.password);

      // Should see Weddings
      const weddingsLink = page.locator('nav a:has-text("Weddings")');
      await expect(weddingsLink).toBeVisible();

      // Should NOT see other modules
      const funeralsLink = page.locator('nav a:has-text("Funerals")');
      await expect(funeralsLink).not.toBeVisible();

      const baptismsLink = page.locator('nav a:has-text("Baptisms")');
      await expect(baptismsLink).not.toBeVisible();

      await context.close();
    });

    test('ministry-leader with multiple modules should see all enabled modules', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderMultiple.email, testData.ministryLeaderMultiple.password);

      // Should see Weddings and Funerals
      const weddingsLink = page.locator('nav a:has-text("Weddings")');
      await expect(weddingsLink).toBeVisible();

      const funeralsLink = page.locator('nav a:has-text("Funerals")');
      await expect(funeralsLink).toBeVisible();

      // Should NOT see Baptisms
      const baptismsLink = page.locator('nav a:has-text("Baptisms")');
      await expect(baptismsLink).not.toBeVisible();

      await context.close();
    });

    test('parishioner should not see any modules in sidebar', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.parishioner.email, testData.parishioner.password);

      // Should NOT see any modules
      const modules = [
        'Masses',
        'Mass Intentions',
        'Weddings',
        'Funerals',
        'Baptisms',
        'Presentations',
        'Quinceañeras',
        'Groups'
      ];

      for (const moduleName of modules) {
        const moduleLink = page.locator(`nav a:has-text("${moduleName}")`);
        await expect(moduleLink).not.toBeVisible();
      }

      await context.close();
    });
  });

  test.describe('URL Access Control', () => {
    test('admin can access all module URLs', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.admin.email, testData.admin.password);

      // Test access to weddings
      await page.goto('/weddings');
      await expect(page).toHaveURL('/weddings');
      await expect(page.locator('h1')).toContainText('Weddings');

      // Test access to funerals
      await page.goto('/funerals');
      await expect(page).toHaveURL('/funerals');
      await expect(page.locator('h1')).toContainText('Funerals');

      await context.close();
    });

    test('staff can access all module URLs', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.staff.email, testData.staff.password);

      // Test access to weddings
      await page.goto('/weddings');
      await expect(page).toHaveURL('/weddings');
      await expect(page.locator('h1')).toContainText('Weddings');

      // Test access to funerals
      await page.goto('/funerals');
      await expect(page).toHaveURL('/funerals');
      await expect(page.locator('h1')).toContainText('Funerals');

      await context.close();
    });

    test('ministry-leader can only access enabled module URLs', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderWeddings.email, testData.ministryLeaderWeddings.password);

      // Should be able to access weddings
      await page.goto('/weddings');
      await expect(page).toHaveURL('/weddings');
      await expect(page.locator('h1')).toContainText('Weddings');

      // Should be redirected when accessing funerals
      await page.goto('/funerals');
      await page.waitForTimeout(1000);
      // Should redirect to dashboard with error
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);

      await context.close();
    });

    test('ministry-leader cannot access specific record URLs for disabled modules', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderWeddings.email, testData.ministryLeaderWeddings.password);

      // Can access wedding detail page
      await page.goto(`/weddings/${testData.testWeddingId}`);
      await expect(page).toHaveURL(`/weddings/${testData.testWeddingId}`);

      // Cannot access funeral detail page (should redirect)
      await page.goto(`/funerals/${testData.testFuneralId}`);
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);

      await context.close();
    });

    test('parishioner cannot access any module URLs', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.parishioner.email, testData.parishioner.password);

      // Should be redirected when accessing weddings
      await page.goto('/weddings');
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);

      // Should be redirected when accessing funerals
      await page.goto('/funerals');
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);

      await context.close();
    });

    test('ministry-leader with multiple modules can access all enabled URLs', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderMultiple.email, testData.ministryLeaderMultiple.password);

      // Can access weddings
      await page.goto('/weddings');
      await expect(page).toHaveURL('/weddings');
      await expect(page.locator('h1')).toContainText('Weddings');

      // Can access funerals
      await page.goto('/funerals');
      await expect(page).toHaveURL('/funerals');
      await expect(page.locator('h1')).toContainText('Funerals');

      // Cannot access baptisms (not enabled)
      await page.goto('/baptisms');
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);

      await context.close();
    });
  });

  test.describe('Create Page Access Control', () => {
    test('ministry-leader can access create page for enabled modules', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderWeddings.email, testData.ministryLeaderWeddings.password);

      // Can access weddings create page
      await page.goto('/weddings/create');
      await expect(page).toHaveURL('/weddings/create');

      await context.close();
    });

    test('ministry-leader cannot access create page for disabled modules', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderWeddings.email, testData.ministryLeaderWeddings.password);

      // Cannot access funerals create page
      await page.goto('/funerals/create');
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);

      await context.close();
    });

    test('parishioner cannot access create pages', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.parishioner.email, testData.parishioner.password);

      // Cannot access weddings create page
      await page.goto('/weddings/create');
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);

      await context.close();
    });
  });

  test.describe('Edit Page Access Control', () => {
    test('ministry-leader can access edit page for enabled modules', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderWeddings.email, testData.ministryLeaderWeddings.password);

      // Can access wedding edit page
      await page.goto(`/weddings/${testData.testWeddingId}/edit`);
      await expect(page).toHaveURL(`/weddings/${testData.testWeddingId}/edit`);

      await context.close();
    });

    test('ministry-leader cannot access edit page for disabled modules', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderWeddings.email, testData.ministryLeaderWeddings.password);

      // Cannot access funeral edit page
      await page.goto(`/funerals/${testData.testFuneralId}/edit`);
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);

      await context.close();
    });
  });

  test.describe('Settings Access Control', () => {
    test('only admin can access parish settings', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.admin.email, testData.admin.password);

      // Admin should see Settings in sidebar
      const settingsLink = page.locator('nav a:has-text("Settings")');
      await expect(settingsLink).toBeVisible();

      // Admin can access settings page
      await page.goto('/settings/parish');
      await expect(page).toHaveURL('/settings/parish');

      await context.close();
    });

    test('staff cannot access parish settings', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.staff.email, testData.staff.password);

      // Staff should NOT see Settings in sidebar
      const settingsLink = page.locator('nav a:has-text("Settings")');
      await expect(settingsLink).not.toBeVisible();

      // Staff cannot access settings page directly
      await page.goto('/settings/parish');
      await page.waitForTimeout(1000);
      // Should redirect or show error
      expect(page.url()).not.toContain('/settings/parish');

      await context.close();
    });

    test('ministry-leader cannot access parish settings', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderWeddings.email, testData.ministryLeaderWeddings.password);

      // Ministry-leader should NOT see Settings in sidebar
      const settingsLink = page.locator('nav a:has-text("Settings")');
      await expect(settingsLink).not.toBeVisible();

      await context.close();
    });
  });

  test.describe('Dashboard Error Messages', () => {
    test('dashboard should show error message when permission denied', async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();

      await loginAsUser(page, testData.ministryLeaderWeddings.email, testData.ministryLeaderWeddings.password);

      // Try to access disabled module
      await page.goto('/funerals');
      await page.waitForTimeout(1000);

      // Should redirect to dashboard with error parameter
      await expect(page).toHaveURL(/\/dashboard.*error=no_permission/);
      await expect(page).toHaveURL(/module=funerals/);

      await context.close();
    });
  });
});
