# Calendar System Documentation

## Overview

Outward Sign includes a comprehensive calendar system that displays liturgical events from the Roman Catholic liturgical calendar alongside parish events (weddings, funerals, baptisms, etc.). The system supports multiple views (month, week, day) and integrates global liturgical data with parish-specific events.

## Liturgical Calendar Data Source

**API:** https://litcal.johnromanodorazio.com/api/dev/calendar

The application uses the Liturgical Calendar API created by John Romano D'Orazio, which provides comprehensive liturgical calendar data for the Catholic Church including:

- Daily Mass readings
- Feast days and solemnities
- Liturgical seasons (Advent, Christmas, Lent, Easter, Ordinary Time)
- Liturgical colors
- Holy days of obligation
- Saint feast days
- Liturgical ranks and grades

**API Endpoint Format:**
```
https://litcal.johnromanodorazio.com/api/dev/calendar?locale={locale}&year={year}
```

**Parameters:**
- `locale`: Language/region code (e.g., `en` for English, `es` for Spanish)
- `year`: Calendar year (e.g., `2025`, `2026`)

**Supported Locales:**
- `en` - English (default)
- `es` - Spanish
- Other locales supported by the API (check API documentation)

## Database Structure

### Global Liturgical Events Table

**Table:** `global_liturgical_events`

This table stores liturgical calendar events fetched from the API. It is **global data shared across all parishes** (not scoped to individual parishes).

**Schema:**
```sql
CREATE TABLE global_liturgical_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Extracted fields for efficient querying
  event_key TEXT NOT NULL,           -- Event identifier (e.g., "Advent1", "StFrancisXavier")
  date DATE NOT NULL,                -- Date of liturgical event
  year INTEGER NOT NULL,             -- Year of event
  locale TEXT NOT NULL DEFAULT 'en_US', -- Language/locale code

  -- Full event data as JSON
  event_data JSONB NOT NULL,         -- Complete event object from API

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint
  CONSTRAINT unique_global_liturgical_event UNIQUE (event_key, date, locale)
);
```

**Indexes:**
- `idx_global_liturgical_events_date` - Date range searches (primary query pattern)
- `idx_global_liturgical_events_year_locale` - Year and locale filtering
- `idx_global_liturgical_events_event_key` - Event key lookups
- `idx_global_liturgical_events_event_data` - GIN index for JSONB queries

**RLS Policies:**
- ✅ All authenticated users can SELECT (read-only)
- ✅ Anonymous users can SELECT (frontend uses anon role)
- ❌ Only service_role can INSERT/UPDATE/DELETE (backend operations only)

**Migration File:** `supabase/migrations/20251109000001_create_global_liturgical_events_table.sql`

## Event Data Structure

Each liturgical event from the API includes comprehensive data:

```typescript
interface LiturgicalEvent {
  event_key: string                    // e.g., "Advent1", "Christmas"
  event_idx: number
  name: string                         // Event name
  color: string[]                      // Liturgical colors
  color_lcl: string[]                  // Localized color names
  grade: number                        // Liturgical grade (1-7)
  grade_lcl: string                    // Localized grade name
  grade_abbr: string                   // Grade abbreviation
  grade_display: string | null
  common: string[]                     // Common of saints/feasts
  common_lcl: string
  type: string                         // Event type
  date: string                         // ISO 8601 date
  year: number
  month: number
  month_short: string
  month_long: string
  day: number
  day_of_the_week_iso8601: number
  day_of_the_week_short: string
  day_of_the_week_long: string

  // Optional fields
  readings?: {
    first_reading?: string
    responsorial_psalm?: string
    second_reading?: string
    gospel_acclamation?: string
    gospel?: string
  }
  liturgical_year?: string
  is_vigil_mass?: boolean
  is_vigil_for?: string
  has_vigil_mass?: boolean
  has_vesper_i?: boolean
  has_vesper_ii?: boolean
  psalter_week?: number
  liturgical_season?: string
  liturgical_season_lcl?: string
  holy_day_of_obligation?: boolean
}
```

## Import Scripts

### 1. Import Script (Runtime Import)

Fetches liturgical events from the API and imports them directly into the database using the Supabase service role key.

**Script:** `scripts/import-liturgical-events.ts`

**Usage:**
```bash
# Import current year (English)
npm run seed:liturgical

# Import specific year (English)
npm run seed:liturgical:2025
npm run seed:liturgical:2026

# Import with custom year and locale
npm run seed:liturgical -- --year=2027 --locale=es
```

**How it works:**
1. Fetches events from the API for the specified year and locale
2. Transforms API response into database records
3. Uses UPSERT to handle duplicates (based on event_key, date, locale)
4. Reports import summary (inserted, updated, skipped, errors)

**Requirements:**
- `.env.local` file with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

**Output Example:**
```
🚀 Liturgical Events Import Script
==================================================
Year: 2025
Locale: en
==================================================
📅 Fetching liturgical calendar for year 2025 (locale: en)...
   URL: https://litcal.johnromanodorazio.com/api/dev/calendar?locale=en&year=2025
✅ Fetched 365 events

📥 Importing 365 events into database...

📊 Import Summary:
   ✅ Inserted: 365
   🔄 Updated: 0
   ⏭️  Skipped: 0
   ❌ Errors: 0
   📝 Total processed: 365

✅ Import completed successfully!
```

### 2. Migration Generator Script

Generates SQL migration files from the API data (for seeding new databases).

**Script:** `scripts/generate-global-liturgical-migration.ts`

**Usage:**
```bash
# Generate migration for 2025 (English)
tsx scripts/generate-global-liturgical-migration.ts 2025 en

# Generate migration for 2026 (Spanish)
tsx scripts/generate-global-liturgical-migration.ts 2026 es
```

**How it works:**
1. Fetches events from the API
2. Generates INSERT statements with ON CONFLICT DO NOTHING
3. Creates migration file: `supabase/migrations/YYYYMMDD000002_seed_global_liturgical_events_YEAR_LOCALE.sql`

**Output:**
```
🚀 Generating Global Liturgical Events Migration
============================================================
Year: 2025
Locale: en
============================================================
📅 Fetching liturgical calendar for year 2025 (locale: en)...
✅ Fetched 365 events

✅ Migration file created: supabase/migrations/20251109000002_seed_global_liturgical_events_2025_en.sql
📝 Total events: 365

📋 Next steps:
   1. Review the migration file
   2. Run: supabase db push
```

**Migration File Format:**
```sql
-- Seed global_liturgical_events table for year 2025 (locale: en)
-- Generated from https://litcal.johnromanodorazio.com/api/dev/calendar
-- Total events: 365
-- Generated on: 2024-11-09T12:00:00.000Z

INSERT INTO global_liturgical_events (event_key, date, year, locale, event_data)
VALUES ('Advent1', '2025-11-30', 2025, 'en', '{...}'::jsonb)
ON CONFLICT (event_key, date, locale) DO NOTHING;

-- ... more INSERT statements
```

## Calendar Components

### CalendarClient Component

**Location:** `src/app/(main)/calendar/calendar-client.tsx`

Main client component that renders the calendar with parish events and liturgical events.

**Props:**
```typescript
interface CalendarClientProps {
  events: Event[]           // Parish events (weddings, funerals, etc.)
  initialView?: 'month' | 'week' | 'day'
  initialDate?: string      // ISO date string
}
```

### Calendar Component (Generic)

**Location:** `src/components/calendar/calendar.tsx`

Reusable calendar component that can display any type of calendar items.

**Props:**
```typescript
interface CalendarProps<T extends CalendarItem> {
  currentDate: Date
  items: T[]
  view?: CalendarView       // 'month' | 'week' | 'day'
  onNavigate: (direction: 'prev' | 'next') => void
  onToday: () => void
  onViewChange?: (view: CalendarView) => void
  onDayClick?: (date: Date) => void
  renderDayContent?: (day: CalendarDay<T>) => React.ReactNode
  getItemColor?: (item: T) => string
  onItemClick?: (item: T, event: React.MouseEvent) => void
  maxItemsPerDay?: number
  title: string
  actions?: React.ReactNode
  showViewSelector?: boolean
}
```

### Component Structure

```
calendar/
├── calendar.tsx                     # Main generic calendar component
├── calendar-header.tsx              # Header with navigation and view selector
├── calendar-grid.tsx                # Grid layout (month/week/day)
├── calendar-day.tsx                 # Individual day cell
├── day-events-modal.tsx             # Modal for viewing all events on a day
├── types.ts                         # TypeScript type definitions
├── index.ts                         # Barrel export
└── event-items/                     # Event rendering components
    ├── parish-event-item-month.tsx  # Parish event (month view)
    ├── parish-event-item-week.tsx   # Parish event (week view)
    ├── parish-event-item-day.tsx    # Parish event (day view)
    ├── liturgical-event-item-month.tsx
    ├── liturgical-event-item-week.tsx
    └── liturgical-event-item-day.tsx
```

## Server Actions

**Location:** `src/lib/actions/calendar.ts`

Available actions for calendar management:

```typescript
// Fetch all calendar entries for the parish
getCalendarEntries(): Promise<LiturgicalCalendarEntry[]>

// Fetch a single calendar entry by ID
getCalendarEntry(id: string): Promise<LiturgicalCalendarEntry | null>

// Create a new calendar entry (parish-specific)
createCalendarEntry(data: CreateCalendarEntryData): Promise<LiturgicalCalendarEntry>

// Update an existing calendar entry
updateCalendarEntry(id: string, data: CreateCalendarEntryData): Promise<LiturgicalCalendarEntry>

// Delete a calendar entry
deleteCalendarEntry(id: string): Promise<void>

// Fetch upcoming events (next N days)
getUpcomingEvents(limit?: number): Promise<LiturgicalCalendarEntry[]>
```

## Usage Examples

### Fetching Global Liturgical Events

```typescript
import { createClient } from '@/lib/supabase/server'

// Fetch liturgical events for a specific date range
const supabase = await createClient()
const { data: events } = await supabase
  .from('global_liturgical_events')
  .select('*')
  .gte('date', '2025-01-01')
  .lte('date', '2025-12-31')
  .eq('locale', 'en')
  .order('date', { ascending: true })
```

### Displaying Calendar

```typescript
import { getEvents } from '@/lib/actions/events'
import { CalendarClient } from './calendar-client'

export default async function CalendarPage() {
  const events = await getEvents()

  return (
    <CalendarClient
      events={events}
      initialView="month"
    />
  )
}
```

### Creating Custom Parish Event

```typescript
import { createCalendarEntry } from '@/lib/actions/calendar'

const newEvent = await createCalendarEntry({
  title: 'First Communion Mass',
  date: '2025-05-15',
  liturgical_season: 'EASTER',
  liturgical_rank: 'SOLEMNITY',
  color: 'WHITE',
  readings: ['Acts 2:1-11', 'Psalm 104', '1 Cor 12:3b-7', 'John 20:19-23'],
  special_prayers: ['Prayer for First Communicants'],
  notes: 'Special music planned',
  is_custom: true
})
```

## Maintenance

### Updating Liturgical Data

**When to update:**
- At the beginning of each liturgical year (Advent - typically late November)
- When adding support for a new language/locale
- When the API adds new data or fixes errors

**How to update:**

**Option 1: Runtime import (recommended for existing databases)**
```bash
npm run seed:liturgical:2025
npm run seed:liturgical:2026
```

**Option 2: Generate migration (recommended for new databases)**
```bash
tsx scripts/generate-global-liturgical-migration.ts 2025 en
supabase db push
```

### Data Storage Considerations

- Each year contains approximately 365-400 liturgical events
- Each event record is approximately 2-3 KB (including JSONB data)
- Annual storage per locale: ~1 MB
- Recommended to maintain current year + next year (2 years minimum)

### Multi-language Support

To support multiple languages, import data for each locale:

```bash
# English
npm run seed:liturgical:2025 -- --locale=en

# Spanish
npm run seed:liturgical:2025 -- --locale=es
```

The application can then filter by locale based on user preferences.

## API Reference Links

- **Liturgical Calendar API Documentation:** https://litcal.johnromanodorazio.com
- **API GitHub Repository:** Check the API website for links to source code and documentation
- **Supported Locales:** Refer to the API documentation for the complete list of supported languages/regions

## Troubleshooting

### Import Script Fails

**Error:** Missing environment variables
```
❌ Missing required environment variables:
   NEXT_PUBLIC_SUPABASE_URL
   SUPABASE_SERVICE_ROLE_KEY
```

**Solution:** Ensure `.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### API Request Fails

**Error:** `API request failed: 404 Not Found`

**Possible causes:**
- Invalid year parameter
- Invalid locale parameter
- API temporarily unavailable

**Solution:**
- Verify year is valid (typically supports current year ± several years)
- Verify locale code is supported by the API
- Check API status at https://litcal.johnromanodorazio.com

### Duplicate Events

The system uses UPSERT with unique constraint on `(event_key, date, locale)`, so duplicate imports are safe and will update existing records rather than creating duplicates.

### Missing Events in Calendar

**Check:**
1. Database contains events for the relevant year and locale
2. RLS policies are correctly configured
3. Frontend is filtering by correct locale
4. Date range queries are correct

## Future Enhancements

Potential improvements to the calendar system:

1. **Automatic Updates:** Schedule periodic imports to keep liturgical data current
2. **Locale Selection:** Allow users to select their preferred liturgical calendar locale
3. **Offline Support:** Cache liturgical events for offline access
4. **Custom Event Types:** Allow parishes to define custom event categories beyond liturgical events
5. **Export Features:** Export calendar to iCal, PDF, or other formats
6. **Integration:** Connect liturgical events with parish events (e.g., auto-suggest readings for weddings based on liturgical calendar)
