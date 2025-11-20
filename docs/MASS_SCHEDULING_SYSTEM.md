# Mass Scheduling System

## Overview

The Mass Scheduling system in Outward Sign provides parishes with tools to schedule recurring Masses, define role requirements for liturgical ministers, and assign people to serve in various capacities. This system is designed to handle the complexity of parish Mass schedules, including multiple Masses per week, varying role requirements, and minister availability.

## Key Concepts

### Mass Scheduling Workflow

1. **Define Mass Roles** - Create roles that ministers can fill (e.g., Usher, Extraordinary Minister of Holy Communion, Lector)
2. **Create Role Templates** - Define standard role requirements for different types of Masses (e.g., Sunday 10:00am needs 3 ushers, 4 EEMs, 2 lectors)
3. **Create Time Templates** - Define when Masses occur (e.g., Saturday 5:00pm, Sunday 8:00am, Sunday 10:00am)
4. **Configure Minister Availability** - Track which Masses each minister is available to serve at
5. **Schedule Masses** - Create individual Mass events with specific dates and times
6. **Assign Ministers** - Assign specific people to fill roles at each Mass

### Terminology

- **Mass** - A single liturgical celebration on a specific date and time
- **Mass Role** - A type of ministerial service (e.g., Usher, Extraordinary Minister of Holy Communion, Lector, Altar Server)
- **Mass Role Template** - A reusable configuration defining role requirements for a type of Mass (e.g., "Sunday 10:00am" needs 3 ushers, 4 EEMs)
- **Mass Role Template Item** - A specific role requirement within a template (e.g., "3 ushers" in the Sunday 10:00am template)
- **Mass Time Template** - A collection of recurring Mass times for a parish
- **Mass Time Template Item** - A specific time slot within a template (e.g., Sunday 10:00am, Saturday 5:00pm vigil)
- **Mass Assignment** - The assignment of a specific person to a specific role at a specific Mass
- **Day Type** - Whether a Mass occurs on the actual day (`IS_DAY`) or the day before (`DAY_BEFORE`, e.g., Saturday vigil for Sunday)

## Database Schema

### Core Tables

#### `masses`
Individual Mass events scheduled on specific dates.

**Key Fields:**
- `parish_id` - Parish this Mass belongs to
- `event_id` - Reference to the calendar event (for scheduling and ICS export)
- `mass_roles_template_id` - Which role template this Mass uses (nullable)
- `liturgical_event_id` - Reference to the liturgical calendar event (e.g., 3rd Sunday of Advent) (nullable)
- `mass_time_template_item_id` - Which time template item this Mass corresponds to (nullable)
- `name` - Name of the Mass (e.g., "Sunday Mass - 3rd Sunday of Advent")
- `description` - Additional details about this Mass
- `note` - Internal notes for staff

**Relationships:**
- Belongs to Parish
- Belongs to Event (calendar integration)
- Belongs to Mass Roles Template (defines role requirements)
- Belongs to Global Liturgical Event (liturgical calendar)
- Belongs to Mass Time Template Item (defines when it occurs)
- Has many Mass Assignments (people assigned to roles)

---

#### `mass_types`
Categories or types of Masses to help organize different styles of celebrations.

**Key Fields:**
- `parish_id` - Parish this Mass type belongs to
- `name` - Type name (e.g., "Feast Day", "Children's Mass", "Sunday at 10")
- `description` - Details about this type of Mass

**Relationships:**
- Belongs to Parish

**Usage:**
Mass types are optional organizational tools. They can be used to categorize Masses (e.g., "Children's Mass" might have different music or liturgical practices) but are not required for the core scheduling functionality.

---

#### `mass_times_templates`
A collection of recurring Mass times for a parish. Each parish might have different active templates for different seasons or time periods.

**Key Fields:**
- `parish_id` - Parish this template belongs to
- `is_active` - Whether this template is currently in use
- `name` - Template name (e.g., "Regular Schedule", "Summer Schedule", "Advent Schedule")
- `description` - Details about when this template applies

**Relationships:**
- Belongs to Parish
- Has many Mass Time Template Items

**Usage:**
A parish might have multiple time templates for different seasons:
- "Regular Schedule" (active most of the year)
- "Summer Schedule" (active June-August with reduced Masses)
- "Holy Week Schedule" (active during Holy Week with special times)

Only one template should typically be active at a time, though the system allows for flexibility.

---

#### `mass_times_template_items`
Individual time slots within a Mass Time Template.

**Key Fields:**
- `mass_times_template_id` - Which template this item belongs to
- `time` - The time of day for this Mass (e.g., "10:00:00")
- `day_type` - Enum: `IS_DAY` or `DAY_BEFORE`
  - `IS_DAY` - Mass occurs on the actual day (e.g., Sunday 10:00am)
  - `DAY_BEFORE` - Mass occurs the day before (e.g., Saturday 5:00pm vigil for Sunday)

**Relationships:**
- Belongs to Mass Times Template
- Referenced by Persons (availability tracking)

**Example:**
A typical Sunday Mass schedule might include:
- Saturday 5:00pm (day_type: `DAY_BEFORE`) - Vigil Mass
- Sunday 8:00am (day_type: `IS_DAY`)
- Sunday 10:00am (day_type: `IS_DAY`)
- Sunday 12:00pm (day_type: `IS_DAY`)

---

#### `mass_roles_templates`
Templates defining the ministerial role requirements for different types of Masses.

**Key Fields:**
- `parish_id` - Parish this template belongs to
- `is_active` - Whether this template is currently in use
- `name` - Template name (e.g., "Sunday @ 10:00am", "Weekday Mass", "Children's Mass")
- `description` - Details about this template (e.g., "Sunday @ 10:00 - High attendance, full choir")

**Relationships:**
- Belongs to Parish
- Has many Mass Role Template Items

**Usage:**
Different Masses might have different ministerial needs:
- **Sunday 10:00am** (high attendance): 4 ushers, 6 EEMs, 2 lectors, 4 altar servers
- **Weekday Mass** (low attendance): 1 usher, 2 EEMs, 1 lector, 1 altar server
- **Children's Mass**: 2 ushers, 4 EEMs, 1 lector, 6 altar servers

---

#### `mass_roles_template_items`
Individual role requirements within a Mass Role Template.

**Key Fields:**
- `mass_roles_template_id` - Which template this item belongs to
- `mass_role_id` - Which role this requirement is for (e.g., Usher, EEM)
- `count` - How many ministers are needed for this role
- `note` - Additional notes about this requirement

**Relationships:**
- Belongs to Mass Role Template
- Belongs to Mass Role
- Has many Mass Assignments (people assigned to fulfill this requirement)

**Example:**
The "Sunday @ 10:00am" template might have these items:
- Usher (count: 4)
- Extraordinary Minister of Holy Communion (count: 6)
- Lector (count: 2, note: "1st and 2nd readings")
- Altar Server (count: 4)

---

#### `mass_roles`
Types of ministerial roles that can be assigned at Masses.

**Key Fields:**
- `parish_id` - Parish this role belongs to
- `name` - Role name (e.g., "Usher", "Extraordinary Minister of Holy Communion", "Lector", "Altar Server")
- `description` - Details about this role and its responsibilities

**Relationships:**
- Belongs to Parish
- Has many Mass Role Template Items
- Has many Mass Assignments

**Common Roles:**
- **Usher** - Greets parishioners, takes up collection, helps with seating
- **Extraordinary Minister of Holy Communion (EEM)** - Assists with distribution of Holy Communion
- **Lector/Reader** - Proclaims the Scripture readings
- **Altar Server** - Assists the priest during Mass
- **Cantor** - Leads the singing
- **Music Minister** - Plays instruments or sings
- **Sacristan** - Prepares the sanctuary and sacred vessels

---

#### `mass_assignment`
The assignment of a specific person to a specific role at a specific Mass.

**Key Fields:**
- `person_id` - Who is assigned (nullable - allows for unfilled assignments)
- `mass_roles_template_item_id` - Which role requirement this fulfills
- `mass_id` - Which Mass this is for (required)

**Relationships:**
- Belongs to Person (nullable)
- Belongs to Mass Roles Template Item
- Belongs to Mass

**Usage:**
When a Mass is scheduled using a role template, the system can create empty Mass Assignments based on the template items. For example, if the template requires 4 ushers, 4 Mass Assignment records are created with `person_id` = null. Schedulers can then assign specific people to fill these slots.

**Workflow:**
1. Mass is created with a `mass_roles_template_id`
2. System creates Mass Assignment records for each required role (based on template items)
3. Scheduler assigns specific people to each Mass Assignment
4. Ministers can view their upcoming assignments

---

#### `persons` (Mass Scheduling Addition)
The existing `persons` table is extended to track minister availability.

**New Field:**
- `mass_times_template_item_ids` - Array of Mass Time Template Item IDs indicating which Masses this person is available to serve at

**Usage:**
This field allows ministers to indicate their general availability. For example:
- Minister A is available for: Saturday 5:00pm, Sunday 10:00am
- Minister B is available for: Sunday 8:00am, Sunday 12:00pm

When creating schedules, the system can use this availability data to suggest appropriate assignments and avoid scheduling people for times they're not available.

**Migration Note:**
The `persons` migration must run AFTER the `mass_times_templates` migration since it references `mass_times_template_items`.

---

## Data Relationships

### Template System Hierarchy

```
mass_times_template (e.g., "Regular Schedule")
  └── mass_times_template_items (e.g., Saturday 5pm, Sunday 10am)
      └── Referenced by persons.mass_times_template_item_ids (availability)

mass_roles_templates (e.g., "Sunday @ 10:00am")
  └── mass_roles_template_items (e.g., 4 ushers, 6 EEMs)
      └── mass_role_id (e.g., "Usher")
```

### Mass Scheduling Flow

```
1. Mass is created
   └── References event_id (calendar event)
   └── References mass_roles_template_item_id (defines role requirements)
   └── References mass_time_template_item_id (defines time)
   └── References global_liturgical_event_id (liturgical calendar)

2. Mass Assignments are created (based on role template)
   └── mass_id (which Mass)
   └── mass_roles_template_item_id (which role requirement)
   └── person_id (who is assigned - initially null)

3. People are assigned to fulfill Mass Assignments
   └── person_id is updated from null to specific person
```

---

## Use Cases

### Use Case 1: Creating a New Mass Role Template

**Scenario:** A parish wants to create a template for their main Sunday Mass that requires specific numbers of ministers.

**Steps:**
1. Create a new `mass_roles_template` record:
   - name: "Sunday @ 10:00am"
   - description: "Main Sunday Mass with full choir and high attendance"
   - is_active: true

2. Create `mass_roles_template_items` for each role:
   - Usher: count = 4
   - EEM: count = 6
   - Lector: count = 2
   - Altar Server: count = 4
   - Cantor: count = 1

**Result:** This template can now be applied to any Sunday 10:00am Mass to automatically create the required role slots.

---

### Use Case 2: Scheduling Masses for a Month

**Scenario:** A parish wants to schedule all Masses for the month of December using their regular Mass times template.

**Steps:**
1. Retrieve the active `mass_times_templates` (e.g., "Regular Schedule")
2. For each Sunday in December:
   - Create `masses` records based on `mass_times_template_items`:
     - Saturday 5:00pm vigil (using DAY_BEFORE item)
     - Sunday 8:00am, 10:00am, 12:00pm (using IS_DAY items)
   - Associate each Mass with the appropriate `mass_roles_template_item_id`
   - Link to `global_liturgical_event_id` if available (e.g., 3rd Sunday of Advent)

3. For each Mass created, generate `mass_assignment` records based on the role template:
   - If Sunday 10am uses the "Sunday @ 10:00am" template with 4 ushers:
     - Create 4 `mass_assignment` records with `person_id` = null
     - Ready for schedulers to assign specific people

**Result:** All Masses for December are scheduled with proper role requirements, ready for minister assignment.

---

### Use Case 3: Assigning Ministers Based on Availability

**Scenario:** A scheduler wants to assign ministers to the Sunday 10:00am Masses for December, taking into account their availability.

**Steps:**
1. Retrieve all `mass_assignment` records for Sunday 10:00am Masses where `person_id` IS NULL
2. For the "Usher" role:
   - Query `persons` where `mass_times_template_item_ids` includes the Sunday 10:00am item
   - Filter by those who are already trained/approved for the Usher role
   - Display available ushers to the scheduler
3. Scheduler assigns specific people to each `mass_assignment`
4. System updates `person_id` in the `mass_assignment` record

**Result:** Ministers are assigned to specific Masses based on their stated availability.

---

### Use Case 4: Minister Viewing Their Schedule

**Scenario:** A minister wants to see which Masses they're assigned to serve at in the coming month.

**Steps:**
1. Query `mass_assignment` records where:
   - `person_id` = current user
   - Associated `masses.event_id` has dates in the next 30 days
2. For each assignment, display:
   - Mass date and time (from `event`)
   - Mass name (from `masses`)
   - Role assigned (from `mass_roles_template_items` → `mass_roles`)
   - Location/additional notes

**Result:** Minister sees their upcoming assignments with all relevant details.

---

## Integration Points

### Calendar Integration (`event_id`)
Each Mass is linked to an `event` record, which allows:
- ICS feed export for personal calendars
- Calendar view of upcoming Masses
- Integration with the broader parish event system

### Liturgical Calendar (`global_liturgical_event_id`)
Masses can be linked to liturgical calendar events (e.g., Sundays of Advent, Feast Days), which enables:
- Automatic naming based on the liturgical calendar
- Color-coding based on liturgical seasons
- Integration with readings and prayers for that day

### People Management
The `persons` table integration allows:
- Tracking minister availability through `mass_times_template_item_ids`
- Assigning specific people to roles through `mass_assignment`
- Viewing individual minister schedules and histories

---

## Technical Considerations

### Migration Order
When setting up the database, migrations must run in this order:
1. `mass_times_templates` and `mass_times_template_items` (defines available times)
2. `persons` (can now reference `mass_times_template_item_ids`)
3. `mass_roles` (defines role types)
4. `mass_roles_templates` and `mass_roles_template_items` (defines role requirements)
5. `mass_types` (optional categorization)
6. `masses` (can now reference templates, events, and liturgical calendar)
7. `mass_assignment` (links people to masses through role requirements)

### Data Integrity
- All tables (except `mass_*_template_items` and `mass_assignment`) should have `parish_id` for multi-tenancy
- Standard `created_at` and `updated_at` timestamps on all tables
- Foreign key constraints should enforce referential integrity
- RLS policies should enforce parish-level access control

### Template Flexibility
The template system allows parishes to:
- Define multiple role templates for different types of Masses
- Define multiple time templates for different seasons
- Mix and match templates as needed
- Override templates on a per-Mass basis if necessary

---

## Future Enhancements

### Potential Features
1. **Auto-scheduling Algorithm** - Automatically assign ministers based on availability, past assignments, and preferences
2. **Substitute Requests** - Allow ministers to request substitutes if they can't make an assigned Mass
3. **Training Tracking** - Track which ministers are trained/certified for which roles
4. **Assignment History** - Track how often each minister serves and ensure fair distribution
5. **Communication Tools** - Send reminders to ministers about upcoming assignments
6. **Scheduling Conflicts** - Prevent double-booking of ministers across multiple Masses
7. **Recurring Schedules** - Create repeating assignment patterns (e.g., "1st Sunday of each month")

---

## Best Practices

### Template Management
- Keep the number of active templates minimal to avoid confusion
- Use descriptive names that clearly indicate when the template applies
- Document any special requirements or notes in the description field
- Regularly review and update templates as parish needs change

### Minister Assignment
- Respect minister availability preferences (`mass_times_template_item_ids`)
- Distribute assignments fairly across all available ministers
- Provide advance notice for assignments (typically 2-4 weeks)
- Have a backup plan for unfilled assignments or last-minute cancellations

### Data Organization
- Use consistent naming conventions for templates and roles
- Keep role names standardized across the parish
- Document any parish-specific roles or terminology
- Regular cleanup of old or unused templates

---

## Glossary

**Day Type** - Indicates whether a Mass occurs on the actual day (`IS_DAY`) or the day before (`DAY_BEFORE`)

**EEM** - Extraordinary Minister of Holy Communion

**Liturgical Event** - A celebration in the liturgical calendar (e.g., Sunday, Feast Day, Solemnity)

**Mass Assignment** - The assignment of a person to a role at a specific Mass

**Role Template** - A reusable configuration of role requirements for a type of Mass

**Template Item** - An individual component within a template (e.g., a specific time slot or role requirement)

**Time Template** - A collection of recurring Mass times for a parish

**Vigil Mass** - A Mass celebrated the evening before a Solemnity or Sunday (typically Saturday evening for Sunday)
