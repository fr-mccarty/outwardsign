# Unified Event Data Model

**Created:** 2025-12-16
**Status:** Ready for Development
**Agent:** brainstorming-agent → requirements-agent
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

---
## TECHNICAL REQUIREMENTS
(Added by requirements-agent)

### Answers to Open Questions

#### Database Schema Questions

**Q1: Custom field validation - How should event_types.custom_fields define validation rules?**

**Answer:** Custom fields are already defined through the normalized `input_field_definitions` table (not JSONB). Validation rules are enforced through:
- Column-level constraints: `required` boolean, `type` CHECK constraint
- Application-level validation: React Hook Form + Zod schemas in server actions
- Field-specific validation based on `type`: person fields validate UUID exists in people table, date fields validate ISO date format, etc.

**No changes needed** - existing pattern is sufficient.

**Q2: Role capacity limits - Should role_definitions support capacity (e.g., "need 2 servers")?**

**Answer:** **NOT IN MVP**. Role definitions will remain simple (role ID, name, required flag). Capacity limits (e.g., "need 2-3 lectors") will be addressed in a future enhancement when role scheduling UI is built. For now, event types can define multiple roles with similar names (Lector 1, Lector 2) if multiple people are needed.

**Q3: Calendar event cancellation - Should is_cancelled be on calendar_events or master_events?**

**Answer:** `is_cancelled` stays on `calendar_events` only. Rationale:
- You might cancel the Wedding Rehearsal but not the Wedding Ceremony
- You might cancel one Mass in a series but not others
- Master events don't need cancellation - if the entire event is cancelled, you can soft-delete the master_event
- Cancelled calendar_events still exist for historical records but don't show on calendar

**Q4: Soft deletes - Do we need soft deletes for master_events and calendar_events?**

**Answer:** **YES** - Use `deleted_at TIMESTAMPTZ` (already exists in migrations). Rationale:
- Historical record preservation (completed sacraments should never be permanently deleted)
- Audit trail for compliance
- Undo capability
- Consistent pattern across all tables in the application

Deletion pattern:
- UI "delete" button sets `deleted_at = now()`
- Queries filter `WHERE deleted_at IS NULL`
- Permanent deletion only via database admin for GDPR/compliance

**Q5: Event status workflow - What are valid status transitions for master_events?**

**Answer:** Use existing `MODULE_STATUS_VALUES` pattern from `/src/lib/constants.ts`:

```
PLANNING → ACTIVE → COMPLETED
PLANNING → CANCELLED
ACTIVE → CANCELLED
```

No status field on calendar_events (they only have `is_cancelled` boolean). Status belongs to master_event only.

**Q6: Historical data - How long should completed events be retained?**

**Answer:** **Permanent retention** with soft deletes. Rationale:
- Sacramental records are permanent church records (baptism, marriage, etc.)
- Audit trail for church administration
- Historical reporting and statistics
- GDPR compliance: allow hard deletion only when parishioner requests data removal

Archive strategy (future): Move `deleted_at IS NOT NULL AND deleted_at < now() - interval '7 years'` to archive table.

#### Role Scheduling Questions

**Q7: Role assignment conflicts - Should the system detect/prevent double-booking?**

**Answer:** **NOT IN MVP**. Conflict detection will be added in a future enhancement when role scheduling UI is built. For now:
- Allow same person to be assigned to multiple roles
- Allow same person to be assigned to multiple events at same time
- Ministry leaders responsible for managing schedules manually
- Future: Add conflict detection in role assignment UI with warnings

**Q8: Role substitutions - How to handle last-minute role changes?**

**Answer:** Use `notes` field in `master_event_roles` table for documenting substitutions. Pattern:
```
notes: "Original: John Smith. Substituted by: Tom Jones on 2025-06-14"
```

**NOT IN MVP:** Formal substitution tracking with separate table. The current pattern is sufficient for MVP.

**Q9: Volunteer availability - Should role assignment integrate with person availability/preferences?**

**Answer:** **NOT IN MVP**. Person availability/preferences exist in `person_blackout_dates` table but won't be integrated into role assignment UI for master_events in MVP. This is a future enhancement.

For now: Ministry leaders assign roles manually, checking availability themselves.

#### Script Generation Questions

**Q10: Template versioning - If event_type.script_template changes, what happens to existing master_events?**

**Answer:** Use **template at time of script generation** (current template), not at time of event creation. Rationale:
- Scripts are generated on-demand, not stored
- Users can regenerate scripts with updated templates
- No need to version templates or store generated scripts
- If user wants a specific version, they export to PDF/Word and save locally

**Q11: Script customization - Can users customize scripts per master_event, or only via event_type template?**

**Answer:** **Only via event_type template** for MVP. Rationale:
- Simpler implementation
- Consistent scripts across events of same type
- Users can export to Word and customize offline if needed

Future enhancement: Per-event script overrides stored in master_events table.

#### Database Changes (Greenfield - Direct Overwrites)

**Q12: masses table - Delete and replace with unified structure**

**Answer:** **YES - Delete masses table** after migration. See Migration Strategy section below for detailed steps.

**Q13: calendar_events table - Overwrite with new structure**

**Answer:** **YES - Overwrite calendar_events table**. Changes:
- Remove `is_standalone` column and CHECK constraint (all calendar_events must have master_event_id)
- Remove `label` column (computed from input_field_definition.name)
- Change `date` and `time` columns to single `start_datetime TIMESTAMPTZ` column
- Add `end_datetime TIMESTAMPTZ` column (optional)
- Add `input_field_definition_id UUID NOT NULL` column
- Make `master_event_id` NOT NULL

**Q14: event_types table - Rename category → system_type**

**Answer:** **YES - Rename and update values**:
- Rename column: `category` → `system_type`
- Update CHECK constraint values: `'special_liturgy'` → `'special-liturgy'` (add hyphen)
- Keep other values: `'mass'`, `'sacrament'`, `'event'`

**Q15: input_field_definitions - Rename occasion → calendar_event**

**Answer:** **YES - Update CHECK constraint** to rename `'occasion'` → `'calendar_event'` in the `type` column values.

#### UI and UX Questions

**Q16: Navigation patterns - Should sidebar organize by system_type or by event_type?**

**Answer:** **Organize by system_type** at top level, with expandable lists of event_types underneath. Pattern:

```
Masses (BookOpen icon)
├── (Click navigates to /masses - list of all mass master_events)

Special Liturgies (Star icon)
├── Easter Vigil
├── Holy Thursday
└── Ash Wednesday

Sacraments (Church icon)
├── Wedding
├── Funeral
├── Baptism
└── Quinceañera

Events (CalendarDays icon)
├── (Click navigates to /events - list of all event master_events)
```

Rationale: Matches mental model from Event Categories requirements doc (2025-12-13-event-categories.md)

**Q17: Calendar view filtering - How should users filter calendar?**

**Answer:** Calendar filters:
- **By system_type** - Checkbox filters for Mass, Special Liturgy, Sacrament, Event
- **By event_type** - Dropdown showing all event types (Wedding, Funeral, etc.)
- **By location** - Dropdown showing all locations
- **By date range** - Start date and end date pickers
- **By search** - Text search on computed title

**NOT IN MVP:** Filter by roles (e.g., "show all events where I'm presider")

**Q18: Bulk operations - Should users create multiple calendar_events at once?**

**Answer:** **YES - Via Mass Scheduling and Event Scheduling modules**. These existing modules handle bulk creation:
- Mass Scheduling: `/mass-scheduling` - Creates recurring masses (weekly, monthly patterns)
- Event Scheduling: `/event-scheduling` - Creates recurring events (Zumba every Tuesday, etc.)

Pattern: User selects date range, recurrence pattern, and system creates one master_event + calendar_event per occurrence.

**Q19: Master event without calendar events - How should UI handle unscheduled master_events?**

**Answer:** Show "Unscheduled" badge and display message:
```
"This [event type name] does not have any scheduled dates yet. Add a date to make it appear on the calendar."
```

Provide "Add Calendar Event" button on master_event view page to create calendar_events.

**Q20: Liturgical color display - Should calendar events show liturgical color?**

**Answer:** **Future enhancement** - Not in MVP. Liturgical color belongs to master_events (via liturgical_event_id for Masses, or custom field for other event types). Calendar display can show color bars but this is lower priority than core functionality.

#### Performance and Scalability Questions

**Q21: Query optimization - What indexes are needed?**

**Answer:** See Database Schema section below for complete index definitions. Key indexes:
- `calendar_events(master_event_id)` - Join to master_events
- `calendar_events(start_datetime)` - Date range queries for calendar
- `calendar_events(input_field_definition_id)` - Join to get field name
- `master_events(event_type_id)` - Join to event_types
- `master_events(parish_id)` - RLS filtering
- `event_types(parish_id, system_type)` - Filtering by system type

**Q22: Pagination - How to paginate master_events and calendar_events?**

**Answer:** Use existing pagination pattern from masses module:
- `offset` and `limit` parameters in server actions
- Initial page: 25 items (LIST_VIEW_PAGE_SIZE constant)
- Load more: 50 items (INFINITE_SCROLL_LOAD_MORE_SIZE constant)
- Cursor-based pagination not needed for MVP (offset/limit sufficient for parish-scale data)

#### Permissions and Security Questions

**Q23: RLS policies - How should policies differ between system_types?**

**Answer:** **No difference** - All master_events and calendar_events use the same RLS policies regardless of system_type:
- SELECT: All parish members can read
- INSERT/UPDATE/DELETE: Admin, Staff, and Ministry-Leader roles only

Rationale: System_type is for UI organization, not security. If future requirements need different permissions (e.g., only Admin can create Mass event_types), implement at application layer via server actions, not RLS.

**Q24: Role assignment permissions - Who can assign people to roles?**

**Answer:** Same as master_events permissions:
- **Admin and Staff**: Can assign anyone to any role
- **Ministry-Leader**: Can assign people to roles (server action validates they have permission for this module)
- **Parishioner**: Read-only, cannot assign roles

**Q25: Event type creation - Can staff create event_types?**

**Answer:** **Admin only** for MVP. Rationale:
- Event types define structure and impact entire parish
- Requires understanding of field definitions, scripts, and templates
- Staff can request new event types from Admin
- Future: Could allow Staff to create event types with Admin approval workflow

### Database Schema Changes

#### 1. New System Type Constants

Create new constants file for system type metadata:

```typescript
// src/lib/constants/system-types.ts

export const SYSTEM_TYPE_VALUES = ['mass', 'special-liturgy', 'sacrament', 'event'] as const
export type SystemType = typeof SYSTEM_TYPE_VALUES[number]

export interface SystemTypeMetadata {
  slug: SystemType
  name_en: string
  name_es: string
  icon: string
}

export const SYSTEM_TYPE_METADATA: Record<SystemType, SystemTypeMetadata> = {
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
} as const
```

#### 2. Migration: Update event_types Table

File: `supabase/migrations/YYYYMMDD_update_event_types_system_type.sql`

```sql
-- Rename category column to system_type
ALTER TABLE event_types RENAME COLUMN category TO system_type;

-- Drop old CHECK constraint
ALTER TABLE event_types DROP CONSTRAINT event_types_category_check;

-- Add new CHECK constraint with updated values
ALTER TABLE event_types 
ADD CONSTRAINT event_types_system_type_check 
CHECK (system_type IN ('mass', 'special-liturgy', 'sacrament', 'event'));

-- Update existing data: 'special_liturgy' → 'special-liturgy'
UPDATE event_types 
SET system_type = 'special-liturgy' 
WHERE system_type = 'special_liturgy';

-- Update index
DROP INDEX IF EXISTS idx_event_types_category;
CREATE INDEX idx_event_types_system_type 
ON event_types(parish_id, system_type) 
WHERE deleted_at IS NULL;

-- Update comment
COMMENT ON COLUMN event_types.system_type IS 'System type for UI organization (mass, special-liturgy, sacrament, event)';
```

#### 3. Migration: Update input_field_definitions Table

File: `supabase/migrations/YYYYMMDD_update_input_field_definitions_calendar_event.sql`

```sql
-- Update CHECK constraint to rename 'occasion' → 'calendar_event'
ALTER TABLE input_field_definitions DROP CONSTRAINT check_input_field_type;

ALTER TABLE input_field_definitions 
ADD CONSTRAINT check_input_field_type 
CHECK (type IN (
  'person', 'group', 'location', 'event_link', 'list_item', 'document',
  'text', 'rich_text', 'content', 'petition', 
  'calendar_event',  -- RENAMED from 'occasion'
  'date', 'time', 'datetime', 'number', 'yes_no', 'mass-intention', 'spacer'
));

-- Update existing data: 'occasion' → 'calendar_event'
UPDATE input_field_definitions 
SET type = 'calendar_event' 
WHERE type = 'occasion';

-- Update CHECK constraint for is_primary
ALTER TABLE input_field_definitions DROP CONSTRAINT check_is_primary_only_for_occasion;

ALTER TABLE input_field_definitions 
ADD CONSTRAINT check_is_primary_only_for_calendar_event 
CHECK (is_primary = false OR type = 'calendar_event');

-- Update unique index for primary calendar_event
DROP INDEX IF EXISTS idx_input_field_definitions_primary_occasion;

CREATE UNIQUE INDEX idx_input_field_definitions_primary_calendar_event 
ON input_field_definitions(event_type_id)
WHERE is_primary = true AND type = 'calendar_event' AND deleted_at IS NULL;
```

#### 4. Migration: Overwrite calendar_events Table

File: `supabase/migrations/YYYYMMDD_recreate_calendar_events_table.sql`

```sql
-- Drop existing calendar_events table (GREENFIELD: no data preservation needed)
DROP TABLE IF EXISTS calendar_events CASCADE;

-- Create new calendar_events table with updated structure
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  master_event_id UUID NOT NULL REFERENCES master_events(id) ON DELETE CASCADE,
  input_field_definition_id UUID NOT NULL REFERENCES input_field_definitions(id) ON DELETE RESTRICT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT calendar_events_end_after_start CHECK (end_datetime IS NULL OR end_datetime > start_datetime)
);

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON calendar_events TO anon;
GRANT ALL ON calendar_events TO authenticated;
GRANT ALL ON calendar_events TO service_role;

-- Indexes
CREATE INDEX idx_calendar_events_parish_id ON calendar_events(parish_id);
CREATE INDEX idx_calendar_events_master_event_id ON calendar_events(master_event_id);
CREATE INDEX idx_calendar_events_input_field_definition_id ON calendar_events(input_field_definition_id);
CREATE INDEX idx_calendar_events_start_datetime ON calendar_events(start_datetime) WHERE deleted_at IS NULL;
CREATE INDEX idx_calendar_events_location_id ON calendar_events(location_id);

-- Unique index to ensure only one calendar_event per master_event per field_definition
-- (Prevents duplicate "Rehearsal" entries for same wedding)
CREATE UNIQUE INDEX idx_calendar_events_unique_per_field 
ON calendar_events(master_event_id, input_field_definition_id)
WHERE deleted_at IS NULL;

-- RLS Policies
CREATE POLICY calendar_events_select_policy ON calendar_events
  FOR SELECT
  USING (
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY calendar_events_insert_policy ON calendar_events
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

CREATE POLICY calendar_events_update_policy ON calendar_events
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

CREATE POLICY calendar_events_delete_policy ON calendar_events
  FOR DELETE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Comments
COMMENT ON TABLE calendar_events IS 'Calendar events - scheduled items that appear on parish calendar. Every calendar_event must belong to a master_event.';
COMMENT ON COLUMN calendar_events.master_event_id IS 'Foreign key to master_events (NOT NULL - every calendar event must have a parent master event)';
COMMENT ON COLUMN calendar_events.input_field_definition_id IS 'References which field definition this calendar event corresponds to (e.g., Rehearsal field, Ceremony field)';
COMMENT ON COLUMN calendar_events.start_datetime IS 'Start date and time with timezone (TIMESTAMPTZ)';
COMMENT ON COLUMN calendar_events.end_datetime IS 'Optional end date and time (NULL for events without specific end time)';
COMMENT ON COLUMN calendar_events.is_cancelled IS 'True if this specific calendar event is cancelled (master event may still be active)';
```

#### 5. Migration: Add status Column to master_events

File: `supabase/migrations/YYYYMMDD_add_status_to_master_events.sql`

```sql
-- Add status column to master_events
ALTER TABLE master_events 
ADD COLUMN status TEXT NOT NULL DEFAULT 'PLANNING';

-- Add CHECK constraint for status
ALTER TABLE master_events 
ADD CONSTRAINT master_events_status_check 
CHECK (status IN ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED'));

-- Add index for status filtering
CREATE INDEX idx_master_events_status ON master_events(status) WHERE deleted_at IS NULL;

-- Comment
COMMENT ON COLUMN master_events.status IS 'Event status: PLANNING (not yet scheduled), ACTIVE (scheduled and ongoing), COMPLETED (finished), CANCELLED (will not occur)';
```

#### 6. Migration: Create master_event_roles Table

File: `supabase/migrations/YYYYMMDD_create_master_event_roles_table.sql`

```sql
-- Create master_event_roles table for role assignments
CREATE TABLE master_event_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_event_id UUID NOT NULL REFERENCES master_events(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL,  -- References role from event_type.role_definitions JSONB
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE master_event_roles ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON master_event_roles TO anon;
GRANT ALL ON master_event_roles TO authenticated;
GRANT ALL ON master_event_roles TO service_role;

-- Indexes
CREATE INDEX idx_master_event_roles_master_event_id ON master_event_roles(master_event_id);
CREATE INDEX idx_master_event_roles_person_id ON master_event_roles(person_id);
CREATE INDEX idx_master_event_roles_role_id ON master_event_roles(master_event_id, role_id);

-- Unique index to prevent same person being assigned to same role twice for same event
CREATE UNIQUE INDEX idx_master_event_roles_unique_assignment 
ON master_event_roles(master_event_id, role_id, person_id)
WHERE deleted_at IS NULL;

-- RLS Policies (inherit from master_events)
CREATE POLICY master_event_roles_select_policy ON master_event_roles
  FOR SELECT
  USING (
    master_event_id IN (
      SELECT e.id 
      FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND e.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

CREATE POLICY master_event_roles_insert_policy ON master_event_roles
  FOR INSERT
  WITH CHECK (
    master_event_id IN (
      SELECT e.id
      FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
        AND e.deleted_at IS NULL
    )
  );

CREATE POLICY master_event_roles_update_policy ON master_event_roles
  FOR UPDATE
  USING (
    master_event_id IN (
      SELECT e.id
      FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
        AND e.deleted_at IS NULL
    )
  );

CREATE POLICY master_event_roles_delete_policy ON master_event_roles
  FOR DELETE
  USING (
    master_event_id IN (
      SELECT e.id
      FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
        AND e.deleted_at IS NULL
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER master_event_roles_updated_at
  BEFORE UPDATE ON master_event_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE master_event_roles IS 'Role assignments for master events. Role definitions come from event_type.role_definitions JSONB.';
COMMENT ON COLUMN master_event_roles.role_id IS 'Role identifier from event_type.role_definitions (e.g., "presider", "best-man", "lector1")';
COMMENT ON COLUMN master_event_roles.notes IS 'Optional notes (e.g., substitution information, special instructions)';
```

#### 7. Migration: Add role_definitions to event_types

File: `supabase/migrations/YYYYMMDD_add_role_definitions_to_event_types.sql`

```sql
-- Add role_definitions JSONB column to event_types
ALTER TABLE event_types 
ADD COLUMN role_definitions JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Add GIN index for JSONB queries
CREATE INDEX idx_event_types_role_definitions_gin ON event_types USING GIN (role_definitions);

-- Comment
COMMENT ON COLUMN event_types.role_definitions IS 'JSONB array of role definitions for this event type. Example: {"roles": [{"id": "presider", "name": "Presider", "required": true}]}';
```

#### 8. Migration: Delete masses Table

File: `supabase/migrations/YYYYMMDD_delete_masses_table.sql`

```sql
-- GREENFIELD: Delete masses table
-- All Mass data will be migrated to master_events + calendar_events
DROP TABLE IF EXISTS masses CASCADE;

-- Cleanup: Drop any remaining mass-related tables that are no longer needed
-- (Keep mass_roles, mass_role_members for existing scheduling system)
-- (These will be integrated with master_event_roles in future enhancement)
```

### Migration Strategy from masses Table

**CRITICAL NOTE:** This is a GREENFIELD application. We will **overwrite existing data** rather than preserve it. The migration strategy below is for understanding the transformation, but in practice we will:
1. Delete the masses table
2. Create new structure
3. Re-seed with fresh test data

#### Step-by-Step Migration Process

**PHASE 1: Pre-Migration Setup (Complete first)**

1. Create system type constants file (`src/lib/constants/system-types.ts`)
2. Update `event_types` table: rename `category` → `system_type`
3. Update `input_field_definitions` table: rename `'occasion'` → `'calendar_event'`
4. Recreate `calendar_events` table with new structure
5. Add `status` column to `master_events` table
6. Create `master_event_roles` table
7. Add `role_definitions` column to `event_types` table

**PHASE 2: Create Mass Event Types**

For each mass category, create event_types:

```sql
-- Example: Sunday Mass event_type
INSERT INTO event_types (parish_id, name, system_type, icon, slug, "order", role_definitions)
VALUES (
  :parish_id,
  'Sunday Mass',
  'mass',
  'BookOpen',
  'sunday-mass',
  1,
  '{
    "roles": [
      {"id": "presider", "name": "Presider", "required": true},
      {"id": "homilist", "name": "Homilist", "required": false},
      {"id": "lector1", "name": "Lector 1", "required": false},
      {"id": "lector2", "name": "Lector 2", "required": false}
    ]
  }'::jsonb
);

-- Get the event_type_id for next step
SELECT id FROM event_types WHERE parish_id = :parish_id AND slug = 'sunday-mass';
```

**PHASE 3: Create Input Field Definitions for Mass Event Type**

```sql
-- Add calendar_event field for Mass
INSERT INTO input_field_definitions (
  event_type_id, name, type, required, is_primary, "order"
)
VALUES (
  :event_type_id,
  'Mass',
  'calendar_event',
  true,
  true,  -- Primary calendar_event
  1
);

-- Add other fields as needed (liturgical season, liturgical color, etc.)
INSERT INTO input_field_definitions (
  event_type_id, name, type, required, "order"
)
VALUES 
  (:event_type_id, 'Liturgical Season', 'text', false, 2),
  (:event_type_id, 'Liturgical Color', 'text', false, 3);
```

**PHASE 4: Migrate Mass Data (GREENFIELD: Skip this, just delete)**

Since this is GREENFIELD, we **skip data migration** and instead:

```sql
-- Simply drop the masses table
DROP TABLE IF EXISTS masses CASCADE;

-- Done! No data migration needed.
```

**PHASE 5: Update Application Code**

See "UI Component Updates" section below.

### Type Definitions

#### Update Existing Types

File: `src/lib/types/event-types.ts`

```typescript
// UPDATE EventTypeCategory type
export type EventTypeCategory = 'mass' | 'special-liturgy' | 'sacrament' | 'event'

// UPDATE InputFieldType - rename 'occasion' → 'calendar_event'
export type InputFieldType =
  | 'person'
  | 'group'
  | 'location'
  | 'event_link'
  | 'list_item'
  | 'document'
  | 'text'
  | 'rich_text'
  | 'content'
  | 'petition'
  | 'calendar_event'  // RENAMED from 'occasion'
  | 'date'
  | 'time'
  | 'datetime'
  | 'number'
  | 'yes_no'
  | 'mass-intention'
  | 'spacer'

// UPDATE EventType interface
export interface EventType {
  id: string
  parish_id: string
  name: string
  description: string | null
  icon: string
  slug: string | null
  order: number
  system_type: EventTypeCategory  // RENAMED from 'category'
  role_definitions: RoleDefinitions | null  // NEW FIELD
  deleted_at: string | null
  created_at: string
  updated_at: string
}

// NEW interface for role definitions
export interface RoleDefinitions {
  roles: RoleDefinition[]
}

export interface RoleDefinition {
  id: string              // e.g., "presider", "best-man"
  name: string            // e.g., "Presider", "Best Man"
  required: boolean       // Is this role required?
  capacity?: number       // Optional: how many people needed (future)
}

// NEW interface for master_event status
export type MasterEventStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

// UPDATE MasterEvent interface (formerly DynamicEvent)
export interface MasterEvent {
  id: string
  parish_id: string
  event_type_id: string
  field_values: Record<string, any>
  presider_id: string | null
  homilist_id: string | null
  status: MasterEventStatus  // NEW FIELD
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// UPDATE MasterEventWithRelations
export interface MasterEventWithRelations extends MasterEvent {
  event_type: EventTypeWithRelations
  calendar_events: CalendarEvent[]
  roles: MasterEventRole[]  // NEW FIELD
  presider?: Person | null
  homilist?: Person | null
  parish?: ParishInfo
}

// NEW interface for master_event_roles
export interface MasterEventRole {
  id: string
  master_event_id: string
  role_id: string           // References RoleDefinition.id
  person_id: string
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// NEW interface with person populated
export interface MasterEventRoleWithPerson extends MasterEventRole {
  person: Person
}

// UPDATE CalendarEvent interface (formerly Occasion)
export interface CalendarEvent {
  id: string
  parish_id: string
  master_event_id: string  // NOT NULL (no more standalone events)
  input_field_definition_id: string  // NEW FIELD
  start_datetime: string   // RENAMED from date+time, now TIMESTAMPTZ
  end_datetime: string | null  // NEW FIELD
  location_id: string | null
  is_cancelled: boolean    // Kept from old structure
  created_at: string
  deleted_at: string | null
}

// UPDATE CalendarEventWithRelations
export interface CalendarEventWithRelations extends CalendarEvent {
  master_event: MasterEventWithRelations
  input_field_definition: InputFieldDefinition
  location?: Location | null
}

// NEW helper type for title computation
export interface ComputedTitleParams {
  master_event: MasterEventWithRelations
  field_name?: string  // Optional field name for calendar events
}
```

### Server Actions

#### master-events.ts

Create new file: `src/lib/actions/master-events.ts`

**Pattern Reference:** Per CLAUDE.md documentation requirements, this is PSEUDO-CODE describing what the implementation SHOULD do, not actual TypeScript code.

```
IMPORT necessary dependencies
IMPORT types: MasterEvent, MasterEventWithRelations, MasterEventRole
IMPORT requireSelectedParish from auth
IMPORT createClient from supabase

DEFINE MasterEventFilterParams interface:
  - search?: string (search event type name, key person names)
  - system_type?: SystemType | 'all'
  - status?: MasterEventStatus | 'all'
  - start_date?: string (filter calendar_events by date range)
  - end_date?: string
  - sort?: 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  - offset?: number
  - limit?: number

FUNCTION getMasterEvents(filters?: MasterEventFilterParams): Promise<MasterEventWithRelations[]>
  1. Call requireSelectedParish() to validate user has parish access
  2. Get supabase client
  3. Build query:
     SELECT master_events.*, event_type, calendar_events, roles
     WHERE parish_id = :selected_parish_id
     WHERE deleted_at IS NULL
  4. Apply filters (system_type via event_type join, status, etc.)
  5. Apply sorting
  6. Apply pagination (offset, limit)
  7. Execute query
  8. Return results

FUNCTION getMasterEventById(id: string): Promise<MasterEventWithRelations | null>
  1. Call requireSelectedParish()
  2. Get supabase client
  3. SELECT master_events with all relations:
     - event_type (with input_field_definitions)
     - calendar_events (with locations)
     - roles (with people)
     - presider, homilist
  4. Return result or null if not found

FUNCTION createMasterEvent(data: CreateMasterEventData): Promise<MasterEvent>
  1. Call requireSelectedParish() to get parish_id
  2. Validate data with Zod schema
  3. Check user has permission (admin, staff, or ministry-leader)
  4. Get supabase client
  5. INSERT INTO master_events (parish_id, event_type_id, field_values, status)
  6. For each calendar_event in field_values:
     - INSERT INTO calendar_events
     - Store calendar_event.id back into field_values
  7. Revalidate paths
  8. Return created master_event

FUNCTION updateMasterEvent(id: string, data: UpdateMasterEventData): Promise<MasterEvent>
  1. Call requireSelectedParish()
  2. Validate data with Zod schema
  3. Check user has permission
  4. Get existing master_event
  5. UPDATE master_events SET field_values, status, updated_at
  6. Handle calendar_events updates:
     - Compare new vs existing calendar_events in field_values
     - INSERT new calendar_events
     - UPDATE existing calendar_events
     - DELETE removed calendar_events (soft delete)
  7. Revalidate paths
  8. Return updated master_event

FUNCTION deleteMasterEvent(id: string): Promise<void>
  1. Call requireSelectedParish()
  2. Check user has permission
  3. UPDATE master_events SET deleted_at = now() WHERE id = :id
  4. Revalidate paths

FUNCTION getMasterEventRoles(master_event_id: string): Promise<MasterEventRoleWithPerson[]>
  1. Call requireSelectedParish()
  2. SELECT master_event_roles with person relation
  3. WHERE master_event_id = :master_event_id AND deleted_at IS NULL
  4. Return results

FUNCTION assignRole(master_event_id, role_id, person_id, notes?): Promise<MasterEventRole>
  1. Call requireSelectedParish()
  2. Check user has permission
  3. Validate role_id exists in event_type.role_definitions
  4. INSERT INTO master_event_roles
  5. Return created role assignment

FUNCTION removeRoleAssignment(role_assignment_id): Promise<void>
  1. Call requireSelectedParish()
  2. Check user has permission
  3. UPDATE master_event_roles SET deleted_at = now()
  4. Revalidate paths

FUNCTION computeMasterEventTitle(master_event: MasterEventWithRelations): string
  1. Get event_type from master_event
  2. Find all input_field_definitions where is_key_person = true
  3. Extract key person names from field_values
  4. IF key persons found:
     FORMAT title as "{Person1} & {Person2}'s {event_type.name}"
  5. ELSE IF calendar_event exists:
     FORMAT title as "{event_type.name} - {date}"
  6. ELSE:
     RETURN event_type.name
  7. Return computed title

FUNCTION computeCalendarEventTitle(
  master_event: MasterEventWithRelations, 
  field_definition: InputFieldDefinition
): string
  1. Get base title from computeMasterEventTitle(master_event)
  2. Count how many calendar_event type fields exist in event_type
  3. IF count === 1:
     RETURN base_title (no suffix)
  4. ELSE:
     RETURN "{base_title} - {field_definition.name}"
```

#### calendar-events.ts

Create new file: `src/lib/actions/calendar-events.ts`

**Pattern Reference:** This is PSEUDO-CODE describing what the implementation SHOULD do.

```
IMPORT types: CalendarEvent, CalendarEventWithRelations
IMPORT requireSelectedParish from auth
IMPORT computeCalendarEventTitle from master-events

DEFINE CalendarEventFilterParams interface:
  - search?: string
  - system_type?: SystemType | 'all'
  - event_type_id?: string
  - location_id?: string
  - start_date?: string
  - end_date?: string
  - include_cancelled?: boolean
  - sort?: 'date_asc' | 'date_desc'
  - offset?: number
  - limit?: number

FUNCTION getCalendarEvents(filters?: CalendarEventFilterParams): Promise<CalendarEventWithRelations[]>
  1. Call requireSelectedParish()
  2. Build query:
     SELECT calendar_events.*, master_event, location, input_field_definition
     WHERE parish_id = :selected_parish_id
     WHERE deleted_at IS NULL
     WHERE is_cancelled = false (unless filter includes cancelled)
  3. Apply date range filters (start_datetime BETWEEN :start_date AND :end_date)
  4. Apply system_type filter (via master_event → event_type)
  5. Apply event_type filter
  6. Apply location filter
  7. Order by start_datetime ASC (or DESC based on sort)
  8. Apply pagination
  9. Return results

FUNCTION getCalendarEventById(id: string): Promise<CalendarEventWithRelations | null>
  1. Call requireSelectedParish()
  2. SELECT calendar_events with all relations
  3. Return result

FUNCTION createCalendarEvent(data: CreateCalendarEventData): Promise<CalendarEvent>
  1. Call requireSelectedParish() to get parish_id
  2. Validate data with Zod schema
  3. Check user has permission
  4. Validate master_event_id exists and belongs to same parish
  5. Validate input_field_definition_id exists and belongs to master_event's event_type
  6. Validate input_field_definition.type === 'calendar_event'
  7. INSERT INTO calendar_events
  8. Revalidate paths
  9. Return created calendar_event

FUNCTION updateCalendarEvent(id, data): Promise<CalendarEvent>
  1. Call requireSelectedParish()
  2. Validate data
  3. Check user has permission
  4. UPDATE calendar_events
  5. Revalidate paths
  6. Return updated calendar_event

FUNCTION cancelCalendarEvent(id): Promise<CalendarEvent>
  1. Call requireSelectedParish()
  2. Check user has permission
  3. UPDATE calendar_events SET is_cancelled = true
  4. Revalidate paths
  5. Return updated calendar_event

FUNCTION deleteCalendarEvent(id): Promise<void>
  1. Call requireSelectedParish()
  2. Check user has permission
  3. UPDATE calendar_events SET deleted_at = now()
  4. Update master_event.field_values to remove this calendar_event_id
  5. Revalidate paths

FUNCTION getCalendarEventsForDateRange(
  start_date: string,
  end_date: string
): Promise<CalendarEventWithRelations[]>
  1. Call requireSelectedParish()
  2. SELECT calendar_events 
     WHERE start_datetime >= :start_date 
     AND start_datetime <= :end_date
     AND deleted_at IS NULL
     AND is_cancelled = false
  3. Include all relations (master_event, location, input_field_definition)
  4. Order by start_datetime ASC
  5. Return results
```

#### Update event-types.ts

Update existing file: `src/lib/actions/event-types.ts`

**Pattern Reference:** This is PSEUDO-CODE describing additions to the existing file.

```
FUNCTION getRoleDefinitions(event_type_id: string): Promise<RoleDefinition[]>
  1. Call requireSelectedParish()
  2. SELECT role_definitions FROM event_types WHERE id = :event_type_id
  3. Parse JSONB and return roles array
  4. IF no roles defined, return empty array

FUNCTION updateRoleDefinitions(event_type_id, roles: RoleDefinition[]): Promise<void>
  1. Call requireSelectedParish()
  2. Check user is Admin (only admins can modify event types)
  3. Validate roles array:
     - All roles have unique id
     - All roles have non-empty name
     - All roles have required boolean
  4. Convert roles array to JSONB: {"roles": [...]}
  5. UPDATE event_types SET role_definitions = :roles_jsonb
  6. Revalidate paths

FUNCTION getEventTypesBySystemType(system_type: SystemType): Promise<EventType[]>
  1. Call requireSelectedParish()
  2. SELECT * FROM event_types
     WHERE parish_id = :parish_id
     AND system_type = :system_type
     AND deleted_at IS NULL
     ORDER BY "order" ASC
  3. Return results
```

### UI Component Updates

#### Components to Create (New)

**1. MasterEventForm Component**

Location: `src/components/master-event-form.tsx`

Purpose: Unified form for creating/editing master_events (replaces separate sacrament forms)

Pattern: Follows existing form patterns (see FORMS.md)

Key Features:
- Dynamic field rendering based on input_field_definitions from event_type
- Special handling for calendar_event type fields (renders date/time/location pickers)
- Integration with FormField component
- isEditing pattern for edit mode
- SaveButton and CancelButton components

**2. CalendarEventField Component**

Location: `src/components/calendar-event-field.tsx`

Purpose: Date/time/location picker specifically for calendar_event input type

Similar to: PersonPickerField pattern (wraps FormField)

Renders:
- Date picker (start_datetime date portion)
- Time picker (start_datetime time portion)
- Optional end time picker (end_datetime)
- Location picker (LocationPickerField)

**3. RoleAssignmentSection Component**

Location: `src/components/role-assignment-section.tsx`

Purpose: Display and manage role assignments on master_event view page

Features:
- Shows roles from event_type.role_definitions
- For each role, shows assigned person (if any)
- "Assign Person" button opens PersonPicker
- "Remove" button to unassign
- Displays notes field
- Indicates required roles

**4. SystemTypeFilter Component**

Location: `src/components/filters/system-type-filter.tsx`

Purpose: Checkbox filter for system types (Mass, Special Liturgy, Sacrament, Event)

Similar to: Existing status filter components

Uses: SYSTEM_TYPE_METADATA for labels and icons

#### Components to Update (Existing)

**1. Main Sidebar** (`src/components/main-sidebar.tsx`)

Changes:
- Replace current navigation structure
- Show 4 top-level system types: Masses, Special Liturgies, Sacraments, Events
- Special Liturgies and Sacraments expand to show event_types
- Masses and Events navigate directly to list pages
- Use SYSTEM_TYPE_METADATA for icons and labels

PSEUDO-CODE:

```
IMPORT SYSTEM_TYPE_METADATA from constants/system-types

FUNCTION MainSidebar():
  FETCH event_types for current parish
  GROUP event_types by system_type
  
  RENDER navigation:
    FOR EACH system_type IN ['mass', 'special-liturgy', 'sacrament', 'event']:
      GET metadata = SYSTEM_TYPE_METADATA[system_type]
      
      IF system_type === 'mass' OR system_type === 'event':
        // Single link, no expansion
        RENDER link to /masses or /events with icon and label
      ELSE IF system_type === 'special-liturgy' OR system_type === 'sacrament':
        // Expandable section
        RENDER collapsible section with icon and label:
          FOR EACH event_type WHERE event_type.system_type = system_type:
            RENDER link to /{system_type}/{event_type.slug}
              Example: /special-liturgies/easter-vigil
```

**2. Calendar Component** (`src/components/calendar/...`)

Changes:
- Update to fetch calendar_events (not occasions)
- Compute title from master_event + input_field_definition.name
- Show system_type icon/color
- Filter by system_type, event_type, location
- Handle is_cancelled events (show with strikethrough or hide)

**3. SearchCard Component** (multiple list pages)

No changes needed - existing pattern works for master_events

Filters to add:
- System type filter
- Status filter
- Date range filter

**4. DataTable Component** (multiple list pages)

Update to show master_events:
- Computed title column (from key persons + event_type.name)
- Status badge column
- Calendar events count column (how many calendar_events)
- Actions column (view, edit, delete)

### File Structure

#### New Modules

```
/src/app/(main)/
├── masses/
│   ├── page.tsx (list all mass master_events, server component)
│   ├── masses-list-client.tsx (client component for list UI)
│   ├── create/page.tsx (server component with breadcrumbs)
│   ├── [id]/page.tsx (view mass details, server component)
│   ├── [id]/edit/page.tsx (server component with breadcrumbs)
│   ├── [id]/mass-view-client.tsx (client component for view UI)
│   └── mass-form.tsx (unified create/edit form, client component)
│
├── special-liturgies/
│   ├── [event_type_slug]/
│   │   ├── page.tsx (list for this special liturgy type)
│   │   ├── create/page.tsx
│   │   ├── [id]/page.tsx
│   │   └── [id]/edit/page.tsx
│   └── (shared components with sacraments)
│
├── sacraments/
│   ├── [event_type_slug]/
│   │   ├── page.tsx (list for this sacrament type)
│   │   ├── create/page.tsx
│   │   ├── [id]/page.tsx
│   │   └── [id]/edit/page.tsx
│   └── (shared components)
│
├── events/
│   ├── page.tsx (list all event master_events)
│   ├── events-list-client.tsx
│   ├── create/page.tsx
│   ├── [id]/page.tsx
│   ├── [id]/edit/page.tsx
│   └── event-form.tsx
│
└── calendar/
    ├── page.tsx (unified calendar view, server component)
    └── calendar-client.tsx (client component)
```

#### Settings Pages

```
/src/app/(main)/settings/
├── masses/
│   ├── page.tsx (configure mass event_types)
│   └── [id]/edit/page.tsx
│
├── special-liturgies/
│   ├── page.tsx (configure special liturgy event_types)
│   └── [id]/edit/page.tsx
│
├── sacraments/
│   ├── page.tsx (configure sacrament event_types)
│   └── [id]/edit/page.tsx
│
└── events/
    ├── page.tsx (configure event event_types)
    └── [id]/edit/page.tsx
```

**NOTE:** Delete `/src/app/(main)/settings/event-types/` (replaced by four separate settings pages above)

### Testing Requirements

#### Unit Tests

Create test files in `/tests/`:

- `master-events.spec.ts` - CRUD operations for master_events
- `calendar-events.spec.ts` - CRUD operations for calendar_events
- `master-event-roles.spec.ts` - Role assignment operations
- `event-types-system-type.spec.ts` - Event type filtering by system_type

**Test Scenarios:**

1. **Master Events:**
   - Create master_event with calendar_event fields
   - Update master_event and calendar_events
   - Delete master_event (cascade to calendar_events and roles)
   - Query by system_type
   - Query by status
   - Compute title with key persons
   - Compute title without key persons (date fallback)

2. **Calendar Events:**
   - Create calendar_event (must have master_event_id)
   - Cannot create calendar_event without master_event
   - Unique constraint on (master_event_id, input_field_definition_id)
   - Cancel calendar_event (is_cancelled = true)
   - Date range queries for calendar display
   - Compute title with single calendar_event field (no suffix)
   - Compute title with multiple calendar_event fields (with suffix)

3. **Role Assignments:**
   - Assign person to role on master_event
   - Cannot assign same person to same role twice
   - Remove role assignment (soft delete)
   - Query all roles for event
   - Validate role_id exists in event_type.role_definitions

4. **System Types:**
   - Filter event_types by system_type
   - Create event_type with each system_type
   - Validate CHECK constraint on system_type
   - Sidebar navigation shows correct system types

5. **Field Definitions:**
   - calendar_event type creates calendar_events record
   - is_primary constraint (only one primary calendar_event per event_type)
   - Unique constraint prevents duplicate calendar_events for same field

#### Integration Tests

- End-to-end flow: Create event_type → Create master_event → Assign roles → Generate script
- Calendar view: Fetch all calendar_events for date range
- Migration: Verify masses table can be deleted without errors
- Title computation: Verify computed titles match expected format

### Documentation Updates

#### Files to Update

**1. MODULE_REGISTRY.md**

Add:
- Masses module (`/masses`) - system_type: 'mass'
- Special Liturgies module (`/special-liturgies/[slug]`) - system_type: 'special-liturgy'
- Sacraments module (`/sacraments/[slug]`) - system_type: 'sacrament'
- Events module (`/events`) - system_type: 'event'

Remove:
- Old dynamic events references

**2. COMPONENT_REGISTRY.md**

Add:
- MasterEventForm - Unified form for all master_events
- CalendarEventField - Date/time/location picker for calendar_event fields
- RoleAssignmentSection - Role management on view pages
- SystemTypeFilter - Filter by system type

**3. DATABASE.md**

Update:
- Document new calendar_events structure (start_datetime, input_field_definition_id)
- Document master_event_roles table
- Document role_definitions JSONB in event_types
- Update ER diagram showing 3-table hierarchy (event_types → master_events → calendar_events)
- Remove masses table documentation

**4. ARCHITECTURE.md**

Update:
- Data flow for master_events → calendar_events
- WithRelations pattern for MasterEventWithRelations
- Title computation algorithm (key persons + event_type.name + field suffix)
- System type organization (4 categories)

**5. CODE_CONVENTIONS.md**

Add:
- System type metadata pattern (constants file, not database)
- Computed title pattern for calendar events
- Role definitions JSONB structure
- calendar_event input type creates records (not just stores values)

**6. FORMATTERS.md**

Add:
- computeMasterEventTitle() helper
- computeCalendarEventTitle() helper
- Document title computation rules

### Security Considerations

#### RLS Policies

**Consistent across all system_types:**
- Parish scoping via parish_id on all tables
- Same permission levels (admin, staff, ministry-leader can write; all can read)
- No special permissions per system_type

**Cascade deletes:**
- master_event deleted → calendar_events deleted (CASCADE)
- master_event deleted → master_event_roles deleted (CASCADE)
- person deleted → cannot delete if assigned to roles (RESTRICT on master_event_roles)
- input_field_definition deleted → cannot delete if calendar_events reference it (RESTRICT)

#### Permission Enforcement

**Create operations:**
- requireSelectedParish() validates user belongs to parish
- Check user role includes admin, staff, or ministry-leader
- Ministry-leader permissions validated per-module (future: configurable access)

**Update operations:**
- Same as create
- Users can only update records in their parish

**Delete operations:**
- Same as create
- Soft delete (set deleted_at) not hard delete

**Role assignments:**
- Validate role_id exists in event_type.role_definitions before assigning
- Prevent duplicate assignments (unique constraint on master_event_id, role_id, person_id)
- Only admin, staff, ministry-leader can assign roles

#### Data Validation

**Server action validation:**
- All create/update operations validate with Zod schemas
- calendar_event type fields must create actual calendar_events records
- input_field_definition_id must match event_type of master_event
- start_datetime must be valid TIMESTAMPTZ
- end_datetime must be after start_datetime (if provided)

**Database constraints:**
- CHECK constraints on system_type, status, input field type
- NOT NULL constraints on master_event_id, input_field_definition_id
- UNIQUE constraints prevent duplicate calendar_events per field
- Foreign key constraints ensure referential integrity

### Implementation Complexity

**Complexity Rating:** High

**Reason:** This is a major architectural refactor that touches:
- 8 database migrations (event_types, input_field_definitions, calendar_events, master_events, master_event_roles, new indexes, delete masses)
- 3 new server action files (master-events, calendar-events, updates to event-types)
- 1 new constants file (system-types)
- 15+ TypeScript interface updates
- 4 new modules (masses, special-liturgies, sacraments, events)
- 1 major sidebar navigation refactor
- 1 calendar component overhaul
- 8+ new UI components
- Delete 1 entire table (masses)
- Testing across all layers

**What makes it complex:**
- Unified data model requires careful migration planning
- Title computation logic depends on multiple tables and field definitions
- Role definitions stored as JSONB require careful validation
- Calendar event generation must validate input_field_definitions
- Navigation structure depends on dynamic event_type data
- Breaking change to existing modules (weddings, funerals, etc.)
- Must ensure calendar_events always have master_event (no standalone)

**What makes it manageable:**
- Greenfield approach (no backward compatibility needed)
- Clear 3-table hierarchy is simpler than current fragmentation
- Existing patterns can be reused (FormField, WithRelations, server actions)
- Strong TypeScript types prevent many bugs
- RLS policies are consistent (no per-system_type variance)
- Good documentation exists for similar patterns

**Focus on WHAT, not HOW LONG:**
This section describes the complexity of the feature, not time estimates. Implementation focus should be on:
- Database integrity and consistency
- Type safety across all layers
- UI/UX patterns matching existing modules
- Comprehensive testing of all scenarios
- Clear documentation for future developers

### Dependencies and Blockers

**Dependencies:**
- None - This is a foundational change that other features will build on

**Potential Blockers:**
- Event Categories implementation (2025-12-13-event-categories.md) - Some overlap, need to reconcile
- Existing event type data will be deleted (greenfield - acceptable)
- Existing masses data will be deleted (greenfield - acceptable)
- Existing modules using calendar_events/occasions need updates after migration

**Post-Implementation Dependencies:**
After this unified model is implemented, these features will need updates:
- All existing sacrament modules (weddings, funerals, etc.) must be updated to use new master_events structure
- Mass Scheduling module must be updated to create master_events (not masses table)
- Weekend Summary must be updated to query calendar_events
- Print scripts must work with new master_event structure

### Documentation Inconsistencies Found

**1. Event Categories vs Unified Event Model**

The existing requirements document `2025-12-13-event-categories.md` proposes using the `masses` table for both Masses and Special Liturgies. This conflicts with the unified model which deletes the masses table entirely.

**Resolution:** The unified model supersedes the event categories design. Masses become master_events with system_type = 'mass'. Special Liturgies also become master_events with system_type = 'special-liturgy'.

**Action Required:** Update 2025-12-13-event-categories.md to mark it as superseded by this unified model.

**2. Standalone calendar_events**

The current `calendar_events` (formerly occasions) table allows `is_standalone = true` for events not linked to master_events. The unified model requires ALL calendar_events to have a master_event.

**Resolution:** Remove standalone calendar_events concept. General parish events (Zumba, Parish Picnic) get their own master_event with a simple event_type (system_type = 'event').

**Action Required:** Update all documentation references to standalone events to explain they now use master_events.

**3. Occasion vs calendar_event terminology**

Current code uses "occasion" but vision document uses "calendar_event". TypeScript types use "Occasion" interface.

**Resolution:** Rename to calendar_event everywhere (database column name in input_field_definitions.type CHECK constraint, TypeScript types, UI labels, documentation). This is a breaking change but acceptable for greenfield.

**Action Required:** 
- Update all TypeScript interfaces (Occasion → CalendarEvent)
- Update all server actions
- Update all UI components
- Update all documentation

**4. event_type.category vs event_type.system_type**

Current database column is `category` with values including underscore (`special_liturgy`). Vision document proposes `system_type` with hyphen (`special-liturgy`).

**Resolution:** Rename column to `system_type` and update value to use hyphen for consistency with URL slugs and TypeScript type names.

**Action Required:**
- Migration to rename column
- Migration to update data ('special_liturgy' → 'special-liturgy')
- Update all TypeScript types
- Update all server actions
- Update all documentation

**5. Documentation says "no system_types table" but doesn't explain alternatives**

Some documentation implies system types might be in a database table, but the unified model uses an enum with metadata in application constants.

**Resolution:** System types are NOT in a database table. They are a TypeScript enum with metadata stored in `src/lib/constants/system-types.ts`. This is the correct approach for stable, small enums.

**Action Required:**
- Clarify in DATABASE.md that system_type is an enum field, not a foreign key
- Document SYSTEM_TYPE_METADATA constants pattern in CODE_CONVENTIONS.md
- Update ARCHITECTURE.md to show enum usage

### Next Steps

**Status:** Ready for Development

**Hand off to developer-agent for implementation.**

**Implementation Phases:**

**PHASE 1 - Database Foundations (Priority: Critical)**
1. Create `src/lib/constants/system-types.ts` with SYSTEM_TYPE_METADATA
2. Run migration: Rename event_types.category → system_type
3. Run migration: Update input_field_definitions type constraint (occasion → calendar_event)
4. Run migration: Recreate calendar_events table with new structure
5. Run migration: Add status column to master_events
6. Run migration: Create master_event_roles table
7. Run migration: Add role_definitions column to event_types
8. Run migration: Delete masses table
9. Verify all migrations applied successfully

**PHASE 2 - TypeScript Types (Priority: Critical)**
1. Update `src/lib/types/event-types.ts`:
   - Rename EventTypeCategory values
   - Rename InputFieldType (occasion → calendar_event)
   - Update EventType interface (category → system_type, add role_definitions)
   - Add RoleDefinitions and RoleDefinition interfaces
   - Add MasterEventStatus type
   - Update MasterEvent interface (add status field)
   - Update MasterEventWithRelations (add roles field)
   - Add MasterEventRole and MasterEventRoleWithPerson interfaces
   - Rename Occasion → CalendarEvent
   - Update CalendarEvent interface (remove label, add input_field_definition_id, rename date/time → start_datetime)
   - Update CalendarEventWithRelations
2. Verify TypeScript compilation succeeds

**PHASE 3 - Server Actions (Priority: Critical)**
1. Create `src/lib/actions/master-events.ts`:
   - getMasterEvents with filtering
   - getMasterEventById with relations
   - createMasterEvent (handles calendar_events creation)
   - updateMasterEvent (handles calendar_events updates)
   - deleteMasterEvent (soft delete)
   - getMasterEventRoles
   - assignRole
   - removeRoleAssignment
   - computeMasterEventTitle
   - computeCalendarEventTitle
2. Create `src/lib/actions/calendar-events.ts`:
   - getCalendarEvents with filtering
   - getCalendarEventById
   - createCalendarEvent
   - updateCalendarEvent
   - cancelCalendarEvent
   - deleteCalendarEvent
   - getCalendarEventsForDateRange
3. Update `src/lib/actions/event-types.ts`:
   - getRoleDefinitions
   - updateRoleDefinitions
   - getEventTypesBySystemType
4. Create Zod schemas for validation

**PHASE 4 - UI Components (Priority: High)**
1. Create `src/components/master-event-form.tsx`
2. Create `src/components/calendar-event-field.tsx`
3. Create `src/components/role-assignment-section.tsx`
4. Create `src/components/filters/system-type-filter.tsx`
5. Update `src/components/main-sidebar.tsx` (new navigation structure)
6. Update calendar components to use new calendar_events structure

**PHASE 5 - Module Pages (Priority: High)**
1. Create `/src/app/(main)/masses/` module (8 files)
2. Create `/src/app/(main)/special-liturgies/[event_type_slug]/` structure
3. Create `/src/app/(main)/sacraments/[event_type_slug]/` structure
4. Create `/src/app/(main)/events/` module (8 files)
5. Update `/src/app/(main)/calendar/` to use new structure
6. Create settings pages:
   - `/src/app/(main)/settings/masses/`
   - `/src/app/(main)/settings/special-liturgies/`
   - `/src/app/(main)/settings/sacraments/`
   - `/src/app/(main)/settings/events/`
7. Delete `/src/app/(main)/settings/event-types/`

**PHASE 6 - Testing (Priority: High)**
1. Create `tests/master-events.spec.ts`
2. Create `tests/calendar-events.spec.ts`
3. Create `tests/master-event-roles.spec.ts`
4. Create `tests/event-types-system-type.spec.ts`
5. Run all tests and verify passing
6. Test end-to-end flows in browser

**PHASE 7 - Documentation (Priority: Medium)**
1. Update MODULE_REGISTRY.md (add 4 new modules, remove old references)
2. Update COMPONENT_REGISTRY.md (add new components)
3. Update DATABASE.md (new schema, ER diagram)
4. Update ARCHITECTURE.md (data flow, title computation)
5. Update CODE_CONVENTIONS.md (system type pattern, title computation)
6. Update FORMATTERS.md (title computation helpers)
7. Mark 2025-12-13-event-categories.md as superseded

**PHASE 8 - Cleanup (Priority: Low)**
1. Remove any old masses-related code not in use
2. Update any remaining references to "occasion" → "calendar_event"
3. Final testing pass
4. User acceptance testing

**Priority Levels:**
- **Critical**: Must be completed in order, blocks all other work
- **High**: Can be worked on in parallel after Critical phase completes
- **Medium**: Can be deferred until after High priority items
- **Low**: Nice-to-have, can be done anytime

**Recommended Approach:**
- Complete Phase 1-2 sequentially (database + types)
- Complete Phase 3 (server actions)
- Complete Phase 4-5 in parallel (UI components + module pages)
- Complete Phase 6 (testing)
- Complete Phase 7-8 as time allows (documentation + cleanup)

**Note:** This implementation plan focuses on WHAT needs to be done and in what ORDER, not how long each phase will take. The phases are designed to minimize rework and ensure each layer is solid before building on top of it.
