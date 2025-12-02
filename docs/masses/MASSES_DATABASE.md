# Mass Module - Database Schema Reference

> **Purpose:** Complete database schema reference, migrations, and relationships for the Mass module.

## Core Tables

See [MASSES_OVERVIEW.md](./MASSES_OVERVIEW.md#database-tables-implemented) for the `masses` table schema.

Additional tables:

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

---

## Key Relationships

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

---

## Migration Files

Core tables: `supabase/migrations/20251118000001_create_mass_role_members_table.sql`

See migration directory for complete schema.

---

## Related Documentation

- **[MASSES_OVERVIEW.md](./MASSES_OVERVIEW.md)** - Implementation status
- **[MASSES_ROLE_SYSTEM.md](./MASSES_ROLE_SYSTEM.md)** - Role system details
- **[MASSES_SERVER_ACTIONS.md](./MASSES_SERVER_ACTIONS.md)** - Server actions reference

---

**Last Updated:** 2025-12-02
