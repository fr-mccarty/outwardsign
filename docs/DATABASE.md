# Database Management

> **🔴 Context Requirement:** When performing database operations (resets, seeding, creating liturgical calendar migrations), you MUST include this file in your context. This file contains critical procedures that ensure data integrity and proper migration handling.

> **Overview:** This file provides detailed database management procedures. For migration creation guidelines and file structure, see the Database section in [CLAUDE.md](../CLAUDE.md#-database).

## Unified Event Data Model (December 2025)

As part of the Unified Event Data Model implementation, the database was restructured into a 3-table hierarchy:

### The 3-Table Hierarchy

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **event_types** | User-defined templates | `system_type` (enum), `role_definitions` (jsonb) |
| **master_events** | Specific event instances | `event_type_id` (NOT NULL), `field_values` (jsonb), `status` |
| **calendar_events** | Date/time/location entries | `master_event_id` (NOT NULL), `input_field_definition_id` (NOT NULL), `start_datetime` |
| **master_event_roles** | Role assignments | `master_event_id`, `role_id`, `person_id` |

### System Types (Enum Field)

**event_types.system_type** is an enum field with CHECK constraint (NOT a foreign key):
- `'mass'` - Masses
- `'special-liturgy'` - Special Liturgies
- `'sacrament'` - Sacraments
- `'event'` - Events

System type metadata (icons, bilingual labels) is stored in application constants at `src/lib/constants/system-types.ts`.

### Key Database Changes

**calendar_events table restructure:**
- `start_datetime` (timestamptz, NOT NULL) - Includes timezone
- `input_field_definition_id` (uuid, NOT NULL) - References the field definition that created this calendar event
- `master_event_id` (uuid, NOT NULL) - Every calendar_event MUST have a master_event
- NO title field (computed from master_event + field_name)

**master_event_roles table (new):**
- Stores role assignments for master_events
- Links to `event_types.role_definitions` JSONB structure
- One row per person per role per master_event

**event_types.role_definitions (new JSONB field):**
- Defines available roles for each event type
- Structure: `{"roles": [{"id": "presider", "name": "Presider", "required": true}, ...]}`

**masses table (deleted):**
- Migrated to unified structure via `master_events`
- All masses are now `master_events` with `event_type_id` pointing to event_types where `system_type = 'mass'`

**Migration Files:**
- `20251216000001_update_event_types_system_type.sql`
- `20251216000002_update_input_field_definitions_calendar_event.sql`
- `20251216000003_recreate_calendar_events_table.sql`
- `20251216000004_add_status_to_master_events.sql`
- `20251216000005_create_master_event_roles_table.sql`
- `20251216000006_add_role_definitions_to_event_types.sql`
- `20251216000007_delete_masses_table.sql`

## Database Resets

**For local development**, reset the database and apply all migrations using:

```bash
npm run db:fresh
```

This command will:
1. Drop all tables in your local database
2. Re-run all migrations from `supabase/migrations/` in order
3. Apply the latest schema changes

**After the reset completes**, seed the database with initial data (see [Seeding the Database](#seeding-the-database) below).

**For pushing to remote** (maintainer only): Use `supabase db push` - **DO NOT use this for local development**.

## Seeding the Database

> **Development Note:** During development, it's recommended to seed data directly from the migrations folder rather than using the dynamic API import script (which can be slow). Include seed data in your migration files for faster database resets. The procedure below (using `npm run seed` to fetch from the API) will be the standard approach in production, but for now, seeding from migrations is more efficient.

After resetting the database or running migrations, seed the database with initial data:

```bash
npm run seed
```

This will run all configured seeders defined in `scripts/seed.ts`, including:
- Liturgical calendar events for 2025 (English)
- Liturgical calendar events for 2026 (English)

## Liturgical Calendar Data

The application uses global liturgical calendar data from [John Romano D'Orazio's Liturgical Calendar API](https://litcal.johnromanodorazio.com).

**Current Migrations:**
- `20251109000002_seed_global_liturgical_events_2025_en_US.sql` - 538 events for 2025
- `20251109000003_seed_global_liturgical_events_2026_en_US.sql` - 547 events for 2026

### Creating New Liturgical Calendar Migrations

To create a migration file for a new year (e.g., 2027), use the Task tool with these instructions:

1. **Fetch data from API:**
   ```
   https://litcal.johnromanodorazio.com/api/dev/calendar?locale=en&year=2027
   ```

2. **Parse the JSON** and extract all events from the `litcal` array

3. **Create SQL migration file** at:
   ```
   supabase/migrations/YYYYMMDD000004_seed_global_liturgical_events_2027_en.sql
   ```
   (Increment the sequence number: 000004, 000005, etc.)

4. **Follow this format:**
   ```sql
   -- Seed global_liturgical_events table for year 2027 (locale: en)
   -- Generated from https://litcal.johnromanodorazio.com/api/dev/calendar
   -- Total events: [count]
   -- Generated on: [ISO timestamp]

   INSERT INTO global_liturgical_events (event_key, date, year, locale, event_data)
   VALUES ('EventKey', 'YYYY-MM-DD', 2027, 'en', '{...full JSON...}'::jsonb)
   ON CONFLICT (event_key, date, locale) DO NOTHING;
   ```

5. **Important:**
   - Extract date as YYYY-MM-DD only (from ISO timestamp)
   - Store full event JSON in `event_data` as JSONB
   - Escape single quotes by doubling them (`'` becomes `''`)
   - Use `ON CONFLICT DO NOTHING` for idempotent migrations

6. **Reference existing file** for exact format:
   ```
   supabase/migrations/20251109000002_seed_global_liturgical_events_2025_en_US.sql
   ```

### Alternative: Dynamic API Seeding (Future Use)

For production or when SQL migrations become too large, use the TypeScript API import scripts:

```bash
# Seed individual years
npm run seed:liturgical:2025
npm run seed:liturgical:2026

# Custom year and locale
npm run seed:liturgical -- --year=2027 --locale=es

# Run all seeders
npm run seed
```

**Adding New Seeders:**

Edit `scripts/seed.ts` and add to the `seeders` array:

```typescript
{
  name: 'Your Seeder Name',
  command: 'tsx scripts/your-script.ts --args',
  description: 'What this seeder does'
}
```

## Migration Guidelines

**See [CLAUDE.md - Database section](../CLAUDE.md#-database) for:**
- Migration creation workflow
- Migration file structure (one table per file)
- Migration naming conventions (timestamp format)
- Migration strategy during early development

## Notes

- **Current approach:** Liturgical data is seeded via SQL migrations for faster database resets during development
- **Future approach:** TypeScript scripts (above) fetch from API - useful for production or when migrations become too large
- Data is stored in `global_liturgical_events` table with JSONB for full event data
- Migrations run automatically when you run `npm run db:fresh`
- Indexed for efficient date range queries

## Troubleshooting

### Database migration fails
- Ensure you're linked to the correct Supabase project (`supabase link`)
- Check that your environment variables are correctly set in `.env.local`
- Try running `npm run db:fresh` to reset and re-apply all migrations

### Seeding fails
- Make sure migrations have been run first (via `npm run db:fresh`)
- Check your internet connection (seeders fetch from external API)
- Verify your Supabase service role key has proper permissions
