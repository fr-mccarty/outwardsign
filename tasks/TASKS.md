# Outward Sign - Remaining Tasks

> **Last Updated:** 2025-11-19
>
> **Purpose:** Single source of truth for all remaining work

---

## Table of Contents

- [🔴 Critical Priority](#-critical-priority)
- [🟡 High Priority](#-high-priority)
- [🟢 Medium Priority](#-medium-priority)
- [⚪ Low Priority / Future](#-low-priority--future)
- [🧪 Testing](#-testing)

---

## 🔴 Critical Priority

### 1. Form Component Replacement (13/13 Complete) ✅

**Status:** ✅ Complete

Replace `Card` component patterns with `FormSectionCard` across all module form files.

**Completed:**
- ✅ Wedding form
- ✅ Funeral form
- ✅ Baptism form
- ✅ Presentation form
- ✅ Quinceañera form
- ✅ Mass form
- ✅ Mass Intention form
- ✅ Mass Role Template form
- ✅ Event form
- ✅ Person form
- ✅ Location form
- ✅ Reading form
- ✅ Petition Template form

**Note:** All forms were already using `FormSectionCard`. No changes needed.

**Pattern:**
```tsx
// FROM:
<Card>
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* content */}
  </CardContent>
</Card>

// TO:
<FormSectionCard title="Section Title" description="Description">
  {/* content */}
</FormSectionCard>
```

---

### 2. Permission Enforcement (Team Management Phase 4)

**Status:** ✅ Server Actions Complete | ⏳ UI Enforcement Pending

**See:** [PERMISSION_ENFORCEMENT_SUMMARY.md](../docs/PERMISSION_ENFORCEMENT_SUMMARY.md) for complete implementation details

**Completed Tasks:**
- [x] ✅ Create permission helper functions in `lib/auth/permissions.ts`
  - Added `requireEditSharedResources(userId, parishId)` helper
  - All client-side helpers already exist in `permissions-client.ts`
- [x] ✅ Update all server actions with permission checks
  - People, Locations, Events, Readings (shared resources)
  - Wedding, Funeral, Baptism, Presentation, Quinceañera, Mass, Mass Intentions, Groups (already had checks)
  - Petition Templates (already had admin-only checks)
- [x] ✅ Build and test compilation (builds successfully)

**Remaining Tasks:**
- [ ] Hide/disable UI elements based on role
  - Edit/Delete buttons for parishioners (form action components)
  - "Create New" buttons for parishioners (list pages)
  - Settings pages for non-admin
  - Create buttons based on module access for ministry-leaders
- [ ] Test role-based access control
  - Admin can access everything
  - Staff can access all modules but not settings
  - Ministry-leader can only access enabled modules
  - Parishioner cannot access module creation/editing

---

### 3. Form Validation Improvements

**Status:** Partially Complete

**Remaining Tasks:**
- [ ] Add client-side validation with Zod across all forms
- [ ] Ensure server-side validation in all server actions
- [ ] Audit all server actions for input validation

---

## 🟡 High Priority

### 4. Fix Failing Tests (26 Failures)

**Status:** In Progress

**Test Suite:** 105 total tests | 78 passing | 26 failing | 1 skipped

#### 4.1 Groups Membership Tests (13 failures)
**Root Cause:** Role checkbox selectors timing out

**Common Error:** `TimeoutError` checking role checkboxes (LECTOR, CANTOR, PRIEST, etc.)

**Failing Tests:**
- TC-001: Add member with single role
- TC-002: Add member with multiple roles
- TC-004: Cannot add member without selecting person
- TC-005: Create new person from add member modal
- TC-006: Edit roles - add additional roles
- TC-007: Edit roles - remove roles
- TC-008: Edit roles - remove all roles
- TC-009: Cancel editing member roles
- TC-010: Remove member from group
- TC-011: Cancel removing member
- TC-012: All liturgical roles are available
- TC-014: Cannot add duplicate member
- TC-017: Screen reader labels

**Fix Needed:**
1. Inspect actual group membership role UI
2. Update selectors in `GroupMembershipPage.selectRoles()` (line 162-166)
3. Update selectors in `GroupMembershipPage.deselectRoles()` (line 171-175)
4. Add data-testid attributes to role checkboxes
5. Verify role constants match (LECTOR, CANTOR, PRIEST, etc.)

#### 4.2 Event Picker Tests (5 failures)
**Root Cause:** Nested dialog selector timing issues

**Failing Tests:**
- Create event with existing location using nested location picker
- Create event and location inline via nested pickers
- Preserve wedding form context when using nested pickers
- Allow selecting existing location in event creation
- Show validation error when creating event without required fields

**Fix Needed:**
- Add data-testid attributes to dialogs
- Increase wait timeout for nested dialogs
- Use waitForSelector pattern instead of fixed timeout
- Verify LocationPicker renders form correctly
- Check autoOpenCreateForm functionality

#### 4.3 Parish Settings Quick Amounts (3 failures)
**Failing Tests:**
- Display and configure mass intention quick amounts
- Update mass intention quick amount values
- Display and configure donations quick amounts

**Fix Needed:**
- Review parish settings quick amounts UI changes
- Update input/button selectors
- Add waitFor patterns for async updates

#### 4.4 Person Picker Tests (2 failures)
**Failing Tests:**
- Allow clearing selection and reselecting different person
- Reopen picker in edit mode when clicking on selected person field

**Fix Needed:**
- Check PersonPicker clear functionality
- Verify edit mode trigger on click
- Update selectors for selected person display field

#### 4.5 Miscellaneous (3 failures)
- Signup: should sign up a new user and redirect to onboarding
- Locations: should navigate through breadcrumbs
- Readings: should show empty state when no readings exist

---

### 5. Mass Role Self-Service Portal

**Status:** Not Started (Next Phase 1 Task)

**Route:** `/my-mass-roles`

**Pages to Build:**
- [ ] Dashboard (`/my-mass-roles/page.tsx`)
  - Upcoming assignments (next 3 months)
  - Calendar view of assignments
  - Quick stats (assignments this month, total this year)
  - Pending confirmations
  - Quick actions (Set Preferences, Add Blackout Date, Request Substitute)
- [ ] My Assignments (`/my-mass-roles/assignments/page.tsx`)
  - List of upcoming assignments
  - Past assignments history
  - Filter by date range, role
  - Confirm/decline buttons
  - Request substitute button
  - Download/print schedule
- [ ] My Preferences (`/my-mass-roles/preferences/page.tsx`)
  - Edit day/time preferences
  - Set frequency preferences
  - Manage blackout dates
  - Update language capabilities
  - Active/inactive status toggle
- [ ] Substitute Requests (`/my-mass-roles/substitutes/page.tsx`)
  - My open substitute requests
  - Available substitute opportunities
  - Accept/decline substitute requests
  - Substitute history

---

### 6. Substitute Management System

**Status:** Not Started

**Database:**
- [ ] Create `mass_role_substitutions` table migration
- [ ] Add RLS policies

**Server Actions:**
- [ ] `requestSubstitute(massRoleInstanceId, reason?)`
- [ ] `getOpenSubstituteRequests(roleId?)`
- [ ] `getMySubstituteRequests(personId)`
- [ ] `acceptSubstituteRequest(substitutionId, substitutPersonId)`
- [ ] `cancelSubstituteRequest(substitutionId)`
- [ ] `findEligibleSubstitutes(massRoleInstanceId)`

**UI:**
- [ ] Request substitute flow (button, modal, confirmation)
- [ ] Accept substitute flow (list, accept button, confirmation)
- [ ] Coordinator management interface

---

### 7. Confirmation Workflow

**Status:** Not Started

**Database:**
- [ ] Add status fields to `mass_role_instances` table
  - `status` (ASSIGNED | CONFIRMED | DECLINED | SUBSTITUTE_REQUESTED)
  - `confirmed_at`
  - `notified_at`
  - `notes`

**Server Actions:**
- [ ] `confirmAssignment(massRoleInstanceId)`
- [ ] `declineAssignment(massRoleInstanceId, reason?)`
- [ ] Update `getMassRoleInstances` to include status

**UI:**
- [ ] Add status badges to assignments list
- [ ] Confirm/decline buttons in My Assignments
- [ ] Confirmation modal
- [ ] Status filter in mass role directory

---

### 8. Basic Notification System

**Status:** Not Started

**Phase 1 (Free/Manual):**
- [ ] Create email template functions in `lib/email/templates.ts`
  - Assignment notification
  - Reminder notification
  - Substitute request notification
  - Substitute found confirmation
  - Assignment cancelled notification
- [ ] Add "Notify" buttons to mass role assignments
- [ ] Build email preview modal
- [ ] Create "Copy to Clipboard" functionality
- [ ] Document manual email workflow

---

### 9. Multilingual Support

**Status:** Infrastructure exists, incomplete implementation

**Remaining Tasks:**
- [ ] Complete Spanish translations for all modules
  - Audit all user-facing text
  - Add missing Spanish translations to constants
  - Translate all form labels, buttons, error messages
- [ ] Add language selector component
  - Store preference in localStorage or user profile
  - Context provider for current language
  - Toggle between English/Spanish
- [ ] Verify liturgical content in both languages
- [ ] Verify bilingual print outputs
- [ ] Remove hard-coded `.en` throughout application

**Note:** Infrastructure already exists (all constants have `.en` and `.es` properties)

---

### 10. Module Sharing (Team Management Phase 3)

**Status:** Not Started

**Purpose:** Allow parishioners to share read-only access to sacramental records with family members.

**Remaining Tasks:**
- [ ] Create `module_shares` table migration
  - Fields: id, parish_id, module_type, module_id, token, expires_at, created_by_user_id
  - Add RLS policies
- [ ] Create server actions
  - `createModuleShare(moduleType, moduleId)`
  - `listModuleShares(moduleId)`
  - `revokeModuleShare(shareId)`
- [ ] Add "Share" button to module view pages
  - Wedding, Funeral, Baptism, Presentation, Quinceañera
- [ ] Create share modal
  - Shows generated magic link
  - Expiration date (1 year)
  - Copy to clipboard button
  - Optional: Send via email
- [ ] Create public share routes
  - `/shared/weddings/[token]`, `/shared/funerals/[token]`, etc.
- [ ] Test end-to-end share flow

---

## 🟢 Medium Priority

### 11. Picker Component Tests

**Status:** 4/6 Complete

**Completed:**
- ✅ PersonPicker
- ✅ EventPicker
- ✅ MassPicker
- ✅ MassIntentionPicker

**Remaining:**
- [ ] **LocationPicker** (High Priority - heavily used)
  - Open/close from event form
  - Create new location (minimal and complete data)
  - Select existing location
  - Search/filter locations
  - Clear selected location
  - Preserve form context
  - Display locations in picker list
- [ ] **MassRolePicker** (High Priority - mass template system)
  - Open/close from mass form
  - Select person for liturgical role
  - Create new person from picker
  - Change person assigned to role
  - Remove person from role
  - Multiple roles on same mass
  - Preserve mass form context

**Lower Priority:**
- [ ] GlobalLiturgicalEventPicker (Medium)
- [ ] GroupRolePicker (Low - already tested indirectly)

---

### 12. Ministry Scheduling for All Sacraments

**Status:** Not Started
**Depends On:** Mass Ministry Roles System

**Modules to Update:**
- [ ] Weddings - Add role assignments
- [ ] Funerals - Add role assignments
- [ ] Baptisms - Add role assignments
- [ ] Presentations - Add role assignments
- [ ] Quinceañeras - Add role assignments

**Shared Features:**
- [ ] Unified `liturgical_roles` table
- [ ] Ministry schedule reports by person
- [ ] Ministry schedule reports by sacrament type
- [ ] Conflict detection across all sacraments
- [ ] Export ministry schedules (PDF)
- [ ] Calendar integration showing ministry commitments

---

### 13. Event-Specific Member Assignment

**Status:** Not Started

**Problem:** Cannot assign specific people to specific events (weddings, funerals, masses).

**Database:**
- [ ] Create `event_collaborators` or `module_collaborators` table
  - Fields: event_id/module_id, person_id, permission_level, invited_by, invited_at
  - RLS policies for scoped access

**UI:**
- [ ] "Invite to Event" button on each module view page
- [ ] Invitation modal (select person + permission level)
- [ ] List collaborators on view page
- [ ] Remove collaborator functionality
- [ ] Invitation acceptance flow

**Use Cases:**
- Invite wedding coordinator to specific wedding (view/edit that wedding only)
- Invite musician to multiple masses (view assigned masses only)
- Invite family member to presentation (view-only access)
- Invite funeral director to specific funeral

---

### 14. Communication System (Free Options First)

**Status:** Not Started

**Phase A - Cost-Free Approach:**

**Option 1: Copy-Paste Email Templates**
- [ ] Create email template generator UI
- [ ] Templates for common communications
  - Wedding preparation emails
  - Funeral coordination
  - Mass role reminders
  - Event confirmations
- [ ] "Copy to Clipboard" button
- [ ] User pastes into their own email client

**Option 2: Calendar (.ics) Files**
- [ ] Generate downloadable calendar invitations
- [ ] Include event details, location, notes
- [ ] Test across calendar apps (Google, Outlook, Apple)

**Option 3: Printable Contact Sheets**
- [ ] Generate contact lists with phone/email
- [ ] Export as PDF for distribution
- [ ] Filter by event or role

**Phase B - Automated Communication (Later):**
- Email integration (SendGrid, Mailgun, AWS SES)
- SMS integration (Twilio)
- Automated reminders and notifications

---

### 15. Calendar & Scheduling Improvements

**Status:** Partially Complete

**Remaining Tasks:**
- [ ] Add Spanish language liturgical events (2025, 2026)
  - Import Spanish solemnities and feasts
  - Verify bilingual event names
- [ ] Event conflict detection
  - Warn if overlapping events
  - Check location availability
  - Check minister availability (if assigned)
- [ ] Recurring event support
  - Weekly masses (e.g., every Sunday at 9am)
  - Recurring ministry meetings
  - Generate series of events
- [ ] Calendar export improvements
  - Better .ics format support
  - Include all event metadata
  - Multi-event export

---

### 16. Known Issues & Technical Debt

**Status:** Ongoing

**High Priority:**
- [ ] Review and fix any RLS policy gaps
- [ ] Test authentication flow edge cases
- [ ] Validate all foreign key relationships
- [ ] Test all modules with large datasets (100+ records)

**Medium Priority:**
- [ ] Improve loading states across modules
- [ ] Add better error messages (more specific, actionable)
- [ ] Optimize database queries for large datasets
- [ ] Review and improve mobile responsiveness

**Low Priority:**
- [ ] Clean up console warnings
- [ ] Optimize bundle size
- [ ] Add skeleton loaders to more pages
- [ ] Remove unused code/dependencies

---

### 17. UI/UX Improvements

**Status:** Ongoing

**Design System:**
- [ ] Review and standardize spacing patterns
- [ ] Ensure all components follow dark mode guidelines
- [ ] Add consistent empty states across all modules
- [ ] Improve loading skeleton designs

**User Experience:**
- [ ] Add keyboard shortcuts for power users
- [ ] Improve form autosave functionality
- [ ] Add inline editing where appropriate
- [ ] Better error recovery in forms
- [ ] Add success animations/feedback

**Accessibility:**
- [ ] Complete ARIA labels audit
- [ ] Test with screen readers
- [ ] Keyboard navigation improvements
- [ ] Color contrast verification
- [ ] Focus indicator improvements

---

## ⚪ Low Priority / Future

### 18. Advanced Liturgical Features (Phase III)

- [ ] Parish Default Module Templates - Set default templates per module
- [ ] Custom liturgy templates builder
- [ ] Document version history
- [ ] AI-powered scheduling suggestions for ministry roles
- [ ] Integration with liturgical calendar API for automatic Mass creation
- [ ] Template sharing marketplace

---

### 19. Reporting & Analytics (Phase III)

- [ ] Sacrament statistics dashboard
- [ ] Annual sacrament reports
- [ ] Participant tracking over time
- [ ] Export reports to PDF/Excel
- [ ] Minister participation reports
- [ ] Role coverage reports
- [ ] No-show tracking and analytics

---

### 20. Advanced Collaboration (Phase III)

- [ ] Real-time collaboration (multiple coordinators editing simultaneously)
- [ ] Version history for Mass assignments and records
- [ ] Advanced search functionality across all modules
- [ ] Bulk operations for multiple records

---

### 21. Integrations (Phase III)

- [ ] Church management system integrations
- [ ] Donor management integration
- [ ] Google Calendar sync
- [ ] Outlook Calendar sync
- [ ] Zoom/video conferencing integration

---

### 22. Mobile & Performance (Phase III)

- [ ] Progressive Web App (PWA) enhancements
- [ ] Offline support
- [ ] Mobile-optimized views
- [ ] Native mobile app (iOS/Android)

---

### 23. Multi-Parish & Enterprise (Phase III)

- [ ] Multi-parish support (manage multiple parishes from one account)
- [ ] Multi-parish coordination (for shared ministers)
- [ ] Parish network features
- [ ] Diocesan-level administration

---

## 🧪 Testing

### Group Membership Testing
**Priority:** High (13 failing tests)

**Test Coverage Needed:**
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

---

### Parish Invitation Testing
**Priority:** High

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

### Permission Testing (When Phase 4 Complete)
**Priority:** High

- [ ] Admin can access all modules
- [ ] Staff can access all modules but not settings
- [ ] Ministry-leader can only access enabled modules
- [ ] Parishioner cannot access module creation/editing
- [ ] Unauthorized users redirected appropriately

---

### Additional Test Coverage
**Priority:** Medium

- [ ] Add tests for Masses module
- [ ] Add tests for new picker components (completed: PersonPicker, EventPicker, MassPicker, MassIntentionPicker)
- [ ] Increase test coverage to >80%
- [ ] Add integration tests for critical workflows
- [ ] Add visual regression tests

---

## Current Gaps

**Communication:**
- No email functionality (manual copy-paste templates planned)
- No SMS/text messaging
- No notifications or reminders

**Mass Ministry Scheduling:**
- ✅ Can define mass roles
- ✅ Can create mass role templates
- ✅ Can assign people to mass roles
- ✅ People can set availability preferences
- ✅ People can add blackout dates
- ✅ Coordinators can view people and preferences
- ⏳ Self-service portal (in progress)
- ⏳ Substitute management (not started)
- ⏳ Confirmation workflow (not started)
- ⏳ Basic notifications (not started)

---

## Priority Order

1. **🔴 CRITICAL**
   - ✅ ~~Form Component Replacement~~ (Complete)
   - Permission Enforcement (security concern)
   - Form Validation Improvements

2. **🟡 HIGH**
   - Fix Failing Tests (26 failures, especially Groups Membership - 13 tests)
   - Mass Role Self-Service Portal (next Phase 1 task)
   - Substitute Management System
   - Confirmation Workflow
   - Basic Notification System
   - Multilingual Support
   - Module Sharing

3. **🟢 MEDIUM**
   - Picker Component Tests (LocationPicker, MassRolePicker)
   - Ministry Scheduling for All Sacraments
   - Event-Specific Member Assignment
   - Communication System (free options)
   - Calendar & Scheduling Improvements
   - Known Issues & Technical Debt
   - UI/UX Improvements

4. **⚪ LOW / FUTURE**
   - Advanced Liturgical Features (Phase III)
   - Reporting & Analytics (Phase III)
   - Advanced Collaboration (Phase III)
   - Integrations (Phase III)
   - Mobile & Performance (Phase III)
   - Multi-Parish & Enterprise (Phase III)

---

**Last Updated:** 2025-11-19
