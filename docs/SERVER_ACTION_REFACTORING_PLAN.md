# Server Action Refactoring Plan

This document outlines a comprehensive plan to refactor the 50 server action files in `src/lib/actions/` to reduce code duplication and improve maintainability.

## Current State Analysis

### Files Analyzed
- **Total files:** 50
- **Estimated total lines:** ~15,000
- **Estimated duplication:** ~60%

### Patterns Identified

#### 1. Authentication Boilerplate (92% of files)
```typescript
// This pattern appears in almost every action
const selectedParishId = await requireSelectedParish()
await ensureJWTClaims()
const supabase = await createClient()
```

#### 2. Permission Checking (used in write operations)
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  throw new Error('Not authenticated')
}
await requireEditSharedResources(user.id, selectedParishId)
```

#### 3. Error Handling (100% of files)
```typescript
if (error) {
  logError('Error fetching X: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
  throw new Error('Failed to fetch X')
}
```

#### 4. Pagination Calculation
```typescript
const totalCount = count || 0
const totalPages = Math.ceil(totalCount / limit)
const page = Math.floor(offset / limit) + 1
return { items: data || [], totalCount, page, limit, totalPages }
```

#### 5. Revalidation
```typescript
revalidatePath('/people')
revalidatePath(`/people/${id}`)
revalidatePath(`/people/${id}/edit`)
```

#### 6. Update Data Building
```typescript
const updateData: Record<string, unknown> = {}
if (validatedData.field !== undefined) updateData.field = validatedData.field
// repeated for every field...
```

---

## Utility Functions Created

The following utilities have been created in `src/lib/actions/server-action-utils.ts`:

| Function | Purpose | Replaces |
|----------|---------|----------|
| `createAuthenticatedClient()` | Auth + parish + JWT in one call | 3 lines of boilerplate |
| `createAuthenticatedClientWithPermissions()` | Above + user check + permission check | 6 lines of boilerplate |
| `handleSupabaseError()` | Standardized error logging/throwing | 3-4 lines per error |
| `isNotFoundError()` | Check for PGRST116 error code | Inline check |
| `isUniqueConstraintError()` | Check for 23505 error code | Inline check |
| `revalidateEntity()` | Revalidate list/detail/edit paths | 1-3 revalidatePath calls |
| `buildPaginatedResult()` | Build pagination response | 5 lines of calculation |
| `getPaginationRange()` | Calculate range for .range() | Inline calculation |
| `buildUpdateData()` | Build update object from validated data | 10-20 lines per update |

---

## Refactoring Phases

### Phase 1: Quick Wins (Estimated: 2-3 hours per batch)

**Priority:** High
**Risk:** Low
**Impact:** Eliminate ~500 lines

#### 1.1 Update Error Handling

**Files to update:** All 50 files

Replace:
```typescript
if (error) {
  logError('Error fetching person: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
  throw new Error('Failed to fetch person')
}
```

With:
```typescript
if (error) handleSupabaseError(error, 'fetching', 'person')
```

**Batch approach:** Update 5-10 files at a time, test, commit.

#### 1.2 Update Auth Boilerplate

**Files to update:** All 50 files

Replace:
```typescript
const selectedParishId = await requireSelectedParish()
await ensureJWTClaims()
const supabase = await createClient()
```

With:
```typescript
const { supabase, parishId } = await createAuthenticatedClient()
```

**Note:** Some files use `selectedParishId`, others use `parishId`. Standardize on `parishId`.

---

### Phase 2: Pagination & Revalidation (Estimated: 1-2 hours per batch)

**Priority:** Medium
**Risk:** Low
**Impact:** Eliminate ~200 lines

#### 2.1 Update Pagination

**Files affected:** ~15 files with paginated results

Replace:
```typescript
const totalCount = count || 0
const totalPages = Math.ceil(totalCount / limit)
const page = Math.floor(offset / limit) + 1

return {
  items: data || [],
  totalCount,
  page,
  limit,
  totalPages,
}
```

With:
```typescript
return buildPaginatedResult(data, count, offset, limit)
```

#### 2.2 Update Revalidation

**Files affected:** ~25 files with CRUD operations

Replace:
```typescript
revalidatePath('/people')
revalidatePath(`/people/${id}`)
revalidatePath(`/people/${id}/edit`)
```

With:
```typescript
revalidateEntity('people', id, { includeEdit: true })
```

---

### Phase 3: Permission Checking (Estimated: 2-3 hours)

**Priority:** Medium
**Risk:** Medium (security-sensitive)
**Impact:** Eliminate ~150 lines, improve consistency

#### 3.1 Standardize Write Operations

**Files affected:** ~20 files with create/update/delete operations

Replace:
```typescript
const selectedParishId = await requireSelectedParish()
await ensureJWTClaims()
const supabase = await createClient()

const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  throw new Error('Not authenticated')
}
await requireEditSharedResources(user.id, selectedParishId)
```

With:
```typescript
const { supabase, parishId } = await createAuthenticatedClientWithPermissions()
```

---

### Phase 4: Update Data Building (Estimated: 3-4 hours)

**Priority:** Medium
**Risk:** Low
**Impact:** Eliminate ~400 lines

#### 4.1 Simplify Update Functions

**Files affected:** All files with update operations

Replace:
```typescript
const updateData: Record<string, unknown> = {}
if (validatedData.first_name !== undefined) updateData.first_name = validatedData.first_name
if (validatedData.first_name_pronunciation !== undefined) updateData.first_name_pronunciation = validatedData.first_name_pronunciation || null
if (validatedData.last_name !== undefined) updateData.last_name = validatedData.last_name
// ... 10 more lines
```

With:
```typescript
const updateData = buildUpdateData(validatedData)
```

---

### Phase 5: CRUD Standardization (Future, Larger Scope)

**Priority:** Lower
**Risk:** Higher (more complex refactoring)
**Impact:** Eliminate ~800 lines

This phase would involve creating generic CRUD factories. **Not recommended for immediate implementation** due to complexity and TypeScript generics challenges with Supabase.

Example of future pattern (not yet implemented):
```typescript
// This is a conceptual example for future consideration
const personActions = createCrudActions({
  tableName: 'people',
  entityName: 'person',
  schema: { create: createPersonSchema, update: updatePersonSchema },
  revalidatePaths: (id) => ['people', id],
})

export const getPerson = personActions.getById
export const createPerson = personActions.create
```

---

## Recommended Refactoring Order

### Batch 1: Core CRUD Files (Start Here)
1. `people.ts` - Reference implementation
2. `locations.ts` - Simple CRUD
3. `groups.ts` - CRUD with relations

### Batch 2: Event-Related Files
4. `events.ts`
5. `masses.ts`
6. `master-events.ts`

### Batch 3: Settings & Configuration
7. `parish-settings.ts`
8. `user-settings.ts`
9. `event-types.ts`

### Batch 4: Content & Templates
10. `petitions.ts`
11. `announcements.ts`
12. `scripts.ts`
13. `contents.ts`
14. `sections.ts`

### Batch 5: Roles & Membership
15. `group-roles.ts`
16. `mass-roles.ts`
17. `mass-role-members.ts`
18. `ministers.ts`

### Batch 6: Remaining Files
19-50. All remaining files

---

## Testing Strategy

### Per-File Testing
After refactoring each file:
1. Run `npm run build` to check TypeScript compilation
2. Run `npm run lint` to check for linting errors
3. Run related tests if available
4. Manual smoke test of affected features

### Batch Testing
After each batch:
1. Run full test suite
2. Test critical user flows manually

---

## Success Metrics

| Metric | Before | Target After |
|--------|--------|--------------|
| Total lines in actions/ | ~15,000 | ~9,000 |
| Average file length | ~300 lines | ~180 lines |
| Duplicated patterns | ~60% | ~20% |
| Error handling variations | 5+ | 1 |
| Auth boilerplate lines | 3-6 per function | 1 per function |

---

## Files That Need Special Attention

### Non-Standard Patterns
- **`announcements.ts`** - Uses BigInt IDs, manual permission checking
- **`petitions.ts`** - Complex AI generation logic mixed with CRUD
- **`documents.ts`** - File upload logic mixed with CRUD
- **`generate-petitions.ts`** - AI-specific, may not fit patterns

### Already Well-Structured
- **`groups.ts`** - Good use of Zod validation
- **`locations.ts`** - Clean, simple CRUD

---

## Import Changes Required

When refactoring a file, update imports:

```typescript
// Before
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { requireEditSharedResources } from '@/lib/auth/permissions'
import { logError } from '@/lib/utils/console'

// After
import {
  createAuthenticatedClient,
  createAuthenticatedClientWithPermissions,
  handleSupabaseError,
  isNotFoundError,
  revalidateEntity,
  buildPaginatedResult,
  buildUpdateData,
} from '@/lib/actions/server-action-utils'
```

**Note:** Keep individual imports when only some utilities are needed.

---

## Rollback Plan

If issues are discovered:
1. Each batch is committed separately
2. Git revert can undo specific batches
3. Utility functions are additive (old code still works)

---

## Timeline Estimate

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Phase 1: Error Handling | 4-6 hours | None |
| Phase 2: Auth Boilerplate | 4-6 hours | Phase 1 |
| Phase 3: Pagination/Revalidation | 2-3 hours | Phase 2 |
| Phase 4: Permission Checking | 2-3 hours | Phase 3 |
| Phase 5: Update Data Building | 3-4 hours | Phase 4 |

**Total estimated effort:** 15-22 hours of focused work

---

## Next Steps

1. Review this plan and adjust priorities if needed
2. Start with Phase 1, Batch 1 (people.ts as reference)
3. Document any edge cases discovered
4. Update this plan as patterns emerge
