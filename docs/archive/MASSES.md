# MASSES.md

> **Purpose:** Comprehensive documentation for the Mass module including architecture, role templates, scheduling, and workflow guides.

## Table of Contents

- [Overview](#overview)
- [Current Implementation Status](#current-implementation-status)
- [Mass Components](#mass-components)
- [Role System Architecture](#role-system-architecture)
- [Template System](#template-system)
- [Role Membership & Availability](#role-membership--availability)
- [Mass Scheduling Workflows](#mass-scheduling-workflows)
- [Database Schema Reference](#database-schema-reference)
- [Server Actions](#server-actions)
- [User Interfaces](#user-interfaces)
- [Future Enhancements](#future-enhancements)
- [Related Documentation](#related-documentation)

---

## Overview

**Purpose:** Manage Mass celebrations including scheduling, role assignments, communications, and liturgical preparation.

**Key Workflows:**
1. **Mass Planning** - Create Mass event, assign presider/homilist, select liturgical calendar date
2. **Role Assignment** - Assign people to liturgical roles based on templates
3. **Communication** - Notify assigned ministers, handle substitute requests
4. **Liturgical Preparation** - Manage readings, petitions, announcements, intentions
5. **Execution** - Print scripts, manage day-of coordination

**Core Belief:** A well-prepared Mass requires clear communication with all ministers, proper scheduling, and printable liturgical scripts ready in the sacristy.

---

## Current Implementation Status

### What's Implemented ✅

**Core Tables:**
- ✅ `masses` - Individual Mass events
- ✅ `mass_roles` - Role definitions (Lector, Usher, etc.)
- ✅ `mass_roles_templates` - Template containers
- ✅ `mass_roles_template_items` - Role requirements per template
- ✅ `mass_role_instances` - Actual role assignments
- ✅ `mass_role_members` - People serving in roles (simple membership)
- ✅ `person_blackout_dates` - Unavailability tracking

**Features:**
- ✅ Standard 9-file module structure (CRUD operations)
- ✅ Event picker integration
- ✅ People picker for presider/homilist
- ✅ Liturgical event picker
- ✅ Mass Intentions (separate module, linked via event)
- ✅ Bulk scheduling wizard with auto-assignment algorithm

**Auto-Assignment Algorithm:**
- ✅ Role membership filtering (`mass_role_members`)
- ✅ Blackout date checking (`person_blackout_dates`)
- ✅ Conflict detection (double-booking prevention)
- ✅ Workload balancing across ministers
- See [MASS_SCHEDULING.md](./MASS_SCHEDULING.md) for details

### What's Not Yet Implemented ⏳

- ❌ Role assignment UI in Mass form (currently basic)
- ❌ Confirmation workflow (ministers confirm/decline assignments)
- ❌ Substitute request system
- ❌ Email/SMS notifications
- ❌ Minister self-service portal
- ❌ Assignment history tracking and reporting

---

## Database Tables (Implemented)

**`masses` table:**
- `id` - UUID primary key
- `parish_id` - Foreign key to parishes
- `event_id` - Foreign key to events (date/time/location)
- `presider_id` - Foreign key to people (priest/deacon presiding)
- `homilist_id` - Foreign key to people (who gives homily)
- `liturgical_event_id` - Foreign key to global_liturgical_events (liturgical calendar)
- `mass_roles_template_id` - Foreign key to mass_roles_templates
- `pre_mass_announcement_id` - Foreign key to people (who makes pre-Mass announcement)
- `pre_mass_announcement_topic` - Text field for announcement topic
- `status` - Text (e.g., 'PLANNING', 'SCHEDULED', 'COMPLETED')
- `mass_template_id` - Text (for different Mass types/templates)
- `announcements` - Text (Mass announcements)
- `note` - Text (internal notes)
- `petitions` - Text (prayers of the faithful)
- `created_at`, `updated_at` - Timestamps

**`mass_roles_templates` table:**
- `id` - UUID primary key
- `parish_id` - Foreign key to parishes
- `name` - Text (e.g., "Sunday Mass - Full", "Weekday Mass - Simple")
- `description` - Text
- `note` - Text (internal notes)
- `parameters` - JSONB (flexible configuration for role requirements)
- `created_at`, `updated_at` - Timestamps

**`mass_roles` table (junction):**
- `id` - UUID primary key
- `mass_id` - Foreign key to masses
- `person_id` - Foreign key to people
- `role_id` - Foreign key to roles
- `parameters` - JSONB (role-specific configuration)
- `created_at`, `updated_at` - Timestamps
- `UNIQUE(mass_id, person_id, role_id)` - Prevents duplicate assignments

### Server Actions (Implemented)

**File:** `src/lib/actions/masses.ts`

**Available Functions:**
- `getMasses(filters?)` - Fetch masses with presider/homilist/event relations
- `getMassesPaginated(params?)` - Paginated mass list
- `getMass(id)` - Fetch single mass
- `getMassWithRelations(id)` - Fetch mass with ALL relations (event, presider, homilist, liturgical_event, mass_roles_template, pre_mass_announcement_person, mass_roles array)
- `createMass(data)` - Create new mass
- `updateMass(id, data)` - Update mass
- `deleteMass(id)` - Delete mass

**TypeScript Interfaces:**
- `Mass` - Base mass type
- `MassWithNames` - Mass with presider/homilist/event names
- `MassWithRelations` - Mass with all related data including mass_roles array
- `CreateMassData` - Create payload
- `UpdateMassData` - Update payload (all optional)

### Current Module Structure (Implemented)

**Standard 9-file pattern:**
1. List Page - `src/app/(main)/masses/page.tsx`
2. List Client - `src/app/(main)/masses/masses-list-client.tsx`
3. Create Page - `src/app/(main)/masses/create/page.tsx`
4. View Page - `src/app/(main)/masses/[id]/page.tsx`
5. Edit Page - `src/app/(main)/masses/[id]/edit/page.tsx`
6. Form Wrapper - `src/app/(main)/masses/mass-form-wrapper.tsx`
7. Unified Form - `src/app/(main)/masses/mass-form.tsx`
8. View Client - `src/app/(main)/masses/[id]/mass-view-client.tsx`
9. Form Actions - `src/app/(main)/masses/[id]/mass-form-actions.tsx`

**Current Features:**
- Basic CRUD operations
- Event picker integration
- People picker for presider/homilist
- Liturgical event picker
- Text fields for announcements, petitions, notes
- Mass Intentions (separate module, linked via event)

---

## Mass Components

### Liturgical Elements

**Before Mass:**
- Pre-Mass announcements (person + topic)
- Music/hymn selection
- Sacristan preparation checklist

**Introductory Rites:**
- Entrance hymn
- Greeting
- Penitential Act
- Gloria (seasonal)
- Collect (Opening Prayer)

**Liturgy of the Word:**
- First Reading (+ Psalm for Sundays/Solemnities)
- Responsorial Psalm
- Second Reading (Sundays/Solemnities only)
- Gospel Acclamation
- Gospel
- Homily
- Profession of Faith (Creed - Sundays/Solemnities)
- Prayers of the Faithful (Petitions)

**Liturgy of the Eucharist:**
- Preparation of Gifts
- Offertory hymn
- Eucharistic Prayer
- Communion Rite
- Communion hymn
- Prayer After Communion

**Concluding Rites:**
- Announcements
- Blessing
- Dismissal
- Closing hymn

### Non-Liturgical Elements

**Operational:**
- Temperature/climate control
- AV/sound system setup
- Lighting
- Accessibility accommodations
- COVID protocols (if applicable)
- Special event coordination (First Communion, Confirmation, etc.)

**Administrative:**
- Collection counting team
- Bulletin preparation
- Hospitality (coffee, donuts, etc.)
- Security/safety team

---

## Role System Architecture

### Standard Liturgical Roles

**Currently NOT tracked in system (needs implementation):**

**1. Extraordinary Eucharistic Ministers (EEMs)**
- **Responsibilities:** Distribute Communion (Body and/or Blood of Christ)
- **Typical Number:** 4-8 ministers (varies by parish size and Communion under both species)
- **Required vs Extra:** Usually a fixed number required, extras on standby
- **Scheduling Notes:** Need training/certification, may have preferences for chalice vs host

**2. Lectors (Readers)**
- **Responsibilities:** Proclaim Scripture readings (except Gospel), lead Prayers of the Faithful
- **Typical Number:** 2-3 (First Reading, Second Reading if applicable, Petitions)
- **Required vs Extra:** 1-2 required minimum, may have backup
- **Scheduling Notes:** Should prepare readings in advance, may need bilingual lectors

**3. Altar Servers**
- **Responsibilities:** Assist priest at altar (carry cross, candles, hold book, prepare gifts, etc.)
- **Typical Number:** 2-4 servers (varies by Mass type)
- **Required vs Extra:** Minimum 1, ideal 2+
- **Scheduling Notes:** Often youth/teens, need training, may have master of ceremonies role

**4. Ushers/Greeters**
- **Responsibilities:** Welcome parishioners, distribute bulletins, take collection, direct Communion lines, handle emergencies
- **Typical Number:** 4-8 (varies by church size)
- **Required vs Extra:** Sufficient to cover all entrances and collection
- **Scheduling Notes:** May have head usher coordinating team

**5. Sacristans**
- **Responsibilities:** Prepare altar, vestments, sacred vessels before Mass; clean up after
- **Typical Number:** 1-2 per Mass
- **Required vs Extra:** 1 required minimum
- **Scheduling Notes:** Need access to sacristy, detailed knowledge of Mass preparation

**6. Music Ministers**
- **Responsibilities:** Lead congregational singing, provide instrumental accompaniment
- **Typical Roles:**
  - Music Director/Cantor (leads singing)
  - Organist/Pianist (accompaniment)
  - Choir members (4-20+ depending on parish)
  - Instrumentalists (guitar, violin, etc.)
- **Required vs Extra:** Varies greatly by parish tradition and Mass type
- **Scheduling Notes:** Often separate scheduling system for choir, may need separate rehearsals

**7. Gift Bearers (Offertory Procession)**
- **Responsibilities:** Bring bread, wine, and collection to altar
- **Typical Number:** 2-4 people (often family or special group)
- **Required vs Extra:** Nice to have, not strictly required
- **Scheduling Notes:** Often assigned to families celebrating occasions (baptism, anniversary, etc.)

**8. Hospitality Ministers**
- **Responsibilities:** Post-Mass fellowship (coffee, donuts), welcome newcomers
- **Typical Number:** 2-6 volunteers
- **Required vs Extra:** Extra (not part of Mass liturgy)
- **Scheduling Notes:** May be separate team from ushers

**9. Technology/AV Ministers**
- **Responsibilities:** Manage sound system, livestream, projection screens, recording
- **Typical Number:** 1-2 per Mass
- **Required vs Extra:** Required for parishes with AV systems
- **Scheduling Notes:** Need technical training, often youth/young adults

**10. Other Specialized Roles:**
- Master of Ceremonies (for solemn Masses)
- Thurifer (incense bearer)
- Crucifer (cross bearer)
- Torch bearers
- Book bearer

### Role Configuration Requirements

**For each role, we need to track:**

1. **Role Definition:**
   - Role name (e.g., "Lector", "EEM - Host", "EEM - Chalice", "Altar Server")
   - Description
   - Required training/certification
   - Age requirements (if applicable)
   - Active/inactive status

2. **Template Requirements (per Mass type):**
   - Number required (e.g., "2 lectors required")
   - Number desired (e.g., "3 lectors ideal")
   - Maximum allowed (e.g., "4 lectors max")
   - Priority/criticality (critical, important, optional)
   - Default assignments (if any)

3. **Person-Role Relationship:**
   - Training completion status
   - Certification date (if applicable)
   - Preference level (preferred, willing, not available)
   - Special notes (e.g., "Prefers 10:30 AM Mass", "Bilingual - Spanish")

---

## Template System

### Architecture Overview

The template system consists of interconnected tables that work together:

```
mass_roles (Role Definitions)
    ↓
mass_roles_templates (Template Container)
    ↓
mass_roles_template_items (Template Composition)
    ↓
masses (Individual Mass Events)
    ↓
mass_role_instances (Actual Assignments)
```

### Data Flow: From Template to Assignment

**Step 1:** Define roles (one-time setup)
- Parish creates role definitions (Lector, Usher, etc.) in `mass_roles` table
- File reference: `supabase/migrations/*_create_mass_roles_table.sql`

**Step 2:** Create template (one-time setup)
- Parish creates template in `mass_roles_templates` (e.g., "Sunday Morning Mass")

**Step 3:** Add items to template (one-time setup)
- Define which roles needed in `mass_roles_template_items`
- Example: 2 Lectors, 4 EMs, 4 Ushers, 2 Servers

**Step 4:** Create Mass with template (recurring)
- Mass created with `mass_roles_template_id` reference
- File reference: `src/lib/actions/masses.ts:createMass()`

**Step 5:** Generate role instances (automatic)
- System creates `mass_role_instances` based on template items
- Each instance initially has `person_id` = NULL (unfilled)

**Step 6:** Assign people (manual or automated)
- Staff assigns people to fill slots via UI or auto-assignment algorithm
- Updates `mass_role_instances.person_id`

### Mass Type Templates

**Purpose:** Define standard role configurations for different types of Masses.

**Template Examples:**

**1. Sunday Mass - Full (Choir)**
- Presider: 1 priest/deacon (required)
- Homilist: 1 (usually presider, could be different)
- Lectors: 3 (First Reading, Second Reading, Petitions) - required
- EEMs: 8 (4 host, 4 chalice) - required
- Altar Servers: 4 (2 required, 4 ideal)
- Ushers: 6 - required
- Sacristan: 1 - required
- Music Director/Cantor: 1 - required
- Organist/Pianist: 1 - required
- Choir: 12-20 - optional
- Gift Bearers: 2-4 - optional
- AV Tech: 1 - required (if livestreaming)

**2. Sunday Mass - Simple (No Choir)**
- Presider: 1 - required
- Homilist: 1 - required
- Lectors: 3 - required
- EEMs: 4 - required
- Altar Servers: 2 - required
- Ushers: 4 - required
- Sacristan: 1 - required
- Cantor: 1 - required
- Organist: 1 - optional
- Gift Bearers: 2 - optional

**3. Weekday Mass**
- Presider: 1 - required
- Lector: 1 - required
- EEMs: 2 - required
- Altar Server: 1 - required (optional in some parishes)
- Sacristan: 1 - required
- Ushers: 0-2 - optional

**4. Bilingual Mass (Spanish/English)**
- Same as Sunday Mass, but:
- Bilingual Lectors required (or separate Spanish/English lectors)
- Bilingual Cantor/Music Director required
- May need translation support for announcements

**5. Special Event Mass (First Communion, Confirmation, etc.)**
- Enhanced roles for ceremony
- Additional ushers for crowd management
- Special ministers for sacramental elements
- Photographer/videographer coordination

### Liturgical Contexts

**Purpose:** Automatically match role templates to liturgical celebrations based on the celebration's grade and type.

**Database Column:** `mass_roles_templates.liturgical_contexts` (TEXT array)

**Available Contexts:**

| Context | Matches | Grade Range |
|---------|---------|-------------|
| `SUNDAY` | Any Sunday (regardless of liturgical grade) | type='sunday' |
| `SOLEMNITY` | Easter Triduum + Solemnities | Grade 1-2 |
| `FEAST` | Feasts of the Lord, Apostles, Evangelists | Grade 3-4 |
| `MEMORIAL` | Obligatory and optional memorials | Grade 5-6 |
| `WEEKDAY` | Ordinary ferial days | Grade 7 |

**How Matching Works:**

1. When scheduling Masses, the scheduler gets the liturgical event for each date
2. It determines the liturgical context using `getLiturgicalContextFromGrade(grade, isSunday)`
3. It finds the role template whose `liturgical_contexts` array includes that context
4. If multiple templates match, the first is used; if none match, falls back to first template

**Example Configuration:**

```
"Sunday Mass" template → liturgical_contexts: ['SUNDAY', 'SOLEMNITY']
  - Used for: All Sundays, Christmas, Easter, Assumption, etc.

"Daily Mass" template → liturgical_contexts: ['FEAST', 'MEMORIAL', 'WEEKDAY']
  - Used for: Weekday feasts, saint memorials, ordinary weekdays
```

**Constants Reference:** `src/lib/constants.ts`
- `LITURGICAL_CONTEXT_VALUES` - Array of valid context values
- `LITURGICAL_CONTEXT_LABELS` - Bilingual display labels
- `LITURGICAL_CONTEXT_DESCRIPTIONS` - Descriptions for UI
- `getLiturgicalContextFromGrade()` - Helper function for mapping

**Seeded Templates:**
The parish seeder creates two default templates:
- **Sunday Mass** - `['SUNDAY', 'SOLEMNITY']` - Full minister complement
- **Daily Mass** - `['FEAST', 'MEMORIAL', 'WEEKDAY']` - Minimal ministers

---

### Template Data Structure

**Current implementation:** `mass_roles_templates.parameters` is JSONB (flexible but undefined)

**Proposed structure for `parameters` field:**

```json
{
  "roles": [
    {
      "role_id": "uuid-of-role",
      "role_name": "Lector",
      "min_required": 2,
      "ideal_count": 3,
      "max_allowed": 4,
      "priority": "critical",
      "notes": "One for First Reading, one for Second Reading, one for Petitions",
      "auto_assign": false,
      "substitution_allowed": true,
      "advance_notice_days": 7
    },
    {
      "role_id": "uuid-of-eem-role",
      "role_name": "Extraordinary Eucharistic Minister",
      "min_required": 4,
      "ideal_count": 6,
      "max_allowed": 8,
      "priority": "critical",
      "notes": "Even split between host and chalice distribution",
      "sub_roles": [
        {
          "name": "Host Distribution",
          "count": 3
        },
        {
          "name": "Chalice Distribution",
          "count": 3
        }
      ],
      "auto_assign": false,
      "substitution_allowed": true,
      "advance_notice_days": 7
    }
  ],
  "liturgical_settings": {
    "language": "en",
    "bilingual": false,
    "music_style": "choir",
    "communion_under_both_species": true,
    "incense": false
  },
  "timing": {
    "typical_duration_minutes": 75,
    "arrival_time_minutes_before": 15
  }
}
```

### Template Management UI (To Be Built)

**Features needed:**
1. Create/Edit templates
2. Clone template (copy and modify)
3. Set default template for parish
4. Template library (share across parishes - future)
5. Role requirement builder (drag-and-drop or form-based)
6. Validation (ensure critical roles are covered)


---

## Role Membership & Availability

### Minister Role Membership

**Purpose:** Track which people serve in which liturgical roles using a simple membership model.

### Simplified Architecture

**Design Philosophy:**
- Simple role membership model (active/inactive)
- No complex preference fields (preferred days, frequency limits, etc.)
- All scheduling constraints handled via blackout dates
- Manual adjustments expected for fine-tuning assignments
- Focus on availability tracking rather than preference optimization

### Database Structure

**Table: `mass_role_members`** (Implemented)
```sql
CREATE TABLE mass_role_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  mass_role_id UUID REFERENCES mass_roles(id) ON DELETE CASCADE,

  -- Membership type (MEMBER or LEADER)
  membership_type TEXT NOT NULL DEFAULT 'MEMBER',

  -- Special notes
  notes TEXT,

  -- Active status
  active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each person can have one membership record per role per parish
  UNIQUE(person_id, parish_id, mass_role_id),

  -- Ensure membership_type is valid
  CHECK (membership_type IN ('MEMBER', 'LEADER'))
);
```

**Table: `person_blackout_dates`** (Implemented)
```sql
CREATE TABLE person_blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (end_date >= start_date)
);
```

**Key Design Decisions:**
- **Binary Membership** - Person is either an active member of a role or not
- **Membership Types** - Each membership has a type: `MEMBER` (default) or `LEADER`
  - Leaders can be identified for coordination and communication purposes
  - Both members and leaders are eligible for scheduling assignments
- **Person-Centric Blackouts** - Blackout dates apply to all roles (not role-specific)
- **Notes Field** - Capture special requirements or preferences as free text
- **Simple Querying** - Easy to find all active members for a role
- **Manual Fine-Tuning** - Coordinators make final scheduling decisions

**Indexes:**
```sql
CREATE INDEX idx_mass_role_members_person ON mass_role_members(person_id);
CREATE INDEX idx_mass_role_members_parish ON mass_role_members(parish_id);
CREATE INDEX idx_mass_role_members_role ON mass_role_members(mass_role_id);
CREATE INDEX idx_mass_role_members_active ON mass_role_members(active);
CREATE INDEX idx_person_blackout_person ON person_blackout_dates(person_id);
CREATE INDEX idx_person_blackout_dates ON person_blackout_dates(start_date, end_date);
```

### Preference Management UI (To Be Built)

**Minister Self-Service Portal:**
1. **My Availability** page
   - View my role memberships (which roles I serve in)
   - Manage blackout dates (vacation, travel, commitments)
   - Add notes about special requirements

2. **My Assignments** page
   - Upcoming assignments (calendar view)
   - Past assignments (history)
   - Request substitute button
   - Confirm/decline assignments

3. **Substitute Requests** page
   - Open substitute requests I can fill
   - Accept/decline substitute requests
   - My substitute history

**Coordinator Interface:**
1. **Role Membership Management**
   - List all people who serve in each role
   - Filter by role, active/inactive status
   - View blackout dates for each person
   - Add/remove people from roles
   - Mark memberships as active/inactive

2. **Assignment Dashboard**
   - Unfilled roles highlighted
   - List of available ministers for each role (active members only)
   - Check blackout dates before assigning
   - Manual assignment interface

3. **Substitute Management**
   - Pending substitute requests
   - Manually assign substitutes from active role members
   - Contact ministers directly

---

## Mass Scheduling Workflows

### Individual Mass Creation

**Standard workflow for creating a single Mass:**

1. Navigate to `/masses` → Click "Create New Mass"
2. Fill Mass Form:
   - Select/create Event (date, time, location)
   - Select presider and homilist (People Picker)
   - Select liturgical calendar date (optional)
   - Select Mass Role Template (optional)
   - Add announcements, petitions, notes
3. Save Mass
4. (Future) Assign ministers to roles via role assignment UI

**File References:**
- Form: `src/app/(main)/masses/mass-form.tsx`
- Create page: `src/app/(main)/masses/create/page.tsx`
- Server action: `src/lib/actions/masses.ts:createMass()`

### Bulk Mass Scheduling

**For scheduling multiple Masses over a period:**

Use the Mass Scheduling Wizard at `/masses/schedule`. This provides:
- Date range selection
- Recurring schedule pattern (days/times)
- Template-based role requirements
- Automatic minister assignment algorithm
- Interactive assignment editor

**See [MASS_SCHEDULING.md](./MASS_SCHEDULING.md) for complete documentation** of the bulk scheduling workflow, including:
- Wizard steps (5-step process)
- Auto-assignment algorithm details
- Assignment editor features
- Server action specifications
- Testing guidelines

**File References:**
- Wizard: `src/app/(main)/masses/schedule/schedule-masses-client.tsx`
- Server action: `src/lib/actions/mass-scheduling.ts:scheduleMasses()`
- Assignment grid: `src/components/mass-schedule-assignment-grid.tsx`

---

## Database Schema Reference

### Core Tables

See [Current Implementation Status](#current-implementation-status) for complete table listing.

**Key Relationships:**
```sql
-- A Mass references a template
masses.mass_roles_template_id → mass_roles_templates.id

-- Template items define role requirements
mass_roles_template_items.template_id → mass_roles_templates.id
mass_roles_template_items.mass_role_id → mass_roles.id

-- Role instances link Masses to specific assignments
mass_role_instances.mass_id → masses.id
mass_role_instances.person_id → people.id
mass_role_instances.mass_roles_template_item_id → mass_roles_template_items.id

-- Role membership tracks who serves in which roles
mass_role_members.person_id → people.id
mass_role_members.mass_role_id → mass_roles.id

-- Blackout dates track unavailability
person_blackout_dates.person_id → people.id
```

**Migration Files:**
- Core tables: `supabase/migrations/20251118000001_create_mass_role_members_table.sql`
- See migration directory for complete schema

---

## Server Actions

### Mass CRUD Operations

**File:** `src/lib/actions/masses.ts`

**Key Functions:**
- `getMasses(filters?)` - Fetch masses with presider/homilist/event relations
- `getMassesPaginated(params?)` - Paginated mass list
- `getMass(id)` - Fetch single mass
- `getMassWithRelations(id)` - Fetch mass with ALL relations including mass_roles array
- `createMass(data)` - Create new mass
- `updateMass(id, data)` - Update mass
- `deleteMass(id)` - Delete mass

**Mass Role Instance Functions:**
- `getMassRoles(massId)` - Get all role assignments for a specific mass
- `createMassRole(data)` - Create a single mass role assignment
- `updateMassRole(id, data)` - Update a mass role assignment
- `deleteMassRole(id)` - Delete a mass role assignment
- `bulkCreateMassRoles(massId, assignments)` - Create multiple role assignments at once
- `applyMassTemplate(data)` - Apply a role template to a mass (creates role instances from template)

**Mass Intention Linking Functions:**
- `linkMassIntention(massId, massIntentionId)` - Link a mass intention to a mass
- `unlinkMassIntention(massIntentionId)` - Remove the link between a mass intention and its mass

**TypeScript Interfaces:**
- `Mass` - Base mass type
- `MassWithNames` - Mass with presider/homilist/event names
- `MassWithRelations` - Mass with all related data including mass_roles array
- `CreateMassData` - Create payload
- `UpdateMassData` - Update payload (all optional)

### Mass Scheduling Operations

**File:** `src/lib/actions/mass-scheduling.ts`

**Primary Function:**
- `scheduleMasses(params)` - Bulk create Masses with auto-assignment
- Returns: Created masses count, assignment statistics, detailed results

**Supporting Functions:**
- `getAvailableMinisters(roleId, date, time, parishId)` - Get eligible ministers
- `assignMinisterToRole(massRoleInstanceId, personId)` - Manual assignment
- `getPersonSchedulingConflicts(personId, startDate, endDate)` - Check blackouts

**See [MASS_SCHEDULING.md](./MASS_SCHEDULING.md)** for complete server action specifications.

---

## User Interfaces

### Minister-Facing UI

**Pages to Build:**

**1. My Ministry Dashboard** (`/my-ministry`)
- Overview of upcoming assignments
- Calendar view of my scheduled Masses
- Quick actions: Confirm, Request Substitute
- Notifications/alerts

**2. My Assignments** (`/my-ministry/assignments`)
- List view of upcoming assignments
- Past assignments
- Assignment details (Mass info, role, other ministers)
- Actions: Confirm, Decline, Request Substitute

**3. My Availability** (`/my-ministry/availability`)
- Preference settings form
- Blackout dates calendar
- Role preferences

**4. Substitute Requests** (`/my-ministry/substitutes`)
- Open requests I can fill
- My substitute history
- Accept/decline actions

**5. My Training** (`/my-ministry/training`)
- Certification status
- Training completion dates
- Renewal requirements

### Coordinator-Facing UI

**Pages to Build:**

**1. Mass Schedule** (`/masses`)
- Existing list view enhanced with role assignment status
- Color coding: Fully staffed (green), Partially staffed (yellow), Unstaffed (red)
- Quick stats: Unfilled roles, pending confirmations

**2. Mass Detail/Edit** (`/masses/[id]` or `/masses/[id]/edit`)
- Enhanced form with role assignment section
- For each role from template:
  - Show required count
  - Assign people (searchable dropdown)
  - Status badges (confirmed, pending, declined)
  - Quick actions: Notify, Remind, Find Substitute

**3. Mass Role Assignment Grid** (`/masses/[id]/assignments`)
- Table view:
  - Rows: Roles
  - Columns: Assigned person(s), Status, Actions
- Drag-and-drop interface (future)
- Bulk actions: Notify all, Confirm all

**4. Minister List** (`/ministers`)
- Filterable list of all ministers
- Columns: Name, Role Memberships, Recent Assignments, Status
- Actions: View Details, Assign to Mass, Contact

**5. Minister Detail** (`/ministers/[id]`)
- Minister profile
- Role memberships (active/inactive)
- Blackout dates
- Assignment history
- Communication log
- Notes

**6. Role Membership Management** (`/mass-role-members`)
- List people serving in each role
- Filter by role, active status
- Add/remove people from roles
- View blackout dates
- Bulk operations

**7. Template Management** (`/mass-templates`)
- List of templates
- Create/Edit/Clone/Delete templates
- Role requirement builder

**8. Substitute Management** (`/substitutes`)
- Pending substitute requests
- Filter by date, role, status
- Manually assign substitutes
- Communication tools

**9. Reports** (`/reports/masses`)
- Minister participation reports
- Role coverage reports
- No-show tracking
- Communication effectiveness


---

## Future Enhancements

### Implemented Features ✅
- ✅ Role membership tables (`mass_role_members`, `person_blackout_dates`)
- ✅ Bulk scheduling wizard with auto-assignment algorithm
- ✅ Workload balancing across ministers
- ✅ Blackout date enforcement
- ✅ Conflict detection (double-booking prevention)
- ✅ Interactive assignment grid for manual adjustments

### Phase 1: Enhanced Assignment UI
- [ ] Role assignment section in individual Mass form
- [ ] Visual indicators for filled/unfilled roles
- [ ] Quick assign from available ministers list
- [ ] Template role configuration UI (create/edit templates)

### Phase 2: Communication & Workflow
- [ ] Email notification system for assignments
- [ ] Minister confirmation workflow (confirm/decline)
- [ ] Substitute request system with automated matching
- [ ] Calendar integration (.ics files)
- [ ] Assignment history tracking per minister

### Phase 3: Minister Portal
- [ ] Minister self-service dashboard (`/my-ministry`)
- [ ] View upcoming assignments
- [ ] Manage blackout dates
- [ ] Request substitutes
- [ ] Confirm/decline assignments
- [ ] View assignment history

### Phase 4: Advanced Features
- [ ] SMS notifications (Twilio integration)
- [ ] Mobile-optimized interface
- [ ] Advanced reporting (minister utilization, coverage gaps)
- [ ] Training/certification tracking
- [ ] Drag-and-drop assignment interface
- [ ] No-show tracking and analytics

### Future Vision
- [ ] Mobile app (iOS/Android)
- [ ] Multi-parish coordination
- [ ] AI-powered scheduling suggestions
- [ ] Template sharing marketplace
- [ ] Minister appreciation/recognition system

---

## Implementation Priorities

### Critical Path (Must Have for Launch)
1. **Role Assignment UI** - Coordinators need to assign ministers to roles
2. **Minister Confirmation** - Ministers need to confirm assignments
3. **Basic Notifications** - Email notifications for assignments and reminders
4. **Template System** - Define standard role configurations

### High Priority (Should Have Soon)
1. **Substitute Requests** - Ministers need ability to find substitutes
2. **Role Membership Management** - Add/remove people from roles, manage active status
3. **Blackout Date Management** - UI for ministers to set unavailable periods
4. **Minister List** - View all ministers and their role memberships

### Medium Priority (Nice to Have)
1. **Auto-Assignment** - Suggest assignments based on role membership and blackout dates
2. **Reporting** - Track minister participation and role coverage
3. **Calendar Integration** - .ics files for email notifications

### Low Priority (Future)
1. **SMS Notifications** - For urgent changes
2. **Mobile App** - Native mobile experience
3. **Advanced Analytics** - Predictive scheduling, trend analysis

---

## Notes & Considerations

### Design Principles
- **Simplicity First** - Don't overwhelm coordinators or ministers with complexity
- **Mobile-Friendly** - Ministers check notifications on phones
- **Minimal Clicks** - Confirm/decline should be one-click actions
- **Clear Status** - Always know what's filled, what's pending, what needs attention
- **Respectful Communication** - Not spammy, appropriate frequency, easy to opt-out

### Security & Privacy
- Ministers can only see their own assignments and open substitute requests
- Coordinators can see all assignments for their parish
- Contact info (email/phone) privacy settings
- Role-based access control (ministers vs coordinators vs admins)

### Scalability
- System should handle 100+ ministers per parish
- Support 20+ Masses per week
- Historical data retention (1+ years of assignments)
- Performance optimization for large parishes

### Edge Cases
- Minister assigned to multiple roles in same Mass
- Last-minute cancellations (day-of)
- No active role members available for assignment
- Minister on blackout dates but needed urgently
- Bilingual Mass coverage
- Minister leaves parish (mark memberships inactive, archive assignments)

---

## Related Documentation

**Mass Module Specific:**
- **[MASS_SCHEDULING.md](./MASS_SCHEDULING.md)** - Complete bulk scheduling wizard documentation (workflow, algorithm, UI components)

**General Patterns:**
- [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md) - Standard 9-file module structure
- [FORMS.md](./FORMS.md) - Form patterns and component usage
- [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) - Reusable components (pickers, form components)
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Data architecture and server actions patterns

**Related Modules:**
- [GROUP_MEMBERS.md](./GROUP_MEMBERS.md) - Similar person-role membership pattern (different use case)

---

**Last Updated:** 2025-11-20
**Status:** Active Development
**Current Focus:** Bulk scheduling wizard (implemented), enhanced assignment UI (planned)
