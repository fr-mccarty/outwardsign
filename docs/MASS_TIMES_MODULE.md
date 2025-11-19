# Mass Times Module

## Overview

The Mass Times module manages recurring mass schedules for a parish. It provides internal scheduling functionality for customizable mass types without auto-creating individual mass records.

**Purpose:** Internal scheduling only - defines when masses occur regularly
**Module Path:** `/mass-times`
**Permission Required:** `masses` module access
**Database Tables:** `mass_times`, `mass_types`

---

## Table of Contents

- [Database Schema](#database-schema)
- [Mass Types (Customizable)](#mass-types-customizable)
- [Schedule Items Structure](#schedule-items-structure)
- [Key Features](#key-features)
- [File Structure](#file-structure)
- [Server Actions](#server-actions)
- [UI Components](#ui-components)
- [Navigation](#navigation)
- [Use Cases](#use-cases)
- [Related Modules](#related-modules)

---

## Database Schema

### Mass Types Table

**Table:** `mass_types`

```sql
CREATE TABLE mass_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,

  -- Type identification
  key TEXT NOT NULL, -- 'WEEKEND', 'DAILY', 'HOLIDAY', 'SPECIAL', or custom key

  -- Multilingual labels
  label_en TEXT NOT NULL,
  label_es TEXT NOT NULL,

  -- Optional metadata
  description TEXT,
  color TEXT, -- Hex color for UI display
  display_order INTEGER DEFAULT 0, -- Sort order in dropdowns

  -- Status
  active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false, -- System types cannot be deleted

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(parish_id, key)
);
```

**Default Mass Types (Seeded for all parishes):**
- WEEKEND - Weekend masses (Saturday vigil and Sunday)
- DAILY - Weekday masses
- HOLIDAY - Special liturgical days and holy days
- SPECIAL - One-time or seasonal masses

**Mass Types Indexes:**
- `idx_mass_types_parish_id` - Filter by parish
- `idx_mass_types_active` - Filter active/inactive types
- `idx_mass_types_display_order` - Sort order

**Mass Types RLS Policies:**
- **SELECT:** Users can view mass types from their parish
- **INSERT/UPDATE:** Staff and above can create/edit mass types
- **DELETE:** Staff and above can delete non-system mass types (cannot delete system types or types in use)

### Mass Times Table

**Table:** `mass_times`

```sql
CREATE TABLE mass_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,

  -- Schedule configuration
  mass_type_id UUID NOT NULL REFERENCES mass_types(id) ON DELETE RESTRICT,
  schedule_items JSONB NOT NULL, -- [{"day": "SUNDAY", "time": "09:00"}]

  -- Mass details
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'en', -- 'en', 'es', 'la'
  special_designation TEXT, -- 'Youth Mass', 'Family Mass', etc.

  -- Scheduling period
  effective_start_date DATE, -- When schedule begins (null = always active)
  effective_end_date DATE,   -- When schedule ends (null = no end date)

  -- Status and metadata
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Mass Times Indexes:**
- `idx_mass_times_parish_id` - Filter by parish
- `idx_mass_times_mass_type_id` - Filter by mass type
- `idx_mass_times_location_id` - Filter by location
- `idx_mass_times_active` - Filter active/inactive schedules
- `idx_mass_times_effective_dates` - Query by effective date ranges

**Mass Times RLS Policies:**
- **SELECT:** Users can view mass times from their parish
- **INSERT/UPDATE/DELETE:** Staff and above (admin, staff, ministry-leader roles)

---

## Mass Types (Customizable)

Mass types are **fully customizable** by each parish. The system provides four default types, but parishes can create their own custom types as needed.

### Default Mass Types

These default types are automatically seeded for all parishes and cannot be deleted (marked as `is_system: true`):

| Key | English Label | Spanish Label | Description |
|-----|---------------|---------------|-------------|
| WEEKEND | Weekend | Fin de Semana | Saturday vigil and Sunday masses |
| DAILY | Daily | Diaria | Weekday masses |
| HOLIDAY | Holiday | Día Festivo | Special liturgical days and holy days |
| SPECIAL | Special | Especial | One-time or seasonal masses |

### Custom Mass Types

Parishes can create unlimited custom mass types with:
- **Bilingual Labels:** English and Spanish labels
- **Description:** Optional description of the mass type
- **Color:** Optional hex color for UI display
- **Display Order:** Custom sort order in dropdowns
- **Active Status:** Enable/disable types without deletion

**Examples of Custom Types:**
- Youth Mass
- Family Mass
- Traditional Latin Mass
- Healing Mass
- Adoration & Benediction
- Bilingual Mass

### Mass Type Management

**Access:** `/mass-types` (under Mass Scheduling in sidebar)

**Features:**
- Create, edit, and delete custom mass types
- Cannot delete system types (WEEKEND, DAILY, HOLIDAY, SPECIAL)
- Cannot delete types that are currently in use by mass times
- Inline creation from MassTypePicker component

### MassTypePicker Component

The `MassTypePicker` component allows creating mass types on the fly:
- Select from existing mass types
- Click "+ Create Mass Type" to add new types inline
- Newly created types are automatically selected
- No need to leave the mass times form

---

## Schedule Items Structure

Schedule items are stored as JSONB arrays with day and time pairs:

```typescript
interface ScheduleItem {
  day: DayOfWeek  // 'SUNDAY', 'MONDAY', 'TUESDAY', etc.
  time: string    // HH:MM format (24-hour)
}

// Example: Weekend schedule
[
  { "day": "SATURDAY", "time": "17:00" },  // 5:00 PM vigil
  { "day": "SUNDAY", "time": "08:00" },    // 8:00 AM
  { "day": "SUNDAY", "time": "10:00" },    // 10:00 AM
  { "day": "SUNDAY", "time": "12:00" }     // 12:00 PM
]

// Example: Daily schedule
[
  { "day": "MONDAY", "time": "08:00" },
  { "day": "TUESDAY", "time": "08:00" },
  { "day": "WEDNESDAY", "time": "08:00" },
  { "day": "THURSDAY", "time": "08:00" },
  { "day": "FRIDAY", "time": "08:00" }
]
```

**Shared Constants:**
- `DAYS_OF_WEEK_VALUES` - Array of day constants
- `DAYS_OF_WEEK_LABELS` - Bilingual day labels (en/es)

---

## Key Features

### 1. Schedule Management

- **Multiple Schedule Items:** Add/remove day and time pairs dynamically
- **Flexible Timing:** Different times for different days
- **Schedule Types:** Organize by weekend, daily, holiday, or special
- **Effective Dates:** Optional start and end dates for seasonal schedules

### 2. Mass Details

- **Location:** Optional location assignment (links to Locations module)
- **Language:** Support for English (en), Spanish (es), Latin (la)
- **Special Designation:** Custom labels (Youth Mass, Family Mass, Traditional Latin Mass)
- **Active Status:** Enable/disable schedules without deletion
- **Notes:** Internal notes for staff

### 3. Filtering and Search

- **Search:** Search by special designation and notes
- **Filter by Schedule Type:** WEEKEND, DAILY, HOLIDAY, SPECIAL
- **Filter by Language:** English, Spanish, Latin
- **Filter by Active Status:** Show active, inactive, or all

### 4. Statistics

List page displays:
- Total mass times
- Active mass times
- Weekend schedules
- Daily schedules

---

## File Structure

The Mass Times module follows the standard 9-file module pattern:

```
src/app/(main)/mass-times/
├── page.tsx                              # 1. List Page (Server)
├── mass-times-list-client.tsx            # 2. List Client
├── mass-time-form-wrapper.tsx            # 6. Form Wrapper (Client)
├── mass-time-form.tsx                    # 7. Unified Form (Client)
├── create/
│   └── page.tsx                         # 3. Create Page (Server)
└── [id]/
    ├── page.tsx                         # 4. View Page (Server)
    ├── mass-time-view-client.tsx        # 8. View Client
    ├── mass-time-form-actions.tsx       # 9. Form Actions (Client)
    └── edit/
        └── page.tsx                     # 5. Edit Page (Server)
```

**See:** [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md) for detailed file patterns.

---

## Server Actions

### Mass Times Actions

**File:** `src/lib/actions/mass-times.ts`

| Function | Purpose | Permission | Returns |
|----------|---------|------------|---------|
| `getMassTimes(filters?)` | Fetch all mass times with optional filters | Read | `MassTime[]` |
| `getMassTimesPaginated(params?)` | Fetch paginated mass times with relations | Read | `PaginatedResult<MassTimeWithRelations>` |
| `getMassTime(id)` | Fetch single mass time by ID | Read | `MassTime \| null` |
| `getMassTimeWithRelations(id)` | Fetch mass time with mass_type and location | Read | `MassTimeWithRelations \| null` |
| `createMassTime(data)` | Create new mass time | Write (staff+) | `MassTime` |
| `updateMassTime(id, data)` | Update existing mass time | Write (staff+) | `MassTime` |
| `deleteMassTime(id)` | Delete mass time | Write (staff+) | `void` |

**Mass Times Types:**

```typescript
interface MassTime {
  id: string
  parish_id: string
  mass_type_id: string  // References mass_types table
  schedule_items: ScheduleItem[]
  location_id: string | null
  language: LiturgicalLanguage
  special_designation: string | null
  effective_start_date: string | null
  effective_end_date: string | null
  active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

interface MassTimeWithRelations extends MassTime {
  mass_type?: MassType | null  // Includes mass type details
  location?: Location | null
}

interface ScheduleItem {
  day: DayOfWeek
  time: string // HH:MM format
}
```

**Mass Times Filter Parameters:**

```typescript
interface MassTimeFilterParams {
  search?: string
  mass_type_id?: string | 'all'  // Filter by mass type ID
  language?: LiturgicalLanguage | 'all'
  active?: boolean
}
```

### Mass Types Actions

**File:** `src/lib/actions/mass-types.ts`

| Function | Purpose | Permission | Returns |
|----------|---------|------------|---------|
| `getMassTypes()` | Fetch active mass types for dropdown | Read | `MassType[]` |
| `getAllMassTypes()` | Fetch all mass types (including inactive) | Read | `MassType[]` |
| `getMassType(id)` | Fetch single mass type by ID | Read | `MassType \| null` |
| `createMassType(data)` | Create new mass type | Write (staff+) | `MassType` |
| `updateMassType(id, data)` | Update existing mass type | Write (staff+) | `MassType` |
| `deleteMassType(id)` | Delete mass type (if not in use and not system) | Write (staff+) | `void` |

**Mass Types Type:**

```typescript
interface MassType {
  id: string
  parish_id: string
  key: string  // Unique key within parish (e.g., 'WEEKEND', 'YOUTH_MASS')
  label_en: string
  label_es: string
  description: string | null
  color: string | null  // Hex color (e.g., '#3b82f6')
  display_order: number
  active: boolean
  is_system: boolean  // System types cannot be deleted
  created_at: string
  updated_at: string
}
```

**Delete Protection:**
- Cannot delete mass types with `is_system: true`
- Cannot delete mass types currently in use by mass times
- Throws error with appropriate message if deletion is blocked

---

## UI Components

### List View

**Component:** `MassTimesListClient`

- **Search:** Filter by special designation and notes
- **Filters:** Schedule type, language, active status
- **Stats:** Total, active, weekend, daily counts
- **Grid:** Responsive card grid (1/2/3 columns)
- **Empty State:** Prompt to create first mass time

**Card Display:**
- Schedule type label
- Schedule items (day and time)
- Language
- Special designation (if set)
- Inactive badge (if not active)

### Form View

**Component:** `MassTimeForm`

Dynamic schedule items management:
- Add new time slots with + button
- Remove time slots with X button
- Day selector (dropdown)
- Time picker (HTML5 time input)
- Minimum one schedule item required

**Form Sections:**

1. **Schedule Information**
   - Mass type picker (with inline creation)
   - Schedule items (dynamic array)

2. **Mass Details**
   - Location picker (optional)
   - Language selector
   - Special designation (text input)

3. **Effective Period**
   - Start date (optional)
   - End date (optional)

4. **Status and Notes**
   - Active checkbox
   - Internal notes (textarea)

**MassTypePicker Integration:**
- Displays all active mass types in dropdown
- "+ Create Mass Type" button opens inline dialog
- Create new mass types without leaving the form
- Newly created types are automatically selected

### View Page

**Component:** `MassTimeViewClient`

Displays:
- Mass type label (from mass_type relation)
- Language
- Schedule items with day badges
- Location (if set)
- Special designation (if set)
- Effective period (if set)
- Notes (if set)
- Inactive badge (if not active)

**Actions:**
- Copy Info (copies mass type and schedule details to clipboard)
- Edit
- Delete (with confirmation dialog)

### Mass Types Management

**Components:** `MassTypesListClient` + `MassTypeFormDialog`

**Page:** `/mass-types` (under Mass Scheduling in sidebar)

**Features:**
- Dialog-based editing (no separate pages)
- Create, edit, delete mass types inline
- System badge for default types
- Cannot delete system types or types in use
- Color picker for custom colors
- Display order for sorting
- Active/inactive status

**Display:**
- Mass type cards with labels (English/Spanish)
- System types highlighted
- Active/inactive indicators
- Edit and delete actions per card

---

## Navigation

**Sidebar Section:** "Mass Scheduling" (separate collapsible section)
**Icon:** Clock (lucide-react)
**Permission:** `masses` module access

**Navigation Items:**
- Our Mass Times → `/mass-times`
- Mass Types → `/mass-types`
- Templates → `/mass-role-templates` (mass role templates)

**Note:** Mass Types was added as a separate navigation item to allow managing custom mass types without creating a mass time.

---

## Use Cases

### 1. Regular Weekend Schedule

Create a Weekend mass time with Saturday vigil and multiple Sunday masses:

```
Mass Type: Weekend (default system type)
Schedule Items:
  - Saturday 17:00 (5:00 PM vigil)
  - Sunday 08:00 (8:00 AM)
  - Sunday 10:00 (10:00 AM)
  - Sunday 12:00 (12:00 PM)
Location: Main Church
Language: English
Active: Yes
```

### 2. Spanish Mass

Create a Weekend mass time for Spanish language mass:

```
Mass Type: Weekend (default system type)
Schedule Items:
  - Sunday 13:30 (1:30 PM)
Location: Main Church
Language: Spanish
Special Designation: Spanish Mass
Active: Yes
```

### 2a. Custom Youth Mass Type

First, create a custom mass type:
```
Navigate to /mass-types
Click "+ New Mass Type"
English Label: Youth Mass
Spanish Label: Misa de Jóvenes
Description: Weekly mass for young adults
Color: #3b82f6 (blue)
Display Order: 5
```

Then create a mass time using the custom type:
```
Mass Type: Youth Mass (custom type)
Schedule Items:
  - Sunday 18:00 (6:00 PM)
Location: Youth Center
Language: English
Special Designation: Contemporary Music
Active: Yes
```

### 3. Daily Mass Schedule

Create a Daily mass time for weekday masses:

```
Mass Type: Daily (default system type)
Schedule Items:
  - Monday 08:00
  - Tuesday 08:00
  - Wednesday 08:00
  - Thursday 08:00
  - Friday 08:00
Location: Chapel
Language: English
Active: Yes
```

### 4. Traditional Latin Mass with Custom Type

First, create a custom mass type for Traditional Latin Mass:
```
Navigate to /mass-types or use MassTypePicker inline creation
English Label: Traditional Latin Mass
Spanish Label: Misa Tradicional en Latín
Description: Extraordinary Form of the Roman Rite
Display Order: 10
```

Then create the mass time:
```
Mass Type: Traditional Latin Mass (custom type)
Schedule Items:
  - Sunday 07:00
Location: Side Chapel
Language: Latin
Active: Yes
```

### 5. Summer Schedule

Create a Special mass time with effective dates for summer:

```
Mass Type: Special (default system type)
Schedule Items:
  - Sunday 09:00
  - Sunday 11:00
Location: Main Church
Language: English
Special Designation: Summer Schedule
Effective Start Date: June 1, 2024
Effective End Date: August 31, 2024
Active: Yes
```

### 6. Holiday Mass Times

Create a Holiday mass time for Christmas:

```
Mass Type: Holiday (default system type)
Schedule Items:
  - December 24 16:00 (4:00 PM)
  - December 24 22:00 (10:00 PM Midnight Mass)
  - December 25 09:00 (9:00 AM)
  - December 25 11:00 (11:00 AM)
Location: Main Church
Language: English
Special Designation: Christmas Masses
Effective Start Date: December 24, 2024
Effective End Date: December 25, 2024
Active: Yes
```

### 7. Creating Mass Type On The Fly

When creating a mass time, you can create a new mass type inline:

1. Navigate to `/mass-times/create`
2. In the Mass Type field, click "+ Create Mass Type"
3. Dialog opens with mass type form
4. Fill in labels, description, color, etc.
5. Click "Create Mass Type"
6. New type is automatically selected in the picker
7. Continue creating the mass time

---

## Related Modules

### Masses Module

The Mass Times module complements but is separate from the Masses module:

- **Mass Times:** Defines recurring schedules (internal reference)
- **Masses:** Individual mass records with specific dates, presiders, and liturgy details

**Relationship:**
- Mass Times do NOT auto-create individual Mass records
- Mass Times provide a schedule reference for parish staff
- Individual Masses are created separately in the Masses module
- A Mass can reference a Mass Time for context (future enhancement)

### Locations Module

- Mass times can be assigned to specific locations
- Location picker allows selecting from parish locations
- Location is optional (some masses may not have fixed locations)

### Events Module

- Mass Times define recurring schedules
- Events module handles individual event records (including masses)
- Both use the same language constants (en, es, la)

---

## Implementation Notes

### Migration Files

**Mass Types Migration:** `supabase/migrations/20251118235900_create_mass_types_table.sql`
- Creates mass_types table
- Seeds 4 default types (WEEKEND, DAILY, HOLIDAY, SPECIAL) for all parishes
- RLS policies for parish-scoped access
- System types marked with `is_system: true`

**Mass Times Migration:** `supabase/migrations/20251119000000_create_mass_times_table.sql`
- Creates mass_times table with foreign key to mass_types
- One table per migration file pattern
- RLS policies for parish-scoped access
- Indexes for common query patterns
- Trigger for updated_at timestamp
- `ON DELETE RESTRICT` prevents deleting mass types in use

### Architecture Changes

**Before (Hardcoded):**
- `schedule_type TEXT` column with hardcoded constants
- `MASS_TIMES_SCHEDULE_TYPE_VALUES` and `MASS_TIMES_SCHEDULE_TYPE_LABELS` constants
- Fixed 4 types, no customization

**After (Customizable):**
- `mass_type_id UUID` foreign key to `mass_types` table
- Dynamic mass types fetched from database
- Parishes can create unlimited custom types
- System types protected from deletion
- Inline creation via MassTypePicker

### Constants

Mass Times uses shared constants for days:

**DAYS_OF_WEEK** - Used by Mass Times and potentially other modules
- `DAYS_OF_WEEK_VALUES` - Array of day constants
- `DAYS_OF_WEEK_LABELS` - Bilingual labels

**Location:** `src/lib/constants.ts`

**Note:** `MASS_TIMES_SCHEDULE_TYPE` constants were removed and replaced with the mass_types table.

### Form Validation

Uses Zod schema for validation:

```typescript
const scheduleItemSchema = z.object({
  day: z.enum(DAYS_OF_WEEK_VALUES),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format'),
})

const massTimeSchema = z.object({
  mass_type_id: z.string().min(1, 'Mass type is required'),  // Changed from schedule_type
  schedule_items: z.array(scheduleItemSchema).min(1, 'At least one schedule item is required'),
  // ... other fields
})
```

### Dynamic Schedule Items

The mass times form uses React Hook Form's array field pattern:

- `form.watch('schedule_items')` - Watch array for changes
- `form.setValue('schedule_items', [...])` - Update array
- `FormField` with indexed names: `schedule_items.${index}.day`

### Components Created

**New Components:**
- `MassTypePicker` - Picker with inline mass type creation
- `MassTypesListClient` - Mass types management page
- `MassTypeFormDialog` - Dialog for creating/editing mass types

**Updated Components:**
- `MassTimeForm` - Now uses MassTypePicker instead of schedule_type dropdown
- `MassTimesListClient` - Fetches mass types for filter dropdown
- All mass times views - Display mass_type.label_en instead of hardcoded labels

---

## Future Enhancements

Potential future features for the Mass Times module:

1. **Mass Generation:** Auto-create individual Mass records from Mass Times schedules
2. **Conflict Detection:** Warn when multiple masses are scheduled at same time/location
3. **Calendar Integration:** Display Mass Times on parish calendar
4. **Public Display:** Public-facing mass schedule page (read-only)
5. **Recurrence Patterns:** More complex recurrence rules (1st Sunday, last Friday, etc.)
6. **Mass Time Templates:** Save common schedules as templates
7. **Historical Changes:** Track schedule changes over time
8. **Notifications:** Alert when mass times change

---

## Testing Checklist

When testing the Mass Times module:

- [ ] Create weekend schedule with multiple times
- [ ] Create daily schedule for weekdays
- [ ] Add/remove schedule items dynamically
- [ ] Assign location to mass time
- [ ] Set language to English, Spanish, Latin
- [ ] Add special designation
- [ ] Set effective start and end dates
- [ ] Mark mass time as inactive
- [ ] Add internal notes
- [ ] Filter by schedule type
- [ ] Filter by language
- [ ] Search by special designation
- [ ] View mass time details
- [ ] Edit existing mass time
- [ ] Copy mass time info to clipboard
- [ ] Delete mass time with confirmation
- [ ] Verify RLS policies (staff+ can edit, all can view)
- [ ] Test empty state on list page
- [ ] Verify stats calculations

---

## Related Documentation

- **[MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md)** - Standard 9-file module structure
- **[MODULE_CHECKLIST.md](./MODULE_CHECKLIST.md)** - Module creation checklist
- **[FORMS.md](./FORMS.md)** - Form patterns and validation
- **[COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md)** - Reusable components (LocationPicker)
- **[CODE_CONVENTIONS.md](./CODE_CONVENTIONS.md)** - Bilingual implementation, helper utilities

---

## Migration Reference

**Initial Creation:**
- **Date:** November 19, 2024
- **Migration:** `20251119000000_create_mass_times_table.sql`
- **Schema Version:** 1.0 - Initial implementation with hardcoded schedule_type

**Customizable Mass Types Update:**
- **Date:** November 19, 2024 (same day)
- **Migrations:**
  - `20251118235900_create_mass_types_table.sql` - Mass types table
  - `20251119000000_create_mass_times_table.sql` - Updated to use mass_type_id
- **Schema Version:** 2.0 - Migrated to customizable mass types
- **Database Reset Required:** Run `npm run db:fresh` to apply changes

**Breaking Changes:**
- `schedule_type TEXT` → `mass_type_id UUID`
- Removed `MASS_TIMES_SCHEDULE_TYPE` constants
- Mass types now managed via database instead of code constants

**Migration Strategy:**
- Default mass types automatically seeded for all parishes
- Existing mass times would need data migration (if any existed)
- Early development allowed direct schema modification
