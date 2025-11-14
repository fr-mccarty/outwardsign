/**
 * Centralized Liturgy Style System
 *
 * Single source of truth for all liturgical styling across:
 * - HTML views
 * - PDF generation (pdfmake)
 * - Word document generation (docx)
 *
 * All values are defined in points (standard print unit)
 * and converted automatically by each renderer.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

export const LITURGY_COLORS = {
  liturgyRed: '#c41e3a',
  black: '#000000',
} as const

export const LITURGY_FONT = 'Helvetica'

export const PAGE_MARGIN = 60 // points (approximately 0.83 inches)

// ============================================================================
// ELEMENT STYLES (all measurements in points)
// ============================================================================

export const ELEMENT_STYLES = {
  'event-title': {
    fontSize: 18,
    bold: true,
    italic: false,
    color: 'black',
    alignment: 'center',
    marginTop: 0,
    marginBottom: 2,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'event-datetime': {
    fontSize: 14,
    bold: false,
    italic: false,
    color: 'black',
    alignment: 'center',
    marginTop: 3,
    marginBottom: 9,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'section-title': {
    fontSize: 16,
    bold: true,
    italic: false,
    color: 'black',
    alignment: 'center',
    marginTop: 9,
    marginBottom: 6,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'reading-title': {
    fontSize: 14,
    bold: true,
    italic: false,
    color: 'liturgy-red',
    alignment: 'right',
    marginTop: 6,
    marginBottom: 3,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'pericope': {
    fontSize: 12,
    bold: false,
    italic: true,
    color: 'liturgy-red',
    alignment: 'right',
    marginTop: 3,
    marginBottom: 2,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'reader-name': {
    fontSize: 11,
    bold: false,
    italic: false,
    color: 'liturgy-red',
    alignment: 'right',
    marginTop: 0,
    marginBottom: 6,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'introduction': {
    fontSize: 11,
    bold: false,
    italic: true,
    color: 'black',
    alignment: 'left',
    marginTop: 3,
    marginBottom: 3,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'reading-text': {
    fontSize: 11,
    bold: false,
    italic: false,
    color: 'black',
    alignment: 'left',
    marginTop: 3,
    marginBottom: 3,
    lineHeight: 1.4,
    preserveLineBreaks: true,
  },

  'conclusion': {
    fontSize: 11,
    bold: false,
    italic: true,
    color: 'black',
    alignment: 'left',
    marginTop: 3,
    marginBottom: 3,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'response': {
    fontSize: 11,
    bold: false,
    italic: false,
    color: 'black',
    alignment: 'left',
    marginTop: 3,
    marginBottom: 4,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'priest-dialogue': {
    fontSize: 11,
    bold: false,
    italic: false,
    color: 'black',
    alignment: 'left',
    marginTop: 3,
    marginBottom: 3,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'petition': {
    fontSize: 11,
    bold: false,
    italic: false,
    color: 'black',
    alignment: 'left',
    marginTop: 3,
    marginBottom: 3,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'text': {
    fontSize: 11,
    bold: false,
    italic: false,
    color: 'black',
    alignment: 'left',
    marginTop: 3,
    marginBottom: 3,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'rubric': {
    fontSize: 11,
    bold: false,
    italic: true,
    color: 'liturgy-red',
    alignment: 'left',
    marginTop: 3,
    marginBottom: 3,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'prayer-text': {
    fontSize: 11,
    bold: false,
    italic: false,
    color: 'black',
    alignment: 'left',
    marginTop: 3,
    marginBottom: 3,
    lineHeight: 1.4,
    preserveLineBreaks: true,
  },

  'priest-text': {
    fontSize: 11,
    bold: false,
    italic: false,
    color: 'black',
    alignment: 'left',
    marginTop: 3,
    marginBottom: 3,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'info-row': {
    fontSize: 11,
    bold: false,
    italic: false,
    color: 'black',
    alignment: 'left',
    marginTop: 2,
    marginBottom: 2,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'spacer': {
    small: 3,
    medium: 6,
    large: 9,
  },
} as const

// ============================================================================
// UNIT CONVERSION UTILITIES
// ============================================================================

export const convert = {
  // Word uses twips (twentieths of a point) for spacing
  pointsToTwips: (points: number) => points * 20,

  // Word uses half-points for font sizes
  pointsToHalfPoints: (points: number) => points * 2,

  // HTML pixel conversion (1pt = 1.333px at 96dpi)
  pointsToPx: (points: number) => points * 1.333,
}
