# Mass Template System - Overview and Architecture

> **Purpose:** Complete overview of the Mass Role Template system architecture, core concepts, and data structures.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Data Structures](#data-structures)
- [Key Relationships](#key-relationships)
- [Related Documentation](#related-documentation)

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

## Related Documentation

- [DATABASE.md](./DATABASE.md) - Database schema and migration details
- [WORKFLOWS.md](./WORKFLOWS.md) - Template creation and assignment workflows
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Components, server actions, and UI behavior
- [../MASSES.md](../MASSES.md) - Complete Mass module architecture
- [../MODULE_COMPONENT_PATTERNS.md](../MODULE_COMPONENT_PATTERNS.md) - Standard module structure
- [../COMPONENT_REGISTRY.md](../COMPONENT_REGISTRY.md) - Reusable components

---

**Last Updated:** 2025-12-02
**Status:** Current implementation documented
**Coverage:** System overview, architecture, data structures, and relationships
