# Module Component Patterns

This document provides detailed implementation patterns for the 9 main component files that make up each module in Outward Sign. Each section explains the component's purpose, structure, props, and provides reference implementations.

**Reference Module:** Always use the Wedding module (`src/app/(main)/weddings/`) as the canonical implementation example.

## Table of Contents

- [Overview](#overview)
- [1. List Page (Server)](#1-list-page-server)
- [2. List Client](#2-list-client)
- [3. Create Page (Server)](#3-create-page-server)
- [4. View Page (Server)](#4-view-page-server)
- [5. Edit Page (Server)](#5-edit-page-server)
- [6. Form Wrapper (Client)](#6-form-wrapper-client)
- [7. Unified Form (Client)](#7-unified-form-client)
- [8. View Client](#8-view-client)
- [9. Form Actions (Client)](#9-form-actions-client)

---

## Overview

Every module follows a consistent 9-file structure. This consistency ensures:
- Predictable code organization
- Easier onboarding for new developers
- Reusable patterns across all modules
- Testable, maintainable components

**The 9 Main Files:**

| # | File | Location | Type | Purpose |
|---|------|----------|------|---------|
| 1 | `page.tsx` | `[entity-plural]/` | Server | List page with search/filters |
| 2 | `[entities]-list-client.tsx` | `[entity-plural]/` | Client | List interactivity and URL state |
| 3 | `page.tsx` | `[entity-plural]/create/` | Server | Create page |
| 4 | `page.tsx` | `[entity-plural]/[id]/` | Server | View page |
| 5 | `page.tsx` | `[entity-plural]/[id]/edit/` | Server | Edit page |
| 6 | `[entity]-form-wrapper.tsx` | `[entity-plural]/` | Client | Form container with loading state |
| 7 | `[entity]-form.tsx` | `[entity-plural]/` | Client | Unified create/edit form |
| 8 | `[entity]-view-client.tsx` | `[entity-plural]/[id]/` | Client | View page display |
| 9 | `[entity]-form-actions.tsx` | `[entity-plural]/[id]/` | Client | Copy/Edit/Delete buttons |

---

## 1. List Page (Server)

**File:** `page.tsx` in `app/(main)/[entity-plural]/`

**Purpose:** Server-side list page that fetches entities with filters, computes stats, and passes data to client component.

### Structure

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { [Entity]ListClient } from './[entities]-list-client'
import { get[Entities] } from '@/lib/actions/[entities]'

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>
}

export default async function [Entities]Page({ searchParams }: PageProps) {
  // 1. Authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Parse search params (Next.js 15 requires await)
  const params = await searchParams
  const filters = {
    search: params.search,
    status: params.status
  }

  // 3. Fetch entities server-side with filters
  const entities = await get[Entities](filters)

  // 4. Compute stats server-side (optional)
  const stats = {
    total: entities.length,
    active: entities.filter(e => e.status === 'ACTIVE').length,
    // ... other stats
  }

  // 5. Define breadcrumbs
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: '[Entities]', href: '/[entities]' }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <[Entity]ListClient initialData={entities} stats={stats} />
    </>
  )
}
```

### Key Points

- ✅ Always authenticate first
- ✅ `searchParams` is a **Promise** in Next.js 15 - must await it
- ✅ Fetch data server-side for better performance and SEO
- ✅ Pass data via `initialData` prop to client component
- ✅ Compute stats server-side to reduce client bundle size

**Reference:** `src/app/(main)/weddings/page.tsx`

---

## 2. List Client

**File:** `[entities]-list-client.tsx` (note: PLURAL) in `app/(main)/[entity-plural]/`

**Purpose:** Client component that manages URL state for search/filters and renders the entity grid.

### Structure

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { [Entity] } from '@/lib/actions/[entities]'

interface [Entity]ListClientProps {
  initialData: [Entity][]
  stats?: {
    total: number
    active: number
  }
}

export function [Entity]ListClient({ initialData, stats }: [Entity]ListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status !== 'all') params.set('status', status)

    const queryString = params.toString()
    router.push(`/[entities]${queryString ? `?${queryString}` : ''}`)
  }, [search, status, router])

  return (
    <div className="space-y-6">
      {/* Header with Create button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">[Entities]</h1>
          {stats && (
            <p className="text-muted-foreground">
              {stats.total} total, {stats.active} active
            </p>
          )}
        </div>
        <Button asChild>
          <Link href="/[entities]/create">
            <Plus className="h-4 w-4 mr-2" />
            New [Entity]
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <Input
            placeholder="Search [entities]..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Entity Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {initialData.map((entity) => (
          <Card key={entity.id} className="p-4">
            <Link href={`/[entities]/${entity.id}`}>
              {/* Entity card content */}
            </Link>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {initialData.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No [entities] found</p>
          <Button asChild className="mt-4">
            <Link href="/[entities]/create">Create your first [entity]</Link>
          </Button>
        </Card>
      )}
    </div>
  )
}
```

### Key Points

- ✅ Uses URL search params for shareable, linkable state
- ✅ Updates URL via `router.push()` when filters change
- ✅ NO client-side filtering - server handles filtering
- ✅ Always include empty state with "Create" button
- ✅ File name is PLURAL: `weddings-list-client.tsx` not `wedding-list-client.tsx`

**Reference:** `src/app/(main)/weddings/weddings-list-client.tsx`

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

**Reference:** `src/app/(main)/weddings/create/page.tsx`

---

## 4. View Page (Server)

**File:** `page.tsx` in `app/(main)/[entity-plural]/[id]/`

**Purpose:** Server page for viewing a single entity with full details.

### Structure

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { [Entity]ViewClient } from './[entity]-view-client'
import { get[Entity]WithRelations } from '@/lib/actions/[entities]'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function [Entity]Page({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const entity = await get[Entity]WithRelations(id)
  if (!entity) notFound()

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: '[Entities]', href: '/[entities]' },
    { label: entity.name || 'View', href: `/[entities]/${id}` }
  ]

  return (
    <PageContainer>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <[Entity]ViewClient entity={entity} />
    </PageContainer>
  )
}
```

### Key Points

- ✅ Fetch entity **with relations** using `get[Entity]WithRelations()`
- ✅ Return `notFound()` if entity doesn't exist
- ✅ Pass full entity with relations to view client
- ✅ Wrap in PageContainer (not FormWrapper)

**Reference:** `src/app/(main)/weddings/[id]/page.tsx`

---

## 5. Edit Page (Server)

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

- ✅ Fetch entity **with relations** for editing
- ✅ Pass `entity` prop to FormWrapper (signals edit mode)
- ✅ FormWrapper shows action buttons in edit mode

**Reference:** `src/app/(main)/weddings/[id]/edit/page.tsx`

---

## 6. Form Wrapper (Client)

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

**Reference:** `src/app/(main)/weddings/wedding-form-wrapper.tsx`

---

## 7. Unified Form (Client)

**File:** `[entity]-form.tsx` in `app/(main)/[entity-plural]/`

**Purpose:** Single form component that handles both create and edit modes.

### Structure

**Note:** Forms can use either simple useState or Zod validation. The example below shows the recommended Zod pattern for type safety and validation.

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { FormField } from '@/components/ui/form-field'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormBottomActions } from '@/components/form-bottom-actions'
import { toast } from 'sonner'
import { create[Entity], update[Entity], type [Entity]WithRelations } from '@/lib/actions/[entities]'

// Zod validation schema (recommended)
const [entity]Schema = z.object({
  field1: z.string().min(1, 'Field is required'),
  field2: z.string().optional(),
  // ... all fields
})

type [Entity]FormValues = z.infer<typeof [entity]Schema>

interface [Entity]FormProps {
  entity?: [Entity]WithRelations
  formId?: string
  onLoadingChange?: (isLoading: boolean) => void
}

export function [Entity]Form({
  entity,
  formId = '[entity]-form',
  onLoadingChange
}: [Entity]FormProps) {
  const router = useRouter()
  const isEditing = !!entity
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [field1, setField1] = useState(entity?.field1 || '')
  const [field2, setField2] = useState(entity?.field2 || '')

  // Sync loading state with wrapper
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading)
    }
  }, [isLoading, onLoadingChange])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate with Zod
      const values = [entity]Schema.parse({
        field1,
        field2,
        // ... all fields
      })

      if (isEditing) {
        await update[Entity](entity.id, values)
        toast.success('[Entity] updated successfully')
        router.push(`/[entities]/${entity.id}`)
      } else {
        const new[Entity] = await create[Entity](values)
        toast.success('[Entity] created successfully')
        router.push(`/[entities]/${new[Entity].id}`)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message)  // Note: .issues (Zod v4)
      } else {
        console.error('Error saving [entity]:', error)
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} [entity]`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      id="[entity]-form"
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>[Entity] Details</CardTitle>
          <CardDescription>Basic information and fields</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            id="field1"
            label="Field 1"
            value={field1}
            onChange={setField1}
            required
            placeholder="Enter field 1"
          />

          <FormField
            id="field2"
            label="Field 2 (Optional)"
            value={field2}
            onChange={setField2}
            placeholder="Enter field 2"
          />

          {/* More fields... */}
        </CardContent>
      </Card>

      {/* Bottom Save/Cancel Buttons */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/[entities]/${entity.id}` : "/[entities]"}
        saveLabel={isEditing ? "Save [Entity]" : "Create [Entity]"}
      />
    </form>
  )
}
```

### Key Points

- ✅ Detects mode via `entity` prop
- ✅ Form ID matches wrapper's `form` attribute
- ✅ Redirects to view page after save
- ✅ **Zod validation recommended** for type safety and client-side validation
- ✅ **Save buttons appear in TWO locations:**
  - **Top:** In PageContainer actions (via wrapper - View + Save in edit mode, Save only in create mode)
  - **Bottom:** FormBottomActions component (Save + Cancel in both modes)
- ✅ All form fields wrapped in Card components with CardHeader/CardContent
- ✅ Uses FormField component for all inputs
- ✅ Syncs loading state with wrapper via `onLoadingChange` callback
- ✅ Handles Zod validation errors with user-friendly toast messages

**Current Implementation:** `src/app/(main)/weddings/wedding-form.tsx` (uses useState pattern without Zod)

**Recommended Pattern:** Use Zod validation as shown in example above for type safety

**See Also:** [FORMS.md](./FORMS.md) for comprehensive form patterns

---

## 8. View Client

**File:** `[entity]-view-client.tsx` in `app/(main)/[entity-plural]/[id]/`

**Purpose:** Displays entity details, renders liturgy content, and integrates ModuleViewPanel.

### Structure

```tsx
'use client'

import { ModuleViewPanel } from '@/components/module-view-panel'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { build[Entity]Liturgy } from '@/lib/content-builders/[entity]'
import { [Entity]FormActions } from './[entity]-form-actions'
import type { [Entity]WithRelations } from '@/lib/actions/[entities]'

interface [Entity]ViewClientProps {
  entity: [Entity]WithRelations
}

export function [Entity]ViewClient({ entity }: [Entity]ViewClientProps) {
  // Build liturgy document
  const templateId = entity.[entity]_template_id || 'default'
  const liturgyDocument = build[Entity]Liturgy(entity, templateId)

  // Render to HTML
  const liturgyHTML = renderHTML(liturgyDocument)

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <div className="flex-1">
        <[Entity]FormActions entity={entity} />

        {/* Liturgy Content */}
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: liturgyHTML }}
        />
      </div>

      {/* Side Panel */}
      <ModuleViewPanel
        entityId={entity.id}
        modulePath="[entities]"
        metadata={[
          { label: 'Status', value: entity.status },
          { label: 'Created', value: new Date(entity.created_at).toLocaleDateString() },
          // ... other metadata
        ]}
      />
    </div>
  )
}
```

### Key Points

- ✅ Builds liturgy using content builder
- ✅ Renders HTML using `renderHTML()`
- ✅ Integrates ModuleViewPanel for actions and metadata
- ✅ Shows FormActions at top of content
- ✅ Uses prose classes for liturgy content

**Reference:** `src/app/(main)/weddings/[id]/wedding-view-client.tsx`

**See Also:** [LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md)

---

## 9. Form Actions (Client)

**File:** `[entity]-form-actions.tsx` in `app/(main)/[entity-plural]/[id]/`

**Purpose:** Provides Copy Info, Edit, and Delete action buttons for the view page.

### Structure

```tsx
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { Edit, Copy, Trash2 } from "lucide-react"
import { delete[Entity] } from "@/lib/actions/[entities]"
import type { [Entity]WithRelations } from "@/lib/types"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface [Entity]FormActionsProps {
  entity: [Entity]WithRelations
}

export function [Entity]FormActions({ entity }: [Entity]FormActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await delete[Entity](entity.id)
      toast.success('[Entity] deleted successfully')
      setDeleteDialogOpen(false)
      router.push('/[entities]')
    } catch (error) {
      console.error('Failed to delete [entity]:', error)
      toast.error('Failed to delete [entity]. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyInfo = () => {
    const info = `[Entity] Details
Status: ${entity.status || 'N/A'}
${entity.field1 ? `Field 1: ${entity.field1}` : ''}
${entity.field2 ? `Field 2: ${entity.field2}` : ''}
${entity.notes ? `\n\nNotes: ${entity.notes}` : ''}`

    navigator.clipboard.writeText(info)
    toast.success('[Entity] information copied to clipboard')
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <Button variant="outline" onClick={handleCopyInfo}>
        <Copy className="h-4 w-4 mr-2" />
        Copy Info
      </Button>

      <Button variant="outline" asChild>
        <Link href={`/[entities]/${entity.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Link>
      </Button>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete [Entity]</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this [entity]? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

### Key Points

- ✅ Three action buttons: Copy Info, Edit, Delete
- ✅ Copy Info formats entity details for clipboard
- ✅ Edit links to edit page
- ✅ Delete shows confirmation dialog
- ✅ Handles loading states during delete
- ✅ Redirects to list page after successful deletion
- ✅ Uses toast notifications for feedback

### Copy Info Pattern

Customize the `handleCopyInfo` function to include relevant entity details:

```tsx
const handleCopyInfo = () => {
  // Wedding example
  const brideName = entity.bride ? `${entity.bride.first_name} ${entity.bride.last_name}` : 'Not specified'
  const groomName = entity.groom ? `${entity.groom.first_name} ${entity.groom.last_name}` : 'Not specified'

  const info = `Wedding Details
Bride: ${brideName}
Groom: ${groomName}
Status: ${entity.status}
${entity.notes ? `\nNotes: ${entity.notes}` : ''}`

  navigator.clipboard.writeText(info)
  toast.success('Wedding information copied to clipboard')
}
```

**Reference Implementations:**
- `src/app/(main)/weddings/[id]/wedding-form-actions.tsx`
- `src/app/(main)/presentations/[id]/presentation-form-actions.tsx`

---

## File Location Summary

```
app/(main)/[entity-plural]/
├── page.tsx                              # 1. List Page (Server)
├── [entities]-list-client.tsx            # 2. List Client
├── [entity]-form-wrapper.tsx             # 6. Form Wrapper (Client)
├── [entity]-form.tsx                     # 7. Unified Form (Client)
├── create/
│   └── page.tsx                         # 3. Create Page (Server)
└── [id]/
    ├── page.tsx                         # 4. View Page (Server)
    ├── [entity]-view-client.tsx         # 8. View Client
    ├── [entity]-form-actions.tsx        # 9. Form Actions (Client)
    └── edit/
        └── page.tsx                     # 5. Edit Page (Server)
```

---

## Common Patterns

### Server vs Client Components

**Server Components (no 'use client'):**
- All `page.tsx` files
- Handle authentication
- Fetch data
- Pass serializable props to client components

**Client Components ('use client'):**
- All interactive components
- Forms with state
- Action buttons
- URL state management

### Type Safety

Always use the `[Entity]WithRelations` type for:
- Edit form props
- View client props
- Form actions props

Use base `[Entity]` type only when relations aren't needed.

### Error Handling

**Not Found:**
```tsx
const entity = await get[Entity]WithRelations(id)
if (!entity) notFound()
```

**Client Errors:**
```tsx
try {
  await delete[Entity](entity.id)
  toast.success('Success message')
} catch (error) {
  console.error('Error:', error)
  toast.error('Error message')
}
```

### Redirection Pattern

After successful operations:
- **Create:** Redirect to view page (`/[entities]/${newEntity.id}`)
- **Update:** Redirect to view page (`/[entities]/${entity.id}`)
- **Delete:** Redirect to list page (`/[entities]`)

---

## Related Documentation

- **[MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md)** - Step-by-step module creation checklist
- **[FORMS.md](./FORMS.md)** - Comprehensive form patterns and styling
- **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Globally reusable components
- **[LITURGICAL_SCRIPT_SYSTEM.md](./LITURGICAL_SCRIPT_SYSTEM.md)** - Content builders and renderers
- **[PICKER_PATTERNS.md](./PICKER_PATTERNS.md)** - Picker modal behavior patterns
