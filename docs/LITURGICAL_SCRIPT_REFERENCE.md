# Liturgical Script Reference

> **Daily reference for building liturgical script templates**
>
> This document provides a comprehensive reference for element types, usage rules, and styling patterns when building liturgical script content. For setup and architecture, see [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md).

---

## Table of Contents

1. [Quick Element Types Reference](#quick-element-types-reference)
2. [How Styling Works](#how-styling-works)
3. [Page Breaks](#page-breaks)
4. [Content Element Types](#content-element-types)
5. [Usage Rules & Conventions](#usage-rules--conventions)
6. [Section Structure](#section-structure)
7. [Common Patterns & Examples](#common-patterns--examples)

---

## Quick Element Types Reference

**All element types at a glance:**

| Element Type | Primary Use | Required Parameters | Auto-Styling |
|-------------|-------------|---------------------|--------------|
| `text` | General text | `text` | None |
| `event-title` | Main title | `text` | 18pt, bold, centered |
| `event-datetime` | Event date/time | `text` | 14pt, centered |
| `section-title` | Section heading | `text` | 16pt, bold, centered |
| `reading-title` | Reading heading | `text` | 14pt, bold, red, right-aligned |
| `pericope` | Scripture reference | `text` | 12pt, italic, right-aligned |
| `reader-name` | Reader name | `text` | 11pt, red, right-aligned |
| `introduction` | Reading intro | `text` | 11pt |
| `reading-text` | Scripture passage | `text` | 11pt, preserves line breaks |
| `conclusion` | Reading ending | `text` | 11pt |
| `response-dialogue` | Congregation response | `label`, `text` | Label bold |
| `presider-dialogue` | Presider dialogue | `label?`, `text` | 11pt, label bold if present |
| `petition` | Petition text | `label`, `text` | Label bold + red |
| `rubric` | Liturgical instruction | `text` | Italic, red |
| `info-row` | Label-value pair | `label`, `value` | Label bold |
| `spacer` | Empty line | (none) | Blank line |

---

## How Styling Works

### Central Style Control

**All styles are controlled centrally** in `src/lib/styles/liturgical-script-styles.ts`.

**Elements do NOT have style properties** - no `alignment`, `formatting`, `color`, or `preserveLineBreaks` on individual elements.

**Each element type gets its style automatically** based on its `type`:
- `'section-title'` → 16pt, bold, center aligned
- `'reading-title'` → 14pt, bold, liturgy red, right aligned
- `'response-dialogue'` → Label bold, text normal
- `'petition'` → Label bold + liturgy red

**To change how an element type looks:** Edit the element's style definition in `liturgical-script-styles.ts`.

### Style Values Quick Reference

**To edit styles:** See [STYLE_VALUES.md](./STYLE_VALUES.md) for easy-to-edit style values.

**Current style values:**

| Style Category | Key Values |
|----------------|------------|
| **Font Sizes** | Titles: 18pt/16pt/14pt, Body: 11pt |
| **Spacing** | Small: 3pt, Medium: 6pt, Large: 9pt |
| **Line Height** | Normal: 1.4 (recommended) |
| **Colors** | Liturgy Red: `#c41e3a`, Black: `#000000` |
| **Page Margins** | 60pt (~0.83 inches) |

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

#### ResponseDialogueElement
Congregation response (e.g., "**People:** Thanks be to God").

```typescript
{
  type: 'response-dialogue',
  label: string,  // e.g., "People:"
  text: string    // e.g., "Thanks be to God."
}
```

**Style:** Label rendered bold, text rendered normal

**Example:**
```typescript
{
  type: 'response-dialogue',
  label: 'People:',
  text: 'Thanks be to God.'
}
```

---

### Ceremony Elements

#### PresiderDialogueElement
Presider (Priest/Deacon) dialogue and directions. Label is optional.

```typescript
{
  type: 'presider-dialogue',
  label?: string,  // Optional - e.g., "PRESIDER:"
  text: string
}
```

**Style:** 11pt, left aligned. When label is present, label rendered bold, text rendered normal.

**Example without label:**
```typescript
{
  type: 'presider-dialogue',
  text: 'Dearly beloved, we are gathered here today...'
}
```

**Example with label:**
```typescript
{
  type: 'presider-dialogue',
  label: 'PRESIDER:',
  text: "Life is God's greatest gift to us..."
}
```

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

#### RubricElement
Liturgical instruction or direction.

```typescript
{
  type: 'rubric',
  text: string
}
```

**Style:** Italic, liturgy red

**Usage:** Stage directions, celebrant actions, conditional instructions. See [Usage Rules](#rubric-elements) for important formatting guidelines.

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

## Usage Rules & Conventions

### 🔴 Rubric Elements

**Purpose:** Liturgical instructions and stage directions for the celebrant, readers, or assembly.

**Styling:** Italic text in liturgical red (#c41e3a)

### ❌ INCORRECT - Do not use brackets

```typescript
liturgyElements.push({
  type: 'rubric',
  text: '[Después de la Homilía]',  // WRONG - brackets included
})
```

### ✅ CORRECT - Text without brackets

```typescript
liturgyElements.push({
  type: 'rubric',
  text: 'Después de la Homilía',  // CORRECT - no brackets
})
```

**Rationale:** The rubric element type already provides visual distinction through italic formatting and liturgical red color. Brackets are redundant and create visual clutter.

### Rubric Examples

```typescript
// Stage directions
{
  type: 'rubric',
  text: 'Walk to the front of the altar',
}

// Celebrant actions
{
  type: 'rubric',
  text: 'Celebrant and parents sign the child with the cross',
}

// Conditional instructions
{
  type: 'rubric',
  text: 'Bless religious articles if presented',
}

// Timing/sequence
{
  type: 'rubric',
  text: 'After the Homily',
}
```

---

### General Principles

#### 1. Use Semantic Element Types

Always choose the most semantically appropriate element type:

- **`rubric`** - Liturgical instructions/directions
- **`presider-dialogue`** - Priest/celebrant spoken text
- **`priest-text`** - Priest's prayer or blessing
- **`response`** - Assembly responses
- **`text`** - General content
- **`reading-text`** - Scripture passages
- **`petition`** - Prayer intentions

#### 2. Consistency in Formatting

**Speaker Labels:**
- Always bold: `formatting: ['bold']`
- Follow with colon and space: `'CELEBRANT: '`
- Use ALL CAPS for role names

**Language Labels:**
- Bilingual: `'CELEBRANT / CELEBRANTE: '`
- Keep consistent throughout document

#### 3. Liturgical Red Usage

Use liturgical red (`color: 'liturgy-red'`) for:
- Rubrics (automatic via element type)
- Reading titles (automatic)
- Pericopes (automatic)
- Reader names (automatic)
- Special emphasis in petitions (manual via color property)

**Never use for:**
- Regular dialogue
- Assembly responses
- General text content

#### 4. Spacing

Use `spacer` elements for vertical spacing:

```typescript
// Small space (default)
{ type: 'spacer' }

// Medium space
{ type: 'spacer', size: 'medium' }

// Large space
{ type: 'spacer', size: 'large' }
```

---

### Common Mistakes to Avoid

#### ❌ Don't Add Brackets to Rubrics

```typescript
// WRONG
{ type: 'rubric', text: '[After the Homily]' }

// CORRECT
{ type: 'rubric', text: 'After the Homily' }
```

#### ❌ Don't Use Text Type for Rubrics

```typescript
// WRONG - misses semantic meaning and styling
{ type: 'text', text: 'After the Homily', formatting: ['italic'] }

// CORRECT
{ type: 'rubric', text: 'After the Homily' }
```

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
    { type: 'response-dialogue', label: 'People:', text: 'Thanks be to God.' }
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
    { type: 'response-dialogue', label: 'People:', text: 'Lord, hear our prayer.' },
    { type: 'spacer' },
    { type: 'petition', label: 'Reader:', text: 'For peace, let us pray to the Lord.' },
    { type: 'response-dialogue', label: 'People:', text: 'Lord, hear our prayer.' }
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

// Build reading (returns null if no reading, excluding section entirely)
const firstReading = buildReadingSection({
  id: 'first-reading',
  title: 'FIRST READING',
  reading: entity.first_reading,
  reader: entity.first_reader,
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

## Common Patterns & Examples

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
    type: 'presider-dialogue',
    text: 'Priest: The Lord be with you.'
  },
  {
    type: 'response-dialogue',
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

### Priest Dialogue

```typescript
{
  type: 'presider-dialogue',
  text: 'The Lord be with you.'
}
```

### Bilingual Response

```typescript
{
  type: 'response-dialogue',
  label: 'ASSEMBLY / ASAMBLEA:',
  text: 'Amen. / Amén.'
}
```

---

## Related Documentation

- **[CONTENT_BUILDER_SECTIONS.md](./CONTENT_BUILDER_SECTIONS.md)** - Section types, interfaces, strict vs. flexible patterns, shared builders
- **[LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md)** - Setup and architecture for new modules
- **[STYLE_VALUES.md](./STYLE_VALUES.md)** - Easy-to-edit style value reference
- **[liturgical-script-styles.ts](../src/lib/styles/liturgical-script-styles.ts)** - Central styling configuration
- **[CLAUDE.md](../CLAUDE.md)** - Module structure and patterns
- **[MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md)** - Complete module creation checklist
