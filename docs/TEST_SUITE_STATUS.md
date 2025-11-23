# Test Suite Status Report

**Last Updated:** 2025-11-23
**Total Tests:** 350
**Test Command:** `npm test`

## Executive Summary

The test suite contains 350 tests across ~20 test files. The majority of tests are passing successfully, demonstrating that core functionality across most modules is working correctly. However, there are **significant failures concentrated in picker components and modal interactions**, affecting approximately 50+ tests.

**Key Finding:** Most failures are 10-second timeouts, suggesting UI elements (particularly pickers and modals) are not rendering or responding as expected during test execution.

---

## Test Results Overview

### ✅ Fully Passing Test Suites

These test suites have **all tests passing**:

- **Authentication & Login** (`tests/login.spec.ts`) - 9/9 passing
  - Valid/invalid credentials
  - Empty field validation
  - Navigation flows
  - Loading states

- **Signup Flow** (`tests/signup.spec.ts`) - 4/4 passing
  - New user signup
  - Invalid credentials handling
  - Navigation

- **Dashboard** (`tests/dashboard.spec.ts`) - 17/17 passing
  - All sections loading
  - Sacrament type breakdown
  - Quick access links
  - Navigation
  - Statistics and recent activity
  - Mini calendar

- **Calendar Module** (`tests/calendar.spec.ts`) - 13/13 passing
  - Month view loading
  - View switching
  - Month navigation
  - Liturgical calendar toggle
  - Event creation from calendar
  - Event navigation from calendar
  - Date parameters
  - Breadcrumbs

- **Events Module - Standalone Events** (`tests/events.spec.ts`) - 10/10 passing
  - Create MEETING and EVENT types
  - Export to PDF/Word
  - List and filter
  - Empty states
  - Field validation
  - Print view
  - Breadcrumbs

- **Events Template System** (`tests/events-template-system.spec.ts`) - 3/3 passing
  - Template selector display
  - Template switching
  - Cancellation handling
  - Export buttons

- **Funerals Module - Core Tests** (`tests/funerals.spec.ts`) - 6/6 passing
  - Create, view, edit workflow
  - Print view verification
  - Empty state
  - Minimal data creation
  - Breadcrumbs
  - Action buttons
  - Update persistence

- **Baptisms Module - Core Tests** (`tests/baptisms.spec.ts`) - 6/6 passing
  - Create, view, edit workflow
  - Print view verification
  - Empty state
  - Minimal data creation
  - Breadcrumbs
  - Action buttons
  - Update persistence

### ❌ Test Suites with Failures

#### 1. Person Picker Integration - **6/6 tests failing** 🔴 CRITICAL

**Files:**
- `tests/baptisms-add-people.spec.ts` - 4/4 failing
- `tests/funerals-add-people.spec.ts` - 2/2 failing

**Failure Pattern:** All tests timeout at 10 seconds

**Affected Tests:**
- Add child via person picker to baptism
- Add mother via person picker to baptism
- Add father via person picker to baptism
- Add multiple people (child, mother, father) to baptism
- Add deceased person via person picker to funeral
- Add family contact via person picker to funeral

**Impact:** HIGH - Person picker is a critical shared component used across multiple modules

**Suspected Root Cause:**
- Person picker modal not opening
- Person picker not rendering within modal
- Search/selection interactions not working in test environment
- Event handlers not being triggered

---

#### 2. Event Picker Component - **3/5 tests failing** 🔴

**File:** `tests/event-picker.spec.ts`

**Passing:** 2/5
- Preserve wedding form context when using nested pickers
- Show validation error for missing required fields

**Failing:** 3/5 (10s timeout)
- Create event with existing location using nested location picker
- Create event and location inline via nested pickers
- Allow selecting existing location in event creation

**Impact:** MEDIUM - Affects event creation workflows with locations

**Suspected Root Cause:**
- Nested picker (event picker containing location picker) not handling modal layering correctly
- Location picker within event picker modal not rendering
- Dialog stacking issues

---

#### 3. Group Membership - **15+ tests failing** 🔴

**File:** `tests/group-membership.spec.ts`

**Status:**
- 1 test passing (skipped in this run)
- 6 tests failing (10s timeout)
- 7 tests skipped (dependencies on failing tests)

**Failing Tests:**
- Default group roles verification
- Assign group role to member
- Assign different roles to different members
- Allow member without group role
- Filter group roles in picker
- Edit member role (skipped)

**Impact:** HIGH - Entire group roles feature blocked

**Suspected Root Cause:**
- Group member add/edit dialog not opening
- Person picker within group context not working
- Role selection UI not rendering
- Similar to person picker issue but in group context

---

#### 4. Groups Membership - **10+ tests failing** 🔴

**File:** `tests/groups-membership.spec.ts`

**Status:**
- 0 tests passing
- 9 tests failing (10s timeout)
- 9 tests skipped (dependencies)

**Failing Test Cases:**
- TC-001: Add member with single role
- TC-002: Add member with Cantor role
- TC-003: Add member with no roles
- TC-004: Cannot add member without selecting person
- TC-005: Create new person from add member modal
- TC-014: Cannot add duplicate member
- TC-015: Empty group state displays correctly
- TC-010: Remove member from group
- TC-011: Cancel removing member

**Impact:** HIGH - Core group membership functionality blocked

**Suspected Root Cause:**
- Add member dialog not opening or rendering
- Person picker integration in group membership context
- Role multi-select component not working
- Delete confirmation dialog issues

---

#### 5. Location Picker Component - **7/9 tests failing** 🔴

**File:** `tests/location-picker.spec.ts`

**Passing:** 2/9
- Open and close location picker from event form
- Display and search locations in picker

**Failing:** 7/9 (10s timeout or element not found)
- Create new location with minimal data and auto-select
- Create location with complete address information
- Select existing location from picker
- Clear selected location
- Preserve event form context when using location picker
- Validate required name field when creating location

**Impact:** MEDIUM-HIGH - Affects event and location workflows

**Suspected Root Cause:**
- Location picker modal opening but form not interactable
- Auto-selection after creation not working
- Clear button not found or not triggering
- Nested location creation form within picker not rendering
- Similar pattern to person picker

---

#### 6. Locations Module - **1/5 tests failing**

**File:** `tests/locations.spec.ts`

**Passing:** 4/5
- Show empty state
- Validate required fields on create
- Filter locations by search
- Navigate through breadcrumbs

**Failing:** 1/5
- Create, view, and edit a location

**Impact:** LOW - Most location functionality working

**Suspected Root Cause:**
- Edit mode not loading properly
- Form update not persisting
- Navigation after edit failing

---

#### 7. Mass Intentions Module - **6/9 tests failing** 🔴

**File:** `tests/mass-intentions.spec.ts`

**Passing:** 3/9
- Show empty state
- Filter by status
- (One other test passing)

**Failing:** 6/9 (6-7s timeout)
- Create, view, edit workflow
- Create with minimal data
- Navigate through breadcrumbs
- Display action buttons
- Search for mass intentions
- Handle stipend field with dollar formatting

**Impact:** HIGH - Core module functionality blocked

**Suspected Root Cause:**
- Mass picker not working (similar to person/location picker)
- Mass selection modal not opening or not allowing selection
- Form interactions timing out
- Navigation after save failing

---

#### 8. Mass Intention Report - **4/8 tests failing** 🔴

**File:** `tests/mass-intention-report.spec.ts`

**Passing:** 4/8
- Show empty state for no matching date range
- Validate date inputs with error for invalid range
- Generate report with no date filters
- Disable export buttons until report generated
- Show error when downloading CSV without report

**Failing:** 4/8 (timeout or element not found)
- Filter by date range and display correct results (43s timeout!)
- Filter by narrow date range (single day)
- Calculate and display total stipends correctly
- Download CSV file with correct filename and content

**Impact:** MEDIUM - Reporting functionality partially working

**Suspected Root Cause:**
- Report generation taking too long or failing silently
- CSV download link not appearing after report generation
- Date filtering not applying correctly
- Table rendering issues with mass intention data

---

#### 9. Cleanup Errors (Non-Fatal)

**Files:**
- `tests/permissions-server-actions.spec.ts`
- `tests/permissions.spec.ts`

**Error Type:** `Cannot read properties of undefined`
- `parishId` undefined in permissions-server-actions cleanup
- `testWeddingId` undefined in permissions cleanup

**Impact:** LOW - These are cleanup errors that don't affect test results

**Root Cause:**
- Test fixtures not properly initialized before cleanup
- Async timing issue in beforeAll/afterAll hooks
- Missing null checks in cleanup code

---

## Failure Pattern Analysis

### Primary Pattern: Picker Component Timeouts

**Components Affected:**
- Person Picker (6 tests failing)
- Location Picker (7 tests failing)
- Event Picker (3 tests failing)
- Mass Picker (6 tests failing via Mass Intentions)

**Common Characteristics:**
1. All timeout at 10 seconds (default Playwright timeout)
2. Tests fail waiting for elements that should appear in picker modals
3. Likely related to:
   - Modal dialog not opening
   - Content not rendering within modal
   - Playwright not detecting the modal layer correctly
   - Event handlers not firing in test environment

**Hypothesis:**
There may be a **common issue in the picker/modal infrastructure** that affects all picker components. Fixing this root cause could potentially resolve 20+ test failures.

### Secondary Pattern: Mass Intention Related Timeouts

**Tests Affected:** 10 tests across two files

**Characteristics:**
- Mass picker not allowing selection
- Mass intention form interactions timing out
- Report generation issues
- Longer timeouts (up to 43 seconds)

**Hypothesis:**
Mass picker has additional complexity (date selection, mass selection) that compounds the basic picker issues.

### Tertiary Pattern: Group Member Dialog Issues

**Tests Affected:** 25+ tests across two files

**Characteristics:**
- Add/edit member dialogs not opening
- Person picker within group context failing
- Role selection not working

**Hypothesis:**
Groups module uses a different dialog pattern than standard modules. The add member functionality uses dialogs instead of separate pages, which may have different rendering characteristics in tests.

---

## Recommended Fix Priority

### Priority 1: Investigate Picker Modal Infrastructure 🔥

**Why:** Could fix 20+ tests across 4 different pickers

**Action Items:**
1. Review picker component modal implementation
2. Check dialog/modal stacking and z-index
3. Verify Playwright can detect and interact with modal layers
4. Test picker components in isolation
5. Add `data-testid` attributes if missing
6. Check for timing issues (animations, loading states)

**Files to Review:**
- `src/components/person-picker.tsx` (or similar)
- `src/components/location-picker.tsx`
- `src/components/event-picker.tsx`
- Modal/dialog wrapper components
- Shared picker patterns

### Priority 2: Fix Person Picker Specifically 🔥

**Why:** Blocking 6 tests across Baptisms and Funerals modules

**Action Items:**
1. Debug why person picker modal doesn't open in tests
2. Verify person picker search functionality in test environment
3. Check person selection and auto-fill behavior
4. Ensure "Create New Person" flow works in picker context

**Files to Review:**
- `tests/baptisms-add-people.spec.ts`
- `tests/funerals-add-people.spec.ts`
- Person picker component implementation
- Person form within picker modal

### Priority 3: Fix Location Picker

**Why:** Blocking 7 tests, affects event creation

**Action Items:**
1. Debug location picker modal rendering
2. Fix auto-selection after location creation
3. Verify clear selected location functionality
4. Test nested location creation form

**Files to Review:**
- `tests/location-picker.spec.ts`
- Location picker component
- Location form within picker

### Priority 4: Fix Mass Intentions & Mass Picker

**Why:** Blocking 10 tests, entire module affected

**Action Items:**
1. Debug mass picker modal and selection
2. Fix mass intention form interactions
3. Resolve report generation timeouts
4. Fix CSV download functionality

**Files to Review:**
- `tests/mass-intentions.spec.ts`
- `tests/mass-intention-report.spec.ts`
- Mass picker component
- Mass intention form
- Report builder component

### Priority 5: Fix Group Membership Dialogs

**Why:** Blocking 25+ tests, but isolated to one module

**Action Items:**
1. Debug add member dialog rendering
2. Fix person picker integration in group context
3. Resolve role selection UI issues
4. Test delete confirmation dialogs

**Files to Review:**
- `tests/group-membership.spec.ts`
- `tests/groups-membership.spec.ts`
- Group member add/edit dialog components
- Role picker/selector component

### Priority 6: Fix Cleanup Errors

**Why:** LOW priority, non-fatal, but should be cleaned up

**Action Items:**
1. Add null checks in test cleanup code
2. Ensure fixtures are properly initialized
3. Handle async timing in beforeAll/afterAll

**Files to Review:**
- `tests/permissions-server-actions.spec.ts`
- `tests/permissions.spec.ts`

---

## Testing Infrastructure Notes

### What's Working Well ✅

1. **Test Authentication** - Pre-authenticated test user setup works perfectly
2. **Test Isolation** - Tests run in parallel (4 workers) without conflicts
3. **Core Module Tests** - Create, view, edit, print workflows all passing
4. **Navigation Tests** - Breadcrumbs, routing, links all working
5. **Form Validation** - Required field validation tests passing
6. **Empty States** - Empty state rendering and "Create New" buttons working
7. **Search & Filtering** - Basic search and filter functionality passing

### What Needs Improvement ⚠️

1. **Picker Components** - Major issue affecting multiple modules
2. **Modal Interactions** - Tests struggling with modal dialogs
3. **Nested Pickers** - Event picker → location picker nesting not working
4. **Test Timeouts** - Default 10s timeout may be too short for some operations
5. **Async Operations** - Some operations may need explicit waits
6. **Test Data Cleanup** - Cleanup errors suggest fixture management issues

---

## Next Steps

1. **Start with Priority 1** - Investigate the picker modal infrastructure to potentially fix 20+ tests at once
2. **Create isolated picker tests** - Write minimal tests for each picker in isolation to identify root cause
3. **Review modal implementation** - Check if modals are portal-based, and if Playwright needs special handling
4. **Add debug logging** - Temporarily add console.log statements in picker components to see what's happening during tests
5. **Check for timing issues** - Add explicit waits or check for animations that might delay rendering
6. **Consult Playwright best practices** - Review Playwright documentation for testing modal dialogs and nested components

---

## Historical Context

This is the first comprehensive test suite run documented for the project. The test suite was established following patterns from TESTING_GUIDE.md, with pre-authentication setup and Page Object Model patterns.

The high number of passing tests (280+) demonstrates that the testing infrastructure and core functionality are solid. The concentrated failures in picker components suggest a specific, fixable issue rather than widespread problems.

---

## References

- **Testing Guide:** `docs/TESTING_GUIDE.md`
- **Testing Quickstart:** `docs/TESTING_QUICKSTART.md`
- **Testing Architecture:** `docs/TESTING_ARCHITECTURE.md`
- **Testing Registry:** `docs/TESTING_REGISTRY.md`
- **Component Registry:** `docs/COMPONENT_REGISTRY.md` (for picker components)
- **Pickers Documentation:** `docs/PICKERS.md`
