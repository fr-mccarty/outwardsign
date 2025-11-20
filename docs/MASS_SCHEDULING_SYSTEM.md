# Mass Scheduling System - Data Structure

## Overview

The Mass Scheduling System is designed to manage recurring mass schedules and assign people to liturgical roles for Catholic parishes. The system handles:

- **Recurring Mass Schedules** - Define mass times for weekends, daily masses, holidays, and special occasions
- **Role Templates** - Define which roles are needed for different types of masses
- **Individual Mass Instances** - Track specific masses tied to calendar dates
- **Role Assignments** - Assign people to specific roles for specific masses
- **Availability & Preferences** - Track when people are available and their role preferences
- **Blackout Dates** - Track when people are unavailable (vacations, travel, etc.)

---

## Core Concepts

### Three-Tier Structure

The system operates on a three-tier architecture:

1. **Templates** - Reusable definitions (mass schedules, role requirements)
2. **Instances** - Specific occurrences (individual masses on specific dates)
3. **Assignments** - People assigned to roles for specific mass instances

### Mass vs. Event Relationship

- **Event** - A calendar entry (date, time, location)
- **Mass** - A liturgical celebration that can be linked to an Event
- A Mass can exist independently OR be linked to an Event for calendar integration

---

## Tables & Relationships

### 1. Global Liturgical Events (Read-Only Reference Data)

**Table:** `global_liturgical_events`

Imported liturgical calendar data from [John Romano D'Orazio's API](https://litcal.johnromanodorazio.com). This is read-only global data shared across all parishes.

```sql
CREATE TABLE global_liturgical_events (
  id UUID PRIMARY KEY,
  event_key TEXT NOT NULL,           -- 'Advent1', 'StFrancisXavier', etc.
  date DATE NOT NULL,
  year INTEGER NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en_US',
  event_data JSONB NOT NULL,         -- Full liturgical event details
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(event_key, date, locale)
);
```

**Purpose:** Provides liturgical context for masses (feast days, solemnities, ordinary time, etc.)

**Key Points:**
- Global data (no `parish_id`)
- Read-only for parishes
- Used for reference, not scheduling

---

### 2. Mass Types (Parish-Customizable Category Tags)

**Table:** `mass_types`

Define mass category tags that parishes can customize. These are flexible labels that can be applied to masses in any combination.

```sql
CREATE TABLE mass_types (
  id UUID PRIMARY KEY,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  key TEXT NOT NULL,                 -- 'WEEKEND', 'DAILY', 'HOLIDAY', 'SPECIAL', 'YOUTH', 'BILINGUAL', or custom
  label_en TEXT NOT NULL,
  label_es TEXT NOT NULL,
  description TEXT,
  color TEXT,                        -- UI color (hex)
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,   -- System types cannot be deleted
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(parish_id, key)
);
```

**Purpose:** Provide flexible category tags for organizing, filtering, and identifying masses

**Key Points:**
- Each parish has default system types (WEEKEND, DAILY, HOLIDAY, SPECIAL)
- Parishes can add custom types (e.g., 'YOUTH_MASS', 'LATIN_MASS', 'BILINGUAL', 'FAMILY_MASS')
- System types cannot be deleted
- Bilingual labels (English/Spanish)
- **Multiple tags can be applied to a single mass** (stored as JSONB array on masses and templates)

**Example Tags:**
- "Weekend" + "Youth Mass" → Sunday 10:00 AM youth-focused liturgy
- "Daily" + "Bilingual" → Weekday mass in English and Spanish
- "Holiday" + "Special" → Christmas or Easter celebration

---

### 3. Mass Times (Recurring Schedule Templates)

**Table:** `mass_times`

Define recurring mass schedules (e.g., "Sunday 9:00 AM", "Saturday 5:00 PM vigil"). This is a **reference table only** - it does not auto-create mass records.

```sql
CREATE TABLE mass_times (
  id UUID PRIMARY KEY,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,

  -- Schedule items: [{"day": "SUNDAY", "time": "09:00"}, {"day": "SATURDAY", "time": "17:00"}]
  schedule_items JSONB NOT NULL,

  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  language TEXT DEFAULT 'en',        -- en, es, la (Latin)
  special_designation TEXT,          -- 'Youth Mass', 'Family Mass', 'Traditional Latin Mass'

  effective_start_date DATE,         -- When schedule begins (null = always)
  effective_end_date DATE,           -- When schedule ends (null = no end)

  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Purpose:** Define recurring mass schedules for internal reference (does NOT auto-create mass records)

**Key Points:**
- `schedule_items` is a JSONB array: `[{"day": "SUNDAY", "time": "09:00"}]`
- Days: SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY
- Times: 24-hour format (HH:MM)
- Can have effective date ranges for seasonal schedules
- Internal reference only - does not auto-create individual mass records

---

### 4. Mass Role Definitions

**Table:** `mass_roles`

Define the liturgical roles available at a parish (Lector, Usher, Server, Eucharistic Minister, etc.).

```sql
CREATE TABLE mass_roles (
  id UUID PRIMARY KEY,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  note TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(parish_id, name)
);
```

**Purpose:** Define available liturgical roles per parish

**Key Points:**
- Parish-specific (different parishes may have different roles)
- Examples: "Lector", "Usher", "Server", "Eucharistic Minister", "Cantor", "Sacristan"
- Can be ordered for consistent display

---

### 5. Mass Templates

**Table:** `mass_templates`

**Container for grouping related mass definitions.** This is the top-level template that contains multiple mass template items.

```sql
CREATE TABLE mass_templates (
  id UUID PRIMARY KEY,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                -- 'Weekend Masses', 'Daily Mass Schedule', 'Holiday Masses'
  description TEXT,
  note TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Purpose:** Group related mass definitions together for organization and bulk operations

**Key Points:**
- Container only - does not define specific mass details
- Each template contains multiple `mass_template_items` which define actual masses
- Examples: "Weekend Masses" (contains Sunday 9am, Sunday 11am, Saturday 5pm)
- Used for bulk mass creation (e.g., "Create all weekend masses for next month")

**Example Templates:**
- "Weekend Masses" → Contains multiple Sunday/Saturday mass definitions
- "Daily Mass Schedule" → Contains weekday mass definitions
- "Holiday Masses" → Contains Christmas, Easter, etc.

---

### 6. Mass Template Items

**Table:** `mass_template_items`

**Defines individual masses that will be created from the template.** Each template item becomes a `masses` record when used.

```sql
CREATE TABLE mass_template_items (
  id UUID PRIMARY KEY,
  mass_template_id UUID NOT NULL REFERENCES mass_templates(id) ON DELETE CASCADE,
  day TEXT NOT NULL,                 -- 'SUNDAY', 'MONDAY', etc.
  time TIME NOT NULL,                -- 09:00, 17:00, etc.
  mass_type_ids JSONB DEFAULT '[]'::jsonb,  -- Array of mass_type UUIDs
  language TEXT DEFAULT 'en',        -- en, es, la
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  mass_role_template_id UUID REFERENCES mass_role_templates(id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  special_designation TEXT,          -- 'Youth Mass', 'Family Mass', etc.
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Purpose:** Define specific mass instances that will be created, including day, time, language, tags, and role requirements

**Key Points:**
- **Each template item represents ONE mass definition** that will become a `masses` record
- `day` and `time` specify when this mass occurs (day: SUNDAY/MONDAY/etc, time: HH:MM)
- `mass_type_ids` define the category tags (e.g., ["uuid1", "uuid2"])
- `mass_role_template_id` links to role requirements (how many Lectors, Ushers, etc.)
- `language` specifies the liturgical language
- Multiple items can share the same role template but have different times/languages/tags

**Example Template Items:**
```
mass_template: "Weekend Masses"
  ├─ Item 1: day=SUNDAY, time=09:00, language=en, mass_type_ids=["weekend-uuid"], role_template="Standard Sunday"
  ├─ Item 2: day=SUNDAY, time=11:00, language=es, mass_type_ids=["weekend-uuid","bilingual-uuid"], role_template="Standard Sunday"
  └─ Item 3: day=SATURDAY, time=17:00, language=en, mass_type_ids=["weekend-uuid","vigil-uuid"], role_template="Standard Sunday"
```

---

### 7. Mass Role Templates

**Table:** `mass_role_templates`

**Reusable role requirement sets.** Defines which roles and how many of each are needed for a type of mass.

```sql
CREATE TABLE mass_role_templates (
  id UUID PRIMARY KEY,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                -- 'Standard Sunday Roles', 'Simple Daily Mass', 'Funeral Mass Roles'
  description TEXT,
  note TEXT,
  parameters JSONB,                  -- Future use for template-level settings
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Purpose:** Define reusable sets of role requirements

**Key Points:**
- Defines role counts (e.g., "2 Lectors, 4 Eucharistic Ministers, 3 Ushers")
- Referenced by `mass_template_items` to specify which roles are needed
- Can be reused across multiple mass template items

**Example Templates:**
- "Standard Sunday Roles" → needs 2 Lectors, 4 Eucharistic Ministers, 3 Ushers
- "Simple Daily Mass" → needs 1 Lector, 2 Eucharistic Ministers
- "Funeral Mass Roles" → needs 1 Lector, 2 Eucharistic Ministers, 2 Ushers

---

### 8. Mass Role Template Items

**Table:** `mass_role_template_items`

Individual role requirements within a role template (e.g., "3 Ushers", "2 Lectors").

```sql
CREATE TABLE mass_role_template_items (
  id UUID PRIMARY KEY,
  mass_role_template_id UUID NOT NULL REFERENCES mass_role_templates(id) ON DELETE CASCADE,
  mass_role_id UUID NOT NULL REFERENCES mass_roles(id) ON DELETE RESTRICT,
  count INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  position INTEGER NOT NULL CHECK (position >= 0),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(mass_role_template_id, mass_role_id),  -- Each role appears once per template
  UNIQUE(mass_role_template_id, position)        -- Each position is unique
);
```

**Purpose:** Define how many of each role are needed for a role template

**Key Points:**
- `count` = number of people needed for this role (e.g., 3 ushers)
- `position` = ordering for display (drag-and-drop sorting)
- Each role template can have each role only once

**Example:**
```
Role Template: "Standard Sunday Roles"
  - Item 1: mass_role_id = "Lector", count = 2, position = 0
  - Item 2: mass_role_id = "Usher", count = 3, position = 1
  - Item 3: mass_role_id = "Eucharistic Minister", count = 4, position = 2
```

---

### 9. Masses (Individual Mass Instances)

**Table:** `masses`

Individual mass records for specific dates. **Created from `mass_template_items`.**

```sql
CREATE TABLE masses (
  id UUID PRIMARY KEY,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  mass_type_ids JSONB DEFAULT '[]'::jsonb,  -- Array of mass_type UUIDs (inherited from template item, editable)
  mass_template_item_id UUID REFERENCES mass_template_items(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  presider_id UUID REFERENCES people(id) ON DELETE SET NULL,
  homilist_id UUID REFERENCES people(id) ON DELETE SET NULL,
  liturgical_event_id UUID REFERENCES global_liturgical_events(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'PLANNING',
  announcements TEXT,
  note TEXT,
  petitions TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Purpose:** Represent a specific mass on a specific date

**Key Points:**
- **Created from a `mass_template_item`** - inherits day, time, language, tags, and role requirements
- Can be linked to an `Event` (for calendar integration)
- Can reference a `global_liturgical_events` entry (for liturgical context)
- `mass_template_item_id` links back to the template item that created this mass
- Has presider and homilist (typically priests/deacons)
- Status field for workflow management (PLANNING, CONFIRMED, COMPLETED, etc.)
- **`mass_type_ids`** are automatically copied from the template item when the mass is created, but can be edited afterward

**Date/Time Storage:**
- Mass date/time comes from the linked `Event` (if `event_id` is set)
- If no event is linked, the mass exists independently without calendar integration

**Mass Creation Workflow:**
1. Template item defines: `day=SUNDAY, time=09:00, mass_type_ids=["WEEKEND", "YOUTH_MASS"], language=en, role_template_id=X`
2. When mass is created from template item, all attributes are copied:
   - `mass.mass_type_ids = ["WEEKEND", "YOUTH_MASS"]`
   - `mass.mass_template_item_id = [template item id]`
   - Event created with Sunday 9:00 AM
   - Role instances created based on role template
3. User can edit tags, presider, notes, etc. on individual mass after creation

---

### 10. Mass Role Instances (Actual Role Assignments)

**Table:** `mass_role_instances`

Actual assignments of people to roles for specific masses.

```sql
CREATE TABLE mass_role_instances (
  id UUID PRIMARY KEY,
  mass_id UUID NOT NULL REFERENCES masses(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,  -- NULL = unassigned
  mass_role_template_item_id UUID NOT NULL REFERENCES mass_role_template_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Purpose:** Assign specific people to specific roles for specific masses

**Key Points:**
- `person_id` can be NULL (unassigned slot awaiting assignment)
- Linked to `mass_role_template_item_id` to inherit role definition (which role, position, count)
- When a mass is created from a template item, role instances are created automatically (unassigned)

**Example Workflow:**
1. Create a mass from `mass_template_item` (which references a `mass_role_template`)
2. System auto-creates role instances based on the role template:
   - Instance 1: mass_id, person_id = NULL, mass_role_template_item_id = "Lector (count=2, position=0)"
   - Instance 2: mass_id, person_id = NULL, mass_role_template_item_id = "Lector (count=2, position=0)"
   - Instance 3: mass_id, person_id = NULL, mass_role_template_item_id = "Usher (count=3, position=1)"
   - (and so on...)
3. Staff assigns people: Update `person_id` for each instance

---

### 11. Mass Role Preferences (Person Availability)

**Table:** `mass_role_preferences`

Track when people are available and their preferences for serving in mass roles.

```sql
CREATE TABLE mass_role_preferences (
  id UUID PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  mass_role_id UUID REFERENCES mass_roles(id) ON DELETE CASCADE,

  -- Day/Time preferences
  preferred_days JSONB,              -- ["SUNDAY", "SATURDAY"]
  available_days JSONB,              -- ["MONDAY", "WEDNESDAY"]
  unavailable_days JSONB,            -- ["FRIDAY"]
  preferred_times JSONB,             -- ["09:00-12:00", "17:00-19:00"]
  unavailable_times JSONB,           -- ["06:00-08:00"]

  -- Frequency preferences
  desired_frequency TEXT,            -- 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'OCCASIONAL'
  max_per_month INTEGER,

  -- Language capabilities
  languages JSONB,                   -- [{"language": "en", "level": "fluent"}, {"language": "es", "level": "intermediate"}]

  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(person_id, parish_id, mass_role_id)
);
```

**Purpose:** Store ongoing availability preferences for scheduling

**Key Points:**
- One preference record per person per role per parish
- Stores general availability patterns (not specific dates)
- Used for auto-assignment and manual scheduling
- Language capabilities important for multilingual parishes

**Preference Types:**
- `preferred_days` - Days person prefers to serve
- `available_days` - Days person is willing to serve
- `unavailable_days` - Days person cannot serve
- `preferred_times` / `unavailable_times` - Time ranges
- `desired_frequency` - How often they want to serve

---

### 12. Person Blackout Dates (Temporary Unavailability)

**Table:** `person_blackout_dates`

Track specific date ranges when people are unavailable for any ministry activities.

```sql
CREATE TABLE person_blackout_dates (
  id UUID PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,                       -- 'Vacation', 'Out of town', 'Personal commitment'
  created_at TIMESTAMPTZ,
  CHECK (end_date >= start_date)
);
```

**Purpose:** Track temporary unavailability (vacations, travel, personal commitments)

**Key Points:**
- Applies to ALL roles and activities (person-level, not role-level)
- Date range is inclusive (start_date through end_date)
- Optional reason for tracking purposes
- Overrides general preferences during blackout period

**Design Decision: Person-Level vs. Role-Level**
- **Chosen: Person-Level** - Blackout dates are attached to the person, not to specific roles
- **Rationale:** When someone is on vacation or traveling, they're unavailable for ALL roles, not just one role
- **Simplicity:** Easier to manage one blackout entry per vacation instead of multiple entries per role
- **UI/UX:** Simpler for users to say "I'm unavailable from X to Y" rather than specifying per-role
- **Table Name:** Named `person_blackout_dates` (not `mass_role_blackout_dates`) to reflect that unavailability applies to the entire person

---

## Data Flow Examples

### Example 1: Creating a Weekend Mass Schedule

1. **Create Mass Type Tags:**
   ```
   mass_type_1: id=uuid1, key='WEEKEND', label_en='Weekend', label_es='Fin de Semana'
   mass_type_2: id=uuid2, key='YOUTH_MASS', label_en='Youth Mass', label_es='Misa Juvenil'
   ```

2. **Create Mass Role Template:**
   ```
   mass_role_template: id=roletemplate1, name='Standard Sunday Roles'
   ```

3. **Add Role Template Items:**
   ```
   role_item_1: role='Lector', count=2, position=0
   role_item_2: role='Usher', count=3, position=1
   role_item_3: role='Eucharistic Minister', count=4, position=2
   ```

4. **Create Mass Template:**
   ```
   mass_template: id=template1, name='Weekend Masses'
   ```

5. **Add Mass Template Items:**
   ```
   mass_template_item_1:
     day='SUNDAY', time='09:00', language='en'
     mass_type_ids=['uuid1']  // WEEKEND
     mass_role_template_id=roletemplate1

   mass_template_item_2:
     day='SUNDAY', time='11:00', language='es'
     mass_type_ids=['uuid1', 'uuid2']  // WEEKEND + YOUTH_MASS
     mass_role_template_id=roletemplate1
   ```

6. **Create Individual Mass for Next Sunday from Template Item:**
   ```
   mass: mass_template_item_id=mass_template_item_1, event_id=[calendar event for Sunday 9am]
   ```

7. **System Auto-Creates Role Instances AND Copies Tags:**
   ```
   mass.mass_type_ids = ['uuid1']  // Auto-copied from mass_template_item_1

   mass_role_instance_1: mass_id=[mass], mass_role_template_item_id=[Lector item], person_id=NULL
   mass_role_instance_2: mass_id=[mass], mass_role_template_item_id=[Lector item], person_id=NULL
   mass_role_instance_3: mass_id=[mass], mass_role_template_item_id=[Usher item], person_id=NULL
   mass_role_instance_4: mass_id=[mass], mass_role_template_item_id=[Usher item], person_id=NULL
   mass_role_instance_5: mass_id=[mass], mass_role_template_item_id=[Usher item], person_id=NULL
   mass_role_instance_6-9: [Eucharistic Ministers, unassigned]
   ```

8. **Staff Assigns People:**
   ```
   Update mass_role_instance_1: person_id=[John Doe]
   Update mass_role_instance_2: person_id=[Jane Smith]
   ... etc.
   ```

---

### Example 2: Checking Availability for Assignment

**Query Logic (Conceptual):**

When assigning a person to a mass role for a specific date, check:

1. **Blackout Dates:**
   ```sql
   SELECT * FROM person_blackout_dates
   WHERE person_id = [person]
     AND [mass_date] BETWEEN start_date AND end_date
   ```
   If found → Person is unavailable

2. **Role Preferences:**
   ```sql
   SELECT * FROM mass_role_preferences
   WHERE person_id = [person]
     AND mass_role_id = [role]
     AND parish_id = [parish]
   ```
   Check:
   - Is `[mass_day]` in `unavailable_days`? → Person cannot serve
   - Is `[mass_time]` in `unavailable_times`? → Person cannot serve
   - Is `[mass_day]` in `preferred_days`? → Prefer this person
   - Is `[mass_time]` in `preferred_times`? → Prefer this person
   - Check `desired_frequency` and `max_per_month` against recent assignments

3. **Language Match:**
   - Check if person's language capabilities match mass language

---

### Example 3: Viewing a Person's Schedule

**Query (Conceptual):**

```sql
SELECT
  m.id as mass_id,
  e.start_date,
  e.start_time,
  mr.name as role_name,
  m.status
FROM mass_role_instances mri
JOIN masses m ON mri.mass_id = m.id
JOIN events e ON m.event_id = e.id
JOIN mass_role_template_items mrti ON mri.mass_role_template_item_id = mrti.id
JOIN mass_roles mr ON mrti.mass_role_id = mr.id
WHERE mri.person_id = [person_id]
  AND e.start_date >= [today]
ORDER BY e.start_date, e.start_time
```

Result: List of all upcoming masses this person is assigned to.

---

## Key Design Decisions

### 1. Templates vs. Instances

**Decision:** Use a template pattern where reusable definitions are separate from specific instances.

**Rationale:**
- Reduces data duplication
- Makes it easy to create masses consistently
- Allows updating templates without affecting past masses
- Supports "Create next Sunday's mass" with one action

---

### 2. Mass Times Are Reference, Not Auto-Creation

**Decision:** `mass_times` table is for internal reference only and does NOT auto-create mass records.

**Rationale:**
- Simpler implementation (no background jobs required)
- Parish staff has full control over which masses to create
- Avoids creating masses for dates when parish is closed
- Allows for exceptions and special handling

**Workflow:**
- Staff manually creates masses for specific dates
- `mass_times` serves as a reference guide for what the normal schedule is

---

### 3. Blackout Dates are Person-Level, Not Role-Level

**Decision:** Blackout dates are attached to the person, not to specific roles.

**Rationale:**
- When someone is unavailable (vacation, travel), they're unavailable for ALL roles
- Simpler data model and UI
- Easier for users to manage

**Alternative Considered:** Role-level blackouts would allow someone to say "I can't be a Lector on X date, but I can still be an Usher."
- **Rejected:** Added complexity for minimal benefit; vacations/travel affect all roles equally

---

### 4. Preferences Are Role-Specific

**Decision:** A person can have different preferences for different roles.

**Rationale:**
- Someone might prefer to be a Lector at 10 AM masses but prefer to be an Usher at 5 PM masses
- Allows fine-grained scheduling
- Supports parishes where people serve in multiple roles

---

### 5. Mass Can Exist With or Without an Event

**Decision:** Masses can be linked to Events (for calendar integration) or exist independently.

**Rationale:**
- Flexibility for different workflows
- Some parishes may want masses on the calendar, others may not
- Allows for "planning" phase before adding to public calendar

---

### 6. Mass Types Are Flexible Tags, Not Structural Categories

**Decision:** Mass types are stored as JSONB arrays allowing multiple tags per mass, rather than single foreign key relationships.

**Rationale:**
- A mass can have multiple characteristics simultaneously (e.g., "Weekend" + "Youth Mass" + "Bilingual")
- Flexibility for filtering and reporting (can filter by any combination of tags)
- Simpler than creating complex many-to-many relationship tables
- Tags are purely organizational, not structural constraints
- Parishes can create custom tags that are meaningful to them

**Implementation:**
- `mass_template_items.mass_type_ids` defines default tags for each mass definition in the template
- When a mass is created from a template item, tags are copied to `masses.mass_type_ids`
- Users can edit tags on individual masses after creation
- Tags are NOT on `mass_templates` (parent container) or `mass_role_templates` (role definitions)

**Alternative Considered:** Single `mass_type_id` foreign key
- **Rejected:** Too restrictive - couldn't represent masses that are both "Weekend" AND "Youth Mass"

**Alternative Considered:** Many-to-many join table
- **Rejected:** More complex schema for same functionality; JSONB arrays are simpler and perform well with proper indexing

---

### 7. Separation of Mass Templates and Role Templates

**Decision:** Split into two separate template systems: `mass_templates` (defines masses) and `mass_role_templates` (defines role requirements).

**Rationale:**
- **Reusability:** Multiple mass template items can share the same role template
  - Example: Sunday 9am, Sunday 11am, and Saturday 5pm all use "Standard Sunday Roles"
- **Flexibility:** Can create different masses with same role requirements but different times/languages/tags
- **Clarity:** Clear separation between "what masses exist" and "what roles are needed"
- **Maintainability:** Change role requirements once, applies to all masses using that role template

**Example:**
```
mass_role_template: "Standard Sunday Roles" (2 Lectors, 4 EMs, 3 Ushers)
  ↓ referenced by
mass_template_item_1: Sunday 9am English, tags=[WEEKEND]
mass_template_item_2: Sunday 11am Spanish, tags=[WEEKEND, BILINGUAL]
mass_template_item_3: Saturday 5pm English, tags=[WEEKEND, VIGIL]
```

---

## Field Details & Constraints

### JSONB Field Structures

#### `mass_type_ids` (masses, mass_template_items)
```json
[
  "uuid-of-weekend-type",
  "uuid-of-youth-mass-type",
  "uuid-of-bilingual-type"
]
```
- Array of mass_type UUIDs
- Can be empty array `[]`
- Multiple tags can be applied to represent multiple characteristics
- Used on `mass_template_items` (template definition) and `masses` (copied from template item)
- Example combinations:
  - `["weekend-uuid"]` - Simple weekend mass
  - `["weekend-uuid", "youth-uuid"]` - Weekend youth mass
  - `["daily-uuid", "bilingual-uuid"]` - Daily bilingual mass

#### `mass_times.schedule_items`
```json
[
  {"day": "SUNDAY", "time": "09:00"},
  {"day": "SATURDAY", "time": "17:00"}
]
```
- `day`: SUNDAY | MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY
- `time`: 24-hour format (HH:MM)

#### `mass_role_preferences.preferred_days`
```json
["SUNDAY", "SATURDAY"]
```

#### `mass_role_preferences.available_days`
```json
["MONDAY", "WEDNESDAY", "FRIDAY"]
```

#### `mass_role_preferences.unavailable_days`
```json
["TUESDAY", "THURSDAY"]
```

#### `mass_role_preferences.preferred_times`
```json
["09:00-12:00", "17:00-19:00"]
```
- Format: "HH:MM-HH:MM" (24-hour format)

#### `mass_role_preferences.unavailable_times`
```json
["06:00-08:00", "20:00-22:00"]
```

#### `mass_role_preferences.languages`
```json
[
  {"language": "en", "level": "fluent"},
  {"language": "es", "level": "intermediate"},
  {"language": "la", "level": "basic"}
]
```
- `language`: ISO code (en, es, la, etc.)
- `level`: fluent | intermediate | basic

---

### Enum Values

#### `mass_role_preferences.desired_frequency`
- `WEEKLY` - Every week
- `BIWEEKLY` - Every other week
- `MONTHLY` - Once per month
- `OCCASIONAL` - As needed, infrequent

#### `masses.status`
Suggested values (not enforced by database):
- `PLANNING` - Initial state, roles not yet assigned
- `DRAFT` - Partially assigned
- `READY` - All roles assigned, ready for publication
- `PUBLISHED` - Publicly visible
- `COMPLETED` - Mass has occurred

#### `events.language` / `mass_times.language`
- `en` - English
- `es` - Spanish
- `la` - Latin (Traditional Latin Mass)
- (Other ISO 639-1 codes as needed)

---

## Relationships Diagram (Conceptual)

```
global_liturgical_events (global, read-only)
                 │
                 │ (optional reference)
                 ▼
              masses ─────────► events (optional, for calendar integration)
                 │
                 ├──► mass_type_ids (JSONB array) ──► mass_types (tags)
                 ├──► mass_template_item_id ──► mass_template_items
                 ├──► presider (person)                      │
                 ├──► homilist (person)                      │
                 │                                            ├──► mass_template (parent container)
                 │                                            ├──► mass_type_ids (JSONB array) ──► mass_types (tags)
                 │                                            │
                 │                                            └──► mass_role_template_id ──► mass_role_templates
                 │                                                                                 │
                 │                                                                                 └──► mass_role_template_items
                 │                                                                                          │
                 │                                                                                          └──► mass_roles
                 │
                 └──► mass_role_instances
                           │
                           ├──► person
                           └──► mass_role_template_item_id ──► mass_role_template_items
                                                                     │
                                                                     └──► mass_roles


mass_times (reference only, no direct relationships to other tables)


people ──┬──► mass_role_preferences ──► mass_roles
         │
         └──► person_blackout_dates
```

**Key Relationships:**
1. **`mass_templates`** → **`mass_template_items`** (one-to-many container)
2. **`mass_template_items`** → **`mass_role_templates`** (many-to-one: multiple mass definitions can share role requirements)
3. **`mass_template_items`** → **`masses`** (one-to-many: template item creates multiple masses over time)
4. **`mass_role_templates`** → **`mass_role_template_items`** (one-to-many: role requirements)
5. **`masses`** → **`mass_role_instances`** (one-to-many: actual role assignments)
6. **`mass_role_instances`** → **`mass_role_template_items`** (many-to-one: inherit role definition)

---

## Future Considerations

### Auto-Assignment Algorithm (Future)

When implementing auto-assignment, consider:

1. **Hard Constraints** (must be satisfied):
   - Person not in blackout period
   - Person not in unavailable days/times
   - Person has language capability for mass
   - Person not already assigned to another mass at same time

2. **Soft Constraints** (preferences):
   - Person in preferred days/times
   - Person within desired frequency
   - Person under max_per_month limit
   - Balance assignments across people

3. **Optimization Goals:**
   - Maximize preference satisfaction
   - Balance workload
   - Minimize gaps (fill all slots)

---

### Recurring Mass Creation Tool (Future)

Potential feature: Bulk-create masses for a date range based on `mass_times` schedule.

**Input:**
- Start date
- End date
- Mass time IDs to create

**Output:**
- Creates individual `mass` records
- Links to appropriate `event` records
- Auto-creates `mass_role_instances` (unassigned)
- Skips dates marked as parish closures

---

### Schedule Conflicts & Warnings (Future)

Potential features:
- Warn when assigning person to two masses at same time
- Warn when person exceeds max_per_month
- Warn when person assigned outside their available days/times
- Suggest alternate people based on preferences

---

## Summary

This data structure provides:

✅ **Reusability** - Templates for mass schedules and role requirements
✅ **Flexibility** - Masses can exist independently or link to calendar; multiple category tags per mass
✅ **Granularity** - Person-level and role-level preferences
✅ **Simplicity** - Blackout dates at person level for ease of use; JSONB arrays for tags instead of join tables
✅ **Scalability** - Supports multiple parishes with different configurations
✅ **Liturgical Integration** - Links to global liturgical calendar for context
✅ **Categorization** - Flexible tagging system allows parishes to define and combine custom mass categories

**Key Design Highlights:**
- **Mass Types as Tags** - Multiple tags per mass (e.g., "Weekend" + "Youth Mass") stored as JSONB arrays on `mass_template_items` and `masses`
- **Separation of Templates** - `mass_templates` define masses (day/time/language/tags), `mass_role_templates` define role requirements (reusable across multiple masses)
- **Template-Based Mass Creation** - Mass template items define default attributes (tags, language, role requirements) that are auto-copied to new masses
- **Manual Scheduling** - Staff creates masses manually from template items (no auto-creation from schedules)
- **Person-Centric Availability** - Blackout dates and preferences tied to people, not individual roles

The system is designed for **manual management** with **template assistance**, providing a foundation for future auto-assignment features while remaining simple and maintainable.
