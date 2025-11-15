# Migration Reset with Seed Data

## Overview
When resetting the database during development, you'll want to repopulate it with the same initial data that the onboarding process creates. This ensures a consistent development environment similar to what new users experience.

## The Onboarding Pattern

The onboarding process (`src/app/onboarding/page.tsx`) follows this pattern:

1. **Create Parish** - Uses `createParishWithSuperAdmin()` from `@/lib/auth/parish`
2. **Seed Initial Data** - Uses `populateInitialParishData(parishId)` from `@/lib/actions/setup`

## Key Functions in setup.ts

### `populateInitialParishData(parishId: string)`
**Location**: `src/lib/actions/setup.ts:553`

**What it does**:
- Seeds initial readings from the canonical library (`@/lib/data/readings`)
- Inserts readings with the parish_id
- Returns the created readings

**Usage**:
```typescript
import { populateInitialParishData } from '@/lib/actions/setup'

await populateInitialParishData(parishId)
```

## Recommended Workflow: Reset Migration with Seed Data

### Option 1: Manual Reset & Seed (Recommended for Development)

When you need to reset your local database after migration changes:

#### Step 1: Reset the Database
```bash
supabase db reset
```

This will:
- Drop all data
- Re-run all migrations from scratch
- Reset the database to a clean state

#### Step 2: Create Your Parish Through Onboarding
Instead of manually seeding, just go through the onboarding flow once:
1. Start the app: `npm run dev`
2. Navigate to `/onboarding`
3. Create your parish

This will automatically:
- Create the parish
- Set you as super-admin
- Seed initial readings via `populateInitialParishData()`

**Why this is better**:
- Tests the actual user flow
- Ensures onboarding works correctly
- Less manual work
- More realistic development environment

### Option 2: Create a Development Seed Script (Advanced)

If you frequently reset and want to automate the entire process, create a development seed script.

#### Create the Script
**File**: `scripts/dev-seed.ts`

```typescript
#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js'
import { readingsData } from '../src/lib/data/readings'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedDevData() {
  console.log('🌱 Seeding development data...')

  // Get the first user (you) from auth
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError || !users || users.length === 0) {
    console.error('No users found. Please sign up first.')
    process.exit(1)
  }

  const userId = users[0].id
  console.log(`👤 Found user: ${users[0].email}`)

  // Create test parish using the database function
  console.log('🏛️  Creating test parish...')
  const { data: result, error: parishError } = await supabase
    .rpc('create_parish_with_super_admin', {
      p_user_id: userId,
      p_name: 'Development Parish',
      p_city: 'Dev City',
      p_state: 'CA'
    })
    .single()

  if (parishError) {
    console.error('Error creating parish:', parishError)
    process.exit(1)
  }

  const typedResult = result as { success: boolean; error_message?: string; parish_id?: string }

  if (!typedResult.success || !typedResult.parish_id) {
    console.error('Failed to create parish:', typedResult.error_message)
    process.exit(1)
  }

  const parishId = typedResult.parish_id
  console.log(`✅ Parish created: ${parishId}`)

  // Seed readings (same as populateInitialParishData)
  console.log('📖 Seeding readings...')
  const readingsToInsert = readingsData.map((reading) => ({
    parish_id: parishId,
    pericope: reading.pericope,
    text: reading.text,
    categories: reading.categories,
    language: reading.language,
    introduction: reading.introduction ?? null,
    conclusion: reading.conclusion ?? null
  }))

  const { data: readings, error: readingsError } = await supabase
    .from('readings')
    .insert(readingsToInsert)
    .select()

  if (readingsError) {
    console.error('Error creating readings:', readingsError)
    process.exit(1)
  }

  console.log(`✅ ${readings?.length || 0} readings created`)

  // Optional: Seed sample data for groups
  console.log('👥 Seeding sample groups...')
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .insert([
      { parish_id: parishId, name: 'Lectors', description: 'Readers for liturgy', is_active: true },
      { parish_id: parishId, name: 'EMHC', description: 'Extraordinary Ministers of Holy Communion', is_active: true },
      { parish_id: parishId, name: 'Choir', description: 'Music ministry', is_active: true },
    ])
    .select()

  if (groupsError) {
    console.error('Error creating groups:', groupsError)
  } else {
    console.log(`✅ ${groups?.length || 0} groups created`)
  }

  // Optional: Seed sample people
  console.log('👤 Seeding sample people...')
  const { data: people, error: peopleError } = await supabase
    .from('people')
    .insert([
      {
        parish_id: parishId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '(555) 123-4567'
      },
      {
        parish_id: parishId,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone_number: '(555) 987-6543'
      },
      {
        parish_id: parishId,
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@example.com'
      },
    ])
    .select()

  if (peopleError) {
    console.error('Error creating people:', peopleError)
  } else {
    console.log(`✅ ${people?.length || 0} people created`)

    // Add some people to groups with roles
    if (groups && groups.length > 0 && people && people.length > 0) {
      console.log('🔗 Adding members to groups...')
      const { data: memberships, error: membershipsError } = await supabase
        .from('group_members')
        .insert([
          {
            group_id: groups[0].id,
            person_id: people[0].id,
            roles: ['LECTOR', 'CANTOR']
          },
          {
            group_id: groups[0].id,
            person_id: people[1].id,
            roles: ['LECTOR']
          },
          {
            group_id: groups[1].id,
            person_id: people[2].id,
            roles: ['EMHC']
          },
        ])

      if (membershipsError) {
        console.error('Error creating memberships:', membershipsError)
      } else {
        console.log(`✅ Group memberships created`)
      }
    }
  }

  console.log('')
  console.log('🎉 Development seeding complete!')
  console.log('=' .repeat(60))
  console.log(`Parish ID: ${parishId}`)
  console.log(`User: ${users[0].email}`)
  console.log('=' .repeat(60))
}

seedDevData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })
```

#### Add Script to package.json
```json
{
  "scripts": {
    "seed:dev": "tsx scripts/dev-seed.ts"
  }
}
```

#### Usage
```bash
# Reset database and run migrations
supabase db reset

# Seed development data
npm run seed:dev
```

## Pattern for Adding New Seed Data

When you add new modules that need seed data, follow this pattern:

### 1. Create a Data File (if needed)
**Example**: `src/lib/data/sample-groups.ts`
```typescript
export const sampleGroupsData = [
  {
    name: 'Lectors',
    description: 'Readers for liturgy',
    is_active: true
  },
  {
    name: 'EMHC',
    description: 'Extraordinary Ministers of Holy Communion',
    is_active: true
  },
]
```

### 2. Add to populateInitialParishData (if all users need it)
**File**: `src/lib/actions/setup.ts`

```typescript
export async function populateInitialParishData(parishId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  try {
    // Existing: Seed readings
    const readingsToInsert = readingsData.map((reading) => ({
      parish_id: parishId,
      // ... existing code
    }))

    const { data: readings, error: readingsError } = await supabase
      .from('readings')
      .insert(readingsToInsert)
      .select()

    if (readingsError) {
      console.error('Error creating readings:', readingsError)
      throw new Error(`Failed to create readings: ${readingsError.message}`)
    }

    // NEW: Seed sample groups (if needed for all users)
    const groupsToInsert = sampleGroupsData.map((group) => ({
      parish_id: parishId,
      ...group
    }))

    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .insert(groupsToInsert)
      .select()

    if (groupsError) {
      console.error('Error creating groups:', groupsError)
      // Don't throw - groups are optional
    }

    return {
      success: true,
      readings: readings || [],
      groups: groups || []
    }
  } catch (error) {
    console.error('Error populating initial parish data:', error)
    throw error
  }
}
```

### 3. Or Keep It Development-Only
If the seed data is just for development (like sample people with test data), keep it in the `scripts/dev-seed.ts` file instead of `populateInitialParishData()`.

## Important Notes

### ⚠️ DO NOT Seed in Migrations
Never put seed data directly in migration files. Migrations should only contain schema changes (DDL):
- ✅ CREATE TABLE
- ✅ ALTER TABLE
- ✅ CREATE INDEX
- ❌ INSERT data (except reference data like roles/statuses that are part of the schema)

### When to Use Which Approach

**Use `populateInitialParishData()` for**:
- Essential reference data that ALL parishes need
- Canonical liturgical readings
- Required configurations

**Use `scripts/dev-seed.ts` for**:
- Development test data
- Sample records for testing
- Data that real users won't need

**Use onboarding flow for**:
- One-time parish setup
- User-specific initial configuration
- Production environments

## Summary

**Quick Reset & Development**:
```bash
# 1. Reset database
supabase db reset

# 2. Either go through onboarding in browser
# OR run development seed script
npm run seed:dev
```

This gives you a clean database with realistic seed data, matching what new users would experience through onboarding.
