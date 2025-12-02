# Mass Template System - Workflows and Examples

> **Purpose:** Complete workflow documentation for creating templates, adding roles, and assigning people to Mass roles, including a comprehensive real-world example.

## Table of Contents

- [Overview](#overview)
- [Complete Workflow](#complete-workflow)
- [Real-World Example: St. Mary's Parish](#real-world-example-st-marys-parish)
- [Data Flow Examples](#data-flow-examples)
- [Related Documentation](#related-documentation)

---

## Overview

This document walks through the complete workflow from defining Mass roles to assigning people to specific Masses, with detailed examples showing database states at each step.

---

## Complete Workflow

### Phase 1: Define Mass Roles (One-Time Setup)

**Location:** `/settings/mass-roles`

Parish defines their liturgical roles:
1. Create "Lector" role
2. Create "Extraordinary Eucharistic Minister" role
3. Create "Altar Server" role
4. etc.

**Server Action:** `createMassRole()`

**Purpose:**
- One-time setup for parish
- Defines available liturgical roles
- Can be reused across multiple templates

---

### Phase 2: Create Mass Role Template

**Location:** `/mass-role-templates/create`

**Steps:**
1. **Create template header** (name, description, note)
   - Server Action: `createMassRoleTemplate()`
   - Returns new template with ID
2. **Redirect to edit page** to add role requirements
   - Route: `/mass-role-templates/{id}/edit`

**Why two steps?**
- Template must exist before adding role requirements
- Edit page provides better UX for adding multiple roles

---

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

---

### Phase 4: Create Mass Event

**Location:** `/masses/create`

**Workflow:**
1. Create Mass with basic info (event, presider, homilist, etc.)
2. **Save Mass first** (required before assigning roles)
3. Redirect to edit page

---

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

---

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

---

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

---

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

---

### Step 4: Schedule a Mass

Staff member goes to **Masses → Create** and creates:
- **Event:** Sunday, January 26, 2025 at 10:30 AM (via EventPicker)
- **Presider:** Fr. Michael Johnson (via PeoplePicker)
- **Homilist:** Fr. Michael Johnson
- **Liturgical Event:** 3rd Sunday in Ordinary Time (via LiturgicalEventPicker)
- **Mass Template:** "Sunday Mass - 10:30 AM - Full Choir" (dropdown selection - optional)
- **Status:** PLANNING

Clicks "Create Mass" → Mass is saved with ID `mass-20250126`

---

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

---

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

## Data Flow Examples

### Example: Adding a Role to a Template

**User Action:** Click "Add Mass Role" → Select "Lector" → Set count to 3

**API Call:**
```typescript
await createTemplateItem({
  template_id: 'template-1',
  mass_role_id: 'role-001',
  count: 3
})
```

**Database Operation:**
```sql
INSERT INTO mass_roles_template_items (
  template_id,
  mass_role_id,
  count,
  position
) VALUES (
  'template-1',
  'role-001',
  3,
  (SELECT COALESCE(MAX(position) + 1, 0) FROM mass_roles_template_items WHERE template_id = 'template-1')
);
```

**Result:**
- New item created with next available position
- UI updates to show new item in list
- Drag handle allows reordering

---

### Example: Assigning a Person to a Role

**User Action:** In Mass edit form → Click "Add Person" for Lector role → Select "Mary Williams"

**API Call:**
```typescript
await createMassRoleInstance({
  mass_id: 'mass-20250126',
  person_id: 'person-123',
  mass_roles_template_item_id: 'item-001'
})
```

**Database Operation:**
```sql
INSERT INTO mass_role_instances (
  mass_id,
  person_id,
  mass_roles_template_item_id
) VALUES (
  'mass-20250126',
  'person-123',
  'item-001'
);
```

**Result:**
- Assignment created linking person to role via template item
- UI updates to show person's name in role assignment list
- "Remove" button appears next to person's name

---

## Related Documentation

- [OVERVIEW.md](./OVERVIEW.md) - System architecture and data structures
- [DATABASE.md](./DATABASE.md) - Database schema and migrations
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Components and server actions
- [../MASSES.md](../MASSES.md) - Complete Mass module architecture
- [../MODULE_COMPONENT_PATTERNS.md](../MODULE_COMPONENT_PATTERNS.md) - Standard module structure

---

**Last Updated:** 2025-12-02
**Status:** Complete workflows documented
**Coverage:** All phases from setup to assignment with real-world example
