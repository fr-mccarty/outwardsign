# Consolidated Task Summary

> **Last Updated:** 2025-11-18
>
> **Purpose:** Single source of truth for all remaining tasks

This document consolidates all outstanding work organized by priority and category.

---

## Table of Contents

- [🔴 Critical Priority Tasks](#-critical-priority-tasks)
- [🟡 High Priority Tasks](#-high-priority-tasks)
- [🟢 Medium Priority Tasks](#-medium-priority-tasks)
- [⚪ Low Priority / Future](#-low-priority--future)

---

## Current Gaps

**Communication:**
- No email functionality
- No SMS/text messaging
- No notifications or reminders

**Mass Ministry Scheduling:**
- Cannot assign lectors, EMHCs, altar servers to masses
- No ministry scheduling for any sacraments
- No conflict detection for ministry assignments

---

## 🔴 Critical Priority Tasks

### 1. Form Validation Improvements

**Status:** Partially Complete

**Remaining Tasks:**
- [ ] Add client-side validation with Zod across all forms
- [ ] Ensure server-side validation in all server actions
- [ ] Audit all server actions for input validation

---

## 🟡 High Priority Tasks

### 2. Mass Ministry Roles System

**Status:** In Progress (database structure exists, UI incomplete)
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

### 3. Event-Specific Member Assignment

**Status:** Not Started

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

### 4. Ministry Scheduling for All Sacraments

**Status:** Not Started
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

### 5. Multilingual Support

**Status:** Partially Complete (infrastructure exists, incomplete implementation)

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

### 6. Communication System (Free Options First)

**Status:** Not Started

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

### 7. Calendar & Scheduling Improvements

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

**See:** ROADMAP.md - Phase II, Section 7

---

### 8. Known Issues & Technical Debt

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

**See:** ROADMAP.md - Known Issues & Technical Debt

---

### 9. UI/UX Improvements

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

**See:** ROADMAP.md - UI/UX Improvements

---

### 10. Testing Improvements

**Status:** In Progress

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

### 11. Advanced Liturgical Features (Phase III)

- [ ] Parish Default Module Templates - Set default templates per module
- [ ] Custom liturgy templates builder
- [ ] Document version history
- [ ] AI-powered scheduling suggestions for ministry roles
- [ ] Integration with liturgical calendar API for automatic Mass creation
- [ ] Template sharing marketplace

### 12. Reporting & Analytics (Phase III)

- [ ] Sacrament statistics dashboard
- [ ] Annual sacrament reports
- [ ] Participant tracking over time
- [ ] Export reports to PDF/Excel
- [ ] Minister participation reports
- [ ] Role coverage reports
- [ ] No-show tracking and analytics

### 13. Advanced Collaboration (Phase III)

- [ ] Real-time collaboration (multiple coordinators editing simultaneously)
- [ ] Version history for Mass assignments and records
- [ ] Advanced search functionality across all modules
- [ ] Bulk operations for multiple records

### 14. Integrations (Phase III)

- [ ] Church management system integrations
- [ ] Donor management integration
- [ ] Google Calendar sync
- [ ] Outlook Calendar sync
- [ ] Zoom/video conferencing integration

### 15. Mobile & Performance (Phase III)

- [ ] Progressive Web App (PWA) enhancements
- [ ] Offline support
- [ ] Mobile-optimized views
- [ ] Native mobile app (iOS/Android)

### 16. Multi-Parish & Enterprise (Phase III)

- [ ] Multi-parish support (manage multiple parishes from one account)
- [ ] Multi-parish coordination (for shared ministers)
- [ ] Parish network features
- [ ] Diocesan-level administration

**See:** ROADMAP.md - Phase III for complete list

---

---

## Notes

**No additional notes at this time.**

---

## Update History

- **2025-11-18** - Removed completed team management system and content builder implementation
- **2025-11-18** - Deleted 7 redundant task files (all content-builder planning docs + helper functions)
- **2025-11-18** - Confirmed content builders are implemented and in use (13/19 templates, 68% adoption)
- **2025-11-18** - Removed all time estimates, statistics, decision points, and scheduling sections
- **2025-11-18** - Simplified to focus only on future work
