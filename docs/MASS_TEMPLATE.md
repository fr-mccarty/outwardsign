# MASS_TEMPLATE.md

> **Purpose:** Complete documentation of the Mass Role Template system, including data structures, workflows, and the relationship between templates, template items, and actual Mass role assignments.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Data Structures](#data-structures)
- [Database Schema](#database-schema)
- [Workflow: Template to Mass Assignment](#workflow-template-to-mass-assignment)
- [Real-World Example: St. Mary's Parish](#real-world-example-st-marys-parish)
- [Component Structure](#component-structure)
- [Server Actions API](#server-actions-api)
- [UI Behavior](#ui-behavior)

---

## Overview

The Mass Role Template system allows parishes to define reusable templates for different types of Masses (Sunday Mass, Weekday Mass, Bilingual Mass, etc.). Each template specifies which liturgical roles are needed and how many people are required for each role.

**Key Concepts:**

1. **Mass Role** - A liturgical role definition (e.g., "Lector", "Extraordinary Eucharistic Minister", "Altar Server")
2. **Mass Role Template** - A reusable configuration for a type of Mass (e.g., "Sunday Mass - Full Choir")
3. **Mass Role Template Item** - Individual role requirements within a template (e.g., "2 Lectors needed")
4. **Mass Role Instance** - Actual assignment of a person to a role for a specific Mass

**Data Flow:**
```
Mass Role (Definition)
    ↓
Mass Role Template (e.g., "Sunday Mass")
    ↓
Mass Role Template Item (e.g., "2 Lectors needed")
    ↓
Mass (Specific celebration on a date/time)
    ↓
Mass Role Instance (John Smith assigned as Lector)
```

---

## System Architecture

### The Four-Table Structure

The system uses **four interconnected tables** to manage Mass role templates and assignments:

```
┌─────────────────────┐
│   mass_roles        │ ← Role Definitions (Lector, EEM, etc.)
│  (parish-specific)  │
└──────────┬──────────┘
           │
           │ Referenced by
           ↓
┌─────────────────────────────┐
│  mass_roles_template_items  │ ← Role Requirements in Templates
│   (role_id + count)         │   (e.g., "3 Lectors needed")
└──────────┬──────────────────┘
           │
           │ Belongs to
           ↓
┌───────────────────────┐
│ mass_roles_templates  │ ← Template Definitions
│  (name + description) │   (e.g., "Sunday Mass - Full")
└───────────────────────┘


                                          ┌─────────────┐
                                          │   masses    │ ← Specific Mass Events
                                          └──────┬──────┘
                                                 │
                            ┌────────────────────┴────────────────────┐
                            │ Can optionally reference a template     │
                            │ (mass_roles_template_id)                │
                            └────────────────────┬────────────────────┘
                                                 │
           ┌─────────────────────────────────────┼─────────────────────────────────┐
           │                                     │                                 │
           │ Assignments use template items      │                                 │
           ↓                                     ↓                                 ↓
┌─────────────────────────┐        ┌─────────────────────────────┐   ┌────────────────┐
│ mass_role_instances     │        │  mass_roles_template_items  │   │    people      │
│ (person + role + mass)  │───────→│  (defines which role)       │   │  (assigned)    │
└─────────────────────────┘        └─────────────────────────────┘   └────────────────┘
```

### Key Relationships

1. **Mass Roles** are parish-specific definitions of liturgical roles
2. **Mass Role Templates** are collections of role requirements (e.g., "Sunday Mass needs 3 Lectors, 6 EEMs, 2 Altar Servers")
3. **Mass Role Template Items** link templates to specific roles with a count
4. **Mass Role Instances** assign actual people to roles for specific Masses, referencing template items

---

## Data Structures

### TypeScript Interfaces

#### 1. MassRole (Role Definition)

**File:** `src/lib/types.ts`

```typescript
export interface MassRole {
  id: string
  parish_id: string
  name: string                  // e.g., "Lector", "Extraordinary Eucharistic Minister"
  description?: string          // e.g., "Proclaim Scripture readings"
  note?: string                 // Internal notes
  is_active: boolean            // Whether this role is currently in use
  display_order?: number | null // For sorting in UI
  created_at: string
  updated_at: string
}
```

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "parish_id": "abc123...",
  "name": "Lector",
  "description": "Proclaim the First and Second Readings",
  "note": "Must complete training before serving",
  "is_active": true,
  "display_order": 1,
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T10:00:00Z"
}
```

#### 2. MassRolesTemplate (Template Header)

**File:** `src/lib/actions/mass-role-templates.ts`

```typescript
export interface MassRoleTemplate {
  id: string
  parish_id: string
  name: string                  // e.g., "Sunday Mass - Full Choir"
  description: string | null    // e.g., "Standard Sunday Mass with full music ministry"
  note: string | null           // Internal notes
  created_at: string
  updated_at: string
}
```

**Example:**
```json
{
  "id": "7f3d5b2a-1c4e-4f8a-9b6d-2e8f1a3c5d7b",
  "parish_id": "abc123...",
  "name": "Sunday Mass - Full Choir",
  "description": "Standard Sunday Mass with full music ministry and all liturgical roles",
  "note": "Use for 9:00 AM and 11:00 AM Sunday Masses",
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T10:00:00Z"
}
```

#### 3. MassRoleTemplateItem (Role Requirement)

**File:** `src/lib/actions/mass-role-template-items.ts`

```typescript
export interface MassRoleTemplateItem {
  id: string
  template_id: string                    // FK to mass_roles_templates
  mass_role_id: string                   // FK to mass_roles
  count: number                          // How many people needed for this role
  position: number                       // Zero-based ordering (0, 1, 2, ...)
  created_at: string
  updated_at: string
}

export interface MassRoleTemplateItemWithRole extends MassRoleTemplateItem {
  mass_role: {
    id: string
    name: string
    description: string | null
  }
}
```

**Example:**
```json
{
  "id": "item-001",
  "template_id": "7f3d5b2a-1c4e-4f8a-9b6d-2e8f1a3c5d7b",
  "mass_role_id": "550e8400-e29b-41d4-a716-446655440000",
  "count": 3,
  "position": 0,
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T10:00:00Z",
  "mass_role": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Lector",
    "description": "Proclaim the First and Second Readings"
  }
}
```

**Key Fields:**
- **`count`**: Minimum 1, maximum 99 (enforced in UI)
- **`position`**: Zero-based ordering for drag-and-drop sorting (0, 1, 2, 3, ...)
- **Unique constraint**: `(template_id, mass_role_id)` - prevents duplicate roles in same template

#### 4. MassRoleInstance (Actual Assignment)

**File:** `src/lib/types.ts`

```typescript
export interface MassRoleInstance {
  id: string
  mass_id: string                           // FK to masses
  person_id: string                         // FK to people
  mass_roles_template_item_id: string       // FK to mass_roles_template_items
  created_at: string
  updated_at: string
}
```

**File:** `src/lib/actions/mass-roles.ts`

```typescript
export interface MassRoleInstanceWithRelations extends MassRoleInstance {
  person?: Person | null
  mass_roles_template_item?: {
    id: string
    mass_role: MassRole
  } | null
}
```

**Example:**
```json
{
  "id": "instance-001",
  "mass_id": "mass-123",
  "person_id": "person-456",
  "mass_roles_template_item_id": "item-001",
  "created_at": "2025-01-15T08:00:00Z",
  "updated_at": "2025-01-15T08:00:00Z",
  "person": {
    "id": "person-456",
    "first_name": "John",
    "last_name": "Smith"
  },
  "mass_roles_template_item": {
    "id": "item-001",
    "mass_role": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Lector",
      "description": "Proclaim the First and Second Readings"
    }
  }
}
```

**Critical Relationship:**
- `mass_roles_template_item_id` links the assignment to a specific template item
- Through the template item, you get the **role definition** (Lector, EEM, etc.)
- This allows **multiple people to be assigned to the same role** for the same Mass (e.g., 3 different people as Lectors)

---

## Database Schema

### 1. mass_roles

**Purpose:** Define liturgical roles for a parish (Lector, EEM, Altar Server, etc.)

**Migration:** `20251110000005_create_mass_roles_table.sql`

```sql
CREATE TABLE mass_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  note TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mass_roles_parish_id ON mass_roles(parish_id);
CREATE INDEX idx_mass_roles_display_order ON mass_roles(display_order);
```

**Constraints:**
- Cascade delete when parish is deleted
- `is_active` defaults to `true`

### 2. mass_roles_templates

**Purpose:** Define reusable Mass templates (e.g., "Sunday Mass - Full", "Weekday Mass")

**Migration:** `20251110000003_create_mass_roles_templates_table.sql`

```sql
CREATE TABLE mass_roles_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mass_roles_templates_parish_id ON mass_roles_templates(parish_id);
```

**Note:** No `parameters` JSONB field in current implementation - role requirements are stored in separate `mass_roles_template_items` table.

### 3. mass_roles_template_items

**Purpose:** Define role requirements within a template (e.g., "3 Lectors needed")

**Migration:** `20251115000002_create_mass_roles_template_items_table.sql`

```sql
CREATE TABLE mass_roles_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES mass_roles_templates(id) ON DELETE CASCADE,
  mass_role_id UUID NOT NULL REFERENCES mass_roles(id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 1 CHECK (count >= 1),
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_id, mass_role_id)
);

CREATE INDEX idx_template_items_template_id ON mass_roles_template_items(template_id);
CREATE INDEX idx_template_items_mass_role_id ON mass_roles_template_items(mass_role_id);
CREATE INDEX idx_template_items_position ON mass_roles_template_items(template_id, position);
```

**Constraints:**
- `count` must be >= 1
- `position` must be >= 0 (zero-based)
- **Unique constraint:** `(template_id, mass_role_id)` - cannot add same role twice to a template
- Cascade delete when template or role is deleted

**Comments:**
- `count`: Number of people needed for this role (minimum 1)
- `position`: Zero-based ordering position for drag-and-drop sorting (0, 1, 2, ...)

### 4. mass_role_instances

**Purpose:** Actual assignments of people to roles for specific Masses

**Migration:** `20251115000005_create_mass_role_instances_table.sql`

```sql
CREATE TABLE mass_role_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mass_id UUID NOT NULL REFERENCES masses(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  mass_roles_template_item_id UUID NOT NULL REFERENCES mass_roles_template_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mass_role_instances_mass_id ON mass_role_instances(mass_id);
CREATE INDEX idx_mass_role_instances_person_id ON mass_role_instances(person_id);
CREATE INDEX idx_mass_role_instances_template_item_id ON mass_role_instances(mass_roles_template_item_id);
```

**Constraints:**
- Cascade delete when Mass, person, or template item is deleted
- **No unique constraint** - allows multiple assignments (e.g., 3 different people as Lectors)

**RLS Policies:** All operations (SELECT, INSERT, UPDATE, DELETE) restricted to parish members

---

## Workflow: Template to Mass Assignment

### Phase 1: Define Mass Roles (One-Time Setup)

**Location:** `/settings/mass-roles`

Parish defines their liturgical roles:
1. Create "Lector" role
2. Create "Extraordinary Eucharistic Minister" role
3. Create "Altar Server" role
4. etc.

**Server Action:** `createMassRole()`

### Phase 2: Create Mass Role Template

**Location:** `/mass-role-templates/create`

**Steps:**
1. **Create template header** (name, description, note)
   - Server Action: `createMassRoleTemplate()`
   - Returns new template with ID
2. **Redirect to edit page** to add role requirements
   - Route: `/mass-role-templates/{id}/edit`

### Phase 3: Add Roles to Template

**Location:** `/mass-role-templates/{id}/edit`

**UI Component:** `MassRoleTemplateItemList`

**Workflow:**
1. Click "Add Mass Role" button
2. `MassRolePicker` modal opens
3. Select a role from picker (filtered to exclude already-added roles)
4. Default count is set to 1
5. Server Action: `createTemplateItem()`
6. New item appears in drag-and-drop list
7. Repeat for all needed roles

**Drag-and-Drop Reordering:**
- Uses `@dnd-kit/core` library
- Updates `position` field for all items
- Server Action: `reorderTemplateItems(templateId, itemIds[])`

**Edit Count:**
- Inline number input (1-99)
- Debounced updates (500ms)
- Server Action: `updateTemplateItem(id, { count })`

**Delete Item:**
- Confirmation dialog
- Server Action: `deleteTemplateItem(id)`
- Automatically reorders remaining items (closes gaps in position values)

### Phase 4: Create Mass Event

**Location:** `/masses/create`

**Workflow:**
1. Create Mass with basic info (event, presider, homilist, etc.)
2. **Save Mass first** (required before assigning roles)
3. Redirect to edit page

### Phase 5: Assign People to Roles

**Location:** `/masses/{id}/edit`

**UI Behavior:**
1. If Mass has `mass_roles_template_id` set:
   - Load template items for that template
   - Display role requirements from template
2. For each template item:
   - Show role name and count needed (e.g., "Lector - 3 needed")
   - Show currently assigned people
   - "Add" button opens `PeoplePicker`
3. Select person → Server Action: `createMassRoleInstance()`
   - Creates instance with `mass_id`, `person_id`, `mass_roles_template_item_id`
4. Person appears in assigned list with "Remove" button

**Data Flow:**
```typescript
// mass-form.tsx
const handleSelectPersonForRole = async (person: Person) => {
  if (!isEditing || !mass?.id || !currentRoleId) {
    toast.error('Please save the mass before assigning roles')
    return
  }

  // currentRoleId is the mass_roles_template_item_id
  const newMassRole = await createMassRoleInstance({
    mass_id: mass.id,
    person_id: person.id,
    mass_roles_template_item_id: currentRoleId  // Links to template item
  })

  await loadMassRoles()  // Reload with relations
  toast.success('Role assignment added')
}
```

**Fetching Assignments:**
```typescript
// mass-roles.ts
export async function getMassRoleInstances(massId: string): Promise<MassRoleInstanceWithRelations[]> {
  const { data } = await supabase
    .from('mass_role_instances')
    .select(`
      *,
      person:people(*),
      mass_roles_template_item:mass_roles_template_items(
        *,
        mass_role:mass_roles(*)
      )
    `)
    .eq('mass_id', massId)
    .order('created_at', { ascending: true })

  return data || []
}
```

**Result:**
```json
{
  "id": "instance-001",
  "mass_id": "mass-123",
  "person_id": "person-456",
  "mass_roles_template_item_id": "item-001",
  "person": {
    "first_name": "John",
    "last_name": "Smith"
  },
  "mass_roles_template_item": {
    "mass_role": {
      "name": "Lector"
    }
  }
}
```

---

## Real-World Example: St. Mary's Parish

### Scenario

St. Mary's Catholic Church wants to create a reusable template for their Sunday 10:30 AM Mass with full choir.

### Step 1: Define Mass Roles

Staff member goes to **Settings → Mass Roles** and creates:

| Name | Description | Display Order |
|------|-------------|---------------|
| Lector | Proclaim Scripture readings and lead Prayers of the Faithful | 1 |
| Extraordinary Eucharistic Minister | Distribute Holy Communion | 2 |
| Altar Server | Assist priest at altar | 3 |
| Usher | Welcome parishioners, take collection | 4 |
| Sacristan | Prepare altar and sacred vessels | 5 |
| Cantor | Lead congregational singing | 6 |
| Organist | Provide musical accompaniment | 7 |

**Database State:**
```
mass_roles table:
┌──────────┬────────────┬───────────────────────────────┬──────────────┐
│ id       │ parish_id  │ name                          │ display_order│
├──────────┼────────────┼───────────────────────────────┼──────────────┤
│ role-001 │ parish-abc │ Lector                        │ 1            │
│ role-002 │ parish-abc │ Extraordinary Eucharistic...  │ 2            │
│ role-003 │ parish-abc │ Altar Server                  │ 3            │
│ role-004 │ parish-abc │ Usher                         │ 4            │
│ role-005 │ parish-abc │ Sacristan                     │ 5            │
│ role-006 │ parish-abc │ Cantor                        │ 6            │
│ role-007 │ parish-abc │ Organist                      │ 7            │
└──────────┴────────────┴───────────────────────────────┴──────────────┘
```

### Step 2: Create Template

Staff member goes to **Mass Role Templates → Create New** and enters:
- **Name:** "Sunday Mass - 10:30 AM - Full Choir"
- **Description:** "Standard Sunday Mass with full music ministry. Use for 10:30 AM celebration."
- **Note:** "Requires trained choir members and organist"

**Database State:**
```
mass_roles_templates table:
┌────────────┬────────────┬────────────────────────────────┐
│ id         │ parish_id  │ name                           │
├────────────┼────────────┼────────────────────────────────┤
│ template-1 │ parish-abc │ Sunday Mass - 10:30 AM - Full  │
└────────────┴────────────┴────────────────────────────────┘
```

Clicks "Create Template" → Redirects to `/mass-role-templates/template-1/edit`

### Step 3: Add Role Requirements

On the edit page, staff member adds roles one by one:

1. **Add Lector** → Count: 3 (First Reading, Second Reading, Petitions)
2. **Add Extraordinary Eucharistic Minister** → Count: 6 (Host and Chalice distribution)
3. **Add Altar Server** → Count: 4 (Cross bearer, candle bearers, book holder)
4. **Add Usher** → Count: 6 (Entrances, collection, Communion)
5. **Add Sacristan** → Count: 1 (Setup before Mass)
6. **Add Cantor** → Count: 1 (Lead singing)
7. **Add Organist** → Count: 1 (Accompaniment)

**Database State:**
```
mass_roles_template_items table:
┌──────────┬────────────┬─────────────┬───────┬──────────┐
│ id       │ template_id│ mass_role_id│ count │ position │
├──────────┼────────────┼─────────────┼───────┼──────────┤
│ item-001 │ template-1 │ role-001    │ 3     │ 0        │  ← Lector
│ item-002 │ template-1 │ role-002    │ 6     │ 1        │  ← EEM
│ item-003 │ template-1 │ role-003    │ 4     │ 2        │  ← Altar Server
│ item-004 │ template-1 │ role-004    │ 6     │ 3        │  ← Usher
│ item-005 │ template-1 │ role-005    │ 1     │ 4        │  ← Sacristan
│ item-006 │ template-1 │ role-006    │ 1     │ 5        │  ← Cantor
│ item-007 │ template-1 │ role-007    │ 1     │ 6        │  ← Organist
└──────────┴────────────┴─────────────┴───────┴──────────┘
```

**Total people needed:** 3 + 6 + 4 + 6 + 1 + 1 + 1 = **22 people**

### Step 4: Schedule a Mass

Staff member goes to **Masses → Create** and creates:
- **Event:** Sunday, January 26, 2025 at 10:30 AM (via EventPicker)
- **Presider:** Fr. Michael Johnson (via PeoplePicker)
- **Homilist:** Fr. Michael Johnson
- **Liturgical Event:** 3rd Sunday in Ordinary Time (via LiturgicalEventPicker)
- **Mass Template:** "Sunday Mass - 10:30 AM - Full Choir" (dropdown selection - optional)
- **Status:** PLANNING

Clicks "Create Mass" → Mass is saved with ID `mass-20250126`

### Step 5: Assign People to Roles

Staff member goes to `/masses/mass-20250126/edit`

The form displays role assignment section showing template requirements:

```
Mass Roles (from template: "Sunday Mass - 10:30 AM - Full Choir")

┌─────────────────────────────────────────────┐
│ Lector (3 needed)                           │
│ ┌─────────────────────────────────────────┐ │
│ │ [+] Add Person                          │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

Staff member clicks "[+] Add Person" → `PeoplePicker` opens

**Assignment 1: First Lector**
- Selects "Mary Williams"
- Server Action: `createMassRoleInstance({ mass_id: 'mass-20250126', person_id: 'person-123', mass_roles_template_item_id: 'item-001' })`

**Database State:**
```
mass_role_instances table:
┌──────────────┬──────────────┬────────────┬──────────────────────────────┐
│ id           │ mass_id      │ person_id  │ mass_roles_template_item_id  │
├──────────────┼──────────────┼────────────┼──────────────────────────────┤
│ instance-001 │ mass-20250126│ person-123 │ item-001                     │ ← Mary as Lector
└──────────────┴──────────────┴────────────┴──────────────────────────────┘
```

UI updates to show:
```
┌─────────────────────────────────────────────┐
│ Lector (3 needed)                           │
│ ┌─────────────────────────────────────────┐ │
│ │ • Mary Williams            [Remove ✕]   │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ [+] Add Person                          │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Continue assigning...**

Staff member adds:
- David Chen (Lector)
- Sarah Martinez (Lector)
- 6 Extraordinary Eucharistic Ministers
- 4 Altar Servers
- 6 Ushers
- 1 Sacristan (Tom Rodriguez)
- 1 Cantor (Angela Foster)
- 1 Organist (James Park)

**Final Database State:**
```
mass_role_instances table (22 rows):
┌──────────────┬──────────────┬────────────┬──────────────────────────────┐
│ id           │ mass_id      │ person_id  │ mass_roles_template_item_id  │
├──────────────┼──────────────┼────────────┼──────────────────────────────┤
│ instance-001 │ mass-20250126│ person-123 │ item-001                     │ ← Mary (Lector)
│ instance-002 │ mass-20250126│ person-456 │ item-001                     │ ← David (Lector)
│ instance-003 │ mass-20250126│ person-789 │ item-001                     │ ← Sarah (Lector)
│ instance-004 │ mass-20250126│ person-101 │ item-002                     │ ← EEM #1
│ instance-005 │ mass-20250126│ person-102 │ item-002                     │ ← EEM #2
│ ...          │ ...          │ ...        │ ...                          │
│ instance-022 │ mass-20250126│ person-999 │ item-007                     │ ← James (Organist)
└──────────────┴──────────────┴────────────┴──────────────────────────────┘
```

### Step 6: View Assignments

Staff member can now:
1. **View Mass page** → See all assigned ministers with their roles
2. **Print liturgical script** → Includes minister names in their roles
3. **Send notifications** (future feature) → Email all assigned ministers

**Query to get all assignments for Mass:**
```sql
SELECT
  mri.id,
  p.first_name || ' ' || p.last_name AS person_name,
  mr.name AS role_name,
  mrti.count AS count_needed
FROM mass_role_instances mri
JOIN people p ON mri.person_id = p.id
JOIN mass_roles_template_items mrti ON mri.mass_roles_template_item_id = mrti.id
JOIN mass_roles mr ON mrti.mass_role_id = mr.id
WHERE mri.mass_id = 'mass-20250126'
ORDER BY mrti.position, mri.created_at;
```

**Result:**
```
┌─────────────────┬────────────────────────────────────────┬──────────────┐
│ person_name     │ role_name                              │ count_needed │
├─────────────────┼────────────────────────────────────────┼──────────────┤
│ Mary Williams   │ Lector                                 │ 3            │
│ David Chen      │ Lector                                 │ 3            │
│ Sarah Martinez  │ Lector                                 │ 3            │
│ John Smith      │ Extraordinary Eucharistic Minister     │ 6            │
│ ...             │ ...                                    │ ...          │
│ James Park      │ Organist                               │ 1            │
└─────────────────┴────────────────────────────────────────┴──────────────┘
```

---

## Component Structure

### Template Management Components

**Location:** `src/app/(main)/mass-role-templates/`

1. **List Page** - `page.tsx` (Server)
   - Fetches all templates for parish
   - Passes to `mass-role-templates-list-client.tsx`

2. **List Client** - `mass-role-templates-list-client.tsx`
   - Displays template cards with name, description
   - Search/filter functionality

3. **Create Page** - `create/page.tsx` (Server)
   - Renders `MassRoleTemplateFormWrapper` with no template

4. **View Page** - `[id]/page.tsx` (Server)
   - Fetches template by ID
   - Passes to `mass-role-template-view-client.tsx`

5. **View Client** - `[id]/mass-role-template-view-client.tsx`
   - Displays template info
   - Fetches and displays template items
   - Shows role names and counts

6. **Edit Page** - `[id]/edit/page.tsx` (Server)
   - Fetches template by ID
   - Renders `MassRoleTemplateFormWrapper` with template

7. **Form Wrapper** - `mass-role-template-form-wrapper.tsx` (Client)
   - PageContainer for form
   - Renders `MassRoleTemplateForm`

8. **Unified Form** - `mass-role-template-form.tsx` (Client)
   - Basic fields (name, description, note)
   - In edit mode: Shows `MassRoleTemplateItemList` for managing role items
   - In create mode: Shows helper text "Save first, then add roles"

9. **View Client** - `[id]/mass-role-template-view-client.tsx` (Client)
   - Uses `ModuleViewPanel` with `onDelete` prop for delete functionality
   - Edit button links to edit page

### Template Item Components

**Location:** `src/components/`

1. **MassRoleTemplateItemList** - `mass-role-template-item-list.tsx`
   - Drag-and-drop list using `@dnd-kit/core`
   - "Add Mass Role" button
   - Uses `MassRolePicker` for adding new roles
   - Renders `MassRoleTemplateItem` for each item

2. **MassRoleTemplateItem** - `mass-role-template-item.tsx`
   - Sortable item with drag handle
   - Role name and description
   - Count input (debounced updates)
   - Delete button with confirmation dialog

3. **MassRolePicker** - `mass-role-picker.tsx`
   - Modal dialog to select mass role
   - Filters out already-added roles
   - Includes option to create new mass roles on-the-fly
   - Default count is 1

### Mass Form Integration

**Location:** `src/app/(main)/masses/mass-form.tsx`

**Role Assignment Section:**
```typescript
// Load mass role instances when editing
useEffect(() => {
  if (isEditing && mass?.id) {
    loadMassRoles()  // Fetches instances with relations
  }
}, [isEditing, mass?.id])

const loadMassRoles = async () => {
  const roles = await getMassRoleInstances(mass.id)
  setMassRoles(roles)
}

// Assign person to role
const handleSelectPersonForRole = async (person: Person) => {
  await createMassRoleInstance({
    mass_id: mass.id,
    person_id: person.id,
    mass_roles_template_item_id: currentRoleId  // Template item ID
  })
  await loadMassRoles()
}

// Get assignments for a specific role
const getRoleAssignments = (roleId: string) => {
  return massRoles.filter(mr =>
    mr.mass_roles_template_item?.mass_role.id === roleId
  )
}
```

---

## Server Actions API

### Mass Role Templates

**File:** `src/lib/actions/mass-role-templates.ts`

```typescript
// Get all templates for parish
getMassRoleTemplates(): Promise<MassRoleTemplate[]>

// Get single template
getMassRoleTemplate(id: string): Promise<MassRoleTemplate | null>

// Create template
createMassRoleTemplate(data: CreateMassRoleTemplateData): Promise<MassRoleTemplate>

// Update template
updateMassRoleTemplate(id: string, data: UpdateMassRoleTemplateData): Promise<MassRoleTemplate>

// Delete template
deleteMassRoleTemplate(id: string): Promise<void>
```

### Mass Role Template Items

**File:** `src/lib/actions/mass-role-template-items.ts`

```typescript
// Get all items for a template (ordered by position)
getTemplateItems(templateId: string): Promise<MassRoleTemplateItemWithRole[]>

// Create template item (add role to template)
createTemplateItem(data: CreateTemplateItemData): Promise<MassRoleTemplateItem>
// - Automatically calculates next position
// - Returns error if role already exists in template (unique constraint)

// Update template item (change count)
updateTemplateItem(id: string, data: UpdateTemplateItemData): Promise<MassRoleTemplateItem>

// Delete template item and reorder remaining
deleteTemplateItem(id: string): Promise<void>
// - Deletes item
// - Reorders remaining items to close gaps in positions

// Reorder template items (drag-and-drop)
reorderTemplateItems(templateId: string, itemIds: string[]): Promise<void>
// - Updates position for each item based on array index
```

### Mass Role Instances

**File:** `src/lib/actions/mass-roles.ts`

```typescript
// Get all instances for a Mass (with person and role details)
getMassRoleInstances(massId: string): Promise<MassRoleInstanceWithRelations[]>

// Get single instance
getMassRoleInstance(id: string): Promise<MassRoleInstance | null>

// Create instance (assign person to role)
createMassRoleInstance(data: CreateMassRoleInstanceData): Promise<MassRoleInstance>

// Update instance (change person or role)
updateMassRoleInstance(id: string, data: UpdateMassRoleInstanceData): Promise<MassRoleInstance>

// Delete instance (remove assignment)
deleteMassRoleInstance(id: string): Promise<void>
```

---

## UI Behavior

### Template Item Drag-and-Drop

**Library:** `@dnd-kit/core` + `@dnd-kit/sortable`

**Workflow:**
1. User drags item by grip handle (⋮⋮)
2. Item position updates optimistically in UI
3. On drop, array is reordered: `arrayMove(items, oldIndex, newIndex)`
4. New order sent to server: `reorderTemplateItems(templateId, itemIds)`
5. If error, original order is restored

**Position Calculation:**
- Position is zero-based: 0, 1, 2, 3, ...
- When reordering, position = index in array
- When deleting, positions are recalculated to close gaps

### Template Item Count Updates

**Debouncing:** 500ms delay using `useDebounce` hook

**Workflow:**
1. User types in count input
2. Local state updates immediately (optimistic)
3. After 500ms of no changes, debounced value triggers
4. Server Action: `updateTemplateItem(id, { count: newCount })`
5. If error, count reverts to original value

**Validation:**
- Min: 1 (enforced in UI and database)
- Max: 99 (enforced in UI only)
- Database constraint: `CHECK (count >= 1)`

### Role Assignment in Mass Form

**Workflow:**
1. Mass must be saved first (create mode shows message: "Save the mass before assigning roles")
2. In edit mode:
   - If template selected: Load template items and show requirements
   - For each role: Show count needed and current assignments
3. Click "Add Person" → Opens `PeoplePicker`
4. Select person → Creates `mass_role_instance`
5. Reload instances to show updated list
6. No limit on assignments (can assign more or fewer than template count suggests)

**Template Item ID Storage:**
```typescript
const [currentRoleId, setCurrentRoleId] = useState<string | null>(null)

const handleOpenRolePicker = (roleId: string) => {
  setCurrentRoleId(roleId)  // Store template item ID
  setRolePickerOpen(true)
}

const handleSelectPersonForRole = async (person: Person) => {
  await createMassRoleInstance({
    mass_id: mass.id,
    person_id: person.id,
    mass_roles_template_item_id: currentRoleId  // Use stored template item ID
  })
}
```

### Delete Protection

**Mass Roles:**
- Cannot delete if used in any template items
- Cannot delete if used in any mass role instances
- Check performed in `deleteMassRole()` before deletion

**Templates:**
- Can be deleted even if used in Masses
- Cascade delete removes all template items
- Mass role instances remain (orphaned from template item if template item deleted)

---

## Related Documentation

- [MASSES.md](./MASSES.md) - Complete Mass module architecture and future features
- [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md) - Standard 9-file module structure
- [FORMS.md](./FORMS.md) - Form patterns and component usage
- [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) - Reusable components

---

**Last Updated:** 2025-01-16
**Status:** Current implementation documented
**Coverage:** Data structures, workflows, real-world example, component structure, server actions, UI behavior
