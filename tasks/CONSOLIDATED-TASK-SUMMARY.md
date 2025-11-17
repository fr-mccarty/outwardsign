# Consolidated Task Summary

> **Last Updated:** 2025-11-17
>
> **Purpose:** Single source of truth for all remaining tasks (excluding content builder refactoring)

This document consolidates all outstanding work from ROADMAP.md and other planning documents, organized by priority and category.

---

## Table of Contents

- [Current State Summary](#current-state-summary)
- [🔴 Critical Priority Tasks](#-critical-priority-tasks)
- [🟡 High Priority Tasks](#-high-priority-tasks)
- [🟢 Medium Priority Tasks](#-medium-priority-tasks)
- [⚪ Low Priority / Future](#-low-priority--future)
- [📊 Task Statistics](#-task-statistics)
- [Decision Points](#decision-points)

---

## Current State Summary

### What Works Now ✅

**Core Modules (All Operational):**
- ✅ Weddings - Complete with liturgy planning, readings, petitions, PDF/Word export
- ✅ Funerals - Full liturgy management with export
- ✅ Baptisms - Tracking and summary generation
- ✅ Presentations - Latino presentation ceremonies
- ✅ Quinceañeras - Celebration planning with liturgy
- ✅ Masses - Scheduling and liturgy planning
- ✅ Mass Intentions - Tracking and reports

**Support Systems:**
- ✅ People directory, Events, Locations, Readings, Groups, Calendar
- ✅ Liturgical Script System (Print, PDF, Word export)
- ✅ Authentication, Parish selection, Role-based permissions
- ✅ Dark mode, Bilingual content (EN/ES), Liturgical calendar (2025-2026)
- ✅ Automated test infrastructure

### Critical Gaps ❌

**1. Team Collaboration (BLOCKING):**
- ❌ Cannot invite team members to parish
- ❌ Cannot add staff members
- ❌ No team member management UI
- ❌ No event-specific permissions

**2. Communication:**
- ❌ No email functionality
- ❌ No SMS/text messaging
- ❌ No notifications or reminders

**3. Mass Ministry Scheduling:**
- ❌ Cannot assign lectors, EMHCs, altar servers to masses
- ❌ No ministry scheduling for any sacraments
- ❌ No conflict detection for ministry assignments

---

## 🔴 Critical Priority Tasks

**These tasks are BLOCKING basic collaboration and must be completed for Phase I.**

### 1. Team Member System (CRITICAL)

**Status:** Not Started
**Estimated Time:** 20-30 hours
**Blocks:** All collaboration features, multi-user functionality

**Requirements:**

#### Database Layer
- [ ] Create `team_invitations` table
  - Fields: parish_id, email, role, status, token, expires_at, invited_by, invited_at
  - RLS policies for invitation management
- [ ] Create `parish_members` (or `team_members`) table
  - Fields: parish_id, user_id, role, joined_at, invited_by
  - RLS policies for team access
- [ ] Migration to add tables with proper indexes
- [ ] Test RLS policies thoroughly

#### Server Actions
- [ ] `createTeamInvitation(parishId, email, role)`
- [ ] `getTeamInvitations(parishId)` - List pending invitations
- [ ] `acceptInvitation(token)` - User accepts invitation
- [ ] `revokeInvitation(invitationId)` - Admin cancels invitation
- [ ] `getTeamMembers(parishId)` - List current team
- [ ] `removeTeamMember(parishId, userId)` - Remove from team
- [ ] `updateTeamMemberRole(parishId, userId, newRole)` - Change role

#### UI Components
- [ ] Team management page (`/settings/team`)
- [ ] "Invite Team Member" button + modal
- [ ] Team member list with roles
- [ ] Invitation acceptance flow (public page with token)
- [ ] Invitation email template (copy-paste or actual email)
- [ ] Remove team member confirmation dialog
- [ ] Role selector component

#### User Flow
1. Admin clicks "Invite Team Member"
2. Enters email address and selects role (admin, staff, ministry-leader)
3. System creates invitation record with unique token
4. Invitation link/email sent to recipient
5. Recipient clicks link → creates account or signs in
6. User automatically added to parish team with assigned role
7. User now has access based on role permissions

**See:** ROADMAP.md - Phase II, Section 1

---

### 2. Form Validation Improvements (CRITICAL)

**Status:** Partially Complete
**Estimated Time:** 8-12 hours

**Remaining Tasks:**
- [ ] Fix FormField color tokens for dark mode
  - Current issue: Some form inputs don't respect dark mode properly
  - Files: `src/components/forms/form-field.tsx`
- [ ] Add client-side validation with Zod across all forms
  - Some forms still lack proper validation
  - Add Zod schemas to all create/update forms
- [ ] Ensure server-side validation in all server actions
  - Audit all server actions for input validation
  - Add validation before database operations

**See:** ROADMAP.md - In Progress, Form Validation

---

### 3. ~~Missing Sacramental Modules~~ (EXCLUDED FROM ROADMAP)

**Status:** ❌ EXCLUDED - User Decision
**Estimated Time:** N/A

**⚠️ IMPORTANT: These modules are explicitly EXCLUDED from the roadmap and should NOT be created:**

- ❌ **Confirmations Module** - EXCLUDED
- ❌ **First Communion Module** - EXCLUDED
- ❌ **Anointing of the Sick** - EXCLUDED
- ❌ **Reconciliation Preparation** - EXCLUDED

**Reason:** User prioritization decision - focusing on existing modules and collaboration features instead of adding more sacramental modules at this time.

**Current Module Coverage is Sufficient:**
- ✅ Weddings, Funerals, Baptisms, Presentations, Quinceañeras, Masses, Mass Intentions

**Phase I Completion:** Does NOT require these additional modules. Phase I is effectively complete with current module set.

**See:** User decision 2025-11-17

---

## 🟡 High Priority Tasks

**These tasks significantly improve the application but don't block basic functionality.**

### 4. Mass Ministry Roles System

**Status:** In Progress (database structure exists, UI incomplete)
**Estimated Time:** 25-35 hours
**See:** MASSES.md for complete detailed plan

**Remaining Tasks:**

#### UI Components
- [ ] Role picker component for mass form
  - Select person + role type (Lector, EMHC, Altar Server, etc.)
  - Support multiple people per mass in different roles
  - Visual role assignment interface
- [ ] Mass role assignment section in mass form
  - List current role assignments
  - Add/remove role assignments
  - Edit role notes/parameters
- [ ] Minister directory page
  - List all ministers with their roles
  - Filter by role type
  - View availability and preferences
- [ ] Mass role schedule report
  - Who is serving when (by date range)
  - Filter by role type or person
  - Export to PDF/print
- [ ] Template role configuration UI
  - Define which roles are needed for each mass template
  - Set default role quantities

#### Features
- [ ] Role assignment workflow in mass form
- [ ] Conflict detection (same person, multiple masses, same time)
- [ ] Ministry schedule calendar view
- [ ] Export mass role schedule (PDF)

**Phase 1 (MASSES.md):**
- Focus on basic role assignment
- Simple notification (copy-paste email templates)
- Minister confirmation workflow

**Future Phases:**
- Substitute request system
- Minister preference management
- Auto-assignment algorithm

---

### 5. Event-Specific Member Assignment

**Status:** Not Started
**Estimated Time:** 15-20 hours

**Problem:** Cannot assign specific people to specific events (weddings, funerals, masses).

**Solution:**
- Event-specific "collaborator" role
- Limited access to only their assigned event
- View or view/edit permissions per event

**Use Cases:**
- Invite wedding coordinator to specific wedding (view/edit that wedding only)
- Invite musician to multiple masses (view assigned masses only)
- Invite family member to presentation (view-only access)
- Invite funeral director to specific funeral

**Database Requirements:**
- [ ] `event_collaborators` table
  - Fields: event_id, person_id, permission_level, invited_by, invited_at
  - RLS policies for scoped access
- [ ] Or `module_collaborators` table (more flexible)
  - Fields: module_type, module_id, person_id, permission_level

**UI Requirements:**
- [ ] "Invite to Event" button on each module view page
- [ ] Invitation modal (select person + permission level)
- [ ] List collaborators on view page
- [ ] Remove collaborator functionality
- [ ] Invitation acceptance flow (if using email invites)

**See:** ROADMAP.md - Phase II, Section 2

---

### 6. Ministry Scheduling for All Sacraments

**Status:** Not Started
**Estimated Time:** 30-40 hours
**Depends On:** Mass Ministry Roles System

**Description:** Extend ministry role assignment beyond masses to all sacramental celebrations.

**Modules to Update:**
- [ ] Weddings - Add role assignments (Presider, Lector, EMHC, Altar Server, Cantor, Music Minister, Usher)
- [ ] Funerals - Add role assignments (Presider, Lector, EMHC, Cantor, Music Minister, Pallbearers)
- [ ] Baptisms - Add role assignments (Presider, Lector, Altar Server, Cantor, Music Minister)
- [ ] Presentations - Add role assignments (Presider, Lector, Music Minister)
- [ ] Quinceañeras - Add role assignments (Presider, Lector, Altar Server, Cantor, Damas, Chambelanes)

**Shared Features:**
- [ ] Unified `liturgical_roles` table or extend existing role tables
- [ ] Ministry schedule reports by person (who is serving when/where)
- [ ] Ministry schedule reports by sacrament type
- [ ] Conflict detection across all sacraments
- [ ] Export ministry schedules (PDF)
- [ ] Calendar integration showing ministry commitments

**See:** ROADMAP.md - Phase II, Section 4

---

### 7. Multilingual Support (Phase I Completion)

**Status:** Partially Complete (infrastructure exists, incomplete implementation)
**Estimated Time:** 20-30 hours

**Remaining Tasks:**
- [ ] Complete Spanish translations for all modules
  - Audit all user-facing text
  - Add missing Spanish translations to constants
  - Translate all form labels, buttons, error messages
- [ ] Add language selector component
  - Store preference in localStorage or user profile
  - Context provider for current language
  - Toggle between English/Spanish
- [ ] Liturgical content in multiple languages
  - Already mostly complete (readings, petitions)
  - Verify all liturgical texts have both languages
- [ ] Bilingual print outputs
  - Already supported in templates
  - Verify all templates render correctly in both languages
- [ ] Update CONSTANTS_PATTERN.md to remove "temporary" note
  - Remove hard-coded `.en` throughout application
  - Use dynamic language selection

**Infrastructure Already Exists:**
- All constants have `.en` and `.es` properties
- Templates support both languages
- Just need UI to switch and use the selected language

**See:** ROADMAP.md - Phase I, Multilingual Support

---

## 🟢 Medium Priority Tasks

**These improve UX and code quality but aren't blocking.**

### 8. Communication System (Free Options First)

**Status:** Not Started
**Estimated Time:** 12-18 hours for Phase II.A

**Phase II.A - Cost-Free Approach:**

**Option 1: Copy-Paste Email Templates**
- [ ] Create email template generator UI
- [ ] Templates for common communications:
  - [ ] Wedding preparation emails
  - [ ] Funeral coordination
  - [ ] Mass role reminders
  - [ ] Event confirmations
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

**Phase II.B - Automated Communication (Later):**
- Email integration (SendGrid, Mailgun, AWS SES)
- SMS integration (Twilio)
- Automated reminders and notifications
- **Decision:** Wait until Phase II.A validated and user demand confirmed

**See:** ROADMAP.md - Phase II, Section 5

---

### 9. Calendar & Scheduling Improvements

**Status:** Partially Complete
**Estimated Time:** 15-20 hours

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

**See:** ROADMAP.md - Phase II, Section 7

---

### 10. Known Issues & Technical Debt

**Status:** Ongoing
**Estimated Time:** Varies by issue

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

**See:** ROADMAP.md - Known Issues & Technical Debt

---

### 11. UI/UX Improvements

**Status:** Ongoing
**Estimated Time:** 15-25 hours

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

**See:** ROADMAP.md - UI/UX Improvements

---

### 12. Testing Improvements

**Status:** In Progress
**Estimated Time:** 20-30 hours

**Test Coverage:**
- [ ] Add tests for Masses module
- [ ] Add tests for new picker components (MassPicker, RolePicker)
- [ ] Increase test coverage to >80%
- [ ] Add integration tests for critical workflows
- [ ] Add visual regression tests

**Test Infrastructure:**
- [ ] Improve test performance
- [ ] Add test data factories
- [ ] Document testing patterns
- [ ] Add CI/CD pipeline

**See:** ROADMAP.md - Testing

---

## ⚪ Low Priority / Future

**Phase III features - not needed for initial launch.**

### 13. Advanced Liturgical Features (Phase III)

- [ ] Parish Default Module Templates - Set default templates per module
- [ ] Custom liturgy templates builder
- [ ] Document version history
- [ ] AI-powered scheduling suggestions for ministry roles
- [ ] Integration with liturgical calendar API for automatic Mass creation
- [ ] Template sharing marketplace

### 14. Reporting & Analytics (Phase III)

- [ ] Sacrament statistics dashboard
- [ ] Annual sacrament reports
- [ ] Participant tracking over time
- [ ] Export reports to PDF/Excel
- [ ] Minister participation reports
- [ ] Role coverage reports
- [ ] No-show tracking and analytics

### 15. Advanced Collaboration (Phase III)

- [ ] Real-time collaboration (multiple coordinators editing simultaneously)
- [ ] Version history for Mass assignments and records
- [ ] Advanced search functionality across all modules
- [ ] Bulk operations for multiple records

### 16. Integrations (Phase III)

- [ ] Church management system integrations
- [ ] Donor management integration
- [ ] Google Calendar sync
- [ ] Outlook Calendar sync
- [ ] Zoom/video conferencing integration

### 17. Mobile & Performance (Phase III)

- [ ] Progressive Web App (PWA) enhancements
- [ ] Offline support
- [ ] Mobile-optimized views
- [ ] Native mobile app (iOS/Android)

### 18. Multi-Parish & Enterprise (Phase III)

- [ ] Multi-parish support (manage multiple parishes from one account)
- [ ] Multi-parish coordination (for shared ministers)
- [ ] Parish network features
- [ ] Diocesan-level administration

**See:** ROADMAP.md - Phase III for complete list

---

## 📊 Task Statistics

### By Priority

**🔴 Critical:** 2 major task groups (28-42 hours total)
- Team Member System (20-30 hours)
- Form Validation (8-12 hours)
- ~~Missing Modules~~ (EXCLUDED - 0 hours)

**🟡 High Priority:** 5 major task groups (105-145 hours total)
- Mass Ministry Roles (25-35 hours)
- Event-Specific Assignment (15-20 hours)
- Ministry Scheduling for All (30-40 hours)
- Multilingual Support (20-30 hours)
- Communication System (12-18 hours)

**🟢 Medium Priority:** 4 major task groups (62-98 hours total)
- Calendar Improvements (15-20 hours)
- Technical Debt (varies)
- UI/UX Improvements (15-25 hours)
- Testing (20-30 hours)

**⚪ Low Priority (Phase III):** Deferred until after Phase I & II complete

### By Category

**Collaboration Features:** 3 tasks (65-90 hours)
**~~Sacramental Modules~~:** EXCLUDED (0 hours)
**Ministry Management:** 2 tasks (55-75 hours)
**Communication:** 1 task (12-18 hours)
**Technical Quality:** 3 tasks (35-55 hours)
**User Experience:** 1 task (15-25 hours)
**Internationalization:** 1 task (20-30 hours)

### Estimated Total (Critical + High Priority)

**Minimum:** 133 hours (~3.5 weeks full-time)
**Maximum:** 187 hours (~4.5 weeks full-time)

---

## Decision Points

### 1. Team Member System - Immediate Decision Required

**Decision:** How to implement team member invitations?

**Recommended:** Option 1 - Simple Email Invitation
- Admin enters email + role
- System sends email with signup/login link
- User creates account and automatically joins parish
- Most streamlined UX, industry standard

**See:** ROADMAP.md - Decision Points

---

### 2. Communication Approach - Phase II Decision

**Decision:** Start with free options or build paid integration from the start?

**Recommended:** Start with cost-free options
- Copy-paste email templates
- Calendar .ics files
- Printable contact sheets
- Validate user demand first
- Add paid integrations (email/SMS) in Phase II.B based on need

**See:** ROADMAP.md - Decision Points

---

### 3. Member vs. Collaborator Model

**Decision:** Same system or separate systems for team members vs event collaborators?

**Recommended:** Separate systems
- **Team Members** = Parish staff with broad access
- **Event Collaborators** = Event-specific access only
- Different permission models, different UI
- Keeps parish team management clean

**See:** ROADMAP.md - Decision Points

---

## Next Steps

### Recommended Order (Critical Path)

**Week 1-2: Foundation**
1. Team Member System (20-30 hours)
   - Enables all collaboration features
   - CRITICAL BLOCKER

**Week 3-4: Ministry & Validation**
2. Form Validation Improvements (8-12 hours)
3. Mass Ministry Roles System (25-35 hours)
   - High value, frequently requested

**Week 5-6: Collaboration**
4. Event-Specific Assignment (15-20 hours)
5. Ministry Scheduling for All Sacraments (30-40 hours)

**Week 7-8: Multilingual & Communication**
6. Multilingual Support (20-30 hours)
7. Communication System - Free Options (12-18 hours)

**Week 9-10: Polish & Improvements**
8. Calendar Improvements (15-20 hours)
9. UI/UX Improvements (15-25 hours)
10. Testing (20-30 hours)

**Total Estimated Time:** 165-245 hours (~4-6 weeks full-time)

**Note:** ~~Missing Sacramental Modules~~ have been EXCLUDED from the roadmap per user decision 2025-11-17.

---

## Notes

**Content Builder Tasks (Excluded):**
All content builder refactoring tasks are documented separately in:
- `/tasks/content-builder-implementation.md`
- `/tasks/CONTENT-BUILDER-SUMMARY.md`

These tasks are optional optimization work (60% code reduction) but not required for functionality.

**Phase I Completion:**
Completing the Critical Priority tasks (Team Member System + Missing Modules) achieves Phase I goals as defined in ROADMAP.md.

**Phase II Readiness:**
Completing all Critical + High Priority tasks enables full Phase II collaboration and communication features.

---

## Update History

- **2025-11-17** - Excluded 4 sacramental modules from roadmap (Confirmations, First Communion, Anointing, Reconciliation) per user decision
- **2025-11-17** - Note: Time estimates included in this document for initial planning only - future updates should NOT include time estimates per user preference
- **2025-11-17** - Initial consolidated task summary created from ROADMAP.md and task files
