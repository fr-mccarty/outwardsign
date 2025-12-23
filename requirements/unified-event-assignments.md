# Unified Event Assignments Schema

**Date:** December 21, 2024
**Status:** Ready for Development
**Complexity:** High - Database refactoring with cascading impacts

## Overview and Goals

This refactoring unifies how people are assigned to events across the entire application, replacing the current fragmented approach (separate columns, JSONB storage, and `master_event_roles` table) with a single, queryable `people_event_assignments` table.

### Core Objectives

1. **Unified Assignment Storage**: All person-to-event assignments in one relational table
2. **Two-Level Pattern**: Support both template-level (applies to master event) and occurrence-level (applies to specific calendar event) assignments
3. **Person-Centric Queries**: Enable "show me all my assignments" queries across all event types
4. **Future Automation**: Prepare foundation for automated Mass ministry scheduling
5. **Schema Simplification**: Remove redundant columns and deprecated tables

### Success Criteria

- All person assignments queryable from single table
- Template vs occurrence distinction is clear and enforceable
- Existing functionality preserved (no feature regression)
- Foundation laid for future Mass scheduling automation
- Documentation and code patterns consistent with new schema

---

## Problem Statement

### Current State Issues

1. **Fragmented Assignment Storage**:
   - `master_events.presider_id` and `homilist_id` columns (inconsistent pattern)
   - `master_event_roles` table (partial solution, only template-level)
   - Person UUIDs buried in `master_events.field_values` JSONB (not queryable)
   - No way to distinguish template-level vs occurrence-level assignments

2. **Person-Centric Queries Impossible**:
   - Cannot query "what are all my upcoming assignments?" across event types
   - Cannot filter or aggregate assignments by person

3. **Mass Scheduling Blocked**:
   - No structure for assigning lectors/EMs to specific Mass times
   - Cannot track occurrence-level assignments (e.g., John at Saturday 5pm, Mary at Sunday 10am)

4. **Confusing Calendar Visibility**:
   - `is_primary` flag is ambiguous for Masses (all are "primary")
   - Not clear what should/shouldn't appear on parish calendar

### Target State

- Single `people_event_assignments` table for ALL person-to-event assignments
- Clear template vs occurrence distinction via `calendar_event_id` NULLABLE pattern
- `show_on_calendar` boolean for calendar visibility
- `is_per_calendar_event` flag on field definitions
- No hardcoded presider/homilist columns
- Legacy tables removed

---

## Key Insight: The Two-Level Pattern

```
people_event_assignments.calendar_event_id NULLABLE
├── NULL = template-level (bride, groom, wedding presider)
└── POPULATED = occurrence-level (lector at specific Mass time)
```

### Example: 4th Sunday in Advent

```
master_event: "4th Sunday in Advent"
├── people_event_assignments (template-level, calendar_event_id = NULL)
│   ├── first_reading = Micah 5:1-4a     ← Same for ALL Masses
│   └── gospel = Luke 1:39-45            ← Same for ALL Masses
│
├── calendar_event: Sat 5pm
│   └── people_event_assignments (calendar_event_id = this one)
│       └── lector = John Smith          ← Only this Mass
│
├── calendar_event: Sun 8am
│   └── people_event_assignments (calendar_event_id = this one)
│       └── lector = Mary Jones          ← Only this Mass
│
└── calendar_event: Sun 10:30am
    └── people_event_assignments (calendar_event_id = this one)
        └── lector = Bob Wilson          ← Only this Mass
```

### Example: Smith-Johnson Wedding

```
master_event: "Smith-Johnson Wedding"
├── people_event_assignments (template-level, calendar_event_id = NULL)
│   ├── bride = Jane Smith               ← Same for rehearsal & ceremony
│   ├── groom = John Johnson             ← Same for rehearsal & ceremony
│   └── presider = Fr. Michael           ← Same for rehearsal & ceremony
│
├── calendar_event: Rehearsal (show_on_calendar = false)
│   └── (no occurrence-level assignments)
│
└── calendar_event: Ceremony (show_on_calendar = true)
    └── (no occurrence-level assignments)
```

---

## TECHNICAL REQUIREMENTS
(Added by requirements-agent)

### Database Schema

#### New Table: `people_event_assignments`

**Purpose**: Unified storage for all person-to-event assignments (template-level and occurrence-level)

**Schema**:

```sql
CREATE TABLE people_event_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event context (two-level pattern)
  master_event_id UUID NOT NULL REFERENCES master_events(id) ON DELETE CASCADE,
  calendar_event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,

  -- Assignment details
  field_definition_id UUID NOT NULL REFERENCES input_field_definitions(id) ON DELETE RESTRICT,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,

  -- Optional notes (e.g., substitution info)
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

**Column Descriptions**:

- `master_event_id`: Parent event (required for all assignments)
- `calendar_event_id`: NULL for template-level, populated for occurrence-level
- `field_definition_id`: Which role/field this assignment is for (e.g., "lector", "bride", "presider")
- `person_id`: Who is assigned
- `notes`: Optional notes (e.g., "substitute for John Doe", "playing piano")

**Indexes**:

```sql
-- Performance indexes
CREATE INDEX idx_people_event_assignments_master_event_id
  ON people_event_assignments(master_event_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_people_event_assignments_calendar_event_id
  ON people_event_assignments(calendar_event_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_people_event_assignments_person_id
  ON people_event_assignments(person_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_people_event_assignments_field_definition_id
  ON people_event_assignments(field_definition_id) WHERE deleted_at IS NULL;

-- Composite index for common query pattern (person's assignments)
CREATE INDEX idx_people_event_assignments_person_master_calendar
  ON people_event_assignments(person_id, master_event_id, calendar_event_id)
  WHERE deleted_at IS NULL;
```

**Unique Constraint**:

```sql
-- Prevent duplicate assignments: one person per role per event/occurrence
-- Uses COALESCE trick to handle NULL calendar_event_id in unique index
CREATE UNIQUE INDEX idx_people_event_assignments_unique
ON people_event_assignments(
  master_event_id,
  COALESCE(calendar_event_id, '00000000-0000-0000-0000-000000000000'::uuid),
  field_definition_id,
  person_id
)
WHERE deleted_at IS NULL;
```

**RLS Policies**:

```sql
-- Enable RLS
ALTER TABLE people_event_assignments ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON people_event_assignments TO anon;
GRANT ALL ON people_event_assignments TO authenticated;
GRANT ALL ON people_event_assignments TO service_role;

-- SELECT: Parish members can read assignments for their parish
CREATE POLICY people_event_assignments_select_policy ON people_event_assignments
  FOR SELECT
  USING (
    master_event_id IN (
      SELECT me.id
      FROM master_events me
      JOIN parish_users pu ON me.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND me.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- INSERT: Admin, Staff, Ministry-Leader can create assignments
CREATE POLICY people_event_assignments_insert_policy ON people_event_assignments
  FOR INSERT
  WITH CHECK (
    master_event_id IN (
      SELECT me.id
      FROM master_events me
      JOIN parish_users pu ON me.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
        AND me.deleted_at IS NULL
    )
  );

-- UPDATE: Admin, Staff, Ministry-Leader can update assignments
CREATE POLICY people_event_assignments_update_policy ON people_event_assignments
  FOR UPDATE
  USING (
    master_event_id IN (
      SELECT me.id
      FROM master_events me
      JOIN parish_users pu ON me.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
        AND me.deleted_at IS NULL
    )
  );

-- DELETE: Admin, Staff, Ministry-Leader can delete assignments
CREATE POLICY people_event_assignments_delete_policy ON people_event_assignments
  FOR DELETE
  USING (
    master_event_id IN (
      SELECT me.id
      FROM master_events me
      JOIN parish_users pu ON me.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
        AND me.deleted_at IS NULL
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER people_event_assignments_updated_at
  BEFORE UPDATE ON people_event_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Comments**:

```sql
COMMENT ON TABLE people_event_assignments IS 'Unified storage for all person-to-event assignments. calendar_event_id NULL = template-level (applies to all occurrences), populated = occurrence-level (specific to one calendar event).';
COMMENT ON COLUMN people_event_assignments.calendar_event_id IS 'NULL for template-level assignments (bride, groom, presider), populated for occurrence-level assignments (lector at Saturday 5pm Mass)';
COMMENT ON COLUMN people_event_assignments.field_definition_id IS 'References which role/field this assignment is for (defined in input_field_definitions)';
COMMENT ON COLUMN people_event_assignments.notes IS 'Optional notes (e.g., "substitute for John Doe", "playing piano")';
```

---

#### Modification: `calendar_events` Table

**Add Column**: `show_on_calendar`

```sql
ALTER TABLE calendar_events
ADD COLUMN show_on_calendar BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN calendar_events.show_on_calendar IS 'Whether this calendar event should appear on the parish public calendar (e.g., false for rehearsals/vigils, true for main ceremonies)';
```

**Remove Column**: `is_primary`

```sql
-- Remove is_primary (replaced by show_on_calendar)
ALTER TABLE calendar_events
DROP COLUMN is_primary;
```

**Rationale**:
- `is_primary` is confusing for Masses (all Mass times are "primary")
- `show_on_calendar` is clearer: "should this appear on the calendar?"
- For special liturgies, the one with `show_on_calendar = true` IS the primary by definition

**Example Values**:

| Event Type | Calendar Event | show_on_calendar |
|------------|----------------|------------------|
| Mass (4th Sunday) | Sat 5pm | `true` |
| Mass (4th Sunday) | Sun 8am | `true` |
| Mass (4th Sunday) | Sun 10:30am | `true` |
| Wedding | Rehearsal | `false` |
| Wedding | Ceremony | `true` |
| Funeral | Vigil | `false` |
| Funeral | Mass | `true` |

---

#### Modification: `input_field_definitions` Table

**Add Column**: `is_per_calendar_event`

```sql
ALTER TABLE input_field_definitions
ADD COLUMN is_per_calendar_event BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN input_field_definitions.is_per_calendar_event IS 'If true, this field expects occurrence-level assignments (specific to each calendar_event). If false, template-level assignments (shared across all calendar_events). Example: lector=true, bride=false.';
```

**Update Constraint**: Add check constraint (optional but recommended)

```sql
-- Constraint: is_per_calendar_event only valid for person type fields
ALTER TABLE input_field_definitions
ADD CONSTRAINT check_is_per_calendar_event_only_for_person
  CHECK (is_per_calendar_event = false OR type = 'person');
```

**Example Values**:

| Event Type | Field | Type | is_per_calendar_event | Explanation |
|------------|-------|------|---------------------|-------------|
| Wedding | bride | person | `false` | Same bride at rehearsal and ceremony |
| Wedding | groom | person | `false` | Same groom at rehearsal and ceremony |
| Wedding | presider | person | `false` | Same presider at rehearsal and ceremony |
| Mass | first_reading | content | `false` | Same readings at all Mass times |
| Mass | lector | person | `true` | Different lector for each Mass time |
| Mass | eucharistic_minister | person | `true` | Different EMs for each Mass time |

---

#### Modification: `event_types` Table

**Remove Column**: `role_definitions`

```sql
-- Remove role_definitions JSONB column (now handled by input_field_definitions)
ALTER TABLE event_types
DROP COLUMN role_definitions;

-- Drop associated GIN index
DROP INDEX IF EXISTS idx_event_types_role_definitions_gin;
```

**Rationale**:
- Role definitions now stored as `input_field_definitions` rows with `type='person'`
- Moves from unstructured JSONB to relational schema
- Enables foreign key constraints and better validation

---

#### Modification: `mass_times_template_items` Table

**Add Column**: `role_quantities`

```sql
ALTER TABLE mass_times_template_items
ADD COLUMN role_quantities JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN mass_times_template_items.role_quantities IS 'JSONB object mapping role property_names to quantity needed. Example: {"lector": 1, "eucharistic_minister": 4, "altar_server": 2}. Keys match input_field_definitions.property_name.';

-- GIN index for JSONB queries
CREATE INDEX idx_mass_times_template_items_role_quantities_gin
  ON mass_times_template_items USING GIN (role_quantities);
```

**Purpose**: Define how many ministers are needed per role per Mass time.

**Example Value**:

```json
{
  "lector": 1,
  "eucharistic_minister": 4,
  "altar_server": 2,
  "cantor": 1
}
```

**Note**: Keys must match `input_field_definitions.property_name` for roles in the Mass event type.

---

#### Modification: `master_events` Table

**Remove Columns**: `presider_id`, `homilist_id`

```sql
-- Remove presider_id and homilist_id columns (now in people_event_assignments)
ALTER TABLE master_events
DROP COLUMN presider_id,
DROP COLUMN homilist_id;

-- Drop associated indexes
DROP INDEX IF EXISTS idx_master_events_presider_id;
DROP INDEX IF EXISTS idx_master_events_homilist_id;
```

**Rationale**:
- Presider and homilist are now just rows in `people_event_assignments`
- Consistent pattern: ALL person assignments in one table
- No special-case columns

---

#### Tables to Delete

**Delete Migration Files**:

1. **`20251210000011_create_master_event_roles_table.sql`** - Replaced by `people_event_assignments`
2. **`20251031000003_create_events_table.sql`** - Legacy table, not used

**Verification Before Deletion**:

```sql
-- Check if master_event_roles has any data
SELECT COUNT(*) FROM master_event_roles;

-- Check if events table has any data
SELECT COUNT(*) FROM events;
```

If non-zero, data migration needed (see Data Migration section).

---

### Constraints and Validation Rules

#### Database-Level Constraints

1. **Unique Assignment Constraint**:
   - One person per role per event/occurrence
   - Enforced by unique index (handles NULL calendar_event_id)

2. **Foreign Key Constraints**:
   - `master_event_id`: ON DELETE CASCADE (delete assignments when event deleted)
   - `calendar_event_id`: ON DELETE CASCADE (delete occurrence assignments when calendar event deleted)
   - `field_definition_id`: ON DELETE RESTRICT (prevent deletion of field definitions with assignments)
   - `person_id`: ON DELETE RESTRICT (prevent deletion of people with assignments)

3. **Required Fields**:
   - `master_event_id`: NOT NULL
   - `field_definition_id`: NOT NULL
   - `person_id`: NOT NULL
   - `calendar_event_id`: NULLABLE (core of two-level pattern)

#### Application-Level Validation

1. **Occurrence-Level Enforcement**:
   - If `field_definition.is_per_calendar_event = true`, then `people_event_assignments.calendar_event_id` should be populated
   - If `field_definition.is_per_calendar_event = false`, then `people_event_assignments.calendar_event_id` should be NULL
   - Enforced in server actions before INSERT/UPDATE

2. **Role Quantity Validation** (future):
   - Validate that number of assignments for a role doesn't exceed `mass_times_template_items.role_quantities`
   - Warning (not blocking) if under-assigned

3. **Person Availability Validation** (future):
   - Check `people.mass_times_template_item_ids` for availability
   - Check `person_blackout_dates` for conflicts

#### Validation Pseudo-Code

```
FUNCTION validatePeopleEventAssignment(assignmentData):
  1. Fetch field_definition by assignmentData.field_definition_id

  2. IF field_definition.type != 'person' THEN
       RETURN error "Field definition must be type 'person'"

  3. IF field_definition.is_per_calendar_event = true THEN
       IF assignmentData.calendar_event_id IS NULL THEN
         RETURN error "Occurrence-level assignments require calendar_event_id"
       END IF
     ELSE
       IF assignmentData.calendar_event_id IS NOT NULL THEN
         RETURN error "Template-level assignments must have calendar_event_id = NULL"
       END IF
     END IF

  4. Check unique constraint (person not already assigned to this role/event/occurrence)

  5. Verify master_event belongs to selected parish

  6. Verify person belongs to selected parish

  7. Verify field_definition belongs to master_event's event_type

  8. Return success
END FUNCTION
```

---

### Example Queries

#### Query: "Show me all my assignments"

```sql
-- Get all assignments for a specific person
SELECT
  pea.id,
  pea.master_event_id,
  pea.calendar_event_id,
  me.status AS event_status,
  et.name AS event_type_name,
  fd.name AS role_name,
  fd.is_per_calendar_event,
  -- Template-level: use master_event created_at, Occurrence-level: use calendar_event start_datetime
  COALESCE(ce.start_datetime, me.created_at) AS event_datetime,
  ce.location_id,
  pea.notes
FROM people_event_assignments pea
JOIN master_events me ON pea.master_event_id = me.id
JOIN event_types et ON me.event_type_id = et.id
JOIN input_field_definitions fd ON pea.field_definition_id = fd.id
LEFT JOIN calendar_events ce ON pea.calendar_event_id = ce.id
WHERE pea.person_id = 'my-uuid'
  AND pea.deleted_at IS NULL
  AND me.deleted_at IS NULL
  -- Optionally filter for upcoming only
  AND COALESCE(ce.start_datetime, me.created_at) >= NOW()
ORDER BY COALESCE(ce.start_datetime, me.created_at) ASC;
```

**Result Example**:

| role_name | event_type_name | event_datetime | is_per_calendar_event | notes |
|-----------|-----------------|----------------|---------------------|-------|
| Lector | Mass | 2024-12-28 17:00:00 | true | NULL |
| Bride | Wedding | 2025-01-15 14:00:00 | false | NULL |
| Eucharistic Minister | Mass | 2025-01-05 10:00:00 | true | Substitute for John |

#### Query: "Get all assignments for a specific master event"

```sql
-- Get all assignments (template and occurrence) for an event
SELECT
  pea.id,
  pea.calendar_event_id,
  fd.name AS role_name,
  fd.property_name,
  fd.is_per_calendar_event,
  p.full_name AS person_name,
  p.id AS person_id,
  ce.start_datetime AS occurrence_datetime,
  pea.notes
FROM people_event_assignments pea
JOIN input_field_definitions fd ON pea.field_definition_id = fd.id
JOIN people p ON pea.person_id = p.id
LEFT JOIN calendar_events ce ON pea.calendar_event_id = ce.id
WHERE pea.master_event_id = 'event-uuid'
  AND pea.deleted_at IS NULL
ORDER BY
  fd.is_per_calendar_event ASC,  -- Template first, then occurrence
  ce.start_datetime ASC,        -- Sort occurrences by datetime
  fd.order ASC;                 -- Sort by field order within each group
```

**Result Groups**:
1. Template-level assignments (calendar_event_id = NULL)
2. Occurrence-level assignments grouped by calendar_event

#### Query: "Get assignments for a specific calendar event (Mass time)"

```sql
-- Get ministers assigned to Saturday 5pm Mass
SELECT
  fd.name AS role_name,
  p.full_name AS person_name,
  pea.notes
FROM people_event_assignments pea
JOIN input_field_definitions fd ON pea.field_definition_id = fd.id
JOIN people p ON pea.person_id = p.id
WHERE pea.calendar_event_id = 'calendar-event-uuid'
  AND pea.deleted_at IS NULL
ORDER BY fd.order ASC;
```

#### Query: "Check role quantity fulfillment for a Mass time"

```sql
-- For a given Mass time, check if all roles are filled
SELECT
  fd.property_name AS role_key,
  fd.name AS role_name,
  (mtti.role_quantities->fd.property_name)::int AS needed,
  COUNT(pea.id) AS assigned,
  (mtti.role_quantities->fd.property_name)::int - COUNT(pea.id) AS remaining
FROM mass_times_template_items mtti
CROSS JOIN input_field_definitions fd
LEFT JOIN people_event_assignments pea
  ON pea.field_definition_id = fd.id
  AND pea.calendar_event_id = 'calendar-event-uuid'
  AND pea.deleted_at IS NULL
WHERE mtti.id = 'template-item-uuid'
  AND fd.event_type_id = 'mass-event-type-uuid'
  AND fd.type = 'person'
  AND fd.is_per_calendar_event = true
  AND mtti.role_quantities ? fd.property_name  -- Role is defined in quantities
GROUP BY fd.property_name, fd.name, mtti.role_quantities
ORDER BY fd.order ASC;
```

**Result Example**:

| role_name | needed | assigned | remaining |
|-----------|--------|----------|-----------|
| Lector | 1 | 1 | 0 |
| Eucharistic Minister | 4 | 3 | 1 |
| Altar Server | 2 | 0 | 2 |

---

### Impact on Existing Server Actions

#### Files Requiring Updates

**Critical (breaking changes)**:

1. **`src/lib/actions/master-events.ts`**:
   - Remove `presider_id` and `homilist_id` from create/update operations
   - Add functions for managing `people_event_assignments`
   - Update `MasterEventWithRelations` interface to include `people_event_assignments`

2. **`src/lib/actions/mass-liturgies.ts`**:
   - Remove presider/homilist direct column updates
   - Migrate to `people_event_assignments` pattern

3. **`src/lib/actions/event-types.ts`**:
   - Remove `role_definitions` from create/update operations

4. **`src/lib/actions/mass-times-template-items.ts`**:
   - Add `role_quantities` to create/update operations

**New Actions Needed**:

5. **`src/lib/actions/people-event-assignments.ts`** (NEW FILE):
   - `createPeopleEventAssignment(data)` - Create assignment with validation
   - `updatePeopleEventAssignment(id, data)` - Update notes, change person
   - `deletePeopleEventAssignment(id)` - Soft delete assignment
   - `getPeopleEventAssignments(filters)` - Query assignments
   - `getPersonAssignments(personId)` - Get all assignments for a person
   - `getMasterEventAssignments(masterEventId)` - Get assignments for an event
   - `getCalendarEventAssignments(calendarEventId)` - Get occurrence assignments

#### Server Action Pseudo-Code Examples

**Create Assignment**:

```
FUNCTION createPeopleEventAssignment(data):
  1. Validate user has selected parish
  2. Validate user has permissions (admin/staff/ministry-leader)

  3. Validate assignmentData using validatePeopleEventAssignment()

  4. Check if assignment already exists (unique constraint)
     IF exists AND not soft-deleted THEN
       RETURN error "Person already assigned to this role"
     ELSE IF exists AND soft-deleted THEN
       Restore (set deleted_at = NULL) instead of creating new
     END IF

  5. Insert into people_event_assignments table

  6. Revalidate paths (event view page, person assignments page)

  7. Return created assignment with related data
END FUNCTION
```

**Get Master Event with Assignments**:

```
FUNCTION getMasterEventWithRelations(masterEventId):
  1. Fetch master_event
  2. Fetch event_type with input_field_definitions
  3. Fetch calendar_events for this master_event

  4. Fetch people_event_assignments:
     a. Template-level (calendar_event_id = NULL)
     b. Occurrence-level (calendar_event_id populated) grouped by calendar_event

  5. For each person assignment, join person data (full_name, email, phone)

  6. Return MasterEventWithRelations object:
     {
       ...masterEvent,
       event_type: EventTypeWithRelations,
       calendar_events: CalendarEvent[],
       people_event_assignments: PeopleEventAssignmentWithPerson[],
       // Legacy field_values still has non-person data
       resolved_field_values: ResolvedFieldValue[]
     }
END FUNCTION
```

**Migrate Presider/Homilist to Assignments**:

```
FUNCTION migratePresiderHomilists():
  FOR EACH master_event WHERE presider_id IS NOT NULL OR homilist_id IS NOT NULL:
    1. Fetch event_type input_field_definitions

    2. Find field_definition for "presider" (property_name or name)
    3. IF presider_id IS NOT NULL AND presider_field exists THEN
         Create people_event_assignment:
           master_event_id = master_event.id
           calendar_event_id = NULL  (template-level)
           field_definition_id = presider_field.id
           person_id = master_event.presider_id
       END IF

    4. Find field_definition for "homilist"
    5. IF homilist_id IS NOT NULL AND homilist_field exists THEN
         Create people_event_assignment (same pattern)
       END IF
  END FOR
END FUNCTION
```

---

### Impact on UI Components

#### Components Requiring Updates

**Critical (breaking changes)**:

1. **`src/components/master-event-form.tsx`**:
   - Remove presider/homilist PersonPicker fields
   - Add person assignment section (if template-level roles exist)

2. **`src/app/(main)/mass-liturgies/mass-form.tsx`**:
   - Replace presider/homilist fields with assignment pattern
   - Use PersonPicker for template-level assignments

3. **`src/components/role-assignment-section.tsx`**:
   - Update to work with `people_event_assignments` instead of `master_event_roles`
   - Distinguish template vs occurrence assignments in UI

4. **`src/app/(main)/events/[event_type_id]/master-event-form.tsx`**:
   - Update person field handling to create `people_event_assignments` rows

**New Components Needed**:

5. **`src/components/people-event-assignment-section.tsx`** (NEW):
   - Displays template-level assignments for a master event
   - Shows PersonPicker for each person-type field where `is_per_calendar_event = false`
   - Handles add/remove assignments

6. **`src/components/calendar-event-assignment-section.tsx`** (NEW):
   - Displays occurrence-level assignments for a calendar event
   - Shows PersonPicker for each person-type field where `is_per_calendar_event = true`
   - Used in Mass scheduling UI

#### UI Pattern Examples

**Template-Level Assignment Section** (for Weddings, Funerals, etc.):

```
COMPONENT PeopleEventAssignmentSection:
  PROPS:
    - masterEventId
    - eventTypeId
    - currentAssignments: PeopleEventAssignmentWithPerson[]

  STATE:
    - assignments (initialized from currentAssignments)

  RENDER:
    FOR EACH field_definition WHERE type='person' AND is_per_calendar_event=false:
      SHOW:
        - Field label (field_definition.name)
        - PersonPicker component
          - Currently assigned person (from assignments where field_definition_id matches)
          - On change: call createPeopleEventAssignment or updatePeopleEventAssignment
        - Remove button (if not required)
    END FOR
END COMPONENT
```

**Occurrence-Level Assignment Section** (for Mass scheduling):

```
COMPONENT OccurrenceAssignmentSection:
  PROPS:
    - masterEventId
    - calendarEventId
    - calendarEventDateTime
    - eventTypeId
    - currentAssignments: PeopleEventAssignmentWithPerson[]
    - roleQuantities: { lector: 1, em: 4, ... }

  RENDER:
    FOR EACH field_definition WHERE type='person' AND is_per_calendar_event=true:
      LET needed = roleQuantities[field_definition.property_name] || 0
      LET assigned = currentAssignments.filter(a => a.field_definition_id == field_definition.id)

      SHOW:
        - Field label with count: "Lectors (1 needed, 1 assigned)"
        - List of assigned people with remove button
        - Add button (if assigned.length < needed)
          - Opens PersonPicker dialog
          - On select: call createPeopleEventAssignment with calendar_event_id
    END FOR
END COMPONENT
```

**Person Assignments View** (for "My Assignments" page):

```
COMPONENT PersonAssignmentsView:
  PROPS:
    - personId

  ON_MOUNT:
    assignments = getPersonAssignments(personId)

  RENDER:
    GROUP assignments BY event_type, then by master_event

    FOR EACH group:
      SHOW card:
        - Event type icon and name
        - Master event title (from field_values or event name)
        - Role name (field_definition.name)
        - DateTime (calendar_event.start_datetime or master_event.created_at)
        - Location (if calendar_event has location)
        - Notes (if any)
    END FOR

    SORT BY datetime ASC (upcoming first)
END COMPONENT
```

---

### File Structure

**New Migration File**:

```
/supabase/migrations/
└── 20251222000001_create_people_event_assignments_table.sql
    - Create people_event_assignments table
    - Indexes
    - RLS policies
    - Comments
```

**Modified Migration Files**:

```
/supabase/migrations/
├── 20251210000008_create_calendar_events_table.sql
│   - ADD COLUMN show_on_calendar
│   - DROP COLUMN is_primary
│
├── 20251210000004_create_input_field_definitions_table.sql
│   - ADD COLUMN is_per_calendar_event
│   - ADD CONSTRAINT check_is_per_calendar_event_only_for_person
│
├── 20251031000002_create_event_types_table.sql
│   - DROP COLUMN role_definitions
│   - DROP INDEX idx_event_types_role_definitions_gin
│
├── 20251031000005_create_mass_times_template_items_table.sql
│   - ADD COLUMN role_quantities JSONB
│   - CREATE INDEX idx_mass_times_template_items_role_quantities_gin
│
└── 20251210000007_create_master_events_table.sql
    - DROP COLUMN presider_id
    - DROP COLUMN homilist_id
    - DROP INDEX idx_master_events_presider_id
    - DROP INDEX idx_master_events_homilist_id
```

**Deleted Migration Files**:

```
/supabase/migrations/
├── 20251210000011_create_master_event_roles_table.sql  (DELETE)
└── 20251031000003_create_events_table.sql              (DELETE)
```

**New Server Action File**:

```
/src/lib/actions/
└── people-event-assignments.ts  (NEW)
    - createPeopleEventAssignment()
    - updatePeopleEventAssignment()
    - deletePeopleEventAssignment()
    - getPeopleEventAssignments()
    - getPersonAssignments()
    - getMasterEventAssignments()
    - getCalendarEventAssignments()
```

**Updated Server Action Files**:

```
/src/lib/actions/
├── master-events.ts
│   - Remove presider_id/homilist_id handling
│   - Update MasterEventWithRelations interface
│
├── masses.ts
│   - Update to use people_event_assignments
│
├── event-types.ts
│   - Remove role_definitions handling
│
└── mass-times-template-items.ts
    - Add role_quantities handling
```

**New Component Files**:

```
/src/components/
├── people-event-assignment-section.tsx  (NEW)
└── calendar-event-assignment-section.tsx    (NEW)
```

**Updated Component Files**:

```
/src/components/
├── master-event-form.tsx
├── role-assignment-section.tsx
│
/src/app/(main)/
├── masses/mass-form.tsx
└── events/[event_type_id]/master-event-form.tsx
```

**New Type Interfaces** (in `src/lib/types.ts`):

```typescript
// New interface
export interface PeopleEventAssignment {
  id: string
  master_event_id: string
  calendar_event_id: string | null  // NULL for template, populated for occurrence
  field_definition_id: string
  person_id: string
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PeopleEventAssignmentWithPerson extends PeopleEventAssignment {
  person: Person
  field_definition: InputFieldDefinition
}

export interface CreatePeopleEventAssignmentData {
  master_event_id: string
  calendar_event_id?: string | null
  field_definition_id: string
  person_id: string
  notes?: string | null
}

export interface UpdatePeopleEventAssignmentData {
  person_id?: string
  notes?: string | null
}
```

**Modified Type Interfaces**:

```typescript
// Update existing interface
export interface MasterEvent {
  id: string
  parish_id: string
  event_type_id: string
  field_values: Record<string, any>
  // REMOVE: presider_id: string | null
  // REMOVE: homilist_id: string | null
  status: MasterEventStatus
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MasterEventWithRelations extends MasterEvent {
  event_type: EventTypeWithRelations
  calendar_events: CalendarEvent[]
  // NEW: Add people_event_assignments
  people_event_assignments?: PeopleEventAssignmentWithPerson[]
  resolved_field_values?: ResolvedFieldValue[]
  primary_calendar_event?: CalendarEvent
}

export interface InputFieldDefinition {
  id: string
  event_type_id: string
  name: string
  property_name: string
  type: InputFieldType
  required: boolean
  list_id: string | null
  input_filter_tags: string[] | null
  is_key_person: boolean
  is_primary: boolean
  // NEW: Add is_per_calendar_event
  is_per_calendar_event: boolean
  order: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  parish_id: string
  master_event_id: string
  input_field_definition_id: string
  start_datetime: string
  end_datetime: string | null
  location_id: string | null
  // REMOVE: is_primary: boolean
  // NEW: Add show_on_calendar
  show_on_calendar: boolean
  is_cancelled: boolean
  is_all_day: boolean
  created_at: string
  deleted_at: string | null
}

export interface EventType {
  id: string
  parish_id: string
  name: string
  description: string | null
  icon: string
  order: number
  slug: string | null
  system_type: 'mass' | 'special-liturgy' | 'event'
  // REMOVE: role_definitions: any
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface MassTimesTemplateItem {
  id: string
  mass_times_template_id: string
  time: string
  day_type: 'IS_DAY' | 'DAY_BEFORE'
  presider_id: string | null
  location_id: string | null
  length_of_time: number | null
  homilist_id: string | null
  // NEW: Add role_quantities
  role_quantities: Record<string, number>  // { lector: 1, em: 4, ... }
  created_at: string
  updated_at: string
}

// REMOVE: MasterEventRole interface (replaced by PeopleEventAssignment)
// REMOVE: MasterEventRoleWithPerson interface
```

---

### Testing Requirements

#### Unit Tests

**New Test File**: `tests/people-event-assignments.spec.ts`

Test scenarios:
1. Create template-level assignment (calendar_event_id = NULL)
2. Create occurrence-level assignment (calendar_event_id populated)
3. Validation: Occurrence-level field requires calendar_event_id
4. Validation: Template-level field requires calendar_event_id = NULL
5. Unique constraint: Cannot assign same person to same role twice
6. Soft delete and restore assignment
7. Query person's assignments across event types
8. Query master event's assignments (template + occurrences)

**Updated Test Files**:

1. `tests/master-events.spec.ts`:
   - Remove presider_id/homilist_id tests
   - Update to verify people_event_assignments instead

2. `tests/mass-liturgies.spec.ts`:
   - Update to use new assignment pattern

3. `tests/event-types.spec.ts`:
   - Remove role_definitions tests

#### Integration Tests

**Test Scenarios**:

1. **Mass Scheduling Flow**:
   - Create Mass for 4th Sunday in Advent
   - Assign template-level readings (first_reading, psalm, gospel)
   - Create 3 calendar_events (Sat 5pm, Sun 8am, Sun 10:30am)
   - Assign occurrence-level ministers to each Mass time
   - Verify assignments correctly grouped by calendar_event

2. **Wedding Flow**:
   - Create Wedding master_event
   - Assign template-level people (bride, groom, presider)
   - Create 2 calendar_events (Rehearsal, Ceremony)
   - Verify template assignments apply to both calendar events
   - Verify show_on_calendar correctly set (Rehearsal=false, Ceremony=true)

3. **Person Assignments Query**:
   - Assign person to multiple events (Mass lector, Wedding presider, Funeral cantor)
   - Query all assignments for this person
   - Verify correct grouping and sorting by datetime

#### E2E Tests

**Test Scenarios**:

1. **Create Event with Person Assignments**:
   - Navigate to event create page
   - Fill in person fields (PersonPicker)
   - Submit form
   - Verify people_event_assignments created
   - Verify event view page displays assignments correctly

2. **Mass Scheduling**:
   - Navigate to Mass schedule page
   - Select date range
   - Assign ministers to specific Mass times
   - Verify assignments saved with correct calendar_event_id

3. **Person Assignments View**:
   - Navigate to person detail page
   - View "My Assignments" section
   - Verify all assignments displayed with correct event info

---

### Documentation Updates

#### MODULE_REGISTRY.md

No changes needed (no new modules).

#### COMPONENT_REGISTRY.md

**Add**:

```markdown
### Person Assignment Components

#### PeopleEventAssignmentSection
**Location**: `src/components/people-event-assignment-section.tsx`
**Purpose**: Manage template-level person assignments for a master event
**Props**:
- `masterEventId: string`
- `eventTypeId: string`
- `currentAssignments: PeopleEventAssignmentWithPerson[]`
**Usage**: Used in event create/edit forms for fields with `is_per_calendar_event = false`

#### OccurrenceAssignmentSection
**Location**: `src/components/calendar-event-assignment-section.tsx`
**Purpose**: Manage occurrence-level person assignments for a calendar event
**Props**:
- `masterEventId: string`
- `calendarEventId: string`
- `calendarEventDateTime: string`
- `eventTypeId: string`
- `currentAssignments: PeopleEventAssignmentWithPerson[]`
- `roleQuantities: Record<string, number>`
**Usage**: Used in Mass scheduling UI for assigning ministers to specific Mass times
```

#### DATABASE.md

**Add Section**: "People Event Assignments"

```markdown
### People Event Assignments

**Table**: `people_event_assignments`

**Purpose**: Unified storage for all person-to-event assignments across all event types.

**Two-Level Pattern**:
- `calendar_event_id = NULL` → Template-level (applies to all occurrences)
- `calendar_event_id = <uuid>` → Occurrence-level (specific to one calendar event)

**Examples**:
- Wedding bride/groom: Template-level (same person at rehearsal and ceremony)
- Mass lector: Occurrence-level (different person at each Mass time)

**Key Queries**:
- Get all assignments for a person: See "Example Queries" section
- Get all assignments for a master event: See "Example Queries" section
- Get occurrence assignments for a calendar event: See "Example Queries" section

**Validation**:
- `is_per_calendar_event = true` fields MUST have `calendar_event_id` populated
- `is_per_calendar_event = false` fields MUST have `calendar_event_id = NULL`
- Unique constraint prevents duplicate assignments

**Data Migration**:
- Legacy `master_event_roles` data migrated to `people_event_assignments`
- Legacy `presider_id`/`homilist_id` columns migrated to assignment rows
```

#### ARCHITECTURE.md

**Update Section**: "Data Flow Patterns"

```markdown
### Person Assignment Pattern

**Old Pattern** (deprecated):
- Presider/homilist: Direct columns on `master_events`
- Other roles: `master_event_roles` table (template only)
- Person UUIDs in `field_values` JSONB (not queryable)

**New Pattern** (current):
- ALL person assignments: `people_event_assignments` table
- Template vs occurrence: `calendar_event_id` NULLABLE
- Queryable: Person can see all assignments across event types

**Two-Level Pattern**:
1. **Template-Level** (`calendar_event_id = NULL`):
   - Applies to entire master event
   - Example: Wedding bride, groom, presider

2. **Occurrence-Level** (`calendar_event_id = <uuid>`):
   - Applies to specific calendar event
   - Example: Mass lector at Saturday 5pm

**Field Definition Flag**:
- `input_field_definitions.is_per_calendar_event` determines assignment level
- Enforced at application level (validation in server actions)
```

---

### Security Considerations

#### Authentication

- All operations require authenticated user (`auth.uid()`)
- Parish scoping enforced via `requireSelectedParish()`

#### Authorization

**Who can create/update/delete assignments**:
- Admin: Full access
- Staff: Full access
- Ministry-Leader: Full access (future: could be scoped to specific event types)
- Parishioner: Read-only

**RLS Policies**:
- SELECT: Parish members can view assignments for their parish's events
- INSERT/UPDATE/DELETE: Admin, Staff, Ministry-Leader only

#### Data Validation

**Server-Side Validation** (in server actions):

1. **Parish Scoping**:
   - Verify master_event belongs to selected parish
   - Verify person belongs to selected parish
   - Verify field_definition belongs to event_type of selected parish

2. **Field Definition Validation**:
   - Field must be type='person'
   - Verify field belongs to master_event's event_type

3. **Occurrence-Level Enforcement**:
   - If `is_per_calendar_event=true`, require `calendar_event_id`
   - If `is_per_calendar_event=false`, require `calendar_event_id=NULL`

4. **Unique Constraint**:
   - Check for existing assignment before insert
   - Handle soft-deleted records (restore instead of duplicate)

**Client-Side Validation** (in UI):

1. **PersonPicker**: Filter to parish members only
2. **Role Quantity**: Warn if over-assigning (not blocking)
3. **Availability** (future): Warn if person unavailable

#### Sensitive Data

- `people_event_assignments.notes`: May contain sensitive info (e.g., substitution reasons)
- RLS ensures only parish members can read

---

### Implementation Complexity

**Complexity Rating:** High

**Reason**:

This refactoring involves:
1. **Database schema changes across 6 tables** (5 modifications + 1 new table)
2. **Deletion of 2 legacy tables** requiring data migration
3. **Breaking changes to multiple server actions** (master-events, masses, event-types)
4. **Breaking changes to multiple UI components** (forms, assignment sections)
5. **New TypeScript interfaces** across multiple files
6. **Complex validation logic** (occurrence-level enforcement)
7. **Data migration from multiple sources** (columns, JSONB, legacy table)
8. **Coordination between template and occurrence patterns**

This is a **foundational refactoring** that touches core event/assignment architecture. All event-related features depend on this schema.

**Recommended Approach**:
1. Implement database changes first (modify migrations, create new table)
2. Run `npm run db:fresh` to verify schema
3. Update TypeScript interfaces
4. Implement new server actions (`people-event-assignments.ts`)
5. Update existing server actions one at a time
6. Update UI components incrementally
7. Test each layer before moving to next

**Not Estimated**: Focus on WHAT needs to be done, not how long it will take. The scope is large but well-defined.

---

### Dependencies and Blockers

**Prerequisites** (must be completed first):
- None - this is greenfield development, no blockers

**External Dependencies**:
- Supabase database running locally
- Migration system functional
- `npm run db:fresh` working correctly

**Internal Dependencies**:
- TypeScript type system
- React Hook Form (for PersonPicker in forms)
- Server action pattern (existing)
- RLS policy system (existing)

**Potential Blockers**:

1. **Data Migration Complexity**:
   - If `master_event_roles` has significant data, migration script needed
   - If person UUIDs exist in `field_values` JSONB, extraction logic needed
   - Mitigation: Check for existing data before deleting tables

2. **Breaking Changes**:
   - All event forms will break until updated
   - Mass scheduling UI will break until updated
   - Mitigation: Update incrementally, test thoroughly

3. **Mass Scheduling Future Feature**:
   - `role_quantities` pattern needs validation with future scheduling system
   - Mitigation: Design is flexible, can adjust as scheduling requirements clarify

---

### Documentation Inconsistencies Found

During codebase analysis, the following inconsistencies were noted:

1. **`is_primary` Column**:
   - **Location**: `calendar_events` table, migration file, and TypeScript interfaces
   - **Inconsistency**: The purpose of `is_primary` is unclear for Masses (all Mass times are "primary"). The brainstorming document correctly identified this confusion.
   - **Resolution**: Replace with `show_on_calendar` as planned in this refactoring.

2. **`role_definitions` JSONB**:
   - **Location**: `event_types.role_definitions` column
   - **Inconsistency**: Role definitions stored as unstructured JSONB, not integrated with `input_field_definitions` relational pattern
   - **Resolution**: Remove column and use `input_field_definitions` rows with `type='person'` instead.

3. **Presider/Homilist Pattern**:
   - **Location**: `master_events.presider_id` and `homilist_id` columns, `mass_times_template_items.presider_id` and `homilist_id` columns
   - **Inconsistency**: Special-case columns for two roles, while all other roles use different patterns
   - **Resolution**: Migrate to unified `people_event_assignments` pattern (presider and homilist become rows).

4. **Person Assignments in JSONB**:
   - **Location**: `master_events.field_values` JSONB (inferred from code patterns)
   - **Inconsistency**: Some person assignments may be stored as UUIDs in JSONB, making them non-queryable and inconsistent with relational pattern
   - **Resolution**: Extract person references to `people_event_assignments` table, keep only non-person data in JSONB.

5. **MasterEventRole vs PeopleEventAssignment**:
   - **Location**: TypeScript interfaces in `src/lib/types.ts`
   - **Inconsistency**: `MasterEventRole` interface exists but doesn't support occurrence-level pattern, and references `role_id` (string) instead of `field_definition_id` (UUID)
   - **Resolution**: Replace with `PeopleEventAssignment` interface that supports two-level pattern.

---

### Next Steps

**Status**: Ready for Development

**Hand-off to**: developer-agent

**Implementation Checklist**:

1. ✅ Vision document created (brainstorming-agent)
2. ✅ Technical requirements documented (requirements-agent) ← YOU ARE HERE
3. ⬜ Modify database migrations (developer-agent)
4. ⬜ Run `npm run db:fresh` to verify schema changes
5. ⬜ Update TypeScript interfaces in `src/lib/types.ts`
6. ⬜ Implement `src/lib/actions/people-event-assignments.ts`
7. ⬜ Update `src/lib/actions/master-events.ts`
8. ⬜ Update `src/lib/actions/mass-liturgies.ts`
9. ⬜ Update `src/lib/actions/event-types.ts`
10. ⬜ Update `src/lib/actions/mass-times-template-items.ts`
11. ⬜ Create `src/components/people-event-assignment-section.tsx`
12. ⬜ Create `src/components/calendar-event-assignment-section.tsx`
13. ⬜ Update `src/components/master-event-form.tsx`
14. ⬜ Update `src/app/(main)/mass-liturgies/mass-form.tsx`
15. ⬜ Update other affected components
16. ⬜ Write unit tests (test-writer)
17. ⬜ Run tests (test-runner-debugger)
18. ⬜ Update documentation (project-documentation-writer)
19. ⬜ Code review (code-review-agent)

**Priority**: High - Foundational refactoring that unblocks Mass scheduling features

**Developer Notes**:
- This is greenfield development - modify original migrations, don't worry about backward compatibility
- Test each layer (database → types → actions → UI) before moving to next
- Focus on template-level pattern first (simpler), then add occurrence-level
- PersonPicker component already exists and can be reused
- Validation logic is critical - enforce occurrence-level rules strictly

---

## Reference: Migration File Changes

### 1. Create New Table

**File**: `supabase/migrations/20251222000001_create_people_event_assignments_table.sql`

```sql
-- Create people_event_assignments table
-- Purpose: Unified storage for all person-to-event assignments
-- Related: master_events, calendar_events, input_field_definitions, people

CREATE TABLE people_event_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event context (two-level pattern)
  master_event_id UUID NOT NULL REFERENCES master_events(id) ON DELETE CASCADE,
  calendar_event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,

  -- Assignment details
  field_definition_id UUID NOT NULL REFERENCES input_field_definitions(id) ON DELETE RESTRICT,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,

  -- Optional notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE people_event_assignments ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON people_event_assignments TO anon;
GRANT ALL ON people_event_assignments TO authenticated;
GRANT ALL ON people_event_assignments TO service_role;

-- Indexes
CREATE INDEX idx_people_event_assignments_master_event_id
  ON people_event_assignments(master_event_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_people_event_assignments_calendar_event_id
  ON people_event_assignments(calendar_event_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_people_event_assignments_person_id
  ON people_event_assignments(person_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_people_event_assignments_field_definition_id
  ON people_event_assignments(field_definition_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_people_event_assignments_person_master_calendar
  ON people_event_assignments(person_id, master_event_id, calendar_event_id)
  WHERE deleted_at IS NULL;

-- Unique constraint: one person per role per event/occurrence
CREATE UNIQUE INDEX idx_people_event_assignments_unique
ON people_event_assignments(
  master_event_id,
  COALESCE(calendar_event_id, '00000000-0000-0000-0000-000000000000'::uuid),
  field_definition_id,
  person_id
)
WHERE deleted_at IS NULL;

-- RLS Policies
CREATE POLICY people_event_assignments_select_policy ON people_event_assignments
  FOR SELECT
  USING (
    master_event_id IN (
      SELECT me.id
      FROM master_events me
      JOIN parish_users pu ON me.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND me.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

CREATE POLICY people_event_assignments_insert_policy ON people_event_assignments
  FOR INSERT
  WITH CHECK (
    master_event_id IN (
      SELECT me.id
      FROM master_events me
      JOIN parish_users pu ON me.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
        AND me.deleted_at IS NULL
    )
  );

CREATE POLICY people_event_assignments_update_policy ON people_event_assignments
  FOR UPDATE
  USING (
    master_event_id IN (
      SELECT me.id
      FROM master_events me
      JOIN parish_users pu ON me.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
        AND me.deleted_at IS NULL
    )
  );

CREATE POLICY people_event_assignments_delete_policy ON people_event_assignments
  FOR DELETE
  USING (
    master_event_id IN (
      SELECT me.id
      FROM master_events me
      JOIN parish_users pu ON me.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
        AND me.deleted_at IS NULL
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER people_event_assignments_updated_at
  BEFORE UPDATE ON people_event_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE people_event_assignments IS 'Unified storage for all person-to-event assignments. calendar_event_id NULL = template-level (applies to all occurrences), populated = occurrence-level (specific to one calendar event).';
COMMENT ON COLUMN people_event_assignments.calendar_event_id IS 'NULL for template-level assignments (bride, groom, presider), populated for occurrence-level assignments (lector at Saturday 5pm Mass)';
COMMENT ON COLUMN people_event_assignments.field_definition_id IS 'References which role/field this assignment is for (defined in input_field_definitions)';
COMMENT ON COLUMN people_event_assignments.notes IS 'Optional notes (e.g., "substitute for John Doe", "playing piano")';
```

### 2. Modify calendar_events

**File**: `20251210000008_create_calendar_events_table.sql`

**Changes to make**:
1. Add `show_on_calendar BOOLEAN NOT NULL DEFAULT true` after line 13
2. Remove line 14 (`is_primary BOOLEAN NOT NULL DEFAULT false`)
3. Update comment on line 93 to reference `show_on_calendar` instead of `is_primary`

### 3. Modify input_field_definitions

**File**: `20251210000004_create_input_field_definitions_table.sql`

**Changes to make**:
1. Add `is_per_calendar_event BOOLEAN NOT NULL DEFAULT false` after line 14
2. Add constraint after line 24:
   ```sql
   CONSTRAINT check_is_per_calendar_event_only_for_person CHECK (is_per_calendar_event = false OR type = 'person')
   ```
3. Add comment after line 107:
   ```sql
   COMMENT ON COLUMN input_field_definitions.is_per_calendar_event IS 'If true, this field expects occurrence-level assignments (specific to each calendar_event). If false, template-level assignments (shared across all calendar_events). Example: lector=true, bride=false.';
   ```

### 4. Modify event_types

**File**: `20251031000002_create_event_types_table.sql`

**Changes to make**:
1. Remove line 14 (`role_definitions JSONB NOT NULL DEFAULT '{}'::jsonb`)
2. Remove line 39 (`CREATE INDEX idx_event_types_role_definitions_gin ON event_types USING GIN (role_definitions);`)
3. Remove line 44 (`COMMENT ON COLUMN event_types.role_definitions IS '...';`)

### 5. Modify mass_times_template_items

**File**: `20251031000005_create_mass_times_template_items_table.sql`

**Changes to make**:
1. Add after line 30 (before created_at):
   ```sql
   -- Role quantities for this Mass time
   role_quantities JSONB NOT NULL DEFAULT '{}'::jsonb,
   ```
2. Add after line 52 (before RLS section):
   ```sql
   -- GIN index for role_quantities JSONB queries
   CREATE INDEX idx_mass_times_template_items_role_quantities_gin
     ON mass_times_template_items USING GIN (role_quantities);
   ```
3. Add after line 44:
   ```sql
   COMMENT ON COLUMN mass_times_template_items.role_quantities IS 'JSONB object mapping role property_names to quantity needed. Example: {"lector": 1, "eucharistic_minister": 4, "altar_server": 2}. Keys match input_field_definitions.property_name.';
   ```

### 6. Modify master_events

**File**: `20251210000007_create_master_events_table.sql`

**Changes to make**:
1. Remove lines 11-12 (`presider_id` and `homilist_id` columns)
2. Remove lines 31-32 (indexes for presider_id and homilist_id)
3. Remove lines 92-93 (comments for presider_id and homilist_id)

### 7. Delete Migration Files

**Files to delete**:
1. `supabase/migrations/20251210000011_create_master_event_roles_table.sql`
2. `supabase/migrations/20251031000003_create_events_table.sql`

**Before deleting**, verify these tables have no data in production.

---

## Summary Report

**What This Refactoring Achieves**:

1. **Unified Assignment Storage**: Single `people_event_assignments` table replaces fragmented storage (columns, JSONB, separate table)

2. **Two-Level Pattern**: Clear distinction between template-level (shared) and occurrence-level (specific) assignments via `calendar_event_id` NULLABLE

3. **Person-Centric Queries**: "Show me all my assignments" queries now possible across all event types

4. **Calendar Visibility**: `show_on_calendar` boolean replaces ambiguous `is_primary` flag

5. **Role Quantity Support**: `mass_times_template_items.role_quantities` JSONB enables future Mass scheduling automation

6. **Schema Simplification**: Removes `presider_id`/`homilist_id` special-case columns, `role_definitions` JSONB, and legacy tables

**Key Technical Decisions**:

- **NULLABLE Pattern**: `calendar_event_id = NULL` for template, populated for occurrence
- **Field Definition Flag**: `is_per_calendar_event` on `input_field_definitions` determines assignment level
- **Validation**: Application-level enforcement of occurrence-level rules (not database constraint)
- **JSONB for Content**: Keep non-person data in `field_values`, only person assignments in relational table
- **Unique Constraint**: COALESCE trick to handle NULL in unique index

**Migration Strategy**:

- Greenfield development: Modify original migrations, run `npm run db:fresh`
- No backward compatibility concerns
- Data migration needed if `master_event_roles` or `presider_id`/`homilist_id` have existing data

**Next Agent**: developer-agent (implement database changes, server actions, UI components)

**Estimated Impact**: High complexity, foundational refactoring touching 6 database tables, multiple server actions, and UI components. Well-defined scope with clear requirements.
