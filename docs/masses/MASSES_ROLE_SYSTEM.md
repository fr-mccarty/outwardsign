# Mass Module - Role System Architecture

> **⚠️ DEPRECATED:** This document describes the legacy `mass_roles` system that was removed in December 2024. The Mass Liturgies module now uses the unified event data model with three-concern separation:
> 1. **Role Definitions** - Defined in `input_field_definitions` table (with `input_type = 'person'`)
> 2. **Role Capability** - Managed through groups + group_members (who CAN serve)
> 3. **Role Assignments** - Stored in `people_event_assignments` table (who IS serving)
>
> For current implementation, see [MASSES_OVERVIEW.md](./MASSES_OVERVIEW.md)

---

> **Legacy Purpose:** Role definitions, templates, membership, and availability tracking for Mass ministry assignments.

## Table of Contents

- [Standard Liturgical Roles](#standard-liturgical-roles)
- [Role Configuration Requirements](#role-configuration-requirements)
- [Template System](#template-system)
- [Role Membership & Availability](#role-membership--availability)

---

## Standard Liturgical Roles

**Currently NOT tracked in system (needs implementation):**

### 1. Extraordinary Eucharistic Ministers (EEMs)
- **Responsibilities:** Distribute Communion (Body and/or Blood of Christ)
- **Typical Number:** 4-8 ministers (varies by parish size and Communion under both species)
- **Required vs Extra:** Usually a fixed number required, extras on standby
- **Scheduling Notes:** Need training/certification, may have preferences for chalice vs host

### 2. Lectors (Readers)
- **Responsibilities:** Proclaim Scripture readings (except Gospel), lead Prayers of the Faithful
- **Typical Number:** 2-3 (First Reading, Second Reading if applicable, Petitions)
- **Required vs Extra:** 1-2 required minimum, may have backup
- **Scheduling Notes:** Should prepare readings in advance, may need bilingual lectors

### 3. Altar Servers
- **Responsibilities:** Assist priest at altar (carry cross, candles, hold book, prepare gifts, etc.)
- **Typical Number:** 2-4 servers (varies by Mass type)
- **Required vs Extra:** Minimum 1, ideal 2+
- **Scheduling Notes:** Often youth/teens, need training, may have master of ceremonies role

### 4. Ushers/Greeters
- **Responsibilities:** Welcome parishioners, distribute bulletins, take collection, direct Communion lines, handle emergencies
- **Typical Number:** 4-8 (varies by church size)
- **Required vs Extra:** Sufficient to cover all entrances and collection
- **Scheduling Notes:** May have head usher coordinating team

### 5. Sacristans
- **Responsibilities:** Prepare altar, vestments, sacred vessels before Mass; clean up after
- **Typical Number:** 1-2 per Mass
- **Required vs Extra:** 1 required minimum
- **Scheduling Notes:** Need access to sacristy, detailed knowledge of Mass preparation

### 6. Music Ministers
- **Responsibilities:** Lead congregational singing, provide instrumental accompaniment
- **Typical Roles:**
  - Music Director/Cantor (leads singing)
  - Organist/Pianist (accompaniment)
  - Choir members (4-20+ depending on parish)
  - Instrumentalists (guitar, violin, etc.)
- **Required vs Extra:** Varies greatly by parish tradition and Mass type
- **Scheduling Notes:** Often separate scheduling system for choir, may need separate rehearsals

### 7. Gift Bearers (Offertory Procession)
- **Responsibilities:** Bring bread, wine, and collection to altar
- **Typical Number:** 2-4 people (often family or special group)
- **Required vs Extra:** Nice to have, not strictly required
- **Scheduling Notes:** Often assigned to families celebrating occasions (baptism, anniversary, etc.)

### 8. Hospitality Ministers
- **Responsibilities:** Post-Mass fellowship (coffee, donuts), welcome newcomers
- **Typical Number:** 2-6 volunteers
- **Required vs Extra:** Extra (not part of Mass liturgy)
- **Scheduling Notes:** May be separate team from ushers

### 9. Technology/AV Ministers
- **Responsibilities:** Manage sound system, livestream, projection screens, recording
- **Typical Number:** 1-2 per Mass
- **Required vs Extra:** Required for parishes with AV systems
- **Scheduling Notes:** Need technical training, often youth/young adults

### 10. Other Specialized Roles
- Master of Ceremonies (for solemn Masses)
- Thurifer (incense bearer)
- Crucifer (cross bearer)
- Torch bearers
- Book bearer

---

## Role Configuration Requirements

**For each role, we need to track:**

### 1. Role Definition
- Role name (e.g., "Lector", "EEM - Host", "EEM - Chalice", "Altar Server")
- Description
- Required training/certification
- Age requirements (if applicable)
- Active/inactive status

### 2. Template Requirements (per Mass type)
- Number required (e.g., "2 lectors required")
- Number desired (e.g., "3 lectors ideal")
- Maximum allowed (e.g., "4 lectors max")
- Priority/criticality (critical, important, optional)
- Default assignments (if any)

### 3. Person-Role Relationship
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
- File reference: `src/lib/actions/mass-liturgies.ts:createMass()`

**Step 5:** Generate role instances (automatic)
- System creates `mass_role_instances` based on template items
- Each instance initially has `person_id` = NULL (unfilled)

**Step 6:** Assign people (manual or automated)
- Staff assigns people to fill slots via UI or auto-assignment algorithm
- Updates `mass_role_instances.person_id`

### Mass Type Templates

**Purpose:** Define standard role configurations for different types of Masses.

**Template Examples:**

#### 1. Sunday Mass - Full (Choir)
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

#### 2. Sunday Mass - Simple (No Choir)
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

#### 3. Weekday Mass
- Presider: 1 - required
- Lector: 1 - required
- EEMs: 2 - required
- Altar Server: 1 - required (optional in some parishes)
- Sacristan: 1 - required
- Ushers: 0-2 - optional

#### 4. Bilingual Mass (Spanish/English)
- Same as Sunday Mass, but:
- Bilingual Lectors required (or separate Spanish/English lectors)
- Bilingual Cantor/Music Director required
- May need translation support for announcements

#### 5. Special Event Mass (First Communion, Confirmation, etc.)
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

## Related Documentation

- **[MASSES_OVERVIEW.md](./MASSES_OVERVIEW.md)** - Current implementation status
- **[MASSES_SCHEDULING.md](./MASSES_SCHEDULING.md)** - Scheduling workflows
- **[MASSES_UI.md](./MASSES_UI.md)** - UI specifications
- **[MASSES_DATABASE.md](./MASSES_DATABASE.md)** - Complete schema reference
- **[GROUP_MEMBERS.md](../GROUP_MEMBERS.md)** - Similar person-role membership pattern

---

**Last Updated:** 2025-12-02
**Status:** Active Development
