# CLAUDE.md

> **Documentation Structure Note:** This file should remain as a single document until its content exceeds 1000 lines. The current priority markers (🔴 for critical, 📖 for reference) and table of contents provide sufficient navigation. Only split into separate files when the size truly impedes usability.
>
> **When CLAUDE.md Gets Too Large:**
> - **Move detailed documentation to `docs/` directory** - Offload comprehensive guides, implementation details, and reference material to separate files
> - **Keep critical overviews in CLAUDE.md** - Retain high-level guidance, quick references, and pointers to detailed docs
> - **What to offload:** Testing guides, styling details, form patterns, component documentation, module checklists, architecture deep-dives
> - **What to keep:** Project description, tech stack, critical patterns (🔴 markers), database rules, design principles, table of contents with links to docs
> - **Always update references** - When moving content to docs/, add a reference link in CLAUDE.md (e.g., "**For detailed X, see [X.md](./docs/X.md)**")
> - **Maintain discoverability** - Files in docs/ should have descriptive names and be referenced from relevant sections in CLAUDE.md

> **🔴 CRITICAL - Forms Context:** When creating or editing ANY form component, you MUST include [FORMS.md](./docs/FORMS.md) in your context. This file contains critical form patterns, validation rules, styling requirements, and component usage guidelines that are essential for maintaining consistency across the application.

> **🔴 GREENFIELD DEVELOPMENT:** This is an early-stage, greenfield application. When making changes, **modify original files and existing context directly** rather than creating new implementations for backward compatibility. The priority is establishing the right patterns and architecture, not maintaining legacy code. Make breaking changes as needed to improve the codebase—we are not concerned with backward compatibility at this stage.

## Table of Contents

- [📚 Detailed Documentation](#-detailed-documentation)
- [Project Description](#project-description)
- [📖 User Personas](#-user-personas)
- [🔴 Database](#-database)
- [Testing](#testing)
- [Tools](#tools)
- [🔴 Accessing Records](#-accessing-records)
- [🔴 Role Permissions](#-role-permissions)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [📖 Styling](#-styling)
- [🔴 Forms](#-forms)
- [🔴 Module Structure (Main Files)](#-module-structure-main-files)
- [📖 Additional Module Essentials](#-additional-module-essentials)
  - [🔴 Constants Pattern](#-constants-pattern-critical)
- [📖 Data Flow Pattern](#-data-flow-pattern)
- [Breadcrumbs](#breadcrumbs)
- [Code Conventions](#code-conventions)
  - [🔴 Bilingual Implementation](#-bilingual-implementation-english--spanish)
- [🔴 Design Principles](#-design-principles)
- [🔴 Creating New Modules](#-creating-new-modules)
- [Known Issues](#known-issues)

---

## 📚 Detailed Documentation

**The `docs/` directory contains comprehensive, in-depth documentation files on specialized topics.**

When you need detailed information on forms, styling, components, modules, testing, liturgical calendar system, or other specific topics, search the `docs/` directory. Files are named descriptively to make them easy to discover.

**Liturgical Calendar:** See [LITURGICAL_CALENDAR.md](./docs/LITURGICAL_CALENDAR.md) for liturgical calendar API integration, import scripts, and database structure.

This main CLAUDE.md file provides overviews and references these detailed resources where appropriate.

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

## 📖 User Personas

User personas have been created to guide development and evaluate the application from the perspective of real parish users. These personas represent the primary users of Outward Sign and help ensure the application meets their needs.

**Reference File:** [PERSONA.md](./docs/PERSONA.md)

When implementing features or evaluating the application, refer to the personas file to ensure the design, functionality, and user experience align with the needs of priests, deacons, pastoral associates, liturgical directors, parish staff, and parishioners.

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

**Migration File Structure:**
- **One table per migration file** - Each migration file should create or modify only ONE table
- Module tables should be named in **plural form** (e.g., `weddings`, `funerals`, `baptisms`)
- Keep migrations focused and atomic for better version control and rollback capability

## Testing

**For quick setup and running tests:** See [TESTING_QUICKSTART.md](./docs/TESTING_QUICKSTART.md)

**For AI agents writing tests:** See [TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) - Comprehensive guide including authentication patterns, file structure, writing tests, Page Object Model, debugging techniques, and command reference.

**For testability standards and code review:** See [TESTING_ARCHITECTURE.md](./docs/TESTING_ARCHITECTURE.md) - Component testability patterns, selector strategies, test ID conventions, accessibility requirements, and anti-patterns to avoid.

**Key Points:**
- Tests are pre-authenticated automatically - no manual auth setup needed in test files
- Use role-based selectors first (`getByRole`), then labels (`getByLabel`), then test IDs (`getByTestId`)
- All form inputs must have proper `<Label>` with `htmlFor` for testability
- Add `data-testid` to complex components (pickers, dynamic lists, cards with entity IDs)
- Follow Page Object Model for modules with multiple tests
- Do not test for toast messages after successful form submissions - test navigation instead

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
- Database columns: singular form (e.g., `note`, not `notes`)
- TypeScript interfaces: singular form (e.g., `Petition`, `Baptism`)
- **React state variables**: Match database column names (singular form)
  - State variable: `note` (not `notes`)
  - Setter function: `setNote` (not `setNotes`)
  - Example: `const [note, setNote] = useState('')` for a `note` column
- **Special Case:** For simplification, "Quinceañeras" is spelled without the ñ in all programming contexts (file names, variables, types, routes, etc.). Use "Quinceanera" in code, "Quinceañera" in user-facing text only.

## 📖 Styling

**For detailed styling guidelines, patterns, and examples, see [STYLES.md](./docs/STYLES.md).**

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
   - See [STYLES.md](./docs/STYLES.md) for complete token reference

### Print Views Exception

For views within a print folder (`app/print/`), custom styling is allowed to optimize for printing and PDF generation. These views are not interactive and do not need to follow the standard form input rules.

## 🔴 Forms

**For comprehensive form implementation guidelines, see [FORMS.md](./docs/FORMS.md).**

This includes:
- 🔴 **Form Input Styling** - Critical rules for styling form inputs (NEVER modify font-family, borders, or backgrounds)
- 🔴 **Form Component Structure** - Unified form pattern, isEditing pattern, redirection pattern
- 🔴 **FormField Usage** - REQUIRED component wrapper for all inputs/selects/textareas
- **Shared Form Components** - SaveButton, CancelButton, picker components
- **Form Event Handling** - Nested forms and event propagation (e.stopPropagation)
- **Validation** - Dual validation with Zod pattern

**IMPORTANT:** Always include FORMS.md in context when creating or editing forms.

## 🔴 Module Structure (Main Files)
**CRITICAL**: Always follow the wedding module as the reference implementation. Create ALL files that exist in the wedding module.

**Next.js 15 searchParams Pattern:**
In Next.js 15, `searchParams` is now a Promise and must be awaited before accessing its properties.

```tsx
interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const filters = {
    search: params.search,
    status: params.status
  }
  // ... rest of page logic
}
```

1. **List Page (Server)** - `page.tsx`
- Auth check → fetch entities with filters from searchParams → compute stats server-side → define breadcrumbs
- Structure: `BreadcrumbSetter → [Entity]ListClient initialData={entities} stats={stats}`
- **IMPORTANT**: searchParams must be typed as `Promise<{...}>` and awaited before use

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
- **See [FORMS.md](./docs/FORMS.md) for:**
  - isEditing Pattern (how to handle create vs edit mode)
  - Redirection Pattern (where to navigate after submit)
  - FormField usage requirements (REQUIRED for all inputs)
  - Form event handling (nested forms, e.stopPropagation)

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

**For detailed implementation patterns for print pages and export endpoints, see [LITURGICAL_SCRIPT_SYSTEM.md](./docs/LITURGICAL_SCRIPT_SYSTEM.md).**

### 🔴 Constants Pattern (Critical)

**For detailed constants pattern documentation, see [CONSTANTS_PATTERN.md](./docs/CONSTANTS_PATTERN.md).**

**Location:** `src/lib/constants.ts`

The application uses a **dual-constant pattern** for all dropdown values, status fields, and enumerated types:

1. **VALUES array** - Uppercase keys stored in database (e.g., `['ACTIVE', 'INACTIVE', 'COMPLETED']`)
2. **Type definition** - TypeScript type for type safety
3. **LABELS object** - Bilingual display labels (English + Spanish)

**Quick Example:**
```typescript
export const MODULE_STATUS_VALUES = ['ACTIVE', 'INACTIVE', 'COMPLETED'] as const
export type ModuleStatus = typeof MODULE_STATUS_VALUES[number]
export const MODULE_STATUS_LABELS: Record<ModuleStatus, { en: string; es: string }> = {
  ACTIVE: { en: 'Active', es: 'Activo' },
  INACTIVE: { en: 'Inactive', es: 'Inactivo' },
  COMPLETED: { en: 'Completed', es: 'Completado' }
}
```

**Why:** Database consistency, bilingual support, type safety, centralized maintenance.

**See [CONSTANTS_PATTERN.md](./docs/CONSTANTS_PATTERN.md) for full usage examples, standard constant types, and adding new constants.**

### Reusable Module Components

**For complete component documentation, see [COMPONENT_REGISTRY.md](./docs/COMPONENT_REGISTRY.md).**

Key reusable components for module view pages:

- **ModuleViewPanel** - Side panel with Edit button, Print view, PDF/Word downloads, metadata
- **ModuleViewContainer** - Complete view page container with side panel + liturgy content rendering
- **usePickerState Hook** - Standardized state management for picker modals

See COMPONENT_REGISTRY.md for full props, usage examples, and all available components.

### 🔴 Component Registry (CRITICAL)

**ALWAYS consult [COMPONENT_REGISTRY.md](./docs/COMPONENT_REGISTRY.md) before using or creating components.**

The Component Registry contains comprehensive documentation on all reusable components including:
- Picker components (PeoplePicker, EventPicker, LocationPicker)
- Form components (FormField, SaveButton, CancelButton)
- Layout components (PageContainer, ModuleViewPanel, ModuleViewContainer)
- Hooks (usePickerState)

**For picker behavior patterns (auto-select, no redirect), see [PICKER_PATTERNS.md](./docs/PICKER_PATTERNS.md).**

**Content Builders & Renderers:**

**For comprehensive documentation on the liturgical script system, see [LITURGICAL_SCRIPT_SYSTEM.md](./docs/LITURGICAL_SCRIPT_SYSTEM.md).**

Content builders create liturgy document structures that can be rendered in multiple formats. See LITURGICAL_SCRIPT_SYSTEM.md for interfaces, template structure, styling, and export functionality.

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

**For form event handling (nested forms, e.stopPropagation), see [FORMS.md](./docs/FORMS.md).**

### 🔴 Picker Modal Behavior (Critical)

**For detailed picker behavior patterns, see [PICKER_PATTERNS.md](./docs/PICKER_PATTERNS.md).**

**CRITICAL RULE:** When creating entities from picker modals (PeoplePicker, EventPicker), follow this pattern:
1. Save immediately to database
2. Auto-select newly created entity
3. Close modal
4. **NO REDIRECT** - stay on parent form

See PICKER_PATTERNS.md for implementation details, verification checklist, and common mistakes to avoid.

### Performance Patterns
**Server-side filtering:** List pages accept searchParams prop. Pass these to get[Entities]() functions to filter on the server, not the client.
**Parallel data fetching:** Use Promise.all() when fetching multiple independent data sources in server components.
**URL state management:** Client components should update URL search params via router.push() instead of maintaining local filter state. This makes state shareable and linkable.

### Loading and Error States
**Pattern:** Create reusable skeleton and error components in components/ directory. Route-level loading.tsx and error.tsx files import and render these reusable components. This ensures consistent UX across modules.

**For form validation patterns with Zod, see [FORMS.md](./docs/FORMS.md).**

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

**For comprehensive design principles, see [DESIGN_PRINCIPLES.md](./docs/DESIGN_PRINCIPLES.md).**

These core principles guide all development decisions in Outward Sign:

- **Simplicity** - Remove unnecessary complexity, focus on essential workflows
- **Clarity** - No ambiguity about what UI elements do
- **Feedback** - System responds to every user action appropriately
- **Affordances** - Things should look like what they do
- **Recognition over Recall** - Show options, don't require memorization
- **Forgiving Design** - Make actions reversible, handle errors gracefully
- **Progressive Disclosure** - Show basics first, reveal complexity as needed
- **Efficiency** - Minimize clicks, support keyboard navigation
- **Content & Communication** - Clear microcopy, helpful empty states, contextual help
- **Specific Patterns** - Familiarity, proximity, continuity, closure

**When implementing features, ask:** Is this simple? Is it clear? Does it provide feedback? Can users recover from mistakes?

See DESIGN_PRINCIPLES.md for detailed explanations and examples of each principle.

## 🔴 Creating New Modules

**IMPORTANT:** When the user requests creation of a new module (Funerals, Baptisms, Presentations, etc.), you MUST read the [MODULE_CHECKLIST.md](docs/MODULE_CHECKLIST.md) file first to ensure you follow the complete checklist and avoid common mistakes.

**Reference Implementation:** Wedding module (`src/app/(main)/weddings/`)

**Complete Checklist:** See [MODULE_CHECKLIST.md](docs/MODULE_CHECKLIST.md) for the comprehensive step-by-step guide including:
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
