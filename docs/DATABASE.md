# Database Management

## Database Resets

**IMPORTANT:** Database resets are performed via the Supabase UI Dashboard, NOT via CLI commands.

**Workflow:**
1. Go to your Supabase project dashboard
2. Navigate to Database → Reset Database
3. Confirm the reset (this will drop all tables and re-run migrations)
4. After reset completes, run the seed command (see below)

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
- `20251109000002_seed_global_liturgical_events_2025_en.sql` - 538 events for 2025
- `20251109000003_seed_global_liturgical_events_2026_en.sql` - 547 events for 2026

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
   supabase/migrations/20251109000002_seed_global_liturgical_events_2025_en.sql
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

## Notes

- **Current approach:** Liturgical data is seeded via SQL migrations for faster database resets during development
- **Future approach:** TypeScript scripts (above) fetch from API - useful for production or when migrations become too large
- Data is stored in `global_liturgical_events` table with JSONB for full event data
- Migrations run automatically when database is reset via Supabase UI
- Indexed for efficient date range queries

## Troubleshooting

### Database migration fails
- Ensure you're linked to the correct Supabase project (`supabase link`)
- Check that your environment variables are correctly set in `.env.local`
- Try resetting the database via the Supabase dashboard and re-running migrations

### Seeding fails
- Make sure migrations have been run first (`supabase db push`)
- Check your internet connection (seeders fetch from external API)
- Verify your Supabase service role key has proper permissions
