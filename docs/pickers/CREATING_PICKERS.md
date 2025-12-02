# Creating New Pickers

> **Purpose:** Step-by-step guide to creating new picker components from scratch.
>
> **Related Documentation:**
> - **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Core architecture and components
> - **[USAGE_PATTERNS.md](./USAGE_PATTERNS.md)** - Common usage patterns
> - **[ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)** - Advanced features and customization
> - **[INFINITE_LOOP_PREVENTION.md](./INFINITE_LOOP_PREVENTION.md)** - Critical: Preventing infinite re-renders

## Table of Contents

- [Overview](#overview)
- [Step 1: Define Field Configuration](#step-1-define-field-configuration)
- [Step 2: Create Picker Component](#step-2-create-picker-component)
- [Step 3: Create Field Wrapper](#step-3-create-field-wrapper)
- [Checklist for New Pickers](#checklist-for-new-pickers)
- [Migration from Old Patterns](#migration-from-old-patterns)

---

## Overview

Creating a new picker involves three main steps:
1. Define the create form field configuration
2. Implement the picker component using CorePicker
3. Create a field wrapper for easy integration into forms

All new pickers should follow the CorePicker pattern for consistency.

---

## Step 1: Define Field Configuration

Create a configuration array that defines the fields for the inline creation form.

**Example: Person Picker Fields**

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

**Field Configuration Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `key` | `string` | Yes | Field key in form data |
| `label` | `string` | Yes | Field label |
| `type` | `FieldType` | Yes | Field type (text, email, select, etc.) |
| `required` | `boolean` | No | Whether field is required |
| `placeholder` | `string` | No | Placeholder text |
| `validation` | `ZodSchema` | No | Zod validation schema |
| `options` | `Array<{value, label}>` | No | Options for select fields |
| `render` | `Function` | No | Custom render function for `custom` type |

---

## Step 2: Create Picker Component

Create a new picker component that uses CorePicker and defines entity-specific behavior.

**Example: PeoplePicker Component**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { CorePicker } from '@/components/core-picker'
import { getPeople, createPerson } from '@/lib/actions/people'
import type { Person } from '@/lib/types'
import { toast } from 'sonner'

// 🔴 CRITICAL: Define constants OUTSIDE component to prevent infinite loops
const SEARCH_FIELDS = ['first_name', 'last_name', 'email', 'phone_number'] as const

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
      searchFields={SEARCH_FIELDS} // Use constant defined outside
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

**Key Implementation Points:**

1. **Data Loading** - Fetch items when picker opens
2. **Search Fields** - Define OUTSIDE component as const to prevent infinite loops
3. **Create Handler** - Add newly created items to local list
4. **Selected Item** - Find selected item from items array using ID
5. **Custom Labels** - Provide meaningful button labels
6. **Loading State** - Show loading indicator while fetching

---

## Step 3: Create Field Wrapper

Create a field wrapper component for consistent usage in forms.

**Example: PersonPickerField Component**

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

**Field Wrapper Responsibilities:**
- Display selected value with icon
- Manage picker modal state
- Provide clear/remove functionality
- Show description text
- Pass through picker props

**Usage in Forms:**

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

## Checklist for New Pickers

When creating a new picker, ensure:

- [ ] `searchFields` defined outside component as `const`
- [ ] `createFields` either defined outside OR wrapped in `useMemo` if dynamic
- [ ] `defaultCreateFormData` defined outside as `const` if used
- [ ] No inline arrays `[]` passed to CorePicker
- [ ] No inline objects `{}` passed to CorePicker
- [ ] If picker has no inline creation: pass `enableCreate={false}`
- [ ] Data loads when picker opens (useEffect with `open` dependency)
- [ ] Newly created items are added to local list
- [ ] Custom labels provided (createButtonLabel, addNewButtonLabel)
- [ ] Selected item found from items array using ID
- [ ] Field wrapper created with PickerField
- [ ] Appropriate icon chosen for field wrapper
- [ ] TypeScript generics used for type safety

**See [INFINITE_LOOP_PREVENTION.md](./INFINITE_LOOP_PREVENTION.md) for critical rules on preventing infinite re-renders.**

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
<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Search..." />
  <CommandList>
    {/* Manual filtering and rendering */}
  </CommandList>
  {/* Inline form with manual field rendering */}
</CommandDialog>
```

**After (CorePicker):**
```typescript
<CorePicker<T>
  open={open}
  onOpenChange={setOpen}
  items={items}
  searchFields={SEARCH_FIELDS}
  createFields={fields}
  onCreateSubmit={handleCreate}
  // ... other props
/>
```

---

## Summary

Creating new pickers involves:
1. **Define fields** - Configure create form fields with validation
2. **Implement picker** - Use CorePicker with entity-specific behavior
3. **Create wrapper** - Build field wrapper for form integration

Following this pattern ensures consistency, type safety, and prevents common mistakes like infinite re-renders.

For advanced features like nested pickers, custom form components, and dynamic field visibility, see [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md).
