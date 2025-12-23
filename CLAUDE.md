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

- [🔴 Agent Orchestration](#-agent-orchestration)
- [🔴 Documentation Context Rules (CRITICAL)](#-documentation-context-rules-critical)
- [📚 Detailed Documentation](#-detailed-documentation)
- [Project Description](#project-description)
- [📖 User Personas](#-user-personas)
- [🔴 Database](#-database)
- [Testing](#testing)
- [Linting](#linting)
- [🔴 Build Process](#-build-process)
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

## 🔴 Agent Orchestration

**For detailed workflows, decision trees, and integration patterns, see [AGENT_WORKFLOWS.md](./docs/AGENT_WORKFLOWS.md)**

This project uses specialized AI agents for different development tasks. Using the right agent ensures consistency, quality, and efficiency.

### Agent Quick Reference

| Agent | Folder | Purpose | Primary Use Cases |
|-------|--------|---------|-------------------|
| **brainstorming-agent** | `/brainstorming/` | Creative vision capture | User requests new feature, explore ideas |
| **devils-advocate-agent** | `/brainstorming/` | Challenge brainstorming | Find holes, ambiguities, edge cases before requirements |
| **requirements-agent** | `/requirements/` | Requirements analysis | Expand vision with technical details |
| **developer-agent** | `/src/` | Feature implementation | Coding based on requirements |
| **test-writer** | `/tests/` | Test creation | Implementation complete, needs tests |
| **test-runner-debugger** | N/A (read-only) | Test execution & debugging | Running tests or fixing test failures |
| **project-documentation-writer** | `/docs/` | Developer/AI documentation | Update technical docs after implementation |
| **code-review-agent** | N/A (read-only) | Code review before commit | Development complete, ready for review |
| **user-documentation-writer** | `/src/app/documentation/content/` | End-user guides | Create bilingual user documentation (optional) |
| **release-agent** | `/releases/` | Production deployment | Deploy to staging/production |
| **explorer-agent** | N/A | Codebase exploration | "How does X work?" or pattern discovery |
| **refactor-agent** | N/A | Code quality improvement | Eliminate duplication, improve performance |
| **qa-specialist** | N/A | Non-functional testing | Performance, accessibility, security audits |
| **ui-agent** | N/A (read-only) | UI visual quality audits | Visual consistency, styling patterns, layout review |
| **ux-agent** | N/A (read-only) | UX understanding audits | Language clarity, labels, descriptions, navigation, ordering |
| **wisdom-agent** | N/A (read-only) | Perspective and encouragement | Feeling stuck, overwhelmed, need advice or grounding |
| **supervisor-agent** | `/supervisor/` | Codebase health audits | Comprehensive audits, pre-release checks, cleanup scanning |

### Quick Decision Guide

- **New feature?** → brainstorming-agent → devils-advocate-agent → requirements-agent → developer-agent → test-writer → test-runner-debugger → project-documentation-writer → code-review-agent → [optional: user-documentation-writer]
- **Challenge brainstorming?** → devils-advocate-agent (find holes, ambiguities, edge cases)
- **Bug fix?** → developer-agent (or explorer-agent if complex) → test-runner-debugger → code-review-agent
- **Understand code?** → explorer-agent
- **Tests failing?** → test-runner-debugger
- **Improve quality?** → explorer-agent → refactor-agent → code-review-agent
- **Deploy?** → qa-specialist → code-review-agent → release-agent
- **Update /docs/?** → project-documentation-writer
- **Create user guides?** → user-documentation-writer
- **UI review?** → ui-agent (visual styling, spacing, colors, layout patterns)
- **UX review?** → ux-agent (language clarity, labels, descriptions, navigation, ordering)
- **Stuck or overwhelmed?** → wisdom-agent (step back, get perspective, find clarity)
- **Health check/audit?** → supervisor-agent (comprehensive codebase audit, cleanup scanning, security checks)

**Rule of Thumb:** Use the most specialized agent for each task. See [AGENT_WORKFLOWS.md](./docs/AGENT_WORKFLOWS.md) for detailed workflows and hand-off patterns.

### Folder Ownership

Each agent owns a specific folder where it creates and manages files:

- **`/brainstorming/`** - brainstorming-agent creates initial visions; devils-advocate-agent reviews and moves files to `/requirements/`
- **`/requirements/`** - requirements-agent expands vision documents with technical specifications
- **`/src/`** - developer-agent implements features and fixes bugs
- **`/tests/`** - test-writer creates test files
- **`/docs/`** - project-documentation-writer maintains technical documentation for developers/AI agents
- **`/src/app/documentation/content/`** - user-documentation-writer creates bilingual end-user guides
- **`/releases/`** - release-agent creates deployment logs and release notes (audit trail)
- **`/supervisor/`** - supervisor-agent writes codebase health reports

**Read-only agents** (no folder ownership): test-runner-debugger, code-review-agent, explorer-agent, refactor-agent, qa-specialist, ui-agent, ux-agent, wisdom-agent

---

## 🔴 Documentation Context Rules (CRITICAL)

**AI Agent: Before performing ANY of these tasks, you MUST read the specified documentation. Failure to read required documentation will result in code that violates established patterns and will need to be rewritten.**

### 🔴 Documentation Contract (MANDATORY)

**Before ANY code change, you MUST:**

1. **State which documentation you consulted** - Name the specific file(s)
2. **Quote the specific rule/pattern you're following** - Reference line numbers or section headings
3. **Explain how your implementation matches that pattern** - Show the connection

**Example of valid response:**
```
Per FORMS-CRITICAL.md (Rule #1 - FormField Component): "ALL form inputs must use FormField component"

I'm implementing this by wrapping the Input component in FormField:
<FormField control={form.control} name="bride_name" ... />

This matches the required pattern shown in the documentation.
```

**Responses without this contract will be considered incomplete and must be revised.**

---

### Required Reading by Task

| When you are asked to... | You MUST read these files FIRST | Agent to Use |
|---------------------------|----------------------------------|--------------|
| **Create or edit ANY form component** | 🔴 [FORMS-CRITICAL.md](./docs/FORMS-CRITICAL.md) - Critical form rules (auto-injected)<br>📖 [FORMS.md](./docs/FORMS.md) - Complete reference | developer-agent |
| **Create a new module** | 🔴 [MODULE_CHECKLIST.md](./docs/MODULE_CHECKLIST.md) - Complete step-by-step checklist<br>🔴 [MODULE-PATTERNS-CRITICAL.md](./docs/MODULE-PATTERNS-CRITICAL.md) - Critical patterns (auto-injected)<br>📖 [MODULE_COMPONENT_PATTERNS.md](./docs/MODULE_COMPONENT_PATTERNS.md) - Complete reference | brainstorming-agent → requirements-agent → developer-agent |
| **Create or modify a list page** | 🔴 [LIST-VIEW-CRITICAL.md](./docs/LIST-VIEW-CRITICAL.md) - Critical list patterns (auto-injected)<br>📖 [LIST_VIEW_PATTERN.md](./docs/LIST_VIEW_PATTERN.md) - Complete reference<br>🔴 [REACT_HOOKS_PATTERNS.md](./docs/REACT_HOOKS_PATTERNS.md) - Prevent re-render loops | developer-agent |
| **Work with any picker component** | 🔴 [PICKERS.md](./docs/PICKERS.md) - Navigation hub (see pickers/ subdirectory) | developer-agent |
| **Create or modify database schema** | 🔴 [DATABASE-CRITICAL.md](./docs/DATABASE-CRITICAL.md) - Critical migration rules (auto-injected)<br>📖 [DATABASE.md](./docs/DATABASE.md) - Complete reference | developer-agent |
| **Write or update tests** | 🔴 [testing/TESTING.md](./docs/testing/TESTING.md) - Limits, patterns, anti-patterns | test-writer |
| **Run or debug tests** | 🔴 [testing/TESTING.md](./docs/testing/TESTING.md) - Commands, debugging | test-runner-debugger |
| **Implement module component structure** | 🔴 [MODULE-PATTERNS-CRITICAL.md](./docs/MODULE-PATTERNS-CRITICAL.md) - Critical patterns (auto-injected)<br>📖 [MODULE_COMPONENT_PATTERNS.md](./docs/MODULE_COMPONENT_PATTERNS.md) - Complete reference | developer-agent |
| **Add validation to forms** | 🔴 [FORMS-CRITICAL.md](./docs/FORMS-CRITICAL.md) - Critical form rules (auto-injected)<br>📖 [VALIDATION.md](./docs/VALIDATION.md) - React Hook Form + Zod patterns | developer-agent |
| **Style components or pages** | 🔴 [STYLES-CRITICAL.md](./docs/STYLES-CRITICAL.md) - Critical styling rules (auto-injected)<br>📖 [STYLES.md](./docs/STYLES.md) - Complete reference | developer-agent |
| **Use helper/formatter functions** | 🔴 [FORMATTERS.md](./docs/FORMATTERS.md) - Date, name, location, page title formatters | developer-agent |
| **Create content builders/renderers** | 🔴 [LITURGICAL_SCRIPT_SYSTEM.md](./docs/LITURGICAL_SCRIPT_SYSTEM.md)<br>🔴 [CONTENT_BUILDER_SECTIONS.md](./docs/CONTENT_BUILDER_SECTIONS.md)<br>🔴 [RENDERER.md](./docs/RENDERER.md) | developer-agent |
| **Understand how a feature works** | 🔴 Related module/component docs | explorer-agent |
| **Refactor or improve code quality** | 🔴 [CODE_CONVENTIONS.md](./docs/CODE_CONVENTIONS.md) | refactor-agent |
| **Update /docs/ technical documentation** | 🔴 [docs/README.md](./docs/README.md) - Documentation standards | project-documentation-writer |
| **Create end-user guides** | 🔴 [USER_DOCUMENTATION.md](./docs/USER_DOCUMENTATION.md) - User guide system | user-documentation-writer |
| **Deploy to production** | 🔴 [DATABASE.md](./docs/DATABASE.md) - Migration safety | release-agent |
| **Quality assurance testing** | 🔴 [TESTING_ARCHITECTURE.md](./docs/TESTING_ARCHITECTURE.md)<br>🔴 [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | qa-specialist |
| **Codebase health check/audit** | 🔴 [CLAUDE.md](./CLAUDE.md) - Project patterns<br>🔴 [AGENT_WORKFLOWS.md](./docs/AGENT_WORKFLOWS.md) - Agent inventory | supervisor-agent |
| **Implement or modify permission checks** | 🔴 [USER_PERMISSIONS.md](./docs/USER_PERMISSIONS.md) - Role-based access control and permission enforcement | developer-agent |

### How to Use This Table

1. **Before starting ANY task**, check this table
2. **Read ALL required files** for that task type
3. **Only then** begin implementation
4. **If unsure**, read the documentation anyway - it's faster than rewriting code

### Why This Matters

- **Saves time**: Following patterns from the start prevents rewrites
- **Maintains consistency**: Ensures all code follows established patterns
- **Prevents bugs**: Documentation contains critical rules that prevent common mistakes
- **Improves quality**: Patterns in docs have been refined through real implementation

---

## 📚 Detailed Documentation

> **📋 Documentation Types:**
> - **Developer/AI Documentation** (this file and `docs/` directory) - Technical documentation for AI agents and developers building and maintaining the application. Includes architecture patterns, API references, implementation guidelines, and internal system documentation.
> - **User Documentation** (`src/app/documentation/content/`) - Public-facing, bilingual end-user guides, tutorials, and help content for parish staff and administrators using Outward Sign. Located at `/documentation` route in the application.

> **📝 Documentation Best Practice:**
> - **Do not repeat code snippets that are already in the project** - Reference existing code with file paths and line numbers instead of duplicating code in documentation. This prevents documentation from becoming outdated when code changes.

**The `docs/` directory contains comprehensive, in-depth developer/AI documentation on specialized topics.**

When you need detailed information on forms, styling, components, modules, testing, liturgical calendar system, or other specific topics, search the `docs/` directory. Files are named descriptively to make them easy to discover.

**New to the project?** Start with [DEFINITIONS.md](./docs/DEFINITIONS.md) to understand liturgical terminology (reader, presider, sacraments vs sacramentals) used throughout the application.

**Key Documentation Files:**
- **[DEFINITIONS.md](./docs/DEFINITIONS.md)** - Liturgical and application terminology (reader, presider, sacraments vs sacramentals, event types)
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Data architecture, data flow patterns, authentication, component communication, performance
- **[USER_PERMISSIONS.md](./docs/USER_PERMISSIONS.md)** - 🔴 CRITICAL - Role-based access control (Admin, Staff, Ministry-Leader, Parishioner), permission enforcement patterns, implementation guide
- **[LIST_VIEW_PATTERN.md](./docs/LIST_VIEW_PATTERN.md)** - 🔴 CRITICAL - Complete pattern for list pages (server + client) with SearchCard, DataTable, ContentCard, ListStatsBar
- **[REACT_HOOKS_PATTERNS.md](./docs/REACT_HOOKS_PATTERNS.md)** - 🔴 CRITICAL - React hook dependency array patterns to prevent infinite re-render loops (useListFilters)
- **[DATABASE.md](./docs/DATABASE.md)** - Database management procedures (resets, seeding, liturgical calendar imports, troubleshooting)
- **[CODE_CONVENTIONS.md](./docs/CODE_CONVENTIONS.md)** - Navigation hub for coding standards (split into code-conventions/ subdirectory with GENERAL, BILINGUAL, UI_PATTERNS, FORMATTING, DEVELOPMENT)
- **[LANGUAGE.md](./docs/LANGUAGE.md)** - Language system documentation (liturgical language vs UI language, database schema, constants)
- **[MODULE_REGISTRY.md](./docs/MODULE_REGISTRY.md)** - Complete module registry with routes, labels, and internationalization
- **[MODULE_COMPONENT_PATTERNS.md](./docs/MODULE_COMPONENT_PATTERNS.md)** - Navigation hub for module patterns (split into module-patterns/ subdirectory with list-page, create-edit, form-view, best-practices)
- **[MODULE_DEVELOPMENT.md](./docs/MODULE_DEVELOPMENT.md)** - File naming, directory structure, constants pattern, reusable components, content builders, type patterns
- **[COMPONENT_REGISTRY.md](./docs/COMPONENT_REGISTRY.md)** - Navigation hub for component library (split into COMPONENTS_FORM, COMPONENTS_PICKER_WRAPPERS, COMPONENTS_LAYOUT, COMPONENTS_DISPLAY, COMPONENTS_DATA_TABLE, COMPONENTS_CALENDAR, COMPONENTS_WIZARD, COMPONENTS_UI)
- **[FORMS.md](./docs/FORMS.md)** - 🔴 CRITICAL - Form patterns, validation, styling, and component usage guidelines
- **[FORMATTERS.md](./docs/FORMATTERS.md)** - Navigation hub for formatters (split into formatters/ subdirectory with DATE_FUNCTIONS, ENTITY_FUNCTIONS, GENERATORS, CREATING_HELPERS)
- **[LINTING.md](./docs/LINTING.md)** - ESLint configuration, usage, common issues, and best practices
- **[CONSOLE_HELPERS.md](./docs/CONSOLE_HELPERS.md)** - Standardized console logging utilities (logSuccess, logWarning, logError, logInfo)
- **[TAG_SYSTEM.md](./docs/TAG_SYSTEM.md)** - Polymorphic tag system for content categorization and filtering (category_tags, tag_assignments)
- **[SEEDERS_REFERENCE.md](./docs/SEEDERS_REFERENCE.md)** - Complete reference for TypeScript seeders (onboarding + dev seeders, execution order, data created)
- **[LITURGICAL_CALENDAR.md](./docs/LITURGICAL_CALENDAR.md)** - Liturgical calendar API integration, import scripts, and database structure
- **[LITURGICAL_SCRIPT_SYSTEM.md](./docs/LITURGICAL_SCRIPT_SYSTEM.md)** - Navigation hub for liturgical script system (split into liturgical-script-system/ subdirectory with OVERVIEW, WITHRELATIONS, TEMPLATES, PRINT_EXPORT, VIEW_INTEGRATION)
- **[TEMPLATE_REGISTRY.md](./docs/TEMPLATE_REGISTRY.md)** - Complete registry of all 19 liturgical script templates across all 7 modules with IDs, names, descriptions, and file locations
- **[CONTENT_BUILDER_STRUCTURE.md](./docs/CONTENT_BUILDER_STRUCTURE.md)** - Standard liturgical script structure (Cover Page, Reading, Psalm, Petitions, Announcements, Ceremony) with page break rules
- **[CONTENT_BUILDER_SECTIONS.md](./docs/CONTENT_BUILDER_SECTIONS.md)** - Navigation hub for content builder sections (split into content-builder-sections/ subdirectory with OVERVIEW, SECTION_INTERFACES, SHARED_BUILDERS, CUSTOM_SECTIONS, PAGE_BREAKS, TEMPLATE_EXAMPLE, BEST_PRACTICES)
- **[REPORT_BUILDER_SYSTEM.md](./docs/REPORT_BUILDER_SYSTEM.md)** - Report builder system for tabular reports with aggregations, filtering, and CSV/Print exports
- **[RENDERER.md](./docs/RENDERER.md)** - Complete renderer system documentation (HTML, PDF, Word) with style resolution and conversion patterns
- **[EXPORT_BUTTONS.md](./docs/EXPORT_BUTTONS.md)** - Standard pattern for export buttons (PDF, Word, Text) in module view pages
- **[PAGINATION.md](./docs/PAGINATION.md)** - ⚠️ Pagination patterns, implementation guide, and current inconsistencies across modules
- **[DRAG_AND_DROP.md](./docs/DRAG_AND_DROP.md)** - Drag-and-drop implementation with @dnd-kit, unique constraint handling, and reorder patterns
- **[USER_DOCUMENTATION.md](./docs/USER_DOCUMENTATION.md)** - User documentation system structure, adding pages, sidebar navigation, breadcrumbs, and multi-language support
- **[GROUP_MEMBERS.md](./docs/GROUP_MEMBERS.md)** - Group members module for managing people in groups with roles (person-centric view, no scheduling)
- **[PERMISSION_ENFORCEMENT_SUMMARY.md](./docs/PERMISSION_ENFORCEMENT_SUMMARY.md)** - Complete permission enforcement implementation (server actions, role permissions, UI enforcement patterns)
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

**Reference File:** [personas/README.md](./docs/personas/README.md)

When implementing features or evaluating the application, refer to the personas file to ensure the design, functionality, and user experience align with the needs of priests, deacons, pastoral associates, liturgical directors, parish staff, and parishioners.

## 🔴 Database

> **🔴 When performing database operations, you MUST read [DATABASE.md](./docs/DATABASE.md)** - Database resets, seeding, liturgical calendar imports, and troubleshooting.

**🔴 CRITICAL - Database Changes:**
- For making database changes, a migration file should first be created
- **NEVER use the Supabase MCP server to make database changes** during development
- All database operations must go through migration files for proper version control

**Migration Workflow:**
1. Create or modify migration files in `supabase/migrations/`
2. For **local development**: Tell the user to run `npm run db:fresh` to reset and apply all migrations
3. For **pushing to remote** (maintainer only): `supabase db push` - **DO NOT use this for local development**
4. Confirm at the end of your message when a new migration has been created

**Important Notes:**
- Problems and policies need to be fixed at the migration level
- Never try to fix a policy, table, or function outside of a migration
- The backend accesses the database at Supabase using the Authenticated policy
- The frontend uses the Anon policy

**Migration Strategy (Early Development):**
During initial development, modify existing migrations instead of creating new migration files. When database changes are needed, update the relevant existing migration, then prompt the user to run `npm run db:fresh` to reset the database and re-run all migrations from scratch.

**Migration File Structure:**
- **One table per migration file** - Each migration file should create or modify only ONE table
- Module tables should be named in **plural form** (e.g., `masses`, `events`, `people`, `locations`)
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

**🔴 All testing documentation:** See [testing/TESTING.md](./docs/testing/TESTING.md)

```bash
npm run test                              # Run all tests
npm run test -- tests/events.spec.ts      # Run specific file
npm run test:ui                           # Interactive debugger
```

**Key Limits:**
- **150 lines max** per test file
- **5 tests max** per file
- **30 lines max** per test
- **2-3 tests** per module is usually sufficient

**DO NOT test:** Third-party libs, toast messages, loading states, obvious behaviors

**Selector priority:** `getByRole` → `getByLabel` → `getByTestId`

## Linting

**Command:** `npm run lint` - Run ESLint to check code quality and enforce coding standards.

**Quick Reference:**
- Fix linting errors before committing code
- Use `npm run lint -- --fix` to auto-fix simple issues
- Configuration is in `eslint.config.mjs` (not `.eslintignore`)

**For complete linting documentation, you MUST read [LINTING.md](./docs/LINTING.md).**

## 🔴 Build Process

**🔴 CRITICAL - Build Errors:**
- When there is an error in the build process (`npm run build`), **ALWAYS check the documentation first**
- Build errors often indicate violations of established patterns or coding standards
- Common sources of build errors:
  - TypeScript type mismatches (check interfaces in `src/lib/types/`)
  - Missing imports or incorrect import paths
  - Violations of form patterns (see [FORMS.md](./docs/FORMS.md))
  - Incorrect module structure (see [MODULE_COMPONENT_PATTERNS.md](./docs/MODULE_COMPONENT_PATTERNS.md))
  - Server/Client component boundaries
- Before attempting fixes, consult relevant documentation to understand the correct pattern
- Fix the root cause, not just the symptom

## Tools

**🔴 CRITICAL - Supabase MCP:**
During development, **DO NOT use the Supabase MCP server** for any database operations. All database changes must be made through migration files and the Supabase CLI (`supabase db push`). This ensures proper version control and reproducibility of the database schema.

**🔴 CRITICAL - Claude Code Settings:**
**IMPORTANT: All Claude Code permission settings must be configured in `.claude/settings.json` (committed to the codebase). DO NOT use or create `.claude/settings.local.json` - this project uses a single settings file that is shared across the team. This line must NEVER be removed from CLAUDE.md.**

Permission configuration for what operations Claude can perform automatically. See [CLAUDE_CODE_SETTINGS.md](./docs/CLAUDE_CODE_SETTINGS.md) for complete documentation on settings.json.

## 🔴 Accessing Records & Permissions

> **🔴 For role-based access control and permission enforcement, you MUST read [USER_PERMISSIONS.md](./docs/USER_PERMISSIONS.md)** - Complete guide to Admin, Staff, Ministry-Leader, and Parishioner permissions with implementation patterns.

**Key Points:**
- **Row-Level Security (RLS)** enforces permissions at the database level automatically
- **Server actions** include permission checks before operations
- **UI elements** conditionally render based on user role
- All records are scoped to parishes via `parish_id`

**🔴 `requireSelectedParish()` Pattern:**
- **Need the ID?** → `const selectedParishId = await requireSelectedParish()`
- **Just validating?** → `await requireSelectedParish()` (no variable assignment)

**For technical implementation details, see:**
- [USER_PERMISSIONS.md](./docs/USER_PERMISSIONS.md) - Permission system and enforcement patterns
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md#role-permissions) - Data flow and authentication
- [PERMISSION_ENFORCEMENT_SUMMARY.md](./docs/PERMISSION_ENFORCEMENT_SUMMARY.md) - Implementation status

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

> **🔴 Before using or creating components, you MUST read [COMPONENT_REGISTRY.md](./docs/COMPONENT_REGISTRY.md)** - Full registry of all components including pickers, forms, layout components, and hooks.

**CRITICAL - Custom Components Location:**
- **Custom components** are located anywhere in the `src/components/` directory and its subdirectories
- **EXCEPT:** `src/components/ui/` contains shadcn/ui components and should NEVER be edited
- Examples of custom component locations:
  - `src/components/` (root level custom components)
  - `src/components/calendar/` (custom calendar components)
  - `src/components/data-table/` (custom data table components)
  - `src/components/wizard/` (custom wizard components)
  - Any other subdirectory in `src/components/` except `ui/`
- If a shadcn component needs customization, create a wrapper component outside of `src/components/ui/`
- Exception: Initial setup/installation of shadcn components is allowed, but not subsequent modifications

## 📖 Architecture

**🔴 For comprehensive architecture documentation, you MUST read [ARCHITECTURE.md](./docs/ARCHITECTURE.md).**

### Quick Reference

**Data Architecture:**
- Parish-scoped multi-tenancy (all records have `parish_id`)
- Naming: Tables plural, columns singular, interfaces singular
- React state variables match database column names (singular)

**Role Permissions:**
- Admin: Full access to all modules and parish management
- Staff: CRUD access to all event modules
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

**🔴 When styling components or pages, you MUST read [STYLES.md](./docs/STYLES.md)** - Dark mode support, semantic tokens, and critical styling rules.

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

**🔴 When creating or editing forms, you MUST read [FORMS.md](./docs/FORMS.md)** - Critical form patterns, validation, styling, and FormField usage requirements.

This includes:
- 🔴 **Form Input Styling** - Critical rules for styling form inputs (NEVER modify font-family, borders, or backgrounds)
- 🔴 **Form Component Structure** - Unified form pattern, isEditing pattern, redirection pattern
- 🔴 **FormField Usage** - REQUIRED all-in-one component for all inputs/selects/textareas
- **Shared Form Components** - SaveButton, CancelButton, picker components
- **Form Event Handling** - Nested forms and event propagation (e.stopPropagation)
- **Validation** - Dual validation with Zod pattern

**IMPORTANT:** Always include FORMS.md in context when creating or editing forms.

## 🔴 Module Structure (Main Files)
**CRITICAL**: Always follow the masses module (`src/app/(main)/masses/`) as the reference implementation for the standard 8-file module structure.

**🔴 When implementing module components, you MUST read [MODULE_COMPONENT_PATTERNS.md](./docs/MODULE_COMPONENT_PATTERNS.md)** - Authoritative patterns for all 8 module files with code examples.

**Note on Groups Module:** The Groups module uses a different architecture pattern (dialog-based forms) rather than the standard 8-file structure. Groups is designed for managing collections of people (ministry groups, choirs, etc.) and uses inline editing with dialogs instead of separate create/edit pages.

### The 8 Main Files

Every module consists of 8 component files following a consistent pattern:

1. **List Page (Server)** - `page.tsx` - Fetches entities with filters, passes to client
2. **List Client** - `[entities]-list-client.tsx` - Search/filter UI, entity grid
3. **Create Page (Server)** - `create/page.tsx` - Auth + breadcrumbs for create
4. **View Page (Server)** - `[id]/page.tsx` - Fetches entity with relations for view
5. **Edit Page (Server)** - `[id]/edit/page.tsx` - Fetches entity with relations for edit
6. **Form Wrapper (Client)** - `[entity]-form-wrapper.tsx` - PageContainer for form
7. **Unified Form (Client)** - `[entity]-form.tsx` - Handles create and edit modes
8. **View Client** - `[id]/[entity]-view-client.tsx` - Displays entity + actions via ModuleViewContainer

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
- List client file: PLURAL name (`masses-list-client.tsx`)
- Form wrapper: Shows action buttons in edit mode only
- Unified form: Detects mode via `entity` prop, redirects to view page after save
- View client: Integrates ModuleViewPanel + renders liturgy content
- Form actions: Copy Info, Edit, Delete with confirmation dialog

**See [MODULE_COMPONENT_PATTERNS.md](./docs/MODULE_COMPONENT_PATTERNS.md) for complete implementation details, code examples, and patterns for each file.**

## 📖 Module Development

**🔴 For module development patterns (constants, components, content builders), you MUST read [MODULE_DEVELOPMENT.md](./docs/MODULE_DEVELOPMENT.md).**

Module development includes file naming conventions, directory structure, reusable components, content builders, and type patterns. The MODULE_DEVELOPMENT.md file provides:
- Complete directory structures for main modules, print views, and API routes
- 🔴 **Constants Pattern** - Dual-constant pattern for dropdowns and status fields
- 🔴 **Component Registry** - Always consult before using or creating components
- **Content Builders** - Liturgical script system for document generation
- **Report Builders** - Tabular reports with aggregations and filtering
- **WithRelations Pattern** - Type-safe entity fetching with related data

## 📖 Code Conventions

**🔴 For coding standards and conventions, you MUST read [CODE_CONVENTIONS.md](./docs/CODE_CONVENTIONS.md)** - Bilingual implementation, page title formatting, UI patterns, and helper utilities.

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
- **Person names:** Use `person.full_name` directly (database-generated field, no helper needed)
- Use `formatDatePretty()`, `getMassPageTitle()`, `getEventPageTitle()`, etc.
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

**🔴 When implementing features, you MUST read [DESIGN_PRINCIPLES.md](./docs/DESIGN_PRINCIPLES.md)** - Core principles that guide all development decisions (simplicity, clarity, feedback, affordances).

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

## 🔴 Creating New Event Types vs New Modules

**Event Types (Most Common):** Sacraments and parish events (Weddings, Funerals, Baptisms, Bible Study, etc.) are created as **Event Types** through the Settings UI - no code changes needed. Event Types are configured with custom fields, scripts, and templates through `/settings/event-types`.

**New Code Modules:** Only create new code modules for fundamentally different functionality (like Masses, People, Locations, Groups). These are rare.

**Reference Implementation:** Masses module (`src/app/(main)/masses/`)

**Complete Checklist:** See [MODULE_CHECKLIST.md](docs/MODULE_CHECKLIST.md) for the comprehensive step-by-step guide including:
- Detailed phase-by-phase checklist (Database → Server Actions → Module Structure → Print/Export → Testing)
- Common mistakes to avoid
- Validation checklist
- Module icons reference

**Quick Reference:** When creating a new code module, follow these major steps:
1. Database Layer - Migration, RLS policies, base types
2. Server Actions - CRUD operations with `WithRelations` interface
3. Module Structure - 8 main files + 1 print page (follow masses pattern)
4. Reusable Components - Use existing pickers and shared components
5. Content & Export - Content builder + API routes for PDF/Word
6. Constants - Status constants and sidebar navigation

## Known Issues
(Document any existing bugs or performance concerns here)
