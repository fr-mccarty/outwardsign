# Phase 1 - Mass Role Scheduling Implementation

**Status:** In Progress
**Last Updated:** 2025-11-18

## Overview

This task list covers the implementation of Phase 1 mass role scheduling features as defined in ROADMAP.md and MASSES.md. These features enable parishes to manage people serving in liturgical mass roles, their preferences, assignments, and communication workflows.

---

## ✅ Completed Tasks

### 1. Mass Roles Management UI
- [x] Create `/mass-roles` module with full CRUD operations
- [x] 9-file module structure (list, create, view, edit, form, actions)
- [x] Role definition fields (name, description, active status, display order)
- [x] Delete protection (prevent deletion if role is in use)
- [x] Search functionality
- [x] Permission-based access control
- [x] Add to sidebar navigation
- [x] Build passes successfully

---

## ✅ Completed Tasks (Continued)

### 2. Mass Role Preferences Database Tables

**Goal:** Create database tables to store availability preferences, blackout dates, and role preferences for people serving in mass roles.

**Database Tables to Create:**

#### 2.1 `mass_role_preferences` table
```sql
CREATE TABLE mass_role_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  mass_role_id UUID REFERENCES mass_roles(id) ON DELETE CASCADE,

  -- Day/Time preferences
  preferred_days JSONB, -- ["SUNDAY", "SATURDAY"]
  available_days JSONB, -- ["MONDAY", "WEDNESDAY"]
  unavailable_days JSONB, -- ["FRIDAY"]
  preferred_times JSONB, -- ["09:00-12:00", "17:00-19:00"]
  unavailable_times JSONB, -- ["06:00-08:00"]

  -- Frequency preferences
  desired_frequency TEXT, -- 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'OCCASIONAL'
  max_per_month INTEGER,

  -- Language
  languages JSONB, -- [{"language": "en", "level": "fluent"}]

  -- Special notes
  notes TEXT,

  -- Active status
  active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(person_id, parish_id, mass_role_id)
);
```

**Indexes:**
```sql
CREATE INDEX idx_mass_role_prefs_person ON mass_role_preferences(person_id);
CREATE INDEX idx_mass_role_prefs_parish ON mass_role_preferences(parish_id);
CREATE INDEX idx_mass_role_prefs_role ON mass_role_preferences(mass_role_id);
```

**RLS Policies:**
- Parish members can read preferences for their parish
- People can read and update their own preferences
- Staff/admins can read and update all preferences in their parish

#### 2.2 `mass_role_blackout_dates` table
```sql
CREATE TABLE mass_role_blackout_dates (
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
CREATE INDEX idx_mass_role_blackout_person ON mass_role_blackout_dates(person_id);
CREATE INDEX idx_mass_role_blackout_dates ON mass_role_blackout_dates(start_date, end_date);
```

**RLS Policies:**
- People can read and manage their own blackout dates
- Staff/admins can read all blackout dates in their parish

**Subtasks:**
- [x] Create migration file for `mass_role_preferences` table
- [x] Create migration file for `mass_role_blackout_dates` table
- [x] Add RLS policies for both tables
- [x] Test migrations locally with `npm run db:push`
- [x] Verify table creation in Supabase dashboard

---

### 3. Mass Role Preferences Server Actions

**Goal:** Create server actions for CRUD operations on mass role preferences and blackout dates.

**File:** `src/lib/actions/mass-role-preferences.ts`

**Functions to Implement:**

#### Mass Role Preferences
- [ ] `getMassRolePreferences(personId: string): Promise<MassRolePreference[]>`
- [ ] `getMassRolePreference(id: string): Promise<MassRolePreference | null>`
- [ ] `createMassRolePreference(data: CreateMassRolePreferenceData): Promise<MassRolePreference>`
- [ ] `updateMassRolePreference(id: string, data: UpdateMassRolePreferenceData): Promise<MassRolePreference>`
- [ ] `deleteMassRolePreference(id: string): Promise<void>`

#### Blackout Dates
- [ ] `getBlackoutDates(personId: string): Promise<BlackoutDate[]>`
- [ ] `getBlackoutDate(id: string): Promise<BlackoutDate | null>`
- [ ] `createBlackoutDate(data: CreateBlackoutDateData): Promise<BlackoutDate>`
- [ ] `updateBlackoutDate(id: string, data: UpdateBlackoutDateData): Promise<BlackoutDate>`
- [ ] `deleteBlackoutDate(id: string): Promise<void>`

#### Helper Functions
- [ ] `getPeopleWithRole(roleId: string): Promise<Person[]>` - Get all people with a specific role capability
- [ ] `checkAvailability(personId: string, date: Date): Promise<boolean>` - Check if person is available on a date (respects blackout dates)
- [ ] `getPersonRoleStats(personId: string): Promise<PersonRoleStats>` - Get assignment history, frequency stats

**TypeScript Interfaces:**
```typescript
interface MassRolePreference {
  id: string
  person_id: string
  parish_id: string
  mass_role_id: string | null
  preferred_days: string[] | null
  available_days: string[] | null
  unavailable_days: string[] | null
  preferred_times: string[] | null
  unavailable_times: string[] | null
  desired_frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'OCCASIONAL' | null
  max_per_month: number | null
  languages: { language: string; level: string }[] | null
  notes: string | null
  active: boolean
  created_at: string
  updated_at: string
}

interface BlackoutDate {
  id: string
  person_id: string
  start_date: string
  end_date: string
  reason: string | null
  created_at: string
}

interface PersonRoleStats {
  total_assignments: number
  assignments_this_month: number
  assignments_this_year: number
  last_assignment_date: string | null
  roles: string[]
}
```

**Subtasks:**
- [x] Create `mass-role-preferences.ts` file with all server actions
- [x] Add TypeScript interfaces to `src/lib/types.ts`
- [x] Implement all CRUD operations
- [x] Add proper error handling and validation
- [x] Test all server actions (build passes)

### 3. Mass Role Preferences Server Actions ✅ COMPLETED

See completed subtasks above.

---

## ✅ Completed Tasks (Continued)

### 4. Mass Role Directory UI ✅ COMPLETED

**Goal:** Create a UI to view all people serving in mass roles, their role capabilities, preferences, and assignment history.

**Route:** `/mass-role-directory`

**Module Structure (9 files):**
1. [ ] List Page (`src/app/(main)/mass-role-directory/page.tsx`) - Server component
2. [ ] List Client (`src/app/(main)/mass-role-directory/mass-role-directory-list-client.tsx`) - Search/filter UI
3. [ ] View Page (`src/app/(main)/mass-role-directory/[id]/page.tsx`) - Person detail view
4. [ ] View Client (`src/app/(main)/mass-role-directory/[id]/mass-role-directory-view-client.tsx`) - Display person info
5. [ ] Preferences Page (`src/app/(main)/mass-role-directory/[id]/preferences/page.tsx`) - Manage preferences
6. [ ] Preferences Form (`src/app/(main)/mass-role-directory/[id]/preferences/mass-role-preferences-form.tsx`) - Edit preferences
7. [ ] Blackout Dates Component (`src/app/(main)/mass-role-directory/[id]/preferences/blackout-dates-card.tsx`) - Manage blackout dates
8. [ ] Assignment History (`src/app/(main)/mass-role-directory/[id]/assignments/page.tsx`) - View past assignments
9. [ ] Stats Dashboard (`src/app/(main)/mass-role-directory/[id]/stats/page.tsx`) - Participation stats

**Features:**
- **List View:**
  - Search by name
  - Filter by role capability
  - Filter by availability status (active/inactive)
  - Show role badges per person
  - Show recent assignment count
  - Click to view details

- **Detail View:**
  - Personal information (from people table)
  - Assigned roles (mass roles they're qualified for)
  - Current preferences summary
  - Upcoming assignments
  - Quick actions (Edit Preferences, View History)

- **Preferences Management:**
  - Day/time preferences (checkboxes for days, time range pickers)
  - Frequency preferences (dropdown: weekly, bi-weekly, monthly, occasional)
  - Maximum assignments per month
  - Language capabilities (English fluent, Spanish intermediate, etc.)
  - Notes field
  - Active/inactive toggle

- **Blackout Dates:**
  - Calendar view of blackout periods
  - Add new blackout date (date range picker)
  - Reason field
  - Delete blackout dates
  - Highlight conflicts with existing assignments

- **Assignment History:**
  - Table of past assignments
  - Filter by date range, role
  - Sort by date (newest first)
  - Show mass date, role, location
  - Link to mass details

**Subtasks:**
- [x] Create directory structure
- [x] Implement list page (server)
- [x] Implement list client with search/filters
- [x] Create detail view page
- [x] Build preferences form
- [x] Create blackout dates management UI
- [x] Add loading and error pages
- [x] Add to sidebar navigation (under Masses section)
- [x] Test build passes successfully

**Note:** Assignment history and stats are displayed in the detail view.

---

### 5. Mass Role Self-Service Portal

**Goal:** Create a self-service portal where people serving in mass roles can view their own assignments, set preferences, and manage availability.

**Route:** `/my-mass-roles`

**Pages to Build:**

#### 5.1 Dashboard (`/my-mass-roles/page.tsx`)
- [ ] Upcoming assignments (next 3 months)
- [ ] Calendar view of assignments
- [ ] Quick stats (assignments this month, total this year)
- [ ] Pending confirmations (assignments awaiting confirmation)
- [ ] Quick actions (Set Preferences, Add Blackout Date, Request Substitute)

#### 5.2 My Assignments (`/my-mass-roles/assignments/page.tsx`)
- [ ] List of upcoming assignments
- [ ] Past assignments (history)
- [ ] Filter by date range, role
- [ ] Confirm/decline buttons (if not yet confirmed)
- [ ] Request substitute button
- [ ] Download/print schedule

#### 5.3 My Preferences (`/my-mass-roles/preferences/page.tsx`)
- [ ] Edit day/time preferences
- [ ] Set frequency preferences
- [ ] Manage blackout dates
- [ ] Update language capabilities
- [ ] Active/inactive status toggle

#### 5.4 Substitute Requests (`/my-mass-roles/substitutes/page.tsx`)
- [ ] My open substitute requests
- [ ] Available substitute opportunities (requests from others)
- [ ] Accept/decline substitute requests
- [ ] Substitute history

**Subtasks:**
- [ ] Create `/my-mass-roles` directory structure
- [ ] Build dashboard with overview
- [ ] Create assignments list/calendar view
- [ ] Build preferences editor (reuse form from mass-role-directory module)
- [ ] Implement substitute request UI
- [ ] Add navigation to sidebar
- [ ] Test all user-facing workflows

---

### 6. Substitute Management System

**Goal:** Enable people serving in mass roles to request substitutes and allow others to accept substitute requests.

**Database Table:**

#### 6.1 `mass_role_substitutions` table
```sql
CREATE TABLE mass_role_substitutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_mass_role_instance_id UUID NOT NULL REFERENCES mass_role_instances(id) ON DELETE CASCADE,
  substitute_mass_role_instance_id UUID REFERENCES mass_role_instances(id) ON DELETE SET NULL,
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
CREATE INDEX idx_substitutions_original_role ON mass_role_substitutions(original_mass_role_instance_id);
CREATE INDEX idx_substitutions_substitute_role ON mass_role_substitutions(substitute_mass_role_instance_id);
CREATE INDEX idx_substitutions_status ON mass_role_substitutions(status);
```

**Server Actions to Build:**

#### 6.2 `src/lib/actions/substitutions.ts`
- [ ] `requestSubstitute(massRoleInstanceId: string, reason?: string): Promise<Substitution>`
- [ ] `getOpenSubstituteRequests(roleId?: string): Promise<SubstitutionWithRelations[]>`
- [ ] `getMySubstituteRequests(personId: string): Promise<SubstitutionWithRelations[]>`
- [ ] `acceptSubstituteRequest(substitutionId: string, substitutPersonId: string): Promise<void>`
- [ ] `cancelSubstituteRequest(substitutionId: string): Promise<void>`
- [ ] `findEligibleSubstitutes(massRoleInstanceId: string): Promise<Person[]>` - Find people with same role who are available

**UI Components:**

#### 6.3 Request Substitute Flow
- [ ] Button in My Assignments ("Request Substitute")
- [ ] Modal with reason field
- [ ] Confirmation message
- [ ] Email notification to coordinator and eligible substitutes

#### 6.4 Accept Substitute Flow
- [ ] Available requests list in `/my-mass-roles/substitutes`
- [ ] Show mass details, role, date, reason
- [ ] Accept button
- [ ] Confirmation dialog
- [ ] Update both role instances (mark original as substituted, create new for substitute)

#### 6.5 Coordinator Management
- [ ] View all open substitute requests in `/mass-role-directory/substitutes` (admin only)
- [ ] Manually assign substitutes
- [ ] Cancel requests
- [ ] Add notes

**Subtasks:**
- [ ] Create migration for `mass_role_substitutions` table
- [ ] Build server actions for substitutions
- [ ] Create request substitute UI
- [ ] Create accept substitute UI
- [ ] Build coordinator management interface
- [ ] Test entire substitute workflow

---

### 7. Basic Notification System

**Goal:** Create email notification templates and basic sending infrastructure for mass role assignments.

#### 7.1 Email Template Structure

**File:** `src/lib/email/templates.ts`

**Templates to Create:**
- [ ] Assignment notification (initial)
- [ ] Reminder notification (X days before)
- [ ] Substitute request notification
- [ ] Substitute found confirmation
- [ ] Assignment cancelled notification

**Template Variables:**
```typescript
interface EmailTemplateData {
  person_name: string
  mass_date: string
  mass_time: string
  location: string
  role: string
  presider_name: string
  confirmation_link: string
  substitute_request_link: string
  preparation_notes?: string
}
```

#### 7.2 Email Service Integration

**Options:**
1. **Phase 1 (Free/Manual):** Generate email content, copy to clipboard
2. **Phase 2 (Automated):** Integrate with SendGrid/Mailgun/AWS SES

**For Phase 1, build:**
- [ ] Email template generator functions
- [ ] "Copy Email" button in UI
- [ ] Email preview modal
- [ ] Manual send workflow (copy and paste to their email client)

**Subtasks:**
- [ ] Create email template functions
- [ ] Add "Notify" buttons to mass role assignments
- [ ] Build email preview modal
- [ ] Create "Copy to Clipboard" functionality
- [ ] Document manual email workflow for users

---

### 8. Confirmation Workflow

**Goal:** Enable ministers to confirm or decline their assignments.

**Database Changes:**

#### 8.1 Add status fields to `mass_role_instances`
```sql
ALTER TABLE mass_role_instances ADD COLUMN status TEXT DEFAULT 'ASSIGNED';
ALTER TABLE mass_role_instances ADD COLUMN confirmed_at TIMESTAMPTZ;
ALTER TABLE mass_role_instances ADD COLUMN notified_at TIMESTAMPTZ;
ALTER TABLE mass_role_instances ADD COLUMN notes TEXT;

CREATE INDEX idx_mass_role_instances_status ON mass_role_instances(status);
```

**Status Values:** 'ASSIGNED' | 'CONFIRMED' | 'DECLINED' | 'SUBSTITUTE_REQUESTED'

**Server Actions to Update:**
- [ ] Add status field to mass role instance types
- [ ] `confirmAssignment(massRoleInstanceId: string): Promise<void>`
- [ ] `declineAssignment(massRoleInstanceId: string, reason?: string): Promise<void>`
- [ ] Update `getMassRoleInstances` to include status

**UI Updates:**
- [ ] Add status badges to assignments list
- [ ] Confirm/decline buttons in My Assignments
- [ ] Confirmation modal
- [ ] Status filter in mass role directory

**Subtasks:**
- [ ] Create migration to add status fields
- [ ] Update server actions
- [ ] Update TypeScript types
- [ ] Add UI for confirm/decline
- [ ] Test confirmation workflow

---

## 📋 Testing Checklist

After implementation, verify:
- [ ] All database migrations run successfully
- [ ] Build passes without errors
- [ ] Person can view and edit their own preferences
- [ ] Person can add/remove blackout dates
- [ ] Person can view their assignments
- [ ] Person can confirm/decline assignments
- [ ] Person can request substitutes
- [ ] Person can accept substitute requests
- [ ] Coordinator can view all people serving in mass roles
- [ ] Coordinator can edit any person's preferences
- [ ] Coordinator can manually assign substitutes
- [ ] Email templates generate correctly
- [ ] Permissions are enforced correctly
- [ ] No TypeScript errors
- [ ] No console errors in browser

---

## 🎯 Success Criteria

Phase 1 is complete when:
1. ✅ Parishes can define mass roles
2. ✅ Parishes can create mass role templates
3. ✅ Parishes can assign people to mass roles
4. ✅ People serving in mass roles can set their availability preferences
5. ✅ People serving in mass roles can add blackout dates
6. ✅ People serving in mass roles can view their assignments
7. ✅ People serving in mass roles can confirm/decline assignments
8. ✅ People serving in mass roles can request and accept substitutes
9. ✅ Coordinators can view all people serving in mass roles and their preferences
10. ✅ Basic email notification templates exist
11. ✅ All features work without errors

---

## 📚 Reference Documentation

- **ROADMAP.md** - Phase II, Section 3: Mass Roles Assignment
- **MASSES.md** - Complete architecture and Phase 1 requirements
- **MODULE_COMPONENT_PATTERNS.md** - 9-file module structure
- **FORMS.md** - Form implementation patterns
- **COMPONENT_REGISTRY.md** - Reusable components

---

## 🚀 Implementation Order

Recommended order to minimize dependencies:

1. ✅ Mass Roles UI (COMPLETED)
2. 🔄 Mass Role Preferences Database (IN PROGRESS)
3. Mass Role Preferences Server Actions
4. Mass Role Directory UI
5. Mass Role Self-Service Portal
6. Substitute Management System
7. Confirmation Workflow
8. Basic Notification System

---

**Last Updated:** 2025-11-18
**Current Task:** #5 Mass Role Self-Service Portal (Next Up)
