# CLAUDE.md

## Table of Contents

- [Project Description](#project-description)
- [🔴 Database](#-database)
- [Testing](#testing)
- [Tools](#tools)
- [🔴 Accessing Records](#-accessing-records)
- [🔴 Role Permissions](#-role-permissions)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [📖 Styling](#-styling)
- [🔴 Module Structure (Main Files)](#-module-structure-main-files)
- [📖 Additional Module Essentials](#-additional-module-essentials)
- [📖 Data Flow Pattern](#-data-flow-pattern)
- [Breadcrumbs](#breadcrumbs)
- [Code Conventions](#code-conventions)
- [🔴 Creating New Modules](#-creating-new-modules)
- [📖 Module Icons](#-module-icons)
- [🔴 Common Module Creation Mistakes](#-common-module-creation-mistakes)
- [Known Issues](#known-issues)
- [🔴 Permissions & Automation](#-permissions--automation)

---

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

## 🔴 Database
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

## 🔴 Accessing Records
The ideal way that we want to access the records is by using the RLS feature on Supabase, so that we don't have to check for a user every time we make a request to Supabase.

## 🔴 Role Permissions
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
- **Special Case:** For simplification, "Quinceañeras" is spelled without the ñ in all programming contexts (file names, variables, types, routes, etc.). Use "Quinceanera" in code, "Quinceañera" in user-facing text only.

## 📖 Styling
Ensure that: All form fields use standardized, basic styling with no specialized text formatting!
For views that are within a print folder, allow those views to set their style however they wish.

### Dark Mode
The app uses `next-themes` with a CSS variable-based approach for automatic dark mode support. Users can switch between light, dark, and system themes via the parish user menu.

**Implementation:** All styling uses semantic CSS variables defined in `globals.css` that automatically adapt to dark mode. Never use hardcoded gray values or `dark:` utility classes.

**Available Tokens:**
- `bg-background text-foreground` - Page backgrounds and primary text
- `bg-card text-card-foreground` - Card components
- `bg-popover text-popover-foreground` - Popovers and dropdowns
- `bg-primary text-primary-foreground` - Primary actions/buttons
- `bg-secondary text-secondary-foreground` - Secondary elements
- `bg-muted text-muted-foreground` - Muted backgrounds and secondary text
- `bg-accent text-accent-foreground` - Accent elements and hover states
- `border-border` - All borders
- `border-input` - Input borders
- `ring-ring` - Focus rings
- `text-destructive` - Error/destructive text

**Best Practices:**
- ✅ Always use semantic tokens: `bg-background`, `text-foreground`, `text-muted-foreground`
- ✅ Pair backgrounds with foregrounds: `bg-card text-card-foreground`
- ❌ Never use hardcoded colors: `bg-gray-50`, `text-gray-900`, `bg-white`
- ❌ Never use `dark:` classes for basic colors (CSS variables handle this automatically)

**Example:**
```tsx
// ✅ CORRECT - Auto-adapts to dark mode
<div className="bg-background text-foreground">
  <Card className="bg-card text-card-foreground">
    <p className="text-muted-foreground">Secondary text</p>
  </Card>
</div>

// ❌ WRONG - Won't work in dark mode
<div className="bg-gray-50 text-gray-900">
  <Card className="bg-white">
    <p className="text-gray-500">Secondary text</p>
  </Card>
</div>
```

## 🔴 Module Structure (Main Files)
**CRITICAL**: Always follow the wedding module as the reference implementation. Create ALL files that exist in the wedding module.

1. **List Page (Server)** - `page.tsx`
- Auth check → fetch entities with filters from searchParams → compute stats server-side → define breadcrumbs
- Structure: `BreadcrumbSetter → [Entity]ListClient initialData={entities} stats={stats}`
- Example: `async function Page({ searchParams }: { searchParams: { search?: string; type?: string } })`

2. **List Client** - `[entity]-list-client.tsx` or `[entities]-list-client.tsx`
- Uses URL search params for shareable, linkable state (search, filters, pagination)
- Updates URL via router.push() when filters change - NO client-side filtering of data
- Card (Search/Filters: Input, Select) → Grid of Cards → Empty state Card → Stats Card

3. **Create Page (Server)** - `create/page.tsx`
- Auth check → define breadcrumbs
- Structure: `BreadcrumbSetter → [Entity]FormWrapper` with no entity prop
- Uses FormWrapper to wrap the form with PageContainer

4. **View Page (Server)** - `[id]/page.tsx`
- Auth check → fetch entity WITH RELATIONS using `get[Entity]WithRelations(id)` → define breadcrumbs
- Structure: `PageContainer → BreadcrumbSetter → [Entity]ViewClient entity={entity}`
- View client renders: ModuleViewPanel + Liturgy content (using content builder and HTML renderer)

5. **Edit Page (Server)** - `[id]/edit/page.tsx`
- Auth check → fetch entity WITH RELATIONS server-side → define breadcrumbs
- Structure: `BreadcrumbSetter → [Entity]FormWrapper entity={entity}`
- Uses FormWrapper to wrap the form with PageContainer and action buttons

6. **Form Wrapper (Client)** - `[entity]-form-wrapper.tsx`
- Wraps the form with PageContainer
- Manages form loading state
- For edit mode: Shows action buttons (View button + Save button) at top of page
- For create mode: No action buttons shown
- Passes form props down to the actual form component

7. **Unified Form (Client)** - `[entity]-form.tsx`
- Detects mode: entity prop = edit, no prop = create
- **Type**: Accepts `[Entity]WithRelations` for edit mode (not base [Entity] type)
- FormFields (all inputs) → Checkbox groups → Guidelines Card → Button group (Submit/Cancel at BOTTOM)
- Uses SaveButton and CancelButton components at the bottom of the form
- Calls `create[Entity]()` or `update[Entity]()` Server Action
- **Redirection Pattern:**
  - After UPDATE: `router.refresh()` (stays on edit page to show updated data)
  - After CREATE: `router.push(\`/[entities]/\${newEntity.id}\`)` (goes to view page)

8. **View Client** - `[id]/[entity]-view-client.tsx`
- Renders the ModuleViewPanel with entity data
- Builds liturgy using `build[Entity]Liturgy(entity, templateId)` where templateId comes from `entity.[entity]_template_id`
- Renders liturgy content using `renderHTML(liturgyDocument)`

## 📖 Additional Module Essentials

### File Naming Conventions
- Server pages: page.tsx (async function, no 'use client')
- Client components: [entity]-[purpose].tsx (e.g., reading-form.tsx, reading-list-client.tsx,
  reading-form-actions.tsx)
- Server Actions: lib/actions/[entity].ts or [entities].ts
- Types: Defined in Server Action files, exported for reuse

### Directory Structure
**Main Module Directory** (`app/(main)/[entity-plural]/`):
```
[entity-plural]/
├── page.tsx                       # List (Server)
├── loading.tsx                    # Suspense fallback (imports reusable component)
├── error.tsx                      # Error boundary (imports reusable component)
├── [entities]-list-client.tsx     # List interactivity (Client) - note plural
├── [entity]-form-wrapper.tsx      # Form wrapper with PageContainer (Client)
├── [entity]-form.tsx              # Unified create/edit form (Client)
├── create/
│   └── page.tsx                  # Create (Server)
└── [id]/
    ├── page.tsx                  # View (Server)
    ├── [entity]-view-client.tsx  # View display (Client)
    ├── loading.tsx               # Suspense fallback (imports reusable component)
    ├── error.tsx                 # Error boundary (imports reusable component)
    └── edit/
        └── page.tsx              # Edit (Server)
```

**IMPORTANT:** The `[entity]-form-wrapper.tsx` file is REQUIRED and must follow the wedding module pattern exactly.

**Print View Directory** (`app/print/[entity-plural]/`):
```
print/[entity-plural]/
└── [id]/
    └── page.tsx               # Print-optimized view (Server)
```
- **IMPORTANT:** Directory name must be PLURAL (e.g., `weddings`, `funerals`, `quinceaneras`) to match `modulePath` prop
- Fetches entity with relations
- Uses print-specific styling (can override global styles)
- No navigation elements, optimized for printing/PDF generation

**API Routes Directory** (`app/api/[entity-plural]/`):
```
api/[entity-plural]/
└── [id]/
    ├── pdf/
    │   └── route.ts           # PDF export endpoint
    └── word/
        └── route.ts           # Word document export endpoint
```
- Uses content builders to generate liturgy document
- PDF endpoint converts HTML to PDF
- Word endpoint generates .docx file
- Both endpoints fetch entity with relations and use `build[Entity]Liturgy()` function

### Reusable Module Components

**ModuleViewPanel Component** (`src/components/module-view-panel.tsx`)
- Generic view panel for all modules (weddings, funerals, baptisms, etc.)
- Handles: Edit button, Print view, PDF/Word downloads, Status/Location/Created date display
- Props:
  - `entity` - The entity being viewed (must have id, status, created_at)
  - `entityType` - Display name (e.g., "Wedding", "Funeral")
  - `modulePath` - URL path (e.g., "weddings", "funerals")
  - `mainEvent` - Optional event for location display
  - `generateFilename` - Function to generate download filenames
  - `printViewPath` - Optional custom print path

**Example Usage:**
```tsx
<ModuleViewPanel
  entity={wedding}
  entityType="Wedding"
  modulePath="weddings"
  mainEvent={wedding.wedding_event}
  generateFilename={(ext) => `wedding-${wedding.id}.${ext}`}
/>
```

**usePickerState Hook** (`src/hooks/use-picker-state.ts`)
- Reduces boilerplate for managing modal picker state (people, events, readings)
- Returns: `{ value, setValue, showPicker, setShowPicker }`
- Usage: `const bride = usePickerState<Person>()`

**Available Picker Components:**
- `PeoplePicker` - Select person from parish directory with search and inline creation
- `EventPicker` - Select or create events with date/time/location
- `ReadingPickerModal` - Select scripture readings with category filters
- `PetitionEditor` - Edit petitions with template insertion

**Shared Form Components:**
- `SaveButton` - Handles loading state, shows spinner while saving
- `CancelButton` - Standard cancel button with routing
- `FormField` - Standardized form field wrapper
- `EventDisplay` - Display event date/time/location in forms

**Content Builders & Renderers:**
Content builders create liturgy document structures that can be rendered in multiple formats:

- **Content Builders** (`lib/content-builders/[entity].ts`):
  - `build[Entity]Liturgy(entity, templateId)` - Creates structured document
  - Returns array of sections with headings, paragraphs, formatted text
  - Single source of truth for liturgy content across all output formats

- **HTML Renderer** (`lib/renderers/html-renderer.ts`):
  - `renderHTML(document)` - Converts structure to HTML/React elements
  - Used for view pages and print pages

- **Usage Pattern**:
  ```tsx
  // In view client or print page
  const liturgyDocument = buildWeddingLiturgy(wedding, 'wedding-full-script-english')
  const liturgyContent = renderHTML(liturgyDocument)
  // Returns React elements ready to render
  ```

### Type Patterns

**WithRelations Interface Pattern:**
All modules should define a `[Entity]WithRelations` interface that extends the base entity type and includes related data:

```tsx
// In lib/actions/[entity].ts
export interface WeddingWithRelations extends Wedding {
  bride?: Person | null
  groom?: Person | null
  wedding_event?: Event | null
  // ... all related foreign keys expanded to full objects
}

export async function get[Entity]WithRelations(id: string): Promise<[Entity]WithRelations | null> {
  // 1. Fetch base entity
  // 2. Use Promise.all() to fetch all related data in parallel
  // 3. Return merged object
}
```

**Why:**
- Forms need related data for display (not just IDs)
- Type-safe access to nested properties
- Eliminates unsafe `as any` type casts
- View pages need full entity details for rendering

## 📖 Data Flow Pattern
Server → Client: Pass serializable data as props
- List: initialData={entities}
- Form: entity={entity} (edit) or no prop (create)
- Actions: entity={entity}

### Server Actions (lib/actions/[entity].ts)
Required exports:
- get[Entities](filters?: FilterParams) - Fetch list with optional server-side filtering
- get[Entity](id) - Fetch single entity (basic)
- get[Entity]WithRelations(id) - Fetch entity with all related data (for view/edit pages)
- create[Entity](data) - Create
- update[Entity](id, data) - Update
- delete[Entity](id) - Delete
- Types: [Entity], [Entity]WithRelations, Create[Entity]Data, Update[Entity]Data

**Simplified Update Pattern:**
Use Object.fromEntries to filter undefined values instead of 30+ if statements:

```tsx
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

**Cache revalidation:** After mutations (create/update/delete), use revalidatePath() to invalidate Next.js cache for affected routes. Always revalidate both list pages and detail pages.

### Authentication Pattern
Every server page starts with:
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')

### Error Handling
- Not found: notFound() when entity doesn't exist
- Client errors: toast.error() + try/catch
- Server redirects: redirect('/path')

### Component Communication
- Server to Client: Props only (serializable data)
- Client to Server: Server Actions via 'use server'
- Client state: useState for form fields, temporary UI state
- URL search params: Filters, pagination, search (shareable state)
- Context: UI state only (theme, breadcrumbs, modals) - NEVER for data fetching
- No prop drilling: Use Server Actions for data operations

### Form Event Handling
**CRITICAL:** When creating forms inside dialogs/modals that are rendered within other forms (nested forms), always prevent event propagation:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  e.stopPropagation() // ← REQUIRED to prevent bubbling to parent form

  // ... form submission logic
}
```

**Why:** Dialog forms (like EventPicker, PeoplePicker with inline creation) are often rendered while a parent form is active. Without `e.stopPropagation()`, submitting the dialog form will also trigger the parent form's submission, causing unintended saves.

**Where to apply:**
- EventPicker: Already implemented in `handleCreateEvent`
- PeoplePicker: Apply if adding inline creation forms
- Any custom picker/modal components with forms

**Reference:** See `/components/event-picker.tsx` line 208 for the canonical implementation.

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
- **Always use shadcn/ui components** before falling back to creating something completely new or even creating a new component
- You may create new components, but always ask before doing it.
- **Follow TypeScript patterns** established in existing components
- **Maintain responsive design** across all new components
- **Integrate with Supabase Auth** for user-facing features
- **Use consistent design patterns** from existing component library

## 🔴 Creating New Modules (Funerals, Baptisms, etc.)

**Reference Implementation:** Wedding module (`src/app/(main)/weddings/`)

**Complete Checklist:** See [MODULE_CHECKLIST.md](MODULE_CHECKLIST.md) for the full step-by-step checklist when creating new modules.

### Quick Overview

When creating a new module:

1. **Database Layer** - Migration, RLS policies, base types
2. **Server Actions** - CRUD operations with `WithRelations` interface
3. **Module Structure** - 8 main files + 1 print page (follow wedding pattern exactly)
4. **Reusable Components** - Use existing pickers and shared components
5. **Content & Export** - Content builder + API routes for PDF/Word
6. **Constants** - Status constants and sidebar navigation

## 📖 Module Icons
Each module must use a consistent icon from `lucide-react` throughout the application:

- **Weddings**: `VenusAndMars` (lucide-react)
- **Funerals**: `Cross` (lucide-react)
- **Baptisms**: TBD
- **Presentations**: TBD

Icons are used in:
- Main sidebar navigation (`src/components/main-sidebar.tsx`)
- Module list pages (if displaying icons)
- Breadcrumbs or page headers (if applicable)

## 🔴 Common Module Creation Mistakes

### Critical Errors to Avoid:

1. **Missing Form Wrapper**: Always create `[entity]-form-wrapper.tsx` - this is NOT optional
   - Wraps the form with PageContainer
   - Provides action buttons for edit mode (View + Save at top)
   - Manages loading state

2. **Wrong Redirection Pattern**:
   - ✅ CORRECT: After UPDATE → `router.refresh()` (stays on edit page)
   - ✅ CORRECT: After CREATE → `router.push(\`/[entities]/\${newEntity.id}\`)` (goes to view page)
   - ❌ WRONG: Using `router.push()` after update (loses unsaved context)
   - ❌ WRONG: Staying on create page after creation

3. **Incorrect Type Usage**:
   - ✅ Form must accept `[Entity]WithRelations` type (not base `[Entity]`)
   - ✅ View pages must fetch using `get[Entity]WithRelations(id)`
   - ❌ Using base type causes missing nested data (people, events, readings)

4. **Missing Template ID Check**:
   - ✅ View client must use: `const templateId = entity.[entity]_template_id || 'default-template-id'`
   - ✅ Pass templateId to: `build[Entity]Liturgy(entity, templateId)`
   - ❌ Hard-coding template ID prevents users from selecting different templates

5. **File Structure Deviations**:
   - Always create ALL files that exist in the wedding module
   - Use exact same naming patterns (`[entities]-list-client.tsx` with plural)
   - Follow exact same component structure and props

### Validation Checklist:
Before completing a new module, verify:
- [ ] Form wrapper exists and matches wedding pattern
- [ ] Redirections match wedding module (refresh on update, push on create)
- [ ] Types use `WithRelations` interfaces
- [ ] Template ID is read from database and used in liturgy builder
- [ ] All view pages (view, print, PDF, Word) use template ID from database
- [ ] Icon is consistent across all uses
- [ ] All wedding module files have corresponding files in new module

## Known Issues
(Document any existing bugs or performance concerns here)

## 🔴 Permissions & Automation
You are never allowed to make a commit.
Neither are you allowed to add files to the repository.
