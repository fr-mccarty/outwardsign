# CLAUDE.md

## Project Description
**Name:** Outward Sign  
**URL:** outwardsign.church  
**Purpose:** Sacrament and Sacramental Management Tool

Plan, Communicate, and Celebrate Sacraments and Sacramentals in a Catholic Parish

**Belief:** The Sacraments are the core activity of the Catholic Parish. Their proper celebration at every step is the evangelizing work of parishes.

**Tactics:**
- Working together as a parish staff and with the participants in the sacrament are essential for the joy of the individuals, and for the beauty for the world
- Communication with the individuals, with the staff, with the support staff, and with the world are part of what make the sacraments beautiful
- Important operational note: Being fully prepared to celebrate a sacrament or a sacramental means having the summary and the script printed off in a binder and in the sacristy for the priest, deacon, or church leader to pick up and take it to action

**Features:**
- Shared Preparation with presider, staff, and family
- Calendarize Events into a .ics feed
- Print and Export Documentation: Readings and Scripts
- Language Management

**Examples:** Wedding Liturgies, Quinceanera, Baptisms, Presentations (Latino), Funerals

## Database
For making database changes, a migration file should first be created.
Claude Code should NEVER use the supabase mcp server to make database changes.

When ready, tell the user to push to remote using this command
supabase db push

Make sure to confirm at the end of a message when a new migration has been created. Ensure the user has run the push command before moving on.

Problems and policies need to be fixed at the migration level. Never try to fix a policy or a table or a function outside of a migration.

According to Claude, the backend access the database at Supabaes using the Authenticated policy, and the frontend uses the Anon policy.

## Testing
use Playwright to test:
npm run test:headed

## Tools
Supabase MCP Server - for all actions related to the database
you may use query and select operations on supabase without asking for permission
All other actions need permission

## Accessing Records
The ideal way that we want to access the records is by using the RLS feature on Supabase, so that we don't have to check for a user every time we make a request to Supabase.

## Role Permissions
- super-admin: Billing settings, parish ownership
- admin: Parish settings, parish management
- staff: Read parish information (default role), they can create, read, update, and delete all other tables.
- parishioner: Read only their own records

## Tech Stack
**Frontend:** Next.js 13+ with App Router  
**Database:** Supabase (PostgreSQL)  
**Authentication:** Supabase Auth with server-side session management  
**API:** Server Actions for secure data operations  
**UI Components:** Radix UI primitives with shadcn/ui styling  
**Icons:** Lucide React  
**Styling:** Tailwind CSS (mobile-first approach)  
**Coding Tool:** Claude Code  
**Deployment:** Vercel

## Architecture

### Data Architecture
**Parish Structure:**
- Each main record everywhere (excluding pivot tables) should have a `parish_id`
- Data is scoped to parishes
- Shared access within team boundaries

**Naming Conventions:**
- Database tables: plural form (e.g., `petitions`, `baptisms`)
- TypeScript interfaces: singular form (e.g., `Petition`, `Baptism`)

## Styling
Ensure that: All form fields use standardized, basic styling with no specialized text formatting!
For views that are within a print folder, allow those views to set their style however they wish.

### Module Structure (7 Files)

1. List Page (Server) - page.tsx
- Auth check → fetch entities with filters from searchParams → compute stats server-side → define breadcrumbs
- PageContainer → BreadcrumbSetter → [Entity]ListClient initialData={entities} stats={stats}
- Example: `async function Page({ searchParams }: { searchParams: { search?: string; type?: string } })`

2. List Client - [entity]-list-client.tsx
- Uses URL search params for shareable, linkable state (search, filters, pagination)
- Updates URL via router.push() when filters change - NO client-side filtering of data
- Card (Search/Filters: Input, Select) → Grid of Cards → Empty state Card → Stats Card

3. Create Page (Server) - create/page.tsx
- Auth check → define breadcrumbs
- PageContainer → BreadcrumbSetter → [Entity]Form (no prop)

4. View Page (Server) - [id]/page.tsx
- Auth check → fetch entity server-side → define breadcrumbs
- PageContainer → BreadcrumbSetter → [Entity]FormActions entity={entity} → Display Cards

5. Edit Page (Server) - [id]/edit/page.tsx
- Auth check → fetch entity server-side → define breadcrumbs
- PageContainer → BreadcrumbSetter → [Entity]Form entity={entity}

6. Unified Form (Client) - [entity]-form.tsx
Detects mode: entity prop = edit, no prop = create
- FormFields (all inputs) → Checkbox groups → Guidelines Card → Button group (Submit/Cancel)
- Calls createEntity() or updateEntity() Server Action

7. Form Actions (Client) - [id]/[entity]-form-actions.tsx
- Interactive Buttons: Copy (clipboard), Edit (link), Delete (confirmation + toast)
- Router navigation post-action

Additional Module Essentials

File Naming Conventions

- Server pages: page.tsx (async function, no 'use client')
- Client components: [entity]-[purpose].tsx (e.g., reading-form.tsx, reading-list-client.tsx,
  reading-form-actions.tsx)
- Server Actions: lib/actions/[entity].ts or [entities].ts
- Types: Defined in Server Action files, exported for reuse

Directory Structure

[entity-plural]/
├── page.tsx                    # List (Server)
├── loading.tsx                 # Suspense fallback (imports reusable component)
├── error.tsx                   # Error boundary (imports reusable component)
├── [entity]-list-client.tsx    # List interactivity (Client)
├── [entity]-form.tsx           # Unified create/edit form (Client)
├── create/
│   └── page.tsx               # Create (Server)
└── [id]/
    ├── page.tsx               # View (Server)
    ├── loading.tsx            # Suspense fallback (imports reusable component)
    ├── error.tsx              # Error boundary (imports reusable component)
    ├── [entity]-form-actions.tsx  # View actions (Client)
    └── edit/
        └── page.tsx           # Edit (Server)

Data Flow Pattern

Server → Client: Pass serializable data as props
- List: initialData={entities}
- Form: entity={entity} (edit) or no prop (create)
- Actions: entity={entity}

Server Actions (lib/actions/[entity].ts)

Required exports:
- get[Entities](filters?: FilterParams) - Fetch list with optional server-side filtering
- get[Entity](id) - Fetch single
- create[Entity](data) - Create
- update[Entity](id, data) - Update
- delete[Entity](id) - Delete
- Types: [Entity], Create[Entity]Data

**Cache revalidation:** After mutations (create/update/delete), use revalidatePath() to invalidate Next.js cache for affected routes. Always revalidate both list pages and detail pages.

Authentication Pattern

Every server page starts with:
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')

Error Handling

- Not found: notFound() when entity doesn't exist
- Client errors: toast.error() + try/catch
- Server redirects: redirect('/path')

Component Communication

- Server to Client: Props only (serializable data)
- Client to Server: Server Actions via 'use server'
- Client state: useState for form fields, temporary UI state
- URL search params: Filters, pagination, search (shareable state)
- Context: UI state only (theme, breadcrumbs, modals) - NEVER for data fetching
- No prop drilling: Use Server Actions for data operations

### Performance Patterns

**Server-side filtering:** List pages accept searchParams prop. Pass these to get[Entities]() functions to filter on the server, not the client.

**Parallel data fetching:** Use Promise.all() when fetching multiple independent data sources in server components.

**URL state management:** Client components should update URL search params via router.push() instead of maintaining local filter state. This makes state shareable and linkable.

### Loading and Error States

**Pattern:** Create reusable skeleton and error components in components/ directory. Route-level loading.tsx and error.tsx files import and render these reusable components. This ensures consistent UX across modules.

### Validation

**Dual validation with Zod:** Define schemas in Server Action files. Client forms use .safeParse() for instant feedback. Server Actions use .parse() as security boundary. Export schema types with z.infer<>.

## Breadcrumbs
Client Component (BreadcrumbSetter):
- Sets breadcrumbs in context via useBreadcrumbs() hook
- Returns null (invisible component)

## Code Conventions

### General
- **Indentation:** 2 spaces
- **Language:** TypeScript for all new files
- **Component type:** Server Components by default, Client Components only when needed

### UI Patterns
- Do not use the system dialog for confirming or alerting the user. Use shadcn components.
- Handling an empty table: make sure there is always a button to create new, unless otherwise specified. Be sure to use the icon which the module is using in the main-sidebar.
- Table content should always be fetched server-side. Pagination should always be available. Use shadcn components.

### Development Guidelines
- **Always use custom components** before falling back to shadcn/ui components
- **Follow TypeScript patterns** established in existing components
- **Maintain responsive design** across all new components
- **Integrate with Supabase Auth** for user-facing features
- **Use consistent design patterns** from existing component library

## Known Issues
(Document any existing bugs or performance concerns here)

## Permissions & Automation
(Document things you want to give Claude permission to do automatically)
