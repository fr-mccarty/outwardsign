# Dynamic Event Primary Occasion Improvements

**Created:** 2025-12-11
**Status:** Ready for Development
**Agent:** brainstorming-agent → requirements-agent

## Feature Overview

Redesign how primary occasions are displayed and managed on dynamic events to treat them identically to attached occasions, with flexible ordering, clear labeling, and full calendar integration.

## Problem Statement

Currently, primary occasions on dynamic events are handled differently from attached occasions, creating an inconsistent user experience. The primary occasion has a different visual treatment, cannot be reordered alongside other occasions, and occasions (both primary and attached) do not appear on calendar views. This makes it difficult for staff to manage multi-occasion events and prevents users from seeing the full event picture in calendar views.

**Who has this problem?**
- Parish staff creating and managing dynamic events with multiple occasions
- Priests, deacons, and liturgical leaders viewing schedules and understanding event structure
- Parishioners viewing the parish calendar who need to see all occasions

## User Stories

- As a parish staff member, I want the primary occasion to look identical to attached occasions so that I have a consistent editing experience
- As a parish staff member, I want to reorder the primary occasion using drag-and-drop alongside attached occasions so that I can arrange occasions in logical or chronological order
- As a parish staff member, I want to clearly identify which occasion is the primary occasion so that I understand the event hierarchy at a glance
- As a parish staff member, I want to delete the primary occasion if needed so that I can restructure events without constraint
- As a priest viewing my schedule, I want to see all occasions (primary and attached) on the calendar so that I can understand the full scope of upcoming events
- As a parishioner viewing the parish calendar, I want to see all occasions associated with dynamic events so that I know what's happening in the parish

## Success Criteria

What does "done" look like?

- [ ] Primary occasion displays identically to attached occasions (same card/panel design, same fields, same actions)
- [ ] Primary occasion can be reordered using drag-and-drop alongside attached occasions in the list
- [ ] Primary occasion label shows "(Primary)" text next to the name to distinguish it from other occasions
- [ ] Primary occasion can be deleted without special restrictions
- [ ] All occasions (primary and attached) appear on all calendar views (day, week, month)
- [ ] Calendar views clearly distinguish the primary occasion from attached occasions
- [ ] Drag-and-drop reordering persists correctly to the database
- [ ] User can identify which occasion is primary at a glance in both edit and view modes

## Scope

### In Scope (MVP)

**Display & Layout:**
- Make primary occasion card/panel visually identical to attached occasion cards
- Add "(Primary)" text label next to primary occasion name
- No special styling or visual treatment beyond the "(Primary)" text label

**Ordering & Interaction:**
- Integrate primary occasion into the drag-and-drop reordering system alongside attached occasions
- Allow primary occasion to be positioned anywhere in the list (not forced first or last)
- Persist order changes to database

**Deletion:**
- Allow deletion of primary occasion without restrictions
- Use same delete confirmation dialog as attached occasions

**Calendar Integration:**
- Display primary occasion on all calendar views (day, week, month)
- Display all attached occasions on all calendar views
- Distinguish primary occasion from attached occasions in calendar view (likely with "(Primary)" indicator)

### Out of Scope (Future)

- Ability to reassign/promote a different occasion to be the primary
- Special visual styling or badges for primary occasions beyond text label
- Filtering calendar views to show only primary occasions or only attached occasions
- Bulk actions on occasions
- Occasion templates or duplication

## Key User Flows

### Primary Flow: Viewing a Dynamic Event

1. User navigates to a dynamic event detail page
2. User sees a list of all occasions (primary and attached) displayed identically
3. Each occasion appears as a card/panel with the same fields and layout
4. The primary occasion has "(Primary)" appended to its name/label
5. User can visually scan and immediately identify which occasion is primary

### Alternative Flow: Reordering Occasions

1. User is editing a dynamic event with multiple occasions
2. User sees all occasions (primary and attached) in a draggable list
3. User drags the primary occasion to a different position (e.g., from position 1 to position 3)
4. The list reorders visually
5. User saves changes
6. Order persists and displays correctly on subsequent views

### Alternative Flow: Deleting Primary Occasion

1. User is editing a dynamic event
2. User clicks delete on the primary occasion
3. System shows confirmation dialog (same as for attached occasions)
4. User confirms deletion
5. Primary occasion is removed from the event
6. System handles the aftermath (see Open Questions)

### Primary Flow: Viewing Calendar

1. User navigates to the parish calendar (day, week, or month view)
2. User sees a dynamic event scheduled
3. Calendar displays all occasions associated with that event (primary and attached)
4. Primary occasion shows with "(Primary)" indicator
5. User can distinguish between primary and attached occasions at a glance

## Integration Points

**Existing Features:**
- Dynamic Events module (`src/app/(main)/dynamic-events/`)
- Occasions management (currently part of dynamic events)
- Drag-and-drop reordering system (likely uses @dnd-kit based on project patterns)
- Calendar views (`src/app/(main)/calendar/`)
- Calendar event rendering components (mobile/day/week/month indicators)

**Existing Components:**
- Dynamic event form
- Occasion cards/panels (attached occasions)
- Drag-and-drop reordering interface
- Calendar event items (day, week, month views)
- Delete confirmation dialogs

**Database:**
- `dynamic_events` table
- `occasions` table (or similar - needs investigation)
- Relationship between events and occasions
- Ordering/position field for occasions

## Open Questions for Requirements-Agent

**Database & Data Model:**
- What is the current database schema for occasions? Is there a separate table or are occasions embedded?
- How is the primary occasion currently stored/identified? (Boolean flag? Special ID field?)
- How is ordering currently stored? (Position field? Created_at timestamp?)
- What happens in the database when the primary occasion is deleted?
  - Does the event get deleted?
  - Does another occasion become primary automatically?
  - Does the event remain with no primary?

**Current Implementation:**
- Where is the primary occasion currently displayed in the UI? (Separate section? Different component?)
- Where are attached occasions displayed? (List? Cards? Form fields?)
- Is drag-and-drop already implemented for attached occasions?
- What is the current UX pattern for reordering?

**Calendar Integration:**
- How are events currently rendered on the calendar?
- What data structure feeds the calendar views?
- Are there any existing patterns for showing multiple items from a single event?
- What are the performance implications of showing multiple occasions per event on the calendar?

**Technical Patterns:**
- What drag-and-drop library is being used? (@dnd-kit based on project docs?)
- What is the unique constraint handling pattern when reordering?
- Are there existing server actions for occasion CRUD operations?
- What is the WithRelations pattern for fetching dynamic events with occasions?

**Edge Cases:**
- What happens when ALL occasions (including primary) are deleted from a dynamic event?
- Can a dynamic event exist with zero occasions?
- If not, should deleting the last/primary occasion delete the entire event?
- How should occasions be ordered by default when first created?
- What happens if two occasions have the same position/order value?

**User Experience:**
- Should there be a visual indicator during drag-and-drop that the user is moving the primary occasion?
- Should there be any confirmation when reordering the primary occasion specifically?
- On the calendar, if there are many occasions, how should they be displayed? (Stacked? Expandable? Truncated with "show more"?)
- Should calendar event click behavior differ for primary vs attached occasions?

## Next Steps

Hand off to requirements-agent for technical analysis including:
1. Database schema investigation (occasions table, relationships, constraints)
2. Current implementation analysis (how primary occasion is currently handled)
3. Drag-and-drop pattern analysis (existing implementation, library usage)
4. Calendar rendering investigation (data flow, component structure)
5. Server action requirements (CRUD operations, reordering, deletion logic)
6. WithRelations interface design (fetching events with all occasions)
7. Component architecture (unified occasion display component)
8. Technical feasibility assessment and implementation plan

---

## TECHNICAL REQUIREMENTS
(Added by requirements-agent)

### Current Implementation Analysis

**Database Schema Investigation:**

The occasions table exists at `supabase/migrations/20251210000008_create_occasions_table.sql`:

```
TABLE: occasions
  - id: UUID primary key
  - event_id: UUID foreign key to dynamic_events (CASCADE on delete)
  - label: TEXT not null
  - date: DATE nullable
  - time: TIME nullable
  - location_id: UUID foreign key to locations (SET NULL on delete)
  - is_primary: BOOLEAN not null (default false)
  - deleted_at: TIMESTAMPTZ nullable
  - created_at: TIMESTAMPTZ not null

CONSTRAINTS:
  - Unique index on (event_id) WHERE is_primary = true AND deleted_at IS NULL
  - Ensures only ONE primary occasion per event
  - NO position/display_order column (currently ordered by date, then created_at)
```

**Key Finding:** There is NO position column for manual ordering. Occasions are currently ordered by:
1. Date (ascending)
2. Created_at (ascending)

**Server Actions Analysis:**

Location: `src/lib/actions/occasions.ts`

Current server actions:
- `getOccasions(eventId)` - Fetches occasions ordered by date then created_at
- `createOccasion(eventId, data)` - Creates occasion, unsets other primary occasions if is_primary=true
- `updateOccasion(id, data)` - Updates occasion, unsets other primary occasions if is_primary=true
- `deleteOccasion(id)` - **PREVENTS deletion of primary occasion** (throws error)

**Critical Finding:** Current deletion logic PREVENTS deleting primary occasions:
- Line 208-226 in occasions.ts blocks deletion if `is_primary=true`
- Error message: "Cannot delete primary occasion. Mark another occasion as primary first."
- Also prevents deleting last occasion on an event

**Current UI Implementation:**

Location: `src/app/(main)/events/[event_type_id]/dynamic-event-form.tsx`

Current form displays ONLY the primary occasion:
- Lines 76-89: Single occasion state for primary occasion only
- Lines 329-356: "Date & Location" section shows only primary occasion fields
- NO UI for viewing/managing attached occasions
- NO drag-and-drop implementation for occasions

**Form creates only ONE occasion (the primary):**
- Lines 144-150: Creates single occasion with `is_primary: true`
- No support for multiple occasions during event creation

**Calendar Integration Analysis:**

Location: `src/lib/actions/dynamic-events.ts` (lines 713-841)

The `getOccasionsForCalendar()` function already:
- Fetches ALL occasions (primary and attached) from database
- Returns `CalendarOccasionItem[]` with is_primary flag
- Calendar SHOULD be showing all occasions already

Location: `src/app/(main)/calendar/calendar-client.tsx` (lines 36-57)

The calendar transforms occasions with this logic:
```
Line 39-41: Primary occasions show as just event_type_name
Line 42: Attached occasions show as "event_type_name - label"
```

**Critical Finding:** Calendar is ALREADY rendering all occasions, but the title logic differentiates primary from attached.

### Database Schema Changes

**Add position column for manual ordering:**

Create new migration: `supabase/migrations/YYYYMMDDHHMMSS_add_position_to_occasions.sql`

```sql
ALTER TABLE occasions
ADD COLUMN position INTEGER NOT NULL DEFAULT 0;

CREATE INDEX idx_occasions_position ON occasions(event_id, position);

COMMENT ON COLUMN occasions.position IS 'Manual display order for occasions within an event. Lower values appear first.';
```

**Rationale:**
- Current ordering by date/created_at is automatic and inflexible
- Position column allows drag-and-drop reordering
- Default 0 for backward compatibility with existing occasions
- No unique constraint needed (unlike some other modules) - occasions can share same position temporarily during reorder

### Server Action Changes

**Location:** `src/lib/actions/occasions.ts`

**1. Modify `getOccasions()` to order by position:**

CHANGE sorting from:
```
.order('date', { ascending: true })
.order('created_at', { ascending: true })
```

TO:
```
.order('position', { ascending: true })
.order('created_at', { ascending: true })
```

**2. Add new `reorderOccasions()` server action:**

```
FUNCTION reorderOccasions(eventId: string, orderedIds: string[])
  1. Verify event belongs to user's parish
  2. For each orderedId with index i:
     - Update position to i
  3. Revalidate path /events/[event_type_slug]/[event_id]
  RETURN void
```

Pattern reference: DRAG_AND_DROP.md pattern (no unique constraint on position, so simple sequential update)

**3. Modify `deleteOccasion()` to allow deleting primary:**

REMOVE lines 208-226 that prevent primary occasion deletion

ADD check for last occasion (regardless of is_primary):
```
IF remaining occasions count <= 1 THEN
  THROW error "Cannot delete the last occasion for an event"
END IF
```

**Rationale:** Allow deleting primary occasion as long as it's not the LAST occasion

**4. Modify `createOccasion()` to set position:**

ADD logic to set position to max(position) + 1 for new occasions

### UI Component Changes

**Location:** `src/app/(main)/events/[event_type_id]/dynamic-event-form.tsx`

**MAJOR REFACTOR NEEDED:**

Currently shows only primary occasion in a "Date & Location" section.

NEW DESIGN: Show all occasions in a draggable list (similar to mass role template items)

**New Occasions Section:**

```
SECTION: Occasions (Draggable List)
  FOR EACH occasion in occasions (sorted by position):
    - DraggableListItem with:
      - Drag handle (GripVertical icon)
      - Label field (editable inline or via dialog)
      - Date field
      - Time field
      - Location picker
      - "(Primary)" badge if is_primary = true
      - Edit button
      - Delete button (with confirmation)
  END FOR

  BUTTON: Add Occasion
    - Opens dialog to create new occasion
    - Auto-sets is_primary=false
    - Position set to max + 1
```

**Required imports:**
- @dnd-kit/core: DndContext, closestCenter, PointerSensor, KeyboardSensor
- @dnd-kit/sortable: SortableContext, verticalListSortingStrategy, arrayMove
- DraggableListCard or create new OccasionCard component

**State changes:**
- REMOVE single occasion state (lines 76-89)
- ADD occasions array state: `useState<Occasion[]>(event?.occasions || [])`
- ADD drag-and-drop handlers
- ADD CRUD handlers for occasions

**Component Pattern:**

Reference: `src/app/(main)/settings/custom-lists/[slug]/custom-list-detail-client.tsx` (similar draggable list pattern)

### New Components Needed

**1. OccasionCard Component**

Location: `src/components/occasion-card.tsx`

```
COMPONENT OccasionCard
  PROPS:
    - occasion: Occasion
    - onEdit: (occasion) => void
    - onDelete: (id) => void
    - isDragging: boolean

  DISPLAY:
    - Drag handle
    - Label with "(Primary)" badge if is_primary
    - Date (formatted with formatDatePretty)
    - Time (formatted)
    - Location name
    - Edit and Delete action buttons
```

Alternative: Use existing DraggableListCard component and customize with children

**2. OccasionFormDialog Component**

Location: `src/components/occasion-form-dialog.tsx`

```
COMPONENT OccasionFormDialog
  PROPS:
    - open: boolean
    - onOpenChange: (open) => void
    - occasion?: Occasion (for editing)
    - eventId: string
    - onSave: () => void

  FIELDS:
    - Label (text input)
    - Date (DatePickerField)
    - Time (TimePickerField)
    - Location (LocationPickerField)
    - Is Primary (Switch) - optional, but may want to hide this

  ACTIONS:
    - Save (calls createOccasion or updateOccasion)
    - Cancel
```

### Calendar Component Changes

**Current State:** Calendar already shows all occasions via `getOccasionsForCalendar()`

**Required Changes:** Update title logic to show "(Primary)" indicator more clearly

**Location:** `src/app/(main)/calendar/calendar-client.tsx` (lines 36-57)

CHANGE occasionToCalendarItem function:

```
FROM:
  const title = occasion.is_primary
    ? occasion.event_type_name
    : `${occasion.event_type_name} - ${occasion.label}`

TO:
  const title = occasion.is_primary
    ? `${occasion.event_type_name} (Primary)`
    : `${occasion.event_type_name} - ${occasion.label}`
```

**Rationale:** Clearly label primary occasions on calendar to match view/edit UI

**No changes needed to:**
- `parish-event-item-day.tsx`
- `parish-event-item-week.tsx`
- `parish-event-item-month.tsx`

These components already render the title passed to them.

### Type Interface Updates

**Location:** `src/lib/types.ts`

**Add position field to Occasion interface:**

```
INTERFACE Occasion
  CHANGE: Add position: number

INTERFACE CreateOccasionData
  CHANGE: Add position?: number

INTERFACE UpdateOccasionData
  CHANGE: Add position?: number
```

**New interface for reorder action:**

```
INTERFACE ReorderOccasionsData
  eventId: string
  orderedIds: string[]
```

### File Structure

**New files to create:**

```
/src/components/
  occasion-card.tsx (draggable occasion display)
  occasion-form-dialog.tsx (create/edit occasion dialog)

/src/lib/actions/
  occasions.ts (modify existing - add reorderOccasions action)

/supabase/migrations/
  YYYYMMDDHHMMSS_add_position_to_occasions.sql
```

**Files to modify:**

```
/src/app/(main)/events/[event_type_id]/dynamic-event-form.tsx (major refactor)
/src/app/(main)/calendar/calendar-client.tsx (minor update to title)
/src/lib/types.ts (add position field)
/src/lib/actions/occasions.ts (reorder, delete logic changes)
```

### View Client Changes

**Location:** `src/app/(main)/events/[event_type_id]/[id]/dynamic-event-view-client.tsx`

**Current State:** View client shows NO occasion information (only scripts)

**Required Changes:** Add occasions display section in ModuleViewContainer

```
ADD SECTION before scripts:
  TITLE: "Occasions"

  FOR EACH occasion in event.occasions (sorted by position):
    - Card showing:
      - Label with "(Primary)" badge if is_primary
      - Date (formatted)
      - Time (formatted)
      - Location name
  END FOR
```

This ensures users can VIEW all occasions, not just edit them.

### Internationalization

**"(Primary)" Label:**

Location: `src/lib/constants.ts` or new occasions constants file

```
CONSTANT OCCASION_PRIMARY_LABEL
  en: "(Primary)"
  es: "(Principal)"
```

Use this constant in:
- OccasionCard component
- Calendar title generation
- View client occasions section

### Testing Requirements

**Unit Tests:**

1. Test `reorderOccasions()` server action:
   - Reorders correctly
   - Validates event belongs to parish
   - Handles invalid IDs gracefully

2. Test `deleteOccasion()` changes:
   - Allows deleting primary if other occasions exist
   - Prevents deleting last occasion
   - Allows deleting non-primary occasions

**Integration Tests:**

1. Test drag-and-drop reordering in dynamic event form:
   - Optimistic UI update
   - Persists to database
   - Revalidates page

2. Test occasion CRUD operations:
   - Create occasion
   - Edit occasion
   - Delete occasion (with confirmation)
   - Mark/unmark as primary

**E2E Tests:**

1. Test multi-occasion event creation:
   - Create event with primary occasion
   - Add additional occasions
   - Reorder occasions
   - Delete non-primary occasion
   - View event shows all occasions

2. Test calendar integration:
   - All occasions appear on calendar
   - Primary occasions labeled correctly
   - Clicking occasion navigates correctly

### Documentation Updates

**MODULE_COMPONENT_PATTERNS.md:**

ADD section: "Dynamic Events - Multiple Occasions Pattern"
- Describe occasion list with drag-and-drop
- Describe primary vs attached occasion distinction
- Link to OccasionCard and OccasionFormDialog components

**COMPONENT_REGISTRY.md:**

ADD entries:
- OccasionCard - Draggable occasion display card
- OccasionFormDialog - Create/edit occasion dialog

**DRAG_AND_DROP.md:**

ADD entry to "Current Implementations" table:
- Occasions in Dynamic Events | src/app/(main)/events/.../dynamic-event-form.tsx | Uses position column (no unique constraint)

### Security Considerations

**Authentication:**
- All occasion CRUD actions already use `requireSelectedParish()` and `ensureJWTClaims()`
- Reorder action must also use these checks

**Authorization:**
- Occasions inherit permissions from parent event (already implemented in RLS policies)
- No additional RLS changes needed

**Data Validation:**
- Validate orderedIds array length matches actual occasion count
- Validate all IDs belong to the same event
- Validate event belongs to user's parish

**Edge Case Handling:**
- Prevent deleting last occasion (already planned)
- Handle concurrent updates gracefully (optimistic UI + server validation)
- Validate position values are non-negative integers

### Implementation Complexity

**Complexity Rating:** Medium

**Reason:**
- Database change is straightforward (add position column)
- Server actions require moderate changes (reorder function, delete logic update)
- UI refactor is the largest effort (replace single occasion form with draggable list)
- Calendar changes are minimal (already fetches all occasions)
- Drag-and-drop pattern is well-established in codebase (reference existing implementations)

**Estimated Implementation Areas:**
- Database migration: Low complexity
- Server actions: Low-Medium complexity (reorder pattern exists, delete logic change is simple)
- Form refactor: Medium-High complexity (significant UI restructuring)
- Calendar updates: Low complexity (title logic change only)
- Testing: Medium complexity (drag-and-drop testing, occasion CRUD flows)

### Dependencies and Blockers

**Dependencies:**
- None - feature is self-contained
- Uses existing @dnd-kit library (already in project)
- Uses existing picker components (LocationPickerField, DatePickerField, TimePickerField)

**Blockers:**
- None identified

**Helpful Context:**
- Existing drag-and-drop implementations to reference:
  - Mass role template items list
  - Custom list items
  - Event types list
  - Mass types list
- Existing dialog form patterns for reference

### Documentation Inconsistencies Found

**None** - All documentation reviewed matches actual implementation:
- DRAG_AND_DROP.md accurately describes @dnd-kit usage
- Database schema matches migration files
- Server action patterns match conventions

### Edge Cases & Decisions

**1. Deleting the last occasion:**

DECISION: Prevent deletion of the last occasion on an event
REASON: Events must have at least one occasion (enforced at creation)
IMPLEMENTATION: Update deleteOccasion() to check total count, not just is_primary

**2. Deleting primary occasion when others exist:**

DECISION: Allow deletion without auto-promoting another occasion
REASON: Simplicity - user can manually mark another as primary before or after deletion
ALTERNATIVE (Future): Auto-promote the next occasion by position

**3. Creating event with zero occasions:**

CURRENT: Event creation requires exactly one primary occasion (line 573-580 in dynamic-events.ts)
NO CHANGE: Keep this validation in place

**4. Default position for new occasions:**

DECISION: New occasions get position = max(existing positions) + 1
REASON: Append to end of list by default
IMPLEMENTATION: Calculate in createOccasion() server action

**5. Handling duplicate position values:**

DECISION: Allow duplicate positions (no unique constraint)
REASON: Simplifies reorder logic during drag-and-drop
FALLBACK: Secondary sort by created_at ensures stable ordering

**6. Calendar display with many occasions:**

CURRENT: Calendar shows each occasion as a separate item
NO CHANGE FOR MVP: Existing calendar layout handles multiple items per date
FUTURE: Could add grouping/expansion if many occasions on one date

**7. Occasion label for primary:**

CURRENT: Primary occasion label defaults to event_type.name
DECISION: Keep this pattern but make label editable
REASON: Provides sensible default while allowing customization

**8. Position values during reorder:**

DECISION: Use simple sequential update (0, 1, 2, 3...)
REASON: No unique constraint on position, so no need for two-phase update
REFERENCE: Simpler than mass-role-template-items which has unique constraint

### Next Steps

**Status:** Ready for Development

**Hand off to developer-agent for implementation in this order:**

1. **Phase 1 - Database:** Create migration to add position column
2. **Phase 2 - Server Actions:**
   - Add reorderOccasions()
   - Modify deleteOccasion() to allow primary deletion
   - Modify getOccasions() to order by position
   - Modify createOccasion() to set position
3. **Phase 3 - Components:**
   - Create OccasionCard component
   - Create OccasionFormDialog component
4. **Phase 4 - Form Refactor:**
   - Refactor dynamic-event-form.tsx to show draggable occasion list
   - Add drag-and-drop handling
   - Add occasion CRUD handling
5. **Phase 5 - View Updates:**
   - Update dynamic-event-view-client.tsx to show occasions
   - Update calendar-client.tsx title logic
6. **Phase 6 - Testing:**
   - Unit tests for server actions
   - Integration tests for form interactions
   - E2E tests for full flow

**Note for Developer:** Reference existing drag-and-drop implementations in mass-role-template-items and custom-list-items for patterns.

---

**Technical Requirements Complete:** Ready for developer-agent implementation.
