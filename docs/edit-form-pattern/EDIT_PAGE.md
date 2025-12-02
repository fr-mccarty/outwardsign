# Edit Form Pattern - Layer 1: Edit Page (Server)

> **Purpose:** Complete guide to implementing Layer 1 - the server component that handles authentication, data fetching, and breadcrumbs for edit pages.

## Table of Contents

- [Overview](#overview)
- [File Location and Type](#file-location-and-type)
- [Standard Template](#standard-template)
- [Key Requirements](#key-requirements)
- [Dynamic Title Patterns](#dynamic-title-patterns)
- [Complete Examples](#complete-examples)
- [Implementation Checklist](#implementation-checklist)
- [Common Mistakes](#common-mistakes)

---

## Overview

**Layer 1** is the entry point for edit pages. It's a server component that:
1. Authenticates the user
2. Fetches the entity with all related data
3. Builds a dynamic page title from entity data
4. Sets breadcrumbs for navigation
5. Passes clean, serialized data to Layer 2

**Type:** Server Component (no `'use client'` directive)

---

## File Location and Type

**Path:** `app/(main)/[entity-plural]/[id]/edit/page.tsx`

**Examples:**
- `app/(main)/weddings/[id]/edit/page.tsx`
- `app/(main)/funerals/[id]/edit/page.tsx`
- `app/(main)/baptisms/[id]/edit/page.tsx`

**Important:** This is a **Server Component**. Do NOT add `'use client'` directive.

---

## Standard Template

```tsx
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { get[Entity]WithRelations } from '@/lib/actions/[entities]'
import { [Entity]FormWrapper } from '../../[entity]-form-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Edit[Entity]Page({ params }: PageProps) {
  // 1. AUTHENTICATION
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. AWAIT PARAMS (Next.js 15 pattern)
  const { id } = await params

  // 3. FETCH ENTITY WITH RELATIONS
  const entity = await get[Entity]WithRelations(id)

  if (!entity) {
    notFound()
  }

  // 4. BUILD DYNAMIC TITLE
  let title = "Edit [Entity]"
  // Add logic to customize title based on entity data
  // See Dynamic Title Patterns section below

  // 5. BREADCRUMBS
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "[Plural Label]", href: "/[entities]" },
    { label: "Edit" }
  ]

  // 6. RENDER FORM WRAPPER
  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <[Entity]FormWrapper
        [entity]={entity}
        title={title}
        description="Update [entity] information."
        saveButtonLabel="Save [Entity]"
      />
    </>
  )
}
```

---

## Key Requirements

| Requirement | Why | Implementation |
|-------------|-----|----------------|
| ✅ **Use `get[Entity]WithRelations()`** | Forms need related data (Person objects, Event objects, etc.), not just IDs | `const entity = await getEntityWithRelations(id)` |
| ✅ **Await params** | Next.js 15 requires awaiting params before accessing values | `const { id } = await params` |
| ✅ **Call `notFound()` if null** | Proper 404 handling for missing entities | `if (!entity) notFound()` |
| ✅ **Build dynamic title** | User-friendly page title based on entity data | See patterns below |
| ✅ **Type cast for relations** | Access relations not in base type | `(entity as any).relationName` or use `EntityWithRelations` |
| ✅ **Pass entity to wrapper** | Signals edit mode to form wrapper and form | `<FormWrapper entity={entity} />` |

---

## Dynamic Title Patterns

Different modules build titles differently based on their primary entities. The goal is to help users identify **which record they're editing**.

### Wedding: Combine bride and groom last names

```tsx
const bride = (wedding as any).bride
const groom = (wedding as any).groom
let title = "Edit Wedding"

if (bride?.last_name && groom?.last_name) {
  title = `${bride.last_name}-${groom.last_name} Wedding`
} else if (bride?.last_name) {
  title = `${bride.last_name} Wedding`
} else if (groom?.last_name) {
  title = `${groom.last_name} Wedding`
}
```

**Examples:**
- `"Smith-Jones Wedding"` (both last names)
- `"Smith Wedding"` (only bride)
- `"Jones Wedding"` (only groom)
- `"Edit Wedding"` (fallback)

### Funeral: Use deceased name

```tsx
const deceased = (funeral as any).deceased
let title = "Edit Funeral"

if (deceased?.last_name) {
  title = `${deceased.first_name ? deceased.first_name + ' ' : ''}${deceased.last_name} Funeral`
}
```

**Examples:**
- `"John Doe Funeral"` (first + last)
- `"Doe Funeral"` (last only)
- `"Edit Funeral"` (fallback)

### Baptism: Use child name

```tsx
const child = (baptism as any).child
let title = "Edit Baptism"

if (child?.last_name) {
  title = `${child.first_name || ''} ${child.last_name} Baptism`.trim()
} else if (child?.first_name) {
  title = `${child.first_name} Baptism`
}
```

**Examples:**
- `"Maria Garcia Baptism"` (first + last)
- `"Garcia Baptism"` (last only)
- `"Maria Baptism"` (first only)
- `"Edit Baptism"` (fallback)

### Presentation: Use child last name only

```tsx
const child = presentation.child
let title = "Edit Presentation"

if (child?.last_name) {
  title = `${child.last_name} Presentation`
}
```

**Examples:**
- `"Rodriguez Presentation"`
- `"Edit Presentation"` (fallback)

### Simple Entities: Use entity name

For entities with a direct `name` field (Person, Event, Location):

```tsx
const title = `Edit ${entity.name}`
// or for Person:
const title = `Edit ${entity.first_name} ${entity.last_name}`.trim()
```

---

## Complete Examples

### Wedding Module

```tsx
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getWeddingWithRelations } from '@/lib/actions/weddings'
import { WeddingFormWrapper } from '../../wedding-form-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditWeddingPage({ params }: PageProps) {
  // 1. Authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Get ID from params
  const { id } = await params

  // 3. Fetch wedding with relations
  const wedding = await getWeddingWithRelations(id)

  if (!wedding) {
    notFound()
  }

  // 4. Build dynamic title from bride and groom names
  const bride = (wedding as any).bride
  const groom = (wedding as any).groom
  let title = "Edit Wedding"

  if (bride?.last_name && groom?.last_name) {
    title = `${bride.last_name}-${groom.last_name} Wedding`
  } else if (bride?.last_name) {
    title = `${bride.last_name} Wedding`
  } else if (groom?.last_name) {
    title = `${groom.last_name} Wedding`
  }

  // 5. Set breadcrumbs
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Weddings", href: "/weddings" },
    { label: "Edit" }
  ]

  // 6. Render form wrapper
  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <WeddingFormWrapper
        wedding={wedding}
        title={title}
        description="Update wedding information."
        saveButtonLabel="Save Wedding"
      />
    </>
  )
}
```

### Funeral Module

```tsx
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getFuneralWithRelations } from '@/lib/actions/funerals'
import { FuneralFormWrapper } from '../../funeral-form-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditFuneralPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const funeral = await getFuneralWithRelations(id)

  if (!funeral) {
    notFound()
  }

  // Build dynamic title from deceased name
  const deceased = (funeral as any).deceased
  let title = "Edit Funeral"

  if (deceased?.last_name) {
    title = `${deceased.first_name ? deceased.first_name + ' ' : ''}${deceased.last_name} Funeral`
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Funerals", href: "/funerals" },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <FuneralFormWrapper
        funeral={funeral}
        title={title}
        description="Update funeral information."
        saveButtonLabel="Save Funeral"
      />
    </>
  )
}
```

---

## Implementation Checklist

Use this checklist when implementing Layer 1:

- [ ] **File created** at `app/(main)/[entities]/[id]/edit/page.tsx`
- [ ] **No `'use client'` directive** (must be server component)
- [ ] **Import `createClient`** from `@/lib/supabase/server`
- [ ] **Import `redirect, notFound`** from `next/navigation`
- [ ] **Import `get[Entity]WithRelations`** from actions file
- [ ] **Import `BreadcrumbSetter`** component
- [ ] **Import `[Entity]FormWrapper`** component
- [ ] **Define `PageProps` interface** with `Promise<{ id: string }>`
- [ ] **Check authentication** via `supabase.auth.getUser()`
- [ ] **Redirect to `/login`** if not authenticated
- [ ] **Await params** using `const { id } = await params`
- [ ] **Fetch entity** using `get[Entity]WithRelations(id)`
- [ ] **Handle not found** with `if (!entity) notFound()`
- [ ] **Build dynamic title** from entity data
- [ ] **Define breadcrumbs array** with home → list → edit path
- [ ] **Render `BreadcrumbSetter`** with breadcrumbs
- [ ] **Render `FormWrapper`** with entity, title, description, saveButtonLabel
- [ ] **Test:** Verify correct title appears based on entity data
- [ ] **Test:** Verify 404 page for non-existent entity IDs
- [ ] **Test:** Verify redirect to login when not authenticated

---

## Common Mistakes

### ❌ Forgetting to await params

```tsx
// WRONG - will cause runtime error in Next.js 15
const { id } = params

// CORRECT
const { id } = await params
```

### ❌ Not checking for null entity

```tsx
// WRONG - will cause error if entity not found
const entity = await getEntityWithRelations(id)
return <FormWrapper entity={entity} />

// CORRECT
const entity = await getEntityWithRelations(id)
if (!entity) {
  notFound()
}
return <FormWrapper entity={entity} />
```

### ❌ Using base fetch function instead of WithRelations

```tsx
// WRONG - form won't have related data to display
const entity = await getEntity(id)

// CORRECT - fetches entity with all relations
const entity = await getEntityWithRelations(id)
```

### ❌ Adding 'use client' directive

```tsx
// WRONG - breaks server-side auth and data fetching
'use client'
export default async function EditPage() { ... }

// CORRECT - no directive needed for server components
export default async function EditPage() { ... }
```

### ❌ Not type-casting for relations

```tsx
// WRONG - TypeScript error if relation not in base type
const bride = wedding.bride

// CORRECT - type cast when accessing WithRelations data
const bride = (wedding as any).bride
// OR better: define WeddingWithRelations interface
```

### ❌ Hardcoded title instead of dynamic

```tsx
// WRONG - not helpful for users
const title = "Edit Wedding"

// CORRECT - shows which wedding they're editing
const bride = (wedding as any).bride
const groom = (wedding as any).groom
let title = "Edit Wedding"
if (bride?.last_name && groom?.last_name) {
  title = `${bride.last_name}-${groom.last_name} Wedding`
}
```

---

## Related Documentation

- **[FORM_WRAPPER.md](./FORM_WRAPPER.md)** - Layer 2: Client wrapper implementation
- **[UNIFIED_FORM.md](./UNIFIED_FORM.md)** - Layer 3: Form component
- **[OVERVIEW.md](./OVERVIEW.md)** - Understanding the 3-layer architecture
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Authentication and data flow patterns
