# Picker System Architecture

> **Purpose:** Core architecture, components, and design patterns of the picker system.
>
> **Related Documentation:**
> - **[CREATING_PICKERS.md](./CREATING_PICKERS.md)** - Step-by-step guide to creating new pickers
> - **[USAGE_PATTERNS.md](./USAGE_PATTERNS.md)** - Common usage patterns and examples
> - **[ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)** - Advanced features and customization
> - **[../PICKER_PATTERNS.md](../PICKER_PATTERNS.md)** - Critical behavioral rules
> - **[../PICKER_EDIT_MODE.md](../PICKER_EDIT_MODE.md)** - Inline editing of related entities

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Core Components](#core-components)
  - [CorePicker](#corepicker)
  - [CorePickerField](#corepickerfield)
  - [PickerField](#pickerfield)
- [Available Pickers](#available-pickers)
- [Field Configuration](#field-configuration)

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

## System Architecture

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

**Layer Responsibilities:**

1. **Application Forms** - Use field wrappers to integrate pickers into forms
2. **Field Wrappers** - Manage picker state and display selected values
3. **Specific Pickers** - Define entity-specific behavior (search fields, create form, rendering)
4. **CorePicker** - Generic implementation of picker UI and behavior

---

## Core Components

### CorePicker

**Location:** `src/components/core-picker.tsx`

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

**Example:**
```typescript
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
  createFields={personCreateFields}
  onCreateSubmit={handleCreatePerson}
/>
```

---

### CorePickerField

**Location:** `src/components/core-picker-field.tsx`

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

### PickerField

**Location:** `src/components/picker-field.tsx`

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

**Example:**
```typescript
<PickerField
  label="Person"
  value={selectedPerson}
  onValueChange={setSelectedPerson}
  showPicker={showPicker}
  onShowPickerChange={setShowPicker}
  icon={User}
  renderValue={(person) => person.full_name}
>
  <PeoplePicker
    open={showPicker}
    onOpenChange={setShowPicker}
    onSelect={setSelectedPerson}
    selectedPersonId={selectedPerson?.id}
  />
</PickerField>
```

---

## Available Pickers

### Current Picker Implementations

| Picker | Entity | Inline Creation | Special Features |
|--------|--------|-----------------|------------------|
| **PeoplePicker** | Person | ✅ Yes | Optional fields: email, phone, sex, note |
| **EventPicker** | Event | ✅ Yes | Nested LocationPicker, timezone selection |
| **LocationPicker** | Location | ✅ Yes | Address fields (street, city, state) |
| **MassPicker** | Mass | ❌ No | Read-only selection |
| **GlobalLiturgicalEventPicker** | GlobalLiturgicalEvent | ❌ No | Year/locale filters |
| **ReadingPickerModal** | Reading | ❌ No | Category/language filters, preview modal |
| **RolePicker** | Role | ✅ Yes | Description and note fields |

**See [USAGE_PATTERNS.md](./USAGE_PATTERNS.md) for detailed props and usage examples for each picker.**

---

## Field Configuration

Picker create forms are configured using `PickerFieldConfig` arrays. This allows dynamic form generation without writing custom form components.

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

**Example Configuration:**
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

**See [CREATING_PICKERS.md](./CREATING_PICKERS.md) for complete guide on field configuration and [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md) for custom field types and nested pickers.**

---

## Save and Cancel Buttons

**🔴 CRITICAL:** Picker dialogs use the same button components as the rest of the application for consistency.

### Button Components

**CorePicker uses:**
- `SaveButton` from `src/components/save-button.tsx` for submit actions
- `CancelButton` from `src/components/cancel-button.tsx` for cancel actions

### SaveButton Features

```typescript
<SaveButton
  isLoading={isCreating}
  loadingText="Saving..."
  disabled={isCreating}
  className="flex-1"
>
  {isEditMode ? updateButtonLabel : createButtonLabel}
</SaveButton>
```

**Features:**
- ✅ Shows Save icon by default (can be hidden with `showIcon={false}`)
- ✅ Shows loading spinner when `isLoading={true}`
- ✅ Automatically replaces content with loading text during submission
- ✅ Consistent with all form save buttons across the app

### CancelButton Features

```typescript
<CancelButton
  onClick={resetForm}
  disabled={isCreating}
>
  Cancel
</CancelButton>
```

**Features:**
- ✅ Supports both `href` (for navigation) and `onClick` (for dialogs)
- ✅ Shows X icon when `showIcon={true}` (default: false)
- ✅ Uses `variant="outline"` by default
- ✅ Consistent with all form cancel buttons across the app

**Note:** The `onClick` variant is used in pickers for dialog contexts, while the `href` variant is used in forms for navigation.

### Why This Matters

Using `SaveButton` and `CancelButton` ensures:
- **Visual Consistency** - All save/cancel actions look the same across the app
- **Icon Standards** - Save icon appears in all save buttons, not just forms
- **Loading States** - Consistent spinner and loading text behavior
- **Accessibility** - Standardized button labels and ARIA attributes
- **Maintainability** - Changes to button styling propagate everywhere automatically

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

## Summary

The picker architecture provides:
- ✅ **Consistency** - Unified UX across all picker modals
- ✅ **Reusability** - Write picker logic once, reuse everywhere
- ✅ **Type Safety** - Full TypeScript support with generics
- ✅ **Flexibility** - Support for simple to complex use cases
- ✅ **Validation** - Built-in Zod validation support
- ✅ **Extensibility** - Custom form components for maximum control

For implementation details, see [CREATING_PICKERS.md](./CREATING_PICKERS.md).
