# Permissions & Automation Guidelines

> **Note:** For comprehensive Claude Code permission configuration details, see [CLAUDE_CODE_SETTINGS.md](./CLAUDE_CODE_SETTINGS.md).

This document defines what Claude Code is allowed to do autonomously and what requires explicit user permission.

---

## 🔴 Strictly Prohibited (Never Allowed)

### Database Operations
- **Direct database changes via Supabase MCP** - Never allowed (must use migrations)
- **Running `supabase db push`** - Never allowed (maintainer only)
- **Deleting migrations** - Never allowed

**Rationale:** Database changes must go through migration files for version control and reproducibility.

### Environment & Secrets
- **Reading `.env` files** - Never allowed
- **Reading `.env.local`, `.env.production`, etc.** - Never allowed
- **Accessing credentials or API keys** - Never allowed

**Rationale:** Prevent exposure of sensitive credentials.

---

## ⚠️ Requires Explicit Permission

### Database Operations
- **Creating new migration files** - Requires permission
- **Modifying existing migrations** - Requires permission (allowed during early development)
- **Creating/modifying RLS policies** - Requires permission (in migration files)
- **Running `npm run db:fresh`** - Requires permission

**Note:** During early development, modifying existing migrations is allowed, but always requires explicit user approval.

### File Operations
- **Creating new components** - Requires permission
- **Creating new pages/routes** - Requires permission
- **Modifying existing files** - Requires permission
- **Deleting files** - Requires permission
- **Renaming files** - Requires permission

**Rationale:** All code changes should be reviewed before being applied.

### Package Management
- **Installing packages (npm/pnpm)** - Requires permission
- **Updating dependencies** - Requires permission
- **Modifying package.json** - Requires permission

**Rationale:** Package changes can affect the entire project and should be intentional.

---

## ✅ Allowed Without Permission

### Reading Operations
- **Reading any file** - Allowed (except `.env` files)
- **Searching code (Grep/Glob)** - Allowed
- **Viewing git status** - Allowed
- **Viewing git diff** - Allowed
- **Viewing git log** - Allowed
- **Viewing git show** - Allowed
- **Viewing git branch** - Allowed
- **Viewing git remote** - Allowed

**Rationale:** Read-only operations are safe and necessary for understanding the codebase.

### Build & Test Operations
- **Running `npm run build`** - Allowed
- **Running `npm run lint`** - Allowed
- **Running `npm test`** - Allowed
- **Running `npm run test:setup`** - Allowed
- **Running Playwright tests** - Allowed
- **Viewing test reports** - Allowed
- **Running TypeScript compiler checks** - Allowed

**Rationale:** These are safe, non-destructive operations that developers run frequently during development.

### File System Navigation
- **ls, find, tree** - Allowed
- **pwd, basename, dirname** - Allowed
- **du, stat, which** - Allowed

### Data Processing
- **grep, cat, head, tail** - Allowed
- **diff, wc, file** - Allowed
- **sort, uniq, cut, tr, awk, jq** - Allowed
- **xargs** - Allowed

### Web Operations
- **WebFetch** - Allowed for trusted domains only:
  - github.com
  - www.npmjs.com
  - raw.githubusercontent.com
  - code.claude.com
  - docx.js.org
- **WebSearch** - Allowed

### Tool Operations
- **Launching Task agents** - Allowed
- **Using specialized agents** (Explore, Plan, etc.) - Allowed

### Development
- **Code suggestions and explanations** - Allowed
- **Answering questions about codebase** - Allowed
- **Documentation lookups** - Allowed

### Code Corrections
- **Changing parameters to match implementation** - Allowed
  - When a function signature, prop type, or interface doesn't match its actual implementation, the agent is permitted to update the parameter/type definition to match the working implementation
  - Example: If a function is implemented to accept `(id: string, data: UpdateData)` but the type signature says `(id: number)`, update the signature to match reality
  - This ensures type safety and code correctness without requiring explicit permission for each correction

---

## Special Cases

### Supabase MCP Operations
**During development:** DO NOT use Supabase MCP for any database operations. All database changes must go through migration files.

**In production/maintenance:** Supabase MCP may be used for:
- Read-only queries (troubleshooting)
- Security advisor checks
- Log analysis

**Never allowed via MCP:**
- Schema modifications
- Direct data modifications (INSERT/UPDATE/DELETE)
- Policy changes

### Migration Strategy (Early Development)
During initial greenfield development:
- **Modifying existing migrations** - Allowed (with permission)
- After modification, user must run `npm run db:fresh` to apply changes

Once in production:
- **Creating new migrations only** - Existing migrations are immutable

---

## Permission Configuration

Permissions are configured in `.claude/settings.json` (team settings) and `.claude/settings.local.json` (personal overrides).

**See [CLAUDE_CODE_SETTINGS.md](./CLAUDE_CODE_SETTINGS.md) for:**
- Complete permission configuration reference
- How to add/modify allowed commands
- Personal override instructions
- Troubleshooting permission issues

---

## Notes

- **Default stance:** Any operation not explicitly listed as "Allowed" requires user permission
- **Security first:** When in doubt, ask for permission
- **Greenfield development:** More permissive during early development, stricter as project matures
- **Team alignment:** Settings can be adjusted based on team workflow preferences

---

**Last Updated:** 2025-11-22
