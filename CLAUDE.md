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
- [Linting](#linting)
- [Tools](#tools)
- [🔴 Accessing Records](#-accessing-records)
- [Tech Stack](#tech-stack)
- [📖 Architecture](#-architecture)
- [📖 Styling](#-styling)
- [🔴 Forms](#-forms)
- [🔴 Module Structure (Main Files)](#-module-structure-main-files)
- [📖 Module Development](#-module-development)
- [📖 Code Conventions](#-code-conventions)
- [🔴 Design Principles](#-design-principles)
- [🔴 Creating New Modules](#-creating-new-modules)
- [Known Issues](#known-issues)

---

## 📚 Detailed Documentation

> **📋 Documentation Types:**
> - **Developer/AI Documentation** (this file and `docs/` directory) - Technical documentation for AI agents and developers building and maintaining the application. Includes architecture patterns, API references, implementation guidelines, and internal system documentation.
> - **User Documentation** (`src/app/documentation/content/`) - Public-facing, bilingual end-user guides, tutorials, and help content for parish staff and administrators using Outward Sign. Located at `/documentation` route in the application.

**The `docs/` directory contains comprehensive, in-depth developer/AI documentation on specialized topics.**

When you need detailed information on forms, styling, components, modules, testing, liturgical calendar system, or other specific topics, search the `docs/` directory. Files are named descriptively to make them easy to discover.

**New to the project?** Start with [DEFINITIONS.md](./docs/DEFINITIONS.md) to understand liturgical terminology (reader, presider, sacraments vs sacramentals) used throughout the application.

**Key Documentation Files:**
- **[DEFINITIONS.md](./docs/DEFINITIONS.md)** - Liturgical and application terminology (reader, presider, sacraments vs sacramentals, event types)
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Data architecture, data flow patterns, authentication, role permissions, component communication, performance
- **[CODE_CONVENTIONS.md](./docs/CODE_CONVENTIONS.md)** - Coding standards including bilingual implementation, page title formatting, UI patterns, helper utilities
- **[MODULE_REGISTRY.md](./docs/MODULE_REGISTRY.md)** - Complete module registry with routes, labels, and internationalization
- **[MODULE_COMPONENT_PATTERNS.md](./docs/MODULE_COMPONENT_PATTERNS.md)** - Detailed implementation patterns for all 9 module component files with code examples
- **[MODULE_DEVELOPMENT.md](./docs/MODULE_DEVELOPMENT.md)** - File naming, directory structure, constants pattern, reusable components, content builders, type patterns
- **[COMPONENT_REGISTRY.md](./docs/COMPONENT_REGISTRY.md)** - Complete component library reference (pickers, forms, layout components, hooks)
- **[FORMS.md](./docs/FORMS.md)** - 🔴 CRITICAL - Form patterns, validation, styling, and component usage guidelines
- **[FORMATTERS.md](./docs/FORMATTERS.md)** - Helper and formatting functions (dates, names, locations, page titles, filenames)
- **[LINTING.md](./docs/LINTING.md)** - ESLint configuration, usage, common issues, and best practices
- **[LITURGICAL_CALENDAR.md](./docs/LITURGICAL_CALENDAR.md)** - Liturgical calendar API integration, import scripts, and database structure
- **[LITURGICAL_SCRIPT_SYSTEM.md](./docs/LITURGICAL_SCRIPT_SYSTEM.md)** - Liturgical script system for individual entity documents (weddings, funerals, etc.) with template builders and exports
- **[TEMPLATE_REGISTRY.md](./docs/TEMPLATE_REGISTRY.md)** - Complete registry of all 19 liturgical script templates across all 7 modules with IDs, names, descriptions, and file locations
- **[CONTENT_BUILDER_STRUCTURE.md](./docs/CONTENT_BUILDER_STRUCTURE.md)** - Standard liturgical script structure (Cover Page, Reading, Psalm, Petitions, Announcements, Ceremony) with page break rules
- **[CONTENT_BUILDER_SECTIONS.md](./docs/CONTENT_BUILDER_SECTIONS.md)** - Content builder section types with strict interfaces and shared builders
- **[REPORT_BUILDER_SYSTEM.md](./docs/REPORT_BUILDER_SYSTEM.md)** - Report builder system for tabular reports with aggregations, filtering, and CSV/Print exports
- **[RENDERER.md](./docs/RENDERER.md)** - Complete renderer system documentation (HTML, PDF, Word) with style resolution and conversion patterns
- **[PAGINATION.md](./docs/PAGINATION.md)** - ⚠️ Pagination patterns, implementation guide, and current inconsistencies across modules
- **[USER_DOCUMENTATION.md](./docs/USER_DOCUMENTATION.md)** - User documentation system structure, adding pages, sidebar navigation, breadcrumbs, and multi-language support
- **[GROUP_MEMBER_DIRECTORY.md](./docs/GROUP_MEMBER_DIRECTORY.md)** - Group member directory module for managing people in groups with roles (person-centric view, no scheduling)
- **[CLAUDE_CODE_SETTINGS.md](./docs/CLAUDE_CODE_SETTINGS.md)** - Claude Code permission configuration (settings.json and settings.local.json)

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

**🔴 CRITICAL - Database Changes:**
- For making database changes, a migration file should first be created
- **NEVER use the Supabase MCP server to make database changes** during development
- All database operations must go through migration files for proper version control

**Migration Workflow:**
1. Create or modify migration files in `supabase/migrations/`
2. Tell the user to push to remote using: `supabase db push`
3. Confirm at the end of your message when a new migration has been created
4. Ensure the user has run the push command before moving on

**Important Notes:**
- Problems and policies need to be fixed at the migration level
- Never try to fix a policy, table, or function outside of a migration
- The backend accesses the database at Supabase using the Authenticated policy
- The frontend uses the Anon policy

**Migration Strategy (Early Development):**
During initial development, modify existing migrations instead of creating new migration files. When database changes are needed, update the relevant existing migration, then prompt the user to run `npm run db:fresh` to reset the database and re-run all migrations from scratch.

**Migration File Structure:**
- **One table per migration file** - Each migration file should create or modify only ONE table
- Module tables should be named in **plural form** (e.g., `weddings`, `funerals`, `baptisms`)
- Keep migrations focused and atomic for better version control and rollback capability
- **Migration file naming timestamp** - When creating new migration files, use a timestamp within the range of the current date to current date plus 30 days. This ensures migrations are properly ordered and prevents timestamp conflicts.

## 🔴 Git Operations

**🔴 CRITICAL - Git Permissions:**
- **NEVER use `git add` or `git commit` commands directly**
- You do NOT have permission to stage files or create commits
- You may ONLY use read-only git commands: `git status`, `git log`, `git show`, `git diff`, `git branch`, `git remote`
- When files need to be added to git, instruct the user to run the commands manually
- Example: "Please run: `git add file1.txt file2.txt`"

## Testing

**For quick setup and running tests:** See [TESTING_QUICKSTART.md](./docs/TESTING_QUICKSTART.md)

**For AI agents writing tests:** See [TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) - Comprehensive guide including authentication patterns, file structure, writing tests, Page Object Model, debugging techniques, and command reference.

**For testability standards and code review:** See [TESTING_ARCHITECTURE.md](./docs/TESTING_ARCHITECTURE.md) - Component testability patterns, selector strategies, test ID conventions, accessibility requirements, and anti-patterns to avoid.

**For complete test inventory:** See [TESTING_REGISTRY.md](./docs/TESTING_REGISTRY.md) - Complete registry of all tests organized by module with one-sentence descriptions.

**Key Points:**
- Tests are pre-authenticated automatically - no manual auth setup needed in test files
- Use role-based selectors first (`getByRole`), then labels (`getByLabel`), then test IDs (`getByTestId`)
- All form inputs must have proper `<Label>` with `htmlFor` for testability
- Add `data-testid` to complex components (pickers, dynamic lists, cards with entity IDs)
- Follow Page Object Model for modules with multiple tests
- Do not test for toast messages after successful form submissions - test navigation instead

## Linting

**Command:** `npm run lint` - Run ESLint to check code quality and enforce coding standards.

**Quick Reference:**
- Fix linting errors before committing code
- Use `npm run lint -- --fix` to auto-fix simple issues
- Configuration is in `eslint.config.mjs` (not `.eslintignore`)

**For complete linting documentation, see [LINTING.md](./docs/LINTING.md).**

## Tools

**🔴 CRITICAL - Supabase MCP:**
During development, **DO NOT use the Supabase MCP server** for any database operations. All database changes must be made through migration files and the Supabase CLI (`supabase db push`). This ensures proper version control and reproducibility of the database schema.

**Claude Code Settings:**
Permission configuration for what operations Claude can perform automatically. See [CLAUDE_CODE_SETTINGS.md](./docs/CLAUDE_CODE_SETTINGS.md) for complete documentation on settings.json and settings.local.json.

## 🔴 Accessing Records
The ideal way that we want to access the records is by using the RLS feature on Supabase, so that we don't have to check for a user every time we make a request to Supabase.

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

## 🔴 Component Directory Rules

**CRITICAL - Do NOT Edit shadcn/ui Components:**
- **NEVER edit files in `src/components/ui/`** - These are shadcn/ui components and should remain unchanged
- Only edit components in:
  - `src/components/` (root level custom components)
  - Custom subdirectories within `src/components/` (e.g., `calendar/`, `data-table/`, `wizard/`)
- If a shadcn component needs customization, create a wrapper component in the root `src/components/` directory
- Exception: Initial setup/installation of shadcn components is allowed, but not subsequent modifications

## 📖 Architecture

**For comprehensive architecture documentation, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md).**

### Quick Reference

**Data Architecture:**
- Parish-scoped multi-tenancy (all records have `parish_id`)
- Naming: Tables plural, columns singular, interfaces singular
- React state variables match database column names (singular)

**Role Permissions:**
- Admin: Full access to all modules and parish management
- Staff: CRUD access to all sacrament/event modules
- Ministry-Leader: Configurable per-module access
- Parishioner: Read-only access to shared modules

**Data Flow:**
- Server → Client: Props (serializable data)
- Client → Server: Server Actions
- WithRelations pattern for fetching entities with related data

**Authentication:**
- All server pages check auth via `createClient()` and `getUser()`
- RLS policies enforce permissions automatically

**See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for complete details on data flow patterns, server actions, component communication, performance optimization, and breadcrumbs.**

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
- 🔴 **FormField Usage** - REQUIRED all-in-one component for all inputs/selects/textareas
- **Shared Form Components** - SaveButton, CancelButton, picker components
- **Form Event Handling** - Nested forms and event propagation (e.stopPropagation)
- **Validation** - Dual validation with Zod pattern

**IMPORTANT:** Always include FORMS.md in context when creating or editing forms.

## 🔴 Module Structure (Main Files)
**CRITICAL**: Always follow the wedding module as the reference implementation. Create ALL files that exist in the wedding module.

**For detailed implementation patterns, see [MODULE_COMPONENT_PATTERNS.md](./docs/MODULE_COMPONENT_PATTERNS.md).**

**Note on Groups Module:** The Groups module uses a different architecture pattern (dialog-based forms) rather than the standard 9-file structure. Groups is designed for managing collections of people (ministry groups, choirs, etc.) and uses inline editing with dialogs instead of separate create/edit pages. For new sacrament/sacramental modules, always follow the standard 9-file pattern.

### The 9 Main Files

Every module consists of 9 component files following a consistent pattern:

1. **List Page (Server)** - `page.tsx` - Fetches entities with filters, passes to client
2. **List Client** - `[entities]-list-client.tsx` - Search/filter UI, entity grid
3. **Create Page (Server)** - `create/page.tsx` - Auth + breadcrumbs for create
4. **View Page (Server)** - `[id]/page.tsx` - Fetches entity with relations for view
5. **Edit Page (Server)** - `[id]/edit/page.tsx` - Fetches entity with relations for edit
6. **Form Wrapper (Client)** - `[entity]-form-wrapper.tsx` - PageContainer + action buttons
7. **Unified Form (Client)** - `[entity]-form.tsx` - Handles create and edit modes
8. **View Client** - `[id]/[entity]-view-client.tsx` - Displays entity + liturgy content
9. **Form Actions (Client)** - `[id]/[entity]-form-actions.tsx` - Copy/Edit/Delete buttons

### Quick Reference

**Next.js 15 searchParams Pattern:**
```tsx
interface PageProps {
  searchParams: Promise<{ search?: string; status?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams  // Must await in Next.js 15
  const filters = { search: params.search, status: params.status }
  // ...
}
```

**Key Patterns:**
- All server pages: `page.tsx` (no 'use client')
- List client file: PLURAL name (`weddings-list-client.tsx`)
- Form wrapper: Shows action buttons in edit mode only
- Unified form: Detects mode via `entity` prop, redirects to view page after save
- View client: Integrates ModuleViewPanel + renders liturgy content
- Form actions: Copy Info, Edit, Delete with confirmation dialog

**See [MODULE_COMPONENT_PATTERNS.md](./docs/MODULE_COMPONENT_PATTERNS.md) for complete implementation details, code examples, and patterns for each file.**

## 📖 Module Development

**For complete module development documentation, see [MODULE_DEVELOPMENT.md](./docs/MODULE_DEVELOPMENT.md).**

Module development includes file naming conventions, directory structure, reusable components, content builders, and type patterns. The MODULE_DEVELOPMENT.md file provides:
- Complete directory structures for main modules, print views, and API routes
- 🔴 **Constants Pattern** - Dual-constant pattern for dropdowns and status fields
- 🔴 **Component Registry** - Always consult before using or creating components
- **Content Builders** - Liturgical script system for document generation
- **Report Builders** - Tabular reports with aggregations and filtering
- **WithRelations Pattern** - Type-safe entity fetching with related data

## 📖 Code Conventions

**For comprehensive coding standards, see [CODE_CONVENTIONS.md](./docs/CODE_CONVENTIONS.md).**

### Quick Reference

**General:**
- Indentation: 2 spaces
- Language: TypeScript for all new files
- Component type: Server Components by default, Client Components only when needed
- Task storage: Use `/tasks` directory (not `/todos`)

**🔴 Bilingual Implementation (CRITICAL):**
- Most content is bilingual (English & Spanish)
- All user-facing text must have both `en` and `es` translations
- Currently hard-coded to `.en` (temporary until language selector is implemented)

**🔴 Page Title Formatting (CRITICAL):**
- Format: `[Dynamic Content]-[Module Name]`
- Module name ALWAYS at the end
- Examples: `"Smith-Jones-Wedding"`, `"John Doe-Funeral"`, `"Wedding"` (fallback)

**🔴 Helper Utilities (CRITICAL):**
- **ALWAYS use helper functions** for formatting (never inline)
- **ALWAYS format dates** - never display raw date strings like "2025-07-15"
- Use `formatDatePretty()`, `formatPersonName()`, `getWeddingPageTitle()`, etc.
- See [FORMATTERS.md](./docs/FORMATTERS.md) for complete reference

**UI Patterns:**
- Use shadcn components, not system dialogs
- Empty states must have a "Create New" button
- **NEVER nest clickable elements** (button inside card, link inside button)
- Modals should be scrollable with fixed header/footer

**Abstraction Principle (Rule of Three):**
- Wait for 3 uses before abstracting
- Copy-paste acceptable for 1-2 uses
- At 3 uses, refactor to remove duplication

**See [CODE_CONVENTIONS.md](./docs/CODE_CONVENTIONS.md) for complete details on all coding standards, patterns, and examples.**

## 🔴 Design Principles

**For comprehensive design principles, see [DESIGN_PRINCIPLES.md](./docs/DESIGN_PRINCIPLES.md).**

These core principles guide all development decisions in Outward Sign:

- **Simplicity** - Remove unnecessary complexity, focus on essential workflows
- **Clarity** - No ambiguity about what UI elements do
- **Feedback** - System responds to every user action appropriately
- **Affordances** - Things should look like what they do
- **Click Hierarchy** - Never nest clickable elements inside other clickable elements
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
