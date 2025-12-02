# Module Patterns: Form & View Components

> **Part of:** [Module Component Patterns](../MODULE_COMPONENT_PATTERNS.md)
>
> This document covers patterns for the unified form component and view client component that handle data entry and display.

## Table of Contents

- [Overview](#overview)
- [6. View Page (Server)](#6-view-page-server)
  - [Structure](#structure)
  - [Key Points](#key-points)
- [7. Unified Form (Client)](#7-unified-form-client)
  - [Structure](#structure-1)
  - [Key Points](#key-points-1)
  - [Validation Approaches](#validation-approaches)
  - [Redirect Behavior](#redirect-behavior)
- [8. View Client](#8-view-client)
  - [Structure](#structure-2)
  - [Key Points](#key-points-2)
  - [ModuleViewContainer Integration](#moduleviewcontainer-integration)
- [Related Documentation](#related-documentation)

---

## Overview

The form and view components handle the core data entry and display:

- **View Page (Server)** - Fetches entity with relations for display
- **Unified Form** - Single component that handles both create and edit modes
- **View Client** - Displays entity details and integrates with ModuleViewContainer

This separation ensures:
- Reusable form logic for create and edit
- Server-side data fetching for optimal performance
- Consistent view layout across all modules

---

## 6. View Page (Server)

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
import { get[Entity]PageTitle } from '@/lib/utils/formatters'

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

  // Build dynamic title from entity data
  const title = get[Entity]PageTitle(entity)

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Our [Entities]', href: '/[entities]' },
    { label: 'View' }
  ]

  return (
    <PageContainer
      title={title}
      description="Preview and download [entity] liturgy documents."
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <[Entity]ViewClient entity={entity} />
    </PageContainer>
  )
}
```

### Key Points

- ✅ Fetch entity **with relations** using `get[Entity]WithRelations()`
- ✅ Return `notFound()` if entity doesn't exist
- ✅ **Must wrap in PageContainer** with dynamic title and description
- ✅ Use formatter helper to generate page title from entity data
- ✅ Pass full entity with relations to view client
- ✅ View client will use ModuleViewContainer internally
- ✅ `params` is a **Promise** in Next.js 15 - must await it

**Why WithRelations?** View pages display comprehensive entity information including related data (events, people, locations, etc.). Fetching with relations ensures all data is available for display.

**Reference:** `src/app/(main)/weddings/[id]/page.tsx`

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
        router.refresh() // ← Stays on edit page to show updated data
      } else {
        const new[Entity] = await create[Entity](values)
        toast.success('[Entity] created successfully')
        router.push(`/[entities]/${new[Entity].id}/edit`) // ← Goes to edit page
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

- ✅ Detects mode via `entity` prop: `const isEditing = !!entity`
- ✅ Form ID matches wrapper's `form` attribute
- ✅ **Zod validation recommended** for type safety and client-side validation
- ✅ **Save buttons appear in TWO locations:**
  - **Top:** In PageContainer actions (via wrapper - View + Save in edit mode, Save only in create mode)
  - **Bottom:** FormBottomActions component (Save + Cancel in both modes)
- ✅ All form fields wrapped in Card components with CardHeader/CardContent
- ✅ Uses FormField component for all inputs
- ✅ Syncs loading state with wrapper via `onLoadingChange` callback
- ✅ Handles Zod validation errors with user-friendly toast messages

### Validation Approaches

**Option 1: Zod Validation (Recommended)**
```tsx
// Define schema
const schema = z.object({
  field1: z.string().min(1, 'Required'),
  field2: z.string().optional()
})

// Validate in handleSubmit
const values = schema.parse({ field1, field2 })
```

**Pros:**
- Type-safe (TypeScript infers types from schema)
- Client-side validation before API call
- Reusable schema for server-side validation
- Better error messages

**Option 2: Simple useState (Current Wedding Implementation)**
```tsx
// Just use state
const [field1, setField1] = useState(entity?.field1 || '')
const [field2, setField2] = useState(entity?.field2 || '')

// No validation schema - rely on server-side validation
```

**Pros:**
- Simpler for basic forms
- Less boilerplate
- Faster to implement

**Use Zod when:**
- Complex validation rules
- Multiple required fields
- Want type safety throughout
- Need reusable validation logic

**Use useState when:**
- Simple forms with few fields
- Server handles all validation
- Speed of implementation is priority

### Redirect Behavior

**CRITICAL:** Create and update have different redirect patterns:

**CREATE:**
```tsx
const newEntity = await createEntity(values)
router.push(`/entities/${newEntity.id}/edit`) // → Go to edit page
```
- User can continue editing
- Natural workflow: create → refine
- Edit page shows all form fields

**UPDATE:**
```tsx
await updateEntity(entity.id, values)
router.refresh() // → Stay on edit page
```
- Shows updated data immediately
- No navigation confusion
- User can make additional edits

**Why not redirect to view page after create?**
- Users often want to add more details after initial creation
- Edit page → View page transition is manual (via View button)
- Reduces clicks for common workflow

**Current Implementation:** `src/app/(main)/weddings/wedding-form.tsx` (uses useState pattern without Zod)

**Recommended Pattern:** Use Zod validation as shown in example above for type safety

**See Also:** [FORMS.md](../FORMS.md) for comprehensive form patterns

---

## 8. View Client

**File:** `[entity]-view-client.tsx` in `app/(main)/[entity-plural]/[id]/`

**Purpose:** Displays entity details, renders liturgy content, and integrates ModuleViewContainer with ModuleViewPanel.

### Structure

```tsx
'use client'

import { [Entity]WithRelations, update[Entity], delete[Entity] } from '@/lib/actions/[entities]'
import { ModuleViewContainer } from '@/components/module-view-container'
import { build[Entity]Liturgy, [ENTITY]_TEMPLATES } from '@/lib/content-builders/[entity]'
import { Button } from '@/components/ui/button'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { TemplateSelectorDialog } from '@/components/template-selector-dialog'
import { Edit, Printer, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { get[Entity]Filename } from '@/lib/utils/formatters'

interface [Entity]ViewClientProps {
  entity: [Entity]WithRelations
}

export function [Entity]ViewClient({ entity }: [Entity]ViewClientProps) {
  // Generate filename for downloads
  const generateFilename = (extension: string) => {
    return get[Entity]Filename(entity, extension)
  }

  // Extract template ID from entity record
  const getTemplateId = (entity: [Entity]WithRelations) => {
    return entity.[entity]_template_id || '[entity]-full-script-english'
  }

  // Handle template update
  const handleUpdateTemplate = async (templateId: string) => {
    await update[Entity](entity.id, {
      [entity]_template_id: templateId,
    })
  }

  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/[entities]/${entity.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit [Entity]
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/[entities]/${entity.id}`} target="_blank">
          <Printer className="h-4 w-4 mr-2" />
          Print View
        </Link>
      </Button>
    </>
  )

  // Generate export buttons
  const exportButtons = (
    <>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/[entities]/${entity.id}/pdf?filename=${generateFilename('pdf')}`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/api/[entities]/${entity.id}/word?filename=${generateFilename('docx')}`}>
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Link>
      </Button>
    </>
  )

  // Generate template selector
  const templateSelector = (
    <TemplateSelectorDialog
      currentTemplateId={entity.[entity]_template_id}
      templates={[ENTITY]_TEMPLATES}
      moduleName="[Entity]"
      onSave={handleUpdateTemplate}
      defaultTemplateId="[entity]-full-script-english"
    />
  )

  // Build status label
  const statusLabel = <ModuleStatusLabel status={entity.status} />

  return (
    <ModuleViewContainer
      entity={entity}
      entityType="[Entity]"
      modulePath="[entities]"
      mainEvent={entity.[entity]_event}
      buildLiturgy={build[Entity]Liturgy}
      getTemplateId={getTemplateId}
      generateFilename={generateFilename}
      actionButtons={actionButtons}
      exportButtons={exportButtons}
      templateSelector={templateSelector}
      statusLabel={statusLabel}
      onDelete={delete[Entity]}
    />
  )
}
```

### Key Points

- ✅ **Uses ModuleViewContainer** which internally manages ModuleViewPanel
- ✅ Passes content builder function to ModuleViewContainer
- ✅ Provides action buttons, export buttons, and template selector
- ✅ ModuleViewContainer handles layout and liturgy rendering automatically
- ✅ **PageContainer is used in the server page**, not here
- ✅ Uses formatter helper to generate filenames for downloads
- ✅ Template selector allows users to change liturgy script template
- ✅ Delete functionality handled via `onDelete` prop

### ModuleViewContainer Integration

**Important:** The view page structure is a two-layer pattern:

**Layer 1: Server Page (`page.tsx`)**
- Wraps everything in `PageContainer`
- Provides page title and description
- Handles authentication and data fetching

**Layer 2: View Client (this component)**
- Uses `ModuleViewContainer` which includes `ModuleViewPanel`
- Provides buttons, template selector, and delete handler
- Renders liturgy content via content builder

**Never use `ModuleViewContainer` without `PageContainer` wrapping it in the server page.**

This two-layer pattern ensures:
- Consistent page headers and metadata (PageContainer)
- Standardized module view layout with side panel (ModuleViewContainer)
- Proper breadcrumb and navigation structure

**Props passed to ModuleViewContainer:**

| Prop | Purpose |
|------|---------|
| `entity` | Full entity data with relations |
| `entityType` | Module name (e.g., "Wedding", "Funeral") |
| `modulePath` | URL path (e.g., "weddings", "funerals") |
| `mainEvent` | Related event record for date/time display |
| `buildLiturgy` | Content builder function |
| `getTemplateId` | Extract template ID from entity |
| `generateFilename` | Generate download filenames |
| `actionButtons` | Edit and Print buttons |
| `exportButtons` | PDF and Word download buttons |
| `templateSelector` | Template selector dialog |
| `statusLabel` | Module status badge |
| `onDelete` | Delete handler function |

**Reference:** `src/app/(main)/weddings/[id]/wedding-view-client.tsx`

**See Also:**
- [LITURGICAL_SCRIPT_SYSTEM.md](../LITURGICAL_SCRIPT_SYSTEM.md) - Content builders and templates
- [MODULE_VIEW_CONTAINER_PATTERN.md](../MODULE_VIEW_CONTAINER_PATTERN.md) - Complete ModuleViewContainer documentation

---

## Related Documentation

- **[create-edit.md](./create-edit.md)** - Create and Edit page patterns
- **[list-page.md](./list-page.md)** - List Page and List Client patterns
- **[FORMS.md](../FORMS.md)** - 🔴 CRITICAL - Complete form patterns and validation
- **[VALIDATION.md](../VALIDATION.md)** - React Hook Form + Zod validation patterns
- **[best-practices.md](./best-practices.md)** - Common patterns, troubleshooting, tips
