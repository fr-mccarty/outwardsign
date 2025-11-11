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
    openToNewEvent={!isEditing}  // ← Use !isEditing (not !entity or !event)
    // ...
  />

  // 4. For PeoplePicker components
  <PeoplePicker
    openToNewPerson={!isEditing}  // ← Use !isEditing (not !entity or !person)
    // ...
  />

  // This creates consistent behavior:
  // - Create mode: always opens to new entity creation forms
  // - Edit mode: always opens to search/picker view
}
```

### Redirection Pattern:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    if (isEditing) {
      // UPDATE case
      await updateEntity(entity.id, formData)
      toast.success('Entity updated successfully')
      router.refresh() // ← Stays on edit page to show updated data
    } else {
      // CREATE case
      const newEntity = await createEntity(formData)
      toast.success('Entity created successfully')
      router.push(`/entities/${newEntity.id}`) // ← Goes to view page
    }
  } catch (error) {
    toast.error('Failed to save entity')
  }
}
```

**Summary:**
- After UPDATE: `router.refresh()` (stays on edit page)
- After CREATE: `router.push(\`/[entities]/\${newEntity.id}\`)` (goes to view page)

---

## 🔴 Shared Form Components

The following components should be used in all forms for consistency:

### Core Form Components:
- **`SaveButton`** - Handles loading state, shows spinner while saving
- **`CancelButton`** - Standard cancel button with routing
- **`FormField`** - Standardized form field wrapper (**REQUIRED** for all inputs/selects/textareas)
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

**ALL form inputs, selects, and textareas MUST use the `FormField` component.** This ensures consistent styling, labels, descriptions, and layout across the application.

### REQUIRED Pattern:

```tsx
// ✅ CORRECT - Always use FormField wrapper for Input
<FormField
  id="field-name"
  label="Field Label"
  description="Optional description text"
  value={value}
  onChange={setValue}
  required={true}
/>

// ✅ CORRECT - FormField wrapper for Textarea
<FormField
  id="notes"
  label="Notes"
  inputType="textarea"
  value={notes}
  onChange={setNotes}
  rows={12}
/>

// ✅ CORRECT - FormField wrapper for Select
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
```

### ❌ PROHIBITED - Never use bare Input/Select/Textarea components:

```tsx
// ❌ WRONG - Never use Input directly without FormField wrapper
<Label>Field Label</Label>
<Input value={value} onChange={(e) => setValue(e.target.value)} />

// ❌ WRONG - Never use Select directly without FormField wrapper
<Label>Status</Label>
<Select value={status} onValueChange={setStatus}>
  <SelectTrigger>...</SelectTrigger>
</Select>

// ❌ WRONG - Never use Textarea directly without FormField wrapper
<Label>Notes</Label>
<Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
```

### Exceptions:

- Picker components (PeoplePicker, EventPicker, ReadingPickerModal) have their own internal structure
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

### Dual Validation with Zod

**Pattern:** Define schemas in Server Action files. Client forms use `.safeParse()` for instant feedback. Server Actions use `.parse()` as security boundary. Export schema types with `z.infer<>`.

**Example:**

```tsx
// In lib/actions/[entity].ts
import { z } from 'zod'

export const createEntitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  // ... other fields
})

export type CreateEntityData = z.infer<typeof createEntitySchema>

// Server Action - use .parse() (throws on invalid)
export async function createEntity(data: CreateEntityData): Promise<Entity> {
  const validated = createEntitySchema.parse(data) // Security boundary
  // ... create entity
}

// Client Form - use .safeParse() (returns result object)
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  const result = createEntitySchema.safeParse(formData)

  if (!result.success) {
    // Show validation errors
    toast.error(result.error.errors[0].message)
    return
  }

  // Proceed with submission
  await createEntity(result.data)
}
```

**Benefits:**
- **Client-side:** Instant feedback, better UX
- **Server-side:** Security boundary, never trust client
- **Single source of truth:** Schema defined once, used everywhere
- **Type safety:** TypeScript types derived from schema
