# Liturgical Script System - WithRelations Pattern

> **⚠️ EXAMPLES OUTDATED:** This document's patterns and concepts are still valid, but code examples reference the old Wedding schema with `presider_id`, `bride_id`, etc. The system now uses the unified event data model where person assignments are stored in `people_event_assignments` rather than as direct foreign keys.

> **Data Fetching for Content Builders**
>
> Content builders require entity types with all relations populated. This document explains the WithRelations pattern for fetching complete entity data.

## Table of Contents

1. [The Problem](#the-problem)
2. [The Solution](#the-solution)
3. [Implementation](#implementation)
4. [Why This Matters](#why-this-matters)
5. [Complete Example](#complete-example)
6. [Related Documentation](#related-documentation)

---

## The Problem

**CRITICAL:** Content builders require entity types with all relations populated.

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

**Why this is a problem:**
- Content builders need **names, text, dates** (not just IDs)
- Can't access `wedding.bride.full_name` if `bride` is just an ID
- Would require unsafe `as any` casts or additional database queries
- Templates would break with "Cannot read property of undefined"

---

## The Solution

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

**Benefits:**
- Type-safe access to nested properties
- No additional database queries inside templates
- Clear contract of what data is available
- Eliminates unsafe `as any` casts

---

## Implementation

**In `lib/actions/[module].ts`:**

### Step 1: Define the WithRelations Interface

```typescript
import { [Module] } from '@/lib/types/database'
import { Person } from '@/lib/types/database'
import { Event } from '@/lib/types/database'
import { IndividualReading } from '@/lib/types/database'

export interface [Module]WithRelations extends [Module] {
  // Expand all foreign keys to full objects
  person_field?: Person | null
  event_field?: Event | null
  first_reading?: IndividualReading | null
  psalm?: IndividualReading | null
  second_reading?: IndividualReading | null
  gospel?: IndividualReading | null
  // ... etc for all relations
}
```

**Naming convention:**
- If database column is `person_id`, relation property is `person_field` (or logical name like `bride`, `groom`)
- If database column is `event_id`, relation property is `event_field` (or `wedding_event`, `funeral_event`)
- Use descriptive names when multiple relations of same type exist (e.g., `first_reading`, `second_reading`)

### Step 2: Create the Fetch Function

```typescript
import { createClient } from '@/lib/supabase/server'

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
  const [person, event, firstReading, psalm] = await Promise.all([
    entity.person_id ? getPersonById(entity.person_id) : null,
    entity.event_id ? getEventById(entity.event_id) : null,
    entity.first_reading_id ? getReadingById(entity.first_reading_id) : null,
    entity.psalm_id ? getReadingById(entity.psalm_id) : null,
  ])

  // 3. Return merged object
  return {
    ...entity,
    person_field: person,
    event_field: event,
    first_reading: firstReading,
    psalm: psalm,
  }
}
```

**Performance tip:** Use `Promise.all()` to fetch all relations in parallel, not sequentially.

### Step 3: Use in Server Pages

```typescript
// In view page or print page
import { get[Module]WithRelations } from '@/lib/actions/[modules]'

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const entity = await get[Module]WithRelations(id)
  if (!entity) notFound()

  // Now entity has all relations populated
  // Safe to access entity.person_field.full_name, entity.event_field.start_date, etc.

  return <[Module]ViewClient entity={entity} />
}
```

---

## Why This Matters

**Without WithRelations:**
```typescript
// ❌ BAD: Unsafe, error-prone
function buildTemplate(entity: Wedding): LiturgyDocument {
  // Can't do this - bride_id is just a string
  const brideName = entity.bride_id?.full_name  // Type error!

  // Must use unsafe cast
  const brideName = (entity as any).bride?.full_name  // Unsafe!

  // Or make database query inside template (slow!)
  const bride = await getPersonById(entity.bride_id)  // Can't await in template!
}
```

**With WithRelations:**
```typescript
// ✅ GOOD: Type-safe, clean
function buildTemplate(entity: WeddingWithRelations): LiturgyDocument {
  // Safe, type-checked access
  const brideName = entity.bride?.full_name || 'Bride'
  const eventDate = entity.wedding_event?.start_date
  const readingText = entity.first_reading?.text

  // All relations already fetched, no additional queries needed
}
```

---

## Complete Example

### Wedding Module Implementation

**Interface:**

```typescript
// lib/actions/weddings.ts
export interface WeddingWithRelations extends Wedding {
  // People
  bride?: Person | null
  groom?: Person | null
  presider?: Person | null
  witness_1?: Person | null
  witness_2?: Person | null

  // Events
  wedding_event?: Event | null
  rehearsal_event?: Event | null
  rehearsal_dinner_event?: Event | null

  // Readings
  first_reading?: IndividualReading | null
  psalm?: IndividualReading | null
  second_reading?: IndividualReading | null
  gospel?: IndividualReading | null

  // Readers
  first_reader?: Person | null
  psalm_reader?: Person | null
  second_reader?: Person | null
  petition_reader?: Person | null

  // Petitions
  petitions?: Petition[]
}
```

**Fetch function:**

```typescript
export async function getWeddingWithRelations(id: string): Promise<WeddingWithRelations | null> {
  const supabase = await createClient()

  // 1. Fetch wedding
  const { data: wedding, error } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !wedding) return null

  // 2. Fetch all relations in parallel
  const [
    bride,
    groom,
    presider,
    witness1,
    witness2,
    weddingEvent,
    rehearsalEvent,
    rehearsalDinnerEvent,
    firstReading,
    psalm,
    secondReading,
    gospel,
    firstReader,
    psalmReader,
    secondReader,
    petitionReader,
    petitions,
  ] = await Promise.all([
    wedding.bride_id ? getPersonById(wedding.bride_id) : null,
    wedding.groom_id ? getPersonById(wedding.groom_id) : null,
    wedding.presider_id ? getPersonById(wedding.presider_id) : null,
    wedding.witness_1_id ? getPersonById(wedding.witness_1_id) : null,
    wedding.witness_2_id ? getPersonById(wedding.witness_2_id) : null,
    wedding.wedding_event_id ? getEventById(wedding.wedding_event_id) : null,
    wedding.rehearsal_event_id ? getEventById(wedding.rehearsal_event_id) : null,
    wedding.rehearsal_dinner_event_id ? getEventById(wedding.rehearsal_dinner_event_id) : null,
    wedding.first_reading_id ? getReadingById(wedding.first_reading_id) : null,
    wedding.psalm_id ? getReadingById(wedding.psalm_id) : null,
    wedding.second_reading_id ? getReadingById(wedding.second_reading_id) : null,
    wedding.gospel_id ? getReadingById(wedding.gospel_id) : null,
    wedding.first_reader_id ? getPersonById(wedding.first_reader_id) : null,
    wedding.psalm_reader_id ? getPersonById(wedding.psalm_reader_id) : null,
    wedding.second_reader_id ? getPersonById(wedding.second_reader_id) : null,
    wedding.petition_reader_id ? getPersonById(wedding.petition_reader_id) : null,
    wedding.id ? getPetitionsByWeddingId(wedding.id) : [],
  ])

  // 3. Return merged object
  return {
    ...wedding,
    bride,
    groom,
    presider,
    witness_1: witness1,
    witness_2: witness2,
    wedding_event: weddingEvent,
    rehearsal_event: rehearsalEvent,
    rehearsal_dinner_event: rehearsalDinnerEvent,
    first_reading: firstReading,
    psalm,
    second_reading: secondReading,
    gospel,
    first_reader: firstReader,
    psalm_reader: psalmReader,
    second_reader: secondReader,
    petition_reader: petitionReader,
    petitions,
  }
}
```

**Usage in template:**

```typescript
// lib/content-builders/wedding/templates/full-script-english.ts
export function buildFullScriptEnglish(wedding: WeddingWithRelations): LiturgyDocument {
  // Type-safe access to all relations
  const brideName = wedding.bride?.full_name || 'Bride'
  const groomName = wedding.groom?.full_name || 'Groom'
  const eventDate = wedding.wedding_event?.start_date
  const firstReadingText = wedding.first_reading?.text
  const presiderName = wedding.presider?.full_name

  // Build sections using all available data
  const sections: ContentSection[] = []

  sections.push(buildSummarySection(wedding))

  if (wedding.first_reading) {
    sections.push(buildReadingSection({
      id: 'first-reading',
      title: 'FIRST READING',
      reading: wedding.first_reading,
      reader: wedding.first_reader,
    }))
  }

  // ... rest of template

  return {
    id: wedding.id,
    type: 'wedding',
    language: 'en',
    template: 'wedding-full-script-english',
    title: `${brideName} & ${groomName} Wedding`,
    subtitle: eventDate ? formatEventDateTime(wedding.wedding_event) : undefined,
    sections,
  }
}
```

---

## Related Documentation

- **[TEMPLATES.md](./TEMPLATES.md)** - Template creation using WithRelations data
- **[OVERVIEW.md](./OVERVIEW.md)** - System overview and architecture
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Data architecture and patterns
