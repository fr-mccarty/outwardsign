#!/usr/bin/env tsx

/**
 * Import Liturgical Events from John Romano D'Orazio's Liturgical Calendar API
 *
 * Usage:
 *   npm run seed:liturgical:2025
 *   npm run seed:liturgical:2026
 *   npm run seed:liturgical -- --year=2027 --locale=es
 *
 * Default: current year, locale 'en'
 *
 * API: https://litcal.johnromanodorazio.com/api/dev/calendar
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: '.env.local' })

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
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
  const locale = args.find(arg => arg.startsWith('--locale='))?.split('=')[1] || 'en'

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
  const url = `https://litcal.johnromanodorazio.com/api/dev/calendar?locale=${locale}&year=${year}`

  console.log(`📅 Fetching liturgical calendar for year ${year} (locale: ${locale})...`)
  console.log(`   URL: ${url}`)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  const data: ApiResponse = await response.json()

  if (!data.litcal || !Array.isArray(data.litcal)) {
    throw new Error('Invalid API response: missing litcal array')
  }

  console.log(`✅ Fetched ${data.litcal.length} events`)
  return data.litcal
}

async function importEvents(events: LiturgicalEvent[], locale: string) {
  console.log(`\n📥 Importing ${events.length} events into database...`)

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
        .from('global_liturgical_events')
        .upsert(row, {
          onConflict: 'event_key,date,locale',
          ignoreDuplicates: false
        })
        .select()

      if (error) {
        console.error(`   ❌ Error importing ${event.event_key} (${dateOnly}):`, error.message)
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
      console.error(`   ❌ Unexpected error importing ${event.event_key}:`, err)
      errors++
    }
  }

  console.log('\n📊 Import Summary:')
  console.log(`   ✅ Inserted: ${inserted}`)
  console.log(`   🔄 Updated: ${updated}`)
  console.log(`   ⏭️  Skipped: ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log(`   📝 Total processed: ${events.length}`)

  return { inserted, updated, skipped, errors }
}

async function main() {
  const { year, locale } = parseArgs()

  console.log('🚀 Liturgical Events Import Script')
  console.log('=' .repeat(50))
  console.log(`Year: ${year}`)
  console.log(`Locale: ${locale}`)
  console.log('=' .repeat(50))

  try {
    // Fetch events from API
    const events = await fetchLiturgicalCalendar(year, locale)

    // Import events into database
    const results = await importEvents(events, locale)

    // Exit with appropriate code
    if (results.errors > 0) {
      console.log('\n⚠️  Import completed with errors')
      process.exit(1)
    } else {
      console.log('\n✅ Import completed successfully!')
      process.exit(0)
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

main()
