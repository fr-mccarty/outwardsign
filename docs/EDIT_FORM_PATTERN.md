# Edit Form Pattern

> **Purpose:** Complete, repeatable pattern for implementing edit functionality in modules. Follow this guide when creating or updating edit forms.

## Table of Contents

- [Overview - The 3-Layer Architecture](#overview---the-3-layer-architecture)
- [Layer 1: Edit Page (Server)](#layer-1-edit-page-server)
- [Layer 2: Form Wrapper (Client)](#layer-2-form-wrapper-client)
- [Layer 3: Unified Form (Client)](#layer-3-unified-form-client)
- [Complete Example: Wedding Module](#complete-example-wedding-module)
- [Common Patterns](#common-patterns)
- [Implementation Checklist](#implementation-checklist)

---

## Overview - The 3-Layer Architecture

Edit forms in Outward Sign follow a consistent **3-layer architecture** that separates concerns:

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Edit Page (Server Component)                      │
│ - Authentication                                            │
│ - Fetch entity with relations                              │
│ - Build dynamic title from entity data                     │
│ - Set breadcrumbs                                           │
│ - Pass to Layer 2                                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Form Wrapper (Client Component)                   │
│ - Manage loading state                                      │
│ - Detect edit mode (entity present)                        │
│ - Show "View [Entity]" button in edit mode                 │
│ - Provide SaveButton connected to form                     │
│ - Wrap form in PageContainer                               │
│ - Pass to Layer 3                                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Unified Form (Client Component)                   │
│ - Detect mode (create vs edit)                             │
│ - Initialize state from entity data                        │
│ - Handle form submission                                    │
│ - Call create[Entity] or update[Entity]                    │
│ - Redirect appropriately                                    │
└─────────────────────────────────────────────────────────────┘
```

**Key Principle:** Each layer has a single, clear responsibility. This makes the system predictable, testable, and maintainable.

---

## Layer 1: Edit Page (Server)

**File Location:** `app/(main)/[entity-plural]/[id]/edit/page.tsx`

**Type:** Server Component (no `'use client'`)

**Purpose:** Handle server-side concerns (auth, data fetching, breadcrumbs), then pass clean data to client.

### Standard Template

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

  // 4. BUILD DYNAMIC TITLE (see patterns below)
  let title = "Edit [Entity]"
  // Add logic to customize title based on entity data

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

### Key Requirements

| Requirement | Why |
|-------------|-----|
| ✅ **Use `get[Entity]WithRelations()`** | Forms need related data (Person objects, Event objects, etc.), not just IDs |
| ✅ **Await params** | Next.js 15 requires `await params` before accessing `params.id` |
| ✅ **Call `notFound()` if null** | Proper 404 handling for missing entities |
| ✅ **Build dynamic title** | User-friendly page title based on entity data (see patterns) |
| ✅ **Type cast for relations** | Use `(entity as any).relationName` when accessing relations not in base type |
| ✅ **Pass entity to wrapper** | Signals edit mode to form wrapper and form |

### Dynamic Title Patterns

Different modules build titles differently based on their primary entities:

#### Wedding: Combine bride and groom last names
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

#### Funeral: Use deceased name
```tsx
const deceased = (funeral as any).deceased
let title = "Edit Funeral"

if (deceased?.last_name) {
  title = `${deceased.first_name ? deceased.first_name + ' ' : ''}${deceased.last_name} Funeral`
}
```

#### Baptism: Use child name
```tsx
const child = (baptism as any).child
let title = "Edit Baptism"

if (child?.last_name) {
  title = `${child.first_name || ''} ${child.last_name} Baptism`.trim()
} else if (child?.first_name) {
  title = `${child.first_name} Baptism`
}
```

#### Presentation: Use child last name only
```tsx
const child = presentation.child
let title = "Edit Presentation"

if (child?.last_name) {
  title = `${child.last_name} Presentation`
}
```

#### Simple entities (Person, Event, Location): Use entity name
```tsx
const title = `Edit ${entity.name}` // or first/last name
```

**Pattern:** Use the most distinctive information available to help users identify which record they're editing.

---

## Layer 2: Form Wrapper (Client)

**File Location:** `app/(main)/[entity-plural]/[entity]-form-wrapper.tsx`

**Type:** Client Component (`'use client'`)

**Purpose:** Manage form loading state, provide action buttons in edit mode, wrap form in PageContainer.

### Standard Template

```tsx
'use client'

import React, { useState } from 'react'
import { [Entity]Form } from './[entity]-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { [Entity] } from '@/lib/types'

interface [Entity]FormWrapperProps {
  [entity]?: [Entity]
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
  // 1. FORM ID (consistent naming)
  const formId = '[entity]-form'

  // 2. LOADING STATE
  const [isLoading, setIsLoading] = useState(false)

  // 3. DETECT EDIT MODE
  const isEditing = !!entity

  // 4. ACTION BUTTONS
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

  // 5. RENDER
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

### Key Requirements

| Requirement | Why |
|-------------|-----|
| ✅ **Unique formId** | SaveButton targets form via `form` attribute |
| ✅ **isLoading state** | Controls SaveButton spinner animation |
| ✅ **isEditing computed** | Determines whether to show "View [Entity]" button |
| ✅ **View button only in edit** | Create mode doesn't have an entity to view yet |
| ✅ **SaveButton in actions** | Appears in PageContainer header |
| ✅ **Pass onLoadingChange** | Form notifies wrapper of loading state changes |
| ✅ **maxWidth="4xl"** | Standard width for forms (prevents overly wide layouts) |

---

## Layer 3: Unified Form (Client)

**File Location:** `app/(main)/[entity-plural]/[entity]-form.tsx`

**Type:** Client Component (`'use client'`)

**Purpose:** Handle both create and edit modes in a single form component.

### Standard Template (Simplified Pattern)

```tsx
"use client"

import { useState, useEffect } from "react"
import { FormField } from "@/components/ui/form-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  create[Entity],
  update[Entity],
  type Create[Entity]Data,
  type [Entity]WithRelations
} from "@/lib/actions/[entities]"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { FormBottomActions } from "@/components/form-bottom-actions"
import { usePickerState } from "@/hooks/use-picker-state"
import { PersonPickerField } from "@/components/person-picker-field"
import { EventPickerField } from "@/components/event-picker-field"
// ... other imports

interface [Entity]FormProps {
  [entity]?: [Entity]WithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function [Entity]Form({ [entity], formId, onLoadingChange }: [Entity]FormProps) {
  const router = useRouter()

  // 1. COMPUTE isEditing
  const isEditing = !![entity]
  const [isLoading, setIsLoading] = useState(false)

  // 2. NOTIFY PARENT OF LOADING STATE CHANGES
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // 3. FORM STATE
  // Simple fields
  const [status, setStatus] = useState([entity]?.status || "ACTIVE")
  const [notes, setNotes] = useState([entity]?.notes || "")

  // Boolean fields
  const [someCheckbox, setSomeCheckbox] = useState([entity]?.some_checkbox || false)

  // Picker states (using usePickerState hook)
  const relatedPerson = usePickerState<Person>()
  const relatedEvent = usePickerState<Event>()

  // 4. INITIALIZE FROM ENTITY DATA (edit mode)
  useEffect(() => {
    if ([entity]) {
      // Set picker values from relations
      if ([entity].related_person) relatedPerson.setValue([entity].related_person)
      if ([entity].related_event) relatedEvent.setValue([entity].related_event)
    }
  }, [[entity]])

  // 5. SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData: Create[Entity]Data = {
        status: status || undefined,
        notes: notes || undefined,
        some_checkbox: someCheckbox,
        related_person_id: relatedPerson.value?.id,
        related_event_id: relatedEvent.value?.id,
        // ... all other fields
      }

      if (isEditing) {
        // UPDATE
        await update[Entity]([entity].id, formData)
        toast.success('[Entity] updated successfully')
        router.refresh() // Refresh to show updated data, stay on edit page
      } else {
        // CREATE
        const new[Entity] = await create[Entity](formData)
        toast.success('[Entity] created successfully!')
        router.push(`/[entities]/${new[Entity].id}`) // Navigate to view page
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} [entity]:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} [entity]. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  // 6. RENDER FORM
  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {/* Card sections for grouped fields */}
      <Card>
        <CardHeader>
          <CardTitle>Section Title</CardTitle>
          <CardDescription>Section description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form fields */}
          <FormField
            id="notes"
            label="Notes"
            value={notes}
            onChange={setNotes}
            placeholder="Enter notes..."
            inputType="textarea"
            rows={3}
          />

          <PersonPickerField
            label="Related Person"
            value={relatedPerson.value}
            onValueChange={relatedPerson.setValue}
            showPicker={relatedPerson.showPicker}
            onShowPickerChange={relatedPerson.setShowPicker}
            placeholder="Select person"
            openToNewPerson={!relatedPerson.value}
          />

          {/* More fields... */}
        </CardContent>
      </Card>

      {/* Submit Actions */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/[entities]/${[entity].id}` : '/[entities]'}
        saveLabel={isEditing ? 'Update [Entity]' : 'Save [Entity]'}
      />
    </form>
  )
}
```

### Key Requirements

| Requirement | Why |
|-------------|-----|
| ✅ **isEditing = !![entity]** | Single source of truth for mode detection |
| ✅ **useEffect for onLoadingChange** | Parent wrapper needs to know loading state for SaveButton |
| ✅ **useEffect for initialization** | Populate form fields from entity data in edit mode |
| ✅ **Use usePickerState hook** | Reduces boilerplate for picker modal management |
| ✅ **router.refresh() after update** | Shows updated data, stays on edit page |
| ✅ **router.push() after create** | Navigates to view page for new entity |
| ✅ **FormBottomActions component** | Consistent button placement and styling |
| ✅ **formId matches wrapper** | Allows external SaveButton to trigger submit |
| ✅ **Optional fields as `undefined`** | Server action update pattern (see [Object.fromEntries pattern](#objectfromentries-pattern)) |

### State Management Patterns

#### Simple Fields
```tsx
const [fieldName, setFieldName] = useState(entity?.field_name || "")
```

#### Boolean Fields
```tsx
const [isChecked, setIsChecked] = useState(entity?.is_checked || false)
```

#### Picker Fields (Person, Event, Location)
```tsx
// 1. Declare picker state
const person = usePickerState<Person>()

// 2. Initialize from entity
useEffect(() => {
  if (entity?.related_person) person.setValue(entity.related_person)
}, [entity])

// 3. Use in form
<PersonPickerField
  value={person.value}
  onValueChange={person.setValue}
  showPicker={person.showPicker}
  onShowPickerChange={person.setShowPicker}
  openToNewPerson={!person.value}  // Opens to create when empty
/>

// 4. Include in submit data
const formData = {
  related_person_id: person.value?.id,
}
```

#### Reading Pickers (Special Case)
```tsx
// 1. Declare state
const [firstReading, setFirstReading] = useState<IndividualReading | null>(null)
const [showFirstReadingPicker, setShowFirstReadingPicker] = useState(false)

// 2. Initialize from entity
useEffect(() => {
  if (entity?.first_reading) setFirstReading(entity.first_reading)
}, [entity])

// 3. Use in form
<Button onClick={() => setShowFirstReadingPicker(true)}>
  {firstReading ? firstReading.title : 'Select Reading'}
</Button>

<ReadingPickerModal
  isOpen={showFirstReadingPicker}
  onClose={() => setShowFirstReadingPicker(false)}
  onSelect={setFirstReading}
  selectedReading={firstReading}
  readings={readings}
/>

// 4. Include in submit data
const formData = {
  first_reading_id: firstReading?.id,
}
```

### Form Organization Best Practices

#### Card Sections
Group related fields into Card sections with descriptive titles:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Key Information</CardTitle>
    <CardDescription>Essential details</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Related fields */}
  </CardContent>
</Card>

<Card>
  <CardHeader>
    <CardTitle>Additional Details</CardTitle>
    <CardDescription>Optional information</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Related fields */}
  </CardContent>
</Card>
```

#### Grid Layouts for Related Fields
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <PersonPickerField label="Bride" {...} />
  <PersonPickerField label="Groom" {...} />
</div>
```

#### Checkbox Groups
```tsx
<div className="space-y-3">
  <Label>Options</Label>
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      <Checkbox
        id="option1"
        checked={option1}
        onCheckedChange={setOption1}
      />
      <Label htmlFor="option1">Option 1 Description</Label>
    </div>
    {/* More checkboxes */}
  </div>
</div>
```

---

## Complete Example: Wedding Module

### 1. Edit Page (`weddings/[id]/edit/page.tsx`)

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const wedding = await getWeddingWithRelations(id)

  if (!wedding) {
    notFound()
  }

  // Build dynamic title from bride and groom names
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

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Weddings", href: "/weddings" },
    { label: "Edit" }
  ]

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

### 2. Form Wrapper (`weddings/wedding-form-wrapper.tsx`)

```tsx
'use client'

import React, { useState } from 'react'
import { WeddingForm } from './wedding-form'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { SaveButton } from '@/components/save-button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { Wedding } from '@/lib/types'

interface WeddingFormWrapperProps {
  wedding?: Wedding
  title: string
  description: string
  saveButtonLabel: string
}

export function WeddingFormWrapper({
  wedding,
  title,
  description,
  saveButtonLabel
}: WeddingFormWrapperProps) {
  const formId = 'wedding-form'
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!wedding

  const actions = (
    <>
      {isEditing && (
        <Button variant="outline" asChild>
          <Link href={`/weddings/${wedding.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Wedding
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
      <WeddingForm
        wedding={wedding}
        formId={formId}
        onLoadingChange={setIsLoading}
      />
    </PageContainer>
  )
}
```

### 3. Unified Form (Simplified - see actual file for complete implementation)

```tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { FormField } from "@/components/ui/form-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PersonPickerField } from "@/components/person-picker-field"
import { EventPickerField } from "@/components/event-picker-field"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { usePickerState } from "@/hooks/use-picker-state"
import { createWedding, updateWedding, type CreateWeddingData, type WeddingWithRelations } from "@/lib/actions/weddings"
import type { Person, Event } from "@/lib/types"

interface WeddingFormProps {
  wedding?: WeddingWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function WeddingForm({ wedding, formId, onLoadingChange }: WeddingFormProps) {
  const router = useRouter()
  const isEditing = !!wedding
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // State
  const [status, setStatus] = useState(wedding?.status || "ACTIVE")
  const [notes, setNotes] = useState(wedding?.notes || "")

  // Picker states
  const bride = usePickerState<Person>()
  const groom = usePickerState<Person>()
  const weddingEvent = usePickerState<Event>()

  // Initialize from wedding data
  useEffect(() => {
    if (wedding) {
      if (wedding.bride) bride.setValue(wedding.bride)
      if (wedding.groom) groom.setValue(wedding.groom)
      if (wedding.wedding_event) weddingEvent.setValue(wedding.wedding_event)
    }
  }, [wedding])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const weddingData: CreateWeddingData = {
        status: status || undefined,
        notes: notes || undefined,
        bride_id: bride.value?.id,
        groom_id: groom.value?.id,
        wedding_event_id: weddingEvent.value?.id,
        // ... all other fields
      }

      if (isEditing) {
        await updateWedding(wedding.id, weddingData)
        toast.success('Wedding updated successfully')
        router.refresh()
      } else {
        const newWedding = await createWedding(weddingData)
        toast.success('Wedding created successfully!')
        router.push(`/weddings/${newWedding.id}`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} wedding:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} wedding. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Key Information</CardTitle>
          <CardDescription>Essential details about the couple</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonPickerField
              label="Bride"
              value={bride.value}
              onValueChange={bride.setValue}
              showPicker={bride.showPicker}
              onShowPickerChange={bride.setShowPicker}
              placeholder="Select Bride"
              openToNewPerson={!bride.value}
            />
            <PersonPickerField
              label="Groom"
              value={groom.value}
              onValueChange={groom.setValue}
              showPicker={groom.showPicker}
              onShowPickerChange={groom.setShowPicker}
              placeholder="Select Groom"
              openToNewPerson={!groom.value}
            />
          </div>

          <EventPickerField
            label="Wedding Ceremony"
            value={weddingEvent.value}
            onValueChange={weddingEvent.setValue}
            showPicker={weddingEvent.showPicker}
            onShowPickerChange={weddingEvent.setShowPicker}
            placeholder="Add Wedding Ceremony"
            openToNewEvent={!weddingEvent.value}
          />
        </CardContent>
      </Card>

      <FormBottomActions
        isEditing={isEditing}
        isLoading={isLoading}
        cancelHref={isEditing ? `/weddings/${wedding.id}` : '/weddings'}
        saveLabel={isEditing ? 'Update Wedding' : 'Save Wedding'}
      />
    </form>
  )
}
```

---

## Common Patterns

### Type Casting for Relations

When accessing related entities that aren't included in the base type, use type casting:

```tsx
// Wedding module - accessing bride/groom relations
const bride = (wedding as any).bride
const groom = (wedding as any).groom

// Funeral module - accessing deceased relation
const deceased = (funeral as any).deceased

// Why: The base type might not include these relations,
// but get[Entity]WithRelations() returns them at runtime
```

**Better approach:** Define `[Entity]WithRelations` interface in server actions file:

```tsx
// In lib/actions/weddings.ts
export interface WeddingWithRelations extends Wedding {
  bride?: Person | null
  groom?: Person | null
  wedding_event?: Event | null
  // ... all relations
}

// Then use in edit page:
const bride = wedding.bride  // Type-safe, no casting needed
```

### Object.fromEntries Pattern

In `update[Entity]` server actions, use `Object.fromEntries` to filter out undefined values:

```tsx
export async function updateWedding(id: string, data: CreateWeddingData): Promise<Wedding> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Build update object from only defined values (filters out undefined)
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: wedding, error } = await supabase
    .from('weddings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating wedding:', error)
    throw new Error('Failed to update wedding')
  }

  revalidatePath('/weddings')
  revalidatePath(`/weddings/${id}`)
  revalidatePath(`/weddings/${id}/edit`)
  return wedding
}
```

**Why:** Allows partial updates. Fields not changed in the form (passed as `undefined`) won't overwrite existing database values.

### Conditional Form Fields

Some fields should only appear in edit mode or create mode:

```tsx
{isEditing && (
  <FormField
    label="Created Date"
    value={new Date(entity.created_at).toLocaleDateString()}
    disabled
  />
)}

{!isEditing && (
  <Card>
    <CardHeader>
      <CardTitle>Initial Setup</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Fields only shown during creation */}
    </CardContent>
  </Card>
)}
```

### Loading Readings (Wedding, Funeral, Baptism)

Some modules need to load scripture readings:

```tsx
const [readings, setReadings] = useState<IndividualReading[]>([])

useEffect(() => {
  const loadReadings = async () => {
    try {
      const allReadings = await getIndividualReadings()
      setReadings(allReadings)
    } catch (error) {
      console.error('Failed to load readings:', error)
      toast.error('Failed to load readings')
    }
  }
  loadReadings()
}, [])
```

### Suggested Event Names (useMemo)

For better UX, suggest event names based on related person data:

```tsx
const suggestedWeddingName = useMemo(() => {
  const brideLastName = bride.value?.last_name
  const groomLastName = groom.value?.last_name

  if (brideLastName && groomLastName) {
    return `${brideLastName}-${groomLastName} Wedding`
  } else if (brideLastName) {
    return `${brideLastName} Wedding`
  } else if (groomLastName) {
    return `${groomLastName} Wedding`
  }
  return "Wedding"
}, [bride.value, groom.value])

// Use in EventPickerField
<EventPickerField
  defaultCreateFormData={{ name: suggestedWeddingName }}
  // ...
/>
```

---

## Implementation Checklist

Use this checklist when creating or updating edit forms:

### Layer 1: Edit Page (Server)
- [ ] File created at `app/(main)/[entities]/[id]/edit/page.tsx`
- [ ] Import `createClient` from `@/lib/supabase/server`
- [ ] Import `redirect, notFound` from `next/navigation`
- [ ] Import `get[Entity]WithRelations` from actions
- [ ] Import `BreadcrumbSetter` component
- [ ] Import `[Entity]FormWrapper` component
- [ ] Define `PageProps` interface with `Promise<{ id: string }>`
- [ ] Check authentication, redirect to `/login` if not authenticated
- [ ] Await params: `const { id } = await params`
- [ ] Fetch entity: `const entity = await get[Entity]WithRelations(id)`
- [ ] Handle not found: `if (!entity) notFound()`
- [ ] Build dynamic title from entity data
- [ ] Define breadcrumbs array
- [ ] Render `BreadcrumbSetter` and `FormWrapper`
- [ ] Pass entity, title, description, saveButtonLabel to wrapper

### Layer 2: Form Wrapper (Client)
- [ ] File created at `app/(main)/[entities]/[entity]-form-wrapper.tsx`
- [ ] Add `'use client'` directive
- [ ] Import `PageContainer`, `SaveButton`, `Button`, icons
- [ ] Import `[Entity]Form` component
- [ ] Import entity type from `@/lib/types`
- [ ] Define props interface (entity?, title, description, saveButtonLabel)
- [ ] Define formId constant (e.g., `'wedding-form'`)
- [ ] Create isLoading state with `useState(false)`
- [ ] Compute isEditing: `const isEditing = !!entity`
- [ ] Create actions JSX with conditional "View [Entity]" button
- [ ] Include SaveButton in actions with formId
- [ ] Wrap form in PageContainer with title, description, actions
- [ ] Pass entity, formId, onLoadingChange to form

### Layer 3: Unified Form (Client)
- [ ] File created at `app/(main)/[entities]/[entity]-form.tsx`
- [ ] Add `'use client'` directive
- [ ] Import form components (FormField, Card, etc.)
- [ ] Import picker components (PersonPickerField, EventPickerField, etc.)
- [ ] Import `usePickerState` hook
- [ ] Import `useRouter` from `next/navigation`
- [ ] Import `toast` from `sonner`
- [ ] Import server actions and types
- [ ] Define props interface (entity?, formId?, onLoadingChange?)
- [ ] Compute isEditing: `const isEditing = !!entity`
- [ ] Create isLoading state
- [ ] Add useEffect to notify parent of loading changes
- [ ] Declare all form state (simple fields, booleans, pickers)
- [ ] Add useEffect to initialize from entity data
- [ ] Implement handleSubmit with create/update logic
- [ ] Use router.refresh() after update
- [ ] Use router.push() after create
- [ ] Organize form fields in Card sections
- [ ] Use FormField for all inputs/textareas/selects
- [ ] Use picker field components for relations
- [ ] Add FormBottomActions at bottom
- [ ] Verify formId matches wrapper

### Testing
- [ ] Create mode: Can create new entity
- [ ] Edit mode: Form populates with entity data
- [ ] Edit mode: "View [Entity]" button appears and works
- [ ] Save button shows loading spinner during submission
- [ ] After create: Redirects to view page
- [ ] After update: Stays on edit page with updated data
- [ ] Toast messages appear on success/error
- [ ] Cancel button works (create and edit modes)
- [ ] Picker fields open to correct mode (create when empty, search when populated)
- [ ] Dynamic title displays correctly in edit mode

---

## Related Documentation

- **[FORMS.md](./FORMS.md)** - Comprehensive form patterns (input styling, FormField usage, validation, event handling)
- **[MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md)** - All 9 module component patterns
- **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Picker components, shared components, and hooks
- **[PICKER_PATTERNS.md](./PICKER_PATTERNS.md)** - Picker modal behavior (auto-select, no redirect)

---

## Quick Reference

### File Locations
```
app/(main)/[entities]/
├── [id]/
│   └── edit/
│       └── page.tsx                      # Layer 1: Edit Page (Server)
├── [entity]-form-wrapper.tsx             # Layer 2: Form Wrapper (Client)
└── [entity]-form.tsx                     # Layer 3: Unified Form (Client)
```

### Props Flow
```
Edit Page (Server)
  ↓ entity, title, description, saveButtonLabel
Form Wrapper (Client)
  ↓ entity, formId, onLoadingChange
Unified Form (Client)
```

### Mode Detection
```tsx
// Consistent pattern across all 3 layers
const isEditing = !!entity
```

### Redirection Pattern
```tsx
if (isEditing) {
  await updateEntity(entity.id, data)
  router.refresh()  // Stay on edit page
} else {
  const newEntity = await createEntity(data)
  router.push(`/entities/${newEntity.id}`)  // Go to view page
}
```

### Type Pattern
```tsx
// Form Wrapper accepts base type
interface FormWrapperProps {
  entity?: Entity  // Base type
}

// Unified Form accepts WithRelations type
interface FormProps {
  entity?: EntityWithRelations  // With relations for form initialization
}
```
