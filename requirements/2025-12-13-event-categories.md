# Event Categories

**Created:** 2025-12-13
**Status:** IMPLEMENTED
**Agent:** brainstorming-agent → requirements-agent → developer-agent
**Implemented:** 2025-12-14

## Feature Overview

Introduce clear categorization for parish activities to improve navigation and reduce user confusion when viewing different types of events together in lists.

## Problem Statement

Parish staff are confused when fundamentally different types of activities appear together in the same lists. A Sunday Mass, a Wedding, and a Parish Picnic are all parish "events" but serve very different purposes and require different workflows. The system needs categorization that matches how parish staff naturally think about these activities.

## User Stories

- As a parish staff member, I want to see Masses, Special Liturgies, Sacraments, and Events in separate navigation sections so that I can quickly find the type of activity I'm looking for.
- As a parish administrator, I want to configure Special Liturgies (like Easter Vigil) and Sacraments (like Weddings) separately from general parish events so that each has appropriate templates and workflows.
- As a liturgical coordinator, I want the sidebar to show individual Special Liturgy types (Easter Vigil, Holy Thursday) so that I can navigate directly to the specific liturgy I'm planning.
- As a parish staff member, I want standalone events (like Zumba or Parish Picnic) to be clearly separated from liturgical celebrations so that I don't confuse operational events with sacramental activities.

## Success Criteria

What does "done" look like?
- [ ] Four distinct categories exist: Mass, Special Liturgy, Sacrament, and Event
- [ ] Sidebar navigation clearly separates these categories with appropriate icons
- [ ] Special Liturgies and Sacraments show expanded lists of individual types in sidebar
- [ ] Masses and Events show as single links (no expansion)
- [ ] Users can configure Special Liturgies and Sacraments through separate admin pages
- [ ] Standalone events (Zumba, Parish Picnic) are clearly distinct from liturgical events
- [ ] All category labels are bilingual (English/Spanish)

## Scope

### In Scope (MVP)

**FINAL MODEL**

### Tables

| Table | Stores | Ministers | Calendar |
|-------|--------|-----------|----------|
| `masses` | Regular masses + Special liturgies | Yes (via scheduling apparatus) | Yes |
| `master_events` | Sacrament containers (Wedding, Funeral) | Yes (manual per-event) | No |
| `calendar_events` | Scheduled items (rehearsal, ceremony, Zumba) | No | Yes |

### Categories

| Category | Table(s) | Sidebar | Ministers |
|----------|----------|---------|-----------|
| **Mass** | `masses` | Single link | Yes (scheduled) |
| **Special Liturgy** | `masses` (with type flag) | Expanded (show each type) | Yes (scheduled) |
| **Sacrament** | `master_events` → `calendar_events` | Expanded (show each type) | Yes on event (manual) |
| **Event** | `calendar_events` (standalone) | Single link | No |

### Examples

| Type | Category | Table(s) | Sidebar |
|------|----------|----------|---------|
| Sunday Mass | Mass | `masses` | Single link |
| Daily Mass | Mass | `masses` | Single link |
| Easter Vigil | Special Liturgy | `masses` (flagged) | Expanded |
| Holy Thursday | Special Liturgy | `masses` (flagged) | Expanded |
| Ash Wednesday | Special Liturgy | `masses` (flagged) | Expanded |
| Wedding | Sacrament | `master_events` → `calendar_events` | Expanded |
| Funeral | Sacrament | `master_events` → `calendar_events` | Expanded |
| Baptism | Sacrament | `master_events` → `calendar_events` | Expanded |
| Quinceañera | Sacrament | `master_events` → `calendar_events` | Expanded |
| Zumba | Event | `calendar_events` (standalone) | Single link |
| Parish Picnic | Event | `calendar_events` (standalone) | Single link |

### Sidebar Structure
```
Masses (single link)

Special Liturgies (expanded)
├── Easter Vigil
├── Holy Thursday
└── Ash Wednesday

Sacraments (expanded)
├── Wedding
├── Funeral
├── Baptism
└── Quinceañera

Events (single link)
```

### Minister Assignment

- **`masses`**: Ministers assigned through scheduling apparatus (systematic rotation)
- **`master_events`**: Ministers assigned manually per-event (Fr. Smith for Susan & Bill's Wedding)
- **`calendar_events`**: NO ministers (they inherit from parent event, or standalone events like Zumba don't need ministers)

### What Shows on Calendar

- All `masses` (regular + special liturgies)
- All `calendar_events` (sacrament sub-events + standalone events)
- NOT `master_events` directly (they are containers, their calendar_events show on calendar)

**Example - Susan & Bill's Wedding:**
- Wedding (master_event) → Fr. Smith assigned as presider, does NOT show on calendar directly
  - Rehearsal (calendar_event) → June 14, 6pm → Shows on calendar
  - Ceremony (calendar_event) → June 15, 2pm → Shows on calendar

### Icons & Translations

- Masses / Misas: `BookOpen` icon
- Special Liturgies / Liturgias Especiales: `Star` icon
- Sacraments / Sacramentos: `Church` icon
- Events / Eventos: `CalendarDays` icon

### Admin Areas

- `/settings/special-liturgies` → manages special liturgy types (stored in masses table with flag)
- `/settings/sacraments` → manages sacrament event types
- Masses managed through existing Masses module settings
- Events don't need a settings page (created directly as calendar_events)

### Out of Scope (Future)

- Custom categorization beyond the four core categories
- User-defined category creation
- Category-specific permissions (beyond existing role-based access)
- Migration of existing event type data (will be handled by requirements-agent)
- Advanced filtering by category across all modules

## Key User Flows

### Primary Flow: Navigating to a Specific Sacrament Instance

1. User clicks "Sacraments" in sidebar
2. Sidebar expands to show: Wedding, Funeral, Baptism, Quinceañera
3. User clicks "Wedding"
4. System navigates to `/events/wedding` (shows list of all wedding instances)
5. User sees list of weddings: "John & Jane Smith", "Maria & Carlos Rodriguez"
6. User clicks on a specific wedding
7. System shows that wedding's details, script, participants, etc.

### Alternative Flow: Creating a Standalone Event

1. User clicks "Events" in sidebar
2. System navigates to `/calendar-events` (shows list of standalone events)
3. User clicks "Create New Event"
4. User enters event details (name, date, description) - NO parent event linkage
5. System saves event directly to `calendar_events` table as standalone
6. System redirects to event view page

### Alternative Flow: Configuring a Special Liturgy Type

1. User navigates to `/settings/special-liturgies`
2. System shows list of Special Liturgy types (Easter Vigil, Holy Thursday, Ash Wednesday)
3. User clicks "Create New Special Liturgy Type"
4. User configures: name, custom fields, script template, translations
5. System saves to special liturgy configuration (stored in `masses` table with flag)
6. System updates sidebar to include new type under "Special Liturgies"

### Alternative Flow: Viewing Sunday Mass Schedule

1. User clicks "Masses" in sidebar
2. System navigates to `/masses` (existing module)
3. User sees list of all masses (Sunday, Daily, Special Liturgies)
4. This flow is unchanged - Masses module handles both regular and special liturgies

## Integration Points

### Existing Features This Touches

- **Sidebar Navigation** (`src/components/main-sidebar.tsx`) - Major refactor needed to support:
  - Four top-level categories
  - Expandable sections for Special Liturgies and Sacraments
  - Dynamic loading of types within expanded sections

- **Masses Module** (`src/app/(main)/masses/`) - Enhancement needed:
  - Add flag/field to distinguish special liturgies from regular masses
  - Sidebar integration to show special liturgy types as expandable list
  - Maintain existing scheduling apparatus for ministers

- **Events Module** (currently occasions) - Major refactor:
  - Use `master_events` table for sacrament containers
  - Link to `calendar_events` for scheduled items (rehearsals, ceremonies)
  - Manual minister assignment per event
  - Sacrament instances don't show on calendar directly (their calendar_events do)

- **Calendar Events Module** (new) - Create new module:
  - Supports both standalone events (Zumba, Parish Picnic) and sacrament sub-events
  - No minister assignment (inherits from parent event or not needed)
  - Shows on calendar
  - May link to parent `master_event` or be standalone

### Existing Components That Might Be Reused

- **ModuleViewContainer** - Already used for viewing individual records
- **SearchCard** - Filter/search pattern for list pages
- **DataTable** - List display for events
- **FormField** - Input patterns for admin configuration
- **Sidebar components** - Expandable navigation pattern (may need new component)

### Existing Patterns to Follow

- **8-file module structure** - Special Liturgies and Sacraments settings pages follow standard pattern
- **Bilingual implementation** - All labels use `.en`/`.es` pattern
- **WithRelations pattern** - Fetch master_events with related calendar_events
- **Constants pattern** - Category values stored in constants file

## Category Details Reference

| Category | Has events? | Tables | Sidebar | Minister Assignment | Shows on Calendar |
|----------|-------------|--------|---------|---------------------|-------------------|
| **Mass** | No | `masses` | Single link | Scheduled (systematic) | Yes |
| **Special Liturgy** | No | `masses` (flagged) | Expanded | Scheduled (systematic) | Yes |
| **Sacrament** | Yes | `master_events` → `calendar_events` | Expanded | Manual per-event | Via calendar_events |
| **Event** | No | `calendar_events` (standalone) | Single link | None | Yes |

**Key Design Rules:**
- Ministers are assigned at the `masses` level (scheduled) or `master_events` level (manual), never at `calendar_events` level
- Calendar shows `masses` and `calendar_events`, never `master_events` directly
- `master_events` are containers for sacraments with manual minister assignment
- `calendar_events` can be linked to parent `master_events` or standalone

---

## TECHNICAL REQUIREMENTS
(Added by requirements-agent)

### Current Architecture Analysis

**What Exists Today:**

1. **Database Tables:**
   - `masses` - Stores regular and special masses with `presider_id`, `homilist_id`, `event_type_id` (nullable), `event_id` references
   - `event_types` - Stores user-defined event types with `category` field (CHECK constraint: 'sacrament' | 'mass' | 'special_liturgy' | 'event')
   - `dynamic_events` - Stores event instances with `event_type_id`, `field_values` JSONB
   - `occasions` - Stores date/time/location entries with `event_id` FK to `dynamic_events`, `is_primary` flag
   - NO `master_events` table exists
   - NO `calendar_events` table exists

2. **Sidebar Navigation:**
   - `src/components/main-sidebar.tsx` already groups event types by category
   - Categories already display with icons (Church, BookOpen, Star, CalendarDays)
   - Existing pattern: CollapsibleNavSection with per-event-type expansion
   - Translation keys already exist: `event_type.category.{sacrament|mass|special_liturgy|event}`

3. **Minister Assignment:**
   - `masses` table has direct FK columns: `presider_id`, `homilist_id` (references `people` table)
   - NO minister fields exist on `dynamic_events` table
   - NO junction table for event ministers

4. **Current Routes:**
   - `/masses` - Masses module (existing)
   - `/events` - Dynamic events module (existing, uses `dynamic_events` table)
   - `/events/[event_type_id]/[id]` - Individual event view
   - NO `/calendar-events` route exists
   - NO `/special-liturgies` route exists

### Database Schema Changes

**MANDATORY REQUIREMENT:** Complete table rename throughout the entire codebase.

The EXISTING system has:
- `dynamic_events` table (event instances) → MUST BE RENAMED to `master_events`
- `occasions` table (sub-events with date/time/location) → MUST BE RENAMED to `calendar_events`

**All references to old names MUST be removed from:**
- Database migrations
- TypeScript types and interfaces
- Server action files
- Component files
- Import statements
- Documentation

#### Required Migration Strategy

**MANDATORY: Complete Table Rename**

This is NOT optional. The old table names `dynamic_events` and `occasions` will be completely replaced with `master_events` and `calendar_events` throughout the entire application.

**Migration Steps:**

MIGRATION 1 - Add minister columns to dynamic_events table:
```sql
-- File: supabase/migrations/YYYYMMDD_add_minister_columns_to_dynamic_events.sql

ALTER TABLE dynamic_events
  ADD COLUMN presider_id UUID REFERENCES people(id) ON DELETE SET NULL,
  ADD COLUMN homilist_id UUID REFERENCES people(id) ON DELETE SET NULL;

CREATE INDEX idx_dynamic_events_presider_id ON dynamic_events(presider_id);
CREATE INDEX idx_dynamic_events_homilist_id ON dynamic_events(homilist_id);

COMMENT ON COLUMN dynamic_events.presider_id IS 'Presider assigned manually for this sacrament event';
COMMENT ON COLUMN dynamic_events.homilist_id IS 'Homilist assigned manually for this sacrament event';
```

MIGRATION 2 - Rename dynamic_events to master_events:
```sql
-- File: supabase/migrations/YYYYMMDD_rename_dynamic_events_to_master_events.sql

-- Rename table
ALTER TABLE dynamic_events RENAME TO master_events;

-- Rename all indexes
ALTER INDEX idx_dynamic_events_parish_id RENAME TO idx_master_events_parish_id;
ALTER INDEX idx_dynamic_events_event_type_id RENAME TO idx_master_events_event_type_id;
ALTER INDEX idx_dynamic_events_field_values_gin RENAME TO idx_master_events_field_values_gin;
ALTER INDEX idx_dynamic_events_presider_id RENAME TO idx_master_events_presider_id;
ALTER INDEX idx_dynamic_events_homilist_id RENAME TO idx_master_events_homilist_id;

-- Drop old policies (they cannot be renamed)
DROP POLICY dynamic_events_select_policy ON master_events;
DROP POLICY dynamic_events_insert_policy ON master_events;
DROP POLICY dynamic_events_update_policy ON master_events;
DROP POLICY dynamic_events_delete_policy ON master_events;

-- Recreate policies with new names
CREATE POLICY master_events_select_policy ON master_events
  FOR SELECT
  USING (
    parish_id IN (
      SELECT parish_id
      FROM parish_users
      WHERE user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY master_events_insert_policy ON master_events
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

CREATE POLICY master_events_update_policy ON master_events
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

CREATE POLICY master_events_delete_policy ON master_events
  FOR DELETE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Rename trigger
DROP TRIGGER dynamic_events_updated_at ON master_events;
CREATE TRIGGER master_events_updated_at
  BEFORE UPDATE ON master_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update table comment
COMMENT ON TABLE master_events IS 'Master events (sacrament containers) with JSONB field_values. ON DELETE RESTRICT for event_type_id prevents deletion of event types with existing events.';
```

MIGRATION 3 - Add is_standalone flag to occasions table:
```sql
-- File: supabase/migrations/YYYYMMDD_add_is_standalone_to_occasions.sql

ALTER TABLE occasions
  ADD COLUMN is_standalone BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_occasions_standalone ON occasions(parish_id)
  WHERE is_standalone = true AND deleted_at IS NULL;

COMMENT ON COLUMN occasions.is_standalone IS 'True if this is a standalone event (not linked to a master event)';

-- Make event_id nullable for standalone events
ALTER TABLE occasions ALTER COLUMN event_id DROP NOT NULL;

COMMENT ON COLUMN occasions.event_id IS 'Foreign key to master event (null for standalone events)';
```

MIGRATION 4 - Rename occasions to calendar_events:
```sql
-- File: supabase/migrations/YYYYMMDD_rename_occasions_to_calendar_events.sql

-- Rename table
ALTER TABLE occasions RENAME TO calendar_events;

-- Rename column for clarity
ALTER TABLE calendar_events RENAME COLUMN event_id TO master_event_id;

-- Rename all indexes
ALTER INDEX idx_occasions_event_id RENAME TO idx_calendar_events_master_event_id;
ALTER INDEX idx_occasions_date RENAME TO idx_calendar_events_date;
ALTER INDEX idx_occasions_primary RENAME TO idx_calendar_events_primary;
ALTER INDEX idx_occasions_standalone RENAME TO idx_calendar_events_standalone;

-- Update foreign key constraint name
ALTER TABLE calendar_events
  DROP CONSTRAINT occasions_event_id_fkey,
  ADD CONSTRAINT calendar_events_master_event_id_fkey
    FOREIGN KEY (master_event_id)
    REFERENCES master_events(id)
    ON DELETE CASCADE;

-- Drop old policies
DROP POLICY occasions_select_policy ON calendar_events;
DROP POLICY occasions_insert_policy ON calendar_events;
DROP POLICY occasions_update_policy ON calendar_events;
DROP POLICY occasions_delete_policy ON calendar_events;

-- Recreate policies with new names
CREATE POLICY calendar_events_select_policy ON calendar_events
  FOR SELECT
  USING (
    -- Standalone events: check parish access
    (is_standalone = true AND parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    ))
    OR
    -- Linked events: check master event access
    (is_standalone = false AND master_event_id IN (
      SELECT e.id
      FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND e.deleted_at IS NULL
    ))
    AND deleted_at IS NULL
  );

CREATE POLICY calendar_events_insert_policy ON calendar_events
  FOR INSERT
  WITH CHECK (
    -- Standalone events: check parish permission
    (is_standalone = true AND parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    ))
    OR
    -- Linked events: check master event permission
    (is_standalone = false AND master_event_id IN (
      SELECT e.id
      FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    ))
  );

CREATE POLICY calendar_events_update_policy ON calendar_events
  FOR UPDATE
  USING (
    -- Same logic as select policy
    (is_standalone = true AND parish_id IN (
      SELECT pu.parish_id FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    ))
    OR
    (is_standalone = false AND master_event_id IN (
      SELECT e.id FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    ))
  );

CREATE POLICY calendar_events_delete_policy ON calendar_events
  FOR DELETE
  USING (
    -- Same logic as update policy
    (is_standalone = true AND parish_id IN (
      SELECT pu.parish_id FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    ))
    OR
    (is_standalone = false AND master_event_id IN (
      SELECT e.id FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    ))
  );

-- Update unique constraint comment
COMMENT ON INDEX idx_calendar_events_primary IS 'Ensures only one primary calendar event per master event. Partial unique index excludes deleted events.';
```

MIGRATION 5 - Add parish_id to calendar_events for standalone events:
```sql
-- File: supabase/migrations/YYYYMMDD_add_parish_id_to_calendar_events.sql

-- Standalone events need direct parish_id for access control
ALTER TABLE calendar_events
  ADD COLUMN parish_id UUID REFERENCES parishes(id) ON DELETE CASCADE;

-- Populate parish_id from master_events for existing linked events
UPDATE calendar_events ce
SET parish_id = me.parish_id
FROM master_events me
WHERE ce.master_event_id = me.id
  AND ce.is_standalone = false;

-- Make parish_id NOT NULL after backfill
ALTER TABLE calendar_events ALTER COLUMN parish_id SET NOT NULL;

CREATE INDEX idx_calendar_events_parish_id ON calendar_events(parish_id);

COMMENT ON COLUMN calendar_events.parish_id IS 'Parish ID for access control (duplicated from master event for performance)';
```

#### Complete Codebase Update Requirements

**MANDATORY:** After database migrations complete, ALL code references must be updated:

**1. TypeScript Type Files to Update:**

Files that MUST be renamed:
- `src/lib/types/event-types.ts` → NO CHANGE (EventType stays)
- `src/lib/schemas/dynamic-events.ts` → RENAME to `src/lib/schemas/master-events.ts`

Files that MUST have types renamed:
- `src/lib/types.ts` - Replace ALL occurrences:
  - `DynamicEvent` → `MasterEvent`
  - `DynamicEventWithRelations` → `MasterEventWithRelations`
  - `CreateDynamicEventData` → `CreateMasterEventData`
  - `UpdateDynamicEventData` → `UpdateMasterEventData`
  - `DynamicEventType` → `EventType` (simplify, drop "Dynamic" prefix)
  - `Occasion` → `CalendarEvent`
  - `OccasionWithLocation` → `CalendarEventWithLocation`
  - `CreateOccasionData` → `CreateCalendarEventData`
  - `UpdateOccasionData` → `UpdateCalendarEventData`

**2. Server Action Files to Rename:**

MUST rename files:
- `src/lib/actions/dynamic-events.ts` → `src/lib/actions/master-events.ts`
- `src/lib/actions/occasions.ts` → `src/lib/actions/calendar-events.ts`

MUST update function names inside files:
- `getDynamicEvents()` → `getMasterEvents()`
- `getDynamicEventById()` → `getMasterEventById()`
- `createDynamicEvent()` → `createMasterEvent()`
- `updateDynamicEvent()` → `updateMasterEvent()`
- `deleteDynamicEvent()` → `deleteMasterEvent()`
- `getOccasions()` → `getCalendarEvents()`
- `getOccasionById()` → `getCalendarEventById()`
- `createOccasion()` → `createCalendarEvent()`
- `updateOccasion()` → `updateCalendarEvent()`
- `deleteOccasion()` → `deleteCalendarEvent()`

MUST update table names in SQL queries:
- Replace `FROM dynamic_events` → `FROM master_events`
- Replace `JOIN dynamic_events` → `JOIN master_events`
- Replace `FROM occasions` → `FROM calendar_events`
- Replace `JOIN occasions` → `JOIN calendar_events`

**3. Component Files to Update:**

Directory that MUST be renamed:
- `src/app/(main)/events/` - Keep name BUT update all internal references

Files that MUST be renamed:
- `dynamic-event-form.tsx` → `master-event-form.tsx`
- `dynamic-event-view-client.tsx` → `master-event-view-client.tsx`
- `dynamic-event-create-client.tsx` → `master-event-create-client.tsx`
- `dynamic-event-edit-client.tsx` → `master-event-edit-client.tsx`

Files that MUST have variable names updated:
- Replace `dynamicEvent` → `masterEvent`
- Replace `occasions` → `calendarEvents`
- Replace `occasion` → `calendarEvent`

**4. Import Statements to Update:**

Find and replace across ENTIRE codebase:
```typescript
// OLD imports
import { DynamicEvent, DynamicEventWithRelations } from '@/lib/types'
import { getDynamicEventById } from '@/lib/actions/dynamic-events'
import { Occasion, OccasionWithLocation } from '@/lib/types'
import { getOccasions } from '@/lib/actions/occasions'

// NEW imports
import { MasterEvent, MasterEventWithRelations } from '@/lib/types'
import { getMasterEventById } from '@/lib/actions/master-events'
import { CalendarEvent, CalendarEventWithLocation } from '@/lib/types'
import { getCalendarEvents } from '@/lib/actions/calendar-events'
```

**5. Database Query Updates:**

ALL server actions that query these tables MUST be updated:
- `src/lib/actions/masses.ts` - NO changes (masses table unchanged)
- `src/lib/actions/master-events.ts` - Update table name from `dynamic_events`
- `src/lib/actions/calendar-events.ts` - Update table name from `occasions`
- `src/lib/actions/event-types.ts` - NO changes (event_types table unchanged)
- ANY other action files that reference these tables

**6. Route Files to Update:**

Routes directory that references renamed types:
- `src/app/(main)/events/[event_type_id]/[id]/page.tsx` - Update type imports
- `src/app/(main)/events/[event_type_id]/create/page.tsx` - Update type imports
- `src/app/(main)/events/[event_type_id]/[id]/edit/page.tsx` - Update type imports
- ALL server pages that fetch master events or calendar events

**7. API Routes to Update:**

Any API route that returns these entities:
- `src/app/api/events/[id]/route.ts` - Update type references
- Any export routes for PDF/Word generation

**8. Search and Replace Checklist:**

Developer MUST perform these global searches and update ALL occurrences:

```bash
# Find all occurrences (use ripgrep or IDE search)
grep -r "DynamicEvent" src/
grep -r "dynamic_events" src/
grep -r "Occasion" src/
grep -r "occasions" src/

# Replace in TypeScript/TSX files
DynamicEvent → MasterEvent
DynamicEventWithRelations → MasterEventWithRelations
CreateDynamicEventData → CreateMasterEventData
UpdateDynamicEventData → UpdateMasterEventData
dynamicEvent → masterEvent (variable names)
dynamic_events → master_events (table name in queries)

Occasion → CalendarEvent
OccasionWithLocation → CalendarEventWithLocation
CreateOccasionData → CreateCalendarEventData
UpdateOccasionData → UpdateCalendarEventData
occasion → calendarEvent (variable names)
occasions → calendarEvents (variable names)
occasions → calendar_events (table name in queries)
```

**9. Documentation Files to Update:**

ALL documentation referencing old names MUST be updated:
- `docs/MODULE_REGISTRY.md` - Update module names
- `docs/DATABASE.md` - Update table names
- `docs/ARCHITECTURE.md` - Update terminology
- `docs/COMPONENT_REGISTRY.md` - Update component names
- Any other docs mentioning dynamic_events or occasions

**10. Test Files to Update:**

IF tests exist for these modules:
- `tests/dynamic-events.spec.ts` → Rename to `tests/master-events.spec.ts`
- `tests/occasions.spec.ts` → Rename to `tests/calendar-events.spec.ts`
- Update all test assertions to use new names

### TypeScript Interface Changes

**MANDATORY: Complete interface rename in `src/lib/types.ts`**

All old interface names MUST be removed. No backward compatibility aliases.

```typescript
// ========================================
// MASTER EVENTS (formerly DynamicEvent)
// ========================================

export interface MasterEvent {
  id: string
  parish_id: string
  event_type_id: string
  field_values: Record<string, any>
  presider_id: string | null  // NEW - Manual minister assignment
  homilist_id: string | null  // NEW - Manual minister assignment
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MasterEventWithRelations extends MasterEvent {
  event_type: EventType
  calendar_events: CalendarEvent[]  // RENAMED from occasions
  presider?: Person | null  // NEW - Resolved presider
  homilist?: Person | null  // NEW - Resolved homilist
  resolved_fields: Record<string, ResolvedFieldValue>
  parish?: ParishInfo
}

export interface CreateMasterEventData {
  field_values: Record<string, any>
  presider_id?: string | null  // NEW
  homilist_id?: string | null  // NEW
  calendar_events?: CreateCalendarEventData[]
}

export interface UpdateMasterEventData {
  field_values?: Record<string, any>
  presider_id?: string | null  // NEW
  homilist_id?: string | null  // NEW
  calendar_events?: (CreateCalendarEventData | UpdateCalendarEventData)[]
}

// ========================================
// CALENDAR EVENTS (formerly Occasion)
// ========================================

export interface CalendarEvent {
  id: string
  master_event_id: string | null  // RENAMED from event_id, nullable for standalone
  parish_id: string  // NEW - For standalone events and RLS
  label: string
  date: string | null
  time: string | null
  location_id: string | null
  is_primary: boolean
  is_standalone: boolean  // NEW - True if standalone event (not linked to master)
  deleted_at: string | null
  created_at: string
}

export interface CalendarEventWithLocation extends CalendarEvent {
  location?: Location | null
  master_event?: MasterEvent | null  // NEW - For linked events, include parent
}

export interface CreateCalendarEventData {
  label: string
  date?: string | null
  time?: string | null
  location_id?: string | null
  is_primary?: boolean
  is_standalone?: boolean  // NEW - For standalone events
  master_event_id?: string | null  // NEW - Nullable for standalone
}

export interface UpdateCalendarEventData extends CreateCalendarEventData {
  id?: string
}

// ========================================
// REMOVE THESE OLD INTERFACES
// ========================================

// DELETE: export interface DynamicEvent { ... }
// DELETE: export interface DynamicEventWithRelations { ... }
// DELETE: export interface CreateDynamicEventData { ... }
// DELETE: export interface UpdateDynamicEventData { ... }
// DELETE: export interface Occasion { ... }
// DELETE: export interface OccasionWithLocation { ... }
// DELETE: export interface CreateOccasionData { ... }
// DELETE: export interface UpdateOccasionData { ... }
```

**File: `src/lib/schemas/master-events.ts` (RENAME from `src/lib/schemas/dynamic-events.ts`)**

Create new Zod schemas with minister validation:

```typescript
import { z } from 'zod'

export const createMasterEventSchema = z.object({
  field_values: z.record(z.any()),
  presider_id: z.string().uuid().nullable().optional(),
  homilist_id: z.string().uuid().nullable().optional(),
  calendar_events: z.array(z.object({
    label: z.string().min(1),
    date: z.string().nullable().optional(),
    time: z.string().nullable().optional(),
    location_id: z.string().uuid().nullable().optional(),
    is_primary: z.boolean().optional(),
  })).optional(),
})

export const updateMasterEventSchema = z.object({
  field_values: z.record(z.any()).optional(),
  presider_id: z.string().uuid().nullable().optional(),
  homilist_id: z.string().uuid().nullable().optional(),
  calendar_events: z.array(z.object({
    id: z.string().uuid().optional(),
    label: z.string().min(1),
    date: z.string().nullable().optional(),
    time: z.string().nullable().optional(),
    location_id: z.string().uuid().nullable().optional(),
    is_primary: z.boolean().optional(),
  })).optional(),
})

export type CreateMasterEventData = z.infer<typeof createMasterEventSchema>
export type UpdateMasterEventData = z.infer<typeof updateMasterEventSchema>
```

**File: `src/lib/schemas/calendar-events.ts` (NEW - standalone event validation)**

```typescript
import { z } from 'zod'

export const createStandaloneCalendarEventSchema = z.object({
  label: z.string().min(1, "Event name is required"),
  date: z.string().nullable().optional(),
  time: z.string().nullable().optional(),
  location_id: z.string().uuid().nullable().optional(),
  is_standalone: z.literal(true),  // MUST be true for standalone
})

export const updateStandaloneCalendarEventSchema = z.object({
  label: z.string().min(1).optional(),
  date: z.string().nullable().optional(),
  time: z.string().nullable().optional(),
  location_id: z.string().uuid().nullable().optional(),
})

export type CreateStandaloneCalendarEventData = z.infer<typeof createStandaloneCalendarEventSchema>
export type UpdateStandaloneCalendarEventData = z.infer<typeof updateStandaloneCalendarEventSchema>
```

**File: `src/lib/types/event-types.ts`**

NO CHANGES - EventTypeCategory already has all 4 categories defined:
```typescript
export type EventTypeCategory = 'sacrament' | 'mass' | 'special_liturgy' | 'event'
```

### Server Action Modifications

**File: `src/lib/actions/master-events.ts` (rename from dynamic-events.ts)**

ADD minister-related operations:

```
FUNCTION assignPresiderToMasterEvent(eventId, personId)
  1. Validate user has permission (admin/staff/ministry-leader)
  2. Validate person exists and is in same parish
  3. Update master_events.presider_id = personId
  4. Revalidate relevant paths
  RETURN updated master event
END FUNCTION

FUNCTION assignHomilisToMasterEvent(eventId, personId)
  Similar to assignPresiderToMasterEvent
END FUNCTION
```

UPDATE existing functions:

```
FUNCTION getMasterEventWithRelations(eventId)
  SELECT master_events with:
    - event_type
    - calendar_events (renamed from occasions)
    - presider (NEW - join people table)
    - homilist (NEW - join people table)
    - resolved_fields
  RETURN MasterEventWithRelations
END FUNCTION
```

**File: `src/lib/actions/calendar-events.ts` (rename from occasions.ts)**

ADD standalone event operations:

```
FUNCTION createStandaloneCalendarEvent(data)
  1. Validate required fields: label, date, time, location_id
  2. Set is_standalone = true
  3. Set master_event_id = null
  4. Insert into calendar_events table
  RETURN created calendar event
END FUNCTION

FUNCTION getStandaloneCalendarEvents(filters)
  SELECT from calendar_events
    WHERE is_standalone = true
    ORDER BY date DESC
  RETURN calendar events array
END FUNCTION
```

UPDATE existing occasion functions to handle both linked and standalone:

```
FUNCTION getCalendarEvents(filters)
  IF filters.standalone = true THEN
    Return only standalone events
  ELSE IF filters.masterEventId provided THEN
    Return events linked to that master event
  ELSE
    Return all calendar events
  END IF
END FUNCTION
```

**File: `src/lib/actions/masses.ts`**

NO CHANGES NEEDED - Masses already have presider/homilist fields and scheduling apparatus.

### Sidebar Navigation Implementation

**File: `src/components/main-sidebar.tsx`**

CURRENT STATE: Already implements category-based grouping with expansion.

NEEDED CHANGES:

1. **Update "Masses" Link:**
   - Change from CollapsibleNavSection to simple SidebarMenuItem (single link)
   - Remove expansion behavior for regular masses

2. **Add "Special Liturgies" Section:**
   - NEW collapsible section
   - Load event types where category = 'special_liturgy'
   - Each special liturgy type gets individual link (no sub-expansion)
   - Link destination: `/masses?event_type_id=[id]` (filter masses by event type)

3. **Update "Sacraments" Section:**
   - ALREADY exists (event types with category = 'sacrament')
   - Keep existing expansion pattern
   - Link destination: `/events/[slug]` (existing)

4. **Add "Events" (Standalone) Link:**
   - NEW single link (no expansion)
   - Link destination: `/calendar-events` (new route)

**Pseudo-code Implementation:**

```
SIDEBAR STRUCTURE:

Section: Application
  - Dashboard (single link)
  - Calendar (single link)
  - Masses (single link) → /masses

Section: Special Liturgies (expandable)
  FOR EACH event_type WHERE category = 'special_liturgy'
    - [Event Type Name] → /masses?event_type_id=[id]
  END FOR

Section: Sacraments (expandable)
  FOR EACH event_type WHERE category = 'sacrament'
    - Collapsible section per event type
      - Our [Type]s → /events/[slug]
      - New [Type] → /events/create?type=[slug]
  END FOR

Section: Events (single link)
  - Events → /calendar-events

Section: Other modules...
  - Groups, Locations, People, etc. (unchanged)
```

**Translation Keys (ALREADY EXIST):**
- `event_type.category.mass` → "Masses" / "Misas"
- `event_type.category.special_liturgy` → "Special Liturgies" / "Liturgias Especiales"
- `event_type.category.sacrament` → "Sacraments" / "Sacramentos"
- `event_type.category.event` → "Events" / "Eventos"

### Route Structure and Module Organization

**Current Routes (NO CHANGES):**
- `/masses` - Existing masses module
- `/events` - Existing events module (uses master_events table after rename)
- `/events/[event_type_id]/[id]` - Individual master event view

**New Routes NEEDED:**
- `/calendar-events` - NEW standalone events list page
- `/calendar-events/create` - NEW create standalone event
- `/calendar-events/[id]` - NEW view standalone event
- `/calendar-events/[id]/edit` - NEW edit standalone event

**Settings Routes NEEDED:**
- `/settings/special-liturgies` - Manage special liturgy event types (filter event_types where category = 'special_liturgy')
- `/settings/sacraments` - Manage sacrament event types (filter event_types where category = 'sacrament')

**Module Structure for `/calendar-events`:**

Follow standard 8-file module pattern:

```
src/app/(main)/calendar-events/
├── page.tsx (server - list page)
├── calendar-events-list-client.tsx (client - SearchCard + DataTable)
├── create/
│   └── page.tsx (server - create page)
├── [id]/
│   ├── page.tsx (server - view page)
│   ├── calendar-event-view-client.tsx (client - view display)
│   └── edit/
│       └── page.tsx (server - edit page)
├── calendar-event-form-wrapper.tsx (client - PageContainer wrapper)
└── calendar-event-form.tsx (client - unified form for create/edit)
```

**Settings Module Structure:**

```
src/app/(main)/settings/special-liturgies/
├── page.tsx (list special liturgy event types)
├── create/page.tsx
├── [id]/edit/page.tsx
└── ... (follow standard event-types pattern)

src/app/(main)/settings/sacraments/
├── page.tsx (list sacrament event types)
├── create/page.tsx
├── [id]/edit/page.tsx
└── ... (follow standard event-types pattern)
```

### Minister Assignment Implementation

**Masses (EXISTING - NO CHANGES):**
- Ministers assigned via mass scheduling apparatus
- Presider/homilist set via `mass_role_instances` junction table
- Rotation managed by `mass_role_members` and scheduling algorithm

**Master Events (NEW - MANUAL ASSIGNMENT):**

Pseudo-code for minister assignment:

```
UI COMPONENT: MasterEventMinisterPicker

FORM FIELDS:
  - Presider (PersonPicker component)
  - Homilist (PersonPicker component - optional)

ON SAVE:
  CALL assignPresiderToMasterEvent(eventId, presiderId)
  IF homilisId provided THEN
    CALL assignHomilisToMasterEvent(eventId, homilisId)
  END IF
END SAVE

DISPLAY:
  Show presider name (person.full_name)
  Show homilist name if assigned
  Show "Edit Ministers" button (admin/staff only)
END DISPLAY
```

**Calendar Events (NO MINISTERS):**
- Calendar events do NOT have minister fields
- If linked to master event, ministers are inherited from parent
- If standalone event (Zumba), no ministers needed

### Calendar Integration Strategy

**Calendar Display Logic:**

```
FUNCTION getCalendarItems(startDate, endDate)
  1. Fetch all masses WHERE event.start_date BETWEEN startDate AND endDate
  2. Fetch all calendar_events WHERE date BETWEEN startDate AND endDate
  3. Combine both arrays
  4. For each item, include:
     - Type indicator (mass | master_event_sub | standalone_event)
     - Category (from event_type.category)
     - Icon (from category)
     - Ministers (if mass or linked to master_event)
  5. Sort by date/time
  RETURN combined calendar items
END FUNCTION
```

**Calendar Item Click Behavior:**

```
ON CLICK calendar item:
  IF item.type = 'mass' THEN
    Navigate to /masses/[id]
  ELSE IF item.type = 'master_event_sub' THEN
    Navigate to /events/[event_type_id]/[master_event_id]
      (show parent master event, not calendar_event directly)
  ELSE IF item.type = 'standalone_event' THEN
    Navigate to /calendar-events/[id]
  END IF
END CLICK
```

**Visual Distinction:**

```
Calendar item styling:
  - Mass: BookOpen icon, default color
  - Special Liturgy Mass: Star icon, highlighted color
  - Sacrament sub-event: Church icon, inherit event type color
  - Standalone event: CalendarDays icon, neutral color
```

### Permissions Model

**Current RLS Policies (UNCHANGED):**
- Parish members can read all entities for their parish
- Admin, Staff, Ministry-Leader can create/update/delete

**New Permissions:**

1. **Master Events (Sacraments):**
   - Same as existing dynamic_events policies
   - Admin, Staff, Ministry-Leader can create/update/delete
   - All parish members can read

2. **Calendar Events:**
   - Standalone events: Same as master events (admin/staff/ministry-leader)
   - Linked events: Inherit access from parent master event

3. **Settings Pages:**
   - `/settings/special-liturgies` - Admin only
   - `/settings/sacraments` - Admin only

**No category-specific permissions needed** - all categories use existing role-based access control.

### Testing Requirements

**Unit Tests:**
- Server actions for master events (with minister assignment)
- Server actions for calendar events (standalone vs linked)
- Minister assignment validation

**Integration Tests:**
- Create master event with ministers
- Create calendar event linked to master event
- Create standalone calendar event
- Filter masses by event type (special liturgies)
- Sidebar navigation rendering (category grouping)

**E2E Tests:**
- Complete sacrament workflow (Wedding)
  1. Create Wedding event type
  2. Create wedding instance
  3. Assign presider
  4. Create calendar events (rehearsal, ceremony)
  5. View on calendar
  6. Navigate to wedding from calendar
- Standalone event workflow
  1. Create standalone event (Zumba)
  2. View on calendar
  3. Edit event

### Documentation Updates

**MODULE_REGISTRY.md:**
- Add master_events module entry
- Add calendar_events module entry
- Update sidebar navigation structure section
- Document category-based organization

**COMPONENT_REGISTRY.md:**
- Add MasterEventMinisterPicker component
- Add CalendarEventForm component

**DATABASE.md:**
- Document master_events table (renamed from dynamic_events)
- Document calendar_events table (renamed from occasions)
- Document is_standalone flag usage
- Document minister columns on master_events

**ARCHITECTURE.md:**
- Update data flow diagrams for master_events → calendar_events relationship
- Document minister assignment patterns (scheduled vs manual)

### Implementation Complexity

**Complexity Rating:** High

**Reason:**
- **Large-scale codebase refactor REQUIRED** - ALL references to `dynamic_events` and `occasions` must be renamed
- **Database table renames** with coordination of foreign keys, indexes, and RLS policies
- **5 separate migrations** required in sequence
- **File renames** across server actions, schemas, components, and tests
- **Import statement updates** across entire codebase
- **Function name changes** in all server actions
- **Variable name updates** in all components
- **TypeScript interface complete replacement** (no backward compatibility)
- **Documentation updates** across all docs files

**Scope of Changes:**

Estimated files that MUST be modified:
- 5 database migration files (new)
- 2 server action files (rename + rewrite)
- 1 schema file (rename + update)
- 1 types file (major interface changes)
- 4+ component files (rename + update)
- 10+ route/page files (import updates)
- 5+ documentation files
- Test files (if they exist)
- **EVERY file** that imports or references these types

**Biggest Risks:**
1. **Breaking Changes** - This is a complete rename with NO backward compatibility
2. **Missed References** - Any file that imports old names will break
3. **Database Migration Coordination** - 5 sequential migrations must run in order
4. **RLS Policy Complexity** - Policies must handle both standalone and linked calendar events
5. **Production Downtime** - Table renames may require brief downtime window

**Mitigation Strategies:**
1. **Pre-migration audit:** Use grep/ripgrep to find ALL occurrences before starting
2. **Phased approach:**
   - Phase 1: Add new columns (non-breaking)
   - Phase 2: Rename tables (breaking - requires code updates)
   - Phase 3: Update all code references
   - Phase 4: Test thoroughly
3. **Branch strategy:** Create feature branch, merge after all changes complete
4. **Rollback plan:** Keep old migration files, document rollback steps
5. **Testing:** Run full test suite after each phase

### Dependencies and Blockers

**Dependencies:**
- Database migration must complete before any UI changes
- Minister assignment UI depends on PersonPicker component (ALREADY EXISTS)
- Calendar integration depends on existing calendar module

**No Blockers Identified**

All required infrastructure exists:
- Event types with category field ✓
- Sidebar category grouping ✓
- Translation keys ✓
- PersonPicker component ✓
- Standard module patterns ✓

### Documentation Inconsistencies Found

**None Found**

The existing codebase is well-documented and consistent with established patterns. The vision document's proposed model aligns well with existing architecture (event_types with category field already exists).

**Observation:** The vision document proposes creating entirely new `master_events` and `calendar_events` tables, but the system ALREADY has `dynamic_events` and `occasions` that serve these exact purposes. The vision can be achieved by enhancing existing tables rather than creating new ones.

### Migration Strategy - Detailed Steps

**MANDATORY: Complete table rename required**

This is NOT a phased optional approach. ALL steps MUST be completed.

**Phase 1: Database Migrations (MUST complete in order)**

1. **MIGRATION 1:** Add minister columns to dynamic_events
   - Status: Adds new columns (non-breaking)
   - Allows code to start using minister fields

2. **MIGRATION 2:** Rename dynamic_events → master_events
   - Status: BREAKING CHANGE
   - ALL code must be updated before deployment
   - Renames table, indexes, policies, triggers

3. **MIGRATION 3:** Add is_standalone flag to occasions
   - Status: Adds new column (non-breaking)
   - Adds index for standalone events
   - Makes event_id nullable

4. **MIGRATION 4:** Rename occasions → calendar_events
   - Status: BREAKING CHANGE
   - ALL code must be updated before deployment
   - Renames table, column (event_id → master_event_id), indexes, policies

5. **MIGRATION 5:** Add parish_id to calendar_events
   - Status: Adds new column with backfill
   - Required for standalone event RLS
   - Backfills from master_events for existing linked events

**Phase 2: Codebase Refactor (MUST complete all)**

**Step 1 - TypeScript Types:**
- Rename interfaces in `src/lib/types.ts`
- Delete old interfaces (DynamicEvent, Occasion)
- Update all export statements

**Step 2 - Server Actions:**
- Rename `dynamic-events.ts` → `master-events.ts`
- Rename `occasions.ts` → `calendar-events.ts`
- Update ALL function names
- Update ALL SQL queries (table names)

**Step 3 - Schemas:**
- Rename `schemas/dynamic-events.ts` → `schemas/master-events.ts`
- Create new `schemas/calendar-events.ts`
- Update Zod validations

**Step 4 - Components:**
- Rename component files (dynamic-event-*.tsx → master-event-*.tsx)
- Update ALL variable names (dynamicEvent → masterEvent)
- Update ALL import statements

**Step 5 - Routes:**
- Update ALL page.tsx files that import these types
- Update ALL server action imports
- Keep URL routes unchanged (/events/...)

**Step 6 - Global Search/Replace:**
Run these replacements across ENTIRE src/ directory:
```bash
# Type names
DynamicEvent → MasterEvent
DynamicEventWithRelations → MasterEventWithRelations
Occasion → CalendarEvent
OccasionWithLocation → CalendarEventWithLocation

# Variable names
dynamicEvent → masterEvent
dynamicEvents → masterEvents
occasion → calendarEvent
occasions → calendarEvents

# Table names in SQL
dynamic_events → master_events
occasions → calendar_events
```

**Step 7 - Documentation:**
- Update MODULE_REGISTRY.md
- Update DATABASE.md
- Update ARCHITECTURE.md
- Update COMPONENT_REGISTRY.md

**Phase 3: Testing & Validation**

1. **Build Test:** `npm run build` MUST succeed
2. **Type Check:** `npm run type-check` MUST pass
3. **Linting:** `npm run lint` MUST pass
4. **Database Reset:** `npm run db:fresh` MUST succeed
5. **Manual Testing:** Create/edit master events and calendar events
6. **Minister Assignment:** Test presider/homilist assignment

**Phase 4: Deployment**

1. Create feature branch for all changes
2. Run full test suite
3. Create pull request with comprehensive changelist
4. Code review focusing on missed references
5. Merge to main
6. Deploy migrations in sequence
7. Monitor for errors

**CRITICAL: There is NO partial implementation path. All phases must be completed.**

### Answers to Open Questions from Vision Document

1. **Masses Table Enhancement:** Use existing `event_type_id` field (nullable FK). Special liturgies are masses linked to event types with category='special_liturgy'.

2. **Special Liturgy Configuration:** Use existing `event_types` table filtered by category='special_liturgy'. No separate table needed.

3. **Master Events → Calendar Events Relationship:** `occasions.event_id` becomes nullable `calendar_events.master_event_id`. Add `is_standalone` flag to distinguish.

4. **Sidebar Implementation:** Pre-load event types on page load (ALREADY DONE). Categories already group dynamically.

5. **Navigation Routes:**
   - Masses: `/masses` (existing)
   - Special Liturgies: `/masses?event_type_id=[id]` (filter existing masses)
   - Sacraments: `/events/[slug]` (existing)
   - Standalone Events: `/calendar-events` (new module)

6. **Minister Inheritance:** Calendar events do NOT have minister fields. They reference parent master_event for minister display. No override capability.

7. **Calendar Display:** Use type indicator and category icon. Click navigates to appropriate module (masses, events, or calendar-events).

8. **Permissions:** No category-specific permissions. All use existing role-based access (admin, staff, ministry-leader).

9. **Search & Filtering:** Existing search patterns apply. Category can be filter option in advanced search.

10. **Migration Strategy:** See "Migration Strategy - Detailed Steps" above. Enhance existing tables, optionally rename for clarity.

### Next Steps

Status updated to "Ready for Development"

**CRITICAL: This is a large-scale refactoring project, not a simple feature addition.**

**Required Implementation Order:**

**ALL PHASES MUST BE COMPLETED IN A SINGLE FEATURE BRANCH**

Do NOT attempt to implement this incrementally across multiple deployments. The table renames are breaking changes that require ALL code to be updated simultaneously.

**Phase 1: Pre-Implementation Audit (developer-agent)**
1. Run global search to find ALL references to:
   - `DynamicEvent` (type name)
   - `dynamic_events` (table name)
   - `Occasion` (type name)
   - `occasions` (table name)
2. Create comprehensive list of files that need updates
3. Estimate total scope (likely 50+ files)

**Phase 2: Database Migrations (developer-agent)**
1. Create all 5 migration files (see Migration Strategy section)
2. Test migrations in sequence on local database
3. Document rollback procedure

**Phase 3: Complete Codebase Refactor (developer-agent)**
1. TypeScript types - Rename all interfaces
2. Server actions - Rename files and functions
3. Schemas - Rename and update validations
4. Components - Rename files and update variables
5. Routes - Update all imports
6. Global search/replace across codebase
7. Run `npm run build` after EACH step to catch errors early

**Phase 4: New Features (developer-agent)**
1. Implement minister assignment UI for master events
2. Create standalone calendar events module (/calendar-events)
3. Update sidebar navigation (category reorganization)
4. Create settings pages (/settings/special-liturgies, /settings/sacraments)
5. Update calendar integration to combine masses + calendar_events

**Phase 5: Testing (test-writer → test-runner-debugger)**
1. Update existing tests (rename references)
2. Write new tests for minister assignment
3. Write new tests for standalone events
4. Write E2E tests for complete workflows
5. Run FULL test suite and fix all failures

**Phase 6: Documentation (project-documentation-writer)**
1. Update all docs with new terminology
2. Add migration guide for future reference
3. Document new patterns (standalone events, minister assignment)

**Phase 7: Code Review & Deployment (code-review-agent → release-agent)**
1. Comprehensive code review (focus on missed references)
2. Test on staging environment
3. Create deployment plan with rollback strategy
4. Deploy to production during low-traffic window
5. Monitor for errors post-deployment

**WARNINGS:**

⚠️ **This cannot be done incrementally** - The table renames require atomic deployment of all changes

⚠️ **Estimate 40-80 hours of development time** - This is a major refactoring project

⚠️ **High risk of missed references** - Any file that imports old names will break at runtime

⚠️ **Breaking changes** - No backward compatibility, old code WILL NOT WORK after migrations run

**BEFORE STARTING:** User should confirm they understand the scope and are ready to commit to completing all phases in a single feature branch.

**Hand off to developer-agent ONLY after user confirms readiness for large-scale refactor.**
