# Phase 4 - UI Components Implementation Summary

**Date**: December 21, 2024
**Status**: ✅ COMPLETE

## Components Created

### 1. PeopleEventAssignmentSection
**Location**: `/home/user/outwardsign/src/components/people-event-assignment-section.tsx`

**Purpose**: Manages template-level person assignments (calendar_event_id = NULL)

**Features**:
- Displays PersonPicker for each person-type field where `is_per_calendar_event = false`
- Creates assignments with `calendar_event_id = NULL` (template-level)
- Updates existing assignments (person or notes)
- Removes assignments (with confirmation dialog)
- Shows notes field for each assignment
- Respects `required` flag on field definitions
- Uses server actions: `createPeopleEventAssignment`, `updatePeopleEventAssignment`, `deletePeopleEventAssignment`
- Refreshes UI with `router.refresh()` after mutations
- Shows toast notifications for success/error states

**Props**:
```typescript
interface PeopleEventAssignmentSectionProps {
  masterEventId: string
  eventTypeId: string
  currentAssignments: PeopleEventAssignmentWithPerson[]
  fieldDefinitions: InputFieldDefinition[] // Filter to type='person' && is_per_calendar_event=false
  onAssignmentChange?: () => void
}
```

**Example Usage** (for Wedding event type):
- Bride (template-level, applies to rehearsal and ceremony)
- Groom (template-level, applies to rehearsal and ceremony)
- Presider (template-level, applies to rehearsal and ceremony)

---

### 2. CalendarEventAssignmentSection
**Location**: `/home/user/outwardsign/src/components/calendar-event-assignment-section.tsx`

**Purpose**: Manages occurrence-level person assignments (calendar_event_id populated)

**Features**:
- Displays fields with count: "Lectors (1 needed, 1 assigned)"
- Lists currently assigned people with remove button
- Shows "Add" button when assigned count < needed count
- Creates assignments with `calendar_event_id` populated (occurrence-level)
- Removes assignments (with confirmation dialog)
- Uses `roleQuantities` from `mass_times_template_items` to determine counts
- Uses server actions: `createPeopleEventAssignment`, `deletePeopleEventAssignment`
- Refreshes UI with `router.refresh()` after mutations
- Shows toast notifications for success/error states
- Displays calendar event datetime for context

**Props**:
```typescript
interface CalendarEventAssignmentSectionProps {
  masterEventId: string
  calendarEventId: string
  calendarEventDateTime: string
  eventTypeId: string
  currentAssignments: PeopleEventAssignmentWithPerson[]
  fieldDefinitions: InputFieldDefinition[] // Filter to type='person' && is_per_calendar_event=true
  roleQuantities?: Record<string, number> // From mass_times_template_items
  onAssignmentChange?: () => void
}
```

**Example Usage** (for Mass event type):
- Lector (occurrence-level, different person for each Mass time)
- Eucharistic Minister (occurrence-level, different people for each Mass time)
- Altar Server (occurrence-level, different people for each Mass time)

---

## Components Updated

### 1. mass-form.tsx
**Location**: `/home/user/outwardsign/src/app/(main)/masses/mass-form.tsx`

**Changes**:
- ❌ Removed `presider` and `homilist` picker state
- ❌ Removed `presider_id` and `homilist_id` from form schema default values
- ❌ Removed `useEffect` hooks that synced presider/homilist to form
- ❌ Removed PersonPickerField for Presider
- ❌ Removed PersonPickerField for Homilist
- ✅ Added TODO comments for integrating new components:
  - `PeopleEventAssignmentSection` for template-level assignments
  - `CalendarEventAssignmentSection` for occurrence-level assignments

**Note**: The Ministers section is now commented out with TODOs. The actual integration of the new components will happen when the event type has person-type fields defined with `is_per_calendar_event` flag.

---

### 2. master-event-form.tsx
**Location**: `/home/user/outwardsign/src/components/master-event-form.tsx`

**Changes**:
- ❌ Removed `presider_id` and `homilist_id` from form schema
- ❌ Removed `presider` and `homilist` state variables
- ❌ Removed picker open states for presider/homilist
- ❌ Removed `useEffect` hooks that synced presider/homilist to form
- ❌ Removed presider/homilist from submit data
- ❌ Removed PersonPickerField for Presider
- ❌ Removed PersonPickerField for Homilist
- ✅ Changed `is_primary` to `show_on_calendar` in calendar events mapping
- ✅ Changed validation: "at least one calendar event shows on calendar" (instead of "exactly one primary")
- ✅ Added TODO comments for integrating new components

**Note**: This is a breaking change. Forms will need to be updated to use the new `people_event_assignments` pattern.

---

### 3. role-assignment-section.tsx
**Location**: `/home/user/outwardsign/src/components/role-assignment-section.tsx`

**Changes**:
- ✅ Added documentation comment noting this component uses the old `master_event_roles` pattern
- ✅ Added TODO to refactor to use `people_event_assignments` with two-level pattern
- ✅ Added reference to the new `PeopleEventAssignmentSection` and `CalendarEventAssignmentSection` components

**Note**: This component still works for now, but should be refactored to use the new pattern. It's marked with clear TODOs for future work.

---

## Pattern Compliance

### Server Actions Used
✅ `createPeopleEventAssignment(data)` - Creates assignment with validation
✅ `updatePeopleEventAssignment(id, data)` - Updates person or notes
✅ `deletePeopleEventAssignment(id)` - Soft deletes assignment

### React Patterns
✅ Uses `'use client'` directive
✅ Uses `useRouter` for navigation
✅ Uses `router.refresh()` after mutations
✅ Uses `useState` for local state management
✅ Uses toast notifications for feedback

### Form Patterns
✅ Uses PersonPickerField component (existing pattern)
✅ Uses ConfirmationDialog for destructive actions
✅ Uses Button, Badge, Card, Textarea from shadcn/ui
✅ Follows semantic color tokens (bg-accent, text-muted-foreground, etc.)
✅ Supports dark mode (no hardcoded colors)

### Data Flow
✅ Props → Component → Server Action → Database
✅ Refresh → Server Component → Props → Component (full refresh)
✅ Optional callback: `onAssignmentChange?.()` for parent notification

---

## Integration Guide

### For Template-Level Assignments (e.g., Wedding, Funeral)

```tsx
import { PeopleEventAssignmentSection } from '@/components/people-event-assignment-section'
import { getMasterEventAssignments } from '@/lib/actions/people-event-assignments'

// In your server component or API:
const assignments = await getMasterEventAssignments(masterEventId)
const templateFields = eventType.input_field_definitions
  .filter(f => f.type === 'person' && !f.is_per_calendar_event)

// In your client component:
<PeopleEventAssignmentSection
  masterEventId={masterEvent.id}
  eventTypeId={eventType.id}
  currentAssignments={assignments}
  fieldDefinitions={templateFields}
  onAssignmentChange={() => {
    // Optional: trigger re-fetch or update local state
  }}
/>
```

### For Occurrence-Level Assignments (e.g., Mass Lector)

```tsx
import { CalendarEventAssignmentSection } from '@/components/calendar-event-assignment-section'
import { getCalendarEventAssignments } from '@/lib/actions/people-event-assignments'

// In your server component or API:
const assignments = await getCalendarEventAssignments(calendarEventId)
const occurrenceFields = eventType.input_field_definitions
  .filter(f => f.type === 'person' && f.is_per_calendar_event)

// Get role quantities (if Mass)
const roleQuantities = massTimeTemplateItem?.role_quantities || {}

// In your client component:
<CalendarEventAssignmentSection
  masterEventId={masterEvent.id}
  calendarEventId={calendarEvent.id}
  calendarEventDateTime={calendarEvent.start_datetime}
  eventTypeId={eventType.id}
  currentAssignments={assignments}
  fieldDefinitions={occurrenceFields}
  roleQuantities={roleQuantities}
  onAssignmentChange={() => {
    // Optional: trigger re-fetch or update local state
  }}
/>
```

---

## Next Steps

### Immediate TODOs

1. **Integrate into Mass Form**:
   - Add `PeopleEventAssignmentSection` for presider/homilist (if they become template-level fields)
   - Add `CalendarEventAssignmentSection` for lectors/EMs in Mass scheduling UI

2. **Integrate into Event Forms**:
   - Add `PeopleEventAssignmentSection` to generic event forms
   - Filter field definitions by `is_per_calendar_event` flag

3. **Refactor role-assignment-section.tsx**:
   - Replace `master_event_roles` references with `people_event_assignments`
   - Use the two-level pattern (template vs occurrence)

4. **Update Mass Scheduling UI**:
   - Use `CalendarEventAssignmentSection` for assigning ministers to specific Mass times
   - Integrate with `mass_times_template_items.role_quantities`

### Testing

1. **Template-Level Assignment Flow**:
   - Create event with person-type fields (`is_per_calendar_event = false`)
   - Assign person using `PeopleEventAssignmentSection`
   - Verify assignment appears across all calendar events

2. **Occurrence-Level Assignment Flow**:
   - Create Mass with multiple calendar events (Sat 5pm, Sun 8am, Sun 10:30am)
   - Assign lector to Sat 5pm using `CalendarEventAssignmentSection`
   - Assign different lector to Sun 8am
   - Verify assignments are specific to each calendar event

3. **Validation**:
   - Verify required fields show error if not filled
   - Verify count enforcement (can't assign more than needed)
   - Verify soft delete works correctly
   - Verify confirmation dialogs appear for destructive actions

---

## Files Modified

### Created:
- ✅ `/home/user/outwardsign/src/components/people-event-assignment-section.tsx`
- ✅ `/home/user/outwardsign/src/components/calendar-event-assignment-section.tsx`

### Updated:
- ✅ `/home/user/outwardsign/src/app/(main)/masses/mass-form.tsx`
- ✅ `/home/user/outwardsign/src/components/master-event-form.tsx`
- ✅ `/home/user/outwardsign/src/components/role-assignment-section.tsx`

### Not Modified (dependencies already in place):
- `/home/user/outwardsign/src/lib/actions/people-event-assignments.ts` (server actions exist)
- `/home/user/outwardsign/src/lib/types.ts` (types already defined)

---

## Key Differences from Old Pattern

### Old Pattern:
- Presider/Homilist: Direct columns on `master_events` table
- Other roles: `master_event_roles` table (template only, no occurrence support)
- Person IDs in `field_values` JSONB (not queryable)
- `is_primary` flag (ambiguous for Masses)

### New Pattern:
- **ALL** person assignments: `people_event_assignments` table
- Template vs occurrence: `calendar_event_id` NULLABLE
- Queryable: Person can see all assignments across event types
- `show_on_calendar` flag (clear purpose)
- Two-level pattern enforced at application level via `is_per_calendar_event` flag

---

## Documentation References

- **Requirements**: `/home/user/outwardsign/requirements/unified-event-assignments.md`
- **Server Actions**: `/home/user/outwardsign/src/lib/actions/people-event-assignments.ts`
- **Types**: `/home/user/outwardsign/src/lib/types.ts` (lines 754-774)
- **Component Patterns**: Followed existing PersonPickerField, ConfirmationDialog, toast patterns

---

## Status: COMPLETE ✅

Phase 4 implementation is complete. The new components are ready for integration into event forms and Mass scheduling UI. The old presider/homilist fields have been removed from mass-form.tsx and master-event-form.tsx, with clear TODO comments indicating where the new components should be integrated.

Next phases can proceed with:
- Phase 5: Testing (if applicable)
- Phase 6: Documentation updates
- Integration of these components into production event forms
