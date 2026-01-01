# CLAUDE.md

> **GREENFIELD DEVELOPMENT:** Modify original files directly. Make breaking changes as needed—we are not concerned with backward compatibility.

## Table of Contents

- [Decision Framework](#decision-framework)
- [Required Reading by Task](#required-reading-by-task)
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Critical Rules](#critical-rules)
- [Known Issues](#known-issues)

---

## Decision Framework

You are a capable developer. Make decisions confidently when the path is clear. Escalate only when genuinely uncertain or when the risk is high.

### Decision Tree

When you encounter a choice, work through these questions in order:

**1. Is this a destructive or irreversible action?**
- Deleting data, tables, or files → **STOP and ASK**
- Modifying production environment → **STOP and ASK**
- Changing authentication/RLS logic → **STOP and ASK**
- If none of these → Continue to question 2

**2. Does an existing pattern in the codebase cover this?**
- Yes, clear pattern exists → **PROCEED** and follow it
- Pattern exists but doesn't quite fit → **PROCEED** and note the deviation
- No pattern exists → Continue to question 3

**3. Is this additive or modifying?**
- Additive (new file, new function, new component) → **PROCEED**
- Modifying existing code → Continue to question 4

**4. Is the modification low-risk?**
- Bug fix with clear expected behavior → **PROCEED**
- Refactor that doesn't change behavior → **PROCEED**
- Changes data structures or relationships → **STOP and ASK**
- Changes affect multiple parts of the app → **STOP and ASK**

**5. Are there multiple valid approaches?**
- One obvious best approach → **PROCEED** with it
- Multiple approaches with unclear trade-offs → **STOP and ASK**
- Multiple approaches but one matches existing patterns → **PROCEED** with that one

### Always PROCEED Without Asking

- Creating new files
- Writing new functions that don't modify existing ones
- Adding new database columns (not removing or renaming)
- Installing npm packages for stated requirements
- Running tests (`npm run test`)
- Running builds (`npm run build`)
- Running lint (`npm run lint`)
- Updating TypeScript types to match schema changes
- Fixing lint errors or type errors
- Following established patterns in the codebase
- **Restarting the dev server after code changes** - always restart `npm run dev` after making changes so the user can test immediately

### Always STOP and ASK

- Pushing to main/production branch
- Deleting tables, columns, or files
- Changing environment variables
- Modifying auth, RLS policies, or security logic
- When the task contradicts what you're finding in the code
- When you discover the task is significantly larger than described
- When tests fail and you're unsure why
- **Modifying `src/components/ui/`** - these are shadcn/ui vendor components; create custom components elsewhere instead

### After Acting Independently, Report

When you complete significant work without asking, include a brief summary:

**Decisions Made:**
- What approaches you chose and why
- Any patterns you established that weren't there before
- Deviations from what you expected

**Dependencies Added:**
- Any new npm packages and why

**Questions for Later:**
- Non-blocking items that might need discussion
- Potential improvements you noticed but didn't implement

---

## Required Reading by Task

**Before ANY code change, consult this table first.** All detailed documentation is in the `docs/` directory.

| Task | Required Reading |
|------|------------------|
| **Create/edit forms** | [FORMS-CRITICAL.md](./docs/FORMS-CRITICAL.md), [FORMS.md](./docs/FORMS.md) |
| **Create new module** | [MODULE_CHECKLIST.md](./docs/MODULE_CHECKLIST.md), [MODULE-PATTERNS-CRITICAL.md](./docs/MODULE-PATTERNS-CRITICAL.md) |
| **Create/modify list page** | [LIST-VIEW-CRITICAL.md](./docs/LIST-VIEW-CRITICAL.md), [REACT_HOOKS_PATTERNS.md](./docs/REACT_HOOKS_PATTERNS.md) |
| **Work with pickers** | [PICKERS.md](./docs/PICKERS.md) |
| **Database changes** | [DATABASE-CRITICAL.md](./docs/DATABASE-CRITICAL.md), [DATABASE.md](./docs/DATABASE.md) |
| **Write/run tests** | [testing/TESTING.md](./docs/testing/TESTING.md) |
| **Add form validation** | [FORMS-CRITICAL.md](./docs/FORMS-CRITICAL.md), [VALIDATION.md](./docs/VALIDATION.md) |
| **Style components** | [STYLES-CRITICAL.md](./docs/STYLES-CRITICAL.md), [STYLES.md](./docs/STYLES.md) |
| **Use formatters** | [FORMATTERS.md](./docs/FORMATTERS.md) |
| **Content builders/renderers** | [LITURGICAL_SCRIPT_SYSTEM.md](./docs/LITURGICAL_SCRIPT_SYSTEM.md), [RENDERER.md](./docs/RENDERER.md) |
| **Permission checks** | [USER_PERMISSIONS.md](./docs/USER_PERMISSIONS.md) |
| **Event type config** | [EVENT_TYPE_CONFIGURATION.md](./docs/EVENT_TYPE_CONFIGURATION.md) |
| **Mass configuration** | [MASS_CONFIGURATION.md](./docs/MASS_CONFIGURATION.md) |
| **Use/create components** | [COMPONENT_REGISTRY.md](./docs/COMPONENT_REGISTRY.md) |
| **Use dialogs** | [DIALOGS.md](./docs/DIALOGS.md) |

**New to the project?** Start with [DEFINITIONS.md](./docs/DEFINITIONS.md) for liturgical terminology.

---

## Project Description

**Name:** Outward Sign | **URL:** outwardsign.church

**Purpose:** Sacrament and Sacramental Management Tool for Catholic Parishes

Plan, communicate, and celebrate sacraments (Weddings, Funerals, Baptisms, Quinceanera, etc.) with shared preparation, calendar feeds, and printed scripts/readings.

**User Personas:** [personas/README.md](./docs/personas/README.md)

---

## Tech Stack

- **Frontend:** Next.js 15+ (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (server-side sessions)
- **API:** Server Actions
- **UI:** Radix UI + shadcn/ui + Tailwind CSS
- **Icons:** Lucide React
- **Deployment:** Vercel

---

## Critical Rules

These are project-specific constraints that override general patterns.

### Database

**Full reference:** [DATABASE.md](./docs/DATABASE.md)

- **NEVER use Supabase MCP** for database changes
- All changes via migration files in `supabase/migrations/`
- One table per migration file (plural names: `masses`, `events`, `people`)
- Run `npm run db:fresh -- -y` to reset database and seed dev data (the `-y` flag skips confirmation)

### Git Operations

- **Git commits and pushes allowed** when the user explicitly requests it
- Follow the standard commit process: check status, diff, recent commits for style, then commit
- Use conventional commit messages with clear descriptions
- Always include the Claude Code attribution footer in commits
- **NEVER force push** or use destructive git commands without explicit permission

### Build Process

When `npm run build` fails:
- Check documentation first—build errors often indicate pattern violations
- Fix root cause, not symptoms

**Next.js 15:** `params` and `searchParams` must be awaited:
```typescript
const { id } = await params;
const query = await searchParams;
```

### Dev Server Management

You can manage the dev server using background shells:

```bash
# Start server in background
rm -rf ./.next && npm run dev  # (with run_in_background: true)

# Restart: KillShell the old task, then start fresh
```

**When to restart:**
- After `npm run db:fresh -- -y`
- After modifying `next.config.js` or environment files
- After installing new packages
- When the server crashes or gets stuck

**Note:** Hot reload handles most code changes—only restart when necessary.

### Styling

- **NEVER hardcode colors** (`bg-white`, `text-gray-900`, hex values)
- **ALWAYS pair backgrounds with foregrounds** (`bg-card text-card-foreground`)
- Use semantic tokens: `bg-background`, `text-foreground`, `bg-muted`
- No `dark:` utility classes—CSS variables handle dark mode
- Print views (`app/print/`) exempt from these rules

### Forms

- ALL inputs must use project form components (see FORMS.md)
- NEVER modify font-family, borders, or backgrounds on inputs
- Unified form pattern handles create/edit via `entity` prop
- Use SaveButton, CancelButton, picker components

### Architecture

- Parish-scoped multi-tenancy (all records have `parish_id`)
- Tables plural, columns singular, interfaces singular
- Server → Client: Props | Client → Server: Server Actions
- RLS policies enforce permissions automatically

**Roles:** Admin (full), Staff (CRUD events), Ministry-Leader (configurable), Parishioner (read-only)

### Module Structure

**Reference implementation:** `src/app/(main)/masses/`

**The 8 Main Files:**
1. `page.tsx` - List page (server)
2. `[entities]-list-client.tsx` - List client (PLURAL name)
3. `create/page.tsx` - Create page (server)
4. `[id]/page.tsx` - View page (server)
5. `[id]/edit/page.tsx` - Edit page (server)
6. `[entity]-form-wrapper.tsx` - Form wrapper (client)
7. `[entity]-form.tsx` - Unified form (client)
8. `[id]/[entity]-view-client.tsx` - View client

### Code Conventions

- 2-space indentation, TypeScript for all new files
- Server Components default, Client only when needed
- Bilingual: user-facing text needs `en` and `es`
- **ALWAYS use formatters** (`formatDatePretty()`, etc.)—never raw date strings
- NEVER nest clickable elements
- Rule of Three: wait for 3 uses before abstracting

### Component Rules

- Custom components: anywhere in `src/components/` except `ui/`
- `src/components/ui/` = shadcn/ui (NEVER edit)
- **Dialogs:** NEVER import from `ui/dialog`—use `ConfirmationDialog` or `InfoDialog`

---

## Specialized Agents

For complex tasks that benefit from isolated context, these agents are available:

| Agent | Use For |
|-------|---------|
| `explorer-agent` | Understanding code, finding patterns, answering "how does X work?" |
| `test-writer` | Writing new tests (reads testing docs automatically) |
| `test-runner-debugger` | Running tests and debugging failures |
| `branch-merge-agent` | Evaluating and merging claude/* branches |
| `developer-agent` | Complex multi-file implementations |

Use agents when the task benefits from a fresh context window. For most work, proceed directly.

---

## Known Issues

(Document existing bugs or performance concerns here)
