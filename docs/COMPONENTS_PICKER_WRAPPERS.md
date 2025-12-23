# Picker Component Wrappers

> **Part of Component Registry** - See [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) for the complete component index.

This document covers all picker field wrapper components that provide button-based UI for selecting entities from modal pickers.

---

## See Also

- **[PICKERS.md](./PICKERS.md)** - Picker architecture, creating new pickers, advanced patterns
- **[PICKER_PATTERNS.md](./PICKER_PATTERNS.md)** - Critical behavioral rules (no redirect, auto-select)
- **[PICKER_EDIT_MODE.md](./PICKER_EDIT_MODE.md)** - Inline editing pattern
- **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Complete component index

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

### RoleAvailabilityModal
**Path:** `src/app/(main)/mass-liturgies/schedule/steps/role-availability-modal.tsx`

**Purpose:** Nested modal system for viewing minister availability by role and mass time during the mass scheduling wizard.

**Key Features:**
- First level: Shows mass times with available minister counts
- Second level (nested): Shows list of people available for a specific mass time
- Formatted times and day of week
- Sorted by day/time
- Leaders listed before members

**Props:**
- `role`: MassRoleWithCount | null - The selected mass role
- `open`: boolean - Modal visibility state
- `onOpenChange`: (open: boolean) => void - Modal state handler
- `startDate`: string - Date range start (not currently used)
- `endDate`: string - Date range end (not currently used)

**User Flow:**
1. User clicks role card in Step 1 → Opens first modal
2. First modal shows mass times with counts (e.g., "Sunday 9:00 AM - 5")
3. User clicks mass time card → Opens nested modal on top
4. Nested modal shows list of people with names and membership type
5. "Manage Role" button links to `/mass-roles/{roleId}`

**Usage:**
```tsx
const [selectedRole, setSelectedRole] = useState<MassRoleWithCount | null>(null)
const [roleModalOpen, setRoleModalOpen] = useState(false)

<RoleAvailabilityModal
  role={selectedRole}
  open={roleModalOpen}
  onOpenChange={setRoleModalOpen}
  startDate={startDate}
  endDate={endDate}
/>
```

**Server Actions Used:**
- `getMassRoleAvailabilityByMassTime(roleId)` - First modal data
- `getPeopleAvailableForMassTime(roleId, massTimeTemplateItemId)` - Nested modal data

---

### LiturgicalCalendarEventPicker
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
const liturgicalEvent = usePickerState<LiturgicalCalendarEvent>()

<LiturgicalCalendarEventPicker
  open={liturgicalEvent.showPicker}
  onOpenChange={liturgicalEvent.setShowPicker}
  onSelect={liturgicalEvent.setValue}
  selectedEventId={liturgicalEvent.value?.id}
/>
```

---

#### LiturgicalEventPickerField
**Path:** `src/components/liturgical-event-picker-field.tsx`

**Purpose:** Standardized wrapper for LiturgicalCalendarEventPicker with consistent button UI.

**Props:**
- `label`: Field label
- `value`: Selected LiturgicalCalendarEvent | null
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

const liturgicalEvent = usePickerState<LiturgicalCalendarEvent>()

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
- `defaultRelatedEventType`: Default event type for creation (e.g., "MASS", "WEDDING", "FUNERAL")
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
  defaultRelatedEventType="WEDDING"
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
  defaultRelatedEventType="MASS"
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
        defaultRelatedEventType="WEDDING"
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

