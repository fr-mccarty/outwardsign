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

  'response-label': {
    fontSize: 11,
    bold: true,
    italic: false,
    color: 'black',
    alignment: 'left',
    marginTop: 0,
    marginBottom: 0,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'response-text': {
    fontSize: 11,
    bold: false,
    italic: false,
    color: 'black',
    alignment: 'left',
    marginTop: 0,
    marginBottom: 0,
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

  'petition-label': {
    fontSize: 11,
    bold: true,
    italic: false,
    color: 'liturgy-red',
    alignment: 'left',
    marginTop: 0,
    marginBottom: 0,
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },

  'petition-text': {
    fontSize: 11,
    bold: false,
    italic: false,
    color: 'black',
    alignment: 'left',
    marginTop: 0,
    marginBottom: 0,
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

  'info-row-label': {
    fontSize: 11,
    bold: true,
    italic: false,
    color: 'black',
    alignment: 'left',
    marginTop: 0,
    marginBottom: 0,
    lineHeight: 1.4,
    preserveLineBreaks: false,
    width: 150, // Used by PDF renderer for column layout
  },

  'info-row-value': {
    fontSize: 11,
    bold: false,
    italic: false,
    color: 'black',
    alignment: 'left',
    marginTop: 0,
    marginBottom: 0,
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
// STYLE RESOLUTION
// ============================================================================

/**
 * Resolved style with all properties as concrete primitives
 * This is what renderers receive - they never look up styles themselves
 */
export interface ResolvedStyle {
  fontSize: number // in points
  bold: boolean
  italic: boolean
  color: string // hex color (e.g., '#000000' or '#c41e3a')
  alignment: 'left' | 'center' | 'right' | 'justify'
  marginTop: number // in points
  marginBottom: number // in points
  lineHeight: number
  preserveLineBreaks: boolean
  width?: number | '*' // Optional, used by some elements like info-row-label
}

/**
 * Resolve an element type to concrete style properties
 * This is the ONLY function that knows about ELEMENT_STYLES and LITURGY_COLORS
 */
export function resolveElementStyle(elementType: keyof typeof ELEMENT_STYLES): ResolvedStyle | null {
  if (elementType === 'spacer') {
    return null // Spacers don't have text styles
  }

  const style = ELEMENT_STYLES[elementType]

  return {
    fontSize: style.fontSize,
    bold: style.bold,
    italic: style.italic,
    color: style.color === 'liturgy-red' ? LITURGY_COLORS.liturgyRed : LITURGY_COLORS.black,
    alignment: style.alignment,
    marginTop: style.marginTop,
    marginBottom: style.marginBottom,
    lineHeight: style.lineHeight,
    preserveLineBreaks: style.preserveLineBreaks,
    width: 'width' in style ? style.width : undefined,
  }
}

/**
 * Resolve a spacer size to concrete point value
 * This is the ONLY function that knows about ELEMENT_STYLES spacer values
 */
export function resolveSpacerSize(size: 'small' | 'medium' | 'large'): number {
  switch (size) {
    case 'large':
      return ELEMENT_STYLES.spacer.large
    case 'medium':
      return ELEMENT_STYLES.spacer.medium
    case 'small':
    default:
      return ELEMENT_STYLES.spacer.small
  }
}

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

  // Color format conversions
  colorToWord: (hexColor: string) => hexColor.replace('#', ''), // Word needs color without # prefix
  colorToHtml: (hexColor: string) => hexColor, // HTML uses hex as-is
  colorToPdf: (hexColor: string) => hexColor, // pdfmake uses hex as-is
}
