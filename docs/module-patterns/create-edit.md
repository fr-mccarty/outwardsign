# Module Patterns: Create & Edit Pages

> **Part of:** [Module Component Patterns](../MODULE_COMPONENT_PATTERNS.md)
>
> This document covers patterns for create pages, edit pages, and form wrapper components that handle entity creation and editing.

## Table of Contents

- [Overview](#overview)
- [3. Create Page (Server)](#3-create-page-server)
  - [Structure](#structure)
  - [Key Points](#key-points)
- [4. Edit Page (Server)](#4-edit-page-server)
  - [Structure](#structure-1)
  - [Key Points](#key-points-1)
- [5. Form Wrapper (Client)](#5-form-wrapper-client)
  - [Structure](#structure-2)
  - [Key Points](#key-points-2)
  - [isEditing Pattern](#isediting-pattern)
- [Related Documentation](#related-documentation)

---

## Overview

Create and edit pages share a common architecture:

- **Server Pages** - Handle authentication, data fetching (edit only), and breadcrumbs
- **Form Wrapper** - Wraps the form with PageContainer and manages loading state
- **Unified Form** - Single form component that detects create vs edit mode

This separation ensures:
- Server-side authentication and data fetching
- Reusable form logic for both create and edit
- Consistent UI with action buttons in the right places

---

## 3. Create Page (Server)

**File:** `page.tsx` in `app/(main)/[entity-plural]/create/`

**Purpose:** Server page for creating new entities.

### Structure

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { [Entity]FormWrapper } from '../[entity]-form-wrapper'

export default async function Create[Entity]Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: '[Entities]', href: '/[entities]' },
    { label: 'Create', href: '/[entities]/create' }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <[Entity]FormWrapper />
    </>
  )
}
```

### Key Points

- ✅ No `entity` prop passed to FormWrapper (signals create mode)
- ✅ FormWrapper handles PageContainer and layout
- ✅ Minimal server page - just auth and breadcrumbs
- ✅ Authentication is always first - redirect if no user
- ✅ Breadcrumbs should include path from Dashboard → [Entities] → Create
- ✅ FormWrapper detects create mode automatically when no entity is passed

**Reference:** `src/app/(main)/weddings/create/page.tsx`

---

## 4. Edit Page (Server)

**File:** `page.tsx` in `app/(main)/[entity-plural]/[id]/edit/`

**Purpose:** Server page for editing an existing entity.

### Structure

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { [Entity]FormWrapper } from '../../[entity]-form-wrapper'
import { get[Entity]WithRelations } from '@/lib/actions/[entities]'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Edit[Entity]Page({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const entity = await get[Entity]WithRelations(id)
  if (!entity) notFound()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: '[Entities]', href: '/[entities]' },
    { label: entity.name || 'View', href: `/[entities]/${id}` },
    { label: 'Edit', href: `/[entities]/${id}/edit` }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <[Entity]FormWrapper entity={entity} />
    </>
  )
}
```

### Key Points

- ✅ Fetch entity **with relations** for editing using `get[Entity]WithRelations()`
- ✅ Pass `entity` prop to FormWrapper (signals edit mode)
- ✅ Return `notFound()` if entity doesn't exist
- ✅ FormWrapper shows action buttons in edit mode
- ✅ Breadcrumbs should include entity name/title for context
- ✅ `params` is a **Promise** in Next.js 15 - must await it

**Why WithRelations?** Edit forms often need related data (e.g., wedding with presiders, readers, event details). Fetching with relations in the server page ensures all necessary data is available.

**Reference:** `src/app/(main)/weddings/[id]/edit/page.tsx`

---

## 5. Form Wrapper (Client)

**File:** `[entity]-form-wrapper.tsx` in `app/(main)/[entity-plural]/`

**Purpose:** Wraps the form with PageContainer and manages loading state. Shows action buttons in edit mode.

### Structure

```tsx
'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import { [Entity]Form } from './[entity]-form'
import type { [Entity] } from '@/lib/types'

interface [Entity]FormWrapperProps {
  [entity]?: [Entity]  // Base type, not WithRelations
  title: string
  description: string
  saveButtonLabel: string
}

export function [Entity]FormWrapper({
  [entity],
  title,
  description,
  saveButtonLabel
}: [Entity]FormWrapperProps) {
  const formId = '[entity]-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !![entity]

  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/[entities]/${[entity].id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View [Entity]
          </Link>
        </Button>
      )}
      <SaveButton isLoading={isLoading} form={formId}>
        {saveButtonLabel}
      </SaveButton>
    </>
  )

  return (
    <PageContainer
      title={title}
      description={description}
      maxWidth="4xl"
      actions={actions}
    >
      <[Entity]Form
        [entity]={[entity]}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
```

### Key Points

- ✅ Uses **base type** (`[Entity]`), not `WithRelations` - wrapper doesn't need relations
- ✅ Accepts `title`, `description`, `saveButtonLabel` props for dynamic page header
- ✅ Detects edit mode via `entity` prop: `const isEditing = !!entity`
- ✅ Shows View button in edit mode only
- ✅ Uses `SaveButton` component connected to form via `formId`
- ✅ Manages `isLoading` state for the form
- ✅ Wraps form in `PageContainer` with `actions` prop
- ✅ Passes `formId` and `onLoadingChange` to form

**Why base type?** The wrapper only needs to check if an entity exists and pass it through. It doesn't access nested relations, so `WithRelations` adds unnecessary type complexity.

### isEditing Pattern

The `isEditing` pattern is a standard way to detect whether the component is in create or edit mode:

```tsx
const isEditing = !!entity
```

This pattern:
- Returns `true` if entity exists (edit mode)
- Returns `false` if entity is undefined (create mode)
- Is used throughout the component to conditionally render elements

**Common uses:**
```tsx
// Show View button only in edit mode
{isEditing && (
  <Button variant="outline" asChild>
    <Link href={`/[entities]/${entity.id}`}>
      <Eye className="h-4 w-4 mr-2" />
      View [Entity]
    </Link>
  </Button>
)}

// Different save button labels
<SaveButton isLoading={isLoading} form={formId}>
  {isEditing ? "Update [Entity]" : "Create [Entity]"}
</SaveButton>
```

**Reference:** `src/app/(main)/weddings/wedding-form-wrapper.tsx`

---

## Related Documentation

- **[form-view.md](./form-view.md)** - Unified Form and View Client patterns
- **[list-page.md](./list-page.md)** - List Page and List Client patterns
- **[FORMS.md](../FORMS.md)** - 🔴 CRITICAL - Complete form patterns and validation
- **[best-practices.md](./best-practices.md)** - Common patterns, troubleshooting, tips
