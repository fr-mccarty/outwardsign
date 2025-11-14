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

**Purpose:** Standardized form field wrapper that handles labels, descriptions, error messages, and consistent styling for all form inputs.

**CRITICAL:** ALL form inputs, selects, and textareas MUST use this component.

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
- Role constants from `ROLE_LABELS`

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

**Purpose:** Base input component. **DO NOT USE DIRECTLY** - always wrap with FormField.

---

### Textarea
**Path:** `src/components/ui/textarea.tsx`

**Purpose:** Base textarea component. **DO NOT USE DIRECTLY** - always wrap with FormField.

---

### Select, SelectTrigger, SelectValue, SelectContent, SelectItem
**Path:** `src/components/ui/select.tsx`

**Purpose:** Dropdown select components from Radix UI. **DO NOT USE DIRECTLY** - always wrap with FormField.

---

### Label
**Path:** `src/components/ui/label.tsx`

**Purpose:** Form label component. **DO NOT USE DIRECTLY** - FormField handles labels automatically.

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

