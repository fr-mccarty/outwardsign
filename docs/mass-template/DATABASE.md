# Mass Template System - Database Schema

> **Purpose:** Complete database schema documentation for the Mass Role Template system, including tables, constraints, migrations, and indexes.

## Table of Contents

- [Overview](#overview)
- [Database Tables](#database-tables)
- [Table Relationships](#table-relationships)
- [Migration Files](#migration-files)
- [RLS Policies](#rls-policies)
- [Related Documentation](#related-documentation)

---

## Overview

The Mass Role Template system uses **four primary database tables** to manage role definitions, templates, role requirements, and assignments:

1. **mass_roles** - Liturgical role definitions (Lector, EEM, etc.)
2. **mass_roles_templates** - Reusable Mass templates
3. **mass_roles_template_items** - Role requirements within templates
4. **mass_role_instances** - Actual person-to-role assignments for specific Masses

---

## Database Tables

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

**Indexes:**
- `idx_mass_roles_parish_id` - Fast lookups by parish
- `idx_mass_roles_display_order` - Efficient sorting by display order

**Delete Protection:**
- Cannot delete if used in any template items
- Cannot delete if used in any mass role instances
- Check performed in `deleteMassRole()` server action before deletion

---

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

**Constraints:**
- Cascade delete when parish is deleted

**Indexes:**
- `idx_mass_roles_templates_parish_id` - Fast lookups by parish

**Notes:**
- No `parameters` JSONB field in current implementation
- Role requirements are stored in separate `mass_roles_template_items` table
- Templates can be deleted even if used in Masses
- Cascade delete removes all template items

---

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
- `count` must be >= 1 (minimum 1 person needed)
- `position` must be >= 0 (zero-based ordering)
- **Unique constraint:** `(template_id, mass_role_id)` - cannot add same role twice to a template
- Cascade delete when template or role is deleted

**Indexes:**
- `idx_template_items_template_id` - Fast lookups by template
- `idx_template_items_mass_role_id` - Fast lookups by role
- `idx_template_items_position` - Efficient sorting by position within template

**Field Details:**
- **`count`**: Number of people needed for this role (minimum 1, maximum 99 enforced in UI)
- **`position`**: Zero-based ordering position for drag-and-drop sorting (0, 1, 2, ...)

**Position Management:**
- New items automatically get next available position
- When deleting items, remaining items are reordered to close gaps
- Drag-and-drop reordering updates all affected positions atomically

---

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

**Indexes:**
- `idx_mass_role_instances_mass_id` - Fast lookups by Mass
- `idx_mass_role_instances_person_id` - Fast lookups by person
- `idx_mass_role_instances_template_item_id` - Fast lookups by template item

**Critical Relationship:**
- `mass_roles_template_item_id` links assignment to a specific template item
- Through template item, you get the role definition (Lector, EEM, etc.)
- Multiple people can be assigned to same role for same Mass

---

## Table Relationships

### Entity Relationship Diagram

```
┌─────────────────────┐
│     parishes        │
└──────────┬──────────┘
           │
           ├──────────────────────────────────────────┐
           │                                          │
           ↓                                          ↓
┌─────────────────────┐                  ┌───────────────────────┐
│   mass_roles        │                  │ mass_roles_templates  │
│  (role definitions) │                  │  (template headers)   │
└──────────┬──────────┘                  └───────────┬───────────┘
           │                                          │
           │                                          │
           │         ┌────────────────────────────────┘
           │         │
           │         │
           ↓         ↓
┌───────────────────────────────────────┐
│  mass_roles_template_items            │
│  (role requirements in templates)     │
│  - FK: template_id                    │
│  - FK: mass_role_id                   │
│  - count: number needed               │
│  - position: sort order               │
└───────────────────┬───────────────────┘
                    │
                    │
                    │ Referenced by
                    │
                    ↓
┌───────────────────────────────────────┐
│  mass_role_instances                  │
│  (actual assignments)                 │
│  - FK: mass_id                        │
│  - FK: person_id                      │
│  - FK: mass_roles_template_item_id    │
└───────────────────────────────────────┘
           │         │
           │         │
           ↓         ↓
┌─────────────┐  ┌─────────────┐
│   masses    │  │   people    │
└─────────────┘  └─────────────┘
```

### Foreign Key Cascade Rules

| Table | Foreign Key | On Delete |
|-------|-------------|-----------|
| mass_roles | parish_id | CASCADE |
| mass_roles_templates | parish_id | CASCADE |
| mass_roles_template_items | template_id | CASCADE |
| mass_roles_template_items | mass_role_id | CASCADE |
| mass_role_instances | mass_id | CASCADE |
| mass_role_instances | person_id | CASCADE |
| mass_role_instances | mass_roles_template_item_id | CASCADE |

**Key Points:**
- Deleting a parish removes all roles, templates, items, and instances
- Deleting a template removes all its items
- Deleting a template item removes all associated instances
- Deleting a Mass removes all its role instances
- Deleting a person removes all their role instances

---

## Migration Files

### Migration Order

The tables must be created in dependency order:

1. **parishes** (prerequisite, not in this module)
2. **people** (prerequisite, not in this module)
3. **masses** (prerequisite, from Mass module)
4. **mass_roles** - `20251110000005_create_mass_roles_table.sql`
5. **mass_roles_templates** - `20251110000003_create_mass_roles_templates_table.sql`
6. **mass_roles_template_items** - `20251115000002_create_mass_roles_template_items_table.sql`
7. **mass_role_instances** - `20251115000005_create_mass_role_instances_table.sql`

### Migration File Locations

All migration files are located in: `supabase/migrations/`

**File Naming Convention:**
- Format: `YYYYMMDDNNNNNN_description.sql`
- Timestamp-based ordering ensures correct execution sequence

---

## RLS Policies

**Row-Level Security (RLS)** is enabled on all four tables to ensure data isolation between parishes.

### mass_role_instances Policies

All operations (SELECT, INSERT, UPDATE, DELETE) are restricted to parish members.

**Example Policy Pattern:**
```sql
-- SELECT policy
CREATE POLICY "Users can view role instances for their parish"
  ON mass_role_instances
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM masses m
      WHERE m.id = mass_role_instances.mass_id
        AND m.parish_id IN (
          SELECT parish_id FROM user_parishes
          WHERE user_id = auth.uid()
        )
    )
  );
```

**Policy Coverage:**
- **SELECT** - View role instances for Masses in user's parish
- **INSERT** - Create role instances for Masses in user's parish
- **UPDATE** - Modify role instances for Masses in user's parish
- **DELETE** - Remove role instances for Masses in user's parish

**Note:** Specific policy implementations follow the same parish-scoping pattern used throughout the application.

---

## Related Documentation

- [OVERVIEW.md](./OVERVIEW.md) - System architecture and data structures
- [WORKFLOWS.md](./WORKFLOWS.md) - Template creation and assignment workflows
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Components and server actions
- [../../DATABASE.md](../../DATABASE.md) - General database procedures
- [../MASSES.md](../MASSES.md) - Complete Mass module architecture

---

**Last Updated:** 2025-12-02
**Status:** Current schema documented
**Coverage:** All tables, constraints, indexes, relationships, and migrations
