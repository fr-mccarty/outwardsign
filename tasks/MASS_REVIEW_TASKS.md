# Mass & Mass Scheduling Review Tasks

## Overview
Comprehensive review of all mass-related functionality including masses, mass intentions, mass scheduling, mass times, mass roles, and mass role templates.

---

## Phase 1: Documentation Review

- [x] **1.1** Review `docs/MASSES.md` for completeness and accuracy
  - **Issues:** Missing 8 server action docs; claims `mass-form-actions.tsx` exists (doesn't)
- [x] **1.2** Review `docs/MASS_SCHEDULING.md` for completeness and accuracy
  - **Issues:** Broken link to non-existent `MASS_ROLE_TEMPLATE_SYSTEM.md`
- [x] **1.3** Review `docs/MASS_SCHEDULING_UI.md` for completeness and accuracy
  - **MAJOR:** Describes unimplemented calendar UI; actual impl is wizard-based. Mark as "Future Vision"
- [x] **1.4** Review `docs/MASS_TIMES_MODULE.md` for completeness and accuracy
  - ✅ Accurate and complete
- [x] **1.5** Review `docs/MASS_TEMPLATE.md` for completeness and accuracy
  - **Issues:** Claims `mass-role-template-form-actions.tsx` exists (doesn't)
- [x] **1.6** Check documentation consistency across all mass-related docs
  - **RESOLVED:** Migrated all modules to 8-file pattern, removed form-actions files, updated documentation
- [x] **1.7** Verify MODULE_REGISTRY.md has correct entries for all mass modules
  - **RESOLVED:** Updated `/mass-role-directory` to `/mass-role-members`
- [x] **1.8** Verify COMPONENT_REGISTRY.md has correct entries for mass components
  - ✅ MassPicker, MassPickerField documented correctly

---

## Phase 2: Server Actions Review

- [x] **2.1** Review `src/lib/actions/masses.ts` - 15 functions ✅
- [x] **2.2** Review `src/lib/actions/mass-intentions.ts` - 9 functions ✅
- [x] **2.3** Review `src/lib/actions/mass-scheduling.ts` - 4 functions ✅
- [x] **2.4** Review `src/lib/actions/mass-times.ts` - 7 functions ✅
- [x] **2.5** Review `src/lib/actions/mass-roles.ts` - 11 functions ✅
- [x] **2.6** Review `src/lib/actions/mass-role-templates.ts` - 5 functions ✅
- [x] **2.7** Review `src/lib/actions/mass-role-template-items.ts` - 5 functions ✅
- [x] **2.8** Review `src/lib/actions/mass-types.ts` - 6 functions ✅

---

## Phase 3: Routes & Frontend Review

All modules have correct 8-file structure:

| Module | Files | Pattern | Status |
|--------|-------|---------|--------|
| Masses | 21 | 8-file + schedule wizard | ✅ |
| Mass Intentions | 14 | 8-file + report | ✅ |
| Mass Role Templates | 8 | 8-file standard | ✅ |
| Mass Times | 8 | 8-file standard | ✅ |
| Mass Roles | 8 | 8-file standard | ✅ |
| Mass Types | 3 | Dialog-based (settings) | ✅ |

**Print Views:** ✅ masses, mass-intentions (individual + report)
**API Routes:** ✅ PDF/Word for masses & mass-intentions, CSV for report

---

## Phase 4: Labeling & UI Consistency

- [x] **4.1** Labels consistent: "Our Masses", "Mass Times Templates", "Our Mass Intentions" ✅
- [x] **4.2** Sidebar labels match MODULE_REGISTRY.md documentation ✅
- [x] **4.3** Breadcrumbs use consistent naming patterns ✅

---

## Phase 5: Testing Review

### 5A: Test Inventory
- [x] **100 mass-related tests** across 16 files (comprehensive coverage)

### 5B: Test Results
- [x] **masses.spec.ts** - 8 passed ✅ (event picker test now passes after language fix)
- [x] **mass-times.spec.ts** - 8 passed ✅ (fully rewritten)

### 5C: Test Fixes Applied
- [x] Fixed massId extraction bug (was getting "edit" instead of UUID from URL)
- [x] Fixed action buttons test (navigate to view page, use correct selectors)
- [x] Fixed flaky submit button test (wait for form stabilization)
- [x] Rewrote event picker test - skipped due to CorePicker form submission issue
- [x] **Fully rewrote mass-times.spec.ts** for "Mass Times Template" UI (7 new tests)

---

## Phase 6: Best Practices Compliance

- [x] **6.1** Module structure follows 8-file pattern ✅
- [x] **6.2** Server actions follow established patterns ✅
- [x] **6.3** ModuleViewContainer used consistently ✅

---

## Summary

| Phase | Status | Key Findings |
|-------|--------|--------------|
| 1. Documentation | ✅ Done | MASS_SCHEDULING_UI.md outdated; Terminology updated |
| 2. Server Actions | ✅ Done | 62+ functions across 8 files |
| 3. Routes/Frontend | ✅ Done | All 6 modules follow correct patterns |
| 4. Labeling | ✅ Done | Labels consistent with MODULE_REGISTRY.md |
| 5. Testing | ✅ Done | masses: 8 passed; mass-times: 8 passed |
| 6. Best Practices | ✅ Done | Follows established patterns |

## Actions Completed

1. **Migrated to 8-file pattern** - Removed 5 orphaned form-actions files
2. **Updated documentation** - CLAUDE.md, MODULE_COMPONENT_PATTERNS.md, MODULE_DEVELOPMENT.md, MODULE_CHECKLIST.md
3. **Created person-view-actions.tsx** - Uses DeleteButton component
4. **Fixed mass-time-form-wrapper.tsx** - Removed duplicate actions

## Additional Fixes Applied

1. ✅ Updated `/mass-role-directory` to `/mass-role-members` in all files
2. ✅ Added 8 missing server action docs to MASSES.md (role instances + intention linking)
3. ✅ Marked MASS_SCHEDULING_UI.md as "Future Vision - Not Implemented"
4. ✅ Fixed broken link in MASS_SCHEDULING.md (MASS_ROLE_TEMPLATE_SYSTEM.md → MASS_TEMPLATE.md)
5. ✅ Updated MASS_TEMPLATE.md to remove form-actions reference

## Remaining Issues (Future Work)

1. ✅ **FIXED: CorePicker form submission issue** - Root cause was `createEvent` server action passing `null` for `language` column (NOT NULL constraint)
   - Fix: Changed `language: data.language || null` to `language: data.language || 'en'` in `src/lib/actions/events.ts`
   - masses.spec.ts event picker test now passes (8/8 tests pass)
   - event-picker.spec.ts: 2/5 tests pass (remaining 3 involve nested location pickers - separate issue)
