# Failing Tests

## Critically Failing Test Modules

### 1. Event Picker (All tests failing)

- [ ] event-picker.spec.ts - All 5 tests failing
- [ ] event-picker-edit-mode.spec.ts - All 2 tests failing
- [ ] Issues with creating events with location pickers, nested pickers, form context preservation

### 2. Location Picker ✅ FIXED (All 9 tests passing)

- [x] Creating locations from picker
- [x] Selecting existing locations
- [x] Searching locations
- [x] Clearing selected locations
- [x] Open and close test
- [x] Complete address creation
- [x] Form context preservation
- [x] Validation tests

### 3. Group Membership (All tests failing + many skipped)

- [ ] group-membership.spec.ts - All tests failing
- [ ] groups-membership.spec.ts - All tests failing
- [ ] Add member, assign roles, remove member tests all fail
- [ ] 12 tests skipped (marked with -)

### 4. Events Module (8 of 10 tests failing)

- [ ] events.spec.ts - Most tests failing
- [ ] events-template-system.spec.ts - All 3 tests failing
- [ ] Creating standalone events, exports, filtering, breadcrumbs

### 5. Funerals (6 of 9 tests failing)

- [ ] Creating funerals, breadcrumbs, action buttons
- [ ] Add people (family contact) failing

### 6. Dashboard Navigation (7 tests failing)

- [ ] Navigation to weddings/funerals from breakdown
- [ ] Navigation to create wedding/quinceanera
- [ ] Navigate to event from upcoming celebrations
- [ ] Update statistics after creating sacraments

### 7. Mass Intention Report (Most tests failing)

- [ ] Date filtering, validation, export buttons
- [ ] Generating reports

### 8. Locations Module (4 of 6 tests failing)

- [ ] Create/view/edit, empty state, breadcrumbs

## Cleanup Errors (in stderr)

- [ ] permissions-server-actions.spec.ts:151 - Cannot read properties of undefined (reading 'parishId')
- [ ] permissions.spec.ts:175 - Cannot read properties of undefined (reading 'testWeddingId')
