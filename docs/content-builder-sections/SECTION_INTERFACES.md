# Section Interfaces Reference

> **Purpose:** Detailed interfaces, usage examples, and automatic elements for all 8 section types in the content builder system.

## Table of Contents

1. [Cover Sheet (Summary Section)](#1-cover-sheet-summary-section)
2. [First Reading](#2-first-reading)
3. [Psalm](#3-psalm)
4. [Second Reading](#4-second-reading)
5. [Gospel](#5-gospel)
6. [Liturgical Ceremony](#6-liturgical-ceremony)
7. [Petitions](#7-petitions)
8. [Announcements](#8-announcements)

---

## 1. Cover Sheet (Summary Section)

**Purpose:** First page with event metadata, participants, and liturgical information.

**Interface:** Flexible - custom implementation per module

**Common Elements:**
- Event title (via document-level `title` field, NOT section elements)
- Event date/time (via document-level `subtitle` field, NOT section elements)
- Participant information (bride/groom, deceased, child, etc.)
- Ministers (presider, homilist, readers, etc.)
- Location information
- Notes

### Structure

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
    value: entity.bride.full_name
  })

  // More info rows...

  return {
    id: 'summary',
    pageBreakAfter: true,  // Separate from liturgy content
    elements
  }
}
```

### 🔴 CRITICAL - Title/Subtitle Rule

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

---

## 2. First Reading

**Purpose:** Proclamation of the First Scripture reading (typically Old Testament).

**Interface:** Strict - use `buildReadingSection()`

**Builder Location:** `src/lib/content-builders/shared/script-sections.ts`

### Usage

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

### Automatic Elements

- Reading title (e.g., "FIRST READING")
- Pericope (scripture reference)
- Reader name
- Introduction (if provided in reading data)
- Reading text
- Conclusion (if provided in reading data)
- Response (e.g., "People: Thanks be to God.")

**Returns:** `ContentSection | null` (null if no reading and `showNoneSelected` is false)

---

## 3. Psalm

**Purpose:** Responsorial psalm between readings.

**Interface:** Strict - use `buildPsalmSection()`

### Usage

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

### Automatic Elements

- Reading title ("Psalm")
- Pericope
- Reader name OR "Sung" indicator
- Introduction (if provided)
- Psalm text
- Conclusion (if provided)

**Returns:** `ContentSection | null` (null if no psalm)

**Default Behavior:** `pageBreakBefore: true` (psalms start on new page)

---

## 4. Second Reading

**Purpose:** Second Scripture reading (typically New Testament epistles).

**Interface:** Strict - use `buildReadingSection()`

### Usage

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

---

## 5. Gospel

**Purpose:** Gospel reading (always highest reverence).

**Interface:** Strict - use `buildReadingSection()` with Gospel-specific options

### Usage

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

### Gospel-Specific Elements

- Priest dialogue ("The Lord be with you" / "And with your spirit")
- Gospel acclamation before reading ("Glory to you, O Lord")
- Gospel acclamation after reading ("Praise to you, Lord Jesus Christ")

**Default Behavior:** `pageBreakBefore: true` (Gospel gets its own page)

---

## 6. Liturgical Ceremony

**Purpose:** The actual sacramental rite - vows, blessings, ritual actions specific to each module.

**Interface:** Flexible - custom implementation per module

### Examples by Module

- **Wedding** - Marriage vows, exchange of consent, exchange of rings, nuptial blessing
- **Baptism** - Baptismal promises, blessing of water, baptism with water, anointing with chrism
- **Funeral** - Final commendation, incensation, song of farewell
- **Presentation** - Presentation blessing, sign of the cross, commitment questions
- **Quinceañera** - Renewal of baptismal promises, blessing, presentation of symbols

### Common Elements

- Rubrics (stage directions)
- Priest dialogue and prayers
- Responses from participants and assembly
- Prayer texts
- Blessing instructions
- Ritual action descriptions

### Structure

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
    type: 'presider-dialogue',
    text: 'Dearly beloved, we are gathered here today...'
  })

  // Response
  elements.push({
    type: 'response-dialogue',
    label: 'Bride and Groom:',
    text: 'I do.'
  })

  // Prayer text
  elements.push({
    type: 'priest-text',
    text: 'Heavenly Father, we ask your blessing upon this couple...'
  })

  elements.push({
    type: 'response-dialogue',
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

### 🔴 CRITICAL - Flexible Positioning

- **Can appear anywhere** in the document (before readings, after Gospel, interspersed, etc.)
- **Can be multiple sections** (e.g., wedding vows + ring exchange + nuptial blessing as 3 separate sections)
- **Position varies by module** based on liturgical requirements
- Typically positioned after Gospel or between readings
- Sometimes positioned before all readings (e.g., Presentation)

### Common Positioning Patterns

- **Wedding:** After Gospel (marriage consent, exchange of rings, nuptial blessing)
- **Baptism:** Multiple sections interspersed (baptismal promises, water baptism, anointing, clothing)
- **Funeral:** After readings (final commendation, incensation)
- **Presentation:** Before or after readings (presentation blessing)
- **Quinceañera:** After Gospel (renewal of promises, blessing, symbols)

### Page Break Behavior

- Typically `pageBreakBefore: false` (flows from previous section)
- May use `pageBreakBefore: true` for major ceremony transitions
- May use subsection titles to organize multi-part ceremonies

### Implementation Notes

- Use the shared `gendered()` helper from `@/lib/content-builders/shared/builders` for gendered text
- Use helper functions for names, dates, and other formatting
- Use rubrics for stage directions
- Use `presider-dialogue` for spoken celebrant text
- Use `priest-text` for prayers
- Use `response-dialogue` for participant/assembly responses
- Use `spacer` elements for readability

### Example 1 - Single Presentation Ceremony (appears after homily)

```typescript
import { gendered } from '@/lib/content-builders/shared/builders'

function buildPresentationBlessingSection(presentation: PresentationWithRelations): ContentSection {
  const childName = getChildName(presentation)

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
    type: 'presider-dialogue',
    text: `Grateful for the life of their ${gendered(presentation.child, 'son', 'daughter')}, the parents would like to present ${childName} to the Lord.`
  })

  elements.push({
    type: 'rubric',
    text: 'Walk to the front of the altar'
  })

  // Commitment question
  elements.push({
    type: 'presider-dialogue',
    text: 'Do you commit to raise this child in the ways of faith?'
  })

  elements.push({
    type: 'response-dialogue',
    label: 'Parents:',
    text: 'Yes, we do.'
  })

  // Prayer
  elements.push({
    type: 'priest-text',
    text: 'Heavenly Father, you are the giver of all life. Bless this child and these parents...'
  })

  elements.push({
    type: 'response-dialogue',
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

### Example 2 - Multiple Wedding Ceremony Sections (after Gospel)

```typescript
// Ceremony Section 1: Marriage Consent
function buildMarriageConsentSection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Marriage Consent'
  })

  elements.push({
    type: 'presider-dialogue',
    text: 'Do you take this woman to be your lawfully wedded wife?'
  })

  elements.push({
    type: 'response-dialogue',
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
    type: 'response-dialogue',
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

### When NOT to Use

- If the module has no specific ceremony (e.g., Mass Intention summary)
- If readings and petitions are the only liturgical content

**Returns:** `ContentSection | null` (return null if no ceremony for this module)

---

## 7. Petitions (Prayer of the Faithful)

**Purpose:** Intercessions for the Church, world, community, and individuals.

**Interface:** Strict - use `buildPetitionsSection()`

### Usage

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

### Automatic Elements

- Section title ("Petitions")
- Reader name (determined by logic)
- Introductory instruction with response
- Each petition with "let us pray to the Lord" ending
- Response after each petition ("Lord, hear our prayer")

### Petition Text Format

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

---

## 8. Announcements

**Purpose:** End-of-liturgy announcements, reminders, or notes.

**Interface:** Flexible - can use `buildAnnouncementsSection()` or custom implementation

### Shared Builder Usage

```typescript
import { buildAnnouncementsSection } from '@/lib/content-builders/shared/script-sections'

const announcementsSection = buildAnnouncementsSection(entity.announcements)

if (announcementsSection) {
  sections.push(announcementsSection)
}
```

### Custom Implementation

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

## Related Documentation

- **[OVERVIEW.md](./OVERVIEW.md)** - System overview and design principles
- **[SHARED_BUILDERS.md](./SHARED_BUILDERS.md)** - Detailed documentation for shared builder functions
- **[CUSTOM_SECTIONS.md](./CUSTOM_SECTIONS.md)** - Patterns for implementing custom sections
- **[PAGE_BREAKS.md](./PAGE_BREAKS.md)** - Page break rules and strategies
- **[LITURGICAL_SCRIPT_REFERENCE.md](../LITURGICAL_SCRIPT_REFERENCE.md)** - Element types and styling reference

---

**Last Updated:** 2025-01-17
**Status:** Complete reference for all 8 section interfaces
**Coverage:** Detailed interfaces, usage examples, automatic elements, positioning rules, implementation notes
