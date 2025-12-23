# Mass Script: Liturgy Calendar & Role Assignments

**Created:** 2025-12-23
**Status:** Ready for Requirements (devils-advocate review complete)
**Agents:** brainstorming-agent, devils-advocate-agent

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
- [ ] Liturgical directors can create master liturgy templates with admin-defined custom inputs
- [ ] Parish staff can schedule individual mass occurrences from liturgy templates
- [ ] Staff can assign ministers to roles (Presider, Lector 1, Lector 2, Cantor, etc.) for each mass
- [ ] System can generate printable scripts combining liturgy inputs and role assignments
- [ ] Presiders can pick up printed scripts from sacristy with all necessary information
- [ ] System supports linking liturgies to global liturgical calendar events
- [ ] Custom roles from onboarding seeder are available for assignment

## Scope

### In Scope (MVP)
- **Two-level architecture:**
  - Master Event (Liturgy): Reusable template with admin-defined custom inputs
  - Calendar Event (Individual Mass): Specific date/time occurrence with role assignments
- Admin-configurable inputs on liturgy templates (same pattern as event types)
- Admin-configurable roles for assignment (from onboarding seeder)
- Role assignment interface for individual masses
- Script generation combining liturgy inputs + role assignments
- Optional link from liturgy to global liturgical events table
- Print/export functionality for scripts

### Out of Scope (Future)
- Automatic reading integration from liturgical calendar API
- Recurring/repeat scheduling of masses
- Minister availability/scheduling conflict detection
- Email/notification to assigned ministers
- Mobile app for ministers to view their assignments
- Attendance tracking
- Homily notes or preparation tools

## Terminology
- **Liturgy** = Master event/template (e.g., "Sunday 10am Mass")
- **Mass** = Individual calendar event/occurrence (e.g., "Sunday 10am Mass on Dec 29, 2024")
- **Liturgy Template** and **Master Event** are interchangeable terms
- **Calendar Event** and **Individual Mass** are interchangeable terms

## Key User Flows

### Primary Flow: Creating and Scheduling a Liturgy
1. Liturgical Director navigates to Masses module (becoming "Liturgies")
2. Creates new Liturgy template: "Sunday 10am Mass"
3. Defines custom inputs for this liturgy (admin-selectable fields, same as event types):
   - Example: Opening Hymn, Responsorial Psalm, Closing Hymn, Special Intentions, Announcements
4. Optionally links liturgy to liturgical calendar event (e.g., "Second Sunday of Advent")
5. Saves liturgy template

### Scheduling Individual Masses from Liturgy Template
1. Parish staff opens the liturgy: "Sunday 10am Mass"
2. Creates individual mass occurrences (calendar events):
   - Dec 29, 2024, 10:00 AM
   - Jan 5, 2025, 10:00 AM
   - etc.
3. For each individual mass, assigns roles:
   - Presider: Fr. John Smith
   - Lector 1: Jane Doe
   - Lector 2: Bob Johnson
   - Cantor: Mary Williams
4. Fills in liturgy template inputs (if not already filled at template level)
5. Saves individual mass

### Generating and Printing Script
1. User navigates to individual mass (or multiple masses?)
2. Clicks "Generate Script" or "Print Script"
3. Script displays:
   - **Top Section:** Admin-defined inputs from liturgy template
   - **Below That:** Role assignments for ??? (see Open Questions)
4. User prints script for presider/ministers

### Alternative Flows
- **Bulk scheduling:** Create multiple individual masses at once (e.g., "Create next 4 Sundays")
- **Template variations:** Copy existing liturgy to create similar template
- **Quick assignment:** Assign same ministers across multiple masses

## Integration Points

### Existing Features
- **Masses Module:** Current implementation becomes liturgy templates, needs calendar event child records
- **Event Types System:** Custom field pattern (admin-selectable inputs) already exists for special liturgies
- **Onboarding Seeder:** Roles (Presider, Lector 1, Lector 2, Cantor, etc.) already defined
- **Liturgical Calendar:** Global `liturgical_events` table for linking liturgies to feast days/seasons
- **People Module:** Minister assignments pull from people records
- **Print/Export System:** Liturgical script system already exists for other sacraments

### Existing Components to Reuse
- Custom field system (from event types)
- Person picker components
- Role assignment interface (likely similar to Groups module?)
- Script generation/content builder system
- PDF/Word export functionality

### Existing Patterns to Follow
- Two-level structure similar to Groups module (group → group members)
- Custom inputs similar to Event Types configuration
- Role assignments similar to liturgical roles in weddings/funerals

## Architecture Questions (To Be Resolved)

### Database Structure
- **Current:** `masses` table - what does it contain currently?
- **Proposed:**
  - `liturgies` table (master events/templates)
  - `masses` table (calendar events, children of liturgies)
  - Or keep single `masses` table with `parent_id` for liturgy templates?
- **Role Assignments:**
  - Separate `mass_role_assignments` table?
  - Or polymorphic `role_assignments` table?

### Custom Inputs Storage
- Are custom inputs defined at liturgy level only?
- Or can individual masses override/extend liturgy inputs?
- How are custom field definitions stored? (Same schema as event types?)

### Script Structure - CRITICAL QUESTION
**UNCLEAR:** What does "role assignments for ALL individual calendar events" mean in the script output?

**Option A - Roster/Schedule View (Multiple Dates):**
Script shows assignments across multiple masses:
```
SUNDAY 10AM MASS SCHEDULE

December 29, 2024
- Presider: Fr. John Smith
- Lector 1: Jane Doe
- Lector 2: Bob Johnson
- Cantor: Mary Williams

January 5, 2025
- Presider: Fr. Michael Jones
- Lector 1: Susan Lee
- Lector 2: Tom Wilson
- Cantor: Mary Williams

[Liturgy template inputs below - shared across all dates]
```

**Option B - Single Mass Script (One Date):**
Script shows one specific mass with its assignments:
```
SUNDAY 10AM MASS
December 29, 2024

MINISTERS:
- Presider: Fr. John Smith
- Lector 1: Jane Doe
- Lector 2: Bob Johnson
- Cantor: Mary Williams

[Liturgy template inputs for this mass]
```

**Which is correct?** This fundamentally changes the user flow and script generation logic.

## Open Questions for Requirements-Agent

### Critical Questions
1. **Script Structure:** Does the script show assignments for ONE mass (Option B) or MULTIPLE masses (Option A)?
2. **Current Masses Module:** What does the existing `masses` table contain? Is it already set up as liturgy templates?
3. **Custom Inputs:** Are inputs defined once on liturgy template, or can each individual mass have unique values?
4. **Role Assignment Storage:** What table/schema will store minister assignments to roles for individual masses?

### Technical Questions
5. **Liturgical Calendar Link:** What's stored when linking a liturgy to `liturgical_events`? Just a foreign key? What appears on the script?
6. **Custom Field Pattern:** Does the existing event types custom field system work for liturgies, or does this need a different approach?
7. **Role Source:** Are roles hard-coded from onboarding seeder, or admin-configurable per liturgy?
8. **Recurring Scheduling:** Out of scope for MVP, but should database structure support future recurring/repeat functionality?

### UX Questions
9. **Navigation:** How do users navigate between liturgy templates and individual masses? Nested routes? Tabs? Separate sections?
10. **Bulk Operations:** Should users be able to create multiple individual masses at once? Assign ministers across multiple dates?
11. **Script Generation:** Is script generated per-mass, or can users generate scripts for multiple masses at once?

### Integration Questions
12. **Relationship to Special Liturgies:** How do wedding masses, funeral masses, etc. fit into this? Are they liturgy templates too?
13. **Minister Availability:** Out of scope for MVP, but should we design with future scheduling conflict detection in mind?

## Next Steps
1. **Clarify script structure** (Option A vs Option B) - this is blocking question
2. **Examine current Masses module** - understand existing database schema and functionality
3. Hand off to requirements-agent for technical analysis once architecture is clear

---

## Notes from Brainstorming Session

**Key Insights:**
- This is a variation on existing patterns, not entirely new functionality
- Custom fields pattern already exists (event types)
- Roles already defined (onboarding seeder)
- Two-level structure similar to Groups module
- NOT auto-pulling readings from liturgical calendar
- Master liturgy CAN link to liturgical calendar for context (feast day, season)

**User Confirmation Needed:**
- Script structure (roster vs single mass) is critical blocker
- Need to understand current Masses module implementation
- Need clarity on whether custom inputs live only on liturgy template or can be overridden per mass

---

## Review Notes
(Added by devils-advocate-agent on 2025-12-23)

### Critical Architectural Conflicts Discovered

After examining the existing codebase, I found **fundamental misalignments** between this brainstorming vision and the actual implemented data architecture. The vision document assumes a structure that **does not match reality**.

#### 🔴 CRITICAL ISSUE #1: "Liturgy" vs "Master Event" Terminology Confusion

**The brainstorming says:**
> "Liturgy" = Master event/template
> "Mass" = Individual calendar event/occurrence

**The actual codebase structure:**
- `event_types` table = User-defined templates (with `system_type` enum: 'mass', 'special-liturgy', 'event')
- `master_events` table = Specific event instances (field_values JSONB, status field)
- `calendar_events` table = Date/time/location entries (master_event_id NOT NULL)

**The problem:** The brainstorming introduces "Liturgy" as a NEW concept that overlaps with BOTH `event_types` AND `master_events`, creating a three-way confusion:
- Is a "Liturgy" an `event_type` (e.g., "Sunday 10am Mass" type)?
- Is a "Liturgy" a `master_event` (e.g., "Sunday 10am Mass on Dec 29" instance)?
- Or is a "Liturgy" something entirely new?

#### 🔴 CRITICAL ISSUE #2: The `masses` Table Was Deleted

**The brainstorming says:**
> "Current Masses module becomes liturgy templates"

**The reality:** The `masses` table was **DELETED** in migration `20251216000007_delete_masses_table.sql` on December 16, 2024. All masses are now stored as:
- `master_events` WHERE `event_type_id` points to an `event_type` WHERE `system_type = 'mass'`

**The problem:** The brainstorming assumes the current Masses module uses a standalone `masses` table that can be "converted" to templates. This assumption is outdated. The unified event data model is already live.

#### 🔴 CRITICAL ISSUE #3: Role Assignment Pattern Conflict

**The brainstorming assumes:** Roles from onboarding seeder, assigned to individual masses

**Three conflicting patterns exist in the codebase:**

1. **Legacy Pattern (mass_roles + mass_role_members):**
   - `mass_roles` table: Role definitions (Lector, Usher, Server, etc.)
   - `mass_role_members` table: People who serve in mass roles (membership, not assignments to specific masses)
   - This is a **role pool**, not per-mass assignments

2. **New Pattern (people_event_assignments):**
   - Mentioned in mass-form.tsx code: `getPeopleEventAssignments`, `createPeopleEventAssignment`
   - Suggests a unified assignment pattern linking people to events
   - **No migration file found** - may be incomplete or planned

3. **Planned Pattern (event_types.role_definitions JSONB):**
   - DATABASE.md says: "event_types.role_definitions (new JSONB field)"
   - event-types.ts says: "Note: role_definitions removed - roles are now stored as input_field_definitions with type='person'"
   - **Contradictory documentation** - unclear which is correct

**The problem:** We can't design role assignments for masses until we know which pattern is canonical.

#### 🔴 CRITICAL ISSUE #4: Custom Fields Already Exist

**The brainstorming says:**
> "Admin-selectable custom fields (same pattern as event types)"

**The reality:** The custom fields system **already exists** via:
- `input_field_definitions` table (35+ field types)
- `event_types.input_field_definitions` relationship
- Dynamic form rendering in mass-form.tsx (lines 99+)

**The problem:** The brainstorming treats custom fields as a future feature to implement, when they're already live. We need clarity on:
- Are masses already using event_type custom fields?
- If yes, what additional functionality is needed?
- If no, why not, and what's blocking it?

#### 🔴 CRITICAL ISSUE #5: Calendar Events Structure Misunderstanding

**The brainstorming says:**
> "Calendar Event (Individual Mass): Specific date/time occurrence with role assignments"

**The reality:** `calendar_events` table structure:
- `master_event_id` (uuid, NOT NULL) - Every calendar_event MUST have a parent master_event
- `input_field_definition_id` (uuid, NOT NULL) - References which field definition created this calendar event
- `start_datetime` (timestamptz, NOT NULL)
- NO `title` field (computed from master_event + field_name)

**The unique constraint:**
```sql
CREATE UNIQUE INDEX idx_calendar_events_unique_per_field
ON calendar_events(master_event_id, input_field_definition_id)
WHERE deleted_at IS NULL;
```

**The problem:** This constraint allows **only ONE calendar_event per master_event per field definition**. This prevents multiple masses from the same liturgy template unless each mass gets its own `master_event`. The brainstorming assumes calendar_events can be "children of liturgies" for multiple occurrences, but the current schema doesn't support this.

### Questions & Answers

**Q1: ARCHITECTURE ALIGNMENT - Does "Liturgy" mean event_type, master_event, or something new?**

The brainstorming uses "Liturgy" to mean "master template" but the codebase already has TWO levels:
- `event_type` = Template definition (e.g., "Wedding", "Funeral", "Daily Mass")
- `master_event` = Specific instance (e.g., "Smith-Jones Wedding", "John Doe Funeral")

Which of these is your "Liturgy"?
- **Option A:** Liturgy = `event_type` (e.g., "Sunday 10am Mass Type")
- **Option B:** Liturgy = `master_event` (e.g., "Sunday 10am Mass on Dec 29")
- **Option C:** Liturgy = NEW table/concept (breaking the unified event model)

**Q2: CALENDAR EVENTS CARDINALITY - How do multiple masses from one liturgy work with the unique constraint?**

The `calendar_events` table has a unique constraint preventing multiple calendar events for the same `master_event_id` + `input_field_definition_id` pair.

Current pattern for weddings:
- ONE `master_event` (the wedding)
- MULTIPLE `calendar_events` (Rehearsal, Ceremony, Reception) - each with different `input_field_definition_id`

Desired pattern for masses (based on brainstorming):
- ONE "Liturgy" (Sunday 10am Mass template?)
- MULTIPLE "Masses" (Dec 29 at 10am, Jan 5 at 10am, Jan 12 at 10am...)

**How does this map to the existing schema?** Do you want:
- **Option A:** Each mass date gets its own `master_event` (no template reuse)
- **Option B:** One `master_event` = liturgy, create multiple `calendar_events` with different field definitions (fighting the unique constraint)
- **Option C:** New schema breaking the unified event model

**Q3: ROLE ASSIGNMENTS PATTERN - Which role system should we use?**

Three patterns exist:
1. `mass_roles` + `mass_role_members` (role pool, no per-mass assignments)
2. `people_event_assignments` (mentioned in code, possibly incomplete)
3. `event_types.role_definitions` JSONB (conflicting documentation)

**Which pattern is canonical for assigning ministers to specific masses?** The answer fundamentally changes the implementation.

**A1: DECISION MADE - event_type → liturgy rename (MAJOR REFACTOR)**

User has decided: **`event_type` will be renamed to `liturgy` throughout the entire application.**

This is a **MASSIVE architectural change** affecting:
- **Database:** 7 migration files with `event_type` references
- **TypeScript/TSX:** 455+ total occurrences across 76+ files
  - 312 occurrences in 32 `.ts` files
  - 143 occurrences in 44 `.tsx` files
- **Table renames:** `event_types` → `liturgies`
- **Column renames:** `event_type_id` → `liturgy_id` (everywhere)
- **Type renames:** `EventType` → `Liturgy`, `EventTypeWithRelations` → `LiturgyWithRelations`
- **Route changes:** `/settings/event-types/` → `/settings/liturgies/`

**Scope Impact:** This is NOT a greenfield feature—it's a comprehensive refactor of the entire application's core data model.

---

**A2: CORRECTED ARCHITECTURE - master_event = LITURGICAL DAY, not individual mass time**

**CRITICAL CORRECTION from user:** The initial understanding was WRONG.

**INCORRECT Understanding (old):**
- "Sunday 10am Mass" = ONE master_event
- "Sunday 12pm Spanish Mass" = ANOTHER master_event

**CORRECT Understanding (new):**
- **master_event = LITURGICAL DAY** (e.g., "Fourth Sunday in Advent", "Christmas Day")
- **calendar_events = INDIVIDUAL MASS TIMES** for that liturgical day
  - 10:00 AM English Mass
  - 12:00 PM Spanish Mass
  - 5:00 PM Youth Mass

**This makes the unique constraint work PERFECTLY:**
- ONE master_event (Fourth Sunday in Advent)
- MULTIPLE calendar_events (each mass time has its own `input_field_definition_id`)
- Each calendar_event gets its own `people_event_assignments`

**Corrected Architecture:**
```
liturgy (event_type after rename, system_type = 'mass-liturgy')
  ↓ (defines structure via input_field_definitions)
master_event = LITURGICAL DAY (e.g., "Fourth Sunday in Advent")
  ↓ (has multiple)
calendar_events = INDIVIDUAL MASS TIMES
  - 10:00 AM English (input_field_definition_id = "english_mass")
  - 12:00 PM Spanish (input_field_definition_id = "spanish_mass")
  - 5:00 PM Youth Mass (input_field_definition_id = "youth_mass")
  ↓ (each can have)
people_event_assignments = Ministers for each specific mass time
  - Lector at 10am: John Doe (calendar_event_id = 10am mass)
  - Lector at 12pm: Maria Garcia (calendar_event_id = 12pm mass)
```

**Why this resolves the unique constraint concern:**
- Constraint: `(master_event_id, input_field_definition_id)` must be unique
- One master_event (Fourth Sunday in Advent)
- Three calendar_events, each with DIFFERENT `input_field_definition_id`
- No constraint violation! ✅

**Examples:**
1. **Fourth Sunday in Advent (Dec 22, 2024):**
   - ONE `master_event` (id: "abc-123")
   - THREE `calendar_events`:
     - 10am English: `{master_event_id: "abc-123", input_field_definition_id: "english_10am", start_datetime: "2024-12-22 10:00"}`
     - 12pm Spanish: `{master_event_id: "abc-123", input_field_definition_id: "spanish_12pm", start_datetime: "2024-12-22 12:00"}`
     - 5pm Youth: `{master_event_id: "abc-123", input_field_definition_id: "youth_5pm", start_datetime: "2024-12-22 17:00"}`

2. **Christmas Day (Dec 25, 2024):**
   - ONE `master_event` (id: "xyz-789")
   - FOUR `calendar_events`:
     - Midnight Mass
     - 8am Mass
     - 10am Mass
     - 12pm Mass

---

**A3: DECISION MADE - people_event_assignments only (REMOVE LEGACY)**

User has decided: **`people_event_assignments` is the ONLY role system.**

**Remove entirely:**
- 4 migration files: `mass_roles`, `mass_role_members`, `mass_roles_templates`, `mass_roles_template_items` tables
- 6 server action files
- 3 API route files
- 11+ UI component files
- Entire `/settings/mass-configuration/` directory tree

**Files to delete (26+):**

**Migrations (4):**
- `supabase/migrations/20251110000005_create_mass_roles_table.sql`
- `supabase/migrations/20251118000001_create_mass_role_members_table.sql`
- `supabase/migrations/20251110000003_create_mass_roles_templates_table.sql`
- `supabase/migrations/20251115000002_create_mass_roles_template_items_table.sql`

**Server actions (6):**
- `src/lib/actions/mass-roles.ts`
- `src/lib/actions/mass-role-members.ts`
- `src/lib/actions/mass-role-template-items.ts`
- `src/lib/actions/mass-role-templates.ts`
- `src/lib/actions/mass-role-members-compat.ts`
- `src/lib/report-builders/mass-role-report.ts`

**API routes (3):**
- `src/app/api/mass-roles/[id]/report/route.ts`
- `src/app/api/mass-roles/[id]/word/route.ts`
- `src/app/api/mass-roles/[id]/pdf/route.ts`

**UI components (11+):**
- `src/components/mass-assignment-people-picker.tsx`
- `src/components/mass-role-template-item-list.tsx`
- `src/components/mass-role-assignments.tsx`
- `src/components/mass-role-template-item.tsx`
- Plus entire `/settings/mass-configuration/` directory (role-definitions, role-patterns, ministry-volunteers)

**References to clean up:**
- `src/lib/types.ts` - Remove mass_role types
- `src/lib/constants.ts` - Remove mass_role constants
- `src/lib/schemas/mass-liturgies.ts` - Remove mass_role_template_id
- `src/lib/onboarding-seeding/parish-seed-data.ts` - Remove mass_role seeding
- `src/lib/actions/mass-scheduling.ts` - Migrate to people_event_assignments
- 7 UI files with role_definitions references

**people_event_assignments (KEEP):**
- ✅ Table exists: `people_event_assignments` (migration `20251222000001`)
- ✅ Actions exist: `src/lib/actions/people-event-assignments.ts`
- ✅ Supports template-level AND occurrence-level via `is_per_calendar_event` flag

---

**A4: DECISION MADE - system_type value changes**

User has decided to change the `system_type` enum values:
- `'mass'` → `'mass-liturgy'`
- `'event'` → `'parish-event'`
- `'special-liturgy'` stays the same

**Rationale:** More descriptive naming that clarifies the semantic distinction between:
- `'mass-liturgy'` - Masses (liturgical celebrations of the Eucharist)
- `'special-liturgy'` - Special liturgical celebrations (sacraments, sacramentals)
- `'parish-event'` - Non-liturgical parish activities

**Files requiring changes:**

**Migration (1):**
- `supabase/migrations/20251031000002_create_event_types_table.sql`
  - Line 13: `system_type TEXT NOT NULL DEFAULT 'event'` → `DEFAULT 'parish-event'`
  - Line 20: `CHECK (system_type IN ('mass', 'special-liturgy', 'event'))` → `CHECK (system_type IN ('mass-liturgy', 'special-liturgy', 'parish-event'))`
  - Line 39: Comment update

**TypeScript types (2):**
- `src/lib/types/event-types.ts`
  - Line 11: `export type SystemType = 'mass' | 'special-liturgy' | 'event'` → `'mass-liturgy' | 'special-liturgy' | 'parish-event'`
- `src/lib/constants/system-types.ts`
  - Line 10: `export const SYSTEM_TYPE_VALUES = ['mass', 'special-liturgy', 'event']` → `['mass-liturgy', 'special-liturgy', 'parish-event']`
  - Lines 20-39: Update SYSTEM_TYPE_METADATA object keys

**Code references (estimated 32 occurrences):**
- Replace `systemType: 'mass'` → `systemType: 'mass-liturgy'` (19 occurrences in 7 files)
- Replace `system_type = 'mass'` → `system_type = 'mass-liturgy'` (19 occurrences in 7 files)
- Replace `systemType: 'event'` → `systemType: 'parish-event'` (13 occurrences in 5 files)
- Replace `system_type = 'event'` → `system_type = 'parish-event'` (13 occurrences in 5 files)

**Impact assessment:**
- **Low-medium impact** - Mostly constant values in code
- **No breaking API changes** - Internal values only
- **Database migration required** - Update existing rows with old values
- **Seeder updates required** - Onboarding seeders use these values

**Migration strategy:**
1. Create new migration to:
   - Update CHECK constraint
   - Update DEFAULT value
   - Update existing rows: `UPDATE event_types SET system_type = 'mass-liturgy' WHERE system_type = 'mass'`
   - Update existing rows: `UPDATE event_types SET system_type = 'parish-event' WHERE system_type = 'event'`
2. Update all TypeScript type definitions
3. Update all code references
4. Update seeder files

### Resolved Concerns

✅ **Terminology alignment:** `event_type` → `liturgy` rename (MAJOR refactor scope documented)

✅ **Role system consolidation:** `people_event_assignments` canonical; 26+ files to remove

✅ **Calendar events architecture CORRECTED:** master_event = liturgical day; calendar_events = individual mass times; unique constraint works perfectly

✅ **Custom fields:** Already implemented via `input_field_definitions`

✅ **system_type values:** Need to change from `'mass'` → `'mass-liturgy'` and `'event'` → `'parish-event'`

### Warnings for Requirements-Agent

**All architectural questions have been resolved.** The concerns below are implementation warnings, not blockers.

⚠️ **SCOPE EXPLOSION WARNING:** The event_type → liturgy rename is a **MASSIVE refactor** touching 455+ occurrences across 76+ files, database schema, routes, and all documentation. This should be tracked as a SEPARATE epic-level task, NOT bundled with the "mass script" feature.

⚠️ **MIGRATION STRATEGY UNDEFINED:** For event_type → liturgy rename:
- How to handle existing data in production?
- Backward compatibility during transition?
- Rollback plan if issues arise?
- Timeline for such a large refactor?

⚠️ **LEGACY CODE REMOVAL RISK:** Deleting 26+ files (mass_roles system) requires:
- Verification that NO production data depends on these tables
- Migration script to convert any existing mass_roles data to people_event_assignments
- Confirmation that mass-configuration UI is unused in production

---

**A5: DECISION MADE - Script format = ROSTER (all mass times for one liturgical day)**

User has decided: **Script shows ALL mass times for ONE liturgical day with role assignments for each.**

**Format example:**
```
FOURTH SUNDAY IN ADVENT - December 22, 2024

10:00 AM English Mass
├─ Presider: Fr. John Smith
├─ Lector: Jane Doe
└─ Cantor: Bob Johnson

12:00 PM Spanish Mass
├─ Presider: Fr. Miguel Rodriguez
├─ Lector: Maria Garcia
└─ Cantor: Luis Martinez

5:00 PM Youth Mass
├─ Presider: Fr. John Smith
├─ Lector: Sarah Williams
└─ Cantor: Emily Chen
```

**Rationale:** Presiders and parish staff need to see ALL masses for a liturgical day at once to:
- Coordinate assignments across multiple mass times
- Identify coverage gaps (missing lector at 12pm?)
- Plan for presiders serving multiple masses
- Print one comprehensive script for the day

**Implementation notes:**
- Script is generated per `master_event` (liturgical day)
- Iterates through all `calendar_events` for that master_event
- For each calendar_event, fetches `people_event_assignments` via `calendar_event_id`
- Displays time, language/type (from `input_field_definition.name`), and role assignments

### Key Decisions Made

✅ **DECISION 1:** Rename `event_type` → `liturgy` throughout application (455+ occurrences, 76+ files)

✅ **DECISION 2:** Remove all `mass_roles` legacy code (26+ files, 4 tables, entire settings UI section)

✅ **DECISION 3:** Use `people_event_assignments` exclusively for ALL role assignments

✅ **DECISION 4:** Change system_type values: `'mass'` → `'mass-liturgy'`, `'event'` → `'parish-event'`

✅ **DECISION 5:** Script format = ROSTER (shows all mass times for one liturgical day with role assignments)

✅ **ARCHITECTURE CLARIFIED:** master_event = liturgical day (e.g., "Fourth Sunday in Advent"); calendar_events = individual mass times (10am, 12pm, 5pm); unique constraint works perfectly as-is

---

## Status: Ready for Requirements

**ALL QUESTIONS RESOLVED** ✅

The devils-advocate-agent review is complete. All architectural ambiguities have been clarified, and critical decisions have been made by the user. This document is ready for hand-off to requirements-agent.

### Summary of All Decisions

**DECISION 1: event_type → liturgy rename (EPIC-LEVEL TASK)**
- Rename `event_type` to `liturgy` throughout entire application
- 455+ occurrences across 76+ files
- Database tables, columns, types, routes, documentation
- **⚠️ RECOMMENDATION:** Track as separate epic, NOT bundled with mass script feature
- Timeline: Months of work
- See Decision 1 section above for complete scope

**DECISION 2: Remove mass_roles legacy system (26+ files)**
- Delete 4 migration files: `mass_roles`, `mass_role_members`, `mass_roles_templates`, `mass_roles_template_items`
- Delete 6 server action files
- Delete 3 API route files
- Delete 11+ UI component files + entire `/settings/mass-configuration/` directory
- Requires migration script to convert existing data to `people_event_assignments`
- See Decision 2 section above for complete file list

**DECISION 3: people_event_assignments is canonical**
- ALL role assignments use `people_event_assignments` table exclusively
- Supports template-level (presider for all masses) AND occurrence-level (lector for 10am mass) via `is_per_calendar_event` flag
- Table exists: migration `20251222000001`
- Actions exist: `src/lib/actions/people-event-assignments.ts`

**DECISION 4: system_type value changes**
- `'mass'` → `'mass-liturgy'`
- `'event'` → `'parish-event'`
- `'special-liturgy'` stays the same
- Requires migration to update constraint + existing data
- 32 code occurrences to update
- See Decision 4 section above for complete impact analysis

**DECISION 5: Script format = ROSTER**
- Script shows ALL mass times for ONE liturgical day
- Each mass time displays its role assignments
- Generated per `master_event` (liturgical day)
- See Decision 5 section above for format example and implementation notes

### Architecture Clarity Achieved

**Corrected understanding of data model:**
```
liturgy (event_type renamed, system_type = 'mass-liturgy')
  ↓ (defines structure via input_field_definitions)
master_event = LITURGICAL DAY
  ↓ (has multiple calendar_events)
calendar_events = INDIVIDUAL MASS TIMES
  ↓ (each has people_event_assignments)
people_event_assignments = MINISTERS PER MASS TIME
```

**Examples:**
- master_event: "Fourth Sunday in Advent" (Dec 22, 2024)
- calendar_events: 10am English, 12pm Spanish, 5pm Youth Mass
- people_event_assignments: Lector for 10am = Jane Doe, Lector for 12pm = Maria Garcia

**Unique constraint resolution:**
- Constraint `(master_event_id, input_field_definition_id)` works perfectly
- Each mass time = different `input_field_definition_id`
- No schema changes needed ✅

### Critical Warnings for Requirements-Agent

⚠️ **SCOPE EXPLOSION:** The event_type → liturgy rename is a **SEPARATE EPIC-LEVEL TASK** that should NOT be bundled with the mass script feature. Recommend splitting into:
1. **Epic 1:** event_type → liturgy rename (months)
2. **Feature:** Mass script generation (weeks)

⚠️ **MIGRATION STRATEGY REQUIRED:** Before removing mass_roles system:
- Verify no production data depends on these tables
- Create migration to convert existing mass_roles data to people_event_assignments
- Confirm mass-configuration UI is unused in production

⚠️ **TIMELINE DEPENDENCY:** Should mass script feature wait for:
- event_type → liturgy rename completion?
- system_type value changes?
- mass_roles removal?

Or implement with current naming and refactor later?

### Next Steps for Requirements-Agent

1. **Read this entire brainstorming document** - All context is here
2. **Decide on timeline/sequencing:**
   - Do event_type → liturgy rename first (epic)?
   - Do mass script feature with current naming, refactor later?
   - Do both in parallel?
3. **Create technical requirements** for:
   - system_type value changes (if doing first)
   - mass_roles removal (if doing first)
   - Mass script roster generation (core feature)
4. **Document database schema changes**
5. **Specify UI/UX requirements** for script generation
6. **Define API endpoints** for script export (PDF/Word/Text)

---
