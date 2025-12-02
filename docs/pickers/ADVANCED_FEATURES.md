# Advanced Picker Features

> **Purpose:** Advanced features, customization patterns, and complex use cases for pickers.
>
> **Related Documentation:**
> - **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Core architecture and components
> - **[CREATING_PICKERS.md](./CREATING_PICKERS.md)** - Creating new pickers
> - **[USAGE_PATTERNS.md](./USAGE_PATTERNS.md)** - Common usage patterns

## Table of Contents

- [Dynamic Field Visibility](#dynamic-field-visibility)
- [Validation with Zod](#validation-with-zod)
- [Nested Pickers (Custom Fields)](#nested-pickers-custom-fields)
- [Context-Aware Suggested Event Names](#context-aware-suggested-event-names)
- [Custom Form Components](#custom-form-components)
- [Memoization Best Practices](#memoization-best-practices)
- [Empty Form Data Constants](#empty-form-data-constants)

---

## Dynamic Field Visibility

Control which optional fields appear in the create form based on context.

**Use Case:** Show different fields for different use cases (e.g., baptism child vs. godparent).

**Example:**

```typescript
// For baptism child - require sex field
<PersonPickerField
  label="Child"
  visibleFields={['email', 'phone_number', 'sex', 'note']}
  requiredFields={['sex']} // Sex required for child
  value={child.value}
  onValueChange={child.setValue}
  showPicker={child.showPicker}
  onShowPickerChange={child.setShowPicker}
  required
/>

// For godparent - don't require sex
<PersonPickerField
  label="Godparent"
  visibleFields={['email', 'phone_number', 'note']}
  // sex field not visible, so not required
  value={godparent.value}
  onValueChange={godparent.setValue}
  showPicker={godparent.showPicker}
  onShowPickerChange={godparent.setShowPicker}
  required
/>
```

**Implementation Pattern:**

```typescript
// In picker component
export function PeoplePicker({
  visibleFields = [],
  requiredFields = [],
  ...props
}: PeoplePickerProps) {
  const createFields = useMemo(() => {
    const fields: PickerFieldConfig[] = [
      // Always visible fields
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
    ]

    // Conditionally add visible fields
    if (visibleFields.includes('email')) {
      fields.push({
        key: 'email',
        label: 'Email',
        type: 'email',
        required: requiredFields.includes('email'),
      })
    }

    if (visibleFields.includes('sex')) {
      fields.push({
        key: 'sex',
        label: 'Sex',
        type: 'select',
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ],
        required: requiredFields.includes('sex'),
      })
    }

    return fields
  }, [visibleFields, requiredFields])

  return (
    <CorePicker
      createFields={createFields}
      // ... other props
    />
  )
}
```

---

## Validation with Zod

Add validation to form fields using Zod schemas.

**Example:**

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
    validation: z
      .string()
      .regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Format: (555) 123-4567'),
  },
  {
    key: 'age',
    label: 'Age',
    type: 'text',
    validation: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => val >= 18, 'Must be 18 or older'),
  },
]
```

**CorePicker automatically:**
- Builds a Zod schema from `createFields`
- Validates form data on submit
- Displays validation errors below fields
- Prevents submission until all validation passes

---

## Nested Pickers (Custom Fields)

Create form fields that include nested pickers using the `custom` field type.

**Use Case:** EventPicker includes a LocationPicker for selecting event location.

**Example:**

```typescript
const createFields: PickerFieldConfig[] = [
  {
    key: 'name',
    label: 'Event Name',
    type: 'text',
    required: true,
  },
  {
    key: 'location_id',
    label: 'Location',
    type: 'custom',
    required: true,
    render: ({ value, onChange, error }) => {
      const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
      const [showLocationPicker, setShowLocationPicker] = useState(false)

      // Load location if value exists
      useEffect(() => {
        if (value && !selectedLocation) {
          loadLocation(value).then(setSelectedLocation)
        }
      }, [value])

      return (
        <div className="space-y-2">
          <Label>Location</Label>
          {selectedLocation ? (
            <div className="flex items-center justify-between p-2 border rounded-md">
              <span>{selectedLocation.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedLocation(null)
                  onChange(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={() => setShowLocationPicker(true)}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Select Location
            </Button>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <LocationPicker
            open={showLocationPicker}
            onOpenChange={setShowLocationPicker}
            onSelect={(loc) => {
              setSelectedLocation(loc)
              onChange(loc.id)
              setShowLocationPicker(false)
            }}
          />
        </div>
      )
    },
  },
]
```

**Custom Field Props:**

The `render` function receives:
- `value` - Current field value
- `onChange` - Function to update field value
- `error` - Validation error message (if any)

---

## Context-Aware Suggested Event Names

Automatically suggest meaningful event names based on form context.

**Feature:** When creating events from module forms (weddings, funerals, baptisms, etc.), the EventPicker can pre-fill the event name field with contextually relevant suggestions based on the people already selected in the form.

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

## Custom Form Components

Replace the default field rendering with a fully custom form component for maximum control.

**Use Cases:**
- Forms with complex interdependencies between fields
- Forms that need to manage multiple nested modals (e.g., Time picker with common times modal)
- Forms requiring custom validation logic beyond Zod schemas
- Forms with dynamic field generation based on external state

**Implementation Pattern:**

**Step 1: Create a custom form component**

```typescript
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CommonTimesModal } from '@/components/common-times-modal'

interface EventFormFieldsProps {
  form: UseFormReturn<Record<string, any>>
  errors: FieldErrors<Record<string, any>>
  isEditMode: boolean
}

export function EventFormFields({
  form,
  errors,
  isEditMode,
}: EventFormFieldsProps) {
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
      {/* Regular form fields */}
      <div className="space-y-2">
        <Label htmlFor="name">Event Name</Label>
        <Input
          id="name"
          value={watch('name') ?? ''}
          onChange={(e) => setValue('name', e.target.value, { shouldValidate: true })}
        />
        {getErrorMessage('name') && (
          <p className="text-sm text-destructive">{getErrorMessage('name')}</p>
        )}
      </div>

      {/* Time field with custom button */}
      <div className="space-y-2">
        <Label htmlFor="start_time">Time</Label>
        <div className="flex gap-2">
          <Input
            id="start_time"
            type="time"
            value={watch('start_time') ?? ''}
            onChange={(e) => setValue('start_time', e.target.value, { shouldValidate: true })}
          />
          <Button
            type="button"
            onClick={() => setShowCommonTimesModal(true)}
          >
            Common Times
          </Button>
        </div>
        {getErrorMessage('start_time') && (
          <p className="text-sm text-destructive">{getErrorMessage('start_time')}</p>
        )}
      </div>

      {/* Custom modal */}
      <CommonTimesModal
        open={showCommonTimesModal}
        onOpenChange={setShowCommonTimesModal}
        onSelectTime={(time) => {
          setValue('start_time', time, { shouldValidate: true })
          setShowCommonTimesModal(false)
        }}
      />
    </>
  )
}
```

**Step 2: Use in your picker**

```typescript
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
```

**Step 3: Or pass inline with props**

```typescript
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

**Important Notes:**

- **`createFields` still required** - CorePicker uses this to build the Zod validation schema
- **Use React Hook Form methods** - `watch('fieldName')` reads values, `setValue('fieldName', value, { shouldValidate: true })` updates
- **No useState needed for form state** - React Hook Form manages everything
- **Clean separation** - Form logic is isolated in the custom component
- **Full React features** - Can use hooks, context, nested components, anything React supports

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

## Memoization Best Practices

Prevent infinite re-renders by memoizing field configurations that are computed dynamically.

**When to use:** When `createFields` depends on props or state.

**Example:**

```typescript
const createFields = useMemo(() => {
  const fields: PickerFieldConfig[] = [
    { key: 'first_name', label: 'First Name', type: 'text', required: true },
    { key: 'last_name', label: 'Last Name', type: 'text', required: true },
  ]

  if (visibleFields?.includes('email')) {
    fields.push({
      key: 'email',
      label: 'Email',
      type: 'email',
      required: requiredFields?.includes('email'),
    })
  }

  if (visibleFields?.includes('phone_number')) {
    fields.push({
      key: 'phone_number',
      label: 'Phone',
      type: 'tel',
      required: requiredFields?.includes('phone_number'),
    })
  }

  return fields
}, [visibleFields, requiredFields])

<CorePicker createFields={createFields} />
```

**See [INFINITE_LOOP_PREVENTION.md](./INFINITE_LOOP_PREVENTION.md) for critical rules on preventing infinite re-renders.**

---

## Empty Form Data Constants

Prevent object re-creation on every render by defining constants outside the component.

**❌ BAD - Creates new object every render:**
```typescript
<CorePicker defaultCreateFormData={{}} />
```

**✅ GOOD - Reuses same object reference:**
```typescript
// Define outside component
const EMPTY_FORM_DATA = {}

<CorePicker defaultCreateFormData={EMPTY_FORM_DATA} />
```

**See [INFINITE_LOOP_PREVENTION.md](./INFINITE_LOOP_PREVENTION.md) for complete details on this critical pattern.**

---

## Summary

This guide covers advanced picker features:
- ✅ Dynamic field visibility based on context
- ✅ Zod validation for complex validation rules
- ✅ Nested pickers using custom fields
- ✅ Context-aware event name suggestions
- ✅ Custom form components for maximum control
- ✅ Memoization and constant patterns for performance

For critical rules on preventing infinite re-renders, see [INFINITE_LOOP_PREVENTION.md](./INFINITE_LOOP_PREVENTION.md).
