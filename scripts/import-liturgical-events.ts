#!/usr/bin/env tsx

/**
 * Import Liturgical Events from John Romano D'Orazio's Liturgical Calendar API
 *
 * Usage:
 *   npm run seed:liturgical:2025
 *   npm run seed:liturgical:2026
 *   npm run seed:liturgical -- --year=2027 --locale=es
 *
 * Default: current year, locale 'en_US'
 *
 * API: https://litcal.johnromanodorazio.com/api/v5/calendar/nation/US/{year}
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { logSuccess, logError, logInfo, logWarning } from '../src/lib/utils/console'

// Load environment variables from .env.production.local
config({ path: '.env.production.local' })

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  logError('Missing required environment variables:')
  logError('   NEXT_PUBLIC_SUPABASE_URL')
  logError('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const year = args.find(arg => arg.startsWith('--year='))?.split('=')[1] || new Date().getFullYear().toString()
  const locale = args.find(arg => arg.startsWith('--locale='))?.split('=')[1] || 'en_US'

  return {
    year: parseInt(year, 10),
    locale
  }
}

interface LiturgicalEvent {
  event_key: string
  event_idx: number
  name: string
  color: string[]
  color_lcl: string[]
  grade: number
  grade_lcl: string
  grade_abbr: string
  grade_display: string | null
  common: string[]
  common_lcl: string
  type: string
  date: string
  year: number
  month: number
  month_short: string
  month_long: string
  day: number
  day_of_the_week_iso8601: number
  day_of_the_week_short: string
  day_of_the_week_long: string
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

interface ApiResponse {
  litcal: LiturgicalEvent[]
}

async function fetchLiturgicalCalendar(year: number, locale: string): Promise<LiturgicalEvent[]> {
  const url = `https://litcal.johnromanodorazio.com/api/v5/calendar/nation/US/${year}?locale=${locale}`

  logInfo(`Fetching US liturgical calendar for year ${year} (locale: ${locale})...`)
  logInfo(`   URL: ${url}`)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  const data: ApiResponse = await response.json()

  if (!data.litcal || !Array.isArray(data.litcal)) {
    throw new Error('Invalid API response: missing litcal array')
  }

  logSuccess(`Fetched ${data.litcal.length} events`)
  return data.litcal
}

async function importEvents(events: LiturgicalEvent[], locale: string) {
  logInfo(`\nImporting ${events.length} events into database...`)

  let inserted = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  for (const event of events) {
    try {
      // Extract date from ISO string (e.g., "2024-11-30T00:00:00+00:00" -> "2024-11-30")
      const dateOnly = event.date.split('T')[0]

      // Prepare row data
      const row = {
        event_key: event.event_key,
        date: dateOnly,
        year: event.year,
        locale: locale,
        event_data: event
      }

      // Use upsert to handle duplicates
      const { data, error } = await supabase
        .from('liturgical_calendar')
        .upsert(row, {
          onConflict: 'event_key,date,locale',
          ignoreDuplicates: false
        })
        .select()

      if (error) {
        logError(`   Error importing ${event.event_key} (${dateOnly}): ${error.message}`)
        errors++
      } else if (data && data.length > 0) {
        // Check if this was an insert or update by comparing created_at and updated_at
        const record = data[0]
        if (record.created_at === record.updated_at) {
          inserted++
        } else {
          updated++
        }
      } else {
        skipped++
      }
    } catch (err) {
      logError(`   Unexpected error importing ${event.event_key}: ${err}`)
      errors++
    }
  }

  logInfo('\nImport Summary:')
  logSuccess(`   Inserted: ${inserted}`)
  logInfo(`   Updated: ${updated}`)
  logInfo(`   Skipped: ${skipped}`)
  logError(`   Errors: ${errors}`)
  logInfo(`   Total processed: ${events.length}`)

  return { inserted, updated, skipped, errors }
}

async function main() {
  const { year, locale } = parseArgs()

  logInfo('Liturgical Events Import Script')
  logInfo('=' .repeat(50))
  logInfo(`Year: ${year}`)
  logInfo(`Locale: ${locale}`)
  logInfo('=' .repeat(50))

  try {
    // Fetch events from API
    const events = await fetchLiturgicalCalendar(year, locale)

    // Import events into database
    const results = await importEvents(events, locale)

    // Exit with appropriate code
    if (results.errors > 0) {
      logWarning('\nImport completed with errors')
      process.exit(1)
    } else {
      logSuccess('\nImport completed successfully!')
      process.exit(0)
    }
  } catch (error) {
    logError(`\nFatal error: ${error}`)
    process.exit(1)
  }
}

main()
