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
