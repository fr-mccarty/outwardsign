# Renderer System Documentation

This document explains the liturgical content rendering system in Outward Sign, which converts structured `LiturgyDocument` objects into three different output formats: HTML (React), PDF, and Word documents.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Style Resolution System](#style-resolution-system)
- [Renderer Implementations](#renderer-implementations)
  - [HTML Renderer](#html-renderer)
  - [PDF Renderer](#pdf-renderer)
  - [Word Renderer](#word-renderer)
- [Element Type Reference](#element-type-reference)
- [Unit Conversions](#unit-conversions)
- [Usage Examples](#usage-examples)
- [Known Inconsistencies](#known-inconsistencies)

---

## Overview

The renderer system is designed with **separation of concerns**:

1. **Content Builders** create structured `LiturgyDocument` objects (element types, text, metadata)
2. **Style System** (`liturgical-script-styles.ts`) defines all styling in one place (single source of truth)
3. **Renderers** translate the document structure + styles into format-specific output

**Key Principle:** Renderers are **pure converters**—they never make styling decisions. All styling is resolved by the central style system.

### The Three Renderers

| Renderer | File | Output | Used For |
|----------|------|--------|----------|
| **HTML** | `html-renderer.tsx` | React JSX | View pages, print preview in browser |
| **PDF** | `pdf-renderer.ts` | pdfmake content | PDF downloads via API |
| **Word** | `word-renderer.ts` | docx Paragraphs | Word document downloads via API |

---

## Architecture

### Data Flow

```
Content Builder (liturgy-specific)
    ↓
LiturgyDocument (structured data with element types)
    ↓
Style Resolution (liturgical-script-styles.ts)
    ↓
Renderer (format-specific conversion)
    ↓
Output (HTML/PDF/Word)
```

### File Locations

```
src/lib/
├── content-builders/        # Create LiturgyDocument structures
│   ├── wedding/
│   ├── funeral/
│   └── mass/
├── styles/
│   └── liturgical-script-styles.ts  # Central style system
├── renderers/
│   ├── html-renderer.tsx            # React/HTML output
│   ├── pdf-renderer.ts              # pdfmake output
│   └── word-renderer.ts             # docx output
└── types/
    └── liturgy-content.ts           # TypeScript interfaces
```

---

## Style Resolution System

**File:** `src/lib/styles/liturgical-script-styles.ts`

### Core Concept

All style values are defined in **points** (standard print unit) and converted automatically by each renderer:
- HTML: points → pixels (1pt = 1.333px at 96dpi)
- PDF: points → pdfmake units (points directly)
- Word: points → twips (1pt = 20 twips)

### Style Definition

```typescript
export const ELEMENT_STYLES = {
  'section-title': {
    fontSize: 16,           // points
    bold: true,
    italic: false,
    color: 'black',
    alignment: 'center',
    marginTop: 9,           // points
    marginBottom: 6,        // points
    lineHeight: 1.4,
    preserveLineBreaks: false,
  },
  // ... all other element types
}
```

### Resolution Functions

**`resolveElementStyle(elementType)`**

Converts element type to concrete style properties with resolved colors:

```typescript
const style = resolveElementStyle('section-title')
// Returns:
// {
//   fontSize: 16,
//   bold: true,
//   italic: false,
//   color: '#000000',         // Color name resolved to hex
//   alignment: 'center',
//   marginTop: 9,
//   marginBottom: 6,
//   lineHeight: 1.4,
//   preserveLineBreaks: false,
// }
```

**`resolveSpacerSize(size)`**

Converts spacer size to point value:

```typescript
resolveSpacerSize('small')  // Returns 3 points
resolveSpacerSize('medium') // Returns 6 points
resolveSpacerSize('large')  // Returns 9 points
```

### ResolvedStyle Interface

```typescript
export interface ResolvedStyle {
  fontSize: number          // in points
  bold: boolean
  italic: boolean
  color: string            // hex color (e.g., '#000000' or '#c41e3a')
  alignment: 'left' | 'center' | 'right' | 'justify'
  marginTop: number        // in points
  marginBottom: number     // in points
  lineHeight: number       // multiplier (e.g., 1.4 = 140%)
  preserveLineBreaks: boolean
  width?: number | '*'     // Optional, used by some elements like info-row-label
}
```

---

## Renderer Implementations

### HTML Renderer

**File:** `src/lib/renderers/html-renderer.tsx`

**Purpose:** Converts `LiturgyDocument` to React JSX for display in browser.

#### Approach

1. Resolve style using `resolveElementStyle(elementType)`
2. Convert resolved style to React CSS properties
3. Render as React elements (divs, spans)

#### Style Application

```typescript
function applyResolvedStyle(style: ResolvedStyle): React.CSSProperties {
  return {
    fontSize: `${convert.pointsToPx(style.fontSize)}px`,
    fontWeight: style.bold ? 'bold' : 'normal',
    fontStyle: style.italic ? 'italic' : 'normal',
    color: style.color,
    textAlign: style.alignment,
    marginTop: `${convert.pointsToPx(style.marginTop)}px`,
    marginBottom: `${convert.pointsToPx(style.marginBottom)}px`,
    lineHeight: style.lineHeight,
    fontFamily: LITURGY_FONT,
    whiteSpace: style.preserveLineBreaks ? 'pre-wrap' : 'normal',
  }
}
```

#### Element Rendering Example

```typescript
case 'section-title': {
  const style = resolveElementStyle('section-title')
  return style ? (
    <div key={index} style={applyResolvedStyle(style)}>
      {element.text}
    </div>
  ) : null
}
```

#### Multi-Part Elements (response, petition)

Elements with label + text use multiple styled spans:

```typescript
case 'response': {
  const containerStyle = resolveElementStyle('response')
  const labelStyle = resolveElementStyle('response-label')
  const textStyle = resolveElementStyle('response-text')
  return containerStyle && labelStyle && textStyle ? (
    <div key={index} style={applyResolvedStyle(containerStyle)}>
      <span style={applyResolvedStyle(labelStyle)}>{element.label}</span>
      {' '}
      <span style={applyResolvedStyle(textStyle)}>{element.text}</span>
    </div>
  ) : null
}
```

#### Page Breaks

Uses Tailwind classes for print mode:

```typescript
if (section.pageBreakBefore) classes.push('print:break-before-page')
if (section.pageBreakAfter) classes.push('print:break-after-page')
```

Visual indicators (dashed borders) shown on screen, hidden when printing.

#### Return Value

```typescript
export function renderHTML(document: LiturgyDocument): React.ReactNode
```

---

### PDF Renderer

**File:** `src/lib/renderers/pdf-renderer.ts`

**Purpose:** Converts `LiturgyDocument` to pdfmake content array for PDF generation.

**Library:** Uses [pdfmake](http://pdfmake.org/) for PDF generation.

#### Approach

1. Resolve style using `resolveElementStyle(elementType)`
2. Convert resolved style to pdfmake format
3. Return pdfmake content objects

#### Style Application

```typescript
function applyResolvedStyle(style: ResolvedStyle) {
  return {
    fontSize: style.fontSize,        // Points directly (no conversion)
    bold: style.bold,
    italics: style.italic,           // Note: 'italics' not 'italic'
    color: style.color,
    alignment: style.alignment as 'left' | 'center' | 'right' | 'justify',
    margin: [0, style.marginTop, 0, style.marginBottom] as [number, number, number, number],
    lineHeight: style.lineHeight,
    preserveLeadingSpaces: style.preserveLineBreaks,
  }
}
```

#### Element Rendering Example

```typescript
case 'section-title': {
  const style = resolveElementStyle('section-title')
  return style ? {
    text: element.text,
    ...applyResolvedStyle(style),
  } : { text: '' }
}
```

#### Multi-Part Elements

Uses pdfmake's inline text array:

```typescript
case 'response': {
  const containerStyle = resolveElementStyle('response')
  const labelStyle = resolveElementStyle('response-label')
  const textStyle = resolveElementStyle('response-text')
  return containerStyle && labelStyle && textStyle ? {
    text: [
      {
        text: element.label || '',
        bold: labelStyle.bold,
        italics: labelStyle.italic,
        color: labelStyle.color,
        fontSize: labelStyle.fontSize,
      },
      {
        text: ' ' + (element.text || ''),
        bold: textStyle.bold,
        italics: textStyle.italic,
        color: textStyle.color,
        fontSize: textStyle.fontSize,
      },
    ],
    ...applyResolvedStyle(containerStyle),
  } : { text: '' }
}
```

#### info-row Column Layout

PDF renderer uses pdfmake's column layout for info rows:

```typescript
case 'info-row': {
  const containerStyle = resolveElementStyle('info-row')
  const labelStyle = resolveElementStyle('info-row-label')
  const valueStyle = resolveElementStyle('info-row-value')
  return containerStyle && labelStyle && valueStyle ? {
    columns: [
      {
        text: element.label,
        width: labelStyle.width,  // Fixed width: 150 points
        // ... styling
      },
      {
        text: element.value,
        width: '*',  // Fill remaining space
        // ... styling
      },
    ],
    margin: containerStyle.marginTop ? [0, containerStyle.marginTop, 0, containerStyle.marginBottom] : undefined,
  } : { text: '' }
}
```

#### Page Breaks

Uses pdfmake's pageBreak property:

```typescript
if (section.pageBreakBefore) {
  content.push({ text: '', pageBreak: 'before' as const })
}
```

#### Return Value

```typescript
export function renderPDF(document: LiturgyDocument): Content[]
```

Returns array of pdfmake content objects.

---

### Word Renderer

**File:** `src/lib/renderers/word-renderer.ts`

**Purpose:** Converts `LiturgyDocument` to docx Paragraphs for Word document generation.

**Library:** Uses [docx](https://docx.js.org/) library.

#### Approach

1. Resolve style using `resolveElementStyle(elementType)`
2. Convert resolved style to docx format (Paragraph + TextRun)
3. Return docx Paragraph objects

#### Helper Functions

**`createStyledParagraph(elementType, textRuns)`**

Wraps text runs in a styled paragraph:

```typescript
function createStyledParagraph(
  elementType: string,
  textRuns: TextRun[]
): Paragraph {
  const style = resolveElementStyle(elementType as any)
  if (!style) {
    return new Paragraph({ children: textRuns })
  }
  return applyResolvedStyleToParagraph(style, textRuns)
}
```

**`createStyledTextRun(elementType, text)`**

Creates a styled text run:

```typescript
function createStyledTextRun(
  elementType: string,
  text: string
): TextRun {
  const style = resolveElementStyle(elementType as any)
  if (!style) {
    return new TextRun({ text, font: LITURGY_FONT })
  }
  return applyResolvedStyleToTextRun(style, text)
}
```

#### Style Application

**Paragraph:**

```typescript
function applyResolvedStyleToParagraph(
  style: ResolvedStyle,
  textRuns: TextRun[]
): Paragraph {
  return new Paragraph({
    children: textRuns,
    alignment: getAlignmentType(style.alignment),
    spacing: {
      before: convert.pointsToTwips(style.marginTop),
      after: convert.pointsToTwips(style.marginBottom),
      line: style.lineHeight === 1.4 ? 280 : style.lineHeight === 1.2 ? 240 : 320,
    },
  })
}
```

**TextRun:**

```typescript
function applyResolvedStyleToTextRun(
  style: ResolvedStyle,
  text: string
): TextRun {
  return new TextRun({
    font: LITURGY_FONT,
    text: text,
    size: convert.pointsToHalfPoints(style.fontSize),  // Font size in half-points
    bold: style.bold,
    italics: style.italic,
    color: convert.colorToWord(style.color),  // Remove '#' prefix
  })
}
```

#### Element Rendering Example

```typescript
case 'section-title':
  return createStyledParagraph('section-title', [
    createStyledTextRun('section-title', element.text),
  ])
```

#### Multi-Part Elements

Multiple text runs in one paragraph:

```typescript
case 'response':
  return createStyledParagraph('response', [
    createStyledTextRun('response-label', element.label || ''),
    createStyledTextRun('response-text', ' ' + (element.text || '')),
  ])
```

#### info-row Handling

Word renderer uses inline text runs (no column layout):

```typescript
case 'info-row': {
  const infoStyle = resolveElementStyle('info-row')
  return new Paragraph({
    children: [
      createStyledTextRun('info-row-label', element.label),
      createStyledTextRun('info-row-value', ' ' + element.value),
    ],
    spacing: {
      before: convert.pointsToTwips(infoStyle.marginTop),
      after: convert.pointsToTwips(infoStyle.marginBottom),
    },
  })
}
```

#### Page Breaks

Uses docx's PageBreak object:

```typescript
if (section.pageBreakBefore) {
  paragraphs.push(new Paragraph({ children: [new PageBreak()] }))
}
```

#### Return Value

```typescript
export function renderWord(document: LiturgyDocument): Paragraph[]
```

Returns array of docx Paragraph objects.

---

## Element Type Reference

Complete list of supported element types and their purpose:

| Element Type | Purpose | Example |
|--------------|---------|---------|
| `event-title` | Main title of the liturgy | "Wedding of John & Jane" |
| `event-datetime` | Date and time of event | "Saturday, June 15, 2024 at 2:00 PM" |
| `section-title` | Major section heading | "LITURGY OF THE WORD" |
| `reading-title` | Reading heading | "FIRST READING" |
| `pericope` | Scripture reference | "Genesis 2:18-24" |
| `reader-name` | Name of person reading | "Reader: Sarah Johnson" |
| `introduction` | Introductory text before reading | "A reading from the Book of Genesis..." |
| `reading-text` | The scripture text itself | (The actual reading content) |
| `conclusion` | Concluding formula | "The Word of the Lord." |
| `response` | Call and response | Label: "R." Text: "Thanks be to God." |
| `priest-dialogue` | Priest's spoken text | "The Lord be with you." |
| `petition` | Prayer petition | Label: "For..." Text: "We pray to the Lord." |
| `text` | General body text | Any regular paragraph |
| `rubric` | Liturgical instruction | "(All stand)" |
| `prayer-text` | Text of a prayer | Prayer content with line breaks preserved |
| `priest-text` | Priest's prayer or blessing | Priest's spoken prayer |
| `info-row` | Label-value pair | Label: "Bride:" Value: "Jane Smith" |
| `spacer` | Vertical spacing | (Empty space) |
| `multi-part-text` | **DEPRECATED** | (Legacy, rendered as plain text) |

---

## Unit Conversions

**File:** `src/lib/styles/liturgical-script-styles.ts`

All measurements are stored in **points** and converted as needed:

```typescript
export const convert = {
  // Word uses twips (twentieths of a point) for spacing
  pointsToTwips: (points: number) => points * 20,

  // Word uses half-points for font sizes
  pointsToHalfPoints: (points: number) => points * 2,

  // HTML pixel conversion (1pt = 1.333px at 96dpi)
  pointsToPx: (points: number) => points * 1.333,

  // Color format conversions
  colorToWord: (hexColor: string) => hexColor.replace('#', ''),  // 'c41e3a'
  colorToHtml: (hexColor: string) => hexColor,                   // '#c41e3a'
  colorToPdf: (hexColor: string) => hexColor,                    // '#c41e3a'
}
```

### Why Points?

Points are the standard print measurement unit:
- **1 point = 1/72 inch**
- Used by all print design software (InDesign, Word, PDF)
- Makes styling predictable across formats

---

## Usage Examples

### Basic Usage in Content Builder

```typescript
import { renderHTML } from '@/lib/renderers/html-renderer'
import { renderPDF } from '@/lib/renderers/pdf-renderer'
import { renderWord } from '@/lib/renderers/word-renderer'
import { buildWeddingLiturgy } from '@/lib/content-builders/wedding'

// Build liturgy document
const liturgyDocument = buildWeddingLiturgy(wedding, templateId)

// Render to different formats
const htmlOutput = renderHTML(liturgyDocument)
const pdfContent = renderPDF(liturgyDocument)
const wordParagraphs = renderWord(liturgyDocument)
```

### View Page Example

```typescript
// src/app/(main)/weddings/[id]/wedding-view-client.tsx
import { renderHTML } from '@/lib/renderers/html-renderer'
import { buildWeddingLiturgy } from '@/lib/content-builders/wedding'

export function WeddingViewClient({ wedding }: { wedding: WeddingWithRelations }) {
  const templateId = wedding.wedding_template_id || 'default'
  const liturgyDocument = buildWeddingLiturgy(wedding, templateId)
  const liturgyHTML = renderHTML(liturgyDocument)

  return (
    <div
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: liturgyHTML }}
    />
  )
}
```

### PDF API Route Example

```typescript
// src/app/api/weddings/[id]/pdf/route.ts
import { renderPDF } from '@/lib/renderers/pdf-renderer'
import { buildWeddingLiturgy } from '@/lib/content-builders/wedding'
import pdfMake from 'pdfmake/build/pdfmake'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const wedding = await getWeddingWithRelations(params.id)
  const templateId = wedding.wedding_template_id || 'default'

  const liturgyDocument = buildWeddingLiturgy(wedding, templateId)
  const pdfContent = renderPDF(liturgyDocument)

  const docDefinition = {
    content: pdfContent,
    defaultStyle: {
      font: 'Helvetica',
    },
  }

  const pdfDoc = pdfMake.createPdf(docDefinition)
  // ... generate and return PDF
}
```

### Word API Route Example

```typescript
// src/app/api/weddings/[id]/word/route.ts
import { Document, Packer } from 'docx'
import { renderWord } from '@/lib/renderers/word-renderer'
import { buildWeddingLiturgy } from '@/lib/content-builders/wedding'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const wedding = await getWeddingWithRelations(params.id)
  const templateId = wedding.wedding_template_id || 'default'

  const liturgyDocument = buildWeddingLiturgy(wedding, templateId)
  const paragraphs = renderWord(liturgyDocument)

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  })

  const buffer = await Packer.toBuffer(doc)
  // ... return Word document
}
```

---

## Known Inconsistencies

The following sections document renderer differences. Most have been **resolved** (✅) or documented as **intentional design decisions** (✅). One item remains for future consideration (⚠️).

### 1. ✅ Spacer Handling - RESOLVED

**Status:** Fixed - PDF renderer now uses `resolveSpacerSize()` helper.

**Solution Implemented:**
Updated PDF renderer to use the proper abstraction layer:

**Before:**
```typescript
case 'spacer': {
  const spacerSize = element.size === 'large'
    ? ELEMENT_STYLES.spacer.large
    : element.size === 'medium'
    ? ELEMENT_STYLES.spacer.medium
    : ELEMENT_STYLES.spacer.small
  return { text: '', margin: [0, 0, 0, spacerSize] }
}
```

**After:**
```typescript
case 'spacer': {
  const spacerSize = resolveSpacerSize(element.size || 'small')
  return { text: '', margin: [0, 0, 0, spacerSize] }
}
```

**Benefits:**
- Consistent with HTML and Word renderers
- Follows architecture principle: renderers never access `ELEMENT_STYLES` directly
- Cleaner, more maintainable code

---

### 2. ✅ info-row Layout - Intentionally Different Approaches

**Status:** This is intentional design, not an inconsistency.

Each renderer handles `info-row` differently to leverage the strengths of each format:

- **HTML**: Uses CSS grid classes (`liturgy-info-grid`, `liturgy-info-label`) for responsive, flexible layout
- **PDF**: Uses pdfmake's column layout with fixed width (150 points) for precise print alignment
- **Word**: Uses inline text runs (label + value in one paragraph) due to docx library limitations

**Impact:** Visual appearance differs slightly between formats, but each is optimized for its medium.

**Rationale:**
- HTML benefits from responsive CSS capabilities
- PDF needs exact column alignment for professional print output
- Word's docx library doesn't provide easy column layout, so inline text is the pragmatic choice

**Consistency:** All three formats produce the same semantic content (label-value pairs) with similar visual appearance, just implemented using each format's native capabilities.

---

### 3. ✅ Line Height Conversion - RESOLVED

**Status:** Fixed - Word renderer now uses proper conversion function.

**Solution Implemented:**
Added `lineHeightToTwips` conversion function to the `convert` utility in `liturgical-script-styles.ts`:

```typescript
// Word line spacing: fontSize × lineHeight × 20 = spacing in twips
// Example: 11pt font with 1.4 lineHeight = 11 × 1.4 × 20 = 308 twips
lineHeightToTwips: (fontSize: number, lineHeight: number) => Math.round(fontSize * lineHeight * 20),
```

**Updated word-renderer.ts:**
```typescript
spacing: {
  before: convert.pointsToTwips(style.marginTop),
  after: convert.pointsToTwips(style.marginBottom),
  line: convert.lineHeightToTwips(style.fontSize, style.lineHeight),
}
```

**Benefits:**
- Supports any lineHeight value dynamically
- Formula is documented and clear
- Consistent with other conversion functions

---

### 4. ✅ Fallback Behavior - Intentionally Different (Idiomatic)

**Status:** This is intentional design using format-specific idioms.

Each renderer handles missing styles differently to match the idioms of its format:

- **HTML**: Returns `null` (idiomatic React - component renders nothing)
- **PDF**: Returns `{ text: '' }` (pdfmake empty text object)
- **Word**: Returns `new Paragraph({ children: [] })` (docx empty paragraph)

**When This Occurs:**
In practice, this should **never happen** for valid element types since all element types in `ContentElement` union have corresponding entries in `ELEMENT_STYLES`. This is defensive programming for:
- Development errors (missing style definition)
- Future element types not yet implemented
- Edge cases during refactoring

**Impact:** No practical impact - each format gracefully skips rendering the element using its most appropriate mechanism.

**Rationale:**
- **HTML**: `null` is the React way to render nothing - no unnecessary DOM nodes
- **PDF**: Empty text object maintains document flow without visual output
- **Word**: Empty paragraph is the docx equivalent of "nothing here"

**Consistency:** While the code differs, the semantic result is identical across all formats: the element is not rendered.

---

### 5. ⚠️ multi-part-text - Still in Use (Cannot Remove)

**Status:** Deprecated but actively used - must be maintained.

**Location:** All three renderer files + presentation templates

**Current Usage:**
`multi-part-text` is actively used in **all presentation templates**:
- `presentation/templates/simple-english.ts` (5 occurrences)
- `presentation/templates/simple-spanish.ts` (5 occurrences)
- `presentation/templates/full-script-english.ts` (5 occurrences)
- `presentation/templates/full-script-spanish.ts` (5 occurrences)
- `presentation/templates/bilingual.ts` (10+ occurrences)

**Why It's Used:**
Presentation templates use `multi-part-text` to combine labels with text:
```typescript
{
  type: 'multi-part-text',
  parts: [
    { text: 'CELEBRANT: ' },
    { text: `Do you commit to raise ${childName} in the Catholic faith?` }
  ]
}
```

**Migration Path:**
New content builders should use specific element types instead:
- Use `priest-dialogue` or `priest-text` for celebrant text
- Use `response` element (with `label` and `text` properties) for responses

**Conclusion:**
- **Cannot remove** - breaking change for presentation module
- **Keep deprecated** - discourage use in new templates
- Consider migrating presentation templates to use specific element types in a future refactor
- If used, document why it's needed

---

## Best Practices

### For Content Builder Authors

1. **Never specify styling in content builders** - only element types and text
2. **Use existing element types** - don't invent new ones without adding to ELEMENT_STYLES
3. **Trust the renderers** - they handle all format-specific conversion

### For Renderer Maintainers

1. **Never access ELEMENT_STYLES directly** - always use `resolveElementStyle()`
2. **Never make styling decisions** - only convert resolved styles to format
3. **Handle all element types** - even deprecated ones (until explicitly removed)
4. **Test all three formats** - changes to one may reveal issues in others

### Adding New Element Types

1. Add style definition to `ELEMENT_STYLES` in `liturgical-script-styles.ts`
2. Add type to `ContentElement` union in `liturgy-content.ts`
3. Implement rendering in all three renderers:
   - `html-renderer.tsx`
   - `pdf-renderer.ts`
   - `word-renderer.ts`
4. Test output in all three formats
5. Document in this file's Element Type Reference section

---

## Related Documentation

- **[LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md)** - Overview of content builders and liturgy document structure
- **[LITURGICAL_SCRIPT_REFERENCE.md](./LITURGICAL_SCRIPT_REFERENCE.md)** - Complete style reference and examples
- **[MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md)** - View client patterns (where renderers are used)
