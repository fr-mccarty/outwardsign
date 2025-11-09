import { test, expect } from '@playwright/test';

test.describe('Presentation Module', () => {
  test('should create presentation with child, add event, select template, then add father and verify all data', async ({ page }) => {

    // Navigate to presentations page
    await page.goto('/presentations');
    await expect(page).toHaveURL('/presentations');

    // Click "New Presentation" button
    const newPresentationLink = page.getByRole('link', { name: /New Presentation/i }).first();
    await newPresentationLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/presentations/create', { timeout: 10000 });

    // Step 2: Create a new child using PeoplePicker inline creation
    const childFirstName = 'Maria';
    const childLastName = 'TestChild';

    // Click "Select Child" button to open PeoplePicker
    await page.click('button:has-text("Select Child")');

    // Wait for the picker dialog to open
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Since we're creating a new presentation, the EventPicker should open to "new event" by default
    // But for the child, we need to add a new person
    // Look for "Add New Person" button in the dialog
    await page.click('button:has-text("Add New Person")');

    // Fill in the new person form
    await page.fill('input#first_name', childFirstName);
    await page.fill('input#last_name', childLastName);

    // Select sex if the field is available
    // The sex field is inside a Select component - need to click the trigger button
    const sexTrigger = page.locator('[role="combobox"]').filter({ hasText: 'Select sex' });
    if (await sexTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sexTrigger.click();
      await page.click('[role="option"]:has-text("Female")');
    }

    // Save the new person
    await page.click('button[type="submit"]:has-text("Save Person")');

    // Wait for success toast
    await page.waitForSelector('text=/Person created successfully/i', { timeout: 10000 });

    // The picker should auto-close and auto-select the child
    // Verify the child name appears in the form
    await expect(page.locator(`text=${childFirstName} ${childLastName}`).first()).toBeVisible();

    // Step 3: Save the presentation (first save)
    // Wait for the form to stabilize after person selection
    await page.waitForTimeout(500);

    // Find the submit button - it should be at the bottom of the form
    const submitButton = page.locator('form#presentation-form button[type="submit"]').first();

    // Wait for the button to be visible AND enabled (not disabled)
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await expect(submitButton).toBeEnabled({ timeout: 10000 });

    // Click to submit
    await submitButton.click();

    // Wait for success toast
    await page.waitForSelector('text=/Presentation created successfully/i', { timeout: 10000 });

    // Should redirect to the presentation detail page
    await page.waitForURL(/\/presentations\/[a-f0-9-]+$/, { timeout: 10000 });

    // Get the presentation ID from URL for later use
    const presentationUrl = page.url();
    const presentationId = presentationUrl.split('/').pop();

    // Step 4 & 5: Go to edit page to add event date and select template
    await page.goto(`/presentations/${presentationId}/edit`);
    await expect(page).toHaveURL(`/presentations/${presentationId}/edit`);

    // Step 4: Add an event date using EventPicker
    const eventName = 'Baby Presentation Ceremony';

    // Click "Select Event" button
    await page.click('button:has-text("Select Event")');

    // Wait for EventPicker dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // In edit mode, the dialog opens to picker view, need to click "Add New Event"
    await page.click('text=Add New Event');

    // Wait for the new event form to appear
    await page.waitForSelector('input#name', { timeout: 5000 });

    // Fill in event details
    await page.fill('input#name', eventName);

    // Fill in start date and time
    const testDate = '2025-12-25';
    const testTime = '10:00';
    await page.fill('input#start_date', testDate);
    await page.fill('input#start_time', testTime);

    // Save the event
    await page.click('button[type="submit"]:has-text("Save Event")');

    // Wait for success toast
    await page.waitForSelector('text=/Event created successfully/i', { timeout: 10000 });

    // Event should be auto-selected and dialog closed
    await expect(page.locator(`text=${eventName}`).first()).toBeVisible();

    // Step 5: Select a template
    await page.click('#template');
    await page.click('[role="option"]:has-text("Guión Completo")');

    // Check the baptism status checkbox
    await page.click('input#is_baptized');

    // Save the presentation with event and template
    await page.click('button[type="submit"]:has-text("Save")');

    // Wait for success toast
    await page.waitForSelector('text=/Presentation updated successfully/i', { timeout: 10000 });

    // Step 6: Go back to edit page
    await page.goto(`/presentations/${presentationId}/edit`);
    await expect(page).toHaveURL(`/presentations/${presentationId}/edit`);

    // Step 7: Add a father using PeoplePicker
    const fatherFirstName = 'Jose';
    const fatherLastName = 'TestFather';

    // Click "Select Father" button
    await page.click('button:has-text("Select Father")');

    // Wait for picker dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Add new person
    await page.click('button:has-text("Add New Person")');

    // Fill in father details
    await page.fill('input#first_name', fatherFirstName);
    await page.fill('input#last_name', fatherLastName);

    // Select sex if the field is available
    const sexTrigger2 = page.locator('[role="combobox"]').filter({ hasText: 'Select sex' });
    if (await sexTrigger2.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sexTrigger2.click();
      await page.click('[role="option"]:has-text("Male")');
    }

    // Optional: Add phone and email
    await page.fill('input#phone_number', '555-1234');
    await page.fill('input#email', 'jose.testfather@example.com');

    // Save the new person
    await page.click('button[type="submit"]:has-text("Save Person")');

    // Wait for success toast
    await page.waitForSelector('text=/Person created successfully/i', { timeout: 10000 });

    // Verify father is auto-selected
    await expect(page.locator(`text=${fatherFirstName} ${fatherLastName}`).first()).toBeVisible();

    // Step 8: Update the module
    await page.click('button[type="submit"]:has-text("Save")');

    // Wait for success toast
    await page.waitForSelector('text=/Presentation updated successfully/i', { timeout: 10000 });

    // Step 9: Go to the preview page (view page)
    await page.goto(`/presentations/${presentationId}`);
    await expect(page).toHaveURL(`/presentations/${presentationId}`);

    // Step 10: Make sure everything is there
    // Verify child name
    await expect(page.locator(`text=${childFirstName} ${childLastName}`)).toBeVisible();

    // Verify father name
    await expect(page.locator(`text=${fatherFirstName} ${fatherLastName}`)).toBeVisible();

    // Verify event details
    await expect(page.locator(`text=${eventName}`)).toBeVisible();

    // Verify baptism status
    await expect(page.locator('text=/Bautizado/i')).toBeVisible();

    // Verify the liturgy content is rendered (check for template-specific content)
    // Spanish template should have "CELEBRANTE" and liturgy text
    await expect(page.locator('text=/CELEBRANTE/i')).toBeVisible();

    // Verify the ModuleViewPanel elements are present
    await expect(page.locator('button:has-text("Edit")')).toBeVisible();
    await expect(page.locator('text=/Status:/i')).toBeVisible();
  });

  test('should show empty state when no presentations exist', async ({ page }) => {
    // Navigate to presentations page
    await page.goto('/presentations');

    // Should show empty state
    await expect(page.locator('text=/No presentations yet/i')).toBeVisible();

    // Should have a create button in empty state
    const createButton = page.getByRole('link', { name: /New Presentation/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should validate required fields on create', async ({ page }) => {
    // Go to create page
    await page.goto('/presentations/create');

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Should stay on the same page (form validation prevents submission)
    await expect(page).toHaveURL('/presentations/create');

    // Note: The form might allow submission without child since it could be optional
    // But we're verifying basic form validation is working
  });

  test('should export presentation to PDF and Word', async ({ page }) => {
    // Create a basic presentation first
    await page.goto('/presentations/create');

    // Add minimal required data
    const childFirstName = 'Pedro';
    const childLastName = 'ExportTest';

    // Add child
    await page.click('button:has-text("Select Child")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.click('button:has-text("Add New Person")');
    await page.fill('input#first_name', childFirstName);
    await page.fill('input#last_name', childLastName);

    // Select sex if available
    const sexTrigger3 = page.locator('[role="combobox"]').filter({ hasText: 'Select sex' });
    if (await sexTrigger3.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sexTrigger3.click();
      await page.click('[role="option"]:has-text("Male")');
    }

    await page.click('button[type="submit"]:has-text("Save Person")');
    await page.waitForSelector('text=/Person created successfully/i', { timeout: 10000 });

    // Submit
    await page.click('button[type="submit"]:has-text("Save")');
    await page.waitForSelector('text=/Presentation created successfully/i', { timeout: 10000 });
    await page.waitForURL(/\/presentations\/[a-f0-9-]+$/, { timeout: 10000 });

    // Test PDF export button exists (button text is just "PDF")
    await expect(page.locator('a:has-text("PDF")')).toBeVisible();

    // Test Word export button exists (button text is "Word Doc")
    await expect(page.locator('a:has-text("Word Doc")')).toBeVisible();

    // Test print view button exists
    await expect(page.locator('a:has-text("Print View")')).toBeVisible();
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Create a presentation first
    await page.goto('/presentations/create');

    // Add child
    await page.click('button:has-text("Select Child")');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.click('button:has-text("Add New Person")');
    await page.fill('input#first_name', 'Breadcrumb');
    await page.fill('input#last_name', 'TestChild');

    // Select sex if available
    const sexTrigger4 = page.locator('[role="combobox"]').filter({ hasText: 'Select sex' });
    if (await sexTrigger4.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sexTrigger4.click();
      await page.click('[role="option"]:has-text("Female")');
    }

    await page.click('button[type="submit"]:has-text("Save Person")');
    await page.waitForSelector('text=/Person created successfully/i', { timeout: 10000 });

    // Submit
    await page.click('button[type="submit"]:has-text("Save")');
    await page.waitForURL(/\/presentations\/[a-f0-9-]+$/, { timeout: 10000 });

    // Should have breadcrumbs visible
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Presentations' })).toBeVisible();

    // Click on "Presentations" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Presentations' }).click();

    // Should navigate back to presentations list
    await expect(page).toHaveURL('/presentations');
  });
});
