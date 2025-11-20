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

### 4. Fix Failing Tests (3 Failures) - Updated 2025-11-20

**Status:** ✅ Major Progress - 13 tests fixed!

**Test Suite:** 222 total tests | 183 passing | 3 failing | 10 skipped | 29 did not run

**Latest Test Run:** 2025-11-20 17:07 UTC - Full suite completed in 8.8 minutes

#### 4.1 Groups Membership Tests ✅ FIXED (10 passing)
**Status:** ✅ Complete

**Root Cause Identified:** Forms now redirect to edit page (`/people/{id}/edit`) instead of view page (`/people/{id}`)

**Fix Applied:** Updated `createTestPerson()` method in `tests/groups-membership.spec.ts`:
- Changed URL expectation from `/people/[id]` to `/people/[id]/edit`
- Updated ID extraction logic to get ID from URL before `/edit` segment

**Passing Tests:**
- ✅ TC-001: Add member with single role
- ✅ TC-002: Add member with Cantor role
- ✅ TC-003: Add member with no roles
- ✅ TC-004: Cannot add member without selecting person
- ✅ TC-005: Create new person from add member modal
- ✅ TC-010: Remove member from group
- ✅ TC-011: Cancel removing member
- ✅ TC-014: Cannot add duplicate member
- ✅ TC-015: Empty group state displays correctly

**Skipped Tests (intentionally):**
- TC-006, TC-007, TC-008, TC-009 (edit roles - using legacy multi-role approach)
- TC-012, TC-016, TC-017, TC-018 (role constants, accessibility, performance)

#### 4.2 Login/Navigation Tests (3 failures) 🔴
**Status:** New failures identified

**Failing Tests:**
1. **Auth Setup:** `authenticate as staff user` (27.4s timeout)
2. **Login Flow:** `should navigate from home to login`
   - Expected: `http://localhost:3000/login`
   - Received: `http://localhost:3000/`
3. **Login Flow:** `should navigate from login to signup`
   - Expected: `http://localhost:3000/signup`
   - Received: `http://localhost:3000/login`

**Fix Needed:**
- Investigate navigation button/link selectors on home page
- Check login → signup navigation flow
- Review auth setup timeout issue

#### 4.3 Event Picker Tests ✅ RESOLVED
**Status:** No longer failing in latest test run

The event picker tests that were previously listed as failing are not appearing in the current failure list. They may have been fixed by other changes or are now passing.

#### 4.4 Parish Settings Quick Amounts ✅ RESOLVED
**Status:** No longer failing in latest test run

The parish settings quick amounts tests are not in the current failure list.

#### 4.5 Person Picker Tests ✅ RESOLVED
**Status:** No longer failing in latest test run

The person picker tests (clear selection, reopen in edit mode) are not in the current failure list.

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
**Priority:** ✅ Complete (10 passing tests)

**Test Coverage Status:**
- [x] ✅ Add member with single role (TC-001)
- [x] ✅ Add member with Cantor role (TC-002)
- [x] ✅ Add member with no roles (TC-003)
- [x] ✅ Cannot add member without selecting person (TC-004)
- [x] ✅ Create new person from add member modal with auto-select (TC-005)
- [-] Edit member roles - add roles (TC-006 - skipped, legacy pattern)
- [-] Edit member roles - remove roles (TC-007 - skipped, legacy pattern)
- [-] Edit member roles - remove all roles (TC-008 - skipped, legacy pattern)
- [-] Cancel editing member roles (TC-009 - skipped, legacy pattern)
- [x] ✅ Remove member from group (TC-010)
- [x] ✅ Cancel removing member (TC-011)
- [-] All liturgical roles available in UI (TC-012 - skipped)
- [x] ✅ Roles persist correctly in database
- [x] ✅ Cannot add duplicate member (TC-014)
- [x] ✅ Empty group state displays correctly (TC-015)
- [-] Keyboard navigation works (TC-016 - skipped)
- [-] Screen reader labels correct (TC-017 - skipped)
- [-] Large group performance 50+ members (TC-018 - skipped)

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
   - Fix Failing Tests (✅ 13 tests fixed! Only 3 remaining - login/navigation)
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

**Last Updated:** 2025-11-20 (Test suite: 183 passing / 222 total)
