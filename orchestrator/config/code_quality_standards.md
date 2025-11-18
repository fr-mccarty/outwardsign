# Code Quality Standards

These standards apply to all code produced by agents. The orchestrator will check for compliance in end-of-day reports.

## General Code Quality

### TypeScript Standards
- ✅ Use TypeScript for all new files (.ts, .tsx)
- ✅ No `any` types - use proper type definitions or `unknown`
- ✅ Define interfaces for all component props
- ✅ Use const for variables that don't change
- ✅ Prefer functional components over class components
- ✅ Use arrow functions for consistency

### Code Style
- ✅ 2-space indentation (enforced by ESLint)
- ✅ Single quotes for strings (except in JSX)
- ✅ Semicolons at end of statements
- ✅ Trailing commas in objects/arrays
- ✅ No console.log in production code (remove after debugging)
- ✅ Meaningful variable and function names (no single letters except in loops)

### Linting
- ✅ **MUST PASS:** `npm run lint` with zero errors
- ✅ Fix all warnings if possible
- ✅ Do not use eslint-disable comments without good reason
- ✅ If you must disable a rule, add a comment explaining why

## Project-Specific Standards

### Bilingual Implementation
- ✅ All user-facing text has both `en` and `es` properties
- ✅ Use `.en` suffix for now (until language selector is implemented)
- ✅ Never hardcode English-only text in UI components
- ✅ Check existing modules for bilingual patterns

### Formatting & Helpers
- ✅ **ALWAYS use helper functions** - Never format inline
- ✅ Dates: Use `formatDatePretty()`, `formatDateForInput()`, `formatDateLong()`
- ✅ Names: Use `formatPersonName()` or `formatPersonNameReverse()`
- ✅ Page titles: Use module-specific `get{Module}PageTitle()` functions
- ✅ Never display raw date strings like "2025-07-15"
- ✅ Import helpers from `src/lib/formatters.ts`

### Dark Mode Support
- ✅ Use semantic CSS variables from theme system
- ✅ **NEVER hardcode colors:** No `bg-white`, `text-gray-900`, hex codes
- ✅ **ALWAYS pair backgrounds:** `bg-card text-card-foreground`
- ✅ Use Tailwind theme tokens: `bg-background`, `text-foreground`, `bg-muted`
- ✅ Test in both light and dark mode if possible

### Form Standards
- ✅ Use `FormField` component for ALL inputs, selects, textareas
- ✅ Use `SaveButton` and `CancelButton` from shared components
- ✅ Use unified form pattern (one component handles create and edit)
- ✅ Implement dual validation (Zod schema + server-side)
- ✅ **NEVER modify input styles** (font-family, borders, background)
- ✅ Use `event.stopPropagation()` for nested interactive elements
- ✅ All inputs must have proper `<Label>` with `htmlFor`

### Component Structure
- ✅ Server Components by default (no 'use client')
- ✅ Client Components only when needed (interactivity, hooks, context)
- ✅ Keep server/client boundary clean (serialize data when passing to client)
- ✅ Follow module structure (9 main files pattern)
- ✅ Use existing shared components before creating new ones

### Accessibility
- ✅ All form inputs have associated labels
- ✅ Use semantic HTML (button, nav, main, article, section)
- ✅ Keyboard navigation works (tab, enter, escape)
- ✅ Focus states visible
- ✅ ARIA labels for icon-only buttons
- ✅ Proper heading hierarchy (h1, h2, h3)

### Database & Migrations
- ✅ One table per migration file
- ✅ Plural table names (weddings, baptisms, funerals)
- ✅ Include `parish_id` in all tables
- ✅ RLS policies for all roles (admin, staff, ministry-leader, parishioner)
- ✅ Proper foreign key constraints
- ✅ Indexes on foreign keys and frequently queried columns
- ✅ Migration naming: timestamp within current date to +30 days

### Testing
- ✅ All code changes include tests (unless pure documentation)
- ✅ Use role-based selectors first (`getByRole`)
- ✅ Then labels (`getByLabel`)
- ✅ Then test IDs (`getByTestId`)
- ✅ No hardcoded waits - use Playwright's auto-waiting
- ✅ Tests are independent (can run in any order)
- ✅ Use Page Object Model for modules with multiple tests
- ✅ Don't test for toast messages - test navigation instead

## Documentation Standards

### Documentation Files
- ✅ Clear headings and table of contents for long docs
- ✅ Code examples included (not just prose)
- ✅ Cross-references to related documentation
- ✅ Update registry files (MODULE_REGISTRY.md, COMPONENT_REGISTRY.md)
- ✅ Proper markdown formatting (use prettier if available)

### Code Comments
- ✅ Add comments for complex logic
- ✅ Explain WHY, not WHAT (code shows what, comments explain why)
- ✅ JSDoc comments for public functions
- ✅ No commented-out code (delete it, git has history)

### Commit Messages (for review)
Even though agents don't commit, provide suggested commit messages:
- ✅ Clear, concise summary (50 chars or less)
- ✅ Detailed description if needed
- ✅ Reference issue or task ID
- ✅ Use conventional commits format: `feat:`, `fix:`, `docs:`, `test:`

## Performance

### General Performance
- ✅ Avoid unnecessary re-renders (use React.memo sparingly)
- ✅ Minimize client-side JavaScript
- ✅ Prefer server components when possible
- ✅ Don't fetch data in loops (use batch queries)
- ✅ Use appropriate indexes in database queries

### Database Queries
- ✅ Use `WithRelations` pattern for fetching related data
- ✅ Select only needed columns (not `SELECT *` unless necessary)
- ✅ Add filters at database level (not in JavaScript)
- ✅ Use pagination for large result sets
- ✅ Avoid N+1 queries (use joins or batch fetches)

## Security

### General Security
- ✅ Never expose sensitive data in client components
- ✅ Validate all user input (both client and server)
- ✅ Use server actions for all mutations
- ✅ RLS policies handle authorization (don't check auth in code)
- ✅ Sanitize user input before displaying (prevent XSS)

### Authentication
- ✅ All server pages check auth via `createClient()` and `getUser()`
- ✅ Redirect to login if not authenticated
- ✅ Use RLS policies for row-level permissions
- ✅ Never bypass RLS in application code

## Anti-Patterns to Avoid

### React Anti-Patterns
- ❌ Modifying props directly
- ❌ Using indexes as keys in lists (unless list is static)
- ❌ Calling hooks conditionally
- ❌ Excessive prop drilling (use context or composition)
- ❌ Nesting clickable elements (button in card, link in button)

### Code Anti-Patterns
- ❌ Magic numbers (use named constants)
- ❌ Deep nesting (>3 levels of if/else)
- ❌ Long functions (>50 lines should be split)
- ❌ Copying and pasting code (abstract after 3rd use)
- ❌ Premature optimization (Rule of Three)

### Database Anti-Patterns
- ❌ Missing indexes on foreign keys
- ❌ Missing RLS policies
- ❌ Overly permissive policies (e.g., public read on sensitive data)
- ❌ Singular table names
- ❌ Multiple tables in one migration

## Quality Checklist

Before marking a task as complete, verify:

### For All Code Tasks
- [ ] No linting errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run build` would pass)
- [ ] All imports are used (no unused imports)
- [ ] No console.log statements left in code
- [ ] Proper TypeScript types (no `any`)
- [ ] Dark mode compatible (semantic color tokens only)

### For Features/Implementations
- [ ] Tests written and passing
- [ ] Follows project conventions (bilingual, formatters, etc.)
- [ ] Accessibility checked (labels, keyboard nav)
- [ ] Works in both create and edit modes (if applicable)
- [ ] No hardcoded data (use constants or database)

### For Forms
- [ ] Uses FormField component
- [ ] Uses SaveButton and CancelButton
- [ ] Validation works (client and server)
- [ ] Redirects correctly after save
- [ ] All inputs have labels

### For Documentation
- [ ] Clear structure with headings
- [ ] Code examples included
- [ ] Cross-references added
- [ ] Registry files updated
- [ ] No spelling errors

### For Database Changes
- [ ] Migration file created (not executed)
- [ ] RLS policies included
- [ ] Proper indexes
- [ ] Foreign key constraints
- [ ] One table per migration

### For Tests
- [ ] Tests pass locally
- [ ] Use proper selectors (role > label > test ID)
- [ ] Independent tests (can run in any order)
- [ ] Page Object Model if multiple test files
- [ ] Clear test descriptions

## Severity Levels

### Critical (Must Fix)
- Linting errors
- TypeScript errors
- Security vulnerabilities
- Breaking existing functionality
- Missing RLS policies
- Hardcoded secrets or credentials

### High (Should Fix)
- Missing tests for code changes
- Accessibility issues
- Missing error handling
- Performance issues (N+1 queries, etc.)
- Dark mode incompatibility

### Medium (Nice to Fix)
- Missing code comments
- Suboptimal code structure
- Minor style inconsistencies
- Unused variables or imports

### Low (Optional)
- Additional code examples in docs
- More detailed comments
- Minor optimizations
- Additional test coverage

## Automated Checks (Future)

The orchestrator will eventually automate these checks:

1. **Linting:** Run `npm run lint` automatically
2. **Type checking:** Run `tsc --noEmit` to verify types
3. **Tests:** Run `npm test` for relevant modules
4. **File naming:** Verify naming conventions
5. **Import analysis:** Check for unused imports
6. **Token usage:** Flag hardcoded colors (bg-white, etc.)
7. **Accessibility:** Basic checks (labels, ARIA)

For now, agents must self-check against these standards.
