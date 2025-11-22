# Mass Scheduling Module

> **Purpose:** Bulk Mass scheduling workflow with automatic minister assignment for recurring Mass schedules over a specified date range.
>
> **Type:** Wizard-based workflow (not a standard CRUD module)
>
> **Route:** `/masses/schedule`

---

## Table of Contents

- [Overview](#overview)
- [Database Structure](#database-structure)
- [User Workflow](#user-workflow)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Wizard Steps](#wizard-steps)
- [Server Actions](#server-actions)
- [Algorithm Design](#algorithm-design)
- [Permissions](#permissions)
- [Future Enhancements](#future-enhancements)
- [Testing](#testing)

---

## Overview

The Mass Scheduling Module provides a wizard-based interface for creating multiple Mass records with automatic minister assignments over a specified period. Instead of manually creating each Mass individually, users can define a recurring schedule pattern and let the system generate all Masses and attempt automatic role assignments based on role membership and availability (blackout dates).

**Key Features:**
- **Date Range Selection** - Define scheduling period (days, weeks, or months)
- **Recurring Pattern** - Specify which days/times Masses occur (e.g., Sunday 8am, 10am, 12pm)
- **Template-Based Roles** - Select a Mass Role Template to define which roles are needed
- **Automatic Assignment** - Algorithm attempts to assign ministers based on preferences and availability
- **Review & Confirm** - Preview all Masses before creation
- **Bulk Creation** - Creates all Mass records and Events in a single operation

---

## Database Structure

The Mass Scheduling system uses a simplified database structure focused on role membership and unavailability tracking:

### Core Tables

**`mass_role_members`** - People who serve in liturgical roles
- Links people to specific mass roles (Lector, EMHC, Altar Server, etc.)
- Each person can have multiple role memberships
- Fields: `person_id`, `parish_id`, `mass_role_id`, `membership_type`, `notes`, `active`
- Membership types: `MEMBER` (default) or `LEADER`
- Simple membership model - no complex preference fields

**`person_blackout_dates`** - Person unavailability periods
- General-purpose unavailability tracking for any person
- Not specific to mass roles - applies to all scheduling
- Fields: `person_id`, `start_date`, `end_date`, `reason`
- Used to prevent assignments during vacations, travel, etc.

### Key Design Decisions

**Simplified Architecture:**
- No complex preference fields (preferred_days, desired_frequency, max_per_month, etc.)
- Role membership is binary: active or inactive
- All scheduling constraints handled via blackout dates
- Manual adjustments expected for fine-tuning assignments

**Person-Centric Blackouts:**
- Blackout dates are not role-specific
- When a person is unavailable, they're unavailable for ALL roles
- Simplifies data entry and reduces administrative burden

---

## User Workflow

### Typical Use Case: Schedule Sunday Masses for Advent

1. **Navigate to Masses** → Click "Schedule Masses" button
2. **Step 1: Date Range** → Select December 1 - December 31, 2025 (31 days)
3. **Step 2: Schedule Pattern** → Add recurring Masses:
   - Sunday 8:00 AM (English)
   - Sunday 10:30 AM (English)
   - Sunday 12:00 PM (Spanish)
4. **Step 3: Template** → Select "Sunday Mass" template (2 Lectors, 4 EMHCs, 2 Servers)
5. **Step 4: Review** → Confirm:
   - 15 Masses will be created (5 Sundays × 3 Masses each)
   - Algorithm options: ✓ Respect preferences, ✓ Balance workload, ✓ Honor blackouts
6. **Click "Schedule Masses"**
7. **Success** → Redirects to Masses list filtered by start date

**Time Savings:** 5 minutes for bulk scheduling vs. 60+ minutes creating each Mass individually.

---

## Architecture

### Data Flow

```
User Input (Wizard)
  ↓
scheduleMasses() Server Action
  ↓
┌─────────────────────────────────────┐
│ Phase 1: Fetch Template Items       │ ← mass_roles_template_items
├─────────────────────────────────────┤
│ Phase 2: Generate Date List         │
├─────────────────────────────────────┤
│ Phase 3: Create Events & Masses     │ → events table, masses table
├─────────────────────────────────────┤
│ Phase 4: Create Role Instances      │ → mass_role_instances table
├─────────────────────────────────────┤
│ Phase 5: Auto-Assignment (TODO)     │ ← mass_role_members
│                                      │ ← person_blackout_dates
└─────────────────────────────────────┘
  ↓
Result Summary
  ↓
Redirect to Masses List
```

### Database Tables Used

**Created:**
- `events` - One event per Mass
- `masses` - One record per scheduled Mass
- `mass_role_instances` - N records per Mass (based on template)

**Read:**
- `mass_roles_template_items` - Role requirements from template
- `mass_role_members` - People who serve in each role
- `person_blackout_dates` - Person unavailability periods

---

## File Structure

```
src/app/(main)/masses/schedule/
├── page.tsx                           # Server page (auth + breadcrumbs)
├── schedule-masses-client.tsx         # Main wizard container (8 steps)
├── loading.tsx                        # Loading state
├── error.tsx                          # Error boundary
└── steps/
    ├── step-1-date-range.tsx         # Date range selection + role availability modal
    ├── step-2-schedule-pattern.tsx   # Recurring schedule builder
    ├── step-3-template-selection.tsx # Mass Role Template picker
    ├── step-4-liturgical-events.tsx  # Liturgical events selection
    ├── step-5-proposed-schedule.tsx  # Review and exclude proposed masses
    ├── step-6-interactive-preview.tsx # Assign ministers to roles
    ├── step-6-assignment-summary.tsx # Minister workload summary (reused for steps 7 & 8)
    └── role-availability-modal.tsx   # Modal for viewing role availability by mass time

src/components/
└── mass-schedule-assignment-grid.tsx  # ✅ Interactive assignment grid

src/lib/actions/
└── mass-scheduling.ts                # scheduleMasses + assignment actions

src/app/(main)/masses/
└── page.tsx                          # Modified to add "Schedule Masses" button
```

---

## Wizard Steps

### Step 1: Date Range Selection

**Purpose:** Define the scheduling period and view minister availability

**UI Elements:**
- Start date picker (required)
- End date picker (required)
- Quick Fill button for preset date ranges (next month, next quarter, etc.)
- Validation: End date must be ≥ start date
- Preview: Shows number of days selected
- Warning: If period > 365 days
- **Role Availability Cards** - Grid of clickable role cards showing member counts
- **Role Availability Modal** - Click any role card to see availability by mass time

**Role Availability Feature:**
When dates are selected, users can click on any mass role card to see a modal showing:
- List of all mass times (grouped by day/time)
- Count of available active members for each mass time
- Clicking a mass time shows a nested modal with the list of people

**Modal Flow:**
1. Click role card (e.g., "Lector - 8 members") → Opens first modal
2. First modal shows mass times with availability counts:
   - Saturday 5:00 PM - 3 people
   - Sunday 9:00 AM - 5 people
   - Sunday 11:00 AM - 4 people
3. Click mass time → Opens second modal with list of people
4. Second modal shows names and membership type (MEMBER/LEADER)

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
- ⚠️ Warning for periods > 365 days (large data volume)

---

### Step 2: Schedule Pattern

**Purpose:** Define which Masses repeat during the period

**UI Elements:**
- "Add Mass Time" button
- For each Mass time:
  - Day of week dropdown (Sunday-Saturday)
  - Time input (HH:mm format)
  - Language dropdown (English, Spanish, Bilingual)
  - Remove button
- Preview: Shows total Masses that will be created

**Data Captured:**
```typescript
{
  schedule: Array<{
    id: string          // Client-side ID for managing list
    dayOfWeek: number   // 0=Sunday, 6=Saturday
    time: string        // HH:mm format (e.g., "08:00", "17:00")
    language: 'ENGLISH' | 'SPANISH' | 'BILINGUAL'
  }>
}
```

**Mass Count Calculation:**
For each day in date range:
  - Check if day of week matches any schedule entry
  - Count matching entries
  - Sum all occurrences

**Example:**
- Date range: Dec 1-31, 2025 (31 days, 5 Sundays)
- Schedule: Sunday 8am + Sunday 10am + Sunday 12pm
- Total Masses: 5 × 3 = 15 Masses

**Validation:**
- ✅ At least one Mass time required
- ✅ All times must be valid HH:mm format

---

### Step 3: Mass Role Template Selection

**Purpose:** Select which roles need to be assigned

**UI Elements:**
- List of available Mass Role Templates (radio-style selection)
- Template details shown on selection
- Each template card shows:
  - Template name
  - Description
  - Note (if any)
- Link to create new template if none exist

**Data Captured:**
```typescript
{
  templateId: string  // UUID of selected mass_roles_template
}
```

**Template Structure:**
A template defines:
- Role requirements (e.g., "Lector", "EMHC", "Altar Server")
- Count for each role (e.g., 2 Lectors, 4 EMHCs)
- Order/position for display

**Validation:**
- ✅ One template must be selected
- ⚠️ Warning if no templates exist (directs user to create one)

---

### Step 4: Liturgical Events Selection

**Purpose:** Select which liturgical events should be associated with Masses in this period

**UI Elements:**
- Shows all liturgical events from the global calendar that fall within the selected date range
- Displays event name, date, liturgical color, grade (Solemnity, Feast, Memorial, etc.)
- Multi-select interface to choose which events to include
- Clicking an event badge opens a liturgical event preview modal
- Preview modal shows full event details including readings, color, type, etc.

**Data Captured:**
```typescript
{
  selectedLiturgicalEventIds: string[]  // Array of global_liturgical_events IDs
}
```

**Validation:**
- ✅ At least one liturgical event must be selected
- System will match Masses to liturgical events by date

---

### Step 5: Proposed Schedule

**Purpose:** Review proposed Masses and exclude any that shouldn't be created

**UI Elements:**
- Calendar view showing all proposed Masses for the selected period
- Each Mass shows: date, time, liturgical event (if applicable), liturgical color
- Checkbox or toggle to include/exclude individual Masses
- Mass detail modal to view/edit individual Mass details
- Preview shows total count of Masses that will be created

**Interaction:**
- Click a Mass card to see details
- Uncheck Masses to exclude them from creation (e.g., skip a particular date)
- Delete Mass button to remove from schedule
- Role assignment preview (empty at this step)

**Validation:**
- ✅ At least one Mass must remain included (not all excluded)

---

### Step 6: Assign Ministers

**Purpose:** Interactively assign people to roles for each Mass

**UI Elements:**
- Grouped list of all included Masses by date
- Each Mass shows:
  - Date, time, liturgical event, liturgical color
  - List of all role assignments from the selected role template
  - For each role: role name, assigned person (or "Assign" button)
- Click "Assign" button → Opens people picker filtered for that role
- Click assigned person → Option to remove assignment
- "Change Template" button to switch role template for a specific Mass
- "Refresh Recommendations" button to re-run auto-assignment algorithm

**Auto-Assignment:**
- On entering step 6, system automatically runs assignment algorithm
- Applies role templates based on liturgical context (Solemnity uses different template than weekday)
- Assigns people based on:
  - Role membership (mass_role_members)
  - Preferred mass times (people.mass_times_template_item_ids)
  - Blackout dates (person_blackout_dates)
  - Workload balancing (fewer assignments get priority)
  - Conflict avoidance (not double-booked)

**Interaction:**
- Manual assignment: Click "Assign" → People picker → Select person
- Remove assignment: Click X on assigned person
- Change template: Opens dialog to select different role template
- Refresh: Re-runs auto-assignment (confirms before overwriting manual changes)

**Data State:**
- All assignments stored in proposedMasses array in client state
- NOT saved to database until step 8

**Validation:**
- Always valid (unassigned roles are allowed)

---

### Step 7: Workload Review

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
    - Green: Light workload (below average)
    - Blue: Moderate workload (near average)
    - Amber: Heavy workload (above average)
    - Red: Very heavy workload (highest)
  - Sort options: Most assignments, Least assignments, Name A-Z, Name Z-A
  - Click minister card → Modal showing full schedule with dates

- **Unassigned Roles Warning:**
  - If any roles remain unassigned, shows orange alert
  - Lists first 10 unassigned roles
  - Suggests going back to step 6 to assign

**Data Display:**
- Shows assignments from proposedMasses (client state)
- NOT from database (Masses haven't been created yet)

**Next Button:**
- Text changes to "Create" instead of "Next"
- Clicking "Create" advances to step 8 and triggers Mass creation

**Validation:**
- Always valid (unassigned roles are warnings, not errors)

---

### Step 8: Confirmation

**Purpose:** Display results of Mass creation (success or error)

**Trigger:**
- Automatically runs when entering this step
- Creates all Masses, Events, and Mass Assignments in database
- Shows loading spinner during creation

**On Success:**
- **Summary Stats:**
  - Number of Masses created
  - Total roles created
  - Number of roles assigned
  - Number of roles unassigned

- **Workload Distribution:**
  - Same view as step 7, but now showing ACTUAL created data
  - Minister cards show their final assignments
  - Click minister → See full schedule with Mass IDs and links

- **Success Message:**
  - Green checkmark icon
  - "Masses Created Successfully"
  - "Your masses have been created and ministers have been assigned"

- **Complete Button:**
  - Text: "Go to Masses"
  - Redirects to `/masses` (Masses list page)

**On Error:**
- **Error Alert:**
  - Red error icon
  - Error message from server
  - "Failed to create Masses. Please try again."

- **Actions:**
  - "Try Again" button → Re-runs creation
  - "Go Back" button → Returns to step 7 to review

**Data Display:**
- Shows actual created data from scheduleMassesResult
- Displays real Mass IDs and database records

**Wizard Behavior:**
- Step 8 only appears in wizard steps AFTER creation succeeds
- Cannot navigate back from step 8 (Masses already created)
- Clears saved wizard state from localStorage

**Implementation Details:**
```typescript
// Component location
src/app/(main)/masses/schedule/steps/step-5-results.tsx
src/components/mass-schedule-assignment-grid.tsx

// Key features
- Real-time updates via assignMinisterToRole() server action
- Local state management for instant UI feedback
- Color-coded cells based on assignment status
- Sticky first column for easy Mass identification
```

---

## Server Actions

### Role Availability Actions

**Location:** `src/lib/actions/mass-role-members.ts`

#### `getMassRoleAvailabilityByMassTime()`

**Purpose:** Get availability counts for a role grouped by mass time

**Function Signature:**
```typescript
export async function getMassRoleAvailabilityByMassTime(
  roleId: string
): Promise<MassTimeAvailability[]>
```

**Return Value:**
```typescript
interface MassTimeAvailability {
  mass_time_template_item_id: string
  mass_time_name: string        // e.g., "Weekend Masses"
  mass_time: string              // e.g., "09:00:00"
  day_of_week: string            // e.g., "SUNDAY"
  available_count: number        // Number of active members available
}
```

**How It Works:**
1. Fetches all active members for the role
2. Gets their `mass_times_template_item_ids` from the `people` table
3. Counts how many members have each mass time in their availability
4. Returns sorted by day of week and time

**Used By:** Step 1 role availability modal (first level)

---

#### `getPeopleAvailableForMassTime()`

**Purpose:** Get list of people available for a specific mass time and role

**Function Signature:**
```typescript
export async function getPeopleAvailableForMassTime(
  roleId: string,
  massTimeTemplateItemId: string
): Promise<PersonAvailableForMassTime[]>
```

**Return Value:**
```typescript
interface PersonAvailableForMassTime {
  id: string                      // mass_role_member.id
  person_id: string
  person_name: string             // "John Smith"
  membership_type: 'MEMBER' | 'LEADER'
}
```

**How It Works:**
1. Fetches all active members for the role
2. Filters to members who have the specific mass time in their availability
3. Sorts by membership type (leaders first), then by name

**Used By:** Step 1 role availability modal (nested modal)

---

### Primary Action: `scheduleMasses()`

**Location:** `src/lib/actions/mass-scheduling.ts`

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
  templateId: string
  algorithmOptions: {
    balanceWorkload: boolean
    respectBlackoutDates: boolean
    allowManualAdjustments: boolean
  }
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

#### Phase 1: Fetch Template Items
```sql
SELECT * FROM mass_roles_template_items
  WHERE template_id = :templateId
  ORDER BY position
```
Returns roles needed with counts (e.g., 2 Lectors, 4 EMHCs)

#### Phase 2: Generate Date List
- Iterate from startDate to endDate
- For each date:
  - Check dayOfWeek
  - Find matching schedule entries
  - Add to massesToCreate array

#### Phase 3: Create Events & Masses
For each date/time combination:
1. **Create Event:**
   ```typescript
   {
     parish_id: selectedParishId,
     name: "Mass - 2025-12-07 08:00",
     event_type: 'MASS',
     start_date: date,
     start_time: time,
     language: language,
     is_public: false  // User can publish later
   }
   ```

2. **Create Mass:**
   ```typescript
   {
     parish_id: selectedParishId,
     event_id: createdEventId,
     mass_roles_template_id: templateId,
     status: 'SCHEDULED'
   }
   ```

#### Phase 4: Create Role Instances
For each Mass:
- For each template item:
  - Create N instances (based on count)
  - Initially person_id = NULL (unassigned)

```typescript
{
  mass_id: massId,
  person_id: null,  // Will be assigned in Phase 5
  mass_roles_template_item_id: templateItemId
}
```

#### Phase 5: Auto-Assignment ✅
**Current Status:** IMPLEMENTED

**Algorithm Flow:**
```
FOR each Mass:
  FOR each role instance:
    1. Get eligible ministers (via getAvailableMinisters):
       - Query mass_role_members for people with this role and active=true
       - Filter out people with blackout dates on this date (via person_blackout_dates)

    2. Check for conflicts (hasConflict):
       - Exclude if already assigned to another role at same Mass time

    3. IF balanceWorkload:
       - Sort eligible ministers by assignmentCount ascending
       - Prefer ministers with fewer assignments

    4. IF eligible_ministers.length > 0:
       - Assign first eligible minister
       - UPDATE mass_role_instances SET person_id = X WHERE id = Y
       - Mark as ASSIGNED
    ELSE:
       - Mark as UNASSIGNED with reason
```

**Assignment Constraints:**

**Hard Constraints** (cannot violate):
- Person has blackout date covering this date (checked in getAvailableMinisters via person_blackout_dates)
- Person already assigned to different role at same Mass time (checked in hasConflict)
- Person does not have active membership for this role (checked in getAvailableMinisters via mass_role_members)

**Helper Functions Implemented:**
- `getAvailableMinisters()` - Get all eligible ministers for role/date/time
- `hasConflict()` - Check for double-booking conflicts
- `getMonthlyAssignmentCount()` - Get assignment count for workload balancing

---

### Supporting Actions

#### `getAvailableMinisters()`
**Purpose:** Get eligible ministers for a specific role/date/time
**Status:** ✅ IMPLEMENTED

```typescript
export async function getAvailableMinisters(
  roleId: string,
  date: string,
  time: string,
  parishId: string
): Promise<Array<{ id: string; name: string; assignmentCount: number }>>
```

**Implementation:**
1. Query `mass_role_members` for people with this role where active=true
2. For each person, check for blackout dates covering the requested date (via `person_blackout_dates`)
3. Get current assignment count for workload balancing
4. Return array sorted by assignment count (if balanceWorkload enabled)

#### `assignMinisterToRole()`
**Purpose:** Manually assign a minister to a role instance
**Status:** Implemented

```typescript
export async function assignMinisterToRole(
  massRoleInstanceId: string,
  personId: string
): Promise<void>
```

Updates `mass_role_instances.person_id` and revalidates `/masses` path.

#### `getPersonSchedulingConflicts()`
**Purpose:** Get blackout dates for a person over a date range
**Status:** Implemented

```typescript
export async function getPersonSchedulingConflicts(
  personId: string,
  startDate: string,
  endDate: string
): Promise<Array<{ date: string; reason: string }>>
```

Queries `person_blackout_dates` and returns conflicts.

---

## Algorithm Design

### Auto-Assignment Strategy

**Goal:** Maximize role coverage while respecting constraints and distributing workload fairly.

**Input:**
- All unassigned role instances (sorted by date ascending)
- All people with each required role (from mass_role_members)
- All blackout dates (from person_blackout_dates)

**Output:**
- Updated mass_role_instances with person_id assignments
- Unassigned roles with reasons

### Assignment Priority

1. **Get Role Members**
   - Query mass_role_members for people with this role where active=true
   - Only active members are eligible for assignment

2. **Respect Blackout Dates** (if enabled)
   - Filter out people with blackouts on this date (via person_blackout_dates)
   - Hard constraint - never violated

3. **Check Conflicts**
   - Filter out people already assigned to another role at same Mass time
   - Prevents double-booking

4. **Balance Workload** (if enabled)
   - Sort eligible ministers by assignment_count ascending
   - Assign to person with fewest current assignments
   - Prevents overloading popular ministers

5. **Assign First Eligible** (if no balancing)
   - Assign to first person in filtered list

### Conflict Detection

**Double-Booking:**
Check if person already assigned to a different role at the same Mass time.

**Query:**
```sql
SELECT * FROM mass_role_instances mri
  JOIN masses m ON mri.mass_id = m.id
  JOIN events e ON m.event_id = e.id
  WHERE mri.person_id = :personId
    AND e.start_date = :date
    AND e.start_time = :time
```

**Blackout Period:**
```sql
SELECT * FROM person_blackout_dates
  WHERE person_id = :personId
    AND start_date <= :date
    AND end_date >= :date
```

### Unassigned Roles

When no eligible ministers found, record reason:
- "No available ministers for this role"
- "All ministers have blackout dates"
- "Conflict with existing assignment"
- "No active members for this role"

---

## Permissions

**Role Access:**
- ✅ **Admin** - Full access
- ✅ **Staff** - Full access
- ❌ **Ministry-Leader** - No access (read-only for Masses)
- ❌ **Parishioner** - No access

**Implementation:**
```typescript
// Server page checks role
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'STAFF')) {
  redirect('/masses')
}
```

**Button Visibility:**
The "Schedule Masses" button only appears on `/masses` page if user is Admin or Staff.

---

## Future Enhancements

### ✅ Phase 2: Assignment Editor (Step 5) - IMPLEMENTED

**Status:** Complete

**Implemented Features:**
- ✅ Interactive grid with Masses as rows, Roles as columns
- ✅ Cell colors (Green=assigned, Red=unassigned, Yellow=warning)
- ✅ Click cell to open PeoplePicker
- ✅ Real-time assignment via server action
- ✅ Filter button UI (functionality pending)
- ✅ "Go to Masses List" navigation
- ✅ Summary cards with assignment statistics
- ✅ Assignment rate alerts (color-coded by percentage)

**Not Yet Implemented:**
- ❌ Drag-and-drop reassignment
- ❌ Active filtering (show unassigned only, by role, by date)
- ❌ Batch operations (assign all, clear all)

**Files:**
```
src/app/(main)/masses/schedule/steps/step-5-results.tsx
src/components/mass-schedule-assignment-grid.tsx
```

### Phase 3: Advanced Features

**Recurring Exclusions:**
- Exclude specific dates (e.g., skip Christmas Day, Good Friday)
- UI: Date picker for exclusions in Step 1

**Template Variations:**
- Different templates per Mass time (e.g., 8am uses "Simple Mass", 10am uses "Sung Mass")
- UI: Template picker per schedule entry in Step 2

**Notification System:**
- Email/SMS notifications to assigned ministers
- Configurable per-parish notification settings

**Undo/Rollback:**
- Delete all Masses from a bulk scheduling operation
- Track scheduling batch ID for bulk operations

**Recurring Schedules:**
- Save schedule pattern as template for future use
- "Apply Last Schedule" button

### Phase 4: Reporting

**Scheduling Analytics:**
- Average assignment rate (% of roles auto-assigned)
- Minister workload distribution chart
- Most/least requested roles

**Minister Utilization:**
- Assignments per minister over time
- Burnout prevention alerts (approaching max limits)
- Inactive minister identification

---

## Testing

### Manual Testing Checklist

- [ ] Navigate to `/masses` and verify "Schedule Masses" button appears (Admin/Staff only)
- [ ] Click button → wizard opens at `/masses/schedule`
- [ ] **Step 1:** Enter valid date range → "Next" enabled
- [ ] **Step 1:** Enter invalid range (end < start) → error shown, "Next" disabled
- [ ] **Step 2:** Add 3 Mass times (different days, times, languages)
- [ ] **Step 2:** Verify total Mass count calculation is correct
- [ ] **Step 2:** Remove a Mass time → count updates
- [ ] **Step 3:** Select a Mass Role Template
- [ ] **Step 4:** Verify all summary cards show correct data
- [ ] **Step 4:** Click Edit buttons → return to previous steps
- [ ] **Step 4:** Toggle algorithm options → checkboxes work
- [ ] Click "Schedule Masses" → loading state shown
- [ ] Verify success toast appears
- [ ] Redirect to `/masses` with start_date filter applied
- [ ] Verify Masses appear in list
- [ ] Open a created Mass → verify Event, template assignment
- [ ] Check database: masses, events, mass_role_instances all created

### Unit Tests (TODO)

**Test: `calculateMassCount()`**
```typescript
it('calculates correct Mass count for date range and schedule', () => {
  const result = calculateMassCount({
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    schedule: [
      { dayOfWeek: 0, time: '08:00', language: 'ENGLISH' },
      { dayOfWeek: 0, time: '10:00', language: 'ENGLISH' },
    ]
  })
  expect(result).toBe(10) // 5 Sundays × 2 Masses
})
```

**Test: `scheduleMasses()` - Creates correct records**
```typescript
it('creates Masses and Events for all schedule entries', async () => {
  const result = await scheduleMasses({
    startDate: '2025-12-01',
    endDate: '2025-12-07',
    schedule: [{ dayOfWeek: 0, time: '10:00', language: 'ENGLISH' }],
    templateId: 'test-template-id',
    algorithmOptions: { /* all false */ }
  })

  expect(result.massesCreated).toBe(1) // 1 Sunday in range

  // Verify database records
  const masses = await getMasses({ start_date: '2025-12-01' })
  expect(masses).toHaveLength(1)
})
```

### Integration Tests (Playwright, TODO)

**Test: Complete wizard flow**
```typescript
test('schedule masses wizard flow', async ({ page }) => {
  await page.goto('/masses')
  await page.click('text=Schedule Masses')

  // Step 1
  await page.fill('[id="startDate"]', '2025-12-01')
  await page.fill('[id="endDate"]', '2025-12-31')
  await page.click('text=Next')

  // Step 2
  await page.click('text=Add Mass Time')
  await page.selectOption('[id^="day-"]', '0') // Sunday
  await page.fill('[id^="time-"]', '10:00')
  await page.click('text=Next')

  // Step 3
  await page.click('[data-testid="template-card-1"]')
  await page.click('text=Next')

  // Step 4
  await page.click('text=Schedule Masses')

  // Verify success
  await expect(page).toHaveURL(/\/masses\?start_date=2025-12-01/)
  await expect(page.locator('.toast')).toContainText('Successfully created')
})
```

---

## Edge Cases

**No Available Templates:**
- Step 3 shows alert with link to create template
- Wizard cannot proceed without template

**Date Range Too Large (>365 days):**
- Warning shown in Step 1
- Not blocked, but warns of long processing time

**No Matching Days:**
- Schedule entries don't match any days in range
- Result: 0 Masses created
- Show error before submission

**Empty Schedule:**
- No Mass times added in Step 2
- "Next" button disabled
- Alert shown: "You must add at least one Mass time"

**Duplicate Schedule Entries:**
- Same day/time added twice
- Allowed (creates 2 separate Masses)
- Could add deduplication in future

---

## Related Documentation

- **[MASSES.md](./MASSES.md)** - Mass module overview and role system
- **[MASS_TEMPLATE.md](./MASS_TEMPLATE.md)** - Mass Role Templates structure
- **[MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md)** - Standard module patterns (not applicable to wizard)
- **[Wizard Component](../src/components/wizard/Wizard.tsx)** - Reusable wizard component used

---

## Summary

The Mass Scheduling Module provides a streamlined workflow for bulk Mass creation, reducing scheduling time from hours to minutes. The wizard-based interface guides users through date selection, schedule definition, template selection, and confirmation. The system creates all necessary database records (Events, Masses, Role Instances) in a single operation and automatically assigns ministers based on preferences, availability, and workload balancing.

**Current Status:** ✅ Phase 3 COMPLETE - Full auto-assignment algorithm implemented
- ✅ Phase 1: Mass creation with role instances
- ✅ Phase 2: Interactive assignment editor (Step 5 UI)
- ✅ Phase 3: Auto-assignment with preference filtering, conflict detection, and workload balancing

**Future Enhancements:** Drag-and-drop reassignment, active filtering in Step 5, batch operations
