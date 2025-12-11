# FORMS.md

> **Context Requirement:** This file contains critical form implementation guidelines. Include this file in context whenever creating or editing forms.

## Table of Contents
- [🔴 Form Input Styling (CRITICAL)](#-form-input-styling-critical)
- [🔴 Form Component Structure](#-form-component-structure)
- [🔴 Shared Form Components](#-shared-form-components)
- [🔴 FormInput Usage (CRITICAL - REQUIRED)](#-formfield-usage-critical---required)
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
- Structure: FormInputs (all inputs) → Checkbox groups → Guidelines Card → Button group (Submit/Cancel at BOTTOM)
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
- **`FormInput`** - All-in-one form field component (**REQUIRED** for all inputs/selects/textareas)
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

## 🔴 FormInput Usage (CRITICAL - REQUIRED)

**ALL form inputs, selects, and textareas MUST use the `FormInput` component.** This is an all-in-one component that takes props and internally renders the complete field structure (Label + Input/Textarea/Select + description + error message). This ensures consistent styling, labels, descriptions, accessibility, and layout across the application.

### How FormInput Works:

`FormInput` is a **props-based component** that accepts field configuration and renders everything internally:
- Automatically renders the `<Label>` connected to the input via `htmlFor`/`id`
- Renders the appropriate input type (`<Input>`, `<Textarea>`, or `<Select>`)
- Displays optional description text
- Handles error messages and styling
- Manages accessibility attributes (`aria-describedby`, `aria-invalid`)

### REQUIRED Pattern:

```tsx
// ✅ CORRECT - FormInput for text input
<FormInput
  id="field-name"
  label="Field Label"
  description="Optional description text"
  value={value}
  onChange={setValue}
  required={true}
/>

// ✅ CORRECT - FormInput for textarea
<FormInput
  id="notes"
  label="Notes"
  inputType="textarea"
  value={notes}
  onChange={setNotes}
  rows={12}
/>

// ✅ CORRECT - FormInput for select
<FormInput
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

// ✅ CORRECT - FormInput for optional select with placeholder
<FormInput
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
<FormInput
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
<FormInput
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

**Why use FormInput?**
- **Consistency** - All fields have the same structure across the app
- **Accessibility** - Automatically connects labels to inputs and handles ARIA attributes
- **Less boilerplate** - One component instead of composing Label + Input + description + error
- **Type safety** - Different prop interfaces for text, textarea, and select inputs
- **Maintainability** - Changes to field styling/structure happen in one place

### Exceptions:

- Picker components (PeoplePicker, EventPicker, ReadingPickerModal) have their own internal structure
- Radio button groups (not yet supported by FormInput - use base shadcn/ui components)
- File upload inputs (not yet supported by FormInput - use base shadcn/ui components)
- Special UI patterns explicitly approved by the user
- **If you encounter a situation where FormInput cannot be used, ALWAYS ask the user before proceeding with an alternative approach**

---

## Mass-Specific Input Field Types

Two new input field types were added specifically for the Masses module's event type templating feature:

### 1. `mass-intention` Input Type

**Purpose:** Free text entry for Mass intentions (memorial intentions, prayer requests, etc.)

**Component:** `MassIntentionTextarea` (`src/components/mass-intention-textarea.tsx`)

**Rendering:**
- Standard textarea component (4-6 rows)
- Placeholder text: "Enter Mass intentions..."
- Label from field definition's `name` property
- Required indicator if field is marked as required
- Follows standard form input styling (no custom fonts or borders)

**Usage in Dynamic Forms:**
```tsx
case 'mass-intention':
  return (
    <MassIntentionTextarea
      key={field.id}
      field={field}
      value={fieldValues[field.name] || ''}
      onChange={(value) => handleFieldChange(field.name, value)}
    />
  )
```

**Example:**
```
Field Name: "Mass Intentions"
Field Type: mass-intention
User Input: "For the repose of John Doe. For the health of Jane Smith."
```

### 2. `spacer` Input Type

**Purpose:** Visual section divider with heading text (non-data field for organizing long forms)

**Component:** `FormSpacer` (`src/components/form-spacer.tsx`)

**Rendering:**
- Visual section heading with top border
- Field definition's `name` becomes heading text
- No input element (non-data field)
- Provides visual organization for complex forms
- Styling: border-top divider with muted text heading

**Usage in Dynamic Forms:**
```tsx
case 'spacer':
  return (
    <FormSpacer
      key={field.id}
      field={field}
    />
  )
```

**Example:**
```
Field Name: "Music"
Field Type: spacer
Renders as: Section heading "Music" with top border separator
```

**Use Case:** Organizing Mass forms with sections like "Liturgical Details", "Music", "Intentions & Announcements", etc.

### Integration with Event Type Templates

Both input types are used in Mass forms when an event type template is selected:

1. Admin creates Mass event type in Settings → Event Types
2. Admin adds input fields including `mass-intention` and `spacer` types
3. Staff creates Mass and selects event type template
4. Form dynamically renders fields including Mass intentions and section spacers
5. Field values stored in `masses.field_values` JSONB column

**See [MODULE_REGISTRY.md](./MODULE_REGISTRY.md#mass-event-type-integration) for complete Mass templating documentation.**

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
  <FormInput
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
- FormInput integration with validation errors
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
