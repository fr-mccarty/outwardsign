# Database Seeding

This document explains how to populate the database with sample data for testing and development.

## Overview

The seeding system uses a **shared module** that provides consistent sample data for both development and production environments. Both the dev seeder (CLI) and the UI seeder (Settings button) use the exact same code.

## Architecture

```
src/lib/seeding/                    # Shared seeding module
├── index.ts                        # Public exports
├── types.ts                        # Shared types (SeederContext, CreatedPerson, etc.)
├── sample-data.ts                  # Sample data arrays (people, families, hymns)
├── seed-functions.ts               # Individual seed functions
└── run-seeders.ts                  # ⭐ ORCHESTRATOR - single source of truth

scripts/
├── dev-seed.ts                     # Dev seeder entry point (calls shared module)
└── dev-seeders/
    ├── index.ts                    # Re-exports + dev-specific functions
    ├── seed-people.ts              # Dev-only: avatars, dev user person
    └── types.ts                    # Dev-specific types

src/lib/actions/
└── seed-data.ts                    # Production seeder (server action)
```

## Running Seeders

### Development Seeder (CLI)

```bash
npm run seed:dev
```

This runs the full development seeder which:
1. Creates storage buckets
2. Creates/finds dev user and parish
3. Runs onboarding seeding (production parish data)
4. Runs shared seeders (from `src/lib/seeding/`)
5. Creates dev user person record with portal access
6. Uploads avatar images (dev-only, requires Node.js fs)

### Production Seeder (UI)

Navigate to **Settings > Developer Tools** and click the "Seed Sample Data" button.

This runs the same shared seeders as the dev seeder, minus:
- Avatar uploads (not supported in server actions)
- Dev user person creation (dev-only)

## What Gets Seeded

### Core Data
| Data | Count | Description |
|------|-------|-------------|
| People | 20 | Sample parishioners with varied demographics |
| Families | 15 | Family units with members and relationships |
| Group Memberships | 7 | People assigned to ministry groups |
| Masses | 20 | 8 Sunday Masses + 12 Daily Masses |
| Mass Intentions | 12 | Linked and standalone intentions |
| Weddings | 1 | Fully populated with readings |
| Funerals | 1 | Fully populated with readings |

### Comprehensive Data (JSONB columns)
| Data | Description |
|------|-------------|
| Parish Settings | Quick amounts for donations and intentions |
| Mass Times Role Quantities | Minister requirements per Mass time |
| Custom Lists | Music styles, flower colors, venues, etc. |
| Person Blackout Dates | Unavailability periods |
| Parishioner Notifications | Sample ministry messages |
| Event Presets | Wedding, funeral, and Mass templates |
| Calendar Visibility | Public/private event settings |

## Adding New Seeders

When adding a new seeder, update **one file**: `src/lib/seeding/run-seeders.ts`

### Step 1: Create the Seed Function

Add your function to `src/lib/seeding/seed-functions.ts`:

```typescript
export async function seedMyNewThing(
  ctx: SeederContext,
  people: CreatedPerson[]  // if needed
): Promise<{ itemsCreated: number }> {
  const { supabase, parishId } = ctx

  // Your seeding logic here
  const { data, error } = await supabase
    .from('my_table')
    .insert([...])
    .select()

  return { itemsCreated: error ? 0 : (data?.length || 0) }
}
```

### Step 2: Add to Orchestrator

Update `src/lib/seeding/run-seeders.ts`:

```typescript
// 1. Import your function
import {
  // ... existing imports
  seedMyNewThing,
} from './seed-functions'

// 2. Update SeederCounts interface
export interface SeederCounts {
  // ... existing counts
  myNewThingCount: number
}

// 3. Call your function in runAllSeeders()
export async function runAllSeeders(...) {
  // ... existing seeders

  // ADD NEW SEEDERS HERE
  const { itemsCreated: myNewThingCount } = await seedMyNewThing(ctx, people)

  return {
    counts: {
      // ... existing counts
      myNewThingCount,
    }
  }
}
```

### Step 3: Export (Optional)

If you need direct access to the function, export it from `src/lib/seeding/index.ts`:

```typescript
export {
  // ... existing exports
  seedMyNewThing,
} from './seed-functions'
```

## Console Helper Functions

**CRITICAL:** All seeder console output MUST use helper functions from `src/lib/utils/console.ts`.

```typescript
import { logSuccess, logWarning, logError, logInfo } from '@/lib/utils/console'

logInfo('Creating sample data...')      // Section headers
logSuccess('Created 25 people')         // Success with counts (prefixed with [OK])
logWarning('Skipping duplicate')        // Non-critical issues (prefixed with ⚠️)
logError('Failed to create')            // Critical failures (prefixed with ❌)
```

### Character Validation

Console helpers enforce strict character validation:
- **Allowed:** Letters (a-z, A-Z), numbers, Spanish accents (ñÑáéíóúÁÉÍÓÚüÜ), whitespace, standard symbols
- **Prohibited:** Emojis and unicode symbols (except ⚠️ and ❌ added by helpers)

## Sample Data Location

All sample data is defined in `src/lib/seeding/sample-data.ts`:

```typescript
// People with varied demographics
export const SAMPLE_PEOPLE: SamplePerson[] = [...]

// Families with relationships
export const SAMPLE_FAMILIES: FamilyDefinition[] = [...]

// Hymn arrays for Masses
export const ENTRANCE_HYMNS = [...]
export const OFFERTORY_HYMNS = [...]
export const COMMUNION_HYMNS = [...]
export const RECESSIONAL_HYMNS = [...]

// Mass intention texts
export const INTENTION_TEXTS = [...]
```

## Important Notes

- **Development Only**: Seeders are for development/testing only
- **Not Idempotent**: Running multiple times creates duplicate data
- **Parish Required**: Both seeders require an existing parish
- **Shared Code**: Always update `run-seeders.ts` when adding seeders
- **Avatar Limitation**: Avatar uploads only work in dev seeder (requires Node.js fs)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No parish found | Create a parish first via onboarding or SQL |
| Foreign key violations | Run `npm run db:fresh` to reset and apply migrations |
| Permission errors | Check Supabase connection and service role key |
| Avatar upload fails | Verify image files exist in `public/team/` |
