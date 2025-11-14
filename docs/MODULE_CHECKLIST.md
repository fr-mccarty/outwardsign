# Module Creation Checklist

This checklist provides a comprehensive guide for creating new modules (Funerals, Baptisms, Presentations, etc.) in Outward Sign.

**Reference Implementation:** Wedding module (`src/app/(main)/weddings/`)

**For detailed component patterns and code examples, see [MODULE_COMPONENT_PATTERNS.md](./MODULE_COMPONENT_PATTERNS.md).**

---

## Quick Overview

When creating a new module, follow these major steps:

1. **Database Layer** - Migration, RLS policies, base types
2. **Server Actions** - CRUD operations with `WithRelations` interface
3. **Module Structure** - 9 main files + 1 print page (follow wedding pattern exactly)
4. **Reusable Components** - Use existing pickers and shared components
5. **Content & Export** - Content builder + API routes for PDF/Word
6. **Constants** - Status constants and sidebar navigation

---

## Detailed Step-by-Step Checklist

### Phase 1: Database Setup

- [ ] **Create migration file** in `supabase/migrations/`
  - [ ] Create table with required fields (id, parish_id, status, created_at, updated_at, etc.)
  - [ ] Add foreign key constraints (person_id, event_id, etc.)
  - [ ] Add template_id field (e.g., `wedding_template_id`, `funeral_template_id`)
  - [ ] Create RLS policies for each role (staff, admin, parishioner)
  - [ ] Grant appropriate permissions

- [ ] **Run migration**
  - [ ] Test migration locally
  - [ ] Prompt user to run `supabase db push`

### Phase 2: Server Actions

- [ ] **Create server actions file** at `src/lib/actions/[entity].ts` or `[entities].ts`
  - [ ] Define base `[Entity]` interface
  - [ ] Define `[Entity]WithRelations` interface extending base type
  - [ ] Implement `get[Entities](filters?)` - List with server-side filtering
  - [ ] Implement `get[Entity](id)` - Fetch single entity (basic)
  - [ ] Implement `get[Entity]WithRelations(id)` - Fetch with all relations using Promise.all()
  - [ ] Implement `create[Entity](data)` with revalidatePath
  - [ ] Implement `update[Entity](id, data)` using Object.fromEntries pattern
  - [ ] Implement `delete[Entity](id)` with revalidatePath
  - [ ] Define `Create[Entity]Data` and `Update[Entity]Data` types

### Phase 3: Module Structure (Main Files)

Follow the wedding module pattern exactly for all 9 main files:

- [ ] **List Page** - `app/(main)/[entities]/page.tsx` (Server)
  - [ ] Auth check with redirect
  - [ ] Fetch entities with filters from searchParams
  - [ ] Compute stats server-side
  - [ ] Define breadcrumbs
  - [ ] Render: `BreadcrumbSetter` → `[Entity]ListClient`

- [ ] **List Client** - `app/(main)/[entities]/[entities]-list-client.tsx` (Client, plural naming)
  - [ ] Accept `initialData` and `stats` props
  - [ ] Implement URL-based filters (search, status, etc.)
  - [ ] Use `router.push()` to update URL params (no client-side filtering)
  - [ ] Render: Search/Filters Card → Grid of entity cards → Empty state → Stats
  - [ ] **Card Button Placement (CRITICAL):**
    - [ ] **Edit icon** in upper right corner of card (Pencil icon, icon-only button)
    - [ ] **View button** in bottom right corner of card (outlined button with text)
    - [ ] Maintain consistent spacing and alignment across all modules

- [ ] **Create Page** - `app/(main)/[entities]/create/page.tsx` (Server)
  - [ ] Auth check
  - [ ] Define breadcrumbs
  - [ ] Render: `BreadcrumbSetter` → `[Entity]FormWrapper` (no entity prop)

- [ ] **View Page** - `app/(main)/[entities]/[id]/page.tsx` (Server)
  - [ ] Auth check
  - [ ] Fetch entity using `get[Entity]WithRelations(id)`
  - [ ] Define breadcrumbs
  - [ ] Render: `PageContainer` → `BreadcrumbSetter` → `[Entity]ViewClient`

- [ ] **Edit Page** - `app/(main)/[entities]/[id]/edit/page.tsx` (Server)
  - [ ] Auth check
  - [ ] Fetch entity using `get[Entity]WithRelations(id)`
  - [ ] Define breadcrumbs
  - [ ] Render: `BreadcrumbSetter` → `[Entity]FormWrapper entity={entity}`

- [ ] **Form Wrapper** - `app/(main)/[entities]/[entity]-form-wrapper.tsx` (Client, REQUIRED)
  - [ ] Accept optional `entity?: [Entity]WithRelations` prop
  - [ ] Wrap form with `PageContainer`
  - [ ] Show action buttons in edit mode (View button + Save button at top)
  - [ ] Manage loading state
  - [ ] Pass props to `[Entity]Form`

- [ ] **Unified Form** - `app/(main)/[entities]/[entity]-form.tsx` (Client)
  - [ ] Accept optional `entity?: [Entity]WithRelations` prop
  - [ ] Compute `isEditing = !!entity` at top
  - [ ] Use `isEditing` for all mode detection
  - [ ] **CRITICAL:** ALL inputs, selects, and textareas MUST use `FormField` component
  - [ ] Implement form fields with pickers (PeoplePicker, EventPicker, etc.)
  - [ ] Use `openToNewEvent={!value}` for EventPicker (e.g., `openToNewEvent={!weddingEvent.value}`)
  - [ ] Use `openToNewPerson={!value}` for PeoplePicker (e.g., `openToNewPerson={!presider.value}`)
  - [ ] Place SaveButton and CancelButton at bottom
  - [ ] Call `create[Entity]()` or `update[Entity]()`
  - [ ] After UPDATE: `router.refresh()` (stay on edit page)
  - [ ] After CREATE: `router.push(\`/[entities]/\${newEntity.id}\`)` (go to view page)

- [ ] **View Client** - `app/(main)/[entities]/[id]/[entity]-view-client.tsx` (Client)
  - [ ] Accept `entity: [Entity]WithRelations` prop
  - [ ] Use `ModuleViewContainer` component
  - [ ] Implement `generateFilename()` function
  - [ ] Implement `getTemplateId()` function (read from `entity.[entity]_template_id`)
  - [ ] Pass `buildLiturgy` callback

- [ ] **Form Actions** - `app/(main)/[entities]/[id]/[entity]-form-actions.tsx` (Client)
  - [ ] Accept `entity: [Entity]WithRelations` prop
  - [ ] Implement Copy Info button (copies entity details to clipboard)
  - [ ] Implement Edit button (links to edit page)
  - [ ] Implement Delete button with confirmation dialog
  - [ ] Handle delete loading state (`isDeleting`)
  - [ ] Call `delete[Entity](entity.id)` Server Action
  - [ ] Redirect to list page after successful deletion (`router.push('/[entities]')`)
  - [ ] Use toast notifications for user feedback

### Phase 4: Print & Export

- [ ] **Print Page** - `app/print/[entities]/[id]/page.tsx` (Server)
  - [ ] Directory name must be PLURAL
  - [ ] Fetch entity with relations
  - [ ] Build liturgy using template ID from database
  - [ ] Render HTML using `renderHTML()`
  - [ ] Use print-specific styling

- [ ] **PDF Export Route** - `app/api/[entities]/[id]/pdf/route.ts`
  - [ ] Fetch entity with relations
  - [ ] Get template ID from entity
  - [ ] Build liturgy using `build[Entity]Liturgy(entity, templateId)`
  - [ ] Convert to PDF
  - [ ] Return response with appropriate headers

- [ ] **Word Export Route** - `app/api/[entities]/[id]/word/route.ts`
  - [ ] Fetch entity with relations
  - [ ] Get template ID from entity
  - [ ] Build liturgy using `build[Entity]Liturgy(entity, templateId)`
  - [ ] Generate .docx file
  - [ ] Return response with appropriate headers

### Phase 5: Content Builder

- [ ] **Create content builder** at `src/lib/content-builders/[entity]/index.ts`
  - [ ] Export `build[Entity]Liturgy(entity, templateId)` function
  - [ ] Create template files for different liturgy formats
  - [ ] Return structured document array (sections, headings, paragraphs)
  - [ ] Ensure single source of truth for all output formats

### Phase 6: Constants & Navigation

- [ ] **Add constants** to constants file
  - [ ] Create `[ENTITY]_STATUS_VALUES` array
  - [ ] Create `[ENTITY]_STATUS_LABELS` object with en/es translations
  - [ ] Export constants for use in forms and lists

- [ ] **Update sidebar navigation** in `src/components/main-sidebar.tsx`
  - [ ] Add module to sidebar with appropriate icon
  - [ ] Use consistent icon from lucide-react (see Module Icons section)

### Phase 7: Loading & Error States

- [ ] **Add loading states**
  - [ ] `app/(main)/[entities]/loading.tsx` (imports reusable component)
  - [ ] `app/(main)/[entities]/[id]/loading.tsx` (imports reusable component)

- [ ] **Add error boundaries**
  - [ ] `app/(main)/[entities]/error.tsx` (imports reusable component)
  - [ ] `app/(main)/[entities]/[id]/error.tsx` (imports reusable component)

### Phase 8: Testing & Verification

Use the validation checklist below to verify your implementation.

---

## 🔴 Common Module Creation Mistakes

### Critical Errors to Avoid:

#### 1. Missing Form Wrapper
**ALWAYS create `[entity]-form-wrapper.tsx` - this is NOT optional**

- Wraps the form with PageContainer
- Provides action buttons for edit mode (View + Save at top)
- Manages loading state

#### 2. Wrong Redirection Pattern

- ✅ **CORRECT**: After UPDATE → `router.refresh()` (stays on edit page)
- ✅ **CORRECT**: After CREATE → `router.push(\`/[entities]/\${newEntity.id}\`)` (goes to view page)
- ❌ **WRONG**: Using `router.push()` after update (loses unsaved context)
- ❌ **WRONG**: Staying on create page after creation

#### 3. Incorrect Type Usage

- ✅ Form must accept `[Entity]WithRelations` type (not base `[Entity]`)
- ✅ View pages must fetch using `get[Entity]WithRelations(id)`
- ❌ Using base type causes missing nested data (people, events, readings)

#### 4. Missing Template ID Check

- ✅ View client must use: `const templateId = entity.[entity]_template_id || 'default-template-id'`
- ✅ Pass templateId to: `build[Entity]Liturgy(entity, templateId)`
- ❌ Hard-coding template ID prevents users from selecting different templates

#### 5. File Structure Deviations

- Always create ALL files that exist in the wedding module
- Use exact same naming patterns (`[entities]-list-client.tsx` with plural)
- Follow exact same component structure and props

#### 6. Not Using FormField Component

**CRITICAL:** ALL form inputs, selects, and textareas MUST use the `FormField` component.

- ✅ **CORRECT**: `<FormField id="name" label="Name" value={name} onChange={setName} />`
- ❌ **WRONG**: `<Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} />`
- ❌ **WRONG**: Using bare `<Input />`, `<Select />`, or `<Textarea />` components

**Why:** FormField provides consistent styling, labels, descriptions, and layout across all forms.

**Exceptions:**
- Picker components (PeoplePicker, EventPicker) have their own internal structure
- **If you need to use a bare input/select/textarea, ALWAYS ask the user first**

---

## Validation Checklist

Before completing a new module, verify:

- [ ] **Form wrapper** exists and matches wedding pattern
- [ ] **FormField component** is used for ALL inputs, selects, and textareas
- [ ] **Redirections** match wedding module (refresh on update, push on create)
- [ ] **Types** use `WithRelations` interfaces
- [ ] **Template ID** is read from database and used in liturgy builder
- [ ] **All view pages** (view, print, PDF, Word) use template ID from database
- [ ] **Icon** is consistent across all uses
- [ ] **All wedding module files** have corresponding files in new module
- [ ] **RLS policies** are properly configured for all roles
- [ ] **Server actions** include all CRUD operations
- [ ] **Breadcrumbs** are set on all pages
- [ ] **Loading and error states** are implemented
- [ ] **Constants** are added with bilingual labels
- [ ] **Sidebar navigation** includes the new module

---

## Module Icons Reference

Each module must use a consistent icon from `lucide-react` throughout the application:

- **Weddings**: `VenusAndMars`
- **Funerals**: `Cross`
- **Baptisms**: TBD
- **Presentations**: TBD

The main sidebar (`src/components/main-sidebar.tsx`) is the source of truth for which icon should be used for each module.

Icons are used in:
- Main sidebar navigation
- Module list pages (if displaying icons)
- Breadcrumbs or page headers (if applicable)
