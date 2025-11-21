# Mass Scheduling UI Documentation

> **⚠️ FUTURE VISION - NOT IMPLEMENTED**
>
> This document describes a **future calendar-based drag-and-drop interface** that has not been built. The current implementation uses a **wizard-based approach** documented in [MASS_SCHEDULING.md](./MASS_SCHEDULING.md).
>
> **Current Implementation:** 5-step wizard at `/masses/schedule` (date range → schedule pattern → template selection → review → results)
>
> **This Document:** Design specification for a potential future calendar UI enhancement.

---

## Overview (Future Design)

The Mass Scheduling module would provide a calendar-based interface for scheduling Masses, linking them to liturgical events, and assigning ministers to serve in various roles. The primary interaction model would be drag-and-drop on a calendar view.

**Route:** `/masses/schedule`

**Access:** Admin, Staff, Ministry-Leaders (with Masses module access)

**Primary View:** Calendar with drag-and-drop functionality

---

## Navigation Structure

### Main Module Navigation
- **Mass Calendar** (default) - Calendar view for scheduling and assignments
- **Mass Roles** - Manage role types (Usher, EEM, Lector, etc.)
- **Role Templates** - Define role requirements per Mass type
- **Time Templates** - Define recurring Mass times
- **Minister Availability** - View/edit which ministers are available for which Masses

---

## Phase 1: Scheduling Masses

### Main Calendar View

**Layout:**
- Monthly calendar grid (default view)
- Week view available via view switcher
- Each day cell shows all Masses scheduled for that day
- Sidebar shows available Mass Time Template Items (draggable chips)

**Mass Time Template Sidebar:**
- Shows active time template (e.g., "Regular Schedule")
- Lists all template items as draggable chips:
  - "Saturday 5:00pm" (badge: "Day Before")
  - "Sunday 8:00am"
  - "Sunday 10:00am"
  - "Sunday 12:00pm"
- Each chip shows the time and day type
- Can switch between templates if multiple exist

**Scheduling Workflow:**
1. User drags a time template item (e.g., "Sunday 10:00am") onto a calendar day
2. System creates a Mass for that date/time
3. Mass appears on calendar as a card with:
   - Time (e.g., "10:00am")
   - Liturgical event name (if linked, e.g., "3rd Sunday of Advent")
   - Role fulfillment indicator (e.g., "4/12 ministers assigned")
   - Status badge (e.g., "Unassigned", "Partially Assigned", "Fully Assigned")

**Mass Card (on calendar):**
```
┌─────────────────────────┐
│ 10:00am                 │
│ 3rd Sunday of Advent    │
│ ● 4/12 ministers        │ <- Progress indicator
│ [Partially Assigned]    │ <- Status badge
└─────────────────────────┘
```

**Clicking a Mass Card:**
Opens a dialog/panel showing:
- Mass details (date, time, liturgical event)
- Option to link/change liturgical event (dropdown)
- Option to select role template (dropdown)
- Quick action: "Assign Ministers" (proceeds to Phase 2)
- Quick action: "Delete Mass"

**Bulk Scheduling:**
- "Schedule Range" button in header
- Opens dialog to schedule multiple Masses at once:
  - Date range selector (e.g., "December 2025")
  - Select which time template items to apply (checkboxes)
  - Option to link to liturgical calendar (auto-detect or manual)
  - Preview before confirming
  - Creates all Masses with one action

---

## Phase 2: Assigning Ministers

### Assignment View

**Trigger:**
- Click "Assign Ministers" on a Mass card
- OR switch to "Assignment View" toggle in header
- OR click into a specific Mass from the calendar

**Layout:**
Two-panel view:

**Left Panel: Mass Details**
- Date and time
- Liturgical event
- Role template selected
- List of role requirements:
  ```
  Ushers (4 needed)
  ☐ [Empty slot] [Suggest Ministers ▼]
  ☐ [Empty slot] [Suggest Ministers ▼]
  ☐ [Empty slot] [Suggest Ministers ▼]
  ☐ [Empty slot] [Suggest Ministers ▼]

  EEMs (6 needed)
  ☐ [Empty slot] [Suggest Ministers ▼]
  ☐ [Empty slot] [Suggest Ministers ▼]
  ...
  ```

**Right Panel: Minister Pool**
- Search/filter ministers
- Filters:
  - By role capability (e.g., show only trained Ushers)
  - By availability (auto-filters to show only available for this Mass time)
  - By recent assignment frequency (highlight those who haven't served recently)
- Display as cards with:
  - Name
  - Available roles (badges)
  - Last served date
  - Availability indicator (green checkmark if available for this time slot)

**Assignment Interaction:**
1. **Auto-Suggest (Primary Method):**
   - Click "Suggest Ministers" dropdown on an empty slot
   - System shows top 5 suggested ministers based on:
     - Availability for this Mass time (from `mass_times_template_item_ids`)
     - Role capability
     - Fair distribution (those who haven't served recently ranked higher)
   - Click a name to assign

2. **Drag-and-Drop (Alternative):**
   - Drag minister card from right panel
   - Drop onto empty role slot in left panel
   - System validates role capability and availability

3. **Assigned State:**
   - Slot shows minister name, avatar, role
   - Quick actions: "Replace" or "Remove"
   - Assigned ministers are dimmed in the right panel

**Assignment Card (filled):**
```
┌─────────────────────────────┐
│ ✓ John Smith               │
│   Usher                     │
│   Last served: Nov 15       │
│   [Replace] [Remove]        │
└─────────────────────────────┘
```

**Bulk Actions:**
- "Auto-Assign All" button - System attempts to fill all empty slots using auto-suggest algorithm
- "Clear All Assignments" - Remove all minister assignments for this Mass
- "Copy from Previous Mass" - Copy assignments from last week's same time Mass

---

## Minister Availability Management

**Route:** `/masses/schedule/availability`

**Purpose:** Configure which Masses each minister is available to serve at

**Layout:**
Table view with ministers as rows and time template items as columns:

```
Minister         | Sat 5pm | Sun 8am | Sun 10am | Sun 12pm
-----------------------------------------------------------------
John Smith       |   ✓     |         |    ✓     |
Mary Johnson     |         |   ✓     |    ✓     |    ✓
```

**Interactions:**
- Click checkbox to toggle availability
- Bulk edit: Select multiple ministers, apply availability pattern
- Import from existing assignments (learn from past patterns)

---

## Minister Self-Service (Future)

**Route:** `/my/mass-schedule`

**Purpose:** Ministers view their assignments and request substitutes

**My Schedule View:**
- List of upcoming Masses where minister is assigned
- Each item shows: Date, time, role, Mass name
- Action: "Request Substitute" button

**Substitute Request Flow:**
1. Minister clicks "Request Substitute"
2. Opens dialog with:
   - Reason for request (optional text field)
   - Suggested replacement (optional dropdown of available ministers)
3. Request sent to scheduler (notification)
4. Scheduler can approve and reassign

---

## Mass Roles Management

**Route:** `/masses/schedule/roles`

**Purpose:** Define role types that exist in the parish

**View:** Simple list/table with create button

**Fields:**
- Name (e.g., "Usher", "Extraordinary Minister of Holy Communion")
- Description
- Active status

**Actions:** Create, Edit, Archive

---

## Role Templates Management

**Route:** `/masses/schedule/role-templates`

**Purpose:** Define standard role requirements for different types of Masses

**View:** List of templates with expandable details

**Template Card:**
```
┌─────────────────────────────────┐
│ Sunday @ 10:00am                │
│ Main Sunday Mass                │
│ [Active]                        │
│                                 │
│ Roles Required:                 │
│ • Ushers: 4                     │
│ • EEMs: 6                       │
│ • Lectors: 2                    │
│ • Altar Servers: 4              │
│                                 │
│ [Edit] [Duplicate] [Archive]   │
└─────────────────────────────────┘
```

**Create/Edit Flow:**
1. Template name and description
2. Add roles with counts:
   - Select role from dropdown
   - Set count (number input)
   - Optional note per role
   - Can add multiple of the same role with different notes (e.g., "Lector - 1st Reading", "Lector - 2nd Reading")

---

## Time Templates Management

**Route:** `/masses/schedule/time-templates`

**Purpose:** Define recurring Mass schedules

**View:** List of time templates with active indicator

**Template Card:**
```
┌─────────────────────────────────┐
│ Regular Schedule                │
│ [Active]                        │
│                                 │
│ Mass Times:                     │
│ • Saturday 5:00pm (Day Before)  │
│ • Sunday 8:00am                 │
│ • Sunday 10:00am                │
│ • Sunday 12:00pm                │
│                                 │
│ [Edit] [Duplicate] [Activate]  │
└─────────────────────────────────┘
```

**Create/Edit Flow:**
1. Template name and description
2. Add time slots:
   - Time picker
   - Day type selector (IS_DAY or DAY_BEFORE)
   - Can add multiple time slots

**Note:** Only one template should be active at a time (system warns if activating a second)

---

## Status Indicators & Visual Cues

**Mass Assignment Status:**
- 🔴 **Unassigned** - No ministers assigned (0% filled)
- 🟡 **Partially Assigned** - Some roles filled (1-99% filled)
- 🟢 **Fully Assigned** - All roles filled (100%)

**Minister Availability:**
- ✓ Green checkmark - Available for this Mass time
- ⚠️ Yellow warning - Not marked as available (can still assign but with warning)
- 🔴 Red X - Already assigned to another Mass at same time (conflict)

**Calendar Color Coding:**
- Use liturgical colors if linked to liturgical calendar event
- Default: neutral background with status border (red/yellow/green)

---

## Key Design Patterns

**Drag-and-Drop:**
- Visual feedback during drag (ghost element follows cursor)
- Drop zones highlight on hover
- Validation before drop (role capability, availability, conflicts)
- Undo action available after drop

**Auto-Suggest Algorithm Factors:**
1. Availability match (must have this time in `mass_times_template_item_ids`)
2. Role capability (trained/approved for this role)
3. Fair distribution (hasn't served in X weeks)
4. Preference (optional future: ministers can indicate preferred roles)
5. Avoid conflicts (not already assigned to another Mass at same time)

**Progressive Disclosure:**
- Calendar view shows high-level status
- Click into Mass for details and assignments
- Click into minister for their full schedule and details

**Responsive Design:**
- Desktop: Side-by-side panels for assignment view
- Tablet: Collapsible panels with toggle
- Mobile: Stack panels vertically, simplified drag-and-drop

---

## Empty States

**No Masses Scheduled:**
"No Masses scheduled for this period. Drag a Mass time from the sidebar to schedule, or use 'Schedule Range' to create multiple Masses at once."

**No Ministers Available:**
"No ministers are marked as available for this Mass time. Would you like to assign anyway or manage minister availability?"

**No Role Template Selected:**
"This Mass doesn't have a role template assigned. Select a template to define which ministers are needed."

**Minister Has No Availability Set:**
"[Minister name] hasn't set their availability preferences. They can still be assigned but won't appear in auto-suggestions."
