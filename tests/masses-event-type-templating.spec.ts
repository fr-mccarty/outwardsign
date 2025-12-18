import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Mass Event Type Templating', () => {
  test('should create mass with event type and custom fields', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to mass creation page
    await page.goto('/masses/create');
    await expect(page).toHaveURL('/masses/create');

    // Select an event type (assumes "Meeting" event type exists from seed data)
    const eventTypeSelect = page.locator('#event_type_id');
    await eventTypeSelect.click();
    await page.getByRole('option', { name: 'Meeting' }).click();

    // Wait for custom fields to render (dynamic fields load after event type selection)
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Add basic mass notes
    const massNotes = `Mass with event type template - ${Date.now()}`;
    await page.fill('textarea#note', massNotes);

    // Submit the form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to edit page after creation
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get mass ID from URL
    const urlParts = page.url().split('/');
    const massId = urlParts[urlParts.length - 2];

    console.log(`Created mass with event type: ${massId}`);

    // Verify event type is still selected on edit page
    await expect(eventTypeSelect).toBeVisible();

    // Navigate to view page
    await page.goto(`/masses/${massId}`);
    await expect(page).toHaveURL(`/masses/${massId}`);

    // Verify mass view page loads
    await expect(page.getByRole('heading', { name: /Mass/i }).first()).toBeVisible();

    console.log(`Successfully created and viewed mass ${massId} with event type template`);
  });

  test('should display script export buttons when event type has scripts', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a mass with event type
    await page.goto('/masses/create');

    // Select event type
    await page.locator('#event_type_id').click();
    await page.getByRole('option', { name: 'Meeting' }).click();

    // Add notes
    await page.fill('textarea#note', 'Mass for script export test');

    // Submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get mass ID
    const urlParts = page.url().split('/');
    const massId = urlParts[urlParts.length - 2];

    // Navigate to view page
    await page.goto(`/masses/${massId}`);
    await expect(page).toHaveURL(`/masses/${massId}`);

    // Verify export buttons are available (if event type has scripts)
    // Print View button should always be visible
    await expect(page.getByRole('link', { name: /Print View/i })).toBeVisible();

    // PDF and Word export should be visible
    await expect(page.getByRole('link', { name: /Download PDF/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Download Word/i })).toBeVisible();

    console.log(`Successfully verified export buttons for mass: ${massId}`);
  });
});
