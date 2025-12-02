# Liturgical Script System - Templates

> **Template Creation and Implementation**
>
> Templates transform entity data into LiturgyDocument objects that can be rendered to HTML, PDF, and Word. This document covers template creation, helpers, and shared builders.

## Table of Contents

1. [Template System Overview](#template-system-overview)
2. [Directory Structure](#directory-structure)
3. [Template Creation Steps](#template-creation-steps)
4. [Critical Rules](#critical-rules)
5. [Helper Functions](#helper-functions)
6. [Shared Section Builders](#shared-section-builders)
7. [Template Registration](#template-registration)
8. [Related Documentation](#related-documentation)

---

## Template System Overview

Templates transform entity data into `LiturgyDocument` objects that can be rendered to any format.

**Key concepts:**
- Templates receive `[Module]WithRelations` data (all relations populated)
- Templates return `LiturgyDocument` objects (sections with elements)
- Templates focus on structure, helpers handle calculations
- Shared builders provide common liturgical sections

**Template outputs:**
- HTML (via `renderHTML()`)
- PDF (via `renderPDF()`)
- Word (via `renderWord()`)

---

## Directory Structure

```
src/lib/content-builders/[module]/
├── index.ts                          # Template registry + main export
├── helpers.ts                        # Shared calculations and logic
└── templates/
    ├── full-script-english.ts        # English template
    ├── full-script-spanish.ts        # Spanish template
    └── [other-templates].ts          # Additional templates
```

**File purposes:**
- `index.ts` - Exports template registry and main `build[Module]Liturgy()` function
- `helpers.ts` - Reusable calculation/logic functions used across templates
- `templates/` - Individual template builder functions

---

## Template Creation Steps

### Step 1: Create Template File

**File:** `src/lib/content-builders/[module]/templates/full-script-english.ts`

```typescript
import { [Module]WithRelations } from '@/lib/actions/[modules]'
import { LiturgyDocument, ContentSection } from '@/lib/types/liturgy-content'
import { formatEventDateTime } from '@/lib/utils/formatters'
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
} from '@/lib/content-builders/shared/script-sections'
import {
  buildTitleEnglish,
  getEventSubtitleEnglish,
  getPersonName,
} from '../helpers'

/**
 * Build summary section
 */
function buildSummarySection(entity: [Module]WithRelations): ContentSection {
  const elements = []

  // Add section title
  elements.push({ type: 'section-title', text: 'SUMMARY' })

  // Add info rows
  if (entity.person_field) {
    elements.push({
      type: 'info-row',
      label: 'Person:',
      value: getPersonName(entity.person_field)
    })
  }

  if (entity.event_field?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Date & Time:',
      value: formatEventDateTime(entity.event_field)
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
export function buildFullScriptEnglish(entity: [Module]WithRelations): LiturgyDocument {
  // Build title from helper
  const title = buildTitleEnglish(entity)
  const subtitle = getEventSubtitleEnglish(entity)

  // Build sections
  const sections: ContentSection[] = []

  sections.push(buildSummarySection(entity))

  // Use shared builders for common sections
  // buildReadingSection returns null if no reading, excluding section entirely
  const firstReadingSection = buildReadingSection({
    id: 'first-reading',
    title: 'FIRST READING',
    reading: entity.first_reading,
    reader: entity.first_reader,
  })
  if (firstReadingSection) {
    sections.push(firstReadingSection)
  }

  if (entity.psalm) {
    sections.push(buildPsalmSection({
      psalm: entity.psalm,
      psalm_reader: entity.psalm_reader,
      psalm_is_sung: entity.psalm_is_sung
    }))
  }

  // Return document
  return {
    id: entity.id,
    type: '[module]',
    language: 'en',
    template: '[module]-full-script-english',
    title,
    subtitle,
    sections
  }
}
```

### Step 2: Create Helpers File

**File:** `src/lib/content-builders/[module]/helpers.ts`

**🔴 IMPORTANT: Always create a `helpers.ts` file** for shared calculations and logic used across multiple templates. Export these helpers from `index.ts` for easy importing.

```typescript
import { [Module]WithRelations } from '@/lib/actions/[modules]'
import { formatEventDateTime } from '@/lib/utils/formatters'

/**
 * Get person's full name (uses database-generated full_name field)
 */
export function getPersonName(entity: [Module]WithRelations): string {
  if (!entity.person_field) return 'Person'
  return entity.person_field.full_name
}

/**
 * Build document title (English)
 */
export function buildTitleEnglish(entity: [Module]WithRelations): string {
  const personName = getPersonName(entity)
  return `${personName} [Event Type]`
}

/**
 * Build document title (Spanish)
 */
export function buildTitleSpanish(entity: [Module]WithRelations): string {
  const personName = getPersonName(entity)
  return `[Event Type] de ${personName}`
}

/**
 * Get event subtitle (English)
 */
export function getEventSubtitleEnglish(entity: [Module]WithRelations): string {
  if (!entity.event_field?.start_date) return 'No date/time'
  return formatEventDateTime(entity.event_field)
}

/**
 * Get event subtitle (Spanish)
 */
export function getEventSubtitleSpanish(entity: [Module]WithRelations): string {
  if (!entity.event_field?.start_date) return 'Sin fecha/hora'
  return formatEventDateTime(entity.event_field)
}

/**
 * Check if entity has specific field
 */
export function hasField(entity: [Module]WithRelations): boolean {
  return !!entity.field_name
}
```

### Step 3: Register Template

**File:** `src/lib/content-builders/[module]/index.ts`

```typescript
import { [Module]WithRelations } from '@/lib/actions/[modules]'
import { LiturgyDocument, LiturgyTemplate } from '@/lib/types/liturgy-content'
import { buildFullScriptEnglish } from './templates/full-script-english'
import { buildFullScriptSpanish } from './templates/full-script-spanish'

// Export shared helpers for use in templates
export * from './helpers'

/**
 * Template Registry
 */
export const [MODULE]_TEMPLATES: Record<string, LiturgyTemplate<[Module]WithRelations>> = {
  '[module]-full-script-english': {
    id: '[module]-full-script-english',
    name: 'Full Ceremony Script (English)',
    description: 'Complete liturgy with all readings and responses',
    supportedLanguages: ['en'],
    builder: buildFullScriptEnglish,
  },
  '[module]-full-script-spanish': {
    id: '[module]-full-script-spanish',
    name: 'Guión Completo (Español)',
    description: 'Liturgia completa con lecturas y respuestas',
    supportedLanguages: ['es'],
    builder: buildFullScriptSpanish,
  },
}

/**
 * Main export: Build liturgy content
 */
export function build[Module]Liturgy(
  entity: [Module]WithRelations,
  templateId: string = '[module]-full-script-english'
): LiturgyDocument {
  const template = [MODULE]_TEMPLATES[templateId] || [MODULE]_TEMPLATES['[module]-full-script-english']
  return template.builder(entity)
}
```

---

## Critical Rules

### 🔴 Calculation Placement for Reusability

**When building templates, follow these rules for where calculations should live:**

1. **Most calculations belong in `helpers.ts`** (exported from `index.ts`)
   - Name formatting (e.g., `buildTitleEnglish()`, `getChildName()`)
   - Conditional text logic (e.g., `getParentsTextEnglish()`, `getAudienceTextEnglish()`)
   - Any logic that will be used across multiple templates
   - **Why:** Reusability across all templates (English, Spanish, Simple, Bilingual, etc.)

2. **Exception: Sex-based calculations can be done in templates**
   - Use the shared `gendered()` helper function from `@/lib/content-builders/shared/builders`
   - Templates can check `child?.sex` or `person?.sex` directly if needed
   - **Why:** Sex-based text is template-specific and often context-dependent
   - **Note:** The `gendered()` helper accepts a `Person` object, making it reusable across all templates

3. **Avoid duplicating logic across templates**
   - If multiple templates need the same calculation, move it to `helpers.ts`
   - Templates should focus on structure and presentation, not complex logic

**Example:**
```typescript
// ❌ BAD: Duplicating logic in every template
function buildFullScriptEnglish(entity: EntityWithRelations) {
  const title = entity.child?.first_name && entity.child?.last_name
    ? `${entity.child.first_name} ${entity.child.last_name} Presentation`
    : 'Presentation'
  // ... duplicated in Spanish, Simple, etc.
}

// ✅ GOOD: Calculation in helpers.ts, used in all templates
import { buildTitleEnglish } from '../helpers'

function buildFullScriptEnglish(entity: EntityWithRelations) {
  const title = buildTitleEnglish(entity)
  // ... now used in all templates
}
```

### 🔴 No Fallback Logic in Templates

**RULE:** Template files must NEVER contain `||` fallback operators or ternary operators for alternate text. ALL fallback logic must be handled in helper functions.

**Why this matters:**
- **Consistency:** All templates use the same fallback text
- **Maintainability:** Change fallback text in one place, not 10+ templates
- **Testability:** Helper functions can be tested in isolation
- **Clarity:** Templates focus on structure, helpers handle data logic

**Examples of violations and fixes:**

```typescript
// ❌ BAD: Fallback logic in template
elements.push({
  type: 'event-datetime',
  text: subtitle || 'No date/time',
})

// ✅ GOOD: Move to helper
// In helpers.ts:
export function getEventSubtitle(entity: EntityWithRelations): string {
  if (!entity.event?.start_date) return 'No date/time'
  return formatEventDateTime(entity.event)
}

// In template:
const subtitle = getEventSubtitle(entity)
elements.push({
  type: 'event-datetime',
  text: subtitle,
})
```

```typescript
// ❌ BAD: Fallback logic in template
value: wedding.first_reading.pericope || '',

// ✅ GOOD: Move to helper
// In helpers.ts:
export function getReadingPericope(reading: IndividualReading | null | undefined): string {
  return reading?.pericope || ''
}

// In template:
value: getReadingPericope(wedding.first_reading),
```

```typescript
// ❌ BAD: Conditional logic in template
const homilist = mass.homilist || mass.presider

// ✅ GOOD: Move to helper
// In helpers.ts:
export function getHomilist(mass: MassWithRelations): Person | null {
  return mass.homilist || mass.presider || null
}

// In template:
const homilist = getHomilist(mass)
```

**What IS allowed in templates:**
- Calling helper functions
- Basic property access (e.g., `entity.id`, `entity.title`)
- Structural logic (building sections, arrays)
- Direct calls to shared section builders

**What is NOT allowed in templates:**
- `||` fallback operators (move to helpers)
- Ternary operators for alternate text (move to helpers)
- Complex conditional checks (move to helpers)
- String concatenation with conditionals (move to helpers)
- Any logic that could be reused across templates

### 🔴 Title/Subtitle Pattern (NO Duplication!)

**RULE:** Title and subtitle must ONLY be set at the document level. NEVER add them to section elements.

**Why this matters:**
- **Prevents duplication:** Renderers display the document title/subtitle automatically
- **Consistency:** All formats (HTML, PDF, Word) render the title/subtitle in the same way
- **Maintainability:** Change title rendering in one place (the renderer), not in every template

**✅ CORRECT Pattern:**

```typescript
export function buildFullScriptEnglish(entity: EntityWithRelations): LiturgyDocument {
  const title = buildTitleEnglish(entity)
  const subtitle = getEventSubtitleEnglish(entity)

  const sections: ContentSection[] = []

  // NO title/subtitle elements added to sections!
  sections.push(buildSummarySection(entity))

  // Return with title/subtitle at document level
  return {
    id: entity.id,
    type: 'module',
    language: 'en',
    template: 'module-full-script-english',
    title,        // ← Set ONLY here
    subtitle,     // ← Set ONLY here
    sections,
  }
}
```

**❌ WRONG Pattern (causes duplication):**

```typescript
function buildSummarySection(entity: EntityWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // ❌ NEVER DO THIS - causes title to appear twice!
  elements.push({
    type: 'event-title',
    text: buildTitleEnglish(entity),
  })

  elements.push({
    type: 'event-datetime',
    text: getEventSubtitleEnglish(entity),
  })

  // ... rest of summary

  return { id: 'summary', elements }
}
```

**Common mistake locations:**
- `summarySection.elements.unshift({ type: 'event-title', ... })` - NO!
- `buildCoverPage()` adding title/datetime elements - NO!
- Any use of `type: 'event-title'` or `type: 'event-datetime'` - NO!

**Exception:** The `event-title` and `event-datetime` element types exist for legacy reasons but should NOT be used in new templates. The document-level `title` and `subtitle` fields are the correct approach.

---

## Helper Functions

### Best Practices

- **One function per calculation or piece of logic**
- **Use descriptive function names** (`buildTitleEnglish`, not `getTitle`)
- **Add JSDoc comments** to explain purpose and parameters
- **Export all functions** from `helpers.ts`
- **Keep functions focused and single-purpose**

### Common Helper Patterns

**Name helpers:**
```typescript
export function getPersonName(person: Person | null | undefined): string {
  return person?.full_name || 'Person'
}

export function getChildName(entity: EntityWithRelations): string {
  return entity.child?.full_name || 'the child'
}
```

**Title builders:**
```typescript
export function buildTitleEnglish(entity: EntityWithRelations): string {
  const childName = getChildName(entity)
  return `${childName} Presentation`
}

export function buildTitleSpanish(entity: EntityWithRelations): string {
  const childName = getChildName(entity)
  return `Presentación de ${childName}`
}
```

**Conditional text:**
```typescript
export function getParentsTextEnglish(entity: EntityWithRelations): string {
  const hasMother = !!entity.mother
  const hasFather = !!entity.father

  if (hasMother && hasFather) return 'the parents'
  if (hasMother) return 'the mother'
  if (hasFather) return 'the father'
  return 'the family'
}
```

**Boolean checks:**
```typescript
export function hasRehearsalEvents(wedding: WeddingWithRelations): boolean {
  return !!(wedding.rehearsal_event || wedding.rehearsal_dinner_event)
}

export function isBaptized(entity: EntityWithRelations): boolean {
  return entity.is_baptized || false
}
```

**Formatting helpers:**
```typescript
export function formatLocationText(location: Location | null): string {
  if (!location) return ''

  const addressParts = [location.street, location.city, location.state].filter(Boolean)
  if (addressParts.length > 0) {
    return `${location.name} (${addressParts.join(', ')})`
  }

  return location.name
}

export function getReadingPericope(reading: IndividualReading | null | undefined): string {
  return reading?.pericope || ''
}
```

### Gendered Helper (Shared)

**NOTE:** The `gendered()` helper has been moved to shared helpers.

**Import from:** `@/lib/content-builders/shared/builders`

**Usage:**
```typescript
import { gendered } from '@/lib/content-builders/shared/builders'

gendered(person, 'son', 'daughter')
gendered(entity.child, 'baptized', 'not baptized')
gendered(entity.bride, 'groom', 'bride', 'Female') // with custom default
```

The shared `gendered()` function accepts a Person object directly, making it reusable across all content builder templates.

---

## Shared Section Builders

Use shared builders for common liturgical elements:

```typescript
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection
} from '@/lib/content-builders/shared/script-sections'
```

### buildReadingSection

Build a reading section (returns null if no reading, excluding section entirely):

```typescript
const firstReadingSection = buildReadingSection({
  id: 'first-reading',
  title: 'FIRST READING',
  reading: entity.first_reading,
  reader: entity.first_reader,
  pageBreakBefore: false
})
if (firstReadingSection) {
  sections.push(firstReadingSection)
}
```

### buildPsalmSection

Build a psalm section:

```typescript
if (entity.psalm) {
  sections.push(buildPsalmSection({
    psalm: entity.psalm,
    psalm_reader: entity.psalm_reader,
    psalm_is_sung: entity.psalm_is_sung
  }))
}
```

### buildPetitionsSection

Build a petitions section:

```typescript
if (entity.petitions?.length) {
  sections.push(buildPetitionsSection({
    petitions: entity.petitions,
    petition_reader: entity.petition_reader,
    second_reader: entity.second_reader,
    petitions_read_by_second_reader: entity.petitions_read_by_second_reader
  }))
}
```

### buildAnnouncementsSection

Build an announcements section:

```typescript
if (entity.announcements) {
  sections.push(buildAnnouncementsSection(entity.announcements))
}
```

---

## Template Registration

### Template Registry Object

```typescript
export const [MODULE]_TEMPLATES: Record<string, LiturgyTemplate<[Module]WithRelations>> = {
  '[module]-full-script-english': {
    id: '[module]-full-script-english',
    name: 'Full Ceremony Script (English)',
    description: 'Complete liturgy with all readings and responses',
    supportedLanguages: ['en'],
    builder: buildFullScriptEnglish,
  },
  '[module]-full-script-spanish': {
    id: '[module]-full-script-spanish',
    name: 'Guión Completo (Español)',
    description: 'Liturgia completa con lecturas y respuestas',
    supportedLanguages: ['es'],
    builder: buildFullScriptSpanish,
  },
}
```

### Main Builder Function

```typescript
export function build[Module]Liturgy(
  entity: [Module]WithRelations,
  templateId: string = '[module]-full-script-english'
): LiturgyDocument {
  const template = [MODULE]_TEMPLATES[templateId] || [MODULE]_TEMPLATES['[module]-full-script-english']
  return template.builder(entity)
}
```

**Default template:** Always provide a default English template as fallback.

---

## Related Documentation

- **[WITHRELATIONS.md](./WITHRELATIONS.md)** - WithRelations pattern for fetching entity data
- **[PRINT_EXPORT.md](./PRINT_EXPORT.md)** - Print pages and export API routes
- **[VIEW_INTEGRATION.md](./VIEW_INTEGRATION.md)** - View page integration
- **[CONTENT_BUILDER_SECTIONS.md](../CONTENT_BUILDER_SECTIONS.md)** - Section types and builder interfaces
- **[LITURGICAL_SCRIPT_REFERENCE.md](../LITURGICAL_SCRIPT_REFERENCE.md)** - Element types and styling
