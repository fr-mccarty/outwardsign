# Database Seeding

This document explains the seeding architecture and how to populate the database with data.

## Three Seeders

The system has three distinct seeders for different use cases:

| Seeder | Trigger | Purpose | Cleanup |
|--------|---------|---------|---------|
| **Dev Seeder** | `npm run db:fresh` | Complete reset for development | `db:fresh` resets all tables |
| **Onboarding Seeder** | Parish creation | Foundational data for new parishes | None (runs once) |
| **UI Demo Seeder** | Settings button | Demo parish with sample data | Cleans demo data first |

---

## What Each Seeder Creates

### Onboarding Data (Foundational)

Created when a new parish is onboarded. No individual/personal data.

| Data | Description |
|------|-------------|
| Groups | Parish Council, Finance Council, etc. |
| Group Roles | Leader, Member, Secretary, etc. |
| Event Types | Mass, Wedding, Funeral, Baptism, etc. |
| Locations | Church, Parish Hall, Funeral Home |
| Petition Templates | Default prayers for each module |
| Category Tags | Organization tags |
| Mass Times Templates | Sunday, Daily, Holiday schedules |
| Content | Prayers, instructions (not readings) |
| Event Presets | Religious Education, Staff Meeting, etc. |

### Demo Data (Sample Content)

Created by the UI Demo Seeder and Dev Seeder. Individual/personal data.

| Data | Count | Description |
|------|-------|-------------|
| People | 20 | Sample parishioners |
| Families | 15 | Family units with relationships |
| Group Memberships | 7 | People assigned to groups |
| Masses | 20 | Sunday + Daily Masses |
| Mass Intentions | 12 | Linked and standalone |
| Weddings | 1 | Fully populated with readings |
| Funerals | 1 | Fully populated with readings |
| Special Liturgies | 3+ | Baptisms, Quinceaneras, Presentations |

Plus JSONB data: parish settings, role quantities, custom lists, blackout dates, notifications, calendar visibility.

---

## Running Seeders

### 1. Dev Seeder (CLI)

**For development database reset:**

```bash
npm run db:fresh -- -y
```

This command:
1. Resets the database (truncates all tables)
2. Applies migrations
3. Runs the dev seeder which:
   - Creates storage buckets
   - Creates dev user and parish
   - Runs **Onboarding Seeder** (foundational data)
   - Runs **Demo Seeder** (sample content)
   - Creates dev user person record
   - Uploads avatar images

### 2. Onboarding Seeder

**Runs automatically when a parish is created.**

Code location: `src/lib/onboarding-seeding/parish-seed-data.ts`

Called by:
- `createParishWithSuperAdmin()` during onboarding flow
- `createParish()` server action
- Dev seeder

### 3. UI Demo Seeder

**For creating a demo parish to share with others:**

Navigate to **Settings > Developer Tools** and click "Seed Sample Data".

This:
1. **Cleans up** existing demo data (people, families, events, etc.)
2. **Seeds fresh** demo data

Can be pressed multiple times - always results in a fresh set of demo data.

Code location: `src/lib/actions/seed-data.ts`

---

## Architecture

```
src/lib/seeding/                    # Shared seeding module (demo data)
├── index.ts                        # Public exports
├── types.ts                        # Shared types
├── sample-data.ts                  # Sample data arrays
├── seed-functions.ts               # Individual seed functions
├── run-seeders.ts                  # Orchestrator for demo seeding
└── cleanup.ts                      # Cleanup function for UI seeder

src/lib/onboarding-seeding/         # Onboarding seeding module (foundational data)
├── parish-seed-data.ts             # Main orchestrator
├── groups-seed.ts                  # Groups
├── event-types-seed.ts             # Event types
├── locations-seed.ts               # Locations
├── content-seed.ts                 # Content (prayers, readings)
└── ...                             # Other seed files

scripts/
├── dev-seed.ts                     # Dev seeder entry point
└── dev-seeders/                    # Dev-specific functions (avatars)

src/lib/actions/
└── seed-data.ts                    # UI demo seeder (server action)
```

---

## Data Preservation

### Preserved (Never Deleted by Cleanup)

**Infrastructure:**
- `parishes`
- `parish_users`

**Onboarding Data:**
- `groups`, `group_roles`
- `event_types`, `input_field_definitions`
- `scripts`, `script_sections`
- `locations`
- `petition_templates`
- `category_tags`
- `mass_times_templates`, `mass_times_template_items`
- `contents`
- `event_presets`

### Deleted by Cleanup (Demo Data)

- `people`, `families`, `family_members`
- `group_members`
- `parish_events`, `calendar_events`
- `people_event_assignments`
- `mass_intentions`
- `person_blackout_dates`
- `parishioner_notifications`

---

## Adding New Seeders

### For Demo Data

Update `src/lib/seeding/run-seeders.ts`:

```typescript
// 1. Import your function
import { seedMyNewThing } from './seed-functions'

// 2. Update SeederCounts interface
export interface SeederCounts {
  // ... existing
  myNewThingCount: number
}

// 3. Call in runAllSeeders()
const { itemsCreated } = await seedMyNewThing(ctx, people)
```

### For Onboarding Data

Update `src/lib/onboarding-seeding/parish-seed-data.ts`:

```typescript
// Add your seeding function call
await seedMyNewFoundationalThing(supabase, parishId)
```

### For Cleanup

If your new demo data needs cleanup, update `src/lib/seeding/cleanup.ts`:

```typescript
// Add delete in correct FK order
await supabase
  .from('my_new_table')
  .delete()
  .eq('parish_id', parishId)
```

---

## Sample Data Location

All sample data arrays are in `src/lib/seeding/sample-data.ts`:

```typescript
export const SAMPLE_PEOPLE: SamplePerson[] = [...]
export const SAMPLE_FAMILIES: FamilyDefinition[] = [...]
export const ENTRANCE_HYMNS = [...]
export const INTENTION_TEXTS = [...]
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Group memberships = 0 | Ensure onboarding ran first (creates groups/roles) |
| FK violations | Run `npm run db:fresh -- -y` to fully reset |
| UI seeder fails | Check browser console for server action errors |
| Duplicate data | UI seeder now cleans first; for dev use `db:fresh` |
| Missing avatars | Avatars only work in dev seeder (requires Node.js fs) |

---

## Console Logging

All seeder output must use helpers from `src/lib/utils/console.ts`:

```typescript
import { logSuccess, logWarning, logError, logInfo } from '@/lib/utils/console'

logInfo('Creating sample data...')
logSuccess('Created 25 people')
logWarning('Skipping duplicate')
logError('Failed to create')
```
