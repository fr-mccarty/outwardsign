# MASSES.md

> **Purpose:** This document defines the Mass module architecture, components, and future features for complete Mass scheduling, role management, and communication workflows.

## Table of Contents

- [Overview](#overview)
- [Current Implementation](#current-implementation)
- [Mass Components](#mass-components)
- [Role System Architecture](#role-system-architecture)
- [Template System](#template-system)
- [Scheduling & Assignment](#scheduling--assignment)
- [Communication System](#communication-system)
- [Substitute Management](#substitute-management)
- [Preference Management](#preference-management)
- [User Interfaces](#user-interfaces)
- [Database Schema](#database-schema)
- [Future Enhancements](#future-enhancements)

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

## Current Implementation

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

**`mass_roles_templates` table:**
- `id` - UUID primary key
- `parish_id` - Foreign key to parishes
- `name` - Text (e.g., "Sunday Mass - Full", "Weekday Mass - Simple")
- `description` - Text
- `note` - Text (internal notes)
- `parameters` - JSONB (flexible configuration for role requirements)
- `created_at`, `updated_at` - Timestamps

**`mass_roles` table (junction):**
- `id` - UUID primary key
- `mass_id` - Foreign key to masses
- `person_id` - Foreign key to people
- `role_id` - Foreign key to roles
- `parameters` - JSONB (role-specific configuration)
- `created_at`, `updated_at` - Timestamps
- `UNIQUE(mass_id, person_id, role_id)` - Prevents duplicate assignments

### Server Actions (Implemented)

**File:** `src/lib/actions/masses.ts`

**Available Functions:**
- `getMasses(filters?)` - Fetch masses with presider/homilist/event relations
- `getMassesPaginated(params?)` - Paginated mass list
- `getMass(id)` - Fetch single mass
- `getMassWithRelations(id)` - Fetch mass with ALL relations (event, presider, homilist, liturgical_event, mass_roles_template, pre_mass_announcement_person, mass_roles array)
- `createMass(data)` - Create new mass
- `updateMass(id, data)` - Update mass
- `deleteMass(id)` - Delete mass

**TypeScript Interfaces:**
- `Mass` - Base mass type
- `MassWithNames` - Mass with presider/homilist/event names
- `MassWithRelations` - Mass with all related data including mass_roles array
- `CreateMassData` - Create payload
- `UpdateMassData` - Update payload (all optional)

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

## Role System Architecture

### Standard Liturgical Roles

**Currently NOT tracked in system (needs implementation):**

**1. Extraordinary Eucharistic Ministers (EEMs)**
- **Responsibilities:** Distribute Communion (Body and/or Blood of Christ)
- **Typical Number:** 4-8 ministers (varies by parish size and Communion under both species)
- **Required vs Extra:** Usually a fixed number required, extras on standby
- **Scheduling Notes:** Need training/certification, may have preferences for chalice vs host

**2. Lectors (Readers)**
- **Responsibilities:** Proclaim Scripture readings (except Gospel), lead Prayers of the Faithful
- **Typical Number:** 2-3 (First Reading, Second Reading if applicable, Petitions)
- **Required vs Extra:** 1-2 required minimum, may have backup
- **Scheduling Notes:** Should prepare readings in advance, may need bilingual lectors

**3. Altar Servers**
- **Responsibilities:** Assist priest at altar (carry cross, candles, hold book, prepare gifts, etc.)
- **Typical Number:** 2-4 servers (varies by Mass type)
- **Required vs Extra:** Minimum 1, ideal 2+
- **Scheduling Notes:** Often youth/teens, need training, may have master of ceremonies role

**4. Ushers/Greeters**
- **Responsibilities:** Welcome parishioners, distribute bulletins, take collection, direct Communion lines, handle emergencies
- **Typical Number:** 4-8 (varies by church size)
- **Required vs Extra:** Sufficient to cover all entrances and collection
- **Scheduling Notes:** May have head usher coordinating team

**5. Sacristans**
- **Responsibilities:** Prepare altar, vestments, sacred vessels before Mass; clean up after
- **Typical Number:** 1-2 per Mass
- **Required vs Extra:** 1 required minimum
- **Scheduling Notes:** Need access to sacristy, detailed knowledge of Mass preparation

**6. Music Ministers**
- **Responsibilities:** Lead congregational singing, provide instrumental accompaniment
- **Typical Roles:**
  - Music Director/Cantor (leads singing)
  - Organist/Pianist (accompaniment)
  - Choir members (4-20+ depending on parish)
  - Instrumentalists (guitar, violin, etc.)
- **Required vs Extra:** Varies greatly by parish tradition and Mass type
- **Scheduling Notes:** Often separate scheduling system for choir, may need separate rehearsals

**7. Gift Bearers (Offertory Procession)**
- **Responsibilities:** Bring bread, wine, and collection to altar
- **Typical Number:** 2-4 people (often family or special group)
- **Required vs Extra:** Nice to have, not strictly required
- **Scheduling Notes:** Often assigned to families celebrating occasions (baptism, anniversary, etc.)

**8. Hospitality Ministers**
- **Responsibilities:** Post-Mass fellowship (coffee, donuts), welcome newcomers
- **Typical Number:** 2-6 volunteers
- **Required vs Extra:** Extra (not part of Mass liturgy)
- **Scheduling Notes:** May be separate team from ushers

**9. Technology/AV Ministers**
- **Responsibilities:** Manage sound system, livestream, projection screens, recording
- **Typical Number:** 1-2 per Mass
- **Required vs Extra:** Required for parishes with AV systems
- **Scheduling Notes:** Need technical training, often youth/young adults

**10. Other Specialized Roles:**
- Master of Ceremonies (for solemn Masses)
- Thurifer (incense bearer)
- Crucifer (cross bearer)
- Torch bearers
- Book bearer

### Role Configuration Requirements

**For each role, we need to track:**

1. **Role Definition:**
   - Role name (e.g., "Lector", "EEM - Host", "EEM - Chalice", "Altar Server")
   - Description
   - Required training/certification
   - Age requirements (if applicable)
   - Active/inactive status

2. **Template Requirements (per Mass type):**
   - Number required (e.g., "2 lectors required")
   - Number desired (e.g., "3 lectors ideal")
   - Maximum allowed (e.g., "4 lectors max")
   - Priority/criticality (critical, important, optional)
   - Default assignments (if any)

3. **Person-Role Relationship:**
   - Training completion status
   - Certification date (if applicable)
   - Preference level (preferred, willing, not available)
   - Special notes (e.g., "Prefers 10:30 AM Mass", "Bilingual - Spanish")

---

## Template System

### Mass Type Templates

**Purpose:** Define standard role configurations for different types of Masses.

**Template Examples:**

**1. Sunday Mass - Full (Choir)**
- Presider: 1 priest/deacon (required)
- Homilist: 1 (usually presider, could be different)
- Lectors: 3 (First Reading, Second Reading, Petitions) - required
- EEMs: 8 (4 host, 4 chalice) - required
- Altar Servers: 4 (2 required, 4 ideal)
- Ushers: 6 - required
- Sacristan: 1 - required
- Music Director/Cantor: 1 - required
- Organist/Pianist: 1 - required
- Choir: 12-20 - optional
- Gift Bearers: 2-4 - optional
- AV Tech: 1 - required (if livestreaming)

**2. Sunday Mass - Simple (No Choir)**
- Presider: 1 - required
- Homilist: 1 - required
- Lectors: 3 - required
- EEMs: 4 - required
- Altar Servers: 2 - required
- Ushers: 4 - required
- Sacristan: 1 - required
- Cantor: 1 - required
- Organist: 1 - optional
- Gift Bearers: 2 - optional

**3. Weekday Mass**
- Presider: 1 - required
- Lector: 1 - required
- EEMs: 2 - required
- Altar Server: 1 - required (optional in some parishes)
- Sacristan: 1 - required
- Ushers: 0-2 - optional

**4. Bilingual Mass (Spanish/English)**
- Same as Sunday Mass, but:
- Bilingual Lectors required (or separate Spanish/English lectors)
- Bilingual Cantor/Music Director required
- May need translation support for announcements

**5. Special Event Mass (First Communion, Confirmation, etc.)**
- Enhanced roles for ceremony
- Additional ushers for crowd management
- Special ministers for sacramental elements
- Photographer/videographer coordination

### Template Data Structure

**Current implementation:** `mass_roles_templates.parameters` is JSONB (flexible but undefined)

**Proposed structure for `parameters` field:**

```json
{
  "roles": [
    {
      "role_id": "uuid-of-role",
      "role_name": "Lector",
      "min_required": 2,
      "ideal_count": 3,
      "max_allowed": 4,
      "priority": "critical",
      "notes": "One for First Reading, one for Second Reading, one for Petitions",
      "auto_assign": false,
      "substitution_allowed": true,
      "advance_notice_days": 7
    },
    {
      "role_id": "uuid-of-eem-role",
      "role_name": "Extraordinary Eucharistic Minister",
      "min_required": 4,
      "ideal_count": 6,
      "max_allowed": 8,
      "priority": "critical",
      "notes": "Even split between host and chalice distribution",
      "sub_roles": [
        {
          "name": "Host Distribution",
          "count": 3
        },
        {
          "name": "Chalice Distribution",
          "count": 3
        }
      ],
      "auto_assign": false,
      "substitution_allowed": true,
      "advance_notice_days": 7
    }
  ],
  "liturgical_settings": {
    "language": "en",
    "bilingual": false,
    "music_style": "choir",
    "communion_under_both_species": true,
    "incense": false
  },
  "timing": {
    "typical_duration_minutes": 75,
    "arrival_time_minutes_before": 15
  }
}
```

### Template Management UI (To Be Built)

**Features needed:**
1. Create/Edit templates
2. Clone template (copy and modify)
3. Set default template for parish
4. Template library (share across parishes - future)
5. Role requirement builder (drag-and-drop or form-based)
6. Validation (ensure critical roles are covered)

---

## Scheduling & Assignment

### Assignment Workflow

**1. Create Mass Event**
- Select date/time (via Event Picker)
- Select location (church/chapel)
- Select liturgical calendar date (auto-populated or manual)
- Select Mass template (or start blank)

**2. Assign Presider/Homilist**
- Required for every Mass
- Use People Picker filtered by role (priest/deacon)

**3. Assign Ministers (Role-by-Role)**
- Template pre-populates role requirements
- For each role:
  - View required count
  - View list of qualified people
  - See availability/preferences
  - Assign person(s)
  - Mark as confirmed/tentative
  - Add notes

**4. Auto-Assignment (Future Feature)**
- Algorithm to suggest assignments based on:
  - Availability preferences
  - Recent assignment history (rotate fairly)
  - Training/certification status
  - Language requirements (for bilingual Masses)
  - Preference level (preferred > willing > available)

**5. Confirmation & Communication**
- Send notifications to assigned ministers
- Track confirmation status
- Send reminders as Mass approaches

### Assignment Status Tracking

**Per assignment in `mass_roles` table:**
- `status`: 'ASSIGNED' | 'CONFIRMED' | 'DECLINED' | 'SUBSTITUTE_REQUESTED' | 'SUBSTITUTE_FOUND' | 'NO_SHOW'
- `confirmed_at`: Timestamp when minister confirmed
- `notified_at`: Timestamp when notification sent
- `notes`: Any assignment-specific notes

**Proposed additional fields for `mass_roles` table:**
```sql
ALTER TABLE mass_roles ADD COLUMN status TEXT DEFAULT 'ASSIGNED';
ALTER TABLE mass_roles ADD COLUMN confirmed_at TIMESTAMPTZ;
ALTER TABLE mass_roles ADD COLUMN notified_at TIMESTAMPTZ;
ALTER TABLE mass_roles ADD COLUMN notes TEXT;
```

---

## Communication System

### Notification Types

**1. Initial Assignment Notification**
- Sent when minister is first assigned to Mass
- Includes: Mass date/time, location, role, template details
- Action: Confirm or Request Substitute
- Delivery: Email + in-app notification

**2. Reminder Notifications**
- Sent X days before Mass (configurable per role)
- Default: 7 days, 3 days, 1 day before
- Includes: Mass details, role details, preparation notes
- Action: Confirm attendance or Request Substitute

**3. Substitute Request Notifications**
- Sent to eligible substitutes when someone requests replacement
- Includes: Mass details, role, original assignee (optional)
- Action: Accept or Decline
- Delivery: Email + in-app notification + SMS (optional)

**4. Substitute Found Notification**
- Sent to original assignee confirming substitute found
- Sent to substitute confirming acceptance

**5. Last-Minute Changes**
- Urgent notification for day-of changes
- Delivery: SMS + email + in-app (all channels)

**6. Post-Mass Follow-Up**
- Thank you message
- Feedback request (optional)
- Report any issues (no-shows, etc.)

### Communication Channels

**Email:**
- Primary channel for all notifications
- Template-based with parish branding
- Include calendar invite (.ics file) for assignments

**In-App Notifications:**
- Bell icon in app header
- Notification center
- Badge counts

**SMS (Optional, Future):**
- Requires phone number + opt-in
- For urgent/last-minute only
- Integration with Twilio or similar

**Calendar Integration:**
- Generate .ics files for email
- Direct integration with Google Calendar (future)
- Direct integration with Apple Calendar (future)

### Message Templates

**Template Variables:**
- `{minister_name}` - Assigned minister's name
- `{mass_date}` - Date of Mass
- `{mass_time}` - Time of Mass
- `{location}` - Church/chapel name
- `{role}` - Minister's role
- `{presider_name}` - Presiding priest/deacon
- `{confirmation_link}` - Link to confirm assignment
- `{substitute_request_link}` - Link to request substitute
- `{preparation_notes}` - Role-specific preparation notes

**Sample Template (Initial Assignment):**
```
Subject: Mass Assignment - {role} on {mass_date}

Dear {minister_name},

You have been scheduled to serve as {role} for Mass on {mass_date} at {mass_time} at {location}.

Presider: {presider_name}

Please confirm your availability or request a substitute by clicking below:
- Confirm: {confirmation_link}
- Request Substitute: {substitute_request_link}

{preparation_notes}

Thank you for your ministry!

[Parish Name] Liturgy Team
```

---

## Substitute Management

### Substitute Request Workflow

**1. Minister Requests Substitute**
- Minister clicks "Request Substitute" in notification or app
- Optionally provide reason (illness, travel, conflict, etc.)
- System marks assignment as 'SUBSTITUTE_REQUESTED'

**2. System Identifies Eligible Substitutes**
- Query for people with same role certification
- Filter by availability preferences (if set)
- Exclude recently assigned (rotation fairness)
- Sort by preference level and recency

**3. Notify Eligible Substitutes**
- Send substitute request notification to eligible people
- First-come-first-served OR coordinator approval
- Include deadline for response (e.g., 24 hours)

**4. Substitute Accepts**
- Substitute clicks "Accept" in notification
- System creates new `mass_roles` entry for substitute
- Original assignment marked as 'SUBSTITUTE_FOUND'
- Both parties notified

**5. No Substitute Found**
- If deadline passes with no acceptance:
  - Escalate to liturgy coordinator
  - Coordinator manually finds substitute or reassigns

**6. Coordinator Override**
- Coordinators can manually assign substitutes at any time
- Can bypass automated process for urgent needs

### Substitute Database Structure

**New table: `mass_role_substitutions`**
```sql
CREATE TABLE mass_role_substitutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_mass_role_id UUID NOT NULL REFERENCES mass_roles(id) ON DELETE CASCADE,
  substitute_mass_role_id UUID REFERENCES mass_roles(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  requested_by UUID NOT NULL REFERENCES people(id),
  reason TEXT,
  substitute_found_at TIMESTAMPTZ,
  substitute_person_id UUID REFERENCES people(id),
  status TEXT DEFAULT 'REQUESTED', -- 'REQUESTED' | 'FOUND' | 'NOT_FOUND' | 'CANCELLED'
  coordinator_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
```sql
CREATE INDEX idx_substitutions_original_role ON mass_role_substitutions(original_mass_role_id);
CREATE INDEX idx_substitutions_substitute_role ON mass_role_substitutions(substitute_mass_role_id);
CREATE INDEX idx_substitutions_status ON mass_role_substitutions(status);
```

---

## Preference Management

### Minister Availability Preferences

**Purpose:** Allow ministers to set their general availability preferences to improve scheduling efficiency.

### Preference Types

**1. Day of Week Preferences**
- Preferred days (e.g., "I prefer Sundays at 10:30 AM")
- Available days (e.g., "I'm available for weekday Masses")
- Unavailable days (e.g., "Never schedule me for Saturday evening")

**2. Time Preferences**
- Preferred times (e.g., "Morning Masses only")
- Available times (e.g., "Willing to do evening Masses occasionally")
- Unavailable times (e.g., "Not available before 9:00 AM")

**3. Frequency Preferences**
- Desired frequency (e.g., "Once per month", "Twice per month", "Weekly")
- Maximum frequency (e.g., "No more than 2x per month")
- Blackout dates (specific dates unavailable - vacation, etc.)

**4. Role Preferences**
- Primary role (e.g., "Lector - First Reading")
- Secondary roles (e.g., "Willing to do Petitions if needed")
- Not willing to do (e.g., "Not available for EEM")

**5. Language Preferences**
- Language abilities (e.g., "English fluent", "Spanish intermediate")
- Willing to serve at bilingual Masses

**6. Special Preferences**
- Notes (e.g., "Prefer to serve with spouse", "Need wheelchair access")

### Preference Database Structure

**New table: `minister_preferences`**
```sql
CREATE TABLE minister_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE, -- NULL = general preferences

  -- Day/Time preferences
  preferred_days JSONB, -- ["SUNDAY", "SATURDAY"]
  available_days JSONB, -- ["MONDAY", "WEDNESDAY"]
  unavailable_days JSONB, -- ["FRIDAY"]
  preferred_times JSONB, -- ["09:00-12:00", "17:00-19:00"]
  unavailable_times JSONB, -- ["06:00-08:00"]

  -- Frequency preferences
  desired_frequency TEXT, -- 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'OCCASIONAL'
  max_per_month INTEGER, -- Maximum assignments per month

  -- Language
  languages JSONB, -- [{"language": "en", "level": "fluent"}, {"language": "es", "level": "intermediate"}]

  -- Special notes
  notes TEXT,

  -- Active status
  active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(person_id, parish_id, role_id)
);
```

**New table: `minister_blackout_dates`**
```sql
CREATE TABLE minister_blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (end_date >= start_date)
);
```

**Indexes:**
```sql
CREATE INDEX idx_minister_prefs_person ON minister_preferences(person_id);
CREATE INDEX idx_minister_prefs_parish ON minister_preferences(parish_id);
CREATE INDEX idx_minister_prefs_role ON minister_preferences(role_id);
CREATE INDEX idx_blackout_person ON minister_blackout_dates(person_id);
CREATE INDEX idx_blackout_dates ON minister_blackout_dates(start_date, end_date);
```

### Preference Management UI (To Be Built)

**Minister Self-Service Portal:**
1. **My Availability** page
   - Set day/time preferences
   - Set frequency preferences
   - Manage blackout dates
   - Role preferences

2. **My Assignments** page
   - Upcoming assignments (calendar view)
   - Past assignments (history)
   - Request substitute button
   - Confirm/decline assignments

3. **Substitute Requests** page
   - Open substitute requests I can fill
   - Accept/decline substitute requests
   - My substitute history

**Coordinator Interface:**
1. **Minister Directory**
   - Filter by role, availability, language
   - View minister preferences
   - Override preferences for individual assignments

2. **Assignment Dashboard**
   - Unfilled roles highlighted
   - Suggested assignments based on preferences
   - Drag-and-drop assignment interface

3. **Substitute Management**
   - Pending substitute requests
   - Manually assign substitutes
   - Contact ministers directly

---

## User Interfaces

### Minister-Facing UI

**Pages to Build:**

**1. My Ministry Dashboard** (`/my-ministry`)
- Overview of upcoming assignments
- Calendar view of my scheduled Masses
- Quick actions: Confirm, Request Substitute
- Notifications/alerts

**2. My Assignments** (`/my-ministry/assignments`)
- List view of upcoming assignments
- Past assignments
- Assignment details (Mass info, role, other ministers)
- Actions: Confirm, Decline, Request Substitute

**3. My Availability** (`/my-ministry/availability`)
- Preference settings form
- Blackout dates calendar
- Role preferences

**4. Substitute Requests** (`/my-ministry/substitutes`)
- Open requests I can fill
- My substitute history
- Accept/decline actions

**5. My Training** (`/my-ministry/training`)
- Certification status
- Training completion dates
- Renewal requirements

### Coordinator-Facing UI

**Pages to Build:**

**1. Mass Schedule** (`/masses`)
- Existing list view enhanced with role assignment status
- Color coding: Fully staffed (green), Partially staffed (yellow), Unstaffed (red)
- Quick stats: Unfilled roles, pending confirmations

**2. Mass Detail/Edit** (`/masses/[id]` or `/masses/[id]/edit`)
- Enhanced form with role assignment section
- For each role from template:
  - Show required count
  - Assign people (searchable dropdown)
  - Status badges (confirmed, pending, declined)
  - Quick actions: Notify, Remind, Find Substitute

**3. Mass Role Assignment Grid** (`/masses/[id]/assignments`)
- Table view:
  - Rows: Roles
  - Columns: Assigned person(s), Status, Actions
- Drag-and-drop interface (future)
- Bulk actions: Notify all, Confirm all

**4. Minister Directory** (`/ministers`)
- Filterable list of all ministers
- Columns: Name, Roles, Preferences, Recent Assignments, Status
- Actions: View Preferences, Assign to Mass, Contact

**5. Minister Detail** (`/ministers/[id]`)
- Minister profile
- Roles and certifications
- Availability preferences
- Assignment history
- Communication log

**6. Template Management** (`/mass-templates`)
- List of templates
- Create/Edit/Clone/Delete templates
- Role requirement builder

**7. Substitute Management** (`/substitutes`)
- Pending substitute requests
- Filter by date, role, status
- Manually assign substitutes
- Communication tools

**8. Reports** (`/reports/masses`)
- Minister participation reports
- Role coverage reports
- No-show tracking
- Communication effectiveness

---

## Database Schema

### Current Tables (Implemented)

See [Current Implementation](#current-implementation) section above.

### Proposed New Tables

**1. `minister_preferences`** - See [Preference Management](#preference-management)

**2. `minister_blackout_dates`** - See [Preference Management](#preference-management)

**3. `mass_role_substitutions`** - See [Substitute Management](#substitute-management)

**4. `mass_role_notifications`** (Optional - for tracking communication)
```sql
CREATE TABLE mass_role_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mass_role_id UUID NOT NULL REFERENCES mass_roles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'ASSIGNMENT' | 'REMINDER' | 'SUBSTITUTE_REQUEST' | 'CONFIRMATION' | 'CHANGE'
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivery_method TEXT NOT NULL, -- 'EMAIL' | 'SMS' | 'IN_APP'
  status TEXT DEFAULT 'SENT', -- 'SENT' | 'DELIVERED' | 'FAILED' | 'OPENED' | 'CLICKED'
  recipient_email TEXT,
  recipient_phone TEXT,
  message_body TEXT,
  metadata JSONB, -- For tracking opens, clicks, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Proposed Table Modifications

**Modify `mass_roles` table:**
```sql
-- Add status tracking
ALTER TABLE mass_roles ADD COLUMN status TEXT DEFAULT 'ASSIGNED';
ALTER TABLE mass_roles ADD COLUMN confirmed_at TIMESTAMPTZ;
ALTER TABLE mass_roles ADD COLUMN notified_at TIMESTAMPTZ;
ALTER TABLE mass_roles ADD COLUMN notes TEXT;

-- Add indexes
CREATE INDEX idx_mass_roles_status ON mass_roles(status);
```

**Modify `people` table (if needed for contact preferences):**
```sql
-- Add communication preferences
ALTER TABLE people ADD COLUMN notification_email TEXT;
ALTER TABLE people ADD COLUMN notification_phone TEXT;
ALTER TABLE people ADD COLUMN sms_opt_in BOOLEAN DEFAULT false;
ALTER TABLE people ADD COLUMN email_opt_in BOOLEAN DEFAULT true;
```

---

## Future Enhancements

### Phase 1 (Immediate Needs)
- [ ] Role assignment UI in Mass form
- [ ] Basic notification system (email)
- [ ] Confirmation workflow (confirm/decline)
- [ ] Template role configuration UI
- [ ] Minister directory

### Phase 2 (Short Term)
- [ ] Substitute request workflow
- [ ] Minister preference management
- [ ] Blackout dates
- [ ] Assignment history tracking
- [ ] Basic reporting

### Phase 3 (Medium Term)
- [ ] Auto-assignment algorithm
- [ ] SMS notifications
- [ ] Calendar integration (.ics files)
- [ ] Drag-and-drop assignment interface
- [ ] Mobile-optimized minister portal

### Phase 4 (Long Term)
- [ ] Mobile app (iOS/Android)
- [ ] Advanced analytics/reporting
- [ ] AI-powered scheduling suggestions
- [ ] Multi-parish coordination (for shared ministers)
- [ ] Integration with parish management systems
- [ ] Music ministry scheduling (separate module)
- [ ] Training/certification tracking module
- [ ] Volunteer hour tracking for ministers

### Advanced Features (Future Vision)
- [ ] Real-time collaboration (multiple coordinators)
- [ ] Version history for Mass assignments
- [ ] Template sharing marketplace
- [ ] Automated reminder escalation
- [ ] No-show tracking and analytics
- [ ] Minister appreciation/recognition system
- [ ] Integration with liturgical calendar API for automatic Mass creation
- [ ] Bilingual support throughout interface
- [ ] Accessibility features (screen reader optimization, high contrast, keyboard navigation)

---

## Implementation Priorities

### Critical Path (Must Have for Launch)
1. **Role Assignment UI** - Coordinators need to assign ministers to roles
2. **Minister Confirmation** - Ministers need to confirm assignments
3. **Basic Notifications** - Email notifications for assignments and reminders
4. **Template System** - Define standard role configurations

### High Priority (Should Have Soon)
1. **Substitute Requests** - Ministers need ability to find substitutes
2. **Preference Management** - Ministers set availability preferences
3. **Minister Directory** - View all ministers and their roles/preferences

### Medium Priority (Nice to Have)
1. **Auto-Assignment** - Suggest assignments based on preferences
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
- No qualified substitutes available
- Minister preferences conflict with parish needs
- Bilingual Mass coverage
- Minister leaves parish (archive assignments)

---

## Related Documentation

- [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md) - Standard 9-file module structure
- [FORMS.md](./FORMS.md) - Form patterns and component usage
- [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) - Reusable components
- [PICKER_PATTERNS.md](./PICKER_PATTERNS.md) - Picker modal behavior

---

**Last Updated:** 2025-11-15
**Status:** Planning/Architecture Document
**Next Steps:** Begin Phase 1 implementation (Role Assignment UI)
