# Form Validation Guide

This document explains how to implement form validation in Outward Sign using React Hook Form + Zod.

## Overview

We use **React Hook Form** (v7.65.0) + **Zod** (v4.1.12) for form validation with a **dual validation pattern**:

1. **Client-side validation** - Automatic via React Hook Form with zodResolver (provides instant feedback)
2. **Server-side validation** - Security boundary using `.parse()` (required, always enforce)

**Why React Hook Form?**
- Automatic form state management (no manual useState for each field)
- Built-in validation with Zod via zodResolver
- Automatic error display
- Better performance (less re-renders)
- Cleaner, more maintainable code

## Installation

The required packages are already installed in this project:

```json
"react-hook-form": "^7.65.0",
"zod": "^4.1.12",
"@hookform/resolvers": "^3.9.1"
```

## Quick Start

To add validation to a module (e.g., presentations, weddings, baptisms):

1. **Create schema file** - `src/lib/schemas/[entity].ts` with Zod schemas
2. **Update server actions** - Import schema and add `.parse()` validation in create/update functions
3. **Update form component** - Replace manual state with `useForm` + `zodResolver`
4. **Test** - Run `npm test -- tests/[entity].spec.ts` to verify validation works

**Reference Implementation:** Presentations module (`src/app/(main)/presentations/`)

## Validation Pattern

### 1. Define Schemas in Shared File

**CRITICAL:** Zod schemas MUST be defined in a separate shared file, NOT in `'use server'` files. Next.js only allows `'use server'` files to export async functions.

**Location:** Create schemas in `lib/schemas/[entity].ts`

**Pattern:**
```typescript
// lib/schemas/presentations.ts
import { z } from 'zod'

// Define the Zod schema
export const createPresentationSchema = z.object({
  presentation_event_id: z.string().uuid().optional().nullable(),
  child_id: z.string().uuid().optional().nullable(),
  mother_id: z.string().uuid().optional().nullable(),
  father_id: z.string().uuid().optional().nullable(),
  coordinator_id: z.string().uuid().optional().nullable(),
  is_baptized: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional().nullable(),
  note: z.string().optional().nullable(),
  presentation_template_id: z.string().optional().nullable(),
})

// Update schema (all fields optional)
export const updatePresentationSchema = createPresentationSchema.partial()

// Export types using z.infer
export type CreatePresentationData = z.infer<typeof createPresentationSchema>
export type UpdatePresentationData = z.infer<typeof updatePresentationSchema>
```

### 2. Use Schema in Server Actions

**Location:** Import schemas in `lib/actions/[entity].ts`

**Pattern:**
```typescript
// lib/actions/presentations.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import {
  createPresentationSchema,
  updatePresentationSchema,
  type CreatePresentationData,
  type UpdatePresentationData
} from '@/lib/schemas/presentations'

// Note: Schemas and types are imported from '@/lib/schemas/presentations'
// They cannot be re-exported from this 'use server' file

// Server action with validation
export async function createPresentation(data: CreatePresentationData): Promise<Presentation> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // REQUIRED: Server-side validation (security boundary)
  const validatedData = createPresentationSchema.parse(data)

  const { data: presentation, error } = await supabase
    .from('presentations')
    .insert([{
      ...validatedData,
      parish_id: selectedParishId
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating presentation:', error)
    throw new Error('Failed to create presentation')
  }

  revalidatePath('/presentations')
  return presentation
}

export async function updatePresentation(id: string, data: UpdatePresentationData): Promise<Presentation> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // REQUIRED: Server-side validation (security boundary)
  const validatedData = updatePresentationSchema.parse(data)

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(validatedData).filter(([_, value]) => value !== undefined)
  )

  const { data: presentation, error } = await supabase
    .from('presentations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating presentation:', error)
    throw new Error('Failed to update presentation')
  }

  revalidatePath('/presentations')
  revalidatePath(`/presentations/${id}`)
  revalidatePath(`/presentations/${id}/edit`)
  return presentation
}
```

### 3. Client-Side Form with React Hook Form

**Location:** Client components (`app/(main)/[entities]/[entity]-form.tsx`)

**Pattern:**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  createPresentation,
  updatePresentation,
  type PresentationWithRelations
} from '@/lib/actions/presentations'
import {
  createPresentationSchema,
  type CreatePresentationData
} from '@/lib/schemas/presentations'
import { FormBottomActions } from '@/components/form-bottom-actions'

interface PresentationFormProps {
  presentation?: PresentationWithRelations
  formId?: string
  onLoadingChange?: (loading: boolean) => void
}

export function PresentationForm({ presentation, formId, onLoadingChange }: PresentationFormProps) {
  const router = useRouter()
  const isEditing = !!presentation

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreatePresentationData>({
    resolver: zodResolver(createPresentationSchema),
    defaultValues: {
      presentation_event_id: presentation?.presentation_event_id || null,
      child_id: presentation?.child_id || null,
      mother_id: presentation?.mother_id || null,
      father_id: presentation?.father_id || null,
      coordinator_id: presentation?.coordinator_id || null,
      is_baptized: presentation?.is_baptized || false,
      status: presentation?.status || "ACTIVE",
      note: presentation?.note || null,
      presentation_template_id: presentation?.presentation_template_id || "presentation-spanish",
    },
  })

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Watch form values for controlled components (pickers, etc.)
  const presentationEventId = watch("presentation_event_id")
  const childId = watch("child_id")
  const status = watch("status")

  // State for picker modals (still need these for UI state)
  const [showPresentationEventPicker, setShowPresentationEventPicker] = useState(false)
  const [showChildPicker, setShowChildPicker] = useState(false)

  // State for selected entities (for display purposes)
  const [presentationEvent, setPresentationEvent] = useState<Event | null>(
    presentation?.presentation_event || null
  )
  const [child, setChild] = useState<Person | null>(presentation?.child || null)

  const onSubmit = async (data: CreatePresentationData) => {
    try {
      if (isEditing) {
        await updatePresentation(presentation.id, data)
        toast.success('Presentation updated successfully')
        router.refresh()
      } else {
        const newPresentation = await createPresentation(data)
        toast.success('Presentation created successfully!')
        router.push(`/presentations/${newPresentation.id}`)
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} presentation:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} presentation. Please try again.`)
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Event Picker */}
      <div>
        <Label>Presentation Event</Label>
        {/* Event picker UI */}
        {errors.presentation_event_id && (
          <p className="text-sm text-destructive mt-1">{errors.presentation_event_id.message}</p>
        )}
      </div>

      {/* Child Picker */}
      <div>
        <Label>Child</Label>
        {/* Child picker UI */}
        {errors.child_id && (
          <p className="text-sm text-destructive mt-1">{errors.child_id.message}</p>
        )}
      </div>

      {/* Status Select */}
      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={status || ""}
          onValueChange={(value) => setValue("status", value as any)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {MODULE_STATUS_VALUES.map((s) => (
              <SelectItem key={s} value={s}>
                {MODULE_STATUS_LABELS[s].en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
      </div>

      {/* Form Buttons */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing ? `/presentations/${presentation.id}` : '/presentations'}
        saveLabel={isEditing ? 'Update Presentation' : 'Save Presentation'}
      />

      {/* Event and People Picker Modals */}
      <EventPicker
        open={showPresentationEventPicker}
        onOpenChange={setShowPresentationEventPicker}
        onSelect={(event) => {
          setPresentationEvent(event)
          setValue("presentation_event_id", event.id)
          setShowPresentationEventPicker(false)
        }}
        selectedEventId={presentationEvent?.id}
        selectedEvent={presentationEvent}
        defaultEventType="PRESENTATION"
        defaultName="Presentation"
        openToNewEvent={!isEditing}
        disableSearch={true}
      />

      <PeoplePicker
        open={showChildPicker}
        onOpenChange={setShowChildPicker}
        onSelect={(person) => {
          setChild(person)
          setValue("child_id", person.id)
          setShowChildPicker(false)
        }}
        showSexField={true}
        openToNewPerson={!isEditing}
      />
    </form>
  )
}
```

**Key Points:**
1. **No manual useState for form fields** - React Hook Form manages all form state
2. **Automatic validation** - zodResolver connects Zod schema to React Hook Form
3. **Automatic error display** - Errors are available in `formState.errors`
4. **Use setValue() to update fields** - For pickers, selects, and programmatic updates
5. **Use watch() to read field values** - For dependent fields or controlled components
6. **Still use useState for UI state** - Modal visibility, selected entities for display
7. **isSubmitting from formState** - Use for loading state instead of manual isLoading

## Common Validation Rules

### String Validation
```typescript
z.string()                                    // Any string
z.string().min(1, 'Required')                 // Non-empty string
z.string().max(100, 'Too long')               // Max length
z.string().email('Invalid email')             // Email format
z.string().url('Invalid URL')                 // URL format
z.string().regex(/pattern/, 'Invalid format') // Custom regex
z.string().optional()                         // Optional field
z.string().nullable()                         // Can be null
z.string().trim()                             // Trim whitespace
```

### Number Validation
```typescript
z.number()                                    // Any number
z.number().int('Must be integer')             // Integer only
z.number().positive('Must be positive')       // > 0
z.number().min(0, 'Must be at least 0')       // Minimum
z.number().max(100, 'Must be at most 100')    // Maximum
z.coerce.number()                             // Convert string to number
```

### Date Validation
```typescript
z.string().date()                             // ISO date string
z.string().datetime()                         // ISO datetime string
z.date()                                      // JavaScript Date object
z.coerce.date()                               // Convert to Date
```

### Enum Validation
```typescript
z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED'])   // One of these values
z.nativeEnum(MyEnum)                          // TypeScript enum
```

### Array Validation
```typescript
z.array(z.string())                           // Array of strings
z.array(z.string()).min(1, 'Required')        // Non-empty array
z.array(z.string()).max(10, 'Too many')       // Max length
```

### Object Validation
```typescript
z.object({
  name: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
  })
})
```

### Conditional Validation
```typescript
z.object({
  type: z.enum(['EMAIL', 'PHONE']),
  contact: z.string(),
}).refine(
  (data) => {
    if (data.type === 'EMAIL') {
      return z.string().email().safeParse(data.contact).success
    }
    return true
  },
  { message: 'Invalid email address', path: ['contact'] }
)
```

## Best Practices

### 1. Always Validate on Server

**❌ WRONG - Only client-side validation:**
```typescript
export async function createEntity(data: CreateEntityData) {
  // No validation - SECURITY RISK!
  const { data: entity, error } = await supabase
    .from('entities')
    .insert([data])
    .select()
    .single()
}
```

**✅ CORRECT - Server-side validation:**
```typescript
export async function createEntity(data: CreateEntityData) {
  // REQUIRED: Validate on server
  const validatedData = createEntitySchema.parse(data)

  const { data: entity, error } = await supabase
    .from('entities')
    .insert([validatedData])
    .select()
    .single()
}
```

### 2. Use .parse() in Server Actions (throws on error)

```typescript
// Throws ZodError if validation fails - good for server actions
const validatedData = schema.parse(data)
```

### 3. Define Schemas in Shared Files

**CRITICAL:** Schemas must be in `lib/schemas/[entity].ts`, NOT in `'use server'` files.

```typescript
// ❌ WRONG - Defining schema in 'use server' file
// lib/actions/presentations.ts
'use server'
export const schema = z.object({...})  // ERROR: Cannot export non-functions

// ✅ CORRECT - Separate schema file
// lib/schemas/presentations.ts
export const createPresentationSchema = z.object({...})
export type CreatePresentationData = z.infer<typeof createPresentationSchema>
```

### 4. Use React Hook Form with zodResolver

```typescript
// ✅ CORRECT - Automatic validation via zodResolver
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPresentationSchema } from '@/lib/schemas/presentations'

const { handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(createPresentationSchema),
  defaultValues: {...}
})

// No manual .safeParse() needed - React Hook Form handles it
```

### 5. Export Schema and Types from Shared Files

```typescript
// lib/schemas/[entity].ts
export const createEntitySchema = z.object({ ... })
export type CreateEntityData = z.infer<typeof createEntitySchema>
```

### 6. Reuse Schemas

```typescript
// Base schema
const baseEntitySchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
})

// Create schema (all fields required)
export const createEntitySchema = baseEntitySchema

// Update schema (all fields optional)
export const updateEntitySchema = baseEntitySchema.partial()
```

## Error Handling

### Server-Side Error Handling

```typescript
export async function createEntity(data: CreateEntityData) {
  try {
    const validatedData = createEntitySchema.parse(data)
    // ... database operation
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Validation error
      console.error('Validation errors:', error.errors)
      throw new Error('Validation failed')
    }
    // Other errors
    throw error
  }
}
```

### Client-Side Error Display

**With React Hook Form, errors are automatically available:**

```typescript
// React Hook Form provides errors automatically
const { formState: { errors } } = useForm({
  resolver: zodResolver(createPresentationSchema)
})

// Display errors in JSX
{errors.child_id && (
  <p className="text-sm text-destructive mt-1">
    {errors.child_id.message}
  </p>
)}
```

**No manual error handling needed!** zodResolver + React Hook Form handles validation and error display automatically.

## Examples from the Codebase

### Reference Implementation: Presentations Module

The presentations module has been fully implemented with React Hook Form + Zod validation.

**Files to reference:**
- **Schema**: `src/lib/schemas/presentations.ts` - Zod schemas and types
- **Server Actions**: `src/lib/actions/presentations.ts` - Server-side validation with `.parse()`
- **Form Component**: `src/app/(main)/presentations/presentation-form.tsx` - React Hook Form with zodResolver

**Key Features:**
- ✅ Schemas in separate shared file
- ✅ Server-side validation with `.parse()`
- ✅ React Hook Form with zodResolver
- ✅ Automatic error display
- ✅ Clean form state management
- ✅ Tests passing

### Modules Still to Migrate

The following modules still use the old pattern without validation:
- Weddings (`src/app/(main)/weddings/`)
- Funerals (`src/app/(main)/funerals/`)
- Baptisms (`src/app/(main)/baptisms/`)
- Quinceañeras (`src/app/(main)/quinceaneras/`)

**Migration Instructions:** See the "Migration Strategy" section below.

## Migration Strategy

To migrate an existing module to use React Hook Form + Zod validation:

### Step 1: Create Schema File

Create `src/lib/schemas/[entity].ts`:

```typescript
import { z } from 'zod'

export const create[Entity]Schema = z.object({
  // Define your fields with validation rules
  field_id: z.string().uuid().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional().nullable(),
  note: z.string().optional().nullable(),
})

export const update[Entity]Schema = create[Entity]Schema.partial()

export type Create[Entity]Data = z.infer<typeof create[Entity]Schema>
export type Update[Entity]Data = z.infer<typeof update[Entity]Schema>
```

### Step 2: Update Server Actions

In `src/lib/actions/[entity].ts`:

```typescript
'use server'

import {
  create[Entity]Schema,
  update[Entity]Schema,
  type Create[Entity]Data,
  type Update[Entity]Data
} from '@/lib/schemas/[entity]'

// Note: Schemas and types are imported from '@/lib/schemas/[entity]'
// They cannot be re-exported from this 'use server' file

export async function create[Entity](data: Create[Entity]Data): Promise<[Entity]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // REQUIRED: Server-side validation
  const validatedData = create[Entity]Schema.parse(data)

  const { data: entity, error } = await supabase
    .from('[entities]')
    .insert([{ ...validatedData, parish_id: selectedParishId }])
    .select()
    .single()

  if (error) {
    console.error('Error creating [entity]:', error)
    throw new Error('Failed to create [entity]')
  }

  revalidatePath('/[entities]')
  return entity
}

export async function update[Entity](id: string, data: Update[Entity]Data): Promise<[Entity]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // REQUIRED: Server-side validation
  const validatedData = update[Entity]Schema.parse(data)

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(validatedData).filter(([_, value]) => value !== undefined)
  )

  const { data: entity, error } = await supabase
    .from('[entities]')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating [entity]:', error)
    throw new Error('Failed to update [entity]')
  }

  revalidatePath('/[entities]')
  revalidatePath(`/[entities]/${id}`)
  revalidatePath(`/[entities]/${id}/edit`)
  return entity
}
```

### Step 3: Update Form Component

In `src/app/(main)/[entities]/[entity]-form.tsx`:

**Replace:**
- Manual `useState` for form fields → `useForm` with zodResolver
- Manual error state → `formState.errors`
- Manual submit handler validation → `handleSubmit(onSubmit)`
- Manual loading state → `formState.isSubmitting`

**Example transformation:**

```typescript
// BEFORE (old pattern)
const [childId, setChildId] = useState<string | null>(null)
const [status, setStatus] = useState<string>("ACTIVE")
const [errors, setErrors] = useState<Record<string, string>>({})
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  // Manual validation with .safeParse()...
}

// AFTER (React Hook Form)
const {
  handleSubmit,
  formState: { errors, isSubmitting },
  setValue,
  watch,
} = useForm<Create[Entity]Data>({
  resolver: zodResolver(create[Entity]Schema),
  defaultValues: {
    child_id: [entity]?.child_id || null,
    status: [entity]?.status || "ACTIVE",
  },
})

const onSubmit = async (data: Create[Entity]Data) => {
  // Data is already validated!
  await create[Entity](data)
}
```

### Step 4: Test

Run tests for the module:

```bash
npm test -- tests/[entity].spec.ts
```

Ensure:
- ✅ Form submission works (create and edit)
- ✅ Validation errors display correctly
- ✅ Server-side validation prevents invalid data
- ✅ All existing tests pass

### Step 5: Document and Share

Once testing is complete, the pattern can be rolled out to other modules following the same steps.

## Resources

- [Zod Documentation](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [React Hook Form + Zod Integration](https://react-hook-form.com/get-started#SchemaValidation)
- [@hookform/resolvers Documentation](https://github.com/react-hook-form/resolvers)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

## Summary

### Key Principles

- ✅ **Always validate on server** with `.parse()` (security boundary)
- ✅ **Use React Hook Form + zodResolver on client** (automatic validation + better UX)
- ✅ **Define schemas in shared files** (`lib/schemas/[entity].ts`, NOT in 'use server' files)
- ✅ **Export types with `z.infer<typeof schema>`**
- ✅ **Use `.partial()` for update schemas**
- ✅ **No manual state management** - Let React Hook Form handle form state
- ✅ **No manual error handling** - zodResolver provides automatic error display

### Benefits of This Approach

1. **Type Safety** - Zod schemas provide runtime validation and TypeScript types
2. **Automatic Validation** - No manual `.safeParse()` calls needed on client
3. **Automatic Error Display** - Errors available via `formState.errors`
4. **Cleaner Code** - Less boilerplate, no manual useState for form fields
5. **Better Performance** - React Hook Form optimizes re-renders
6. **Security** - Server-side validation always enforced

### Reference Implementation

See **presentations module** for complete working example:
- `src/lib/schemas/presentations.ts`
- `src/lib/actions/presentations.ts`
- `src/app/(main)/presentations/presentation-form.tsx`
