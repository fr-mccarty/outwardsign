# Picker Modal Patterns

This document describes the critical behavioral patterns for picker modal components in Outward Sign.

## 🔴 Picker Modal Behavior (Critical)

**CRITICAL RULE:** When creating new entities from ANY picker modal (PeoplePicker, EventPicker, ReadingPickerModal), the behavior MUST follow this exact pattern:

1. **Save immediately**: Entity is created and persisted to database via server action
2. **Auto-select**: Newly created entity is automatically selected in the parent form field
3. **Close modal**: Picker dialog closes automatically after selection
4. **NO REDIRECT**: The current page must NOT navigate away - user stays on the form they were working on

## Why This Matters

- Users are in the middle of creating/editing a main entity (wedding, funeral, presentation)
- Creating a related entity (person, event, reading) is a sub-task within that workflow
- Redirecting would lose the user's context and any unsaved work in the parent form
- Auto-selecting improves UX by eliminating an extra click

## Implementation Pattern

```tsx
// In picker component (e.g., PeoplePicker, EventPicker)
const handleCreateEntity = async (e: React.FormEvent) => {
  e.preventDefault()
  e.stopPropagation() // Prevent parent form submission

  try {
    // 1. Create entity via server action
    const newEntity = await createEntity({...formData})

    // 2. Show success feedback
    toast.success('Entity created successfully')

    // 3. Reset internal form state
    setFormData(initialState)
    setShowAddForm(false)

    // 4. Auto-select newly created entity (calls onSelect callback)
    handleEntitySelect(newEntity)

    // ✅ CORRECT: No router.push(), no navigation
    // ❌ WRONG: router.push('/entities/...')
  } catch (error) {
    toast.error('Failed to create entity')
  }
}

// handleEntitySelect implementation
const handleEntitySelect = (entity: Entity) => {
  onSelect(entity)      // Pass to parent via callback
  onOpenChange(false)   // Close the modal
  // ✅ CORRECT: Only select and close
  // ❌ WRONG: router.push() anywhere in this flow
}
```

## Affected Components

- `PeoplePicker` (`src/components/people-picker.tsx`) - For creating persons from wedding/funeral/presentation forms
- `EventPicker` (`src/components/event-picker.tsx`) - For creating events from module forms
- `ReadingPickerModal` (if inline creation exists) - For adding readings

## Verification Checklist

When implementing or modifying picker components, verify:

- [ ] Server action creates entity and returns it (no redirect in action)
- [ ] `handleCreate[Entity]` function does NOT call `router.push()`
- [ ] New entity is passed to `handleEntitySelect()` or equivalent
- [ ] `handleEntitySelect()` only calls `onSelect(entity)` and `onOpenChange(false)`
- [ ] Parent component receives entity via `onSelect` callback prop
- [ ] Parent component updates its state with selected entity
- [ ] Modal closes after selection
- [ ] User remains on the current form page

## Common Mistakes to Avoid

- ❌ Adding `router.push()` after entity creation
- ❌ Adding `redirect()` in server action for picker entities
- ❌ Not auto-selecting the newly created entity
- ❌ Requiring user to manually search and select what they just created
- ❌ Different behavior between different picker modals (be consistent)

## Reference Implementations

- Correct pattern: `src/components/people-picker.tsx` lines 151-191
- Correct pattern: `src/components/event-picker.tsx` lines 206-265

---

## 🔴 Auto-Open Create Form Pattern (Critical)

**CRITICAL RULE:** When using picker field wrappers (PersonPickerField, EventPickerField, LocationPickerField), the `openToNew*` prop MUST check if the specific value is set, NOT if the parent form is in edit mode.

### Why This Matters

**User Experience:**
- The create form should open when the **field is empty**, regardless of whether you're editing or creating the parent entity
- Each field should behave independently based on its own state
- Users can clear a field and add a new person even when editing an existing entity

**Consistency:**
- All picker fields across all modules should follow the same pattern
- Behavior should be predictable and contextual to the field, not the form

### ✅ CORRECT Pattern

```tsx
import { usePickerState } from '@/hooks/use-picker-state'
import { PersonPickerField } from '@/components/person-picker-field'

const bride = usePickerState<Person>()
const groom = usePickerState<Person>()

<PersonPickerField
  label="Bride"
  value={bride.value}
  onValueChange={bride.setValue}
  showPicker={bride.showPicker}
  onShowPickerChange={bride.setShowPicker}
  openToNewPerson={!bride.value}  // ✅ CORRECT: Check if THIS person is set
/>

<PersonPickerField
  label="Groom"
  value={groom.value}
  onValueChange={groom.setValue}
  showPicker={groom.showPicker}
  onShowPickerChange={groom.setShowPicker}
  openToNewPerson={!groom.value}  // ✅ CORRECT: Check if THIS person is set
/>
```

**For EventPickerField:**
```tsx
const weddingEvent = usePickerState<Event>()

<EventPickerField
  label="Wedding Ceremony"
  value={weddingEvent.value}
  onValueChange={weddingEvent.setValue}
  showPicker={weddingEvent.showPicker}
  onShowPickerChange={weddingEvent.setShowPicker}
  openToNewEvent={!weddingEvent.value}  // ✅ CORRECT: Check if THIS event is set
  defaultEventType="WEDDING"
/>
```

**For LocationPickerField:**
```tsx
const location = usePickerState<Location>()

<LocationPickerField
  label="Location"
  value={location.value}
  onValueChange={location.setValue}
  showPicker={location.showPicker}
  onShowPickerChange={location.setShowPicker}
  openToNewLocation={!location.value}  // ✅ CORRECT: Check if THIS location is set
/>
```

### ❌ INCORRECT Patterns

```tsx
// ❌ WRONG: Checks if parent form is in edit mode
<PersonPickerField
  label="Bride"
  value={bride.value}
  onValueChange={bride.setValue}
  showPicker={bride.showPicker}
  onShowPickerChange={bride.setShowPicker}
  openToNewPerson={!isEditing}  // ❌ BAD: Checks wrong condition
/>

// ❌ WRONG: Always opens to create form
<PersonPickerField
  label="Bride"
  value={bride.value}
  onValueChange={bride.setValue}
  showPicker={bride.showPicker}
  onShowPickerChange={bride.setShowPicker}
  openToNewPerson={true}  // ❌ BAD: Should check if value exists
/>

// ❌ WRONG: Missing when you want auto-open behavior
<PersonPickerField
  label="Bride"
  value={bride.value}
  onValueChange={bride.setValue}
  showPicker={bride.showPicker}
  onShowPickerChange={bride.setShowPicker}
  // ❌ BAD: Omitted prop, create form won't auto-open when field is empty
/>
```

### Pattern Breakdown

The pattern is: **`openToNew<Entity>={!<stateVariable>.value}`**

Where:
- `<Entity>` = `Person`, `Event`, or `Location`
- `<stateVariable>` = the variable name from `usePickerState()` (e.g., `bride`, `groom`, `presider`, `weddingEvent`)

**Examples:**
- `bride` state → `openToNewPerson={!bride.value}`
- `presider` state → `openToNewPerson={!presider.value}`
- `weddingEvent` state → `openToNewEvent={!weddingEvent.value}`
- `location` state → `openToNewLocation={!location.value}`

### Common Mistakes to Avoid

- ❌ Using `openToNewPerson={!isEditing}` - Checks parent form mode instead of field state
- ❌ Using `openToNewPerson={true}` - Always opens to create form (ignores existing value)
- ❌ Using `openToNewPerson={false}` - Never opens to create form (forces users to click "Add New")
- ❌ Omitting the prop when auto-open is desired - Create form won't open automatically
- ❌ Checking the wrong entity's value - e.g., `openToNewPerson={!groom.value}` on the bride field

### Verification Checklist

When implementing picker fields in module forms:

- [ ] Each `PersonPickerField` uses `openToNewPerson={!<person>.value}` where `<person>` matches the state variable
- [ ] Each `EventPickerField` uses `openToNewEvent={!<event>.value}` where `<event>` matches the state variable
- [ ] Each `LocationPickerField` uses `openToNewLocation={!<location>.value}` where `<location>` matches the state variable
- [ ] NO picker fields use `openToNew*={!isEditing}`
- [ ] The value variable matches the one used in `value={<variable>.value}`

### Real-World Example: Wedding Form

```tsx
export function WeddingForm({ wedding }: WeddingFormProps) {
  const isEditing = !!wedding

  // Picker states
  const bride = usePickerState<Person>()
  const groom = usePickerState<Person>()
  const presider = usePickerState<Person>()
  const weddingEvent = usePickerState<Event>()
  const location = usePickerState<Location>()

  return (
    <form>
      {/* ✅ CORRECT: Each field checks its own value */}
      <PersonPickerField
        label="Bride"
        value={bride.value}
        onValueChange={bride.setValue}
        showPicker={bride.showPicker}
        onShowPickerChange={bride.setShowPicker}
        openToNewPerson={!bride.value}  // ✅ Opens when bride field is empty
      />

      <PersonPickerField
        label="Groom"
        value={groom.value}
        onValueChange={groom.setValue}
        showPicker={groom.showPicker}
        onShowPickerChange={groom.setShowPicker}
        openToNewPerson={!groom.value}  // ✅ Opens when groom field is empty
      />

      <PersonPickerField
        label="Presider"
        value={presider.value}
        onValueChange={presider.setValue}
        showPicker={presider.showPicker}
        onShowPickerChange={presider.setShowPicker}
        openToNewPerson={!presider.value}  // ✅ Opens when presider field is empty
      />

      <EventPickerField
        label="Wedding Ceremony"
        value={weddingEvent.value}
        onValueChange={weddingEvent.setValue}
        showPicker={weddingEvent.showPicker}
        onShowPickerChange={weddingEvent.setShowPicker}
        openToNewEvent={!weddingEvent.value}  // ✅ Opens when event field is empty
        defaultEventType="WEDDING"
      />
    </form>
  )
}
```

---

## usePickerState Hook

**Location:** `src/hooks/use-picker-state.ts`

Reduces boilerplate for managing modal picker state (people, events, readings).

**Returns:** `{ value, setValue, showPicker, setShowPicker }`

**Usage:**
```tsx
const bride = usePickerState<Person>()

// In JSX
<PeoplePicker
  selectedPerson={bride.value}
  onSelect={bride.setValue}
  open={bride.showPicker}
  onOpenChange={bride.setShowPicker}
/>
```

This hook standardizes state management for picker modals across all modules.
