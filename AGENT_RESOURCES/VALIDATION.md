# Validation Guide

This document explains validation patterns and requirements in Outward Sign, including FormField usage, module form validation, and picker component validation.

## Table of Contents

1. [FormField Component (CRITICAL)](#1-formfield-component-critical)
2. [Module Form Validation](#2-module-form-validation)
3. [Picker Component Validation](#3-picker-component-validation)

---

## 1. FormField Component (CRITICAL)

**ALL form inputs, selects, and textareas MUST use the `FormField` component.** This is a non-negotiable requirement for consistency across the application.

### What is FormField?

FormField is a wrapper component (`src/components/form-field.tsx`) that provides:
- Consistent label styling and positioning
- Optional description text for field guidance
- Proper layout spacing
- Standardized error display
- Support for Input, Textarea, and Select components

### Required Usage Pattern

```tsx
import { FormField } from '@/components/form-field'

// Basic text input
<FormField
  id="first-name"
  label="First Name"
  description="Enter the person's legal first name"
  value={firstName}
  onChange={setFirstName}
  required={true}
/>

// Textarea
<FormField
  id="notes"
  label="Notes"
  inputType="textarea"
  value={notes}
  onChange={setNotes}
  rows={12}
  resize={true}
/>

// Select with options array
<FormField
  id="status"
  label="Status"
  inputType="select"
  value={status}
  onChange={setStatus}
  options={[
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'ARCHIVED', label: 'Archived' }
  ]}
/>

// Select with children
<FormField
  id="status"
  label="Status"
  inputType="select"
  value={status}
  onChange={setStatus}
>
  <SelectItem value="ACTIVE">Active</SelectItem>
  <SelectItem value="INACTIVE">Inactive</SelectItem>
</FormField>

// Number input
<FormField
  id="age"
  label="Age"
  inputType="number"
  value={age}
  onChange={setAge}
  min="0"
  max="120"
/>

// Date input
<FormField
  id="birth-date"
  label="Date of Birth"
  inputType="date"
  value={birthDate}
  onChange={setBirthDate}
/>
```

### ❌ PROHIBITED Patterns

**NEVER use bare Input, Select, or Textarea components directly:**

```tsx
// ❌ WRONG - Manual label + bare Input
<Label htmlFor="name">Name</Label>
<Input id="name" value={name} onChange={(e) => setName(e.target.value)} />

// ❌ WRONG - Bare Select without FormField
<Label>Status</Label>
<Select value={status} onValueChange={setStatus}>
  <SelectTrigger>
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="ACTIVE">Active</SelectItem>
  </SelectContent>
</Select>

// ❌ WRONG - Bare Textarea
<Label>Notes</Label>
<Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
```

### Exceptions

The following are the ONLY cases where you should NOT use FormField:

1. **Picker Components** - PeoplePicker, EventPicker, ReadingPickerModal have their own internal structure
2. **Special UI patterns** - Explicitly approved by the user for specific cases
3. **Custom compound components** - Where FormField's structure doesn't fit (e.g., search bars, filters)

**IMPORTANT:** If you encounter a situation where FormField cannot be used, **ALWAYS ask the user before proceeding** with an alternative approach.

### FormField Props Reference

```typescript
interface BaseFormFieldProps {
  id: string                    // Required: HTML id for the input
  label: string                 // Required: Label text
  description?: string          // Optional: Help text below label
  required?: boolean            // Optional: Shows required indicator
  className?: string            // Optional: Additional classes for wrapper
  formFieldClassName?: string   // Optional: Classes for form field container
}

interface InputFieldProps extends BaseFormFieldProps {
  inputType?: string            // 'text', 'email', 'number', 'date', etc.
  value: string                 // Current value
  onChange: (value: string) => void  // Change handler
  placeholder?: string
  min?: string                  // For number/date inputs
  max?: string                  // For number/date inputs
  step?: string                 // For number inputs
  maxLength?: number            // Max character length
}

interface TextareaFieldProps extends BaseFormFieldProps {
  inputType: 'textarea'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number                 // Number of rows (default: 12)
  resize?: boolean              // Allow vertical resize (default: false)
}

interface SelectFieldProps extends BaseFormFieldProps {
  inputType: 'select'
  value: string
  onChange: (value: string) => void
  children?: React.ReactNode    // SelectItem children
  options?: Array<{value: string; label: string}>  // Or use options array
}
```

### Integration with React Hook Form

When using React Hook Form with FormField:

```tsx
const { watch, setValue, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { firstName: '', status: 'ACTIVE' }
})

const firstName = watch('firstName')
const status = watch('status')

return (
  <form>
    <FormField
      id="first-name"
      label="First Name"
      value={firstName}
      onChange={(value) => setValue('firstName', value)}
      required
    />

    <FormField
      id="status"
      label="Status"
      inputType="select"
      value={status}
      onChange={(value) => setValue('status', value)}
      options={statusOptions}
    />
  </form>
)
```

---

## 2. Module Form Validation

This section explains how to implement form validation for module forms (weddings, funerals, presentations, baptisms, etc.) using React Hook Form + Zod.

### Overview

We use **React Hook Form** (v7.65.0) + **Zod** (v4.1.12) for form validation with a **dual validation pattern**:

1. **Client-side validation** - Automatic via React Hook Form with zodResolver (provides instant feedback)
2. **Server-side validation** - Security boundary using `.parse()` (required, always enforce)

**Why React Hook Form?**
- Automatic form state management (no manual useState for each field)
- Built-in validation with Zod via zodResolver
- Automatic error display
- Better performance (less re-renders)
- Cleaner, more maintainable code

### Installation

The required packages are already installed in this project:

```json
"react-hook-form": "^7.65.0",
"zod": "^4.1.12",
"@hookform/resolvers": "^3.9.1"
```

### Quick Start

To add validation to a module (e.g., presentations, weddings, baptisms):

1. **Create schema file** - `src/lib/schemas/[entity].ts` with Zod schemas
2. **Update server actions** - Import schema and add `.parse()` validation in create/update functions
3. **Update form component** - Replace manual state with `useForm` + `zodResolver`
4. **Test** - Run `npm test -- tests/[entity].spec.ts` to verify validation works

**Reference Implementation:** Presentations module (`src/app/(main)/presentations/`)

### Validation Pattern

#### Step 1: Define Schemas in Shared File

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

#### Step 2: Use Schema in Server Actions

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
```

#### Step 3: Client-Side Form with React Hook Form

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
import { FormField } from '@/components/form-field'

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
      status: presentation?.status || "ACTIVE",
      note: presentation?.note || null,
    },
  })

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isSubmitting)
  }, [isSubmitting, onLoadingChange])

  // Watch form values for controlled components
  const status = watch("status")
  const note = watch("note")

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
      {/* Status Select - Using FormField */}
      <FormField
        id="status"
        label="Status"
        inputType="select"
        value={status || "ACTIVE"}
        onChange={(value) => setValue("status", value as any)}
        options={[
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' },
          { value: 'ARCHIVED', label: 'Archived' }
        ]}
      />

      {/* Notes Textarea - Using FormField */}
      <FormField
        id="note"
        label="Notes"
        description="Additional information about this presentation"
        inputType="textarea"
        value={note || ""}
        onChange={(value) => setValue("note", value)}
        rows={12}
      />

      {/* Form Buttons */}
      <FormBottomActions
        isEditing={isEditing}
        isLoading={isSubmitting}
        cancelHref={isEditing ? `/presentations/${presentation.id}` : '/presentations'}
        saveLabel={isEditing ? 'Update Presentation' : 'Save Presentation'}
      />
    </form>
  )
}
```

**Key Points:**
1. **No manual useState for form fields** - React Hook Form manages all form state
2. **Automatic validation** - zodResolver connects Zod schema to React Hook Form
3. **Use setValue() to update fields** - For FormField components
4. **Use watch() to read field values** - For controlled components
5. **Still use useState for UI state** - Modal visibility, selected entities for display
6. **isSubmitting from formState** - Use for loading state instead of manual isLoading

### Common Validation Rules

#### String Validation
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

#### Number Validation
```typescript
z.number()                                    // Any number
z.number().int('Must be integer')             // Integer only
z.number().positive('Must be positive')       // > 0
z.number().min(0, 'Must be at least 0')       // Minimum
z.number().max(100, 'Must be at most 100')    // Maximum
z.coerce.number()                             // Convert string to number
```

#### Date Validation
```typescript
z.string().date()                             // ISO date string
z.string().datetime()                         // ISO datetime string
z.date()                                      // JavaScript Date object
z.coerce.date()                               // Convert to Date
```

#### Enum Validation
```typescript
z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED'])   // One of these values
z.nativeEnum(MyEnum)                          // TypeScript enum
```

#### Array Validation
```typescript
z.array(z.string())                           // Array of strings
z.array(z.string()).min(1, 'Required')        // Non-empty array
z.array(z.string()).max(10, 'Too many')       // Max length
```

### Best Practices

#### 1. Always Validate on Server

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

#### 2. Use .parse() in Server Actions (throws on error)

```typescript
// Throws ZodError if validation fails - good for server actions
const validatedData = schema.parse(data)
```

#### 3. Define Schemas in Shared Files

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

#### 4. Use React Hook Form with zodResolver

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

### Reference Implementation

The presentations module has been fully implemented with React Hook Form + Zod validation.

**Files to reference:**
- **Schema**: `src/lib/schemas/presentations.ts` - Zod schemas and types
- **Server Actions**: `src/lib/actions/presentations.ts` - Server-side validation with `.parse()`
- **Form Component**: `src/app/(main)/presentations/presentation-form.tsx` - React Hook Form with zodResolver

---

## 3. Picker Component Validation

This section explains how to implement validation in picker components (PeoplePicker, EventPicker, LocationPicker, etc.) using React Hook Form + Zod for inline "Add New" forms.

### Overview

Picker components that include inline "Add New" forms should use **React Hook Form + Zod** for validation:

- **Client-side validation** - Automatic via React Hook Form with zodResolver
- **Visual error indicators** - Red borders and error messages below invalid fields
- **Standardized UI** - Use FormField component for consistent styling

### Validation Pattern

#### Step 1: Define Zod Schema

At the top of the picker component file, define a Zod schema for the inline form:

```typescript
import { z } from 'zod'

// Zod schema for inline "Add New" form
const newPersonSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().optional(),
  phone_number: z.string().optional(),
  note: z.string().optional(),
})

type NewPersonFormData = z.infer<typeof newPersonSchema>
```

#### Step 2: Initialize React Hook Form

Replace manual state management with React Hook Form:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Inside component
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  setValue,
  watch,
  reset,
} = useForm<NewPersonFormData>({
  resolver: zodResolver(newPersonSchema),
  defaultValues: {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    note: '',
  },
})
```

#### Step 3: Update Submit Handler

```typescript
const onSubmitNewPerson = async (data: NewPersonFormData) => {
  try {
    const newPerson = await createPerson({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || undefined,
      phone_number: data.phone_number || undefined,
      note: data.note || undefined
    })

    toast.success('Person created successfully')

    // Reset form and close
    reset()
    setShowAddForm(false)

    // Auto-select newly created entity
    handlePersonSelect(newPerson)
  } catch (error) {
    console.error('Error creating person:', error)
    toast.error('Failed to add person')
  }
}
```

#### Step 4: Use FormField Component for Form Fields

The `FormField` component now supports validation errors. Use it for all form fields:

```typescript
<FormField
  id="first_name"
  label="First Name"
  inputType="text"
  value={watch('first_name')}
  onChange={(value) => setValue('first_name', value)}
  placeholder="John"
  required
  error={errors.first_name?.message}
/>

<FormField
  id="last_name"
  label="Last Name"
  inputType="text"
  value={watch('last_name')}
  onChange={(value) => setValue('last_name', value)}
  placeholder="Doe"
  required
  error={errors.last_name?.message}
/>

<FormField
  id="email"
  label="Email"
  inputType="email"
  value={watch('email')}
  onChange={(value) => setValue('email', value)}
  placeholder="john.doe@example.com"
/>
```

**Key Points:**
- Pass `error={errors.field_name?.message}` to show validation errors
- FormField automatically adds red border and displays error message
- Use `watch()` to get current field values
- Use `setValue()` to update field values
- Mark required fields with `required` prop

#### Step 5: Update Form Element

Replace manual form submission with `handleSubmit`:

```typescript
<form onSubmit={handleSubmit(onSubmitNewPerson)} className="space-y-4">
  {/* FormField components */}

  <DialogFooter>
    <Button
      type="button"
      variant="outline"
      onClick={handleCancelAddForm}
      disabled={isSubmitting}
    >
      Cancel
    </Button>
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Saving...
        </>
      ) : (
        <>
          <Save className="h-4 w-4 mr-2" />
          Save
        </>
      )}
    </Button>
  </DialogFooter>
</form>
```

### FormField Error Display

When an `error` prop is provided:
- Input shows red border (`border-red-500`)
- Error message displays below input in red text
- Accessible via `aria-describedby` for screen readers

### Validation Rules for Pickers

#### Common Field Validations

```typescript
// Required text field
field_name: z.string().min(1, 'Field name is required')

// Optional text field
field_name: z.string().optional()

// Email (optional)
email: z.string().email('Invalid email address').optional()

// Email (required)
email: z.string().min(1, 'Email is required').email('Invalid email address')

// URL (optional)
url: z.string().url('Invalid URL').optional()

// Phone (optional, no format validation)
phone: z.string().optional()

// Enum (optional)
status: z.enum(['ACTIVE', 'INACTIVE']).optional()

// Number (required)
capacity: z.number().min(1, 'Capacity must be at least 1')

// UUID (optional)
event_id: z.string().uuid('Invalid ID').optional().nullable()
```

### Picker Components Status

#### PeoplePicker ✅
- **Status**: Completed
- **Required fields**: first_name, last_name
- **File**: `src/components/people-picker.tsx`

#### EventPicker
- **Status**: Pending
- **Required fields**: name, start_date, event_type
- **File**: `src/components/event-picker.tsx`

#### LocationPicker
- **Status**: Pending
- **Required fields**: name
- **File**: `src/components/location-picker.tsx`

#### ReadingPickerModal
- **Status**: Pending
- **Required fields**: pericope, text
- **File**: `src/components/reading-picker-modal.tsx`

### Best Practices for Pickers

#### 1. Always Define Schema at Component Level

Define the Zod schema at the top of the component file (not in a separate schema file) since picker forms are component-specific:

```typescript
// ✅ CORRECT - Define at component level
const newPersonSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  // ...
})
```

#### 2. Use FormField for All Text Inputs

Use the standardized FormField component instead of raw Input components:

```typescript
// ❌ WRONG - Manual input with inline error handling
<Input
  {...register('first_name')}
  className={cn(errors.first_name && "border-red-500")}
/>
{errors.first_name && <p className="text-sm text-red-500">{errors.first_name.message}</p>}

// ✅ CORRECT - Use FormField
<FormField
  id="first_name"
  label="First Name"
  value={watch('first_name')}
  onChange={(value) => setValue('first_name', value)}
  error={errors.first_name?.message}
  required
/>
```

#### 3. Reset Form on Cancel

Always reset the form when canceling:

```typescript
const handleCancelAddForm = () => {
  setShowAddForm(false)
  reset()  // Clear form state and errors
}
```

#### 4. Auto-select After Creation

After creating a new entity, automatically select it:

```typescript
const onSubmitNew = async (data: FormData) => {
  const newEntity = await createEntity(data)
  toast.success('Created successfully')

  reset()
  setShowAddForm(false)

  // Auto-select the new entity (closes picker)
  handleEntitySelect(newEntity)
}
```

#### 5. Use isSubmitting for Loading State

Use React Hook Form's `isSubmitting` instead of manual loading state:

```typescript
// ❌ WRONG - Manual loading state
const [isLoading, setIsLoading] = useState(false)

// ✅ CORRECT - Use isSubmitting from formState
const { formState: { isSubmitting } } = useForm(...)

<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

### Migration Checklist

When updating a picker component to use validation:

- [ ] Add React Hook Form and Zod imports
- [ ] Define Zod schema for the inline form
- [ ] Replace `useState` form state with `useForm`
- [ ] Update submit handler to use `handleSubmit(onSubmit)`
- [ ] Replace manual Input components with FormField
- [ ] Add `error` prop to FormField for validation errors
- [ ] Use `isSubmitting` for loading state
- [ ] Test: Submit empty form → Should show red borders and error messages
- [ ] Test: Submit valid form → Should create entity and auto-select it
- [ ] Test: Cancel → Should reset form and close dialog

### Reference Implementation

See `src/components/people-picker.tsx` for the complete reference implementation.

**Key features:**
- ✅ Zod schema with required first_name and last_name
- ✅ React Hook Form integration
- ✅ FormField components with error display
- ✅ Red borders on validation errors
- ✅ Auto-select newly created person
- ✅ Form reset on cancel

---

## Resources

- [Zod Documentation](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [React Hook Form + Zod Integration](https://react-hook-form.com/get-started#SchemaValidation)
- [@hookform/resolvers Documentation](https://github.com/react-hook-form/resolvers)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

## Summary

### Key Principles

1. **FormField Component (CRITICAL)**
   - ✅ **ALWAYS use FormField** for all inputs, selects, and textareas
   - ❌ **NEVER use bare** Input, Select, or Textarea components
   - ⚠️ **Ask user first** if FormField cannot be used

2. **Module Form Validation**
   - ✅ **Always validate on server** with `.parse()` (security boundary)
   - ✅ **Use React Hook Form + zodResolver on client** (automatic validation + better UX)
   - ✅ **Define schemas in shared files** (`lib/schemas/[entity].ts`, NOT in 'use server' files)
   - ✅ **Export types with `z.infer<typeof schema>`**
   - ✅ **Use `.partial()` for update schemas**

3. **Picker Component Validation**
   - ✅ **Define schemas at component level** (not in separate files)
   - ✅ **Use FormField with error prop** for consistent error display
   - ✅ **Auto-select newly created entities**
   - ✅ **Reset form on cancel**
   - ✅ **Use isSubmitting for loading state**

### Benefits

1. **Consistency** - FormField ensures uniform styling and behavior
2. **Type Safety** - Zod schemas provide runtime validation and TypeScript types
3. **Automatic Validation** - No manual `.safeParse()` calls needed
4. **Better UX** - Instant feedback with clear error messages
5. **Cleaner Code** - Less boilerplate, no manual useState for form fields
6. **Security** - Server-side validation always enforced
