# Group Members Module

## Overview

The Group Members module provides a person-centric view for managing group memberships and roles within a parish. Unlike the mass-role-members (which focuses on liturgical scheduling), this module simply tracks which people belong to which groups and what roles they have within those groups.

**Key Characteristics:**
- Person-centric (not role-centric)
- Simple membership tracking (no preferences or scheduling)
- Role assignment within groups
- Active/inactive group filtering

## Module Structure

### Module Pattern (Not Standard 9-File Pattern)

This module follows a **person-centric pattern** similar to mass-role-members:

```
group-members/
├── page.tsx                                    # List (server)
├── group-members-list-client.tsx               # List UI (client)
├── [id]/
│   ├── page.tsx                                # Person view (server)
│   ├── group-members-view-client.tsx           # Person view UI (client)
│   └── memberships/
│       ├── page.tsx                            # Memberships management (server)
│       └── group-memberships-form.tsx          # Memberships form (client)
```

**Why This Pattern:**
- Focus is on viewing/managing people who serve in groups
- Not CRUD of group entities themselves (that's the groups module)
- Person-specific membership management
- Inline editing of roles and memberships

## Database Schema

### Tables Used

**1. `groups`** (from groups module)
```sql
id UUID PRIMARY KEY
parish_id UUID REFERENCES parishes(id)
name TEXT NOT NULL
description TEXT
is_active BOOLEAN NOT NULL DEFAULT true
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

**2. `group_members`**
```sql
id UUID PRIMARY KEY
group_id UUID REFERENCES groups(id) ON DELETE CASCADE
person_id UUID REFERENCES people(id) ON DELETE CASCADE
group_role_id UUID REFERENCES group_roles(id) ON DELETE SET NULL
joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
UNIQUE(group_id, person_id)
```

**3. `group_roles`**
```sql
id UUID PRIMARY KEY
parish_id UUID REFERENCES parishes(id)
name TEXT NOT NULL
description TEXT
note TEXT
is_active BOOLEAN NOT NULL DEFAULT true
display_order INTEGER
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
UNIQUE(parish_id, name)
```

**4. `people`** (from people module)
```sql
id UUID PRIMARY KEY
parish_id UUID REFERENCES parishes(id)
first_name TEXT NOT NULL
last_name TEXT NOT NULL
email TEXT
phone_number TEXT
street TEXT
city TEXT
state TEXT
zipcode TEXT
sex TEXT
note TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Relationships

```
people
  ├─ group_members (one-to-many)
  │   ├─ group (many-to-one)
  │   └─ group_role (many-to-one, nullable)
  │
groups
  ├─ group_members (one-to-many)

group_roles
  ├─ group_members (one-to-many)
```

## Server Actions

**Location:** `/src/lib/actions/groups.ts`

### Group Member Management

```typescript
// Add person to group with optional role
addGroupMember(groupId: string, personId: string, groupRoleId?: string): Promise<GroupMember>

// Remove person from group
removeGroupMember(groupId: string, personId: string): Promise<void>

// Update person's role within a group
updateGroupMemberRole(groupId: string, personId: string, groupRoleId?: string | null): Promise<GroupMember>
```

### Directory Functions

```typescript
// Get all people who are members of groups (grouped by person)
getPeopleWithGroupMemberships(): Promise<Array<{
  person: Person
  memberships: GroupMember[]
}>>

// Get all group memberships for a specific person
getPersonGroupMemberships(personId: string): Promise<PersonGroupMembership[]>
```

### Supporting Functions

```typescript
// From groups.ts
getGroups(): Promise<Group[]>
getGroup(id: string): Promise<GroupWithMembers | null>
getActiveGroups(): Promise<Group[]>

// From group-roles.ts
getGroupRoles(): Promise<GroupRole[]>
getGroupRole(id: string): Promise<GroupRole | null>

// From people.ts
getPeople(): Promise<Person[]>
getPerson(id: string): Promise<Person | null>
```

## Type Definitions

**Location:** `/src/lib/actions/groups.ts`

```typescript
// Group member with person and role details
interface GroupMemberWithDetails extends GroupMember {
  person: {
    id: string
    first_name: string
    last_name: string
    email?: string
    phone_number?: string
  }
  group_role: {
    id: string
    name: string
    description?: string
  } | null
}

// Person's membership with group and role details
interface PersonGroupMembership {
  id: string
  group_id: string
  person_id: string
  group_role_id?: string | null
  joined_at: string
  group: {
    id: string
    name: string
    description?: string
    is_active: boolean
  }
  group_role: {
    id: string
    name: string
    description?: string
  } | null
}

// Basic group member record
interface GroupMember {
  id: string
  group_id: string
  person_id: string
  group_role_id?: string | null
  joined_at: string
  person?: {
    id: string
    first_name: string
    last_name: string
    email?: string
  }
  group_role?: {
    id: string
    name: string
    description?: string
  } | null
}

// Group with all members
interface GroupWithMembers extends Group {
  members: GroupMember[]
}
```

## Component Structure

### 1. List Page (Server)

**File:** `page.tsx`

```typescript
export default async function GroupMembersPage() {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch data
  const peopleWithMemberships = await getPeopleWithGroupMemberships()
  const groups = await getGroups()
  const groupRoles = await getGroupRoles()
  const allPeople = await getPeople()

  // Pass to client
  return (
    <GroupMembersListClient
      peopleWithMemberships={peopleWithMemberships}
      groups={groups}
      groupRoles={groupRoles}
      allPeople={allPeople}
    />
  )
}
```

### 2. List Client

**File:** `group-members-list-client.tsx`

**Features:**
- Search people by name or email
- Card-based grid layout
- Add membership dialog (person + group + optional role)
- Display contact info and membership count
- Click card to view person's profile

**State Management:**
```typescript
const [search, setSearch] = useState('')
const [dialogOpen, setDialogOpen] = useState(false)
const [selectedPersonId, setSelectedPersonId] = useState<string>('')
const [selectedGroupId, setSelectedGroupId] = useState<string>('')
const [selectedRoleId, setSelectedRoleId] = useState<string>('')
const [isSubmitting, setIsSubmitting] = useState(false)
```

**Key Functions:**
- `handleAddMembership()` - Creates new group membership
- `filteredPeople` - Client-side search filtering

### 3. Person View Page (Server)

**File:** `[id]/page.tsx`

```typescript
export default async function GroupMembersPersonPage({ params }: PageProps) {
  // Auth check
  const { id } = await params

  // Fetch person and memberships
  const person = await getPerson(id)
  if (!person) notFound()

  const memberships = await getPersonGroupMemberships(id)

  // Pass to client
  return (
    <GroupMembersViewClient
      person={person}
      memberships={memberships}
    />
  )
}
```

### 4. Person View Client

**File:** `[id]/group-members-view-client.tsx`

**Features:**
- Contact information card
- Active group memberships list
- Inactive group memberships list (if any)
- Role badges for each membership
- Joined date display
- Quick actions (View Full Profile, Manage Memberships)

**Display Sections:**
1. **Contact Information** - Email, phone, address
2. **Active Memberships** - Clickable cards with group info and role
3. **Inactive Memberships** - Grayed out, past memberships
4. **Quick Actions** - Navigation buttons

### 5. Memberships Management Page (Server)

**File:** `[id]/memberships/page.tsx`

```typescript
export default async function GroupMembershipsPage({ params }: PageProps) {
  // Auth check
  const { id } = await params

  // Fetch all data needed
  const person = await getPerson(id)
  if (!person) notFound()

  const memberships = await getPersonGroupMemberships(id)
  const groups = await getGroups()
  const groupRoles = await getGroupRoles()

  // Pass to form
  return (
    <GroupMembershipsForm
      person={person}
      memberships={memberships}
      groups={groups}
      groupRoles={groupRoles}
    />
  )
}
```

### 6. Memberships Form (Client)

**File:** `[id]/memberships/group-memberships-form.tsx`

**Features:**
- View all current memberships
- Inline role editing (select dropdown + save/cancel)
- Add new membership (group + optional role)
- Remove membership with confirmation dialog
- Shows joined date for each membership
- Filters available groups (excludes already joined)

**State Management:**
```typescript
const [isAdding, setIsAdding] = useState(false)
const [selectedGroupId, setSelectedGroupId] = useState<string>('')
const [selectedRoleId, setSelectedRoleId] = useState<string>('')
const [editingMembership, setEditingMembership] = useState<string | null>(null)
const [editingRoleId, setEditingRoleId] = useState<string>('')
const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
const [isSubmitting, setIsSubmitting] = useState(false)
```

**CRUD Operations:**
- `handleAddMembership()` - Add person to new group
- `handleRemoveMembership(groupId)` - Remove from group
- `handleUpdateRole(groupId, newRoleId)` - Change role within group

## User Workflows

### Workflow 1: View People in Groups

1. Navigate to `/group-members`
2. See all people who are members of groups
3. Search by name or email
4. Click person card to view details

### Workflow 2: Add Person to Group

**From Directory List:**
1. Click "Add Membership" button
2. Select person from dropdown
3. Select group from dropdown
4. Optionally select role
5. Click "Add Membership"

**From Person's Profile:**
1. Navigate to person's profile (`/group-members/[id]`)
2. Click "Manage Memberships"
3. Click "Add to Group"
4. Select group and optional role
5. Click "Add Membership"

### Workflow 3: Manage Person's Memberships

1. Navigate to person's profile
2. Click "Manage Memberships"
3. View all current memberships
4. For each membership:
   - Click "Add Role" or "Change Role" to edit
   - Select new role from dropdown
   - Click "Save" to confirm
5. To remove membership:
   - Click X button
   - Confirm removal in dialog

### Workflow 4: View Person's Groups

1. Navigate to person's profile
2. See active memberships with:
   - Group name and description
   - Role badge (if assigned)
   - Joined date
3. See inactive memberships (past groups)
4. Click group card to navigate to group details

## Key Features

### ✅ Implemented

- **Person List** - All people who belong to groups
- **Search** - Filter by name or email
- **Add Memberships** - Assign people to groups with optional roles
- **Role Management** - Assign/change/remove roles within groups
- **Remove Memberships** - Remove people from groups with confirmation
- **Active/Inactive Groups** - Separate display of active and inactive memberships
- **Contact Display** - Email, phone, address on person profile
- **Joined Date Tracking** - When person joined each group
- **Quick Navigation** - Links to full person profile and group details

### ❌ Not Included (Unlike Mass-Role-Directory)

- **No Preferences** - No availability or scheduling preferences
- **No Blackout Dates** - No vacation/unavailability tracking
- **No Statistics** - No assignment counts or frequency tracking
- **No Scheduling** - Simple membership tracking only

## Permissions

**Module Access:**
- Uses `requireModuleAccess(userParish, 'groups')` for all mutations
- Read access via RLS policies scoped to parish

**RLS Policies:**
- `group_members` table has full CRUD policies for parish members
- Scoped by `group_id` → `groups.parish_id` → `parish_users`

## Navigation & Breadcrumbs

**List:**
```
Dashboard → Groups → Group Members
```

**Person View:**
```
Dashboard → Groups → Group Members → [Person Name]
```

**Manage Memberships:**
```
Dashboard → Groups → Group Members → [Person Name] → Manage Memberships
```

## Styling & UI Patterns

**Layout:**
- Uses `PageContainer` for consistent page structure
- Card-based design for person listings
- Inline editing for role updates
- Dialog for confirmations

**Components Used:**
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Button`, `Badge`, `Label`, `Input`
- `Dialog` for confirmations and adding memberships
- Lucide icons: `Users`, `Mail`, `Phone`, `MapPin`, `Calendar`, `User`, `Plus`, `X`, `Save`

**Color/Status Indicators:**
- Active groups: Normal display
- Inactive groups: Opacity reduced, outline badges
- Roles: Secondary badges

## Differences from Groups Module

**Groups Module** (`/groups`):
- CRUD of group entities
- Dialog-based forms
- View group with all members
- Focus on the group itself

**Group Members** (`/group-members`):
- Person-centric view
- Page-based forms
- View person with all groups
- Focus on the person's memberships

**They complement each other:**
- Use groups module to manage groups
- Use directory module to manage who belongs to groups

## Testing Considerations

When writing tests for this module:

1. **Setup**: Create test groups, group roles, and people
2. **Test Scenarios**:
   - View directory list
   - Search for people
   - Add membership via dialog
   - View person's profile
   - Navigate to membership management
   - Add person to additional group
   - Change role within group
   - Remove membership with confirmation
3. **Assertions**:
   - Verify memberships display correctly
   - Check role badges appear
   - Confirm active/inactive separation
   - Test navigation between views

## Related Documentation

- [MODULE_REGISTRY.md](./MODULE_REGISTRY.md) - All module definitions
- [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) - Reusable components
- [FORMATTERS.md](./FORMATTERS.md) - Person name and date formatters
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Data flow patterns
- Groups Module documentation (if exists)
- Mass Role Directory documentation (for comparison)

## Migration Files

**Required Migrations:**
1. `20251114000001_create_groups_table.sql` - Groups table
2. `20251110000002_create_group_roles_table.sql` - Group roles table
3. `20251114000002_create_group_members_table.sql` - Group members junction table

**Migration Order:** All three must exist for module to function.

## Future Enhancements

Potential additions (not currently implemented):

- **Bulk Operations** - Add multiple people to a group at once
- **Role History** - Track role changes over time
- **Membership Reports** - Export membership lists
- **Email Integration** - Email all members of a group
- **Attendance Tracking** - Track group meeting attendance
- **Permissions by Role** - Group-role-based access control
- **Group Messaging** - Communicate with group members
