# Testing TODO

**Priority:** Medium
**Status:** Ongoing

## Group Membership Testing

**Purpose:** Test multi-role support for group members

### Test Coverage Needed

- [ ] Add member with single role
- [ ] Add member with multiple roles
- [ ] Add member with no roles
- [ ] Cannot add member without selecting person
- [ ] Create new person from add member modal (auto-select behavior)
- [ ] Edit member roles - add roles
- [ ] Edit member roles - remove roles
- [ ] Edit member roles - remove all roles
- [ ] Cancel editing member roles
- [ ] Remove member from group
- [ ] Cancel removing member
- [ ] All liturgical roles available in UI
- [ ] Roles persist as TEXT[] in database
- [ ] Cannot add duplicate member
- [ ] Empty group state displays correctly
- [ ] Keyboard navigation works
- [ ] Screen reader labels correct
- [ ] Large group performance (50+ members)

### Test File

Create `tests/groups-membership.spec.ts` with Page Object Model pattern.

**Selectors to use:**
- `data-testid="add-member-button"`
- `data-testid="member-card-{memberId}"`
- `data-testid="edit-roles-button-{memberId}"`
- `data-testid="delete-member-button-{memberId}"`
- `data-testid="role-checkbox-{ROLE}"`

### Reference

See `group-membership-testing.md` (archived) for detailed test plan.

---

## Parish Invitation Testing

**Purpose:** Test invitation workflow end-to-end

- [ ] Create invitation with admin role
- [ ] Create invitation with staff role
- [ ] Create invitation with ministry-leader role + module selection
- [ ] Create invitation with parishioner role
- [ ] Resend invitation
- [ ] Revoke invitation
- [ ] Accept invitation flow
- [ ] Expired invitation handling
- [ ] Invalid token handling

---

## Permission Testing (When Phase 4 Complete)

**Purpose:** Test role-based access control

- [ ] Admin can access all modules
- [ ] Staff can access all modules but not settings
- [ ] Ministry-leader can only access enabled modules
- [ ] Parishioner cannot access module creation/editing
- [ ] Unauthorized users redirected appropriately
