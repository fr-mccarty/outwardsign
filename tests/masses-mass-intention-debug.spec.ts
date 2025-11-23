import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Mass Intention Card - Debug Test', () => {
  test('should debug mass intention card visibility', async ({ page }) => {
    // Create a mass
    await page.goto('/masses/create');
    await page.fill('textarea#note', `Debug test ${Date.now()}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    // Wait for redirect
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    const massId = page.url().split('/')[page.url().split('/').length - 2];
    console.log(`\n=== Created mass: ${massId} ===`);
    console.log(`URL: ${page.url()}`);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    // Debug: Check page content
    const pageContent = await page.content();
    console.log(`\nPage contains "Mass Intention": ${pageContent.includes('Mass Intention')}`);
    console.log(`Page contains "Link Mass Intention": ${pageContent.includes('Link Mass Intention')}`);
    console.log(`Page contains "isEditing": ${pageContent.includes('isEditing')}`);

    // Debug: List all headings on the page
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    console.log(`\nAll headings on page:`, headings);

    // Debug: List all cards on the page
    const cards = await page.locator('[class*="card"]').count();
    console.log(`\nNumber of card elements: ${cards}`);

    // Debug: Check if we're on edit page
    const url = page.url();
    console.log(`\nCurrent URL: ${url}`);
    console.log(`URL ends with /edit: ${url.endsWith('/edit')}`);

    // Try to find the Mass Intention heading with various selectors
    const massIntentionHeading1 = await page.locator('text=Mass Intention').count();
    const massIntentionHeading2 = await page.getByRole('heading', { name: 'Mass Intention' }).count();
    const massIntentionHeading3 = await page.locator('h3:has-text("Mass Intention")').count();

    console.log(`\nMass Intention heading count (text=): ${massIntentionHeading1}`);
    console.log(`Mass Intention heading count (getByRole): ${massIntentionHeading2}`);
    console.log(`Mass Intention heading count (h3:has-text): ${massIntentionHeading3}`);

    // This test is just for debugging, so we'll mark it as passing
    expect(true).toBe(true);
  });
});
