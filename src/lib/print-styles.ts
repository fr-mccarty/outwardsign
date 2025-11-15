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
