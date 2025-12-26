# CLAUDE.md

> **🔴 GREENFIELD DEVELOPMENT:** Modify original files directly rather than creating backward-compatible implementations. Make breaking changes as needed—we are not concerned with backward compatibility.

## Table of Contents

- [🔴 Required Reading by Task](#-required-reading-by-task)
- [Agent Orchestration](#agent-orchestration)
- [Project Description](#project-description)
- [🔴 Database](#-database)
- [🔴 Git Operations](#-git-operations)
- [Testing & Linting](#testing--linting)
- [🔴 Build Process](#-build-process)
- [Tools](#tools)
- [Tech Stack](#tech-stack)
- [🔴 Architecture](#-architecture)
- [🔴 Styling](#-styling)
- [🔴 Forms](#-forms)
- [🔴 Module Structure](#-module-structure)
- [🔴 Code Conventions](#-code-conventions)
- [🔴 Design Principles](#-design-principles)
- [🔴 Creating New Modules](#-creating-new-modules)
- [Known Issues](#known-issues)

---

## 🔴 Required Reading by Task

**Before ANY code change, consult this table first.** All detailed documentation is in the `docs/` directory.

| Task | Required Reading | Agent |
|------|------------------|-------|
| **Create/edit forms** | [FORMS-CRITICAL.md](./docs/FORMS-CRITICAL.md), [FORMS.md](./docs/FORMS.md) | developer-agent |
| **Create new module** | [MODULE_CHECKLIST.md](./docs/MODULE_CHECKLIST.md), [MODULE-PATTERNS-CRITICAL.md](./docs/MODULE-PATTERNS-CRITICAL.md) | developer-agent |
| **Create/modify list page** | [LIST-VIEW-CRITICAL.md](./docs/LIST-VIEW-CRITICAL.md), [REACT_HOOKS_PATTERNS.md](./docs/REACT_HOOKS_PATTERNS.md) | developer-agent |
| **Work with pickers** | [PICKERS.md](./docs/PICKERS.md) | developer-agent |
| **Database changes** | [DATABASE-CRITICAL.md](./docs/DATABASE-CRITICAL.md), [DATABASE.md](./docs/DATABASE.md) | developer-agent |
| **Write/update tests** | [testing/TESTING.md](./docs/testing/TESTING.md) | test-writer |
| **Run/debug tests** | [testing/TESTING.md](./docs/testing/TESTING.md) | test-runner-debugger |
| **Add form validation** | [FORMS-CRITICAL.md](./docs/FORMS-CRITICAL.md), [VALIDATION.md](./docs/VALIDATION.md) | developer-agent |
| **Style components** | [STYLES-CRITICAL.md](./docs/STYLES-CRITICAL.md), [STYLES.md](./docs/STYLES.md) | developer-agent |
| **Use formatters** | [FORMATTERS.md](./docs/FORMATTERS.md) | developer-agent |
| **Content builders/renderers** | [LITURGICAL_SCRIPT_SYSTEM.md](./docs/LITURGICAL_SCRIPT_SYSTEM.md), [RENDERER.md](./docs/RENDERER.md) | developer-agent |
| **Understand features** | Related module docs | explorer-agent |
| **Refactor code** | [CODE_CONVENTIONS.md](./docs/CODE_CONVENTIONS.md) | refactor-agent |
| **Update /docs/** | [docs/README.md](./docs/README.md) | project-documentation-writer |
| **Create user guides** | [USER_DOCUMENTATION.md](./docs/USER_DOCUMENTATION.md) | user-documentation-writer |
| **Permission checks** | [USER_PERMISSIONS.md](./docs/USER_PERMISSIONS.md) | developer-agent |
| **Event type config** | [EVENT_TYPE_CONFIGURATION.md](./docs/EVENT_TYPE_CONFIGURATION.md) | developer-agent |
| **Use/create components** | [COMPONENT_REGISTRY.md](./docs/COMPONENT_REGISTRY.md) | developer-agent |
| **Use dialogs** | [DIALOGS.md](./docs/DIALOGS.md) | developer-agent |

**New to the project?** Start with [DEFINITIONS.md](./docs/DEFINITIONS.md) for liturgical terminology.

---

## Agent Orchestration

**Detailed workflows:** [AGENT_WORKFLOWS.md](./docs/AGENT_WORKFLOWS.md)

| Agent | Folder | Purpose |
|-------|--------|---------|
| **brainstorming-agent** | `/brainstorming/` | Creative vision capture |
| **devils-advocate-agent** | `/brainstorming/` | Challenge brainstorming |
| **requirements-agent** | `/requirements/` | Requirements analysis |
| **developer-agent** | `/src/` | Feature implementation |
| **test-writer** | `/tests/` | Test creation |
| **test-runner-debugger** | N/A | Test execution & debugging |
| **project-documentation-writer** | `/docs/` | Developer/AI documentation |
| **supervisor-agent** | `/supervisor/` | Codebase health audits |
| **cleanup-agent** | N/A | Safe lint --fix in isolation |
| **user-documentation-writer** | `/src/app/documentation/content/` | End-user guides |
| **explorer-agent** | N/A | Codebase exploration |
| **refactor-agent** | N/A | Code quality improvement |
| **ui-agent** | N/A | Visual quality audits |
| **ux-agent** | N/A | UX understanding audits |
| **wisdom-agent** | N/A | Perspective when stuck |
| **agent-audit-agent** | `/agent-audit-agent/` | Agent ecosystem audits |
| **branch-merge-agent** | N/A | Evaluate and merge Claude branches |

### Quick Decision Guide

- **New feature?** → brainstorming → devils-advocate → requirements → developer → test-writer → test-runner-debugger → project-documentation-writer
- **Bug fix?** → developer (or explorer if complex) → test-writer → test-runner-debugger
- **Understand code?** → explorer-agent
- **Tests failing?** → test-runner-debugger
- **Fix linting?** → cleanup-agent (runs lint --fix safely, in isolation)
- **Health check?** → supervisor-agent → cleanup-agent (lint) or developer-agent (judgment fixes)
- **Deploy?** → qa-specialist → release-agent
- **Stuck?** → wisdom-agent
- **Audit agents/settings?** → agent-audit-agent
- **Merge Claude branches?** → branch-merge-agent

---

## Project Description

**Name:** Outward Sign | **URL:** outwardsign.church

**Purpose:** Sacrament and Sacramental Management Tool for Catholic Parishes

Plan, communicate, and celebrate sacraments (Weddings, Funerals, Baptisms, Quinceanera, etc.) with shared preparation, calendar feeds, and printed scripts/readings.

**User Personas:** [personas/README.md](./docs/personas/README.md)

---

## 🔴 Database

**Full reference:** [DATABASE.md](./docs/DATABASE.md)

**Critical Rules:**
- **NEVER use Supabase MCP** for database changes during development
- All changes via migration files in `supabase/migrations/`
- One table per migration file (plural names: `masses`, `events`, `people`)
- Problems fixed at migration level, never outside migrations

**Workflow:**
1. Create/modify migration files
2. Run `npm run db:fresh` to reset and apply (local dev)
3. `supabase db push` for remote (maintainer only)

**Early Development:** Modify existing migrations rather than creating new files.

---

## 🔴 Git Operations

**Critical Rules:**
- **NEVER use `git add` or `git commit`** - you don't have permission
- Only read-only commands: `git status`, `git log`, `git show`, `git diff`, `git branch`, `git remote`
- Instruct user to run staging/commit commands manually

**Exception - branch-merge-agent:** Has extended git permissions for merging and cleanup:
- `git fetch`, `git checkout`, `git merge`
- `git branch -d`, `git push origin --delete`, `git reset`

---

## Testing & Linting

**Full reference:** [testing/TESTING.md](./docs/testing/TESTING.md)

```bash
npm run test                              # Run all tests
npm run test -- tests/events.spec.ts      # Specific file
npm run test:ui                           # Interactive debugger
npm run lint                              # Check code quality
npm run lint -- --fix                     # Auto-fix issues
```

**Test Limits:** 150 lines/file max, 5 tests/file max, 30 lines/test max

**Selector priority:** `getByRole` → `getByLabel` → `getByTestId`

---

## 🔴 Build Process

When `npm run build` fails:
- Check documentation first—build errors often indicate pattern violations
- Common sources: TypeScript mismatches, import errors, form pattern violations, server/client boundaries
- Fix root cause, not symptoms

---

## Tools

**🔴 Supabase MCP:** DO NOT use for database operations. All changes via migration files.

**🔴 Claude Code Settings:** Configure in `.claude/settings.json` only (committed). DO NOT create `settings.local.json`. See [CLAUDE_CODE_SETTINGS.md](./docs/CLAUDE_CODE_SETTINGS.md).

---

## Tech Stack

- **Frontend:** Next.js 13+ (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (server-side sessions)
- **API:** Server Actions
- **UI:** Radix UI + shadcn/ui + Tailwind CSS
- **Icons:** Lucide React
- **Deployment:** Vercel

---

## 🔴 Architecture

**Full reference:** [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

**Key Points:**
- Parish-scoped multi-tenancy (all records have `parish_id`)
- Tables plural, columns singular, interfaces singular
- Server → Client: Props | Client → Server: Server Actions
- All server pages check auth via `createClient()` and `getUser()`
- RLS policies enforce permissions automatically

**Roles:** Admin (full), Staff (CRUD events), Ministry-Leader (configurable), Parishioner (read-only)

**`requireSelectedParish()` Pattern:**
- Need ID? → `const selectedParishId = await requireSelectedParish()`
- Just validating? → `await requireSelectedParish()`

**Permissions:** [USER_PERMISSIONS.md](./docs/USER_PERMISSIONS.md)

---

## 🔴 Styling

**Full reference:** [STYLES.md](./docs/STYLES.md)

**Critical Rules:**
- **NEVER hardcode colors** (`bg-white`, `text-gray-900`, hex values)
- **ALWAYS pair backgrounds with foregrounds** (`bg-card text-card-foreground`)
- Use semantic tokens: `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`
- No `dark:` utility classes—CSS variables handle dark mode automatically
- Print views (`app/print/`) exempt from these rules

---

## 🔴 Forms

**Full reference:** [FORMS.md](./docs/FORMS.md)

**Critical Rules:**
- ALL inputs must use `FormField` component
- NEVER modify font-family, borders, or backgrounds on inputs
- Unified form pattern handles create/edit via `entity` prop
- Use SaveButton, CancelButton, picker components
- Nested forms require `e.stopPropagation()`
- Dual validation with Zod

---

## 🔴 Module Structure

**Full reference:** [MODULE_COMPONENT_PATTERNS.md](./docs/MODULE_COMPONENT_PATTERNS.md)

**Reference implementation:** `src/app/(main)/masses/`

**The 8 Main Files:**
1. `page.tsx` - List page (server)
2. `[entities]-list-client.tsx` - List client
3. `create/page.tsx` - Create page (server)
4. `[id]/page.tsx` - View page (server)
5. `[id]/edit/page.tsx` - Edit page (server)
6. `[entity]-form-wrapper.tsx` - Form wrapper (client)
7. `[entity]-form.tsx` - Unified form (client)
8. `[id]/[entity]-view-client.tsx` - View client

**Key Patterns:**
- Server pages: no 'use client'
- List client: PLURAL name
- Form detects mode via `entity` prop, redirects to view after save
- Groups module uses different pattern (dialog-based)

---

## 🔴 Code Conventions

**Full reference:** [CODE_CONVENTIONS.md](./docs/CODE_CONVENTIONS.md)

**Critical Rules:**
- 2-space indentation, TypeScript for all new files
- Server Components default, Client only when needed
- Bilingual: all user-facing text needs `en` and `es` (currently hardcoded to `.en`)
- Page titles: `[Dynamic Content]-[Module Name]` (module at end)
- **ALWAYS use formatters** (`formatDatePretty()`, etc.)—never raw date strings
- Person names: use `person.full_name` directly
- NEVER nest clickable elements
- Rule of Three: wait for 3 uses before abstracting

---

## 🔴 Design Principles

**Full reference:** [DESIGN_PRINCIPLES.md](./docs/DESIGN_PRINCIPLES.md)

**Core Principles:** Simplicity, Clarity, Feedback, Affordances

**Questions to ask:** Is this simple? Is it clear? Does it provide feedback? Can users recover from mistakes?

---

## 🔴 Creating New Modules

**Event Types (common):** Created through Settings UI at `/settings/event-types`—no code changes needed.

**New Code Modules (rare):** Only for fundamentally different functionality (Masses, People, Locations, Groups).

**Checklist:** [MODULE_CHECKLIST.md](./docs/MODULE_CHECKLIST.md)

**Steps:**
1. Database Layer - Migration, RLS, types
2. Server Actions - CRUD with `WithRelations`
3. Module Structure - 8 files following masses pattern
4. Components - Use existing pickers
5. Content & Export - Content builder + API routes
6. Constants - Status constants, sidebar navigation

---

## 🔴 Component Directory Rules

- Custom components: anywhere in `src/components/` except `ui/`
- `src/components/ui/` = shadcn/ui (NEVER edit)
- Wrap shadcn components outside `ui/` if customization needed
- **Dialogs:** NEVER import from `ui/dialog` in app code—use `ConfirmationDialog` or `InfoDialog` (see [DIALOGS.md](./docs/DIALOGS.md))

---

## Known Issues

(Document existing bugs or performance concerns here)
