# Edit Form Pattern - Layer 3: Unified Form (Client)

> **Purpose:** Complete guide to implementing Layer 3 - the client form component that handles both create and edit modes with unified state management and submission logic.

## Table of Contents

- [Overview](#overview)
- [File Location and Type](#file-location-and-type)
- [Standard Template](#standard-template)
- [Key Requirements](#key-requirements)
- [State Management Patterns](#state-management-patterns)
- [Form Organization](#form-organization)
- [Complete Example](#complete-example)
- [Implementation Checklist](#implementation-checklist)
- [Common Mistakes](#common-mistakes)

---

## Overview

**Layer 3** is the form logic layer that:
1. Detects mode (create vs edit) based on entity presence
2. Initializes form fields from entity data (edit mode)
3. Manages form state (simple fields, booleans, pickers)
4. Handles form submission (create or update)
5. Redirects appropriately after submission
6. Notifies parent wrapper of loading state changes

**Type:** Client Component (requires `'use client'` directive)

---

## File Location and Type

**Path:** `app/(main)/[entity-plural]/[entity]-form.tsx`

**Examples:**
- `app/(main)/weddings/wedding-form.tsx`
- `app/(main)/funerals/funeral-form.tsx`
- `app/(main)/baptisms/baptism-form.tsx`

**Important:** This is a **Client Component**. Must include `'use client'` directive at the top.

---

## Standard Template

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
import type { Person, Event } from "@/lib/types"

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
        router.push(`/[entities]/${new[Entity].id}/edit`) // Navigate to edit page
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

---

## Key Requirements

| Requirement | Why | Implementation |
|-------------|-----|----------------|
| ✅ **'use client' directive** | Needs state and interactivity | First line of file |
| ✅ **isEditing = !![entity]** | Single source of truth for mode detection | `const isEditing = !!entity` |
| ✅ **useEffect for onLoadingChange** | Parent wrapper needs loading state for SaveButton | Notify on `isLoading` change |
| ✅ **useEffect for initialization** | Populate form fields from entity data in edit mode | Run when `entity` changes |
| ✅ **Use usePickerState hook** | Reduces boilerplate for picker modal management | For Person, Event, Location pickers |
| ✅ **router.refresh() after update** | Shows updated data, stays on edit page | Edit mode submission |
| ✅ **router.push() after create** | Navigates to edit page for new entity | Create mode submission |
| ✅ **FormBottomActions component** | Consistent button placement and styling | At bottom of form |
| ✅ **formId matches wrapper** | Allows external SaveButton to trigger submit | Pass as `id` prop to form |
| ✅ **Optional fields as `undefined`** | Server action update pattern (filters undefined) | `field || undefined` |

---

## State Management Patterns

### Simple Text Fields

```tsx
// Declaration with default value
const [fieldName, setFieldName] = useState(entity?.field_name || "")

// Usage in form
<FormField
  id="field-name"
  label="Field Name"
  value={fieldName}
  onChange={setFieldName}
  placeholder="Enter value..."
/>
```

### Boolean Fields

```tsx
// Declaration with default value
const [isChecked, setIsChecked] = useState(entity?.is_checked || false)

// Usage in form
<div className="flex items-center space-x-2">
  <Checkbox
    id="is-checked"
    checked={isChecked}
    onCheckedChange={setIsChecked}
  />
  <Label htmlFor="is-checked">Enable this option</Label>
</div>
```

### Picker Fields (Person, Event, Location)

**Using the `usePickerState` hook (recommended):**

```tsx
// 1. Declare picker state
const person = usePickerState<Person>()

// 2. Initialize from entity (in useEffect)
useEffect(() => {
  if (entity?.related_person) {
    person.setValue(entity.related_person)
  }
}, [entity])

// 3. Use in form
<PersonPickerField
  label="Related Person"
  value={person.value}
  onValueChange={person.setValue}
  showPicker={person.showPicker}
  onShowPickerChange={person.setShowPicker}
  placeholder="Select person"
  openToNewPerson={!person.value}  // Opens to create when empty
/>

// 4. Include in submit data
const formData = {
  related_person_id: person.value?.id,
}
```

**What `usePickerState` provides:**
```tsx
const person = usePickerState<Person>()
// Returns:
// {
//   value: Person | null,
//   setValue: (person: Person | null) => void,
//   showPicker: boolean,
//   setShowPicker: (show: boolean) => void
// }
```

### Reading Pickers (Special Case)

Reading pickers don't use `usePickerState` because they work differently:

```tsx
// 1. Declare state
const [firstReading, setFirstReading] = useState<IndividualReading | null>(null)
const [showFirstReadingPicker, setShowFirstReadingPicker] = useState(false)

// 2. Initialize from entity
useEffect(() => {
  if (entity?.first_reading) {
    setFirstReading(entity.first_reading)
  }
}, [entity])

// 3. Use in form
<Button
  type="button"
  variant="outline"
  onClick={() => setShowFirstReadingPicker(true)}
>
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

### Select/Dropdown Fields

```tsx
// Declaration with default value
const [status, setStatus] = useState(entity?.status || "ACTIVE")

// Usage in form with FormField
<FormField
  id="status"
  label="Status"
  value={status}
  onChange={setStatus}
  inputType="select"
  options={[
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "ARCHIVED", label: "Archived" }
  ]}
/>
```

### Date Fields

```tsx
// Declaration with default value
const [eventDate, setEventDate] = useState(entity?.event_date || "")

// Usage in form
<FormField
  id="event-date"
  label="Event Date"
  value={eventDate}
  onChange={setEventDate}
  inputType="date"
/>
```

---

## Form Organization

### Card Sections

Group related fields into Card sections with descriptive titles:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Key Information</CardTitle>
    <CardDescription>Essential details about the entity</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Related fields */}
    <FormField label="Field 1" {...} />
    <FormField label="Field 2" {...} />
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

### Grid Layouts for Related Fields

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <PersonPickerField label="Bride" {...} />
  <PersonPickerField label="Groom" {...} />
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <FormField label="Start Date" inputType="date" {...} />
  <FormField label="Start Time" inputType="time" {...} />
  <FormField label="End Time" inputType="time" {...} />
</div>
```

### Checkbox Groups

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
    <div className="flex items-center space-x-2">
      <Checkbox
        id="option2"
        checked={option2}
        onCheckedChange={setOption2}
      />
      <Label htmlFor="option2">Option 2 Description</Label>
    </div>
  </div>
</div>
```

### Conditional Fields

Show/hide fields based on other field values:

```tsx
<FormField
  id="event-type"
  label="Event Type"
  value={eventType}
  onChange={setEventType}
  inputType="select"
  options={eventTypeOptions}
/>

{eventType === "WEDDING" && (
  <Card>
    <CardHeader>
      <CardTitle>Wedding Details</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Wedding-specific fields */}
    </CardContent>
  </Card>
)}
```

---

## Complete Example

### Wedding Form (Simplified)

```tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { FormField } from "@/components/ui/form-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PersonPickerField } from "@/components/person-picker-field"
import { EventPickerField } from "@/components/event-picker-field"
import { FormBottomActions } from "@/components/form-bottom-actions"
import { usePickerState } from "@/hooks/use-picker-state"
import {
  createWedding,
  updateWedding,
  type CreateWeddingData,
  type WeddingWithRelations
} from "@/lib/actions/weddings"
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

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // Form state
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

  // Suggested event name based on couple
  const suggestedEventName = useMemo(() => {
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

  // Submit handler
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
      }

      if (isEditing) {
        await updateWedding(wedding.id, weddingData)
        toast.success('Wedding updated successfully')
        router.refresh()
      } else {
        const newWedding = await createWedding(weddingData)
        toast.success('Wedding created successfully!')
        router.push(`/weddings/${newWedding.id}/edit`)
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
            defaultCreateFormData={{ name: suggestedEventName }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            id="status"
            label="Status"
            value={status}
            onChange={setStatus}
            inputType="select"
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" }
            ]}
          />

          <FormField
            id="notes"
            label="Notes"
            value={notes}
            onChange={setNotes}
            inputType="textarea"
            rows={3}
            placeholder="Add any additional notes..."
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

## Implementation Checklist

Use this checklist when implementing Layer 3:

- [ ] **File created** at `app/(main)/[entities]/[entity]-form.tsx`
- [ ] **Add `'use client'` directive** at the top of file
- [ ] **Import form components** (FormField, Card, etc.)
- [ ] **Import picker components** (PersonPickerField, EventPickerField, etc.)
- [ ] **Import `usePickerState`** hook
- [ ] **Import `useRouter`** from `next/navigation`
- [ ] **Import `toast`** from `sonner`
- [ ] **Import server actions** and types
- [ ] **Define props interface** (entity?, formId?, onLoadingChange?)
- [ ] **Compute isEditing** using `!!entity`
- [ ] **Create isLoading state**
- [ ] **Add useEffect** to notify parent of loading changes
- [ ] **Declare all form state** (simple fields, booleans, pickers)
- [ ] **Add useEffect** to initialize from entity data
- [ ] **Implement handleSubmit** with create/update logic
- [ ] **Use `router.refresh()`** after update
- [ ] **Use `router.push()`** after create
- [ ] **Organize fields in Card sections**
- [ ] **Use FormField** for all inputs/textareas/selects
- [ ] **Use picker field components** for relations
- [ ] **Add FormBottomActions** at bottom
- [ ] **Verify formId matches** wrapper
- [ ] **Test:** Create mode creates new entity
- [ ] **Test:** Edit mode populates with entity data
- [ ] **Test:** Update stays on edit page
- [ ] **Test:** Create navigates to edit page
- [ ] **Test:** Toast messages appear
- [ ] **Test:** Loading state works

---

## Common Mistakes

### ❌ Not initializing from entity data

```tsx
// WRONG - form will be empty in edit mode
const [notes, setNotes] = useState("")

// CORRECT - initialize from entity
const [notes, setNotes] = useState(entity?.notes || "")
```

### ❌ Not using useEffect for pickers

```tsx
// WRONG - pickers won't populate in edit mode
const person = usePickerState<Person>()
if (entity?.person) person.setValue(entity.person) // Can't call setValue during render

// CORRECT - use useEffect
useEffect(() => {
  if (entity?.person) person.setValue(entity.person)
}, [entity])
```

### ❌ Wrong redirect pattern

```tsx
// WRONG - always goes to list page
const newEntity = await createEntity(data)
router.push('/entities')

// CORRECT - go to edit page for new entity
const newEntity = await createEntity(data)
router.push(`/entities/${newEntity.id}/edit`)
```

### ❌ Not handling loading state

```tsx
// WRONG - no try/finally, loading state can get stuck
const handleSubmit = async () => {
  setIsLoading(true)
  await updateEntity(data)
  setIsLoading(false)
}

// CORRECT - always reset loading state
const handleSubmit = async () => {
  setIsLoading(true)
  try {
    await updateEntity(data)
  } finally {
    setIsLoading(false)
  }
}
```

### ❌ Sending empty strings instead of undefined

```tsx
// WRONG - will overwrite database values with empty strings
const formData = {
  notes: notes, // Empty string if user clears field
}

// CORRECT - use undefined for optional fields
const formData = {
  notes: notes || undefined, // undefined if empty, won't update DB
}
```

### ❌ Not matching formId

```tsx
// WRONG - SaveButton won't trigger form submission
// wrapper.tsx:
const formId = 'wedding-form'

// form.tsx:
<form id="wedding" onSubmit={handleSubmit}>

// CORRECT - IDs must match
// wrapper.tsx:
const formId = 'wedding-form'
<EntityForm formId={formId} />

// form.tsx:
<form id={formId} onSubmit={handleSubmit}>
```

---

## Related Documentation

- **[EDIT_PAGE.md](./EDIT_PAGE.md)** - Layer 1: Server page
- **[FORM_WRAPPER.md](./FORM_WRAPPER.md)** - Layer 2: Client wrapper
- **[COMMON_PATTERNS.md](./COMMON_PATTERNS.md)** - Reusable patterns and examples
- **[OVERVIEW.md](./OVERVIEW.md)** - Understanding the 3-layer architecture
- **[FORMS.md](../FORMS.md)** - Form input styling and FormField usage
- **[PICKERS.md](../PICKERS.md)** - Picker component patterns
