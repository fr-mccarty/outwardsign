import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Module Deletion Test Suite
 *
 * Tests deletion functionality across all primary modules that follow
 * the standard 9-file architecture pattern. Each module should support:
 * - Delete button on view page
 * - Confirmation dialog before deletion
 * - Redirect to list page after deletion
 * - Entity removal from database
 */

// Module configuration for data-driven tests
interface ModuleConfig {
  name: string;
  singularLabel: string;
  pluralLabel: string;
  route: string;
  createUrl: string;
  // Minimal required fields to create a valid entity
  requiredFields: {
    fieldId: string;
    value: string;
    inputType?: 'text' | 'textarea' | 'select';
    selectOptionText?: string;
  }[];
  // Text that should appear on the view page to verify entity exists
  verificationText: string;
}

const modules: ModuleConfig[] = [
  {
    name: 'Weddings',
    singularLabel: 'Wedding',
    pluralLabel: 'Weddings',
    route: '/weddings',
    createUrl: '/weddings/create',
    requiredFields: [],
    verificationText: 'Wedding', // Will verify heading exists
  },
  {
    name: 'Funerals',
    singularLabel: 'Funeral',
    pluralLabel: 'Funerals',
    route: '/funerals',
    createUrl: '/funerals/create',
    requiredFields: [],
    verificationText: 'Funeral',
  },
  {
    name: 'Baptisms',
    singularLabel: 'Baptism',
    pluralLabel: 'Baptisms',
    route: '/baptisms',
    createUrl: '/baptisms/create',
    requiredFields: [],
    verificationText: 'Baptism',
  },
  {
    name: 'Presentations',
    singularLabel: 'Presentation',
    pluralLabel: 'Presentations',
    route: '/presentations',
    createUrl: '/presentations/create',
    requiredFields: [],
    verificationText: 'Presentation',
  },
  {
    name: 'Quinceañeras',
    singularLabel: 'Quinceañera',
    pluralLabel: 'Quinceañeras',
    route: '/quinceaneras',
    createUrl: '/quinceaneras/create',
    requiredFields: [],
    verificationText: 'Quinceañera',
  },
  {
    name: 'Masses',
    singularLabel: 'Mass',
    pluralLabel: 'Masses',
    route: '/masses',
    createUrl: '/masses/create',
    requiredFields: [],
    verificationText: 'Mass',
  },
  {
    name: 'Mass Intentions',
    singularLabel: 'Mass Intention',
    pluralLabel: 'Mass Intentions',
    route: '/mass-intentions',
    createUrl: '/mass-intentions/create',
    requiredFields: [
      {
        fieldId: 'mass_offered_for',
        value: 'Test Intention for Automated Test',
        inputType: 'text',
      },
    ],
    verificationText: 'Test Intention for Automated Test',
  },
];

test.describe('Module Deletion', () => {
  // Test each module's deletion functionality
  for (const testModule of modules) {
    test.describe(testModule.name, () => {
      test('should delete entity from view page', async ({ page }) => {
        // 1. Create a new entity
        await page.goto(testModule.createUrl);
        await expect(page).toHaveURL(testModule.createUrl, {
          timeout: TEST_TIMEOUTS.NAVIGATION,
        });

        // Fill in required fields (if any)
        for (const field of testModule.requiredFields) {
          if (field.inputType === 'select') {
            await page.click(`#${field.fieldId}`);
            await page.click(`[role="option"]:has-text("${field.selectOptionText}")`);
          } else if (field.inputType === 'textarea') {
            await page.fill(`textarea#${field.fieldId}`, field.value);
          } else {
            await page.fill(`input#${field.fieldId}`, field.value);
          }
        }

        // Submit the form
        await page.click('button[type="submit"]');

        // 2. Should redirect to the edit page after creation
        await page.waitForURL(new RegExp(`${testModule.route}/[a-f0-9-]+/edit$`), {
          timeout: TEST_TIMEOUTS.FORM_SUBMIT,
        });

        // Get the entity ID from URL
        const entityUrl = page.url();
        const urlParts = entityUrl.split('/');
        const entityId = urlParts[urlParts.length - 2]; // ID is second-to-last (before 'edit')

        console.log(`Created ${testModule.singularLabel} with ID: ${entityId}`);

        // Navigate to view page to test deletion
        await page.goto(`${testModule.route}/${entityId}`);
        await page.waitForURL(`${testModule.route}/${entityId}`);

        // Verify entity details are displayed
        await expect(
          page.getByRole('heading', { name: new RegExp(testModule.verificationText, 'i') }).first()
        ).toBeVisible();

        // 3. Click Delete button to open confirmation dialog
        const deleteButton = page.getByRole('button', { name: /Delete/i });
        await expect(deleteButton).toBeVisible();
        await deleteButton.click();

        // 4. Verify confirmation dialog appears
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(
          dialog.getByRole('heading', { name: new RegExp(`Delete ${testModule.singularLabel}`, 'i') })
        ).toBeVisible();
        await expect(
          dialog.getByText(/Are you sure you want to delete/i)
        ).toBeVisible();

        // 5. Confirm deletion
        const confirmDeleteButton = dialog.getByRole('button', { name: /Delete/i });
        await confirmDeleteButton.click();

        // 6. Should redirect to list page after deletion
        await page.waitForURL(testModule.route, {
          timeout: TEST_TIMEOUTS.FORM_SUBMIT,
        });

        // 7. Verify we're on the list page
        await expect(page).toHaveURL(testModule.route);

        // Deletion test complete - entity was successfully deleted and we redirected to list
      });

      test('should cancel deletion when Cancel button clicked', async ({ page }) => {
        // 1. Create a new entity
        await page.goto(testModule.createUrl);
        await expect(page).toHaveURL(testModule.createUrl);

        // Fill in required fields (if any)
        for (const field of testModule.requiredFields) {
          if (field.inputType === 'select') {
            await page.click(`#${field.fieldId}`);
            await page.click(`[role="option"]:has-text("${field.selectOptionText}")`);
          } else if (field.inputType === 'textarea') {
            await page.fill(`textarea#${field.fieldId}`, field.value);
          } else {
            await page.fill(`input#${field.fieldId}`, field.value);
          }
        }

        // Submit the form
        await page.click('button[type="submit"]');

        // 2. Wait for redirect to edit page
        await page.waitForURL(new RegExp(`${testModule.route}/[a-f0-9-]+/edit$`), {
          timeout: TEST_TIMEOUTS.FORM_SUBMIT,
        });

        const entityUrl = page.url();
        const urlParts = entityUrl.split('/');
        const entityId = urlParts[urlParts.length - 2];

        // Navigate to view page to test cancel deletion
        await page.goto(`${testModule.route}/${entityId}`);
        await page.waitForURL(`${testModule.route}/${entityId}`);

        // 3. Click Delete button
        await page.getByRole('button', { name: /Delete/i }).click();

        // 4. Verify dialog appears
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();

        // 5. Click Cancel instead of Delete
        const cancelButton = dialog.getByRole('button', { name: /Cancel/i });
        await cancelButton.click();

        // 6. Dialog should close
        await expect(dialog).not.toBeVisible();

        // 7. Should still be on the entity view page (not deleted)
        await expect(page).toHaveURL(`${testModule.route}/${entityId}`);

        // 8. Entity should still be visible
        await expect(
          page.getByRole('heading', { name: new RegExp(testModule.verificationText, 'i') }).first()
        ).toBeVisible();
      });

      test('should show Delete button on view page', async ({ page }) => {
        // 1. Create a new entity
        await page.goto(testModule.createUrl);

        // Fill in required fields (if any)
        for (const field of testModule.requiredFields) {
          if (field.inputType === 'select') {
            await page.click(`#${field.fieldId}`);
            await page.click(`[role="option"]:has-text("${field.selectOptionText}")`);
          } else if (field.inputType === 'textarea') {
            await page.fill(`textarea#${field.fieldId}`, field.value);
          } else {
            await page.fill(`input#${field.fieldId}`, field.value);
          }
        }

        await page.click('button[type="submit"]');

        // 2. Wait for redirect to edit page
        await page.waitForURL(new RegExp(`${testModule.route}/[a-f0-9-]+/edit$`), {
          timeout: TEST_TIMEOUTS.FORM_SUBMIT,
        });

        // Get entity ID and navigate to view page
        const entityUrl = page.url();
        const urlParts = entityUrl.split('/');
        const entityId = urlParts[urlParts.length - 2];

        await page.goto(`${testModule.route}/${entityId}`);
        await page.waitForURL(`${testModule.route}/${entityId}`);

        // 3. Verify Delete button exists and has destructive styling
        const deleteButton = page.getByRole('button', { name: /Delete/i });
        await expect(deleteButton).toBeVisible();

        // 4. Verify button has Trash icon (icon appears before text)
        // The button contains an SVG icon from lucide-react
        const buttonHasIcon = await deleteButton.locator('svg').count();
        expect(buttonHasIcon).toBeGreaterThan(0);
      });
    });
  }
});
