# Pickers

## Current Picker Inventory (7 Total)

### Command/CommandDialog Pattern (6 Pickers)
1. **PeoplePicker** - Search people + inline creation form + `visibleFields`
2. **EventPicker** - Search events + inline creation form + `visibleFields`
3. **LocationPicker** - Search locations + inline creation form + `visibleFields`
4. **RolePicker** - Search roles + inline creation form
5. **MassPicker** - Search masses (no inline creation)
6. **GlobalLiturgicalEventPicker** - Search liturgical events (no inline creation)

### Different Pattern (1 Picker)
7. **ReadingPickerModal** - Uses regular Dialog with filters (not Command/CommandDialog)

---

## Complete Props Documentation

### 1. PeoplePicker
**Path:** `src/components/people-picker.tsx`

**Props:**
- `open: boolean` - Control modal visibility
- `onOpenChange: (open: boolean) => void` - Modal state handler
- `onSelect: (person: Person) => void` - Callback when person is selected
- `placeholder?: string` - Search placeholder text (default: "Search for a person...")
- `emptyMessage?: string` - Empty state message (default: "No people found.")
- `selectedPersonId?: string` - Highlight selected person
- `className?: string` - Additional CSS classes
- `visibleFields?: string[]` - Optional fields to show: `['email', 'phone_number', 'sex', 'note']` (default: all fields)
- `requiredFields?: string[]` - Fields to mark as required in the form (e.g., `['sex', 'email']`)
- `openToNewPerson?: boolean` - Auto-open create form (default: false)

---

### 2. EventPicker
**Path:** `src/components/event-picker.tsx`

**Props:**
- `open: boolean` - Control modal visibility
- `onOpenChange: (open: boolean) => void` - Modal state handler
- `onSelect: (event: Event) => void` - Callback when event is selected
- `placeholder?: string` - Search placeholder text (default: "Search for an event...")
- `emptyMessage?: string` - Empty state message (default: "No events found.")
- `selectedEventId?: string` - Highlight selected event
- `selectedEvent?: Event | null` - Currently selected event object
- `className?: string` - Additional CSS classes
- `defaultEventType?: string` - Default event type for creation (default: "EVENT")
- `defaultName?: string` - Default event name for creation (default: "")
- `openToNewEvent?: boolean` - Auto-open create form (default: false)
- `disableSearch?: boolean` - Disable search functionality (default: false)
- `visibleFields?: string[]` - Optional fields to show: `['location', 'note']` (default: all fields)
- `requiredFields?: string[]` - Fields to mark as required in the form (e.g., `['location', 'note']`)

---

### 3. LocationPicker
**Path:** `src/components/location-picker.tsx`

**Props:**
- `open: boolean` - Control modal visibility
- `onOpenChange: (open: boolean) => void` - Modal state handler
- `onSelect: (location: Location) => void` - Callback when location is selected
- `placeholder?: string` - Search placeholder text (default: "Search for a location...")
- `emptyMessage?: string` - Empty state message (default: "No locations found.")
- `selectedLocationId?: string` - Highlight selected location
- `className?: string` - Additional CSS classes
- `openToNewLocation?: boolean` - Auto-open create form (default: false)
- `visibleFields?: string[]` - Optional fields to show: `['description', 'street', 'city', 'state', 'country', 'phone_number']` (default: all fields)
- `requiredFields?: string[]` - Fields to mark as required in the form (e.g., `['street', 'city', 'state']`)

---

### 4. RolePicker
**Path:** `src/components/role-picker.tsx`

**Props:**
- `open: boolean` - Control modal visibility
- `onOpenChange: (open: boolean) => void` - Modal state handler
- `onSelect: (role: Role) => void` - Callback when role is selected
- `placeholder?: string` - Search placeholder text (default: "Search for a role...")
- `emptyMessage?: string` - Empty state message (default: "No roles found.")
- `selectedRoleId?: string` - Highlight selected role
- `className?: string` - Additional CSS classes
- `visibleFields?: string[]` - Optional fields to show: `['description', 'note']` (default: all fields)
- `requiredFields?: string[]` - Fields to mark as required in the form (e.g., `['description']`)

---

### 5. MassPicker
**Path:** `src/components/mass-picker.tsx`

**Props:**
- `open: boolean` - Control modal visibility
- `onOpenChange: (open: boolean) => void` - Modal state handler
- `onSelect: (mass: MassWithNames) => void` - Callback when mass is selected
- `placeholder?: string` - Search placeholder text (default: "Search for a mass...")
- `emptyMessage?: string` - Empty state message (default: "No masses found.")
- `selectedMassId?: string` - Highlight selected mass
- `className?: string` - Additional CSS classes

**Note:** No inline creation form (masses are created separately).

---

### 6. GlobalLiturgicalEventPicker
**Path:** `src/components/global-liturgical-event-picker.tsx`

**Props:**
- `open: boolean` - Control modal visibility
- `onOpenChange: (open: boolean) => void` - Modal state handler
- `onSelect: (event: GlobalLiturgicalEvent) => void` - Callback when event is selected
- `placeholder?: string` - Search placeholder text (default: "Search for a liturgical event...")
- `emptyMessage?: string` - Empty state message (default: "No liturgical events found.")
- `selectedEventId?: string` - Highlight selected event
- `className?: string` - Additional CSS classes
- `locale?: string` - Language/locale for events (default: 'en')
- `year?: number` - Year to fetch events for (default: current year)

**Note:** No inline creation form (global liturgical events are read-only data).

---

### 7. ReadingPickerModal
**Path:** `src/components/reading-picker-modal.tsx`

**Props:**
- `isOpen: boolean` - Control modal visibility (Note: Different from other pickers which use `open`)
- `onClose: () => void` - Modal close handler (Note: Different from other pickers which use `onOpenChange`)
- `onSelect: (reading: IndividualReading | null) => void` - Callback when reading is selected
- `selectedReading?: IndividualReading | null` - Currently selected reading
- `readings: IndividualReading[]` - Array of readings to choose from
- `title: string` - Modal title
- `preselectedCategories?: string[]` - Pre-filter by categories (default: [])

**Note:** Uses regular Dialog pattern (not Command/CommandDialog). Has category filters, language filters, and preview modal.

---

## Common Patterns Identified

### ✅ Patterns Already in Use

1. **useDebounce Hook**
   - ✅ **COMPLETED:** Extracted to `src/hooks/use-debounce.ts`
   - ✅ All 5 pickers that use debouncing now import from central location
   - ✅ Eliminated ~100 lines of duplicated code

2. **Base Picker Types**
   - ✅ **COMPLETED:** Created `src/types/picker.ts` with base interfaces
   - ✅ `BasePickerProps<T>` - Base interface for all pickers
   - ✅ `BasePickerWithFormProps<T>` - Extended interface for pickers with inline forms
   - ✅ Helper functions: `isFieldVisible()`, `isFieldRequired()`
   - Used by: PeoplePicker, EventPicker, LocationPicker, RolePicker

3. **visibleFields Pattern**
   - ✅ **COMPLETED:** Implemented in PeoplePicker, EventPicker, LocationPicker, RolePicker
   - Controls which optional fields appear in inline creation forms
   - Default: Show all fields if not specified
   - Example: `visibleFields={['email', 'phone_number']}` for PeoplePicker

4. **requiredFields Pattern**
   - ✅ **COMPLETED:** Implemented in PeoplePicker, EventPicker, LocationPicker, RolePicker
   - Marks specific fields as required in different contexts
   - Adds visual required indicator (`*`) to labels
   - Adds HTML `required` attribute to form inputs
   - Example: `requiredFields={['sex', 'email']}` for child in baptism

5. **Props Interface Structure**
   - All pickers (except ReadingPickerModal) share similar base props:
     - `open: boolean` (ReadingPickerModal uses `isOpen`)
     - `onOpenChange: (open: boolean) => void` (ReadingPickerModal uses `onClose: () => void`)
     - `onSelect: (item: T) => void`
     - `placeholder?: string` (not used by ReadingPickerModal)
     - `emptyMessage?: string` (not used by ReadingPickerModal)
     - `selectedId?: string` (various names: `selectedPersonId`, `selectedEventId`, etc.)
     - `className?: string` (not used by ReadingPickerModal)
   - See "Complete Props Documentation" section above for full details of each picker's interface

6. **State Management**
   - All pickers use similar state:
     - `searchQuery` (string)
     - `items` (array of entities)
     - `loading` (boolean)
     - `showAddForm` (boolean, for pickers with inline creation)

7. **Search/Loading Pattern**
   - Debounced search
   - Loading state during fetch
   - useEffect to load data when picker opens
   - useCallback for search function

---

## Refactoring Opportunities

### ✅ COMPLETED: Extract useDebounce Hook

**Impact:** Reduced code duplication across 6 files

**Status:** ✅ DONE - Created `src/hooks/use-debounce.ts` and updated all pickers to import from it

**Files Updated:**
- ✅ people-picker.tsx
- ✅ event-picker.tsx
- ✅ location-picker.tsx
- ✅ role-picker.tsx
- ✅ mass-picker.tsx
- ✅ global-liturgical-event-picker.tsx (doesn't use debounce)

**Result:** Eliminated ~100 lines of duplicated code!

---

### ✅ COMPLETED: Create Base Picker Props Interface

**Impact:** Ensures consistency and type safety across all pickers

**Status:** ✅ DONE - Created `src/types/picker.ts` with base interfaces and helper functions

**Implementation:**
```tsx
// src/types/picker.ts
export interface BasePickerProps<T> {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (item: T) => void
  placeholder?: string
  emptyMessage?: string
  selectedId?: string
  className?: string
}

export interface BasePickerWithFormProps<T> extends BasePickerProps<T> {
  openToNewItem?: boolean
  visibleFields?: string[]
  requiredFields?: string[]
}

// Helper functions
export function isFieldVisible(fieldName, visibleFields, defaultVisibleFields)
export function isFieldRequired(fieldName, requiredFields)
```

**Files Updated:**
- ✅ Created `src/types/picker.ts`
- ✅ PeoplePicker imports and uses base types
- ✅ EventPicker imports and uses base types
- ✅ LocationPicker imports and uses base types
- ✅ RolePicker imports and uses base types

---

### ✅ COMPLETED: Standardize visibleFields Pattern

**Status:** ✅ DONE - All pickers with inline forms now support `visibleFields`

**Implementation:**
- ✅ PeoplePicker has `visibleFields`
- ✅ EventPicker has `visibleFields`
- ✅ LocationPicker has `visibleFields`
- ✅ RolePicker has `visibleFields`

---

### ✅ COMPLETED: Add requiredFields Pattern

**Impact:** Enables context-specific required fields across all pickers

**Status:** ✅ DONE - All pickers with inline forms now support `requiredFields`

**Implementation:**
- ✅ PeoplePicker has `requiredFields`
- ✅ EventPicker has `requiredFields`
- ✅ LocationPicker has `requiredFields`
- ✅ RolePicker has `requiredFields`
- ✅ Required indicator (`*`) added to labels
- ✅ HTML `required` attribute added to inputs

---

### 🟢 LOW PRIORITY: Extract Common CommandDialog Layout

**Impact:** Reduces structural duplication

**Concept:**
Create a reusable `BaseCommandPicker` component that provides:
- CommandDialog wrapper with DialogTitle
- CommandInput with search
- CommandList with loading state
- CommandEmpty with empty message
- CommandGroup for results

**Note:** This is complex and may reduce flexibility. Recommend waiting until more pickers are needed.

---

## Consistency Checklist

### Props Naming
- ✅ All use `open` (not `isOpen`)
- ✅ All use `onOpenChange` (not `onClose`, `setOpen`, etc.)
- ✅ All use `onSelect` (not `onChange`, `onSelectItem`, etc.)

### State Naming
- ✅ Most use `searchQuery` (GlobalLiturgicalEventPicker uses `searchQuery`)
- ✅ Most use `loading` consistently
- ✅ All use `showAddForm` for inline creation state

### Function Naming
- 🟡 Mixed patterns:
  - `handlePersonSelect`, `handleEventSelect`, `handleLocationSelect` ✅
  - `handleMassSelect`, `handleEventSelect` (GlobalLiturgicalEventPicker) ✅
  - Should standardize to: `handle[Entity]Select`

### Search Function Naming
- 🟡 Mixed patterns:
  - `searchPeopleCallback`, `searchMassesCallback` ✅
  - Some pickers use `loadEvents`, `loadEvents` ❌
  - Should standardize to: `search[Entities]Callback` or `load[Entities]`

---

## Picker-Specific Features

### Inline Creation Forms
**Pickers with inline forms:**
1. PeoplePicker ✅
2. EventPicker ✅
3. LocationPicker ✅
4. RolePicker ✅

**Pickers without inline forms:**
5. MassPicker - Makes sense (masses are complex)
6. GlobalLiturgicalEventPicker - Makes sense (read-only data)
7. ReadingPickerModal - Makes sense (uses different pattern)

### Special Features
- **EventPicker:** Location sub-picker (nested picker)
- **ReadingPickerModal:** Category filters, language filters, preview modal
- **GlobalLiturgicalEventPicker:** Year filter, locale filter
- **PeoplePicker, EventPicker, LocationPicker:** `visibleFields` pattern

---

## Recommended Refactoring Steps

### ✅ Phase 1: Extract Shared Utilities (COMPLETED)
1. ✅ Extract `useDebounce` to `src/hooks/use-debounce.ts`
2. ✅ Update all 6 pickers to import from central location
3. ✅ Remove `showSexField` (COMPLETED)

### ✅ Phase 2: Implement Base Types and Patterns (COMPLETED)
1. ✅ Create `BasePickerProps<T>` interface in `src/types/picker.ts`
2. ✅ Create `BasePickerWithFormProps<T>` interface
3. ✅ Add helper functions: `isFieldVisible()`, `isFieldRequired()`
4. ✅ Update all pickers to import and use base types

### ✅ Phase 3: Add visibleFields and requiredFields (COMPLETED)
1. ✅ Implement `visibleFields` in PeoplePicker, EventPicker, LocationPicker, RolePicker
2. ✅ Implement `requiredFields` in PeoplePicker, EventPicker, LocationPicker, RolePicker
3. ✅ Update all PickerField wrappers to pass through props
4. ✅ Add required indicators to labels and form inputs

### ✅ Phase 4: Documentation (COMPLETED)
1. ✅ Update PICKERS.md with complete props documentation
2. ✅ Document visibleFields arrays for each picker
3. ✅ Document requiredFields pattern
4. 🟡 TODO: Update COMPONENT_REGISTRY.md with standardized patterns

---

## Notes

### Why Not Create a Single Generic Picker?
While tempting, a single generic picker component would:
- Be extremely complex with too many conditional branches
- Reduce type safety
- Make debugging harder
- Limit flexibility for picker-specific features

**Current approach is better:** Consistent patterns across similar components with shared utilities (like `useDebounce`).

### ReadingPickerModal Exception
ReadingPickerModal intentionally uses a different pattern because:
- It needs category/language filters (not simple search)
- It has a preview modal
- It's selecting from a filtered list, not searching a database
- Command/CommandDialog pattern doesn't fit this use case

This exception is acceptable and follows the "use the right tool for the job" principle.

---

## Summary

**Completed Work:**
- ✅ Removed `showSexField` completely
- ✅ Implemented `visibleFields` pattern in all 4 main pickers (PeoplePicker, EventPicker, LocationPicker, RolePicker)
- ✅ Implemented `requiredFields` pattern in all 4 main pickers
- ✅ Created base picker types (`BasePickerProps<T>`, `BasePickerWithFormProps<T>`) in `src/types/picker.ts`
- ✅ Created helper functions (`isFieldVisible()`, `isFieldRequired()`)
- ✅ Extracted `useDebounce` hook to eliminate ~100 lines of duplication
- ✅ Consistent prop naming across all pickers
- ✅ All pickers follow similar structure
- ✅ Comprehensive documentation in PICKERS.md

**Remaining Work:**
- 🟡 Update COMPONENT_REGISTRY.md with standardized patterns
- 🟢 Consider standardizing function naming conventions (low priority)
