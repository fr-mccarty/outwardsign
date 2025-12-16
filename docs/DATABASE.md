# Database Management

> **🔴 Context Requirement:** When performing database operations (resets, seeding, creating liturgical calendar migrations), you MUST include this file in your context. This file contains critical procedures that ensure data integrity and proper migration handling.

> **Overview:** This file provides detailed database management procedures. For migration creation guidelines and file structure, see the Database section in [CLAUDE.md](../CLAUDE.md#-database).

## Table Renames (December 2025)

As part of the Event Categories feature implementation, the following tables were renamed for clarity:

| Old Name | New Name | Purpose |
|----------|----------|---------|
| `dynamic_events` | `master_events` | Sacrament containers (Wedding, Funeral) and event planning records |
| `occasions` | `calendar_events` | Scheduled calendar items (rehearsals, ceremonies, parish activities) |

**Migration Files:**
- `20251213000001_rename_dynamic_events_to_master_events.sql`
- `20251213000002_rename_occasions_to_calendar_events.sql`

**Type Aliases:** Backward compatibility aliases exist in `src/lib/types.ts`:
- `DynamicEvent` → `MasterEvent`
- `DynamicEventType` → `EventType`
- `Occasion` → `CalendarEvent`

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
