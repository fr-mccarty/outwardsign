# Group Baptisms Module - Requirements Document

**Date:** 2025-11-30
**Module Name:** Group Baptisms
**Status:** Requirements Analysis (Updated with User Decisions)
**Author:** Requirements Analyst (AI Agent)

---

## Executive Summary - User Decisions

**The user has made the following key decisions that define this module:**

1. **Module Location:** Group Baptisms will be its own standalone module in the main sidebar (not nested under Baptisms)

2. **Baptism Mode:** **Both** - Some baptisms can be standalone, some can be in groups
   - The existing Baptisms module continues to exist for individual baptisms
   - Group Baptisms is for ceremonies with multiple children
   - A baptism can be either standalone OR part of a group (not both)

3. **Adding Baptisms to Groups:** **Both methods**
   - ✅ Select from existing individual baptisms (picker dialog)
   - ✅ Create new baptisms inline within the group (inline form)

4. **Delete Behavior:** **Cascade delete**
   - Deleting a group baptism also deletes all individual baptism records
   - This is a destructive operation requiring strong confirmation dialog
   - Individual baptisms cannot be "recovered" after group deletion

5. **Script Format:** **Simple list**
   - All children are listed together in one section
   - Not organized by family units
   - Simpler format for presider

6. **Bidirectional Navigation:** **Yes**
   - Individual baptism view page shows link to parent group baptism (if applicable)
   - Individual baptism edit page shows alert banner with group link (if applicable)
   - Group baptism view page shows links to all individual baptisms
   - Enables easy navigation between group and individual records

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [User Stories & Acceptance Criteria](#user-stories--acceptance-criteria)
3. [Database Schema](#database-schema)
4. [User Workflows](#user-workflows)
5. [Module Structure](#module-structure)
6. [UI/UX Considerations](#uiux-considerations)
7. [Content & Export Requirements](#content--export-requirements)
8. [Relationships & Constraints](#relationships--constraints)
9. [Edge Cases](#edge-cases)
10. [Testing Requirements](#testing-requirements)
11. [Documentation Needs](#documentation-needs)
12. [Implementation Plan](#implementation-plan)
13. [Technical Analysis](#technical-analysis)
14. [Documentation Inconsistencies Found](#documentation-inconsistencies-found)

---

## Feature Overview

### What is a Group Baptism?

A **group baptism** is a liturgical celebration where multiple children are baptized together in a single ceremony. This is common in Catholic parishes, especially:
- Monthly or quarterly baptism ceremonies
- Easter Vigil baptisms
- Special parish celebration days
- When multiple families schedule baptisms on the same date

### How Does It Differ from Individual Baptisms?

**Individual Baptism:**
- Single child baptized
- Focus on one family
- One baptism event
- Individual ceremony script with one child's name

**Group Baptism:**
- Multiple children baptized together in one ceremony
- Multiple families participate
- Shared baptism event
- Combined ceremony script listing all children
- Presider needs roster of all families

### Business Value

**For Parish Staff:**
- Efficient management of multiple baptisms at once
- Single liturgical script for presider covering all children
- Clear roster of all families and godparents
- Easier coordination of shared event details

**For Presiders:**
- One comprehensive ceremony script
- Clear list of all children, parents, and godparents
- Better preparation for group ceremonies

**For Families:**
- Shared celebration with other families
- Community experience of baptism
- Individual baptism records still maintained for sacramental records

---

## User Stories & Acceptance Criteria

### User Story 1: Create Group Baptism
**As a** parish staff member
**I want to** create a group baptism event
**So that** I can manage multiple baptisms happening together

**Acceptance Criteria:**
- Can create a new group baptism with event details (date, time, location, presider)
- Can add a group name/title (e.g., "November 2025 Group Baptism")
- Can select a presider for the entire group
- Can add notes for the group ceremony
- System creates a group baptism record in database

### User Story 2: Add Existing Baptisms to Group
**As a** parish staff member
**I want to** add existing individual baptism records to a group baptism
**So that** I can link baptisms that have already been planned

**Acceptance Criteria:**
- Can search and select existing individual baptism records
- Can add multiple existing baptisms to the group at once
- System updates individual baptism records with `group_baptism_id`
- Individual baptisms show they are part of a group
- Only baptisms without a group can be added (no duplicates)

### User Story 3: Create New Baptisms Within Group
**As a** parish staff member
**I want to** create new individual baptism records while editing the group baptism
**So that** I can quickly add children to the group ceremony

**Acceptance Criteria:**
- Can add a new child inline while editing group baptism
- System creates individual baptism record and links to group
- New baptism inherits group event details
- Can add mother, father, godparents for each new baptism
- Can add multiple children one at a time

### User Story 4: View Group Baptism with All Children
**As a** parish staff member or presider
**I want to** view a group baptism with all participating children and families
**So that** I can see who is being baptized together

**Acceptance Criteria:**
- View page shows group baptism details (event, presider, notes)
- Lists all children in the group with their families
- Shows parent and godparent names for each child
- Displays count of baptisms in group
- Can click individual baptism to view details

### User Story 5: Generate Combined Ceremony Script
**As a** presider
**I want to** export a single ceremony script for the group baptism
**So that** I have one document listing all children and families

**Acceptance Criteria:**
- Can generate combined ceremony script (HTML/PDF/Word)
- Script includes all children's names
- Script lists all parents and godparents
- Follows standard baptism liturgy structure
- Includes shared readings and petitions
- Can print or download ceremony script

### User Story 6: Remove Baptism from Group
**As a** parish staff member
**I want to** remove an individual baptism from a group
**So that** I can handle schedule changes or cancellations

**Acceptance Criteria:**
- Can remove individual baptism from group without deleting the baptism record
- Individual baptism's `group_baptism_id` is set to null
- Individual baptism event details are preserved
- Group baptism list updates to reflect removal
- Confirmation dialog warns before removing

### User Story 7: Navigate from Individual Baptism to Group Baptism
**As a** parish staff member or presider
**I want to** see if an individual baptism is part of a group baptism
**So that** I can navigate to the group ceremony details

**Acceptance Criteria:**
- When viewing an individual baptism that belongs to a group, see "Part of Group Baptism: [Group Name]" section
- Group name is a clickable link that navigates to group baptism view page
- When viewing standalone baptism (not in a group), no group section shown
- On individual baptism edit page, group badge/link shown at top if applicable
- Link is visually distinct (badge, card, or highlighted section)

### User Story 8: Delete Group Baptism
**As a** parish staff member
**I want to** delete a group baptism
**So that** I can remove cancelled group ceremonies

**Acceptance Criteria:**
- Can delete entire group baptism
- Linked individual baptisms are **also deleted** (cascade delete)
- All baptism records permanently removed
- Confirmation dialog warns about cascade deletion

---

## Database Schema

### New Table: `group_baptisms`

**Purpose:** Store group baptism events with metadata

```
TABLE: group_baptisms
  - id: UUID primary key (generated)
  - parish_id: UUID foreign key to parishes (NOT NULL, ON DELETE CASCADE)
  - name: TEXT (group baptism name, e.g., "November 2025 Group Baptism")
  - group_baptism_event_id: UUID foreign key to events (nullable, ON DELETE SET NULL)
  - presider_id: UUID foreign key to people (nullable, ON DELETE SET NULL)
  - status: TEXT (module status: PLANNING, ACTIVE, COMPLETED, CANCELLED)
  - note: TEXT (nullable, additional notes)
  - group_baptism_template_id: TEXT (template for ceremony script)
  - created_at: TIMESTAMPTZ (NOT NULL, default now())
  - updated_at: TIMESTAMPTZ (NOT NULL, default now(), auto-updated)

INDEXES:
  - idx_group_baptisms_parish_id ON group_baptisms(parish_id)
  - idx_group_baptisms_event_id ON group_baptisms(group_baptism_event_id)
  - idx_group_baptisms_status ON group_baptisms(status)

RLS POLICIES:
  - Parish members can read their parish group baptisms
  - Parish members can create group baptisms for their parish
  - Parish members can update their parish group baptisms
  - Parish members can delete their parish group baptisms

TRIGGERS:
  - update_group_baptisms_updated_at (auto-update updated_at on UPDATE)
```

### Modified Table: `baptisms`

**Purpose:** Add foreign key to link individual baptisms to group

```
MODIFICATION TO baptisms TABLE:
  - ADD COLUMN: group_baptism_id UUID foreign key to group_baptisms (nullable, ON DELETE CASCADE)

NEW INDEX:
  - idx_baptisms_group_baptism_id ON baptisms(group_baptism_id)

CONSTRAINT:
  - A baptism can only belong to ONE group baptism at a time (enforced by single foreign key)
  - When group_baptism_id is set, the baptism is part of a group
  - When group_baptism_id is NULL, the baptism is standalone
  - When group_baptism is deleted, all linked baptisms are also deleted (CASCADE)
```

### Database Relationships

```
group_baptisms
  ├─ parish_id → parishes (many-to-one, NOT NULL, ON DELETE CASCADE)
  ├─ group_baptism_event_id → events (many-to-one, nullable, ON DELETE SET NULL)
  ├─ presider_id → people (many-to-one, nullable, ON DELETE SET NULL)
  └─ baptisms (one-to-many via group_baptism_id)

baptisms
  ├─ parish_id → parishes (many-to-one, NOT NULL, ON DELETE CASCADE)
  ├─ group_baptism_id → group_baptisms (many-to-one, nullable, ON DELETE SET NULL)
  ├─ baptism_event_id → events (many-to-one, nullable, ON DELETE SET NULL)
  ├─ child_id → people (many-to-one, nullable, ON DELETE SET NULL)
  ├─ mother_id → people (many-to-one, nullable, ON DELETE SET NULL)
  ├─ father_id → people (many-to-one, nullable, ON DELETE SET NULL)
  ├─ sponsor_1_id → people (many-to-one, nullable, ON DELETE SET NULL)
  ├─ sponsor_2_id → people (many-to-one, nullable, ON DELETE SET NULL)
  └─ presider_id → people (many-to-one, nullable, ON DELETE SET NULL)
```

### Data Integrity Rules

**Constraints:**
1. `group_baptism_id` can be NULL (standalone baptism) or reference a valid group_baptism
2. A baptism cannot belong to multiple groups (single foreign key)
3. When a group_baptism is deleted, all linked baptisms are also deleted (ON DELETE CASCADE)
4. When an individual baptism is deleted, it is automatically removed from the group (CASCADE)

**Business Rules:**
1. Individual baptism `presider_id` may differ from group baptism `presider_id`
2. Individual baptism `baptism_event_id` may differ from group baptism `group_baptism_event_id`
3. When adding a baptism to a group, optionally sync event and presider from group
4. When creating a new baptism within a group, auto-populate event and presider from group

---

## User Workflows

### Workflow 1: Create Empty Group Baptism, Add Baptisms Later

**Steps:**
1. Navigate to `/group-baptisms`
2. Click "Create Group Baptism"
3. Fill in group baptism form:
   - Group name (e.g., "December 2025 Group Baptism")
   - Select or create group baptism event (date, time, location)
   - Select presider
   - Select template
   - Add notes
4. Click "Save"
5. System creates group baptism record
6. Redirect to `/group-baptisms/{id}/edit`
7. Click "Add Existing Baptism" button
8. Search and select existing individual baptism records
9. Click "Add to Group" for each baptism
10. System updates baptism records with `group_baptism_id`
11. View updated list of baptisms in group

**Alternative - Add New Baptisms Inline:**
1. From `/group-baptisms/{id}/edit`
2. Click "Add New Baptism"
3. Inline form appears with child picker and parent/godparent pickers
4. Fill in child, parents, godparents
5. Click "Save Baptism"
6. System creates individual baptism record with `group_baptism_id` set
7. New baptism appears in group list

### Workflow 2: Create Group Baptism from Existing Baptisms

**Steps:**
1. Navigate to `/baptisms` (individual baptisms list)
2. Notice multiple baptisms scheduled for same date
3. Navigate to `/group-baptisms`
4. Click "Create Group Baptism"
5. Fill in group details (name, event, presider)
6. Click "Save"
7. Redirect to `/group-baptisms/{id}/edit`
8. Click "Add Existing Baptism"
9. Filter baptisms by date or search
10. Select multiple baptisms
11. Click "Add to Group"
12. System updates all selected baptisms with `group_baptism_id`
13. Confirm all baptisms now appear in group

### Workflow 3: View Group Baptism and Generate Script

**Steps:**
1. Navigate to `/group-baptisms/{id}`
2. View page displays:
   - Group baptism details (name, event, presider, status)
   - List of all children being baptized
   - Each child's parents and godparents
   - Count: "5 baptisms in this group"
3. Click "Download PDF" or "Print View"
4. System generates combined ceremony script listing all children
5. Presider uses script for group baptism ceremony

### Workflow 4: Remove Baptism from Group

**Steps:**
1. Navigate to `/group-baptisms/{id}/edit`
2. View list of baptisms in group
3. Click "Remove" button next to a baptism
4. Confirmation dialog: "Remove [Child Name] from this group baptism? The individual baptism record will remain."
5. Click "Confirm"
6. System sets baptism's `group_baptism_id` to NULL
7. Baptism no longer appears in group list
8. Individual baptism still exists at `/baptisms/{baptism_id}`

### Workflow 5: Delete Group Baptism

**Steps:**
1. Navigate to `/group-baptisms/{id}`
2. Click "Delete" action in dropdown menu
3. Confirmation dialog: "Delete this group baptism? All individual baptism records will remain and be unlinked from this group."
4. Click "Confirm Delete"
5. System deletes group_baptism record
6. All linked baptisms' `group_baptism_id` set to NULL
7. Individual baptisms remain accessible in `/baptisms`
8. Redirect to `/group-baptisms`

### Workflow 6: Edit Group Baptism Details

**Steps:**
1. Navigate to `/group-baptisms/{id}`
2. Click "Edit Group Baptism"
3. Redirect to `/group-baptisms/{id}/edit`
4. Modify group name, event, presider, notes, or template
5. Add or remove baptisms as needed
6. Click "Save"
7. System updates group_baptism record
8. Redirect to `/group-baptisms/{id}` (view page)

---

## Module Structure

### Standard 8-File Module Pattern

**CONFIRMED:** Group Baptisms will follow the standard 8-file module pattern used by weddings, funerals, baptisms, etc.

**File Structure:**

```
src/app/(main)/group-baptisms/
├── page.tsx                                    # List page (server)
├── group-baptisms-list-client.tsx              # List UI (client, PLURAL naming)
├── create/
│   └── page.tsx                                # Create page (server)
├── [id]/
│   ├── page.tsx                                # View page (server)
│   ├── group-baptism-view-client.tsx           # View UI (client)
│   └── edit/
│       └── page.tsx                            # Edit page (server)
├── group-baptism-form-wrapper.tsx              # Form wrapper (client)
└── group-baptism-form.tsx                      # Unified form (client, create + edit)
```

### Additional Components Needed

**Baptism Management Section (within form):**

Location: Within `group-baptism-form.tsx`

```
SECTION: Baptisms in Group
  - Displays list of linked baptisms
  - For each baptism, show:
    - Child name (link to individual baptism view)
    - Parents (mother and father names)
    - Godparents (sponsor 1 and 2 names)
    - "Remove from Group" button
  - Add Existing Baptism button (opens picker dialog)
  - Add New Baptism button (opens inline form)
```

**Baptism Picker Dialog Component:**

Location: `src/components/group-baptisms/baptism-picker-dialog.tsx`

```
COMPONENT: BaptismPickerDialog
  - Search baptisms by child name
  - Filter: Only show baptisms not already in a group (group_baptism_id IS NULL)
  - Filter: Only show baptisms from same parish
  - Display: Child name, baptism event date
  - Multi-select or single-select
  - "Add to Group" button
  - Close dialog on save
```

**Inline Baptism Form Component:**

Location: `src/components/group-baptisms/inline-baptism-form.tsx`

```
COMPONENT: InlineBaptismForm
  - Child picker (required)
  - Mother picker (optional)
  - Father picker (optional)
  - Godparent 1 picker (optional)
  - Godparent 2 picker (optional)
  - "Save Baptism" button
  - "Cancel" button
  - On save: Create individual baptism with group_baptism_id set
  - Inherits group event and presider by default
```

### Server Actions

**Location:** `src/lib/actions/group-baptisms.ts`

**CRUD Operations:**

```
FUNCTION: getGroupBaptisms(filters?)
  - Fetch all group baptisms for current parish
  - Support filters: search, status, sort, date range
  - Return: GroupBaptismWithRelations[] (includes event, presider, baptism count)

FUNCTION: getGroupBaptism(id)
  - Fetch single group baptism (basic)
  - Return: GroupBaptism | null

FUNCTION: getGroupBaptismWithRelations(id)
  - Fetch group baptism with all related data
  - Include: event, presider, all baptisms with their relations
  - Return: GroupBaptismWithRelations | null

FUNCTION: createGroupBaptism(data)
  - Validate data
  - Check permissions
  - Insert group_baptism record
  - Return: GroupBaptism

FUNCTION: updateGroupBaptism(id, data)
  - Validate data
  - Check permissions
  - Update group_baptism record
  - Return: GroupBaptism

FUNCTION: deleteGroupBaptism(id)
  - Check permissions
  - Delete group_baptism record (ON DELETE SET NULL handles unlinking baptisms)
  - Revalidate paths
  - Return: void
```

**Baptism Linking Operations:**

```
FUNCTION: addBaptismToGroup(groupBaptismId, baptismId)
  - Check baptism is not already in a group
  - Update baptism.group_baptism_id = groupBaptismId
  - Optionally sync event and presider from group
  - Revalidate paths
  - Return: Baptism

FUNCTION: removeBaptismFromGroup(baptismId)
  - Update baptism.group_baptism_id = NULL
  - Revalidate paths
  - Return: Baptism

FUNCTION: createBaptismInGroup(groupBaptismId, baptismData)
  - Validate data
  - Create baptism with group_baptism_id set
  - Inherit event and presider from group by default
  - Return: Baptism
```

**Statistics:**

```
FUNCTION: getGroupBaptismStats(groupBaptisms)
  - Calculate total group baptisms
  - Calculate upcoming vs past
  - Return: { total, upcoming, past, filtered }
```

### TypeScript Interfaces

**Location:** `src/lib/types.ts`

**Base Interface:**

```
INTERFACE: GroupBaptism
  - id: string
  - parish_id: string
  - name: string
  - group_baptism_event_id: string | null
  - presider_id: string | null
  - status: ModuleStatus
  - note: string | null
  - group_baptism_template_id: string | null
  - created_at: string
  - updated_at: string
```

**WithRelations Interface:**

```
INTERFACE: GroupBaptismWithRelations extends GroupBaptism
  - group_baptism_event: EventWithRelations | null
  - presider: Person | null
  - baptisms: BaptismWithRelations[]  // All baptisms in this group
```

**Filters and Data Types:**

```
INTERFACE: GroupBaptismFilterParams
  - search?: string
  - status?: ModuleStatus | 'all'
  - sort?: 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  - page?: number
  - limit?: number
  - start_date?: string
  - end_date?: string

INTERFACE: CreateGroupBaptismData
  - name: string
  - group_baptism_event_id?: string | null
  - presider_id?: string | null
  - status?: ModuleStatus
  - note?: string | null
  - group_baptism_template_id?: string | null

INTERFACE: UpdateGroupBaptismData (Partial<CreateGroupBaptismData>)
```

---

## UI/UX Considerations

### List Page (`/group-baptisms`)

**Layout:**
- Uses `PageContainer` with title "Group Baptisms"
- Primary action: "Create Group Baptism" button
- Search and filters card (search by name, filter by status, date range)
- Grid of group baptism cards
- Stats summary: Total, Upcoming, Past

**Card Design:**
- Group name as title
- Event date and location
- Presider name
- Baptism count: "5 baptisms"
- Status badge
- Edit icon (upper right)
- "View" button (bottom right)

**Empty State:**
- "No group baptisms yet"
- "Create your first group baptism to manage multiple baptisms together"
- "Create Group Baptism" button

### View Page (`/group-baptisms/{id}`)

**Layout:**
- Uses `ModuleViewContainer` pattern
- Main content area shows liturgical script preview (combined ceremony)
- Side panel shows metadata and actions

**Metadata Section (Side Panel):**
- Status badge
- Event details (date, time, location)
- Presider name
- Baptism count
- Notes
- Template selector

**Actions:**
- Edit Group Baptism (button)
- Print View (button)
- Download PDF (button)
- Download Word (button)
- Delete (in dropdown menu with confirmation)

**Baptisms List Section (Main Content):**
- Before liturgical script preview
- Card or table layout listing all baptisms
- For each baptism:
  - Child name (linked to individual baptism view)
  - Parents (mother and father)
  - Godparents (sponsors 1 and 2)
  - Individual baptism status
- Click child name to navigate to `/baptisms/{id}`

**Liturgical Script Preview:**
- Rendered HTML from content builder
- Shows combined ceremony with all children listed
- Follows standard baptism ceremony structure
- Includes cover page, readings, ceremony details

### Create Page (`/group-baptisms/create`)

**Layout:**
- Uses `PageContainer` with breadcrumbs
- Renders `GroupBaptismFormWrapper` (no entity prop)
- Form wrapper shows title and action buttons

**Form Sections:**
1. **Group Information**
   - Group name (text input)
   - Group baptism event (EventPickerField)
   - Presider (PersonPickerField)
   - Status (select dropdown)
   - Notes (textarea)
   - Template (select dropdown)

2. **Baptisms in Group**
   - Initially empty on create
   - Message: "Save the group baptism first, then add baptisms on the edit page"
   - Or: Allow adding baptisms inline on create (more complex)

**Recommendation:** Keep create page simple - only group details. Add baptisms on edit page.

### Edit Page (`/group-baptisms/{id}/edit`)

**Layout:**
- Uses `PageContainer` with breadcrumbs
- Renders `GroupBaptismFormWrapper entity={groupBaptism}`
- Form wrapper shows "View" and "Save" buttons at top

**Form Sections:**
1. **Group Information** (same as create)
   - Group name, event, presider, status, notes, template

2. **Baptisms in Group** (new section)
   - Title: "Baptisms in This Group (5)"
   - List of current baptisms with remove buttons
   - "Add Existing Baptism" button
   - "Add New Baptism" button
   - Inline form or dialog for adding

**Add Existing Baptism Flow:**
1. Click "Add Existing Baptism"
2. Dialog opens with BaptismPickerDialog component
3. Search/filter available baptisms (not already in a group)
4. Select one or more baptisms
5. Click "Add to Group"
6. Dialog closes, list updates

**Add New Baptism Flow:**
1. Click "Add New Baptism"
2. Inline form appears below button (or in dialog)
3. Fill in child, parents, godparents
4. Click "Save Baptism"
5. Individual baptism created and linked to group
6. Inline form closes, list updates

**Remove Baptism Flow:**
1. Click "Remove" button next to baptism in list
2. Confirmation dialog: "Remove [Child Name] from this group?"
3. Click "Confirm"
4. Baptism unlinked (group_baptism_id set to NULL)
5. List updates

### Form Styling and Patterns

**CRITICAL - Form Component Usage:**
- ALL inputs, selects, textareas MUST use `FormField` component (see FORMS.md)
- Use `EventPickerField` for group baptism event
- Use `PersonPickerField` for presider and baptism people
- Use `FormInput` for text fields and textareas
- Use `Select` components for status and template
- Follow standard form section card pattern with `FormSectionCard`

**Navigation:**
- After creating group baptism: Redirect to `/group-baptisms/{id}/edit`
- After updating group baptism: `router.refresh()` (stay on edit page)
- Cancel button: Return to `/group-baptisms/{id}` (view page)

---

## Individual Baptism Module Modifications

**IMPORTANT:** The existing Baptisms module needs updates to show group baptism relationships.

### Navigation Flow Overview

```
Group Baptism View Page (/group-baptisms/{id})
│
├─ Baptisms List Section
│  ├─ Child 1 (click) ──────────┐
│  ├─ Child 2 (click)           │
│  └─ Child 3 (click)           │
│                               ↓
│                    Individual Baptism View (/baptisms/{id})
│                    ┌─────────────────────────────────────┐
│                    │ 📋 Part of Group Baptism            │
│                    ├─────────────────────────────────────┤
│                    │ [Group Name]                        │
│  ← (click)─────────│ [View Group Baptism →]  (button)   │
│                    └─────────────────────────────────────┘
│                               │
│                               │ (edit button)
│                               ↓
│                    Individual Baptism Edit (/baptisms/{id}/edit)
│                    ┌──────────────────────────────────────┐
│  ← (click)─────────│ ℹ️ Part of [Group Name] → (link)    │
                     └──────────────────────────────────────┘
```

**Key Features:**
- Group → Individual: Click child name in group baptism list
- Individual → Group: Click button/link in group baptism card/banner
- Bidirectional: Easy navigation in both directions
- Conditional: Only shown when baptism is part of a group

### Baptism View Page (`/baptisms/{id}`) - Modifications

**New Section: Group Baptism Link (Conditional)**

**When to Show:**
- Only shown when `baptism.group_baptism_id` is not NULL
- Appears at the top of the metadata section (side panel)
- Above other metadata fields

**Visual Design:**
```
┌─────────────────────────────────────┐
│ 📋 Part of Group Baptism            │
├─────────────────────────────────────┤
│ [Group Name]                        │
│ [Event Date] • [Baptism Count]      │
│                                     │
│ [View Group Baptism →]  (button)   │
└─────────────────────────────────────┘
```

**Implementation Details:**
- Use a `Card` component with subtle background (bg-muted)
- Icon: 📋 or `Users` icon from Lucide React
- Group name: Large, bold text
- Metadata: Event date + count (e.g., "Dec 15, 2025 • 5 baptisms")
- Button: Links to `/group-baptisms/{group_baptism_id}`
- Button style: Secondary button with arrow icon

**When Not to Show:**
- When `baptism.group_baptism_id` is NULL (standalone baptism)
- No empty state or placeholder shown

### Baptism Edit Page (`/baptisms/{id}/edit`) - Modifications

**New Element: Group Badge (Conditional)**

**When to Show:**
- Only shown when `baptism.group_baptism_id` is not NULL
- Appears at the very top of the page, above the form
- Alert/banner style

**Visual Design:**
```
┌──────────────────────────────────────────────────────┐
│ ℹ️ This baptism is part of [Group Name]             │
│    View group baptism details →                     │
└──────────────────────────────────────────────────────┘
```

**Implementation Details:**
- Use Alert component (informational variant)
- Icon: Info icon
- Text: "This baptism is part of [Group Name]"
- Link: Inline link to `/group-baptisms/{group_baptism_id}`
- Style: Blue/info color scheme
- Non-dismissible (always shown when applicable)

### Baptism List Page (`/baptisms`) - Optional Enhancement

**Future Enhancement (Optional):**
- Add filter: "Show only standalone baptisms" / "Show only grouped baptisms"
- Add badge/icon on baptism cards showing they're part of a group
- Column in table view showing group name (if applicable)

**Not Required for Initial Implementation**

---

## Content & Export Requirements

### Combined Ceremony Script

**Purpose:** Generate a single liturgical document for the presider that lists all children being baptized together.

**Structure (Pseudo-code for content builder):**

```
DOCUMENT: Group Baptism Ceremony Script

SECTION: Cover Page
  - Title: "Baptism Ceremony"
  - Subtitle: [Group Name]
  - Date: [Event Date]
  - Location: [Event Location]
  - Presider: [Presider Name]
  - Number of children: [Count]

SECTION: Introduction
  - Standard baptism introduction text
  - List all children being baptized:
    FOR EACH baptism in group:
      - [Child Full Name]
      - Parents: [Mother Name] and [Father Name]
      - Godparents: [Sponsor 1] and [Sponsor 2]

SECTION: Readings (if any shared readings)
  - First Reading
  - Responsorial Psalm
  - Second Reading
  - Gospel

SECTION: Ceremony
  - Liturgy of the Word instructions
  - Baptismal promises
  - Anointing instructions
  - Blessing instructions
  - For each child, note: "Baptize [Child Name]"

SECTION: Announcements (if any)
  - Group-level announcements

SECTION: Petitions (if any)
  - Intercessions for all families
```

**Template Options:**

Based on existing baptism templates, create group versions:
1. **group-baptism-summary-english** - English ceremony with all children listed
2. **group-baptism-summary-spanish** - Spanish ceremony with all children listed

**Content Builder Location:**
- `src/lib/content-builders/group-baptism/index.ts`
- `src/lib/content-builders/group-baptism/templates/summary-english.ts`
- `src/lib/content-builders/group-baptism/templates/summary-spanish.ts`

**Content Builder Function:**

```
FUNCTION: buildGroupBaptismLiturgy(groupBaptism: GroupBaptismWithRelations, templateId: string)
  - Accept groupBaptism with all baptisms populated
  - Select template based on templateId
  - Build document structure
  - FOR EACH baptism, extract child, parent, godparent names
  - Combine into single document array
  - Return LiturgyDocument[]
```

### Export Formats

**HTML:**
- Print page at `/print/group-baptisms/{id}`
- Renders combined ceremony script
- Uses print-specific styling
- Optimized for browser print

**PDF:**
- API route at `/api/group-baptisms/{id}/pdf`
- Generates PDF from liturgy content
- Downloadable file

**Word:**
- API route at `/api/group-baptisms/{id}/word`
- Generates Word document (.docx)
- Downloadable file

**Filename Format:**
- Pattern: `{group-name}-{date}-group-baptism.{ext}`
- Example: `November-2025-Group-Baptism-2025-11-15-group-baptism.pdf`

**Formatter Function:**

```
FUNCTION: getGroupBaptismFilename(groupBaptism: GroupBaptismWithRelations, extension: string)
  - Extract group name (sanitize for filename)
  - Extract event date (format as YYYY-MM-DD)
  - Combine: "{name}-{date}-group-baptism.{ext}"
  - Return sanitized filename string
```

### Roster/Checklist Option

**Optional Enhancement (Future):**

Create a separate "Roster" template that generates a simple checklist:
- Not a liturgical script
- Just a table/list of families
- Child, Parents, Godparents in tabular format
- For presider's quick reference

**Template ID:** `group-baptism-roster-english`, `group-baptism-roster-spanish`

---

## Relationships & Constraints

### Database Relationships

**One-to-Many: GroupBaptism → Baptisms**

```
group_baptisms (ONE)
  └─ baptisms (MANY via group_baptism_id foreign key)
```

- A group baptism can have multiple baptisms (0 to N)
- A baptism can belong to at most ONE group baptism (or none)
- Enforced by single foreign key `group_baptism_id` in baptisms table

**Constraint:** A baptism cannot belong to multiple groups simultaneously.

**Why:** Baptisms happen at a specific event on a specific date. A child cannot be baptized twice.

### Deleting Entities

**When Group Baptism is Deleted:**

```
ON DELETE group_baptism:
  1. Delete group_baptism record
  2. All linked baptisms are CASCADE DELETED (via ON DELETE CASCADE)
  3. All individual baptism records permanently removed from database
  4. This is a destructive operation - confirmation dialog must warn user
```

**When Individual Baptism is Deleted:**

```
ON DELETE baptism (that belongs to a group):
  1. Delete baptism record (CASCADE)
  2. Baptism automatically removed from group (foreign key deleted)
  3. Group baptism record REMAINS
  4. Other baptisms in group unaffected
```

**User Decision (from questions):** Cascade delete - deleting group baptism also deletes all individual baptisms.

**Recommended UI:**
- When deleting group baptism: Warning dialog with strong language: "This will permanently delete this group baptism AND all [N] individual baptism records. This cannot be undone. Are you sure?"
- When deleting individual baptism that belongs to a group: Warning dialog notes it will be removed from the group

### Unlinking Baptisms from Group

**Manual Unlink (without deletion):**

```
OPERATION: removeBaptismFromGroup(baptismId)
  1. Update baptisms SET group_baptism_id = NULL WHERE id = baptismId
  2. Baptism record remains
  3. Group baptism record remains
  4. Baptism is now standalone
```

**Use Case:** Family reschedules to different date, baptism moved to different group or standalone.

### Moving Baptisms Between Groups

**Workflow:**

```
To move a baptism from Group A to Group B:
  1. Remove baptism from Group A (sets group_baptism_id = NULL)
  2. Add baptism to Group B (sets group_baptism_id = Group B's ID)
```

**Constraint:** Cannot directly move. Must unlink first, then link to new group.

**UI Consideration:** Could add "Move to Different Group" action that does both steps atomically.

### Event and Presider Inheritance

**Scenario:** Individual baptism has its own event and presider. Group baptism has a group event and presider.

**Question:** What if they differ?

**Answer:**
- Individual baptism fields are independent
- Group baptism fields are for group-level ceremony
- When adding baptism to group, optionally sync event and presider to match group
- Give user choice: "Update individual baptism event to match group event?"

**Recommendation:**
- On adding existing baptism to group: Ask user if they want to sync event/presider
- On creating new baptism within group: Auto-populate from group, but allow overrides

---

## Edge Cases

### Edge Case 1: Empty Group Baptism

**Scenario:** Group baptism created but no baptisms added.

**Handling:**
- Allow creation (valid state)
- View page shows "No baptisms in this group yet"
- Ceremony script shows group details but empty child list
- Warning on print/export: "This group has no baptisms"

**Recommendation:** Allow but warn user if attempting to export with zero baptisms.

### Edge Case 2: Group with Only One Baptism

**Scenario:** Group baptism with only one child.

**Handling:**
- Allow (valid state)
- Ceremony script still works (lists one child)
- Not really a "group" but user may plan to add more later

**Recommendation:** No restrictions. Allow single-child groups.

### Edge Case 3: Deleting Individual Baptism in a Group

**Scenario:** User deletes individual baptism that belongs to a group.

**Handling:**
- Show warning: "This baptism is part of [Group Name]. Deleting will remove it from the group."
- User confirms
- Baptism deleted
- Group baptism remains with one fewer baptism
- Update baptism count in group

**Implementation:** In `deleteBaptism()` server action, check if `group_baptism_id` is set and show appropriate warning in UI.

### Edge Case 4: Adding Baptism Already in a Group

**Scenario:** User tries to add baptism to Group B, but it's already in Group A.

**Handling:**
- Prevent addition
- Show error: "This baptism is already part of [Group A Name]. Remove it from that group first."
- Or: Offer to move: "This baptism is in Group A. Move it to this group?"

**Recommendation:** Prevent and show error. Keep move as separate explicit action.

### Edge Case 5: Group Event Deleted

**Scenario:** Group baptism event is deleted (event record removed from database).

**Handling:**
- group_baptism_event_id → SET NULL (ON DELETE SET NULL)
- Group baptism remains but has no event
- View page shows "No event scheduled"
- Warning on export: "Group has no event details"

**Recommendation:** Allow. User can add new event later.

### Edge Case 6: Presider Deleted

**Scenario:** Presider person record is deleted.

**Handling:**
- presider_id → SET NULL (ON DELETE SET NULL)
- Group baptism remains but has no presider
- View page shows "No presider assigned"
- Ceremony script shows "Presider: [Not assigned]"

**Recommendation:** Allow. User can assign new presider later.

### Edge Case 7: Child Deleted from Individual Baptism

**Scenario:** Child person record deleted while baptism is in a group.

**Handling:**
- child_id → SET NULL (ON DELETE SET NULL)
- Baptism record remains in group
- Group ceremony script shows "Child: [Unknown]" or skips that entry

**Recommendation:** Unlikely scenario (why delete child?). Allow but handle gracefully in content builder.

### Edge Case 8: Filtering Baptisms to Add

**Scenario:** User searches for baptisms to add to group. What should be shown?

**Filters:**
- Only baptisms from same parish (parish_id match)
- Only baptisms NOT already in a group (group_baptism_id IS NULL)
- Optionally: Only baptisms with same event date (helpful for grouping)

**Recommendation:**
- Parish filter: Always applied (security)
- Group filter: Always applied (prevent duplicates)
- Date filter: Optional, user can toggle

### Edge Case 9: Baptism Has Different Template Than Group

**Scenario:** Individual baptism has `baptism_template_id = 'baptism-summary-spanish'`, but group has `group_baptism_template_id = 'group-baptism-summary-english'`.

**Handling:**
- Group template controls group ceremony script
- Individual template controls individual ceremony script (if exported separately)
- Templates are independent

**Recommendation:** Document that group template is for group ceremony, individual templates are for individual exports.

### Edge Case 10: Bulk Operations

**Scenario:** User wants to add 20 baptisms to a group at once.

**Handling:**
- BaptismPickerDialog supports multi-select
- Click "Add to Group" adds all selected baptisms
- Server action loops through and sets group_baptism_id for each
- Single revalidation after all updates

**Recommendation:** Implement multi-select in picker dialog. Batch update in server action.

---

## Testing Requirements

### Unit Tests (Server Actions)

**Location:** `src/lib/actions/__tests__/group-baptisms.test.ts`

**Test Scenarios:**

```
TEST: createGroupBaptism
  - Creates group baptism with valid data
  - Assigns parish_id from authenticated user
  - Returns created group baptism record

TEST: getGroupBaptismWithRelations
  - Fetches group baptism with event, presider, and all baptisms
  - Includes all baptism relations (child, parents, godparents)
  - Returns null if group baptism not found

TEST: addBaptismToGroup
  - Links baptism to group by setting group_baptism_id
  - Prevents adding baptism already in another group
  - Returns updated baptism record

TEST: removeBaptismFromGroup
  - Unlinks baptism by setting group_baptism_id to NULL
  - Baptism record remains
  - Returns updated baptism record

TEST: deleteGroupBaptism
  - Deletes group baptism record
  - Linked baptisms' group_baptism_id set to NULL
  - Individual baptisms remain in database

TEST: createBaptismInGroup
  - Creates new baptism with group_baptism_id set
  - Inherits event and presider from group
  - Returns created baptism record
```

### Integration Tests (E2E with Playwright)

**Location:** `tests/group-baptisms.spec.ts`

**Test Scenarios:**

```
TEST: Create group baptism
  1. Navigate to /group-baptisms
  2. Click "Create Group Baptism"
  3. Fill in group name, select event, select presider
  4. Click "Save"
  5. Assert redirected to edit page
  6. Assert group baptism appears in list

TEST: Add existing baptism to group
  1. Create group baptism
  2. Create individual baptism (standalone)
  3. Navigate to group baptism edit page
  4. Click "Add Existing Baptism"
  5. Search for baptism by child name
  6. Select baptism and click "Add to Group"
  7. Assert baptism appears in group list
  8. Navigate to individual baptism view
  9. Assert shows "Part of [Group Name]"

TEST: Create new baptism within group
  1. Navigate to group baptism edit page
  2. Click "Add New Baptism"
  3. Fill in child, parents, godparents
  4. Click "Save Baptism"
  5. Assert new baptism appears in group list
  6. Navigate to new baptism view
  7. Assert linked to group

TEST: Remove baptism from group
  1. Add baptism to group
  2. Navigate to group baptism edit page
  3. Click "Remove" next to baptism
  4. Confirm removal in dialog
  5. Assert baptism no longer in group list
  6. Navigate to individual baptism view
  7. Assert no longer linked to group

TEST: Delete group baptism
  1. Create group baptism with 2 baptisms
  2. Navigate to group baptism view page
  3. Click "Delete" in actions dropdown
  4. Confirm deletion
  5. Assert redirected to group baptisms list
  6. Assert group baptism no longer exists
  7. Navigate to individual baptisms
  8. Assert baptisms still exist and are standalone

TEST: Generate combined ceremony script
  1. Create group baptism with 3 baptisms
  2. Navigate to group baptism view page
  3. Assert sees list of all 3 children
  4. Click "Download PDF"
  5. Assert PDF downloads with combined script
  6. Assert PDF contains all 3 children's names

TEST: Filter baptisms when adding to group
  1. Create Group A with Baptism 1
  2. Create Group B (empty)
  3. Create Baptism 2 (standalone)
  4. Navigate to Group B edit page
  5. Click "Add Existing Baptism"
  6. Assert Baptism 1 NOT shown (already in Group A)
  7. Assert Baptism 2 IS shown (available)

TEST: Bidirectional navigation between group and individual baptism
  1. Create group baptism with 2 baptisms
  2. Navigate to group baptism view page
  3. Click child name link to navigate to individual baptism
  4. Assert individual baptism view page shows "Part of Group Baptism" section
  5. Assert group name is displayed with event date and count
  6. Click "View Group Baptism" button
  7. Assert navigates back to group baptism view page
  8. Navigate to individual baptism edit page
  9. Assert alert banner shows at top with group link
  10. Click group link in banner
  11. Assert navigates to group baptism view page
```

### Permission Tests

**Location:** `tests/permissions.spec.ts` (extend existing tests)

```
TEST: Staff can manage group baptisms
  - Staff user can create, edit, delete group baptisms
  - Staff user can add/remove baptisms from groups

TEST: Parishioner cannot manage group baptisms
  - Parishioner can view group baptisms (if shared)
  - Parishioner cannot create, edit, delete group baptisms
  - Parishioner cannot add/remove baptisms

TEST: Parish isolation
  - Group baptisms from Parish A not visible to Parish B users
  - Cannot add baptism from Parish B to group in Parish A
```

---

## Documentation Needs

### User Documentation

**Location:** `src/app/documentation/content/en/features/group-baptisms.md`

**Content:**

```
TITLE: Group Baptisms

OVERVIEW:
What are group baptisms and when to use them

CREATING A GROUP BAPTISM:
Step-by-step guide to creating a group baptism

ADDING BAPTISMS TO A GROUP:
How to add existing baptisms or create new ones

MANAGING BAPTISMS IN A GROUP:
Removing baptisms, editing group details

GENERATING CEREMONY SCRIPTS:
How to export combined ceremony scripts for presiders

DELETING GROUP BAPTISMS:
What happens when you delete a group baptism
```

**Spanish Version:** `src/app/documentation/content/es/features/group-baptisms.md`

### Developer Documentation

**Update Existing Documentation:**

**FILE: docs/MODULE_REGISTRY.md**
- Add group-baptisms to module registry
- Route: `/group-baptisms`
- Label: "Group Baptisms"
- Icon: `Users` (multiple people icon)
- Description: "Manage group baptism ceremonies with multiple families"

**FILE: docs/TEMPLATE_REGISTRY.md**
- Add group baptism templates:
  - `group-baptism-summary-english`
  - `group-baptism-summary-spanish`

**FILE: docs/TESTING_REGISTRY.md**
- Add test scenarios for group baptisms module

**NEW FILE: docs/GROUP_BAPTISMS.md**
- Comprehensive module documentation
- Architecture pattern (8-file structure)
- Database schema
- Server actions
- Content builder structure
- UI patterns
- Relationships and constraints

### CLAUDE.md Updates

**Update Section: Creating New Modules**

Add example of grouping pattern:
- Group baptisms as example of one-to-many module relationships
- How to link entities together
- Managing collections of related records

---

## Implementation Plan

### Phase 1: Database Foundation

**Tasks:**
1. Create migration file `20251130000001_create_group_baptisms_table.sql`
   - Create `group_baptisms` table
   - Add RLS policies
   - Create indexes
2. Create migration file `20251130000002_add_group_baptism_id_to_baptisms.sql`
   - Add `group_baptism_id` column to `baptisms` table
   - Add foreign key constraint
   - Create index
3. User runs `npm run db:fresh` to apply migrations

**Validation:**
- Confirm tables exist in database
- Confirm RLS policies active
- Test insert/update/delete operations

### Phase 2: TypeScript Types and Server Actions

**Tasks:**
1. Add `GroupBaptism` and `GroupBaptismWithRelations` to `src/lib/types.ts`
2. Create `src/lib/actions/group-baptisms.ts`
   - Implement all CRUD operations
   - Implement baptism linking operations
   - Implement statistics function
3. Create validation schemas `src/lib/schemas/group-baptisms.ts`

**Validation:**
- Types compile without errors
- Server actions execute successfully
- Permissions enforced correctly

### Phase 3: Module Structure (8 Main Files)

**Tasks:**
1. Create list page: `src/app/(main)/group-baptisms/page.tsx`
2. Create list client: `src/app/(main)/group-baptisms/group-baptisms-list-client.tsx`
3. Create create page: `src/app/(main)/group-baptisms/create/page.tsx`
4. Create view page: `src/app/(main)/group-baptisms/[id]/page.tsx`
5. Create edit page: `src/app/(main)/group-baptisms/[id]/edit/page.tsx`
6. Create form wrapper: `src/app/(main)/group-baptisms/group-baptism-form-wrapper.tsx`
7. Create unified form: `src/app/(main)/group-baptisms/group-baptism-form.tsx`
8. Create view client: `src/app/(main)/group-baptisms/[id]/group-baptism-view-client.tsx`

**Validation:**
- All routes accessible
- Forms submit successfully
- Navigation works correctly
- Data displays properly

### Phase 4: Baptism Management Components

**Tasks:**
1. Create `src/components/group-baptisms/baptism-picker-dialog.tsx`
2. Create `src/components/group-baptisms/inline-baptism-form.tsx`
3. Integrate baptism management section into `group-baptism-form.tsx`
4. Implement add existing baptism flow
5. Implement add new baptism flow
6. Implement remove baptism flow

**Validation:**
- Can add existing baptisms to group
- Can create new baptisms within group
- Can remove baptisms from group
- UI updates correctly after operations

### Phase 5: Content Builder and Export

**Tasks:**
1. Create `src/lib/content-builders/group-baptism/index.ts`
2. Create `src/lib/content-builders/group-baptism/templates/summary-english.ts`
3. Create `src/lib/content-builders/group-baptism/templates/summary-spanish.ts`
4. Create `src/lib/utils/formatters.ts` - add `getGroupBaptismFilename()`
5. Create print page: `src/app/print/group-baptisms/[id]/page.tsx`
6. Create PDF route: `src/app/api/group-baptisms/[id]/pdf/route.ts`
7. Create Word route: `src/app/api/group-baptisms/[id]/word/route.ts`

**Validation:**
- Combined ceremony script generates correctly
- All children listed in document
- HTML renders properly
- PDF downloads successfully
- Word documents download successfully

### Phase 6: Constants and Navigation

**Tasks:**
1. Add group baptism template constants to `src/lib/constants.ts`
2. Update `src/components/main-sidebar.tsx` - add "Group Baptisms" link
3. Update `src/lib/constants.ts` - add GROUP_BAPTISM_TEMPLATE_VALUES
4. Update module registry documentation

**Validation:**
- Sidebar shows "Group Baptisms" link
- Link navigates correctly
- Constants available throughout app

### Phase 7: Testing

**Tasks:**
1. Write unit tests for server actions
2. Write E2E tests with Playwright
3. Test permission enforcement
4. Test edge cases
5. Test across different roles (admin, staff, parishioner)

**Validation:**
- All tests pass
- Coverage meets standards
- Edge cases handled correctly

### Phase 8: Baptism Module Modifications (Bidirectional Navigation)

**Tasks:**
1. Update `src/lib/types.ts` - Add `group_baptism_id` to `Baptism` interface
2. Update `src/app/(main)/baptisms/[id]/page.tsx` - Fetch group baptism if `group_baptism_id` present
3. Update `src/app/(main)/baptisms/[id]/baptism-view-client.tsx` - Add group baptism card/link section
4. Update `src/app/(main)/baptisms/[id]/edit/page.tsx` - Fetch group baptism if applicable
5. Update `src/app/(main)/baptisms/baptism-form-wrapper.tsx` - Add alert banner at top showing group link

**Validation:**
- Individual baptism view page shows group link when `group_baptism_id` is present
- Link navigates correctly to group baptism view page
- Individual baptism edit page shows alert banner with group link
- Standalone baptisms (no group) show no group sections
- UI matches visual design specifications

### Phase 9: Documentation

**Tasks:**
1. Create user documentation (EN and ES)
2. Create developer documentation
3. Update MODULE_REGISTRY.md
4. Update TEMPLATE_REGISTRY.md
5. Create GROUP_BAPTISMS.md

**Validation:**
- Documentation complete and accurate
- Examples work correctly
- Links functional

---

## Technical Analysis

### UI Implications

**Pages/Views to Create:**
- List page (`/group-baptisms`)
- Create page (`/group-baptisms/create`)
- View page (`/group-baptisms/{id}`)
- Edit page (`/group-baptisms/{id}/edit`)
- Print page (`/print/group-baptisms/{id}`)

**Forms Needed:**
- Group baptism form (unified for create/edit)
- Inline baptism form (for adding new baptisms to group)

**User Interactions:**
- Search and filter group baptisms
- Create/edit/delete group baptisms
- Add existing baptisms to group (picker dialog)
- Create new baptisms within group (inline form)
- Remove baptisms from group (confirmation dialog)
- Export combined ceremony script (PDF/Word/Print)

**Navigation Integration:**
- Add "Group Baptisms" to main sidebar under sacraments section
- Breadcrumbs on all pages
- Links from group baptism to individual baptisms (in baptisms list section)
- **Bidirectional navigation:** Links from individual baptism to parent group (if applicable)
  - Individual baptism view page shows "Part of Group Baptism: [Group Name]" with link to group
  - Individual baptism edit page shows group badge/link at top
  - When `group_baptism_id` is NULL, no group link shown

### Server Action Implications

**CRUD Operations:**
- `getGroupBaptisms()` - List with filters
- `getGroupBaptism()` - Single fetch
- `getGroupBaptismWithRelations()` - Fetch with all relations
- `createGroupBaptism()` - Create new group
- `updateGroupBaptism()` - Update group details
- `deleteGroupBaptism()` - Delete group (unlinks baptisms)

**Baptism Linking Operations:**
- `addBaptismToGroup()` - Link existing baptism
- `removeBaptismFromGroup()` - Unlink baptism
- `createBaptismInGroup()` - Create new baptism in group

**Data Fetching Patterns:**
- Parallel fetching for group baptism with relations (Promise.all)
- Filtered queries for available baptisms (not in group)
- Stats computation server-side

**Business Logic:**
- Validate baptism not already in group before adding
- Optionally sync event/presider when adding to group
- Unlink baptisms when group deleted (handled by ON DELETE SET NULL)

### Interface Analysis

**New Interfaces:**
- `GroupBaptism` (base type)
- `GroupBaptismWithRelations` (with event, presider, baptisms)
- `GroupBaptismFilterParams` (filters for list page)
- `CreateGroupBaptismData` (form data for create)
- `UpdateGroupBaptismData` (form data for update)

**Modified Interfaces:**
- `Baptism` - add `group_baptism_id?: string | null` field
- `BaptismWithRelations` - potentially add `group_baptism?: GroupBaptism | null`

**Where Interfaces Live:**
- `src/lib/types.ts` - All base and WithRelations types
- `src/lib/actions/group-baptisms.ts` - Filter params and data types
- `src/lib/schemas/group-baptisms.ts` - Zod validation schemas

**Relations to Existing Types:**
- GroupBaptism → Event (many-to-one)
- GroupBaptism → Person (presider, many-to-one)
- GroupBaptism → Baptism (one-to-many)
- Baptism → GroupBaptism (many-to-one, nullable)

### Styling Concerns

**Follow Existing Patterns:**
- Use semantic color tokens (bg-background, text-foreground, etc.)
- Support dark mode automatically
- Use existing components (Card, Button, Badge, Dialog, etc.)
- Print views use print-specific styling

**Custom Styling Needs:**
- None - follows standard module patterns
- Baptism list in group form may need table or card layout (reuse existing patterns)

**Dark Mode:**
- All components use semantic tokens
- No custom dark mode handling needed
- Automatically supported

### Component Analysis

**Existing Custom Components to Reuse:**
- `PageContainer` - Page layout with title and actions
- `BreadcrumbSetter` - Breadcrumb navigation
- `ModuleCreateButton` - "Create" button for list page
- `ModuleViewContainer` - View page layout with side panel
- `FormSectionCard` - Form section grouping
- `FormInput` - Text inputs and textareas
- `FormBottomActions` - Save/Cancel buttons
- `EventPickerField` - Event selection with inline create
- `PersonPickerField` - Person selection with inline create
- `TemplateSelectorDialog` - Template selection dialog
- `ModuleStatusLabel` - Status badge
- All shadcn/ui components (Button, Card, Dialog, Select, etc.)

**New Components to Create:**
- `BaptismPickerDialog` - Select existing baptisms to add to group
- `InlineBaptismForm` - Create new baptism within group
- `GroupBaptismCard` - Display group baptism in list (may reuse existing card patterns)

**Missing Components:**
None identified. All needed components exist or will be created.

**Component Registry Update:**
Add new components to `docs/COMPONENT_REGISTRY.md`:
- BaptismPickerDialog (under Group Baptisms section)
- InlineBaptismForm (under Group Baptisms section)

### Implementation Locations

**New Files:**

```
Database:
- supabase/migrations/20251130000001_create_group_baptisms_table.sql
- supabase/migrations/20251130000002_add_group_baptism_id_to_baptisms.sql

Types and Actions:
- src/lib/types.ts (add GroupBaptism types)
- src/lib/actions/group-baptisms.ts (new file)
- src/lib/schemas/group-baptisms.ts (new file)

Module Files:
- src/app/(main)/group-baptisms/page.tsx
- src/app/(main)/group-baptisms/group-baptisms-list-client.tsx
- src/app/(main)/group-baptisms/create/page.tsx
- src/app/(main)/group-baptisms/[id]/page.tsx
- src/app/(main)/group-baptisms/[id]/edit/page.tsx
- src/app/(main)/group-baptisms/group-baptism-form-wrapper.tsx
- src/app/(main)/group-baptisms/group-baptism-form.tsx
- src/app/(main)/group-baptisms/[id]/group-baptism-view-client.tsx

Components:
- src/components/group-baptisms/baptism-picker-dialog.tsx
- src/components/group-baptisms/inline-baptism-form.tsx

Content Builders:
- src/lib/content-builders/group-baptism/index.ts
- src/lib/content-builders/group-baptism/templates/summary-english.ts
- src/lib/content-builders/group-baptism/templates/summary-spanish.ts
- src/lib/content-builders/group-baptism/helpers.ts

Print and Export:
- src/app/print/group-baptisms/[id]/page.tsx
- src/app/api/group-baptisms/[id]/pdf/route.ts
- src/app/api/group-baptisms/[id]/word/route.ts

Documentation:
- docs/GROUP_BAPTISMS.md
- src/app/documentation/content/en/features/group-baptisms.md
- src/app/documentation/content/es/features/group-baptisms.md

Tests:
- src/lib/actions/__tests__/group-baptisms.test.ts
- tests/group-baptisms.spec.ts
```

**Modified Files:**

```
- src/lib/types.ts (add GroupBaptism interfaces, update Baptism interface with group_baptism_id)
- src/lib/constants.ts (add GROUP_BAPTISM_TEMPLATE_* constants)
- src/components/main-sidebar.tsx (add "Group Baptisms" link)
- src/lib/utils/formatters.ts (add getGroupBaptismFilename function)
- src/app/(main)/baptisms/[id]/page.tsx (fetch group baptism data if applicable)
- src/app/(main)/baptisms/[id]/baptism-view-client.tsx (add group baptism link section)
- src/app/(main)/baptisms/[id]/edit/page.tsx (fetch group baptism data if applicable)
- src/app/(main)/baptisms/baptism-form-wrapper.tsx (add group badge at top)
- docs/MODULE_REGISTRY.md (add group-baptisms entry)
- docs/TEMPLATE_REGISTRY.md (add group baptism templates)
- docs/COMPONENT_REGISTRY.md (add new components)
- docs/TESTING_REGISTRY.md (add test scenarios)
```

### Documentation Impact

**CLAUDE.md Updates:**
- Mention group baptisms as example of one-to-many relationships
- Reference GROUP_BAPTISMS.md for detailed documentation

**docs/ Directory Updates:**
- Create GROUP_BAPTISMS.md (comprehensive module docs)
- Update MODULE_REGISTRY.md (add group-baptisms entry)
- Update TEMPLATE_REGISTRY.md (add templates)
- Update COMPONENT_REGISTRY.md (add new components)
- Update TESTING_REGISTRY.md (add test scenarios)

**User Documentation:**
- Create `/documentation/group-baptisms` page (EN and ES)
- Add to features list in documentation sidebar
- Include screenshots and walkthroughs

**README Updates:**
N/A - README already lists all sacraments generically

### Testing Requirements

**Unit Tests:**
- Server action tests for all CRUD operations
- Server action tests for baptism linking operations
- Validation schema tests
- Permission enforcement tests

**Integration Tests (E2E):**
- Full workflows (create, add baptisms, export, delete)
- Permission tests (staff vs parishioner)
- Edge case tests (empty groups, single baptism, deleting entities)
- UI interaction tests (dialogs, forms, navigation)

**Test Coverage:**
- Aim for >80% coverage on server actions
- All major workflows covered by E2E tests
- Permission scenarios tested

**Test Data:**
- Create test group baptisms with multiple baptisms
- Create standalone baptisms for linking tests
- Create test events and people records

### Code Reuse & Abstraction

**Reuse Existing Patterns:**
- Standard 8-file module structure (wedding/funeral/baptism pattern)
- ModuleViewContainer for view page
- EventPickerField and PersonPickerField for pickers
- Content builder architecture (same as other modules)
- Print page and export API routes (same factory pattern)

**New Abstractions:**
- BaptismPickerDialog (new reusable component)
- InlineBaptismForm (new reusable component)
- Group baptism content builder templates

**Follow Rule of Three:**
- BaptismPickerDialog is unique to group baptisms (first use, no abstraction needed yet)
- InlineBaptismForm is unique to group baptisms (first use, no abstraction needed yet)
- If other modules need entity linking, revisit and abstract

**No Premature Abstraction:**
- Keep group baptism components specific to this module
- Only abstract if pattern repeats 3+ times across modules

### Security Concerns

**Authentication/Authorization:**
- All server actions require authentication (`requireSelectedParish()`)
- Permission checks via `requireModuleAccess(userParish, 'group-baptisms')`
- RLS policies enforce parish-scoped access
- Only staff and admin can create/edit/delete group baptisms

**Data Validation:**
- Zod schemas validate all form inputs
- Prevent adding baptism already in another group
- Validate parish_id matches authenticated user's parish
- Sanitize filenames for exports

**RLS Policies:**
- `group_baptisms` table: Parish-scoped SELECT/INSERT/UPDATE/DELETE
- Policies match existing module patterns (weddings, funerals, baptisms)
- Anon and authenticated roles both granted access (JWT-based)

**Potential Security Issues:**
None identified beyond standard module patterns.

**Recommendations:**
- Follow existing module permission patterns exactly
- Test permission enforcement thoroughly
- Ensure parish isolation (no cross-parish data leaks)

### Database Changes

**New Table:**
- `group_baptisms` - Stores group baptism records

**Schema:**
```sql
CREATE TABLE group_baptisms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  group_baptism_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  presider_id UUID REFERENCES people(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'PLANNING',
  note TEXT,
  group_baptism_template_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Modified Table:**
- `baptisms` - Add `group_baptism_id` column

**Schema Change:**
```sql
ALTER TABLE baptisms
ADD COLUMN group_baptism_id UUID REFERENCES group_baptisms(id) ON DELETE SET NULL;

CREATE INDEX idx_baptisms_group_baptism_id ON baptisms(group_baptism_id);
```

**Migrations:**
1. `20251130000001_create_group_baptisms_table.sql`
2. `20251130000002_add_group_baptism_id_to_baptisms.sql`

**Migration Strategy:**
- Create two separate migration files (one per table)
- Follow existing migration patterns from other modules
- Include RLS policies in migration
- User must run `npm run db:fresh` after migrations created

**Data Migration:**
N/A - No existing data to migrate (new feature)

---

## Documentation Inconsistencies Found

### Inconsistency 1: Module File Count Discrepancy

**Location:** CLAUDE.md and MODULE_CHECKLIST.md

**Issue:**
- CLAUDE.md states "9 main files" in multiple places
- MODULE_COMPONENT_PATTERNS.md and MODULE_CHECKLIST.md refer to "8-file pattern"
- Actual count: 8 files (list page, list client, create page, view page, edit page, form wrapper, unified form, view client) + 1 print page (not counted as "main file")

**Suggested Correction:**
- Standardize on "8-file module pattern" throughout documentation
- Clarify that print page is separate from the 8 main module files
- Update CLAUDE.md to use "8-file pattern" consistently

**Files to Update:**
- CLAUDE.md (search for "9 main files" and update to "8 main files")
- MODULE_CHECKLIST.md (already correct with "9 main files + 1 print page" → change to "8 main files + 1 print page")

### Inconsistency 2: Groups Module Pattern Description

**Location:** CLAUDE.md Section "Module Structure (Main Files)"

**Issue:**
The note states: "Note on Groups Module: The Groups module uses a different architecture pattern (dialog-based forms) rather than the standard 8-file structure."

However, the actual Groups module (`src/app/(main)/groups/`) DOES follow the standard 8-file pattern with:
- page.tsx (list page)
- groups-list-client.tsx (list client)
- create/page.tsx (create page)
- [id]/page.tsx (view page)
- [id]/edit/page.tsx (edit page)
- group-form-wrapper.tsx (form wrapper)
- group-form.tsx (unified form)
- [id]/group-view-client.tsx (view client)

The GROUP_MEMBERS.md documentation describes the group-members module (not groups module) as having a different pattern.

**Suggested Correction:**
- Update CLAUDE.md to clarify that the **Group Members module** uses a person-centric pattern (not the Groups module)
- Remove or correct the note about Groups module using a different pattern
- Add note: "The Group Members module uses a person-centric pattern similar to Mass Role Directory"

**Files to Update:**
- CLAUDE.md - Section "Module Structure (Main Files)"
- Clarify distinction between "Groups" module and "Group Members" module

### Inconsistency 3: Template Selector Location Documentation

**Location:** MODULE_COMPONENT_PATTERNS.md vs LITURGICAL_SCRIPT_SYSTEM.md

**Issue:**
- MODULE_COMPONENT_PATTERNS.md implies template selector is on form/edit page
- LITURGICAL_SCRIPT_SYSTEM.md correctly states template selector is on view page only

**Current State (from investigation):**
- All modules use template selector on view page (via ModuleViewContainer)
- Template selector is NOT on edit pages
- This is consistent and correct

**Suggested Correction:**
- Update MODULE_COMPONENT_PATTERNS.md to explicitly state template selector is on view page only
- Add note in edit page section: "Note: Template selection happens on view page, not edit page"

**Files to Update:**
- MODULE_COMPONENT_PATTERNS.md - Edit page section

---

## Summary Report

### Feature Overview

**Group Baptisms** is a new module for managing liturgical ceremonies where multiple children are baptized together. The module creates group-level records that link to individual baptism records, allowing parish staff to coordinate multiple families while maintaining individual sacramental records.

### Technical Scope

**Database:**
- New table: `group_baptisms`
- Modified table: `baptisms` (add `group_baptism_id` foreign key)
- 2 new migration files
- RLS policies for parish-scoped access

**Server:**
- New server actions file: `src/lib/actions/group-baptisms.ts`
- 8 CRUD operations (create, read, update, delete, list, stats)
- 3 baptism linking operations (add, remove, create in group)
- Validation schemas with Zod

**UI:**
- 8 main module files (standard pattern)
- 3 print/export routes (print page, PDF, Word)
- 2 new custom components (BaptismPickerDialog, InlineBaptismForm)
- Integrated with ModuleViewContainer pattern

### Components (Reused vs New)

**Reused Components (15+):**
- PageContainer, BreadcrumbSetter, ModuleCreateButton
- ModuleViewContainer, TemplateSelectorDialog, ModuleStatusLabel
- FormSectionCard, FormInput, FormBottomActions
- EventPickerField, PersonPickerField
- All shadcn/ui components (Button, Card, Dialog, Select, Badge, etc.)

**New Components (2):**
- BaptismPickerDialog - Select existing baptisms to add to group
- InlineBaptismForm - Create new baptism within group

**Ratio:** 88% reuse, 12% new

### Documentation Updates Needed

**New Documentation:**
- docs/GROUP_BAPTISMS.md (comprehensive module docs)
- src/app/documentation/content/en/features/group-baptisms.md
- src/app/documentation/content/es/features/group-baptisms.md

**Updated Documentation:**
- docs/MODULE_REGISTRY.md (add group-baptisms entry)
- docs/TEMPLATE_REGISTRY.md (add 2 templates)
- docs/COMPONENT_REGISTRY.md (add 2 components)
- docs/TESTING_REGISTRY.md (add test scenarios)
- src/lib/constants.ts (add template constants)
- src/components/main-sidebar.tsx (add navigation link)

### Testing Requirements

**Unit Tests:**
- 8+ server action tests
- Permission enforcement tests
- Validation schema tests

**E2E Tests (Playwright):**
- 7+ full workflow tests
- Edge case tests (empty groups, deletion scenarios)
- Permission tests (staff vs parishioner)
- Parish isolation tests

**Estimated Test Count:** 20+ tests total

### Security Considerations

**Authentication:**
- All server actions require authentication
- Parish-scoped access via RLS policies
- Permission checks on all mutations

**Authorization:**
- Module access: 'group-baptisms' permission required
- Staff and Admin roles: Full CRUD access
- Parishioner role: Read-only (if shared)

**Data Validation:**
- Zod schemas validate all inputs
- Prevent cross-parish access
- Prevent adding baptism to multiple groups
- Sanitize export filenames

**No Security Issues Identified:** Module follows existing patterns exactly.

### Estimated Complexity

**Overall Complexity:** Medium

**Breakdown:**
- Database schema: Low (standard one-to-many relationship)
- Server actions: Medium (8 CRUD + 3 linking operations)
- UI components: Medium (8 standard files + 2 new components)
- Content builder: Low (similar to existing baptism builder)
- Testing: Medium (20+ tests across unit and E2E)

**Lines of Code Estimate:** ~2,500 lines
- Server actions: ~400 lines
- UI components: ~1,200 lines
- Content builders: ~300 lines
- Tests: ~600 lines

**Time Estimate:** 3-4 development days
- Day 1: Database, types, server actions
- Day 2: Module structure (8 files)
- Day 3: Baptism management components, content builder
- Day 4: Testing, documentation

### Dependencies and Blockers

**Dependencies:**
- Existing baptisms module (already implemented ✓)
- Existing events module (already implemented ✓)
- Existing people module (already implemented ✓)
- ModuleViewContainer pattern (already implemented ✓)
- Content builder system (already implemented ✓)

**No Blockers Identified**

**Prerequisites:**
- User must run `npm run db:fresh` after migration files created
- No code changes needed in existing modules

### Documentation Inconsistencies Found

**3 Inconsistencies Identified:**

1. **Module File Count:** CLAUDE.md inconsistently refers to "9 main files" vs "8-file pattern"
   - **Impact:** Minor confusion for developers
   - **Fix:** Standardize on "8-file pattern" throughout

2. **Groups Module Pattern:** CLAUDE.md incorrectly states Groups module uses different pattern
   - **Impact:** Confusion between Groups module and Group Members module
   - **Fix:** Clarify Groups follows standard pattern, Group Members is person-centric

3. **Template Selector Location:** MODULE_COMPONENT_PATTERNS.md ambiguous about template selector
   - **Impact:** Could lead to implementing template selector on wrong page
   - **Fix:** Explicitly state template selector is view page only

**All inconsistencies are documentation-only, no code issues.**

### Next Steps

**After requirements are approved:**

1. **Create Database Migrations**
   - Create `group_baptisms` table migration
   - Create `baptisms` column addition migration
   - User runs `npm run db:fresh`

2. **Implement Server Layer**
   - Add types to `src/lib/types.ts`
   - Create server actions file
   - Create validation schemas

3. **Build UI Components**
   - Create 8 main module files
   - Create 2 new components (pickers/forms)
   - Integrate with existing patterns

4. **Add Content Builder**
   - Create group baptism content builder
   - Create templates (EN, ES)
   - Add print and export routes

5. **Write Tests**
   - Unit tests for server actions
   - E2E tests for workflows
   - Permission tests

6. **Document Everything**
   - Create comprehensive module docs
   - Create user documentation (EN, ES)
   - Update module registries

7. **Review and Deploy**
   - Code review
   - Test all workflows
   - Deploy to production

**Estimated Total Time:** 4-5 days including testing and documentation

---

**End of Requirements Document**

**Prepared by:** Requirements Analyst (AI Agent)
**Date:** 2025-11-30
**Status:** Ready for Implementation

---

## Changelog

**2025-11-30 - User Decisions Applied:**
- ✅ Module location confirmed: Standalone module in main sidebar
- ✅ Baptism mode: Both standalone and grouped baptisms supported
- ✅ Adding methods: Both picker (existing) and inline (new) supported
- ✅ Delete behavior: Changed from SET NULL to CASCADE DELETE
- ✅ Script format: Simple list format confirmed (all children together)
- ✅ Bidirectional navigation: Individual baptisms show link to parent group

**Key Changes from Initial Analysis:**
- Database schema updated: `ON DELETE SET NULL` → `ON DELETE CASCADE` for `group_baptism_id`
- User Story 7 renamed to "Navigate from Individual Baptism to Group Baptism"
- User Story 8 added: Delete Group Baptism (was previously User Story 7)
- Deletion workflows updated to reflect destructive nature
- All references to "unlinking on delete" removed in favor of cascade delete
- New section added: "Individual Baptism Module Modifications" with detailed UI specs
- Phase 8 added to implementation plan: Baptism module modifications for bidirectional navigation
- Modified files list updated to include baptism view/edit pages
