/**
 * Print Styles Constants
 * Centralized constants for consistent print formatting across all modules
 *
 * SINGLE SOURCE OF TRUTH: Change MARGIN_INCHES to update all formats (HTML, Word, PDF)
 */

// ============================================================================
// BASE MARGIN SETTING - Change this value to update all formats
// ============================================================================
const MARGIN_INCHES = 0.75

// ============================================================================
// AUTO-CALCULATED MARGINS (do not modify these directly)
// ============================================================================

// HTML/CSS margins
export const PRINT_PAGE_MARGIN = `${MARGIN_INCHES}in`

// Word document margins in TWIPS (1 inch = 1440 TWIPS)
export const WORD_PAGE_MARGIN = Math.round(MARGIN_INCHES * 1440)

// PDF document margins in POINTS (1 inch = 72 points)
export const PDF_PAGE_MARGIN = Math.round(MARGIN_INCHES * 72)

// ============================================================================
// SHARED PRINT STYLES
// Use these with dangerouslySetInnerHTML in print view pages
// ============================================================================

/**
 * Standard print page styles for clean, button-free print views.
 * Removes box shadows, padding, and ensures white background for printing.
 *
 * Usage:
 * ```tsx
 * <style dangerouslySetInnerHTML={{ __html: PRINT_PAGE_STYLES }} />
 * ```
 */
export const PRINT_PAGE_STYLES = `
  @page {
    margin: ${PRINT_PAGE_MARGIN};
  }
  body {
    margin: 0 !important;
    background: white !important;
    color: black !important;
  }
  .print-container {
    max-width: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    background: white !important;
  }
`

/**
 * Liturgical rubric styles - preserves red liturgical text in print views.
 * Use with PRINT_PAGE_STYLES when printing liturgical content (masses, scripts).
 *
 * Usage:
 * ```tsx
 * <style dangerouslySetInnerHTML={{ __html: `${PRINT_PAGE_STYLES}\n${LITURGICAL_RUBRIC_STYLES}` }} />
 * ```
 */
export const LITURGICAL_RUBRIC_STYLES = `
  div[style*="color: rgb(196, 30, 58)"],
  div[style*="color:#c41e3a"],
  div[style*="color: #c41e3a"] {
    color: rgb(196, 30, 58) !important;
  }
  span[style*="color: rgb(196, 30, 58)"],
  span[style*="color:#c41e3a"],
  span[style*="color: #c41e3a"] {
    color: rgb(196, 30, 58) !important;
  }
`
