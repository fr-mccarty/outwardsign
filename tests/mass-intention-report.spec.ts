import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Mass Intention Report', () => {
  /**
   * Helper function to create a mass with an event on a specific date
   * Returns the mass ID
   */
  async function createMassWithDate(page: any, date: string): Promise<string> {
    // Navigate to mass creation page
    await page.goto('/mass-liturgies/create');
    await expect(page).toHaveURL('/mass-liturgies/create');

    // Click "Select Event" button to open EventPicker
    await page.getByRole('button', { name: /Select Event/i }).click();

    // Wait for Event Picker dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.locator('[role="dialog"]').getByRole('heading', { name: /Select Event/i })).toBeVisible();

    // Form should auto-open when no event is selected
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Fill in event details with the specified date
    const eventName = `Holy Mass ${Date.now()}`;
    await page.locator('[role="dialog"]').getByLabel('Name').fill(eventName);
    await page.locator('[role="dialog"]').getByLabel('Date').fill(date);

    // Time field
    await page.locator('[role="dialog"]').locator('input#start_time').fill('10:00');

    // Submit the event creation
    await page.locator('[role="dialog"]').getByRole('button', { name: /Save Event/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Event picker should close
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    // Event should be auto-selected - verify by checking the event picker button is visible
    const eventPickerButton = page.getByTestId('mass-event-selected-value');
    await expect(eventPickerButton).toBeVisible();
    // Event date will be displayed in the button (format varies, so just check it exists)

    // Add notes to the mass
    const massNotes = `Mass for ${date}`;
    await page.fill('textarea#note', massNotes);

    // Submit the mass form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for redirect (mass form redirects to edit page after creation)
    await page.waitForURL(/\/mass-liturgies\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the mass ID from URL (remove '/edit' from the end)
    const massUrl = page.url();
    const massId = massUrl.split('/').slice(-2, -1)[0];
    console.log(`Created mass with ID: ${massId} for date: ${date}`);

    return massId as string;
  }

  /**
   * Helper function to create a mass intention for a specific mass
   * Returns the mass intention ID
   */
  async function createMassIntentionForMass(page: any, massId: string, intentionText: string): Promise<string> {
    // Navigate to mass intention creation page
    await page.goto('/mass-intentions/create');
    await expect(page).toHaveURL('/mass-intentions/create');

    // Fill in the intention text
    await page.fill('#mass_offered_for', intentionText);

    // Click "Assigned Mass" button to open MassPicker
    const selectMassButton = page.getByTestId('assigned-mass-trigger');
    await expect(selectMassButton).toBeVisible();
    await selectMassButton.click();

    // Wait for Mass Picker dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Wait for the loading spinner to appear (masses start loading)
    const loadingSpinner = page.locator('[role="dialog"]').locator('.animate-spin').first();
    try {
      await loadingSpinner.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.SHORT });
      // Then wait for it to disappear (loading complete)
      await loadingSpinner.waitFor({ state: 'detached', timeout: TEST_TIMEOUTS.TOAST });
    } catch {
      // If spinner never appears, masses may already be loaded or cached
      console.log('Loading spinner not detected, proceeding...');
    }
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK); // Let dialog fully render after loading

    // Try to find and select the specific mass by its card using the data-testid
    const massCard = page.locator(`[data-testid="mass-picker-dialog-${massId}"]`).first();
    const massCardExists = await massCard.count() > 0;

    if (massCardExists) {
      console.log(`✓ Found mass card for ${massId}, clicking...`);
      // Force click to bypass pointer interception from child elements
      await massCard.click({ force: true });
      await page.waitForTimeout(TEST_TIMEOUTS.QUICK);
    } else {
      // Debug: Log how many mass cards are visible and which page we're on
      const allMassCards = page.locator('[role="dialog"]').locator('[data-testid^="mass-picker-dialog-"]');
      const massCardCount = await allMassCards.count();
      const pageInfo = page.locator('[role="dialog"]').getByText(/Page \d+ of \d+/);
      const pageInfoText = await pageInfo.count() > 0 ? await pageInfo.textContent() : 'No pagination info';
      console.log(`✗ Mass card ${massId} not found. Visible mass cards: ${massCardCount}. ${pageInfoText}`);
      console.log(`⚠️  This will cause duplicate key constraint error if multiple intentions select the same fallback mass.`);

      // Fallback: Click the first mass card
      const firstMassCard = allMassCards.first();
      const firstCardExists = await firstMassCard.count() > 0;

      if (firstCardExists) {
        // Log which mass we're falling back to
        const firstCardId = await firstMassCard.getAttribute('data-testid');
        console.log(`↪️  Falling back to first available mass: ${firstCardId}`);
        // Force click to bypass pointer interception from child elements
        await firstMassCard.click({ force: true });
        await page.waitForTimeout(TEST_TIMEOUTS.QUICK);
      } else {
        console.log('✗ No mass cards found at all, closing dialog without selecting');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(TEST_TIMEOUTS.QUICK);
      }
    }

    // Wait for dialog to close - force close all dialogs if needed
    try {
      await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: TEST_TIMEOUTS.DIALOG });
    } catch {
      console.log('Dialog(s) still open, force closing with Escape...');
      const dialogCount = await page.locator('[role="dialog"]').count();
      // Press Escape multiple times to close nested dialogs
      for (let i = 0; i < dialogCount; i++) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(TEST_TIMEOUTS.QUICK);
      }
      // Verify all dialogs are closed
      await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: TEST_TIMEOUTS.SHORT });
    }

    // Verify a mass was selected by checking if the mass picker shows a selected value
    const massPickerValue = page.getByTestId('assigned-mass-selected-value');
    if (await massPickerValue.count() > 0) {
      await expect(massPickerValue).toBeVisible();
      console.log('Mass successfully selected');
    } else {
      console.log('Warning: No mass was selected');
    }

    // Submit the mass intention form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for redirect to mass intention edit page (form redirects to edit page after creation)
    await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the mass intention ID from URL (remove '/edit' from the end)
    const intentionUrl = page.url();
    const intentionId = intentionUrl.split('/').slice(-2, -1)[0];
    console.log(`Created mass intention with ID: ${intentionId} for mass: ${massId}`);

    return intentionId as string;
  }

  test('should filter mass intentions by date range and display correct results in report', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Define test data: Create mass intentions across different months
    // We'll create 7 mass intentions:
    // - 2 in January 2025 (inside range)
    // - 3 in February 2025 (inside range)
    // - 2 in April 2025 (outside range)

    console.log('Creating masses and mass intentions for date range test...');

    // Create masses in REVERSE chronological order to ensure they appear first in picker
    // (picker orders by created_at DESC, so most recently created = first in list)
    const mass7Id = await createMassWithDate(page, '2025-04-25'); // Apr 25 (outside range)
    const mass6Id = await createMassWithDate(page, '2025-04-10'); // Apr 10 (outside range)
    const mass5Id = await createMassWithDate(page, '2025-02-28'); // Feb 28
    const mass4Id = await createMassWithDate(page, '2025-02-14'); // Feb 14
    const mass3Id = await createMassWithDate(page, '2025-02-05'); // Feb 5
    const mass2Id = await createMassWithDate(page, '2025-01-28'); // Jan 28
    const mass1Id = await createMassWithDate(page, '2025-01-15'); // Jan 15

    // Create mass intentions for each mass
    const intention1Text = 'In memory of John Smith - Jan 15';
    const intention2Text = 'For the repose of Mary Johnson - Jan 28';
    const intention3Text = 'In thanksgiving for graces received - Feb 5';
    const intention4Text = 'For the souls in purgatory - Feb 14';
    const intention5Text = 'In memory of Robert Martinez - Feb 28';
    const intention6Text = 'For healing of Sarah Williams - Apr 10';
    const intention7Text = 'In memory of Michael Brown - Apr 25';

    await createMassIntentionForMass(page, mass1Id, intention1Text);
    await createMassIntentionForMass(page, mass2Id, intention2Text);
    await createMassIntentionForMass(page, mass3Id, intention3Text);
    await createMassIntentionForMass(page, mass4Id, intention4Text);
    await createMassIntentionForMass(page, mass5Id, intention5Text);
    await createMassIntentionForMass(page, mass6Id, intention6Text);
    await createMassIntentionForMass(page, mass7Id, intention7Text);

    console.log('Created 7 mass intentions across different dates');

    // Navigate to mass intention report page
    await page.goto('/mass-intentions/report');
    await expect(page).toHaveURL('/mass-intentions/report', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Mass Intentions Report' })).toBeVisible();

    // Set date range: January 1 - February 28, 2025
    // This should include 5 mass intentions and exclude 2
    const startDate = '2025-01-01';
    const endDate = '2025-02-28';

    console.log(`Setting date range: ${startDate} to ${endDate}`);

    // Fill in start date
    const startDateInput = page.getByLabel('Start Date');
    await startDateInput.fill(startDate);

    // Fill in end date
    const endDateInput = page.getByLabel('End Date');
    await endDateInput.fill(endDate);

    // Click "Generate Report" button
    const generateButton = page.getByRole('button', { name: /Generate Report/i });
    await generateButton.click();

    // Wait for report to load
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Verify that the report displays the correct mass intentions (5 in range)
    // Intentions IN RANGE (should be visible)
    await expect(page.getByText(intention1Text)).toBeVisible(); // Jan 15
    await expect(page.getByText(intention2Text)).toBeVisible(); // Jan 28
    await expect(page.getByText(intention3Text)).toBeVisible(); // Feb 5
    await expect(page.getByText(intention4Text)).toBeVisible(); // Feb 14
    await expect(page.getByText(intention5Text)).toBeVisible(); // Feb 28

    // Intentions OUTSIDE RANGE (should NOT be visible)
    await expect(page.getByText(intention6Text)).not.toBeVisible(); // Apr 10
    await expect(page.getByText(intention7Text)).not.toBeVisible(); // Apr 25

    console.log('Verified that only mass intentions within date range are displayed');

    // Test the print functionality
    console.log('Testing print view...');

    // Click "Print View" button
    const printButton = page.getByRole('button', { name: /Print View/i });
    await expect(printButton).toBeVisible();

    // Click print button and handle the new window/tab
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      printButton.click()
    ]);

    // Wait for the print page to load
    await newPage.waitForLoadState('networkidle', { timeout: TEST_TIMEOUTS.EXTENDED });

    // Verify the print page URL contains the date parameters
    const printUrl = newPage.url();
    expect(printUrl).toContain('/print/mass-intentions/report');
    expect(printUrl).toContain(`startDate=${startDate}`);
    expect(printUrl).toContain(`endDate=${endDate}`);

    console.log(`Print page opened: ${printUrl}`);

    // Verify that the print page displays the correct intentions
    await expect(newPage.getByText(intention1Text)).toBeVisible(); // Jan 15
    await expect(newPage.getByText(intention2Text)).toBeVisible(); // Jan 28
    await expect(newPage.getByText(intention3Text)).toBeVisible(); // Feb 5
    await expect(newPage.getByText(intention4Text)).toBeVisible(); // Feb 14
    await expect(newPage.getByText(intention5Text)).toBeVisible(); // Feb 28

    // Intentions outside range should NOT appear in print view
    await expect(newPage.getByText(intention6Text)).not.toBeVisible(); // Apr 10
    await expect(newPage.getByText(intention7Text)).not.toBeVisible(); // Apr 25

    // Verify print view shows date range in header
    await expect(newPage.getByText(/January 1, 2025.*February 28, 2025/i)).toBeVisible();

    // Verify total count in print view (should show 5 intentions)
    await expect(newPage.getByText(/Total Intentions: 5/i)).toBeVisible();

    console.log('Print view verified successfully');

    // Close the print page
    await newPage.close();

    console.log('Mass Intention Report test completed successfully');
  });

  test('should show empty state when no mass intentions match date range', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to mass intention report page
    await page.goto('/mass-intentions/report');
    await expect(page).toHaveURL('/mass-intentions/report');

    // Set a date range far in the past where no mass intentions exist
    const startDate = '2020-01-01';
    const endDate = '2020-01-31';

    await page.getByLabel('Start Date').fill(startDate);
    await page.getByLabel('End Date').fill(endDate);

    // Click "Generate Report" button
    await page.getByRole('button', { name: /Generate Report/i }).click();

    // Wait for report to load
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Verify empty state message is displayed
    await expect(page.getByText(/No Mass Intentions Found/i)).toBeVisible();
    await expect(page.getByText(/No Mass Intentions were found for the selected date range/i)).toBeVisible();

    console.log('Empty state verified successfully');
  });

  test('should validate date inputs and show error for invalid date range', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to mass intention report page
    await page.goto('/mass-intentions/report');
    await expect(page).toHaveURL('/mass-intentions/report');

    // Set end date BEFORE start date (invalid)
    const startDate = '2025-02-28';
    const endDate = '2025-01-01';

    await page.getByLabel('Start Date').fill(startDate);
    await page.getByLabel('End Date').fill(endDate);

    // Click "Generate Report" button
    await page.getByRole('button', { name: /Generate Report/i }).click();

    // Wait a moment for validation
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Should show error message (toast notification or inline error)
    // The component shows a toast with "Start date must be before end date"
    await expect(page.getByText(/Start date must be before end date/i)).toBeVisible();

    console.log('Date validation error verified successfully');
  });

  test('should generate report with no date filters to show all mass intentions', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    console.log('Creating mass intentions for "show all" test...');

    // Create masses in reverse order to ensure they appear first in picker
    const mass2Id = await createMassWithDate(page, '2025-06-20');
    const mass1Id = await createMassWithDate(page, '2025-05-15');

    const intention1Text = 'For all souls - May';
    const intention2Text = 'For peace - June';

    await createMassIntentionForMass(page, mass1Id, intention1Text);
    await createMassIntentionForMass(page, mass2Id, intention2Text);

    // Navigate to report page
    await page.goto('/mass-intentions/report');
    await expect(page).toHaveURL('/mass-intentions/report');

    // Leave both date fields empty
    await page.getByLabel('Start Date').fill('');
    await page.getByLabel('End Date').fill('');

    // Generate report without date filters (should show ALL mass intentions)
    const generateButton = page.getByRole('button', { name: /Generate Report/i });
    await generateButton.click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Both intentions should be visible (no date filtering applied)
    await expect(page.getByText(intention1Text)).toBeVisible();
    await expect(page.getByText(intention2Text)).toBeVisible();

    // Metadata should show "All Mass Intentions"
    await expect(page.getByText(/All Mass Intentions/i)).toBeVisible();

    console.log('Generate report without date filters test completed successfully');
  });

  test('should filter mass intentions by narrow date range (single day)', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    console.log('Creating mass intention for single-day date range test...');

    // Create a mass on a specific date
    const testDate = '2025-03-15';
    const massId = await createMassWithDate(page, testDate);

    // Create a mass intention for this mass
    const intentionText = 'For peace in the world - March 15';
    await createMassIntentionForMass(page, massId, intentionText);

    // Navigate to report page
    await page.goto('/mass-intentions/report');
    await expect(page).toHaveURL('/mass-intentions/report');

    // Set date range to a single day
    await page.getByLabel('Start Date').fill(testDate);
    await page.getByLabel('End Date').fill(testDate);

    // Generate report
    await page.getByRole('button', { name: /Generate Report/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Verify the mass intention appears
    await expect(page.getByText(intentionText)).toBeVisible();

    // Verify count shows 1 intention
    // The component shows "Found 1 mass intention(s)" in a toast
    // We can also verify in the table that only one row appears
    const tableRows = page.locator('tbody tr');
    await expect(tableRows).toHaveCount(1);

    console.log('Single-day date range test completed successfully');
  });

  test('should calculate and display total stipends correctly', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    console.log('Creating mass intentions with stipends for totals test...');

    // Create masses in reverse order to ensure they appear first in picker
    await createMassWithDate(page, '2025-07-20');
    await createMassWithDate(page, '2025-07-15');
    await createMassWithDate(page, '2025-07-10');

    // Create mass intentions with specific stipends
    // Intention 1: $10.00
    await page.goto('/mass-intentions/create');
    await page.fill('#mass_offered_for', 'Intention 1 - $10');
    await page.fill('#stipend_amount', '10.00');
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Intention 2: $25.50
    await page.goto('/mass-intentions/create');
    await page.fill('#mass_offered_for', 'Intention 2 - $25.50');
    await page.fill('#stipend_amount', '25.50');
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Intention 3: $15.00
    await page.goto('/mass-intentions/create');
    await page.fill('#mass_offered_for', 'Intention 3 - $15');
    await page.fill('#stipend_amount', '15.00');
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Navigate to report page
    await page.goto('/mass-intentions/report');
    await expect(page).toHaveURL('/mass-intentions/report');

    // Set date range to include all three intentions
    await page.getByLabel('Start Date').fill('2025-07-01');
    await page.getByLabel('End Date').fill('2025-07-31');

    // Generate report
    await page.getByRole('button', { name: /Generate Report/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Verify total stipends: $10.00 + $25.50 + $15.00 = $51.00
    // The total should appear in the summary section
    await expect(page.getByText(/Total Stipends:/i)).toBeVisible();
    await expect(page.getByText(/\$51\.00/)).toBeVisible();

    console.log('Stipend totals calculation test completed successfully');
  });

  test('should disable export buttons until report is generated', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to report page
    await page.goto('/mass-intentions/report');
    await expect(page).toHaveURL('/mass-intentions/report');

    // Print and CSV buttons should be disabled initially
    const printButton = page.getByRole('button', { name: /Print View/i });
    const csvButton = page.getByRole('button', { name: /CSV/i });

    await expect(printButton).toBeDisabled();
    await expect(csvButton).toBeDisabled();

    // Generate a report
    await page.getByLabel('Start Date').fill('2025-01-01');
    await page.getByLabel('End Date').fill('2025-12-31');
    await page.getByRole('button', { name: /Generate Report/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // After generating report, buttons should be enabled
    await expect(printButton).toBeEnabled();
    await expect(csvButton).toBeEnabled();

    console.log('Export button disabled states test completed successfully');
  });

  test('should download CSV file with correct filename and content', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    console.log('Creating mass intentions for CSV download test...');

    // Create a mass and mass intention
    const testDate = '2025-08-10';
    const massId = await createMassWithDate(page, testDate);
    const intentionText = 'For CSV export test';
    await createMassIntentionForMass(page, massId, intentionText);

    // Navigate to report page
    await page.goto('/mass-intentions/report');
    await expect(page).toHaveURL('/mass-intentions/report');

    // Set date range
    const startDate = '2025-08-01';
    const endDate = '2025-08-31';
    await page.getByLabel('Start Date').fill(startDate);
    await page.getByLabel('End Date').fill(endDate);

    // Generate report
    await page.getByRole('button', { name: /Generate Report/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Trigger CSV download
    const downloadPromise = page.waitForEvent('download');
    const csvButton = page.getByRole('button', { name: /CSV/i });
    await csvButton.click();

    // Wait for download to complete
    const download = await downloadPromise;

    // Verify filename format
    const expectedFilename = `mass-intentions-report-${startDate}-to-${endDate}.csv`;
    expect(download.suggestedFilename()).toBe(expectedFilename);

    console.log(`CSV downloaded with filename: ${download.suggestedFilename()}`);

    // Optionally, verify CSV content
    const downloadPath = await download.path();
    if (downloadPath) {
      const fs = require('fs');
      const csvContent = fs.readFileSync(downloadPath, 'utf-8');

      // Verify CSV headers are present
      expect(csvContent).toContain('Mass Date');
      expect(csvContent).toContain('Intention');
      expect(csvContent).toContain('Requested By');
      expect(csvContent).toContain('Stipend');

      // Verify intention text appears in CSV
      expect(csvContent).toContain(intentionText);

      console.log('CSV content verified successfully');
    }

    console.log('CSV download test completed successfully');
  });

  test('should show error when trying to download CSV without generating report', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to report page
    await page.goto('/mass-intentions/report');
    await expect(page).toHaveURL('/mass-intentions/report');

    // Try to click CSV button without generating report (it should be disabled)
    const csvButton = page.getByRole('button', { name: /CSV/i });
    await expect(csvButton).toBeDisabled();

    console.log('CSV button correctly disabled before report generation');
  });
});
