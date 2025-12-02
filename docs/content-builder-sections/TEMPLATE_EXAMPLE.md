# Complete Template Example

> **Purpose:** Fully annotated, working example of a content builder template using all section types and demonstrating best practices.

## Table of Contents

1. [Overview](#overview)
2. [Complete Template Code](#complete-template-code)
3. [Breakdown by Section](#breakdown-by-section)
4. [Document Structure](#document-structure)

---

## Overview

This example demonstrates a complete liturgical template implementation that:

- Uses all 8 section types
- Follows strict vs. flexible section rules
- Uses shared builders correctly
- Handles optional sections with null checks
- Sets title/subtitle at document level
- Implements proper page breaks
- Uses helper functions for formatting

**Module:** Generic liturgical event (applicable pattern for any module)

---

## Complete Template Code

```typescript
import { EntityWithRelations } from '@/lib/actions/entities'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection
} from '@/lib/content-builders/shared/script-sections'
import { buildTitleEnglish, getEventSubtitleEnglish } from '../helpers'
import { gendered } from '@/lib/content-builders/shared/builders'

/**
 * 1. COVER SHEET (SUMMARY) - Custom implementation
 */
function buildSummarySection(entity: EntityWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Event Information subsection
  elements.push({
    type: 'section-title',
    text: 'Event Information'
  })

  if (entity.person) {
    elements.push({
      type: 'info-row',
      label: 'Person:',
      value: entity.person.full_name  // Use database-generated field
    })
  }

  if (entity.event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Date & Time:',
      value: formatEventDateTime(entity.event)  // Use helper function
    })
  }

  if (entity.event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Location:',
      value: formatLocationWithAddress(entity.event.location)  // Use helper function
    })
  }

  // Ministers subsection (only if any minister exists)
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

  // Readers subsection (only if any reader exists)
  const hasReaders = entity.first_reader || entity.second_reader || entity.petition_reader
  if (hasReaders) {
    elements.push({
      type: 'section-title',
      text: 'Readers'
    })

    if (entity.first_reader) {
      elements.push({
        type: 'info-row',
        label: 'First Reading:',
        value: entity.first_reader.full_name
      })
    }

    if (entity.second_reader) {
      elements.push({
        type: 'info-row',
        label: 'Second Reading:',
        value: entity.second_reader.full_name
      })
    }

    if (entity.petition_reader) {
      elements.push({
        type: 'info-row',
        label: 'Petitions:',
        value: entity.petition_reader.full_name
      })
    }
  }

  // Notes subsection (only if notes exist)
  if (entity.notes) {
    elements.push({
      type: 'section-title',
      text: 'Notes'
    })

    elements.push({
      type: 'text',
      text: entity.notes
    })
  }

  return {
    id: 'summary',
    pageBreakAfter: true,  // Separate cover from liturgy
    elements
  }
}

/**
 * 6. LITURGICAL CEREMONY SECTION 1 - Custom implementation
 */
function buildCeremonyPartOneSection(entity: EntityWithRelations): ContentSection {
  const personName = entity.person?.full_name || 'the person'
  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Ceremony - Part One'
  })

  elements.push({
    type: 'rubric',
    text: 'After the Gospel'
  })

  elements.push({
    type: 'presider-dialogue',
    text: `We gather to celebrate with ${personName}...`
  })

  elements.push({
    type: 'response-dialogue',
    label: 'Assembly:',
    text: 'Thanks be to God.'
  })

  return {
    id: 'ceremony-part-one',
    pageBreakBefore: false,  // Flow from Gospel
    elements
  }
}

/**
 * 6. LITURGICAL CEREMONY SECTION 2 - Custom implementation
 */
function buildCeremonyPartTwoSection(entity: EntityWithRelations): ContentSection {
  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Blessing'
  })

  elements.push({
    type: 'priest-text',
    text: 'Heavenly Father, we ask your blessing upon this gathering...'
  })

  elements.push({
    type: 'response-dialogue',
    label: 'Assembly:',
    text: 'Amen.'
  })

  return {
    id: 'ceremony-part-two',
    pageBreakBefore: false,  // Flow from previous ceremony section
    elements
  }
}

/**
 * MAIN TEMPLATE BUILDER
 */
export function buildFullScriptEnglish(entity: EntityWithRelations): LiturgyDocument {
  // Build title and subtitle at DOCUMENT LEVEL (not in section elements)
  const title = buildTitleEnglish(entity)
  const subtitle = getEventSubtitleEnglish(entity)

  const sections: ContentSection[] = []

  // 1. Summary (always present) - Custom section
  sections.push(buildSummarySection(entity))

  // 2. First Reading (optional) - Shared builder
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

  // 3. Psalm (optional) - Shared builder
  const psalm = buildPsalmSection({
    psalm: entity.psalm,
    psalm_reader: entity.psalm_reader,
    psalm_is_sung: entity.psalm_is_sung
  })
  if (psalm) {
    sections.push(psalm)
  }

  // 4. Second Reading (optional) - Shared builder
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

  // 5. Gospel (optional) - Shared builder with Gospel-specific options
  const gospel = buildReadingSection({
    id: 'gospel',
    title: 'GOSPEL',
    reading: entity.gospel_reading,
    includeGospelDialogue: true,       // Gospel dialogue exchange
    includeGospelAcclamations: true,   // Gospel acclamations
    pageBreakBefore: true              // Gospel traditionally starts on new page
  })
  if (gospel) {
    sections.push(gospel)
  }

  // 6. Liturgical Ceremony Section(s) - Custom sections
  // Can have multiple ceremony sections at flexible positions
  const ceremonyPartOne = buildCeremonyPartOneSection(entity)
  if (ceremonyPartOne) {
    sections.push(ceremonyPartOne)
  }

  const ceremonyPartTwo = buildCeremonyPartTwoSection(entity)
  if (ceremonyPartTwo) {
    sections.push(ceremonyPartTwo)
  }

  // 7. Petitions (optional) - Shared builder
  const petitions = buildPetitionsSection({
    petitions: entity.petitions,
    petition_reader: entity.petition_reader,
    second_reader: entity.second_reader,
    petitions_read_by_second_reader: entity.petitions_read_by_second_reader
  })
  if (petitions) {
    sections.push(petitions)
  }

  // 8. Announcements (optional) - Shared builder
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
    title,        // Set at document level (rendered by all renderers)
    subtitle,     // Set at document level (rendered by all renderers)
    sections
  }
}
```

---

## Breakdown by Section

### 1. Summary Section (Custom)

**What it does:**
- Creates cover page with event metadata
- Uses conditional subsections (only show if content exists)
- Uses helper functions for formatting
- Always returns a section (not nullable)

**Key patterns:**
- `pageBreakAfter: true` - Separates cover from liturgy
- Subsection titles group related info
- Database-generated `full_name` fields
- Helper functions for dates and locations

### 2. First Reading (Shared Builder)

**What it does:**
- Uses strict shared builder for consistency
- Returns null if no reading selected
- Automatically includes all required elements

**Key patterns:**
- Check for null before pushing to sections array
- Use `responseText: 'Thanks be to God.'`
- Set `pageBreakBefore: false` to flow from summary

### 3. Psalm (Shared Builder)

**What it does:**
- Uses strict shared builder
- Handles sung vs. read psalms automatically
- Fixed `pageBreakBefore: true` (cannot override)

**Key patterns:**
- Check for null before pushing
- No need to set page break (shared builder handles it)

### 4. Second Reading (Shared Builder)

**What it does:**
- Same as First Reading
- Strict shared builder for consistency

### 5. Gospel (Shared Builder)

**What it does:**
- Uses shared builder with Gospel-specific options
- Includes special dialogue and acclamations
- Traditionally starts on new page

**Key patterns:**
- `includeGospelDialogue: true` - Adds Gospel dialogue exchange
- `includeGospelAcclamations: true` - Adds acclamations
- `pageBreakBefore: true` - Liturgical tradition
- No `reader` or `responseText` (Gospel is read by priest/deacon)

### 6. Liturgical Ceremony Sections (Custom)

**What it does:**
- Custom implementation for module-specific rites
- Can have multiple ceremony sections
- Flexible positioning (in this example, after Gospel)

**Key patterns:**
- Use semantic element types (`rubric`, `presider-dialogue`, `priest-text`, `response-dialogue`)
- `pageBreakBefore: false` - Flow from previous sections
- Can conditionally include (return null if not needed)
- Use gendered helper for pronoun handling

### 7. Petitions (Shared Builder)

**What it does:**
- Uses strict shared builder
- Automatically formats petition text with responses
- Determines reader based on configuration

**Key patterns:**
- Fixed `pageBreakBefore: true` and `pageBreakAfter: true`
- Returns null if no petitions
- Builder handles all formatting automatically

### 8. Announcements (Shared Builder)

**What it does:**
- Simple announcements section
- Can also use custom implementation if needed

**Key patterns:**
- No page breaks (flows naturally)
- Returns null if no announcements
- Last section, so `pageBreakAfter` would be ignored anyway

---

## Document Structure

### With All Sections Present

**Page Structure:**
- **Page 1:** Summary (pageBreakAfter creates break)
- **Page 2:** First Reading (flows together)
- **Page 3:** Psalm (pageBreakBefore creates break) + Second Reading (flows)
- **Page 4:** Gospel (pageBreakBefore creates break)
- **Page 5:** Ceremony Part One + Ceremony Part Two (flow together)
- **Page 6:** Petitions (pageBreakBefore creates break)
- **Page 7:** Announcements (pageBreakAfter from petitions creates break)

### Minimal Document (Only Summary + Petitions)

**Page Structure:**
- **Page 1:** Summary
- **Page 2:** Petitions (no trailing page break - last section)

### Common Variations

**Without Second Reading:**
- Pages flow: Summary → First Reading → Psalm → Gospel → Ceremony → Petitions → Announcements

**Without Announcements:**
- Petitions becomes last section
- `pageBreakAfter` on petitions is ignored

**Without Gospel:**
- Second Reading flows into Ceremony sections

---

## Related Documentation

- **[OVERVIEW.md](./OVERVIEW.md)** - System overview and section types
- **[SECTION_INTERFACES.md](./SECTION_INTERFACES.md)** - Detailed interfaces for all sections
- **[SHARED_BUILDERS.md](./SHARED_BUILDERS.md)** - Shared builder documentation
- **[CUSTOM_SECTIONS.md](./CUSTOM_SECTIONS.md)** - Custom section patterns
- **[PAGE_BREAKS.md](./PAGE_BREAKS.md)** - Page break strategies
- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Do's and don'ts

---

**Last Updated:** 2025-01-17
**Status:** Complete working template example
**Coverage:** All 8 section types, shared builders, custom sections, page breaks, null checks, helper functions
