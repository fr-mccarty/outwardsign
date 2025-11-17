# Content Builders

Simple, focused builder functions for creating liturgy document sections.

## Structure

Each liturgy document follows this structure:

1. **Cover Page** - Title, subtitle, and event details
2. **Reading(s)** - First Reading, Second Reading, Gospel
3. **Psalm** - Responsorial psalm (only if not sung)
4. **Petitions** - Prayer of the Faithful
5. **Announcements** - End-of-liturgy announcements
6. **Ceremony** - Flexible ceremony content (vows, blessings, etc.)

**All sections have `pageBreakAfter: true`** - the renderer automatically removes the page break after the last section.

## Builders

### 1. Cover Page

```typescript
import { buildCoverPage } from '@/lib/content-builders/shared/builders'

const coverPage = buildCoverPage([
  {
    title: 'Wedding Information',
    rows: [
      { label: 'Bride:', value: formatPersonName(wedding.bride) },
      { label: 'Groom:', value: formatPersonName(wedding.groom) }
    ]
  },
  {
    title: 'Ministers',
    rows: [
      { label: 'Presider:', value: formatPersonName(wedding.presider) }
    ]
  }
])
```

### 2. Reading

```typescript
import { buildReadingSection } from '@/lib/content-builders/shared/builders'

// Simple style
const firstReading = buildReadingSection(
  'first-reading',
  'FIRST READING',
  wedding.first_reading,
  wedding.first_reader
)

// Config style (backward compatible)
const gospel = buildReadingSection({
  id: 'gospel',
  title: 'GOSPEL',
  reading: wedding.gospel_reading,
  reader: wedding.presider
})
```

### 3. Psalm

```typescript
import { buildPsalmSection } from '@/lib/content-builders/shared/builders'

// Simple style
const psalm = buildPsalmSection(
  wedding.psalm,
  wedding.psalm_reader,
  wedding.psalm_is_sung
)

// Config style (backward compatible)
const psalm = buildPsalmSection({
  psalm: wedding.psalm,
  psalm_reader: wedding.psalm_reader,
  psalm_is_sung: wedding.psalm_is_sung
})
```

**Note:** Returns `null` if psalm is sung or missing.

### 4. Petitions

```typescript
import { buildPetitionsSection } from '@/lib/content-builders/shared/builders'

// Simple style
const petitions = buildPetitionsSection(
  wedding.petitions,  // "For the Church\nFor peace\nFor the couple"
  wedding.petition_reader
)

// Config style with fallback reader (backward compatible)
const petitions = buildPetitionsSection({
  petitions: wedding.petitions,
  petition_reader: wedding.petition_reader,
  second_reader: wedding.second_reader,
  petitions_read_by_second_reader: false
})
```

**Formatting:** Automatically adds "let us pray to the Lord" to each petition and "Lord, hear our prayer" response.

### 5. Announcements

```typescript
import { buildAnnouncementsSection } from '@/lib/content-builders/shared/builders'

const announcements = buildAnnouncementsSection(wedding.announcements)
```

### 6. Ceremony

```typescript
import { buildCeremonySection } from '@/lib/content-builders/shared/builders'

const consent = buildCeremonySection('marriage-consent', [
  { type: 'section-title', text: 'MARRIAGE CONSENT' },
  { type: 'rubric', text: 'The priest addresses the couple:' },
  { type: 'priest-dialogue', text: 'Have you come here freely?' },
  { type: 'spacer', size: 'small' },
  { type: 'response', label: 'COUPLE:', text: 'We have.' }
])
```

## Complete Example

```typescript
import {
  buildCoverPage,
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection,
  buildCeremonySection
} from '@/lib/content-builders/shared/builders'

export function buildWeddingScript(wedding: WeddingWithRelations): LiturgyDocument {
  const sections: ContentSection[] = []

  // 1. Cover page
  sections.push(buildCoverPage([
    {
      title: 'Wedding Information',
      rows: [
        { label: 'Bride:', value: formatPersonName(wedding.bride) },
        { label: 'Groom:', value: formatPersonName(wedding.groom) }
      ]
    }
  ]))

  // 2. Readings
  const firstReading = buildReadingSection('first-reading', 'FIRST READING', wedding.first_reading, wedding.first_reader)
  if (firstReading) sections.push(firstReading)

  const psalm = buildPsalmSection(wedding.psalm, wedding.psalm_reader, wedding.psalm_is_sung)
  if (psalm) sections.push(psalm)

  const gospel = buildReadingSection('gospel', 'GOSPEL', wedding.gospel_reading)
  if (gospel) sections.push(gospel)

  // 3. Ceremony
  const consent = buildCeremonySection('marriage-consent', [
    { type: 'section-title', text: 'MARRIAGE CONSENT' },
    // ... ceremony elements
  ])
  sections.push(consent)

  // 4. Petitions
  const petitions = buildPetitionsSection(wedding.petitions, wedding.petition_reader)
  if (petitions) sections.push(petitions)

  // 5. Announcements
  const announcements = buildAnnouncementsSection(wedding.announcements)
  if (announcements) sections.push(announcements)

  return {
    id: wedding.id,
    type: 'wedding',
    language: 'en',
    template: 'wedding-full-script-english',
    title: buildTitleEnglish(wedding),  // Document-level title
    subtitle: getEventSubtitleEnglish(wedding),  // Document-level subtitle
    sections
  }
}
```

## Key Points

- **One function per file** - Each builder has a single purpose
- **Backward compatible** - Supports both simple and config calling styles
- **Always returns ContentSection or null** - Easy to filter out null sections
- **Page breaks handled automatically** - Set `pageBreakAfter: true` on all sections
- **Document-level title/subtitle** - Never in section elements
