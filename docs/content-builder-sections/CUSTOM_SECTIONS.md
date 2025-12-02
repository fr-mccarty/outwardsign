# Custom Section Implementation Patterns

> **Purpose:** Patterns and best practices for implementing custom sections (Cover Sheet/Summary, Liturgical Ceremony, Custom Announcements) in content builders.

## Table of Contents

1. [Overview](#overview)
2. [Summary Section Pattern](#summary-section-pattern)
3. [Liturgical Ceremony Pattern](#liturgical-ceremony-pattern)
4. [Custom Announcements Pattern](#custom-announcements-pattern)
5. [Common Helper Functions](#common-helper-functions)

---

## Overview

Custom sections allow module-specific implementation while following consistent patterns and element types.

### When to Create Custom Sections

**Required Custom Implementation:**
- **Cover Sheet (Summary)** - Each module has different metadata to display
- **Liturgical Ceremony** - Each sacrament has unique rites and rituals

**Optional Custom Implementation:**
- **Announcements** - When simple shared builder doesn't meet needs

### Key Principles

1. **Use semantic element types** - `section-title`, `info-row`, `rubric`, etc.
2. **Group related information** - Use subsection titles to organize content
3. **Use helper functions** - Format dates, names, locations consistently
4. **Conditional subsections** - Only show sections that have content
5. **Return nullable types** - Return `ContentSection | null` for optional sections

---

## Summary Section Pattern

The summary section is the cover page with event metadata. Always appears first in the document.

### Basic Structure

```typescript
import { ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
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
      value: entity.person.full_name
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
        value: entity.presider.full_name
      })
    }

    if (entity.homilist && entity.homilist.id !== entity.presider?.id) {
      elements.push({
        type: 'info-row',
        label: 'Homilist:',
        value: entity.homilist.full_name
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

### Best Practices

1. **Use subsection titles** to group related information
2. **Conditional subsections** - Only show if they have content
3. **Use helper functions** for all formatting
4. **Always set `pageBreakAfter: true`** to separate cover from liturgy
5. **Return `ContentSection`** (not nullable - summary always exists)
6. **Use `info-row` elements** for label-value pairs

### Common Subsections

**Event Information:**
- Event type
- Participants (bride/groom, deceased, child, etc.)
- Date and time
- Location

**Ministers:**
- Presider
- Homilist (if different from presider)
- Deacon (if applicable)

**Participants/Readers:**
- First reader
- Second reader
- Psalm reader
- Petition reader

**Sacred Liturgy:**
- Readings (pericopes)
- Psalm
- Other liturgical elements

**Notes:**
- Special instructions
- General notes

### Example - Wedding Summary

```typescript
function buildSummarySection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Event Information
  elements.push({ type: 'section-title', text: 'Wedding Information' })

  elements.push({
    type: 'info-row',
    label: 'Bride:',
    value: wedding.bride.full_name
  })

  elements.push({
    type: 'info-row',
    label: 'Groom:',
    value: wedding.groom.full_name
  })

  if (wedding.event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Date & Time:',
      value: formatEventDateTime(wedding.event)
    })
  }

  // Ministers
  if (wedding.presider) {
    elements.push({ type: 'section-title', text: 'Ministers' })

    elements.push({
      type: 'info-row',
      label: 'Presider:',
      value: wedding.presider.full_name
    })
  }

  // Readers
  const hasReaders = wedding.first_reader || wedding.second_reader
  if (hasReaders) {
    elements.push({ type: 'section-title', text: 'Readers' })

    if (wedding.first_reader) {
      elements.push({
        type: 'info-row',
        label: 'First Reading:',
        value: wedding.first_reader.full_name
      })
    }
  }

  return {
    id: 'summary',
    pageBreakAfter: true,
    elements
  }
}
```

---

## Liturgical Ceremony Pattern

Liturgical ceremony sections contain the actual sacramental rite specific to each module. These sections are highly flexible in content and positioning.

### Basic Structure

```typescript
import { gendered } from '@/lib/content-builders/shared/builders'

function buildCeremonySection(entity: EntityWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Section title
  elements.push({
    type: 'section-title',
    text: 'Ceremony Title'
  })

  // Rubric (stage direction)
  elements.push({
    type: 'rubric',
    text: 'Stage direction or instruction'
  })

  // Priest dialogue
  elements.push({
    type: 'presider-dialogue',
    text: 'Words spoken by the presider'
  })

  // Response
  elements.push({
    type: 'response-dialogue',
    label: 'Participant:',
    text: 'Response text'
  })

  // Prayer
  elements.push({
    type: 'priest-text',
    text: 'Prayer text'
  })

  // Assembly response
  elements.push({
    type: 'response-dialogue',
    label: 'Assembly:',
    text: 'Amen.'
  })

  return {
    id: 'ceremony-id',
    pageBreakBefore: false,  // Adjust based on flow
    elements
  }
}
```

### Common Element Types

**Rubrics (Stage Directions):**
```typescript
elements.push({
  type: 'rubric',
  text: 'The couple stands before the altar'
})
```

**Presider Dialogue (Spoken by Priest/Deacon):**
```typescript
elements.push({
  type: 'presider-dialogue',
  text: 'Do you take this woman to be your lawfully wedded wife?'
})
```

**Prayer Text (Formal Prayers):**
```typescript
elements.push({
  type: 'priest-text',
  text: 'Heavenly Father, we ask your blessing upon this couple...'
})
```

**Response Dialogue (Participant/Assembly Responses):**
```typescript
elements.push({
  type: 'response-dialogue',
  label: 'Groom:',
  text: 'I do.'
})

elements.push({
  type: 'response-dialogue',
  label: 'Assembly:',
  text: 'Amen.'
})
```

**Spacers (Visual Separation):**
```typescript
elements.push({ type: 'spacer' })
```

### Example - Wedding Marriage Consent

```typescript
function buildMarriageConsentSection(wedding: WeddingWithRelations): ContentSection {
  const brideName = wedding.bride.full_name
  const groomName = wedding.groom.full_name

  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Marriage Consent'
  })

  elements.push({
    type: 'rubric',
    text: 'The couple stands before the altar facing the priest'
  })

  elements.push({
    type: 'presider-dialogue',
    text: `${groomName}, do you take ${brideName} to be your lawfully wedded wife?`
  })

  elements.push({
    type: 'response-dialogue',
    label: 'Groom:',
    text: 'I do.'
  })

  elements.push({ type: 'spacer' })

  elements.push({
    type: 'presider-dialogue',
    text: `${brideName}, do you take ${groomName} to be your lawfully wedded husband?`
  })

  elements.push({
    type: 'response-dialogue',
    label: 'Bride:',
    text: 'I do.'
  })

  return {
    id: 'marriage-consent',
    pageBreakBefore: false,
    elements
  }
}
```

### Example - Baptism Water Baptism

```typescript
function buildWaterBaptismSection(baptism: BaptismWithRelations): ContentSection {
  const childName = baptism.child.full_name
  const gender = baptism.child.gender

  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Baptism with Water'
  })

  elements.push({
    type: 'rubric',
    text: 'The priest pours water three times over the child\'s head'
  })

  elements.push({
    type: 'presider-dialogue',
    text: `${childName}, I baptize you in the name of the Father, and of the Son, and of the Holy Spirit.`
  })

  elements.push({
    type: 'response-dialogue',
    label: 'Assembly:',
    text: 'Amen.'
  })

  elements.push({ type: 'spacer' })

  elements.push({
    type: 'rubric',
    text: `The priest anoints ${gendered(baptism.child, 'him', 'her')} with chrism on the crown of the head`
  })

  elements.push({
    type: 'priest-text',
    text: 'God the Father of our Lord Jesus Christ has freed you from sin, given you a new birth by water and the Holy Spirit, and welcomed you into his holy people.'
  })

  return {
    id: 'water-baptism',
    pageBreakBefore: true,
    elements
  }
}
```

### Multiple Ceremony Sections

Modules can have multiple ceremony sections at different positions:

```typescript
// Wedding - 3 ceremony sections after Gospel
sections.push(buildCoverPage(wedding))
sections.push(buildFirstReading(wedding))
sections.push(buildPsalm(wedding))
sections.push(buildGospel(wedding))
sections.push(buildMarriageConsentSection(wedding))     // Ceremony 1
sections.push(buildRingExchangeSection(wedding))        // Ceremony 2
sections.push(buildNuptialBlessingSection(wedding))     // Ceremony 3
sections.push(buildPetitions(wedding))

// Baptism - Ceremony sections interspersed
sections.push(buildCoverPage(baptism))
sections.push(buildBaptismalPromisesSection(baptism))   // Ceremony 1 - before readings
sections.push(buildFirstReading(baptism))
sections.push(buildGospel(baptism))
sections.push(buildWaterBaptismSection(baptism))        // Ceremony 2 - after Gospel
sections.push(buildAnointingSection(baptism))           // Ceremony 3
sections.push(buildPetitions(baptism))
```

### Using the Gendered Helper

For gender-specific text, use the `gendered()` helper:

```typescript
import { gendered } from '@/lib/content-builders/shared/builders'

// Returns masculine/feminine based on person.gender
const pronoun = gendered(person, 'him', 'her')
const possessive = gendered(person, 'his', 'her')
const title = gendered(person, 'son', 'daughter')

elements.push({
  type: 'presider-dialogue',
  text: `May God bless ${pronoun} and keep ${possessive} in ${possessive} care.`
})
```

---

## Custom Announcements Pattern

The shared `buildAnnouncementsSection()` works for simple announcements. Create a custom implementation when you need more structure.

### Simple Custom Implementation

```typescript
function buildAnnouncementsSection(entity: EntityWithRelations): ContentSection | null {
  if (!entity.announcements) return null

  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Announcements'
  })

  elements.push({
    type: 'text',
    text: entity.announcements
  })

  return {
    id: 'announcements',
    elements
  }
}
```

### Multi-Paragraph Implementation

```typescript
function buildAnnouncementsSection(entity: EntityWithRelations): ContentSection | null {
  if (!entity.announcements) return null

  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Announcements'
  })

  // Split by double newlines and add spacers between paragraphs
  const paragraphs = entity.announcements.split('\n\n').filter(p => p.trim())

  paragraphs.forEach((paragraph, index) => {
    elements.push({
      type: 'text',
      text: paragraph.trim()
    })

    // Add spacer between paragraphs (not after last)
    if (index < paragraphs.length - 1) {
      elements.push({ type: 'spacer' })
    }
  })

  return {
    id: 'announcements',
    elements
  }
}
```

### Structured Announcements

```typescript
function buildAnnouncementsSection(entity: EntityWithRelations): ContentSection | null {
  const hasAnnouncements = entity.general_announcements || entity.reception_info
  if (!hasAnnouncements) return null

  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Announcements'
  })

  if (entity.general_announcements) {
    elements.push({
      type: 'subsection-title',
      text: 'General Announcements'
    })
    elements.push({
      type: 'text',
      text: entity.general_announcements
    })
    elements.push({ type: 'spacer' })
  }

  if (entity.reception_info) {
    elements.push({
      type: 'subsection-title',
      text: 'Reception Information'
    })
    elements.push({
      type: 'text',
      text: entity.reception_info
    })
  }

  return {
    id: 'announcements',
    elements
  }
}
```

---

## Common Helper Functions

### Person Names

```typescript
// ✅ ALWAYS use database-generated full_name
const name = entity.person.full_name

// ❌ NEVER manually concatenate
const name = `${entity.person.first_name} ${entity.person.last_name}`
```

### Dates and Times

```typescript
import { formatEventDateTime } from '@/lib/utils/formatters'

// Format event date and time
const datetime = formatEventDateTime(entity.event)
// Example output: "Saturday, July 15, 2025 at 2:00 PM"
```

### Locations

```typescript
import { formatLocationWithAddress } from '@/lib/utils/formatters'

// Format location with address
const location = formatLocationWithAddress(entity.event.location)
// Example output: "St. Mary's Church, 123 Main St, Anytown, CA 12345"
```

### Reading Pericopes

```typescript
// Get scripture reference from reading
const pericope = entity.first_reading?.pericope || 'Not selected'
```

### Gendered Text

```typescript
import { gendered } from '@/lib/content-builders/shared/builders'

const pronoun = gendered(person, 'him', 'her')
const possessive = gendered(person, 'his', 'her')
const title = gendered(person, 'son', 'daughter')
```

---

## Related Documentation

- **[OVERVIEW.md](./OVERVIEW.md)** - System overview and design principles
- **[SECTION_INTERFACES.md](./SECTION_INTERFACES.md)** - Interfaces for all section types
- **[SHARED_BUILDERS.md](./SHARED_BUILDERS.md)** - Shared builder functions for strict sections
- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Do's and don'ts for section implementation
- **[FORMATTERS.md](../FORMATTERS.md)** - Complete helper function reference
- **[LITURGICAL_SCRIPT_REFERENCE.md](../LITURGICAL_SCRIPT_REFERENCE.md)** - Element types and styling

---

**Last Updated:** 2025-01-17
**Status:** Complete patterns for custom section implementation
**Coverage:** Summary sections, liturgical ceremony sections, custom announcements, helper functions, examples
