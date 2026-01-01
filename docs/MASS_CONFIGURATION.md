# Mass Configuration Architecture

> This document explains how Mass configuration works in Outward Sign, including the relationship between Mass Types, Schedules, and Individual Masses.

## Overview

Mass configuration in Outward Sign follows a **three-level system**:

| Level | Name | Tables | Purpose |
|-------|------|--------|---------|
| 1 | **Mass Type** | `event_types` + `input_field_definitions` | Define WHAT roles exist |
| 2 | **Mass Schedule** | `mass_times_templates` + `mass_times_template_items` | Define WHEN and HOW MANY |
| 3 | **Individual Mass** | `master_events` + `calendar_events` + `people_event_assignments` | Assign WHO |

These levels build on each other:
- **Level 1** defines the available ministry positions (presider, lector, usher, etc.)
- **Level 2** defines recurring schedules with role quantities and default assignments
- **Level 3** creates actual mass instances with specific people assigned

### Automation Support

Future automation tools will use this structure:
1. Read `role_quantities` from Level 2 to know how many slots to fill
2. Use `default_assignments` as the starting point for assignments
3. Fill remaining open slots from the availability pool

## Visual Hierarchy

```
MASS CONFIGURATION (Three-Level System)
│
├── LEVEL 1: MASS TYPES (What roles exist)
│   │ Location: Settings → Mass Types
│   │ Route: /settings/mass-liturgies
│   │ Tables: event_types, input_field_definitions
│   │
│   ├── Event Type: "Sunday Mass"
│   │   └── Roles: Presider, Homilist, Lector, Usher, Musician...
│   │
│   ├── Event Type: "Daily Mass"
│   │   └── Roles: Presider, Lector...
│   │
│   └── Event Type: "Funeral Mass"
│       └── Roles: Presider, Homilist, Cantor, Pallbearers...
│
├── LEVEL 2: MASS SCHEDULES (When + How Many + Default Who)
│   │ Location: Settings → Mass Schedules
│   │ Route: /settings/mass-schedules
│   │ Tables: mass_times_templates, mass_times_template_items
│   │
│   ├── Schedule: "Sunday Masses"
│   │   ├── 8:00 AM → Sunday Mass type
│   │   │   ├── role_quantities: {presider: 1, lector: 2, usher: 4}
│   │   │   └── default_assignments: {presider: "fr-smith-uuid"}
│   │   │
│   │   ├── 10:00 AM → Sunday Mass type
│   │   │   ├── role_quantities: {presider: 1, lector: 2, usher: 6}
│   │   │   └── default_assignments: {presider: "fr-jones-uuid"}
│   │   │
│   │   └── 5:00 PM (Vigil) → Sunday Mass type
│   │       ├── role_quantities: {presider: 1, lector: 1, usher: 2}
│   │       └── default_assignments: {}
│   │
│   └── Schedule: "Weekday Masses"
│       └── 7:00 AM → Daily Mass type
│           └── role_quantities: {presider: 1, lector: 1}
│
└── LEVEL 3: MASS INSTANCES (Who is assigned)
    │ Location: Sidebar → Masses → Our Mass Liturgies
    │ Route: /mass-liturgies
    │ Tables: master_events, calendar_events, people_event_assignments
    │
    └── Created from schedules, assignments stored in people_event_assignments
```

## Database Schema

### Mass Types (Event Types)

Mass types are stored in `event_types` with `system_type = 'mass-liturgy'`:

```sql
-- event_types table
id              UUID PRIMARY KEY
parish_id       UUID REFERENCES parishes(id)
name            TEXT          -- "Sunday Mass", "Daily Mass"
slug            TEXT          -- "sunday-mass", "daily-mass"
system_type     TEXT          -- 'mass-liturgy' for mass types
description     TEXT
icon            TEXT
```

### Ministry Positions (Input Field Definitions)

Roles/positions are stored in `input_field_definitions`:

```sql
-- input_field_definitions table
id                      UUID PRIMARY KEY
event_type_id           UUID REFERENCES event_types(id)
name                    TEXT          -- "Presider", "Lector", "Usher"
property_name           TEXT          -- "presider", "lector", "usher" (used as key)
type                    TEXT          -- 'person' for ministry roles
is_per_calendar_event   BOOLEAN       -- TRUE = per-mass role, FALSE = per-liturgy
sort_order              INTEGER
```

**Key distinction:**
- `is_per_calendar_event = TRUE`: Role is assigned per individual mass (Presider, Lector)
- `is_per_calendar_event = FALSE`: Role is assigned once for the liturgy type (Coordinator)

### Mass Schedules (Templates)

Schedule containers are stored in `mass_times_templates`:

```sql
-- mass_times_templates table
id              UUID PRIMARY KEY
parish_id       UUID REFERENCES parishes(id)
name            TEXT          -- "Sunday Masses", "Weekday Masses"
description     TEXT
day_of_week     TEXT          -- 'SUNDAY', 'MONDAY', ..., 'MOVABLE'
is_active       BOOLEAN
```

### Mass Times (Template Items) - Level 2

Individual time slots with role quantities and default assignments in `mass_times_template_items`:

```sql
-- mass_times_template_items table
id                      UUID PRIMARY KEY
mass_times_template_id  UUID REFERENCES mass_times_templates(id)
event_type_id           UUID REFERENCES event_types(id)  -- Links to mass type (Level 1)
time                    TIME          -- '10:00:00'
day_type                day_type      -- 'IS_DAY' or 'DAY_BEFORE' (vigil)
role_quantities         JSONB         -- HOW MANY of each role: {"lector": 2, "usher": 4}
default_assignments     JSONB         -- Default WHO: {"presider": "uuid", "lector": ["uuid1", null]}
location_id             UUID          -- Default location
length_of_time          INTEGER       -- Duration in minutes
```

**The `role_quantities` JSONB structure (HOW MANY):**
```json
{
  "presider": 1,
  "homilist": 1,
  "lector": 2,
  "usher": 4,
  "musician": 3
}
```

**The `default_assignments` JSONB structure (Default WHO):**
```json
{
  "presider": "fr-smith-uuid",
  "homilist": "deacon-jones-uuid",
  "lector": ["maria-uuid", null]
}
```

- For roles with `quantity = 1`: Use a single UUID string
- For roles with `quantity > 1`: Use an array (null = open slot)
- Keys must match `property_name` from `input_field_definitions` for the linked `event_type_id`

**How Automation Uses This:**
1. `role_quantities` tells the system how many slots to fill for each role
2. `default_assignments` provides starting values (the "usual" people for this time slot)
3. Automation fills remaining null slots from the availability pool

## Setup Workflow

For a parish administrator setting up mass configuration:

### Step 1: Create Mass Types
1. Go to **Settings → Mass Types**
2. Create types like "Sunday Mass", "Daily Mass", "Funeral Mass"
3. For each type, configure the available roles (ministry positions)

### Step 2: Configure Roles for Each Type
1. Click on a mass type → "Configure Fields"
2. Add person-type fields for each ministry role
3. Mark roles as "Per Mass" if they're assigned individually per mass time
4. Example roles: Presider, Homilist, Lector, Extraordinary Minister, Usher, Sacristan

### Step 3: Create Mass Schedules
1. Go to **Settings → Mass Schedules**
2. Create schedules for different days: "Sunday", "Weekday", etc.
3. Add mass times to each schedule

### Step 4: Configure Role Quantities
1. For each mass time, select the appropriate mass type
2. Set how many of each role are needed for that specific mass
3. Example: Sunday 10am Mass needs 1 Presider, 2 Lectors, 6 Ushers

## Code Locations

### Server Actions
- `src/lib/actions/mass-times-templates.ts` - CRUD for schedules
- `src/lib/actions/mass-times-template-items.ts` - CRUD for time slots
- `src/lib/actions/event-types.ts` - CRUD for mass types
- `src/lib/actions/input-field-definitions.ts` - CRUD for roles/positions

### UI Pages
- `/settings/mass-liturgies/` - Mass types list and create
- `/settings/event-types/[slug]/fields/` - Role configuration
- `/settings/mass-schedules/` - Schedule list and create
- `/settings/mass-schedules/[id]/` - Schedule detail with time configuration

### Key Interfaces
```typescript
// Level 1: Mass type with its roles
interface EventType {
  id: string
  name: string
  slug: string
  system_type: 'mass-liturgy' | 'special-liturgy' | 'parish-event'
}

// Level 1: Role/position definition
interface InputFieldDefinition {
  id: string
  event_type_id: string
  name: string
  property_name: string  // Key used in role_quantities and default_assignments
  type: 'person' | 'text' | 'number' | ...
  is_per_calendar_event: boolean
}

// Level 2: Schedule template
interface MassTimesTemplate {
  id: string
  name: string
  day_of_week: string
  items?: MassTimesTemplateItem[]
}

// Level 2: Individual mass time with quantities and defaults
// For roles with quantity=1: use UUID string
// For roles with quantity>1: use array with nulls for open slots
type DefaultAssignments = Record<string, string | (string | null)[]>

interface MassTimesTemplateItem {
  id: string
  time: string
  day_type: 'IS_DAY' | 'DAY_BEFORE'
  event_type_id?: string
  role_quantities: Record<string, number>    // HOW MANY: property_name → count
  default_assignments: DefaultAssignments    // Default WHO: property_name → person(s)
  location_id?: string
  length_of_time?: number
}

// Level 3: Individual mass assignments stored in people_event_assignments
interface PeopleEventAssignment {
  id: string
  master_event_id: string
  calendar_event_id: string | null  // null = template-level, populated = per-occurrence
  field_definition_id: string
  person_id: string
}
```

## Common Tasks

### Adding a New Role to a Mass Type
1. Navigate to the mass type's field configuration
2. Add a new field with type "person"
3. Set `is_per_calendar_event = true` for per-mass roles
4. The `property_name` becomes the key for `role_quantities`

### Changing Role Quantities for a Mass Time
1. Navigate to the schedule containing the mass time
2. Expand the mass time configuration
3. Adjust the quantity numbers for each role

### Creating a New Mass Schedule
1. Create the schedule template (e.g., "Holy Day Masses")
2. Add mass times with specific times
3. Select the mass type for each time
4. Configure role quantities

## Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        MASS TYPES                                │
│                  (event_types table)                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Sunday Mass  │  │ Daily Mass   │  │ Funeral Mass │           │
│  │ slug: sunday │  │ slug: daily  │  │ slug: funeral│           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                 │                    │
│         ▼                 ▼                 ▼                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              ROLES (input_field_definitions)              │   │
│  │  Presider, Homilist, Lector, Usher, Musician, Cantor...  │   │
│  │  Each has: property_name, is_per_calendar_event          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ event_type_id
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MASS SCHEDULES                              │
│               (mass_times_templates table)                       │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │ Sunday Schedule │  │ Weekday Schedule│                       │
│  │ day: SUNDAY     │  │ day: MONDAY     │                       │
│  └────────┬────────┘  └────────┬────────┘                       │
│           │                    │                                 │
│           ▼                    ▼                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           MASS TIMES (template_items)                     │   │
│  │                                                           │   │
│  │  8:00 AM  → Sunday Mass type                             │   │
│  │            → role_quantities: {presider:1, lector:2}     │   │
│  │                                                           │   │
│  │  10:00 AM → Sunday Mass type                             │   │
│  │            → role_quantities: {presider:1, lector:2,     │   │
│  │                                usher:6, musician:3}      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Terminology Reference

| Term | Meaning |
|------|---------|
| Mass Type | A category of mass (Sunday Mass, Daily Mass) - stored as event_type (Level 1) |
| Mass Schedule | A template for recurring mass times (Sunday Schedule) - stored as mass_times_template (Level 2) |
| Mass Time | A specific time slot within a schedule (10:00 AM) - stored as mass_times_template_item (Level 2) |
| Role/Position | A ministry position (Presider, Lector) - stored as input_field_definition (Level 1) |
| Role Quantity | How many of a role are needed for a specific mass time - stored in `role_quantities` JSONB |
| Default Assignment | The "usual" person(s) for a role at a specific time - stored in `default_assignments` JSONB |
| Per-Mass Role | A role assigned individually per mass (vs. per liturgy type) |
| Vigil | A mass held the evening before (day_type = 'DAY_BEFORE') |
| Individual Mass | An actual scheduled mass with people assigned - stored in master_events/calendar_events (Level 3) |

## Three-Level Summary

```
Level 1: WHAT roles exist
├── event_types (Sunday Mass, Daily Mass)
└── input_field_definitions (presider, lector, usher...)

Level 2: WHEN & HOW MANY
├── mass_times_templates (Sunday Schedule, Weekday Schedule)
└── mass_times_template_items
    ├── role_quantities: {"presider": 1, "lector": 2}
    └── default_assignments: {"presider": "fr-smith-uuid"}

Level 3: WHO is assigned
├── master_events (the mass instance)
├── calendar_events (scheduled date/time)
└── people_event_assignments (actual people assigned)
```
