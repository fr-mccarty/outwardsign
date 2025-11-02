/**
 * Centralized Liturgy Style System
 *
 * Single source of truth for all liturgical styling across:
 * - HTML views
 * - PDF generation (pdfmake)
 * - Word document generation (docx)
 *
 * All base values are defined in points (standard print unit)
 * and converted automatically for each context.
 */

// ============================================================================
// BASE STYLE DEFINITIONS (all in points)
// ============================================================================

export const LITURGY_BASE_STYLES = {
  colors: {
    liturgyRed: '#c41e3a',
    black: '#000000',
    white: '#ffffff',
  },

  fonts: {
    primary: 'Helvetica',
  },

  fontSizes: {
    eventTitle: 18,
    eventDateTime: 14,
    sectionTitle: 16,
    readingTitle: 14,
    pericope: 12,
    readerName: 11,
    introduction: 11,
    text: 11,
    conclusion: 11,
    response: 11,
    priestDialogue: 11,
    petition: 11,
  },

  spacing: {
    // General spacing
    none: 0,
    tiny: 2,
    small: 3,
    medium: 6,
    large: 9,
    xlarge: 12,
    xxlarge: 18,

    // Specific spacing before/after
    beforeParagraph: 0,
    afterParagraph: 4,
    beforeSection: 0,
    afterSection: 8,
    beforeReading: 6,
    afterReading: 8,
    beforeResponse: 3,
    afterResponse: 4,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },

  alignment: {
    left: 'left' as const,
    center: 'center' as const,
    right: 'right' as const,
    justify: 'justify' as const,
  },

  margins: {
    page: 60, // points (approximately 0.83 inches)
  },
} as const;

// ============================================================================
// UNIT CONVERSION UTILITIES
// ============================================================================

export const convert = {
  // Word uses twips (twentieths of a point) for spacing
  pointsToTwips: (points: number) => points * 20,

  // Word uses half-points for font sizes
  pointsToHalfPoints: (points: number) => points * 2,

  // HTML can use rem (relative to 16px base)
  pointsToRem: (points: number) => points / 16,

  // HTML pixel conversion (1pt = 1.333px at 96dpi)
  pointsToPx: (points: number) => points * 1.333,

  // CSS line-height is unitless multiplier
  lineHeightToCSS: (lineHeight: number) => lineHeight,
};

// ============================================================================
// PDF-SPECIFIC STYLES (pdfmake)
// ============================================================================

export const pdfStyles = {
  color: LITURGY_BASE_STYLES.colors.liturgyRed,

  fonts: {
    primary: LITURGY_BASE_STYLES.fonts.primary,
  },

  sizes: {
    eventTitle: LITURGY_BASE_STYLES.fontSizes.eventTitle,
    eventDateTime: LITURGY_BASE_STYLES.fontSizes.eventDateTime,
    sectionTitle: LITURGY_BASE_STYLES.fontSizes.sectionTitle,
    readingTitle: LITURGY_BASE_STYLES.fontSizes.readingTitle,
    pericope: LITURGY_BASE_STYLES.fontSizes.pericope,
    readerName: LITURGY_BASE_STYLES.fontSizes.readerName,
    introduction: LITURGY_BASE_STYLES.fontSizes.introduction,
    text: LITURGY_BASE_STYLES.fontSizes.text,
    conclusion: LITURGY_BASE_STYLES.fontSizes.conclusion,
    response: LITURGY_BASE_STYLES.fontSizes.response,
    priestDialogue: LITURGY_BASE_STYLES.fontSizes.priestDialogue,
    petition: LITURGY_BASE_STYLES.fontSizes.petition,
  },

  spacing: {
    none: LITURGY_BASE_STYLES.spacing.none,
    tiny: LITURGY_BASE_STYLES.spacing.tiny,
    small: LITURGY_BASE_STYLES.spacing.small,
    medium: LITURGY_BASE_STYLES.spacing.medium,
    large: LITURGY_BASE_STYLES.spacing.large,
    xlarge: LITURGY_BASE_STYLES.spacing.xlarge,
    xxlarge: LITURGY_BASE_STYLES.spacing.xxlarge,
    beforeParagraph: LITURGY_BASE_STYLES.spacing.beforeParagraph,
    afterParagraph: LITURGY_BASE_STYLES.spacing.afterParagraph,
    beforeSection: LITURGY_BASE_STYLES.spacing.beforeSection,
    afterSection: LITURGY_BASE_STYLES.spacing.afterSection,
    beforeReading: LITURGY_BASE_STYLES.spacing.beforeReading,
    afterReading: LITURGY_BASE_STYLES.spacing.afterReading,
    beforeResponse: LITURGY_BASE_STYLES.spacing.beforeResponse,
    afterResponse: LITURGY_BASE_STYLES.spacing.afterResponse,
  },

  lineHeight: {
    tight: LITURGY_BASE_STYLES.lineHeight.tight,
    normal: LITURGY_BASE_STYLES.lineHeight.normal,
    relaxed: LITURGY_BASE_STYLES.lineHeight.relaxed,
    loose: LITURGY_BASE_STYLES.lineHeight.loose,
  },

  alignment: {
    left: LITURGY_BASE_STYLES.alignment.left,
    center: LITURGY_BASE_STYLES.alignment.center,
    right: LITURGY_BASE_STYLES.alignment.right,
    justify: LITURGY_BASE_STYLES.alignment.justify,
  },

  margins: {
    page: LITURGY_BASE_STYLES.margins.page,
  },
};

// ============================================================================
// WORD-SPECIFIC STYLES (docx)
// ============================================================================

export const wordStyles = {
  // Word uses color without '#' prefix
  color: LITURGY_BASE_STYLES.colors.liturgyRed.replace('#', ''),

  fonts: {
    primary: LITURGY_BASE_STYLES.fonts.primary,
  },

  // Word uses half-points for font sizes
  sizes: {
    eventTitle: convert.pointsToHalfPoints(LITURGY_BASE_STYLES.fontSizes.eventTitle),
    eventDateTime: convert.pointsToHalfPoints(LITURGY_BASE_STYLES.fontSizes.eventDateTime),
    sectionTitle: convert.pointsToHalfPoints(LITURGY_BASE_STYLES.fontSizes.sectionTitle),
    readingTitle: convert.pointsToHalfPoints(LITURGY_BASE_STYLES.fontSizes.readingTitle),
    pericope: convert.pointsToHalfPoints(LITURGY_BASE_STYLES.fontSizes.pericope),
    readerName: convert.pointsToHalfPoints(LITURGY_BASE_STYLES.fontSizes.readerName),
    introduction: convert.pointsToHalfPoints(LITURGY_BASE_STYLES.fontSizes.introduction),
    text: convert.pointsToHalfPoints(LITURGY_BASE_STYLES.fontSizes.text),
    conclusion: convert.pointsToHalfPoints(LITURGY_BASE_STYLES.fontSizes.conclusion),
    response: convert.pointsToHalfPoints(LITURGY_BASE_STYLES.fontSizes.response),
    priestDialogue: convert.pointsToHalfPoints(LITURGY_BASE_STYLES.fontSizes.priestDialogue),
    petition: convert.pointsToHalfPoints(LITURGY_BASE_STYLES.fontSizes.petition),
  },

  // Word uses twips for spacing (20 twips = 1 point)
  spacing: {
    none: convert.pointsToTwips(LITURGY_BASE_STYLES.spacing.none),
    tiny: convert.pointsToTwips(LITURGY_BASE_STYLES.spacing.tiny),
    small: convert.pointsToTwips(LITURGY_BASE_STYLES.spacing.small),
    medium: convert.pointsToTwips(LITURGY_BASE_STYLES.spacing.medium),
    large: convert.pointsToTwips(LITURGY_BASE_STYLES.spacing.large),
    xlarge: convert.pointsToTwips(LITURGY_BASE_STYLES.spacing.xlarge),
    xxlarge: convert.pointsToTwips(LITURGY_BASE_STYLES.spacing.xxlarge),
    beforeParagraph: convert.pointsToTwips(LITURGY_BASE_STYLES.spacing.beforeParagraph),
    afterParagraph: convert.pointsToTwips(LITURGY_BASE_STYLES.spacing.afterParagraph),
    beforeSection: convert.pointsToTwips(LITURGY_BASE_STYLES.spacing.beforeSection),
    afterSection: convert.pointsToTwips(LITURGY_BASE_STYLES.spacing.afterSection),
    beforeReading: convert.pointsToTwips(LITURGY_BASE_STYLES.spacing.beforeReading),
    afterReading: convert.pointsToTwips(LITURGY_BASE_STYLES.spacing.afterReading),
    beforeResponse: convert.pointsToTwips(LITURGY_BASE_STYLES.spacing.beforeResponse),
    afterResponse: convert.pointsToTwips(LITURGY_BASE_STYLES.spacing.afterResponse),
  },

  // Word line spacing (300 = 1.5 spacing, 280 = ~1.4 spacing)
  lineHeight: {
    tight: 240,  // 1.2 spacing
    normal: 280, // 1.4 spacing
    relaxed: 320, // 1.6 spacing
    loose: 360,  // 1.8 spacing
  },

  // Word alignment enum values (from docx library)
  // Note: These will be used with AlignmentType from docx
  alignment: {
    left: 'left' as const,
    center: 'center' as const,
    right: 'right' as const,
    justified: 'justified' as const,
  },
};

// ============================================================================
// HTML-SPECIFIC STYLES
// ============================================================================

export const htmlStyles = {
  color: LITURGY_BASE_STYLES.colors.liturgyRed,

  fonts: {
    primary: LITURGY_BASE_STYLES.fonts.primary,
  },

  // Using pixels for HTML (most compatible)
  sizes: {
    eventTitle: `${convert.pointsToPx(LITURGY_BASE_STYLES.fontSizes.eventTitle)}px`,
    eventDateTime: `${convert.pointsToPx(LITURGY_BASE_STYLES.fontSizes.eventDateTime)}px`,
    sectionTitle: `${convert.pointsToPx(LITURGY_BASE_STYLES.fontSizes.sectionTitle)}px`,
    readingTitle: `${convert.pointsToPx(LITURGY_BASE_STYLES.fontSizes.readingTitle)}px`,
    pericope: `${convert.pointsToPx(LITURGY_BASE_STYLES.fontSizes.pericope)}px`,
    readerName: `${convert.pointsToPx(LITURGY_BASE_STYLES.fontSizes.readerName)}px`,
    introduction: `${convert.pointsToPx(LITURGY_BASE_STYLES.fontSizes.introduction)}px`,
    text: `${convert.pointsToPx(LITURGY_BASE_STYLES.fontSizes.text)}px`,
    conclusion: `${convert.pointsToPx(LITURGY_BASE_STYLES.fontSizes.conclusion)}px`,
    response: `${convert.pointsToPx(LITURGY_BASE_STYLES.fontSizes.response)}px`,
    priestDialogue: `${convert.pointsToPx(LITURGY_BASE_STYLES.fontSizes.priestDialogue)}px`,
    petition: `${convert.pointsToPx(LITURGY_BASE_STYLES.fontSizes.petition)}px`,
  },

  // Using pixels for spacing
  spacing: {
    none: `${convert.pointsToPx(LITURGY_BASE_STYLES.spacing.none)}px`,
    tiny: `${convert.pointsToPx(LITURGY_BASE_STYLES.spacing.tiny)}px`,
    small: `${convert.pointsToPx(LITURGY_BASE_STYLES.spacing.small)}px`,
    medium: `${convert.pointsToPx(LITURGY_BASE_STYLES.spacing.medium)}px`,
    large: `${convert.pointsToPx(LITURGY_BASE_STYLES.spacing.large)}px`,
    xlarge: `${convert.pointsToPx(LITURGY_BASE_STYLES.spacing.xlarge)}px`,
    xxlarge: `${convert.pointsToPx(LITURGY_BASE_STYLES.spacing.xxlarge)}px`,
    beforeParagraph: `${convert.pointsToPx(LITURGY_BASE_STYLES.spacing.beforeParagraph)}px`,
    afterParagraph: `${convert.pointsToPx(LITURGY_BASE_STYLES.spacing.afterParagraph)}px`,
    beforeSection: `${convert.pointsToPx(LITURGY_BASE_STYLES.spacing.beforeSection)}px`,
    afterSection: `${convert.pointsToPx(LITURGY_BASE_STYLES.spacing.afterSection)}px`,
    beforeReading: `${convert.pointsToPx(LITURGY_BASE_STYLES.spacing.beforeReading)}px`,
    afterReading: `${convert.pointsToPx(LITURGY_BASE_STYLES.spacing.afterReading)}px`,
    beforeResponse: `${convert.pointsToPx(LITURGY_BASE_STYLES.spacing.beforeResponse)}px`,
    afterResponse: `${convert.pointsToPx(LITURGY_BASE_STYLES.spacing.afterResponse)}px`,
  },

  lineHeight: {
    tight: LITURGY_BASE_STYLES.lineHeight.tight.toString(),
    normal: LITURGY_BASE_STYLES.lineHeight.normal.toString(),
    relaxed: LITURGY_BASE_STYLES.lineHeight.relaxed.toString(),
    loose: LITURGY_BASE_STYLES.lineHeight.loose.toString(),
  },

  alignment: {
    left: LITURGY_BASE_STYLES.alignment.left,
    center: LITURGY_BASE_STYLES.alignment.center,
    right: LITURGY_BASE_STYLES.alignment.right,
    justify: LITURGY_BASE_STYLES.alignment.justify,
  },
};

// ============================================================================
// STYLE BUILDER HELPERS
// ============================================================================

/**
 * Creates a complete style object for PDF (pdfmake)
 */
export const createPdfStyle = (options: {
  fontSize?: keyof typeof pdfStyles.sizes;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  alignment?: keyof typeof pdfStyles.alignment;
  lineHeight?: keyof typeof pdfStyles.lineHeight;
  marginTop?: number;
  marginBottom?: number;
}) => {
  return {
    fontSize: options.fontSize ? pdfStyles.sizes[options.fontSize] : undefined,
    color: options.color || undefined,
    bold: options.bold || undefined,
    italics: options.italic || undefined,
    alignment: options.alignment ? pdfStyles.alignment[options.alignment] : undefined,
    lineHeight: options.lineHeight ? pdfStyles.lineHeight[options.lineHeight] : undefined,
    margin: [0, options.marginTop || 0, 0, options.marginBottom || 0] as [number, number, number, number],
  };
};

/**
 * Creates a complete style object for HTML (inline styles)
 */
export const createHtmlStyle = (options: {
  fontSize?: keyof typeof htmlStyles.sizes;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  alignment?: keyof typeof htmlStyles.alignment;
  lineHeight?: keyof typeof htmlStyles.lineHeight;
  marginTop?: keyof typeof htmlStyles.spacing;
  marginBottom?: keyof typeof htmlStyles.spacing;
}): React.CSSProperties => {
  return {
    fontSize: options.fontSize ? htmlStyles.sizes[options.fontSize] : undefined,
    color: options.color || undefined,
    fontWeight: options.bold ? 'bold' : undefined,
    fontStyle: options.italic ? 'italic' : undefined,
    textAlign: options.alignment ? htmlStyles.alignment[options.alignment] : undefined,
    lineHeight: options.lineHeight ? htmlStyles.lineHeight[options.lineHeight] : undefined,
    marginTop: options.marginTop ? htmlStyles.spacing[options.marginTop] : undefined,
    marginBottom: options.marginBottom ? htmlStyles.spacing[options.marginBottom] : undefined,
    fontFamily: htmlStyles.fonts.primary,
  };
};

// ============================================================================
// PREDEFINED STYLE PATTERNS
// ============================================================================

/**
 * Common style patterns used across liturgical documents
 */
export const liturgyPatterns = {
  pdf: {
    eventTitle: createPdfStyle({
      fontSize: 'eventTitle',
      bold: true,
      alignment: 'center',
      marginBottom: pdfStyles.spacing.medium,
    }),

    eventDateTime: createPdfStyle({
      fontSize: 'eventDateTime',
      alignment: 'center',
      marginBottom: pdfStyles.spacing.large,
    }),

    sectionTitle: createPdfStyle({
      fontSize: 'sectionTitle',
      bold: true,
      alignment: 'center',
      marginTop: pdfStyles.spacing.large,
      marginBottom: pdfStyles.spacing.medium,
    }),

    readingTitle: createPdfStyle({
      fontSize: 'readingTitle',
      color: pdfStyles.color,
      bold: true,
      alignment: 'right',
      marginTop: pdfStyles.spacing.beforeReading,
    }),

    pericope: createPdfStyle({
      fontSize: 'pericope',
      color: pdfStyles.color,
      italic: true,
      alignment: 'right',
    }),

    readerName: createPdfStyle({
      fontSize: 'readerName',
      color: pdfStyles.color,
      alignment: 'right',
      marginBottom: pdfStyles.spacing.small,
    }),

    introduction: createPdfStyle({
      fontSize: 'introduction',
      italic: true,
      marginTop: pdfStyles.spacing.small,
    }),

    readingText: createPdfStyle({
      fontSize: 'text',
      lineHeight: 'normal',
      marginTop: pdfStyles.spacing.small,
    }),

    conclusion: createPdfStyle({
      fontSize: 'conclusion',
      italic: true,
      marginTop: pdfStyles.spacing.small,
    }),

    response: createPdfStyle({
      fontSize: 'response',
      marginTop: pdfStyles.spacing.beforeResponse,
      marginBottom: pdfStyles.spacing.afterResponse,
    }),
  },

  html: {
    eventTitle: createHtmlStyle({
      fontSize: 'eventTitle',
      bold: true,
      alignment: 'center',
      marginBottom: 'medium',
    }),

    eventDateTime: createHtmlStyle({
      fontSize: 'eventDateTime',
      alignment: 'center',
      marginBottom: 'large',
    }),

    sectionTitle: createHtmlStyle({
      fontSize: 'sectionTitle',
      bold: true,
      alignment: 'center',
      marginTop: 'large',
      marginBottom: 'medium',
    }),

    readingTitle: createHtmlStyle({
      fontSize: 'readingTitle',
      color: htmlStyles.color,
      bold: true,
      alignment: 'right',
      marginTop: 'beforeReading',
    }),

    pericope: createHtmlStyle({
      fontSize: 'pericope',
      color: htmlStyles.color,
      italic: true,
      alignment: 'right',
    }),

    readerName: createHtmlStyle({
      fontSize: 'readerName',
      color: htmlStyles.color,
      alignment: 'right',
      marginBottom: 'small',
    }),

    introduction: createHtmlStyle({
      fontSize: 'introduction',
      italic: true,
      marginTop: 'small',
    }),

    readingText: createHtmlStyle({
      fontSize: 'text',
      lineHeight: 'normal',
      marginTop: 'small',
    }),

    conclusion: createHtmlStyle({
      fontSize: 'conclusion',
      italic: true,
      marginTop: 'small',
    }),

    response: createHtmlStyle({
      fontSize: 'response',
      marginTop: 'beforeResponse',
      marginBottom: 'afterResponse',
    }),
  },
};
