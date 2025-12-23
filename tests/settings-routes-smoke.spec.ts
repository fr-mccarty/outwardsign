import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Settings Routes Smoke Test
 *
 * Systematically verifies ALL settings routes load correctly.
 * Visits each page and checks for expected heading/content.
 *
 * Based on: human-summary/settings-pages.md
 */

test.describe('Settings Routes Smoke Test', () => {
  test.describe.configure({ mode: 'serial' });

  // ============================================
  // MAIN HUB & USER SETTINGS
  // ============================================
  const mainRoutes = [
    { path: '/settings', heading: 'Settings' },
    { path: '/settings/user', heading: 'User Preferences' },
  ];

  // ============================================
  // PARISH SETTINGS (4 sub-pages)
  // ============================================
  const parishRoutes = [
    { path: '/settings/parish/general', heading: 'General Settings' },
    { path: '/settings/parish/mass-intentions', heading: 'Mass Intentions' },
    { path: '/settings/parish/petitions', heading: 'Petition Templates' },
    { path: '/settings/parish/users', heading: 'Users' },
  ];

  // ============================================
  // EVENTS & SPECIAL LITURGIES
  // ============================================
  const eventRoutes = [
    { path: '/settings/events', heading: 'Parish Events' },
    { path: '/settings/events/create', heading: 'Create Event Type' },
    { path: '/settings/special-liturgies', heading: 'Special Liturgies' },
    { path: '/settings/special-liturgies/create', heading: 'Create Special Liturgy' },
  ];

  // ============================================
  // PETITIONS (global petition templates)
  // ============================================
  const petitionRoutes = [
    { path: '/settings/petitions', heading: 'Petition Settings' },
    { path: '/settings/petitions/default', heading: 'Default Petitions' },
    { path: '/settings/petitions/contexts', heading: 'Petition Contexts' },
    { path: '/settings/petitions/create', heading: 'Create Petition Template' },
  ];

  // ============================================
  // CUSTOM LISTS & CATEGORY TAGS
  // ============================================
  const listTagRoutes = [
    { path: '/settings/custom-lists', heading: 'Custom Lists' },
    { path: '/settings/custom-lists/create', heading: 'Create Custom List' },
    { path: '/settings/category-tags', heading: 'Category Tags' },
    { path: '/settings/category-tags/create', heading: 'Create Tag' },
  ];

  // ============================================
  // CONTENT LIBRARY & EVENT TEMPLATES
  // ============================================
  const contentRoutes = [
    { path: '/settings/content-library', heading: 'Content Library' },
    { path: '/settings/content-library/create', heading: 'Create Content' },
    { path: '/settings/event-templates', heading: 'Event Templates' },
  ];

  // ============================================
  // MASS CONFIGURATION HUB & SUB-SECTIONS
  // ============================================
  const massConfigRoutes = [
    { path: '/settings/mass-configuration', heading: 'Mass Configuration' },
    // Recurring Schedule
    { path: '/settings/mass-configuration/recurring-schedule', heading: 'Recurring Mass Schedule' },
    { path: '/settings/mass-configuration/recurring-schedule/create', heading: 'Create Mass Times Template' },
    // Role Definitions
    { path: '/settings/mass-configuration/role-definitions', heading: 'Mass Roles' },
    { path: '/settings/mass-configuration/role-definitions/create', heading: 'Create New Mass Role' },
    // Role Patterns
    { path: '/settings/mass-configuration/role-patterns', heading: 'Role Assignment Patterns' },
    { path: '/settings/mass-configuration/role-patterns/create', heading: 'Create Mass Role Template' },
    // Ministry Volunteers
    { path: '/settings/mass-configuration/ministry-volunteers', heading: 'Ministry Volunteers' },
  ];

  // ============================================
  // TESTS
  // ============================================

  test('main hub and user settings load', async ({ page }) => {
    for (const { path, heading } of mainRoutes) {
      await page.goto(path);
      const h = page.getByRole('heading', { name: heading }).first();
      await expect(h, `"${heading}" on ${path}`).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });
    }
  });

  test('parish settings pages load', async ({ page }) => {
    for (const { path, heading } of parishRoutes) {
      await page.goto(path);
      const h = page.getByRole('heading', { name: heading }).first();
      await expect(h, `"${heading}" on ${path}`).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });
    }
  });

  test('events and special liturgies pages load', async ({ page }) => {
    for (const { path, heading } of eventRoutes) {
      await page.goto(path);
      const h = page.getByRole('heading', { name: heading }).first();
      await expect(h, `"${heading}" on ${path}`).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });
    }
  });

  test('petition settings pages load', async ({ page }) => {
    for (const { path, heading } of petitionRoutes) {
      await page.goto(path);
      const h = page.getByRole('heading', { name: heading }).first();
      await expect(h, `"${heading}" on ${path}`).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });
    }
  });

  test('custom lists and category tags pages load', async ({ page }) => {
    for (const { path, heading } of listTagRoutes) {
      await page.goto(path);
      const h = page.getByRole('heading', { name: heading }).first();
      await expect(h, `"${heading}" on ${path}`).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });
    }
  });

  test('content library and event templates pages load', async ({ page }) => {
    for (const { path, heading } of contentRoutes) {
      await page.goto(path);
      const h = page.getByRole('heading', { name: heading }).first();
      await expect(h, `"${heading}" on ${path}`).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });
    }
  });

  test('mass configuration pages load', async ({ page }) => {
    for (const { path, heading } of massConfigRoutes) {
      await page.goto(path);
      const h = page.getByRole('heading', { name: heading }).first();
      await expect(h, `"${heading}" on ${path}`).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });
    }
  });
});
