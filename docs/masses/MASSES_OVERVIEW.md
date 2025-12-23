# Mass Module - Overview & Implementation Status

> **Purpose:** Current implementation status, mass components, and what's working vs. what's planned.

## Table of Contents

- [Overview](#overview)
- [Current Implementation Status](#current-implementation-status)
- [Mass Components](#mass-components)
- [Implementation Priorities](#implementation-priorities)

---

## Overview

**Purpose:** Manage Mass celebrations including scheduling, role assignments, communications, and liturgical preparation.

**Key Workflows:**
1. **Mass Planning** - Create Mass event, assign presider/homilist, select liturgical calendar date
2. **Role Assignment** - Assign people to liturgical roles based on templates
3. **Communication** - Notify assigned ministers, handle substitute requests
4. **Liturgical Preparation** - Manage readings, petitions, announcements, intentions
5. **Execution** - Print scripts, manage day-of coordination

**Core Belief:** A well-prepared Mass requires clear communication with all ministers, proper scheduling, and printable liturgical scripts ready in the sacristy.

---

## Current Implementation Status

### What's Implemented ✅

**Core Tables (Unified Event Model):**
- ✅ `master_events` - Liturgical Days (e.g., "Fourth Sunday in Advent")
- ✅ `calendar_events` - Individual Mass Times (10am, 12pm, 5pm)
- ✅ `people_event_assignments` - Role assignments at calendar_event level
- ✅ `groups` + `group_members` - Role capability management (who CAN serve)
- ✅ `mass_intentions` - Mass intention requests linked to calendar_events
- ✅ `person_blackout_dates` - Unavailability tracking

**Features:**
- ✅ Standard 8-file module structure (CRUD operations)
- ✅ People picker for presider/homilist with group-based filtering
- ✅ Liturgical event picker
- ✅ Mass Intentions (separate module, linked via calendar_event)
- ✅ Bulk scheduling wizard
- ✅ Roster generation showing all Mass times for a liturgical day
- ✅ Print/PDF/Word export for rosters

**Three-Concern Separation for Roles:**
1. **Role Definitions** - Defined in event_types.role_definitions (via input_field_definitions)
2. **Role Capability** - Managed through groups + group_members (who CAN serve)
3. **Role Assignments** - Stored in people_event_assignments (who IS serving)

### What's Not Yet Implemented ⏳

- ❌ Role assignment UI in Mass form (currently basic)
- ❌ Confirmation workflow (ministers confirm/decline assignments)
- ❌ Substitute request system
- ❌ Email/SMS notifications
- ❌ Minister self-service portal
- ❌ Assignment history tracking and reporting

### Database Schema (Current)

**Mass Liturgies use the unified event data model:**
- `master_events` - Liturgical Day (system_type = 'mass-liturgy')
  - Links to `event_types` (e.g., "Sunday Mass", "Daily Mass")
  - Links to `liturgical_calendar` (liturgical calendar)
  - Contains presider_id, homilist_id, field values (JSONB)
- `calendar_events` - Individual Mass Times for that day
  - Multiple calendar_events per master_event (10am, 12pm, 5pm)
  - Each has location, date/time, title computed from master_event
- `people_event_assignments` - Role assignments for specific Mass times
  - Links to calendar_event (specific Mass time)
  - Links to input_field_definition (role definition)
  - Links to person (who is assigned)
- `mass_intentions` - Mass intention requests
  - Links to calendar_event (NOT master_event)

**Legacy System (Removed):**
- `masses` table - Deleted, migrated to master_events
- `mass_roles` system (5 tables) - Deleted, replaced with groups + people_event_assignments

**See [MASSES_DATABASE.md](./MASSES_DATABASE.md) for complete schema reference.**

### Current Module Structure (Implemented)

**Standard 8-file pattern:**
1. List Page - `src/app/(main)/mass-liturgies/page.tsx`
2. List Client - `src/app/(main)/mass-liturgies/mass-liturgies-list-client.tsx`
3. Create Page - `src/app/(main)/mass-liturgies/create/page.tsx`
4. View Page - `src/app/(main)/mass-liturgies/[id]/page.tsx`
5. Edit Page - `src/app/(main)/mass-liturgies/[id]/edit/page.tsx`
6. Form Wrapper - `src/app/(main)/mass-liturgies/mass-liturgy-form-wrapper.tsx`
7. Unified Form - `src/app/(main)/mass-liturgies/mass-liturgy-form.tsx`
8. View Client - `src/app/(main)/mass-liturgies/[id]/mass-liturgy-view-client.tsx`

**Additional Routes:**
- Roster View - `src/app/(main)/mass-liturgies/[id]/roster/page.tsx`
- Print Roster - `src/app/print/mass-liturgies/[id]/roster/page.tsx`
- Mass Scheduling Wizard - `src/app/(main)/mass-liturgies/schedule/page.tsx`

**Current Features:**
- Basic CRUD operations
- People picker for presider/homilist with group-based filtering
- Liturgical event picker
- Text fields for announcements, petitions, notes
- Mass Intentions (separate module, linked via calendar_event)
- Roster generation showing all Mass times for a liturgical day
- Print/PDF/Word export for rosters

---

## Mass Components

### Liturgical Elements

**Before Mass:**
- Pre-Mass announcements (person + topic)
- Music/hymn selection
- Sacristan preparation checklist

**Introductory Rites:**
- Entrance hymn
- Greeting
- Penitential Act
- Gloria (seasonal)
- Collect (Opening Prayer)

**Liturgy of the Word:**
- First Reading (+ Psalm for Sundays/Solemnities)
- Responsorial Psalm
- Second Reading (Sundays/Solemnities only)
- Gospel Acclamation
- Gospel
- Homily
- Profession of Faith (Creed - Sundays/Solemnities)
- Prayers of the Faithful (Petitions)

**Liturgy of the Eucharist:**
- Preparation of Gifts
- Offertory hymn
- Eucharistic Prayer
- Communion Rite
- Communion hymn
- Prayer After Communion

**Concluding Rites:**
- Announcements
- Blessing
- Dismissal
- Closing hymn

### Non-Liturgical Elements

**Operational:**
- Temperature/climate control
- AV/sound system setup
- Lighting
- Accessibility accommodations
- COVID protocols (if applicable)
- Special event coordination (First Communion, Confirmation, etc.)

**Administrative:**
- Collection counting team
- Bulletin preparation
- Hospitality (coffee, donuts, etc.)
- Security/safety team

---

## Implementation Priorities

### Critical Path (Must Have for Launch)
1. **Role Assignment UI** - Coordinators need to assign ministers to roles
2. **Minister Confirmation** - Ministers need to confirm assignments
3. **Basic Notifications** - Email notifications for assignments and reminders
4. **Template System** - Define standard role configurations

### High Priority (Should Have Soon)
1. **Substitute Requests** - Ministers need ability to find substitutes
2. **Role Membership Management** - Add/remove people from roles, manage active status
3. **Blackout Date Management** - UI for ministers to set unavailable periods
4. **Minister List** - View all ministers and their role memberships

### Medium Priority (Nice to Have)
1. **Auto-Assignment** - Suggest assignments based on role membership and blackout dates
2. **Reporting** - Track minister participation and role coverage
3. **Calendar Integration** - .ics files for email notifications

### Low Priority (Future)
1. **SMS Notifications** - For urgent changes
2. **Mobile App** - Native mobile experience
3. **Advanced Analytics** - Predictive scheduling, trend analysis

---

## Notes & Considerations

### Design Principles
- **Simplicity First** - Don't overwhelm coordinators or ministers with complexity
- **Mobile-Friendly** - Ministers check notifications on phones
- **Minimal Clicks** - Confirm/decline should be one-click actions
- **Clear Status** - Always know what's filled, what's pending, what needs attention
- **Respectful Communication** - Not spammy, appropriate frequency, easy to opt-out

### Security & Privacy
- Ministers can only see their own assignments and open substitute requests
- Coordinators can see all assignments for their parish
- Contact info (email/phone) privacy settings
- Role-based access control (ministers vs coordinators vs admins)

### Scalability
- System should handle 100+ ministers per parish
- Support 20+ Masses per week
- Historical data retention (1+ years of assignments)
- Performance optimization for large parishes

### Edge Cases
- Minister assigned to multiple roles in same Mass
- Last-minute cancellations (day-of)
- No active role members available for assignment
- Minister on blackout dates but needed urgently
- Bilingual Mass coverage
- Minister leaves parish (mark memberships inactive, archive assignments)

---

## Related Documentation

**Mass Module Specific:**
- **[MASSES_ROLE_SYSTEM.md](./MASSES_ROLE_SYSTEM.md)** - Role definitions, templates, membership
- **[MASSES_SCHEDULING.md](./MASSES_SCHEDULING.md)** - Individual and bulk scheduling workflows
- **[MASSES_UI.md](./MASSES_UI.md)** - Minister and coordinator UI specifications
- **[MASSES_DATABASE.md](./MASSES_DATABASE.md)** - Complete schema reference
- **[MASSES_SERVER_ACTIONS.md](./MASSES_SERVER_ACTIONS.md)** - Server action reference

**General Patterns:**
- [MODULE_COMPONENT_PATTERNS.md](../MODULE_COMPONENT_PATTERNS.md) - Standard 9-file module structure
- [FORMS.md](../FORMS.md) - Form patterns and component usage
- [COMPONENT_REGISTRY.md](../COMPONENT_REGISTRY.md) - Reusable components

---

**Last Updated:** 2025-12-02
**Status:** Active Development
**Current Focus:** Bulk scheduling wizard (implemented), enhanced assignment UI (planned)
