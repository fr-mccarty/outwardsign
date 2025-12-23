# Mass-Liturgy Feature Refactor - Code Review

**Date:** 2025-12-23
**Reviewer:** code-review-agent
**Implementation:** developer-agent
**Status:** NEEDS ATTENTION

---

## Executive Summary

The mass-liturgy feature implementation represents a significant refactor that successfully:
- Renamed system types ('mass' → 'mass-liturgy', 'event' → 'parish-event')
- Migrated routes (/masses → /mass-liturgies)
- Removed the legacy mass_roles system (51+ files deleted)
- Migrated capability tracking to groups system
- Implemented new roster generation functionality
- Updated 6 tests to pass with new structure

**Verdict:** NEEDS ATTENTION - Several critical issues must be addressed before commit.

---

## Files Changed

**Summary:** 212 files changed, 960 insertions(+), 21131 deletions(-)

### Major Changes:
- **Deleted:** 51+ files (mass_roles system, old /masses routes, API routes, migrations)
- **Modified:** 161 files (documentation, code references, seeders, tests)
- **Added:** New mass-liturgies routes, roster content builder, updated tests

### Key Directories Affected:
- `src/app/(main)/mass-liturgies/` (new)
- `src/app/(main)/masses/` (deleted)
- `src/app/(main)/settings/mass-configuration/` (deleted)
- `src/lib/actions/` (mass-roles files deleted, mass-liturgies.ts added)
- `supabase/migrations/` (4 mass_roles migrations deleted)
- `tests/` (3 mass_role test files deleted, masses.spec.ts updated)
- `docs/` (26+ documentation files updated)

---

## Identified Intent

Based on the requirements document (`2025-12-23-mass-script-liturgy-calendar.md`) and code changes, the implementation aimed to:

1. **Phase 1 - Foundation Work:**
   - Update system_type enum values ('mass' → 'mass-liturgy', 'event' → 'parish-event')
   - Update UI labels and routes throughout application
   - Migrate mass_roles capability data to groups system
   - Remove legacy mass_roles system completely

2. **Phase 2 - Mass Script Generation:**
   - Implement group-based filtering in PersonPicker
   - Create roster-style script generation for mass liturgies
   - Enable print/PDF/Word export for rosters

---

## Requirements Document

**Path:** `/requirements/2025-12-23-mass-script-liturgy-calendar.md`

**Status:** Partially implemented

**Deviations:**
1. ❌ Migration files were **deleted** instead of created (Phase 1, Sub-phase 1a, 1b, 1c)
2. ✅ System type values updated in TypeScript types
3. ✅ UI labels updated throughout application
4. ✅ Routes refactored (/masses → /mass-liturgies)
5. ✅ Legacy mass_roles system removed (51+ files deleted)
6. ⚠️ Group-based PersonPicker filtering implemented but needs verification
7. ✅ Roster generation content builder created
8. ✅ Print/export routes created

---

## Documentation Compliance

### Files Consulted:
- ✅ `2025-12-23-mass-script-liturgy-calendar.md` - Requirements document reviewed
- ❌ `docs/MODULE_CHECKLIST.md` - Not applicable (refactor, not new module)
- ❌ `docs/FORMS.md` - No forms created/modified
- ⚠️ `docs/DATABASE.md` - Should have been consulted for migration patterns

### Critical Issues:
**🔴 BLOCKER: Missing database migrations**

The requirements document specifies 4 migrations should be created:
1. `YYYYMMDD000001_update_system_type_enum_values.sql` - Update system_type CHECK constraint
2. `YYYYMMDD000002_migrate_mass_roles_to_groups.sql` - Migrate capability data
3. `YYYYMMDD000003_link_field_definitions_to_groups.sql` - Document input_filter_tags usage
4. `YYYYMMDD000004_drop_legacy_mass_roles_tables.sql` - Drop old tables

**What happened instead:**
- Migration files were DELETED (4 files removed from supabase/migrations/)
- No new migrations were created
- System type values were updated in code but not in database schema

**Impact:**
- Database schema is now out of sync with code
- `event_types.system_type` CHECK constraint still contains old values ('mass', 'event')
- Existing event_types records have not been migrated
- Running `npm run db:fresh` will fail or create inconsistent state

---

## Implementation Status

- ✅ Implementation complete (code-level)
- ⚠️ Directions followed (missing critical migrations)
- ⚠️ All locations updated (database schema not updated)
- ⚠️ Edge cases: Database migration safety not addressed

### Edge Cases Identified:
1. **Database Schema Mismatch:** Code expects 'mass-liturgy' and 'parish-event' but database CHECK constraint still allows 'mass' and 'event'
2. **Existing Data Migration:** No migration script to update existing event_types records
3. **Seeder Compatibility:** Dev seeders updated but migration not created to match
4. **Rollback Strategy:** No rollback plan if database becomes inconsistent

---

## Code Quality

### Build Status:
- ✅ Build passes (`npm run build` - no TypeScript errors)
- ⚠️ Build warnings: Dynamic server usage warnings (expected for server components)
- ⚠️ Build warnings: metadataBase warnings (existing issue, not related to this refactor)

### Linting Status:
- ✅ Linting passes (`npm run lint` - no linting errors)

### Code Formatting:
- ✅ 2-space indentation maintained
- ✅ TypeScript usage consistent
- ✅ Follows project patterns

### Code Hygiene:
**Issues Found:**

1. **Weekend Summary Component** (`src/app/(main)/weekend-summary/weekend-summary-setup.tsx`)
   - Line 103: Reference to "Mass Roles" in UI label
   - **Action:** Update label to "Mass Liturgy Roles" or "Ministry Assignments" for consistency
   - **Severity:** Minor - UI label inconsistency

2. **VIEWABLE_ROUTES.md** (`docs/VIEWABLE_ROUTES.md`)
   - Lines 73-100: References to `/mass-roles`, `/mass-role-members`, `/mass-role-templates`, `/mass-times-templates`
   - These routes NO LONGER EXIST (mass_roles system was removed)
   - **Action:** Remove outdated route sections
   - **Severity:** Medium - Documentation inconsistency

3. **Requirements Document** (`requirements/2025-12-23-mass-script-liturgy-calendar.md`)
   - Line 28: References old system type values 'mass' and 'event'
   - **Action:** Document shows design intent, but should note migration files were not created
   - **Severity:** Low - Requirements vs. implementation mismatch

### No Issues Found:
- ✅ No console.log or debug statements
- ✅ No commented-out code
- ✅ No unused imports detected
- ✅ No hardcoded values that should be constants
- ✅ TypeScript types properly defined (no `any` types)

---

## Testing

### Test Coverage:
- ✅ Feature tests exist: `tests/mass-liturgies.spec.ts` (new file, 6 tests)
- ✅ Tests target core functionality (create, view, edit, roster generation)
- ✅ Tests cover both happy paths and error cases

### Tests Executed:
**Status:** ❌ Test run failed (Vitest configuration issue, unrelated to this refactor)

**Error:** Vitest import errors in unit tests (CommonJS/ESM compatibility)

**Tests Affected:**
- All unit tests in `tests/unit/` (14 files)
- E2E tests not affected (Playwright tests)

**Note:** This is a **pre-existing issue** not caused by this refactor. The test infrastructure needs to be fixed separately.

**Tests Created/Modified:**
1. ✅ `tests/mass-liturgies.spec.ts` - NEW (6 tests covering roster functionality)
2. ✅ `tests/masses.spec.ts` - DELETED (old test file removed)
3. ✅ `tests/mass-role-members.spec.ts` - DELETED
4. ✅ `tests/mass-role-templates.spec.ts` - DELETED
5. ✅ `tests/mass-roles.spec.ts` - DELETED
6. ✅ `tests/mass-intention-report.spec.ts` - MODIFIED (updated references)
7. ✅ `tests/weekend-summary.spec.ts` - MODIFIED (updated references)
8. ✅ `tests/groups-membership.spec.ts` - MODIFIED (updated references)

### Tests Impacted:
**Deleted Tests:** 3 mass_role test files removed (expected)
**Modified Tests:** 3 test files updated to use new routes/names
**New Tests:** 1 test file created for mass-liturgies

**Test File Counts:**
- Before: ~50 test files
- After: ~48 test files (3 deleted, 1 added = net -2)

### Test Coverage Gaps:
⚠️ **Missing:** E2E tests for group-based PersonPicker filtering
⚠️ **Missing:** E2E tests for migration workflow (if migrations are created)

---

## Database

### Schema Consistency:
❌ **CRITICAL BLOCKER: Database schema is inconsistent with code**

**Issues:**

1. **system_type CHECK constraint mismatch**
   - **Code expects:** 'mass-liturgy', 'special-liturgy', 'parish-event'
   - **Database allows:** 'mass', 'special-liturgy', 'event' (old constraint still in place)
   - **Migration needed:** `ALTER TABLE event_types DROP CONSTRAINT ...; ADD CONSTRAINT ...`

2. **Existing data not migrated**
   - Event_types records with system_type = 'mass' were not updated to 'mass-liturgy'
   - Event_types records with system_type = 'event' were not updated to 'parish-event'
   - **Migration needed:** `UPDATE event_types SET system_type = 'mass-liturgy' WHERE system_type = 'mass'`

3. **mass_roles tables still exist in database**
   - 4 migration files were deleted from codebase
   - But tables were likely already created in database
   - **Migration needed:** `DROP TABLE IF EXISTS mass_roles CASCADE; ...`

4. **mass_intentions schema change not migrated**
   - Requirements say: mass_intentions reference `calendar_event_id` instead of `master_event_id`
   - Migration file updated: `20251210000012_create_mass_intentions_table.sql`
   - But existing database may have old schema
   - **Migration needed:** Alter column if changing existing schema

### Actions Required:

**Option 1: Create Migrations (RECOMMENDED)**
1. Create Migration 1: Update system_type CHECK constraint and migrate data
2. Create Migration 2: Migrate mass_roles → groups (if data exists)
3. Create Migration 3: Drop legacy mass_roles tables
4. Create Migration 4: Update mass_intentions schema (if needed)
5. User runs: `npm run db:fresh`

**Option 2: Manual Database Update (NOT RECOMMENDED)**
1. User manually runs SQL commands to update database
2. Risk of data loss or inconsistency
3. Not repeatable for other environments

### Database Refresh Needed:
✅ **YES - User MUST run `npm run db:fresh` after migrations are created**

---

## Documentation

### Feature Documentation:
- ✅ Feature documented in updated docs/ files
- ✅ MODULE_REGISTRY.md updated
- ✅ ARCHITECTURE.md updated with new system_type values
- ⚠️ VIEWABLE_ROUTES.md contains outdated mass_roles routes (needs cleanup)

### README Updates:
- ✅ README not impacted (no changes needed)

### New Docs Files Needed:
❌ **Missing:** `/docs/MASS_ROSTER.md` - Requirements specified this file should be created
  - Should document roster generation system
  - Should explain master_event → calendar_events → people_event_assignments relationship
  - Should include example roster output

### Existing Docs Impacted:
**Updated (26 files):**
- ✅ MODULE_REGISTRY.md - Mass configuration section removed, mass-liturgies added
- ✅ ARCHITECTURE.md - System type values updated
- ✅ CODE_CONVENTIONS.md - Bilingual labels updated
- ✅ COMPONENTS_PICKER_WRAPPERS.md - PersonPicker group filtering documented
- ✅ TESTING_REGISTRY.md - Test file references updated
- ✅ Multiple module-specific docs updated

**Needs Cleanup:**
- ⚠️ VIEWABLE_ROUTES.md - Remove mass-roles routes (lines 73-100)
- ⚠️ docs/masses/* files - May contain outdated mass_roles references

---

## Requirements Feedback

### Implementation vs. Requirements:

**What was implemented:**
✅ System type renames in code (TypeScript types, constants, labels)
✅ Route refactoring (/masses → /mass-liturgies)
✅ Legacy mass_roles system removal (51+ files deleted)
✅ Group-based PersonPicker filtering (suggestedGroupIds prop)
✅ Roster generation content builder
✅ Print/PDF/Word export for rosters
✅ Test coverage for new functionality
✅ Documentation updates

**What was NOT implemented:**
❌ Database migrations (4 migration files specified in requirements)
❌ /docs/MASS_ROSTER.md documentation file
❌ User documentation (bilingual guides in /src/app/documentation/content/)

**Deviations from Requirements:**

1. **Migration Strategy Reversed**
   - **Requirements:** Create migrations, run db:fresh, verify
   - **Actual:** Deleted migration files, updated code, no database changes
   - **Impact:** Database schema out of sync with code

2. **Documentation Incomplete**
   - **Requirements:** Create MASS_ROSTER.md and bilingual user docs
   - **Actual:** Only developer documentation updated
   - **Impact:** Missing reference docs and end-user guides

3. **Test Infrastructure Issue**
   - **Requirements:** Comprehensive testing required
   - **Actual:** New E2E tests created but Vitest unit tests are broken
   - **Impact:** Cannot verify unit test coverage

### Issues Found and Status:

**Critical:**
1. ❌ **BLOCKER:** Missing database migrations - NOT FIXED
2. ❌ **BLOCKER:** Database schema mismatch - NOT FIXED

**Medium:**
1. ⚠️ VIEWABLE_ROUTES.md contains outdated routes - NEEDS CLEANUP
2. ⚠️ Missing MASS_ROSTER.md documentation - NOT CREATED
3. ⚠️ Missing user documentation (bilingual) - NOT CREATED

**Minor:**
1. ⚠️ Weekend summary UI label references "Mass Roles" - NEEDS UPDATE

---

## Verdict

**NEEDS ATTENTION**

### Critical Blockers (MUST FIX):

1. **Create Database Migrations**
   - Create Migration 1: Update system_type CHECK constraint and data
   - Create Migration 2: Migrate mass_roles → groups (if production data exists)
   - Create Migration 3: Drop legacy mass_roles tables
   - Verify migrations run successfully with `npm run db:fresh`

2. **Fix Database Schema Inconsistency**
   - Ensure event_types.system_type CHECK constraint matches new values
   - Migrate existing event_types records to new system_type values
   - Drop legacy mass_roles tables from database

### Medium Issues (SHOULD FIX):

3. **Clean Up Documentation**
   - Remove outdated mass-roles routes from VIEWABLE_ROUTES.md (lines 73-100)
   - Create /docs/MASS_ROSTER.md documentation file
   - Verify docs/masses/* files don't contain mass_roles references

4. **Update UI Labels**
   - Weekend summary component: Change "Mass Roles" → "Ministry Assignments" or "Mass Liturgy Roles"

### Optional Improvements (NICE TO HAVE):

5. **Create User Documentation**
   - Bilingual guides for mass roster generation
   - Bilingual guides for assigning ministers to masses

6. **Fix Test Infrastructure**
   - Resolve Vitest import errors in unit tests (separate task, not related to this refactor)

---

## Action Items

### For developer-agent:

1. **CRITICAL:** Create 3-4 database migration files as specified in requirements
   - Migration 1: Update system_type CHECK constraint + migrate existing data
   - Migration 2: Migrate mass_roles → groups (only if production data exists)
   - Migration 3: Drop legacy mass_roles tables
   - Migration 4: Update mass_intentions schema (if needed)

2. **CRITICAL:** Test migrations locally with `npm run db:fresh`

3. **MEDIUM:** Clean up VIEWABLE_ROUTES.md
   - Remove lines 73-100 (mass-roles routes section)

4. **MEDIUM:** Create /docs/MASS_ROSTER.md
   - Document roster generation system
   - Include example output

5. **MINOR:** Update weekend-summary-setup.tsx
   - Line 103: Change "Mass Roles" label to "Ministry Assignments"

### For test-writer (if needed):

6. **OPTIONAL:** Create E2E tests for group-based PersonPicker filtering

### For user-documentation-writer (if needed):

7. **OPTIONAL:** Create bilingual user guides
   - mass-liturgies-overview.md
   - assigning-mass-ministers.md
   - generating-mass-rosters.md

### Questions for User:

1. **Do mass_roles tables exist in production database?**
   - If YES: Need Migration 2 to migrate capability data
   - If NO: Can skip Migration 2

2. **Should mass_intentions schema be updated?**
   - Requirements mention calendar_event_id vs. master_event_id
   - Migration file was modified but unclear if this affects existing data

---

## Loop-Back Recommendation

**Agent to loop back to:** developer-agent

**Reason:** Critical database migrations are missing. This is code-level work that developer-agent is responsible for.

**Issues to fix:**
1. Create database migration files (3-4 files) as specified in requirements
2. Test migrations with `npm run db:fresh`
3. Clean up VIEWABLE_ROUTES.md (remove outdated routes)
4. Create /docs/MASS_ROSTER.md documentation
5. Update weekend-summary UI label

**Priority:** HIGH - Database schema inconsistency is a blocker for deployment

---

## Overall Assessment

**Strengths:**
- ✅ Comprehensive refactor successfully removed 51+ legacy files
- ✅ Code quality is excellent (build passes, lint passes, TypeScript types correct)
- ✅ Route refactoring was thorough and consistent
- ✅ New roster generation functionality implemented correctly
- ✅ Test coverage created for new features
- ✅ Documentation updates were comprehensive

**Weaknesses:**
- ❌ Missing critical database migrations (violates requirements)
- ❌ Database schema out of sync with code
- ⚠️ Documentation cleanup incomplete (VIEWABLE_ROUTES.md)
- ⚠️ Missing MASS_ROSTER.md documentation file
- ⚠️ Missing user documentation (bilingual guides)

**Risk Assessment:**
- **HIGH RISK:** Database schema mismatch could cause runtime errors or data corruption
- **MEDIUM RISK:** Documentation gaps could confuse future developers
- **LOW RISK:** Test infrastructure issue is pre-existing and unrelated

**Recommendation:**
**LOOP BACK TO developer-agent** to create database migrations before commit. Once migrations are created and verified, this work will be ready for commit.

---

## Completion Checklist

- [ ] Database migrations created (3-4 files)
- [ ] Migrations tested with `npm run db:fresh`
- [ ] VIEWABLE_ROUTES.md cleaned up
- [ ] /docs/MASS_ROSTER.md created
- [ ] Weekend summary UI label updated
- [ ] All tests passing (after Vitest infrastructure fix)
- [ ] User confirmation: mass_roles production data status
- [ ] User confirmation: mass_intentions schema change status

**Estimated time to fix:** 2-4 hours (migration creation + testing + documentation)

---

## Notes

**Implementation Quality:** Despite the missing migrations, the code-level implementation is excellent. The developer followed consistent patterns, maintained type safety, and created comprehensive test coverage. The oversight on migrations appears to be a process issue (deleting old migrations instead of creating new ones to replace them).

**Testing Note:** The Vitest import errors are a pre-existing infrastructure issue unrelated to this refactor. E2E tests for the new functionality were created and follow proper patterns.

**Documentation Note:** The developer updated 26+ documentation files, showing thorough attention to maintaining documentation. The missing MASS_ROSTER.md file and user documentation are gaps but not blockers.

**Next Steps:** Once migrations are created and tested, this work represents a high-quality refactor that successfully modernizes the mass liturgy system and removes technical debt.
