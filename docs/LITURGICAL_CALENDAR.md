# Liturgical Calendar System

This document provides comprehensive documentation for the liturgical calendar integration in Outward Sign, including API integration, database structure, import scripts, and usage examples.

## Table of Contents

- [Overview](#overview)
- [Data Source](#data-source)
- [Database Structure](#database-structure)
- [Import Methods](#import-methods)
  - [Migration Files (Recommended for Development)](#migration-files-recommended-for-development)
  - [TypeScript Import Script (Production)](#typescript-import-script-production)
- [Server Actions API](#server-actions-api)
- [Adding New Years](#adding-new-years)
- [Locale Support](#locale-support)
- [Event Data Structure](#event-data-structure)

---

## Overview

Outward Sign integrates global Catholic liturgical calendar data to provide parishes with accurate liturgical information for planning and celebrating Masses and sacraments. The system stores liturgical events (solemnities, feasts, memorials, etc.) in a dedicated table and provides APIs for querying by date range, month, or year.

**Key Features:**
- Global liturgical calendar data shared across all parishes
- Read-only data (parishes cannot modify global events)
- Bilingual support (English, Spanish, and more)
- Efficient date-range queries
- JSONB storage for full event metadata

---

## Data Source

All liturgical calendar data comes from **[John Romano D'Orazio's Liturgical Calendar API](https://litcal.johnromanodorazio.com)**.

**API Endpoint (US Calendar):**
```
https://litcal.johnromanodorazio.com/api/v5/calendar/nation/US/{year}?locale={locale}
```

**Example:**
```
https://litcal.johnromanodorazio.com/api/v5/calendar/nation/US/2026?locale=en_US
```

**Note:** We use the US-specific calendar (`/nation/US/`) which includes US-specific holy days of obligation and observances that differ from the general Roman Catholic calendar. The default locale is `en_US` for English.

**Response Format:**
```json
{
  "litcal": [
    {
      "event_key": "Advent1",
      "name": "First Sunday of Advent",
      "date": "2025-11-30T00:00:00+00:00",
      "year": 2025,
      "month": 11,
      "day": 30,
      "color": ["purple"],
      "grade": 2,
      "type": "sunday",
      "liturgical_season": "Advent",
      ...
    },
    ...
  ]
}
```

---

## Database Structure

### Table: `global_liturgical_events`

**Schema:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `event_key` | TEXT | Event identifier from API (e.g., "Advent1", "StFrancisXavier") |
| `date` | DATE | Date of event (YYYY-MM-DD) |
| `year` | INTEGER | Year of event (for filtering) |
| `locale` | TEXT | Language/locale code (e.g., "en_US", "es") |
| `event_data` | JSONB | Full event object from API |
| `created_at` | TIMESTAMPTZ | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | Record update timestamp |

**Indexes:**
- `idx_global_liturgical_events_date` - Date range queries
- `idx_global_liturgical_events_year_locale` - Year and locale filtering
- `idx_global_liturgical_events_event_key` - Event key lookups
- `idx_global_liturgical_events_event_data` - JSONB queries (GIN index)

**Constraints:**
- `UNIQUE (event_key, date, locale)` - Prevents duplicate events

**RLS Policies:**
- ✅ `SELECT` - Authenticated and anonymous users can read (public data)
- ❌ `INSERT/UPDATE/DELETE` - Only service role can write (backend operations only)

**Migration File:**
```
supabase/migrations/20251109000001_create_global_liturgical_events_table.sql
```

---

## Import Methods

There are two ways to import liturgical calendar data: migration files (recommended for development) and TypeScript scripts (recommended for production).

### Migration Files (Recommended for Development)

**Why?** Migration files run automatically when resetting the database (`npm run db:fresh`), making local development faster.

**Current Migrations:**
- `20251109000002_seed_global_liturgical_events_2025_en_US.sql` - 538 events for 2025
- `20251109000003_seed_global_liturgical_events_2026_en_US.sql` - 547 events for 2026

**Note:** The existing 2025 and 2026 migrations were generated before the US-specific endpoint was implemented. While they contain valid data, they may be missing some US-specific observances. Consider regenerating them using the updated script to ensure all US-specific holy days and observances are included.

#### Generating Migration Files

Use the migration generator script to create new migration files:

```bash
# Generate migration for 2027 (English - default locale en_US)
tsx scripts/generate-global-liturgical-migration.ts 2027

# Generate migration for 2027 with explicit locale
tsx scripts/generate-global-liturgical-migration.ts 2027 en_US

# Generate migration for 2027 (Spanish)
tsx scripts/generate-global-liturgical-migration.ts 2027 es
```

**Script Location:** `scripts/generate-global-liturgical-migration.ts`

**What it does:**
1. Fetches events from the Liturgical Calendar API
2. Generates SQL INSERT statements
3. Creates migration file in `supabase/migrations/`
4. Handles quote escaping and JSONB formatting

**Migration File Format:**
```sql
-- Seed global_liturgical_events table for year 2027 (locale: en_US)
-- Generated from https://litcal.johnromanodorazio.com/api/v5/calendar/nation/US/2027
-- Total events: 547
-- Generated on: 2025-11-14T12:00:00.000Z

INSERT INTO global_liturgical_events (event_key, date, year, locale, event_data)
VALUES ('Advent1', '2027-11-28', 2027, 'en_US', '{"event_key":"Advent1",...}'::jsonb)
ON CONFLICT (event_key, date, locale) DO NOTHING;

INSERT INTO global_liturgical_events (event_key, date, year, locale, event_data)
VALUES ('StAndrewAp', '2027-11-30', 2027, 'en_US', '{"event_key":"StAndrewAp",...}'::jsonb)
ON CONFLICT (event_key, date, locale) DO NOTHING;

-- ... (continues for all events)
```

**After Generation:**
1. Review the migration file
2. Run `supabase db push` to apply it
3. Or run `npm run db:fresh` to reset and apply all migrations

### TypeScript Import Script (Production)

**Why?** Direct database import is better for production when migrations become too large or when you need to update existing data without recreating the database.

**Script Location:** `scripts/import-liturgical-events.ts`

#### Usage

```bash
# Import 2025 events (English)
npm run seed:liturgical:2025

# Import 2026 events (English)
npm run seed:liturgical:2026

# Import custom year and locale
npm run seed:liturgical -- --year=2027 --locale=es

# Run all configured seeders
npm run seed
```

**What it does:**
1. Fetches events from the Liturgical Calendar API
2. Uses `upsert` to insert or update events in the database
3. Provides detailed import summary (inserted, updated, skipped, errors)
4. Bypasses RLS using service role key

**Requirements:**
- `.env.production.local` file with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

**Output Example:**
```
🚀 Liturgical Events Import Script
==================================================
Year: 2027
Locale: es
==================================================
📅 Fetching US liturgical calendar for year 2027 (locale: es)...
   URL: https://litcal.johnromanodorazio.com/api/v5/calendar/nation/US/2027?locale=es
✅ Fetched 547 events

📥 Importing 547 events into database...

📊 Import Summary:
   ✅ Inserted: 520
   🔄 Updated: 27
   ⏭️  Skipped: 0
   ❌ Errors: 0
   📝 Total processed: 547

✅ Import completed successfully!
```

---

## Server Actions API

Outward Sign provides Server Actions for querying liturgical events from the frontend.

**File Location:** `src/lib/actions/global-liturgical-events.ts`

### Available Functions

#### `getGlobalLiturgicalEvents()`

Get liturgical events for a date range.

```typescript
import { getGlobalLiturgicalEvents } from '@/lib/actions/global-liturgical-events'

const events = await getGlobalLiturgicalEvents(
  '2025-12-01',  // startDate
  '2025-12-31',  // endDate
  'en_US'        // locale (optional, default: 'en_US')
)
```

**Returns:** `GlobalLiturgicalEvent[]`

#### `getGlobalLiturgicalEventsByMonth()`

Get liturgical events for a specific month.

```typescript
import { getGlobalLiturgicalEventsByMonth } from '@/lib/actions/global-liturgical-events'

const events = await getGlobalLiturgicalEventsByMonth(
  2025,    // year
  12,      // month (1-12)
  'en_US'  // locale (optional)
)
```

**Returns:** `GlobalLiturgicalEvent[]`

#### `getGlobalLiturgicalEventsPaginated()`

Get paginated liturgical events for a date range.

```typescript
import { getGlobalLiturgicalEventsPaginated } from '@/lib/actions/global-liturgical-events'

const result = await getGlobalLiturgicalEventsPaginated(
  '2025-01-01',  // startDate
  '2025-12-31',  // endDate
  'en_US',       // locale
  {              // pagination params (optional)
    page: 1,
    limit: 10,
    search: 'advent'
  }
)

console.log(result.items)       // GlobalLiturgicalEvent[]
console.log(result.totalCount)  // number
console.log(result.totalPages)  // number
```

**Returns:** `PaginatedResult<GlobalLiturgicalEvent>`

#### `getGlobalLiturgicalEvent()`

Get a single liturgical event by ID.

```typescript
import { getGlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'

const event = await getGlobalLiturgicalEvent('event-uuid-here')
```

**Returns:** `GlobalLiturgicalEvent | null`

---

## Adding New Years

### Option 1: Generate Migration File (Development)

**Best for:** Local development, database resets

```bash
# Generate migration file (uses en_US by default)
tsx scripts/generate-global-liturgical-migration.ts 2028

# Review the file
cat supabase/migrations/YYYYMMDD000004_seed_global_liturgical_events_2028_en_US.sql

# Apply migration
supabase db push
```

### Option 2: Import via Script (Production)

**Best for:** Production updates, large datasets

```bash
# Import directly to database (uses en_US by default)
npm run seed:liturgical -- --year=2028

# Or with explicit locale
npm run seed:liturgical -- --year=2028 --locale=en_US
```

### Migration File Naming Convention

```
YYYYMMDD000XXX_seed_global_liturgical_events_YYYY_LOCALE.sql
```

**Components:**
- `YYYYMMDD` - Date of creation (e.g., `20251114`)
- `000XXX` - Sequence number (increment from last migration)
- `YYYY` - Year of liturgical data (e.g., `2027`)
- `LOCALE` - Locale code (e.g., `en`, `es`, `en_US`)

**Examples:**
- `20251114000004_seed_global_liturgical_events_2027_en_US.sql`
- `20251114000005_seed_global_liturgical_events_2027_es.sql`
- `20251114000006_seed_global_liturgical_events_2028_en_US.sql`

---

## Locale Support

The Liturgical Calendar API supports multiple locales. Common locales include:

| Locale Code | Language | Example |
|-------------|----------|---------|
| `en` or `en_US` | English | "First Sunday of Advent" |
| `es` | Spanish | "Primer Domingo de Adviento" |
| `fr` | French | "Premier Dimanche de l'Avent" |
| `it` | Italian | "Prima Domenica di Avvento" |
| `pt` | Portuguese | "Primeiro Domingo do Advento" |

**To add a new locale:**

1. Generate migration or import data:
   ```bash
   # For Spanish
   tsx scripts/generate-global-liturgical-migration.ts 2025 es

   # For English (US is default)
   tsx scripts/generate-global-liturgical-migration.ts 2025 en_US
   ```

2. Apply migration:
   ```bash
   supabase db push
   ```

3. Query with locale parameter:
   ```typescript
   // Query Spanish events
   const events = await getGlobalLiturgicalEvents('2025-01-01', '2025-12-31', 'es')

   // Query English (US) events
   const events = await getGlobalLiturgicalEvents('2025-01-01', '2025-12-31', 'en_US')
   ```

---

## Event Data Structure

### GlobalLiturgicalEvent Interface

```typescript
export interface GlobalLiturgicalEvent {
  id: string
  event_key: string
  date: string  // YYYY-MM-DD
  year: number
  locale: string
  event_data: {
    event_key: string
    event_idx: number
    name: string
    color: string[]              // Liturgical colors (e.g., ["purple"], ["white", "gold"])
    color_lcl: string[]          // Localized color names
    grade: number                // Liturgical grade (1-7)
    grade_lcl: string            // Localized grade
    grade_abbr: string           // Grade abbreviation
    grade_display: string | null
    common: string[]
    common_lcl: string
    type: string                 // Event type (e.g., "sunday", "feast", "memorial")
    date: string                 // ISO 8601 timestamp
    year: number
    month: number                // 1-12
    month_short: string          // e.g., "Nov"
    month_long: string           // e.g., "November"
    day: number                  // 1-31
    day_of_the_week_iso8601: number  // 1-7 (Monday=1)
    day_of_the_week_short: string    // e.g., "Sun"
    day_of_the_week_long: string     // e.g., "Sunday"
    readings?: {
      first_reading?: string
      responsorial_psalm?: string
      second_reading?: string
      gospel_acclamation?: string
      gospel?: string
    }
    liturgical_year?: string         // e.g., "A", "B", "C"
    is_vigil_mass?: boolean
    is_vigil_for?: string
    has_vigil_mass?: boolean
    has_vesper_i?: boolean
    has_vesper_ii?: boolean
    psalter_week?: number            // 1-4
    liturgical_season?: string       // e.g., "Advent", "Lent", "Easter"
    liturgical_season_lcl?: string   // Localized season name
    holy_day_of_obligation?: boolean
  }
  created_at: string
  updated_at: string
}
```

### Liturgical Grades

| Grade | Name | Examples |
|-------|------|----------|
| 1 | Easter Triduum | Good Friday, Easter Vigil, Easter Sunday |
| 2 | Solemnities | Christmas, Ascension, Assumption |
| 3 | Feasts of the Lord | Presentation, Transfiguration |
| 4 | Feasts | Apostles, Evangelists |
| 5 | Memorials | Saint days (obligatory) |
| 6 | Optional Memorials | Saint days (optional) |
| 7 | Weekdays | Ordinary Time weekdays |

### Liturgical Colors

- **Purple/Violet** - Advent, Lent
- **White** - Christmas, Easter, celebrations of the Lord, Mary, saints (non-martyrs)
- **Red** - Passion Sunday, Good Friday, Pentecost, martyrs
- **Green** - Ordinary Time
- **Rose** - Gaudete Sunday (3rd Sunday of Advent), Laetare Sunday (4th Sunday of Lent)
- **Black** - All Souls' Day, Funeral Masses (optional)

---

## Common Use Cases

### Display Liturgical Calendar on Dashboard

```typescript
import { getGlobalLiturgicalEventsByMonth } from '@/lib/actions/global-liturgical-events'

export default async function DashboardPage() {
  const now = new Date()
  const events = await getGlobalLiturgicalEventsByMonth(
    now.getFullYear(),
    now.getMonth() + 1,
    'en_US'
  )

  return (
    <div>
      <h2>This Month's Liturgical Events</h2>
      <ul>
        {events.map(event => (
          <li key={event.id}>
            {event.event_data.name} - {event.date}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Pre-fill Mass Form with Liturgical Event

```typescript
import { getGlobalLiturgicalEvents } from '@/lib/actions/global-liturgical-events'

export default async function MassFormPage({ params }: { params: { date: string } }) {
  const events = await getGlobalLiturgicalEvents(params.date, params.date, 'en_US')
  const liturgicalEvent = events[0]

  return (
    <MassForm
      initialTitle={liturgicalEvent?.event_data.name}
      initialColor={liturgicalEvent?.event_data.color[0]}
      initialReadings={liturgicalEvent?.event_data.readings}
    />
  )
}
```

---

## Troubleshooting

### Migration Generation Fails

**Problem:** Script fails to fetch data from API

**Solutions:**
- Check internet connection
- Verify API is accessible: `curl https://litcal.johnromanodorazio.com/api/v5/calendar/nation/US/2025?locale=en_US`
- Check if locale code is valid

### Import Script Fails

**Problem:** "Missing required environment variables"

**Solution:** Ensure `.env.production.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### No Events Returned from Query

**Problem:** `getGlobalLiturgicalEvents()` returns empty array

**Solutions:**
- Check if data exists for the year: `SELECT * FROM global_liturgical_events WHERE year = 2025 LIMIT 1`
- Verify locale matches: use `'en_US'` not `'en'` (or check what's in database)
- Check date range is valid and formatted correctly (YYYY-MM-DD)

### Duplicate Events on Import

**Problem:** Multiple records with same event on same date

**Should not happen** - The table has a unique constraint on `(event_key, date, locale)`. Check for:
- Different locale codes being used (e.g., `en` vs `en_US`)
- Manual inserts bypassing the constraint

---

## References

- **API Documentation:** https://litcal.johnromanodorazio.com
- **Migration Script:** `scripts/generate-global-liturgical-migration.ts`
- **Import Script:** `scripts/import-liturgical-events.ts`
- **Server Actions:** `src/lib/actions/global-liturgical-events.ts`
- **Database Migration:** `supabase/migrations/20251109000001_create_global_liturgical_events_table.sql`
