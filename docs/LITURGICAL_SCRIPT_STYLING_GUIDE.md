# Liturgical Script Styling Guide

> **Quick reference for styling liturgical scripts**
>
> **To edit styles:** See [STYLE_VALUES.md](./STYLE_VALUES.md) for easy-to-edit style values.
> **For setup/architecture:** See [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md).

---

## 🔴 CRITICAL - Calculation Placement for Reusability

When building liturgical scripts, follow these rules for where calculations should live:

1. **Most calculations belong in `helpers.ts`** (exported from `index.ts`)
   - Name formatting, title building, conditional text logic
   - Any logic used across multiple templates
   - **Why:** Reusability across all templates (English, Spanish, Simple, Bilingual, etc.)

2. **Exception: Sex-based calculations can be done in templates**
   - Use the `gendered()` helper function OR inline sex checks
   - Templates can check `person?.sex` directly when needed

3. **Avoid duplicating logic across templates**
   - If multiple templates need the same calculation, move it to `helpers.ts`
   - Templates should focus on structure and styling, not complex logic

**See [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md) for detailed examples and implementation guidance.**

---

## Table of Contents

1. [Styling Overview](#styling-overview)
2. [Page Breaks](#page-breaks)
3. [Content Element Types](#content-element-types)
4. [Section Structure](#section-structure)

---

## Styling Overview

### Quick Style Reference

**To change styles:** Edit `src/lib/styles/liturgical-script-styles.ts`

**Current style values:**

| Style Category | Key Values |
|----------------|------------|
| **Font Sizes** | Titles: 18pt/16pt/14pt, Body: 11pt |
| **Spacing** | Small: 3pt, Medium: 6pt, Large: 9pt |
| **Line Height** | Normal: 1.4 (recommended) |
| **Colors** | Liturgy Red: `#c41e3a`, Black: `#000000` |
| **Page Margins** | 60pt (~0.83 inches) |

### How Styling Works

**All styles are controlled centrally** in `src/lib/styles/liturgical-script-styles.ts`.

**Elements do NOT have style properties** - no `alignment`, `formatting`, `color`, or `preserveLineBreaks` on individual elements.

**Each element type gets its style automatically** based on its `type`:
- `'section-title'` → 16pt, bold, center aligned
- `'reading-title'` → 14pt, bold, liturgy red, right aligned
- `'response'` → Label bold, text normal
- `'petition'` → Label bold + liturgy red

**To change how an element type looks:** Edit the element's style definition in `liturgical-script-styles.ts`

---

## Page Breaks

Page breaks control where new pages start in PDF and Word outputs. **They have no effect on HTML/web display.**

### How to Add Page Breaks

Add at the section level:

```typescript
{
  id: 'section-id',
  title: 'Section Title',
  pageBreakBefore: true,   // Start this section on a new page
  pageBreakAfter: true,    // Force next section to new page
  elements: [...]
}
```

### When to Use Page Breaks

#### `pageBreakBefore: true`
Start a section on a fresh page:
- **Gospel reading** - Traditional to start on new page
- **Marriage vows** - Keep ceremony core on dedicated page
- **Major sections** - Separate vigil from mass, rehearsal from ceremony

```typescript
{
  id: 'gospel',
  title: 'Gospel',
  pageBreakBefore: true,  // Gospel always starts on new page
  elements: [...]
}
```

#### `pageBreakAfter: true`
Force the next section to a new page:
- **Summary/cover page** - Separate from ceremony content
- **Rehearsal instructions** - Keep distinct from ceremony
- **Final announcements** - Separate from main liturgy

```typescript
{
  id: 'summary',
  title: 'Wedding Summary',
  pageBreakAfter: true,  // Keep summary on its own page
  elements: [...]
}
```

#### Both Together
Isolate a section on its own page:

```typescript
{
  id: 'special-instructions',
  pageBreakBefore: true,   // Start on new page
  pageBreakAfter: true,    // Next section starts on new page too
  elements: [...]
}
```

### Common Page Break Patterns

**Wedding Full Script:**
```typescript
[
  { id: 'summary', pageBreakAfter: true },           // Summary page 1
  { id: 'first-reading' },                           // Readings flow
  { id: 'psalm' },
  { id: 'second-reading' },
  { id: 'gospel', pageBreakBefore: true },           // Gospel new page
  { id: 'marriage-vows' },
  { id: 'petitions', pageBreakBefore: true },        // Petitions new page
]
```

**Funeral Full Script:**
```typescript
[
  { id: 'summary', pageBreakAfter: true },           // Summary page 1
  { id: 'vigil', pageBreakBefore: true },            // Vigil page 2
  { id: 'funeral-mass', pageBreakBefore: true },     // Mass new page
  { id: 'committal', pageBreakBefore: true }         // Committal new page
]
```

**Important Notes:**
- Page breaks are **suggestions** - PDF/Word may adjust based on content
- Don't overuse - let content flow naturally when possible
- Test print/PDF output to verify breaks work as intended
- Page breaks are ignored in web/HTML view (continuous scroll)

---

## Content Element Types

### Basic Text

#### TextElement
Simple text. Style is controlled by `liturgical-script-styles.ts`.

```typescript
{
  type: 'text',
  text: string
}
```

**Example:**
```typescript
{
  type: 'text',
  text: 'The Lord be with you.'
}
```

#### MultiPartTextElement
Multiple text parts with individual formatting (e.g., "**Priest:** The Lord be with you").

```typescript
{
  type: 'multi-part-text',
  parts: [
    {
      text: string,
      formatting?: ['bold'] | ['italic'] | ['bolditalic'],
      color?: 'default' | 'liturgy-red'
    }
  ]
}
```

**Example:**
```typescript
{
  type: 'multi-part-text',
  parts: [
    { text: 'Priest: ', formatting: ['bold'], color: 'liturgy-red' },
    { text: 'The Lord be with you.' }
  ]
}
```

**Note:** `multi-part-text` still supports per-part formatting for complex mixed-format text.

---

### Titles

#### EventTitleElement
Main event title (couple names, deceased name).

```typescript
{
  type: 'event-title',
  text: string
}
```

**Style:** 18pt, bold, center aligned

#### EventDateTimeElement
Event date and time.

```typescript
{
  type: 'event-datetime',
  text: string
}
```

**Style:** 14pt, center aligned

#### SectionTitleElement
Section heading (e.g., "WEDDING CEREMONY", "REHEARSAL").

```typescript
{
  type: 'section-title',
  text: string
}
```

**Style:** 16pt, bold, center aligned

#### ReadingTitleElement
Reading heading (e.g., "FIRST READING", "PSALM").

```typescript
{
  type: 'reading-title',
  text: string
}
```

**Style:** 14pt, bold, liturgy red, right aligned

---

### Scripture Elements

#### PericopeElement
Scripture reference (e.g., "Genesis 2:18-24").

```typescript
{
  type: 'pericope',
  text: string
}
```

**Style:** 12pt, italic, right aligned

#### ReaderNameElement
Name of the reader.

```typescript
{
  type: 'reader-name',
  text: string
}
```

**Style:** 11pt, liturgy red, right aligned

#### IntroductionElement
Reading introduction (e.g., "A reading from the Book of Genesis").

```typescript
{
  type: 'introduction',
  text: string
}
```

**Style:** 11pt, left aligned

#### ReadingTextElement
Scripture passage text.

```typescript
{
  type: 'reading-text',
  text: string
}
```

**Style:** 11pt, preserves line breaks automatically

#### ConclusionElement
Reading conclusion (e.g., "The word of the Lord").

```typescript
{
  type: 'conclusion',
  text: string
}
```

**Style:** 11pt, left aligned

#### ResponseElement
Congregation response (e.g., "**People:** Thanks be to God").

```typescript
{
  type: 'response',
  label: string,  // e.g., "People:"
  text: string    // e.g., "Thanks be to God."
}
```

**Style:** Label rendered bold, text rendered normal

**Example:**
```typescript
{
  type: 'response',
  label: 'People:',
  text: 'Thanks be to God.'
}
```

---

### Ceremony Elements

#### PriestDialogueElement
Priest/Deacon dialogue and directions.

```typescript
{
  type: 'priest-dialogue',
  text: string
}
```

**Style:** 11pt, left aligned

#### PetitionElement
Petition text (Prayer of the Faithful).

```typescript
{
  type: 'petition',
  label: string,  // e.g., "Reader:"
  text: string    // e.g., "For the Church, let us pray to the Lord."
}
```

**Style:** Label rendered bold + liturgy red, text rendered normal

**Example:**
```typescript
{
  type: 'petition',
  label: 'Reader:',
  text: 'For the Church, let us pray to the Lord.'
}
```

---

### Layout Elements

#### InfoRowElement
Label-value pair (e.g., "**Presider:** Fr. John Smith").

```typescript
{
  type: 'info-row',
  label: string,
  value: string
}
```

**Default style:** Label bold, two-column layout

#### SpacerElement
Empty line for spacing.

```typescript
{
  type: 'spacer'
}
```

**Default style:** Single blank line

---

## Section Structure

### ContentSection Interface

```typescript
interface ContentSection {
  id: string                     // Unique identifier
  title?: string                 // Optional section title
  pageBreakBefore?: boolean      // Start on new page
  pageBreakAfter?: boolean       // Force next section to new page
  elements: ContentElement[]     // Array of content
}
```

### Building a Section

```typescript
function buildMySection(entity: EntityWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Add elements
  elements.push({
    type: 'section-title',
    text: 'MY SECTION'
  })

  elements.push({
    type: 'text',
    text: 'Some content here'
  })

  return {
    id: 'my-section',
    pageBreakBefore: false,
    elements
  }
}
```

### Common Section Types

#### Summary Section
Event metadata and key information:

```typescript
{
  id: 'summary',
  pageBreakAfter: true,
  elements: [
    { type: 'event-title', text: 'Jane & John' },
    { type: 'event-datetime', text: 'March 15, 2025...' },
    { type: 'spacer' },
    { type: 'info-row', label: 'Presider:', value: 'Fr. Smith' },
    { type: 'info-row', label: 'Location:', value: 'St. Mary Church' },
  ]
}
```

#### Reading Section
Complete scripture reading:

```typescript
{
  id: 'first-reading',
  elements: [
    { type: 'reading-title', text: 'FIRST READING' },
    { type: 'pericope', text: 'Genesis 2:18-24' },
    { type: 'reader-name', text: 'Read by: Sarah Johnson' },
    { type: 'spacer' },
    { type: 'introduction', text: 'A reading from the Book of Genesis' },
    { type: 'reading-text', text: '...scripture...' },
    { type: 'conclusion', text: 'The word of the Lord.' },
    { type: 'response', label: 'People:', text: 'Thanks be to God.' }
  ]
}
```

#### Petitions Section
Prayer of the Faithful:

```typescript
{
  id: 'petitions',
  pageBreakBefore: true,
  elements: [
    { type: 'section-title', text: 'PRAYER OF THE FAITHFUL' },
    { type: 'reader-name', text: 'Read by: Michael Brown' },
    { type: 'spacer' },
    { type: 'petition', label: 'Reader:', text: 'For the Church, let us pray to the Lord.' },
    { type: 'response', label: 'People:', text: 'Lord, hear our prayer.' },
    { type: 'spacer' },
    { type: 'petition', label: 'Reader:', text: 'For peace, let us pray to the Lord.' },
    { type: 'response', label: 'People:', text: 'Lord, hear our prayer.' }
  ]
}
```

### Using Shared Section Builders

Use shared builders for common sections:

```typescript
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection
} from '@/lib/content-builders/shared/script-sections'

// Build reading
const firstReading = buildReadingSection({
  id: 'first-reading',
  title: 'FIRST READING',
  reading: entity.first_reading,
  reader: entity.first_reader,
  showNoneSelected: true,
  pageBreakBefore: false
})

// Build psalm
const psalm = buildPsalmSection({
  psalm: entity.psalm,
  psalm_reader: entity.psalm_reader,
  psalm_is_sung: entity.psalm_is_sung
})

// Build petitions
const petitions = buildPetitionsSection({
  petitions: entity.petitions,
  petition_reader: entity.petition_reader,
  second_reader: entity.second_reader,
  petitions_read_by_second_reader: entity.petitions_read_by_second_reader
})
```

---

## Quick Examples

### Simple Title and Text

```typescript
const elements: ContentElement[] = [
  {
    type: 'event-title',
    text: 'Wedding of Jane & John'
  },
  {
    type: 'spacer'
  },
  {
    type: 'text',
    text: 'Welcome to our celebration!'
  }
]
```

### Priest Dialogue and Response

```typescript
const elements: ContentElement[] = [
  {
    type: 'priest-dialogue',
    text: 'Priest: The Lord be with you.'
  },
  {
    type: 'response',
    label: 'People:',
    text: 'And with your spirit.'
  }
]
```

### Info Rows (Summary)

```typescript
const elements: ContentElement[] = [
  {
    type: 'event-title',
    text: 'Jane Doe & John Smith'
  },
  {
    type: 'event-datetime',
    text: 'Saturday, March 15, 2025 at 2:00 PM'
  },
  {
    type: 'spacer'
  },
  {
    type: 'info-row',
    label: 'Presider:',
    value: 'Fr. John Smith'
  },
  {
    type: 'info-row',
    label: 'Location:',
    value: 'St. Mary Church'
  }
]
```

### Poetry/Psalm with Line Breaks

```typescript
const elements: ContentElement[] = [
  {
    type: 'reading-title',
    text: 'RESPONSORIAL PSALM'
  },
  {
    type: 'pericope',
    text: 'Psalm 23'
  },
  {
    type: 'spacer'
  },
  {
    type: 'reading-text',
    text: `The Lord is my shepherd; I shall not want.
He makes me lie down in green pastures.
He leads me beside still waters.`
    // Line breaks are preserved automatically
  }
]
```

---

## All Element Types at a Glance

| Element Type | Primary Use | Required Parameters |
|-------------|-------------|---------------------|
| `text` | General text | `text` |
| `multi-part-text` | Mixed formatting | `parts[]` |
| `event-title` | Main title | `text` |
| `event-datetime` | Event date/time | `text` |
| `section-title` | Section heading | `text` |
| `reading-title` | Reading heading | `text` |
| `pericope` | Scripture reference | `text` |
| `reader-name` | Reader name | `text` |
| `introduction` | Reading intro | `text` |
| `reading-text` | Scripture passage | `text` |
| `conclusion` | Reading ending | `text` |
| `response` | Congregation response | `label`, `text` |
| `priest-dialogue` | Priest directions | `text` |
| `petition` | Petition text | `label`, `text` |
| `rubric` | Liturgical instruction | `text` |
| `info-row` | Label-value pair | `label`, `value` |
| `spacer` | Empty line | (none) |

**Note:** All styling (alignment, color, formatting, line breaks) is controlled by `liturgical-script-styles.ts`, not by element properties.

---

## Related Documentation

- **[LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md)** - Setup and architecture
- **[liturgical-script-styles.ts](../src/lib/styles/liturgical-script-styles.ts)** - Central styling configuration
