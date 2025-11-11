# Picker System Documentation

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

---

## Overview

The picker system provides a unified, reusable pattern for modal selection dialogs throughout the application. Pickers allow users to search, select, and optionally create entities (people, events, locations, etc.) in a consistent, user-friendly interface.

**Key Features:**
- **Client-side search** across multiple fields
- **Inline creation forms** for creating new entities without leaving the picker
- **Custom field types** including support for nested pickers
- **Flexible field configuration** with support for text, email, date, select, textarea, and custom fields
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
  defaultEventType?: string // Default: 'EVENT'
  visibleFields?: string[] // ['location', 'note']
  requiredFields?: string[] // ['location']
  autoOpenCreateForm?: boolean
  defaultCreateFormData?: Record<string, any>
}
```

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
  defaultEventType="WEDDING"
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
| **Presentations** | `{FirstName} {LastName} Presentation` | "Maria Garcia Presentation" |
| **Quinceañeras** | `{FirstName} {LastName} Quinceañera` | "Sofia Martinez Quinceañera" |

**Implementation Notes:**
- Uses `useMemo` to compute suggested names based on selected people
- Recomputes automatically when people selections change
- Falls back to generic names (e.g., "Wedding") when no people are selected yet
- Works seamlessly with `defaultCreateFormData` prop in EventPickerField
- Applied to all event pickers in module forms (ceremonies, receptions, meals, etc.)

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
- ✅ **Flexibility** - Support for simple to complex use cases
- ✅ **Validation** - Built-in Zod validation support
- ✅ **Nested Pickers** - Custom fields enable picker-in-picker patterns
- ✅ **Auto-selection** - Newly created items are automatically selected
- ✅ **Performance** - Memoization patterns prevent unnecessary re-renders

For questions or additions to the picker system, consult `src/components/core-picker.tsx` and `src/types/core-picker.ts`.
