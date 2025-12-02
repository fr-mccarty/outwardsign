# Shared Section Builders Reference

> **Purpose:** Detailed documentation for the shared builder functions used to create strict liturgical sections (readings, psalm, petitions, announcements).

## Table of Contents

1. [Overview](#overview)
2. [buildReadingSection()](#buildreadingsection)
3. [buildPsalmSection()](#buildpsalmsection)
4. [buildPetitionsSection()](#buildpetitionssection)
5. [buildAnnouncementsSection()](#buildannouncem entssection)

---

## Overview

All shared builders are located in: `src/lib/content-builders/shared/script-sections.ts`

**Why Use Shared Builders?**
- Ensures consistent formatting across all liturgical modules
- Implements liturgical requirements correctly (Church standards)
- Handles optional content automatically (returns null if no data)
- Provides proper responses and formatting

**When to Use:**
- ALWAYS for strict sections: First Reading, Second Reading, Gospel, Psalm, Petitions
- OPTIONALLY for announcements (can use shared builder or create custom)

---

## buildReadingSection()

**Purpose:** Build First Reading, Second Reading, or Gospel sections

### Signature

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

### Parameters

**Required:**
- `id` - Section identifier ('first-reading', 'second-reading', 'gospel')
- `title` - Display title in all caps ('FIRST READING', 'SECOND READING', 'GOSPEL')
- `reading` - The reading object from the database

**Optional:**
- `reader` - The person reading (omit for Gospel - read by priest/deacon)
- `responseText` - Response after reading (e.g., 'Thanks be to God.') - omit for Gospel
- `includeGospelDialogue` - Include Gospel dialogue exchange (default: false)
- `includeGospelAcclamations` - Include Gospel acclamations (default: false)
- `pageBreakBefore` - Start section on new page (default: false, typically true for Gospel)
- `showNoneSelected` - Show "None Selected" message if no reading (default: false)

### Returns

- `ContentSection` - If reading exists or `showNoneSelected` is true
- `null` - If no reading and `showNoneSelected` is false

### Automatic Elements

The builder automatically includes:
1. Section title (e.g., "FIRST READING")
2. Pericope (scripture reference)
3. Reader name (if provided)
4. Introduction text (if in reading data)
5. Reading text
6. Conclusion text (if in reading data)
7. Response (if `responseText` provided)
8. Gospel dialogue (if `includeGospelDialogue` is true)
9. Gospel acclamations (if `includeGospelAcclamations` is true)

### Example - First Reading

```typescript
import { buildReadingSection } from '@/lib/content-builders/shared/script-sections'

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

### Example - Second Reading

```typescript
const section = buildReadingSection({
  id: 'second-reading',
  title: 'SECOND READING',
  reading: wedding.second_reading,
  reader: wedding.second_reader,
  responseText: 'Thanks be to God.',
  pageBreakBefore: false
})

if (section) sections.push(section)
```

### Example - Gospel

```typescript
const section = buildReadingSection({
  id: 'gospel',
  title: 'GOSPEL',
  reading: wedding.gospel_reading,
  includeGospelDialogue: true,       // Include "The Lord be with you" exchange
  includeGospelAcclamations: true,   // Include "Glory/Praise to you, O Lord"
  pageBreakBefore: true              // Gospel traditionally starts on new page
})

if (section) sections.push(section)
```

### Gospel-Specific Elements

When `includeGospelDialogue: true`:
- "Priest: The Lord be with you"
- "People: And with your spirit"

When `includeGospelAcclamations: true`:
- Before reading: "People: Glory to you, O Lord"
- After reading: "People: Praise to you, Lord Jesus Christ"

### Common Mistakes

```typescript
// ❌ WRONG - Custom implementation instead of shared builder
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

// ✅ CORRECT - Use shared builder
const section = buildReadingSection({
  id: 'first-reading',
  title: 'FIRST READING',
  reading: entity.first_reading,
  reader: entity.first_reader,
  responseText: 'Thanks be to God.'
})
```

---

## buildPsalmSection()

**Purpose:** Build Responsorial Psalm section

### Signature

```typescript
interface PsalmSectionConfig {
  psalm: any                 // The psalm reading object
  psalm_reader?: any         // The psalm reader person
  psalm_is_sung?: boolean    // Whether the psalm is sung
}

function buildPsalmSection(config: PsalmSectionConfig): ContentSection | null
```

### Parameters

**Required:**
- `psalm` - The psalm reading object from the database

**Optional:**
- `psalm_reader` - The person reading/singing the psalm
- `psalm_is_sung` - Boolean indicating if psalm is sung (shows "Sung" instead of reader name)

### Returns

- `ContentSection` - If psalm exists
- `null` - If no psalm

### Automatic Elements

1. Section title ("Psalm")
2. Pericope (scripture reference)
3. Reader name OR "Sung" indicator (based on `psalm_is_sung`)
4. Introduction text (if in psalm data)
5. Psalm text
6. Conclusion text (if in psalm data)

### Fixed Behavior

**Always sets `pageBreakBefore: true`** - Psalms always start on a new page for visual separation.

### Example

```typescript
import { buildPsalmSection } from '@/lib/content-builders/shared/script-sections'

const section = buildPsalmSection({
  psalm: wedding.psalm,
  psalm_reader: wedding.psalm_reader,
  psalm_is_sung: wedding.psalm_is_sung
})

if (section) sections.push(section)
```

### Sung vs. Read

```typescript
// If psalm_is_sung is true:
// Displays: "Sung" instead of reader name

// If psalm_is_sung is false and psalm_reader exists:
// Displays: "Reader: [Name]"

// If psalm_is_sung is false and no psalm_reader:
// Displays: No reader line
```

---

## buildPetitionsSection()

**Purpose:** Build Prayer of the Faithful section

### Signature

```typescript
interface PetitionsSectionConfig {
  petitions?: string | null                   // Newline-separated petition text
  petition_reader?: any                       // Designated petition reader
  second_reader?: any                         // Second reader (fallback)
  petitions_read_by_second_reader?: boolean   // Use second reader?
}

function buildPetitionsSection(config: PetitionsSectionConfig): ContentSection | null
```

### Parameters

**All optional:**
- `petitions` - Newline-separated petition text
- `petition_reader` - Designated petition reader
- `second_reader` - Second reader (used as fallback)
- `petitions_read_by_second_reader` - If true, uses `second_reader` instead of `petition_reader`

### Returns

- `ContentSection` - If petitions exist
- `null` - If no petitions

### Automatic Elements

1. Section title ("Petitions")
2. Reader name (determined by reader logic)
3. Introductory instruction: "Please respond, 'Lord, hear our prayer'"
4. Each petition automatically formatted with:
   - Petition text
   - "let us pray to the Lord" appended
   - Response: "Lord, hear our prayer"

### Fixed Behavior

**Always sets:**
- `pageBreakBefore: true` - Petitions separate from previous content
- `pageBreakAfter: true` - Petitions separate from announcements (ignored if last section)

### Reader Determination Logic

```typescript
// If petitions_read_by_second_reader is true:
//   Use second_reader
// Else:
//   Use petition_reader (if exists)
```

### Automatic Processing

The builder automatically:
1. Splits petition text by newlines
2. Trims each petition
3. Appends ", let us pray to the Lord" to each petition
4. Adds "Lord, hear our prayer" response after each

### Petition Text Format

Input:
```
For the Church
For peace in the world
For all who are sick
For [Couple Names], may they grow in love
```

Output (automatically formatted):
```
For the Church, let us pray to the Lord
    Lord, hear our prayer

For peace in the world, let us pray to the Lord
    Lord, hear our prayer

For all who are sick, let us pray to the Lord
    Lord, hear our prayer

For [Couple Names], may they grow in love, let us pray to the Lord
    Lord, hear our prayer
```

### Example

```typescript
import { buildPetitionsSection } from '@/lib/content-builders/shared/script-sections'

const section = buildPetitionsSection({
  petitions: wedding.petitions,
  petition_reader: wedding.petition_reader,
  second_reader: wedding.second_reader,
  petitions_read_by_second_reader: wedding.petitions_read_by_second_reader
})

if (section) sections.push(section)
```

---

## buildAnnouncementsSection()

**Purpose:** Build simple announcements section

### Signature

```typescript
function buildAnnouncementsSection(announcements?: string | null): ContentSection | null
```

### Parameters

- `announcements` - Announcement text (can be multiline)

### Returns

- `ContentSection` - If announcements exist
- `null` - If no announcements

### Structure

Creates a simple section with:
1. Section title ("Announcements")
2. Text element with full announcement content

### Example

```typescript
import { buildAnnouncementsSection } from '@/lib/content-builders/shared/script-sections'

const section = buildAnnouncementsSection(wedding.announcements)

if (section) sections.push(section)
```

### When to Use Custom Implementation

The shared builder is suitable for simple announcements. Create a custom implementation if you need:
- Multiple subsections
- Structured announcement content
- Special formatting
- Custom paragraph handling

See [CUSTOM_SECTIONS.md](./CUSTOM_SECTIONS.md) for custom announcement patterns.

---

## Related Documentation

- **[OVERVIEW.md](./OVERVIEW.md)** - System overview and design principles
- **[SECTION_INTERFACES.md](./SECTION_INTERFACES.md)** - Detailed interfaces for all section types
- **[CUSTOM_SECTIONS.md](./CUSTOM_SECTIONS.md)** - Patterns for custom section implementation
- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Do's and don'ts for using shared builders
- **[script-sections.ts](../../src/lib/content-builders/shared/script-sections.ts)** - Source code for shared builders

---

**Last Updated:** 2025-01-17
**Status:** Complete reference for all shared builder functions
**Coverage:** Function signatures, parameters, return values, automatic elements, examples, common mistakes
