# LITURGICAL_SCRIPT_SYSTEM.md

> **Documentation for Setting Up Liturgical Scripts**
>
> This file documents how to set up the liturgical script system for a new module (templates, print pages, PDF/Word exports). For daily reference on content elements and styling, see [LITURGICAL_SCRIPT_REFERENCE.md](./LITURGICAL_SCRIPT_REFERENCE.md).
>
> **Note:** This system is for individual entity documents (weddings, funerals, etc.). For tabular reports with aggregations (mass intentions report), see [REPORT_BUILDER_SYSTEM.md](./REPORT_BUILDER_SYSTEM.md).

## Table of Contents

1. [Quick Overview](#quick-overview)
2. [Modules Using Content Builders](#modules-using-content-builders)
3. [WithRelations Pattern](#withrelations-pattern)
4. [Template System](#template-system)
5. [Print Page Setup](#print-page-setup)
6. [Export API Routes (PDF & Word)](#export-api-routes-pdf--word)
7. [View Page Integration](#view-page-integration)

---

## Quick Overview

**What this system does:**
- Builds liturgical documents from entity data
- Renders to HTML (web view), PDF, and Word
- Uses centralized styling for consistency

**Three output formats:**
1. **HTML** - Web view and print page (browser print)
2. **PDF** - Generated via API route, downloadable
3. **Word** - Generated via API route, downloadable

**Key files:**
- Content types: `src/lib/types/liturgy-content.ts`
- Styles: `src/lib/styles/liturgical-script-styles.ts`
- Renderers: `src/lib/renderers/` (html-renderer.tsx, pdf-renderer.ts, word-renderer.ts)
- Shared builders: `src/lib/content-builders/shared/script-sections.ts`

**For element types and styling parameters, see [LITURGICAL_SCRIPT_REFERENCE.md](./LITURGICAL_SCRIPT_REFERENCE.md).**

---

## Modules Using Content Builders

**All 7 modules with content builders follow a consistent architecture pattern.**

### Module Registry

| Module | Content Builder Path | Templates | View Pattern | Template Selector Location |
|--------|---------------------|-----------|--------------|---------------------------|
| **Weddings** | `src/lib/content-builders/wedding/` | 2 (EN, ES) | ModuleViewContainer | View page (ModuleViewPanel) |
| **Funerals** | `src/lib/content-builders/funeral/` | 2 (EN, ES) | ModuleViewContainer | View page (ModuleViewPanel) |
| **Baptisms** | `src/lib/content-builders/baptism/` | 2 (EN, ES) | ModuleViewContainer | View page (ModuleViewPanel) |
| **Presentations** | `src/lib/content-builders/presentation/` | 5 (EN, ES, Bilingual, Simple) | ModuleViewContainer | View page (ModuleViewPanel) |
| **Quinceañeras** | `src/lib/content-builders/quinceanera/` | 2 (EN, ES) | ModuleViewContainer | View page (ModuleViewPanel) |
| **Masses** | `src/lib/content-builders/mass/` | 2 (EN, ES) | ModuleViewContainer | View page (ModuleViewPanel) |
| **Mass Intentions** | `src/lib/content-builders/mass-intention/` | 2 (EN, ES) | ModuleViewContainer | View page (ModuleViewPanel) |

### Template Counts

- **Most templates:** Presentations (5 templates - Full Script Spanish, Full Script English, Simple Spanish, Simple English, Bilingual)
- **Standard modules:** All others have 2 templates (English and Spanish versions)

### Architecture Consistency

**✅ All modules are consistent:**
- All use `ModuleViewContainer` in their view pages
- All have `templateConfig` passed to `ModuleViewContainer`
- Template selection happens on **view pages** (not edit pages)
- `TemplateSelectorDialog` is integrated through `ModuleViewPanel`
- Each module has a `[module]_template_id` field in the database

### Template Selector Pattern

**Location:** Template selector is displayed on the **view page** in the side panel metadata section.

**NOT on edit pages:** Edit pages do not have template selectors. Template selection is a view/export concern.

**Implementation in view-client.tsx:**

```typescript
export function [Module]ViewClient({ [entity] }: Props) {
  const handleUpdateTemplate = async (templateId: string) => {
    await update[Module]([entity].id, {
      [module]_template_id: templateId,
    })
  }

  return (
    <ModuleViewContainer
      entity={[entity]}
      entityType="[Module]"
      modulePath="[modules]"
      generateFilename={generateFilename}
      buildLiturgy={build[Module]Liturgy}
      getTemplateId={getTemplateId}
      templateConfig={{
        currentTemplateId: [entity].[module]_template_id,
        templates: [MODULE]_TEMPLATES,
        templateFieldName: '[module]_template_id',
        defaultTemplateId: '[default-template-id]',
        onUpdateTemplate: handleUpdateTemplate,
      }}
    />
  )
}
```

**Why this pattern:**
- Template selection affects how the liturgy document is rendered and exported
- Users select templates when viewing/exporting, not when editing entity data
- Keeps edit pages focused on entity-specific data (names, dates, etc.)
- Centralizes template UI through `ModuleViewPanel` component

### Other Content Builders

**Non-module content builders** (not tied to specific sacrament modules):
- **Event** (`src/lib/content-builders/event/`) - Used for event liturgy scripts
- **Petitions** (`src/lib/content-builders/petitions/`) - Used for building petitions/intercessions
- **Shared** (`src/lib/content-builders/shared/`) - Shared utilities for script sections

---

## WithRelations Pattern

**CRITICAL:** Content builders require entity types with all relations populated.

### The Problem

Base entity types only have foreign key IDs:

```typescript
// BAD: Can't build content from this
interface Wedding {
  id: string
  bride_id: string
  groom_id: string
  first_reading_id: string
  // ... only IDs, no actual data
}
```

### The Solution

Create a `WithRelations` type that expands all foreign keys to full objects:

```typescript
// GOOD: Has all the data needed
interface WeddingWithRelations extends Wedding {
  bride?: Person | null
  groom?: Person | null
  first_reading?: IndividualReading | null
  psalm?: IndividualReading | null
  wedding_event?: Event | null
  // ... all relations as full objects
}
```

### Implementation

**In `lib/actions/[module].ts`:**

```typescript
export interface [Module]WithRelations extends [Module] {
  // Expand all foreign keys to full objects
  person_field?: Person | null
  event_field?: Event | null
  reading_field?: IndividualReading | null
  // ... etc
}

export async function get[Module]WithRelations(id: string): Promise<[Module]WithRelations | null> {
  const supabase = await createClient()

  // 1. Fetch base entity
  const { data: entity, error } = await supabase
    .from('[modules]')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !entity) return null

  // 2. Fetch all related data in parallel
  const [person, event, reading] = await Promise.all([
    entity.person_id ? getPersonById(entity.person_id) : null,
    entity.event_id ? getEventById(entity.event_id) : null,
    entity.reading_id ? getReadingById(entity.reading_id) : null,
  ])

  // 3. Return merged object
  return {
    ...entity,
    person_field: person,
    event_field: event,
    reading_field: reading,
  }
}
```

**Why this matters:**
- Content builders need names, text, dates (not just IDs)
- No additional database queries inside templates
- Type-safe access to nested properties
- Eliminates unsafe `as any` casts

---

## Template System

Templates transform entity data into `LiturgyDocument` objects that can be rendered to any format.

### Directory Structure

```
src/lib/content-builders/[module]/
├── index.ts                          # Template registry + main export
├── helpers.ts                        # Shared calculations and logic
└── templates/
    ├── full-script-english.ts        # English template
    ├── full-script-spanish.ts        # Spanish template
    └── [other-templates].ts          # Additional templates
```

**🔴 IMPORTANT: Always create a `helpers.ts` file** for shared calculations and logic used across multiple templates. Export these helpers from `index.ts` for easy importing.

### Step 1: Create Template File

**File:** `src/lib/content-builders/[module]/templates/full-script-english.ts`

**🔴 CRITICAL - Calculation Placement for Reusability:**

When building templates, follow these rules for where calculations should live:

1. **Most calculations belong in `helpers.ts`** (exported from `index.ts`)
   - Name formatting (e.g., `buildTitleEnglish()`, `getChildName()`)
   - Conditional text logic (e.g., `getParentsTextEnglish()`, `getAudienceTextEnglish()`)
   - Any logic that will be used across multiple templates
   - **Why:** Reusability across all templates (English, Spanish, Simple, Bilingual, etc.)

2. **Exception: Sex-based calculations can be done in templates**
   - Use the `gendered()` helper function OR inline sex checks
   - Templates can check `child?.sex` or `person?.sex` directly
   - **Why:** Sex-based text is template-specific and often context-dependent

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

### 🔴 CRITICAL - No Fallback Logic in Templates

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

```typescript
// ❌ BAD: Conditional check in template
if (wedding.rehearsal_event || wedding.rehearsal_dinner_event) {
  // ... build section
}

// ✅ GOOD: Move to helper
// In helpers.ts:
export function hasRehearsalEvents(wedding: WeddingWithRelations): boolean {
  return !!(wedding.rehearsal_event || wedding.rehearsal_dinner_event)
}

// In template:
if (hasRehearsalEvents(wedding)) {
  // ... build section
}
```

```typescript
// ❌ BAD: Address logic in template
(location.street || location.city
  ? `${location.name} (${[location.street, location.city, location.state].filter(Boolean).join(', ')})`
  : location.name)

// ✅ GOOD: Move to helper
// In helpers.ts:
export function formatLocationText(location: Location | null): string {
  if (!location) return ''

  const addressParts = [location.street, location.city, location.state].filter(Boolean)
  if (addressParts.length > 0) {
    return `${location.name} (${addressParts.join(', ')})`
  }

  return location.name
}

// In template:
text: formatLocationText(location)
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

```typescript
import { [Module]WithRelations } from '@/lib/actions/[modules]'
import { LiturgyDocument, ContentSection } from '@/lib/types/liturgy-content'
import { formatPersonName, formatEventDateTime } from '@/lib/utils/formatters'
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
} from '@/lib/content-builders/shared/script-sections'

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
      value: formatPersonName(entity.person_field)
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
  // Build title
  const title = entity.title_field || 'Event Title'
  const subtitle = entity.event_field?.start_date
    ? formatEventDateTime(entity.event_field)
    : undefined

  // Build sections
  const sections: ContentSection[] = []

  sections.push(buildSummarySection(entity))

  // Use shared builders for common sections
  if (entity.first_reading) {
    sections.push(buildReadingSection({
      id: 'first-reading',
      title: 'FIRST READING',
      reading: entity.first_reading,
      reader: entity.first_reader,
      showNoneSelected: true
    }))
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

Create reusable helper functions for calculations and logic that will be used across multiple templates.

```typescript
import { [Module]WithRelations } from '@/lib/actions/[modules]'
import { formatPersonName } from '@/lib/utils/formatters'

/**
 * Get child's full name
 */
export function getChildName(entity: [Module]WithRelations): string {
  if (!entity.child) return 'the child'
  return formatPersonName(entity.child)
}

/**
 * Get child's sex for gendered text
 */
export function getChildSex(entity: [Module]WithRelations): 'MALE' | 'FEMALE' | null {
  return entity.child?.sex || null
}

/**
 * Check if child is baptized
 */
export function isBaptized(entity: [Module]WithRelations): boolean {
  return entity.is_baptized || false
}

/**
 * Generic gendered text helper
 * Returns maleText if child is male, femaleText if female, maleText as default
 */
export function gendered(
  entity: [Module]WithRelations,
  maleText: string,
  femaleText: string
): string {
  const sex = getChildSex(entity)
  return sex === 'FEMALE' ? femaleText : maleText
}

/**
 * Build document title (English)
 */
export function buildTitleEnglish(entity: [Module]WithRelations): string {
  const childName = getChildName(entity)
  return `${childName} Presentation`
}

/**
 * Build document title (Spanish)
 */
export function buildTitleSpanish(entity: [Module]WithRelations): string {
  const childName = getChildName(entity)
  return `Presentación de ${childName}`
}

/**
 * Get parents text for English templates
 */
export function getParentsTextEnglish(entity: [Module]WithRelations): string {
  const hasMother = !!entity.mother
  const hasFather = !!entity.father

  if (hasMother && hasFather) return 'the parents'
  if (hasMother) return 'the mother'
  if (hasFather) return 'the father'
  return 'the family'
}

/**
 * Get audience text for English templates
 */
export function getAudienceTextEnglish(): string {
  return 'parents'
}
```

**Best Practices:**
- One function per calculation or piece of logic
- Use descriptive function names
- Add JSDoc comments
- Export all functions
- Keep functions focused and single-purpose

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

### Shared Section Builders

Use shared builders for common liturgical elements:

```typescript
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection
} from '@/lib/content-builders/shared/script-sections'

// Build a reading
buildReadingSection({
  id: 'first-reading',
  title: 'FIRST READING',
  reading: entity.first_reading,
  reader: entity.first_reader,
  showNoneSelected: true,
  pageBreakBefore: false
})

// Build psalm
buildPsalmSection({
  psalm: entity.psalm,
  psalm_reader: entity.psalm_reader,
  psalm_is_sung: entity.psalm_is_sung
})

// Build petitions
buildPetitionsSection({
  petitions: entity.petitions,
  petition_reader: entity.petition_reader,
  second_reader: entity.second_reader,
  petitions_read_by_second_reader: entity.petitions_read_by_second_reader
})

// Build announcements
buildAnnouncementsSection(entity.announcements)
```

---

## Print Page Setup

Print pages display liturgy optimized for printing or saving as PDF via browser print dialog.

### File Location

`src/app/print/[module-plural]/[id]/page.tsx`

**IMPORTANT:** Directory must use PLURAL module name (e.g., `weddings`, `funerals`)

### Pattern

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { get[Module]WithRelations } from '@/lib/actions/[modules]'
import { build[Module]Liturgy } from '@/lib/content-builders/[module]'
import { renderHTML } from '@/lib/renderers/html-renderer'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Print[Module]Page({ params }: PageProps) {
  // 1. Authenticate
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch entity with relations
  const { id } = await params
  const entity = await get[Module]WithRelations(id)
  if (!entity) notFound()

  // 3. Build and render liturgy
  const templateId = entity.[entity]_template_id || '[module]-full-script-english'
  const liturgyDocument = build[Module]Liturgy(entity, templateId)
  const liturgyContent = renderHTML(liturgyDocument)

  // 4. Return with print styles
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          background: white !important;
          color: black !important;
          padding: 2rem !important;
        }
        .[module]-print-content div {
          color: black !important;
        }
        /* Preserve liturgy red */
        .[module]-print-content div[style*="color: rgb(196, 30, 58)"],
        .[module]-print-content div[style*="color:#c41e3a"],
        .[module]-print-content div[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
        .[module]-print-content span[style*="color: rgb(196, 30, 58)"],
        .[module]-print-content span[style*="color:#c41e3a"],
        .[module]-print-content span[style*="color: #c41e3a"] {
          color: rgb(196, 30, 58) !important;
        }
      `}} />
      <div className="[module]-print-content">
        {liturgyContent}
      </div>
    </>
  )
}
```

**URL:** `/print/[module-plural]/[id]`

---

## Export API Routes (PDF & Word)

API routes generate downloadable files.

### PDF Export

**File:** `src/app/api/[module-plural]/[id]/pdf/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { get[Module]WithRelations } from '@/lib/actions/[modules]'
import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { pdfStyles } from '@/lib/styles/liturgical-script-styles'
import { build[Module]Liturgy } from '@/lib/content-builders/[module]'
import { renderPDF } from '@/lib/renderers/pdf-renderer'

const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
}

const printer = new PdfPrinter(fonts)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Fetch entity
    const { id } = await params
    const entity = await get[Module]WithRelations(id)
    if (!entity) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // 2. Build liturgy
    const templateId = entity.[entity]_template_id || '[module]-full-script-english'
    const liturgyDocument = build[Module]Liturgy(entity, templateId)

    // 3. Render to PDF
    const content = renderPDF(liturgyDocument)

    // 4. Create PDF
    const docDefinition: TDocumentDefinitions = {
      content,
      pageMargins: [
        pdfStyles.margins.page,
        pdfStyles.margins.page,
        pdfStyles.margins.page,
        pdfStyles.margins.page
      ]
    }

    const pdfDoc = printer.createPdfKitDocument(docDefinition)

    // 5. Collect buffer
    const chunks: Buffer[] = []
    pdfDoc.on('data', (chunk) => chunks.push(chunk))

    await new Promise<void>((resolve, reject) => {
      pdfDoc.on('end', () => resolve())
      pdfDoc.on('error', reject)
      pdfDoc.end()
    })

    const pdfBuffer = Buffer.concat(chunks)

    // 6. Generate filename
    const filename = `[Entity]-${entity.id}.pdf`

    // 7. Return PDF
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
```

**URL:** `/api/[module-plural]/[id]/pdf`

### Word Export

**File:** `src/app/api/[module-plural]/[id]/word/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { get[Module]WithRelations } from '@/lib/actions/[modules]'
import { Document, Packer } from 'docx'
import { build[Module]Liturgy } from '@/lib/content-builders/[module]'
import { renderWord } from '@/lib/renderers/word-renderer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Fetch entity
    const { id } = await params
    const entity = await get[Module]WithRelations(id)
    if (!entity) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // 2. Build liturgy
    const templateId = entity.[entity]_template_id || '[module]-full-script-english'
    const liturgyDocument = build[Module]Liturgy(entity, templateId)

    // 3. Render to Word
    const paragraphs = renderWord(liturgyDocument)

    // 4. Create Word document
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    })

    // 5. Generate buffer
    const buffer = await Packer.toBuffer(doc)

    // 6. Generate filename
    const filename = `[Entity]-${entity.id}.docx`

    // 7. Return Word document
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Error generating Word document:', error)
    return NextResponse.json({ error: 'Failed to generate Word document' }, { status: 500 })
  }
}
```

**URL:** `/api/[module-plural]/[id]/word`

### Filename Patterns

Make filenames descriptive:

```typescript
// Wedding
const brideLastName = wedding.bride?.last_name || 'Bride'
const groomLastName = wedding.groom?.last_name || 'Groom'
const date = wedding.wedding_event?.start_date
  ? new Date(wedding.wedding_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
  : 'NoDate'
const filename = `${brideLastName}-${groomLastName}-${date}.pdf`
// Result: "Smith-Johnson-20250315.pdf"

// Funeral
const lastName = funeral.deceased?.last_name || 'Deceased'
const date = funeral.funeral_event?.start_date
  ? new Date(funeral.funeral_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
  : 'NoDate'
const filename = `${lastName}-Funeral-${date}.pdf`
// Result: "Williams-Funeral-20250320.pdf"
```

---

## View Page Integration

### Option 1: Use ModuleViewContainer (Recommended)

**File:** `src/app/(main)/[module]/[id]/[entity]-view-client.tsx`

```typescript
'use client'

import { [Module]WithRelations } from '@/lib/actions/[modules]'
import { ModuleViewContainer } from '@/components/module-view-container'
import { build[Module]Liturgy } from '@/lib/content-builders/[module]'

interface Props {
  entity: [Module]WithRelations
}

export function [Module]ViewClient({ entity }: Props) {
  return (
    <ModuleViewContainer
      entity={entity}
      entityType="[Module]"
      modulePath="[modules]"
      mainEvent={entity.[module]_event}
      liturgyBuilder={build[Module]Liturgy}
      generateFilename={(ext) => `[Entity]-${entity.id}.${ext}`}
    />
  )
}
```

`ModuleViewContainer` handles:
- ModuleViewPanel with Print/PDF/Word buttons
- Building liturgy document
- Rendering HTML content
- Consistent layout

### Option 2: Manual Integration

If you need custom layout:

```typescript
'use client'

import { [Module]WithRelations } from '@/lib/actions/[modules]'
import { ModuleViewPanel } from '@/components/module-view-panel'
import { build[Module]Liturgy } from '@/lib/content-builders/[module]'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  entity: [Module]WithRelations
}

export function [Module]ViewClient({ entity }: Props) {
  // Build liturgy
  const templateId = entity.[entity]_template_id || '[module]-full-script-english'
  const liturgyDocument = build[Module]Liturgy(entity, templateId)
  const liturgyContent = renderHTML(liturgyDocument)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Side panel */}
      <div className="lg:col-span-1">
        <ModuleViewPanel
          entity={entity}
          entityType="[Module]"
          modulePath="[modules]"
          mainEvent={entity.[module]_event}
          generateFilename={(ext) => `[Entity]-${entity.id}.${ext}`}
        />
      </div>

      {/* Main content */}
      <div className="lg:col-span-3">
        <Card className="bg-card text-card-foreground border">
          <CardContent className="pt-6">
            {liturgyContent}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

## Complete Setup Checklist

When adding liturgical scripts to a new module:

- [ ] Create `[Module]WithRelations` interface in `lib/actions/[module].ts`
- [ ] Create `get[Module]WithRelations()` function
- [ ] Create `lib/content-builders/[module]/` directory
- [ ] Create `helpers.ts` with shared calculations and logic (🔴 CRITICAL for reusability)
- [ ] Create template files in `templates/` subdirectory
- [ ] Create template registry in `index.ts`
- [ ] Export helpers from `index.ts` (`export * from './helpers'`)
- [ ] Export `build[Module]Liturgy()` function
- [ ] Create print page at `app/print/[module-plural]/[id]/page.tsx`
- [ ] Create PDF route at `app/api/[module-plural]/[id]/pdf/route.ts`
- [ ] Create Word route at `app/api/[module-plural]/[id]/word/route.ts`
- [ ] Update view client to use `ModuleViewContainer` or build liturgy manually
- [ ] Test all three outputs (HTML, PDF, Word)

---

## Reference Implementations

**Primary Reference:** Wedding module
- Content builder: `src/lib/content-builders/wedding/`
- Print page: `src/app/print/weddings/[id]/page.tsx`
- PDF route: `src/app/api/weddings/[id]/pdf/route.ts`
- Word route: `src/app/api/weddings/[id]/word/route.ts`
- View client: `src/app/(main)/weddings/[id]/wedding-view-client.tsx`

**Other Examples:**
- Funeral, Presentation, Baptism, Mass modules

---

## Related Documentation

- **[RENDERER.md](./RENDERER.md)** - Complete renderer system documentation (HTML, PDF, Word converters)
- **[LITURGICAL_SCRIPT_REFERENCE.md](./LITURGICAL_SCRIPT_REFERENCE.md)** - Element types, usage rules, styling parameters, examples
- **[STYLE_VALUES.md](./STYLE_VALUES.md)** - Easy-to-edit style value reference
- **[CLAUDE.md](../CLAUDE.md)** - Module structure and patterns
- **[MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md)** - Complete module creation checklist
