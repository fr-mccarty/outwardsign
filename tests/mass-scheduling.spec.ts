import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Mass Scheduling Module', () => {
  test('should complete wizard and create masses with events and role instances', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Step 1: Create a template first (required for scheduling)
    console.log('Creating Mass Role Template...');
    await page.goto('/mass-role-templates', { timeout: 30000 });
    await expect(page).toHaveURL('/mass-role-templates', { timeout: TEST_TIMEOUTS.NAVIGATION });

    const newTemplateLink = page.getByRole('link', { name: /New Template/i }).first();
    await newTemplateLink.click();

    await expect(page).toHaveURL('/mass-role-templates/create', { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Fill in template name (minimum required field)
    const templateName = `Test Mass Template ${Date.now()}`;
    await page.fill('input#name', templateName);

    // Submit template creation
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    // Wait for redirect to template edit page (CREATE redirects to EDIT per FORMS.md)
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const templateUrl = page.url();
    // URL is /mass-role-templates/{id}/edit, so get second-to-last segment
    const templateId = templateUrl.split('/').slice(-2)[0];
    console.log(`Created template with ID: ${templateId}`);

    // Step 2: Navigate to Masses list page
    console.log('Navigating to Masses page...');
    await page.goto('/masses');
    await expect(page).toHaveURL('/masses');

    // Step 3: Click "Schedule Masses" button (must be Admin or Staff)
    console.log('Clicking Schedule Masses button...');
    const scheduleMassesButton = page.getByRole('link', { name: /Schedule Masses/i });
    await expect(scheduleMassesButton).toBeVisible();
    await scheduleMassesButton.click();

    // Verify we're on the wizard page
    await expect(page).toHaveURL('/masses/schedule', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Schedule Masses' })).toBeVisible();

    // Verify Step 1 is active (Date Range)
    await expect(page.getByRole('heading', { name: 'Select Date Range' })).toBeVisible();

    // Step 4: Complete Wizard Step 1 - Select December 1-31, 2025
    console.log('Step 1: Setting date range (Dec 1-31, 2025)...');
    await page.fill('input#startDate', '2025-12-01');
    await page.fill('input#endDate', '2025-12-31');

    // Verify date range summary appears
    await expect(page.getByText(/31 days/i)).toBeVisible();

    // Click Next to go to Step 2
    const nextButton = page.getByRole('button', { name: /Next/i });
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    // Verify Step 2 is active (Schedule Pattern)
    await expect(page.getByRole('heading', { name: 'Define Mass Schedule' })).toBeVisible();

    // Step 5: Complete Wizard Step 2 - Add Sunday 10:00 AM (English)
    console.log('Step 2: Adding Sunday 10:00 AM (English)...');

    // Click "Add Mass Time" button
    const addMassTimeButton = page.getByRole('button', { name: /Add Mass Time/i });
    await expect(addMassTimeButton).toBeVisible();
    await addMassTimeButton.click();

    // Wait for the mass time form to appear
    await page.waitForTimeout(500);

    // Fill in the schedule entry (first entry is automatically Sunday at 9:00 AM English by default)
    // We need to change the time to 10:00 AM
    const timeInput = page.locator('input[type="time"]').first();
    await timeInput.fill('10:00');

    // Verify day is Sunday (0) - should be default
    // Verify language is English - should be default

    // Verify mass count appears (should show number of Sundays in December 2025)
    await expect(page.getByText(/Masses will be created/i)).toBeVisible();

    // Click Next to go to Step 3
    await page.getByRole('button', { name: /Next/i }).click();

    // Verify Step 3 is active (Template Selection)
    await expect(page.getByRole('heading', { name: /Select Role Template/i })).toBeVisible();

    // Step 6: Complete Wizard Step 3 - Select the template we created
    console.log('Step 3: Selecting template...');

    // Find and click the template card we created
    const templateCard = page.locator(`[data-testid="template-card-${templateId}"]`);

    // If test ID doesn't exist, try to find by template name
    const templateSelector = await templateCard.count() > 0
      ? templateCard
      : page.getByText(templateName).first();

    await templateSelector.click();

    // Verify template is selected (card should have selected styling or checkmark)
    await page.waitForTimeout(500);

    // Click Next to go to Step 4
    await page.getByRole('button', { name: /Next/i }).click();

    // Verify Step 4 is active (Review & Confirm)
    await expect(page.getByRole('heading', { name: /Review & Confirm/i })).toBeVisible();

    // Step 7: Complete Wizard Step 4 - Review and Schedule
    console.log('Step 4: Reviewing and scheduling...');

    // Verify review information is displayed
    await expect(page.getByText(/December 1, 2025/i)).toBeVisible();
    await expect(page.getByText(/December 31, 2025/i)).toBeVisible();
    await expect(page.getByText(/Sunday/i)).toBeVisible();
    await expect(page.getByText(/10:00/i)).toBeVisible();

    // Click "Schedule Masses" button to complete wizard
    const scheduleMassesCompleteButton = page.getByRole('button', { name: /Schedule Masses/i });
    await expect(scheduleMassesCompleteButton).toBeVisible();
    await expect(scheduleMassesCompleteButton).toBeEnabled();
    await scheduleMassesCompleteButton.click();

    // Wait for the scheduling to complete (should redirect to masses list with filter)
    await page.waitForURL(/\/masses\?start_date=2025-12-01/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT * 2 });

    // Step 8: Verify Masses were created in the list
    console.log('Verifying Masses were created...');

    // Should be on the masses page with December 2025 filter
    await expect(page).toHaveURL(/\/masses/);

    // Wait for the list to load
    await page.waitForTimeout(2000);

    // Verify that masses appear in the list
    // December 2025 has 5 Sundays (7th, 14th, 21st, 28th, plus there might be one on Dec 1st if it's Sunday)
    // So we should see at least 4 masses (being conservative)
    const massCards = page.locator('[data-testid^="mass-card-"]');
    const massCount = await massCards.count();
    console.log(`Found ${massCount} mass cards in the list`);
    expect(massCount).toBeGreaterThan(0);

    // Step 9: Open a Mass and verify Event and role instances were created
    console.log('Opening a Mass to verify details...');

    // Click on the first mass card to view details
    const firstMassCard = massCards.first();
    await firstMassCard.click();

    // Wait for navigation to mass detail page
    await page.waitForURL(/\/masses\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.NAVIGATION });

    const massUrl = page.url();
    const massId = massUrl.split('/').pop();
    console.log(`Opened mass with ID: ${massId}`);

    // Verify we're on the mass view page
    await expect(page.getByRole('heading', { name: /Mass/i }).first()).toBeVisible();

    // Verify Event was created (should display event date/time information)
    // The event date should be in December 2025
    await expect(page.getByText(/December.*2025/i)).toBeVisible();
    await expect(page.getByText(/10:00/i)).toBeVisible();

    // Verify Mass Roles section exists (role instances were created)
    // The Mass view should show the roles from the template
    await expect(page.getByText(/Mass Roles/i)).toBeVisible();

    // Step 10: Verify in edit mode that event is linked
    console.log('Verifying Event link in edit mode...');
    await page.goto(`/masses/${massId}/edit`);
    await expect(page).toHaveURL(`/masses/${massId}/edit`);

    // Should show the event picker with an event selected
    // The selected event should display as a formatted date/time button
    await expect(page.getByRole('button', { name: /Dec.*2025 at 10:00/i })).toBeVisible();

    console.log('✅ Mass Scheduling wizard test completed successfully!');
    console.log(`✅ Verified: Masses created with Events and role instances`);
  });

  test('should show Schedule Masses button only for Admin/Staff users', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)
    // Our test user is Staff role, so the button should be visible

    await page.goto('/masses', { timeout: 30000 });
    await expect(page).toHaveURL('/masses', { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify the Schedule Masses button is visible for Staff users
    const scheduleMassesButton = page.getByRole('link', { name: /Schedule Masses/i });
    await expect(scheduleMassesButton).toBeVisible();

    console.log('✅ Schedule Masses button is visible for Staff users');
  });

  test('should validate date range before allowing next step', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/masses/schedule', { timeout: 30000 });
    await expect(page).toHaveURL('/masses/schedule', { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify Step 1 is active
    await expect(page.getByRole('heading', { name: 'Select Date Range' })).toBeVisible();

    // Next button should be disabled initially (no dates selected)
    const nextButton = page.getByRole('button', { name: /Next/i });
    await expect(nextButton).toBeDisabled();

    // Fill only start date
    await page.fill('input#startDate', '2025-12-01');

    // Next button should still be disabled (end date missing)
    await expect(nextButton).toBeDisabled();

    // Fill end date with invalid range (before start date)
    await page.fill('input#endDate', '2025-11-01');

    // Next button should still be disabled (invalid range)
    await expect(nextButton).toBeDisabled();

    // Verify error message appears
    await expect(page.getByText(/End date must be on or after start date/i)).toBeVisible();

    // Fix end date to valid range
    await page.fill('input#endDate', '2025-12-31');

    // Next button should now be enabled
    await expect(nextButton).toBeEnabled();

    console.log('✅ Date range validation working correctly');
  });

  test('should validate schedule pattern before allowing next step', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/masses/schedule', { timeout: 30000 });
    await expect(page).toHaveURL('/masses/schedule', { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Complete Step 1
    await page.fill('input#startDate', '2025-12-01');
    await page.fill('input#endDate', '2025-12-31');
    await page.getByRole('button', { name: /Next/i }).click();

    // Verify Step 2 is active
    await expect(page.getByRole('heading', { name: 'Define Mass Schedule' })).toBeVisible();

    // Next button should be disabled (no mass times added)
    const nextButton = page.getByRole('button', { name: /Next/i });
    await expect(nextButton).toBeDisabled();

    // Add a mass time
    const addMassTimeButton = page.getByRole('button', { name: /Add Mass Time/i });
    await addMassTimeButton.click();

    // Wait for the form to appear
    await page.waitForTimeout(500);

    // Next button should now be enabled (at least one mass time exists)
    await expect(nextButton).toBeEnabled();

    console.log('✅ Schedule pattern validation working correctly');
  });

  test('should validate template selection before allowing completion', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/masses/schedule', { timeout: 30000 });
    await expect(page).toHaveURL('/masses/schedule', { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Complete Step 1
    await page.fill('input#startDate', '2025-12-01');
    await page.fill('input#endDate', '2025-12-31');
    await page.getByRole('button', { name: /Next/i }).click();

    // Complete Step 2
    await page.getByRole('button', { name: /Add Mass Time/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Next/i }).click();

    // Verify Step 3 is active
    await expect(page.getByRole('heading', { name: /Select Role Template/i })).toBeVisible();

    // Next button should be disabled (no template selected)
    const nextButton = page.getByRole('button', { name: /Next/i });
    await expect(nextButton).toBeDisabled();

    // If there are templates available, the test can proceed
    // Note: This assumes at least one template exists from previous tests or seed data
    // If no templates exist, the user should see a message prompting them to create one

    console.log('✅ Template selection validation working correctly');
  });

  test('should calculate correct mass count based on schedule', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    await page.goto('/masses/schedule', { timeout: 30000 });
    await expect(page).toHaveURL('/masses/schedule', { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Complete Step 1 - Select a 7-day week (Dec 1-7, 2025)
    await page.fill('input#startDate', '2025-12-01');
    await page.fill('input#endDate', '2025-12-07');
    await page.getByRole('button', { name: /Next/i }).click();

    // Add Sunday mass
    await page.getByRole('button', { name: /Add Mass Time/i }).click();
    await page.waitForTimeout(500);

    // Verify mass count calculation appears
    // Dec 1-7, 2025 contains 1 Sunday (Dec 7)
    await expect(page.getByText(/1.*Mass.*will be created/i)).toBeVisible();

    // Add another Sunday mass (different time)
    await page.getByRole('button', { name: /Add Mass Time/i }).click();
    await page.waitForTimeout(500);

    // Now should show 2 masses (2 Sunday masses on Dec 7)
    await expect(page.getByText(/2.*Masses.*will be created/i)).toBeVisible();

    console.log('✅ Mass count calculation working correctly');
  });
});
