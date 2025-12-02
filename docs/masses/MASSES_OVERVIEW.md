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

**Core Tables:**
- ✅ `masses` - Individual Mass events
- ✅ `mass_roles` - Role definitions (Lector, Usher, etc.)
- ✅ `mass_roles_templates` - Template containers
- ✅ `mass_roles_template_items` - Role requirements per template
- ✅ `mass_role_instances` - Actual role assignments
- ✅ `mass_role_members` - People serving in roles (simple membership)
- ✅ `person_blackout_dates` - Unavailability tracking

**Features:**
- ✅ Standard 9-file module structure (CRUD operations)
- ✅ Event picker integration
- ✅ People picker for presider/homilist
- ✅ Liturgical event picker
- ✅ Mass Intentions (separate module, linked via event)
- ✅ Bulk scheduling wizard with auto-assignment algorithm

**Auto-Assignment Algorithm:**
- ✅ Role membership filtering (`mass_role_members`)
- ✅ Blackout date checking (`person_blackout_dates`)
- ✅ Conflict detection (double-booking prevention)
- ✅ Workload balancing across ministers
- See [MASSES_SCHEDULING.md](./MASSES_SCHEDULING.md) for details

### What's Not Yet Implemented ⏳

- ❌ Role assignment UI in Mass form (currently basic)
- ❌ Confirmation workflow (ministers confirm/decline assignments)
- ❌ Substitute request system
- ❌ Email/SMS notifications
- ❌ Minister self-service portal
- ❌ Assignment history tracking and reporting

### Database Tables (Implemented)

**`masses` table:**
- `id` - UUID primary key
- `parish_id` - Foreign key to parishes
- `event_id` - Foreign key to events (date/time/location)
- `presider_id` - Foreign key to people (priest/deacon presiding)
- `homilist_id` - Foreign key to people (who gives homily)
- `liturgical_event_id` - Foreign key to global_liturgical_events (liturgical calendar)
- `mass_roles_template_id` - Foreign key to mass_roles_templates
- `pre_mass_announcement_id` - Foreign key to people (who makes pre-Mass announcement)
- `pre_mass_announcement_topic` - Text field for announcement topic
- `status` - Text (e.g., 'PLANNING', 'SCHEDULED', 'COMPLETED')
- `mass_template_id` - Text (for different Mass types/templates)
- `announcements` - Text (Mass announcements)
- `note` - Text (internal notes)
- `petitions` - Text (prayers of the faithful)
- `created_at`, `updated_at` - Timestamps

**See [MASSES_DATABASE.md](./MASSES_DATABASE.md) for complete schema reference.**

### Current Module Structure (Implemented)

**Standard 9-file pattern:**
1. List Page - `src/app/(main)/masses/page.tsx`
2. List Client - `src/app/(main)/masses/masses-list-client.tsx`
3. Create Page - `src/app/(main)/masses/create/page.tsx`
4. View Page - `src/app/(main)/masses/[id]/page.tsx`
5. Edit Page - `src/app/(main)/masses/[id]/edit/page.tsx`
6. Form Wrapper - `src/app/(main)/masses/mass-form-wrapper.tsx`
7. Unified Form - `src/app/(main)/masses/mass-form.tsx`
8. View Client - `src/app/(main)/masses/[id]/mass-view-client.tsx`
9. Form Actions - `src/app/(main)/masses/[id]/mass-form-actions.tsx`

**Current Features:**
- Basic CRUD operations
- Event picker integration
- People picker for presider/homilist
- Liturgical event picker
- Text fields for announcements, petitions, notes
- Mass Intentions (separate module, linked via event)

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
