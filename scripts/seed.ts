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

console.log('🌱 Starting Database Seeding...')
console.log('=' .repeat(60))

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
  console.log(`\n📦 [${index + 1}/${seeders.length}] ${seeder.name}`)
  console.log(`   ${seeder.description}`)
  console.log(`   Command: ${seeder.command}`)
  console.log('')

  try {
    execSync(seeder.command, {
      stdio: 'inherit', // Show output in real-time
      env: process.env
    })
    console.log(`   ✅ ${seeder.name} completed successfully`)
    return { success: true, seeder: seeder.name }
  } catch (error) {
    console.error(`   ❌ ${seeder.name} failed`)
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
  console.log('\n' + '=' .repeat(60))
  console.log('📊 Seeding Summary:')
  console.log('=' .repeat(60))

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  console.log(`✅ Successful: ${successful.length}/${seeders.length}`)
  if (successful.length > 0) {
    successful.forEach(r => console.log(`   ✓ ${r.seeder}`))
  }

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/${seeders.length}`)
    failed.forEach(r => console.log(`   ✗ ${r.seeder}`))
  }

  console.log('=' .repeat(60))

  if (failed.length > 0) {
    console.log('\n⚠️  Seeding completed with errors')
    process.exit(1)
  } else {
    console.log('\n🎉 All seeders completed successfully!')
    process.exit(0)
  }
}

main()
