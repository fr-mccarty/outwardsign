# Mass Role Template System

**Last Updated:** 2025-11-18

## Overview

The Mass Role Template System enables parishes to define reusable staffing patterns for Masses. Instead of manually assigning roles for each Mass, parishes create templates (e.g., "Sunday Morning Mass", "Weekday Evening Mass") that specify which roles are needed and how many people are required for each role. These templates can then be applied to individual Masses to generate role assignment slots.

---

## Architecture Overview

The system consists of 5 interconnected tables that work together:

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

**Related Tables:**
- `mass_role_preferences` - User availability and scheduling preferences
- `mass_role_blackout_dates` - User unavailability periods

---

## Table Descriptions

### 1. `mass_roles` - Role Definitions

**Purpose:** Define the types of liturgical roles available in the parish.

**Schema:**
```sql
CREATE TABLE mass_roles (
  id UUID PRIMARY KEY,
  parish_id UUID NOT NULL,
  name TEXT NOT NULL,              -- "Lector", "Usher", "Server", etc.
  description TEXT,                -- What this role does
  note TEXT,                       -- Special instructions
  is_active BOOLEAN DEFAULT true,  -- Can this role be assigned?
  display_order INTEGER,           -- Sorting for UI lists
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(parish_id, name)
);
```

**Examples:**
- Lector (Reader of Scripture)
- Eucharistic Minister (Distributes Communion)
- Usher (Greets parishioners, takes collection)
- Altar Server (Assists the priest at the altar)
- Music Minister (Cantor, Choir, Musician)
- Sacristan (Prepares sacred vessels and vestments)

**Key Characteristics:**
- Parish-specific (each parish defines their own roles)
- Reusable across all templates and masses
- Can be marked inactive to prevent future assignments
- Display order controls UI presentation

---

### 2. `mass_roles_templates` - Template Container

**Purpose:** Define named templates that represent different Mass types or staffing patterns.

**Schema:**
```sql
CREATE TABLE mass_roles_templates (
  id UUID PRIMARY KEY,
  parish_id UUID NOT NULL,
  name TEXT NOT NULL,           -- "Sunday Morning Mass", "Weekday Evening", etc.
  description TEXT,             -- What this template is for
  note TEXT,                    -- Special notes
  parameters JSONB,             -- Future: additional metadata
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Examples:**
- "Sunday Morning Mass" - Full staffing with choir, multiple lectors, etc.
- "Weekday Evening Mass" - Minimal staffing
- "Holy Day Mass" - Enhanced staffing for special occasions
- "Bilingual Mass" - Requires Spanish-speaking ministers
- "Children's Mass" - Special roles for youth participation

**Key Characteristics:**
- Acts as a named container for a set of role requirements
- Reusable across multiple Masses
- Parish-specific

**Relationship:** A template contains multiple template items (defined below).

---

### 3. `mass_roles_template_items` - Template Composition

**Purpose:** Define which roles are needed in a template and how many people are required for each role.

**Schema:**
```sql
CREATE TABLE mass_roles_template_items (
  id UUID PRIMARY KEY,
  template_id UUID NOT NULL,      -- Which template this belongs to
  mass_role_id UUID NOT NULL,     -- Which role is needed
  count INTEGER NOT NULL,         -- How many people for this role
  position INTEGER NOT NULL,      -- Display order (0, 1, 2, ...)
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(template_id, mass_role_id),     -- Each role once per template
  UNIQUE(template_id, position)          -- Each position unique
);
```

**Example: "Sunday Morning Mass" Template**

| Position | Role | Count | Description |
|----------|------|-------|-------------|
| 0 | Sacristan | 1 | Prepares altar before Mass |
| 1 | Lector | 2 | First and second readings |
| 2 | Eucharistic Minister | 4 | Distributes communion |
| 3 | Usher | 4 | Greets, takes collection, guides communion |
| 4 | Altar Server | 2 | Assists priest at altar |
| 5 | Music Minister | 3 | Cantor + 2 accompanists |

**Total Slots Created:** 16 (1 + 2 + 4 + 4 + 2 + 3)

**Key Characteristics:**
- Links a template to specific roles
- Defines quantity needed for each role
- Position field enables drag-and-drop reordering in UI
- Each template can include each role only once (but with count > 1)
- Cascade deletes: if template deleted, all items deleted

**Relationship:** When a Mass uses this template, each template item generates `count` number of role instances.

---

### 4. `mass_role_instances` - Actual Assignments

**Purpose:** Store the actual assignment of a specific person to a specific role for a specific Mass.

**Schema:**
```sql
CREATE TABLE mass_role_instances (
  id UUID PRIMARY KEY,
  mass_id UUID NOT NULL,                         -- Which Mass
  person_id UUID NOT NULL,                       -- Who is assigned
  mass_roles_template_item_id UUID NOT NULL,     -- Which template item (defines role)
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**How It Works:**

When a Mass is created and assigned the "Sunday Morning Mass" template:
1. The system looks up all `mass_roles_template_items` for that template
2. For each template item with `count = N`, it creates `N` empty role instances
3. Each instance is linked to the `mass_id` and `mass_roles_template_item_id`
4. The `person_id` is initially NULL (unfilled slot)
5. Staff can then assign people to fill these slots

**Example: Sunday Mass on 2025-12-01**

| Mass ID | Person | Template Item | Role (from template item) |
|---------|--------|---------------|---------------------------|
| mass-123 | NULL | item-1 | Sacristan (slot 1 of 1) |
| mass-123 | person-456 | item-2 | Lector (slot 1 of 2) |
| mass-123 | person-789 | item-2 | Lector (slot 2 of 2) |
| mass-123 | NULL | item-3 | Eucharistic Minister (slot 1 of 4) |
| mass-123 | person-101 | item-3 | Eucharistic Minister (slot 2 of 4) |
| mass-123 | NULL | item-3 | Eucharistic Minister (slot 3 of 4) |
| mass-123 | NULL | item-3 | Eucharistic Minister (slot 4 of 4) |
| mass-123 | ... | ... | ... (continues for all 16 slots) |

**Key Characteristics:**
- One record per person per role assignment
- NULL person_id = unfilled slot
- Links to template item (not directly to role) to preserve which template was used
- Cascade deletes: if Mass deleted, all instances deleted

**Future Enhancement:** Additional fields for confirmation status, notifications, etc.
```sql
-- Future fields (not yet implemented):
status TEXT,              -- 'ASSIGNED' | 'CONFIRMED' | 'DECLINED' | 'SUBSTITUTE_REQUESTED'
confirmed_at TIMESTAMPTZ,
notified_at TIMESTAMPTZ,
notes TEXT
```

---

## Data Flow: From Template to Assignment

### Step 1: Define Roles (One-Time Setup)

Parish creates role definitions:
```
mass_roles:
  - Lector
  - Eucharistic Minister
  - Usher
  - Altar Server
```

### Step 2: Create Template (One-Time Setup)

Parish creates a template for "Sunday Morning Mass":
```
mass_roles_templates:
  id: template-abc
  name: "Sunday Morning Mass"
  description: "Full staffing for principal Sunday liturgy"
```

### Step 3: Add Items to Template (One-Time Setup)

Parish defines what roles are needed:
```
mass_roles_template_items:
  - template_id: template-abc, mass_role_id: lector-id, count: 2, position: 0
  - template_id: template-abc, mass_role_id: em-id, count: 4, position: 1
  - template_id: template-abc, mass_role_id: usher-id, count: 4, position: 2
  - template_id: template-abc, mass_role_id: server-id, count: 2, position: 3
```

### Step 4: Create Mass with Template (Recurring)

Parish creates a Mass and applies the template:
```
masses:
  id: mass-123
  date: 2025-12-01
  time: 10:00 AM
  mass_roles_template_id: template-abc
```

### Step 5: Generate Role Instances (Automatic)

System automatically creates instances based on template items:
```
mass_role_instances:
  - mass_id: mass-123, template_item_id: (lector, count: 2), person_id: NULL
  - mass_id: mass-123, template_item_id: (lector, count: 2), person_id: NULL
  - mass_id: mass-123, template_item_id: (em, count: 4), person_id: NULL
  - mass_id: mass-123, template_item_id: (em, count: 4), person_id: NULL
  - mass_id: mass-123, template_item_id: (em, count: 4), person_id: NULL
  - mass_id: mass-123, template_item_id: (em, count: 4), person_id: NULL
  ... (12 total instances for 2+4+4+2)
```

### Step 6: Assign People (Manual or Automated)

Staff assigns people to fill the slots:
```
UPDATE mass_role_instances SET person_id = 'person-456' WHERE id = 'instance-1';
UPDATE mass_role_instances SET person_id = 'person-789' WHERE id = 'instance-2';
...
```

---

## Querying the System

### Get All Roles Needed for a Mass

```sql
SELECT
  mr.name AS role_name,
  mrti.count AS slots_needed,
  COUNT(mri.person_id) AS slots_filled
FROM masses m
JOIN mass_roles_template_items mrti ON mrti.template_id = m.mass_roles_template_id
JOIN mass_roles mr ON mr.id = mrti.mass_role_id
LEFT JOIN mass_role_instances mri ON mri.mass_id = m.id AND mri.mass_roles_template_item_id = mrti.id
WHERE m.id = 'mass-123'
GROUP BY mr.name, mrti.count, mrti.position
ORDER BY mrti.position;
```

### Get All Unfilled Slots for a Mass

```sql
SELECT
  mr.name AS role_name,
  mri.id AS instance_id
FROM mass_role_instances mri
JOIN mass_roles_template_items mrti ON mrti.id = mri.mass_roles_template_item_id
JOIN mass_roles mr ON mr.id = mrti.mass_role_id
WHERE mri.mass_id = 'mass-123' AND mri.person_id IS NULL
ORDER BY mrti.position;
```

### Get All Assignments for a Person

```sql
SELECT
  m.date,
  m.time,
  mr.name AS role_name
FROM mass_role_instances mri
JOIN masses m ON m.id = mri.mass_id
JOIN mass_roles_template_items mrti ON mrti.id = mri.mass_roles_template_item_id
JOIN mass_roles mr ON mr.id = mrti.mass_role_id
WHERE mri.person_id = 'person-456'
ORDER BY m.date, m.time;
```

---

## User Preferences & Blackout Dates

### `mass_role_preferences` Table

**Purpose:** Store each person's scheduling preferences, role capabilities, and availability patterns.

**Schema:**
```sql
CREATE TABLE mass_role_preferences (
  id UUID PRIMARY KEY,
  person_id UUID NOT NULL,
  parish_id UUID NOT NULL,
  mass_role_id UUID,                    -- NULL = general preferences

  -- Day/Time preferences
  preferred_days JSONB,                 -- ["SUNDAY", "SATURDAY"]
  available_days JSONB,                 -- ["MONDAY", "WEDNESDAY"]
  unavailable_days JSONB,               -- ["FRIDAY"]
  preferred_times JSONB,                -- ["09:00-12:00", "17:00-19:00"]
  unavailable_times JSONB,              -- ["06:00-08:00"]

  -- Frequency preferences
  desired_frequency TEXT,               -- 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'OCCASIONAL'
  max_per_month INTEGER,                -- Maximum assignments per month

  -- Language capabilities
  languages JSONB,                      -- [{"language": "en", "level": "fluent"}]

  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,

  UNIQUE(person_id, parish_id, mass_role_id)
);
```

**Use Cases:**
- Person prefers to serve on Sundays only
- Person wants to serve at most 2 times per month
- Person is fluent in Spanish and intermediate in English
- Person is unavailable on Friday evenings
- Person prefers morning Masses (09:00-12:00)

**Integration with Scheduling:**
When assigning people to roles, the system should:
1. Check if person has preferences for this role
2. Respect preferred/available/unavailable days
3. Respect preferred/unavailable times
4. Check if assignment would exceed max_per_month
5. Consider language requirements of the Mass

### `mass_role_blackout_dates` Table

**Purpose:** Store specific date ranges when a person is unavailable.

**Schema:**
```sql
CREATE TABLE mass_role_blackout_dates (
  id UUID PRIMARY KEY,
  person_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ,

  CHECK (end_date >= start_date)
);
```

**Examples:**
- Vacation: 2025-07-01 to 2025-07-15
- Out of town: 2025-12-20 to 2025-12-27
- Personal commitment: 2025-08-10 to 2025-08-10 (single day)

**Integration with Scheduling:**
Before assigning a person to a Mass:
1. Check if Mass date falls within any blackout period
2. If yes, mark person as unavailable
3. If person is already assigned and adds blackout later, flag conflict

---

## Workflow Examples

### Example 1: Creating a New Mass Type

**Scenario:** Parish wants to add a "Children's Mass" template.

1. **Define any new roles needed** (if not already exist)
   ```sql
   INSERT INTO mass_roles (parish_id, name, description)
   VALUES ('parish-123', 'Children's Lector', 'Youth reader for children's Mass');
   ```

2. **Create the template**
   ```sql
   INSERT INTO mass_roles_templates (parish_id, name, description)
   VALUES ('parish-123', 'Children's Mass', 'Monthly Mass with youth participation');
   ```

3. **Add items to template**
   ```sql
   -- Add 2 children's lectors
   INSERT INTO mass_roles_template_items (template_id, mass_role_id, count, position)
   VALUES ('template-xyz', 'children-lector-id', 2, 0);

   -- Add 1 adult lector
   INSERT INTO mass_roles_template_items (template_id, mass_role_id, count, position)
   VALUES ('template-xyz', 'lector-id', 1, 1);

   -- Add 3 ushers
   INSERT INTO mass_roles_template_items (template_id, mass_role_id, count, position)
   VALUES ('template-xyz', 'usher-id', 3, 2);
   ```

4. **Use template for a Mass**
   ```sql
   INSERT INTO masses (parish_id, date, time, mass_roles_template_id)
   VALUES ('parish-123', '2025-12-01', '11:00', 'template-xyz');
   ```

5. **System auto-generates 6 role instances** (2 + 1 + 3)

### Example 2: Modifying a Template

**Scenario:** Parish realizes they need 5 ushers instead of 4 for Sunday Mass.

1. **Update the template item**
   ```sql
   UPDATE mass_roles_template_items
   SET count = 5
   WHERE template_id = 'sunday-template-id'
     AND mass_role_id = 'usher-role-id';
   ```

2. **For existing Masses using this template:**
   - **Option A:** Instances already created are NOT automatically updated
   - **Option B (Future):** Implement "Re-apply Template" function to regenerate instances

**Design Decision:** Templates are blueprints. Once a Mass is created, its instances are independent. This prevents accidental data loss if someone already assigned people.

### Example 3: Person Sets Preferences

**Scenario:** Mary wants to serve as Lector, prefers Sundays, max 2 times/month.

1. **Mary creates preferences**
   ```sql
   INSERT INTO mass_role_preferences (
     person_id, parish_id, mass_role_id,
     preferred_days, desired_frequency, max_per_month, active
   )
   VALUES (
     'mary-id', 'parish-123', 'lector-role-id',
     '["SUNDAY"]', 'BIWEEKLY', 2, true
   );
   ```

2. **Mary adds blackout dates**
   ```sql
   INSERT INTO mass_role_blackout_dates (person_id, start_date, end_date, reason)
   VALUES ('mary-id', '2025-07-01', '2025-07-15', 'Vacation in Italy');
   ```

3. **Scheduler considers preferences**
   - When auto-assigning lectors, system checks:
     - Is Mary available on this date? (not in blackout)
     - Does she prefer this day? (Sunday = yes)
     - Has she served 2 times already this month? (check count)

---

## Technical Implementation Notes

### Server Actions Pattern

**File:** `src/lib/actions/mass-roles.ts`

Key functions to implement:
```typescript
// Templates
getMassRoleTemplates(parishId: string): Promise<MassRoleTemplate[]>
getMassRoleTemplateWithItems(id: string): Promise<MassRoleTemplateWithItems>
createMassRoleTemplate(data): Promise<MassRoleTemplate>
updateMassRoleTemplate(id, data): Promise<MassRoleTemplate>
deleteMassRoleTemplate(id): Promise<void>

// Template Items
addTemplateItem(templateId, roleId, count, position): Promise<TemplateItem>
updateTemplateItem(id, data): Promise<TemplateItem>
removeTemplateItem(id): Promise<void>
reorderTemplateItems(templateId, itemIds: string[]): Promise<void>

// Role Instances
generateInstancesForMass(massId, templateId): Promise<void>
assignPersonToInstance(instanceId, personId): Promise<MassRoleInstance>
unassignPersonFromInstance(instanceId): Promise<void>
getMassRoleInstances(massId): Promise<MassRoleInstanceWithDetails[]>
```

### TypeScript Interfaces

```typescript
interface MassRole {
  id: string
  parish_id: string
  name: string
  description: string | null
  note: string | null
  is_active: boolean
  display_order: number | null
  created_at: string
  updated_at: string
}

interface MassRoleTemplate {
  id: string
  parish_id: string
  name: string
  description: string | null
  note: string | null
  parameters: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

interface MassRoleTemplateItem {
  id: string
  template_id: string
  mass_role_id: string
  count: number
  position: number
  created_at: string
  updated_at: string
}

interface MassRoleTemplateItemWithRole extends MassRoleTemplateItem {
  mass_role: MassRole
}

interface MassRoleTemplateWithItems extends MassRoleTemplate {
  items: MassRoleTemplateItemWithRole[]
}

interface MassRoleInstance {
  id: string
  mass_id: string
  person_id: string | null
  mass_roles_template_item_id: string
  created_at: string
  updated_at: string
}

interface MassRoleInstanceWithDetails extends MassRoleInstance {
  person: Person | null
  template_item: MassRoleTemplateItemWithRole
}
```

---

## Future Enhancements

### Phase 2 Features

1. **Auto-Scheduling Algorithm**
   - Automatically assign people to unfilled slots
   - Respect preferences and blackout dates
   - Balance assignments fairly across all volunteers
   - Prioritize people who haven't served recently

2. **Confirmation Workflow**
   - Add `status` field to `mass_role_instances`
   - Send notifications to assigned people
   - Allow people to confirm/decline assignments
   - Track who has been notified and when

3. **Substitute Management**
   - New table: `mass_role_substitutions`
   - Allow people to request substitutes
   - Show open substitute requests to eligible people
   - Track substitute history

4. **Template Versioning**
   - Track changes to templates over time
   - Allow "Re-apply Template" to existing Masses
   - Option to update all future Masses using a template

5. **Role Requirements**
   - Training/certification tracking
   - Age restrictions (e.g., must be 16+ for Eucharistic Minister)
   - Gender requirements (if applicable to certain traditions)
   - Language proficiency requirements

6. **Reporting & Analytics**
   - Who serves most frequently?
   - Which roles have the most unfilled slots?
   - Attendance tracking (did they show up?)
   - Recognition reports (certificates, thank you letters)

---

## Summary

The Mass Role Template System provides a flexible, reusable framework for managing liturgical role assignments:

1. **`mass_roles`** - Define role types (one-time setup)
2. **`mass_roles_templates`** - Create named staffing patterns (one-time setup)
3. **`mass_roles_template_items`** - Specify which roles + quantities per template (one-time setup)
4. **`masses`** - Create Mass events linked to templates (recurring)
5. **`mass_role_instances`** - Actual person assignments (recurring)

**Benefits:**
- ✅ Reusable templates reduce repetitive data entry
- ✅ Consistent staffing patterns across similar Masses
- ✅ Easy to modify templates without affecting past Masses
- ✅ Clear separation between "what's needed" (template) and "who's assigned" (instance)
- ✅ Scalable to handle multiple Mass types and complex scheduling needs

**Key Design Principle:** Templates are blueprints that generate instances. Once instances are created, they are independent of the template to preserve assignment history.
