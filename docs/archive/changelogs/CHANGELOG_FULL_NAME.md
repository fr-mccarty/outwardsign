# Database-Generated Full Name Implementation

**Date:** 2025-11-22
**Status:** ✅ Completed

## Overview

Implemented a database-level `full_name` generated column on the `people` table to streamline person name usage throughout the application. This eliminates the need for manual concatenation of `first_name` and `last_name` and ensures consistency across the entire codebase.

## Motivation

**Problem:**
- 60+ instances of manually concatenating `first_name + " " + last_name`
- Inconsistent formatting across the application
- Unnecessary helper function (`formatPersonName()`) for simple concatenation
- Potential for future formatting inconsistencies

**Solution:**
- Database-generated `full_name` column (auto-computed, always available)
- Direct usage: `person.full_name`
- Removed helper function
- Updated all 49 usages across 18 files

## Changes Made

### 1. Database Migration

**File:** `supabase/migrations/20251031000001_create_people_table.sql` (line 17)

Added database-generated column:
```sql
full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED
```

Added index for performance:
```sql
CREATE INDEX idx_people_full_name ON people(full_name);
```

**Benefits:**
- Auto-computed when rows are inserted/updated
- No application-level logic needed
- Indexed for fast searching and sorting
- Consistent across all database queries

### 2. TypeScript Interface

**File:** `src/lib/types.ts` (line 342)

Updated `Person` interface:
```typescript
export interface Person {
  id: string
  parish_id: string
  first_name: string
  last_name: string
  full_name: string  // Auto-generated: first_name || ' ' || last_name
  // ... other fields
}
```

### 3. Removed Helper Function

**File:** `src/lib/utils/formatters.ts`

**Removed:**
```typescript
export function formatPersonName(person?: { first_name: string; last_name: string } | null): string {
  return person ? `${person.first_name} ${person.last_name}` : ''
}
```

**Reason:** No longer needed. Use `person.full_name` directly.

### 4. Updated Related Helpers

**File:** `src/lib/utils/formatters.ts`

Updated these helpers to use `full_name` instead of manual concatenation:
- `formatPersonWithPhone()` - Uses `person.full_name`
- `formatPersonWithRole()` - Uses `person.full_name`
- `formatPersonWithEmail()` - Uses `person.full_name`

### 5. Replaced All Usages

**49 replacements across 18 files:**

**Content Builders (11 files):**
1. `src/lib/content-builders/shared/builders/reading.ts` - Reading section reader names
2. `src/lib/content-builders/shared/builders/psalm.ts` - Psalm reader names
3. `src/lib/content-builders/shared/builders/petitions.ts` - Petition reader names
4. `src/lib/content-builders/funeral/helpers.ts` - Funeral titles
5. `src/lib/content-builders/wedding/helpers.ts` - Wedding petition reader logic
6. `src/lib/content-builders/quinceanera/helpers.ts` - Quinceañera titles
7. `src/lib/content-builders/quinceanera/templates/full-script-spanish.ts` - Spanish template
8. `src/lib/content-builders/quinceanera/templates/full-script-english.ts` - English template
9. `src/lib/content-builders/group.ts` - Group member reports
10. `src/lib/content-builders/person.ts` - Person contact cards
11. `src/lib/report-builders/mass-role-report.ts` - Mass role reports

**UI Components (4 files):**
12. `src/components/member-list-item.tsx` - Member list displays
13. `src/app/(main)/groups/group-form.tsx` - Group form delete confirmation
14. `src/app/(main)/groups/[id]/group-view-client.tsx` - Group view
15. `src/app/(main)/mass-roles/mass-role-form.tsx` - Mass role form

**Module Views (2 files):**
16. `src/app/(main)/mass-roles/[id]/mass-role-view-client.tsx` - Mass role view
17. `src/app/(main)/group-members/group-members-list-client.tsx` - Group members list
18. `src/app/(main)/group-members/[id]/memberships/group-memberships-form.tsx` - Memberships form

**API Routes (3 files):**
19. `src/app/api/mass-roles/[id]/pdf/route.ts` - PDF generation
20. `src/app/api/mass-roles/[id]/word/route.ts` - Word document generation
21. `src/app/api/mass-roles/[id]/report/route.ts` - CSV export

**Pattern Used:**
```typescript
// Before
import { formatPersonName } from '@/lib/utils/formatters'
const name = formatPersonName(person)

// After
const name = person.full_name
const name = person?.full_name || ''  // Null-safe version
```

## Documentation Updates

### 1. FORMATTERS.md

**Added critical section** (line 396):
```markdown
### 🔴 IMPORTANT: Use `person.full_name` Directly

**The `people` table has a database-generated `full_name` column.**
Always use `person.full_name` directly instead of manually concatenating
`first_name` and `last_name`.
```

**Updated helper examples** to note they use `full_name`:
- `formatPersonWithPhone()` - "Uses database-generated `full_name` field"
- `formatPersonWithRole()` - "Uses database-generated `full_name` field"
- `formatPersonWithEmail()` - "Uses database-generated `full_name` field"

**Updated critical rules** (line 47) to show exception for person names.

### 2. CODE_CONVENTIONS.md

**Updated person formatting section** (line 984):
```typescript
// Use database-generated full_name directly
person.full_name                      // "John Doe"
person?.full_name || ''               // "John Doe" (null-safe)
```

**Updated usage examples** (line 1019, 1049) to use `person.full_name`.

### 3. CLAUDE.md

**Updated helper utilities section** (line 378):
- **Person names:** Use `person.full_name` directly (database-generated field, no helper needed)

## Usage Guide

### ✅ Correct Usage

```typescript
// Direct access (when person is guaranteed to exist)
const name = person.full_name

// Null-safe access
const name = person?.full_name || ''

// In JSX
<p>{person.full_name}</p>
<p>{person?.full_name || 'Unknown'}</p>

// With helpers for complex formatting
import { formatPersonWithPhone } from '@/lib/utils/formatters'
const contactInfo = formatPersonWithPhone(person)  // "John Doe (555-1234)"
```

### ❌ Incorrect Usage

```typescript
// Don't concatenate manually
const name = `${person.first_name} ${person.last_name}`

// Don't use the old helper (it no longer exists)
const name = formatPersonName(person)  // ❌ Function removed
```

## Migration Instructions

To apply this change to your local database:

```bash
npm run db:fresh
```

This will:
1. Reset your local database
2. Re-run all migrations including the new `full_name` column
3. Regenerate all seed data with `full_name` populated

## Benefits

1. **Consistency** - Single source of truth for person names
2. **Simplicity** - Direct field access instead of helper function
3. **Performance** - Database-level computation, indexed for fast queries
4. **Maintainability** - Less code to maintain, clearer intent
5. **Type Safety** - `full_name` is always present on `Person` type
6. **Future-Proof** - Easy to extend (e.g., add title, suffix, etc.)

## Breaking Changes

**For Developers/AI Agents:**
- `formatPersonName()` helper function has been removed
- All code using this helper has been updated
- New code should use `person.full_name` directly

**For Database:**
- Requires migration to add `full_name` column
- Existing data will have `full_name` auto-populated on migration

## Testing

After running the migration:
1. Verify `full_name` appears in person records
2. Check that all UI displays show person names correctly
3. Test liturgical document generation (PDFs, Word docs)
4. Verify CSV exports include correct person names
5. Ensure search/filter functionality works with `full_name`

## Future Considerations

**Possible Enhancements:**
1. Add `formal_name` for titles (e.g., "Fr. John Smith", "Dr. Jane Doe")
2. Add `preferred_name` for nicknames
3. Add `sort_name` for custom sorting (e.g., "Smith, John")
4. Support middle names/initials
5. Internationalization for name ordering (Western vs. Eastern formats)

**Database Pattern:**
This pattern can be applied to other commonly concatenated fields:
- Event names (event type + date)
- Location addresses (street + city + state)
- Full addresses with name (person name + address)

## Related Files

**Migration:**
- `supabase/migrations/20251031000001_create_people_table.sql`

**Types:**
- `src/lib/types.ts`

**Utilities:**
- `src/lib/utils/formatters.ts`

**Documentation:**
- `docs/FORMATTERS.md`
- `docs/CODE_CONVENTIONS.md`
- `CLAUDE.md`
- `docs/CHANGELOG_FULL_NAME.md` (this file)

## Rollback Instructions

If you need to rollback this change:

1. **Revert the migration file** to remove `full_name` column
2. **Restore `formatPersonName()` helper** in `formatters.ts`
3. **Replace all `person.full_name`** with `formatPersonName(person)`
4. **Update documentation** to remove references to `full_name`
5. **Run `npm run db:fresh`** to apply reverted migration

⚠️ **Note:** This is a breaking change. Do not rollback in production without a clear plan.

---

**Implementation Date:** 2025-11-22
**Implemented By:** AI Agent (Claude Code)
**Approved By:** Josh McCarty
