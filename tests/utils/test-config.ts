/**
 * Test configuration constants and utilities
 * Centralized timeout values for consistent test behavior
 *
 * Note: These are maximum timeouts. Playwright will continue as soon as
 * the condition is met, so these don't slow down tests unnecessarily.
 */

export const TEST_TIMEOUTS = {
  /** Standard navigation timeout (e.g., page.goto, waitForURL) */
  NAVIGATION: 10000,

  /** Timeout for toast/notification messages to appear */
  TOAST: 5000,

  /** Timeout for form submission and redirect */
  FORM_SUBMIT: 10000,

  /** Timeout for data to load in lists/tables */
  DATA_LOAD: 5000,

  /** Timeout for elements to render */
  RENDER: 5000,

  /** Timeout for modal/dialog animations */
  DIALOG: 3000,

  /** Extended timeout for slow operations (avoid if possible) */
  EXTENDED: 15000,
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
