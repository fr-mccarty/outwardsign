# User Permissions & Role-Based Access Control

This document defines the role-based permission system for users within the Outward Sign application. It explains what each role can do, how permissions are enforced, and how to implement permission checks in your code.

> **Note:** This document is about **application user permissions** (Admin, Staff, Ministry-Leader, Parishioner). For **Claude Code permissions** (what Claude can do autonomously), see [CLAUDE_CODE_SETTINGS.md](./CLAUDE_CODE_SETTINGS.md).

---

## Table of Contents

- [Role Definitions](#role-definitions)
- [Permission Matrix](#permission-matrix)
- [Module Access Control](#module-access-control)
- [Shared Resource Access](#shared-resource-access)
- [Permission Enforcement](#permission-enforcement)
- [Implementation Guide](#implementation-guide)
- [Testing Permissions](#testing-permissions)

---

## Role Definitions

### Admin
**Full control over the parish and all modules**

**Access:**
- All modules (weddings, funerals, baptisms, masses, presentations, quinceañeras, groups, mass-intentions)
- Parish settings and management
- Parishioner management (invite, remove, update roles)
- Template management

**Key Abilities:**
- Create, read, update, delete all records in all modules
- Manage parish settings
- Invite any role type (admin, staff, ministry-leader, parishioner)
- Exclusive access to Mass Intentions module
- Manage templates (petition templates, etc.)

**Restrictions:**
- None

---

### Staff
**Full operational access to sacrament/event modules, limited administrative access**

**Access:**
- All sacrament/event modules (weddings, funerals, baptisms, masses, presentations, quinceañeras, groups)
- **Cannot access Mass Intentions** (admin-only module)
- Can invite parishioners to parish

**Key Abilities:**
- Create, read, update, delete records in accessible modules
- Create and edit shared resources (people, locations, events, readings)
- Invite parishioners (but not staff, ministry-leaders, or admins)

**Restrictions:**
- Cannot manage parish settings
- Cannot access Mass Intentions module
- Cannot invite staff, ministry-leaders, or admins
- Cannot manage templates

---

### Ministry-Leader
**Configurable access to specific modules based on their ministry responsibilities**

**Access:**
- **Only enabled modules** (configured at invitation time)
- Example: A music director might have access only to Masses and Groups
- Each ministry-leader's access is individually configured

**Key Abilities:**
- Create, read, update, delete records in assigned modules only
- Create and edit shared resources (people, locations, events, readings) - needed for their work

**Restrictions:**
- Cannot access modules they're not assigned to
- Cannot manage parish settings
- Cannot invite users
- Cannot manage parishioners or templates
- Access cannot be changed after invitation (must be removed and re-invited to change modules)

**Configuration:**
When inviting a ministry-leader, admin/staff selects which modules they can access:
- Masses
- Weddings
- Funerals
- Baptisms
- Group Baptisms
- Presentations
- Quinceañeras
- Groups
- Mass Intentions (admin approval required)

---

### Parishioner
**Read-only access to content shared with them**

**Access:**
- Shared modules only (via magic links or family sharing)
- Read-only view of their own records (weddings, baptisms, etc.)

**Key Abilities:**
- View records shared with them
- Share modules with family members (view-only)

**Restrictions:**
- Cannot create new records
- Cannot edit any records
- Cannot delete any records
- Cannot access parish settings
- Cannot invite users
- No direct module access (must be shared individually)

---

## Permission Matrix

| Capability | Admin | Staff | Ministry-Leader | Parishioner |
|------------|-------|-------|-----------------|-------------|
| **Modules** |
| Access all modules | ✅ | ✅ (except Mass Intentions) | ❌ (only enabled modules) | ❌ |
| Access Mass Intentions | ✅ | ❌ | ❌ (unless specifically enabled) | ❌ |
| Create module records | ✅ | ✅ | ✅ (in enabled modules) | ❌ |
| Edit module records | ✅ | ✅ | ✅ (in enabled modules) | ❌ |
| Delete module records | ✅ | ✅ | ✅ (in enabled modules) | ❌ |
| **Shared Resources** |
| View people/locations/events/readings | ✅ | ✅ | ✅ | ✅ (shared only) |
| Create/edit people | ✅ | ✅ | ✅ | ❌ |
| Create/edit locations | ✅ | ✅ | ✅ | ❌ |
| Create/edit events | ✅ | ✅ | ✅ | ❌ |
| Create/edit readings | ✅ | ✅ | ✅ | ❌ |
| **Administrative** |
| Manage parish settings | ✅ | ❌ | ❌ | ❌ |
| Manage templates | ✅ | ❌ | ❌ | ❌ |
| Invite parishioners | ✅ | ✅ | ❌ | ❌ |
| Invite ministry-leaders | ✅ | ❌ | ❌ | ❌ |
| Invite staff | ✅ | ❌ | ❌ | ❌ |
| Invite admins | ✅ | ❌ | ❌ | ❌ |
| Manage parishioners | ✅ | ❌ | ❌ | ❌ |

---

## Module Access Control

### How Module Access Works

**Module-specific resources** (weddings, funerals, baptisms, masses, presentations, quinceañeras, groups, mass-intentions) use module-level access control:

1. **Admin & Staff**: Full access to all modules (except staff cannot access Mass Intentions)
2. **Ministry-Leader**: Access only to enabled modules (checked against `parish_users.enabled_modules`)
3. **Parishioner**: No direct module access

**Available Modules:**
```typescript
const AVAILABLE_MODULES = [
  'masses',
  'weddings',
  'funerals',
  'baptisms',
  'group-baptisms',
  'presentations',
  'quinceaneras',
  'groups',
  'mass-intentions',
]
```

### Ministry-Leader Module Configuration

When inviting a ministry-leader, the inviter (admin or staff) selects which modules they can access. This creates an array in the database:

```typescript
// Example: Music director
{
  roles: ['ministry-leader'],
  enabled_modules: ['masses', 'groups']
}

// Example: Wedding coordinator
{
  roles: ['ministry-leader'],
  enabled_modules: ['weddings']
}
```

**Important:** Module access cannot be changed after invitation. To change a ministry-leader's modules, they must be removed and re-invited.

---

## Shared Resource Access

### How Shared Resource Access Works

**Shared resources** (people, locations, events, readings) are used across multiple modules and have different permission rules:

1. **Admin, Staff, Ministry-Leader**: Can create, update, delete (they need these resources for their work)
2. **Parishioner**: Read-only access (can view shared resources but cannot edit)

**Why ministry-leaders can edit shared resources:**
Ministry-leaders need to manage people, locations, events, and readings for the modules they're responsible for. For example:
- A music director needs to add musicians (people) to the Masses module
- A wedding coordinator needs to add ceremony locations
- A funeral coordinator needs to manage readings

---

## Permission Enforcement

### Defense in Depth

Permissions are enforced at **two levels** to ensure security:

1. **Server-side enforcement** (REQUIRED) - All server actions check permissions
2. **UI enforcement** (UX improvement) - Hide/disable UI elements based on permissions

**Why both?**
- **Server-side**: Security boundary - prevents API abuse, required for all operations
- **UI-side**: User experience - prevents confusion, shows only relevant actions

### Server-Side Enforcement (Security)

All server actions include permission checks **before** performing any database operations.

**Pattern for Module-Specific Resources:**
```typescript
export async function createWedding(data: CreateWeddingData): Promise<Wedding> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'weddings')

  // ... rest of function
}
```

**Pattern for Shared Resources:**
```typescript
export async function createPerson(data: CreatePersonData): Promise<Person> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // ... rest of function
}
```

### UI Enforcement (User Experience)

Client components should hide or disable UI elements based on user permissions to provide a better user experience.

**Implementation Pattern:**
```typescript
import { canEditModule, canManageParishSettings } from '@/lib/auth/permissions-client'

// In component (after getting userParish from server)
{canEditModule(userParish, 'weddings') && (
  <Button>Create Wedding</Button>
)}

{canManageParishSettings(userParish) && (
  <Link href="/settings/parish">Parish Settings</Link>
)}
```

**Files that need UI enforcement:**
- Form action components (`[entity]-form-actions.tsx`) - Hide Edit/Delete buttons for parishioners
- List pages - Hide "Create New" buttons based on module access
- Settings pages - Hide navigation/pages for non-admins
- Module pages - Hide create buttons based on module access for ministry-leaders

### RLS Policies

Row-Level Security (RLS) policies in the database automatically enforce permissions at the database level:

- **All tables have `parish_id`** - Users can only access data from their parish
- **RLS policies check role** - Policies respect admin, staff, ministry-leader, and parishioner roles
- **Automatic enforcement** - No need to manually check permissions in every query

**Why RLS?**
- Defense in depth - Even if application code has bugs, database enforces permissions
- Performance - Database-level filtering is faster than application-level filtering
- Simplicity - Once configured, works automatically for all queries

---

## Implementation Guide

### The `requireSelectedParish()` Pattern

**🔴 CRITICAL: This pattern is frequently misused. Follow these rules exactly.**

The `requireSelectedParish()` function serves two purposes:
1. **Validates** that the user has a parish selected (throws error if not)
2. **Returns** the selected parish ID for use in queries

**Use the correct pattern based on whether you need the parish ID:**

**Pattern 1: When you NEED the parish ID** (for queries or permission checks):
```typescript
export async function createWedding(data: CreateWeddingData): Promise<Wedding> {
  const selectedParishId = await requireSelectedParish()  // ✅ Capture the return value
  await ensureJWTClaims()
  const supabase = await createClient()

  // Using selectedParishId in query
  const { data: wedding } = await supabase
    .from('weddings')
    .insert({ ...data, parish_id: selectedParishId })  // ✅ Used here
    .select()
    .single()

  // Or using selectedParishId in permission check
  const userParish = await getUserParishRole(user.id, selectedParishId)  // ✅ Used here
  // ...
}
```

**Pattern 2: When you DON'T need the parish ID** (just validating parish selection):
```typescript
export async function getScripts(eventTypeId: string): Promise<Script[]> {
  await requireSelectedParish()  // ✅ Just call it, don't capture
  await ensureJWTClaims()
  const supabase = await createClient()

  // Query doesn't use parish_id because scripts are filtered by event_type_id
  const { data } = await supabase
    .from('scripts')
    .select('*')
    .eq('event_type_id', eventTypeId)  // Filtering by event_type_id, not parish_id
    // ...
}
```

**🚫 WRONG - Causes ESLint "unused variable" error:**
```typescript
export async function getScripts(eventTypeId: string): Promise<Script[]> {
  const selectedParishId = await requireSelectedParish()  // ❌ BAD: assigned but never used
  // ... selectedParishId is never used in this function
}
```

**When to use each pattern:**

| Scenario | Pattern |
|----------|---------|
| Query filters by `parish_id` | Capture: `const selectedParishId = await requireSelectedParish()` |
| Insert includes `parish_id` | Capture: `const selectedParishId = await requireSelectedParish()` |
| Permission check needs parish ID | Capture: `const selectedParishId = await requireSelectedParish()` |
| Query filters by other ID (event_type_id, script_id, etc.) | Just call: `await requireSelectedParish()` |
| Only need to validate user has parish selected | Just call: `await requireSelectedParish()` |

---

### Permission Helper Functions

**Server-side functions** (`src/lib/auth/permissions.ts`):

```typescript
// Get user's role and enabled modules
getUserParishRole(userId: string, parishId: string): Promise<UserParishRole | null>

// Check module access (throws error if unauthorized)
requireModuleAccess(userParish: UserParishRole | null, moduleName: ModuleName): void

// Combined auth + parish + module check (redirects if unauthorized)
checkModuleAccess(moduleName: ModuleName): Promise<UserParishRole>

// Check shared resource edit permission (throws error if unauthorized)
requireEditSharedResources(userId: string, parishId: string): Promise<void>
```

**Client-side functions** (`src/lib/auth/permissions-client.ts`):

```typescript
// Check if user can access a module
canAccessModule(userParish: UserParishRole, moduleName: ModuleName): boolean

// Check if user can edit/delete module records
canEditModule(userParish: UserParishRole, moduleName: ModuleName): boolean

// Check if user can manage parish settings
canManageParishSettings(userParish: UserParishRole): boolean

// Check if user can manage parishioners
canManageParishioners(userParish: UserParishRole): boolean

// Check if user can invite parishioners
canInviteParishioners(userParish: UserParishRole): boolean

// Check if user can manage templates
canManageTemplates(userParish: UserParishRole): boolean
```

### When to Use Which Function

**In Server Components/Pages:**
Use `checkModuleAccess()` at the top of every module page:
```typescript
export default async function WeddingsPage() {
  const userParish = await checkModuleAccess('weddings')
  // ... rest of page
}
```

**In Server Actions:**
Use `requireModuleAccess()` for module operations:
```typescript
const userParish = await getUserParishRole(user.id, selectedParishId)
requireModuleAccess(userParish, 'weddings')
```

Use `requireEditSharedResources()` for shared resource operations:
```typescript
await requireEditSharedResources(user.id, selectedParishId)
```

**In Client Components:**
Use `canEditModule()`, `canManageParishSettings()`, etc. for conditional rendering:
```typescript
{canEditModule(userParish, 'weddings') && <EditButton />}
```

### Adding Permission Checks to New Code

**When creating a new module:**
1. Add module name to `AVAILABLE_MODULES` in `permissions-client.ts`
2. Add `checkModuleAccess('new-module')` to module pages
3. Add `requireModuleAccess(userParish, 'new-module')` to server actions
4. Add UI enforcement in client components

**When creating a new server action:**
1. Determine if it's module-specific or shared resource
2. Add appropriate permission check (see patterns above)
3. Always check permissions BEFORE database operations

**When creating a new UI component:**
1. Get `userParish` from server component
2. Pass to client component via props
3. Use permission helper functions for conditional rendering

---

## Testing Permissions

### Test Scenarios

**Admin:**
- ✅ Can access all modules
- ✅ Can create/edit/delete all records
- ✅ Can manage parish settings
- ✅ Can manage parishioners and templates
- ✅ Can access Mass Intentions

**Staff:**
- ✅ Can access all modules except Mass Intentions
- ✅ Can create/edit/delete records in accessible modules
- ✅ Can invite parishioners
- ❌ Cannot manage parish settings
- ❌ Cannot access Mass Intentions
- ❌ Cannot invite staff, ministry-leaders, or admins

**Ministry-Leader:**
- ✅ Can access only enabled modules
- ✅ Can create/edit/delete in enabled modules
- ✅ Can create/edit shared resources
- ❌ Cannot access disabled modules
- ❌ Cannot manage settings, parishioners, or templates

**Parishioner:**
- ✅ Can view shared content
- ❌ Cannot create/edit/delete any records
- ❌ Cannot access module pages directly
- ❌ Cannot access settings

### Test Files to Create

```
tests/permissions-admin.spec.ts       # Admin permission tests
tests/permissions-staff.spec.ts       # Staff permission tests
tests/permissions-ministry-leader.spec.ts  # Ministry-leader tests
tests/permissions-parishioner.spec.ts # Parishioner tests
```

---

## Important Notes

### Role Assignment

- **Roles are assigned at invitation time** - When inviting someone to the parish, the inviter selects their role
- **Ministry-leader modules are configured at invitation** - Cannot be changed later
- **Roles cannot be changed after invitation** - To change a role, the user must be removed and re-invited

### Security Best Practices

1. **Always check permissions server-side** - Never trust client-side checks alone
2. **Use helper functions** - Don't write custom permission logic
3. **Test with different roles** - Ensure each role sees only what they should
4. **Follow the patterns** - Consistency prevents security bugs

### Common Mistakes to Avoid

❌ **Don't skip server-side permission checks**
```typescript
// BAD - no permission check
export async function createWedding(data: CreateWeddingData) {
  const supabase = await createClient()
  // ... directly create without checking permissions
}
```

✅ **Always check permissions first**
```typescript
// GOOD - permission check before operation
export async function createWedding(data: CreateWeddingData) {
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'weddings')
  // ... now safe to create
}
```

❌ **Don't rely only on UI enforcement**
```typescript
// BAD - hiding button doesn't prevent API calls
{isAdmin && <DeleteButton />}  // User can still call API directly
```

✅ **Enforce on both UI and server**
```typescript
// GOOD - UI hides button AND server checks permission
{canEditModule(userParish, 'weddings') && <DeleteButton />}
// ... and in server action:
requireModuleAccess(userParish, 'weddings')
```

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Data architecture and authentication patterns
- [PERMISSION_ENFORCEMENT_SUMMARY.md](./PERMISSION_ENFORCEMENT_SUMMARY.md) - Implementation status and technical details
- [CLAUDE_CODE_SETTINGS.md](./CLAUDE_CODE_SETTINGS.md) - Claude Code automation permissions (different from user permissions)

---

**Last Updated:** 2025-12-02
