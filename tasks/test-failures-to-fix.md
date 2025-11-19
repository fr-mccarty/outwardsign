# Test Failures - Fix List

**Date Created:** 2025-11-15
**Total Tests:** 105
**Passing:** 78
**Failing:** 26
**Skipped:** 1

---

## Summary by Category

| Category | Failing Tests | Root Cause |
|----------|--------------|------------|
| Event Picker Tests | 5 | Nested dialog selector timing issues |
| Groups Membership Tests | 13 | Role checkbox selectors timing out |
| Parish Settings Quick Amounts | 3 | Configuration/update functionality |
| Person Picker Tests | 2 | Clear/reselect functionality |
| Miscellaneous | 3 | Various issues (signup, breadcrumbs, empty state) |

---

## 1. Event Picker Tests (5 failures)

### Files Affected
- `tests/event-picker.spec.ts`

### Failing Tests

#### 1.1 `should create event with existing location using nested location picker`
- **Error:** TimeoutError waiting for location button
- **Line:** 53
- **Issue:** Cannot find location button "St. Mary Cathedral" in nested dialog
- **Selector:** `page.locator('[role="dialog"]').last().getByRole('button', { name: /St. Mary Cathedral/i })`
- **Fix Needed:**
  - Add more specific dialog selectors (data-testid)
  - Increase wait timeout for nested dialogs
  - Use waitForSelector pattern instead of fixed timeout

#### 1.2 `should create event and location inline via nested pickers`
- **Error:** TimeoutError waiting for "Save Location" button
- **Line:** 129
- **Issue:** Cannot find "Save Location" button in nested LocationPicker dialog
- **Selector:** `page.locator('[role="dialog"]').last().getByRole('button', { name: /Save Location/i })`
- **Fix Needed:**
  - Same as 1.1
  - Verify LocationPicker is actually rendering the form
  - Check if autoOpenCreateForm is working correctly

#### 1.3 `should preserve wedding form context when using nested pickers`
- **Error:** TimeoutError waiting for "Save Location" button
- **Line:** 186
- **Issue:** Same as 1.2
- **Fix Needed:** Same as 1.2

#### 1.4 `should allow selecting existing location in event creation`
- **Error:** Element not found - "Saturday Evening Mass"
- **Line:** 252
- **Issue:** Event is not being selected/displayed after creation
- **Selector:** `page.locator('text=Saturday Evening Mass')`
- **Fix Needed:**
  - Check event creation flow
  - Verify auto-select after event creation
  - Add proper wait for event to be displayed

#### 1.5 `should show validation error when creating event without required fields`
- **Error:** Element not found - "ValidEvent"
- **Line:** 287
- **Issue:** Event not displayed after successful creation
- **Selector:** `page.locator('text=ValidEvent')`
- **Fix Needed:** Same as 1.4

---

## 2. Groups Membership Tests (13 failures)

### Files Affected
- `tests/groups-membership.spec.ts`
- Page Object: `GroupMembershipPage` (line 164)

### Common Issue
All tests are failing at the same point: **Cannot find role checkboxes**

### Failing Tests

#### 2.1 `TC-001: Add member with single role`
- **Error:** TimeoutError checking LECTOR checkbox
- **Line:** 164 (in GroupMembershipPage.selectRoles)
- **Selector:** `dialog.locator('input#LECTOR')`

#### 2.2 `TC-002: Add member with multiple roles`
- **Error:** Same as 2.1

#### 2.3 `TC-004: Cannot add member without selecting person`
- **Error:** Same as 2.1

#### 2.4 `TC-005: Create new person from add member modal`
- **Error:** TimeoutError checking CANTOR checkbox
- **Line:** 164
- **Selector:** `dialog.locator('input#CANTOR')`

#### 2.5 `TC-014: Cannot add duplicate member`
- **Error:** Same as 2.1

#### 2.6 `TC-006: Edit roles - add additional roles`
- **Error:** TimeoutError checking CANTOR checkbox

#### 2.7 `TC-007: Edit roles - remove roles`
- **Error:** TimeoutError unchecking LECTOR checkbox
- **Line:** 173 (in GroupMembershipPage.deselectRoles)

#### 2.8 `TC-008: Edit roles - remove all roles`
- **Error:** Same as 2.7

#### 2.9 `TC-009: Cancel editing member roles`
- **Error:** TimeoutError checking CANTOR checkbox

#### 2.10 `TC-010: Remove member from group`
- **Error:** TimeoutError checking LECTOR checkbox

#### 2.11 `TC-011: Cancel removing member`
- **Error:** Same as 2.10

#### 2.12 `TC-012: All liturgical roles are available`
- **Error:** TimeoutError checking PRIEST checkbox
- **Selector:** `dialog.locator('input#PRIEST')`

#### 2.13 `TC-017: Screen reader labels`
- **Error:** Element not found - aria-label for role checkboxes

### Root Cause Analysis
- **Primary Issue:** Role checkbox selectors are failing
- **Possible Causes:**
  1. Checkbox IDs have changed (e.g., `input#LECTOR` doesn't exist)
  2. Checkboxes are rendered differently (maybe using different structure)
  3. Dialog selector is targeting wrong dialog
  4. Roles UI component has been refactored

### Fix Needed
1. **Inspect the actual group membership role UI** - Check how role checkboxes are rendered
2. **Update selectors in GroupMembershipPage.selectRoles()** (line 162-166)
3. **Update selectors in GroupMembershipPage.deselectRoles()** (line 171-175)
4. **Verify dialog targeting** - Ensure `page.locator('[role="dialog"]').first()` is correct
5. **Add data-testid attributes** to role checkboxes for more reliable selection
6. **Check if role constants match** - Verify LECTOR, CANTOR, PRIEST, etc. are correct values

---

## 3. Parish Settings Quick Amounts Tests (3 failures)

### Files Affected
- `tests/parish-settings.spec.ts`

### Failing Tests

#### 3.1 `should display and configure mass intention quick amounts`
- **Error:** TBD (check error details)
- **Line:** 115
- **Issue:** Configuration of quick amounts not working properly

#### 3.2 `should update mass intention quick amount values`
- **Error:** TBD
- **Line:** 183
- **Issue:** Updating quick amount values failing

#### 3.3 `should display and configure donations quick amounts`
- **Error:** TBD
- **Line:** 222
- **Issue:** Donations quick amounts configuration failing

### Fix Needed
- Review parish settings quick amounts UI changes
- Check if the input/button selectors have changed
- Verify the update flow is working correctly
- May need to add waitFor patterns for async updates

---

## 4. Person Picker Tests (2 failures)

### Files Affected
- `tests/person-picker.spec.ts`

### Failing Tests

#### 4.1 `should allow clearing selection and reselecting different person`
- **Error:** TBD (timeout or element not found)
- **Line:** 132
- **Issue:** Clear and reselect functionality not working

#### 4.2 `should reopen picker in edit mode when clicking on selected person field`
- **Error:** TBD
- **Line:** 261
- **Issue:** Edit mode reopening not functioning

### Fix Needed
- Check PersonPicker clear functionality
- Verify edit mode trigger on click
- May need to update selectors for the selected person display field

---

## 5. Miscellaneous Tests (3 failures)

### 5.1 Signup Test
- **File:** `tests/signup.spec.ts`
- **Test:** `should sign up a new user and redirect to onboarding`
- **Line:** 4
- **Error:** TBD
- **Fix Needed:** Review signup flow and onboarding redirect

### 5.2 Locations Breadcrumbs
- **File:** `tests/locations.spec.ts`
- **Test:** `should navigate through breadcrumbs`
- **Line:** 137
- **Error:** TBD
- **Fix Needed:** Check breadcrumb navigation implementation

### 5.3 Readings Empty State
- **File:** `tests/readings.spec.ts`
- **Test:** `should show empty state when no readings exist`
- **Line:** 103
- **Error:** TBD
- **Fix Needed:** Verify empty state rendering for readings module

---

## Recommended Fix Strategy

### Phase 1: Quick Wins (Fix Specific Selectors)
1. **Groups Membership** - Update role checkbox selectors (fixes 13 tests)
2. **Event Picker** - Add data-testid to dialogs and improve nested dialog handling (fixes 5 tests)

### Phase 2: Component Fixes
3. **Person Picker** - Fix clear/edit functionality (fixes 2 tests)
4. **Parish Settings** - Debug quick amounts configuration (fixes 3 tests)

### Phase 3: Edge Cases
5. **Miscellaneous** - Fix remaining 3 tests individually

---

## Technical Improvements Needed

### 1. Add Data-TestId Attributes
**Files to Update:**
- `src/components/core-picker.tsx` - Add testid to dialogs and buttons
- `src/components/location-picker.tsx` - Add testid to form elements
- `src/components/event-picker.tsx` - Add testid to form elements
- `src/app/(main)/groups/[id]/group-members-card.tsx` - Add testid to role checkboxes

### 2. Improve Test Patterns
**Test Files to Update:**
- Use `waitForSelector` instead of fixed `waitForTimeout`
- Add retry logic for flaky selectors
- Use more specific selectors (data-testid) instead of `.last()`

### 3. Dialog Nesting Strategy
**Pattern to Implement:**
```typescript
// Instead of:
page.locator('[role="dialog"]').last()

// Use:
page.locator('[data-testid="location-picker-dialog"]')

// Or with better waiting:
const dialog = await page.waitForSelector('[role="dialog"][aria-label="Select Location"]')
await dialog.click(...)
```

---

## Priority Order

1. **HIGH PRIORITY** - Groups Membership (13 tests, likely one root cause)
2. **HIGH PRIORITY** - Event Picker (5 tests, nested dialog issues)
3. **MEDIUM PRIORITY** - Parish Settings (3 tests)
4. **MEDIUM PRIORITY** - Person Picker (2 tests)
5. **LOW PRIORITY** - Miscellaneous (3 tests, unrelated issues)

---

## Next Steps

1. [ ] Investigate group membership role checkbox rendering
2. [ ] Add data-testid attributes to critical picker dialogs
3. [ ] Update GroupMembershipPage test helpers with correct selectors
4. [ ] Fix event picker nested dialog handling
5. [ ] Debug parish settings quick amounts
6. [ ] Fix person picker clear/edit functionality
7. [ ] Address miscellaneous test failures one by one

---

## Notes

- Most failures are **selector/timing issues**, not functional bugs
- The underlying functionality likely works, tests just can't find elements
- Adding data-testid attributes will make tests more reliable and maintainable
- Consider increasing default test timeouts for complex interactions
