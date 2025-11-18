# Task Execution Patterns

Standard patterns for common task types. Agents should follow these proven approaches.

## Pattern: Documentation Task

**When:** Creating or updating documentation files in docs/

**Steps:**
1. Read existing related documentation for style and structure
2. Check MODULE_REGISTRY.md or COMPONENT_REGISTRY.md for proper cross-references
3. Write documentation with clear headings, examples, and code snippets
4. Include both overview and detailed sections
5. Add cross-references to related docs
6. Update any registry files if adding new modules/components
7. Spell-check (use IDE or manual review)

**Context Files Needed:**
- CLAUDE.md
- CODE_CONVENTIONS.md
- Related docs in docs/ directory

**Quality Checks:**
- [ ] Clear headings and table of contents
- [ ] Code examples included
- [ ] Cross-references to related docs
- [ ] Registry files updated (if applicable)
- [ ] Proper markdown formatting

**Common Mistakes:**
- Missing code examples
- Not updating registry files
- Inconsistent terminology with other docs
- Too abstract without concrete examples

**Estimated Time:** 1-2 hours for medium complexity docs

---

## Pattern: Module Implementation

**When:** Creating a new module (Baptisms, Funerals, etc.)

**Steps:**
1. Read MODULE_CHECKLIST.md thoroughly
2. Follow wedding module as reference implementation
3. **Phase 1: Database**
   - Create migration file (one file per table)
   - Add RLS policies
   - Create base TypeScript types
4. **Phase 2: Server Actions**
   - Create CRUD operations in `src/lib/actions/`
   - Define `WithRelations` interface
   - Test actions manually
5. **Phase 3: Module Structure**
   - Create all 9 main component files
   - Follow MODULE_COMPONENT_PATTERNS.md exactly
   - Use existing pickers and shared components
6. **Phase 4: Print/Export**
   - Create print view page
   - Add API routes for PDF/Word export
   - Follow RENDERER.md patterns
7. **Phase 5: Testing**
   - Write CRUD tests following TESTING_GUIDE.md
   - Test all user workflows
   - Verify permissions work correctly

**Context Files Needed:**
- MODULE_CHECKLIST.md
- MODULE_COMPONENT_PATTERNS.md
- MODULE_DEVELOPMENT.md
- FORMS.md
- TESTING_GUIDE.md
- Wedding module source code (reference)

**Quality Checks:**
- [ ] All 9 component files created
- [ ] Migration file follows one-table-per-file rule
- [ ] RLS policies for all roles
- [ ] Tests cover CRUD operations
- [ ] Follows bilingual pattern
- [ ] No linting errors

**Common Mistakes:**
- Not following wedding module structure exactly
- Missing files (e.g., form-actions or form-wrapper)
- Incorrect RLS policies (too permissive or too restrictive)
- Hardcoded dates instead of using formatters
- Missing bilingual content

**Estimated Time:** 4-6 hours for complete module

---

## Pattern: Pagination Implementation

**When:** Adding pagination to an existing module's list page

**Steps:**
1. Read PAGINATION.md for current patterns
2. Add searchParams handling to server page.tsx
3. Update list-client component with PaginationControls
4. Add limit/offset to server action
5. Calculate total pages in server component
6. Write tests for pagination (first page, last page, navigation)

**Context Files Needed:**
- PAGINATION.md
- Module's page.tsx and list-client.tsx
- Wedding module (reference for working pagination)

**Quality Checks:**
- [ ] Default page size is 20 items
- [ ] Page number persists across navigation
- [ ] First/last page buttons work correctly
- [ ] URL updates with ?page= param
- [ ] Tests cover page navigation

**Common Mistakes:**
- Not preserving other searchParams (search, filters)
- Off-by-one errors in page calculation
- Not handling empty results

**Estimated Time:** 1-2 hours

---

## Pattern: Test Writing

**When:** Writing Playwright tests for a module

**Steps:**
1. Read TESTING_GUIDE.md thoroughly
2. Set up Page Object Model if module has multiple test files
3. Write test following auth pattern (tests are pre-authenticated)
4. Use role-based selectors first, then labels, then test IDs
5. Test user workflows, not implementation details
6. Run tests locally before marking complete

**Context Files Needed:**
- TESTING_GUIDE.md
- TESTING_ARCHITECTURE.md
- Existing tests for reference

**Quality Checks:**
- [ ] Tests use role-based selectors
- [ ] No hardcoded waits (use Playwright's auto-waiting)
- [ ] Tests are independent (can run in any order)
- [ ] Clear test descriptions
- [ ] Tests pass locally

**Common Mistakes:**
- Testing for toast messages (use navigation instead)
- Not using Page Object Model for complex modules
- Hardcoded test data that conflicts with other tests
- Using CSS selectors instead of role/label selectors

**Estimated Time:** 1-2 hours for CRUD test suite

---

## Pattern: Bug Fix

**When:** Fixing a reported bug

**Steps:**
1. Reproduce the bug locally
2. Write a failing test that demonstrates the bug
3. Identify root cause (check types, logic, etc.)
4. Implement fix
5. Verify test now passes
6. Check for similar bugs in related code
7. Update documentation if bug reveals unclear behavior

**Context Files Needed:**
- Module source code
- Related tests
- TESTING_GUIDE.md

**Quality Checks:**
- [ ] Bug reproduced before fix
- [ ] Test written that fails before fix
- [ ] Test passes after fix
- [ ] Similar code reviewed for same bug
- [ ] No new linting errors introduced

**Common Mistakes:**
- Fixing symptom instead of root cause
- Not writing a regression test
- Breaking other functionality while fixing bug

**Estimated Time:** 30 minutes - 2 hours depending on complexity

---

## Pattern: Component Creation

**When:** Creating a new reusable component

**Steps:**
1. Check COMPONENT_REGISTRY.md to avoid duplication
2. Decide if component should be in ui/ (shadcn) or components/ (custom)
3. Create component following project conventions
4. Add TypeScript interface for props
5. Support dark mode (use semantic color tokens)
6. Add accessibility (proper labels, ARIA, keyboard nav)
7. Update COMPONENT_REGISTRY.md with new component

**Context Files Needed:**
- COMPONENT_REGISTRY.md
- STYLES.md
- CODE_CONVENTIONS.md
- Existing similar components

**Quality Checks:**
- [ ] TypeScript interface for props
- [ ] Dark mode compatible (no hardcoded colors)
- [ ] Accessible (keyboard nav, screen readers)
- [ ] Documented in COMPONENT_REGISTRY.md
- [ ] Example usage in comments or docs

**Common Mistakes:**
- Hardcoded colors (breaks dark mode)
- Missing prop types
- Not checking if similar component already exists
- Poor accessibility

**Estimated Time:** 1-2 hours

---

## Pattern: Form Implementation

**When:** Creating or updating a form component

**Steps:**
1. **CRITICAL:** Read FORMS.md before starting
2. Use unified form pattern (handles both create and edit)
3. Use FormField for ALL inputs (required for consistency)
4. Use SaveButton and CancelButton from shared components
5. Implement dual validation (Zod + server-side)
6. Add proper redirection after save
7. Use isEditing pattern in form wrapper
8. Test form with validation errors and success cases

**Context Files Needed:**
- FORMS.md (CRITICAL - must read)
- Wedding form components (reference)
- Form validation schemas

**Quality Checks:**
- [ ] Uses FormField for all inputs
- [ ] SaveButton with proper loading state
- [ ] Validation shows user-friendly errors
- [ ] Redirects to view page after save
- [ ] No nested form elements
- [ ] All inputs have proper labels (for accessibility)

**Common Mistakes:**
- Not reading FORMS.md first
- Modifying input styles (font, borders) - FORBIDDEN
- Not using FormField component
- Nested forms (e.g., form inside dialog inside form)
- Missing event.stopPropagation() for nested interactive elements

**Estimated Time:** 2-3 hours for complex form

---

## Pattern: Migration Creation

**When:** Adding or modifying database tables

**Steps:**
1. Create new migration file with timestamp (current date to +30 days)
2. One table per migration file
3. Use plural table names (weddings, baptisms, funerals)
4. Add proper RLS policies (read, insert, update, delete)
5. Include `parish_id` in all tables
6. Add proper indexes for foreign keys and frequently queried columns
7. Test migration by telling user to run `npm run db:fresh`

**Context Files Needed:**
- Existing migrations in supabase/migrations/
- DATABASE section in CLAUDE.md

**Quality Checks:**
- [ ] One table per file
- [ ] Plural table name
- [ ] RLS policies for all roles
- [ ] parish_id column included
- [ ] Proper foreign key constraints
- [ ] Indexes on foreign keys

**Common Mistakes:**
- Multiple tables in one migration
- Missing RLS policies
- Singular table names
- Missing parish_id column
- Trying to execute migration (should only create file)

**Estimated Time:** 30 minutes - 1 hour

---

## Pattern: Content Builder / Print View

**When:** Creating liturgical script builder or print view

**Steps:**
1. Read CONTENT_BUILDER_STRUCTURE.md
2. Read CONTENT_BUILDER_SECTIONS.md
3. Follow existing content builders (wedding, funeral) as reference
4. Create print view in app/print/[module]/[id]/page.tsx
5. Add API routes for PDF and Word export
6. Follow RENDERER.md for export functionality
7. Test print view and exports manually

**Context Files Needed:**
- CONTENT_BUILDER_STRUCTURE.md
- CONTENT_BUILDER_SECTIONS.md
- RENDERER.md
- Wedding content builder (reference)

**Quality Checks:**
- [ ] Follows standard liturgical script structure
- [ ] Uses shared section builders where applicable
- [ ] Print view has proper print CSS
- [ ] PDF and Word exports work
- [ ] Page breaks in correct locations

**Common Mistakes:**
- Not following standard script structure
- Missing print-specific CSS
- Hardcoded content instead of using templates
- Page breaks in wrong places

**Estimated Time:** 3-4 hours

---

## Learning from Feedback

After each task, the orchestrator will receive feedback. High-rated tasks (4-5 out of 5) will be analyzed for patterns and added here. Low-rated tasks will be analyzed for mistakes to avoid.

**How to use this file:**
1. Find the pattern that matches your task type
2. Follow the steps in order
3. Check off quality criteria as you go
4. Avoid common mistakes listed
5. Adjust time estimates based on your progress
