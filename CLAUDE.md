# CLAUDE.md

> **Documentation Structure Note:** This file should remain as a single document until its content exceeds 1000 lines. The current priority markers (🔴 for critical, 📖 for reference) and table of contents provide sufficient navigation. Only split into separate files when the size truly impedes usability.

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
  - [🔴 Bilingual Implementation](#-bilingual-implementation-english--spanish)
- [🔴 Design Principles](#-design-principles)
- [🔴 Creating New Modules](#-creating-new-modules)
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

**Migration Strategy (Early Development):**
During initial development, modify existing migrations instead of creating new migration files. When database changes are needed, update the relevant existing migration, then prompt the user to reset the database and re-run all migrations from scratch.

## Testing
For testing instructions and commands, refer to the [README.md](../README.md#testing) file.

**Authentication in Tests:** For information on how to use authentication in tests (setting up test users, authenticated requests, etc.), refer to the authentication testing section in the [README.md](../README.md#testing) file.

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

**For detailed styling guidelines, patterns, and examples, see [STYLES.md](./STYLES.md).**

### General Principles

1. **Use System Defaults**
   - Use the system font stack (no custom fonts except in print views)
   - Use semantic color tokens from the theme system
   - Keep styling simple and straightforward

2. **Dark Mode Support**
   - All styling uses semantic CSS variables that automatically adapt to dark mode
   - **NEVER use hardcoded colors** (`bg-white`, `text-gray-900`, hex colors)
   - **ALWAYS pair backgrounds with foregrounds** (`bg-card text-card-foreground`)
   - Users can switch between light, dark, and system themes

3. **Semantic Color Tokens**
   - Use tokens like `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`
   - Never use `dark:` utility classes for basic colors (CSS variables handle this automatically)
   - See [STYLES.md](./STYLES.md) for complete token reference

### 🔴 Form Input Styling (CRITICAL)

**NEVER modify font-family, font style, font weight, borders, or backgrounds in form inputs.** All form inputs (Input, Textarea, Select) must use the default component styling from shadcn/ui.

**PROHIBITED in form inputs:**
- ❌ `font-mono` - Monospace fonts
- ❌ `font-serif` - Serif fonts
- ❌ `font-sans` - Explicit sans-serif (use default instead)
- ❌ `italic` - Italicized text
- ❌ `font-light`, `font-bold`, `font-semibold`, etc. - Custom font weights
- ❌ `border`, `border-*`, `rounded-*` - Border customizations
- ❌ `bg-*` - Background color changes
- ❌ Any `font-family` or `style={{fontFamily: ...}}` properties

**ALLOWED styling for form inputs:**
- ✅ Text sizes: `text-xs`, `text-sm`, `text-base`, `text-lg` (size adjustments are fine)
- ✅ Layout: `w-full`, `min-h-[300px]`, `max-w-*`, padding, margin, spacing
- ✅ Standard component defaults from shadcn/ui (borders, backgrounds come from the base component)

**Example:**
```tsx
// ❌ WRONG - Never apply font-family, font style, borders, or backgrounds to inputs
<Textarea className="min-h-[300px] font-mono text-sm" />
<Input className="font-serif italic bg-gray-100" />
<Input className="font-bold border-2 rounded-lg" />

// ✅ CORRECT - Only layout and text size
<Textarea className="min-h-[300px] text-sm" />
<Input className="w-full text-base" />
<Input className="max-w-md" />
```

**Why this matters:** Form inputs must maintain consistent styling across the application. The shadcn/ui components already provide proper borders, backgrounds, and focus states that work with dark mode. Only layout and text size should be adjusted.

### Print Views Exception

For views within a print folder (`app/print/`), custom styling is allowed to optimize for printing and PDF generation. These views are not interactive and do not need to follow the standard form input rules.

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
- **isEditing Pattern:**
  - Always compute `isEditing = !!entity` at the top of the form
  - Use `isEditing` for ALL mode detection throughout the form (button text, navigation, conditional logic)
  - For EventPicker components, use `openToNewEvent={!isEditing}` (not `!entity` or `!event`)
  - For PeoplePicker components, use `openToNewPerson={!isEditing}` (not `!entity` or `!person`)
  - This creates consistent behavior: create mode always opens to new entity creation forms, edit mode always opens to search/picker view
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

### Constants Pattern
The application uses a dual-constant pattern where `*_VALUES` arrays contain uppercase keys stored in the database (e.g., `MODULE_STATUS_VALUES = ['ACTIVE', 'INACTIVE']`), and `*_LABELS` objects map those keys to localized display strings in both English and Spanish (e.g., `MODULE_STATUS_LABELS.ACTIVE.en = 'Active'`). This standardizes database storage while enabling multilingual UI display across all modules.

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

**ModuleViewContainer Component** (`src/components/module-view-container.tsx`)
- Reusable container for all liturgy-based module view pages (weddings, funerals, presentations, quinceañeras, baptisms, etc.)
- Handles: Layout (side panel + main content), liturgy building, and HTML rendering
- Uses callback pattern for module-specific logic (filename generation, template selection, liturgy building)
- Props:
  - `entity` - The entity being viewed (with relations)
  - `entityType` - Display name (e.g., "Wedding", "Funeral")
  - `modulePath` - URL path (e.g., "weddings", "funerals")
  - `mainEvent` - Optional event for location display
  - `generateFilename` - Function to generate download filenames
  - `buildLiturgy` - Function to build liturgy document (e.g., `buildWeddingLiturgy`)
  - `getTemplateId` - Function to extract template ID from entity
  - `printViewPath` - Optional custom print path

**Example Usage:**
```tsx
// In [entity]-view-client.tsx
export function WeddingViewClient({ wedding }: WeddingViewClientProps) {
  const generateFilename = (extension: string) => {
    const brideLastName = wedding.bride?.last_name || 'Bride'
    const groomLastName = wedding.groom?.last_name || 'Groom'
    const weddingDate = wedding.wedding_event?.start_date
      ? new Date(wedding.wedding_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    return `${brideLastName}-${groomLastName}-${weddingDate}.${extension}`
  }

  const getTemplateId = (wedding: WeddingWithRelations) => {
    return wedding.wedding_template_id || 'wedding-full-script-english'
  }

  return (
    <ModuleViewContainer
      entity={wedding}
      entityType="Wedding"
      modulePath="weddings"
      mainEvent={wedding.wedding_event}
      generateFilename={generateFilename}
      buildLiturgy={buildWeddingLiturgy}
      getTemplateId={getTemplateId}
    />
  )
}
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

### 🔴 Picker Modal Behavior (Critical)

**CRITICAL RULE:** When creating new entities from ANY picker modal (PeoplePicker, EventPicker, ReadingPickerModal), the behavior MUST follow this exact pattern:

1. **Save immediately**: Entity is created and persisted to database via server action
2. **Auto-select**: Newly created entity is automatically selected in the parent form field
3. **Close modal**: Picker dialog closes automatically after selection
4. **NO REDIRECT**: The current page must NOT navigate away - user stays on the form they were working on

**Why this matters:**
- Users are in the middle of creating/editing a main entity (wedding, funeral, presentation)
- Creating a related entity (person, event, reading) is a sub-task within that workflow
- Redirecting would lose the user's context and any unsaved work in the parent form
- Auto-selecting improves UX by eliminating an extra click

**Implementation Pattern:**

```tsx
// In picker component (e.g., PeoplePicker, EventPicker)
const handleCreateEntity = async (e: React.FormEvent) => {
  e.preventDefault()
  e.stopPropagation() // Prevent parent form submission

  try {
    // 1. Create entity via server action
    const newEntity = await createEntity({...formData})

    // 2. Show success feedback
    toast.success('Entity created successfully')

    // 3. Reset internal form state
    setFormData(initialState)
    setShowAddForm(false)

    // 4. Auto-select newly created entity (calls onSelect callback)
    handleEntitySelect(newEntity)

    // ✅ CORRECT: No router.push(), no navigation
    // ❌ WRONG: router.push('/entities/...')
  } catch (error) {
    toast.error('Failed to create entity')
  }
}

// handleEntitySelect implementation
const handleEntitySelect = (entity: Entity) => {
  onSelect(entity)      // Pass to parent via callback
  onOpenChange(false)   // Close the modal
  // ✅ CORRECT: Only select and close
  // ❌ WRONG: router.push() anywhere in this flow
}
```

**Affected Components:**
- `PeoplePicker` (`src/components/people-picker.tsx`) - For creating persons from wedding/funeral/presentation forms
- `EventPicker` (`src/components/event-picker.tsx`) - For creating events from module forms
- `ReadingPickerModal` (if inline creation exists) - For adding readings

**Verification Checklist:**
When implementing or modifying picker components, verify:
- [ ] Server action creates entity and returns it (no redirect in action)
- [ ] `handleCreate[Entity]` function does NOT call `router.push()`
- [ ] New entity is passed to `handleEntitySelect()` or equivalent
- [ ] `handleEntitySelect()` only calls `onSelect(entity)` and `onOpenChange(false)`
- [ ] Parent component receives entity via `onSelect` callback prop
- [ ] Parent component updates its state with selected entity
- [ ] Modal closes after selection
- [ ] User remains on the current form page

**Common Mistakes to Avoid:**
- ❌ Adding `router.push()` after entity creation
- ❌ Adding `redirect()` in server action for picker entities
- ❌ Not auto-selecting the newly created entity
- ❌ Requiring user to manually search and select what they just created
- ❌ Different behavior between different picker modals (be consistent)

**Reference Implementations:**
- Correct pattern: `src/components/people-picker.tsx` lines 151-191
- Correct pattern: `src/components/event-picker.tsx` lines 206-265

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

### Spelling and Typos
- **Proactive corrections:** Always suggest spelling corrections when you notice typos, misspellings, or grammatical errors in code comments, documentation, user-facing text, or variable names
- **Scope:** This applies to all text content including comments, strings, documentation files, README files, and identifiers (where appropriate and safe to rename)
- **User preference:** The user wants to maintain high-quality, professional text throughout the codebase

### 🔴 Bilingual Implementation (English & Spanish)
**CRITICAL:** Most content in the application is bilingual (English and Spanish). Always check the language implementation of each change.

- **Homepage:** All text must be in both English and Spanish in the translations object
- **User-facing content:** Forms, labels, messages, and UI text should support both languages where applicable
- **Verification:** After making changes to user-facing text, especially on the homepage, verify that both English and Spanish translations are complete and accurate
- **Translation pattern:** Follow the existing pattern in `src/app/page.tsx` with translations object containing `en` and `es` keys

**When in doubt:** Check existing bilingual implementations (homepage, constants file) for the correct pattern.

### UI Patterns
- Do not use the system dialog for confirming or alerting the user. Use shadcn components.
- Handling an empty table: make sure there is always a button to create new, unless otherwise specified. Be sure to use the icon which the module is using in the main-sidebar.
- Table content should always be fetched server-side. Pagination should always be available. Use shadcn components.
- **Modals should be scrollable:** When creating modals with content that may overflow, use flexbox layout with a fixed header and scrollable content area. Structure: `DialogContent` with `flex flex-col`, `DialogHeader` with `flex-shrink-0`, and content wrapper with `overflow-y-auto flex-1`. Reference implementation: `src/components/calendar/day-events-modal.tsx`

### Development Guidelines
- **Always use custom components** before falling back to shadcn/ui components
- **Always use shadcn/ui components** before falling back to creating something completely new or even creating a new component
- You may create new components, but always ask before doing it.
- **Follow TypeScript patterns** established in existing components
- **Maintain responsive design** across all new components
- **Integrate with Supabase Auth** for user-facing features
- **Use consistent design patterns** from existing component library

## 🔴 Design Principles

These core design principles guide all development decisions in Outward Sign. Every feature, component, and interaction should embody these virtues:

### Simplicity
- Remove unnecessary elements and complexity
- Make common tasks easy and straightforward
- Avoid feature bloat - focus on essential sacramental workflows
- Prefer clear, direct solutions over clever abstractions

### Clarity
- No ambiguity about what UI elements do or what will happen when interacting with them
- Use clear, descriptive labels and button text
- Ensure form fields clearly indicate what input is expected
- Status indicators and states should be immediately obvious

### Feedback
- System responds to every user action with appropriate feedback
- Show loading states for all asynchronous operations (use `SaveButton`, spinners)
- Display success messages after successful operations (use `toast.success()`)
- Show clear error messages when operations fail (use `toast.error()` with actionable guidance)
- Real-time validation feedback on forms where appropriate

### Affordances
- Things should look like what they do
- Buttons must look clickable (proper hover states, cursor changes)
- Disabled elements should appear visually disabled
- Interactive elements should have clear visual indicators (icons, colors, borders)
- Form fields should look like form fields

### Recognition over Recall
- Show available options rather than requiring users to remember or type them
- Use picker modals (PeoplePicker, EventPicker) instead of free-text input where possible
- Display recently used items, suggestions, or defaults
- Breadcrumbs show current location in the app hierarchy
- Pre-fill forms with sensible defaults when editing

### Forgiving Design
- Make destructive actions reversible where possible
- Require confirmation for irreversible destructive actions (deletions)
- Implement autosave for long forms or critical workflows (where appropriate)
- Allow users to cancel operations and return to previous state
- Gracefully handle errors without losing user data

### Progressive Disclosure
- Show basic, most commonly used options first
- Reveal advanced features and complexity only as needed
- Use collapsible sections for optional or advanced settings
- Don't overwhelm users with all options at once
- Organize forms logically from essential to optional fields

### Efficiency
- Provide keyboard shortcuts for power users where appropriate
- Enable bulk actions when users need to operate on multiple items
- Support keyboard navigation throughout the application
- Minimize clicks required for common workflows
- Allow inline editing and creation (e.g., creating people/events from within forms)
- Use server-side filtering and pagination for performance

### Content & Communication

#### Microcopy
- Use helpful, human labels and instructions throughout the interface
- Write in plain language - avoid jargon unless essential to sacramental context
- Button text should clearly describe the action (e.g., "Save Wedding" not just "Save")
- Error messages should explain what went wrong AND how to fix it
- Labels should be concise but descriptive

#### Empty States
- Never show a blank screen - always provide helpful guidance
- Empty lists should explain what would go here and how to add the first item
- Include a clear call-to-action button to create the first entry
- Use encouraging, welcoming language for new users
- Example: "No weddings yet. Click 'Create Wedding' to plan your first celebration."

#### Onboarding
- Provide smooth, gradual introduction for new users and new features
- First-time experiences should guide users to initial setup steps
- Use progressive disclosure - don't overwhelm with all features at once
- Consider tooltips or brief inline help for complex workflows
- Make it easy to skip or dismiss onboarding for experienced users

#### Help & Documentation
- Provide contextual help where users might need it
- Complex forms should include helpful tooltips or info icons
- Link to relevant documentation when available
- Guidelines and best practices should be visible but not intrusive
- Consider inline examples for complex fields (e.g., formatting patterns)

### Specific Patterns

#### Similarity/Familiarity
- Use established UI patterns that users already know from other applications
- Follow web conventions for common interactions (links, buttons, forms)
- Maintain consistency with the wedding module pattern across all modules
- Reuse existing components (PeoplePicker, EventPicker) for similar tasks
- Don't reinvent common patterns - leverage user's existing mental models

#### Proximity
- Group related items together visually and spatially
- Keep form labels close to their inputs
- Group related form fields in logical sections
- Place actions (buttons) near the content they affect
- Use whitespace to separate unrelated groups

#### Continuity
- Create natural flow from one step to the next in multi-step processes
- Maintain context as users navigate through workflows
- Breadcrumbs show the path users have taken
- After creating an entity, smoothly transition to viewing it
- Preserve user input when navigating between related forms/pages

#### Closure
- Provide clear endings and confirmations when tasks complete
- Success messages confirm that actions were successful
- Redirect to appropriate next page after creating/editing
- Show final state after bulk operations complete
- Allow users to clearly understand that a workflow is finished

**Application:** When implementing new features or reviewing code, ask:
- Is this the simplest solution that could work?
- Will users clearly understand what this does?
- Does the UI provide appropriate feedback?
- Can users easily undo or recover from mistakes?
- Are we showing too much complexity upfront?
- Could this common task be made more efficient?

## 🔴 Creating New Modules

**IMPORTANT:** When the user requests creation of a new module (Funerals, Baptisms, Presentations, etc.), you MUST read the [MODULE_CHECKLIST.md](MODULE_CHECKLIST.md) file first to ensure you follow the complete checklist and avoid common mistakes.

**Reference Implementation:** Wedding module (`src/app/(main)/weddings/`)

**Complete Checklist:** See [MODULE_CHECKLIST.md](MODULE_CHECKLIST.md) for the comprehensive step-by-step guide including:
- Detailed phase-by-phase checklist (Database → Server Actions → Module Structure → Print/Export → Testing)
- Common mistakes to avoid
- Validation checklist
- Module icons reference

**Quick Reference:** When creating a new module, follow these major steps:
1. Database Layer - Migration, RLS policies, base types
2. Server Actions - CRUD operations with `WithRelations` interface
3. Module Structure - 8 main files + 1 print page (follow wedding pattern exactly)
4. Reusable Components - Use existing pickers and shared components
5. Content & Export - Content builder + API routes for PDF/Word
6. Constants - Status constants and sidebar navigation

## Known Issues
(Document any existing bugs or performance concerns here)

## 🔴 Permissions & Automation
You are never allowed to make a commit.
Neither are you allowed to add files to the repository.
