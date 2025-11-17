# Content Builder Section System

> **Purpose:** Documentation for the standardized section types used in liturgical content builders. This defines the limited set of possible sections, their interfaces, and how to implement them correctly.

## Table of Contents

1. [Overview](#overview)
2. [The Seven Section Types](#the-seven-section-types)
3. [Section Interfaces](#section-interfaces)
4. [Strict vs. Flexible Sections](#strict-vs-flexible-sections)
5. [Page Break Management](#page-break-management)
6. [Shared Section Builders](#shared-section-builders)
7. [Custom Section Implementation](#custom-section-implementation)
8. [Complete Template Example](#complete-template-example)
9. [Best Practices](#best-practices)

---

## Overview

Content builders create liturgical documents by assembling **sections**. Each section has a specific purpose and structure. This system enforces consistency across all liturgical modules (weddings, funerals, baptisms, etc.) while allowing appropriate flexibility where needed.

### Design Principles

1. **Limited Section Types** - Only 8 section types are allowed (enforced by pattern, not TypeScript)
2. **Consistent Structure** - Each section type has a defined interface and purpose
3. **Reusable Builders** - Shared section builders for strict sections (readings, psalm, petitions)
4. **Flexible Ceremony** - Liturgical ceremony and cover sections allow module-specific content
5. **Smart Page Breaks** - Automatic page breaks between sections, none after the last

### Why This System?

**Problem:** Without structure, each template could create arbitrary sections with inconsistent formatting and behavior.

**Solution:** Define a limited set of section types with clear interfaces. Use shared builders for strict sections (readings) and allow flexibility for cover pages.

---

## The Eight Section Types

| Section Type | Purpose | Interface | Shared Builder? |
|-------------|---------|-----------|-----------------|
| **Cover Sheet** | Summary page with event metadata | Flexible | No |
| **First Reading** | Scripture reading before Gospel | Strict | Yes - `buildReadingSection()` |
| **Psalm** | Responsorial psalm | Strict | Yes - `buildPsalmSection()` |
| **Second Reading** | Scripture reading (if applicable) | Strict | Yes - `buildReadingSection()` |
| **Gospel** | Gospel reading | Strict | Yes - `buildReadingSection()` |
| **Liturgical Ceremony** | Sacramental rite (vows, blessings, ritual actions) | Flexible | No |
| **Petitions** | Prayer of the Faithful | Strict | Yes - `buildPetitionsSection()` |
| **Announcements** | End-of-liturgy announcements | Flexible | Optional - `buildAnnouncementsSection()` |

### Section Order

Sections typically follow this order, with flexibility for liturgical ceremony sections:

1. **Cover Sheet (summary)** - Always first
2. **First Reading** - Optional
3. **Psalm** - Optional
4. **Second Reading** - Optional
5. **Gospel** - Optional
6. **Liturgical Ceremony Section(s)** - Optional, flexible position, can be multiple
7. **Petitions** - Optional
8. **Announcements** - Optional, typically last

**Important Notes:**
- **Cover sheet** is always first
- **Liturgical ceremony sections can appear anywhere and can be multiple**
  - Example: Wedding might have ceremony sections after Gospel (vows, rings, nuptial blessing)
  - Example: Presentation might have ceremony section BEFORE readings
  - Example: Baptism might have multiple ceremony sections (promises, water baptism, anointing)
- **Readings/Psalm/Gospel** typically follow the standard Liturgy of the Word order
- **Petitions** typically come after ceremony sections
- **Announcements** typically come last

---

## Section Interfaces

### 1. Cover Sheet (Summary Section)

**Purpose:** First page with event metadata, participants, and liturgical information.

**Interface:** Flexible - custom implementation per module

**Common Elements:**
- Event title (via document-level `title` field, NOT section elements)
- Event date/time (via document-level `subtitle` field, NOT section elements)
- Participant information (bride/groom, deceased, child, etc.)
- Ministers (presider, homilist, readers, etc.)
- Location information
- Notes

**Structure:**
```typescript
function buildSummarySection(entity: EntityWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Subsection title (optional)
  elements.push({
    type: 'section-title',
    text: 'Wedding Information'
  })

  // Info rows
  elements.push({
    type: 'info-row',
    label: 'Bride:',
    value: formatPersonName(entity.bride)
  })

  // More info rows...

  return {
    id: 'summary',
    pageBreakAfter: true,  // Separate from liturgy content
    elements
  }
}
```

**🔴 CRITICAL - Title/Subtitle Rule:**
**NEVER add event title or datetime as elements in the summary section.** These are set at the document level and rendered automatically by all renderers.

```typescript
// ❌ WRONG - duplicates title/subtitle
function buildSummarySection(entity: EntityWithRelations): ContentSection {
  const elements: ContentElement[] = []

  elements.push({
    type: 'event-title',
    text: buildTitleEnglish(entity)  // NO! Document level only
  })

  elements.push({
    type: 'event-datetime',
    text: formatEventDateTime(entity.event)  // NO! Document level only
  })

  // ... rest of elements
}

// ✅ CORRECT - title/subtitle at document level only
export function buildTemplate(entity: EntityWithRelations): LiturgyDocument {
  const title = buildTitleEnglish(entity)
  const subtitle = formatEventDateTime(entity.event)

  const sections: ContentSection[] = []
  sections.push(buildSummarySection(entity))  // No title/datetime elements

  return {
    id: entity.id,
    type: 'module',
    language: 'en',
    template: 'module-template',
    title,        // ← Set ONLY here
    subtitle,     // ← Set ONLY here
    sections
  }
}
```

### 2. First Reading

**Purpose:** Proclamation of the First Scripture reading (typically Old Testament).

**Interface:** Strict - use `buildReadingSection()`

**Builder Location:** `src/lib/content-builders/shared/script-sections.ts`

**Usage:**
```typescript
import { buildReadingSection } from '@/lib/content-builders/shared/script-sections'

const firstReadingSection = buildReadingSection({
  id: 'first-reading',
  title: 'FIRST READING',
  reading: entity.first_reading,
  reader: entity.first_reader,
  responseText: 'Thanks be to God.',
  pageBreakBefore: false,
  showNoneSelected: false  // If false and no reading, section is excluded
})

if (firstReadingSection) {
  sections.push(firstReadingSection)
}
```

**Automatic Elements:**
- Reading title (e.g., "FIRST READING")
- Pericope (scripture reference)
- Reader name
- Introduction (if provided in reading data)
- Reading text
- Conclusion (if provided in reading data)
- Response (e.g., "People: Thanks be to God.")

**Returns:** `ContentSection | null` (null if no reading and `showNoneSelected` is false)

### 3. Psalm

**Purpose:** Responsorial psalm between readings.

**Interface:** Strict - use `buildPsalmSection()`

**Usage:**
```typescript
import { buildPsalmSection } from '@/lib/content-builders/shared/script-sections'

const psalmSection = buildPsalmSection({
  psalm: entity.psalm,
  psalm_reader: entity.psalm_reader,
  psalm_is_sung: entity.psalm_is_sung
})

if (psalmSection) {
  sections.push(psalmSection)
}
```

**Automatic Elements:**
- Reading title ("Psalm")
- Pericope
- Reader name OR "Sung" indicator
- Introduction (if provided)
- Psalm text
- Conclusion (if provided)

**Returns:** `ContentSection | null` (null if no psalm)

**Default Behavior:** `pageBreakBefore: true` (psalms start on new page)

### 4. Second Reading

**Purpose:** Second Scripture reading (typically New Testament epistles).

**Interface:** Strict - use `buildReadingSection()`

**Usage:**
```typescript
const secondReadingSection = buildReadingSection({
  id: 'second-reading',
  title: 'SECOND READING',
  reading: entity.second_reading,
  reader: entity.second_reader,
  responseText: 'Thanks be to God.',
  pageBreakBefore: false
})

if (secondReadingSection) {
  sections.push(secondReadingSection)
}
```

**Same structure as First Reading.**

### 5. Gospel

**Purpose:** Gospel reading (always highest reverence).

**Interface:** Strict - use `buildReadingSection()` with Gospel-specific options

**Usage:**
```typescript
const gospelSection = buildReadingSection({
  id: 'gospel',
  title: 'GOSPEL',
  reading: entity.gospel_reading,
  reader: undefined,  // Gospel is read by priest/deacon
  responseText: undefined,
  includeGospelDialogue: true,      // "The Lord be with you" exchange
  includeGospelAcclamations: true,  // "Glory/Praise to you, O Lord"
  pageBreakBefore: true  // Gospel traditionally starts on new page
})

if (gospelSection) {
  sections.push(gospelSection)
}
```

**Gospel-Specific Elements:**
- Priest dialogue ("The Lord be with you" / "And with your spirit")
- Gospel acclamation before reading ("Glory to you, O Lord")
- Gospel acclamation after reading ("Praise to you, Lord Jesus Christ")

**Default Behavior:** `pageBreakBefore: true` (Gospel gets its own page)

### 6. Liturgical Ceremony

**Purpose:** The actual sacramental rite - vows, blessings, ritual actions specific to each module.

**Interface:** Flexible - custom implementation per module

**Examples by Module:**
- **Wedding** - Marriage vows, exchange of consent, exchange of rings, nuptial blessing
- **Baptism** - Baptismal promises, blessing of water, baptism with water, anointing with chrism
- **Funeral** - Final commendation, incensation, song of farewell
- **Presentation** - Presentation blessing, sign of the cross, commitment questions
- **Quinceañera** - Renewal of baptismal promises, blessing, presentation of symbols

**Common Elements:**
- Rubrics (stage directions)
- Priest dialogue and prayers
- Responses from participants and assembly
- Prayer texts
- Blessing instructions
- Ritual action descriptions

**Structure:**
```typescript
function buildCeremonySection(entity: EntityWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Section title
  elements.push({
    type: 'section-title',
    text: 'Marriage Rite'  // Or 'Baptismal Rite', etc.
  })

  // Rubric (stage direction)
  elements.push({
    type: 'rubric',
    text: 'The couple stands before the altar'
  })

  // Priest dialogue
  elements.push({
    type: 'priest-dialogue',
    text: 'Dearly beloved, we are gathered here today...'
  })

  // Response
  elements.push({
    type: 'response',
    label: 'Bride and Groom:',
    text: 'I do.'
  })

  // Prayer text
  elements.push({
    type: 'priest-text',
    text: 'Heavenly Father, we ask your blessing upon this couple...'
  })

  elements.push({
    type: 'response',
    label: 'Assembly:',
    text: 'Amen.'
  })

  return {
    id: 'ceremony',
    pageBreakBefore: false,  // Typically flows from Gospel
    elements
  }
}
```

**🔴 CRITICAL - Flexible Positioning:**
- **Can appear anywhere** in the document (before readings, after Gospel, interspersed, etc.)
- **Can be multiple sections** (e.g., wedding vows + ring exchange + nuptial blessing as 3 separate sections)
- **Position varies by module** based on liturgical requirements
- Typically positioned after Gospel or between readings
- Sometimes positioned before all readings (e.g., Presentation)

**Common Positioning Patterns:**
- **Wedding:** After Gospel (marriage consent, exchange of rings, nuptial blessing)
- **Baptism:** Multiple sections interspersed (baptismal promises, water baptism, anointing, clothing)
- **Funeral:** After readings (final commendation, incensation)
- **Presentation:** Before or after readings (presentation blessing)
- **Quinceañera:** After Gospel (renewal of promises, blessing, symbols)

**Page Break Behavior:**
- Typically `pageBreakBefore: false` (flows from previous section)
- May use `pageBreakBefore: true` for major ceremony transitions
- May use subsection titles to organize multi-part ceremonies

**Implementation Notes:**
- Use helper functions for gendered text, names, dates
- Use rubrics for stage directions
- Use `priest-dialogue` for spoken celebrant text
- Use `priest-text` for prayers
- Use `response` for participant/assembly responses
- Use `spacer` elements for readability

**Example 1 - Single Presentation Ceremony (appears after homily):**
```typescript
function buildPresentationBlessingSection(presentation: PresentationWithRelations): ContentSection {
  const childName = getChildName(presentation)
  const childSex = getChildSex(presentation)

  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Presentation Blessing'
  })

  elements.push({
    type: 'rubric',
    text: 'After the Homily'
  })

  elements.push({
    type: 'priest-dialogue',
    text: `Grateful for the life of their ${gendered(childSex, 'son', 'daughter')}, the parents would like to present ${childName} to the Lord.`
  })

  elements.push({
    type: 'rubric',
    text: 'Walk to the front of the altar'
  })

  // Commitment question
  elements.push({
    type: 'priest-dialogue',
    text: 'Do you commit to raise this child in the ways of faith?'
  })

  elements.push({
    type: 'response',
    label: 'Parents:',
    text: 'Yes, we do.'
  })

  // Prayer
  elements.push({
    type: 'priest-text',
    text: 'Heavenly Father, you are the giver of all life. Bless this child and these parents...'
  })

  elements.push({
    type: 'response',
    label: 'Assembly:',
    text: 'Amen.'
  })

  return {
    id: 'presentation-blessing',
    elements
  }
}

// In template builder - ceremony can appear anywhere
sections.push(buildCoverPage(presentation))
sections.push(buildPresentationBlessingSection(presentation))  // BEFORE readings
sections.push(buildFirstReading(presentation))
sections.push(buildGospel(presentation))
sections.push(buildPetitions(presentation))
```

**Example 2 - Multiple Wedding Ceremony Sections (after Gospel):**
```typescript
// Ceremony Section 1: Marriage Consent
function buildMarriageConsentSection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Marriage Consent'
  })

  elements.push({
    type: 'priest-dialogue',
    text: 'Do you take this woman to be your lawfully wedded wife?'
  })

  elements.push({
    type: 'response',
    label: 'Groom:',
    text: 'I do.'
  })

  // ... more consent dialogue

  return {
    id: 'marriage-consent',
    elements
  }
}

// Ceremony Section 2: Ring Exchange
function buildRingExchangeSection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Blessing and Exchange of Rings'
  })

  elements.push({
    type: 'priest-text',
    text: 'May the Lord bless these rings...'
  })

  // ... ring exchange dialogue

  return {
    id: 'ring-exchange',
    pageBreakBefore: false,  // Flows from previous section
    elements
  }
}

// Ceremony Section 3: Nuptial Blessing
function buildNuptialBlessingSection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Nuptial Blessing'
  })

  elements.push({
    type: 'priest-text',
    text: 'Lord, grant that as they begin to live this sacrament...'
  })

  elements.push({
    type: 'response',
    label: 'Assembly:',
    text: 'Amen.'
  })

  return {
    id: 'nuptial-blessing',
    pageBreakBefore: true,  // Major transition - new page
    elements
  }
}

// In template builder - all 3 ceremony sections after Gospel
sections.push(buildCoverPage(wedding))
sections.push(buildFirstReading(wedding))
sections.push(buildPsalm(wedding))
sections.push(buildSecondReading(wedding))
sections.push(buildGospel(wedding))
sections.push(buildMarriageConsentSection(wedding))     // Ceremony 1
sections.push(buildRingExchangeSection(wedding))        // Ceremony 2
sections.push(buildNuptialBlessingSection(wedding))     // Ceremony 3
sections.push(buildPetitions(wedding))
```

**When NOT to Use:**
- If the module has no specific ceremony (e.g., Mass Intention summary)
- If readings and petitions are the only liturgical content

**Returns:** `ContentSection | null` (return null if no ceremony for this module)

### 7. Petitions (Prayer of the Faithful)

**Purpose:** Intercessions for the Church, world, community, and individuals.

**Interface:** Strict - use `buildPetitionsSection()`

**Usage:**
```typescript
import { buildPetitionsSection } from '@/lib/content-builders/shared/script-sections'

const petitionsSection = buildPetitionsSection({
  petitions: entity.petitions,  // Newline-separated petition text
  petition_reader: entity.petition_reader,
  second_reader: entity.second_reader,
  petitions_read_by_second_reader: entity.petitions_read_by_second_reader
})

if (petitionsSection) {
  sections.push(petitionsSection)
}
```

**Automatic Elements:**
- Section title ("Petitions")
- Reader name (determined by logic)
- Introductory instruction with response
- Each petition with "let us pray to the Lord" ending
- Response after each petition ("Lord, hear our prayer")

**Petition Text Format:**
```
For the Church
For peace in the world
For all who are sick
For [Couple Names], may they grow in love
```

**Builder automatically:**
1. Splits petitions by newline
2. Adds "let us pray to the Lord" to each
3. Adds response after each

**Default Behavior:** `pageBreakBefore: true`, `pageBreakAfter: true`

### 8. Announcements

**Purpose:** End-of-liturgy announcements, reminders, or notes.

**Interface:** Flexible - can use `buildAnnouncementsSection()` or custom implementation

**Shared Builder Usage:**
```typescript
import { buildAnnouncementsSection } from '@/lib/content-builders/shared/script-sections'

const announcementsSection = buildAnnouncementsSection(entity.announcements)

if (announcementsSection) {
  sections.push(announcementsSection)
}
```

**Custom Implementation:**
```typescript
function buildAnnouncementsSection(entity: EntityWithRelations): ContentSection | null {
  if (!entity.announcements) return null

  return {
    id: 'announcements',
    elements: [
      {
        type: 'section-title',
        text: 'Announcements'
      },
      {
        type: 'text',
        text: entity.announcements
      }
    ]
  }
}
```

**Returns:** `ContentSection | null`

---

## Strict vs. Flexible Sections

### Strict Sections (Use Shared Builders)

**Sections:** First Reading, Psalm, Second Reading, Gospel, Petitions

**Why Strict?**
- Liturgical requirements (Church standards)
- Consistent formatting across all templates
- Correct sequence and responses
- Proper labeling and reader attribution

**Rule:** ALWAYS use the shared builders for these sections. Do not create custom implementations.

**Example Violation:**
```typescript
// ❌ WRONG - custom implementation of reading
function buildFirstReading(entity: EntityWithRelations): ContentSection {
  return {
    id: 'first-reading',
    elements: [
      { type: 'text', text: 'FIRST READING' },
      { type: 'text', text: entity.first_reading.text }
      // Missing: pericope, reader, introduction, conclusion, response
    ]
  }
}

// ✅ CORRECT - use shared builder
const section = buildReadingSection({
  id: 'first-reading',
  title: 'FIRST READING',
  reading: entity.first_reading,
  reader: entity.first_reader,
  responseText: 'Thanks be to God.'
})
```

### Flexible Sections (Custom Implementation)

**Sections:** Cover Sheet (Summary), Liturgical Ceremony, Announcements

**Why Flexible?**
- **Cover Sheet:** Module-specific metadata (wedding vs. funeral vs. baptism)
- **Liturgical Ceremony:** Each sacrament has unique rites (marriage vows vs. baptismal promises vs. funeral commendation)
- **Announcements:** Varying content and formats
- Custom subsections and groupings
- Different information hierarchies per module

**Rule:** Create custom implementations, but follow element type conventions.

**Best Practices:**
- Use semantic element types (`section-title`, `info-row`, etc.)
- Group related information with subsection titles
- Use helper functions for formatting (dates, names, locations)
- Return `ContentSection | null` to allow conditional inclusion

---

## Page Break Management

### When Page Breaks Occur

Page breaks are controlled at the **section level** via two properties:

```typescript
interface ContentSection {
  id: string
  pageBreakBefore?: boolean  // Start this section on a new page
  pageBreakAfter?: boolean   // Force next section to a new page
  elements: ContentElement[]
}
```

**`pageBreakBefore: true`** - Start this section on a new page
- Gospel reading (traditional liturgical practice)
- Psalm (visual separation)
- Petitions (separate from readings)

**`pageBreakAfter: true`** - Force next section to start on a new page
- Summary/cover sheet (separate from liturgy)
- Petitions (separate from announcements)

### Default Page Break Behavior

**Shared Builders:**
- `buildReadingSection()`: `pageBreakBefore: false` (default, can override)
- `buildPsalmSection()`: `pageBreakBefore: true` (fixed)
- `buildPetitionsSection()`: `pageBreakBefore: true`, `pageBreakAfter: true` (fixed)
- `buildAnnouncementsSection()`: No page breaks (flows naturally)

**Custom Sections:**
- Summary section: `pageBreakAfter: true` (typical)
- Announcements: No page breaks (typical)

### 🔴 CRITICAL - No Page Break After Last Section

**Problem:** If the last section has `pageBreakAfter: true`, it creates a blank page at the end of the document.

**Solution:** Renderers automatically detect the last section and ignore `pageBreakAfter`.

**Implementation in Renderers:**

```typescript
// In HTML, PDF, and Word renderers
sections.forEach((section, index) => {
  const isLastSection = index === sections.length - 1

  // Render section content...

  // Only apply pageBreakAfter if NOT the last section
  if (section.pageBreakAfter && !isLastSection) {
    // Add page break
  }
})
```

**What this means for template builders:**
- You CAN set `pageBreakAfter: true` on any section (including petitions)
- Renderers will automatically prevent page break after the last section
- No manual checking required in template code

**Example:**
```typescript
// This is safe - renderer handles last section
const petitionsSection = buildPetitionsSection({
  petitions: entity.petitions,
  // ...
})
// petitionsSection has pageBreakAfter: true internally

sections.push(petitionsSection)

// If petitions is the last section, no page break will be added
// If announcements follow, page break occurs between them
```

### Page Break Strategy by Section

**Recommended page break patterns:**

```typescript
// 1. Summary (cover page)
{
  id: 'summary',
  pageBreakAfter: true,  // Separate from liturgy
  elements: [...]
}

// 2. First Reading
{
  id: 'first-reading',
  pageBreakBefore: false,  // Flow from previous
  elements: [...]
}

// 3. Psalm
{
  id: 'psalm',
  pageBreakBefore: true,  // Visual separation (shared builder sets this)
  elements: [...]
}

// 4. Second Reading
{
  id: 'second-reading',
  pageBreakBefore: false,  // Flow from psalm
  elements: [...]
}

// 5. Gospel
{
  id: 'gospel',
  pageBreakBefore: true,  // Traditional practice
  elements: [...]
}

// 6. Liturgical Ceremony
{
  id: 'ceremony',
  pageBreakBefore: false,  // Flow from Gospel (or set true for long ceremonies)
  elements: [...]
}

// 7. Petitions
{
  id: 'petitions',
  pageBreakBefore: true,  // Separate from ceremony
  pageBreakAfter: true,   // Separate from announcements (ignored if last)
  elements: [...]
}

// 8. Announcements
{
  id: 'announcements',
  // No page breaks - flows naturally or is last section
  elements: [...]
}
```

---

## Shared Section Builders

All shared builders are located in: `src/lib/content-builders/shared/script-sections.ts`

### buildReadingSection()

**Purpose:** Build First Reading, Second Reading, or Gospel sections

**Signature:**
```typescript
interface ReadingSectionConfig {
  id: string                        // 'first-reading', 'second-reading', 'gospel'
  title: string                     // 'FIRST READING', 'SECOND READING', 'GOSPEL'
  reading: any                      // The reading object from database
  reader?: any                      // The reader person (null for gospel)
  responseText?: string             // 'Thanks be to God.' (omit for gospel)
  includeGospelDialogue?: boolean   // true for gospel only
  includeGospelAcclamations?: boolean // true for gospel only
  pageBreakBefore?: boolean         // true for gospel, false for others
  showNoneSelected?: boolean        // Show "None Selected" if no reading
}

function buildReadingSection(config: ReadingSectionConfig): ContentSection | null
```

**Returns:** `ContentSection` if reading exists, `null` otherwise (unless `showNoneSelected: true`)

**Example - First Reading:**
```typescript
const section = buildReadingSection({
  id: 'first-reading',
  title: 'FIRST READING',
  reading: wedding.first_reading,
  reader: wedding.first_reader,
  responseText: 'Thanks be to God.',
  pageBreakBefore: false
})

if (section) sections.push(section)
```

**Example - Gospel:**
```typescript
const section = buildReadingSection({
  id: 'gospel',
  title: 'GOSPEL',
  reading: wedding.gospel_reading,
  includeGospelDialogue: true,
  includeGospelAcclamations: true,
  pageBreakBefore: true
})

if (section) sections.push(section)
```

### buildPsalmSection()

**Purpose:** Build Responsorial Psalm section

**Signature:**
```typescript
interface PsalmSectionConfig {
  psalm: any                 // The psalm reading object
  psalm_reader?: any         // The psalm reader person
  psalm_is_sung?: boolean    // Whether the psalm is sung
}

function buildPsalmSection(config: PsalmSectionConfig): ContentSection | null
```

**Returns:** `ContentSection` if psalm exists, `null` otherwise

**Fixed Behavior:** Always sets `pageBreakBefore: true`

**Example:**
```typescript
const section = buildPsalmSection({
  psalm: wedding.psalm,
  psalm_reader: wedding.psalm_reader,
  psalm_is_sung: wedding.psalm_is_sung
})

if (section) sections.push(section)
```

### buildPetitionsSection()

**Purpose:** Build Prayer of the Faithful section

**Signature:**
```typescript
interface PetitionsSectionConfig {
  petitions?: string | null                   // Newline-separated petition text
  petition_reader?: any                       // Designated petition reader
  second_reader?: any                         // Second reader (fallback)
  petitions_read_by_second_reader?: boolean   // Use second reader?
}

function buildPetitionsSection(config: PetitionsSectionConfig): ContentSection | null
```

**Returns:** `ContentSection` if petitions exist, `null` otherwise

**Fixed Behavior:** Always sets `pageBreakBefore: true` and `pageBreakAfter: true`

**Automatic Processing:**
1. Determines reader (petition_reader or second_reader based on flag)
2. Splits petition text by newlines
3. Adds "let us pray to the Lord" to each petition
4. Adds response after each ("Lord, hear our prayer")

**Example:**
```typescript
const section = buildPetitionsSection({
  petitions: wedding.petitions,
  petition_reader: wedding.petition_reader,
  second_reader: wedding.second_reader,
  petitions_read_by_second_reader: wedding.petitions_read_by_second_reader
})

if (section) sections.push(section)
```

### buildAnnouncementsSection()

**Purpose:** Build simple announcements section

**Signature:**
```typescript
function buildAnnouncementsSection(announcements?: string | null): ContentSection | null
```

**Returns:** `ContentSection` if announcements exist, `null` otherwise

**Structure:**
- Section title ("Announcements")
- Text element with full announcement content

**Example:**
```typescript
const section = buildAnnouncementsSection(wedding.announcements)

if (section) sections.push(section)
```

---

## Custom Section Implementation

For Cover Sheet (Summary) and custom Announcements sections, follow these patterns:

### Summary Section Pattern

```typescript
import { ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import { buildTitleEnglish, getEventSubtitleEnglish } from '../helpers'

function buildSummarySection(entity: EntityWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Subsection 1: Main Event Info
  elements.push({
    type: 'section-title',
    text: 'Event Information'
  })

  if (entity.person) {
    elements.push({
      type: 'info-row',
      label: 'Person:',
      value: formatPersonName(entity.person)
    })
  }

  if (entity.event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Date & Time:',
      value: formatEventDateTime(entity.event)
    })
  }

  if (entity.event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Location:',
      value: formatLocationWithAddress(entity.event.location)
    })
  }

  // Subsection 2: Ministers (only if any minister exists)
  if (entity.presider || entity.homilist) {
    elements.push({
      type: 'section-title',
      text: 'Ministers'
    })

    if (entity.presider) {
      elements.push({
        type: 'info-row',
        label: 'Presider:',
        value: formatPersonName(entity.presider)
      })
    }

    if (entity.homilist && entity.homilist.id !== entity.presider?.id) {
      elements.push({
        type: 'info-row',
        label: 'Homilist:',
        value: formatPersonName(entity.homilist)
      })
    }
  }

  // Subsection 3: Liturgy Details (only if any exist)
  const hasLiturgyInfo = entity.first_reading || entity.psalm || entity.petitions
  if (hasLiturgyInfo) {
    elements.push({
      type: 'section-title',
      text: 'Sacred Liturgy'
    })

    if (entity.first_reading) {
      elements.push({
        type: 'info-row',
        label: 'First Reading:',
        value: getReadingPericope(entity.first_reading)
      })
    }

    // More liturgy info...
  }

  return {
    id: 'summary',
    pageBreakAfter: true,  // Separate cover from liturgy
    elements
  }
}
```

**Best Practices:**
1. Use subsection titles (`section-title`) to group related info
2. Only show subsections if they have content (conditional checks)
3. Use helper functions for all formatting (dates, names, locations)
4. Always set `pageBreakAfter: true` on summary sections
5. Return `ContentSection` (not nullable - summary always exists)

### Custom Announcements Pattern

```typescript
function buildAnnouncementsSection(entity: EntityWithRelations): ContentSection | null {
  if (!entity.announcements) return null

  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Announcements'
  })

  // Option 1: Simple text
  elements.push({
    type: 'text',
    text: entity.announcements
  })

  // Option 2: Multiple paragraphs
  const paragraphs = entity.announcements.split('\n\n').filter(p => p.trim())
  paragraphs.forEach(paragraph => {
    elements.push({
      type: 'text',
      text: paragraph
    })
    elements.push({ type: 'spacer' })
  })

  return {
    id: 'announcements',
    elements
  }
}
```

---

## Complete Template Example

Here's a complete template implementation using all section types:

```typescript
import { EntityWithRelations } from '@/lib/actions/entities'
import { LiturgyDocument, ContentSection } from '@/lib/types/liturgy-content'
import { formatPersonName, formatEventDateTime } from '@/lib/utils/formatters'
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection
} from '@/lib/content-builders/shared/script-sections'
import { buildTitleEnglish, getEventSubtitleEnglish } from '../helpers'

/**
 * Build summary section (custom implementation)
 */
function buildSummarySection(entity: EntityWithRelations): ContentSection {
  const elements = []

  elements.push({
    type: 'section-title',
    text: 'Event Information'
  })

  if (entity.person) {
    elements.push({
      type: 'info-row',
      label: 'Person:',
      value: formatPersonName(entity.person)
    })
  }

  if (entity.presider) {
    elements.push({
      type: 'info-row',
      label: 'Presider:',
      value: formatPersonName(entity.presider)
    })
  }

  return {
    id: 'summary',
    pageBreakAfter: true,
    elements
  }
}

/**
 * Main template builder
 */
export function buildFullScriptEnglish(entity: EntityWithRelations): LiturgyDocument {
  // Build title and subtitle (document level only)
  const title = buildTitleEnglish(entity)
  const subtitle = getEventSubtitleEnglish(entity)

  const sections: ContentSection[] = []

  // 1. Summary (always present)
  sections.push(buildSummarySection(entity))

  // 2. First Reading (optional)
  const firstReading = buildReadingSection({
    id: 'first-reading',
    title: 'FIRST READING',
    reading: entity.first_reading,
    reader: entity.first_reader,
    responseText: 'Thanks be to God.',
    pageBreakBefore: false
  })
  if (firstReading) {
    sections.push(firstReading)
  }

  // 3. Psalm (optional)
  const psalm = buildPsalmSection({
    psalm: entity.psalm,
    psalm_reader: entity.psalm_reader,
    psalm_is_sung: entity.psalm_is_sung
  })
  if (psalm) {
    sections.push(psalm)
  }

  // 4. Second Reading (optional)
  const secondReading = buildReadingSection({
    id: 'second-reading',
    title: 'SECOND READING',
    reading: entity.second_reading,
    reader: entity.second_reader,
    responseText: 'Thanks be to God.',
    pageBreakBefore: false
  })
  if (secondReading) {
    sections.push(secondReading)
  }

  // 5. Gospel (optional)
  const gospel = buildReadingSection({
    id: 'gospel',
    title: 'GOSPEL',
    reading: entity.gospel_reading,
    includeGospelDialogue: true,
    includeGospelAcclamations: true,
    pageBreakBefore: true
  })
  if (gospel) {
    sections.push(gospel)
  }

  // 6. Liturgical Ceremony Section(s) (optional - custom per module)
  // Can have multiple ceremony sections at different positions
  // Example: Wedding has 3 ceremony sections after Gospel
  const marriageConsent = buildMarriageConsentSection(entity)
  if (marriageConsent) {
    sections.push(marriageConsent)
  }

  const ringExchange = buildRingExchangeSection(entity)
  if (ringExchange) {
    sections.push(ringExchange)
  }

  const nuptialBlessing = buildNuptialBlessingSection(entity)
  if (nuptialBlessing) {
    sections.push(nuptialBlessing)
  }

  // 7. Petitions (optional)
  const petitions = buildPetitionsSection({
    petitions: entity.petitions,
    petition_reader: entity.petition_reader,
    second_reader: entity.second_reader,
    petitions_read_by_second_reader: entity.petitions_read_by_second_reader
  })
  if (petitions) {
    sections.push(petitions)
  }

  // 8. Announcements (optional)
  const announcements = buildAnnouncementsSection(entity.announcements)
  if (announcements) {
    sections.push(announcements)
  }

  // Return complete document
  return {
    id: entity.id,
    type: 'entity-type',
    language: 'en',
    template: 'entity-full-script-english',
    title,        // Document-level title
    subtitle,     // Document-level subtitle
    sections
  }
}
```

---

## Best Practices

### 1. Always Use Shared Builders for Strict Sections

```typescript
// ❌ WRONG
function buildFirstReading(entity: EntityWithRelations): ContentSection {
  // Custom implementation
}

// ✅ CORRECT
import { buildReadingSection } from '@/lib/content-builders/shared/script-sections'

const section = buildReadingSection({
  id: 'first-reading',
  title: 'FIRST READING',
  reading: entity.first_reading,
  reader: entity.first_reader,
  responseText: 'Thanks be to God.'
})
```

### 2. Check for Null Before Adding Sections

```typescript
// ❌ WRONG
sections.push(buildReadingSection({ ... }))  // Might push null

// ✅ CORRECT
const section = buildReadingSection({ ... })
if (section) {
  sections.push(section)
}

// ✅ ALSO CORRECT (concise)
const section = buildReadingSection({ ... })
if (section) sections.push(section)
```

### 3. Use Helper Functions for All Formatting

```typescript
// ❌ WRONG
value: `${entity.person.first_name} ${entity.person.last_name}`

// ✅ CORRECT
import { formatPersonName } from '@/lib/utils/formatters'
value: formatPersonName(entity.person)
```

### 4. Set Title/Subtitle at Document Level Only

```typescript
// ❌ WRONG - title in section elements
function buildSummarySection(entity: EntityWithRelations): ContentSection {
  elements.push({
    type: 'event-title',
    text: buildTitleEnglish(entity)  // Duplicates document title
  })
}

// ✅ CORRECT - title at document level
export function buildTemplate(entity: EntityWithRelations): LiturgyDocument {
  const title = buildTitleEnglish(entity)

  return {
    title,  // Set once at document level
    sections: [buildSummarySection(entity)]  // No title elements
  }
}
```

### 5. Respect Section Order

```typescript
// ✅ CORRECT - proper liturgical order
sections.push(buildSummarySection(entity))
sections.push(buildFirstReadingSection(entity))
sections.push(buildPsalmSection(entity))
sections.push(buildSecondReadingSection(entity))
sections.push(buildGospelSection(entity))
sections.push(buildCeremonySection(entity))        // After Gospel, before Petitions
sections.push(buildPetitionsSection(entity))
sections.push(buildAnnouncementsSection(entity))

// ❌ WRONG - ceremony after petitions
sections.push(buildSummarySection(entity))
sections.push(buildGospelSection(entity))
sections.push(buildPetitionsSection(entity))
sections.push(buildCeremonySection(entity))        // Out of order - should be before petitions
```

### 6. Use Conditional Subsections

```typescript
// ✅ CORRECT - only show subsection if content exists
function buildSummarySection(entity: EntityWithRelations): ContentSection {
  const elements = []

  // Always show main info
  elements.push({ type: 'section-title', text: 'Event Information' })
  // ... event info

  // Only show ministers subsection if any minister exists
  if (entity.presider || entity.homilist) {
    elements.push({ type: 'section-title', text: 'Ministers' })
    // ... minister info
  }

  return { id: 'summary', pageBreakAfter: true, elements }
}

// ❌ WRONG - showing empty subsection
function buildSummarySection(entity: EntityWithRelations): ContentSection {
  const elements = []

  elements.push({ type: 'section-title', text: 'Ministers' })  // Always shown
  // What if no ministers? Empty subsection!

  return { id: 'summary', elements }
}
```

### 7. Don't Worry About Page Breaks After Last Section

```typescript
// ✅ CORRECT - renderer handles this automatically
const petitions = buildPetitionsSection({ ... })  // Has pageBreakAfter: true
if (petitions) sections.push(petitions)

// If petitions is last, no page break occurs
// No manual checking needed!

// ❌ WRONG - unnecessary manual checking
if (petitions) {
  const isLast = !entity.announcements
  petitions.pageBreakAfter = !isLast  // Don't do this!
  sections.push(petitions)
}
```

---

## Related Documentation

- **[LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md)** - Setup and architecture for content builders
- **[LITURGICAL_SCRIPT_REFERENCE.md](./LITURGICAL_SCRIPT_REFERENCE.md)** - Element types and styling reference
- **[FORMATTERS.md](./FORMATTERS.md)** - Helper functions for formatting (dates, names, locations)
- **[liturgy-content.ts](../src/lib/types/liturgy-content.ts)** - TypeScript interfaces for content structure
- **[script-sections.ts](../src/lib/content-builders/shared/script-sections.ts)** - Shared section builder implementations

---

**Last Updated:** 2025-01-17
**Status:** Complete documentation of standardized section system
**Coverage:** Section types, interfaces, strict vs. flexible patterns, page break management, shared builders, custom implementation, complete examples, best practices
