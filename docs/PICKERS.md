# Picker System Documentation

> **🔴 Context Requirement:** When working with ANY picker component (EventPicker, PeoplePicker, etc.) or creating a new picker, you MUST include this file in your context. This file contains critical architecture patterns, behavioral rules, and implementation guidelines that prevent common mistakes.

> **Purpose:** Comprehensive documentation on the CorePicker architecture, creating new pickers, and advanced patterns.
>
> **See Also:**
> - **[PICKER_PATTERNS.md](./PICKER_PATTERNS.md)** - Critical behavioral rules (no redirect, auto-select, openToNew* pattern)
> - **[PICKER_EDIT_MODE.md](./PICKER_EDIT_MODE.md)** - Inline editing of related entities from pickers
> - **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Quick reference for all picker components and props

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Core Components](#core-components)
- [Creating a New Picker](#creating-a-new-picker)
- [Usage Patterns](#usage-patterns)
- [Field Wrappers](#field-wrappers)
- [Existing Pickers](#existing-pickers)
- [Advanced Features](#advanced-features)
  - [Dynamic Field Visibility](#dynamic-field-visibility)
  - [Validation with Zod](#validation-with-zod)
  - [Memoization Best Practices](#memoization-best-practices)
  - [Empty Form Data Constants](#empty-form-data-constants)
  - [Context-Aware Suggested Event Names](#context-aware-suggested-event-names)
  - [Custom Form Components](#custom-form-components)
- [🔴 CRITICAL: Preventing Infinite Re-Render Loops](#-critical-preventing-infinite-re-render-loops)

---

## Overview

The picker system provides a unified, reusable pattern for modal selection dialogs throughout the application. Pickers allow users to search, select, and optionally create entities (people, events, locations, etc.) in a consistent, user-friendly interface.

**Key Features:**
- **Client-side search** across multiple fields
- **Inline creation forms** for creating new entities without leaving the picker
- **Custom field types** including support for nested pickers
- **Flexible field configuration** with support for text, email, date, select, textarea, and custom fields
- **Custom form components** for complete control over form rendering and logic
- **Validation** using Zod schemas
- **Type-safe** with TypeScript generics

---

## Architecture

The picker system consists of three layers:

```
┌─────────────────────────────────────────────┐
│  Application Forms (e.g., wedding-form.tsx) │
│  Uses: PersonPickerField, EventPickerField  │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│   Field Wrappers (e.g., PersonPickerField)  │
│   - PickerField: Display selected value     │
│   - Manages modal state (showPicker)        │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Specific Pickers (e.g., PeoplePicker)      │
│  - Fetches data from server actions         │
│  - Defines create form fields               │
│  - Custom list item rendering               │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│         CorePicker (Generic Component)      │
│  - Modal dialog with search                 │
│  - List rendering                           │
│  - Inline creation form                     │
└─────────────────────────────────────────────┘
```

---

## Core Components

### 1. CorePicker (`src/components/core-picker.tsx`)

The foundational generic picker component that all pickers use. It handles:
- Modal state management
- Client-side search across specified fields
- List rendering with custom item display
- Inline creation form with dynamic field configuration
- Form validation
- Auto-selection of newly created items

**Type Signature:**
```typescript
CorePicker<T>
```

**Key Props:**

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Controls modal visibility |
| `onOpenChange` | `(open: boolean) => void` | Callback when modal state changes |
| `items` | `T[]` | Array of items to search and select from |
| `selectedItem` | `T \| null` | Currently selected item |
| `onSelect` | `(item: T) => void` | Callback when item is selected |
| `title` | `string` | Modal title |
| `searchFields` | `(keyof T)[]` | Fields to search across |
| `getItemLabel` | `(item: T) => string` | Extract display label from item |
| `getItemId` | `(item: T) => string` | Extract unique ID from item |
| `renderItem` | `(item: T) => ReactNode` | Custom render for list items |
| `enableCreate` | `boolean` | Show inline creation form |
| `createFields` | `PickerFieldConfig[]` | Configuration for creation form fields |
| `onCreateSubmit` | `(data: any) => Promise<T>` | Handle creating new item |
| `autoOpenCreateForm` | `boolean` | Auto-open create form when picker opens |
| `defaultCreateFormData` | `Record<string, any>` | Default values for create form |
| `CustomFormComponent` | `React.ComponentType` | Custom component to replace default form rendering |

**Full props documentation:** See `src/types/core-picker.ts`

---

### 2. CorePickerField (`src/components/core-picker-field.tsx`)

A React Hook Form wrapper for CorePicker that integrates with form validation and state management.

**Features:**
- Integrates with React Hook Form
- Displays selected value in trigger button
- Shows validation errors with red border
- Manages modal open state internally

**Type Signature:**
```typescript
CorePickerField<T>
```

**Usage with React Hook Form:**
```typescript
<CorePickerField<Person>
  name="bride_id"
  label="Bride"
  required
  items={people}
  title="Select Bride"
  searchFields={['first_name', 'last_name', 'email']}
  getItemLabel={(person) => `${person.first_name} ${person.last_name}`}
  getItemId={(person) => person.id}
  enableCreate={true}
  createFields={personCreateFields}
  onCreateSubmit={createPerson}
/>
```

---

### 3. PickerField (`src/components/picker-field.tsx`)

A generic field wrapper that displays the selected value and manages picker modal state. Used for non-React Hook Form implementations.

**Features:**
- Display selected value with icon
- Clear button (X) to remove selection
- Open picker button when no value selected
- Support for description text
- Single-line or multi-line layout

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Field label |
| `value` | `T \| null` | Currently selected value |
| `onValueChange` | `(value: T \| null) => void` | Callback when value changes |
| `showPicker` | `boolean` | Whether picker modal is open |
| `onShowPickerChange` | `(show: boolean) => void` | Callback to change picker state |
| `icon` | `LucideIcon` | Icon to display in trigger button |
| `renderValue` | `(value: T) => ReactNode` | How to display selected value |
| `children` | `ReactNode` | Picker modal component |

---

## Creating a New Picker

### Step 1: Define Your Field Configuration

```typescript
import { PickerFieldConfig } from '@/types/core-picker'
import { z } from 'zod'

const createFields: PickerFieldConfig[] = [
  {
    key: 'first_name',
    label: 'First Name',
    type: 'text',
    required: true,
    placeholder: 'John',
    validation: z.string().min(1, 'First name is required'),
  },
  {
    key: 'last_name',
    label: 'Last Name',
    type: 'text',
    required: true,
    placeholder: 'Doe',
    validation: z.string().min(1, 'Last name is required'),
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: false,
    placeholder: 'john@example.com',
  },
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    required: true,
    options: [
      { value: 'priest', label: 'Priest' },
      { value: 'deacon', label: 'Deacon' },
    ],
  },
  {
    key: 'bio',
    label: 'Biography',
    type: 'textarea',
    placeholder: 'Tell us about yourself...',
  },
]
```

**Supported Field Types:**
- `text` - Standard text input
- `email` - Email input with validation
- `tel` - Phone number input
- `date` - Date picker
- `time` - Time picker
- `datetime-local` - Date and time picker
- `select` - Dropdown with options
- `textarea` - Multi-line text input
- `custom` - Custom render function (for nested pickers, etc.)

---

### Step 2: Create Your Picker Component

```typescript
'use client'

import { useState, useEffect } from 'react'
import { CorePicker } from '@/components/core-picker'
import { getPeople, createPerson } from '@/lib/actions/people'
import type { Person } from '@/lib/types'
import { toast } from 'sonner'

interface PeoplePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (person: Person) => void
  selectedPersonId?: string
}

export function PeoplePicker({
  open,
  onOpenChange,
  onSelect,
  selectedPersonId,
}: PeoplePickerProps) {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)

  // Load people when picker opens
  useEffect(() => {
    if (open) {
      loadPeople()
    }
  }, [open])

  const loadPeople = async () => {
    try {
      setLoading(true)
      const results = await getPeople()
      setPeople(results)
    } catch (error) {
      console.error('Error loading people:', error)
      toast.error('Failed to load people')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePerson = async (data: any): Promise<Person> => {
    const newPerson = await createPerson(data)
    setPeople((prev) => [newPerson, ...prev]) // Add to local list
    return newPerson
  }

  const selectedPerson = selectedPersonId
    ? people.find((p) => p.id === selectedPersonId)
    : null

  return (
    <CorePicker<Person>
      open={open}
      onOpenChange={onOpenChange}
      items={people}
      selectedItem={selectedPerson}
      onSelect={onSelect}
      title="Select Person"
      searchPlaceholder="Search for a person..."
      searchFields={['first_name', 'last_name', 'email']}
      getItemLabel={(person) => `${person.first_name} ${person.last_name}`}
      getItemId={(person) => person.id}
      enableCreate={true}
      createFields={createFields} // From Step 1
      onCreateSubmit={handleCreatePerson}
      createButtonLabel="Save Person"
      addNewButtonLabel="Add New Person"
      isLoading={loading}
    />
  )
}
```

---

### Step 3: Create a Field Wrapper (Optional)

For consistent usage in forms:

```typescript
'use client'

import { PeoplePicker } from '@/components/people-picker'
import { PickerField } from '@/components/picker-field'
import { User } from 'lucide-react'
import type { Person } from '@/lib/types'

interface PersonPickerFieldProps {
  label: string
  value: Person | null
  onValueChange: (person: Person | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  required?: boolean
}

export function PersonPickerField({
  label,
  value,
  onValueChange,
  showPicker,
  onShowPickerChange,
  description,
  required = false,
}: PersonPickerFieldProps) {
  return (
    <PickerField
      label={label}
      value={value}
      onValueChange={onValueChange}
      showPicker={showPicker}
      onShowPickerChange={onShowPickerChange}
      description={description}
      required={required}
      icon={User}
      renderValue={(person) => `${person.first_name} ${person.last_name}`}
    >
      <PeoplePicker
        open={showPicker}
        onOpenChange={onShowPickerChange}
        onSelect={onValueChange}
        selectedPersonId={value?.id}
      />
    </PickerField>
  )
}
```

---

## Usage Patterns

### Pattern 1: Basic Usage in Forms

```typescript
import { PersonPickerField } from '@/components/person-picker-field'
import { usePickerState } from '@/hooks/use-picker-state'

function WeddingForm() {
  const bride = usePickerState<Person>()

  return (
    <form>
      <PersonPickerField
        label="Bride"
        value={bride.value}
        onValueChange={bride.setValue}
        showPicker={bride.showPicker}
        onShowPickerChange={bride.setShowPicker}
        required
      />
    </form>
  )
}
```

---

### Pattern 2: React Hook Form Integration

```typescript
import { CorePickerField } from '@/components/core-picker-field'
import { useForm, FormProvider } from 'react-hook-form'

function WeddingForm() {
  const form = useForm()

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CorePickerField<Person>
          name="bride_id"
          label="Bride"
          required
          items={people}
          title="Select Bride"
          searchFields={['first_name', 'last_name']}
          getItemLabel={(p) => `${p.first_name} ${p.last_name}`}
          getItemId={(p) => p.id}
        />
      </form>
    </FormProvider>
  )
}
```

---

### Pattern 3: Auto-Open Create Form

Useful when you know the user needs to create a new item:

```typescript
<PeoplePicker
  open={showPicker}
  onOpenChange={setShowPicker}
  onSelect={handleSelect}
  autoOpenCreateForm={true} // Opens create form immediately
/>
```

---

### Pattern 4: Pre-fill Create Form

Pass default values to the create form:

```typescript
// Option 1: Using defaultName prop (recommended for simple event name defaults)
<EventPickerField
  label="Mass Event"
  value={event.value}
  onValueChange={event.setValue}
  showPicker={event.showPicker}
  onShowPickerChange={event.setShowPicker}
  defaultRelatedEventType="MASS"
  defaultName="Holy Mass" // Pre-fills the name field
  openToNewEvent={true}
/>

// Option 2: Using defaultCreateFormData for multiple fields
<EventPicker
  open={showPicker}
  onOpenChange={setShowPicker}
  onSelect={handleSelect}
  autoOpenCreateForm={true}
  defaultCreateFormData={{
    name: 'Smith-Jones Wedding',
    timezone: 'America/New_York',
  }}
/>
```

**Note:** When both `defaultName` and `defaultCreateFormData.name` are provided, `defaultCreateFormData.name` takes precedence (spread order: `{ name: defaultName, ...defaultCreateFormData }`).

---

### Pattern 5: Nested Pickers (Custom Fields)

Create form fields can include nested pickers using the `custom` field type:

```typescript
const createFields: PickerFieldConfig[] = [
  // ... other fields
  {
    key: 'location_id',
    label: 'Location',
    type: 'custom',
    required: true,
    render: ({ value, onChange, error }) => (
      <div>
        {selectedLocation ? (
          <div className="flex items-center justify-between p-2 border rounded-md">
            <span>{selectedLocation.name}</span>
            <Button onClick={() => onChange(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button onClick={() => setShowLocationPicker(true)}>
            <MapPin className="mr-2 h-4 w-4" />
            Select Location
          </Button>
        )}

        <LocationPicker
          open={showLocationPicker}
          onOpenChange={setShowLocationPicker}
          onSelect={(loc) => {
            setSelectedLocation(loc)
            onChange(loc.id)
          }}
        />
      </div>
    ),
  },
]
```

---

### Pattern 6: Custom List Item Rendering

Customize how items appear in the selection list:

```typescript
const renderPersonItem = (person: Person) => (
  <div className="flex items-center gap-3">
    <Avatar className="h-8 w-8">
      <AvatarFallback>{person.first_name[0]}{person.last_name[0]}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <div className="font-medium">{person.first_name} {person.last_name}</div>
      <div className="text-sm text-muted-foreground">{person.email}</div>
    </div>
  </div>
)

<CorePicker<Person>
  renderItem={renderPersonItem}
  // ... other props
/>
```

---

## Field Wrappers

### usePickerState Hook

Reduces boilerplate for managing picker state:

```typescript
import { usePickerState } from '@/hooks/use-picker-state'

const bride = usePickerState<Person>()
// Returns: { value, setValue, showPicker, setShowPicker }

<PersonPickerField
  value={bride.value}
  onValueChange={bride.setValue}
  showPicker={bride.showPicker}
  onShowPickerChange={bride.setShowPicker}
/>
```

---

## Existing Pickers

### Available Pickers

| Picker | Entity | Inline Creation | Special Features |
|--------|--------|-----------------|------------------|
| **PeoplePicker** | Person | ✅ Yes | Optional fields: email, phone, sex, note |
| **EventPicker** | Event | ✅ Yes | Nested LocationPicker, timezone selection |
| **LocationPicker** | Location | ✅ Yes | Address fields (street, city, state) |
| **MassPicker** | Mass | ❌ No | Read-only selection |
| **GlobalLiturgicalEventPicker** | GlobalLiturgicalEvent | ❌ No | Year/locale filters |
| **ReadingPickerModal** | Reading | ❌ No | Category/language filters, preview modal |
| **RolePicker** | Role | ✅ Yes | Description and note fields |

### PeoplePicker Props

```typescript
interface PeoplePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (person: Person) => void
  selectedPersonId?: string
  visibleFields?: string[] // ['email', 'phone_number', 'sex', 'note']
  requiredFields?: string[] // ['email', 'sex']
  autoOpenCreateForm?: boolean
  defaultCreateFormData?: Record<string, any>
}
```

**Visible Fields:**
- `email` - Email input
- `phone_number` - Phone number input
- `sex` - Gender select (Male/Female)
- `note` - Notes textarea

**Required Fields:**
Any field from `visibleFields` can be marked as required.

---

### EventPicker Props

```typescript
interface EventPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (event: Event) => void
  selectedEventId?: string
  defaultRelatedEventType?: string // Default: 'EVENT'
  defaultName?: string // Pre-fill event name field
  visibleFields?: string[] // ['location', 'note']
  requiredFields?: string[] // ['location']
  autoOpenCreateForm?: boolean
  defaultCreateFormData?: Record<string, any>
}
```

**Key Props:**
- `defaultName` - Pre-fills the event name field in the create form. Useful for setting module-specific defaults (e.g., "Holy Mass" for masses, "Wedding" for weddings)
- `defaultRelatedEventType` - Sets the event type (e.g., "MASS", "WEDDING", "FUNERAL")

**Visible Fields:**
- `location` - Nested LocationPicker (custom field)
- `note` - Notes textarea

**Always Visible:**
- `name` - Event name (required)
- `start_date` - Date (required)
- `start_time` - Time (required)
- `timezone` - Timezone select (required)

---

### LocationPicker Props

```typescript
interface LocationPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (location: Location) => void
  selectedLocationId?: string
  visibleFields?: string[] // ['description', 'street', 'city', 'state', 'country', 'phone_number']
  requiredFields?: string[] // ['street', 'city', 'state']
  autoOpenCreateForm?: boolean
}
```

**Visible Fields:**
- `description` - Description textarea
- `street` - Street address
- `city` - City
- `state` - State
- `country` - Country
- `phone_number` - Phone number

**Always Visible:**
- `name` - Location name (required)

---

## Advanced Features

### Dynamic Field Visibility

Control which optional fields appear based on context:

```typescript
// For baptism child - require sex field
<PersonPickerField
  label="Child"
  visibleFields={['email', 'phone_number', 'sex', 'note']}
  requiredFields={['sex']} // Sex required for child
  {...pickerProps}
/>

// For godparent - don't require sex
<PersonPickerField
  label="Godparent"
  visibleFields={['email', 'phone_number', 'note']}
  // sex field not visible, so not required
  {...pickerProps}
/>
```

---

### Validation with Zod

Add validation to form fields:

```typescript
import { z } from 'zod'

const createFields: PickerFieldConfig[] = [
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    validation: z.string().email('Invalid email address'),
  },
  {
    key: 'phone_number',
    label: 'Phone',
    type: 'tel',
    validation: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Format: (555) 123-4567'),
  },
]
```

---

### Memoization Best Practices

Prevent infinite re-renders by memoizing field configurations:

```typescript
const createFields = useMemo(() => {
  const fields: PickerFieldConfig[] = [
    { key: 'first_name', label: 'First Name', type: 'text', required: true },
    { key: 'last_name', label: 'Last Name', type: 'text', required: true },
  ]

  if (isFieldVisible('email')) {
    fields.push({
      key: 'email',
      label: 'Email',
      type: 'email',
      required: isFieldRequired('email'),
    })
  }

  return fields
}, [isFieldVisible, isFieldRequired])
```

---

### Empty Form Data Constants

Prevent object re-creation on every render:

```typescript
// ❌ BAD - Creates new object every render
<CorePicker defaultCreateFormData={{}} />

// ✅ GOOD - Reuses same object reference
const EMPTY_FORM_DATA = {}

<CorePicker defaultCreateFormData={EMPTY_FORM_DATA} />
```

---

### Context-Aware Suggested Event Names

**Feature:** Automatically suggest meaningful event names based on form context.

When creating events from module forms (weddings, funerals, baptisms, etc.), the EventPicker can pre-fill the event name field with contextually relevant suggestions based on the people already selected in the form.

**Implementation Pattern:**

```typescript
import { useMemo } from 'react'

// In your form component:
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
  return 'Wedding' // Fallback
}, [bride.value, groom.value])

// Use in EventPickerField:
<EventPickerField
  label="Wedding Ceremony"
  value={weddingEvent.value}
  onValueChange={weddingEvent.setValue}
  showPicker={weddingEvent.showPicker}
  onShowPickerChange={weddingEvent.setShowPicker}
  openToNewEvent={!isEditing}
  defaultRelatedEventType="WEDDING"
  defaultCreateFormData={{ name: suggestedEventName }}
/>
```

**Benefits:**
- Saves user time by pre-filling sensible defaults
- Maintains naming consistency across events
- Updates dynamically as users select people
- Users can still edit the suggested name if needed

**Module-Specific Examples:**

| Module | Suggested Name Pattern | Example |
|--------|------------------------|---------|
| **Weddings** | `{Bride}-{Groom} Wedding` | "Smith-Jones Wedding" |
| **Funerals** | `{FirstName} {LastName} Funeral` | "John Doe Funeral" |
| **Baptisms** | `{FirstName} {LastName} Baptism` | "Mary Smith Baptism" |
| **Presentations** | `{FirstName} {LastName} Presentation` | "Teresa Garcia Presentation" |
| **Quinceañeras** | `{FirstName} {LastName} Quinceañera` | "Sofia Martinez Quinceañera" |

**Implementation Notes:**
- Uses `useMemo` to compute suggested names based on selected people
- Recomputes automatically when people selections change
- Falls back to generic names (e.g., "Wedding") when no people are selected yet
- Works seamlessly with `defaultCreateFormData` prop in EventPickerField
- Applied to all event pickers in module forms (ceremonies, receptions, meals, etc.)

---

### Custom Form Components

**Feature:** Replace the default field rendering with a fully custom form component for maximum control.

When the default `createFields` configuration isn't flexible enough (e.g., when you need complex form logic, nested modals, or custom state management), you can provide a `CustomFormComponent` that replaces the entire form field rendering.

**Use Cases:**
- Forms with complex interdependencies between fields
- Forms that need to manage multiple nested modals (e.g., Time picker with common times modal)
- Forms requiring custom validation logic beyond Zod schemas
- Forms with dynamic field generation based on external state

**Implementation Pattern:**

```typescript
// Step 1: Create a custom form component
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CommonTimesModal } from '@/components/common-times-modal'

interface EventFormFieldsProps {
  formData: Record<string, any>
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>
  errors: Record<string, string>
  isEditMode: boolean
}

export function EventFormFields({
  formData,
  setFormData,
  errors,
  isEditMode,
}: EventFormFieldsProps) {
  const [showCommonTimesModal, setShowCommonTimesModal] = useState(false)

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <>
      {/* Regular form fields */}
      <div className="space-y-2">
        <Label htmlFor="name">Event Name</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
        />
        {errors.name && <p className="text-destructive">{errors.name}</p>}
      </div>

      {/* Time field with custom button */}
      <div className="space-y-2">
        <Label htmlFor="start_time">Time</Label>
        <div className="flex gap-2">
          <Input
            id="start_time"
            type="time"
            value={formData.start_time || ''}
            onChange={(e) => updateField('start_time', e.target.value)}
          />
          <Button
            type="button"
            onClick={() => setShowCommonTimesModal(true)}
          >
            Common Times
          </Button>
        </div>
      </div>

      {/* Custom modal */}
      <CommonTimesModal
        open={showCommonTimesModal}
        onOpenChange={setShowCommonTimesModal}
        onSelectTime={(time) => updateField('start_time', time)}
      />
    </>
  )
}

// Step 2: Use in your picker
import { EventFormFields } from '@/components/event-form-fields'

<CorePicker<Event>
  open={open}
  onOpenChange={onOpenChange}
  items={events}
  onSelect={onSelect}
  enableCreate={true}
  createFields={createFields} // Still required for validation
  onCreateSubmit={handleCreateEvent}
  CustomFormComponent={EventFormFields} // Custom form replaces default rendering
/>

// Step 3: Or pass inline with props
<CorePicker<Event>
  // ... other props
  CustomFormComponent={(props) => (
    <EventFormFields
      {...props}
      visibleFields={visibleFields}
      requiredFields={requiredFields}
    />
  )}
/>
```

**How It Works:**

1. **CorePicker receives `CustomFormComponent` prop** - A React component that receives React Hook Form instance
2. **Custom component gets full control** - Receives `form` (UseFormReturn), `errors`, `isEditMode`
3. **Custom component renders fields** - Can render any UI, manage modals, handle complex logic
4. **Form state managed by React Hook Form** - Use `watch()` to read values and `setValue()` to update
5. **Validation via Zod** - CorePicker builds a Zod schema from `createFields` for validation
6. **Submit works normally** - `onCreateSubmit` receives the validated form data

**Props Passed to CustomFormComponent:**

| Prop | Type | Description |
|------|------|-------------|
| `form` | `UseFormReturn<Record<string, any>>` | React Hook Form instance with `watch`, `setValue`, `register`, etc. |
| `errors` | `FieldErrors<Record<string, any>>` | Validation errors object from React Hook Form |
| `isEditMode` | `boolean` | Whether form is in edit mode (true) or create mode (false) |

**Extracting Error Messages:**

React Hook Form's errors are objects with `{message, type, ref}`. Use a helper to extract string messages:

```typescript
const getErrorMessage = (fieldName: string): string | undefined => {
  const error = errors[fieldName]
  if (!error) return undefined
  const message = error.message
  return typeof message === 'string' ? message : undefined
}
```

**Important Notes:**

- **`createFields` still required** - CorePicker uses this to build the Zod validation schema
- **Use React Hook Form methods** - `watch('fieldName')` reads values, `setValue('fieldName', value, { shouldValidate: true })` updates
- **No useState needed for form state** - React Hook Form manages everything
- **Clean separation** - Form logic is isolated in the custom component
- **Full React features** - Can use hooks, context, nested components, anything React supports

**Example: EventPicker with Common Times Modal**

The EventPicker uses this pattern to provide a time input with a "common times" button that opens a modal of frequently-used liturgical service times (7 AM, 8 AM, 9 AM, etc.):

```typescript
// EventPicker passes custom component
<CorePicker<Event>
  // ... standard props
  CustomFormComponent={(props) => (
    <EventFormFields
      {...props}
      visibleFields={visibleFields}
      requiredFields={requiredFields}
    />
  )}
/>

// EventFormFields manages time field + common times modal
export function EventFormFields({ form, errors }) {
  const { watch, setValue } = form
  const [showCommonTimesModal, setShowCommonTimesModal] = useState(false)

  // Helper to extract error messages safely
  const getErrorMessage = (fieldName: string): string | undefined => {
    const error = errors[fieldName]
    if (!error) return undefined
    return typeof error.message === 'string' ? error.message : undefined
  }

  return (
    <>
      <div className="flex gap-2">
        <Input
          type="time"
          value={watch('start_time') ?? ''}
          onChange={(e) => setValue('start_time', e.target.value, { shouldValidate: true })}
        />
        <Button onClick={() => setShowCommonTimesModal(true)}>
          <Clock />
        </Button>
      </div>
      {getErrorMessage('start_time') && (
        <p className="text-sm text-destructive">{getErrorMessage('start_time')}</p>
      )}

      <CommonTimesModal
        open={showCommonTimesModal}
        onOpenChange={setShowCommonTimesModal}
        onSelectTime={(time) => {
          setValue('start_time', time, { shouldValidate: true })
        }}
      />
    </>
  )
}
```

**When to Use Custom Form Components:**

✅ **Use when:**
- You need complex UI that default fields can't provide
- Managing multiple nested modals or pickers
- Form logic requires custom hooks or state management
- Fields have complex interdependencies

❌ **Don't use when:**
- Standard `createFields` configuration is sufficient
- Only need basic text, select, date, or textarea fields
- Using the `custom` field type with `render` prop works fine

---

## 🔴 CRITICAL: Preventing Infinite Re-Render Loops

### The Problem

CorePicker has a `useEffect` that depends on several props including `createFields` and `defaultCreateFormData`. If these props receive **new references on every render**, it triggers an infinite loop:

```
Render → New array/object → useEffect runs → State update → Render → New array/object → ...
```

This manifests as the error:
```
Maximum update depth exceeded. This can happen when a component repeatedly
calls setState inside componentWillUpdate or componentDidUpdate.
```

### The Solution

**Define constants OUTSIDE the component** to ensure stable references across renders.

### ✅ CORRECT Pattern

```typescript
'use client'

import { useState, useEffect, useMemo } from 'react'
import { CorePicker } from '@/components/core-picker'
import type { MyEntity } from '@/lib/types'

// 🔴 CRITICAL: Define constants OUTSIDE component
const SEARCH_FIELDS = ['name', 'email'] as const
const EMPTY_CREATE_FIELDS: never[] = []  // For pickers without inline creation
const EMPTY_FORM_DATA = {}

export function MyPicker({ open, onOpenChange, onSelect }: MyPickerProps) {
  const [items, setItems] = useState<MyEntity[]>([])

  return (
    <CorePicker<MyEntity>
      open={open}
      onOpenChange={onOpenChange}
      items={items}
      onSelect={onSelect}
      searchFields={SEARCH_FIELDS}  // ✅ Stable reference
      enableCreate={false}
      createFields={EMPTY_CREATE_FIELDS}  // ✅ Stable reference
      defaultCreateFormData={EMPTY_FORM_DATA}  // ✅ Stable reference
      // ... other props
    />
  )
}
```

### ❌ INCORRECT Patterns

```typescript
// ❌ BAD: Inline array (new reference every render)
<CorePicker
  searchFields={['name', 'email']}
  // Creates new array on every render!
/>

// ❌ BAD: Inline empty array
<CorePicker
  createFields={[]}
  // Creates new array on every render!
/>

// ❌ BAD: Inline empty object
<CorePicker
  defaultCreateFormData={{}}
  // Creates new object on every render!
/>

// ❌ BAD: Constants inside component
export function MyPicker() {
  const SEARCH_FIELDS = ['name', 'email']  // Recreated every render!
  const EMPTY_FORM_DATA = {}  // Recreated every render!

  return <CorePicker searchFields={SEARCH_FIELDS} />
}
```

### Special Case: Dynamic createFields

If your `createFields` needs to be computed dynamically, use `useMemo`:

```typescript
'use client'

import { useState, useEffect, useMemo } from 'react'

// Define constant outside for stable parts
const EMPTY_FORM_DATA = {}

export function MyPicker({ visibleFields, requiredFields }: Props) {
  // ✅ Memoize dynamic createFields
  const createFields = useMemo(() => {
    const fields: PickerFieldConfig[] = [
      { key: 'name', label: 'Name', type: 'text', required: true },
    ]

    // Add conditional fields
    if (visibleFields?.includes('email')) {
      fields.push({
        key: 'email',
        label: 'Email',
        type: 'email',
        required: requiredFields?.includes('email'),
      })
    }

    return fields
  }, [visibleFields, requiredFields])  // Only recompute when dependencies change

  return (
    <CorePicker
      createFields={createFields}  // ✅ Memoized reference
      defaultCreateFormData={EMPTY_FORM_DATA}  // ✅ Stable reference
      // ... other props
    />
  )
}
```

### Checklist for New Pickers

When creating a new picker, ensure:

- [ ] `searchFields` defined outside component as `const`
- [ ] `createFields` either defined outside OR wrapped in `useMemo`
- [ ] `defaultCreateFormData` defined outside as `const EMPTY_FORM_DATA = {}`
- [ ] No inline arrays `[]` passed to CorePicker
- [ ] No inline objects `{}` passed to CorePicker
- [ ] If picker has no inline creation: pass `createFields={EMPTY_CREATE_FIELDS}`
- [ ] If picker has no default form data: pass `defaultCreateFormData={EMPTY_FORM_DATA}`

### Why CorePicker Defaults Are Safe Now

CorePicker's default parameters are now defined outside the component:

```typescript
// In core-picker.tsx - STABLE DEFAULTS
const EMPTY_CREATE_FIELDS: PickerFieldConfig[] = []
const EMPTY_FORM_DATA: Record<string, any> = {}

export function CorePicker<T>({
  createFields = EMPTY_CREATE_FIELDS,  // ✅ Stable default
  defaultCreateFormData = EMPTY_FORM_DATA,  // ✅ Stable default
  // ...
}) {
  // ...
}
```

However, **it's still best practice to explicitly pass these props** for clarity and to avoid relying on defaults.

---

## Best Practices

### 1. Always Load Data When Picker Opens

```typescript
useEffect(() => {
  if (open) {
    loadData()
  }
}, [open])
```

### 2. Add Newly Created Items to Local List

```typescript
const handleCreate = async (data: any): Promise<T> => {
  const newItem = await createItem(data)
  setItems((prev) => [newItem, ...prev]) // Add to list
  return newItem
}
```

### 3. Use TypeScript Generics

```typescript
// Define picker as generic component
export function MyPicker<T extends { id: string }>({ ... }) {
  return <CorePicker<T> ... />
}
```

### 4. Provide Meaningful Labels

```typescript
// ❌ Generic
createButtonLabel="Save"

// ✅ Specific
createButtonLabel="Save Person"
addNewButtonLabel="Add New Person"
```

### 5. Use Consistent Search Fields

Include all fields users might search by:

```typescript
searchFields={['first_name', 'last_name', 'email', 'phone_number']}
```

---

## Migration from Old Patterns

If you encounter older pickers using `Command`/`CommandDialog`:

1. Replace `Command` components with `CorePicker`
2. Move inline form logic into `createFields` configuration
3. Consolidate `handleCreate` logic into `onCreateSubmit`
4. Remove manual search filtering (CorePicker handles this)
5. Simplify state management

**Before (Old Pattern):**
```typescript
// Complex command dialog with manual state management
```

**After (CorePicker):**
```typescript
<CorePicker<T>
  items={items}
  createFields={fields}
  onCreateSubmit={handleCreate}
/>
```

---

## Summary

The CorePicker system provides:
- ✅ **Consistency** - Unified UX across all picker modals
- ✅ **Reusability** - Write picker logic once, reuse everywhere
- ✅ **Type Safety** - Full TypeScript support with generics
- ✅ **Flexibility** - Support for simple to complex use cases with custom form components
- ✅ **Validation** - Built-in Zod validation support
- ✅ **Nested Pickers** - Custom fields enable picker-in-picker patterns
- ✅ **Auto-selection** - Newly created items are automatically selected
- ✅ **Performance** - Memoization patterns prevent unnecessary re-renders
- ✅ **Extensibility** - Custom form components for maximum control

For questions or additions to the picker system, consult `src/components/core-picker.tsx` and `src/types/core-picker.ts`.
