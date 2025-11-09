#!/usr/bin/env tsx

/**
 * Generate SQL migration file from Liturgical Calendar API
 * Fetches events and creates INSERT statements for global_liturgical_events table
 *
 * Usage:
 *   tsx scripts/generate-global-liturgical-migration.ts [year] [locale]
 *   tsx scripts/generate-global-liturgical-migration.ts 2025 en
 */

interface LiturgicalEvent {
  event_key: string
  date: string
  year: number
  [key: string]: any
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

function escapeString(str: string): string {
  return str.replace(/'/g, "''")
}

function generateInsertStatement(event: LiturgicalEvent, locale: string): string {
  const dateOnly = event.date.split('T')[0]
  const eventDataJson = JSON.stringify(event).replace(/'/g, "''")

  return `INSERT INTO global_liturgical_events (event_key, date, year, locale, event_data)
VALUES ('${escapeString(event.event_key)}', '${dateOnly}', ${event.year}, '${locale}', '${eventDataJson}'::jsonb)
ON CONFLICT (event_key, date, locale) DO NOTHING;`
}

async function main() {
  const year = parseInt(process.argv[2] || '2025', 10)
  const locale = process.argv[3] || 'en'

  console.log('🚀 Generating Global Liturgical Events Migration')
  console.log('=' .repeat(60))
  console.log(`Year: ${year}`)
  console.log(`Locale: ${locale}`)
  console.log('=' .repeat(60))

  try {
    const events = await fetchLiturgicalCalendar(year, locale)

    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const migrationFile = `supabase/migrations/${timestamp}000002_seed_global_liturgical_events_${year}_${locale}.sql`

    let sql = `-- Seed global_liturgical_events table for year ${year} (locale: ${locale})
-- Generated from https://litcal.johnromanodorazio.com/api/dev/calendar
-- Total events: ${events.length}
-- Generated on: ${new Date().toISOString()}

`

    for (const event of events) {
      sql += generateInsertStatement(event, locale) + '\n\n'
    }

    // Write to file
    const fs = require('fs')
    fs.writeFileSync(migrationFile, sql)

    console.log(`\n✅ Migration file created: ${migrationFile}`)
    console.log(`📝 Total events: ${events.length}`)
    console.log(`\n📋 Next steps:`)
    console.log(`   1. Review the migration file`)
    console.log(`   2. Run: supabase db push`)

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

main()
