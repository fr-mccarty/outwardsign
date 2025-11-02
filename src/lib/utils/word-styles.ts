import { AlignmentType, IRunOptions, IParagraphOptions, PageBreak } from 'docx'

// Liturgy red color from CSS: #c41e3a
export const LITURGY_RED = 'c41e3a'

// Font sizes (in half-points, so multiply by 2)
// Adjusted for Word document readability (smaller than web equivalents)
export const FONT_SIZES = {
  title: 36,        // 18pt (liturgy-event-title)
  subtitle: 28,     // 14pt (liturgy-event-datetime, liturgy-reading-title, liturgy-pericope, liturgy-reader-name)
  section: 28,      // 14pt (liturgy-section-title)
  body: 22          // 11pt (body text)
}

// Text run styles for liturgy elements
export const textRunStyles = {
  // liturgy-event-title: text-3xl font-semibold text-center
  eventTitle: (): IRunOptions => ({
    size: FONT_SIZES.title,
    bold: true
  }),

  // liturgy-event-datetime: text-xl text-center
  eventDateTime: (): IRunOptions => ({
    size: FONT_SIZES.subtitle
  }),

  // liturgy-section-title: text-xl font-semibold
  sectionTitle: (): IRunOptions => ({
    size: FONT_SIZES.section,
    bold: true
  }),

  // liturgy-reading-title: text-right text-xl font-semibold + red
  readingTitle: (): IRunOptions => ({
    size: FONT_SIZES.subtitle,
    bold: true,
    color: LITURGY_RED
  }),

  // liturgy-pericope: text-right text-xl font-semibold italic + red
  pericope: (): IRunOptions => ({
    size: FONT_SIZES.subtitle,
    bold: true,
    italics: true,
    color: LITURGY_RED
  }),

  // liturgy-reader-name: text-right text-xl font-bold + red
  readerName: (): IRunOptions => ({
    size: FONT_SIZES.subtitle,
    bold: true,
    color: LITURGY_RED
  }),

  // liturgy-introduction: mt-3 font-semibold
  introduction: (): IRunOptions => ({
    bold: true
  }),

  // liturgy-text: mt-3 whitespace-pre-line
  text: (): IRunOptions => ({}),

  // liturgy-conclusion: mt-3 font-semibold
  conclusion: (): IRunOptions => ({
    bold: true
  }),

  // liturgy-response: mt-3 italic
  response: (): IRunOptions => ({
    italics: true
  }),

  // liturgy-response-label: font-semibold
  responseLabel: (): IRunOptions => ({
    bold: true
  }),

  // liturgy-petition-text: font-semibold
  petitionText: (): IRunOptions => ({
    bold: true
  }),

  // liturgy-petition-reader: font-bold
  petitionReader: (): IRunOptions => ({
    bold: true
  }),

  // liturgy-petition-pause: font-bold + red
  petitionPause: (): IRunOptions => ({
    bold: true,
    color: LITURGY_RED
  }),

  // liturgy-info-label: font-medium (using bold as Word doesn't have medium)
  infoLabel: (): IRunOptions => ({
    bold: true
  }),

  // Regular text
  normal: (): IRunOptions => ({})
}

// Paragraph styles for liturgy elements
// Spacing values are in twips (1/20th of a point). 240 = 12pt, 480 = 24pt, etc.
export const paragraphStyles = {
  // Center aligned (for titles)
  center: (): Partial<IParagraphOptions> => ({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 }
  }),

  // Right aligned (for reading headers)
  right: (): Partial<IParagraphOptions> => ({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 240 }
  }),

  // Left aligned (default)
  left: (): Partial<IParagraphOptions> => ({
    alignment: AlignmentType.LEFT,
    spacing: { after: 240 }
  }),

  // Event title paragraph
  eventTitle: (): Partial<IParagraphOptions> => ({
    alignment: AlignmentType.CENTER,
    spacing: { after: 480 } // 24pt space after
  }),

  // Event datetime paragraph
  eventDateTime: (): Partial<IParagraphOptions> => ({
    alignment: AlignmentType.CENTER,
    spacing: { after: 720 } // 36pt space after
  }),

  // Section title paragraph
  sectionTitle: (): Partial<IParagraphOptions> => ({
    spacing: { before: 720, after: 480 } // 36pt before, 24pt after
  }),

  // Reading title paragraph (right-aligned)
  readingTitle: (): Partial<IParagraphOptions> => ({
    alignment: AlignmentType.RIGHT,
    spacing: { before: 720, after: 240 } // 36pt before, 12pt after
  }),

  // Pericope paragraph (right-aligned)
  pericope: (): Partial<IParagraphOptions> => ({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 240 } // 12pt after
  }),

  // Reader name paragraph (right-aligned)
  readerName: (): Partial<IParagraphOptions> => ({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 480 } // 24pt after
  }),

  // Introduction paragraph
  introduction: (): Partial<IParagraphOptions> => ({
    spacing: { after: 240 } // 12pt after
  }),

  // Body text paragraph
  text: (): Partial<IParagraphOptions> => ({
    spacing: { after: 240 } // 12pt after
  }),

  // Conclusion paragraph
  conclusion: (): Partial<IParagraphOptions> => ({
    spacing: { after: 240 } // 12pt after
  }),

  // Response paragraph
  response: (): Partial<IParagraphOptions> => ({
    spacing: { after: 480 } // 24pt after
  }),

  // Info item paragraph (for key-value pairs)
  infoItem: (): Partial<IParagraphOptions> => ({
    spacing: { after: 240 } // 12pt after
  }),

  // Petition paragraph
  petition: (): Partial<IParagraphOptions> => ({
    spacing: { after: 240 } // 12pt after
  }),

  // Page break
  pageBreak: (): Partial<IParagraphOptions> => ({
    pageBreakBefore: true
  })
}

// Helper functions for common combinations
export const createTextRun = {
  eventTitle: (text: string) => ({ text, ...textRunStyles.eventTitle() }),
  eventDateTime: (text: string) => ({ text, ...textRunStyles.eventDateTime() }),
  sectionTitle: (text: string) => ({ text, ...textRunStyles.sectionTitle() }),
  readingTitle: (text: string) => ({ text, ...textRunStyles.readingTitle() }),
  pericope: (text: string) => ({ text, ...textRunStyles.pericope() }),
  readerName: (text: string) => ({ text, ...textRunStyles.readerName() }),
  introduction: (text: string) => ({ text, ...textRunStyles.introduction() }),
  text: (text: string) => ({ text, ...textRunStyles.text() }),
  conclusion: (text: string) => ({ text, ...textRunStyles.conclusion() }),
  response: (text: string) => ({ text, ...textRunStyles.response() }),
  responseLabel: (text: string) => ({ text, ...textRunStyles.responseLabel() }),
  petitionText: (text: string) => ({ text, ...textRunStyles.petitionText() }),
  petitionReader: (text: string) => ({ text, ...textRunStyles.petitionReader() }),
  petitionPause: (text: string) => ({ text, ...textRunStyles.petitionPause() }),
  infoLabel: (text: string) => ({ text, ...textRunStyles.infoLabel() }),
  normal: (text: string) => ({ text, ...textRunStyles.normal() })
}
