#!/usr/bin/env tsx

/**
 * Generate SQL migration file from Liturgical Calendar API
 * Fetches events and creates INSERT statements for liturgical_calendar table
 *
 * Usage:
 *   tsx scripts/generate-liturgical-calendar-migration.ts [year] [locale]
 *   tsx scripts/generate-liturgical-calendar-migration.ts 2025 en
 */

import { logSuccess, logError, logInfo } from '../src/lib/utils/console'

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

function escapeString(str: string): string {
  return str.replace(/'/g, "''")
}

function generateInsertStatement(event: LiturgicalEvent, locale: string): string {
  const dateOnly = event.date.split('T')[0]
  const eventDataJson = JSON.stringify(event).replace(/'/g, "''")

  return `INSERT INTO liturgical_calendar (event_key, date, year, locale, event_data)
VALUES ('${escapeString(event.event_key)}', '${dateOnly}', ${event.year}, '${locale}', '${eventDataJson}'::jsonb)
ON CONFLICT (event_key, date, locale) DO NOTHING;`
}

async function main() {
  const year = parseInt(process.argv[2] || '2025', 10)
  const locale = process.argv[3] || 'en_US'

  logInfo('Generating Global Liturgical Events Migration')
  logInfo('=' .repeat(60))
  logInfo(`Year: ${year}`)
  logInfo(`Locale: ${locale}`)
  logInfo('=' .repeat(60))

  try {
    const events = await fetchLiturgicalCalendar(year, locale)

    // Use local date to avoid timezone shift issues
    const now = new Date()
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    const migrationFile = `supabase/migrations/${timestamp}000002_seed_liturgical_calendar_${year}_${locale}.sql`

    let sql = `-- Seed liturgical_calendar table for year ${year} (locale: ${locale})
-- Generated from https://litcal.johnromanodorazio.com/api/v5/calendar/nation/US/${year}
-- Total events: ${events.length}
-- Generated on: ${new Date().toISOString()}

`

    for (const event of events) {
      sql += generateInsertStatement(event, locale) + '\n\n'
    }

    // Write to file
    const fs = require('fs')
    fs.writeFileSync(migrationFile, sql)

    logSuccess(`\nMigration file created: ${migrationFile}`)
    logInfo(`Total events: ${events.length}`)
    logInfo(`\nNext steps:`)
    logInfo(`   1. Review the migration file`)
    logInfo(`   2. Run: supabase db push`)

  } catch (error) {
    logError(`\nError: ${error}`)
    process.exit(1)
  }
}

main()
