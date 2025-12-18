# Database Seeding

This document explains how to populate the database with sample data for testing and development.

## Overview

The seed scripts create comprehensive sample data for testing and development purposes. These scripts are **NOT** part of the migration system and must be run manually.

## Console Helper Functions

**CRITICAL:** All seeder AND server action console output MUST use the helper functions from `src/lib/utils/console.ts`. Direct use of `console.log()` is prohibited in seeder files and server actions.

**Scope:** These helper functions are used by:
- Database seed scripts (when written in TypeScript)
- Server actions (for user-facing operation feedback)
- Migration output and logging
- Batch operations where consistent formatting is critical

### Available Functions

```typescript
import { logSuccess, logWarning, logError, logInfo } from '@/lib/utils/console'

// Success messages (prefixed with [OK])
logSuccess('Created 5 users')

// Warning messages (prefixed with ⚠️)
logWarning('No existing groups found, creating defaults')

// Error messages (prefixed with ❌)
logError('Failed to create parish')

// Info messages (no prefix - for section headers)
logInfo('Creating sample locations...')
```

### Character Validation

All console helper functions enforce strict character validation:

**Allowed characters:**
- Letters: a-z, A-Z
- Numbers: 0-9
- Spanish accented characters: ñÑáéíóúÁÉÍÓÚüÜ
- Whitespace: space, newline (\n), carriage return (\r), tab (\t)
- All standard keyboard symbols: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~

**Prohibited characters:**
- Emojis and other unicode symbols (except ⚠️ and ❌ which are added by the helper functions themselves)

**If prohibited characters are detected, the function will throw an error and halt execution.**

### Usage Patterns

```typescript
// Section headers
logInfo('Creating sample people...')

// Success with counts
logSuccess('Created 25 people')

// Errors with context
logError('Failed to create location: No parish found')

// Warnings for non-critical issues
logWarning('Skipping duplicate record')
```

### Output Format Rules

1. **Section Headers** - Use `logInfo()` with plain descriptive text
2. **Success Messages** - Use `logSuccess()` with counts and details (prefixed with `[OK]`)
3. **Warnings** - Use `logWarning()` for non-critical issues (prefixed with ⚠️)
4. **Errors** - Use `logError()` for critical failures (prefixed with ❌)

**Why These Rules:**
- Consistent, professional output across all seeders and server actions
- Strict validation prevents emoji/unicode creep in user messages
- Easy to scan for success/failure (prefixes clearly indicate status)
- Makes logs easier to parse programmatically
- Reduces visual noise
- Spanish characters are allowed for bilingual support

## Prerequisites

Before running seed scripts:

1. Ensure your database migrations are up to date:
   ```bash
   supabase db push
   ```

2. Ensure at least one parish exists in the database. The seed script will fail if no parish is found.

## Running Seed Scripts

To execute the seed script, use the Supabase CLI:

```bash
supabase seed
```

This command reads the seed configuration from `supabase/config.toml` and runs the specified SQL files.

### What the Seed Script Creates

The `seed_modules.sql` script creates one fully populated record for each primary module:

- **25 People** - Including bride, groom, deceased, family contacts, presiders, musicians, readers, etc.
- **3 Locations** - Church, reception hall, funeral home
- **12 Events** - Wedding, funeral, baptism, presentation, mass, and related events
- **11 Readings** - Liturgical readings for marriage, funeral, and baptism
- **7 Module Records**:
  - 1 Wedding (fully populated with all relationships)
  - 1 Funeral (fully populated)
  - 1 Quinceañera (fully populated)
  - 1 Baptism (fully populated)
  - 1 Presentation (fully populated)
  - 1 Mass (fully populated)
  - 1 Mass Intention (linked to the mass)

## Important Notes

- **Development Only**: Seed scripts are intended for development and testing environments only
- **Not Idempotent**: Running the seed script multiple times will create duplicate data
- **Parish Required**: The script uses the first parish found in the database
- **Manual Execution**: These scripts are intentionally separated from migrations to prevent accidental execution in production

## Creating Additional Seed Scripts

When creating new seed scripts:

1. Place them in the `supabase/seeds/` directory
2. Use descriptive names (e.g., `seed_readings.sql`, `seed_test_users.sql`)
3. Add the script path to `supabase/config.toml` under `[db.seed]` → `sql_paths`
4. Document the script's purpose in this file
5. Make sure scripts handle missing dependencies gracefully with appropriate error messages

## Troubleshooting

If the seed script fails:

1. **No parish found**: Create a parish first through the application or via SQL
2. **Foreign key violations**: Ensure all migrations have been run successfully
3. **Permission errors**: Check that you're connected to the correct Supabase project

## Viewing Results

After running the seed script, check the terminal output for:
- Parish ID being used
- Count of records created in each category
- IDs of the created module records

You can verify the data in your Supabase dashboard or by querying the database directly.
