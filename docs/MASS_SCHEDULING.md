# Mass Scheduling Module

> **Purpose:** Bulk Mass scheduling workflow with automatic minister assignment for recurring Mass schedules over a specified date range.
>
> **Type:** Wizard-based workflow (8-step process)
>
> **Route:** `/masses/schedule`

---

## Table of Contents

- [Overview](#overview)
- [User Workflow](#user-workflow)
- [Wizard Steps](#wizard-steps)
- [Database Structure](#database-structure)
- [Server Actions](#server-actions)
- [Algorithm Design](#algorithm-design)
- [File Structure](#file-structure)
- [Permissions](#permissions)
- [Technical Implementation](#technical-implementation)
- [Future Enhancements](#future-enhancements)
- [Related Documentation](#related-documentation)

---

## Overview

The Mass Scheduling Module provides a wizard-based interface for creating multiple Mass records with automatic minister assignments over a specified period. Instead of manually creating each Mass individually, users can define a recurring schedule pattern and let the system generate all Masses with automated role assignments based on role membership, mass time preferences, and blackout dates.

**Key Features:**
- **8-Step Wizard** - Guided workflow from date selection to confirmation
- **Mass Times Templates** - Use predefined schedules (e.g., "Weekend Masses", "Daily Masses")
- **Role Templates** - Define minister requirements per Mass type
- **Liturgical Calendar Integration** - Link Masses to liturgical events
- **Interactive Assignment** - Manual or automated minister assignment
- **Workload Balancing** - Fair distribution of assignments across ministers
- **Blackout Date Respect** - Automatically excludes unavailable ministers
- **Loading Modal** - Professional animated loading experience during creation
- **Bulk Creation** - Creates all Mass records, Events, and Assignments in a single operation

---

## User Workflow

### Typical Use Case: Schedule Sunday Masses for Advent

1. **Navigate to Masses** → Click "Schedule Masses" button
2. **Step 1: Date Range** → Select December 1 - December 31, 2025
3. **Step 2: Mass Times** → Select "Weekend Masses" template (Sat 5pm vigil, Sun 8am, 10am, 12pm)
4. **Step 3: Role Template** → Select "Sunday Mass" template (Lectors, EMHCs, Servers, etc.)
5. **Step 4: Liturgical Events** → Select Sundays of Advent liturgical events
6. **Step 5: Proposed Schedule** → Review 20 proposed Masses (5 Sundays × 4 Masses each), exclude any conflicts
7. **Step 6: Assign Ministers** → Auto-assign ministers to roles, manually adjust as needed
8. **Step 7: Workload Review** → Review minister workload distribution, ensure fair balance
9. **Click "Create"** → Animated modal appears, Masses are created
10. **Step 8: Confirmation** → View success summary with statistics, navigate to Masses list

**Time Savings:** 5 minutes for bulk scheduling vs. 60+ minutes creating each Mass individually.

---

## Wizard Steps

### Step 1: Date Range Selection

**File:** `src/app/(main)/masses/schedule/steps/step-1-date-range.tsx`

**Purpose:** Define the scheduling period

**UI Elements:**
- Start date picker (required)
- End date picker (required)
- Validation: End date must be ≥ start date
- Preview: Shows number of days selected
- Statistics cards: Role counts and member counts

**Data Captured:**
```typescript
{
  startDate: string  // ISO date format (YYYY-MM-DD)
  endDate: string    // ISO date format (YYYY-MM-DD)
}
```

**Validation:**
- ✅ Both dates required
- ✅ End date must be on or after start date

---

### Step 2: Mass Times Selection

**File:** `src/app/(main)/masses/schedule/steps/step-2-schedule-pattern.tsx`

**Purpose:** Select which Mass time templates to use

**UI Elements:**
- List of available Mass Times Templates (from `mass_times_templates` table)
- Each template shows:
  - Template name
  - Day of week
  - Individual time items (e.g., "Saturday 5:00pm Vigil", "Sunday 10:00am")
- Multi-select checkboxes for templates
- Preview: Shows total Masses that will be created

**Data Captured:**
```typescript
{
  selectedMassTimesTemplateIds: string[]  // Array of mass_times_templates IDs
}
```

**Mass Count Calculation:**
- For each selected template, count how many times each Mass time occurs in the date range
- Example:
  - Date range: Dec 1-31, 2025 (5 Sundays, 5 Saturdays)
  - Templates: "Saturday 5pm" + "Sunday 8am" + "Sunday 10am" + "Sunday 12pm"
  - Total Masses: 5 + 5 + 5 + 5 = 20 Masses

**Validation:**
- ✅ At least one Mass time template must be selected

---

### Step 3: Role Template Selection

**File:** `src/app/(main)/masses/schedule/steps/step-3-template-selection.tsx`

**Purpose:** Select which role templates to use for minister assignments

**UI Elements:**
- List of available Mass Role Templates (radio-style selection or multi-select)
- Template details shown on selection
- Each template card shows:
  - Template name
  - Description
  - Liturgical contexts (Sunday, Solemnity, Weekday, etc.)
  - Note (if any)

**Data Captured:**
```typescript
{
  selectedRoleTemplateIds: string[]  // Array of mass_roles_template IDs
}
```

**Template Matching:**
- Templates have `liturgical_contexts` array defining when they apply
- System automatically matches templates to Masses based on liturgical event grade
- Example: "Sunday Mass" template applies to Sundays and Solemnities

**Validation:**
- ✅ At least one role template must be selected

---

### Step 4: Liturgical Events Selection

**File:** `src/app/(main)/masses/schedule/steps/step-4-liturgical-events.tsx`

**Purpose:** Select which liturgical events should be associated with Masses

**UI Elements:**
- Shows all liturgical events from global calendar within the selected date range
- Displays: event name, date, liturgical color, grade (Solemnity, Feast, Memorial)
- Multi-select interface to choose which events to include
- Event badges with liturgical colors
- Preview modal for event details

**Data Captured:**
```typescript
{
  selectedLiturgicalEventIds: string[]  // Array of global_liturgical_events IDs
}
```

**Auto-Matching:**
- System matches Masses to liturgical events by date
- Each Mass gets linked to the appropriate liturgical event

**Validation:**
- ✅ At least one liturgical event must be selected

---

### Step 5: Proposed Schedule Review

**File:** `src/app/(main)/masses/schedule/steps/step-5-proposed-schedule.tsx`

**Purpose:** Review proposed Masses and exclude any that shouldn't be created

**UI Elements:**
- Calendar view showing all proposed Masses
- Each Mass shows: date, time, liturgical event (if applicable), liturgical color
- Checkbox to include/exclude individual Masses
- Mass detail modal to view details
- Delete Mass button to remove from schedule
- Statistics: Total Masses, Included, Excluded, Conflicts

**Interaction:**
- Click a Mass card to see details
- Uncheck Masses to exclude them (e.g., skip a particular date)
- Delete Mass to remove permanently
- All assignments are empty at this step

**Data State:**
```typescript
{
  proposedMasses: ProposedMass[]  // Array of Mass objects with isIncluded flag
}
```

**Validation:**
- ✅ At least one Mass must remain included

---

### Step 6: Assign Ministers (Interactive Preview)

**File:** `src/app/(main)/masses/schedule/steps/step-6-interactive-preview.tsx`

**Purpose:** Interactively assign people to roles for each Mass

**UI Elements:**
- Grouped list of all included Masses by date
- Each Mass shows:
  - Date, time, liturgical event, liturgical color
  - List of all role assignments from selected role templates
  - For each role: role name, assigned person (or "Assign" button)
- Click "Assign" button → Opens PeoplePicker filtered for that role
- Click assigned person → Option to remove assignment
- "Change Assignment" dialog for bulk changes

**Auto-Assignment:**
- On entering step 6, system does NOT automatically assign (assignments are manual or carried forward from previous wizard sessions)
- Assigns people based on:
  - Role membership (`mass_role_members`)
  - Mass time preferences (`people.mass_times_template_item_ids`)
  - Blackout dates (`person_blackout_dates`)
  - Workload balancing (fewer assignments get priority)
  - Conflict avoidance (not double-booked)

**Interaction:**
- Manual assignment: Click "Assign" → PeoplePicker → Select person
- Remove assignment: Click X on assigned person
- All assignments stored in `proposedMasses` client state
- NOT saved to database until step 8

**Validation:**
- ✅ Always valid (unassigned roles are allowed)

---

### Step 7: Workload Review

**File:** `src/app/(main)/masses/schedule/steps/step-7-workload-review.tsx`

**Purpose:** Review minister workload distribution before creating Masses

**UI Elements:**
- **Summary Stats:**
  - Total ministers assigned
  - Total assignments across all Masses
  - Average assignments per minister
  - Number of unassigned roles (if any)

- **Workload Distribution List:**
  - Each minister shown as a card with:
    - Name and initials avatar
    - Total number of assignments
    - Breakdown by role (e.g., "Lector ×3", "EMHC ×2")
    - Visual workload bar (relative to other ministers)
  - Color-coded by workload level:
    - Green: Light workload
    - Blue: Moderate workload
    - Amber: Heavy workload
    - Red: Very heavy workload
  - Sort options: Most assignments, Least assignments, Name A-Z, Name Z-A
  - Click minister card → Modal showing full schedule with dates

- **Unassigned Roles Warning:**
  - If any roles remain unassigned, shows orange alert
  - Lists unassigned roles
  - Suggests going back to step 6 to assign

**Data Display:**
- Shows assignments from `proposedMasses` (client state)
- NOT from database (Masses haven't been created yet)

**Next Button:**
- Text changes to "Create" instead of "Next"
- Clicking "Create" triggers step 8 transition

**Validation:**
- ✅ Always valid (unassigned roles are warnings, not errors)

---

### Step 8: Confirmation & Creation

**File:** `src/app/(main)/masses/schedule/steps/step-8-confirmation.tsx`

**Purpose:** Create Masses in database and display results

**Workflow:**
1. User clicks "Create" on step 7
2. Wizard navigates to step 8
3. **Loading Modal appears immediately** with:
   - Dual rotating spinner rings (outer clockwise, inner counter-clockwise)
   - Animated check icon in center
   - "Creating Masses" message
   - Bouncing progress dots
   - "Please do not close this window" warning
   - Frosted glass backdrop effect
4. `scheduleMasses()` server action executes
5. Modal disappears on completion
6. Success or error state displays

**On Success - UI Elements:**
- **Summary Cards:**
  - Masses Created
  - Unique Dates
  - Roles Assigned
  - Ministers Involved

- **Assignment Summary:**
  - Total roles
  - Assigned count
  - Unassigned count
  - Assignment rate percentage

- **Date Distribution:**
  - Shows first 5 dates with Mass counts

- **Records Created Breakdown:**
  - Mass Records (masses table)
  - Event Records (events table)
  - Assignment Slots (mass_assignment table)

- **Next Steps:**
  - Masses visible in calendar
  - Ministers can view schedules
  - Unassigned roles need manual assignment
  - Can edit individual Masses

**On Error:**
- Error icon
- Error message from server
- "Try Again" button → Re-runs creation
- "Go Back" button → Returns to step 7

**Complete Button:**
- Text: "Go to Masses"
- Redirects to `/masses` list page

**Technical Details:**
- Masses created via `scheduleMasses()` server action
- Database transaction creates Events, Masses, and MassAssignment records
- Clears wizard state from localStorage
- Cannot navigate back from step 8

---

## Database Structure

### Core Tables

**`masses`** - Individual Mass events
- Links to `events` (date/time/location)
- Links to `mass_roles_template` (role requirements)
- Links to `global_liturgical_events` (liturgical calendar)
- Fields: `presider_id`, `homilist_id`, `status`, `announcements`, `petitions`, `note`

**`mass_times_templates`** - Recurring schedule containers
- Parish-scoped templates (e.g., "Weekend Masses", "Daily Masses")
- Fields: `name`, `day_of_week` (SUNDAY, MONDAY, etc.)

**`mass_times_template_items`** - Individual time slots
- Links to `mass_times_templates`
- Fields: `time` (HH:MM:SS), `day_type` (IS_DAY or DAY_BEFORE for vigils)

**`mass_roles_templates`** - Role requirement containers
- Parish-scoped templates (e.g., "Sunday Mass", "Daily Mass")
- Fields: `name`, `description`, `liturgical_contexts` (array)

**`mass_roles_template_items`** - Role requirements
- Links to `mass_roles_templates` and `mass_roles`
- Fields: `count` (how many needed), `position` (order)

**`mass_assignment`** - Actual role assignments
- Links to `masses` and `mass_roles_template_items`
- Fields: `person_id` (who is assigned, NULL if unassigned)

**`mass_role_members`** - Who serves in which roles
- Links `people` to `mass_roles`
- Fields: `membership_type` (MEMBER or LEADER), `active`, `notes`

**`person_blackout_dates`** - Unavailability periods
- Person-centric (applies to all roles)
- Fields: `start_date`, `end_date`, `reason`

**See database schema in:** `supabase/migrations/`

---

## Server Actions

### Primary Action: `scheduleMasses()`

**File:** `src/lib/actions/mass-scheduling.ts`

**Function Signature:**
```typescript
export async function scheduleMasses(
  params: ScheduleMassesParams
): Promise<ScheduleMassesResult>
```

**Input Parameters:**
```typescript
interface ScheduleMassesParams {
  startDate: string
  endDate: string
  schedule: MassScheduleEntry[]
  templateIds: string[]  // Role template IDs
  selectedLiturgicalEventIds: string[]
  algorithmOptions: {
    balanceWorkload: boolean
    respectBlackoutDates: boolean
    allowManualAdjustments: boolean
  }
  proposedMasses?: Array<{
    id: string
    date: string
    time: string
    templateId: string
    liturgicalEventId?: string
    assignments?: Array<{
      roleId: string
      roleName: string
      personId?: string
      personName?: string
    }>
  }>
}
```

**Return Value:**
```typescript
interface ScheduleMassesResult {
  massesCreated: number
  totalRoles: number
  rolesAssigned: number
  rolesUnassigned: number
  masses: Array<{
    id: string
    date: string
    time: string
    language: string
    eventId: string
    assignments: Array<{
      roleInstanceId: string
      roleId: string
      roleName: string
      personId: string | null
      personName: string | null
      status: 'ASSIGNED' | 'UNASSIGNED' | 'CONFLICT'
      reason?: string
    }>
  }>
}
```

**Execution Flow:**

#### Phase 1: Fetch Liturgical Events
- Query `global_liturgical_events` for selected event IDs
- Create date → liturgical event mapping

#### Phase 2: Fetch Templates
- Query `mass_roles_templates` for selected template IDs
- Get `liturgical_contexts` for each template

#### Phase 3: Determine Role Template Per Mass
- For each proposed Mass, determine which role template to use
- Match template `liturgical_contexts` to liturgical event grade
- Fallback to first selected template if no match

#### Phase 4: Create Events and Masses
For each Mass:
1. **Normalize Time Format**
   - Ensure time is properly formatted (HH:MM:SS)
   - PostgreSQL TIME fields require zero-padded format
   ```typescript
   const normalizeTime = (time: string): string => {
     const parts = time.split(':')
     if (parts.length === 3) {
       return parts.map(p => p.padStart(2, '0')).join(':')
     }
     return time
   }
   ```

2. **Create Event:**
   ```typescript
   {
     parish_id: selectedParishId,
     name: "Christmas Day - 09:00:00" or "Mass - 2025-12-25 09:00:00",
     event_type: 'MASS',
     start_date: date,
     start_time: normalizedTime,
     end_date: date,
     language: language
   }
   ```

3. **Create Mass:**
   ```typescript
   {
     parish_id: selectedParishId,
     event_id: createdEventId,
     mass_roles_template_id: determinedTemplateId,
     liturgical_event_id: liturgicalEventId || null,
     status: 'SCHEDULED'
   }
   ```

#### Phase 5: Create Role Instances
For each Mass:
- Fetch template items for the Mass's role template
- If assignments provided in `proposedMasses`:
  - Create instances with `person_id` from assignments
- Else:
  - Create empty instances (person_id = NULL)

```typescript
{
  mass_id: massId,
  person_id: assignedPersonId || null,
  mass_roles_template_item_id: templateItemId
}
```

#### Phase 6: Build Result
- Aggregate created Masses with assignments
- Calculate statistics (total roles, assigned, unassigned)
- Return comprehensive result object

**Error Handling:**
- Detailed error logging with context (date, time, template, liturgical event)
- Throws descriptive errors for debugging
- Example: "Failed to create event for 2025-12-25 09:00:00: <error details>"

---

## Algorithm Design

### Assignment Strategy

**Current Implementation:**
- Assignments are made in Step 6 via client-side state
- Minister assignment is manual via PeoplePicker
- Auto-assignment algorithm is available but not automatically triggered
- Assignments are stored in `proposedMasses` array in client state
- Database creation happens in Step 8 with all assignments

**Assignment Constraints:**

**Hard Constraints** (cannot violate):
- Person has active role membership (`mass_role_members.active = true`)
- Person does not have blackout date covering the Mass date
- Person is not already assigned to different role at same Mass time
- Person has the required role capability

**Soft Constraints** (preferences):
- Mass time matches person's `mass_times_template_item_ids` preferences
- Workload balancing (distribute assignments fairly)

**Assignment Priority:**
1. Check role membership (active only)
2. Respect blackout dates
3. Check for time conflicts
4. Balance workload if enabled
5. Assign first eligible person

---

## File Structure

```
src/app/(main)/masses/schedule/
├── page.tsx                                   # Server page (auth + breadcrumbs)
├── schedule-masses-client.tsx                 # Main wizard container (8 steps)
├── loading.tsx                                # Loading state
├── error.tsx                                  # Error boundary
└── steps/
    ├── step-1-date-range.tsx                 # Date range selection
    ├── step-2-schedule-pattern.tsx           # Mass times template selection
    ├── step-3-template-selection.tsx         # Role template selection
    ├── step-4-liturgical-events.tsx          # Liturgical events selection
    ├── step-5-proposed-schedule.tsx          # Review and exclude proposed masses
    ├── step-6-interactive-preview.tsx        # Assign ministers to roles
    ├── step-6-assignment-summary.tsx         # Minister workload summary (reusable)
    ├── step-7-workload-review.tsx            # Workload review before creation
    ├── step-8-confirmation.tsx               # Success confirmation after creation
    └── step-8-results.tsx                    # Deprecated results view

src/lib/actions/
└── mass-scheduling.ts                         # scheduleMasses + supporting actions

src/components/
├── wizard/                                    # Reusable wizard component
│   ├── Wizard.tsx
│   └── WizardStepHeader.tsx
└── people-picker.tsx                          # PeoplePicker for assignments
```

---

## Permissions

**Role Access:**
- ✅ **Admin** - Full access
- ✅ **Staff** - Full access
- ❌ **Ministry-Leader** - No access (read-only for Masses)
- ❌ **Parishioner** - No access

**Implementation:**
```typescript
// Server page checks permissions
const userParish = await getUserParishRole(user.id, selectedParishId)
requireModuleAccess(userParish, 'masses')
```

**Button Visibility:**
The "Schedule Masses" button only appears on `/masses` page if user has appropriate permissions.

---

## Technical Implementation

### Client State Management

**Wizard State** (managed in `schedule-masses-client.tsx`):
- All state stored in React state hooks
- Persisted to `localStorage` for recovery
- State includes: dates, selected templates, proposed masses, algorithm options
- State key: `mass-scheduler-wizard-state`

**State Restoration:**
- On mount, wizard checks for saved state
- Restores if saved within last 24 hours
- Shows toast with "Start Fresh" action
- Clears state on successful completion

### Loading Modal

**Implementation Details:**
- Modal component using shadcn Dialog
- Controlled by `isSubmitting` state
- Non-dismissible (prevents click-outside and ESC)
- Visual features:
  - Dual rotating spinner rings
  - Animated check icon
  - Bouncing progress dots
  - Frosted glass backdrop (`bg-background/95 backdrop-blur-sm`)
- Accessibility: Hidden `DialogTitle` for screen readers

**Code Reference:** `src/app/(main)/masses/schedule/schedule-masses-client.tsx:671-714`

### Time Format Normalization

**Problem:** PostgreSQL TIME fields can return shortened formats like `"9:0:0"` instead of `"09:00:00"`

**Solution:** Time normalization function ensures proper zero-padding
```typescript
const normalizeTime = (time: string): string => {
  const parts = time.split(':')
  if (parts.length === 3) {
    return parts.map(p => p.padStart(2, '0')).join(':')
  }
  return time
}
```

**Applied To:**
- Event `start_time` field
- Mass result time field
- Event names

---

## Future Enhancements

### Implemented ✅
- ✅ 8-step wizard workflow
- ✅ Mass times template selection
- ✅ Role template selection
- ✅ Liturgical event integration
- ✅ Proposed schedule review with calendar view
- ✅ Interactive minister assignment
- ✅ Workload review and balancing
- ✅ Animated loading modal
- ✅ Bulk creation with database transaction
- ✅ Blackout date enforcement
- ✅ Conflict detection

### Planned 📋

**Phase 1: Enhanced Assignment**
- [ ] Auto-assignment button in Step 6
- [ ] Re-run auto-assignment with overwrite confirmation
- [ ] Assignment suggestions based on preferences
- [ ] Drag-and-drop reassignment

**Phase 2: Template Management**
- [ ] Mass times template CRUD UI
- [ ] Role template CRUD UI
- [ ] Template preview and validation
- [ ] Clone template functionality

**Phase 3: Communication**
- [ ] Email notifications to assigned ministers
- [ ] Minister confirmation workflow
- [ ] Substitute request system
- [ ] Reminder emails

**Phase 4: Advanced Features**
- [ ] Recurring schedule templates ("save this pattern")
- [ ] Batch delete/rollback
- [ ] Assignment history tracking
- [ ] Minister utilization reports

---

## Related Documentation

**Mass Module Specific:**
- **[MASSES.md](./MASSES.md)** - Complete Mass module overview including role system and architecture

**Algorithm Details:**
- **[MASS_ASSIGNMENT_LOGIC.md](./MASS_ASSIGNMENT_LOGIC.md)** - Auto-assignment algorithm specifications
- **[MASS_SCHEDULING_ALGORITHMS.md](./MASS_SCHEDULING_ALGORITHMS.md)** - Advanced scheduling algorithms

**UI Documentation:**
- **[MASS_SCHEDULING_UI.md](./MASS_SCHEDULING_UI.md)** - Future vision for calendar-based drag-and-drop interface (not implemented)

**General Patterns:**
- [WIZARD_COMPONENT.md](./WIZARD_COMPONENT.md) - Reusable wizard component documentation
- [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) - Reusable components (pickers, form components)
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Data architecture and server actions patterns

---

## Summary

The Mass Scheduling Module provides a comprehensive 8-step wizard for bulk Mass creation with automated minister assignment. The workflow guides users from date selection through template selection, liturgical event linking, interactive assignment, workload review, and finally to Mass creation with a professional animated loading experience. The system creates all necessary database records (Events, Masses, Assignments) in a single transaction and provides detailed success statistics.

**Current Status:** ✅ COMPLETE - Production-ready with all 8 steps implemented

**Recent Improvements:**
- ✅ Fixed database schema mismatches (removed non-existent columns)
- ✅ Added time format normalization for PostgreSQL compatibility
- ✅ Enhanced loading modal with dual rotating spinners and animations
- ✅ Improved error logging with detailed context
- ✅ Added accessibility features (VisuallyHidden DialogTitle)

**Last Updated:** 2025-11-21
