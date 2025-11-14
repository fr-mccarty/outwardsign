# Picker Edit Mode Pattern

> **Purpose:** Pattern for inline editing of related entities (people, events, locations) from within picker modals.
>
> **See Also:**
> - **[PICKERS.md](./PICKERS.md)** - Main picker system documentation
> - **[PICKER_PATTERNS.md](./PICKER_PATTERNS.md)** - Critical behavioral rules (no redirect, auto-select)
> - **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Picker component props reference

## Overview

This document describes the pattern for enabling **inline editing** of related entities (people, events, locations) from within module forms (weddings, funerals, presentations, etc.).

## Core Concept

Related entities can be edited directly from the form field where they're selected, without navigating away from the parent form.

### Terminology

- **Module-level editing** (`isEditing`): Whether the main entity (Wedding, Funeral, etc.) is being edited
  - Determined by: `const isEditing = !!wedding` (whether the module entity prop exists)

- **Related entity editing**: Whether a related entity (Person, Event, Location) is being edited
  - Determined by: Whether the related entity is already selected (`value !== null`)

## User Experience Flow

### When No Entity is Selected (`value === null`)

1. User clicks "Select Person" / "Select Event" / "Select Location" button
2. Picker modal opens showing:
   - Search bar
   - List of existing entities
   - "Add New" button to create inline
3. User can either:
   - Select an existing entity from the list
   - Click "Add New" to create a new entity inline

### When Entity is Already Selected (`value !== null`)

1. User clicks on the **display box** showing the selected entity
2. Picker modal opens **directly to the edit form** (bypasses selection list)
3. Form is pre-populated with existing entity data
4. User edits the fields
5. User clicks "Update Person" / "Update Event" / "Update Location"
6. Entity is updated in database via server action
7. Updated entity is auto-selected in parent form field
8. Modal closes automatically
9. User stays on parent form (no redirect)

### Clear/Remove Action

- The X button in the display box clears the selection (sets `value = null`)
- This is separate from the edit action

## Implementation Architecture

### 1. CorePicker Component Changes

**New Props:**
```tsx
interface CorePickerProps<T> {
  // ... existing props

  // Edit mode support
  editMode?: boolean                          // Whether to open in edit mode
  entityToEdit?: T | null                     // The entity being edited
  onUpdateSubmit?: (id: string, data: any) => Promise<T>  // Update handler
  updateButtonLabel?: string                  // Label for update button (e.g., "Update Person")
}
```

**Behavior:**
- When `editMode === true` and `entityToEdit` is provided:
  - Auto-open the form (skip selection list)
  - Pre-populate form fields with entity data
  - Use `onUpdateSubmit` instead of `onCreateSubmit`
  - Show `updateButtonLabel` instead of `createButtonLabel`
  - After successful update: auto-select updated entity and close modal

### 2. PeoplePicker Component Changes

**New Props:**
```tsx
interface PeoplePickerProps {
  // ... existing props

  editMode?: boolean      // Open directly to edit form
  personToEdit?: Person | null  // Person being edited
}
```

**Implementation:**
```tsx
// Handler for updating a person
const handleUpdatePerson = async (id: string, data: any): Promise<Person> => {
  const updatedPerson = await updatePerson(id, {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email || undefined,
    phone_number: data.phone_number || undefined,
    sex: data.sex || undefined,
    note: data.note || undefined,
  })

  // Update local list
  setPeople((prev) =>
    prev.map(p => p.id === updatedPerson.id ? updatedPerson : p)
  )

  return updatedPerson
}

// Pass to CorePicker
<CorePicker<Person>
  // ... existing props
  editMode={editMode}
  entityToEdit={personToEdit}
  onUpdateSubmit={handleUpdatePerson}
  updateButtonLabel="Update Person"
/>
```

### 3. EventPicker Component Changes

Same pattern as PeoplePicker:
- Accept `editMode` and `eventToEdit` props
- Implement `handleUpdateEvent` using `updateEvent()` server action
- Pass to CorePicker with appropriate props
- Handle nested LocationPicker (location can still be edited within event edit form)

### 4. LocationPicker Component Changes

Same pattern:
- Accept `editMode` and `locationToEdit` props
- Implement `handleUpdateLocation` using `updateLocation()` server action
- Pass to CorePicker with appropriate props

### 5. PickerField Component Changes

Make the display box clickable to trigger edit mode:

```tsx
{value ? (
  <div className="space-y-2">
    {/* Clickable display box - opens edit mode */}
    <button
      type="button"
      onClick={() => onShowPickerChange(true)}
      className="flex items-center justify-between p-3 border rounded-md bg-muted/50 hover:bg-muted w-full text-left transition-colors"
    >
      <span className="text-sm">{renderValue(value)}</span>
      {/* Edit icon to indicate clickability */}
      <Pencil className="h-4 w-4 text-muted-foreground" />
    </button>

    {/* Separate clear button below */}
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => onValueChange(null)}
      className="w-full"
    >
      <X className="h-4 w-4 mr-2" />
      Clear Selection
    </Button>
  </div>
) : (
  // ... existing "Select" button
)}
```

### 6. PersonPickerField Component Changes

Pass edit mode to PeoplePicker:

```tsx
<PeoplePicker
  open={showPicker}
  onOpenChange={onShowPickerChange}
  onSelect={onValueChange}
  selectedPersonId={value?.id}
  openToNewPerson={openToNewPerson}
  visibleFields={visibleFields}
  requiredFields={requiredFields}
  editMode={value !== null}          // ← Edit mode when value exists
  personToEdit={value}                // ← Pass the person to edit
/>
```

### 7. EventPickerField Component Changes

Same pattern:

```tsx
<EventPicker
  open={showPicker}
  onOpenChange={onShowPickerChange}
  onSelect={onValueChange}
  selectedEventId={value?.id}
  selectedEvent={value}
  // ... other props
  editMode={value !== null}           // ← Edit mode when value exists
  eventToEdit={value}                 // ← Pass the event to edit
/>
```

## Key Principles

### 1. No Redirect on Edit
When editing a related entity from within a picker modal:
- ✅ Update entity via server action
- ✅ Auto-select updated entity in parent form
- ✅ Close modal
- ❌ DO NOT navigate away from parent form
- ❌ DO NOT redirect to entity detail page

### 2. Related Entity State Detection
The picker determines its mode based on the **selected value state**, not the module's editing state:

```tsx
// ❌ WRONG - using module's isEditing
<PeoplePicker editMode={isEditing} />

// ✅ CORRECT - using related entity's existence
<PeoplePicker editMode={bride.value !== null} personToEdit={bride.value} />
```

### 3. Consistent Across All Pickers
All picker components (PeoplePicker, EventPicker, LocationPicker, ReadingPickerModal) should support edit mode with the same pattern and behavior.

### 4. Form Field Reuse
The edit form should reuse the same `createFields` configuration from CorePicker:
- Same fields shown for create and edit
- Same validation rules
- Only difference: form is pre-populated and uses update action instead of create action

## Related Entity Update Actions

Each picker needs access to update actions:

### People
```tsx
import { updatePerson } from '@/lib/actions/people'
```

### Events
```tsx
import { updateEvent } from '@/lib/actions/events'
```

### Locations
```tsx
import { updateLocation } from '@/lib/actions/locations'
```

## User Feedback

### Success Messages
- Create: "Person created successfully"
- Update: "Person updated successfully"

### Error Messages
- Create: "Failed to create person"
- Update: "Failed to update person"

## Picker Components with Edit Mode

All picker components that use **CorePicker** support edit mode:

### ✅ Pickers with Edit Mode Support:
- **PeoplePicker** + PersonPickerField - Inline creation and editing of people
- **EventPicker** + EventPickerField - Inline creation and editing of events (with nested LocationPicker)
- **LocationPicker** + LocationPickerField - Inline creation and editing of locations
- **MassPicker** + MassPickerField - Inline creation and editing of masses (with nested Event + Presider pickers)
- **RolePicker** - Inline creation and editing of roles (used in Mass module for liturgical roles)

### ❌ Pickers WITHOUT Edit Mode:
- **GlobalLiturgicalEventPicker** + LiturgicalEventPickerField - Read-only liturgical calendar data (Easter, Christmas, etc.). These are official church calendar events that should not be created or edited inline.
- **ReadingPickerModal** - **Does NOT use CorePicker**. Uses custom modal implementation with filtering/categorization for scripture readings. Readings have complex structure (multiple translations, categories) and are managed through dedicated forms, not inline editing.

## Affected Modules

This pattern applies to all modules that use picker fields:

- **Weddings**: People (bride, groom, coordinator, etc.), Events (wedding, reception, rehearsal, etc.)
- **Funerals**: People (deceased, coordinator, presider, etc.), Events (funeral, viewing, etc.)
- **Presentations**: People (child, parents, godparents, etc.), Events (presentation, reception, etc.)
- **Quinceañeras**: People (quinceañera, parents, court members, etc.), Events (mass, reception, etc.)
- **Baptisms**: People (baptized, parents, godparents, etc.), Events (baptism, reception, etc.)
- **Masses**: Events (mass event), Locations
- **Mass Intentions**: Masses (inline creation/editing via MassPicker)

## Testing Checklist

When implementing edit mode for a picker:

- [ ] Clicking selected entity display box opens picker in edit mode
- [ ] Edit form is pre-populated with entity data
- [ ] All visible fields are editable
- [ ] Validation works same as create mode
- [ ] Update button saves changes via server action
- [ ] Success toast appears after update
- [ ] Updated entity is auto-selected in parent form field
- [ ] Modal closes after successful update
- [ ] User remains on parent form (no redirect)
- [ ] Clear button removes selection without opening picker
- [ ] Edit mode works for nested pickers (e.g., location within event)

## Future Enhancements

### Switch Mode Button
Consider adding a "Change" or "Select Different" button in edit mode to allow users to switch from editing the current entity to selecting a different entity from the list.

### View-Only Mode
Consider a view-only mode for entities that should be displayed but not edited inline (e.g., read-only references).

### Unsaved Changes Warning
Consider warning users if they have unsaved changes in the parent form when opening a picker to edit a related entity.
