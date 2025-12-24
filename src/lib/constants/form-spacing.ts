/**
 * Spacing Constants
 *
 * Consistent spacing classes across all components.
 * Use these constants for forms, pages, cards, and any layout spacing.
 */

// =============================================================================
// LAYOUT SPACING - Use these two constants everywhere
// =============================================================================
export const SECTION_SPACING = 'space-y-6'  // 24px - Between sections, cards, major blocks
export const FIELD_SPACING = 'space-y-4'    // 16px - Between fields, items, content within sections

// Legacy aliases (for backwards compatibility during migration)
export const PAGE_SECTIONS_SPACING = SECTION_SPACING
export const FORM_SECTIONS_SPACING = SECTION_SPACING
export const FORM_FIELDS_SPACING = FIELD_SPACING

// Label spacing
export const LABEL_MARGIN_BOTTOM = 'mb-1'  // When no description follows
export const LABEL_NO_MARGIN = ''  // When description follows (tight coupling)

// Description spacing
export const DESCRIPTION_BEFORE_INPUT = 'mb-1.5'  // Description above input
export const DESCRIPTION_AFTER_INPUT = 'mt-1.5'   // Description below input
export const DESCRIPTION_INLINE = 'mt-0.5'        // Inline description (e.g., checkbox)

// Error spacing
export const ERROR_MARGIN_TOP = 'mt-1'

// Text sizes
export const LABEL_TEXT = 'text-sm font-medium'
export const DESCRIPTION_TEXT = 'text-xs text-muted-foreground'
export const ERROR_TEXT = 'text-sm text-destructive'
