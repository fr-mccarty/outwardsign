# Mass Script: Liturgy Calendar & Role Assignments

**Created:** 2025-12-23
**Status:** Ready for Development
**Agents:** brainstorming-agent, devils-advocate-agent, requirements-agent

## Feature Overview
Generate printable mass scripts that combine liturgy template inputs with role assignments for scheduled masses, enabling parish staff to prepare comprehensive scripts for presiders and ministers.

## Problem Statement
Currently, the Masses module appears to handle scheduling, but there's no way to:
- Define reusable liturgy templates with custom inputs
- Assign ministers/roles to individual mass occurrences
- Generate printable scripts that combine template content with specific assignments
- Manage recurring liturgies (Sunday 10am Mass, Daily Mass, etc.) as master templates

Parish staff need a way to prepare complete mass scripts that presiders can pick up from the sacristy, containing both the liturgical content and the specific role assignments for that celebration.

## User Stories
- As a **Liturgical Director**, I want to create a liturgy template (e.g., "Sunday 10am Mass") with custom fields so that I can define what inputs are needed for this type of mass
- As a **Parish Staff Member**, I want to schedule individual masses from a liturgy template and assign specific ministers/roles so that everyone knows their responsibilities
- As a **Presider** (Priest/Deacon), I want to print a complete mass script before celebration so that I have all the liturgical content and role assignments in one document
- As a **Parish Administrator**, I want to define custom roles and inputs for different liturgies so that the system adapts to our parish's specific needs
- As a **Liturgical Director**, I want to link a liturgy to a liturgical calendar event (feast day, season) so that the script reflects the proper liturgical context

## Success Criteria
What does "done" look like?
- [ ] System type values updated ('mass' → 'mass-liturgy', 'event' → 'parish-event')
- [ ] UI labels updated throughout application
- [ ] **mass_roles capability data migrated to groups system**
- [ ] **input_filter_tags configured for group-based PersonPicker filtering**
- [ ] Legacy mass_roles system completely removed
- [ ] Staff can assign ministers via people_event_assignments
- [ ] **PersonPicker shows suggested people based on ministry groups**
- [ ] System can generate roster-style printable scripts
- [ ] Script shows ALL mass times for one liturgical day with role assignments
- [ ] System supports linking liturgies to global liturgical calendar events

---

## TECHNICAL REQUIREMENTS
(Added by requirements-agent)

### Implementation Strategy

**CONFIRMED APPROACH:** Based on user decisions and codebase analysis, we will implement this feature in **TWO DISTINCT PHASES**:

**PHASE 1: Foundation Work (REQUIRED FIRST)**
1. Update system_type enum values
2. Update UI labels throughout application
3. **MIGRATE mass_roles capability data to groups system**
4. Remove legacy mass_roles system completely
5. Update documentation

**PHASE 2: Mass Script Generation (AFTER PHASE 1)**
1. Enhance role assignment UI for masses with group-based filtering
2. Implement roster-style script generation
3. Create print/export functionality

**OUT OF SCOPE:** The event_type → liturgy rename is a separate epic-level task that will NOT be part of this feature implementation. We will use current naming (`event_type`, `master_event`, `calendar_event`) and defer the rename to a future project.

---

### Critical Architectural Clarification: Three-Concern Separation

**CONFIRMED DESIGN:** The system must handle THREE distinct but related concerns:

#### 1. Role DEFINITIONS (What roles exist?)
- **System:** `input_field_definitions` (type='person')
- **Status:** KEEP - unchanged
- **Purpose:** Defines available role slots in liturgy templates
- **Example:** Event type "Sunday Mass" has person-type fields: "Presider", "Lector 1", "Lector 2", "Cantor"
- **Storage:** Each role is an input_field_definition with type='person', is_per_calendar_event=true

#### 2. CAPABILITY Tracking (Who CAN serve in what roles?)
- **Current:** `mass_role_members` table (Mass-only, problematic)
- **New:** `groups` + `group_members` tables (parish-wide, flexible, reusable)
- **Status:** MIGRATE from mass_role_members → group_members
- **Purpose:** Track which people are capable/trained for each ministry
- **Example:**
  - Group "Lectors" contains: Sean, Maria, John
  - Group "Cantors" contains: Emily, David
  - Group "Presiders" contains: Fr. John, Fr. Miguel, Deacon Tom
- **Storage:**
  - groups table: ministry groups (Lectors, Cantors, Ushers, etc.)
  - group_members table: people who belong to each group

#### 3. ASSIGNMENTS (Who IS assigned to specific liturgies?)
- **System:** `people_event_assignments`
- **Status:** KEEP - unchanged
- **Purpose:** Actual assignments to specific mass times
- **Example:** Sean IS Lector 1 at 10am Mass on Dec 29, 2024
- **Storage:**
  - master_event_id: Fourth Sunday in Advent
  - calendar_event_id: 10am English Mass
  - field_definition_id: "Lector 1" role
  - person_id: Sean

**Why this separation matters:**
- **Capability tracking (groups)** answers: "Who could potentially fill this role?"
- **Assignments (people_event_assignments)** answers: "Who is specifically assigned to this mass?"
- **Role definitions (input_field_definitions)** answers: "What roles need to be filled?"

---

### PHASE 1: Foundation Work

#### 1.1 Database Schema Changes

**Migration 1: Update system_type enum values**

File: `supabase/migrations/YYYYMMDD000001_update_system_type_enum_values.sql`

NARRATIVE:
- Drop existing CHECK constraint on event_types.system_type
- Add new CHECK constraint with updated values: 'mass-liturgy', 'special-liturgy', 'parish-event'
- Update DEFAULT value from 'event' to 'parish-event'
- Migrate existing data:
  - UPDATE event_types SET system_type = 'mass-liturgy' WHERE system_type = 'mass'
  - UPDATE event_types SET system_type = 'parish-event' WHERE system_type = 'event'
  - 'special-liturgy' stays unchanged
- Update comment on system_type column

PSEUDO-CODE:
```
BEGIN TRANSACTION

-- Drop old constraint
ALTER TABLE event_types DROP CONSTRAINT IF EXISTS event_types_system_type_check

-- Add new constraint with updated values
ALTER TABLE event_types ADD CONSTRAINT event_types_system_type_check
  CHECK (system_type IN ('mass-liturgy', 'special-liturgy', 'parish-event'))

-- Update default value
ALTER TABLE event_types ALTER COLUMN system_type SET DEFAULT 'parish-event'

-- Migrate existing data
UPDATE event_types
  SET system_type = 'mass-liturgy'
  WHERE system_type = 'mass' AND deleted_at IS NULL

UPDATE event_types
  SET system_type = 'parish-event'
  WHERE system_type = 'event' AND deleted_at IS NULL

-- Update column comment
COMMENT ON COLUMN event_types.system_type IS 'System type for UI organization (mass-liturgy, special-liturgy, parish-event)'

COMMIT
```

**Impact:** Affects all event_types records in database. Requires careful migration of existing data.

---

**Migration 2: Migrate mass_roles capability data to groups**

File: `supabase/migrations/YYYYMMDD000002_migrate_mass_roles_to_groups.sql`

NARRATIVE:
This migration preserves existing ministry capability data by converting mass_roles and mass_role_members to the flexible groups system.

The migration should:
1. For each mass_role record, create a corresponding group
2. Copy name, description, is_active from mass_roles to groups
3. For each mass_role_member, create a group_member record
4. Link to the corresponding group and person
5. Preserve joined_at timestamp
6. Log conversion summary for verification

PSEUDO-CODE:
```
BEGIN TRANSACTION

-- Create conversion log table (temporary)
CREATE TEMP TABLE migration_log (
  mass_role_id UUID,
  mass_role_name TEXT,
  group_id UUID,
  members_migrated INTEGER
)

-- Migrate mass_roles to groups
INSERT INTO groups (id, parish_id, name, description, is_active, created_at)
SELECT
  id,                    -- Keep same ID for easier tracking
  parish_id,
  name,                  -- e.g., "Lectors", "Cantors"
  description,
  is_active,
  created_at
FROM mass_roles
WHERE deleted_at IS NULL

-- Log created groups
INSERT INTO migration_log (mass_role_id, mass_role_name, group_id)
SELECT id, name, id FROM mass_roles WHERE deleted_at IS NULL

-- Migrate mass_role_members to group_members
INSERT INTO group_members (group_id, person_id, joined_at)
SELECT
  mrm.mass_role_id AS group_id,    -- Links to migrated group (same ID)
  mrm.person_id,
  mrm.created_at AS joined_at
FROM mass_role_members mrm
JOIN mass_roles mr ON mrm.mass_role_id = mr.id
WHERE mrm.deleted_at IS NULL
  AND mr.deleted_at IS NULL
ON CONFLICT (group_id, person_id) DO NOTHING  -- Skip duplicates

-- Update migration log with member counts
UPDATE migration_log ml
SET members_migrated = (
  SELECT COUNT(*)
  FROM group_members gm
  WHERE gm.group_id = ml.group_id
)

-- Output migration summary
DO $$
DECLARE
  log_record RECORD
BEGIN
  RAISE NOTICE 'Mass Roles → Groups Migration Summary:'
  FOR log_record IN SELECT * FROM migration_log LOOP
    RAISE NOTICE '  - % (ID: %): Migrated % members',
      log_record.mass_role_name,
      log_record.mass_role_id,
      log_record.members_migrated
  END LOOP
END $$

-- Add comment to groups created from mass_roles
COMMENT ON TABLE groups IS 'Ministry groups for capability tracking. Migrated from legacy mass_roles system on [DATE].'

COMMIT
```

**Verification queries:**
```
-- Verify group count matches mass_role count
SELECT COUNT(*) FROM groups WHERE id IN (SELECT id FROM mass_roles WHERE deleted_at IS NULL)

-- Verify member count matches
SELECT COUNT(*) FROM group_members WHERE group_id IN (SELECT id FROM mass_roles WHERE deleted_at IS NULL)

-- Show groups created from mass_roles
SELECT g.name, COUNT(gm.id) as member_count
FROM groups g
LEFT JOIN group_members gm ON g.group_id = gm.group_id
WHERE g.id IN (SELECT id FROM mass_roles WHERE deleted_at IS NULL)
GROUP BY g.id, g.name
```

**Impact:**
- Preserves all existing capability tracking data
- No data loss
- Groups system is now the source of truth for ministry capabilities
- mass_roles tables can be safely dropped after verification

**Rollback strategy:**
If migration fails or data is incorrect:
- Transaction will automatically rollback
- mass_roles and mass_role_members remain unchanged
- Can re-run migration after fixes

---

**Migration 3: Link input_field_definitions to groups for filtering**

File: `supabase/migrations/YYYYMMDD000003_link_field_definitions_to_groups.sql`

NARRATIVE:
Enable person-type input_field_definitions to filter PersonPicker suggestions by group membership.

The system already has `input_filter_tags TEXT[]` field on input_field_definitions. We will use this field to store group IDs that should be suggested for each role.

**Approach: Use input_filter_tags for group filtering**

PSEUDO-CODE:
```
-- No schema changes needed!
-- input_filter_tags already exists as TEXT[]

-- Add comment explaining usage pattern
COMMENT ON COLUMN input_field_definitions.input_filter_tags IS
'Array of group IDs (as strings) for filtering person picker suggestions.
When assigning a person to this role, the picker will prioritize showing
people who are members of these groups.

Example: For "Lector 1" role, input_filter_tags = [''uuid-of-lectors-group'']
Result: PersonPicker shows Lectors group members first, then all people.

Set by admins when configuring event type person-type fields.
Empty array = show all people (no group filtering).
Multiple IDs = show members from any of the specified groups.'

-- Example: Link "Presider" role to "Presiders" group
-- (This would be done via UI, showing pseudo-code for reference)
UPDATE input_field_definitions
SET input_filter_tags = ARRAY[
  (SELECT id::text FROM groups WHERE name = 'Presiders' LIMIT 1)
]
WHERE name = 'Presider'
  AND type = 'person'
  AND event_type_id IN (
    SELECT id FROM event_types WHERE system_type = 'mass-liturgy'
  )
```

**UI Configuration Requirements:**
- Event type field configuration UI should allow admins to:
  1. Select which groups filter this person-type field
  2. Multi-select: can link to multiple groups
  3. Empty selection: show all people (no filtering)
  4. Preview: show which people would be suggested

**PersonPicker Filtering Logic:**
```
FUNCTION getPersonPickerSuggestions(fieldDefinitionId):
  fieldDef = FETCH input_field_definition WHERE id = fieldDefinitionId

  IF fieldDef.input_filter_tags is empty:
    // No group filtering - show all people in parish
    RETURN getAllPeopleInParish()

  ELSE:
    // Group filtering enabled
    groupIds = PARSE fieldDef.input_filter_tags as UUIDs

    // Fetch people who are members of ANY of the specified groups
    suggestedPeople = FETCH people WHERE id IN (
      SELECT person_id FROM group_members
      WHERE group_id IN groupIds
      ORDER BY person.full_name
    )

    // Also fetch all other people (for fallback selection)
    allPeople = FETCH all people in parish

    // Return with suggested people first
    RETURN {
      suggested: suggestedPeople,
      all: allPeople
    }
```

**Impact:**
- No breaking changes (input_filter_tags already exists)
- Admins can configure group filtering per role
- PersonPicker shows suggested people first, but allows selecting anyone
- Flexible: can link role to multiple groups or none

---

#### 1.2 TypeScript Type Updates

**Files requiring changes (3 files):**

**File 1:** `src/lib/types/event-types.ts`

CHANGE:
```
OLD: export type SystemType = 'mass' | 'special-liturgy' | 'event'
NEW: export type SystemType = 'mass-liturgy' | 'special-liturgy' | 'parish-event'
```

**File 2:** `src/lib/constants/system-types.ts`

CHANGES:
1. Update SYSTEM_TYPE_VALUES array
2. Update SYSTEM_TYPE_METADATA keys and labels
3. No icon changes needed

PSEUDO-CODE:
```
// Update values array
SYSTEM_TYPE_VALUES = ['mass-liturgy', 'special-liturgy', 'parish-event']

// Update metadata object
SYSTEM_TYPE_METADATA = {
  'mass-liturgy': {
    slug: 'mass-liturgy',
    name_en: 'Mass Liturgies',
    name_es: 'Liturgias de Misa',
    icon: 'BookOpen'
  },
  'special-liturgy': {
    slug: 'special-liturgy',
    name_en: 'Special Liturgies',
    name_es: 'Liturgias Especiales',
    icon: 'Star'
  },
  'parish-event': {
    slug: 'parish-event',
    name_en: 'Parish Events',
    name_es: 'Eventos Parroquiales',
    icon: 'CalendarDays'
  }
}
```

**File 3:** `src/lib/schemas/event-types.ts`

CHANGE: Update Zod schema enum values if present

---

#### 1.3 Code Reference Updates

**Search and replace across codebase (~32 occurrences):**

SEARCH FOR:
- `system_type = 'mass'` OR `systemType: 'mass'` (19 occurrences)
- `system_type = 'event'` OR `systemType: 'event'` (13 occurrences)

REPLACE WITH:
- `system_type = 'mass-liturgy'` OR `systemType: 'mass-liturgy'`
- `system_type = 'parish-event'` OR `systemType: 'parish-event'`

**Files likely affected (from grep results):**
- `src/lib/actions/mass-liturgies.ts`
- `src/lib/actions/event-types.ts`
- `src/lib/actions/master-events.ts`
- `src/lib/onboarding-seeding/mass-event-types-seed.ts`
- `src/lib/onboarding-seeding/event-types-seed.ts`
- `src/lib/onboarding-seeding/special-liturgy-event-types-seed.ts`
- `src/app/(main)/mass-liturgies/page.tsx`
- `src/app/(main)/events/page.tsx`
- `src/app/(main)/special-liturgies/*/page.tsx`
- `src/app/(main)/settings/mass-liturgies/create/mass-create-client.tsx`
- `src/app/(main)/settings/events/create/event-create-client.tsx`
- Test files

**Verification approach:**
1. Run grep for old values: `'mass'`, `'event'` (in context of system_type)
2. Verify all occurrences are updated
3. Run TypeScript compiler to catch type mismatches
4. Run existing tests to verify no breaks

---

#### 1.4 UI Label Updates

**CRITICAL:** UI labels must change to reflect the semantic distinction:

**Current Labels → New Labels:**
- "Masses" → "Mass Liturgies" (English) / "Liturgias de Misa" (Spanish)
- "Events" → "Parish Events" (English) / "Eventos Parroquiales" (Spanish)
- "Special Liturgies" → No change

**Files requiring UI label updates:**

1. **Main Sidebar** (`src/components/main-sidebar.tsx`)
   - Navigation link text for Masses section

2. **Settings Pages:**
   - `/settings/mass-liturgies/` → Update page title and breadcrumbs
   - `/settings/events/` → Update page title and breadcrumbs
   - `/settings/special-liturgies/` → No change

3. **Dashboard** (`src/app/(main)/dashboard/page.tsx`)
   - Widget titles if present

4. **Module Registry** (`docs/MODULE_REGISTRY.md`)
   - Update documentation with new labels

**Implementation approach:**
- Search for bilingual label objects containing "Masses" and "Events"
- Update both `.en` and `.es` properties
- Maintain consistency with SYSTEM_TYPE_METADATA labels

---

#### 1.5 Remove Legacy mass_roles System

**CRITICAL: This step can ONLY be done AFTER Migration 2 (mass_roles → groups) has been verified successful.**

**Updated removal strategy:**
1. **FIRST:** Run Migration 2 to migrate capability data
2. **VERIFY:** Check migration_log output and verification queries
3. **TEST:** Confirm groups system shows correct people for each ministry
4. **THEN:** Remove legacy tables and code

**COMPLETE REMOVAL - 51+ files found with mass_role references**

**Migration files to DELETE (4 files):**
```
supabase/migrations/20251110000005_create_mass_roles_table.sql
supabase/migrations/20251118000001_create_mass_role_members_table.sql
supabase/migrations/20251110000003_create_mass_roles_templates_table.sql
supabase/migrations/20251115000002_create_mass_roles_template_items_table.sql
```

**Server action files to DELETE (6 files):**
```
src/lib/actions/mass-roles.ts
src/lib/actions/mass-role-members.ts
src/lib/actions/mass-role-template-items.ts
src/lib/actions/mass-role-templates.ts
src/lib/actions/mass-role-members-compat.ts
src/lib/report-builders/mass-role-report.ts
```

**API route files to DELETE (3 files):**
```
src/app/api/mass-roles/[id]/report/route.ts
src/app/api/mass-roles/[id]/word/route.ts
src/app/api/mass-roles/[id]/pdf/route.ts
```

**UI component files to DELETE (4 files):**
```
src/components/mass-assignment-people-picker.tsx
src/components/mass-role-template-item-list.tsx
src/components/mass-role-assignments.tsx
src/components/mass-role-template-item.tsx
```

**Settings directory to DELETE (entire tree):**
```
src/app/(main)/settings/mass-configuration/
  ├── role-definitions/
  ├── role-patterns/
  └── ministry-volunteers/
```

**Dev seeder files to DELETE:**
```
scripts/dev-seeders/seed-mass-role-assignments.ts
```

**Files requiring CLEANUP (remove mass_role references):**

1. `src/lib/types.ts`
   - Remove: MassRole, MassRoleMember, MassRoleTemplate, MassRoleTemplateItem interfaces

2. `src/lib/constants.ts`
   - Remove: MASS_ROLE_* constants if present

3. `src/lib/schemas/mass-liturgies.ts`
   - Remove: mass_role_template_id field from schema

4. `src/lib/onboarding-seeding/parish-seed-data.ts`
   - Remove: mass_role seeding logic

5. `src/lib/actions/mass-scheduling.ts`
   - MIGRATE to use people_event_assignments instead of mass_roles
   - This file likely contains logic that needs to be rewritten

6. `src/lib/actions/people.ts`
   - Remove: mass_role references if present

7. `src/app/(main)/mass-liturgies/mass-form.tsx`
   - Remove: mass_role UI components and logic
   - Keep: people_event_assignments logic (already exists)

8. `scripts/dev-seed.ts`
   - Remove: calls to seed-mass-role-assignments

**Documentation files to DELETE or UPDATE:**
```
DELETE:
docs/mass-liturgies/MASSES_ROLE_SYSTEM.md
docs/mass-liturgies/MASSES_SERVER_ACTIONS.md (if mass_roles-specific)
docs/mass-template/* (entire directory if mass_roles-specific)
docs/MASS_TEMPLATE.md
docs/MASS_ASSIGNMENT_LOGIC.md
docs/MASS_SCHEDULING_ALGORITHMS.md
docs/MASS_SCHEDULING.md
docs/modules/mass.md (if outdated)

UPDATE:
docs/MODULE_REGISTRY.md - Remove mass-configuration section
docs/PARISHIONER_PORTAL.md - Remove mass_role references
docs/ONBOARDING.md - Remove mass_role seeding
docs/business/ROADMAP.md - Update roadmap
```

**Migration 4: Drop legacy mass_roles tables**

File: `supabase/migrations/YYYYMMDD000004_drop_legacy_mass_roles_tables.sql`

NARRATIVE:
After verifying that Migration 2 successfully migrated all capability data to groups, drop the legacy mass_roles tables.

**CRITICAL:** This migration should ONLY be run after:
1. Migration 2 has been executed
2. Verification queries confirm data was migrated
3. Manual testing confirms groups system works correctly
4. User has confirmed no production dependencies on mass_roles

PSEUDO-CODE:
```
BEGIN TRANSACTION

-- Log what we're about to drop
DO $$
BEGIN
  RAISE NOTICE 'Dropping legacy mass_roles system tables:'
  RAISE NOTICE '  - mass_roles_template_items (% rows)',
    (SELECT COUNT(*) FROM mass_roles_template_items)
  RAISE NOTICE '  - mass_roles_templates (% rows)',
    (SELECT COUNT(*) FROM mass_roles_templates)
  RAISE NOTICE '  - mass_role_members (% rows)',
    (SELECT COUNT(*) FROM mass_role_members)
  RAISE NOTICE '  - mass_roles (% rows)',
    (SELECT COUNT(*) FROM mass_roles)
END $$

-- Drop tables in dependency order (children first)
DROP TABLE IF EXISTS mass_roles_template_items CASCADE
DROP TABLE IF EXISTS mass_roles_templates CASCADE
DROP TABLE IF EXISTS mass_role_members CASCADE
DROP TABLE IF EXISTS mass_roles CASCADE

-- Confirm completion
DO $$
BEGIN
  RAISE NOTICE 'Legacy mass_roles tables dropped successfully'
  RAISE NOTICE 'Ministry capability tracking now uses groups + group_members'
END $$

COMMIT
```

**Verification after drop:**
```
-- Verify tables no longer exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'mass_role%'
-- Should return 0 rows

-- Verify groups system has the data
SELECT g.name, COUNT(gm.id) as member_count
FROM groups g
LEFT JOIN group_members gm ON g.id = gm.group_id
GROUP BY g.id, g.name
ORDER BY g.name
-- Should show all ministry groups with member counts
```

**Impact:**
- Legacy mass_roles tables permanently removed
- groups + group_members is now the only capability tracking system
- No data loss (data migrated in Migration 2)
- Frees up database resources

**Rollback:**
- If this migration was run prematurely, you would need to:
  1. Restore database from backup
  2. Re-run migrations in correct order
- PREVENTION: Always verify Migration 2 before running this

---

**Verification steps:**
1. Run: `grep -r "mass_role" src/ --exclude-dir=node_modules`
2. Verify: Zero results (except in comments explaining removal)
3. Run: `npm run build`
4. Verify: No TypeScript errors related to mass_role types
5. Run: `npm run db:fresh`
6. Verify: Database migrations succeed and mass_role tables do not exist
7. Verify: Groups table contains expected ministry groups
8. Verify: Group members table contains expected memberships

---

### PHASE 2: Mass Script Generation

#### 2.1 Architecture Confirmation

**Current architecture (NO CHANGES NEEDED):**

```
event_type (system_type = 'mass-liturgy')
  └─ defines structure via input_field_definitions
     └─ includes person-type fields for roles (Presider, Lector, Cantor, etc.)

master_event = LITURGICAL DAY (e.g., "Fourth Sunday in Advent")
  └─ field_values: JSONB containing template-level data
  └─ liturgical_event_id: UUID (optional link to global_liturgical_events)

calendar_events = INDIVIDUAL MASS TIMES for that liturgical day
  ├─ 10:00 AM English Mass (input_field_definition_id = "english_10am")
  ├─ 12:00 PM Spanish Mass (input_field_definition_id = "spanish_12pm")
  └─ 5:00 PM Youth Mass (input_field_definition_id = "youth_5pm")

people_event_assignments = MINISTERS assigned to specific mass times
  ├─ master_event_id: UUID (Fourth Sunday in Advent)
  ├─ calendar_event_id: UUID (specific to 10am, 12pm, or 5pm mass)
  ├─ field_definition_id: UUID (which role: Presider, Lector, etc.)
  └─ person_id: UUID (who is assigned)
```

**Key points:**
- NO schema changes needed
- Uses existing people_event_assignments table
- Leverages calendar_event_id for occurrence-level assignments
- master_event can optionally link to global_liturgical_events via liturgical_event_id

---

#### 2.2 Role Assignment UI Enhancement with Group Filtering

**Current state:** Mass form likely has basic people_event_assignments integration

**Required enhancement:** Add dedicated UI section for assigning ministers to calendar events with group-based filtering in PersonPicker

**Component:** `RoleAssignmentSection` (already exists at `src/components/role-assignment-section.tsx`)

NARRATIVE:
The mass view page should display a role assignment section that:
1. Lists all calendar_events for the master_event (all mass times for the liturgical day)
2. For each calendar_event, shows:
   - Time and language/type (from input_field_definition.name)
   - List of person-type field definitions (roles) from the event_type
   - Current people_event_assignments for that calendar_event
   - UI to add/remove/edit assignments
3. Uses PersonPicker component for selecting people with **group-based filtering**
4. Calls createPeopleEventAssignment, updatePeopleEventAssignment, deletePeopleEventAssignment server actions

**NEW: Group-based filtering in PersonPicker**

The PersonPicker component should be enhanced to support group filtering via input_filter_tags:

NARRATIVE:
When a user clicks to assign a person to a role (e.g., "Lector 1"), the PersonPicker should:
1. Check if the field_definition has input_filter_tags (group IDs)
2. If tags exist, fetch people who are members of those groups
3. Display suggested people (group members) in a "Suggested" section at the top
4. Display all other people below the suggested section
5. Allow selecting anyone (not restricted to group members)
6. Visually distinguish suggested vs. all people

PSEUDO-CODE FOR ROLE ASSIGNMENT:
```
COMPONENT: MassRoleAssignments (new or enhanced existing)

PROPS:
  - masterEvent: MasterEventWithRelations
  - calendarEvents: CalendarEvent[] (all mass times for this liturgical day)
  - personFieldDefinitions: InputFieldDefinition[] (roles from event_type)

RENDER:
  FOR EACH calendarEvent IN calendarEvents:
    DISPLAY:
      - Calendar event time and name (e.g., "10:00 AM English Mass")

    FOR EACH personFieldDef IN personFieldDefinitions:
      DISPLAY:
        - Role label (e.g., "Presider", "Lector 1")

      FETCH: people_event_assignments WHERE
        - master_event_id = masterEvent.id
        - calendar_event_id = calendarEvent.id
        - field_definition_id = personFieldDef.id

      IF assignment exists:
        DISPLAY: Person name with edit/remove buttons
      ELSE:
        DISPLAY: PersonPicker with group filtering (see below)

ACTIONS:
  - Add assignment: Call createPeopleEventAssignment({
      master_event_id,
      calendar_event_id,
      field_definition_id,
      person_id,
      notes
    })

  - Update assignment: Call updatePeopleEventAssignment(assignment_id, {
      person_id,
      notes
    })

  - Remove assignment: Call deletePeopleEventAssignment(assignment_id)
```

PSEUDO-CODE FOR GROUP FILTERING IN PERSONPICKER:
```
COMPONENT: PersonPicker (enhanced)

PROPS:
  - fieldDefinition: InputFieldDefinition (contains input_filter_tags)
  - onSelect: (person) => void
  - currentValue?: Person

STATE:
  - suggestedPeople: Person[] (from groups)
  - allPeople: Person[]
  - searchQuery: string

ON MOUNT:
  IF fieldDefinition.input_filter_tags is not empty:
    groupIds = PARSE fieldDefinition.input_filter_tags as UUIDs

    // Fetch people who are members of specified groups
    suggestedPeople = FETCH people WHERE id IN (
      SELECT person_id FROM group_members
      WHERE group_id IN groupIds
      ORDER BY joined_at DESC  // Most recent members first
    )

    // Fetch all people in parish
    allPeople = FETCH all people in parish
      WHERE NOT IN suggestedPeople  // Exclude already suggested

  ELSE:
    // No group filtering
    suggestedPeople = []
    allPeople = FETCH all people in parish

RENDER:
  <SearchInput value={searchQuery} onChange={setSearchQuery} />

  IF suggestedPeople is not empty AND searchQuery is empty:
    <Section title="Suggested" subtitle="From [Group Name]">
      FOR EACH person IN suggestedPeople:
        <PersonOption person={person} badge="Suggested" />
    </Section>

  <Section title={suggestedPeople.length > 0 ? "All Others" : "All People"}>
    FOR EACH person IN (searchQuery ? filtered(allPeople) : allPeople):
      <PersonOption person={person} />
  </Section>

FILTERING:
  WHEN searchQuery changes:
    Filter BOTH suggestedPeople AND allPeople by:
      - person.full_name contains searchQuery (case-insensitive)
    Combine filtered results, suggestedPeople first
```

**UI DESIGN NOTES:**
- Suggested people should have a subtle badge or indicator (e.g., star icon, "Suggested" label)
- Suggested section should be collapsible if list is long
- Search should work across both suggested and all people
- Empty state: "No suggested people for this role. Select from all parish members below."

**Configuration UI (Event Type Field Settings):**
```
COMPONENT: PersonFieldConfiguration

PROPS:
  - fieldDefinition: InputFieldDefinition

RENDER:
  <FormField label="Filter by Ministry Groups (optional)">
    <MultiSelect
      options={groups in parish}
      value={fieldDefinition.input_filter_tags}
      onChange={updateInputFilterTags}
      placeholder="Select groups to suggest for this role"
    />
    <HelpText>
      When assigning this role, people from these groups will be suggested first.
      Anyone can still be selected.
    </HelpText>
  </FormField>

  <PreviewSection>
    IF input_filter_tags is not empty:
      DISPLAY: "Suggested people:"
      FETCH and DISPLAY: people from selected groups
  </PreviewSection>
```

**Reuse existing components:**
- PersonPicker base component (enhance with filtering)
- RoleAssignmentSection (already exists)

**New server action (if needed):**
```
FUNCTION getPeopleBygroupIds(groupIds: UUID[]):
  RETURN people WHERE id IN (
    SELECT person_id FROM group_members
    WHERE group_id IN groupIds
    AND deleted_at IS NULL
  )
  ORDER BY full_name
```

---

#### 2.3 Script Generation - Roster Format

**Output format:** ROSTER showing all mass times for one liturgical day

**Example output:**
```
FOURTH SUNDAY IN ADVENT
December 22, 2024

════════════════════════════════════════════════

10:00 AM English Mass
━━━━━━━━━━━━━━━━━━━━━
Ministers:
  Presider: Fr. John Smith
  Lector 1: Jane Doe
  Lector 2: Bob Johnson
  Cantor: Mary Williams

12:00 PM Spanish Mass
━━━━━━━━━━━━━━━━━━━━━
Ministers:
  Presider: Fr. Miguel Rodriguez
  Lector 1: Maria Garcia
  Lector 2: Carlos Hernandez
  Cantor: Luis Martinez

5:00 PM Youth Mass
━━━━━━━━━━━━━━━━━━━━━
Ministers:
  Presider: Fr. John Smith
  Lector 1: Sarah Williams
  Lector 2: Emily Chen
  Cantor: David Park

════════════════════════════════════════════════

[Optional: Liturgical day details if linked to global_liturgical_events]
[Optional: Template-level field_values from master_event]
```

---

#### 2.4 Content Builder for Mass Roster

**File:** `src/lib/content-builders/mass-roster-content-builder.ts` (new file)

NARRATIVE:
Create a content builder that generates roster-style scripts for a master_event (liturgical day).

The builder should:
1. Accept a master_event ID
2. Fetch master_event with relations (event_type, calendar_events, global_liturgical_event if linked)
3. Fetch all people_event_assignments for this master_event
4. For each calendar_event, group assignments by role
5. Return structured content following CONTENT_BUILDER_SECTIONS.md patterns

PSEUDO-CODE:
```
FUNCTION buildMassRosterContent(masterEventId):
  // Fetch data
  masterEvent = FETCH master_event WITH event_type, calendar_events, liturgical_event
  assignments = FETCH people_event_assignments WITH person, field_definition
    WHERE master_event_id = masterEventId

  // Group assignments by calendar_event
  assignmentsByCalendarEvent = GROUP assignments BY calendar_event_id

  // Build sections
  sections = []

  // Cover section
  sections.push({
    type: 'cover',
    title: masterEvent.name (e.g., "Fourth Sunday in Advent")
    subtitle: formatDatePretty(first calendar_event date)
    includePageBreak: false
  })

  // For each mass time
  FOR EACH calendarEvent IN masterEvent.calendar_events:
    // Mass time header
    sections.push({
      type: 'heading',
      content: formatTime(calendarEvent.start_datetime) + " " + calendarEvent.field_definition.name
      level: 2
      includePageBreak: false
    })

    // Ministers list
    massAssignments = assignmentsByCalendarEvent[calendarEvent.id] OR []

    IF massAssignments.length > 0:
      ministersContent = []
      FOR EACH assignment IN massAssignments:
        roleName = assignment.field_definition.label OR assignment.field_definition.name
        personName = assignment.person.full_name
        ministersContent.push(roleName + ": " + personName)

      sections.push({
        type: 'text',
        content: "Ministers:\n" + ministersContent.join("\n")
        format: 'plain'
      })
    ELSE:
      sections.push({
        type: 'text',
        content: "No ministers assigned"
        format: 'plain'
      })

  RETURN {
    sections: sections,
    title: masterEvent.name,
    metadata: {
      generatedAt: now(),
      masterEventId: masterEventId,
      type: 'mass-roster'
    }
  }
```

**Integration with existing system:**
- Follow LITURGICAL_SCRIPT_SYSTEM.md patterns
- Use section interfaces from CONTENT_BUILDER_SECTIONS.md
- Compatible with RENDERER.md for PDF/Word export

---

#### 2.5 API Routes for Script Export

**Create 3 API routes (following existing pattern):**

**1. PDF Export**
File: `src/app/api/mass-liturgies/[id]/roster/pdf/route.ts`

NARRATIVE:
- Accept GET request with master_event ID
- Call buildMassRosterContent(id)
- Pass content to PDF renderer (RENDERER.md)
- Return PDF file response

**2. Word Export**
File: `src/app/api/mass-liturgies/[id]/roster/word/route.ts`

NARRATIVE:
- Accept GET request with master_event ID
- Call buildMassRosterContent(id)
- Pass content to Word renderer (RENDERER.md)
- Return DOCX file response

**3. Text Export (optional)**
File: `src/app/api/mass-liturgies/[id]/roster/text/route.ts`

NARRATIVE:
- Accept GET request with master_event ID
- Call buildMassRosterContent(id)
- Format as plain text
- Return TXT file response

**Reuse existing patterns:**
- Follow EXPORT_BUTTONS.md for button placement
- Use existing renderer utilities from RENDERER.md
- Same permission checks as other export routes

---

#### 2.6 UI Integration - Mass View Page

**File:** `src/app/(main)/mass-liturgies/[id]/mass-view-client.tsx`

**Enhancements needed:**

1. **Add Export Buttons Section**
   - PDF Roster
   - Word Roster
   - Print Roster (opens print dialog)

2. **Add Role Assignment Section**
   - Use RoleAssignmentSection component
   - Display all calendar_events with current assignments
   - Allow add/edit/remove assignments via PersonPicker

3. **Display Liturgical Day Info**
   - If master_event has liturgical_event_id, fetch and display liturgical day details
   - Show season, color, rank (from global_liturgical_events)

PSEUDO-CODE:
```
COMPONENT: MassViewClient

PROPS:
  - mass: MasterEventWithRelations (includes calendar_events, event_type)

STATE:
  - assignments: PeopleEventAssignmentWithPerson[] (from server or fetched)
  - liturgicalEvent: GlobalLiturgicalEvent | null (if linked)

RENDER SECTIONS:
  1. PageHeader with mass name and date

  2. ModuleViewContainer with:
    - Action buttons (Edit, Delete)
    - Export buttons:
      - Export PDF Roster → /api/mass-liturgies/[id]/roster/pdf
      - Export Word Roster → /api/mass-liturgies/[id]/roster/word
      - Print Roster → window.print() after navigation to print view

  3. Mass Times & Assignments Section:
    - List all calendar_events
    - For each calendar_event:
      - Show time and type
      - Show current role assignments
      - Allow add/edit/remove via PersonPicker

  4. Liturgical Day Details (if linked):
    - Show season, color, rank from global_liturgical_events
    - Link to liturgical calendar

  5. Template-Level Details:
    - Show field_values from master_event (if any)
```

---

#### 2.7 Print View for Roster

**File:** `src/app/print/mass-liturgies/[id]/roster/page.tsx` (new file)

NARRATIVE:
Create a print-optimized view of the mass roster that matches the PDF/Word export format.

This page should:
- Be a server component
- Fetch master_event with all relations
- Fetch all people_event_assignments
- Render roster content in print-friendly HTML
- Use print-specific styles (allowed exception to normal styling rules)
- Include CSS @media print rules for optimal printing

PSEUDO-CODE:
```
PAGE: /print/mass-liturgies/[id]/roster

SERVER COMPONENT:
  - Fetch master_event with calendar_events, event_type
  - Fetch people_event_assignments with person, field_definition
  - Call buildMassRosterContent(id) for structured data

RENDER:
  <div className="print-container">
    <header className="print-header">
      <h1>{master_event.name}</h1>
      <h2>{formatDatePretty(first calendar_event date)}</h2>
    </header>

    FOR EACH calendarEvent:
      <section className="mass-time-section">
        <h3>{formatTime} {field_definition.name}</h3>

        <div className="ministers-list">
          FOR EACH assignment:
            <div className="minister-row">
              <span className="role-label">{role name}</span>
              <span className="person-name">{person.full_name}</span>
            </div>
        </div>
      </section>
  </div>

STYLES:
  @media print:
    - Hide navigation/headers/footers
    - Use serif font for readability
    - Set appropriate margins
    - Page break rules between mass times if needed
```

---

### Testing Requirements

**User consultation:** This feature involves significant changes to core data types and removal of legacy systems. Testing should be comprehensive.

**Recommended test coverage:**

**Unit Tests:**
1. Content builder tests (`mass-roster-content-builder.spec.ts`)
   - Verify section generation
   - Test assignment grouping logic
   - Edge cases: no assignments, single mass time, multiple mass times

2. Server action tests
   - Verify people_event_assignments CRUD operations
   - Test permission enforcement
   - Test occurrence-level vs template-level logic

**E2E Tests:**
1. Mass roster generation (`mass-roster.spec.ts`)
   - Create master_event with multiple calendar_events
   - Assign ministers to each mass time
   - Generate roster
   - Verify content includes all mass times and assignments
   - Export PDF and verify download

2. Role assignment workflow (`mass-role-assignments.spec.ts`)
   - Add minister to a specific mass time
   - Verify assignment appears only for that mass time
   - Edit assignment
   - Remove assignment

**Edge Cases to Test:**
- Master event with no calendar_events
- Calendar event with no assignments
- Multiple people assigned to same role (should be prevented by unique constraint)
- Template-level assignments (calendar_event_id = NULL)
- Occurrence-level assignments (calendar_event_id populated)

---

### Project Documentation Updates

**Files requiring updates:**

1. **MODULE_REGISTRY.md**
   - Update Masses module description
   - Remove mass-configuration section
   - Add reference to mass roster functionality

2. **COMPONENT_REGISTRY.md**
   - Add MassRoleAssignments component (if new)
   - Remove mass_role-related components

3. **DATABASE.md**
   - Remove mass_roles table documentation
   - Add note about people_event_assignments for mass minister assignments
   - Update system_type enum documentation

4. **CODE_CONVENTIONS.md**
   - Update bilingual labels for Mass Liturgies and Parish Events

5. **LITURGICAL_SCRIPT_SYSTEM.md**
   - Add mass roster content builder to registry
   - Document roster format as distinct from ceremony scripts

6. **TEMPLATE_REGISTRY.md**
   - Add mass roster template entry

7. **Create new file: MASS_ROSTER.md** (in docs/ directory)
   - Document roster generation system
   - Explain master_event → calendar_events → people_event_assignments relationship
   - Include example roster output
   - Document export options

---

### User Documentation Updates

**Needed:** Yes - This is a new user-facing feature

**Pages to create in `/src/app/documentation/content/`:**

1. **mass-liturgies-overview.md** (bilingual)
   - English: What are Mass Liturgies?
   - Spanish: ¿Qué son las Liturgias de Misa?
   - Explain liturgical day concept
   - Explain mass times (calendar events)

2. **assigning-mass-ministers.md** (bilingual)
   - English: How to assign ministers to mass times
   - Spanish: Cómo asignar ministros a los horarios de misa
   - Step-by-step with screenshots
   - Explain role types (Presider, Lector, Cantor)

3. **generating-mass-rosters.md** (bilingual)
   - English: How to generate and print mass rosters
   - Spanish: Cómo generar e imprimir listas de ministros de misa
   - Explain roster format
   - Export options (PDF, Word, Print)

**Bilingual content required:** Yes (English & Spanish)

---

### Home Page Impact

**Needed:** Potentially

**Changes to consider:**
- Dashboard widget showing upcoming masses with minister assignments
- Quick link to mass roster for current week
- Alert if any mass times are missing minister assignments

**Recommendation:** Defer to post-implementation based on user feedback

---

### README Impact

**Needed:** No

**Rationale:** This is an enhancement to existing modules, not a major architectural change or new integration. README updates are only needed for major changes (new modules, integrations, project setup).

---

### Security Considerations

**Authentication:**
- All API routes must verify user is authenticated
- All server actions use createAuthenticatedClient()

**Authorization:**
- RLS policies on people_event_assignments already enforce parish-scoped access
- Only Admin, Staff, and Ministry-Leader roles can create/edit/delete assignments
- All users can view assignments for their parish

**Data Validation:**
- Validate master_event_id belongs to selected parish
- Validate person_id belongs to selected parish
- Validate field_definition_id belongs to master_event's event_type
- Enforce occurrence-level vs template-level rules (is_per_calendar_event flag)

**No new security patterns needed** - existing RLS policies and permission patterns apply

---

### Implementation Complexity

**Complexity Rating:** Medium-High

**Reason:**
- **PHASE 1 (Foundation):** Medium complexity
  - Database migration with data updates
  - 32+ code reference updates
  - UI label updates throughout application
  - Legacy system removal (51+ files)
  - Risk: Breaking existing functionality during mass_roles removal

- **PHASE 2 (Script Generation):** Medium complexity
  - New content builder following existing patterns
  - UI enhancement for role assignments
  - Print/export routes following existing patterns
  - Integration with existing people_event_assignments system
  - No new database schema changes

**Total estimated effort:**
- PHASE 1: 2-3 days (migration, updates, removal, testing)
- PHASE 2: 3-4 days (content builder, UI, routes, testing)
- Testing: 1-2 days (comprehensive testing required)
- Documentation: 1 day (project + user docs)
- **Total: 7-10 days**

**Focus on WHAT needs to be done, not timelines. Complexity driven by:**
- Number of files requiring changes (51+ for removal alone)
- Data migration risk (updating system_type values)
- Need for comprehensive testing (affects core functionality)
- User-facing documentation requirements (bilingual)

---

### Dependencies and Blockers

**Dependencies:**
1. Existing people_event_assignments table (✅ exists - migration 20251222000001)
2. Existing server actions for people_event_assignments (✅ exists - src/lib/actions/people-event-assignments.ts)
3. Existing content builder system (✅ exists - LITURGICAL_SCRIPT_SYSTEM.md)
4. Existing renderer system (✅ exists - RENDERER.md)

**Blockers:**
1. ⚠️ **CRITICAL:** User must confirm that mass_roles system is not in production use
   - If production data exists in mass_roles tables, need migration script
   - If mass-configuration UI is in use, need user communication plan

2. ⚠️ **CRITICAL:** Database migration for system_type values requires careful execution
   - Must run on development first
   - Must verify all event_types are updated correctly
   - Must update seeders before running db:fresh

**No technical blockers** - all required infrastructure exists

---

### Documentation Inconsistencies Found

**During codebase analysis, found these inconsistencies:**

1. **DATABASE.md (line 46-47):**
   - Says: "event_types.role_definitions (new JSONB field)"
   - But: Code comments say "role_definitions removed - roles are now stored as input_field_definitions with type='person'"
   - **Resolution needed:** Update DATABASE.md to reflect that roles are in input_field_definitions, not a separate role_definitions JSONB field

2. **mass_roles migration files still exist:**
   - Found 4 migration files for mass_roles tables
   - These tables should be dropped if confirmed unused
   - **Resolution needed:** Create migration to DROP TABLE IF EXISTS for these 4 tables

3. **Inconsistent system_type documentation:**
   - DATABASE.md shows system_type as enum but it's actually a CHECK constraint
   - **Resolution needed:** Clarify in DATABASE.md that system_type is TEXT with CHECK constraint, not a database enum

4. **Missing documentation for people_event_assignments:**
   - Table exists (migration 20251222000001)
   - Server actions exist
   - But no docs/ file explaining the assignment system
   - **Resolution needed:** Create PEOPLE_EVENT_ASSIGNMENTS.md explaining template-level vs occurrence-level pattern

---

### Implementation Phases

**Recommended implementation sequence:**

**PHASE 1: Foundation (DO FIRST)**

**Sub-phase 1a: System Type Updates**
1. Create Migration 1: Update system_type enum values
2. Update TypeScript types
3. Update code references (32+ occurrences)
4. Update UI labels
5. Run database migration
6. Test thoroughly

**Sub-phase 1b: Capability Migration**
7. Create Migration 2: Migrate mass_roles → groups
8. Run migration and verify data copied correctly
9. Test groups system with migrated data
10. Create Migration 3: Document input_filter_tags usage (no schema changes)

**Sub-phase 1c: Legacy Removal**
11. Create Migration 4: Drop legacy mass_roles tables (ONLY after verification)
12. Remove server action files (6 files)
13. Remove API route files (3 files)
14. Remove UI component files (4 files)
15. Remove settings directory (/settings/mass-configuration/)
16. Remove dev seeder files
17. Clean up type references in 8 files
18. Delete or update documentation files
19. Run verification steps
20. Update documentation

**PHASE 2: Script Generation (AFTER PHASE 1 COMPLETE)**

**Sub-phase 2a: Group-Based Filtering**
1. Enhance PersonPicker component with group filtering logic
2. Create UI for configuring input_filter_tags on person-type fields
3. Add preview functionality showing suggested people
4. Test group-based suggestions in PersonPicker

**Sub-phase 2b: Role Assignment Enhancement**
5. Enhance role assignment UI with group-filtered PersonPicker
6. Update mass view page to show role assignments
7. Test add/edit/remove assignment workflows

**Sub-phase 2c: Roster Generation**
8. Create mass roster content builder
9. Create API routes for export (PDF, Word, Text)
10. Create print view
11. Test roster generation and exports

**Sub-phase 2d: Documentation & Testing**
12. Create user documentation (bilingual)
13. Create E2E tests
14. Update project documentation

**Why this sequencing?**
- Foundation work affects core data types used throughout application
- Cannot proceed with script generation until system_type values are correct
- **CRITICAL:** Must migrate capability data BEFORE removing legacy tables
- Group filtering depends on migration completing successfully
- Legacy removal must complete before adding new functionality
- Reduces risk by validating foundation before building on top
- Sub-phases allow for incremental testing and validation

---

### Next Steps

**Status:** Ready for Development

**Hand off to:** developer-agent

**Developer-agent should:**
1. Review this entire requirements document
2. Start with PHASE 1 (Foundation Work)
3. Create system_type migration FIRST
4. Test migration thoroughly before proceeding
5. Remove mass_roles system AFTER migration succeeds
6. Only begin PHASE 2 after PHASE 1 is complete and tested

**User should:**
1. Confirm mass_roles system is not in production use
2. Review proposed UI label changes
3. Run `npm run db:fresh` after developer creates migration
4. Test updated labels and confirm they match parish terminology

---

## Notes from Implementation Planning

**Key Technical Decisions:**
- Use existing people_event_assignments table (no schema changes)
- Follow existing content builder patterns (LITURGICAL_SCRIPT_SYSTEM.md)
- Roster format shows all mass times for one liturgical day (confirmed)
- NO event_type → liturgy rename (deferred to separate epic)
- Phase-based approach to reduce risk

**Risk Mitigation:**
- Comprehensive testing required due to core data type changes
- Database migration includes data updates (requires careful review)
- Legacy system removal affects many files (must verify no production dependencies)
- UI label changes visible to all users (must match parish terminology)

**Open Questions Resolved:**
- ✅ Script format: ROSTER (all mass times for one liturgical day)
- ✅ Role system: people_event_assignments for assignments, groups for capabilities
- ✅ Architecture: master_event = liturgical day, calendar_events = mass times
- ✅ system_type values: Change to 'mass-liturgy' and 'parish-event'
- ✅ Custom fields: Already implemented via input_field_definitions
- ✅ **Three-concern separation:** Definitions (input_field_definitions) + Capabilities (groups) + Assignments (people_event_assignments)
- ✅ **Group filtering:** Use existing input_filter_tags field, no schema changes needed
- ✅ **Migration strategy:** Migrate first, verify, then remove (not destructive)

---

## Key Architectural Decision: Three-Concern Separation

**CRITICAL INSIGHT:** The user confirmed we need to handle THREE distinct but related concerns in role management:

### The Three Concerns

**1. DEFINITIONS - What roles exist?**
- System: `input_field_definitions` (type='person')
- Purpose: Defines available role slots in liturgy templates
- Example: "Presider", "Lector 1", "Lector 2", "Cantor"

**2. CAPABILITIES - Who CAN serve?**
- System: `groups` + `group_members`
- Purpose: Track which people are trained/able to serve in ministries
- Example: Group "Lectors" contains Sean, Maria, John
- Migration: Convert existing `mass_role_members` → `group_members`

**3. ASSIGNMENTS - Who IS assigned?**
- System: `people_event_assignments`
- Purpose: Actual assignments to specific mass times
- Example: Sean IS Lector 1 at 10am Mass on Dec 29

### Why This Matters

**Before (Problematic):**
- mass_roles = Mass-only capability tracking
- Couldn't reuse ministry groups across sacraments
- Duplicate data (Lectors for masses, Lectors for weddings, etc.)

**After (Flexible):**
- groups = Parish-wide capability tracking
- Reusable across ALL sacraments and events
- One "Lectors" group serves masses, weddings, funerals, etc.
- PersonPicker can filter by group: "Show me people who CAN be lectors"
- Assignments record who IS actually assigned

### Implementation Benefits

**Data Integrity:**
- Capability data preserved via migration (no data loss)
- Groups system is more flexible and reusable
- Assignments remain unchanged (people_event_assignments)

**User Experience:**
- PersonPicker shows suggested people (from groups) first
- Still allows selecting anyone (not restricted)
- Visual distinction: "Suggested" badge for group members
- Admins configure which groups feed which roles

**System Design:**
- No schema changes needed (input_filter_tags already exists)
- Migration is non-destructive (copy first, verify, then remove)
- Groups system already exists (tables, RLS policies, server actions)
- Follows existing patterns (input_filter_tags for filtering)

---
