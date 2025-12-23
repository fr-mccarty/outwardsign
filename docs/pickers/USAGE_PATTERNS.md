# Picker Usage Patterns

> **Purpose:** Common usage patterns and examples for picker components.
>
> **Related Documentation:**
> - **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Core architecture and components
> - **[CREATING_PICKERS.md](./CREATING_PICKERS.md)** - Creating new pickers
> - **[ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)** - Advanced features and customization

## Table of Contents

- [Basic Usage Patterns](#basic-usage-patterns)
  - [Pattern 1: Basic Usage in Forms](#pattern-1-basic-usage-in-forms)
  - [Pattern 2: React Hook Form Integration](#pattern-2-react-hook-form-integration)
  - [Pattern 3: Auto-Open Create Form](#pattern-3-auto-open-create-form)
  - [Pattern 4: Pre-fill Create Form](#pattern-4-pre-fill-create-form)
  - [Pattern 5: Custom List Item Rendering](#pattern-5-custom-list-item-rendering)
- [Existing Pickers Reference](#existing-pickers-reference)
  - [PeoplePicker](#peoplepicker)
  - [EventPicker](#eventpicker)
  - [LocationPicker](#locationpicker)
  - [MassPicker](#masspicker)
  - [LiturgicalCalendarEventPicker](#globalliturgicaleventpicker)
  - [ReadingPickerModal](#readingpickermodal)
  - [RolePicker](#rolepicker)
- [usePickerState Hook](#usepickerstate-hook)

---

## Basic Usage Patterns

### Pattern 1: Basic Usage in Forms

Use the `usePickerState` hook to manage picker state and integrate with forms.

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

**When to use:** Standard form integration without React Hook Form.

---

### Pattern 2: React Hook Form Integration

Use `CorePickerField` to integrate directly with React Hook Form.

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

**When to use:** Forms using React Hook Form for validation and state management.

---

### Pattern 3: Auto-Open Create Form

Automatically open the create form when the picker opens. Useful when you know the user needs to create a new item.

```typescript
<PeoplePicker
  open={showPicker}
  onOpenChange={setShowPicker}
  onSelect={handleSelect}
  autoOpenCreateForm={true} // Opens create form immediately
/>
```

**When to use:**
- User is creating a new entity and will likely create related entities
- No existing items in the list
- Workflow emphasizes creating new items

---

### Pattern 4: Pre-fill Create Form

Pass default values to the create form to pre-populate fields.

**Option 1: Using `defaultName` prop (for event pickers)**

```typescript
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
```

**Option 2: Using `defaultCreateFormData` for multiple fields**

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

**Note:** When both `defaultName` and `defaultCreateFormData.name` are provided, `defaultCreateFormData.name` takes precedence (spread order: `{ name: defaultName, ...defaultCreateFormData }`).

**When to use:**
- Context-aware suggestions based on form data (e.g., wedding couple names)
- Module-specific defaults (e.g., "Holy Mass" for mass events)
- User preferences or last-used values

---

### Pattern 5: Custom List Item Rendering

Customize how items appear in the selection list.

```typescript
const renderPersonItem = (person: Person) => (
  <div className="flex items-center gap-3">
    <Avatar className="h-8 w-8">
      <AvatarFallback>
        {person.first_name[0]}{person.last_name[0]}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <div className="font-medium">
        {person.first_name} {person.last_name}
      </div>
      <div className="text-sm text-muted-foreground">
        {person.email}
      </div>
    </div>
  </div>
)

<CorePicker<Person>
  renderItem={renderPersonItem}
  // ... other props
/>
```

**When to use:**
- Display additional information in list (email, phone, status)
- Show icons, avatars, or badges
- Highlight important fields or status

---

## Existing Pickers Reference

### PeoplePicker

**Entity:** Person
**Inline Creation:** ✅ Yes
**Special Features:** Optional fields for email, phone, sex, note

**Props:**

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

**Example:**

```typescript
<PersonPickerField
  label="Child"
  value={child.value}
  onValueChange={child.setValue}
  showPicker={child.showPicker}
  onShowPickerChange={child.setShowPicker}
  visibleFields={['email', 'phone_number', 'sex', 'note']}
  requiredFields={['sex']} // Sex required for baptism child
  required
/>
```

---

### EventPicker

**Entity:** Event
**Inline Creation:** ✅ Yes
**Special Features:** Nested LocationPicker, timezone selection, context-aware name suggestions

**Props:**

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
- `defaultName` - Pre-fills the event name field. Useful for setting module-specific defaults (e.g., "Holy Mass" for masses, "Wedding" for weddings)
- `defaultRelatedEventType` - Sets the event type (e.g., "MASS", "WEDDING", "FUNERAL")

**Visible Fields:**
- `location` - Nested LocationPicker (custom field)
- `note` - Notes textarea

**Always Visible:**
- `name` - Event name (required)
- `start_date` - Date (required)
- `start_time` - Time (required)
- `timezone` - Timezone select (required)

**Example:**

```typescript
const suggestedEventName = useMemo(() => {
  const brideLastName = bride.value?.last_name
  const groomLastName = groom.value?.last_name

  if (brideLastName && groomLastName) {
    return `${brideLastName}-${groomLastName} Wedding`
  }
  return 'Wedding'
}, [bride.value, groom.value])

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

---

### LocationPicker

**Entity:** Location
**Inline Creation:** ✅ Yes
**Special Features:** Address fields (street, city, state, country)

**Props:**

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

**Example:**

```typescript
<LocationPickerField
  label="Reception Venue"
  value={location.value}
  onValueChange={location.setValue}
  showPicker={location.showPicker}
  onShowPickerChange={location.setShowPicker}
  visibleFields={['street', 'city', 'state', 'phone_number']}
  requiredFields={['street', 'city', 'state']}
/>
```

---

### MassPicker

**Entity:** Mass
**Inline Creation:** ❌ No
**Special Features:** Read-only selection from scheduled masses

**Props:**

```typescript
interface MassPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (mass: Mass) => void
  selectedMassId?: string
}
```

**Usage:**

```typescript
<MassPickerField
  label="Mass"
  value={mass.value}
  onValueChange={mass.setValue}
  showPicker={mass.showPicker}
  onShowPickerChange={mass.setShowPicker}
  required
/>
```

---

### LiturgicalCalendarEventPicker

**Entity:** LiturgicalCalendarEvent
**Inline Creation:** ❌ No
**Special Features:** Year and locale filters

**Props:**

```typescript
interface LiturgicalCalendarEventPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (event: LiturgicalCalendarEvent) => void
  selectedEventId?: string
  year?: number // Filter by year
  locale?: string // Filter by locale
}
```

**Usage:**

```typescript
<LiturgicalCalendarEventPicker
  open={showPicker}
  onOpenChange={setShowPicker}
  onSelect={handleSelect}
  year={2025}
  locale="en-US"
/>
```

---

### ReadingPickerModal

**Entity:** Reading
**Inline Creation:** ❌ No
**Special Features:** Category and language filters, preview modal

**Props:**

```typescript
interface ReadingPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (reading: Reading) => void
  category?: 'old_testament' | 'new_testament' | 'gospel' | 'psalm'
  language?: 'en' | 'es'
}
```

**Usage:**

```typescript
<ReadingPickerModal
  open={showPicker}
  onOpenChange={setShowPicker}
  onSelect={handleSelect}
  category="gospel"
  language="en"
/>
```

---

### RolePicker

**Entity:** Role
**Inline Creation:** ✅ Yes
**Special Features:** Description and note fields

**Props:**

```typescript
interface RolePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (role: Role) => void
  selectedRoleId?: string
  autoOpenCreateForm?: boolean
}
```

**Usage:**

```typescript
<RolePickerField
  label="Role"
  value={role.value}
  onValueChange={role.setValue}
  showPicker={role.showPicker}
  onShowPickerChange={role.setShowPicker}
/>
```

---

## usePickerState Hook

Reduces boilerplate for managing picker state.

**Location:** `src/hooks/use-picker-state.ts`

**Usage:**

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

**What it provides:**
- `value` - Currently selected value (T | null)
- `setValue` - Function to update value
- `showPicker` - Boolean for picker modal state
- `setShowPicker` - Function to toggle picker modal

---

## Summary

This guide covers:
- ✅ Basic usage patterns for common scenarios
- ✅ Complete reference for all existing pickers
- ✅ Props and examples for each picker type
- ✅ usePickerState hook for state management

For advanced features like nested pickers, custom form components, and dynamic field visibility, see [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md).
