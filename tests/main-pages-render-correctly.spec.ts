import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Verifies all main pages load correctly.
 * Visits list and create pages to ensure they render without errors.
 */
test.describe('Main Pages Render Correctly', () => {
  test.describe.configure({ mode: 'serial' });

  // List pages to test
  const listPages = [
    { path: '/dashboard', expectedHeading: 'Dashboard' },
    { path: '/events', expectedHeading: 'Our Events' },
    { path: '/calendar', expectedHeading: 'Calendar' },
    { path: '/people', expectedHeading: 'People' },
    { path: '/locations', expectedHeading: 'Locations' },
    { path: '/groups', expectedHeading: 'Groups' },
    { path: '/group-members', expectedHeading: 'Group Members' },
    { path: '/masses', expectedHeading: 'Masses' },
    { path: '/mass-roles', expectedHeading: 'Mass Roles' },
    { path: '/mass-role-templates', expectedHeading: 'Mass Role Templates' },
    { path: '/mass-role-members', expectedHeading: 'Mass Role Members' },
    { path: '/mass-times-templates', expectedHeading: 'Mass Times Templates' },
    { path: '/mass-types', expectedHeading: 'Mass Types' },
    { path: '/mass-intentions', expectedHeading: 'Mass Intentions' },
    { path: '/weekend-summary', expectedHeading: 'Weekend Summary' },
    { path: '/settings', expectedHeading: 'Settings' },
    { path: '/settings/event-types', expectedHeading: 'Event Types' },
    { path: '/settings/custom-lists', expectedHeading: 'Custom Lists' },
    { path: '/settings/petitions', expectedHeading: 'Petition Templates' },
    { path: '/settings/parish/general', expectedHeading: 'General Settings' },
    { path: '/settings/user', expectedHeading: 'User Preferences' },
  ];

  // Create pages to test
  const createPages = [
    { path: '/events/create', expectedHeading: 'Create Event' },
    { path: '/people/create', expectedHeading: 'Create Person' },
    { path: '/locations/create', expectedHeading: 'Create Location' },
    { path: '/groups/create', expectedHeading: 'Create Group' },
    { path: '/masses/create', expectedHeading: 'Create Mass' },
    { path: '/mass-roles/create', expectedHeading: 'Create New Mass Role' },
    { path: '/mass-role-templates/create', expectedHeading: 'Create Mass Role Template' },
    { path: '/mass-times-templates/create', expectedHeading: 'Create Mass Times Template' },
    { path: '/mass-intentions/create', expectedHeading: 'Create Mass Intention' },
    { path: '/settings/petitions/create', expectedHeading: 'Create Petition Template' },
    { path: '/settings/event-types/create', expectedHeading: 'Create Event Type' },
    { path: '/settings/custom-lists/create', expectedHeading: 'Create Custom List' },
  ];

  test('all list pages should load', async ({ page }) => {
    for (const { path, expectedHeading } of listPages) {
      await page.goto(path);

      // Verify page loaded by checking for the heading
      const heading = page.getByRole('heading', { name: expectedHeading }).first();
      await expect(heading, `Heading "${expectedHeading}" should be visible on ${path}`).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });
    }
  });

  test('all create pages should load', async ({ page }) => {
    for (const { path, expectedHeading } of createPages) {
      await page.goto(path);

      // Verify page loaded by checking for the heading
      const heading = page.getByRole('heading', { name: expectedHeading }).first();
      await expect(heading, `Heading "${expectedHeading}" should be visible on ${path}`).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });
    }
  });
});
