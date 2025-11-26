# React Hook Form Migration Guide

This guide provides step-by-step instructions for migrating forms from simple state management (useState) to React Hook Form with Zod validation.

## Table of Contents

- [Why Migrate to React Hook Form](#why-migrate-to-react-hook-form)
- [Prerequisites](#prerequisites)
- [Migration Steps](#migration-steps)
- [Complete Example](#complete-example)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Why Migrate to React Hook Form

**Benefits:**
- ✅ **Better validation UX** - Visual error messages and rings on invalid fields
- ✅ **Type safety** - Zod schemas ensure data shape matches expectations
- ✅ **Consistency** - All forms use the same pattern
- ✅ **Less boilerplate** - React Hook Form manages form state automatically
- ✅ **No HTML5 validation conflicts** - Complete control over validation

**What NOT to do:**
- ❌ **Do not use HTML5 `required` attribute** - It triggers browser validation before React Hook Form can validate
- ❌ **Do not mix validation methods** - Use only Zod validation, not manual validation or HTML5

---

## Prerequisites

**Required packages** (already installed):
```json
{
  "react-hook-form": "^7.x.x",
  "@hookform/resolvers": "^3.x.x",
  "zod": "^3.x.x"
}
```

**Required understanding:**
- FormInput component API (see [FORMS.md](./FORMS.md))
- Zod validation schema syntax (see [VALIDATION.md](./VALIDATION.md))

---

## Migration Steps

### Step 1: Identify Current Form Pattern

**Before migration**, the form typically looks like this:

```tsx
// OLD PATTERN - DO NOT USE
export default function MyForm({ entity }: MyFormProps) {
  const [formData, setFormData] = useState({
    name: entity?.name || '',
    description: entity?.description || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Manual validation or relying on HTML5 validation
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }
    // ... save logic
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormInput
        id="name"
        label="Name"
        value={formData.name}
        onChange={(value) => setFormData({ ...formData, name: value })}
        required  // ❌ TRIGGERS HTML5 VALIDATION
      />
    </form>
  )
}
```

### Step 2: Add React Hook Form Imports

Add these imports at the top of the file:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
```

### Step 3: Create Zod Validation Schema

Define your schema **before** the component:

```tsx
// Validation schema
const myFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  age: z.number().min(0, 'Age must be positive').optional(),
})

type MyFormValues = z.infer<typeof myFormSchema>
```

**Common Zod patterns:**

| Field Type | Zod Schema | Notes |
|------------|------------|-------|
| Required text | `z.string().min(1, 'Field is required')` | Empty string fails validation |
| Optional text | `z.string().optional()` | Can be undefined or empty |
| Email | `z.string().email('Invalid email')` | Validates email format |
| Number | `z.number().min(0, 'Must be positive')` | Use `z.coerce.number()` for string inputs |
| Boolean | `z.boolean()` | For checkboxes |
| Enum/Select | `z.enum(['option1', 'option2'])` | For dropdowns |
| ID (optional) | `z.string().optional()` | For foreign keys |

### Step 4: Replace useState with useForm

**Remove:**
```tsx
const [formData, setFormData] = useState({ ... })
const [loading, setLoading] = useState(false)
```

**Add:**
```tsx
const [loading, setLoading] = useState(false) // Keep loading state
const form = useForm<MyFormValues>({
  resolver: zodResolver(myFormSchema),
  defaultValues: {
    name: entity?.name || '',
    description: entity?.description || '',
  },
})
```

**Important:**
- Keep separate loading state (`useState`) for submit button
- `defaultValues` must include ALL fields from schema
- Use empty string `''` for text fields, not `undefined`

### Step 5: Update Form Submission Handler

**Replace:**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  // Manual validation
  if (!formData.name.trim()) {
    toast.error('Name is required')
    setLoading(false)
    return
  }
  // Save logic using formData
}
```

**With:**
```tsx
const onSubmit = async (data: MyFormValues) => {
  setLoading(true)
  try {
    // Data is already validated by Zod
    await saveMyEntity(data)
    toast.success('Saved successfully')
    router.push('/my-entities')
  } catch (error) {
    console.error('Error saving:', error)
    toast.error('Failed to save')
  } finally {
    setLoading(false)
  }
}
```

**Key changes:**
- No `e.preventDefault()` - React Hook Form handles this
- No manual validation - Zod validates before calling `onSubmit`
- Parameter is `data` not `e: React.FormEvent`
- Data is typed as `MyFormValues`

### Step 6: Update Form Element

**Replace:**
```tsx
<form onSubmit={handleSubmit} className="space-y-6">
```

**With:**
```tsx
<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
```

### Step 7: Update FormInput Components

**For each FormInput field**, make these changes:

**Before:**
```tsx
<FormInput
  id="name"
  label="Name"
  value={formData.name}
  onChange={(value) => setFormData({ ...formData, name: value })}
  required  // ❌ DO NOT USE - triggers HTML5 validation
/>
```

**After:**
```tsx
<FormInput
  id="name"
  label="Name"
  value={form.watch('name')}
  onChange={(value) => form.setValue('name', value)}
  required  // ✅ OK - Shows asterisk only, no HTML5 validation
  error={form.formState.errors.name?.message}
/>
```

**Key changes:**
- `value={form.watch('fieldName')}` - Watch the field value
- `onChange={(value) => form.setValue('fieldName', value)}` - Update the field
- `required` prop is OK now (shows asterisk, no HTML5 validation)
- Add `error={form.formState.errors.fieldName?.message}` - Shows validation error

**For select fields:**
```tsx
<FormInput
  id="status"
  label="Status"
  inputType="select"
  value={form.watch('status') || ''}  // Add || '' for optional fields
  onChange={(value) => form.setValue('status', value)}
  options={STATUS_VALUES.map(s => ({ value: s, label: STATUS_LABELS[s].en }))}
  error={form.formState.errors.status?.message}
/>
```

**For textarea fields:**
```tsx
<FormInput
  id="description"
  label="Description"
  inputType="textarea"
  value={form.watch('description') || ''}  // Add || '' for optional fields
  onChange={(value) => form.setValue('description', value)}
  rows={4}
  error={form.formState.errors.description?.message}
/>
```

### Step 8: Update Pickers (PersonPicker, EventPicker, etc.)

**Before:**
```tsx
const [presider, setPresider] = useState<Person | null>(entity?.presider || null)

<PersonPickerField
  label="Presider"
  value={presider}
  onValueChange={setPresider}
  // ...
/>
```

**After:**
```tsx
// Use usePickerState hook
const presider = usePickerState<Person>(entity?.presider)

<PersonPickerField
  label="Presider"
  value={presider.value}
  onValueChange={presider.setValue}
  // ...
/>

// In onSubmit, use:
presider_id: presider.value?.id
```

**Important:**
- Pickers manage their own state with `usePickerState`
- Do NOT put picker values in React Hook Form state
- Only put the ID in the Zod schema: `presider_id: z.string().optional()`

---

## Complete Example

Here's a complete before/after example:

### Before (Old Pattern)

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormInput } from '@/components/form-input'
import { toast } from 'sonner'
import { createPetitionTemplate, updatePetitionTemplate } from '@/lib/actions/petition-templates'

export default function PetitionTemplateForm({ template }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: template?.title || '',
    context: template?.context || '',
    language: template?.language || 'en'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Manual validation
    if (!formData.title.trim()) {
      toast.error('Title is required')
      setLoading(false)
      return
    }

    try {
      if (template) {
        await updatePetitionTemplate({ id: template.id, ...formData })
      } else {
        await createPetitionTemplate(formData)
      }
      toast.success('Saved successfully')
      router.push('/settings/petitions')
    } catch (error) {
      toast.error('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput
        id="title"
        label="Title"
        value={formData.title}
        onChange={(value) => setFormData({ ...formData, title: value })}
        required  // ❌ Triggers HTML5 validation
      />

      <FormInput
        id="context"
        label="Template Text"
        inputType="textarea"
        value={formData.context}
        onChange={(value) => setFormData({ ...formData, context: value })}
        required  // ❌ Triggers HTML5 validation
        rows={10}
      />

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
```

### After (React Hook Form)

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormInput } from '@/components/form-input'
import { toast } from 'sonner'
import { createPetitionTemplate, updatePetitionTemplate } from '@/lib/actions/petition-templates'

// Validation schema
const petitionTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  context: z.string().min(1, 'Template text is required'),
  language: z.string().min(1, 'Language is required'),
})

type PetitionTemplateFormValues = z.infer<typeof petitionTemplateSchema>

export default function PetitionTemplateForm({ template }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Initialize form with React Hook Form
  const form = useForm<PetitionTemplateFormValues>({
    resolver: zodResolver(petitionTemplateSchema),
    defaultValues: {
      title: template?.title || '',
      context: template?.context || '',
      language: template?.language || 'en',
    },
  })

  const onSubmit = async (data: PetitionTemplateFormValues) => {
    setLoading(true)

    try {
      if (template) {
        await updatePetitionTemplate({ id: template.id, ...data })
      } else {
        await createPetitionTemplate(data)
      }
      toast.success('Saved successfully')
      router.push('/settings/petitions')
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormInput
        id="title"
        label="Title"
        value={form.watch('title')}
        onChange={(value) => form.setValue('title', value)}
        required  // ✅ Shows asterisk only
        error={form.formState.errors.title?.message}
      />

      <FormInput
        id="context"
        label="Template Text"
        inputType="textarea"
        value={form.watch('context')}
        onChange={(value) => form.setValue('context', value)}
        required  // ✅ Shows asterisk only
        rows={10}
        error={form.formState.errors.context?.message}
      />

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
```

---

## Common Patterns

### Pattern 1: Optional Fields

For optional fields that might be undefined, use `|| ''` to prevent controlled/uncontrolled component warnings:

```tsx
<FormInput
  id="description"
  label="Description"
  value={form.watch('description') || ''}
  onChange={(value) => form.setValue('description', value)}
  error={form.formState.errors.description?.message}
/>
```

### Pattern 2: Checkbox Fields

```tsx
// Schema
const schema = z.object({
  isActive: z.boolean(),
})

// Component
<FormInput
  id="isActive"
  label="Active"
  inputType="checkbox"
  value={form.watch('isActive')}
  onChange={(value) => form.setValue('isActive', value)}
  error={form.formState.errors.isActive?.message}
/>
```

### Pattern 3: Loading Default Data Dynamically

If you need to load default values after the component mounts:

```tsx
useEffect(() => {
  if (entity) {
    form.reset({
      name: entity.name,
      description: entity.description,
      // ... all fields
    })
  }
}, [entity, form])
```

### Pattern 4: Manual Validation Trigger

To manually trigger validation (rare):

```tsx
const handleCustomAction = async () => {
  const isValid = await form.trigger() // Validates all fields
  if (!isValid) {
    toast.error('Please fix validation errors')
    return
  }
  // ... proceed with action
}
```

### Pattern 5: Accessing Values Without Watching

To get a value without subscribing to changes:

```tsx
const handleLoadDefaults = () => {
  const currentLanguage = form.getValues('language')
  // Use currentLanguage without re-rendering
}
```

### Pattern 6: Complex Forms with Many Fields

For forms with 10+ fields, use a custom hook:

```tsx
function useMyFormState(entity) {
  return useForm<MyFormValues>({
    resolver: zodResolver(myFormSchema),
    defaultValues: {
      field1: entity?.field1 || '',
      field2: entity?.field2 || '',
      // ... 20 more fields
    },
  })
}

// In component
const form = useMyFormState(entity)
```

---

## Troubleshooting

### Error: "A component is changing an uncontrolled input to be controlled"

**Cause:** Field value is `undefined` instead of empty string

**Fix:** Use `|| ''` for optional fields:
```tsx
value={form.watch('optionalField') || ''}
```

### Error: "handleSubmit is not a function"

**Cause:** Using old `handleSubmit` function name instead of `form.handleSubmit`

**Fix:**
```tsx
// ❌ Wrong
<form onSubmit={handleSubmit}>

// ✅ Correct
<form onSubmit={form.handleSubmit(onSubmit)}>
```

### HTML5 validation still triggering

**Cause:** FormInput component was passing `required={required}` to HTML elements

**Fix:** Already fixed in `src/components/form-input.tsx` - the `required` prop now only shows an asterisk, it doesn't add the HTML `required` attribute

### Validation not working

**Check these:**
1. ✅ Schema includes all fields
2. ✅ Field names match between schema and `form.watch('fieldName')`
3. ✅ `error` prop is passed to FormInput
4. ✅ `zodResolver` is used in `useForm`

### Form doesn't submit

**Check:**
1. ✅ Form has `onSubmit={form.handleSubmit(onSubmit)}`
2. ✅ Submit button is `type="submit"`
3. ✅ No JavaScript errors in console
4. ✅ Validation errors are displayed (form won't submit if validation fails)

### Values not updating

**Cause:** Using `value={formData.field}` instead of `value={form.watch('field')}`

**Fix:** Update all FormInput components to use `form.watch()` and `form.setValue()`

---

## Migration Checklist

Use this checklist when migrating a form:

- [ ] Add React Hook Form imports (`useForm`, `zodResolver`, `z`)
- [ ] Create Zod validation schema
- [ ] Create TypeScript type from schema (`z.infer`)
- [ ] Replace `useState` with `useForm`
- [ ] Set `defaultValues` for all fields
- [ ] Rename `handleSubmit` to `onSubmit`
- [ ] Update function signature: `(e: React.FormEvent)` → `(data: FormValues)`
- [ ] Remove manual validation logic
- [ ] Update form element: `onSubmit={form.handleSubmit(onSubmit)}`
- [ ] Update all FormInput fields:
  - [ ] `value={form.watch('field')}`
  - [ ] `onChange={(value) => form.setValue('field', value)}`
  - [ ] Add `error={form.formState.errors.field?.message}`
  - [ ] Keep `required` prop for visual asterisk
- [ ] Test form submission
- [ ] Test validation errors display correctly
- [ ] Test error ring appears on invalid fields
- [ ] Verify no HTML5 validation pop-ups

---

## Additional Resources

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [FORMS.md](./FORMS.md) - FormInput component API
- [VALIDATION.md](./VALIDATION.md) - Validation patterns and examples
- [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) - All available components
