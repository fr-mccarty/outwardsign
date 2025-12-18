#!/usr/bin/env tsx

/**
 * Master Seed Script
 *
 * Orchestrates all database seeding operations.
 * Run after migrations to populate the database with initial data.
 *
 * Usage:
 *   npm run seed
 */

import { execSync } from 'child_process'
import { logSuccess, logError, logInfo } from '../src/lib/utils/console'

logInfo('Starting Database Seeding...')
logInfo('=' .repeat(60))

interface Seeder {
  name: string
  command: string
  description: string
}

// List of all seeders to run
const seeders: Seeder[] = [
  {
    name: 'Liturgical Calendar 2025 (English)',
    command: 'tsx scripts/import-liturgical-events.ts --year=2025 --locale=en',
    description: 'Seed liturgical events for year 2025 from John Romano D\'Orazio API'
  },
  {
    name: 'Liturgical Calendar 2026 (English)',
    command: 'tsx scripts/import-liturgical-events.ts --year=2026 --locale=en',
    description: 'Seed liturgical events for year 2026 from John Romano D\'Orazio API'
  }
]

async function runSeeder(seeder: Seeder, index: number) {
  logInfo(`\n[${index + 1}/${seeders.length}] ${seeder.name}`)
  logInfo(`   ${seeder.description}`)
  logInfo(`   Command: ${seeder.command}`)
  logInfo('')

  try {
    execSync(seeder.command, {
      stdio: 'inherit', // Show output in real-time
      env: process.env
    })
    logSuccess(`   ${seeder.name} completed successfully`)
    return { success: true, seeder: seeder.name }
  } catch (error) {
    logError(`   ${seeder.name} failed`)
    return { success: false, seeder: seeder.name, error }
  }
}

async function main() {
  const results = []

  for (let i = 0; i < seeders.length; i++) {
    const result = await runSeeder(seeders[i], i)
    results.push(result)
  }

  // Summary
  logInfo('\n' + '=' .repeat(60))
  logInfo('Seeding Summary:')
  logInfo('=' .repeat(60))

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  logSuccess(`Successful: ${successful.length}/${seeders.length}`)
  if (successful.length > 0) {
    successful.forEach(r => logSuccess(`   ${r.seeder}`))
  }

  if (failed.length > 0) {
    logError(`\nFailed: ${failed.length}/${seeders.length}`)
    failed.forEach(r => logError(`   ${r.seeder}`))
  }

  logInfo('=' .repeat(60))

  if (failed.length > 0) {
    logError('\nSeeding completed with errors')
    process.exit(1)
  } else {
    logInfo('\nAll seeders completed successfully!')
    process.exit(0)
  }
}

main()
