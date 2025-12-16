# Unified Event Data Model

**Created:** 2025-12-16
**Status:** Vision complete - ready for requirements
**Agent:** brainstorming-agent
**Greenfield:** Yes - direct overwrites, no backwards compatibility needed

## Feature Overview

A unified 3-level event data model that consolidates all event categories (Masses, Special Liturgies, Sacraments, Events) into a single coherent hierarchy, eliminating data model fragmentation while preserving the unique characteristics of each category through a system_type enum field.

**Key Design Principles:**

1. **calendar_events are simple** - Only store date/time, location, and field_name reference. NO title, NO roles, NO scripts.
2. **Input types define calendar_events** - Event types use input_type: "calendar_event" to automatically create calendar_event records.
3. **Roles and scripts belong to master_events** - Central place for all event data and logic.
4. **Computed titles** - Calendar displays compute titles from master_event.title + field_name.
5. **3-table structure** - event_types, master_events, calendar_events (no system_types table needed).

## Problem Statement

Currently, the application has fragmented event data models:
- The `masses` table exists as a separate entity
- Event types are managed independently without a clear hierarchy
- There's no unified way to handle recurring patterns, role scheduling, and scripts across different event categories
- The relationship between event types, instances, and calendar entries is unclear

This fragmentation makes the system harder to understand, maintain, and extend. Users and developers must learn multiple patterns for conceptually similar functionality.

## User Stories

- As a **Parish Administrator**, I want to manage all parish activities through a unified system so that I don't have to learn different interfaces for Masses vs Events vs Sacraments
- As a **Liturgical Director**, I want to schedule roles for both liturgical ministers and event volunteers using the same system so that role management is consistent
- As a **Parish Staff member**, I want to create recurring events (weekly Masses, monthly meetings) with a clear understanding of how the template relates to instances and calendar entries
- As a **Developer**, I want a self-documenting database schema with clear foreign key relationships so that I can understand the data model without extensive documentation
- As a **Ministry Leader**, I want to see all events that need role assignments in one unified view so that I can efficiently manage volunteer scheduling

## Success Criteria

What does "done" look like?
- [ ] Four system types are clearly defined as enum values with CHECK constraint enforcement (mass, special-liturgy, sacrament, event)
- [ ] System type metadata (names, icons) stored in application constants
- [ ] Event types can be created for any system type through the UI
- [ ] Master events and calendar events follow a clear parent-child relationship with non-nullable foreign keys
- [ ] Role scheduling works consistently across all four system types
- [ ] The existing `masses` table is successfully migrated to the new unified structure without data loss
- [ ] All event categories support script generation
- [ ] Database schema is intelligible and self-documenting with only 3 core tables
- [ ] Users can create and manage events without understanding the technical hierarchy

## Scope

### In Scope (MVP)

**Database Structure:**
- `event_types` table with system_type enum field ('mass' | 'special-liturgy' | 'sacrament' | 'event')
- `master_events` table linked to event_types
- `calendar_events` table linked to master_events (non-nullable FK)
- Migration strategy from existing `masses` table

**Core Functionality:**
- System types as enum values with metadata in application constants
- Event type creation for any system type (mass, special-liturgy, sacrament, event)
- Master event instances with role assignments
- Calendar event entries tied to master events
- Unified role scheduling system across all types

**Feature Parity:**
- Role scheduling for all system types (ministers and volunteers)
- Script generation for all system types
- Custom fields per event type
- Multiple calendar events per master event (e.g., Wedding Rehearsal + Ceremony)

### Out of Scope (Future)

- Advanced recurring event patterns (handled in separate feature)
- Event type templates marketplace or sharing
- Automated role assignment algorithms
- Integration with external calendar systems beyond .ics export
- Undo/rollback for migrations from old data model
- Event type versioning or revision history

## Key User Flows

### Primary Flow: Creating a New Event Instance

1. User navigates to event management section
2. System shows event types organized by system type (Masses, Special Liturgies, Sacraments, Events)
3. User selects an event type (e.g., "Wedding" under Sacraments)
4. User creates a master event (e.g., "John & Jane's Wedding")
5. User adds calendar events to the master event:
   - Rehearsal: June 14, 2025, 6:00 PM
   - Ceremony: June 15, 2025, 2:00 PM
6. User assigns roles to people for this master event (Presider, Best Man, Maid of Honor)
7. System generates scripts based on event type template and role assignments
8. Calendar events appear on parish calendar with proper categorization

### Alternative Flow: Creating a Recurring Event Series

1. User selects "Sunday Mass" event type (under Masses system type)
2. User creates recurring master events (one per occurrence)
3. Each master event has one calendar event
4. Roles can be assigned per master event or in bulk across series

### Edge Cases to Consider

**Multiple Calendar Events per Master Event:**
- Wedding: Rehearsal + Ceremony
- Confirmation: Practice Session + Ceremony
- Funeral: Wake + Funeral Mass + Burial

**Single Calendar Event per Master Event:**
- Most Masses
- Most Events (Zumba class, Bible Study session)
- Simple Sacraments (individual Baptism)

**Zero Calendar Events Initially:**
- Master event created but dates not yet finalized
- Calendar events added later when scheduled
- System handles gracefully (shows as "Unscheduled")

**Migration Edge Cases:**
- Existing masses with complex role assignments
- Masses with custom scripts
- Masses linked to other records (readings, announcements, etc.)

## The 3-Level Hierarchy

### System Type Enum (Foundation)

**Purpose:** First-class categorization of all parish activities stored as an enum field

**Valid Values:**
- `'mass'` - Masses (Misas)
- `'special-liturgy'` - Special Liturgies (Liturgias Especiales)
- `'sacrament'` - Sacraments (Sacramentos)
- `'event'` - Events (Eventos)

**Database Enforcement:**
- CHECK constraint on event_types.system_type column
- Ensures only valid values are stored

**TypeScript Type:**
```typescript
type SystemType = 'mass' | 'special-liturgy' | 'sacrament' | 'event'
```

**System Type Metadata (Application Constants):**

| system_type | name_en | name_es | icon |
|-------------|---------|---------|------|
| mass | Masses | Misas | BookOpen |
| special-liturgy | Special Liturgies | Liturgias Especiales | Star |
| sacrament | Sacraments | Sacramentos | Church |
| event | Events | Eventos | CalendarDays |

**Why Enum Instead of Table?**
- Simpler structure: 3 tables instead of 4
- These four categories are stable and unlikely to change
- No need for relational complexity when values are fixed
- Easier to query and filter (no join required)
- Metadata (names, icons) stored in application constants, not database
- Still preserves theological distinctions and UI organization

**Application Constants Example:**
```typescript
// src/lib/constants/system-types.ts
export const SYSTEM_TYPE_METADATA = {
  mass: {
    slug: 'mass',
    name_en: 'Masses',
    name_es: 'Misas',
    icon: 'BookOpen',
  },
  'special-liturgy': {
    slug: 'special-liturgy',
    name_en: 'Special Liturgies',
    name_es: 'Liturgias Especiales',
    icon: 'Star',
  },
  sacrament: {
    slug: 'sacrament',
    name_en: 'Sacraments',
    name_es: 'Sacramentos',
    icon: 'Church',
  },
  event: {
    slug: 'event',
    name_en: 'Events',
    name_es: 'Eventos',
    icon: 'CalendarDays',
  },
} as const;

export type SystemType = keyof typeof SYSTEM_TYPE_METADATA;
```

### Level 1: event_types (User-Defined Templates)

**Purpose:** Parish-customizable templates that define structure, fields, and roles

**Table Structure:**
```
event_types
  - id (uuid, primary key)
  - parish_id (uuid, foreign key → parishes)
  - system_type (text, CHECK constraint) - 'mass' | 'special-liturgy' | 'sacrament' | 'event'
  - name (text) - e.g., "Wedding" (user-defined, not bilingual)
  - slug (text) - URL-friendly, scoped to parish
  - icon (text) - Lucide icon name
  - script_template (jsonb) - Content builder structure
  - role_definitions (jsonb) - What roles exist for this type
  - order (integer)
  - deleted_at, created_at, updated_at

input_field_definitions (related table, one row per field)
  - id (uuid, primary key)
  - event_type_id (uuid, foreign key → event_types)
  - name (text) - e.g., "Bride", "Rehearsal" (user-defined, not bilingual)
  - type (text, CHECK constraint) - input type (rename 'occasion' → 'calendar_event')
  - required (boolean)
  - is_key_person (boolean) - for person type, used in title computation
  - is_primary (boolean) - for calendar_event type, the main occurrence
  - order (integer)
  - ... other metadata
```

**Migration Note:** The existing `category` column will be renamed to `system_type`. Values change: `special_liturgy` → `special-liturgy`.

**Field Definitions (Normalized Table):**

Event types define their fields using the `input_field_definitions` table (not JSONB). Each row is one field definition with its input type.

**Available Input Types** (from existing CHECK constraint, with rename):
- `person` - Person picker (stores person_id)
- `group` - Group picker (stores group_id)
- `location` - Location picker (stores location_id)
- `event_link` - Links to another master_event
- `list_item` - Custom list selection
- `document` - Document attachment
- `text` - Text input
- `rich_text` - Rich text editor
- `content` - Content block
- `petition` - Petition content
- `calendar_event` - Date/time/location (creates calendar_events record, stores calendar_event_id) **← renamed from 'occasion'**
- `date` - Date picker
- `time` - Time picker
- `datetime` - Date and time picker
- `number` - Numeric input
- `yes_no` - Boolean toggle
- `mass-intention` - Mass intention
- `spacer` - Visual spacer

**Key Pattern - All Input Types Store Reference IDs:**

| Input Type | Creates/References | Stores in field_values |
|------------|-------------------|----------------------|
| person | references `people` | `person_id` |
| location | references `locations` | `location_id` |
| group | references `groups` | `group_id` |
| calendar_event | **creates** `calendar_events` | `calendar_event_id` |
| text, number, etc. | n/a | literal value |

The `calendar_event` type is consistent with other reference types - it stores an ID in `field_values`. The only difference is it **creates** a new record rather than selecting an existing one.

**Example - Wedding field_values:**
```json
{
  "bride_id": "uuid-of-jane",
  "groom_id": "uuid-of-john",
  "license_number": "ABC123",
  "rehearsal_id": "uuid-of-calendar-event-1",
  "ceremony_id": "uuid-of-calendar-event-2"
}
```

**How It Works:**

When a user creates a master_event from an event_type:
1. Form displays fields based on input_field_definitions (PersonPicker for "person", calendar picker for "calendar_event", etc.)
2. User fills in all fields
3. For `calendar_event` fields, system creates a record in `calendar_events` table
4. All field values stored in `master_events.field_values` as reference IDs or literal values

**CHECK Constraint Example:**
```sql
ALTER TABLE event_types
ADD CONSTRAINT event_types_system_type_check
CHECK (system_type IN ('mass', 'special-liturgy', 'sacrament', 'event'));
```

**Examples:**
- **system_type: 'mass'** → Event Types: "Sunday Mass", "Daily Mass", "Funeral Mass"
- **system_type: 'special-liturgy'** → Event Types: "Easter Vigil", "Christmas Midnight Mass", "Stations of the Cross"
- **system_type: 'sacrament'** → Event Types: "Wedding", "Baptism", "Confirmation", "First Communion"
- **system_type: 'event'** → Event Types: "Bible Study", "Zumba", "Parish Picnic", "Finance Committee Meeting"

**Role Definitions Example (Wedding event_type):**
```json
{
  "roles": [
    {"id": "presider", "name": "Presider", "required": true},
    {"id": "best-man", "name": "Best Man", "required": false},
    {"id": "maid-of-honor", "name": "Maid of Honor", "required": false},
    {"id": "lector1", "name": "Lector 1", "required": false}
  ]
}
```

**Role Definitions Example (Zumba event_type):**
```json
{
  "roles": [
    {"id": "instructor", "name": "Instructor", "required": true},
    {"id": "setup", "name": "Setup", "required": false},
    {"id": "cleanup", "name": "Cleanup", "required": false}
  ]
}
```

**Note:** Role names are user-defined and not bilingual (like input_field_definitions.name).

### Level 2: master_events (Actual Instances)

**Purpose:** The specific occurrence of an event (John & Jane's Wedding, Easter Vigil 2025)

**Table Structure:**
```
master_events
  - id (uuid, primary key)
  - parish_id (uuid, foreign key → parishes)
  - event_type_id (uuid, foreign key → event_types, NOT NULL)
  - field_values (jsonb) - Values for input_field_definitions (IDs or literals)
  - presider_id (uuid, foreign key → people, optional)
  - homilist_id (uuid, foreign key → people, optional)
  - status (text) - "draft", "scheduled", "completed", "cancelled"
  - created_at, updated_at
```

**Title Computation:**
Titles are computed (not stored) using this pattern:
- `{key person(s)} {event_type.name}` for single calendar_event field
- `{key person(s)} {event_type.name} - {input_field_definition.name}` for multiple calendar_event fields

Examples:
- "John & Jane's Wedding" (single ceremony field would omit suffix)
- "John & Jane's Wedding - Rehearsal" (multiple fields show suffix)
- "Maria Garcia's Funeral - Vigil"
- "9am Mass Jan 19" (mass uses date/time pattern, not person)

**Role Assignments (Separate Table):**
```
master_event_roles
  - id (uuid, primary key)
  - master_event_id (uuid, foreign key → master_events)
  - role_id (text) - References role from event_type.role_definitions
  - person_id (uuid, foreign key → people)
  - notes (text, optional)
```

**Examples:**
- "John & Jane's Wedding" (event_type: Wedding, system_type: Sacrament)
- "Easter Vigil 2025" (event_type: Easter Vigil, system_type: Special Liturgy)
- "9am Mass Jan 19" (event_type: Sunday Mass, system_type: Mass)
- "Zumba Jan 15" (event_type: Zumba, system_type: Event)

**Why master_events?**
- Clear semantic meaning: this is the "master" record for an event
- Distinguishes from calendar_events which are date/time-specific
- Allows one event to have multiple calendar occurrences
- **Central place for role assignments and custom data** - Roles belong to master_event, NOT calendar_event
- **Scripts are generated from master_events** - Not from individual calendar_events

### Level 3: calendar_events (Calendar Entries)

**Purpose:** What appears on the parish calendar with date, time, and location

**CRITICAL - calendar_events are SIMPLE:**
- calendar_events only store: date/time, location_id, master_event_id, field_name
- NO title field (computed from master_event + field_name)
- NO roles (roles belong to master_event only)
- NO scripts (scripts belong to master_event only)
- NO custom fields (custom fields belong to master_event only)

**Table Structure:**
```
calendar_events
  - id (uuid, primary key)
  - parish_id (uuid, foreign key → parishes)
  - master_event_id (uuid, foreign key → master_events, NOT NULL)
  - input_field_definition_id (uuid, foreign key → input_field_definitions, NOT NULL)
  - start_datetime (timestamptz, NOT NULL) - timezone included in timestamptz
  - end_datetime (timestamptz, optional)
  - location_id (uuid, foreign key → locations, optional)
  - is_cancelled (boolean)
  - created_at, updated_at
```

**Relationship to field_values:**
- `calendar_event` input type creates a record here
- The calendar_event.id is stored in `master_events.field_values`
- Label for calendar display comes from `input_field_definitions.name`

**Key Design Decisions:**

1. **Every calendar_event MUST have a master_event** (NOT NULL foreign key). No standalone calendar events. The existing `is_standalone` column will be removed.

2. **NO title fields** - Titles are computed from master_event.title + field_name

3. **NO roles on calendar_events** - Roles belong to master_event only

4. **NO scripts on calendar_events** - Scripts are generated from master_event only

5. **calendar_events are purely schedule entries** - They only contain: date/time, location, and field_name reference

**Computed Title for Calendar Display:**

Calendar event titles are computed based on number of calendar_event fields in the event_type:

| # calendar_event fields | Title format | Example |
|------------------------|--------------|---------|
| Single field | `{master_event.title}` | "9am Mass Jan 19" |
| Multiple fields | `{master_event.title} - {field_name}` | "Mark and Susan's Wedding - Rehearsal" |

**Examples:**

| master_event | field_name | # fields | Calendar shows |
|--------------|------------|----------|----------------|
| Mark and Susan's Wedding | Rehearsal | 2 | "Mark and Susan's Wedding - Rehearsal" |
| Mark and Susan's Wedding | Ceremony | 2 | "Mark and Susan's Wedding - Ceremony" |
| Mr. Smith's Funeral | Vigil | 3 | "Mr. Smith's Funeral - Vigil" |
| Mr. Smith's Funeral | Funeral Mass | 3 | "Mr. Smith's Funeral - Funeral Mass" |
| Mr. Smith's Funeral | Burial | 3 | "Mr. Smith's Funeral - Burial" |
| 9am Mass Jan 19 | Mass | 1 | "9am Mass Jan 19" |
| Zumba Jan 15 | Session | 1 | "Zumba Jan 15" |

**Detailed Examples:**

**Wedding (2 calendar events for 1 master event):**
- Master Event: "John & Jane's Wedding"
  - Calendar Event 1:
    - field_name: "Rehearsal"
    - start_datetime: June 14, 6:00 PM
    - Computed title: "John & Jane's Wedding - Rehearsal"
  - Calendar Event 2:
    - field_name: "Ceremony"
    - start_datetime: June 15, 2:00 PM
    - Computed title: "John & Jane's Wedding - Ceremony"

**Funeral (3 calendar events for 1 master event):**
- Master Event: "Maria Garcia Funeral"
  - Calendar Event 1:
    - field_name: "Vigil"
    - start_datetime: June 20, 7:00 PM
    - Computed title: "Maria Garcia Funeral - Vigil"
  - Calendar Event 2:
    - field_name: "Funeral Mass"
    - start_datetime: June 21, 10:00 AM
    - Computed title: "Maria Garcia Funeral - Funeral Mass"
  - Calendar Event 3:
    - field_name: "Burial"
    - start_datetime: June 21, 11:30 AM
    - Computed title: "Maria Garcia Funeral - Burial"

**Easter Vigil (1 calendar event for 1 master event):**
- Master Event: "Easter Vigil 2025"
  - Calendar Event 1:
    - field_name: "Easter Vigil" (or whatever the field is named)
    - start_datetime: April 19, 8:00 PM
    - Computed title: "Easter Vigil 2025"

**Recurring Sunday Mass (1 calendar event per master event):**
- Master Event: "9am Mass Jan 19"
  - Calendar Event 1:
    - field_name: "Mass"
    - start_datetime: Jan 19, 9:00 AM
    - Computed title: "9am Mass Jan 19"
- Master Event: "9am Mass Jan 26"
  - Calendar Event 1:
    - field_name: "Mass"
    - start_datetime: Jan 26, 9:00 AM
    - Computed title: "9am Mass Jan 26"

## Key Design Decisions

### 1. Every calendar_event Has a master_event

**Decision:** calendar_events.master_event_id is NOT NULL

**Rationale:**
- Prevents orphaned calendar entries
- Clear ownership and context for every calendar item
- Simplifies data integrity
- Makes database self-documenting

**Alternative Considered:** Nullable FK to allow standalone calendar events
**Why Rejected:** Creates ambiguity, complicates queries, harder to maintain consistency

### 2. event_type_id Lives on master_event

**Decision:** master_events.event_type_id is NOT NULL, calendar_events does not have event_type_id

**Rationale:**
- The type is a property of the event instance, not the calendar occurrence
- Calendar events inherit type through master_event relationship
- Prevents data duplication and inconsistency
- Single source of truth for event type

**How to Get System Type from Calendar Event:**
```sql
SELECT ce.*, me.event_type_id, et.name, et.system_type
FROM calendar_events ce
JOIN master_events me ON ce.master_event_id = me.id
JOIN event_types et ON me.event_type_id = et.id
WHERE ce.id = ?
```

**Note:** No join to system_types table needed since system_type is stored directly on event_types

### 3. Unified Role Scheduling for All System Types

**Decision:** Role scheduling works identically for Masses, Special Liturgies, Sacraments, and Events

**Rationale:**
- Role assignment is a universal need (ministers for Masses, volunteers for Events)
- Same UI patterns reduce learning curve
- Same database structure simplifies development
- Parish staff think of "roles" regardless of event type

**Examples:**
- **Mass roles:** Presider, Lector, Server, Extraordinary Minister
- **Wedding roles:** Presider, Best Man, Maid of Honor, Lector, Musicians
- **Event roles:** Setup, Grill Master, Cleanup, Instructor
- **Bible Study roles:** Facilitator, Note Taker

**Implementation:**
- event_types.role_definitions (jsonb) defines available roles
- master_event_roles table assigns people to roles
- UI shows role picker for all event types

### 4. All System Types Can Have Scripts

**Decision:** Script generation is available for all system types, not just liturgical ones

**Rationale:**
- Event agendas and runsheets are valuable for non-liturgical events
- Consistent pattern reduces special cases
- Optional feature - event types can choose not to use scripts
- Future-proof for unexpected use cases

**Examples:**
- **Mass script:** Readings, petitions, announcements, ceremony order
- **Wedding script:** Full ceremony order with readings, vows, blessing
- **Zumba script:** Session agenda, music playlist, warm-up routine
- **Parish Picnic script:** Event timeline, setup checklist, activity schedule

### 5. Masses Table Will Be Deleted

**Decision:** Migrate existing `masses` table to unified structure, then delete

**Rationale:**
- Eliminates data model fragmentation
- Masses become master_events with event_type pointing to a Mass system_type
- Existing Mass functionality preserved through event_type customization
- Cleaner codebase with single event model

**Migration Strategy (High-Level):**
1. Create "Sunday Mass" and "Daily Mass" event types (system_type = 'mass')
2. Migrate each mass record to master_event + calendar_event
3. Migrate mass roles to master_event_roles
4. Update all foreign key references
5. Verify data integrity
6. Delete masses table

**Preserved Functionality:**
- All Mass-specific fields become custom fields on Mass event types
- Mass readings/petitions/announcements remain linked to master_events
- Mass scheduling patterns become event type configurations
- Print scripts continue to work through content builder

## Feature Comparison by System Type

| System Type | Role Scheduling | Scripts | Custom Fields | Multiple Calendar Events |
|-------------|-----------------|---------|---------------|--------------------------|
| Mass | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Usually 1 |
| Special Liturgy | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Usually 1 |
| Sacrament | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Often 2+ |
| Event | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Usually 1 |

**Key Insight:** All system types have the same capabilities. The differences are in typical usage patterns, not technical limitations.

## Integration Points

**Existing Features That Will Integrate:**
- **People module** - Role assignments link to people records
- **Locations module** - calendar_events.location_id references locations
- **Groups module** - Event types can specify which ministry groups are relevant
- **Content Builder System** - Scripts generated from master_events using event_type templates
- **Print/Export** - PDF/Word generation works from master_events
- **Calendar .ics Export** - Generated from calendar_events
- **Sidebar Navigation** - Organized by system_type

**Existing Patterns to Follow:**
- **User-defined labels are NOT bilingual** (event_types.name, input_field_definitions.name, role names)
- **System UI labels ARE bilingual** (system type metadata in application constants)
- Parish scoping (parish_id on all user-created records)
- WithRelations pattern for fetching related data
- Server actions for CRUD operations
- RLS policies for multi-tenancy

**Components to Reuse:**
- PersonPicker for role assignments
- LocationPicker for calendar events
- DateTimePicker for calendar events
- ContentBuilder for scripts
- ExportButtons for PDF/Word

## Examples Flow

### Example 1: Wedding with Multiple Calendar Events

**Event Type:** Wedding (system_type: Sacrament)
- Role definitions: Presider, Best Man, Maid of Honor, Lector 1, Lector 2
- Custom fields (using input_types):
  - Bride (input_type: person)
  - Groom (input_type: person)
  - License Number (input_type: string)
  - Rehearsal (input_type: calendar_event)
  - Ceremony (input_type: calendar_event)
- Script template: Cover page, readings, vows, ring blessing, final blessing

**Master Event:** "John & Jane's Wedding"
- event_type_id: [Wedding UUID]
- field_values: `{"bride_id": "uuid-jane", "groom_id": "uuid-john", "license_number": "ABC123", "rehearsal_id": "uuid-cal-1", "ceremony_id": "uuid-cal-2"}`
- Computed title: "John & Jane's Wedding" (from event_type + key persons)
- Roles assigned:
  - Presider: Fr. Michael
  - Best Man: Tom Doe
  - Maid of Honor: Sarah Smith
  - Lector 1: Mary Johnson

**Calendar Events (created when filling calendar_event fields):**
1. Rehearsal (id: uuid-cal-1)
   - master_event_id: [John & Jane's Wedding UUID]
   - input_field_definition_id: [Rehearsal field UUID]
   - start_datetime: 2025-06-14T18:00:00-05:00 (timestamptz includes timezone)
   - location_id: [Main Church]
   - Calendar label from input_field_definition.name: "Rehearsal"

2. Ceremony (id: uuid-cal-2)
   - master_event_id: [John & Jane's Wedding UUID]
   - input_field_definition_id: [Ceremony field UUID]
   - start_datetime: 2025-06-15T14:00:00-05:00
   - location_id: [Main Church]
   - Calendar label from input_field_definition.name: "Ceremony"

**User Experience:**
- Create master event "John & Jane's Wedding"
- Form shows person pickers for Bride/Groom, text input for License Number
- Form shows date/time/location pickers for Rehearsal and Ceremony fields
- User fills in all fields (June 14 for Rehearsal, June 15 for Ceremony)
- System creates 2 calendar_event records automatically
- User assigns roles once at master event level (apply to both calendar events)
- Generate script for ceremony (includes role assignments, readings, custom fields)
- Print script for presider

### Example 2: Recurring Sunday Mass

**Event Type:** Sunday Mass (system_type: Mass)
- Role definitions: Presider, Deacon, Lector 1, Lector 2, Server 1, Server 2, Cantor
- Custom fields (using input_types):
  - Liturgical Season (input_type: string)
  - Liturgical Color (input_type: string)
  - Mass (input_type: calendar_event)
- Script template: Readings, psalm, petitions, announcements, Mass parts

**Master Event Series (one per Sunday):**

**Master Event 1:** "9am Mass Jan 19"
- event_type_id: [Sunday Mass UUID]
- field_values: `{"liturgical_season": "Ordinary Time", "liturgical_color": "Green", "mass_id": "uuid-cal-mass-1"}`
- Computed title: "9am Mass Jan 19"
- Roles:
  - Presider: Fr. Michael
  - Lector 1: Mary Johnson
  - Lector 2: Tom Smith
- **Calendar Event (id: uuid-cal-mass-1):**
  - input_field_definition_id: [Mass field UUID]
  - start_datetime: 2025-01-19T09:00:00-06:00
  - Calendar label: "Mass" (single calendar_event field, so title shows without suffix)

**Master Event 2:** "9am Mass Jan 26"
- event_type_id: [Sunday Mass UUID]
- field_values: `{"liturgical_season": "Ordinary Time", "liturgical_color": "Green", "mass_id": "uuid-cal-mass-2"}`
- Computed title: "9am Mass Jan 26"
- Roles:
  - Presider: Fr. John
  - Lector 1: Sarah Williams
  - Lector 2: Bob Jones
- **Calendar Event (id: uuid-cal-mass-2):**
  - input_field_definition_id: [Mass field UUID]
  - start_datetime: 2025-01-26T09:00:00-06:00
  - Calendar label: "Mass"

**User Experience:**
- Use Mass Scheduling module to create recurring pattern: "Every Sunday at 9am"
- System generates master_events (one per Sunday) + calendar_events
- Assign roles per week (different people each week)
- Scripts generated per master event (different readings each week)
- Calendar shows all Sunday Masses

### Example 3: Zumba Class (Non-Liturgical Event)

**Event Type:** Zumba (system_type: Event)
- Role definitions: Instructor, Setup, Cleanup
- Custom fields (using input_types):
  - Music Theme (input_type: string)
  - Attendance Cap (input_type: string)
  - Session (input_type: calendar_event)
- Script template: Class outline, song list, warm-up/cool-down instructions

**Master Event:** "Zumba Jan 15"
- event_type_id: [Zumba UUID]
- field_values: `{"music_theme": "Latin Hits", "attendance_cap": "30", "session_id": "uuid-cal-zumba-1"}`
- Computed title: "Zumba Jan 15"
- Roles:
  - Instructor: Maria Rodriguez
  - Setup: Tom Smith
  - Cleanup: Sarah Johnson

**Calendar Event (id: uuid-cal-zumba-1):**
- master_event_id: [Zumba Jan 15 UUID]
- input_field_definition_id: [Session field UUID]
- start_datetime: 2025-01-15T18:00:00-06:00
- end_datetime: 2025-01-15T19:00:00-06:00
- location_id: [Parish Hall]
- Calendar label: "Session" (single field, so displays as "Zumba Jan 15")

**User Experience:**
- Create master event "Zumba Jan 15"
- Form shows text inputs for Music Theme and Attendance Cap
- Form shows date/time/location picker for Session field
- User fills in all fields (Jan 15, 6pm-7pm at Parish Hall)
- System creates calendar_event record automatically
- User assigns instructor and volunteer roles
- Generate class outline/runsheet (optional)
- Participants see event on parish calendar

## Menu Structure

This section describes how the unified event data model will be organized in the application's navigation.

### Main Sidebar Navigation

The main sidebar will organize navigation by system type, providing clear entry points for each category:

```
Dashboard
Calendar
Mass Scheduling (create/prepare masses)
Event Scheduling (create repeating events)

Masses
├── Our Masses
└── New Mass

Special Liturgies
├── Our Special Liturgies
└── New Special Liturgy

Sacraments
├── Our Sacraments
└── New Sacrament

Events
├── Our Events
└── New Event

Groups
├── Our Groups
└── New Group

Locations
├── Our Locations
└── New Location

People
├── Our People
└── New Person

Families
├── Our Families
└── New Family

Weekend Summary
```

### Settings Section

Settings will be organized by system type, allowing administrators to configure event types for each category:

```
Settings
├── Masses (configure mass event_types)
├── Special Liturgies (configure special liturgy event_types)
├── Sacraments (configure sacrament event_types)
├── Events (configure event event_types)
├── Locations
├── Groups
└── ...other settings
```

**Important:** The existing `/settings/event-types` page will be **deleted** and replaced by the four separate settings pages above (Masses, Special Liturgies, Sacraments, Events).

### Scheduling Modules

Two specialized scheduling modules handle bulk creation of recurring events:

| Module | Purpose | System Types | Route |
|--------|---------|--------------|-------|
| Mass Scheduling | Create masses from templates, set liturgical settings + roles | mass only | `/mass-scheduling` |
| Event Scheduling | Create repeating events from templates | event only | `/event-scheduling` |

**Key Distinction:**
- **Mass Scheduling** and **Event Scheduling** modules are for bulk/recurring event creation
- **Special Liturgies** and **Sacraments** are prepared individually (no scheduling module)
- Individual masses can also be created directly via "New Mass" (bypassing Mass Scheduling)
- Individual events can also be created directly via "New Event" (bypassing Event Scheduling)

### Settings Pages Detail

Each settings page manages event types for one system type:

| Settings Page | Manages | system_type | Route |
|---------------|---------|-------------|-------|
| Settings → Masses | Mass event_types | mass | `/settings/masses` |
| Settings → Special Liturgies | Special liturgy event_types | special-liturgy | `/settings/special-liturgies` |
| Settings → Sacraments | Sacrament event_types | sacrament | `/settings/sacraments` |
| Settings → Events | Event event_types | event | `/settings/events` |

**Within each settings page, users can:**
- Create new event types for that system type
- Configure custom fields
- Define role structures
- Set up script templates
- Activate/deactivate event types
- View and manage existing event types

**Example (Settings → Sacraments):**
- Create "Wedding" event type with custom fields (bride name, groom name, license number)
- Define roles (Presider, Best Man, Maid of Honor, Lectors, Musicians)
- Configure script template (cover page, readings, vows, blessings)
- Create "Baptism" event type with different fields and roles
- Create "Confirmation" event type, etc.

### Navigation Flow Examples

**Creating a Wedding (Sacrament):**
1. Main sidebar → Sacraments → New Sacrament
2. Select event type: "Wedding"
3. Fill in custom fields (bride, groom, etc.)
4. Add calendar events (rehearsal, ceremony)
5. Assign roles (presider, best man, maid of honor)
6. Generate and print script

**Creating Sunday Masses (Recurring):**
1. Main sidebar → Mass Scheduling
2. Select event type: "Sunday Mass"
3. Set recurring pattern (every Sunday at 9am, 11am)
4. Set date range (next 3 months)
5. System creates master_events + calendar_events
6. Assign roles per week

**Configuring a New Event Type:**
1. Main sidebar → Settings → Events
2. Click "New Event Type"
3. Name: "Parish Picnic"
4. Define custom fields (location, food coordinator, expected attendance)
5. Define roles (setup crew, grill master, cleanup crew)
6. Save event type
7. Now available when creating new events

### URL Structure

**Main Modules (by system type):**
- `/masses` - List all masses
- `/masses/new` - Create new mass
- `/masses/[id]` - View mass details
- `/masses/[id]/edit` - Edit mass

- `/special-liturgies` - List all special liturgies
- `/special-liturgies/new` - Create new special liturgy
- `/special-liturgies/[id]` - View special liturgy details
- `/special-liturgies/[id]/edit` - Edit special liturgy

- `/sacraments` - List all sacraments
- `/sacraments/new` - Create new sacrament
- `/sacraments/[id]` - View sacrament details
- `/sacraments/[id]/edit` - Edit sacrament

- `/events` - List all events
- `/events/new` - Create new event
- `/events/[id]` - View event details
- `/events/[id]/edit` - Edit event

**Scheduling Modules:**
- `/mass-scheduling` - Bulk create masses
- `/event-scheduling` - Bulk create events

**Settings (by system type):**
- `/settings/masses` - Configure mass event types
- `/settings/special-liturgies` - Configure special liturgy event types
- `/settings/sacraments` - Configure sacrament event types
- `/settings/events` - Configure event event types

**Calendar:**
- `/calendar` - Unified calendar view showing all calendar_events from all system types

## Benefits of This Design

### 1. Simple 3-Table Structure

**What it means:**
- Only 3 tables: event_types, master_events, calendar_events
- No separate system_types table needed
- System type stored as enum field with CHECK constraint
- Metadata (names, icons) in application constants, not database

**Developer benefit:** Fewer tables to understand, simpler queries

**AI benefit:** Easier to reason about the structure without complex joins

**Database benefit:** Fewer tables, fewer joins, better query performance

### 2. Database is Self-Documenting and Intelligible

**What it means:**
- Foreign key names clearly indicate relationships (master_event_id, event_type_id)
- Table names are semantic and unambiguous (master_events vs calendar_events)
- No nullable foreign keys in primary flow (every calendar_event has a master_event)
- Data integrity enforced at database level via CHECK constraints

**Developer benefit:** New developers can understand the schema by looking at table structure

**AI benefit:** AI agents can reason about the database without extensive documentation

### 3. System Types Are First-Class Entities

**What it means:**
- Masses, Special Liturgies, Sacraments, and Events are explicit categories via enum
- Each has metadata (icon, bilingual name) in application constants
- Theological distinctions are preserved in the data model
- UI can be organized around these fundamental categories

**User benefit:** Parish staff can navigate by familiar categories

**Theological benefit:** Sacraments are clearly distinguished from other events

### 4. Clean Foreign Key Relationships

**What it means:**
- No circular dependencies
- Clear parent-child hierarchy (event_type → master_event → calendar_event)
- No nullable foreign keys in main flow
- Deletion cascades are predictable

**Benefit:** Data integrity is enforced, bugs are prevented, queries are simpler

### 5. Flexible Role Scheduling Works for Ministers AND Volunteers

**What it means:**
- Same system for assigning presiders to Masses and volunteers to events
- Role definitions customizable per event type
- No special cases or branching logic

**User benefit:** Learn one role scheduling pattern, use everywhere

**Developer benefit:** Single codebase for role management

### 6. Future-Proof Structure

**What it means:**
- New event types can be added without schema changes
- New system types could be added if needed (unlikely but possible)
- Custom fields allow event type evolution without migrations
- Multiple calendar events per master event supports complex scenarios

**Benefit:** System grows with parish needs without database refactoring

## Open Questions for Requirements-Agent

### Database Schema

1. **Custom field validation:** How should event_types.custom_fields define validation rules? (e.g., required fields, field types, max length)

2. **Role capacity limits:** Should role_definitions support capacity (e.g., "need 2 servers")? How should this be represented?

3. **Calendar event cancellation:** Should is_cancelled be on calendar_events or master_events? (Proposed: calendar_events, since you might cancel rehearsal but not ceremony)

4. **Soft deletes:** Do we need soft deletes for master_events and calendar_events, or hard deletes with cascade?

5. **Event status workflow:** What are valid status transitions for master_events? (draft → scheduled → completed vs draft → scheduled → cancelled)

6. **Historical data:** How long should completed events be retained? Archive strategy?

### Role Scheduling

7. **Role assignment conflicts:** Should the system detect/prevent double-booking (same person, two roles at same time)?

8. **Role substitutions:** How to handle last-minute role changes? Track original vs actual assignment?

9. **Volunteer availability:** Should role assignment system integrate with person availability/preferences?

### Script Generation

10. **Template versioning:** If event_type.script_template changes, what happens to existing master_events? Use template at time of creation or current template?

11. **Script customization:** Can users customize scripts per master_event, or only via event_type template?

### Database Changes (Greenfield - Direct Overwrites)

12. **masses table:** Delete and replace with unified structure (master_events + calendar_events)

13. **calendar_events table:** Overwrite with new structure (remove is_standalone, label; add input_field_definition_id, start_datetime timestamptz)

14. **event_types table:** Rename `category` → `system_type`, update CHECK constraint values

15. **input_field_definitions:** Rename `occasion` → `calendar_event` in CHECK constraint

### UI and UX

16. **Navigation patterns:** Should sidebar organize by system_type (Masses, Sacraments, Events) or by event_type (Weddings, Funerals, Bible Study)?

17. **Calendar view filtering:** How should users filter calendar by system_type, event_type, location, roles, etc.?

18. **Bulk operations:** Should users be able to create multiple calendar_events at once (e.g., generate 52 Sunday Masses for the year)?

19. **Master event without calendar events:** How should UI handle master_events that don't have calendar_events yet? Show as "Unscheduled"?

20. **Liturgical color display (Future Enhancement):** For events with liturgical relation (Wedding, Funeral, Sunday Mass), display liturgical color on calendar. Implementation to be added later.

### Performance and Scalability

21. **Query optimization:** What indexes are needed for common queries (calendar by date range, events by type, role assignments by person)?

22. **Pagination:** How to paginate master_events and calendar_events efficiently?

### Permissions and Security

23. **RLS policies:** How should row-level security policies differ between system_types? (e.g., Masses visible to all, but some Events restricted to specific groups)

24. **Role assignment permissions:** Who can assign people to roles? Only admins, or also ministry leaders for their ministries?

25. **Event type creation:** Can staff create event_types, or only admins?

## Next Steps

Hand off to requirements-agent for technical analysis.

**Priority areas for requirements-agent:**

1. **Complete database schema** - Define all columns, constraints, indexes, and RLS policies
2. **Migration strategy** - Detailed step-by-step migration from masses table
3. **Server actions** - Define CRUD operations for each table with WithRelations patterns
4. **Role scheduling implementation** - Detailed design of role assignment UI and logic
5. **Calendar event generation** - How to bulk-create calendar events (recurring patterns)
6. **Script generation integration** - How content builder system works with new model
7. **Query performance** - Identify critical queries and required indexes
8. **UI component updates** - Which existing components need modification, which are reusable
