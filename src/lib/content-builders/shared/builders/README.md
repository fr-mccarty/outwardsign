# Content Builder Components

Abstracted builder components for creating liturgy documents. These builders provide a clean, consistent way to construct liturgy scripts with reusable components.

## Overview

The builders are organized into 5 main components:

1. **Cover Page** - Summary/cover sections with event details
2. **Reading** - First Reading, Second Reading, Gospel
3. **Psalm** - Responsorial psalms (sung or read)
4. **Petitions** - Prayer petitions with responses
5. **Ceremony** - Flexible ceremony sections (vows, blessings, dialogues)

## Usage

### Importing

```typescript
// Import all builders
import {
  buildCoverPage,
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildCeremonySection,
} from '@/lib/content-builders/shared/builders'

// Or import individually
import { buildCoverPage } from '@/lib/content-builders/shared/builders/cover-page'
import { buildReadingSection } from '@/lib/content-builders/shared/builders/reading'
```

## 1. Cover Page Builder

Creates structured cover/summary pages with multiple sections of information.

### Basic Usage

```typescript
import { buildCoverPage } from '@/lib/content-builders/shared/builders'

const coverPage = buildCoverPage({
  sections: [
    {
      title: 'Wedding Information',
      rows: [
        { label: 'Bride:', value: formatPersonName(wedding.bride) },
        { label: 'Groom:', value: formatPersonName(wedding.groom) },
        { label: 'Date & Time:', value: formatEventDateTime(wedding.wedding_event) },
      ]
    },
    {
      title: 'Ministers',
      rows: [
        { label: 'Presider:', value: formatPersonName(wedding.presider) },
        { label: 'Homilist:', value: formatPersonName(wedding.homilist) },
      ]
    }
  ],
  pageBreakAfter: true
})
```

### Simple Cover Page (One Section)

```typescript
import { buildSimpleCoverPage } from '@/lib/content-builders/shared/builders'

const coverPage = buildSimpleCoverPage(
  'Mass Information',
  [
    { label: 'Date & Time:', value: formatEventDateTime(mass.event) },
    { label: 'Location:', value: formatLocationWithAddress(mass.event.location) },
    { label: 'Presider:', value: formatPersonName(mass.presider) },
  ],
  true // pageBreakAfter
)
```

## 2. Reading Builder

Creates reading sections for First Reading, Second Reading, and Gospel.

### First/Second Reading

```typescript
import { buildReadingSection } from '@/lib/content-builders/shared/builders'

const firstReading = buildReadingSection({
  id: 'first-reading',
  title: 'FIRST READING',
  reading: wedding.first_reading,
  reader: wedding.first_reader,
  responseText: 'Thanks be to God.',
})

const secondReading = buildReadingSection({
  id: 'second-reading',
  title: 'SECOND READING',
  reading: wedding.second_reading,
  reader: wedding.second_reader,
  responseText: 'Thanks be to God.',
  pageBreakBefore: true, // Start on new page
})
```

### Gospel Reading

```typescript
const gospel = buildReadingSection({
  id: 'gospel',
  title: 'GOSPEL',
  reading: wedding.gospel_reading,
  reader: wedding.presider,
  includeGospelAcclamations: true, // Adds "Glory/Praise to you, O Lord"
  pageBreakBefore: true,
})
```

## 3. Psalm Builder

Creates responsorial psalm sections with optional refrain and instructions.

### Basic Psalm

```typescript
import { buildPsalmSection } from '@/lib/content-builders/shared/builders'

const psalm = buildPsalmSection({
  psalm: wedding.psalm,
  psalm_reader: wedding.psalm_reader,
  psalm_is_sung: wedding.psalm_is_sung,
})
```

### Psalm with Refrain

```typescript
const psalmWithRefrain = buildPsalmSection({
  psalm: mass.psalm,
  psalm_is_sung: true,
  responseRefrain: 'R. The Lord is my shepherd; there is nothing I shall want.',
  includeInstruction: true, // Adds instruction for cantor/reader
})
```

## 4. Petitions Builder

Creates petitions sections with automatic formatting and responses.

### Standard Petitions (Auto-Formatted)

```typescript
import { buildPetitionsSection } from '@/lib/content-builders/shared/builders'

// Petitions from database (newline-separated string)
const petitions = buildPetitionsSection({
  petitions: wedding.petitions, // "For the Church...\nFor peace...\n..."
  petition_reader: wedding.petition_reader,
  // Automatically adds "let us pray to the Lord" to each petition
  // Automatically adds "Lord, hear our prayer" response
})
```

### Custom Petitions

```typescript
const customPetitions = buildPetitionsSection({
  petitions: mass.petitions,
  responseText: 'Hear us, O Lord.', // Custom response
  format: 'custom', // Use petitions text as-is (no auto-formatting)
  includeInstruction: false, // Don't include response instruction
})
```

### Petitions from Array

```typescript
import { buildPetitionsFromArray } from '@/lib/content-builders/shared/builders'

const petitions = buildPetitionsFromArray({
  petitions: [
    'For the Church throughout the world',
    'For our Holy Father, Pope Francis',
    'For peace in our troubled world',
  ],
  petition_reader: mass.petition_reader,
})
```

## 5. Ceremony Builder

Highly flexible builder for ceremony sections with customizable liturgical elements.

### Marriage Consent Example

```typescript
import { buildCeremonySection } from '@/lib/content-builders/shared/builders'

const consent = buildCeremonySection({
  id: 'marriage-consent',
  title: 'MARRIAGE CONSENT',
  pageBreakBefore: true,
  introRubric: 'The priest addresses the bride and groom:',
  elements: [
    { type: 'priest-dialogue', text: 'Have you come here freely and without coercion?' },
    { type: 'spacer', size: 'small' },
    { type: 'response', label: 'COUPLE:', text: 'We have.' },
    { type: 'spacer', size: 'small' },
    { type: 'priest-dialogue', text: 'Are you prepared to love and honor each other?' },
    { type: 'spacer', size: 'small' },
    { type: 'response', label: 'COUPLE:', text: 'We are.' },
  ]
})
```

### Prayer Section with Helper

```typescript
import { buildCeremonySection, buildPrayerWithAmen } from '@/lib/content-builders/shared/builders'

const blessing = buildCeremonySection({
  id: 'nuptial-blessing',
  title: 'NUPTIAL BLESSING',
  pageBreakBefore: true,
  elements: [
    ...buildPrayerWithAmen(
      'O God, who by your mighty power created all things...',
      true, // Include rubric
      'The priest prays:' // Rubric text
    )
  ]
})
```

### Question Series (Baptismal Promises)

```typescript
import { buildCeremonySection, buildQuestionSeries } from '@/lib/content-builders/shared/builders'

const renewal = buildCeremonySection({
  id: 'renewal-of-promises',
  title: 'RENEWAL OF BAPTISMAL PROMISES',
  pageBreakBefore: true,
  introRubric: 'The priest addresses the quinceañera:',
  elements: buildQuestionSeries([
    {
      question: 'Do you renounce Satan and all his works?',
      response: 'I do.',
      responseLabel: 'QUINCEAÑERA:'
    },
    {
      question: 'Do you believe in God, the Father almighty?',
      response: 'I do.',
      responseLabel: 'QUINCEAÑERA:'
    },
  ])
})
```

### Dialogue Exchange Helper

```typescript
import { buildDialogueExchange } from '@/lib/content-builders/shared/builders'

const elements = [
  ...buildDialogueExchange(
    'The Lord be with you.',
    'And with your spirit.'
  ),
  ...buildDialogueExchange(
    'Lift up your hearts.',
    'We lift them up to the Lord.'
  ),
]
```

## Benefits

### 1. **Cleaner Templates**
Before:
```typescript
const elements: ContentElement[] = []
elements.push({ type: 'section-title', text: 'Wedding Information' })
elements.push({ type: 'info-row', label: 'Bride:', value: formatPersonName(wedding.bride) })
elements.push({ type: 'info-row', label: 'Groom:', value: formatPersonName(wedding.groom) })
// ... 50 more lines
```

After:
```typescript
const coverPage = buildCoverPage({
  sections: [{ title: 'Wedding Information', rows: [...] }],
  pageBreakAfter: true
})
```

### 2. **Consistency**
All modules use the same builders, ensuring consistent formatting and behavior.

### 3. **Maintainability**
Fix a bug once in the builder, and all templates benefit.

### 4. **Type Safety**
Strong TypeScript interfaces prevent errors.

### 5. **Reusability**
Build once, use everywhere (weddings, funerals, masses, etc.).

## Migration Guide

Existing templates will continue to work unchanged (backward compatible exports from `script-sections.ts`).

For new templates, import directly from builders:
```typescript
// Old way (still works)
import { buildReadingSection } from '@/lib/content-builders/shared/script-sections'

// New way (preferred)
import { buildReadingSection } from '@/lib/content-builders/shared/builders'
```

## File Structure

```
src/lib/content-builders/shared/builders/
├── index.ts              # Main exports
├── cover-page.ts         # Cover page builder
├── reading.ts            # Reading builder
├── psalm.ts              # Psalm builder
├── petitions.ts          # Petitions builder
├── ceremony.ts           # Ceremony builder
└── README.md             # This file
```

## Helper Functions Summary

### Ceremony Helpers

- `buildDialogueExchange()` - Priest question + response
- `buildPrayerWithAmen()` - Prayer text + Amen response
- `buildQuestionSeries()` - Multiple Q&A pairs
- `buildRubricAction()` - Rubric + action text

### Cover Page Helpers

- `buildSimpleCoverPage()` - One-section cover page

### Petitions Helpers

- `buildPetitionsFromArray()` - Build from string array

## See Also

- [LITURGICAL_SCRIPT_SYSTEM.md](../../../docs/LITURGICAL_SCRIPT_SYSTEM.md) - Complete liturgy system documentation
- [CONTENT_BUILDER_SECTIONS.md](../../../docs/CONTENT_BUILDER_SECTIONS.md) - Content section types
