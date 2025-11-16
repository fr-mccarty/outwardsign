# Component Registry

A comprehensive catalog of reusable components in the Outward Sign application. This registry helps AI agents and developers quickly understand component purposes without reading source code.

---

## Table of Contents

- [Form Components](#form-components)
- [Picker Components](#picker-components)
- [Layout Components](#layout-components)
- [Display Components](#display-components)
- [UI Components (shadcn/ui)](#ui-components-shadcnui)

---

## Form Components

### FormField
**Path:** `src/components/ui/form-field.tsx`

**Purpose:** All-in-one form field component that takes props and internally renders the complete field structure (Label + Input/Textarea/Select + description + error message). Provides consistent styling, accessibility, and layout for all form inputs.

**CRITICAL:** ALL form inputs, selects, and textareas MUST use this component.

**How it works:** FormField is a **props-based component** - you pass field configuration as props, and it renders everything internally including the label (connected via `htmlFor`/`id`), the input, optional description, and error messages.

**Current Limitation:** FormField currently supports plain inputs (text, email, password), textareas, and select dropdowns only. It does NOT support checkboxes, radio buttons, date pickers, file uploads, or other complex form elements. For those, use the base shadcn/ui components directly with proper Label association.

**Props:**
- `id` (required): Field identifier
- `label` (required): Field label text
- `value` (required): Current field value
- `onChange` (required): Value change handler
- `inputType`: `'text' | 'email' | 'password' | 'textarea' | 'select'` (default: 'text')
- `description`: Optional help text below label
- `required`: Show required indicator
- `disabled`: Disable the field
- `error`: Validation error message
- `placeholder`: Placeholder text
- `options`: Array of `{value, label}` for select inputs
- `rows`: Number of rows for textarea
- `maxLength`: Max character length

**Usage:**
```tsx
// Text input
<FormField
  id="first_name"
  label="First Name"
  value={firstName}
  onChange={setFirstName}
  required
/>

// Textarea
<FormField
  id="notes"
  label="Notes"
  inputType="textarea"
  value={notes}
  onChange={setNotes}
  rows={12}
/>

// Select
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

---

### SaveButton
**Path:** `src/components/save-button.tsx`

**Purpose:** Standardized save button with loading state and spinner.

**Props:**
- `isLoading`: Show loading spinner and disable button
- `children`: Button text (default: "Save")
- Standard Button props

**Usage:**
```tsx
<SaveButton isLoading={isSubmitting}>
  Save Wedding
</SaveButton>
```

---

### CancelButton
**Path:** `src/components/cancel-button.tsx`

**Purpose:** Standardized cancel button with consistent styling and routing.

**Props:**
- `href`: Navigation target (required)
- `children`: Button text (default: "Cancel")

**Usage:**
```tsx
<CancelButton href="/weddings">
  Cancel
</CancelButton>
```

---

### FormBottomActions
**Path:** `src/components/form-bottom-actions.tsx`

**Purpose:** Standardized form action buttons at bottom of forms (Cancel + Submit).

**Props:**
- `onCancel`: Cancel handler function
- `isLoading`: Loading state for submit button
- `submitLabel`: Custom submit button text

**Usage:**
```tsx
<FormBottomActions
  onCancel={() => router.push('/weddings')}
  isLoading={isSubmitting}
  submitLabel="Create Wedding"
/>
```

---

### EventFormFields
**Path:** `src/components/event-form-fields.tsx`

**Purpose:** Reusable event form fields component for creating/editing events. Provides consistent event field UI across the application.

**Key Features:**
- Standard event fields: name, date, time, timezone, location, note
- Integrated LocationPicker for location selection
- CommonTimesModal for quick time selection
- Configurable visible/required fields
- Automatic location state management
- Error handling and validation display

**Props:**
- `formData`: Form data object
- `setFormData`: Form data setter function
- `errors`: Validation errors object
- `isEditMode`: Whether in edit mode
- `visibleFields`: Array of field names to show (default: `['location', 'note']`)
- `requiredFields`: Array of field names that are required

**Usage:**
```tsx
const [formData, setFormData] = useState({
  name: '',
  start_date: '',
  start_time: '',
  timezone: 'America/Chicago',
  location_id: null,
  note: ''
})
const [errors, setErrors] = useState({})

<EventFormFields
  formData={formData}
  setFormData={setFormData}
  errors={errors}
  isEditMode={false}
  visibleFields={['location', 'note']}
  requiredFields={['location']}
/>
```

---

### OfferingAmountInput
**Path:** `src/components/offering-amount-input.tsx`

**Purpose:** Specialized input for monetary offering amounts with quick amount buttons.

**Key Features:**
- Dollar input with automatic formatting
- Quick amount buttons popover
- Custom amount creation with labels
- Saves custom amounts to parish settings
- Optimistic UI updates
- Converts between cents and dollars automatically

**Props:**
- `id`: Input ID (default: 'offering-amount')
- `label`: Field label (default: 'Offering Amount')
- `value`: Current dollar value as string
- `onChange`: Value change handler
- `quickAmounts`: Array of `{amount: number (cents), label: string}`
- `placeholder`: Placeholder text
- `required`: Mark as required
- `className`: Additional CSS classes
- `parishId`: Parish ID for saving custom amounts
- `onQuickAmountAdded`: Callback when custom amount added

**Usage:**
```tsx
const [offeringAmount, setOfferingAmount] = useState('5.00')

<OfferingAmountInput
  label="Offering Amount"
  value={offeringAmount}
  onChange={setOfferingAmount}
  quickAmounts={[
    { amount: 100, label: '$1' },
    { amount: 500, label: '$5' },
    { amount: 1000, label: '$10' }
  ]}
  required
/>
```

**Hook - useOfferingAmount:**
```tsx
const {
  dollarValue,
  setDollarValue,
  setValueFromCents,
  getValueInCents
} = useOfferingAmount(500) // Initialize with 500 cents ($5.00)
```

---

### CommonTimesModal
**Path:** `src/components/common-times-modal.tsx`

**Purpose:** Modal for selecting common liturgical service times.

**Key Features:**
- Grid of common Mass times (7 AM - 7 PM)
- Quick selection
- Used by EventFormFields and event pickers

**Props:**
- `open`: Modal visibility state
- `onOpenChange`: Modal state handler
- `onSelectTime`: Callback when time selected (receives time string like '09:00')

**Usage:**
```tsx
const [showTimesModal, setShowTimesModal] = useState(false)

<CommonTimesModal
  open={showTimesModal}
  onOpenChange={setShowTimesModal}
  onSelectTime={(time) => {
    setEventTime(time)
  }}
/>
```

---

### DeleteRowDialog
**Path:** `src/components/delete-row-dialog.tsx`

**Purpose:** Confirmation dialog for deleting table rows/entities.

---

### CenteredFormCard
**Path:** `src/components/centered-form-card.tsx`

**Purpose:** Centered card wrapper for authentication and onboarding forms.

---

### CopyButton
**Path:** `src/components/copy-button.tsx`

**Purpose:** Button to copy text to clipboard with success feedback.

---

### PrintButton
**Path:** `src/components/print-button.tsx`

**Purpose:** Button to trigger browser print dialog.

---

### TestingBanner
**Path:** `src/components/testing-banner.tsx`

**Purpose:** Banner displayed in test environments to indicate test mode.

---

## Picker Components

> **For detailed picker documentation:**
> - **[PICKERS.md](./PICKERS.md)** - Architecture, creating new pickers, advanced patterns
> - **[PICKER_PATTERNS.md](./PICKER_PATTERNS.md)** - Critical behavioral rules (no redirect, auto-select)
> - **[PICKER_EDIT_MODE.md](./PICKER_EDIT_MODE.md)** - Inline editing pattern

### PeoplePicker
**Path:** `src/components/people-picker.tsx`

**Purpose:** Modal dialog for searching and selecting people from parish directory with inline person creation.

**Key Features:**
- Debounced search
- Avatar display with initials
- Inline person creation form
- Auto-select newly created person
- NO REDIRECT after creation (stays in parent form)

**Props:**
- `open`: Control modal visibility
- `onOpenChange`: Modal state handler
- `onSelect`: Callback when person is selected
- `selectedPersonId`: Highlight selected person
- `placeholder`: Search placeholder text
- `emptyMessage`: Empty state message
- `visibleFields`: Array of optional fields to show: `['email', 'phone_number', 'sex', 'note']`
- `openToNewPerson`: Auto-open create form when no person is selected (use `!value`)

**Usage:**
```tsx
const bride = usePickerState<Person>()

<PeoplePicker
  open={bride.showPicker}
  onOpenChange={bride.setShowPicker}
  onSelect={bride.setValue}
  selectedPersonId={bride.value?.id}
  openToNewPerson={!bride.value}
/>
```

---

### EventPicker
**Path:** `src/components/event-picker.tsx`

**Purpose:** Modal dialog for searching and selecting events with inline event creation.

**Key Features:**
- Search with debouncing
- Event date/time/location display
- Inline event creation form
- Auto-select newly created event
- NO REDIRECT after creation

**Props:**
- `open`: Control modal visibility
- `onOpenChange`: Modal state handler
- `onSelect`: Callback when event is selected
- `selectedEventId`: Highlight selected event
- `openToNewEvent`: Auto-open create form when no event is selected (use `!value`)

**Usage:**
```tsx
const event = usePickerState<Event>()

<EventPicker
  open={event.showPicker}
  onOpenChange={event.setShowPicker}
  onSelect={event.setValue}
  selectedEventId={event.value?.id}
  openToNewEvent={!event.value}
/>
```

---

### LocationPicker
**Path:** `src/components/location-picker.tsx`

**Purpose:** Modal dialog for searching and selecting locations with inline location creation.

**Props:**
- `open`: Control modal visibility
- `onOpenChange`: Modal state handler
- `onSelect`: Callback when location is selected
- `selectedLocationId`: Highlight selected location

---

### ReadingPickerModal
**Path:** `src/components/reading-picker-modal.tsx`

**Purpose:** Modal dialog for selecting scripture readings with category filtering.

**Props:**
- `open`: Control modal visibility
- `onOpenChange`: Modal state handler
- `onSelect`: Callback when reading is selected

---

### RolePicker
**Path:** `src/components/role-picker.tsx`

**Purpose:** Dropdown for selecting liturgical ministry roles (Lector, EMHC, Altar Server, etc.).

**Key Features:**
- Bilingual role labels (English/Spanish)
- Dropdown select interface
- Role constants from `MASS_ROLE_LABELS`

**Props:**
- `value`: Current role
- `onChange`: Role change handler

**Usage:**
```tsx
<RolePicker
  value={selectedRole}
  onChange={setSelectedRole}
/>
```

---

### MassPicker
**Path:** `src/components/mass-picker.tsx`

**Purpose:** Modal dialog for searching and selecting scheduled masses.

**Key Features:**
- Search masses by title or date
- Display mass date/time and liturgical event
- Debounced search
- Auto-select newly created mass

**Props:**
- `open`: Control modal visibility
- `onOpenChange`: Modal state handler
- `onSelect`: Callback when mass is selected
- `selectedMassId`: Highlight selected mass

**Usage:**
```tsx
const mass = usePickerState<Mass>()

<MassPicker
  open={mass.showPicker}
  onOpenChange={mass.setShowPicker}
  onSelect={mass.setValue}
  selectedMassId={mass.value?.id}
/>
```

---

#### MassPickerField
**Path:** `src/components/mass-picker-field.tsx`

**Purpose:** Standardized wrapper for MassPicker with consistent button UI.

**Props:**
- `label`: Field label
- `value`: Selected Mass | null
- `onValueChange`: Mass change handler
- `showPicker`: Picker visibility state
- `onShowPickerChange`: Picker visibility handler
- `description`: Optional help text
- `placeholder`: Button text when no mass selected
- `required`: Show required indicator

**Usage with usePickerState:**
```tsx
import { usePickerState } from '@/hooks/use-picker-state'
import { MassPickerField } from '@/components/mass-picker-field'

const assignedMass = usePickerState<MassWithNames>()

<MassPickerField
  label="Assigned Mass"
  value={assignedMass.value}
  onValueChange={assignedMass.setValue}
  showPicker={assignedMass.showPicker}
  onShowPickerChange={assignedMass.setShowPicker}
  description="The Mass for this intention"
  placeholder="Select Mass"
/>
```

---

### GlobalLiturgicalEventPicker
**Path:** `src/components/global-liturgical-event-picker.tsx`

**Purpose:** Modal dialog for selecting global liturgical calendar events (feasts, solemnities, holy days).

**Key Features:**
- Search by event name or date
- Filter by liturgical season
- Display liturgical rank (Solemnity, Feast, Memorial)
- Bilingual event names (English/Spanish)

**Props:**
- `open`: Control modal visibility
- `onOpenChange`: Modal state handler
- `onSelect`: Callback when liturgical event is selected
- `selectedEventId`: Highlight selected event

**Usage:**
```tsx
const liturgicalEvent = usePickerState<GlobalLiturgicalEvent>()

<GlobalLiturgicalEventPicker
  open={liturgicalEvent.showPicker}
  onOpenChange={liturgicalEvent.setShowPicker}
  onSelect={liturgicalEvent.setValue}
  selectedEventId={liturgicalEvent.value?.id}
/>
```

---

#### LiturgicalEventPickerField
**Path:** `src/components/liturgical-event-picker-field.tsx`

**Purpose:** Standardized wrapper for GlobalLiturgicalEventPicker with consistent button UI.

**Props:**
- `label`: Field label
- `value`: Selected GlobalLiturgicalEvent | null
- `onValueChange`: Event change handler
- `showPicker`: Picker visibility state
- `onShowPickerChange`: Picker visibility handler
- `description`: Optional help text
- `placeholder`: Button text when no event selected
- `required`: Show required indicator

**Usage with usePickerState:**
```tsx
import { usePickerState } from '@/hooks/use-picker-state'
import { LiturgicalEventPickerField } from '@/components/liturgical-event-picker-field'

const liturgicalEvent = usePickerState<GlobalLiturgicalEvent>()

<LiturgicalEventPickerField
  label="Liturgical Event"
  value={liturgicalEvent.value}
  onValueChange={liturgicalEvent.setValue}
  showPicker={liturgicalEvent.showPicker}
  onShowPickerChange={liturgicalEvent.setShowPicker}
  description="The liturgical calendar event for this Mass"
  placeholder="Select Liturgical Event"
/>
```

---

### 🔴 Picker Wrapper Components (RECOMMENDED PATTERN)

**CRITICAL:** Always use wrapper components (`PersonPickerField`, `EventPickerField`, `LocationPickerField`) instead of direct picker components. These wrappers provide consistent UI and reduce boilerplate code.

#### PersonPickerField
**Path:** `src/components/person-picker-field.tsx`

**Purpose:** Standardized wrapper for PeoplePicker that provides consistent button UI and state management.

**Props:**
- `label`: Field label
- `value`: Selected Person | null
- `onValueChange`: Person change handler
- `showPicker`: Picker visibility state
- `onShowPickerChange`: Picker visibility handler
- `placeholder`: Button text when no person selected
- `required`: Show required indicator
- `openToNewPerson`: Auto-open create form when no person is selected (use `!value`, default: false)
- `visibleFields`: Array of optional fields to show: `['email', 'phone_number', 'sex', 'note']`
- `error`: Validation error message

**Usage with usePickerState:**
```tsx
import { usePickerState } from '@/hooks/use-picker-state'
import { PersonPickerField } from '@/components/person-picker-field'

const bride = usePickerState<Person>()

<PersonPickerField
  label="Bride"
  value={bride.value}
  onValueChange={bride.setValue}
  showPicker={bride.showPicker}
  onShowPickerChange={bride.setShowPicker}
  placeholder="Select Bride"
  openToNewPerson={!bride.value}
/>
```

---

#### EventPickerField
**Path:** `src/components/event-picker-field.tsx`

**Purpose:** Standardized wrapper for EventPicker with consistent button UI.

**Props:**
- `label`: Field label
- `value`: Selected Event | null
- `onValueChange`: Event change handler
- `showPicker`: Picker visibility state
- `onShowPickerChange`: Picker visibility handler
- `placeholder`: Button text when no event selected
- `required`: Show required indicator
- `openToNewEvent`: Auto-open create form when no event is selected (use `!value`, default: false)
- `defaultEventType`: Default event type for creation (e.g., "MASS", "WEDDING", "FUNERAL")
- `defaultName`: Pre-fills the event name field in create form - useful for module-specific defaults like "Holy Mass" for masses
- `disableSearch`: Disable search functionality
- `error`: Validation error message
- `visibleFields`: Optional fields to show in create form (e.g., `['location', 'note']`)
- `requiredFields`: Fields that should be marked as required
- `defaultCreateFormData`: Additional default values for create form

**Usage with usePickerState:**
```tsx
import { usePickerState } from '@/hooks/use-picker-state'
import { EventPickerField } from '@/components/event-picker-field'

// Example 1: Wedding event
const weddingEvent = usePickerState<Event>()

<EventPickerField
  label="Wedding Ceremony"
  value={weddingEvent.value}
  onValueChange={weddingEvent.setValue}
  showPicker={weddingEvent.showPicker}
  onShowPickerChange={weddingEvent.setShowPicker}
  placeholder="Select Wedding Event"
  openToNewEvent={!weddingEvent.value}
  defaultEventType="WEDDING"
  defaultName="Wedding Ceremony"
  disableSearch={true}
/>

// Example 2: Mass event with default name
const massEvent = usePickerState<Event>()

<EventPickerField
  label="Mass Event"
  description="Date, time, and location of the Mass"
  value={massEvent.value}
  onValueChange={massEvent.setValue}
  showPicker={massEvent.showPicker}
  onShowPickerChange={massEvent.setShowPicker}
  defaultEventType="MASS"
  defaultName="Holy Mass"
  openToNewEvent={!massEvent.value}
/>
```

---

#### LocationPickerField
**Path:** `src/components/location-picker-field.tsx`

**Purpose:** Standardized wrapper for LocationPicker with consistent button UI.

**Props:**
- `label`: Field label
- `value`: Selected Location | null
- `onValueChange`: Location change handler
- `showPicker`: Picker visibility state
- `onShowPickerChange`: Picker visibility handler
- `placeholder`: Button text when no location selected
- `description`: Optional help text
- `required`: Show required indicator
- `openToNewLocation`: Auto-open create form when no location is selected (use `!value`, default: false)

**Usage with usePickerState:**
```tsx
import { usePickerState } from '@/hooks/use-picker-state'
import { LocationPickerField } from '@/components/location-picker-field'

const location = usePickerState<Location>()

<LocationPickerField
  label="Location"
  value={location.value}
  onValueChange={location.setValue}
  showPicker={location.showPicker}
  onShowPickerChange={location.setShowPicker}
  placeholder="Select Location"
  description="Where the event will take place"
  openToNewLocation={!location.value}
/>
```

---

### usePickerState Hook
**Path:** `src/hooks/use-picker-state.ts`

**Purpose:** Standardized state management for picker components. Reduces boilerplate by managing both the selected value and the picker modal visibility in a single hook.

**Returns:**
```tsx
{
  value: T | null,           // Currently selected value
  setValue: (value: T | null) => void,  // Update selected value
  showPicker: boolean,       // Picker modal visibility
  setShowPicker: (show: boolean) => void  // Toggle picker modal
}
```

**Usage:**
```tsx
import { usePickerState } from '@/hooks/use-picker-state'
import type { Person, Event, Location } from '@/lib/types'

// In your component
const bride = usePickerState<Person>()
const groom = usePickerState<Person>()
const weddingEvent = usePickerState<Event>()
const location = usePickerState<Location>()

// Access values
const brideId = bride.value?.id
const eventDate = weddingEvent.value?.start_date

// Update values
bride.setValue(newPerson)
weddingEvent.setValue(newEvent)

// Control picker visibility
bride.setShowPicker(true)  // Open picker
weddingEvent.setShowPicker(false)  // Close picker
```

---

### 🎯 Picker Best Practices

**✅ DO:**
1. Always use `usePickerState` hook for state management
2. Always use wrapper components (`PersonPickerField`, `EventPickerField`, `LocationPickerField`)
3. Pass `openToNewPerson/openToNewEvent/openToNewLocation={!value}` to auto-open create forms when field is empty (e.g., `openToNewPerson={!presider.value}`)
4. Access selected values via `.value` property (e.g., `bride.value?.id`)
5. Use defensive event handling in picker forms (already implemented in base components)

**❌ DON'T:**
1. Use direct picker components (`PeoplePicker`, `EventPicker`, `LocationPicker`) in forms
2. Manually manage picker state with `useState` (use `usePickerState` instead)
3. Add `router.push()` after creating entities from pickers (already handled - stays in parent form)
4. Create custom button UI for pickers (use wrapper components)

**Example: Full Form Pattern**
```tsx
'use client'

import { useState } from 'react'
import { usePickerState } from '@/hooks/use-picker-state'
import { PersonPickerField } from '@/components/person-picker-field'
import { EventPickerField } from '@/components/event-picker-field'
import type { Person, Event } from '@/lib/types'

export function MyForm({ initialData }: MyFormProps) {
  const isEditing = !!initialData

  // Picker state (1 line per picker!)
  const bride = usePickerState<Person>()
  const groom = usePickerState<Person>()
  const weddingEvent = usePickerState<Event>()

  // Initialize in edit mode
  useEffect(() => {
    if (initialData) {
      bride.setValue(initialData.bride)
      groom.setValue(initialData.groom)
      weddingEvent.setValue(initialData.wedding_event)
    }
  }, [initialData])

  // Submit handler
  const handleSubmit = async () => {
    const data = {
      bride_id: bride.value?.id,
      groom_id: groom.value?.id,
      wedding_event_id: weddingEvent.value?.id,
    }
    // ... submit logic
  }

  return (
    <form onSubmit={handleSubmit}>
      <PersonPickerField
        label="Bride"
        value={bride.value}
        onValueChange={bride.setValue}
        showPicker={bride.showPicker}
        onShowPickerChange={bride.setShowPicker}
        placeholder="Select Bride"
        openToNewPerson={!bride.value}
      />

      <PersonPickerField
        label="Groom"
        value={groom.value}
        onValueChange={groom.setValue}
        showPicker={groom.showPicker}
        onShowPickerChange={groom.setShowPicker}
        placeholder="Select Groom"
        openToNewPerson={!groom.value}
      />

      <EventPickerField
        label="Wedding Ceremony"
        value={weddingEvent.value}
        onValueChange={weddingEvent.setValue}
        showPicker={weddingEvent.showPicker}
        onShowPickerChange={weddingEvent.setShowPicker}
        placeholder="Select Wedding Event"
        openToNewEvent={!weddingEvent.value}
        defaultEventType="WEDDING"
        defaultName="Wedding Ceremony"
      />

      {/* Submit button */}
    </form>
  )
}
```

**Migration from Old Pattern:**
```tsx
// ❌ OLD PATTERN (Don't use)
const [bride, setBride] = useState<Person | null>(null)
const [showBridePicker, setShowBridePicker] = useState(false)

<Button onClick={() => setShowBridePicker(true)}>
  {bride ? `${bride.first_name} ${bride.last_name}` : 'Select Bride'}
</Button>

<PeoplePicker
  open={showBridePicker}
  onOpenChange={setShowBridePicker}
  onSelect={setBride}
  selectedPersonId={bride?.id}
/>

// ✅ NEW PATTERN (Use this)
const bride = usePickerState<Person>()

<PersonPickerField
  label="Bride"
  value={bride.value}
  onValueChange={bride.setValue}
  showPicker={bride.showPicker}
  onShowPickerChange={bride.setShowPicker}
  placeholder="Select Bride"
  openToNewPerson={!bride.value}
/>
```

---

## Layout Components

### PageContainer
**Path:** `src/components/page-container.tsx`

**Purpose:** Standard page wrapper with consistent padding and max-width.

**Usage:**
```tsx
<PageContainer>
  <h1>Page Title</h1>
  {/* Page content */}
</PageContainer>
```

---

### BreadcrumbSetter
**Path:** `src/components/breadcrumb-setter.tsx`

**Purpose:** Client component that sets breadcrumbs in context. Returns null (invisible).

**Props:**
- `breadcrumbs`: Array of `{label, href}` objects

**Usage:**
```tsx
// In server component
const breadcrumbs = [
  { label: 'Weddings', href: '/weddings' },
  { label: wedding.id, href: `/weddings/${wedding.id}` }
]

<BreadcrumbSetter breadcrumbs={breadcrumbs} />
```

---

### MainSidebar
**Path:** `src/components/main-sidebar.tsx`

**Purpose:** Application navigation sidebar with module links and icons.

**Module Icons (Source of Truth):**
- Weddings: `VenusAndMars`
- Funerals: `Cross`
- Baptisms: `Droplet`
- Presentations: `HandHeartIcon`
- Quinceañeras: `BookHeart`
- Confirmations: `Flame`

---

## Display Components

### ListViewCard
**Path:** `src/components/list-view-card.tsx`

**Purpose:** Reusable card component for displaying entities in list views with consistent layout and optional status badge.

**Key Features:**
- Title in upper left (truncates automatically)
- Optional status badge between title and edit button
- Edit icon button in upper right
- Custom content area (passed as children)
- View button in bottom right
- Hover shadow effect
- Responsive design

**Props:**
- `title`: Card title (required) - will truncate if status present
- `editHref`: Link to edit page (required)
- `viewHref`: Link to view/detail page (required)
- `viewButtonText`: Text for view button (default: "View Details")
- `status`: Optional status value - automatically renders ModuleStatusLabel
- `statusType`: Status type ('module') - default: 'module'
- `language`: Optional language code - automatically renders plain text below title
- `children`: Card content (required)

**Layout:**
```
┌─────────────────────────────────────────┐
│ Title...     [Status Badge]    [Edit ✏️] │
│ Language Text                            │  ← Language as plain text
│─────────────────────────────────────────│
│ Content from children prop               │
│                         [Preview Button] │
└─────────────────────────────────────────┘
```

**Usage (with status and language):**
```tsx
<ListViewCard
  title="Wedding"
  editHref={`/weddings/${wedding.id}/edit`}
  viewHref={`/weddings/${wedding.id}`}
  viewButtonText="Preview"
  status={wedding.status}                      // ← Automatically renders status badge
  statusType="module"
  language={wedding.wedding_event?.language}   // ← Automatically renders language text
>
  {/* Date/time info */}
  {wedding.wedding_event && (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <Calendar className="h-3 w-3" />
      {formatDatePretty(wedding.wedding_event.start_date)}
    </div>
  )}

  {/* Entity details */}
  <div className="text-sm space-y-1">
    <p className="text-muted-foreground">
      <span className="font-medium">Bride:</span> {wedding.bride.first_name}
    </p>
  </div>
</ListViewCard>
```

**Usage (without status):**
```tsx
<ListViewCard
  title={person.first_name + ' ' + person.last_name}
  editHref={`/people/${person.id}/edit`}
  viewHref={`/people/${person.id}`}
>
  <div className="text-sm">
    <p>{person.email}</p>
    <p>{person.phone_number}</p>
  </div>
</ListViewCard>
```

**Notes:**
- Do NOT import ModuleStatusLabel in list-client files - ListViewCard handles it automatically
- Title will truncate with `line-clamp-1` to make room for status badge
- Language appears as plain text directly below title when `language` prop is provided
- Language source varies by module:
  - Events: `event.language`
  - Readings: `reading.language`
  - Sacrament modules: `entity.[entity]_event?.language`
  - Masses: `mass.event?.language`

---

### ModuleStatusLabel
**Path:** `src/components/module-status-label.tsx`

**Purpose:** Display status badges for modules, masses, and mass intentions with appropriate styling and labels.

**Key Features:**
- Supports three status types: module, mass, mass-intention
- Bilingual labels (English/Spanish)
- Automatic color/variant selection based on status
- Fallback to default status if none provided

**Props:**
- `status`: Status string (optional, defaults to type-specific default)
- `statusType`: Type of status ('module' | 'mass' | 'mass-intention')
- `variant`: Override badge variant (optional)
- `className`: Additional CSS classes

**Usage:**
```tsx
// Module status (weddings, funerals, etc.)
<ModuleStatusLabel status="ACTIVE" statusType="module" />
<ModuleStatusLabel status="COMPLETED" statusType="module" />

// Mass status
<ModuleStatusLabel status="SCHEDULED" statusType="mass" />
<ModuleStatusLabel status="CANCELLED" statusType="mass" />

// Mass intention status
<ModuleStatusLabel status="CONFIRMED" statusType="mass-intention" />
<ModuleStatusLabel status="FULFILLED" statusType="mass-intention" />
```

**Status Variants:**
- Module: ACTIVE (default), INACTIVE (secondary), COMPLETED (outline)
- Mass: PLANNING (secondary), SCHEDULED (default), COMPLETED (outline), CANCELLED (destructive)
- Mass Intention: REQUESTED (secondary), CONFIRMED (default), FULFILLED (outline), CANCELLED (destructive)

---

### ReadingCategoryLabel
**Path:** `src/components/reading-category-label.tsx`

**Purpose:** Display reading category labels for liturgical readings.

---

### ErrorDisplay
**Path:** `src/components/error-display.tsx`

**Purpose:** Standardized error message display component.

---

### LoadingSkeleton
**Path:** `src/components/loading-skeleton.tsx`

**Purpose:** Skeleton loader for async content loading states.

---

### Loading
**Path:** `src/components/loading.tsx`

**Purpose:** Loading indicator component.

---

### ModuleViewPanel
**Path:** `src/components/module-view-panel.tsx`

**Purpose:** Reusable side panel for module view pages showing Edit button, Print view, PDF/Word downloads, and metadata.

**Props:**
- `entity`: Entity being viewed (must have id, status, created_at)
- `entityType`: Display name (e.g., "Wedding", "Funeral")
- `modulePath`: URL path (e.g., "weddings", "funerals")
- `mainEvent`: Optional event for location display
- `generateFilename`: Function to generate download filenames
- `printViewPath`: Optional custom print path

**Usage:**
```tsx
<ModuleViewPanel
  entity={wedding}
  entityType="Wedding"
  modulePath="weddings"
  mainEvent={wedding.wedding_event}
  generateFilename={(ext) => `wedding-${wedding.id}.${ext}`}
/>
```

---

### ModuleViewContainer
**Path:** `src/components/module-view-container.tsx`

**Purpose:** Complete view page container with side panel + liturgy content. Uses callback pattern for module-specific logic.

**Props:**
- `entity`: Entity with relations
- `entityType`: Display name
- `modulePath`: URL path
- `mainEvent`: Optional event
- `generateFilename`: Filename generator function
- `buildLiturgy`: Liturgy builder function
- `getTemplateId`: Template ID extractor function
- `printViewPath`: Optional custom print path

**Usage:**
```tsx
<ModuleViewContainer
  entity={wedding}
  entityType="Wedding"
  modulePath="weddings"
  mainEvent={wedding.wedding_event}
  generateFilename={(ext) => `wedding-${wedding.id}.${ext}`}
  buildLiturgy={buildWeddingLiturgy}
  getTemplateId={(w) => w.wedding_template_id || 'default'}
/>
```

---

### EventDisplay
**Path:** `src/components/event-display.tsx`

**Purpose:** Display event date, time, and location in a formatted card.

**Props:**
- `event`: Event object with start_date, start_time, location

---

### PetitionEditor
**Path:** `src/components/petition-editor.tsx`

**Purpose:** Editor for liturgical petitions with template insertion.

**Props:**
- `value`: Current petitions text
- `onChange`: Change handler
- `templates`: Array of petition templates
- `onInsertTemplate`: Template insertion handler

---

## Data Table System

### DataTable
**Path:** `src/components/data-table/data-table.tsx`

**Purpose:** Reusable data table component with sorting, responsive hiding, and empty states.

**Key Features:**
- Column-based configuration
- Client-side sorting with visual indicators
- Responsive column hiding
- Empty state customization
- Row click handling
- Custom row and cell styling
- Accessible table structure

**Props:**
- `data`: Array of data objects
- `columns`: Array of column definitions
- `keyExtractor`: Function to extract unique key from row
- `onRowClick`: Optional row click handler
- `emptyState`: Empty state configuration
- `className`: Table CSS classes
- `containerClassName`: Container CSS classes
- `rowClassName`: Row CSS classes (string or function)
- `defaultSort`: Default sort configuration

**Column Definition:**
```tsx
interface DataTableColumn<T> {
  key: string
  header: string | ReactNode
  cell: (row: T) => ReactNode
  className?: string
  headerClassName?: string
  hidden?: boolean
  hiddenOn?: 'sm' | 'md' | 'lg' | 'xl'  // Responsive hiding
  sortable?: boolean
  sortFn?: (a: T, b: T) => number
  accessorFn?: (row: T) => any
}
```

**Usage:**
```tsx
import { DataTable, type DataTableColumn } from '@/components/data-table/data-table'

const columns: DataTableColumn<Person>[] = [
  {
    key: 'name',
    header: 'Name',
    cell: (person) => `${person.first_name} ${person.last_name}`,
    sortable: true,
    accessorFn: (person) => person.first_name
  },
  {
    key: 'email',
    header: 'Email',
    cell: (person) => person.email || '—',
    hiddenOn: 'sm'  // Hide on small screens
  },
  {
    key: 'actions',
    header: 'Actions',
    cell: (person) => (
      <DropdownMenu>
        {/* Action buttons */}
      </DropdownMenu>
    )
  }
]

<DataTable
  data={people}
  columns={columns}
  keyExtractor={(person) => person.id}
  onRowClick={(person) => router.push(`/people/${person.id}`)}
  emptyState={{
    icon: <Users className="h-12 w-12" />,
    title: 'No people found',
    description: 'Get started by adding your first person',
    action: <Button onClick={() => router.push('/people/create')}>Add Person</Button>
  }}
  defaultSort={{ key: 'name', direction: 'asc' }}
/>
```

---

### DataTableEmpty
**Path:** `src/components/data-table/data-table-empty.tsx`

**Purpose:** Empty state component for data tables.

**Props:**
- `icon`: Optional icon to display
- `title`: Empty state title
- `description`: Empty state description
- `action`: Optional action button/element

---

### DataTableHeader
**Path:** `src/components/data-table/data-table-header.tsx`

**Purpose:** Table header component with search and actions.

---

### DataTableActions
**Path:** `src/components/data-table/data-table-actions.tsx`

**Purpose:** Action buttons for table rows (edit, delete, etc.).

---

## Calendar Components

### Calendar System
**Path:** `src/components/calendar/`

**Purpose:** Complete calendar view system for displaying parish events and liturgical calendar.

**Components:**
- `calendar.tsx` - Main calendar container
- `calendar-header.tsx` - Calendar navigation and view switcher
- `calendar-grid.tsx` - Calendar grid layout
- `calendar-day.tsx` - Individual day cell
- `day-events-modal.tsx` - Modal for viewing all events on a day

**Event Item Components:**
Parish events:
- `event-items/parish-event-item-month.tsx` - Parish event display in month view
- `event-items/parish-event-item-week.tsx` - Parish event display in week view
- `event-items/parish-event-item-day.tsx` - Parish event display in day view

Liturgical events:
- `event-items/liturgical-event-item-month.tsx` - Liturgical event in month view
- `event-items/liturgical-event-item-week.tsx` - Liturgical event in week view
- `event-items/liturgical-event-item-day.tsx` - Liturgical event in day view

**Features:**
- Month/week/day views
- Parish events integration
- Liturgical calendar integration
- Event color coding by type
- Click to view event details
- Responsive design
- Scrollable event modals

---

### MiniCalendar
**Path:** `src/components/mini-calendar.tsx`

**Purpose:** Small calendar widget for date selection and navigation.

---

### LiturgicalEventModal
**Path:** `src/components/liturgical-event-modal.tsx`

**Purpose:** Modal for displaying liturgical event details.

---

## Wizard Components

### Wizard System
**Path:** `src/components/wizard/`

**Purpose:** Multi-step wizard/form flow system.

**Components:**
- `Wizard.tsx` - Main wizard container
- `WizardContainer.tsx` - Wizard layout wrapper
- `WizardSteps.tsx` - Step indicator/progress bar
- `WizardNavigation.tsx` - Next/back buttons
- `WizardStepContent.tsx` - Step content wrapper
- `WizardLoadingState.tsx` - Loading state for wizard

**Features:**
- Multi-step forms
- Progress indication
- Navigation controls
- Step validation
- Loading states
- Responsive design

---

### LiturgicalReadingsWizard
**Path:** `src/components/liturgical-readings-wizard.tsx`

**Purpose:** Wizard for selecting and configuring liturgical readings.

---

### PetitionWizard
**Path:** `src/components/petition-wizard.tsx`

**Purpose:** Wizard for creating and editing liturgical petitions.

---

## Group Components

### GroupFormDialog
**Path:** `src/components/groups/group-form-dialog.tsx`

**Purpose:** Dialog for creating/editing liturgical ministry groups.

**Key Features:**
- Inline group creation/editing
- Group name and description
- Role assignment
- Member management
- Used in Groups module (dialog-based architecture)

---

## Navigation & Layout Components

### CollapsibleNavSection
**Path:** `src/components/collapsible-nav-section.tsx`

**Purpose:** Collapsible navigation section for sidebar.

---

### ParishSwitcher
**Path:** `src/components/parish-switcher.tsx`

**Purpose:** Dropdown for switching between parishes (multi-parish support).

---

### ParishUserMenu
**Path:** `src/components/parish-user-menu.tsx`

**Purpose:** User menu dropdown with profile and logout options.

---

### MainHeader
**Path:** `src/components/main-header.tsx`

**Purpose:** Application header with breadcrumbs and user menu.

---

### UserProfile
**Path:** `src/components/user-profile.tsx`

**Purpose:** User profile display component.

---

## Context Providers

### BreadcrumbContext
**Path:** `src/components/breadcrumb-context.tsx`

**Purpose:** React context for managing breadcrumb state across the application.

---

### ThemeProvider
**Path:** `src/components/theme-provider.tsx`

**Purpose:** Theme provider for dark mode support (wraps next-themes).

---

## Picker Infrastructure Components

### Picker Base Components
**Path:** `src/components/picker/`

**Purpose:** Reusable wrapper components for building consistent picker modals.

**Components:**
- `picker-modal-wrapper.tsx` - Base modal wrapper for all pickers
- `picker-search-field-wrapper.tsx` - Search field wrapper
- `picker-list-wrapper.tsx` - List/results wrapper
- `picker-item-wrapper.tsx` - Individual item wrapper
- `picker-form-wrapper.tsx` - Form wrapper for creating new entities

**Note:** These are infrastructure components. Use the high-level picker components (PeoplePicker, EventPicker, etc.) instead of building pickers from scratch.

---

### CorePicker
**Path:** `src/components/core-picker.tsx`

**Purpose:** Base picker component for advanced use cases. Most developers should use specific picker components instead.

---

### CorePickerField / PickerField
**Path:** `src/components/core-picker-field.tsx`, `src/components/picker-field.tsx`

**Purpose:** Generic picker field wrapper. Used internally by specific picker field components.

---

## UI Components (shadcn/ui)

### Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
**Path:** `src/components/ui/card.tsx`

**Purpose:** Container components for grouping related content.

---

### Button
**Path:** `src/components/ui/button.tsx`

**Purpose:** Standard button with variants (default, destructive, outline, ghost, link).

**Variants:**
- `default`: Primary button
- `destructive`: Red button for dangerous actions
- `outline`: Bordered button
- `ghost`: Transparent button
- `link`: Text link styled as button

---

### Input
**Path:** `src/components/ui/input.tsx`

**Purpose:** Base input component. **DO NOT USE DIRECTLY** - always use FormField component instead, which renders Input internally.

---

### Textarea
**Path:** `src/components/ui/textarea.tsx`

**Purpose:** Base textarea component. **DO NOT USE DIRECTLY** - always use FormField component instead, which renders Textarea internally.

---

### Select, SelectTrigger, SelectValue, SelectContent, SelectItem
**Path:** `src/components/ui/select.tsx`

**Purpose:** Dropdown select components from Radix UI. **DO NOT USE DIRECTLY** - always use FormField component instead, which renders Select internally.

---

### Label
**Path:** `src/components/ui/label.tsx`

**Purpose:** Form label component. **DO NOT USE DIRECTLY** - FormField renders labels automatically and connects them to inputs.

---

### Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
**Path:** `src/components/ui/dialog.tsx`

**Purpose:** Modal dialog components from Radix UI.

---

### Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandSeparator
**Path:** `src/components/ui/command.tsx`

**Purpose:** Command palette / search list components. Used in picker components.

---

### Badge
**Path:** `src/components/ui/badge.tsx`

**Purpose:** Small label badge for status indicators.

---

### Avatar, AvatarImage, AvatarFallback
**Path:** `src/components/ui/avatar.tsx`

**Purpose:** User avatar display with fallback initials.

---

### Separator
**Path:** `src/components/ui/separator.tsx`

**Purpose:** Horizontal or vertical divider line.

---

### Tabs, TabsList, TabsTrigger, TabsContent
**Path:** `src/components/ui/tabs.tsx`

**Purpose:** Tabbed interface components.

---

## Custom Hooks

### usePickerState
**Path:** `src/hooks/use-picker-state.ts`

**Purpose:** Reduces boilerplate for managing modal picker state.

**Returns:**
- `value`: Selected entity
- `setValue`: Set selected entity
- `showPicker`: Modal visibility state
- `setShowPicker`: Toggle modal

**Usage:**
```tsx
const bride = usePickerState<Person>()

// Use in component:
bride.value          // Current selected person
bride.setValue(p)    // Set person
bride.showPicker     // Modal open state
bride.setShowPicker(true)  // Open modal
```

---

## Notes

- **FormField is required** for all form inputs, selects, and textareas (except within picker components)
- **Picker components** handle their own internal form structure - they don't need FormField
- **List client components** can use bare Input for search/filter functionality outside of forms
- **Module icons** are defined in MainSidebar component - this is the source of truth
- **Dark mode** is supported throughout - use semantic color tokens, never hardcoded colors

