# LITURGICAL_SCRIPT_SYSTEM.md

> **Documentation for Liturgical Script System**
>
> This file documents the complete system for creating, styling, and exporting liturgical scripts (wedding ceremonies, funerals, baptisms, presentations, etc.) in Outward Sign.

## Table of Contents

1. [Content Builder System](#content-builder-system)
2. [Template System](#template-system)
3. [Styling Liturgical Scripts](#styling-liturgical-scripts)
4. [Printing and Downloading Scripts](#printing-and-downloading-scripts)
5. [Complete Data Flow](#complete-data-flow)

---

## Content Builder System

The Content Builder system provides a **format-agnostic** way to represent liturgical documents that can be rendered to HTML, PDF, or Word with consistent styling.

### Core Type Interfaces

All liturgical content is built using these TypeScript interfaces defined in `src/lib/types/liturgy-content.ts`:

#### 1. ContentElement (Union Type)

A `ContentElement` represents a single piece of content with 16 possible types:

```typescript
// Basic text elements
type ContentElement =
  | TextElement              // Simple text with optional formatting
  | MultiPartTextElement     // Multi-part text (e.g., "People: Thanks be to God")

  // Title elements
  | EventTitleElement        // Event title (e.g., "Jane Doe & John Smith")
  | EventDateTimeElement     // Event date/time
  | SectionTitleElement      // Section title (e.g., "Rehearsal", "Wedding")
  | ReadingTitleElement      // Reading title (e.g., "FIRST READING", "Psalm")

  // Scripture-specific elements
  | PericopeElement          // Scripture reference (e.g., "Genesis 1:1-5")
  | ReaderNameElement        // Reader name
  | IntroductionElement      // Reading introduction (e.g., "A reading from...")
  | ReadingTextElement       // Scripture passage text
  | ConclusionElement        // Reading conclusion (e.g., "The word of the Lord")
  | ResponseElement          // Response (e.g., "People: Thanks be to God")

  // Ceremony-specific elements
  | PriestDialogueElement    // Priest/Deacon dialogue
  | PetitionElement          // Petition text

  // Layout elements
  | InfoRowElement           // Info grid row (label: value pairs)
  | SpacerElement            // Empty line for spacing
```

**Key Properties:**
- `type`: String literal identifying the element type
- `text`: Main content (for single-text elements)
- `parts`: Array of text segments with individual formatting (for multi-part elements)
- `formatting`: Optional array of `'bold' | 'italic' | 'bolditalic'`
- `alignment`: Optional `'left' | 'center' | 'right' | 'justify'`
- `color`: Optional `'default' | 'liturgy-red'`
- `preserveLineBreaks`: Boolean flag for maintaining line breaks in text

#### 2. ContentSection

A `ContentSection` groups related content elements:

```typescript
interface ContentSection {
  id: string                    // Unique identifier
  title?: string                // Optional section title
  pageBreakBefore?: boolean     // Insert page break before this section
  pageBreakAfter?: boolean      // Insert page break after this section
  elements: ContentElement[]    // Array of content elements
}
```

**Usage:**
- Organize related content (e.g., all First Reading elements in one section)
- Control pagination with `pageBreakBefore` and `pageBreakAfter`
- Sections are rendered sequentially in the final document

#### 3. LiturgyDocument

A `LiturgyDocument` represents the complete liturgical script:

```typescript
interface LiturgyDocument {
  // Metadata
  id: string                     // Entity ID
  type: 'wedding' | 'baptism' | 'funeral' | 'quinceanera' | 'presentation' | 'mass' | 'mass-intention'
  language: string               // 'en' or 'es'
  template: string               // Template ID used

  // Document header
  title: string                  // Main title (e.g., couple names)
  subtitle?: string              // Optional subtitle (e.g., event date/time)

  // Content
  sections: ContentSection[]     // Array of content sections
}
```

### Framework Structure

Every module follows this consistent structure:

#### Directory Structure

```
src/lib/content-builders/[module]/
├── index.ts                          # Template registry + main export function
└── templates/
    ├── full-script-english.ts        # English template builder
    ├── full-script-spanish.ts        # Spanish template builder
    └── [additional-templates].ts     # Other template variations
```

#### Main Export Pattern (`index.ts`)

**File:** `src/lib/content-builders/[module]/index.ts`

```typescript
import { [Module]WithRelations } from '@/lib/actions/[modules]'
import { LiturgyDocument, LiturgyTemplate } from '@/lib/types/liturgy-content'
import { buildFullScriptEnglish } from './templates/full-script-english'
import { buildFullScriptSpanish } from './templates/full-script-spanish'

/**
 * Template Registry
 * Maps template IDs to template definitions
 */
export const [MODULE]_TEMPLATES: Record<string, LiturgyTemplate<[Module]WithRelations>> = {
  '[module]-full-script-english': {
    id: '[module]-full-script-english',
    name: 'Full Ceremony Script (English)',
    description: 'Complete [module] liturgy with all readings, responses, and directions',
    supportedLanguages: ['en'],
    builder: buildFullScriptEnglish,
  },
  '[module]-full-script-spanish': {
    id: '[module]-full-script-spanish',
    name: 'Guión Completo de la Ceremonia (Español)',
    description: 'Liturgia completa de [module] con todas las lecturas, respuestas e indicaciones',
    supportedLanguages: ['es'],
    builder: buildFullScriptSpanish,
  },
}

/**
 * Main export: Build [module] liturgy content
 * @param entity - Entity with all relations populated
 * @param templateId - Template ID (defaults to English full script)
 * @returns Complete LiturgyDocument ready for rendering
 */
export function build[Module]Liturgy(
  entity: [Module]WithRelations,
  templateId: string = '[module]-full-script-english'
): LiturgyDocument {
  const template = [MODULE]_TEMPLATES[templateId] || [MODULE]_TEMPLATES['[module]-full-script-english']
  return template.builder(entity)
}
```

**Key Points:**
- Template registry uses a `Record<string, LiturgyTemplate>` pattern
- Each template has an ID, name, description, supported languages, and builder function
- Main export function looks up template and calls builder
- Provides sensible default template if requested template doesn't exist

#### WithRelations Pattern

**CRITICAL:** Content builders require entity types with all relations populated:

```typescript
// BAD: Base entity type (only has foreign key IDs)
interface Wedding {
  id: string
  bride_id: string
  groom_id: string
  first_reading_id: string
  // ... IDs only, no actual data
}

// GOOD: WithRelations type (has full related objects)
interface WeddingWithRelations extends Wedding {
  bride?: Person | null
  groom?: Person | null
  first_reading?: IndividualReading | null
  psalm?: IndividualReading | null
  wedding_event?: Event | null
  // ... all relations expanded to full objects
}
```

**Why this matters:**
- Content builders need actual data (names, text, dates), not just IDs
- Type-safe access to nested properties
- No need for additional database queries inside templates
- Eliminates unsafe `as any` type casts

**Implementation:**
```typescript
// In lib/actions/[module].ts
export async function get[Module]WithRelations(id: string): Promise<[Module]WithRelations | null> {
  // 1. Fetch base entity
  const entity = await getEntity(id)

  // 2. Use Promise.all() to fetch all related data in parallel
  const [bride, groom, firstReading, psalm, event] = await Promise.all([
    getPersonById(entity.bride_id),
    getPersonById(entity.groom_id),
    getReadingById(entity.first_reading_id),
    getReadingById(entity.psalm_id),
    getEventById(entity.wedding_event_id),
  ])

  // 3. Return merged object
  return {
    ...entity,
    bride,
    groom,
    first_reading: firstReading,
    psalm,
    wedding_event: event,
  }
}
```

### Shared Section Builders

Common liturgical elements are built using shared functions in `src/lib/content-builders/shared/script-sections.ts`:

#### buildReadingSection()

Builds a complete reading section (title, pericope, reader, introduction, text, conclusion, response):

```typescript
buildReadingSection({
  id: 'first-reading',
  title: 'FIRST READING',
  reading: wedding.first_reading,
  reader: wedding.first_reader,
  showNoneSelected?: boolean,
  includeGospelDialogue?: boolean,
  pageBreakBefore?: boolean,
})
```

#### buildPsalmSection()

Builds a psalm section (handles both sung and read psalms):

```typescript
buildPsalmSection({
  psalm: wedding.psalm,
  psalm_reader: wedding.psalm_reader,
  psalm_is_sung: wedding.psalm_is_sung,
})
```

#### buildPetitionsSection()

Builds petitions of the faithful:

```typescript
buildPetitionsSection({
  petitions: wedding.petitions,
  petition_reader: wedding.petition_reader,
  second_reader: wedding.second_reader,
  petitions_read_by_second_reader: wedding.petitions_read_by_second_reader,
})
```

#### buildAnnouncementsSection()

Builds announcements section:

```typescript
buildAnnouncementsSection(wedding.announcements)
```

**Benefits:**
- Consistent formatting across all modules
- Reusable logic reduces duplication
- Single source of truth for common patterns
- Easy to update styling for all modules at once

---

## Template System

Templates define the structure and content of liturgical documents. Each template is a TypeScript function that transforms entity data into a `LiturgyDocument`.

### Where Templates Are Stored

Templates are organized by module:

```
src/lib/content-builders/
├── wedding/
│   └── templates/
│       ├── full-script-english.ts
│       └── full-script-spanish.ts
├── funeral/
│   └── templates/
│       ├── full-script-english.ts
│       └── full-script-spanish.ts
├── baptism/
│   └── templates/
│       ├── summary-english.ts
│       └── summary-spanish.ts
├── presentation/
│   └── templates/
│       ├── full-script-english.ts
│       ├── full-script-spanish.ts
│       ├── simple-english.ts
│       ├── simple-spanish.ts
│       └── bilingual.ts
├── quinceanera/
│   └── templates/
│       └── full-script-english.ts
├── mass/
│   └── templates/
│       ├── full-script-english.ts
│       ├── full-script-spanish.ts
│       └── readings-only.ts
└── mass-intention/
    └── templates/
        └── intention-summary.ts
```

### How to Structure a Template

Every template file exports a single builder function that follows this pattern:

#### Template File Structure

**File:** `src/lib/content-builders/[module]/templates/[template-name].ts`

```typescript
import { [Module]WithRelations } from '@/lib/actions/[modules]'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatEventDateTime } from '@/lib/utils/formatters'
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection,
} from '@/lib/content-builders/shared/script-sections'

/**
 * Build [specific section name] section
 * Helper function for organizing section logic
 */
function build[SectionName]Section(entity: [Module]WithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Add section title
  elements.push({
    type: 'section-title',
    text: 'Section Title',
  })

  // Add info rows (label: value pairs)
  if (entity.some_field) {
    elements.push({
      type: 'info-row',
      label: 'Label:',
      value: entity.some_field,
    })
  }

  // Add related person info
  if (entity.related_person) {
    elements.push({
      type: 'info-row',
      label: 'Person:',
      value: formatPersonName(entity.related_person),
    })
  }

  // Add event info
  if (entity.event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Date & Time:',
      value: formatEventDateTime(entity.event),
    })
  }

  return {
    id: 'section-id',
    pageBreakAfter: true,  // Optional: add page break after section
    elements,
  }
}

/**
 * Main template builder function
 * Exported and registered in the template registry
 */
export function build[TemplateName](entity: [Module]WithRelations): LiturgyDocument {
  // Build document title
  const documentTitle = entity.title_field || 'Default Title'

  // Build subtitle (usually event date/time)
  const subtitle = entity.event?.start_date
    ? formatEventDateTime(entity.event)
    : 'Missing Date and Time'

  // Build all sections
  const sections: ContentSection[] = []

  // Add summary section
  sections.push(build[SectionName]Section(entity))

  // Add reading sections using shared builders
  sections.push(
    buildReadingSection({
      id: 'first-reading',
      title: 'FIRST READING',
      reading: entity.first_reading,
      reader: entity.first_reader,
      showNoneSelected: true,
    })
  )

  sections.push(
    buildPsalmSection({
      psalm: entity.psalm,
      psalm_reader: entity.psalm_reader,
      psalm_is_sung: entity.psalm_is_sung,
    })
  )

  // Add more sections as needed...

  // Return complete document
  return {
    id: entity.id,
    type: '[module]',
    language: 'en',
    template: '[template-id]',
    title: documentTitle,
    subtitle: subtitle,
    sections,
  }
}
```

### Template Registration

After creating a template file, register it in the module's `index.ts`:

```typescript
// In src/lib/content-builders/[module]/index.ts

import { build[NewTemplate] } from './templates/[new-template]'

export const [MODULE]_TEMPLATES: Record<string, LiturgyTemplate<[Module]WithRelations>> = {
  // ... existing templates
  '[module]-[new-template-id]': {
    id: '[module]-[new-template-id]',
    name: 'Display Name for UI',
    description: 'Detailed description of what this template includes',
    supportedLanguages: ['en'], // or ['es'] or ['en', 'es']
    builder: build[NewTemplate],
  },
}
```

### Template Usage

Templates are used in three places:

#### 1. View Pages (Web Display)

```typescript
// In src/app/(main)/[module]/[id]/[entity]-view-client.tsx
import { build[Module]Liturgy } from '@/lib/content-builders/[module]'
import { renderHTML } from '@/lib/renderers/html-renderer'

const templateId = entity.[entity]_template_id || '[module]-full-script-english'
const liturgyDocument = build[Module]Liturgy(entity, templateId)
const liturgyContent = renderHTML(liturgyDocument)

return <div>{liturgyContent}</div>
```

#### 2. Print Pages

```typescript
// In src/app/print/[module]/[id]/page.tsx
import { build[Module]Liturgy } from '@/lib/content-builders/[module]'
import { renderHTML } from '@/lib/renderers/html-renderer'

const templateId = entity.[entity]_template_id || '[module]-full-script-english'
const liturgyDocument = build[Module]Liturgy(entity, templateId)
const liturgyContent = renderHTML(liturgyDocument)

return (
  <div className="print-content">
    {liturgyContent}
  </div>
)
```

#### 3. Export API Routes (PDF/Word)

```typescript
// In src/app/api/[module]/[id]/pdf/route.ts
import { build[Module]Liturgy } from '@/lib/content-builders/[module]'
import { renderPDF } from '@/lib/renderers/pdf-renderer'

const templateId = entity.[entity]_template_id || '[module]-full-script-english'
const liturgyDocument = build[Module]Liturgy(entity, templateId)
const pdfContent = renderPDF(liturgyDocument)
// ... generate PDF file
```

### Common Template Patterns

#### Pattern 1: Event Header

Most templates start with event title and date/time:

```typescript
const sections: ContentSection[] = []

// Add header to first section
const summarySection = buildSummarySection(entity)
summarySection.elements.unshift(
  {
    type: 'event-title',
    text: entityTitle,
    alignment: 'center',
  },
  {
    type: 'event-datetime',
    text: eventDateTime,
    alignment: 'center',
  }
)
sections.push(summarySection)
```

#### Pattern 2: Conditional Sections

Only include sections if data exists:

```typescript
// Only add second reading if it exists
if (entity.second_reading) {
  sections.push(
    buildReadingSection({
      id: 'second-reading',
      title: 'SECOND READING',
      reading: entity.second_reading,
      reader: entity.second_reader,
      pageBreakBefore: true,
    })
  )
}
```

#### Pattern 3: Info Rows in Summary Section

Use info rows for key details:

```typescript
// Person with name only
if (entity.presider) {
  elements.push({
    type: 'info-row',
    label: 'Presider:',
    value: formatPersonName(entity.presider),
  })
}

// Person with phone number
if (entity.coordinator) {
  elements.push({
    type: 'info-row',
    label: 'Coordinator:',
    value: formatPersonWithPhone(entity.coordinator),
  })
}

// Event with location
if (entity.event?.location) {
  const location = entity.event.location
  const locationText = location.name +
    (location.street || location.city
      ? ` (${[location.street, location.city, location.state].filter(Boolean).join(', ')})`
      : '')
  elements.push({
    type: 'info-row',
    label: 'Location:',
    value: locationText,
  })
}
```

#### Pattern 4: Multi-Part Text with Formatting

Use when different parts need different formatting:

```typescript
elements.push({
  type: 'multi-part-text',
  parts: [
    { text: 'Priest: ', formatting: ['bold'], color: 'liturgy-red' },
    { text: 'The Lord be with you.' },
  ],
  alignment: 'left',
})

elements.push({
  type: 'response',
  parts: [
    { text: 'People: ', formatting: ['bold'] },
    { text: 'And with your spirit.' },
  ],
})
```

### Template Best Practices

1. **Keep templates focused** - One template per output format/language combination
2. **Use helper functions** - Break complex sections into separate builder functions
3. **Leverage shared builders** - Reuse `buildReadingSection`, `buildPsalmSection`, etc.
4. **Handle missing data gracefully** - Always check for null/undefined before accessing properties
5. **Use formatters** - Utilize `formatPersonName`, `formatEventDateTime` for consistency
6. **Add meaningful IDs** - Section IDs help with debugging and selective rendering
7. **Control pagination** - Use `pageBreakBefore`/`pageBreakAfter` for logical page breaks
8. **Document your template** - Add JSDoc comments explaining what the template includes

---

## Styling Liturgical Scripts

Outward Sign uses a **centralized styling system** that ensures consistent appearance across HTML, PDF, and Word outputs.

### Single Source of Truth: `liturgy-styles.ts`

**File:** `src/lib/styles/liturgy-styles.ts`

All styling is defined once in **points** (standard print unit) and automatically converted for each output format.

#### Base Style Definitions

```typescript
export const LITURGY_BASE_STYLES = {
  colors: {
    liturgyRed: '#c41e3a',  // Official liturgy red color
    black: '#000000',
    white: '#ffffff',
  },

  fonts: {
    primary: 'Helvetica',
  },

  fontSizes: {
    eventTitle: 18,      // points
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

    // Specific element spacing
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
    left: 'left',
    center: 'center',
    right: 'right',
    justify: 'justify',
  },

  margins: {
    page: 60,  // points (approximately 0.83 inches)
  },
}
```

### Unit Conversion System

The system automatically converts points to the appropriate unit for each format:

```typescript
export const convert = {
  // Word uses twips (twentieths of a point) for spacing
  pointsToTwips: (points: number) => points * 20,

  // Word uses half-points for font sizes
  pointsToHalfPoints: (points: number) => points * 2,

  // HTML pixel conversion (1pt = 1.333px at 96dpi)
  pointsToPx: (points: number) => points * 1.333,

  // CSS line-height is unitless multiplier
  lineHeightToCSS: (lineHeight: number) => lineHeight,
}
```

**Example:**
- Base definition: `fontSize: 14` (points)
- PDF output: `14` (pdfmake uses points natively)
- Word output: `28` (half-points, so 14 × 2)
- HTML output: `18.662px` (pixels, so 14 × 1.333)

### Format-Specific Style Objects

#### PDF Styles (pdfmake)

```typescript
export const pdfStyles = {
  color: LITURGY_BASE_STYLES.colors.liturgyRed,  // '#c41e3a'
  fonts: { primary: 'Helvetica' },
  sizes: {
    eventTitle: 18,  // Direct points
    text: 11,
    // ... all sizes
  },
  spacing: {
    medium: 6,       // Direct points
    large: 9,
    // ... all spacing values
  },
  // ... alignment, lineHeight, margins
}
```

#### Word Styles (docx)

```typescript
export const wordStyles = {
  color: 'c41e3a',  // Word uses color WITHOUT '#' prefix
  fonts: { primary: 'Helvetica' },
  sizes: {
    eventTitle: 36,  // Half-points (18 × 2)
    text: 22,        // Half-points (11 × 2)
    // ... all sizes converted
  },
  spacing: {
    medium: 120,     // Twips (6 × 20)
    large: 180,      // Twips (9 × 20)
    // ... all spacing converted
  },
  lineHeight: {
    tight: 240,      // 1.2 spacing (custom Word format)
    normal: 280,     // 1.4 spacing
    // ... all line heights
  },
  // ... alignment
}
```

#### HTML Styles (React inline styles)

```typescript
export const htmlStyles = {
  color: '#c41e3a',  // Standard hex with '#'
  fonts: { primary: 'Helvetica' },
  sizes: {
    eventTitle: '24px',     // Pixels (18 × 1.333)
    text: '14.663px',       // Pixels (11 × 1.333)
    // ... all sizes as pixel strings
  },
  spacing: {
    medium: '8px',          // Pixels (6 × 1.333)
    large: '12px',          // Pixels (9 × 1.333)
    // ... all spacing as pixel strings
  },
  lineHeight: {
    tight: '1.2',           // Unitless strings
    normal: '1.4',
    // ... all line heights
  },
  // ... alignment
}
```

### Style Builder Helpers

#### createPdfStyle()

Creates PDF-specific style objects:

```typescript
createPdfStyle({
  fontSize: 'eventTitle',     // Key from pdfStyles.sizes
  color: pdfStyles.color,     // Color string
  bold: true,
  italic: false,
  alignment: 'center',        // Key from pdfStyles.alignment
  lineHeight: 'normal',       // Key from pdfStyles.lineHeight
  marginTop: 6,               // Numeric points
  marginBottom: 3,            // Numeric points
})

// Returns pdfmake style object:
{
  fontSize: 18,
  color: '#c41e3a',
  bold: true,
  alignment: 'center',
  lineHeight: 1.4,
  margin: [0, 6, 0, 3]  // [left, top, right, bottom]
}
```

#### createHtmlStyle()

Creates HTML inline style objects:

```typescript
createHtmlStyle({
  fontSize: 'eventTitle',     // Key from htmlStyles.sizes
  color: htmlStyles.color,    // Color string
  bold: true,
  italic: false,
  alignment: 'center',        // Key from htmlStyles.alignment
  lineHeight: 'normal',       // Key from htmlStyles.lineHeight
  marginTop: 'medium',        // Key from htmlStyles.spacing
  marginBottom: 'small',      // Key from htmlStyles.spacing
})

// Returns React.CSSProperties object:
{
  fontSize: '24px',
  color: '#c41e3a',
  fontWeight: 'bold',
  textAlign: 'center',
  lineHeight: '1.4',
  marginTop: '8px',
  marginBottom: '4px',
  fontFamily: 'Helvetica'
}
```

### Predefined Style Patterns

The `liturgyPatterns` object provides pre-configured styles for common elements:

```typescript
export const liturgyPatterns = {
  pdf: {
    eventTitle: createPdfStyle({
      fontSize: 'eventTitle',
      bold: true,
      alignment: 'center',
      marginBottom: pdfStyles.spacing.tiny,
    }),

    readingTitle: createPdfStyle({
      fontSize: 'readingTitle',
      color: pdfStyles.color,
      bold: true,
      alignment: 'right',
      marginTop: pdfStyles.spacing.beforeReading,
    }),

    // ... all common patterns
  },

  html: {
    eventTitle: createHtmlStyle({
      fontSize: 'eventTitle',
      bold: true,
      alignment: 'center',
      marginBottom: 'tiny',
    }),

    readingTitle: createHtmlStyle({
      fontSize: 'readingTitle',
      color: htmlStyles.color,
      bold: true,
      alignment: 'right',
      marginTop: 'beforeReading',
    }),

    // ... all common patterns
  },
}
```

**Usage in renderers:**
```typescript
// PDF Renderer
return {
  text: element.text,
  style: liturgyPatterns.pdf.eventTitle
}

// HTML Renderer
return (
  <div style={liturgyPatterns.html.eventTitle}>
    {element.text}
  </div>
)
```

### Liturgy Red Color

The liturgy red color (`#c41e3a`) is used for:
- Reading titles and reader names
- Petition instructions and pauses
- Priest/deacon directions and cues
- Any element marked with `color: 'liturgy-red'`

**Format-specific handling:**
- **PDF:** `#c41e3a` (hex string)
- **Word:** `c41e3a` (no # prefix)
- **HTML:** `#c41e3a` (standard hex)

### Print-Specific Styling

Print pages (`src/app/print/[module]/[id]/page.tsx`) use inline styles to ensure liturgy red prints correctly:

```typescript
<style dangerouslySetInnerHTML={{ __html: `
  body {
    background: white !important;
    color: black !important;
    padding: 2rem !important;
  }
  .print-content div[style*="color: rgb(196, 30, 58)"],
  .print-content div[style*="color:#c41e3a"],
  .print-content div[style*="color: #c41e3a"] {
    color: rgb(196, 30, 58) !important;
  }
  .print-content span[style*="color: rgb(196, 30, 58)"],
  .print-content span[style*="color:#c41e3a"],
  .print-content span[style*="color: #c41e3a"] {
    color: rgb(196, 30, 58) !important;
  }
`}} />
```

**Key Points:**
- Ensures white background and black text for printing
- Preserves liturgy red color in print output
- Uses `!important` to override theme styles
- Targets both `div` and `span` elements with liturgy red color

---

## Printing and Downloading Scripts

Outward Sign provides three ways to output liturgical scripts:
1. **Print View** (HTML page optimized for printing)
2. **PDF Download** (API route generates PDF file)
3. **Word Download** (API route generates .docx file)

### Architecture Overview

```
Entity Data
    ↓
get[Module]WithRelations(id)
    ↓
build[Module]Liturgy(entity, templateId)
    ↓
LiturgyDocument (format-agnostic)
    ↓
    ├─────────────────────┬──────────────────────┐
    ↓                     ↓                      ↓
renderHTML()        renderPDF()            renderWord()
    ↓                     ↓                      ↓
React JSX           pdfmake Content        docx Paragraphs
    ↓                     ↓                      ↓
Print View          PDF File               Word File
(/print/[module]/[id])  (/api/[module]/[id]/pdf)  (/api/[module]/[id]/word)
```

### 1. Print View Page

**Purpose:** Display liturgy in browser window, optimized for printing or saving as PDF via browser print dialog

**File Location:** `src/app/print/[module]/[id]/page.tsx`

**Pattern:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { get[Module]WithRelations } from '@/lib/actions/[modules]'
import { build[Module]Liturgy } from '@/lib/content-builders/[module]'
import { renderHTML } from '@/lib/renderers/html-renderer'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Print[Module]Page({ params }: PageProps) {
  // 1. Authenticate user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch entity with all relations
  const { id } = await params
  const entity = await get[Module]WithRelations(id)
  if (!entity) {
    notFound()
  }

  // 3. Build liturgy document
  const templateId = entity.[entity]_template_id || '[module]-full-script-english'
  const liturgyDocument = build[Module]Liturgy(entity, templateId)

  // 4. Render to HTML
  const liturgyContent = renderHTML(liturgyDocument)

  // 5. Return with print-specific styling
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          background: white !important;
          color: black !important;
          padding: 2rem !important;
        }
        .print-container {
          max-width: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        .[module]-print-content div {
          color: black !important;
        }
        .[module]-print-content div[style*="color: rgb(196, 30, 58)"],
        .[module]-print-content div[style*="color:#c41e3a"],
        .[module]-print-content div[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
        .[module]-print-content span[style*="color: rgb(196, 30, 58)"],
        .[module]-print-content span[style*="color:#c41e3a"],
        .[module]-print-content span[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
      `}} />
      <div className="[module]-print-content">
        {liturgyContent}
      </div>
    </>
  )
}
```

**Key Features:**
- Server-side rendered page (async function, no 'use client')
- Authenticates user before displaying content
- Fetches entity with all relations
- Builds and renders liturgy using content builder + HTML renderer
- Injects inline styles for print optimization
- Preserves liturgy red color in print
- Opens in new browser tab from ModuleViewPanel

**URL Pattern:** `/print/[module-plural]/[id]`
- Example: `/print/weddings/123-abc-456`

**Directory Naming:** Must use PLURAL module name to match `modulePath` prop from ModuleViewPanel

### 2. PDF Download (API Route)

**Purpose:** Generate and download PDF file of liturgy script

**File Location:** `src/app/api/[module-plural]/[id]/pdf/route.ts`

**Pattern:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { get[Module]WithRelations } from '@/lib/actions/[modules]'
import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { pdfStyles } from '@/lib/styles/liturgy-styles'
import { build[Module]Liturgy } from '@/lib/content-builders/[module]'
import { renderPDF } from '@/lib/renderers/pdf-renderer'

// Define fonts for pdfmake
const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
}

const printer = new PdfPrinter(fonts)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Fetch entity with relations
    const { id } = await params
    const entity = await get[Module]WithRelations(id)

    if (!entity) {
      return NextResponse.json({ error: '[Module] not found' }, { status: 404 })
    }

    // 2. Build liturgy document
    const templateId = entity.[entity]_template_id || '[module]-full-script-english'
    const liturgyDocument = build[Module]Liturgy(entity, templateId)

    // 3. Render to PDF format
    const content = renderPDF(liturgyDocument)

    // 4. Create PDF document definition
    const docDefinition: TDocumentDefinitions = {
      content,
      pageMargins: [
        pdfStyles.margins.page,
        pdfStyles.margins.page,
        pdfStyles.margins.page,
        pdfStyles.margins.page
      ]
    }

    // 5. Generate PDF
    const pdfDoc = printer.createPdfKitDocument(docDefinition)

    // 6. Collect PDF buffer
    const chunks: Buffer[] = []
    pdfDoc.on('data', (chunk) => chunks.push(chunk))

    await new Promise<void>((resolve, reject) => {
      pdfDoc.on('end', () => resolve())
      pdfDoc.on('error', reject)
      pdfDoc.end()
    })

    const pdfBuffer = Buffer.concat(chunks)

    // 7. Generate filename
    const filename = generateFilename(entity, 'pdf')

    // 8. Return PDF file
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
```

**Filename Generation Pattern:**

Filenames should be descriptive and include key identifying information:

```typescript
// Wedding example
const brideLastName = wedding.bride?.last_name || 'Bride'
const groomLastName = wedding.groom?.last_name || 'Groom'
const weddingDate = wedding.wedding_event?.start_date
  ? new Date(wedding.wedding_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
  : 'NoDate'
const filename = `${brideLastName}-${groomLastName}-${weddingDate}.pdf`
// Result: "Smith-Johnson-20250315.pdf"

// Funeral example
const deceasedLastName = funeral.deceased?.last_name || 'Deceased'
const funeralDate = funeral.funeral_event?.start_date
  ? new Date(funeral.funeral_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
  : 'NoDate'
const filename = `${deceasedLastName}-Funeral-${funeralDate}.pdf`
// Result: "Williams-Funeral-20250320.pdf"
```

**URL Pattern:** `/api/[module-plural]/[id]/pdf`
- Example: `/api/weddings/123-abc-456/pdf`

**Integration:** ModuleViewPanel automatically creates download link using this route

### 3. Word Download (API Route)

**Purpose:** Generate and download Word document (.docx) of liturgy script

**File Location:** `src/app/api/[module-plural]/[id]/word/route.ts`

**Pattern:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { get[Module]WithRelations } from '@/lib/actions/[modules]'
import { Document, Packer } from 'docx'
import { build[Module]Liturgy } from '@/lib/content-builders/[module]'
import { renderWord } from '@/lib/renderers/word-renderer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Fetch entity with relations
    const { id } = await params
    const entity = await get[Module]WithRelations(id)

    if (!entity) {
      return NextResponse.json({ error: '[Module] not found' }, { status: 404 })
    }

    // 2. Build liturgy document
    const templateId = entity.[entity]_template_id || '[module]-full-script-english'
    const liturgyDocument = build[Module]Liturgy(entity, templateId)

    // 3. Render to Word format
    const paragraphs = renderWord(liturgyDocument)

    // 4. Create Word document
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    })

    // 5. Generate Word document buffer
    const buffer = await Packer.toBuffer(doc)

    // 6. Generate filename
    const filename = generateFilename(entity, 'docx')

    // 7. Return Word document
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Error generating Word document:', error)
    return NextResponse.json({ error: 'Failed to generate Word document' }, { status: 500 })
  }
}
```

**URL Pattern:** `/api/[module-plural]/[id]/word`
- Example: `/api/weddings/123-abc-456/word`

**Integration:** ModuleViewPanel automatically creates download link using this route

### Renderer Details

#### HTML Renderer

**File:** `src/lib/renderers/html-renderer.tsx`

Converts `LiturgyDocument` to React JSX elements:

```typescript
import { LiturgyDocument } from '@/lib/types/liturgy-content'
import { liturgyPatterns, htmlStyles } from '@/lib/styles/liturgy-styles'

export function renderHTML(document: LiturgyDocument): React.ReactNode {
  return (
    <>
      {document.sections.map((section, index) => (
        <div key={section.id || index}>
          {section.elements.map((element, elemIndex) => {
            // Render each element type
            switch (element.type) {
              case 'event-title':
                return (
                  <div key={elemIndex} style={liturgyPatterns.html.eventTitle}>
                    {element.text}
                  </div>
                )

              case 'reading-title':
                return (
                  <div key={elemIndex} style={liturgyPatterns.html.readingTitle}>
                    {element.text}
                  </div>
                )

              // ... all other element types

              default:
                return null
            }
          })}
        </div>
      ))}
    </>
  )
}
```

**Features:**
- Returns React JSX elements directly renderable in components
- Uses `liturgyPatterns.html` for consistent styling
- Handles multi-part text with individual span formatting
- Supports `preserveLineBreaks` with `whiteSpace: 'pre-wrap'`
- Respects `pageBreakAfter` with `print:break-after-page` class

#### PDF Renderer

**File:** `src/lib/renderers/pdf-renderer.ts`

Converts `LiturgyDocument` to pdfmake content array:

```typescript
import { LiturgyDocument } from '@/lib/types/liturgy-content'
import { Content } from 'pdfmake/interfaces'
import { liturgyPatterns, pdfStyles } from '@/lib/styles/liturgy-styles'

export function renderPDF(document: LiturgyDocument): Content[] {
  const content: Content[] = []

  for (const section of document.sections) {
    for (const element of section.elements) {
      switch (element.type) {
        case 'event-title':
          content.push({
            text: element.text,
            ...liturgyPatterns.pdf.eventTitle
          })
          break

        case 'info-row':
          content.push({
            columns: [
              { text: element.label, width: 150, bold: true },
              { text: element.value, width: '*' }
            ],
            margin: [0, pdfStyles.spacing.tiny, 0, 0]
          })
          break

        // ... all other element types
      }
    }

    // Handle page breaks
    if (section.pageBreakAfter && section !== lastSection) {
      content.push({ text: '', pageBreak: 'after' })
    }
  }

  return content
}
```

**Features:**
- Returns pdfmake `Content[]` array
- Uses `liturgyPatterns.pdf` for consistent styling
- Handles columns layout for info rows
- Supports page breaks with `pageBreak: 'after'`
- Converts multi-part text to pdfmake text array format

#### Word Renderer

**File:** `src/lib/renderers/word-renderer.ts`

Converts `LiturgyDocument` to docx Paragraph array:

```typescript
import { LiturgyDocument } from '@/lib/types/liturgy-content'
import { Paragraph, TextRun, AlignmentType, PageBreak } from 'docx'
import { wordStyles } from '@/lib/styles/liturgy-styles'

export function renderWord(document: LiturgyDocument): Paragraph[] {
  const paragraphs: Paragraph[] = []

  for (const section of document.sections) {
    for (const element of section.elements) {
      switch (element.type) {
        case 'event-title':
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: element.text,
                  bold: true,
                  size: wordStyles.sizes.eventTitle,
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: wordStyles.spacing.tiny }
            })
          )
          break

        case 'multi-part-text':
          paragraphs.push(
            new Paragraph({
              children: element.parts.map(part =>
                new TextRun({
                  text: part.text,
                  bold: part.formatting?.includes('bold'),
                  italics: part.formatting?.includes('italic'),
                  color: part.color === 'liturgy-red' ? wordStyles.color : undefined,
                  size: wordStyles.sizes.text,
                })
              ),
              spacing: {
                before: wordStyles.spacing.small,
                after: wordStyles.spacing.small
              }
            })
          )
          break

        // ... all other element types
      }
    }

    // Handle page breaks
    if (section.pageBreakAfter && section !== lastSection) {
      paragraphs.push(new Paragraph({ children: [new PageBreak()] }))
    }
  }

  return paragraphs
}
```

**Features:**
- Returns docx `Paragraph[]` array
- Uses `wordStyles` for Word-specific formatting (half-points, twips)
- Creates TextRun objects with proper formatting
- Handles page breaks with `PageBreak` element
- Supports columns for info rows using Table elements

### ModuleViewPanel Integration

The `ModuleViewPanel` component provides a consistent UI for accessing print and download features:

```typescript
<ModuleViewPanel
  entity={entity}
  entityType="[Module]"
  modulePath="[modules]"
  mainEvent={entity.[module]_event}
  generateFilename={(ext) => `[filename-pattern].${ext}`}
/>
```

**Features:**
- **Print View button** - Opens print page in new tab
- **Download PDF button** - Triggers PDF download via API route
- **Download Word button** - Triggers Word download via API route
- Consistent UI across all modules
- Handles loading states
- Shows error messages on failure

---

## Complete Data Flow

### Step-by-Step Flow

```
1. USER ACTION
   └─ Clicks "View" on wedding from list page

2. NAVIGATION
   └─ Router navigates to /weddings/123-abc-456

3. SERVER PAGE LOAD (src/app/(main)/weddings/[id]/page.tsx)
   ├─ Authenticate user
   ├─ Call getWeddingWithRelations(id)
   │   ├─ Fetch base wedding entity
   │   └─ Use Promise.all() to fetch all relations in parallel:
   │       ├─ bride (Person)
   │       ├─ groom (Person)
   │       ├─ first_reading (IndividualReading)
   │       ├─ psalm (IndividualReading)
   │       ├─ wedding_event (Event with Location)
   │       └─ ... all other foreign keys
   ├─ Define breadcrumbs
   └─ Pass wedding (WeddingWithRelations) to client component

4. CLIENT COMPONENT RENDER (src/app/(main)/weddings/[id]/wedding-view-client.tsx)
   ├─ Receive wedding entity with all relations
   ├─ Render ModuleViewPanel (side panel with buttons)
   └─ Build and render liturgy content:
       ├─ Extract templateId from wedding.wedding_template_id
       ├─ Call buildWeddingLiturgy(wedding, templateId)
       │   ├─ Look up template from WEDDING_TEMPLATES registry
       │   ├─ Call template.builder(wedding)
       │   │   ├─ Build summary section with info rows
       │   │   ├─ Build reading sections using buildReadingSection()
       │   │   ├─ Build psalm section using buildPsalmSection()
       │   │   ├─ Build petitions section
       │   │   └─ Build announcements section
       │   └─ Return LiturgyDocument with all sections
       ├─ Call renderHTML(liturgyDocument)
       │   ├─ Iterate through sections
       │   ├─ Render each element based on type
       │   └─ Apply htmlStyles and liturgyPatterns.html
       └─ Display rendered React JSX

5. USER CLICKS "PRINT VIEW"
   └─ Opens /print/weddings/123-abc-456 in new tab
       ├─ Server page authenticates user
       ├─ Fetches wedding with relations
       ├─ Builds liturgy document
       ├─ Renders HTML with print-specific styles
       └─ User can print or save as PDF from browser

6. USER CLICKS "DOWNLOAD PDF"
   └─ Browser requests /api/weddings/123-abc-456/pdf
       ├─ API route fetches wedding with relations
       ├─ Builds liturgy document
       ├─ Calls renderPDF(liturgyDocument)
       │   ├─ Converts to pdfmake Content[]
       │   └─ Applies pdfStyles and liturgyPatterns.pdf
       ├─ Creates PDF with pdfmake printer
       ├─ Generates filename: "Smith-Johnson-20250315.pdf"
       └─ Returns PDF file for download

7. USER CLICKS "DOWNLOAD WORD"
   └─ Browser requests /api/weddings/123-abc-456/word
       ├─ API route fetches wedding with relations
       ├─ Builds liturgy document
       ├─ Calls renderWord(liturgyDocument)
       │   ├─ Converts to docx Paragraph[]
       │   └─ Applies wordStyles
       ├─ Creates Word document with docx library
       ├─ Generates filename: "Smith-Johnson-20250315.docx"
       └─ Returns Word file for download
```

### Key Principles

1. **Single Source of Truth**
   - Content builders generate format-agnostic `LiturgyDocument`
   - Same document structure rendered to HTML, PDF, and Word
   - Styling defined once in `liturgy-styles.ts`

2. **Format Agnosticism**
   - Content builders don't know about output format
   - Renderers handle format-specific conversions
   - Consistent appearance across all formats

3. **WithRelations Pattern**
   - Fetch all related data once, upfront
   - Pass complete entity to content builder
   - No additional database queries during rendering

4. **Parallel Data Fetching**
   - Use `Promise.all()` to fetch relations simultaneously
   - Minimize database round trips
   - Improve performance

5. **Centralized Styling**
   - Base styles in points
   - Automatic unit conversion for each format
   - Predefined patterns for common elements
   - Liturgy red color preserved across formats

6. **Consistent Module Structure**
   - Template registry pattern
   - Shared section builders
   - Reusable renderers
   - Same flow for all modules

7. **Type Safety**
   - Strong TypeScript typing throughout
   - `WithRelations` interfaces eliminate unsafe casts
   - Compile-time validation of content structure

### Adding a New Module

To add liturgical script support to a new module:

1. **Create WithRelations type** in `lib/actions/[module].ts`
2. **Create get[Module]WithRelations()** function
3. **Create content builder directory** `lib/content-builders/[module]/`
4. **Create template files** in `templates/` subdirectory
5. **Create template registry** in `index.ts`
6. **Create print page** at `app/print/[module-plural]/[id]/page.tsx`
7. **Create PDF API route** at `app/api/[module-plural]/[id]/pdf/route.ts`
8. **Create Word API route** at `app/api/[module-plural]/[id]/word/route.ts`
9. **Update view client** to use ModuleViewContainer or build liturgy directly
10. **Test all three output formats** (HTML, PDF, Word)

### Reference Implementations

**Complete Reference:** Wedding module
- Content builder: `src/lib/content-builders/wedding/`
- Print page: `src/app/print/weddings/[id]/page.tsx`
- PDF route: `src/app/api/weddings/[id]/pdf/route.ts`
- Word route: `src/app/api/weddings/[id]/word/route.ts`
- View client: `src/app/(main)/weddings/[id]/wedding-view-client.tsx`

**Additional Examples:**
- Funeral module (similar structure)
- Presentation module (multiple templates)
- Baptism module (simplified summary template)
- Mass module (readings-only template)

---

## Summary

The liturgical script system in Outward Sign provides a powerful, flexible, and maintainable way to generate ceremony documents across multiple formats. By following the patterns documented here, you can:

- Create new templates with consistent structure
- Ensure identical styling across HTML, PDF, and Word outputs
- Leverage shared builders for common elements
- Maintain type safety throughout the system
- Add new modules with minimal duplication

**Key Files:**
- Types: `src/lib/types/liturgy-content.ts`
- Styles: `src/lib/styles/liturgy-styles.ts`
- Renderers: `src/lib/renderers/`
- Content Builders: `src/lib/content-builders/`
- Shared Builders: `src/lib/content-builders/shared/script-sections.ts`

**When in doubt, follow the wedding module pattern** - it demonstrates all the key concepts and serves as the reference implementation for the system.
