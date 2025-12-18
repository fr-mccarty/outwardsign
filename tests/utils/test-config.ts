/**
 * Test configuration constants and utilities
 * Centralized timeout values for consistent test behavior
 *
 * IMPORTANT: All test timeout constants should be defined here.
 * Do NOT define test timeouts in src/lib/constants.ts or other files.
 *
 * Note: These are maximum timeouts. Playwright will continue as soon as
 * the condition is met, so these don't slow down tests unnecessarily.
 */

export const TEST_TIMEOUTS = {
  /** Quick checks, animations, error detection (1 second) */
  QUICK: 1000,

  /** Short waits, calendar view checks (2 seconds) */
  SHORT: 2000,

  /** Timeout for modal/dialog animations (3 seconds) */
  DIALOG: 3000,

  /** Timeout for toast/notification messages to appear (5 seconds) */
  TOAST: 5000,

  /** Timeout for data to load in lists/tables (5 seconds) */
  DATA_LOAD: 5000,

  /** Timeout for elements to render (5 seconds) */
  RENDER: 5000,

  /** Standard navigation timeout (e.g., page.goto, waitForURL) (10 seconds) */
  NAVIGATION: 10000,

  /** Timeout for form submission and redirect (10 seconds) */
  FORM_SUBMIT: 10000,

  /** Extended timeout for slow operations (15 seconds) */
  EXTENDED: 15000,

  /** Authentication flows which may take longer (20 seconds) */
  AUTH: 20000,

  /** Heavy SSR pages with significant data fetching (30 seconds) */
  HEAVY_LOAD: 30000,
} as const;

/**
 * Common test selectors
 */
export const TEST_SELECTORS = {
  TOAST_SUCCESS: 'text=/successfully/i',
  TOAST_ERROR: 'text=/error|failed/i',
} as const;

/**
 * Convert a Date to a local date string (YYYY-MM-DD format)
 *
 * This uses local timezone to avoid date shifting issues that occur
 * with toISOString() which converts to UTC.
 *
 * @example
 * toLocalDateString(new Date()) // "2025-11-29"
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
