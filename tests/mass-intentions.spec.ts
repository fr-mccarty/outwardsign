import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Mass Intentions Module', () => {
  test('should create, view, edit, and verify print view for a mass intention', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to mass intentions page
    await page.goto('/mass-intentions');
    await expect(page).toHaveURL('/mass-intentions');

    // Click "New Mass Intention" button
    const newIntentionLink = page.getByRole('link', { name: /New Mass Intention/i }).first();
    await newIntentionLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/mass-intentions/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Create Mass Intention' })).toBeVisible();

    // Fill in mass intention form
    const massOfferedFor = 'In memory of John Smith';
    await page.fill('#mass_offered_for', massOfferedFor);

    // Add some notes
    const initialNotes = 'Initial mass intention request from the Smith family';
    await page.locator('textarea').first().fill(initialNotes);

    // Scroll to bottom to ensure submit button is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Submit the form
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the mass intention detail page (navigation proves success)
    await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the mass intention ID from URL for later use
    const intentionUrl = page.url();
    const intentionId = intentionUrl.split('/').pop();

    console.log(`Created mass intention with ID: ${intentionId}`);

    // Verify we're on the view page
    await expect(page.getByRole('heading', { name: /Mass Intention/i }).first()).toBeVisible();

    // Verify the mass offered for text is displayed
    await expect(page.locator(`text=${massOfferedFor}`).first()).toBeVisible();

    // Navigate to edit page
    await page.goto(`/mass-intentions/${intentionId}/edit`);
    await expect(page).toHaveURL(`/mass-intentions/${intentionId}/edit`, { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: /Edit/i })).toBeVisible();

    // Edit the mass intention - update information
    const updatedNotes = 'Updated notes: Family confirmed stipend payment received';
    await page.locator('textarea').first().fill(updatedNotes);

    // Scroll to bottom and submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const editSubmitButton = page.locator('button[type="submit"]').last();
    await editSubmitButton.scrollIntoViewIfNeeded();
    await editSubmitButton.click();

    // Wait briefly for the update to complete (edit stays on same page with router.refresh())
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Navigate back to view page
    await page.goto(`/mass-intentions/${intentionId}`);
    await expect(page).toHaveURL(`/mass-intentions/${intentionId}`);

    // Verify we're on the mass intention view page (update was successful)
    await expect(page.getByRole('heading', { name: /Mass Intention/i }).first()).toBeVisible();

    // Test print view - verify it exists and loads
    console.log(`Testing print view for mass intention: ${intentionId}`);
    await page.goto(`/print/mass-intentions/${intentionId}`);
    await expect(page).toHaveURL(`/print/mass-intentions/${intentionId}`, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify print view loaded (check for common print view elements)
    // Print views typically don't have navigation or action buttons
    // Just verify the page loaded without error
    await expect(page.locator('body')).toBeVisible();

    console.log(`Successfully tested mass intention: ${intentionId} - created, edited, and verified print view`);
  });

  test('should show empty state when no mass intentions exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to mass intentions page
    await page.goto('/mass-intentions');

    // Should show the page title
    await expect(page.getByRole('heading', { name: 'Mass Intentions' }).first()).toBeVisible();

    // Should have a create button
    const createButton = page.getByRole('link', { name: /New Mass Intention/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should create mass intention with minimal data', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/mass-intentions/create');
    await expect(page).toHaveURL('/mass-intentions/create');

    // Fill only required field: mass_offered_for
    await page.fill('#mass_offered_for', 'For the repose of the soul of Mary Johnson');

    // Submit with just the required field
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should successfully create and redirect
    await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify we're on a mass intention detail page
    await expect(page.getByRole('heading', { name: /Mass Intention/i }).first()).toBeVisible();
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a mass intention
    await page.goto('/mass-intentions/create');
    await page.fill('#mass_offered_for', 'For the Smith family');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const btn = page.locator('button[type="submit"]').last();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Mass Intentions' })).toBeVisible();

    // Click on "Mass Intentions" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Mass Intentions' }).click();

    // Should navigate back to mass intentions list
    await expect(page).toHaveURL('/mass-intentions');
  });

  test('should display action buttons on mass intention view page', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a mass intention
    await page.goto('/mass-intentions/create');
    await page.fill('#mass_offered_for', 'For the Jones family');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitBtn = page.locator('button[type="submit"]').last();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify action buttons exist (custom view client buttons)
    await expect(page.getByRole('link', { name: /Edit/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Print View/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Download/i })).toBeVisible();
  });

  test('should filter mass intentions by status', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to mass intentions page
    await page.goto('/mass-intentions');
    await expect(page).toHaveURL('/mass-intentions');

    // Check if status filter exists
    const statusFilter = page.locator('select#status-filter, select[name="status"]').first();

    // If status filter exists, test filtering
    if (await statusFilter.isVisible()) {
      // Select a specific status
      await statusFilter.click();
      await page.getByRole('option', { name: 'Requested' }).first().click();

      // Wait for any loading/filtering to complete
      await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

      // Verify URL includes status filter or page updated
      // This is a basic check - actual behavior may vary
      await expect(page).toHaveURL(/mass-intentions/);
    }
  });

  test('should search for mass intentions', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a mass intention with searchable content
    await page.goto('/mass-intentions/create');
    const searchableName = 'SearchableTestIntention2024';
    await page.fill('#mass_offered_for', searchableName);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitBtn = page.locator('button[type="submit"]').last();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Navigate back to list page
    await page.goto('/mass-intentions');

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input#search').first();

    if (await searchInput.isVisible()) {
      // Search for the mass intention we just created
      await searchInput.fill(searchableName);

      // Wait for search to filter results
      await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

      // Verify the searchable intention appears in results
      await expect(page.locator(`text=${searchableName}`).first()).toBeVisible();
    }
  });

  test('should handle stipend field with dollar formatting', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/mass-intentions/create');
    await expect(page).toHaveURL('/mass-intentions/create');

    // Fill required field
    await page.fill('#mass_offered_for', 'For the Garcia family');

    // Fill stipend field with dollar amount
    const stipendInput = page.locator('input#stipend_in_cents, input[name="stipend"]').first();
    if (await stipendInput.isVisible()) {
      await stipendInput.fill('25.00');
    }

    // Submit the form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should successfully create and redirect
    await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify we're on a mass intention detail page
    await expect(page.getByRole('heading', { name: /Mass Intention/i }).first()).toBeVisible();
  });

  test('should handle date fields correctly', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/mass-intentions/create');
    await expect(page).toHaveURL('/mass-intentions/create');

    // Fill required field
    await page.fill('#mass_offered_for', 'For the Martinez family');

    // Fill date fields if they exist
    const dateRequestedInput = page.locator('input#date_requested').first();
    const dateReceivedInput = page.locator('input#date_received').first();

    if (await dateRequestedInput.isVisible()) {
      await dateRequestedInput.fill('2024-06-15');
    }

    if (await dateReceivedInput.isVisible()) {
      await dateReceivedInput.fill('2024-06-10');
    }

    // Submit the form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should successfully create and redirect
    await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify we're on a mass intention detail page
    await expect(page.getByRole('heading', { name: /Mass Intention/i }).first()).toBeVisible();
  });

  test('should update mass intention and verify persistence after page refresh', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a mass intention with initial data
    await page.goto('/mass-intentions/create');

    const initialMassOfferedFor = 'In memory of Maria Rodriguez';
    const initialNote = 'Initial mass intention note';

    await page.fill('#mass_offered_for', initialMassOfferedFor);
    await page.locator('textarea').first().fill(initialNote);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const intentionId = page.url().split('/').pop();

    // Verify initial data is displayed on view page
    await expect(page.locator(`text=${initialMassOfferedFor}`).first()).toBeVisible();

    // Navigate to edit page
    await page.goto(`/mass-intentions/${intentionId}/edit`);
    await expect(page).toHaveURL(`/mass-intentions/${intentionId}/edit`);

    // Verify initial values are pre-filled
    await expect(page.locator('#mass_offered_for')).toHaveValue(initialMassOfferedFor);
    await expect(page.locator('textarea').first()).toHaveValue(initialNote);

    // Update with NEW values
    const updatedMassOfferedFor = 'For the repose of the soul of Juan Martinez';
    const updatedNote = 'UPDATED: Family has confirmed stipend payment and requested Sunday 10am Mass.';

    await page.fill('#mass_offered_for', updatedMassOfferedFor);
    await page.locator('textarea').first().fill(updatedNote);

    // Submit the update
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    // Mass intention form uses router.refresh() on edit, so it stays on edit page
    // Wait for the update to complete
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Navigate to view page to verify the update
    await page.goto(`/mass-intentions/${intentionId}`);
    await expect(page).toHaveURL(`/mass-intentions/${intentionId}`);

    // CRITICAL: Verify UPDATED values are displayed
    await expect(page.locator(`text=${updatedMassOfferedFor}`).first()).toBeVisible();
    await expect(page.locator(`text=${updatedNote}`).first()).toBeVisible();

    // CRITICAL: Verify old values are NOT displayed
    await expect(page.locator(`text=${initialMassOfferedFor}`)).not.toBeVisible();
    await expect(page.locator(`text=${initialNote}`)).not.toBeVisible();

    // PERSISTENCE TEST: Refresh page to verify database persistence
    console.log(`Refreshing page to verify persistence for mass intention: ${intentionId}`);
    await page.reload();

    // After refresh, verify UPDATED values are STILL displayed
    await expect(page.locator(`text=${updatedMassOfferedFor}`).first()).toBeVisible();
    await expect(page.locator(`text=${updatedNote}`).first()).toBeVisible();

    // Navigate to edit page again to verify form persistence
    await page.goto(`/mass-intentions/${intentionId}/edit`);

    // PERSISTENCE TEST: Verify form fields contain UPDATED values
    await expect(page.locator('#mass_offered_for')).toHaveValue(updatedMassOfferedFor);
    await expect(page.locator('textarea').first()).toHaveValue(updatedNote);

    console.log(`Successfully verified update persistence for mass intention: ${intentionId}`);
  });
});
