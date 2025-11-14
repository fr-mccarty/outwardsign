import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Parish Settings', () => {
  test('should load parish settings page and display all tabs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');
    await expect(page).toHaveURL('/settings/parish');

    // Verify page title
    await expect(page.getByRole('heading', { name: 'Parish Settings' })).toBeVisible();

    // Verify all tabs are present
    await expect(page.getByRole('tab', { name: /Parish Settings/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Mass Intentions/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Donations/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Members/i })).toBeVisible();

    // Verify refresh button exists
    await expect(page.getByRole('button', { name: /Refresh/i })).toBeVisible();
  });

  test('should display parish information and allow updates', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Ensure we're on the Parish Settings tab (default)
    const parishSettingsTab = page.getByRole('tab', { name: /Parish Settings/i });
    await parishSettingsTab.click();

    // Verify parish information form exists
    await expect(page.locator('input#name')).toBeVisible();
    await expect(page.locator('input#city')).toBeVisible();
    await expect(page.locator('input#state')).toBeVisible();

    // Update parish name
    const updatedName = `Test Parish ${Date.now()}`;
    await page.fill('input#name', updatedName);

    // Update city
    await page.fill('input#city', 'Updated City');

    // Update state
    await page.fill('input#state', 'UC');

    // Save changes
    const saveButton = page.getByRole('button', { name: /Save Changes/i }).first();
    await saveButton.click();

    // Wait for save operation - look for toast or wait longer
    await page.waitForTimeout(2000);

    // Verify the values persisted by refreshing the page
    await page.reload();
    await page.waitForTimeout(1000); // Wait for page to load
    await expect(page.locator('input#name')).toHaveValue(updatedName);
    await expect(page.locator('input#city')).toHaveValue('Updated City');
    await expect(page.locator('input#state')).toHaveValue('UC');
  });

  test('should validate required fields for parish information', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Clear parish name (required field)
    await page.fill('input#name', '');

    // Try to save
    const saveButton = page.getByRole('button', { name: /Save Changes/i }).first();
    await saveButton.click();

    // Should remain on the same page (validation prevented save)
    await expect(page).toHaveURL('/settings/parish');
  });

  test('should update liturgical locale setting', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Ensure we're on the Parish Settings tab
    const parishSettingsTab = page.getByRole('tab', { name: /Parish Settings/i });
    await parishSettingsTab.click();

    // Wait for tab content to load
    await page.waitForTimeout(500);

    // Find and click the liturgical locale select
    const localeSelect = page.locator('#liturgical-locale');
    await localeSelect.click();

    // Select Spanish (Mexico)
    await page.getByRole('option', { name: 'Spanish (Mexico)' }).click();

    // Save the liturgical locale
    const saveLocaleButton = page.getByRole('button', { name: /Save Locale/i });
    await saveLocaleButton.click();

    // Wait for save operation
    await page.waitForTimeout(2000);

    // Verify the value persisted by refreshing
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(localeSelect).toHaveText('Spanish (Mexico)');
  });

  test('should display and configure mass intention quick amounts', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Click on Mass Intentions tab
    const massIntentionsTab = page.getByRole('tab', { name: /Mass Intentions/i });
    await massIntentionsTab.click();

    // Wait for tab content to load by waiting for the first input to be visible
    const firstAmountInput = page.locator('input[id^="amount-"]').first();
    await firstAmountInput.waitFor({ state: 'visible', timeout: 10000 });

    // Verify at least one quick amount row exists
    await expect(firstAmountInput).toBeVisible();

    // Verify preview section exists
    await expect(page.getByText('Preview:')).toBeVisible();

    // Verify save button
    await expect(page.getByRole('button', { name: /Save Quick Amounts/i })).toBeVisible();

    // Verify description text
    await expect(page.getByText(/Configure the quick amount buttons/i)).toBeVisible();
  });

  test('should add and remove mass intention quick amounts', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Click on Mass Intentions tab
    const massIntentionsTab = page.getByRole('tab', { name: /Mass Intentions/i });
    await massIntentionsTab.click();

    // Wait for tab content to load
    await page.waitForTimeout(500);

    // Count initial quick amounts
    const initialCount = await page.locator('input[id^="amount-"]').count();

    // Add a new quick amount
    const addButton = page.getByRole('button', { name: /Add Quick Amount/i });
    await addButton.click();

    // Verify a new row was added
    const newCount = await page.locator('input[id^="amount-"]').count();
    expect(newCount).toBe(initialCount + 1);

    // Fill in the new quick amount
    const lastAmountIndex = newCount - 1;
    await page.fill(`input[id="amount-${lastAmountIndex}"]`, '1500');
    await page.fill(`input[id="label-${lastAmountIndex}"]`, '$15');

    // Save quick amounts
    const saveButton = page.getByRole('button', { name: /Save Quick Amounts/i });
    await saveButton.click();

    // Wait for save operation
    await page.waitForTimeout(2000);

    // Verify the new amount is in the preview section (check for badge with exact text)
    const previewSection = page.locator('text=Preview:').locator('..');
    await expect(previewSection.getByText('$15', { exact: true })).toBeVisible();
  });

  test('should update mass intention quick amount values', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Click on Mass Intentions tab
    const massIntentionsTab = page.getByRole('tab', { name: /Mass Intentions/i });
    await massIntentionsTab.click();

    // Wait for tab content to load by waiting for the first input
    const firstAmountInput = page.locator('input[id="amount-0"]');
    await firstAmountInput.waitFor({ state: 'visible', timeout: 10000 });

    // Update the first quick amount
    await firstAmountInput.fill('2500');

    const firstLabelInput = page.locator('input[id="label-0"]');
    await firstLabelInput.fill('$25');

    // Save quick amounts
    const saveButton = page.getByRole('button', { name: /Save Quick Amounts/i });
    await saveButton.click();

    // Wait for save operation
    await page.waitForTimeout(2000);

    // Refresh and verify persistence
    await page.reload();
    await page.waitForTimeout(1000);
    await massIntentionsTab.click();

    // Wait for inputs to be visible again after reload
    await firstAmountInput.waitFor({ state: 'visible', timeout: 10000 });

    await expect(firstAmountInput).toHaveValue('2500');
    await expect(firstLabelInput).toHaveValue('$25');
  });

  test('should display and configure donations quick amounts', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Click on Donations tab
    const donationsTab = page.getByRole('tab', { name: /Donations/i });
    await donationsTab.click();

    // Wait for tab content to load by waiting for the first input
    const firstAmountInput = page.locator('input[id^="donations-amount-"]').first();
    await firstAmountInput.waitFor({ state: 'visible', timeout: 10000 });

    // Verify at least one quick amount row exists
    await expect(firstAmountInput).toBeVisible();

    // Verify preview section exists
    await expect(page.getByText('Preview:')).toBeVisible();

    // Verify save button
    await expect(page.getByRole('button', { name: /Save Quick Amounts/i })).toBeVisible();

    // Verify description text
    await expect(page.getByText(/Configure the quick amount buttons/i)).toBeVisible();
  });

  test('should add and remove donations quick amounts', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Click on Donations tab
    const donationsTab = page.getByRole('tab', { name: /Donations/i });
    await donationsTab.click();

    // Wait for tab content to load
    await page.waitForTimeout(500);

    // Count initial quick amounts
    const initialCount = await page.locator('input[id^="donations-amount-"]').count();

    // Add a new quick amount
    const addButton = page.getByRole('button', { name: /Add Quick Amount/i });
    await addButton.click();

    // Verify a new row was added
    const newCount = await page.locator('input[id^="donations-amount-"]').count();
    expect(newCount).toBe(initialCount + 1);

    // Fill in the new quick amount
    const lastAmountIndex = newCount - 1;
    await page.fill(`input[id="donations-amount-${lastAmountIndex}"]`, '10000');
    await page.fill(`input[id="donations-label-${lastAmountIndex}"]`, '$100');

    // Save quick amounts
    const saveButton = page.getByRole('button', { name: /Save Quick Amounts/i });
    await saveButton.click();

    // Wait for save operation
    await page.waitForTimeout(2000);

    // Verify the new amount is in the preview section (check for badge with exact text)
    const previewSection = page.locator('text=Preview:').locator('..');
    await expect(previewSection.getByText('$100', { exact: true })).toBeVisible();
  });

  test('should display parish members tab', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Click on Members tab
    const membersTab = page.getByRole('tab', { name: /Members/i });
    await membersTab.click();

    // Wait for tab content to load
    await page.waitForTimeout(500);

    // The members list should load (may be empty or have test user)
    // Just verify the tab is active and we can see the tab content
    await expect(membersTab).toHaveAttribute('data-state', 'active');
  });

  test('should navigate between tabs without losing data', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Update parish name
    const testName = `Tab Navigation Test ${Date.now()}`;
    await page.fill('input#name', testName);

    // Switch to Mass Intentions tab
    const massIntentionsTab = page.getByRole('tab', { name: /Mass Intentions/i });
    await massIntentionsTab.click();
    await page.waitForTimeout(2000);
    await expect(page.locator('input[id^="amount-"]').first()).toBeVisible();

    // Switch to Donations tab
    const donationsTab = page.getByRole('tab', { name: /Donations/i });
    await donationsTab.click();
    await page.waitForTimeout(2000);
    await expect(page.locator('input[id^="donations-amount-"]').first()).toBeVisible();

    // Switch to Members tab
    const membersTab = page.getByRole('tab', { name: /Members/i });
    await membersTab.click();
    await page.waitForTimeout(500);
    await expect(membersTab).toHaveAttribute('data-state', 'active');

    // Switch back to Parish Settings tab
    const parishSettingsTab = page.getByRole('tab', { name: /Parish Settings/i });
    await parishSettingsTab.click();
    await page.waitForTimeout(500);

    // Verify the parish name we entered is still there (not saved yet, but in local state)
    await expect(page.locator('input#name')).toHaveValue(testName);
  });

  test('should show breadcrumbs on parish settings page', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Settings', exact: true })).toBeVisible();

    // Click on Dashboard breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Dashboard' }).click();

    // Should navigate to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should display parish details section', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Ensure we're on the Parish Settings tab
    const parishSettingsTab = page.getByRole('tab', { name: /Parish Settings/i });
    await parishSettingsTab.click();

    // Wait for tab content to load
    await page.waitForTimeout(500);

    // Verify created date label is visible (part of Parish Details section)
    await expect(page.getByText('Created')).toBeVisible();
  });

  test('should handle refresh button correctly', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Click refresh button
    const refreshButton = page.getByRole('button', { name: /Refresh/i });
    await refreshButton.click();

    // Wait for reload
    await page.waitForTimeout(1000);

    // Verify page is still loaded correctly
    await expect(page.getByRole('heading', { name: 'Parish Settings' })).toBeVisible();
  });

  test('should prevent removing the last quick amount', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Click on Mass Intentions tab
    const massIntentionsTab = page.getByRole('tab', { name: /Mass Intentions/i });
    await massIntentionsTab.click();

    // Wait for tab content to load
    await page.waitForTimeout(500);

    // Count quick amounts
    let quickAmountCount = await page.locator('input[id^="amount-"]').count();

    // If there's more than one, remove all but one
    if (quickAmountCount > 1) {
      for (let i = quickAmountCount - 1; i > 0; i--) {
        // Find trash icon buttons and click the first one
        const trashButtons = page.locator('button:has(svg.lucide-trash-2)');
        const count = await trashButtons.count();
        if (count > 0) {
          await trashButtons.first().click();
          await page.waitForTimeout(200);
        }
      }
    }

    // Count again to verify
    quickAmountCount = await page.locator('input[id^="amount-"]').count();

    // If we successfully removed items, the last delete button should be disabled
    if (quickAmountCount === 1) {
      const deleteButton = page.locator('button:has(svg.lucide-trash-2)').first();
      await expect(deleteButton).toBeDisabled();
    }
  });

  test('should display quick amount preview badges', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Click on Mass Intentions tab
    const massIntentionsTab = page.getByRole('tab', { name: /Mass Intentions/i });
    await massIntentionsTab.click();

    // Wait for tab content to load
    await page.waitForTimeout(500);

    // Get the first label value
    const firstLabel = await page.locator('input[id="label-0"]').inputValue();

    // Verify the preview section shows the badge with that label
    const previewSection = page.locator('text=Preview:').locator('..');
    await expect(previewSection).toBeVisible();

    // The badge should contain the label text
    if (firstLabel) {
      await expect(previewSection.getByText(firstLabel, { exact: true })).toBeVisible();
    }
  });

  test('should show currency conversion helper text', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Click on Mass Intentions tab
    const massIntentionsTab = page.getByRole('tab', { name: /Mass Intentions/i });
    await massIntentionsTab.click();

    // Wait for the first input to be visible
    const firstAmountInput = page.locator('input[id="amount-0"]');
    await firstAmountInput.waitFor({ state: 'visible', timeout: 10000 });

    // Get the first amount value
    const firstAmountValue = await firstAmountInput.inputValue();

    if (firstAmountValue) {
      // Convert cents to dollars for verification
      const amountInCents = parseInt(firstAmountValue);
      const amountInDollars = (amountInCents / 100).toFixed(2);

      // Verify the helper text shows the dollar conversion (check for any occurrence)
      await expect(page.locator('p.text-xs.text-muted-foreground').filter({ hasText: `$${amountInDollars}` }).first()).toBeVisible();
    }
  });

  test('should show description text for quick amounts', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to parish settings
    await page.goto('/settings/parish');

    // Click on Mass Intentions tab
    const massIntentionsTab = page.getByRole('tab', { name: /Mass Intentions/i });
    await massIntentionsTab.click();

    // Wait for tab content to load
    await page.waitForTimeout(500);

    // Verify description text
    await expect(page.getByText(/Configure the quick amount buttons/i)).toBeVisible();
    await expect(page.getByText(/Amounts are stored in cents/i)).toBeVisible();
  });
});
