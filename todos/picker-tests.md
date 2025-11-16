# Picker Component Tests TODO

**Priority:** High
**Status:** In Progress
**Created:** 2025-11-16

## Overview

Complete test coverage for all picker components to ensure consistent behavior across the application.

## Completed Pickers ✅

- [x] PersonPicker - `person-picker.spec.ts` (7 tests)
- [x] EventPicker - `event-picker.spec.ts` (5 tests)
- [x] MassPicker - `mass-picker.spec.ts` (5 tests)
- [x] MassIntentionPicker - `masses-mass-intention-picker.spec.ts` (5 tests)

## Pickers Needing Tests

### LocationPicker
**Priority:** High
**File:** `tests/location-picker.spec.ts`

Currently only tested indirectly as a nested picker within EventPicker tests. Needs standalone tests covering:

- [ ] Open and close location picker from event form
- [ ] Create new location from picker with minimal data (name only)
- [ ] Create location with complete address information
- [ ] Select existing location from picker
- [ ] Search/filter locations by name or address
- [ ] Clear selected location
- [ ] Preserve form context when using picker (no navigation)
- [ ] Display locations in picker list

**Where used:**
- Event creation/editing forms
- Wedding ceremony/reception setup
- Funeral service location selection
- Mass location assignment

---

### MassRolePicker
**Priority:** High
**File:** `tests/mass-role-picker.spec.ts`

Used in mass template system for assigning liturgical roles. Needs tests covering:

- [ ] Open and close mass role picker from mass form
- [ ] Select person for a liturgical role
- [ ] Create new person from picker and assign to role
- [ ] Change person assigned to a role
- [ ] Remove person from a role
- [ ] Multiple roles on same mass (different people)
- [ ] Same person in multiple roles (if allowed)
- [ ] Preserve mass form context when using picker

**Where used:**
- Mass template creation/editing
- Individual mass liturgical role assignment
- Mass scheduling with presider/homilist/ministers

---

## Lower Priority Pickers

### GlobalLiturgicalEventPicker
**Priority:** Medium
**File:** `tests/global-liturgical-event-picker.spec.ts`

Less commonly used. Tests needed:

- [ ] Browse liturgical calendar events
- [ ] Select feast day/solemnity
- [ ] Filter by liturgical season
- [ ] Apply selected event to mass/celebration

### GroupRolePicker
**Priority:** Low
**File:** `tests/group-role-picker.spec.ts`

Already indirectly tested in `groups-membership.spec.ts`. Consider standalone tests if issues arise.

---

## Testing Standards

All picker tests should verify:

1. **Modal behavior** - Opens/closes correctly, no z-index issues
2. **Selection** - Can select existing entities
3. **Creation** - Can create new entities inline (auto-select pattern)
4. **Search/Filter** - Can find entities by relevant fields
5. **Clear** - Can deselect/clear selected entities
6. **Context preservation** - Parent form data not lost
7. **No navigation** - Stays on parent page after picker interaction
8. **Loading states** - Handles async data loading gracefully
9. **Empty states** - Displays appropriate message when no entities exist
10. **Accessibility** - Proper ARIA labels, keyboard navigation

## Test Pattern Reference

Follow the pattern established in:
- `tests/person-picker.spec.ts` - Comprehensive example
- `tests/event-picker.spec.ts` - Nested picker pattern
- `tests/mass-picker.spec.ts` - Simple selection pattern

## Notes

- LocationPicker is used heavily throughout the app and is a critical component
- MassRolePicker is essential for the mass template system functionality
- Both should follow the auto-select pattern (no redirect after creation)
- Both should preserve parent form context during picker interactions
