# Content Builders

Simple, focused builder functions for creating liturgy document sections.

## Available Builders

### 1. Cover Page

```typescript
import { buildCoverPage } from '@/lib/content-builders/shared/builders'

const coverPage = buildCoverPage([
  {
    title: 'Wedding Information',
    rows: [
      { label: 'Bride:', value: wedding.bride.full_name },
      { label: 'Groom:', value: wedding.groom.full_name }
    ]
  },
  {
    title: 'Ministers',
    rows: [
      { label: 'Presider:', value: wedding.presider.full_name }
    ]
  }
])
```

### 2. Petitions

```typescript
import { buildPetitionsSection } from '@/lib/content-builders/shared/builders'

// Simple style
const petitions = buildPetitionsSection(
  wedding.petitions,  // "For the Church\nFor peace\nFor the couple"
  wedding.petition_reader
)

// Config style with fallback reader
const petitions = buildPetitionsSection({
  petitions: wedding.petitions,
  petition_reader: wedding.petition_reader,
  second_reader: wedding.second_reader,
  petitions_read_by_second_reader: false
})
```

**Formatting:** Automatically adds "let us pray to the Lord" to each petition and "Lord, hear our prayer" response.

### 3. Ceremony

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

## Key Points

- **One function per file** - Each builder has a single purpose
- **Always returns ContentSection or null** - Easy to filter out null sections
- **Page breaks handled automatically** - Set `pageBreakAfter: true` on all sections
- **Document-level title/subtitle** - Never in section elements

## Content Library for Readings

Readings (First Reading, Psalm, Second Reading, Gospel) are stored in the `contents` table and selected via the ContentPicker. The reading `body` field contains HTML with inline styles from the Tiptap editor:

- Bold: `<strong>text</strong>`
- Italic: `<em>text</em>`
- Liturgical red text: `<span style="color: #c41e3a">text</span>`
- Text sizes: `<span style="font-size: 1.25em">text</span>`
- Paragraph styling: `<p style="text-align: center; margin-top: 1em">text</p>`

Example psalm format:
```html
<p><strong>Reader:</strong> The Lord is my shepherd; there is nothing I shall want.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my shepherd; there is nothing I shall want.</em></p>

<p><strong>Reader:</strong> The Lord is my shepherd; I shall not want.<br>
In verdant pastures he gives me repose;<br>
Beside restful waters he leads me;<br>
he refreshes my soul.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my shepherd; there is nothing I shall want.</em></p>
```
