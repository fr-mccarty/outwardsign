# Content Builder Section Best Practices

> **Purpose:** Do's and don'ts for implementing content builder sections. Essential patterns to follow and common mistakes to avoid.

## Table of Contents

1. [Always Use Shared Builders for Strict Sections](#1-always-use-shared-builders-for-strict-sections)
2. [Check for Null Before Adding Sections](#2-check-for-null-before-adding-sections)
3. [Use Database-Generated Fields for Person Names](#3-use-database-generated-fields-for-person-names)
4. [Set Title/Subtitle at Document Level Only](#4-set-titlesubtitle-at-document-level-only)
5. [Respect Section Order](#5-respect-section-order)
6. [Use Conditional Subsections](#6-use-conditional-subsections)
7. [Don't Worry About Page Breaks After Last Section](#7-dont-worry-about-page-breaks-after-last-section)
8. [Use Helper Functions for Formatting](#8-use-helper-functions-for-formatting)
9. [Use Semantic Element Types](#9-use-semantic-element-types)
10. [Return Nullable Types for Optional Sections](#10-return-nullable-types-for-optional-sections)

---

## 1. Always Use Shared Builders for Strict Sections

### ❌ WRONG

```typescript
// Custom implementation of reading section
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
```

### ✅ CORRECT

```typescript
// Use shared builder
import { buildReadingSection } from '@/lib/content-builders/shared/script-sections'

const section = buildReadingSection({
  id: 'first-reading',
  title: 'FIRST READING',
  reading: entity.first_reading,
  reader: entity.first_reader,
  responseText: 'Thanks be to God.'
})
```

### Why It Matters

- **Consistency** - All templates format readings the same way
- **Liturgical accuracy** - Shared builders implement Church standards correctly
- **Maintenance** - Fixes/improvements to shared builders benefit all templates
- **Completeness** - Shared builders include all required elements

---

## 2. Check for Null Before Adding Sections

### ❌ WRONG

```typescript
// Might push null to sections array
sections.push(buildReadingSection({ ... }))
```

### ✅ CORRECT

```typescript
// Check for null before pushing
const section = buildReadingSection({ ... })
if (section) {
  sections.push(section)
}

// Or concise version
const section = buildReadingSection({ ... })
if (section) sections.push(section)
```

### Why It Matters

- **Prevents errors** - Pushing null would cause rendering failures
- **Handles optional content** - Readings, psalms, petitions may not be selected
- **Clean sections array** - Only includes actual content

---

## 3. Use Database-Generated Fields for Person Names

### ❌ WRONG

```typescript
// Manual concatenation
value: `${entity.person.first_name} ${entity.person.last_name}`
```

### ✅ CORRECT

```typescript
// Use database-generated full_name
value: entity.person.full_name
```

### Why It Matters

- **Consistency** - Database field handles name formatting consistently
- **Handles edge cases** - Middle names, suffixes, nicknames handled correctly
- **Simpler code** - No manual string concatenation
- **Maintainable** - Name format changes happen in one place (database)

---

## 4. Set Title/Subtitle at Document Level Only

### ❌ WRONG

```typescript
// Title in section elements (duplicates document title)
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
```

### ✅ CORRECT

```typescript
// Title/subtitle at document level
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

### Why It Matters

- **Prevents duplication** - Title/subtitle rendered once by all renderers
- **Consistent styling** - Document-level title has special formatting
- **Cleaner code** - Title logic in one place, not scattered in section builders

---

## 5. Respect Section Order

### ✅ CORRECT

```typescript
// Proper liturgical order
sections.push(buildSummarySection(entity))
sections.push(buildFirstReadingSection(entity))
sections.push(buildPsalmSection(entity))
sections.push(buildSecondReadingSection(entity))
sections.push(buildGospelSection(entity))
sections.push(buildCeremonySection(entity))        // After Gospel, before Petitions
sections.push(buildPetitionsSection(entity))
sections.push(buildAnnouncementsSection(entity))
```

### ❌ WRONG

```typescript
// Ceremony after petitions (out of liturgical order)
sections.push(buildSummarySection(entity))
sections.push(buildGospelSection(entity))
sections.push(buildPetitionsSection(entity))
sections.push(buildCeremonySection(entity))        // Wrong position
```

### Why It Matters

- **Liturgical standards** - Catholic liturgy has established ordering
- **User expectations** - Priests/deacons expect standard flow
- **Readability** - Logical progression through the celebration

### Typical Order

1. Summary (always first)
2. First Reading
3. Psalm
4. Second Reading
5. Gospel
6. Liturgical Ceremony Section(s) - **Flexible position, but typically after Gospel**
7. Petitions
8. Announcements (typically last)

---

## 6. Use Conditional Subsections

### ✅ CORRECT

```typescript
// Only show subsection if content exists
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
```

### ❌ WRONG

```typescript
// Showing empty subsection
function buildSummarySection(entity: EntityWithRelations): ContentSection {
  const elements = []

  elements.push({ type: 'section-title', text: 'Ministers' })  // Always shown
  // What if no ministers? Empty subsection!

  return { id: 'summary', elements }
}
```

### Why It Matters

- **Cleaner output** - No empty sections confusing readers
- **Professional appearance** - Only show relevant information
- **Better UX** - Priests don't see irrelevant empty headings

---

## 7. Don't Worry About Page Breaks After Last Section

### ✅ CORRECT

```typescript
// Renderer handles this automatically
const petitions = buildPetitionsSection({ ... })  // Has pageBreakAfter: true
if (petitions) sections.push(petitions)

// If petitions is last, no page break occurs
// No manual checking needed!
```

### ❌ WRONG

```typescript
// Unnecessary manual checking
if (petitions) {
  const isLast = !entity.announcements
  petitions.pageBreakAfter = !isLast  // Don't do this!
  sections.push(petitions)
}
```

### Why It Matters

- **Simpler code** - Let renderers handle edge cases
- **Maintainable** - One place (renderer) manages last-section logic
- **No blank pages** - Renderers prevent trailing page breaks automatically

---

## 8. Use Helper Functions for Formatting

### ❌ WRONG

```typescript
// Manual date formatting
value: `${entity.event.start_date} at ${entity.event.start_time}`

// Manual location formatting
value: `${entity.event.location.name}, ${entity.event.location.address}`
```

### ✅ CORRECT

```typescript
import { formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'

// Use helper functions
value: formatEventDateTime(entity.event)
value: formatLocationWithAddress(entity.event.location)
```

### Why It Matters

- **Consistency** - All dates/locations formatted the same way
- **Handles edge cases** - Helpers handle missing data, timezones, etc.
- **Maintainable** - Format changes happen in one place
- **Readability** - Clear intent vs. manual string concatenation

### Common Helper Functions

```typescript
// From @/lib/utils/formatters
formatEventDateTime(event)           // "Saturday, July 15, 2025 at 2:00 PM"
formatLocationWithAddress(location)  // "St. Mary's Church, 123 Main St, Anytown, CA"
formatDatePretty(date)               // "July 15, 2025"

// From module helpers
buildTitleEnglish(entity)            // Entity-specific page title
getEventSubtitleEnglish(entity)      // Entity-specific subtitle
getReadingPericope(reading)          // Scripture reference
```

---

## 9. Use Semantic Element Types

### ✅ CORRECT

```typescript
// Semantic element types
elements.push({
  type: 'section-title',      // Subsection heading
  text: 'Ministers'
})

elements.push({
  type: 'info-row',          // Label-value pair
  label: 'Presider:',
  value: entity.presider.full_name
})

elements.push({
  type: 'rubric',            // Stage direction
  text: 'The couple stands before the altar'
})

elements.push({
  type: 'presider-dialogue', // Spoken by priest/deacon
  text: 'Dearly beloved...'
})

elements.push({
  type: 'priest-text',       // Prayer text
  text: 'Heavenly Father...'
})

elements.push({
  type: 'response-dialogue', // Participant/assembly response
  label: 'Assembly:',
  text: 'Amen.'
})
```

### ❌ WRONG

```typescript
// Generic 'text' type for everything
elements.push({
  type: 'text',
  text: 'Ministers'  // Should be 'section-title'
})

elements.push({
  type: 'text',
  text: 'Presider: Fr. Smith'  // Should be 'info-row'
})
```

### Why It Matters

- **Proper styling** - Renderers style each type differently
- **Semantic meaning** - Clear intent and purpose
- **Accessibility** - Screen readers use semantic structure
- **Maintainability** - Easy to update styling for specific element types

---

## 10. Return Nullable Types for Optional Sections

### ✅ CORRECT

```typescript
// Optional ceremony section - can return null
function buildCeremonySection(entity: EntityWithRelations): ContentSection | null {
  if (!entity.hasCeremony) return null

  return {
    id: 'ceremony',
    elements: [...]
  }
}

// Always-present summary section - returns ContentSection
function buildSummarySection(entity: EntityWithRelations): ContentSection {
  return {
    id: 'summary',
    pageBreakAfter: true,
    elements: [...]
  }
}
```

### ❌ WRONG

```typescript
// Optional section doesn't return null
function buildCeremonySection(entity: EntityWithRelations): ContentSection {
  return {
    id: 'ceremony',
    elements: []  // Empty elements array - should return null instead
  }
}
```

### Why It Matters

- **Clear contracts** - Type signature indicates optionality
- **Clean output** - No empty sections in final document
- **Consistent pattern** - All optional sections can return null
- **Easier debugging** - null checks make intent clear

---

## Related Documentation

- **[OVERVIEW.md](./OVERVIEW.md)** - System overview and design principles
- **[SECTION_INTERFACES.md](./SECTION_INTERFACES.md)** - Interfaces for all section types
- **[SHARED_BUILDERS.md](./SHARED_BUILDERS.md)** - Shared builder documentation
- **[CUSTOM_SECTIONS.md](./CUSTOM_SECTIONS.md)** - Custom section patterns
- **[TEMPLATE_EXAMPLE.md](./TEMPLATE_EXAMPLE.md)** - Complete working example
- **[FORMATTERS.md](../FORMATTERS.md)** - Helper function reference

---

**Last Updated:** 2025-01-17
**Status:** Complete best practices guide
**Coverage:** 10 critical patterns with do's/don'ts, rationale, and examples
