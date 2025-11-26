import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Parish Settings Page Tests
 *
 * Tests for all Parish Settings subpages:
 * - /settings/parish/general - Parish info and liturgical settings
 * - /settings/parish/mass-intentions - Quick amounts for offerings
 * - /settings/parish/petitions - Petition templates
 * - /settings/parish/members - Parish member management
 */

test.describe('Parish Settings - General', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should redirect from /settings/parish to /settings/parish/general', async ({ page }) => {
    await page.goto('/settings/parish');
    await expect(page).toHaveURL('/settings/parish/general', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should display general settings page with parish information', async ({ page }) => {
    await page.goto('/settings/parish/general');
    await expect(page).toHaveURL('/settings/parish/general');

    // Verify page title (this is a real heading in PageContainer)
    await expect(page.getByRole('heading', { name: 'General Settings' })).toBeVisible();

    // Verify parish information form fields
    await expect(page.getByLabel('Parish Name')).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });
    await expect(page.getByLabel('City')).toBeVisible();
    await expect(page.getByLabel('State')).toBeVisible();
  });

  test('should display liturgical settings section', async ({ page }) => {
    await page.goto('/settings/parish/general');

    // Wait for form to load first
    await expect(page.getByLabel('Parish Name')).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Verify liturgical settings section (CardTitle is a div with data-slot)
    await expect(page.locator('[data-slot="card-title"]:has-text("Liturgical Settings")')).toBeVisible();
    await expect(page.getByLabel('Liturgical Calendar Locale')).toBeVisible();
  });

  test('should update parish information', async ({ page }) => {
    await page.goto('/settings/parish/general');

    // Wait for form to load
    await expect(page.getByLabel('Parish Name')).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Update parish name
    const updatedName = `Test Parish ${Date.now()}`;
    await page.getByLabel('Parish Name').fill(updatedName);
    await page.getByLabel('City').fill('Updated City');
    await page.getByLabel('State').fill('UC');

    // Save changes
    await page.getByRole('button', { name: /Save Changes/i }).click();

    // Wait for save to complete
    await expect(page.getByRole('button', { name: /Save Changes/i })).toBeEnabled({
      timeout: TEST_TIMEOUTS.FORM_SUBMIT,
    });

    // Verify persistence by reloading
    await page.reload();
    await expect(page.getByLabel('Parish Name')).toHaveValue(updatedName, { timeout: TEST_TIMEOUTS.DATA_LOAD });
  });

  test('should update liturgical locale setting', async ({ page }) => {
    await page.goto('/settings/parish/general');

    // Wait for form to load
    await expect(page.getByLabel('Liturgical Calendar Locale')).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Click the select
    await page.getByLabel('Liturgical Calendar Locale').click();

    // Select Spanish (Mexico)
    await page.getByRole('option', { name: 'Spanish (Mexico)' }).click();

    // Save locale
    await page.getByRole('button', { name: /Save Locale/i }).click();

    // Wait for save to complete
    await expect(page.getByRole('button', { name: /Save Locale/i })).toBeEnabled({
      timeout: TEST_TIMEOUTS.FORM_SUBMIT,
    });

    // Verify persistence by reloading
    await page.reload();
    await expect(page.getByLabel('Liturgical Calendar Locale')).toContainText('Spanish', {
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });
  });

  test('should display parish details section', async ({ page }) => {
    await page.goto('/settings/parish/general');

    // Wait for form to load first
    await expect(page.getByLabel('Parish Name')).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Verify Parish Details section (h3 inside ContentCard)
    await expect(page.getByText('Parish Details')).toBeVisible();
    await expect(page.getByText('Created')).toBeVisible();
  });

  test('should show breadcrumbs with correct navigation', async ({ page }) => {
    await page.goto('/settings/parish/general');

    // Wait for page to load
    await expect(page.getByLabel('Parish Name')).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    // Settings breadcrumb is a link - use exact match to avoid matching "Parish Settings"
    await expect(breadcrumbNav.getByRole('link', { name: 'Settings', exact: true })).toBeVisible();

    // Click Dashboard to navigate back (more reliable than Settings)
    await breadcrumbNav.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });
});

test.describe('Parish Settings - Mass Intentions', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should display mass intentions settings page', async ({ page }) => {
    await page.goto('/settings/parish/mass-intentions');
    await expect(page).toHaveURL('/settings/parish/mass-intentions');

    // Verify page title (PageContainer heading)
    await expect(page.getByRole('heading', { name: 'Mass Intentions Settings' })).toBeVisible();

    // Verify quick amounts section (CardTitle is a div)
    await expect(page.locator('[data-slot="card-title"]:has-text("Quick Amounts")')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });
  });

  test('should display quick amount configuration', async ({ page }) => {
    await page.goto('/settings/parish/mass-intentions');

    // Wait for quick amounts to load
    const firstAmountInput = page.locator('input[id^="amount-"]').first();
    await expect(firstAmountInput).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Verify add button
    await expect(page.getByRole('button', { name: /Add Quick Amount/i })).toBeVisible();

    // Verify preview section (CardTitle is a div)
    await expect(page.locator('[data-slot="card-title"]:has-text("Preview")')).toBeVisible();
  });

  test('should add a new quick amount', async ({ page }) => {
    await page.goto('/settings/parish/mass-intentions');

    // Wait for page to load
    const addButton = page.getByRole('button', { name: /Add Quick Amount/i });
    await expect(addButton).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Count initial quick amounts
    const initialCount = await page.locator('input[id^="amount-"]').count();

    // Add a new quick amount
    await addButton.click();

    // Verify a new row was added
    await expect(page.locator('input[id^="amount-"]')).toHaveCount(initialCount + 1);
  });

  test('should update quick amount values', async ({ page }) => {
    await page.goto('/settings/parish/mass-intentions');

    // Wait for inputs to load
    const firstAmountInput = page.locator('input[id="amount-0"]');
    await expect(firstAmountInput).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Update the first quick amount
    await firstAmountInput.clear();
    await firstAmountInput.fill('2500');

    const firstLabelInput = page.locator('input[id="label-0"]');
    await firstLabelInput.clear();
    await firstLabelInput.fill('$25');

    // Blur to trigger save
    await firstLabelInput.blur();

    // Wait for preview section to show the badge
    await expect(page.locator('[data-slot="card-title"]:has-text("Preview")')).toBeVisible();

    // Verify in preview section - look for the badge with $25 label
    // The Preview card has title "Preview" and contains badges with the labels
    const previewSection = page.locator('[data-slot="card-content"]').last();
    await expect(previewSection.getByText('$25')).toBeVisible({
      timeout: TEST_TIMEOUTS.FORM_SUBMIT,
    });
  });

  test('should prevent removing the last quick amount', async ({ page }) => {
    await page.goto('/settings/parish/mass-intentions');

    // Wait for page to load
    await expect(page.locator('input[id^="amount-"]').first()).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Get initial count
    let count = await page.locator('input[id^="amount-"]').count();

    // Remove all but one
    while (count > 1) {
      const trashButtons = page.locator('button:has(svg.lucide-trash-2)');
      const enabledButtons = trashButtons.filter({ has: page.locator(':not([disabled])') });
      const buttonCount = await enabledButtons.count();
      if (buttonCount > 0) {
        await enabledButtons.first().click();
        // Wait for the item to be removed
        await expect(page.locator('input[id^="amount-"]')).toHaveCount(count - 1, {
          timeout: TEST_TIMEOUTS.FORM_SUBMIT,
        });
        count--;
      } else {
        break;
      }
    }

    // Verify the last delete button is disabled
    if (count === 1) {
      const lastDeleteButton = page.locator('button:has(svg.lucide-trash-2)').first();
      await expect(lastDeleteButton).toBeDisabled();
    }
  });

  test('should display description text', async ({ page }) => {
    await page.goto('/settings/parish/mass-intentions');

    await expect(page.getByText(/Configure the quick amount buttons/i)).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });
    await expect(page.getByText(/Amounts are stored in cents/i)).toBeVisible();
  });
});

test.describe('Parish Settings - Petitions', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should display petitions settings page', async ({ page }) => {
    await page.goto('/settings/parish/petitions');
    await expect(page).toHaveURL('/settings/parish/petitions');

    // Verify page title (PageContainer heading)
    await expect(page.getByRole('heading', { name: 'Petitions Settings' })).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // Verify petition templates section (use heading to avoid strict mode violation from description text)
    await expect(page.getByRole('heading', { name: 'Petition Templates' })).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });
  });

  test('should display new template button', async ({ page }) => {
    await page.goto('/settings/parish/petitions');

    await expect(page.getByRole('link', { name: /New Template/i })).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });
  });

  test('should navigate to create template page', async ({ page }) => {
    await page.goto('/settings/parish/petitions');

    // Wait for button to load
    await expect(page.getByRole('link', { name: /New Template/i })).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    await page.getByRole('link', { name: /New Template/i }).click();
    await expect(page).toHaveURL('/settings/petitions/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should display search functionality', async ({ page }) => {
    await page.goto('/settings/parish/petitions');

    await expect(page.getByPlaceholder('Search templates...')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });
  });
});

test.describe('Parish Settings - Members', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should display parish members settings page', async ({ page }) => {
    await page.goto('/settings/parish/members');
    await expect(page).toHaveURL('/settings/parish/members');

    // Verify page title (PageContainer heading)
    await expect(page.getByRole('heading', { name: 'Parish Members' })).toBeVisible();

    // Verify description
    await expect(page.getByText('Manage team members and invitations')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });
  });

  test('should display members list', async ({ page }) => {
    await page.goto('/settings/parish/members');

    // Wait for members section to load (look for the card title pattern)
    await expect(page.locator('[data-slot="card-title"]').filter({ hasText: /Parish Members \(\d+\)/ })).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // There should be at least the current user email visible
    await expect(page.locator('div').filter({ hasText: '@outwardsign.test' }).first()).toBeVisible();
  });

  test('should display invite member button', async ({ page }) => {
    await page.goto('/settings/parish/members');

    await expect(page.getByRole('button', { name: /Invite Member/i })).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });
  });

  test('should open invite member dialog', async ({ page }) => {
    await page.goto('/settings/parish/members');

    // Wait for page to load
    await expect(page.getByRole('button', { name: /Invite Member/i })).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // Click invite button
    await page.getByRole('button', { name: /Invite Member/i }).click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });
    await expect(page.getByRole('heading', { name: 'Invite Parish Member' })).toBeVisible();

    // Verify form fields
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Role')).toBeVisible();
  });

  test('should show role options in invite dialog', async ({ page }) => {
    await page.goto('/settings/parish/members');

    // Open invite dialog
    await page.getByRole('button', { name: /Invite Member/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });

    // Click role dropdown
    await page.getByLabel('Role').click();

    // Verify role options
    await expect(page.getByRole('option', { name: /Admin/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /Staff/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /Ministry Leader/i })).toBeVisible();
  });

  test('should cancel invite dialog', async ({ page }) => {
    await page.goto('/settings/parish/members');

    // Open invite dialog
    await page.getByRole('button', { name: /Invite Member/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });

    // Click cancel
    await page.getByRole('button', { name: /Cancel/i }).click();

    // Dialog should close
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: TEST_TIMEOUTS.DIALOG });
  });

  test('should show current user in members list', async ({ page }) => {
    await page.goto('/settings/parish/members');

    // Wait for members to load
    await expect(page.locator('[data-slot="card-title"]').filter({ hasText: /Parish Members \(\d+\)/ })).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // The current user should be in the list with email ending in @outwardsign.test
    await expect(page.locator('div.font-medium').filter({ hasText: '@outwardsign.test' }).first()).toBeVisible();
  });
});
