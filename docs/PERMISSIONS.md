# Permissions & Automation Guidelines

This document defines what Claude Code is allowed to do autonomously and what requires explicit user permission.

## 🔴 Strictly Prohibited (Never Allowed)

### Git Operations
- **Creating commits** - Never allowed
- **Adding files to git staging** - Never allowed
- **Pushing to remote** - TBD
- **Force pushing** - TBD
- **Creating/deleting branches** - TBD
- **Merging branches** - TBD
- **Creating pull requests** - TBD

### Database Operations
- **Direct database changes via Supabase MCP** - Never allowed (must use migrations)
- **Running `supabase db push`** - TBD
- **Resetting database** - TBD
- **Modifying existing migrations** - TBD

## ⚠️ Requires Explicit Permission

### Database Operations
- **Creating new migration files** - Requires permission
- **Modifying schema** - TBD
- **Creating/modifying RLS policies** - TBD

### Supabase MCP Operations
- **Query/Select operations** - TBD
- **Insert/Update/Delete operations** - TBD
- **Getting logs** - TBD
- **Running security advisors** - TBD

### File Operations
- **Creating new components** - TBD
- **Creating new pages/routes** - TBD
- **Modifying existing files** - TBD
- **Deleting files** - TBD

### Build & Deploy
- **Running build commands** - TBD
- **Running tests** - TBD
- **Installing packages (npm/pnpm)** - TBD
- **Updating dependencies** - TBD

### Tool Usage
- **WebSearch** - TBD
- **WebFetch** - TBD
- **Launching Task agents** - TBD

## ✅ Allowed Without Permission

### Reading Operations
- **Reading files** - Allowed
- **Searching code (Grep/Glob)** - Allowed
- **Viewing git status/diff** - Allowed

### Supabase MCP
- **Query/Select operations** (read-only) - TBD
- **Checking for security/performance advisors** - TBD

### Development
- **Code suggestions and explanations** - Allowed
- **Answering questions about codebase** - Allowed

### Code Corrections
- **Changing parameters to match implementation** - Allowed
  - When a function signature, prop type, or interface doesn't match its actual implementation, the agent is permitted to update the parameter/type definition to match the working implementation
  - Example: If a function is implemented to accept `(id: string, data: UpdateData)` but is called as `(id: string, data: UpdateData)` and the type signature says `(id: number)`, update the signature to match reality
  - This ensures type safety and code correctness without requiring explicit permission for each correction

---

## Notes
- Any operation not explicitly listed here should be treated as "Requires Permission"
- These permissions can be adjusted as we learn what works best for your workflow
