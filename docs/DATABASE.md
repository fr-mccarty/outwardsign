# Database Management

> **🔴 Context Requirement:** When performing database operations (resets, seeding, creating liturgical calendar migrations), you MUST include this file in your context. This file contains critical procedures that ensure data integrity and proper migration handling.

> **Overview:** This file provides detailed database management procedures. For migration creation guidelines and file structure, see the Database section in [CLAUDE.md](../CLAUDE.md#-database).

## Unified Event Data Model (December 2025)

As part of the Unified Event Data Model implementation, the database was restructured into a 3-table hierarchy:

### The 3-Table Hierarchy

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **event_types** | User-defined templates | `system_type` (enum: 'mass-liturgy', 'special-liturgy', 'parish-event') |
| **master_events** | Specific event instances | `event_type_id` (NOT NULL), `field_values` (jsonb), `status` |
| **calendar_events** | Date/time/location entries | `master_event_id` (NOT NULL), `input_field_definition_id` (NOT NULL), `start_datetime` |
| **people_event_assignments** | Person-to-event role assignments | `master_event_id`, `calendar_event_id` (nullable), `field_definition_id`, `person_id` |

### System Types (Enum Field)

**event_types.system_type** is an enum field with CHECK constraint (NOT a foreign key):
- `'mass-liturgy'` - Masses and Mass-related liturgies
- `'special-liturgy'` - Special liturgies (e.g., Liturgy of the Hours, Adoration)
- `'parish-event'` - Parish events and sacraments (default)

System type metadata (icons, bilingual labels) is stored in application constants at `src/lib/constants/system-types.ts`.

### Key Database Changes

**calendar_events table:**
- `start_datetime` (timestamptz, NOT NULL) - Includes timezone
- `input_field_definition_id` (uuid, NOT NULL) - References the field definition that created this calendar event
- `master_event_id` (uuid, NOT NULL) - Every calendar_event MUST have a master_event
- NO title field (computed from master_event + field_name)
- See migration: `20251210000008_create_calendar_events_table.sql`

**people_event_assignments table:**
- Unified storage for all person-to-event assignments (presiders, lectors, musicians, etc.)
- `calendar_event_id` nullable - NULL = template-level (applies to all occurrences), populated = occurrence-level (specific calendar event)
- `field_definition_id` references which role/field this assignment is for
- One row per person per role per event/occurrence
- See migration: `20251222000001_create_people_event_assignments_table.sql`

**event_types table:**
- `system_type` field with CHECK constraint for 'mass-liturgy', 'special-liturgy', 'parish-event'
- No `role_definitions` column - roles defined via `input_field_definitions` instead
- See migration: `20251031000002_create_event_types_table.sql`

**master_events table:**
- `field_values` (jsonb) stores dynamic field data
- `status` field for event lifecycle
- `liturgical_color` optional field for liturgical events
- See migration: `20251210000007_create_master_events_table.sql`

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
- `20251109000002_seed_liturgical_calendar_2025_en_US.sql` - 538 events for 2025
- `20251109000003_seed_liturgical_calendar_2026_en_US.sql` - 547 events for 2026

### Creating New Liturgical Calendar Migrations

To create a migration file for a new year (e.g., 2027), use the Task tool with these instructions:

1. **Fetch data from API:**
   ```
   https://litcal.johnromanodorazio.com/api/dev/calendar?locale=en&year=2027
   ```

2. **Parse the JSON** and extract all events from the `litcal` array

3. **Create SQL migration file** at:
   ```
   supabase/migrations/YYYYMMDD000004_seed_liturgical_calendar_2027_en.sql
   ```
   (Increment the sequence number: 000004, 000005, etc.)

4. **Follow this format:**
   ```sql
   -- Seed liturgical_calendar table for year 2027 (locale: en)
   -- Generated from https://litcal.johnromanodorazio.com/api/dev/calendar
   -- Total events: [count]
   -- Generated on: [ISO timestamp]

   INSERT INTO liturgical_calendar (event_key, date, year, locale, event_data)
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
   supabase/migrations/20251109000002_seed_liturgical_calendar_2025_en_US.sql
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
- Data is stored in `liturgical_calendar` table with JSONB for full event data
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
