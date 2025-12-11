# Parish Onboarding

This document explains how data is created when a new parish signs up for Outward Sign.

## Overview

When a user creates a new parish, the system:
1. Creates the parish record and assigns the user as admin
2. Automatically creates parish settings via database trigger
3. Seeds initial data (readings, roles, templates) via server action

## Entry Points

| Route | Use Case | Function Called |
|-------|----------|-----------------|
| `/onboarding` | New user's first parish | `createParishWithSuperAdmin()` |
| `/select-parish` | Existing user creating additional parish | `createParish()` |

Both entry points call `populateInitialParishData()` after parish creation.

## Data Creation Steps

### Step 1: Parish Creation (Database Function)

**Function:** `create_parish_with_admin` (SQL RPC)
**Location:** `supabase/migrations/20251028000006_create_parish_with_admin_function.sql`

Creates:
- `parishes` - The parish record
- `parish_users` - Links user to parish with `admin` role
- `user_settings` - Sets the new parish as the user's selected parish

### Step 2: Parish Settings (Database Trigger)

**Trigger:** `auto_create_parish_settings`
**Location:** `supabase/migrations/20251028000003_create_parish_settings_table.sql`

Automatically fires when a parish is inserted. Creates a `parish_settings` record with defaults:
- `liturgical_locale`: `'en_US'`
- `mass_intention_offering_quick_amount`: `[]`
- `donations_quick_amount`: `[]`

### Step 3: Initial Data Seeding (Server Action)

**Function:** `populateInitialParishData(parishId)`
**Location:** `src/lib/actions/setup.ts` (wrapper) → `src/lib/seeding/parish-seed-data.ts` (shared logic)

Seeds the following data:

| Data Type | Description |
|-----------|-------------|
| **Readings** | Canonical reading library from `src/lib/data/readings.ts` |
| **Petition Templates** | 11 templates for various liturgies (Sunday EN/ES, Daily, Wedding EN/ES, Funeral EN/ES, Quinceanera EN/ES, Presentation EN/ES) |
| **Group Roles** | Leader, Member, Secretary, Treasurer, Coordinator |
| **Mass Roles** | Lector, Eucharistic Minister, Server, Cantor, Usher, Sacristan, Music Minister, Greeter, Coordinator, Gift Bearer, Pre-Mass Speaker, Security Team |
| **Mass Types** | Sunday Day, Sunday Vigil, Sunday Vigil - Spanish |
| **Mass Role Template** | "Sunday Mass" template with: Lector (1), Server (2), Usher (4), Security Team (2), Eucharistic Minister (3) |
| **Mass Times Templates** | Sunday (9am, 11am + vigils 4pm, 5:30pm), Holiday (9am), Monday (12:05pm), Wednesday (6pm), Thursday (6am), Friday (12:05pm) |

## Database Commands

Reset database and re-seed with fresh data:
```bash
npm run db:fresh        # Interactive (asks for confirmation)
npm run db:fresh -- -y  # Skip confirmation prompt
```

## Adding New Seed Data

To add new default data for parishes:

1. Add the seeding logic to `seedParishData()` in `src/lib/seeding/parish-seed-data.ts`
2. Follow the existing pattern: insert records with `parish_id` set to the provided `parishId`
3. Handle errors gracefully - parish creation should succeed even if some seed data fails

Example:
```typescript
// In populateInitialParishData()
const { error } = await supabase
  .from('your_table')
  .insert([
    { parish_id: parishId, name: 'Default Item', ... }
  ])

if (error) {
  console.error('Error creating your_table:', error)
  throw new Error(`Failed to create your_table: ${error.message}`)
}
```

## Flow Diagram

```
User submits parish form
        │
        ▼
createParishWithSuperAdmin() or createParish()
        │
        ▼
SQL: create_parish_with_admin()
  ├── INSERT parishes
  ├── INSERT parish_users (admin role)
  └── INSERT/UPDATE user_settings
        │
        ▼
Trigger: auto_create_parish_settings
  └── INSERT parish_settings
        │
        ▼
populateInitialParishData()
  ├── INSERT readings
  ├── INSERT petition_templates
  ├── INSERT group_roles
  ├── INSERT mass_roles
  ├── INSERT event_types (including Mass event types)
  ├── INSERT mass_roles_templates + mass_roles_template_items
  └── INSERT mass_times_templates + mass_times_template_items
        │
        ▼
Redirect to /dashboard
```

## Related Files

- `src/app/onboarding/page.tsx` - New user onboarding UI
- `src/app/select-parish/create-parish-form.tsx` - Additional parish creation UI
- `src/lib/onboarding-seeding/parish-seed-data.ts` - **Shared seed data logic** (used by both onboarding and dev scripts)
- `src/lib/actions/setup.ts` - Server actions including `populateInitialParishData()` wrapper
- `src/lib/auth/parish.ts` - Parish authentication utilities
- `scripts/dev-seed.ts` - Development seeding script (uses shared seeding logic)
