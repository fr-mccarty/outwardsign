# FORMS.md

> **Context Requirement:** This file contains critical form implementation guidelines. Include this file in context whenever creating or editing forms.

## Table of Contents
- [🔴 Form Input Styling (CRITICAL)](#-form-input-styling-critical)
- [🔴 Form Component Structure](#-form-component-structure)
- [🔴 Shared Form Components](#-shared-form-components)
- [🔴 FormField Usage (CRITICAL - REQUIRED)](#-formfield-usage-critical---required)
- [Form Event Handling](#form-event-handling)
- [Validation](#validation)

---

## 🔴 Form Input Styling (CRITICAL)

**NEVER modify font-family, font style, font weight, borders, or backgrounds in form inputs.** All form inputs (Input, Textarea, Select) must use the default component styling from shadcn/ui.

### PROHIBITED in form inputs:
- ❌ `font-mono` - Monospace fonts
- ❌ `font-serif` - Serif fonts
- ❌ `font-sans` - Explicit sans-serif (use default instead)
- ❌ `italic` - Italicized text
- ❌ `font-light`, `font-bold`, `font-semibold`, etc. - Custom font weights
- ❌ `border`, `border-*`, `rounded-*` - Border customizations
- ❌ `bg-*` - Background color changes
- ❌ Any `font-family` or `style={{fontFamily: ...}}` properties

### ALLOWED styling for form inputs:
- ✅ Text sizes: `text-xs`, `text-sm`, `text-base`, `text-lg` (size adjustments are fine)
- ✅ Layout: `w-full`, `min-h-[300px]`, `max-w-*`, padding, margin, spacing
- ✅ Standard component defaults from shadcn/ui (borders, backgrounds come from the base component)

### Examples:

```tsx
// ❌ WRONG - Never apply font-family, font style, borders, or backgrounds to inputs
<Textarea className="min-h-[300px] font-mono text-sm" />
<Input className="font-serif italic bg-gray-100" />
<Input className="font-bold border-2 rounded-lg" />

// ✅ CORRECT - Only layout and text size
<Textarea className="min-h-[300px] text-sm" />
<Input className="w-full text-base" />
<Input className="max-w-md" />
```

**Why this matters:** Form inputs must maintain consistent styling across the application. The shadcn/ui components already provide proper borders, backgrounds, and focus states that work with dark mode. Only layout and text size should be adjusted.

### Print Views Exception

For views within a print folder (`app/print/`), custom styling is allowed to optimize for printing and PDF generation. These views are not interactive and do not need to follow the standard form input rules.

---

## 🔴 Form Component Structure

### Unified Form Pattern (Client Component)

All module forms should follow this structure (`[entity]-form.tsx`):

**Key Characteristics:**
- Detects mode: entity prop = edit, no prop = create
- **Type**: Accepts `[Entity]WithRelations` for edit mode (not base [Entity] type)
- Structure: FormFields (all inputs) → Checkbox groups → Guidelines Card → Button group (Submit/Cancel at BOTTOM)
- Uses SaveButton and CancelButton components at the bottom of the form
- Calls `create[Entity]()` or `update[Entity]()` Server Action

### isEditing Pattern:

**CRITICAL:** Always follow this pattern for consistent behavior:

```tsx
export function EntityForm({ entity }: EntityFormProps) {
  // 1. Compute isEditing at the top of the form
  const isEditing = !!entity

  // 2. Use isEditing for ALL mode detection throughout the form
  // - Button text
  // - Navigation behavior
  // - Conditional logic

  // 3. For EventPicker components
  <EventPicker
    openToNewEvent={!weddingEvent.value}  // ← Use !value (opens to create form when field is empty)
    // ...
  />

  // 4. For PeoplePicker components
  <PeoplePicker
    openToNewPerson={!presider.value}  // ← Use !value (opens to create form when field is empty)
    // ...
  />

  // This creates consistent behavior:
  // - Empty field: opens to new entity creation form (likely creating new person/event)
  // - Field with value: opens to search/picker view (likely changing to different entity)
}
```

### Redirection Pattern:

**🔴 CRITICAL - Form Redirect Rules:**

Forms must follow these exact redirect rules based on the operation:

| Operation | Action | Route | Reason |
|-----------|--------|-------|--------|
| **UPDATE** (Edit Page) | `router.refresh()` | Stay on `/entities/{id}/edit` | User stays on edit page to see updated data and can continue editing |
| **CREATE** (Create Page) | `router.push()` | Go to `/entities/{id}/edit` | User goes to edit page to continue configuring the new entity |

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    if (isEditing) {
      // UPDATE case - from /entities/{id}/edit
      await updateEntity(entity.id, formData)
      toast.success('Entity updated successfully')
      router.refresh() // ← STAYS on edit page (/entities/{id}/edit)
    } else {
      // CREATE case - from /entities/create
      const newEntity = await createEntity(formData)
      toast.success('Entity created successfully')
      router.push(`/entities/${newEntity.id}/edit`) // ← GOES to edit page (/entities/{id}/edit)
    }
  } catch (error) {
    toast.error('Failed to save entity')
  }
}
```

**Why These Rules?**
- **UPDATE uses `router.refresh()`**: After updating, the user expects to stay on the edit form to see their changes and potentially make more edits. Redirecting to the view page would be disruptive and require clicking "Edit" again.
- **CREATE uses `router.push()`**: After creating a new entity, the user goes to the edit page to continue configuring it. This allows them to add related data, make adjustments, or view the fully configured entity before finishing.

---

## 🔴 Shared Form Components

The following components should be used in all forms for consistency:

### Core Form Components:
- **`SaveButton`** - Handles loading state, shows spinner while saving
- **`CancelButton`** - Standard cancel button with routing
- **`FormField`** - All-in-one form field component (**REQUIRED** for all inputs/selects/textareas)
- **`EventDisplay`** - Display event date/time/location in forms

### Picker Components:

**Available Pickers (7 total):**
1. **`PeoplePicker`** - Select person from parish directory with search and inline creation
2. **`EventPicker`** - Select or create events with date/time/location
3. **`LocationPicker`** - Select or create locations (churches, venues, halls)
4. **`ReadingPickerModal`** - Select scripture readings with category filters (Wedding, Funeral, Baptism, etc.)
5. **`MassPicker`** - Select scheduled masses with search and date display
6. **`RolePicker`** - Select liturgical ministry roles (Lector, EMHC, Altar Server, Cantor, Usher, etc.)
7. **`GlobalLiturgicalEventPicker`** - Select global liturgical calendar events (feasts, solemnities, holy days)

**Additional Components:**
- **`PetitionEditor`** - Edit petitions with template insertion

**Note:** For detailed documentation on each picker including props, features, and usage examples, see [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md#picker-components).

### Utility Hooks:
- **`usePickerState`** (`src/hooks/use-picker-state.ts`)
  - Reduces boilerplate for managing modal picker state (people, events, readings)
  - Returns: `{ value, setValue, showPicker, setShowPicker }`
  - Usage: `const bride = usePickerState<Person>()`

---

## 🔴 FormField Usage (CRITICAL - REQUIRED)

**ALL form inputs, selects, and textareas MUST use the `FormField` component.** This is an all-in-one component that takes props and internally renders the complete field structure (Label + Input/Textarea/Select + description + error message). This ensures consistent styling, labels, descriptions, accessibility, and layout across the application.

### How FormField Works:

`FormField` is a **props-based component** that accepts field configuration and renders everything internally:
- Automatically renders the `<Label>` connected to the input via `htmlFor`/`id`
- Renders the appropriate input type (`<Input>`, `<Textarea>`, or `<Select>`)
- Displays optional description text
- Handles error messages and styling
- Manages accessibility attributes (`aria-describedby`, `aria-invalid`)

### REQUIRED Pattern:

```tsx
// ✅ CORRECT - FormField for text input
<FormField
  id="field-name"
  label="Field Label"
  description="Optional description text"
  value={value}
  onChange={setValue}
  required={true}
/>

// ✅ CORRECT - FormField for textarea
<FormField
  id="notes"
  label="Notes"
  inputType="textarea"
  value={notes}
  onChange={setNotes}
  rows={12}
/>

// ✅ CORRECT - FormField for select
<FormField
  id="status"
  label="Status"
  inputType="select"
  value={status}
  onChange={setStatus}
  options={[
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' }
  ]}
/>

// ✅ CORRECT - FormField for optional select with placeholder
<FormField
  id="liturgical_color"
  label="Liturgical Color"
  inputType="select"
  value={liturgicalColor || ''}  // Convert undefined to empty string
  onChange={(value) => setLiturgicalColor(value ? value : undefined)}  // Convert empty to undefined
  placeholder="Select liturgical color (optional)"
  options={LITURGICAL_COLOR_VALUES.map((value) => ({
    value,
    label: LITURGICAL_COLOR_LABELS[value].en
  }))}
/>
```

### ❌ PROHIBITED Patterns:

**Never manually compose Label + Input:**

```tsx
// ❌ WRONG - Never use Input directly with manual Label
<Label htmlFor="field-name">Field Label</Label>
<Input id="field-name" value={value} onChange={(e) => setValue(e.target.value)} />

// ❌ WRONG - Never use Select directly with manual Label
<Label htmlFor="status">Status</Label>
<Select value={status} onValueChange={setStatus}>
  <SelectTrigger id="status">...</SelectTrigger>
</Select>

// ❌ WRONG - Never use Textarea directly with manual Label
<Label htmlFor="notes">Notes</Label>
<Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
```

**Never use empty string as a select option value:**

```tsx
// ❌ WRONG - Empty string as an option value causes Radix UI errors
<FormField
  id="liturgical_color"
  inputType="select"
  value={liturgicalColor || ''}
  onChange={setLiturgicalColor}
  options={[
    { value: '', label: 'Not specified' },  // ❌ NEVER DO THIS
    { value: 'WHITE', label: 'White' },
    { value: 'RED', label: 'Red' }
  ]}
/>

// ✅ CORRECT - Use placeholder prop instead
<FormField
  id="liturgical_color"
  inputType="select"
  value={liturgicalColor || ''}
  onChange={(value) => setLiturgicalColor(value ? value : undefined)}
  placeholder="Select liturgical color (optional)"  // ✅ Use placeholder
  options={[
    { value: 'WHITE', label: 'White' },
    { value: 'RED', label: 'Red' }
  ]}
/>
```

**Error you'll see if you use empty string option:**
```
A <Select.Item /> must have a value prop that is not an empty string.
This is because the Select value can be set to an empty string to clear
the selection and show the placeholder.
```

**Why use FormField?**
- **Consistency** - All fields have the same structure across the app
- **Accessibility** - Automatically connects labels to inputs and handles ARIA attributes
- **Less boilerplate** - One component instead of composing Label + Input + description + error
- **Type safety** - Different prop interfaces for text, textarea, and select inputs
- **Maintainability** - Changes to field styling/structure happen in one place

### Exceptions:

- Picker components (PeoplePicker, EventPicker, ReadingPickerModal) have their own internal structure
- Radio button groups (not yet supported by FormField - use base shadcn/ui components)
- File upload inputs (not yet supported by FormField - use base shadcn/ui components)
- Special UI patterns explicitly approved by the user
- **If you encounter a situation where FormField cannot be used, ALWAYS ask the user before proceeding with an alternative approach**

---

## Form Event Handling

### Nested Forms (Critical)

**CRITICAL:** When creating forms inside dialogs/modals that are rendered within other forms (nested forms), always prevent event propagation:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  e.stopPropagation() // ← REQUIRED to prevent bubbling to parent form

  // ... form submission logic
}
```

**Why:** Dialog forms (like EventPicker, PeoplePicker with inline creation) are often rendered while a parent form is active. Without `e.stopPropagation()`, submitting the dialog form will also trigger the parent form's submission, causing unintended saves.

**Where to apply:**
- EventPicker: Already implemented in `handleCreateEvent`
- PeoplePicker: Apply if adding inline creation forms
- Any custom picker/modal components with forms

**Reference:** See `/components/event-picker.tsx` line 208 for the canonical implementation.

---

## Validation

> **For comprehensive validation documentation, see [VALIDATION.md](./VALIDATION.md)**

### 🔴 Zod v4 Compatibility (CRITICAL)

**This codebase uses Zod v4.1.12.** In Zod v4, the error property was renamed from `errors` to `issues`.

**IMPORTANT:** Always use `error.issues` instead of `error.errors` when accessing validation errors:

```tsx
// ✅ CORRECT - Zod v4
try {
  const data = schema.parse(input)
} catch (error) {
  if (error instanceof z.ZodError) {
    toast.error(error.issues[0].message)  // Use .issues
  }
}

// ❌ WRONG - This was Zod v3 syntax
try {
  const data = schema.parse(input)
} catch (error) {
  if (error instanceof z.ZodError) {
    toast.error(error.errors[0].message)  // Property 'errors' does not exist
  }
}
```

**Note:** This applies to all error handling code, including both `.parse()` and `.safeParse()` patterns.

### Recommended Pattern: React Hook Form + Zod

**Current Standard:** Use React Hook Form with `zodResolver` for automatic validation. This eliminates manual state management and `.safeParse()` calls.

**Example:**

```tsx
// 1. Define schema in lib/schemas/[entity].ts
import { z } from 'zod'

export const createEntitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  // ... other fields
})

export type CreateEntityData = z.infer<typeof createEntitySchema>

// 2. Server Action - use .parse() (throws on invalid)
// In lib/actions/[entity].ts
import { createEntitySchema } from '@/lib/schemas/[entity]'

export async function createEntity(data: CreateEntityData): Promise<Entity> {
  const validated = createEntitySchema.parse(data) // Security boundary
  // ... create entity
}

// 3. Client Form - use React Hook Form with zodResolver
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEntitySchema } from '@/lib/schemas/[entity]'

const {
  handleSubmit,
  formState: { errors, isSubmitting },
  setValue,
  watch,
} = useForm<CreateEntityData>({
  resolver: zodResolver(createEntitySchema), // Automatic validation
  defaultValues: {
    name: '',
    status: 'ACTIVE',
  },
})

const onSubmit = async (data: CreateEntityData) => {
  // Data is already validated by React Hook Form
  await createEntity(data)
}

// Use in form
<form onSubmit={handleSubmit(onSubmit)}>
  <FormField
    id="name"
    label="Name"
    value={watch('name')}
    onChange={(value) => setValue('name', value)}
    error={errors.name?.message}
  />
</form>
```

**Benefits:**
- ✅ **No manual state management** - React Hook Form handles all form state
- ✅ **Automatic validation** - No manual `.safeParse()` calls needed
- ✅ **Better UX** - Instant validation feedback as user types
- ✅ **Less boilerplate** - Fewer useState declarations
- ✅ **Server-side security** - Always validate with `.parse()` in server actions
- ✅ **Type safety** - TypeScript types derived from Zod schemas

**See [VALIDATION.md](./VALIDATION.md) for:**
- Complete implementation guide
- Schema definition patterns
- FormField integration with validation errors
- Picker component validation
- Common validation rules

---

### Legacy Pattern: Manual .safeParse() (Not Recommended)

This pattern was used before React Hook Form adoption. **Use React Hook Form instead for new code.**

```tsx
// ❌ OLD PATTERN - Not recommended for new code
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  const result = createEntitySchema.safeParse(formData)

  if (!result.success) {
    toast.error(result.error.issues[0].message)  // Note: .issues (Zod v4)
    return
  }

  await createEntity(result.data)
}
```

**Why this is outdated:**
- Requires manual useState for each field
- Manual error handling and display
- More boilerplate code
- No automatic validation feedback
