#!/usr/bin/env tsx

/**
 * Reset Database Script
 *
 * ⚠️  DESTRUCTIVE OPERATION ⚠️
 *
 * This script will:
 * 1. Delete all users from auth.users
 * 2. Drop and recreate the public schema
 * 3. Clear migration history
 *
 * Usage:
 *   npm run db:reset
 *   tsx scripts/reset-database.ts
 *
 * This will completely wipe your database. Use with caution!
 */

import { config } from 'dotenv'
import { execSync } from 'child_process'
import * as readline from 'readline'

// Load environment variables from .env.local
config({ path: '.env.local' })

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL!

if (!SUPABASE_URL || !SUPABASE_DB_URL) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_DB_URL')
  console.error('')
  console.error('⚠️  AUTHORIZATION REQUIRED:')
  console.error('   This script requires a direct database connection URL to perform')
  console.error('   destructive database operations.')
  console.error('')
  console.error('   Without the database URL, you are NOT authorized to:')
  console.error('   • Delete users from auth.users')
  console.error('   • Drop the public schema')
  console.error('   • Clear migration history')
  console.error('')
  console.error('💡 How to fix:')
  console.error('   1. Go to your Supabase project dashboard')
  console.error('   2. Navigate to Settings > Database')
  console.error('   3. Copy the "Connection string" (URI format)')
  console.error('   4. Add it to your .env.local file:')
  console.error('      SUPABASE_DB_URL=postgresql://postgres:[password]@[host]:5432/postgres')
  console.error('')
  console.error('   Note: Use the connection pooler URL for better performance')
  console.error('')
  process.exit(1)
}

/**
 * Prompt user for confirmation
 */
function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes')
    })
  })
}

/**
 * Execute SQL via psql
 */
function executeSQL(sql: string, description: string): boolean {
  console.log(`\n📝 ${description}...`)

  try {
    // Execute SQL using psql
    execSync(`psql "${SUPABASE_DB_URL}" -c "${sql.replace(/"/g, '\\"')}"`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    })

    console.log(`   ✅ ${description} completed`)
    return true
  } catch (err: any) {
    // Extract error message from stderr if available
    const errorMsg = err.stderr || err.message || 'Unknown error'
    console.error(`   ❌ ${description} failed:`, errorMsg.split('\n')[0])
    return false
  }
}

/**
 * Reset the database
 */
async function resetDatabase() {
  console.log('\n🗑️  Starting Database Reset...')
  console.log('=' .repeat(60))

  const steps = [
    {
      description: 'Deleting all users from auth.users',
      sql: 'DELETE FROM auth.users;'
    },
    {
      description: 'Dropping public schema',
      sql: 'DROP SCHEMA IF EXISTS public CASCADE;'
    },
    {
      description: 'Creating public schema',
      sql: 'CREATE SCHEMA public;'
    },
    {
      description: 'Granting permissions to postgres role',
      sql: 'GRANT ALL ON SCHEMA public TO postgres;'
    },
    {
      description: 'Granting permissions to public role',
      sql: 'GRANT ALL ON SCHEMA public TO public;'
    },
    {
      description: 'Clearing migration history',
      sql: 'DELETE FROM supabase_migrations.schema_migrations;'
    }
  ]

  let successCount = 0
  let failCount = 0

  for (const step of steps) {
    const success = executeSQL(step.sql, step.description)
    if (success) {
      successCount++
    } else {
      failCount++
    }
  }

  console.log('\n' + '=' .repeat(60))
  console.log('📊 Reset Summary:')
  console.log('=' .repeat(60))
  console.log(`✅ Successful steps: ${successCount}/${steps.length}`)
  console.log(`❌ Failed steps: ${failCount}/${steps.length}`)
  console.log('=' .repeat(60))

  if (failCount > 0) {
    console.log('\n⚠️  Database reset completed with errors')
    console.log('\n💡 Note: Some errors may be expected (e.g., if migration table doesn\'t exist yet)')
    return false
  } else {
    console.log('\n✅ Database reset completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Run: supabase db push')
    console.log('   2. Run: npm run seed (optional)')
    return true
  }
}

/**
 * Main function
 */
async function main() {
  console.log('⚠️  DATABASE RESET SCRIPT ⚠️')
  console.log('=' .repeat(60))
  console.log('This will PERMANENTLY DELETE:')
  console.log('  • All users')
  console.log('  • All data in the public schema')
  console.log('  • All tables, functions, and policies')
  console.log('  • Migration history')
  console.log('=' .repeat(60))
  console.log(`\nTarget: ${SUPABASE_URL}`)
  console.log('')

  // Check if psql is installed
  try {
    execSync('psql --version', { stdio: 'pipe' })
  } catch (err) {
    console.error('❌ psql not found!')
    console.error('   Please install PostgreSQL client tools:')
    console.error('   - macOS: brew install postgresql')
    console.error('   - Ubuntu/Debian: apt-get install postgresql-client')
    console.error('   - Windows: Download from https://www.postgresql.org/download/')
    process.exit(1)
  }

  // Require explicit confirmation
  const confirmed = await askConfirmation('Type "yes" to confirm this destructive operation: ')

  if (!confirmed) {
    console.log('\n❌ Operation cancelled by user')
    process.exit(0)
  }

  // Final warning
  console.log('\n⚠️  Last chance to cancel! Starting in 3 seconds...')
  await new Promise(resolve => setTimeout(resolve, 3000))

  try {
    const success = await resetDatabase()
    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

main()
