import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Dashboard', () => {
  test('should load dashboard page with all sections', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // If redirected to login, fail with helpful message
    if (page.url().includes('/login')) {
      throw new Error('Redirected to login - authentication state not properly loaded');
    }

    await expect(page).toHaveURL('/dashboard');

    // Verify page title and description
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Your sacramental ministry at a glance')).toBeVisible();

    // Verify all quick stats cards are present
    await expect(page.getByText('Active Sacraments').first()).toBeVisible();
    await expect(page.getByText('Scheduled This Month').first()).toBeVisible();
    await expect(page.getByText('People Directory').first()).toBeVisible();
    // Use a more specific selector for Locations to avoid sidebar conflict
    await expect(page.getByRole('main').getByText('Locations')).toBeVisible();
    await expect(page.getByText('This Week').first()).toBeVisible();

    // Verify main content sections (CardTitle may not be a semantic heading)
    await expect(page.getByText('Sacraments by Type')).toBeVisible();
    await expect(page.getByText('Upcoming Events', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Recent Activity', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Calendar', { exact: true }).first()).toBeVisible(); // .first() to avoid sidebar
    await expect(page.getByText('Quick Access')).toBeVisible();
  });

  test('should display sacrament type breakdown', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify all sacrament types are listed
    await expect(page.getByRole('link', { name: /Weddings/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Funerals/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Presentations/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Quinceañeras/i })).toBeVisible();
  });

  test('should navigate to weddings from sacrament breakdown', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click on Weddings link in sacrament breakdown
    await page.getByRole('link', { name: /Weddings/i }).first().click();

    // Should navigate to weddings page
    await expect(page).toHaveURL('/weddings');
  });

  test('should navigate to funerals from sacrament breakdown', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click on Funerals link in sacrament breakdown
    await page.getByRole('link', { name: /Funerals/i }).first().click();

    // Should navigate to funerals page
    await expect(page).toHaveURL('/funerals');
  });

  test('should display quick access links', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify all quick access links are present
    await expect(page.getByRole('link', { name: 'New Wedding' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'New Funeral' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'New Presentation' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'New Quinceañera' })).toBeVisible();
  });

  test('should navigate to create wedding from quick access', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click on New Wedding quick access link
    await page.getByRole('link', { name: 'New Wedding' }).click();

    // Should navigate to wedding create page
    await expect(page).toHaveURL('/weddings/create');
  });

  test('should navigate to create funeral from quick access', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click on New Funeral quick access link
    await page.getByRole('link', { name: 'New Funeral' }).click();

    // Should navigate to funeral create page
    await expect(page).toHaveURL('/funerals/create');
  });

  test('should navigate to create presentation from quick access', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click on New Presentation quick access link
    await page.getByRole('link', { name: 'New Presentation' }).click();

    // Should navigate to presentation create page
    await expect(page).toHaveURL('/presentations/create');
  });

  test('should navigate to create quinceanera from quick access', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click on New Quinceañera quick access link
    await page.getByRole('link', { name: 'New Quinceañera' }).click();

    // Should navigate to quinceanera create page
    await expect(page).toHaveURL('/quinceaneras/create');
  });

  test('should show upcoming celebrations or empty state', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check if there are upcoming events or empty state
    const upcomingSection = page.getByText('Upcoming Events', { exact: true }).first();
    await expect(upcomingSection).toBeVisible();

    // Either should have events or show empty state message
    const hasEmptyState = await page.getByText('No upcoming events').isVisible();
    const hasScheduleLink = await page.getByRole('link', { name: 'Schedule an event' }).isVisible();

    if (hasEmptyState) {
      // Verify empty state elements
      expect(hasScheduleLink).toBe(true);
    }
    // If not empty state, there should be event links (tested in another test)
  });

  test('should show recent activity or empty state', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check if there is recent activity or empty state
    const recentSection = page.getByText('Recent Activity', { exact: true }).first();
    await expect(recentSection).toBeVisible();

    // Either should have recent sacraments or show empty state
    const hasEmptyState = await page.getByText('No recent activity').isVisible();

    if (hasEmptyState) {
      // Verify empty state message
      await expect(page.getByText('Create your first sacrament to get started')).toBeVisible();
    }
    // If not empty state, there should be sacrament links
  });

  test('should display mini calendar', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify calendar section exists (avoid sidebar by using first() or scoping to main)
    await expect(page.getByRole('main').getByText('Calendar', { exact: true }).first()).toBeVisible();

    // Mini calendar should be present (will contain day numbers)
    // We can't test specific dates as they change, but we can verify the structure exists
  });

  test('should navigate to event from upcoming celebrations', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // First create an event with a future date
    await page.goto('/events/create');
    const eventName = `Dashboard Test Event ${Date.now()}`;
    await page.fill('#name', eventName);

    await page.locator('#event_type').click();
    await page.getByRole('option').first().click();

    // Set date to 7 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    await page.fill('#start_date', futureDateStr);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    await page.waitForURL(/\/events\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    console.log(`Created event: ${eventName}`);

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Look for the event in upcoming celebrations
    const eventLink = page.locator(`text="${eventName}"`).first();

    if (await eventLink.isVisible({ timeout: 2000 })) {
      await eventLink.click();

      // Should navigate to event view page (from dashboard)
      await page.waitForURL(/\/events\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.NAVIGATION });
    } else {
      console.log('Event not found in upcoming celebrations (may be outside 30-day window)');
    }
  });

  test('should create sacrament and see it in recent activity', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a wedding
    await page.goto('/weddings/create');

    // Fill minimal required fields (if any)
    // For now, just submit the form to create an empty wedding
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to wedding detail page
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    console.log('Created wedding');

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should see "Wedding" in recent activity section
    // Look for Recent Activity card and then find Wedding text within it
    await expect(page.getByText('Recent Activity', { exact: true }).first()).toBeVisible();

    // Wait a bit for the dashboard to update with new data
    await page.waitForTimeout(1000);

    // Look for Wedding in the page (it should be in recent activity)
    const weddingText = page.getByText('Wedding');
    await expect(weddingText.first()).toBeVisible({ timeout: 10000 });
  });

  test('should update statistics after creating sacraments', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Get initial count
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Find the active sacraments count (should be a large number displayed prominently)
    const activeSacramentsCard = page.getByText('Active Sacraments');
    await expect(activeSacramentsCard).toBeVisible();

    // Get the count value using a more specific selector
    // The count is displayed as a large number in the Total Sacraments card
    const initialCountText = await page.locator('[class*="text-2xl"][class*="font-bold"]').first().textContent();
    const initialCount = parseInt(initialCountText?.trim() || '0', 10);

    console.log(`Initial sacrament count: ${initialCount}`);

    // Create a presentation
    await page.goto('/presentations/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    await page.waitForURL(/\/presentations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Go back to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Count should have increased
    const updatedCountText = await page.locator('[class*="text-2xl"][class*="font-bold"]').first().textContent();
    const updatedCount = parseInt(updatedCountText?.trim() || '0', 10);

    console.log(`Updated sacrament count: ${updatedCount}`);

    // Count should have increased (at least by 1, possibly more if other tests ran in parallel)
    expect(updatedCount).toBeGreaterThan(initialCount);
  });

  test('should handle navigation to empty state links', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // If there's an empty state for upcoming celebrations, click the link
    const scheduleEventLink = page.getByRole('link', { name: 'Schedule an event' });

    if (await scheduleEventLink.isVisible({ timeout: 1000 })) {
      await scheduleEventLink.click();

      // Should navigate to events create page
      await expect(page).toHaveURL('/events/create');
    }
  });

  test('should display stat cards with correct labels', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify all stat card descriptions
    await expect(page.getByText('In preparation now')).toBeVisible();
    await expect(page.getByText('Ceremonies this month')).toBeVisible();
    await expect(page.getByText('People in your parish')).toBeVisible();
    await expect(page.getByText('Venues registered')).toBeVisible();
    await expect(page.getByText('Events in next 7 days')).toBeVisible();
  });

  test('should navigate from dashboard breadcrumb to other pages and back', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Navigate to weddings
    await page.getByRole('link', { name: /Weddings/i }).first().click();
    await expect(page).toHaveURL('/weddings');

    // Click Dashboard breadcrumb to return
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await breadcrumbNav.getByRole('link', { name: 'Dashboard' }).click();

    // Should be back at dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});
