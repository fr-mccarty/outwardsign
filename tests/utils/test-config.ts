/**
 * Test configuration constants and utilities
 * Centralized timeout values for consistent test behavior
 */

export const TEST_TIMEOUTS = {
  /** Standard navigation timeout (e.g., page.goto, waitForURL) */
  NAVIGATION: 5000,

  /** Timeout for toast/notification messages to appear */
  TOAST: 3000,

  /** Timeout for form submission and redirect */
  FORM_SUBMIT: 5000,

  /** Timeout for data to load in lists/tables */
  DATA_LOAD: 3000,

  /** Timeout for modal/dialog animations */
  DIALOG: 1000,

  /** Extended timeout for slow operations (avoid if possible) */
  EXTENDED: 10000,
} as const;

/**
 * Common test selectors
 */
export const TEST_SELECTORS = {
  TOAST_SUCCESS: 'text=/successfully/i',
  TOAST_ERROR: 'text=/error|failed/i',
} as const;
