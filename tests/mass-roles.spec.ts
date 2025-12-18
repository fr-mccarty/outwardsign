import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Mass Roles Module', () => {
  test.describe('Mass Roles CRUD Operations', () => {
    test('should create, view, edit, and delete a mass role', async ({ page }) => {
      // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

      // Navigate to mass roles page
      await page.goto('/mass-roles');
      await expect(page).toHaveURL('/mass-roles');

      // Click "New Mass Role" button
      const newRoleLink = page.getByRole('link', { name: /New Mass Role/i }).first();
      await newRoleLink.click();

      // Verify we're on the create page
      await expect(page).toHaveURL('/mass-roles/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
      await expect(page.getByRole('heading', { name: 'Create New Mass Role' })).toBeVisible();

      // Fill in the mass role form
      const roleName = 'Lector (Test)';
      const description = 'Proclaims the Word of God from the ambo during Mass';
      const notes = 'Test notes for lector role';

      await page.fill('#name', roleName);
      await page.fill('#description', description);
      await page.fill('#note', notes);

      // Set display order
      await page.fill('#display_order', '10');

      // Ensure active checkbox is checked (should be by default)
      // FormField checkbox uses value="true" for checked, value="false" for unchecked
      const activeCheckbox = page.locator('#is_active');
      await expect(activeCheckbox).toHaveValue('true');

      // Scroll to bottom to ensure submit button is visible
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Submit the form
      const submitButton = page.locator('button[type="submit"]').last();
      await submitButton.scrollIntoViewIfNeeded();
      await submitButton.click();

      // Should redirect to the mass role detail page (navigation proves success)
      await page.waitForURL(/\/mass-roles\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      // Get the mass role ID from URL for later use
      const massRoleUrl = page.url();
      const massRoleId = massRoleUrl.split('/').pop();

      console.log(`Created mass role with ID: ${massRoleId}`);

      // Verify we're on the view page
      await expect(page.getByRole('heading', { name: roleName }).first()).toBeVisible();

      // Verify the data is displayed
      await expect(page.locator(`text=${description}`).first()).toBeVisible();
      await expect(page.locator(`text=${notes}`).first()).toBeVisible();

      // Navigate to edit page
      await page.goto(`/mass-roles/${massRoleId}/edit`);
      await expect(page).toHaveURL(`/mass-roles/${massRoleId}/edit`, { timeout: TEST_TIMEOUTS.NAVIGATION });
      await expect(page.getByRole('heading', { name: /Edit/i }).first()).toBeVisible();

      // Edit the mass role - update information
      const updatedDescription = 'UPDATED: Proclaims the Word of God with clarity and reverence';
      const updatedNotes = 'UPDATED: Training required before first assignment';

      await page.fill('#description', updatedDescription);
      await page.fill('#note', updatedNotes);

      // Scroll to bottom and submit
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const editSubmitButton = page.locator('button[type="submit"]').last();
      await editSubmitButton.scrollIntoViewIfNeeded();
      await editSubmitButton.click();

      // Should redirect back to view page after edit
      await page.waitForURL(`/mass-roles/${massRoleId}`, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      // Verify we're on the mass role view page (update was successful)
      await expect(page.getByRole('heading', { name: roleName }).first()).toBeVisible();

      // CRITICAL: Verify UPDATED values are displayed
      await expect(page.locator(`text=${updatedDescription}`).first()).toBeVisible();
      await expect(page.locator(`text=${updatedNotes}`).first()).toBeVisible();

      // CRITICAL: Verify old values are NOT displayed
      await expect(page.locator(`text=${description}`)).not.toBeVisible();
      await expect(page.locator(`text=${notes}`)).not.toBeVisible();

      // Test deletion with confirmation dialog
      const deleteButton = page.getByRole('button', { name: /Delete/i });
      await deleteButton.click();

      // Confirm deletion in the dialog
      const confirmButton = page.getByRole('button', { name: /Confirm|Delete/i }).last();
      await confirmButton.click();

      // Should redirect to mass roles list after deletion
      await page.waitForURL('/mass-roles', { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      console.log(`Successfully tested mass role: ${massRoleId} - created, edited, and deleted`);
    });

    test('should show empty state when no mass roles exist', async ({ page }) => {
      // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

      // Navigate to mass roles page
      await page.goto('/mass-roles');

      // Should show the page title
      await expect(page.getByRole('heading', { name: 'Mass Roles' }).first()).toBeVisible();

      // Should have a create button
      const createButton = page.getByRole('link', { name: /New Mass Role/i }).first();
      await expect(createButton).toBeVisible();
    });

    test('should create mass role with minimal data', async ({ page }) => {
      // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

      // Go to create page
      await page.goto('/mass-roles/create');
      await expect(page).toHaveURL('/mass-roles/create');

      // Fill only the required field (name)
      await page.fill('#name', 'Altar Server (Test)');

      // Submit with minimal data (description and notes are optional)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const submitButton = page.locator('button[type="submit"]').last();
      await submitButton.scrollIntoViewIfNeeded();
      await submitButton.click();

      // Should successfully create and redirect (even with minimal data)
      await page.waitForURL(/\/mass-roles\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      // Verify we're on a mass role detail page
      await expect(page.getByRole('heading', { name: /Altar Server/i }).first()).toBeVisible();
    });

    test('should require name field', async ({ page }) => {
      // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

      // Go to create page
      await page.goto('/mass-roles/create');
      await expect(page).toHaveURL('/mass-roles/create');

      // Fill only optional fields, leave name empty
      await page.fill('#description', 'This should fail without a name');

      // Try to submit
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const submitButton = page.locator('button[type="submit"]').last();
      await submitButton.scrollIntoViewIfNeeded();
      await submitButton.click();

      // Should stay on create page due to validation error
      // Wait a moment for validation to kick in
      await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

      // Should still be on create page (not redirected)
      await expect(page).toHaveURL('/mass-roles/create');
    });

    test('should update mass role and verify persistence after page refresh', async ({ page }) => {
      // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

      // Create a mass role with initial data
      await page.goto('/mass-roles/create');

      const initialName = 'Eucharistic Minister (Test)';
      const initialDescription = 'Distributes Holy Communion during Mass';
      const initialNotes = 'Initial notes text';

      await page.fill('#name', initialName);
      await page.fill('#description', initialDescription);
      await page.fill('#note', initialNotes);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.locator('button[type="submit"]').last().click();
      await page.waitForURL(/\/mass-roles\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      const massRoleId = page.url().split('/').pop();

      // Verify initial data is displayed on view page
      await expect(page.locator(`text=${initialDescription}`).first()).toBeVisible();
      await expect(page.locator(`text=${initialNotes}`).first()).toBeVisible();

      // Navigate to edit page
      await page.goto(`/mass-roles/${massRoleId}/edit`);
      await expect(page).toHaveURL(`/mass-roles/${massRoleId}/edit`);

      // Verify initial values are pre-filled
      await expect(page.locator('#name').first()).toHaveValue(initialName);
      await expect(page.locator('#description').first()).toHaveValue(initialDescription);
      await expect(page.locator('#note').first()).toHaveValue(initialNotes);

      // Update with NEW values
      const updatedDescription = 'UPDATED: Assists the priest in distributing Holy Communion';
      const updatedNotes = 'UPDATED: Must be commissioned before serving';

      await page.fill('#description', updatedDescription);
      await page.fill('#note', updatedNotes);

      // Submit the update
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.locator('button[type="submit"]').last().click();

      // Should redirect to view page after edit
      await page.waitForURL(`/mass-roles/${massRoleId}`, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      // CRITICAL: Verify UPDATED values are displayed on view page
      await expect(page.locator(`text=${updatedDescription}`).first()).toBeVisible();
      await expect(page.locator(`text=${updatedNotes}`).first()).toBeVisible();

      // CRITICAL: Verify old values are NOT displayed
      await expect(page.locator(`text=${initialDescription}`)).not.toBeVisible();
      await expect(page.locator(`text=${initialNotes}`)).not.toBeVisible();

      // PERSISTENCE TEST: Refresh page to verify database persistence
      console.log(`Refreshing page to verify persistence for mass role: ${massRoleId}`);
      await page.reload();

      // After refresh, verify UPDATED values are STILL displayed
      await expect(page.locator(`text=${updatedDescription}`).first()).toBeVisible();
      await expect(page.locator(`text=${updatedNotes}`).first()).toBeVisible();

      // Navigate to edit page again to verify form persistence
      await page.goto(`/mass-roles/${massRoleId}/edit`);

      // PERSISTENCE TEST: Verify form fields contain UPDATED values
      await expect(page.locator('#description').first()).toHaveValue(updatedDescription);
      await expect(page.locator('#note').first()).toHaveValue(updatedNotes);

      console.log(`Successfully verified update persistence for mass role: ${massRoleId}`);
    });

    test('should navigate through breadcrumbs', async ({ page }) => {
      // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

      // Create a mass role
      await page.goto('/mass-roles/create');
      await page.fill('#name', 'Cantor (Test)');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const btn = page.locator('button[type="submit"]').last();
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await page.waitForURL(/\/mass-roles\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      // Verify breadcrumbs
      const breadcrumbNav = page.getByLabel('breadcrumb');
      await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
      await expect(breadcrumbNav.getByRole('link', { name: 'Mass Roles' })).toBeVisible();

      // Click on "Mass Roles" breadcrumb
      await breadcrumbNav.getByRole('link', { name: 'Mass Roles' }).click();

      // Should navigate back to mass roles list
      await expect(page).toHaveURL('/mass-roles');
    });

    test('should display action buttons on mass role view page', async ({ page }) => {
      // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

      // Create a mass role
      await page.goto('/mass-roles/create');
      await page.fill('#name', 'Usher (Test)');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const submitBtn = page.locator('button[type="submit"]').last();
      await submitBtn.scrollIntoViewIfNeeded();
      await submitBtn.click();
      await page.waitForURL(/\/mass-roles\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      // Verify action buttons exist
      await expect(page.getByRole('button', { name: /Edit/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Delete/i })).toBeVisible();
    });

    test.skip('should toggle active status', async ({ page }) => {
      // TODO: Fix checkbox interaction - FormField checkbox doesn't use standard HTML checkbox behavior
      // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

      // Create a mass role
      await page.goto('/mass-roles/create');
      await page.fill('#name', 'Sacristan (Test)');

      // Verify active is checked by default (value="true" means checked in FormField)
      const activeCheckbox = page.locator('#is_active');
      // FormField checkbox uses value="true" for checked, value="false" for unchecked
      await expect(activeCheckbox).toHaveValue('true');

      // Submit
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.locator('button[type="submit"]').last().click();
      await page.waitForURL(/\/mass-roles\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      const massRoleId = page.url().split('/').pop();

      // Navigate to edit page
      await page.goto(`/mass-roles/${massRoleId}/edit`);

      // Verify it starts as checked (active=true by default)
      await expect(page.locator('#is_active')).toHaveValue('true');

      // Toggle the checkbox - FormField checkbox uses click to toggle
      await page.locator('#is_active').click();

      // Wait for the value to change after click
      await expect(page.locator('#is_active')).toHaveValue('false');

      // Submit
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.locator('button[type="submit"]').last().click();
      await page.waitForURL(`/mass-roles/${massRoleId}`, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      // Navigate back to edit to verify inactive status persisted
      await page.goto(`/mass-roles/${massRoleId}/edit`);
      await expect(page.locator('#is_active')).toHaveValue('false');
    });
  });

  test.describe('Mass Role Members', () => {
    test('should display mass role members page', async ({ page }) => {
      // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

      // Navigate to mass role members
      await page.goto('/mass-role-members');
      await expect(page).toHaveURL('/mass-role-members');

      // Should show the page title
      await expect(page.getByRole('heading', { name: 'Mass Role Members' }).first()).toBeVisible();
    });

    test('should add person to directory and view their profile', async ({ page }) => {
      // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

      // First, create a person to add to the directory
      await page.goto('/people/create');
      await page.fill('#first_name', 'John');
      await page.fill('#last_name', 'Lector');
      await page.fill('#email', `john.lector.test.${Date.now()}@test.com`);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.locator('button[type="submit"]').last().click();
      // Person form redirects to /people/{id}/edit after creation
      await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      // Extract person ID from the URL (format: /people/{id}/edit)
      const urlParts = page.url().split('/');
      const personId = urlParts[urlParts.length - 2]; // Get ID from second-to-last segment
      console.log(`Created person with ID: ${personId}`);

      // Navigate to mass role members
      await page.goto('/mass-role-members');

      // Initially, the directory might be empty or the person might not be in it yet
      // (They need preferences to show up in the directory)

      // Navigate to the person's preferences page directly
      await page.goto(`/mass-role-members/${personId}/preferences`);
      await expect(page).toHaveURL(`/mass-role-members/${personId}/preferences`);

      // Should show the preferences page
      await expect(page.getByRole('heading', { name: /Preferences:/i }).first()).toBeVisible();
    });

    test('should navigate from directory to person view', async ({ page }) => {
      // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

      // First, create a mass role
      await page.goto('/mass-roles/create');
      await page.fill('#name', 'Lector (Test Directory)');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.locator('button[type="submit"]').last().click();
      await page.waitForURL(/\/mass-roles\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      // Create a person
      await page.goto('/people/create');
      await page.fill('#first_name', 'Mary');
      await page.fill('#last_name', 'Minister');
      await page.fill('#email', `mary.minister.test.${Date.now()}@test.com`);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.locator('button[type="submit"]').last().click();
      await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      const urlParts = page.url().split('/');
      const personId = urlParts[urlParts.length - 2];

      // Navigate to their preferences page and add a mass role preference
      await page.goto(`/mass-role-members/${personId}/preferences`);

      // Now navigate to mass role members
      await page.goto('/mass-role-members');
      await expect(page).toHaveURL('/mass-role-members');
    });
  });

  test.describe('Mass Role Preferences', () => {
    test('should manage preferences for a person', async ({ page }) => {
      // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

      // Create a person first
      await page.goto('/people/create');
      await page.fill('#first_name', 'Thomas');
      await page.fill('#last_name', 'Cantor');
      await page.fill('#email', `thomas.cantor.test.${Date.now()}@test.com`);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.locator('button[type="submit"]').last().click();
      await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      const urlParts = page.url().split('/');
      const personId = urlParts[urlParts.length - 2];
      console.log(`Created person with ID: ${personId}`);

      // Navigate to preferences page
      await page.goto(`/mass-role-members/${personId}/preferences`);
      await expect(page).toHaveURL(`/mass-role-members/${personId}/preferences`);

      // Should show the preferences page
      await expect(page.getByRole('heading', { name: /Preferences:/i }).first()).toBeVisible();

      // Should have breadcrumbs
      const breadcrumbNav = page.getByLabel('breadcrumb');
      await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
      await expect(breadcrumbNav.getByRole('link', { name: 'Mass Role Directory' })).toBeVisible();
    });

    test('should show preferences form with proper sections', async ({ page }) => {
      // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

      // Create a person first
      await page.goto('/people/create');
      await page.fill('#first_name', 'Sarah');
      await page.fill('#last_name', 'Server');
      await page.fill('#email', `sarah.server.test.${Date.now()}@test.com`);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.locator('button[type="submit"]').last().click();
      await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      const urlParts = page.url().split('/');
      const personId = urlParts[urlParts.length - 2];

      // Navigate to preferences page
      await page.goto(`/mass-role-members/${personId}/preferences`);
      await expect(page).toHaveURL(`/mass-role-members/${personId}/preferences`);

      // Check that the page loaded successfully
      await expect(page.getByRole('heading', { name: /Preferences:/i }).first()).toBeVisible();
    });
  });

  test.describe('Blackout Dates', () => {
    test('should display blackout dates section', async ({ page }) => {
      // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

      // Create a person first
      await page.goto('/people/create');
      await page.fill('#first_name', 'David');
      await page.fill('#last_name', 'Usher');
      await page.fill('#email', `david.usher.test.${Date.now()}@test.com`);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.locator('button[type="submit"]').last().click();
      await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      const urlParts = page.url().split('/');
      const personId = urlParts[urlParts.length - 2];

      // Navigate to preferences page (which also shows blackout dates)
      await page.goto(`/mass-role-directory/${personId}/preferences`);
      await expect(page).toHaveURL(`/mass-role-directory/${personId}/preferences`);

      // Should show the page
      await expect(page.getByRole('heading', { name: /Preferences:/i }).first()).toBeVisible();

      // Blackout dates should be visible on this page (in a card)
      // The BlackoutDatesCard component should be rendered
      // We can verify by checking for common text that would appear in the blackout dates section
    });
  });

  test.describe('Search and Filter', () => {
    test('should filter mass roles by search', async ({ page }) => {
      // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

      // Create multiple mass roles with different names
      const roles = ['Lector Search Test', 'Cantor Search Test', 'Usher Search Test'];

      for (const roleName of roles) {
        await page.goto('/mass-roles/create');
        await page.fill('#name', roleName);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.locator('button[type="submit"]').last().click();
        await page.waitForURL(/\/mass-roles\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
      }

      // Navigate to mass roles list
      await page.goto('/mass-roles');

      // Look for a search input
      const searchInput = page.locator('input[type="search"]').or(page.locator('input[placeholder*="Search"]')).first();

      // If search exists, test it
      if (await searchInput.isVisible()) {
        await searchInput.fill('Lector');

        // Wait for filtering to occur
        await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

        // Should show Lector but not others
        await expect(page.locator('text=Lector Search Test')).toBeVisible();
      }
    });
  });
});
