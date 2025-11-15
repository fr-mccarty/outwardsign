# Group Membership Testing Plan

## Overview
This document outlines the testing strategy for the group membership feature, including adding members with multiple roles, editing roles, and removing members from groups.

## Prerequisites
- Groups module implemented with multi-role support
- Database migration updated (`roles TEXT[]` column in `group_members` table)
- Migration applied with `supabase db push`

## Test Structure

### 1. Setup Tests
**File**: `tests/groups-membership.spec.ts`

#### Test Data Setup
- Create test people (minimum 3 people)
- Create test group
- Ensure clean state before each test

### 2. Add Member Tests

#### TC-001: Add Member with Single Role
**Description**: Add a member to a group with one liturgical role
**Steps**:
1. Navigate to group detail page
2. Click "Add Member" button
3. Click "Select Person" to open people picker
4. Select a person from the list
5. Check one role (e.g., "Lector")
6. Click "Add Member" button

**Expected Results**:
- Modal closes
- Member appears in group members list
- Member shows selected role as a badge
- Success toast displays

**Test Code Location**: `tests/groups-membership.spec.ts::Add member with single role`

#### TC-002: Add Member with Multiple Roles
**Description**: Add a member to a group with multiple liturgical roles
**Steps**:
1. Navigate to group detail page
2. Click "Add Member" button
3. Select a person from people picker
4. Check multiple roles (e.g., "Lector", "Cantor", "EMHC")
5. Click "Add Member" button

**Expected Results**:
- Modal closes
- Member appears in group members list
- Member shows all selected roles as badges
- Success toast displays

**Test Code Location**: `tests/groups-membership.spec.ts::Add member with multiple roles`

#### TC-003: Add Member with No Roles
**Description**: Add a member to a group without assigning any roles
**Steps**:
1. Navigate to group detail page
2. Click "Add Member" button
3. Select a person from people picker
4. Do not check any roles
5. Click "Add Member" button

**Expected Results**:
- Modal closes
- Member appears in group members list
- Member shows "No roles assigned" text
- Success toast displays

**Test Code Location**: `tests/groups-membership.spec.ts::Add member without roles`

#### TC-004: Add Member - Validation
**Description**: Attempt to add member without selecting a person
**Steps**:
1. Navigate to group detail page
2. Click "Add Member" button
3. Check some roles without selecting a person
4. Click "Add Member" button

**Expected Results**:
- "Add Member" button is disabled when no person is selected
- Modal remains open

**Test Code Location**: `tests/groups-membership.spec.ts::Cannot add member without selecting person`

#### TC-005: Create New Person from Add Member Modal
**Description**: Create a new person directly from the add member modal
**Steps**:
1. Navigate to group detail page
2. Click "Add Member" button
3. Click "Select Person" to open people picker
4. Click "Add New Person" in the people picker
5. Fill in person details (first name, last name)
6. Save new person
7. Person picker should close and new person should be auto-selected
8. Select roles
9. Click "Add Member" button

**Expected Results**:
- New person is created
- New person is auto-selected in the add member modal
- Can assign roles to newly created person
- Member is added to group successfully

**Test Code Location**: `tests/groups-membership.spec.ts::Create new person from add member modal`

### 3. Edit Member Roles Tests

#### TC-006: Edit Roles - Add Additional Roles
**Description**: Add more roles to an existing member
**Steps**:
1. Navigate to group detail page with existing member
2. Click Edit button (pencil icon) on member card
3. Check additional roles
4. Click Save button (checkmark icon)

**Expected Results**:
- Edit mode closes
- Member card updates to show all roles
- Success toast displays
- Data persists on page reload

**Test Code Location**: `tests/groups-membership.spec.ts::Edit member roles - add roles`

#### TC-007: Edit Roles - Remove Roles
**Description**: Remove roles from an existing member
**Steps**:
1. Navigate to group detail page with member having multiple roles
2. Click Edit button on member card
3. Uncheck some roles
4. Click Save button

**Expected Results**:
- Edit mode closes
- Member card updates to show remaining roles
- Success toast displays
- Data persists on page reload

**Test Code Location**: `tests/groups-membership.spec.ts::Edit member roles - remove roles`

#### TC-008: Edit Roles - Remove All Roles
**Description**: Remove all roles from a member
**Steps**:
1. Navigate to group detail page with member having roles
2. Click Edit button on member card
3. Uncheck all roles
4. Click Save button

**Expected Results**:
- Edit mode closes
- Member card shows "No roles assigned"
- Member remains in group
- Success toast displays

**Test Code Location**: `tests/groups-membership.spec.ts::Edit member roles - remove all roles`

#### TC-009: Edit Roles - Cancel Edit
**Description**: Cancel editing member roles
**Steps**:
1. Navigate to group detail page with existing member
2. Click Edit button on member card
3. Change role selections
4. Click Cancel button (X icon)

**Expected Results**:
- Edit mode closes
- Member card shows original roles (no changes)
- No success toast displays

**Test Code Location**: `tests/groups-membership.spec.ts::Cancel editing member roles`

### 4. Remove Member Tests

#### TC-010: Remove Member
**Description**: Remove a member from the group
**Steps**:
1. Navigate to group detail page with existing member
2. Click Delete button (trash icon) on member card
3. Confirm deletion in confirmation dialog

**Expected Results**:
- Confirmation dialog appears with member name
- After confirming, member is removed from list
- Success toast displays
- Member no longer appears on page reload

**Test Code Location**: `tests/groups-membership.spec.ts::Remove member from group`

#### TC-011: Remove Member - Cancel
**Description**: Cancel removing a member from the group
**Steps**:
1. Navigate to group detail page with existing member
2. Click Delete button on member card
3. Cancel in confirmation dialog

**Expected Results**:
- Member remains in list
- No success toast displays
- No changes to database

**Test Code Location**: `tests/groups-membership.spec.ts::Cancel removing member`

### 5. Role Constants Tests

#### TC-012: All Liturgical Roles Available
**Description**: Verify all liturgical roles from constants are available
**Steps**:
1. Navigate to group detail page
2. Click "Add Member" button
3. Review available role checkboxes

**Expected Results**:
- All roles from `ROLE_VALUES` constant are shown:
  - Lector
  - Extraordinary Minister of Holy Communion (EMHC)
  - Altar Server
  - Cantor
  - Usher
  - Sacristan
  - Music Minister
- Each role shows English label
- Each role shows Spanish label below

**Test Code Location**: `tests/groups-membership.spec.ts::All liturgical roles are available`

### 6. Database Integration Tests

#### TC-013: Roles Persist Correctly
**Description**: Verify roles are stored as TEXT[] in database
**Steps**:
1. Add member with multiple roles via UI
2. Query database directly to verify structure

**Expected Results**:
- `roles` column contains PostgreSQL array: `{LECTOR,CANTOR,EMHC}`
- Array format is correct
- Null when no roles assigned

**Test Code Location**: `tests/groups-membership.spec.ts::Roles persist as array in database`

### 7. Edge Cases

#### TC-014: Add Duplicate Member
**Description**: Attempt to add the same person twice to a group
**Steps**:
1. Add a person to a group
2. Attempt to add the same person again

**Expected Results**:
- Error message: "Person is already a member of this group"
- Person is not duplicated in the list

**Test Code Location**: `tests/groups-membership.spec.ts::Cannot add duplicate member`

#### TC-015: Empty Group State
**Description**: Verify empty state displays correctly
**Steps**:
1. Navigate to group with no members

**Expected Results**:
- Empty state shows user icon
- Message: "No members in this group"
- "Add First Member" button is displayed
- Clicking button opens add member modal

**Test Code Location**: `tests/groups-membership.spec.ts::Empty group state displays correctly`

## Test Data Requirements

### People
- At least 5 test people with different names
- People should have varied contact information
- Mix of people with and without emails

### Groups
- 1 empty group for testing
- 1 group with 1 member for testing
- 1 group with multiple members for testing

## Accessibility Testing

### TC-016: Keyboard Navigation
**Description**: Verify full keyboard accessibility
**Steps**:
1. Navigate to add member modal using Tab key
2. Navigate through role checkboxes using keyboard
3. Submit form using Enter key

**Expected Results**:
- All interactive elements are keyboard accessible
- Focus indicators are visible
- Form can be submitted with keyboard

### TC-017: Screen Reader Labels
**Description**: Verify all form elements have proper labels
**Steps**:
1. Inspect add member modal with screen reader

**Expected Results**:
- Person selector has proper label
- Each checkbox has proper label with role name
- Buttons have descriptive labels

## Performance Testing

### TC-018: Large Group Performance
**Description**: Test with group containing many members
**Steps**:
1. Create group with 50+ members
2. Navigate to group detail page
3. Add new member
4. Edit member roles

**Expected Results**:
- Page loads in < 2 seconds
- Member list renders smoothly
- No lag when editing roles

## Migration Testing

### TC-019: Migration from Single Role to Multiple Roles
**Description**: Verify existing data migrates correctly
**Steps**:
1. If any data existed with old `role TEXT` column
2. Verify it's handled gracefully after migration

**Expected Results**:
- No data loss
- Old single role converted to array format
- UI displays correctly

## Test Implementation Notes

### Playwright Page Object Model
Create a `GroupMembershipPage` class with methods:
- `addMember(personName: string, roles: string[])`
- `editMemberRoles(personName: string, roles: string[])`
- `removeMember(personName: string)`
- `getMemberRoles(personName: string)`
- `expectMemberInList(personName: string)`
- `expectMemberNotInList(personName: string)`

### Test Selectors
Use `data-testid` attributes for key elements:
- `data-testid="add-member-button"`
- `data-testid="member-card-{memberId}"`
- `data-testid="edit-roles-button-{memberId}"`
- `data-testid="delete-member-button-{memberId}"`
- `data-testid="role-checkbox-{ROLE}"`

## CI/CD Integration
- All tests should run in CI pipeline
- Tests should be independent and can run in parallel
- Database should be reset before each test run

## Success Criteria
- All test cases pass
- Test coverage > 80% for group membership code
- No flaky tests
- All accessibility tests pass
