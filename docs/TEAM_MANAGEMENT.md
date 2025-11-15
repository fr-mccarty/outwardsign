# TEAM_MANAGEMENT.md

> **Documentation for AI Agents:** This file contains comprehensive information about the team management system in Outward Sign. Use this as a reference when developing or maintaining features related to parish teams, user roles, permissions, invitations, and access control.

---

## Table of Contents

- [Overview](#overview)
- [Parish Roles](#parish-roles)
- [Permission Hierarchy](#permission-hierarchy)
- [Team Structure](#team-structure)
- [Invitation Workflow](#invitation-workflow)
- [Database Schema](#database-schema)
- [Server Actions](#server-actions)
- [Permission Functions](#permission-functions)
- [UI Components](#ui-components)
- [Security Considerations](#security-considerations)
- [Development Guidelines](#development-guidelines)

---

## Overview

The team management system in Outward Sign is built around **role-based access control (RBAC)** with a **parish-centric architecture**. Each user can belong to multiple parishes with different roles in each parish, and permissions are determined by the role assigned within that specific parish context.

**Key Concepts:**

- **Parish Users** - The `parish_users` table links users to parishes with specific roles and module access
- **Role-Based Permissions** - Four distinct roles with different access levels
- **Invitation System** - Secure token-based invitation workflow for adding team members
- **Module-Level Access** - Granular control for ministry-leaders to access specific modules
- **Immutable Roles** - Roles cannot be changed after invitation (must remove and re-invite)

---

## Parish Roles

**Location:** `src/lib/constants.ts:353`

```typescript
export const PARISH_ROLE_VALUES = ['admin', 'staff', 'ministry-leader', 'parishioner'] as const
export type ParishRole = typeof PARISH_ROLE_VALUES[number]
```

### Role Definitions

#### 1. **Admin**
**Full administrative control over the parish**

**Permissions:**
- ✅ Manage parish settings (name, contact info, configuration)
- ✅ Manage all parishioners (invite, remove, view all users)
- ✅ Manage templates (create, edit, delete custom templates)
- ✅ Full access to ALL modules (masses, weddings, funerals, baptisms, presentations, quinceañeras, groups, mass-intentions)
- ✅ Create, read, update, delete all records in all modules
- ✅ Invite team members with any role (admin, staff, ministry-leader, parishioner)

**Use Cases:**
- Parish priests
- Parish administrators
- IT coordinators

---

#### 2. **Staff**
**Full access to sacramental modules, limited administrative functions**

**Permissions:**
- ✅ Full access to ALL modules
- ✅ Create, read, update, delete all records in all modules
- ✅ Invite parishioners to parish (limited to parishioner role)
- ❌ Cannot manage parish settings
- ❌ Cannot manage templates
- ❌ Cannot invite admins, staff, or ministry-leaders

**Use Cases:**
- Parish secretaries
- Liturgical directors
- Deacons
- Pastoral associates

---

#### 3. **Ministry-Leader**
**Configurable module-level access for specific ministries**

**Permissions:**
- ✅ Access ONLY to enabled modules (configured at invitation time)
- ✅ Create, read, update, delete records in their enabled modules
- ❌ Cannot invite anyone to parish
- ❌ Cannot manage parish settings
- ❌ Cannot manage templates
- ❌ Cannot access modules not explicitly enabled for them

**Module Configuration:**
When inviting someone as a ministry-leader, the inviter selects which modules they can access from:
- `masses`
- `weddings`
- `funerals`
- `baptisms`
- `presentations`
- `quinceaneras`
- `groups`
- `mass-intentions`

**Use Cases:**
- Wedding coordinators (enabled: `weddings` only)
- Funeral ministry leaders (enabled: `funerals` only)
- Music ministers (enabled: `masses`, `groups`)
- Baptism preparation coordinators (enabled: `baptisms` only)

**Location:** `src/lib/auth/permissions.ts:10`

```typescript
export const AVAILABLE_MODULES = [
  'masses',
  'weddings',
  'funerals',
  'baptisms',
  'presentations',
  'quinceaneras',
  'groups',
  'mass-intentions',
] as const
```

---

#### 4. **Parishioner**
**Read-only access to content shared with them**

**Permissions:**
- ✅ View sacramental records shared with them (e.g., their own wedding, baptism)
- ✅ Share their records with family members
- ❌ No direct module access
- ❌ Cannot create, edit, or delete records
- ❌ Cannot invite anyone to parish
- ❌ Cannot access parish calendar or other modules

**Use Cases:**
- Families preparing for sacraments
- People viewing their own records

---

## Permission Hierarchy

**From highest to lowest access:**

```
admin
  ↓
staff
  ↓
ministry-leader (configurable module access)
  ↓
parishioner (read-only, shared content only)
```

### Permission Functions

**Location:** `src/lib/auth/permissions.ts`

**Key Functions:**

```typescript
// Check module access
canAccessModule(userParish: UserParishRole, moduleName: ModuleName): boolean

// Administrative permissions
canManageParishSettings(userParish: UserParishRole): boolean  // Admin only
canManageParishioners(userParish: UserParishRole): boolean    // Admin only
canManageTemplates(userParish: UserParishRole): boolean       // Admin only
canInviteParishioners(userParish: UserParishRole): boolean    // Admin + Staff

// Get user's parish role
getUserParishRole(userId: string, parishId: string): Promise<UserParishRole | null>

// Require module access (throws error if denied)
requireModuleAccess(userParish: UserParishRole, moduleName: ModuleName): void
```

**Permission Matrix:**

| Permission | Admin | Staff | Ministry-Leader | Parishioner |
|------------|-------|-------|-----------------|-------------|
| Manage parish settings | ✅ | ❌ | ❌ | ❌ |
| Manage parishioners | ✅ | ❌ | ❌ | ❌ |
| Manage templates | ✅ | ❌ | ❌ | ❌ |
| Invite team members | ✅ (all roles) | ✅ (parishioners only) | ❌ | ❌ |
| Access all modules | ✅ | ✅ | ❌ (configurable) | ❌ |
| Create/edit/delete records | ✅ | ✅ | ✅ (enabled modules only) | ❌ |
| View shared content | ✅ | ✅ | ✅ | ✅ |

---

## Team Structure

### Database Tables

#### 1. `parish_users`
**Links users to parishes with roles and module access**

**Key Columns:**
- `user_id` (uuid, FK to auth.users) - The user's ID
- `parish_id` (uuid, FK to parishes) - The parish they belong to
- `roles` (text[]) - Array of roles (usually contains one role)
- `enabled_modules` (text[]) - Array of enabled module names (for ministry-leaders only)
- `created_at` (timestamp) - When the user joined the parish

**Composite Primary Key:** `(user_id, parish_id)` - A user can only have one role per parish

**Example Records:**

```sql
-- Admin user
INSERT INTO parish_users (user_id, parish_id, roles, enabled_modules) VALUES
('user-abc-123', 'parish-xyz-456', ARRAY['admin'], ARRAY[]::text[]);

-- Staff user
INSERT INTO parish_users (user_id, parish_id, roles, enabled_modules) VALUES
('user-def-789', 'parish-xyz-456', ARRAY['staff'], ARRAY[]::text[]);

-- Ministry-leader with specific modules
INSERT INTO parish_users (user_id, parish_id, roles, enabled_modules) VALUES
('user-ghi-012', 'parish-xyz-456', ARRAY['ministry-leader'], ARRAY['weddings', 'masses']);

-- Parishioner
INSERT INTO parish_users (user_id, parish_id, roles, enabled_modules) VALUES
('user-jkl-345', 'parish-xyz-456', ARRAY['parishioner'], ARRAY[]::text[]);
```

---

#### 2. `parish_invitations`
**Manages pending invitations to join a parish**

**Key Columns:**
- `id` (uuid, PK) - Unique invitation ID
- `parish_id` (uuid, FK to parishes) - The parish they're invited to
- `email` (text) - Email address of invitee (lowercased)
- `token` (uuid) - Unique token for accepting invitation (used in URL)
- `roles` (text[]) - Array of roles to be assigned upon acceptance
- `enabled_modules` (text[]) - Array of modules (for ministry-leader role only)
- `expires_at` (timestamp) - When the invitation expires (default: 7 days)
- `accepted_at` (timestamp, nullable) - When invitation was accepted (NULL = pending)
- `invited_by_user_id` (uuid, FK to auth.users) - Who created the invitation
- `created_at` (timestamp) - When invitation was created

**Invitation Lifecycle:**

```
Created → Pending → Accepted/Expired/Revoked
  ↓         ↓            ↓
Email    7 days    parish_users record created
sent     expiry    + accepted_at timestamp set
```

**Example Record:**

```sql
INSERT INTO parish_invitations (
  parish_id,
  email,
  token,
  roles,
  enabled_modules,
  expires_at,
  invited_by_user_id
) VALUES (
  'parish-xyz-456',
  'wedding.coordinator@example.com',
  'inv-token-abc-123',
  ARRAY['ministry-leader'],
  ARRAY['weddings'],
  NOW() + INTERVAL '7 days',
  'admin-user-id-123'
);
```

---

## Invitation Workflow

### 1. Create Invitation

**Action:** `createParishInvitation(data: CreateParishInvitationData)`

**Location:** `src/lib/actions/invitations.ts:110`

**Process:**
1. Validate user has permission to invite (admin or staff)
2. Validate `enabled_modules` only provided for ministry-leader role
3. Generate unique token (UUID)
4. Set expiration (7 days from now)
5. Insert record into `parish_invitations` table
6. Send invitation email via AWS SES with invitation link
7. Revalidate cache

**Invitation Link Format:**
```
https://outwardsign.church/accept-invitation?token=inv-token-abc-123
```

**Email Content:**
- Parish name
- Inviter's name
- Role being offered
- Modules enabled (if ministry-leader)
- Expiration date
- "Accept Invitation" button with link

---

### 2. Accept Invitation

**Page:** `src/app/accept-invitation/page.tsx`

**Action:** `acceptParishInvitation(token: string, userId: string)`

**Location:** `src/lib/actions/invitations.ts:243`

**Process:**
1. User clicks invitation link and is directed to `/accept-invitation?token=...`
2. System validates token (exists, not expired, not already accepted)
3. If user not logged in, redirects to login/signup with token in URL
4. After authentication, creates `parish_users` record with invited roles
5. Marks invitation as accepted (`accepted_at = NOW()`)
6. Redirects user to parish selection or main app

**Validation Checks:**
- Token exists in database
- `accepted_at IS NULL` (not already accepted)
- `expires_at > NOW()` (not expired)
- User is authenticated

**Error Handling:**
- Invalid token → Show error message
- Expired invitation → Show "invitation expired" message
- Already accepted → Show "invitation already used" message

---

### 3. Resend Invitation

**Action:** `resendParishInvitation(invitationId: string)`

**Location:** `src/lib/actions/invitations.ts:186`

**Process:**
1. Generate new token (UUID)
2. Set new expiration (7 days from now)
3. Update existing invitation record
4. Send new invitation email
5. Old token becomes invalid

**Use Case:** When original invitation expires before acceptance

---

### 4. Revoke Invitation

**Action:** `revokeParishInvitation(invitationId: string)`

**Location:** `src/lib/actions/invitations.ts:220`

**Process:**
1. Delete invitation record from database
2. Token becomes invalid
3. Revalidate cache

**Use Case:** Invitation sent to wrong email, or person no longer needs access

---

## Server Actions

### Location: `src/lib/actions/invitations.ts`

**All Available Actions:**

```typescript
// Fetch invitations
getParishInvitations(): Promise<ParishInvitation[]>
getInvitationByToken(token: string): Promise<ParishInvitationWithDetails | null>

// Create invitation
createParishInvitation(data: CreateParishInvitationData): Promise<ParishInvitation>

// Manage invitations
resendParishInvitation(invitationId: string): Promise<ParishInvitation>
revokeParishInvitation(invitationId: string): Promise<void>

// Accept invitation
acceptParishInvitation(token: string, userId: string): Promise<void>
```

**Types:**

```typescript
export interface ParishInvitation {
  id: string
  parish_id: string
  email: string
  token: string
  roles: string[]
  enabled_modules: string[]
  expires_at: string
  accepted_at: string | null
  invited_by_user_id: string
  created_at: string
}

export interface CreateParishInvitationData {
  email: string
  roles: ParishRole[]
  enabled_modules?: string[] // Only used for ministry-leader role
}

export interface ParishInvitationWithDetails extends ParishInvitation {
  parish?: {
    id: string
    name: string
    city: string
    state: string
  } | null
  invited_by?: {
    id: string
    email: string | null
    full_name: string | null
  } | null
}
```

---

## Permission Functions

### Location: `src/lib/auth/permissions.ts`

**Core Permission Checks:**

```typescript
// Check if user can access a specific module
canAccessModule(userParish: UserParishRole, moduleName: ModuleName): boolean

// Administrative permissions
canManageParishSettings(userParish: UserParishRole): boolean   // Admin only
canManageParishioners(userParish: UserParishRole): boolean     // Admin only
canManageTemplates(userParish: UserParishRole): boolean        // Admin only
canInviteParishioners(userParish: UserParishRole): boolean     // Admin + Staff

// Helper to get user's parish role
getUserParishRole(userId: string, parishId: string): Promise<UserParishRole | null>

// Require permission (throws error if denied)
requireModuleAccess(userParish: UserParishRole, moduleName: ModuleName): void
```

**Usage Examples:**

```typescript
// In a server component or action
const user = await getUser()
const parishId = await requireSelectedParish()
const userParish = await getUserParishRole(user.id, parishId)

if (!userParish) {
  throw new Error('User not a member of this parish')
}

// Check module access
if (!canAccessModule(userParish, 'weddings')) {
  throw new Error('You do not have access to weddings')
}

// Check administrative permissions
if (!canManageParishSettings(userParish)) {
  throw new Error('Only admins can manage parish settings')
}

// Or use require function (throws automatically)
requireModuleAccess(userParish, 'funerals')
```

---

## UI Components

### Parish Settings Page

**Location:** `src/app/(main)/settings/parish/page.tsx`

**Features:**
- **Parish Information Section** - Edit parish name, address, contact info (admin only)
- **Team Management Section** - View all parish members, see roles and module access
- **Invite Team Members** - Form to invite new members with role selection
- **Pending Invitations** - List of pending invitations with resend/revoke actions
- **Module Selection** - Conditional UI that appears when ministry-leader role is selected

**Key UI Elements:**

```tsx
// Role selector
<Select value={inviteRole} onValueChange={(value) => setInviteRole(value as ParishRole)}>
  {PARISH_ROLE_VALUES.map((role) => (
    <SelectItem key={role} value={role}>
      {PARISH_ROLE_LABELS[role].en}
    </SelectItem>
  ))}
</Select>

// Conditional module selector (only for ministry-leader)
{inviteRole === 'ministry-leader' && (
  <ModuleSelector
    selectedModules={enabledModules}
    onModulesChange={setEnabledModules}
  />
)}

// Invitation actions
<Button onClick={() => resendInvitation(invitation.id)}>Resend</Button>
<Button onClick={() => revokeInvitation(invitation.id)}>Revoke</Button>
```

---

### Accept Invitation Page

**Location:** `src/app/accept-invitation/page.tsx`

**Flow:**
1. Validate token
2. Show parish and role information
3. If not authenticated → redirect to signup/login with token in URL
4. If authenticated → show "Accept Invitation" button
5. On accept → create parish_users record, redirect to app

**UI States:**
- Loading (validating token)
- Invalid token (error message)
- Expired invitation (error message with request new invitation option)
- Valid invitation (parish info + accept button)
- Accepting (loading state)
- Success (redirect to app)

---

## Security Considerations

### 1. Row Level Security (RLS)

**CRITICAL:** All team management queries must respect RLS policies on:
- `parish_users` - Users can only see members of their own parish
- `parish_invitations` - Only admins/staff can view invitations for their parish
- All module tables (weddings, funerals, etc.) - Scoped by parish_id

### 2. Permission Validation

**Always validate permissions on the server:**
- ✅ Use `requireSelectedParish()` to ensure user has a selected parish
- ✅ Use `ensureJWTClaims()` to ensure JWT has required claims
- ✅ Use permission functions (`canAccessModule`, `canManageParishSettings`, etc.)
- ❌ NEVER trust client-side permission checks alone

### 3. Invitation Security

**Token-based security:**
- Tokens are UUIDs (cryptographically random, unguessable)
- Tokens expire after 7 days
- Tokens can only be used once (accepted_at prevents reuse)
- Tokens are validated on every access attempt

**Email validation:**
- Email addresses are lowercased before storage
- Email sent to exact address provided (not modifiable by recipient)
- Invitation link includes token, not user email

### 4. Role Immutability

**CRITICAL RULE:** Roles cannot be changed after acceptance

**Why:**
- Prevents accidental privilege escalation
- Creates clear audit trail (who invited whom, when, with what role)
- Simplifies permission logic (no need to handle role transitions)

**To change someone's role:**
1. Remove them from parish (delete `parish_users` record)
2. Send new invitation with desired role

### 5. Authentication Flow

**All team management actions require authentication:**

```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  redirect('/login')
}
```

**For invitations:**
- Creating/resending/revoking invitations → requires admin or staff role
- Accepting invitations → requires valid authenticated user (any auth method)
- Viewing invitation details → public (but requires valid token)

---

## Development Guidelines

### When Creating New Features Involving Team Management

#### 1. **Always Check Permissions**

Before allowing access to any module or administrative function:

```typescript
const user = await getUser()
const parishId = await requireSelectedParish()
const userParish = await getUserParishRole(user.id, parishId)

if (!userParish) {
  return notFound()
}

// For module access
if (!canAccessModule(userParish, 'weddings')) {
  return notFound() // or redirect to unauthorized page
}

// For administrative functions
if (!canManageParishSettings(userParish)) {
  throw new Error('Unauthorized')
}
```

#### 2. **Respect Role Boundaries**

**DO:**
- Use existing permission functions from `src/lib/auth/permissions.ts`
- Check permissions on every server action and server component
- Return 404 or unauthorized error when permission denied
- Document new permissions in this file if adding new roles

**DON'T:**
- Hardcode role checks (e.g., `if (role === 'admin')`) - use permission functions
- Assume user has permission based on client-side state
- Allow role changes after invitation acceptance
- Grant permissions not documented in this file

#### 3. **Invitation Workflows**

**When creating features that involve invitations:**

- Always use `createParishInvitation()` server action (don't insert directly)
- Always send invitation email (handled automatically by server action)
- Always validate token before accepting (`getInvitationByToken()`)
- Always check expiration before accepting
- Always mark invitation as accepted after creating parish_users record

**DO NOT:**
- Create parish_users records directly without invitation flow
- Skip invitation validation
- Allow invitations without expiration
- Allow users to invite with roles higher than their own

#### 4. **Module Access for Ministry-Leaders**

**When implementing module access checks:**

```typescript
// CORRECT - Uses permission function
const userParish = await getUserParishRole(user.id, parishId)
if (!canAccessModule(userParish, 'weddings')) {
  throw new Error('Access denied')
}

// WRONG - Direct role check
if (userParish.roles.includes('ministry-leader') && !userParish.enabled_modules.includes('weddings')) {
  throw new Error('Access denied')
}
```

**Why:** Permission functions encapsulate the logic for admin/staff full access

#### 5. **Adding New Modules**

When creating a new module (e.g., `confirmations`):

1. Add to `AVAILABLE_MODULES` in `src/lib/auth/permissions.ts`
2. Update module selector UI in parish settings page
3. Update this documentation with new module
4. Ensure all server actions check `canAccessModule()` with new module name

#### 6. **Testing Team Management Features**

**Always test:**
- ✅ Admin can access everything
- ✅ Staff can access all modules but not parish settings
- ✅ Ministry-leader can only access enabled modules
- ✅ Parishioner cannot access any modules directly
- ✅ Invitations expire after 7 days
- ✅ Tokens cannot be reused after acceptance
- ✅ Permission checks work on both server and client

**Test cases:**
```typescript
// Test admin permissions
test('admin can manage parish settings', async () => {
  const adminParish = { roles: ['admin'], enabled_modules: [] }
  expect(canManageParishSettings(adminParish)).toBe(true)
  expect(canAccessModule(adminParish, 'weddings')).toBe(true)
})

// Test staff permissions
test('staff cannot manage parish settings', async () => {
  const staffParish = { roles: ['staff'], enabled_modules: [] }
  expect(canManageParishSettings(staffParish)).toBe(false)
  expect(canAccessModule(staffParish, 'weddings')).toBe(true)
})

// Test ministry-leader permissions
test('ministry-leader can only access enabled modules', async () => {
  const ministryLeaderParish = {
    roles: ['ministry-leader'],
    enabled_modules: ['weddings']
  }
  expect(canAccessModule(ministryLeaderParish, 'weddings')).toBe(true)
  expect(canAccessModule(ministryLeaderParish, 'funerals')).toBe(false)
})
```

---

## Common Patterns

### Pattern 1: Protecting a Server Component

```typescript
export default async function WeddingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parishId = await requireSelectedParish()
  const userParish = await getUserParishRole(user.id, parishId)

  if (!userParish || !canAccessModule(userParish, 'weddings')) {
    return notFound()
  }

  // Proceed with page rendering
}
```

### Pattern 2: Protecting a Server Action

```typescript
export async function createWedding(data: CreateWeddingData) {
  'use server'

  const parishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const userParish = await getUserParishRole(user.id, parishId)
  requireModuleAccess(userParish, 'weddings')

  // Proceed with creating wedding
}
```

### Pattern 3: Conditional UI Based on Permissions

```tsx
'use client'

export function ParishSettingsButton() {
  const [canManage, setCanManage] = useState(false)

  useEffect(() => {
    async function checkPermission() {
      const hasPermission = await checkCanManageParishSettings()
      setCanManage(hasPermission)
    }
    checkPermission()
  }, [])

  if (!canManage) return null

  return <Button>Parish Settings</Button>
}
```

---

## Future Enhancements

**Potential improvements to the team management system:**

1. **Role Change History** - Audit log of role changes and invitations
2. **Bulk Invitations** - Import CSV of emails to invite multiple people at once
3. **Custom Roles** - Allow parishes to define custom roles with specific permissions
4. **Temporary Access** - Time-limited access for specific events or seasons
5. **Multi-Role Support** - Allow users to have multiple roles simultaneously
6. **Delegation** - Allow staff to delegate specific tasks to ministry-leaders
7. **Activity Log** - Track user actions for compliance and debugging

---

## Quick Reference

### Files to Reference

- **Permission Functions:** `src/lib/auth/permissions.ts`
- **Invitation Actions:** `src/lib/actions/invitations.ts`
- **Role Constants:** `src/lib/constants.ts:353`
- **Parish Settings UI:** `src/app/(main)/settings/parish/page.tsx`
- **Accept Invitation Page:** `src/app/accept-invitation/page.tsx`

### Database Tables

- **`parish_users`** - User memberships with roles
- **`parish_invitations`** - Pending invitations

### Key Constants

```typescript
PARISH_ROLE_VALUES = ['admin', 'staff', 'ministry-leader', 'parishioner']
AVAILABLE_MODULES = ['masses', 'weddings', 'funerals', 'baptisms', 'presentations', 'quinceaneras', 'groups', 'mass-intentions']
```

---

**Last Updated:** 2025-11-15
**Maintained By:** Outward Sign Development Team
