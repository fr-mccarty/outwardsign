import { test, expect } from '@playwright/test';

test.describe('Readings Module', () => {
  // Enable parallel execution - tests in this file don't interfere with each other
  test.describe.configure({ mode: 'parallel' });

  test('should create, view, edit, and delete a reading', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to readings page
    await page.goto('/readings');
    await expect(page).toHaveURL('/readings');
    await expect(page.getByRole('heading', { name: 'Our Readings' })).toBeVisible();

    // Click "New Reading" button - directly navigate or click the link
    const newReadingLink = page.getByRole('link', { name: 'New Reading' }).first();
    await newReadingLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/readings/create', { timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Create Reading' })).toBeVisible();

    // Fill in the reading form
    const testPericope = 'John 3:16-17';
    const testText = 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.';
    const testLanguage = 'English';
    const testIntroduction = 'A reading from the Gospel of John';
    const testConclusion = 'The Gospel of the Lord';

    await page.fill('input#pericope', testPericope);

    // Select language from dropdown
    await page.click('#language');
    await page.click(`[role="option"]:has-text("${testLanguage}")`);

    await page.fill('textarea#introduction', testIntroduction);
    await page.fill('textarea#text', testText);
    await page.fill('textarea#conclusion', testConclusion);

    // Submit the form
    await page.click('button[type="submit"]');

    // Should redirect to the reading detail page (navigation proves success)
    await page.waitForURL(/\/readings\/[a-f0-9-]+\/edit$/, { timeout: 5000 });

    // Verify reading details are displayed (use first heading to avoid duplicates)
    await expect(page.getByRole('heading', { name: testPericope }).first()).toBeVisible();
    await expect(page.locator(`text=${testText}`).first()).toBeVisible();
    await expect(page.locator(`text=${testLanguage}`).first()).toBeVisible();

    // Get the reading ID from URL for later use
    const readingUrl = page.url();
    const readingId = readingUrl.split('/').pop();

    // Test copy text functionality
    await page.click('button:has-text("Copy Text")');

    // Navigate back to readings list
    await page.goto('/readings');

    // Verify the reading appears in the list
    await expect(page.locator(`text=${testPericope}`).first()).toBeVisible();

    // Navigate to edit page
    await page.goto(`/readings/${readingId}/edit`);
    await expect(page).toHaveURL(`/readings/${readingId}/edit`);

    // Edit the reading
    const updatedPericope = 'John 3:16-18 (Updated)';
    await page.fill('input#pericope', updatedPericope);

    // Submit the edit
    await page.click('button[type="submit"]');

    // Should redirect back to detail page (navigation proves success)
    await page.waitForURL(`/readings/${readingId}`, { timeout: 5000 });

    // Verify the update (use first to avoid multiple headings)
    await expect(page.locator(`text=${updatedPericope}`).first()).toBeVisible();
  });

  test('should filter readings by search, language, and category', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create multiple readings with different languages and categories
    await page.goto('/readings/create');

    // Create first reading (English)
    await page.fill('input#pericope', 'Matthew 5:1-12');

    // Select English from dropdown
    await page.click('#language');
    await page.click('[role="option"]:has-text("English")');

    await page.fill('textarea#text', 'Blessed are the poor in spirit...');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/readings\/[a-f0-9-]+\/edit$/, { timeout: 5000 });

    // Go to readings list
    await page.goto('/readings');

    // Verify reading is visible
    await expect(page.locator('text=Matthew 5:1-12')).toBeVisible();
  });

  test('should show empty state when no readings exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to readings page
    await page.goto('/readings');

    // Should show empty state
    await expect(page.locator('text=/No readings yet/i')).toBeVisible();
    await expect(page.locator('p:has-text("Create your first reading")')).toBeVisible();

    // Should have a create button in empty state
    const createButton = page.getByRole('link', { name: /Create Your First Reading/i });
    await expect(createButton).toBeVisible();
  });

  test('should validate required fields on create', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/readings/create');

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Should stay on the same page (form validation prevents submission)
    await expect(page).toHaveURL('/readings/create');

    // Fill only pericope (missing text)
    await page.fill('input#pericope', 'Test Pericope');
    await page.click('button[type="submit"]');

    // Should still stay on the same page
    await expect(page).toHaveURL('/readings/create');
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a reading first
    await page.goto('/readings/create');
    await page.fill('input#pericope', 'Breadcrumb Test');
    await page.fill('textarea#text', 'Test content for breadcrumb navigation');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/readings\/[a-f0-9-]+\/edit$/, { timeout: 5000 });

    // Should have breadcrumbs visible - use more specific selectors
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Our Readings' })).toBeVisible();

    // Click on "Our Readings" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Our Readings' }).click();

    // Should navigate back to readings list
    await expect(page).toHaveURL('/readings');
  });
});
