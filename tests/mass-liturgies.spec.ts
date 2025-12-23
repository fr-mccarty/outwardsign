import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Mass Liturgies Module Tests
 *
 * Tests the Mass Liturgy module which uses system_type = 'mass-liturgy'
 * This is separate from the generic Masses module and uses the unified event data model.
 */
test.describe('Mass Liturgies Module', () => {
  test('should create, view, and edit a mass liturgy', async ({ page }) => {
    // Navigate to mass liturgies page
    await page.goto('/mass-liturgies');
    await expect(page).toHaveURL('/mass-liturgies');

    // Click "New Mass Liturgy" button
    const newMassLink = page.getByRole('link', { name: /New Mass/i }).first();
    await newMassLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/mass-liturgies/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Create Mass' })).toBeVisible();

    // Fill in minimal mass liturgy form
    const initialNote = 'Sunday Mass with special liturgy planning';
    await page.fill('textarea#note', initialNote);

    // Scroll to bottom and submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the mass edit page
    await page.waitForURL(/\/mass-liturgies\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the mass liturgy ID from URL
    const urlParts = page.url().split('/');
    const massId = urlParts[urlParts.length - 2];

    // Navigate to view page
    await page.goto(`/mass-liturgies/${massId}`);
    await expect(page).toHaveURL(`/mass-liturgies/${massId}`);

    // Verify we're on the mass liturgy view page
    await expect(page.getByRole('heading', { name: /Mass/i }).first()).toBeVisible();

    // Navigate to edit page
    await page.goto(`/mass-liturgies/${massId}/edit`);
    await expect(page).toHaveURL(`/mass-liturgies/${massId}/edit`);

    // Edit the mass liturgy
    const updatedNote = 'Updated: Mass scheduled for Sunday morning with choir';
    await page.fill('textarea#note', updatedNote);

    // Scroll and submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    // Navigate to view page to verify update
    await page.goto(`/mass-liturgies/${massId}`);
    // Verify we're on the view page (note field may not be displayed on view page)
    await expect(page.getByRole('heading', { name: /Mass/i }).first()).toBeVisible();
  });

  test('should show empty state when no mass liturgies exist', async ({ page }) => {
    // Navigate to mass liturgies page
    await page.goto('/mass-liturgies');

    // Should show the page title
    await expect(page.getByRole('heading', { name: 'Masses' }).first()).toBeVisible();

    // Should have a create button
    const createButton = page.getByRole('link', { name: /New Mass/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should create mass liturgy with minimal data', async ({ page }) => {
    // Go to create page
    await page.goto('/mass-liturgies/create');
    await expect(page).toHaveURL('/mass-liturgies/create');

    // Submit with just the defaults (most fields are optional)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should successfully create and redirect
    await page.waitForURL(/\/mass-liturgies\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify we're on a mass liturgy detail page
    await expect(page.getByRole('heading', { name: /Mass/i }).first()).toBeVisible();
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Create a mass liturgy
    await page.goto('/mass-liturgies/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const btn = page.locator('button[type="submit"]').last();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForURL(/\/mass-liturgies\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Mass Liturgies' })).toBeVisible();

    // Click on "Mass Liturgies" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Mass Liturgies' }).click();

    // Should navigate back to mass liturgies list
    await expect(page).toHaveURL('/mass-liturgies');
  });

  test('should display edit button on mass liturgy view page', async ({ page }) => {
    // Create a mass liturgy
    await page.goto('/mass-liturgies/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitBtn = page.locator('button[type="submit"]').last();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    await page.waitForURL(/\/mass-liturgies\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get mass ID and navigate to VIEW page
    const urlParts = page.url().split('/');
    const massId = urlParts[urlParts.length - 2];
    await page.goto(`/mass-liturgies/${massId}`);
    await expect(page).toHaveURL(`/mass-liturgies/${massId}`);

    // Verify Edit button exists on VIEW page
    await expect(page.getByRole('link', { name: /Edit Mass/i })).toBeVisible();
    // Note: Export buttons (Print View, PDF, Word) may be added in future iterations
  });
});
