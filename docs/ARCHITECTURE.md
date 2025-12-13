# Architecture

This document provides comprehensive architectural patterns and guidelines for Outward Sign. It covers data architecture, data flow patterns, authentication, component communication, and performance optimization.

> **Architecture Note:** Outward Sign uses a **unified Event Types system**. Sacraments and parish events (Weddings, Funerals, Baptisms, etc.) are all configured as **Event Types** through the Settings UI - they are NOT separate code modules. Some code examples in this document may reference the older pattern for illustration purposes, but the patterns themselves remain valid.

---

## Table of Contents

- [Data Architecture](#data-architecture)
- [Role Permissions](#role-permissions)
- [Data Flow Pattern](#data-flow-pattern)
  - [Server Actions](#server-actions)
  - [Authentication Pattern](#authentication-pattern)
  - [Error Handling](#error-handling)
  - [Component Communication](#component-communication)
  - [Picker Modal Behavior](#picker-modal-behavior)
  - [Performance Patterns](#performance-patterns)
  - [Loading and Error States](#loading-and-error-states)
- [Breadcrumbs](#breadcrumbs)

---

## Data Architecture

### Parish Structure

**Multi-tenancy at the parish level:**
- Each main record everywhere (excluding pivot tables) should have a `parish_id`
- Data is scoped to parishes
- Shared access within team boundaries
- Users can only access data for parishes they belong to

### Naming Conventions

**Database tables:** plural form
```
events, masses, people, locations, groups
```

**Database columns:** singular form
```
note (not notes)
status (not statuses)
```

**TypeScript interfaces:** singular form
```typescript
interface Event { }
interface Mass { }
interface Person { }
```

**React state variables:** Match database column names (singular form)
```typescript
// ✅ CORRECT
const [note, setNote] = useState('')  // for a 'note' column

// ❌ WRONG
const [notes, setNotes] = useState('')  // for a 'note' column
```

**Special Case:** For simplification, "Quinceañeras" is spelled without the ñ in all programming contexts (file names, variables, types, routes, etc.). Use "Quinceanera" in code, "Quinceañera" in user-facing text only.

---

## Role Permissions

**Roles are assigned at invitation time** - when inviting someone to the parish, the inviter selects their role and (for ministry-leaders) which modules they can access.

### Role Definitions

**Admin:**
- Parish settings and parish management
- Manage parishioners and templates
- Full access to all modules
- Exclusive access to Mass Intentions module
- Can invite all role types

**Staff:**
- Can create, read, update, and delete all event modules (Events, Masses, Groups, etc.)
- **Cannot access Mass Intentions** (admin-only)
- Can invite parishioners to parish
- Cannot manage parish settings

**Ministry-Leader:**
- Configurable per-user module access
- When inviting someone as a ministry-leader, admin/staff selects which specific modules they can access
- Limited to assigned modules only

**Parishioner:**
- Read-only access to modules shared with them
- Can share modules with family members
- Cannot create or edit records

### Important Notes

- **Roles cannot be changed after invitation** - if someone needs a different role, they must be removed and re-invited
- **Ministry-leader access is module-specific** - configured at invitation time, not after
- **RLS policies enforce permissions** - all database access respects role-based permissions automatically

---

## Data Flow Pattern

### Overview

**Server → Client:** Pass serializable data as props
- **List pages:** `initialData={entities}`
- **Forms:** `entity={entity}` (edit mode) or no prop (create mode)
- **Action components:** `entity={entity}`

**Client → Server:** Server Actions via 'use server'

### Server Actions

**Location:** `lib/actions/[entity].ts`

#### Required Exports

Every module should export these functions:

```typescript
// Fetch list with optional server-side filtering
export async function get[Entities](filters?: FilterParams): Promise<Entity[]>

// Fetch single entity (basic)
export async function get[Entity](id: string): Promise<Entity | null>

// Fetch entity with all related data (for view/edit pages)
export async function get[Entity]WithRelations(id: string): Promise<[Entity]WithRelations | null>

// Create new entity
export async function create[Entity](data: Create[Entity]Data): Promise<Entity>

// Update existing entity
export async function update[Entity](id: string, data: Update[Entity]Data): Promise<Entity>

// Delete entity
export async function delete[Entity](id: string): Promise<void>

// Types
export interface [Entity] { }
export interface [Entity]WithRelations extends [Entity] { }
export interface Create[Entity]Data { }
export interface Update[Entity]Data { }
```

#### WithRelations Interface Pattern

All modules should define a `[Entity]WithRelations` interface that extends the base entity type and includes related data:

```typescript
// In lib/actions/[entity].ts
export interface WeddingWithRelations extends Wedding {
  bride?: Person | null
  groom?: Person | null
  wedding_event?: Event | null
  // ... all related foreign keys expanded to full objects
}

export async function get[Entity]WithRelations(id: string): Promise<[Entity]WithRelations | null> {
  // 1. Fetch base entity
  const entity = await getEntity(id)
  if (!entity) return null

  // 2. Use Promise.all() to fetch all related data in parallel
  const [bride, groom, event] = await Promise.all([
    entity.bride_id ? getPerson(entity.bride_id) : null,
    entity.groom_id ? getPerson(entity.groom_id) : null,
    entity.event_id ? getEvent(entity.event_id) : null,
  ])

  // 3. Return merged object
  return {
    ...entity,
    bride,
    groom,
    wedding_event: event,
  }
}
```

**Why:**
- Forms need related data for display (not just IDs)
- Type-safe access to nested properties
- Eliminates unsafe `as any` type casts
- View pages need full entity details for rendering

#### Simplified Update Pattern

Use `Object.fromEntries` to filter undefined values instead of 30+ if statements:

```typescript
export async function update[Entity](id: string, data: Update[Entity]Data): Promise<[Entity]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Build update object from only defined values (filters out undefined)
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: entity, error } = await supabase
    .from('[entities]')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating [entity]:', error)
    throw new Error('Failed to update [entity]')
  }

  revalidatePath('/[entities]')
  revalidatePath(`/[entities]/${id}`)
  revalidatePath(`/[entities]/${id}/edit`)
  return entity
}
```

#### Cache Revalidation

After mutations (create/update/delete), use `revalidatePath()` to invalidate Next.js cache for affected routes:

```typescript
// Always revalidate both list pages and detail pages
revalidatePath('/weddings')              // List page
revalidatePath(`/weddings/${id}`)        // View page
revalidatePath(`/weddings/${id}/edit`)   // Edit page
```

---

### Authentication Pattern

Every server page starts with authentication check:

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Continue with page logic...
}
```

**Why:**
- Ensures only authenticated users can access protected pages
- Server-side authentication is more secure than client-side
- Automatic redirect to login if not authenticated

---

### Parishioner Authentication Pattern

**The Parishioner Portal uses a separate authentication system from the main staff application.**

**Staff Auth (Supabase Auth):**
- Email/password login
- JWT-based authentication
- Session stored in Supabase Auth
- Used for: `/dashboard`, `/weddings`, `/masses`, etc.

**Parishioner Auth (Custom Magic Link):**
- Email-only magic link
- HTTP-only cookie session
- Custom session table (`parishioner_auth_sessions`)
- Used for: `/parishioner/*` routes

**Why Separate Systems?**
1. **Different security requirements** - Parishioners need simpler access without passwords
2. **Different permission models** - Parish staff have role-based access (admin/staff/ministry-leader), parishioners have person-scoped access
3. **Simplified UX** - No password management for parishioners
4. **Easier family sharing** - One magic link can authenticate to view family schedule

**Parishioner Authentication Flow:**

```typescript
// 1. Generate magic link (server action)
const token = generateRandomToken()  // 32-character random token
const hashedToken = await bcrypt.hash(token, 10)  // bcrypt hash

await supabase.from('parishioner_auth_sessions').insert({
  person_id: personId,
  parish_id: parishId,
  token: hashedToken,  // Only hashed token stored
  expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000)  // 48-hour expiry
})

const magicLinkUrl = `${appUrl}/parishioner/login/verify?token=${token}&person=${personId}`
// Send via email (AWS SES)

// 2. Verify magic link and create session
const session = await verifyMagicLink(token, personId)
// Sets HTTP-only cookie: parishioner_session_id

// 3. Access protected routes
const session = await getParishionerSession()
if (!session || session.personId !== requiredPersonId) {
  redirect('/parishioner/login')
}
```

**Session Management:**
- Session cookie: `parishioner_session_id` (HTTP-only, secure, SameSite=Lax)
- Session duration: 30 days (can be extended)
- Magic link expiry: 48 hours (one-time use)
- Automatic cleanup: Daily cron job removes expired sessions

**Security Features:**
- Bcrypt token hashing (10 rounds) prevents brute force if database compromised
- HTTP-only cookies prevent XSS attacks
- Timing-safe token comparison prevents timing attacks
- CSRF protection on all server actions
- Rate limiting on magic link generation (5 requests per 15 minutes per email)

**Server Actions Require Session Verification:**
```typescript
// All parishioner server actions check session
const session = await getParishionerSession()
if (!session || session.personId !== personId) {
  console.error('Unauthorized access attempt')
  return []
}

// Use service_role client with explicit person_id filtering
const supabase = createServiceRoleClient()
const { data } = await supabase
  .from('calendar_events')
  .select('*')
  .eq('person_id', session.personId)  // Explicit filtering
```

**Why Service Role Instead of RLS?**
- RLS policies assume JWT claims from Supabase Auth
- Parishioner sessions use cookies, not JWTs
- Service role allows bypassing RLS with explicit permission checks in code
- More flexible for custom authentication system

**For complete parishioner portal documentation, see [PARISHIONER_PORTAL.md](./PARISHIONER_PORTAL.md)**

---

### Error Handling

**Not Found:**
```typescript
import { notFound } from 'next/navigation'

const wedding = await getWedding(id)
if (!wedding) {
  notFound()  // Shows 404 page
}
```

**Client Errors:**
```typescript
import { toast } from 'sonner'

try {
  await createWedding(data)
  toast.success('Wedding created successfully')
  router.push(`/weddings/${id}`)
} catch (error) {
  console.error('Error creating wedding:', error)
  toast.error('Failed to create wedding')
}
```

**Server Redirects:**
```typescript
import { redirect } from 'next/navigation'

// After successful creation
redirect(`/weddings/${newWedding.id}`)
```

---

### Component Communication

**Server to Client:** Props only (serializable data)
```typescript
// Server component
export default async function Page() {
  const weddings = await getWeddings()
  return <WeddingsListClient initialData={weddings} />
}

// Client component
'use client'
export function WeddingsListClient({ initialData }: { initialData: Wedding[] }) {
  // Use initialData...
}
```

**Client to Server:** Server Actions via 'use server'
```typescript
// Server action
'use server'
export async function createWedding(data: CreateWeddingData) {
  // Database operations...
}

// Client component
'use client'
import { createWedding } from '@/lib/actions/weddings'

export function WeddingForm() {
  const handleSubmit = async (data: CreateWeddingData) => {
    await createWedding(data)
  }
  // ...
}
```

**Client State:** useState for form fields, temporary UI state
```typescript
const [name, setName] = useState('')
const [isOpen, setIsOpen] = useState(false)
```

**URL Search Params:** Filters, pagination, search (shareable state)
```typescript
// Client component updates URL
router.push(`/weddings?search=${searchTerm}&status=ACTIVE`)

// Server component reads from URL
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const weddings = await getWeddings({
    search: params.search,
    status: params.status
  })
}
```

**Context:** UI state only (theme, breadcrumbs, modals) - NEVER for data fetching
```typescript
// ✅ GOOD - UI state
const { theme, setTheme } = useTheme()
const { setBreadcrumbs } = useBreadcrumbs()

// ❌ BAD - data fetching
const { weddings, loadWeddings } = useWeddings()  // Don't do this!
```

**No Prop Drilling:** Use Server Actions for data operations
```typescript
// ✅ GOOD - Server Action called directly from any component
import { createWedding } from '@/lib/actions/weddings'

// ❌ BAD - passing callbacks through multiple components
<Parent onSave={handleSave}>
  <Child onSave={handleSave}>
    <GrandChild onSave={handleSave} />
  </Child>
</Parent>
```

**For form event handling (nested forms, e.stopPropagation), see [FORMS.md](./FORMS.md).**

---

### Picker Modal Behavior

**For detailed picker behavior patterns, see [PICKER_PATTERNS.md](./PICKER_PATTERNS.md).**

**CRITICAL RULE:** When creating entities from picker modals (PeoplePicker, EventPicker), follow this pattern:

1. **Save immediately to database** - Don't just store in local state
2. **Auto-select newly created entity** - Update parent form's state
3. **Close modal** - Return to parent form
4. **NO REDIRECT** - Stay on parent form (user is in the middle of creating/editing)

**Example:**
```typescript
// In PeoplePicker create handler
const handleCreatePerson = async (data: CreatePersonData) => {
  const newPerson = await createPerson(data)  // 1. Save to database
  onSelect(newPerson.id)                      // 2. Auto-select
  setIsOpen(false)                            // 3. Close modal
  // NO router.push() or redirect!            // 4. Stay on parent form
}
```

See PICKER_PATTERNS.md for implementation details, verification checklist, and common mistakes to avoid.

---

### Performance Patterns

#### Server-Side Filtering

List pages accept searchParams prop. Pass these to `get[Entities]()` functions to filter on the server, not the client:

```typescript
// Server page
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams

  // Filter on server, not client
  const weddings = await getWeddings({
    search: params.search,
    status: params.status
  })

  return <WeddingsListClient initialData={weddings} />
}
```

**Why:**
- Reduces data transfer
- Faster initial page load
- Better performance with large datasets
- Supports server-side pagination

#### Parallel Data Fetching

Use `Promise.all()` when fetching multiple independent data sources in server components:

```typescript
// ✅ GOOD - parallel fetching
const [wedding, locations, people] = await Promise.all([
  getWeddingWithRelations(id),
  getLocations(),
  getPeople()
])

// ❌ BAD - sequential fetching
const wedding = await getWeddingWithRelations(id)
const locations = await getLocations()  // Waits for wedding
const people = await getPeople()        // Waits for locations
```

#### URL State Management

Client components should update URL search params via `router.push()` instead of maintaining local filter state:

```typescript
// ✅ GOOD - URL state (shareable, linkable)
const handleSearch = (searchTerm: string) => {
  router.push(`/weddings?search=${searchTerm}`)
}

// ❌ BAD - local state (lost on refresh)
const [searchTerm, setSearchTerm] = useState('')
```

**Benefits:**
- State is shareable (users can copy URL)
- State persists on refresh
- Back/forward navigation works correctly
- Server can read state for SSR

---

### Loading and Error States

**Pattern:** Create reusable skeleton and error components in `components/` directory. Route-level `loading.tsx` and `error.tsx` files import and render these reusable components.

**Example:**

```typescript
// components/skeletons/wedding-skeleton.tsx
export function WeddingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

// app/(main)/weddings/loading.tsx
import { WeddingSkeleton } from '@/components/skeletons/wedding-skeleton'

export default function Loading() {
  return <WeddingSkeleton />
}

// components/errors/wedding-error.tsx
export function WeddingError({ reset }: { reset: () => void }) {
  return (
    <div className="text-center">
      <p>Something went wrong loading the wedding.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}

// app/(main)/weddings/error.tsx
'use client'
import { WeddingError } from '@/components/errors/wedding-error'

export default function Error({ reset }: { reset: () => void }) {
  return <WeddingError reset={reset} />
}
```

**Why:**
- Consistent UX across modules
- DRY principle (Don't Repeat Yourself)
- Easy to update loading/error states globally
- Testable in isolation

**For form validation patterns with Zod, see [FORMS.md](./FORMS.md).**

---

## Breadcrumbs

### Implementation Pattern

Breadcrumbs are managed via React Context and set by client components.

**BreadcrumbSetter Component:**
```typescript
'use client'
import { useBreadcrumbs } from '@/contexts/breadcrumb-context'
import { useEffect } from 'react'

interface BreadcrumbSetterProps {
  breadcrumbs: Array<{ label: string; href?: string }>
}

export function BreadcrumbSetter({ breadcrumbs }: BreadcrumbSetterProps) {
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs(breadcrumbs)
    return () => setBreadcrumbs([])
  }, [breadcrumbs, setBreadcrumbs])

  return null  // Invisible component
}
```

**Usage in Pages:**
```typescript
// Server page
export default async function WeddingPage({ params }: PageProps) {
  const wedding = await getWeddingWithRelations(params.id)

  return (
    <>
      <BreadcrumbSetter
        breadcrumbs={[
          { label: 'Weddings', href: '/weddings' },
          { label: getWeddingPageTitle(wedding) }
        ]}
      />
      <WeddingViewClient wedding={wedding} />
    </>
  )
}
```

**Key Points:**
- BreadcrumbSetter is a client component (uses hooks)
- Returns null (invisible component)
- Sets breadcrumbs in context via `useBreadcrumbs()` hook
- Cleans up breadcrumbs on unmount
- Server components can use BreadcrumbSetter without 'use client'

---

## Summary

This architecture ensures:
- **Consistent data flow** - Server → Client via props, Client → Server via actions
- **Type safety** - WithRelations interfaces prevent type errors
- **Performance** - Parallel fetching, server-side filtering, URL state
- **Security** - Server-side authentication, RLS policies
- **Maintainability** - Reusable patterns, clear conventions
- **User experience** - Proper loading/error states, shareable URLs

For specific implementation details, see:
- [FORMS.md](./FORMS.md) - Form patterns and validation
- [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md) - Complete module file patterns
- [PICKER_PATTERNS.md](./PICKER_PATTERNS.md) - Picker modal behavior
- [COMPONENT_REGISTRY.md](./COMPONENT_REGISTRY.md) - Reusable components
