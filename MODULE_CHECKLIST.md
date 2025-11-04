# Module Creation Checklist

Use this checklist when creating a new module (Funerals, Baptisms, etc.) based on the wedding template.

**Reference Implementation:** Wedding module (`src/app/(main)/weddings/`)

---

## 1. Database Layer

- [ ] Create migration for new table in `supabase/migrations/`
- [ ] Add `parish_id` column and RLS policies
- [ ] Include foreign keys for people, events, and readings as needed
- [ ] Add base type to `lib/types.ts` (singular form)

## 2. Server Actions (`lib/actions/[entity].ts`)

- [ ] Define `Create[Entity]Data` interface
- [ ] Define `Update[Entity]Data` interface (with nullable fields)
- [ ] Define `[Entity]WithRelations` interface extending base type
- [ ] Implement `get[Entities](filters?)` with server-side filtering
- [ ] Implement `get[Entity](id)` for basic fetch
- [ ] Implement `get[Entity]WithRelations(id)` using Promise.all() for related data
- [ ] Implement `create[Entity](data)` with revalidatePath()
- [ ] Implement `update[Entity](id, data)` using simplified Object.fromEntries pattern
- [ ] Implement `delete[Entity](id)` with revalidatePath()

## 3. Module Structure (8 files in main, 1 in print)

- [ ] `page.tsx` - List page (server)
- [ ] `[entity]-list-client.tsx` - List with URL search params
- [ ] `create/page.tsx` - Create page (server)
- [ ] `[id]/page.tsx` - View page (server, fetch WithRelations)
- [ ] `[id]/[entity]-view-client.tsx` - View display with ModuleViewPanel
- [ ] `[id]/edit/page.tsx` - Edit page (server, fetch WithRelations)
- [ ] `[entity]-form-wrapper.tsx` - Form wrapper with PageContainer (Client) **REQUIRED**
- [ ] `[entity]-form.tsx` - Unified form accepting [Entity]WithRelations prop
- [ ] `[id]/[entity]-form-actions.tsx` - Form action buttons (optional, if not using view client)
- [ ] `print/[entity]/[id]/page.tsx` - Print-optimized view

## 4. Reusable Components

- [ ] Use `ModuleViewPanel` for view page side panel
- [ ] Use `PeoplePicker` for person selection
- [ ] Use `EventPicker` for event selection
- [ ] Use `ReadingPickerModal` for scripture readings
- [ ] Use `PetitionEditor` if petitions are needed
- [ ] Use `SaveButton` and `CancelButton` in forms

## 5. Content & Export

- [ ] Create content builder in `lib/content-builders/[entity].ts`
  - Export `build[Entity]Liturgy(entity, templateId)` function
  - Returns liturgy document structure (sections, headings, paragraphs)
  - Used by view, print, PDF, and Word export
- [ ] Create API route `app/api/[entities]/[id]/pdf/route.ts`
  - Fetches entity with relations
  - Builds liturgy content using content builder
  - Converts to PDF and returns as download
- [ ] Create API route `app/api/[entities]/[id]/word/route.ts`
  - Fetches entity with relations
  - Builds liturgy content using content builder
  - Generates .docx file and returns as download
- [ ] Create print view in `app/print/[entity]/[id]/page.tsx`
  - Fetches entity with relations
  - Builds and renders liturgy using content builder + HTML renderer
  - Print-optimized styling

## 6. Constants & Navigation

- [ ] Add status constants to `lib/constants.ts` if needed
- [ ] Add to main sidebar navigation with consistent icon
- [ ] Choose icon from `lucide-react` and use consistently throughout

---

## Final Validation Checklist

Before marking the module as complete, verify:

- [ ] Form wrapper exists and matches wedding pattern
- [ ] Redirections match wedding module (refresh on update, push on create)
- [ ] Types use `WithRelations` interfaces
- [ ] Template ID is read from database and used in liturgy builder
- [ ] All view pages (view, print, PDF, Word) use template ID from database
- [ ] Icon is consistent across all uses
- [ ] All wedding module files have corresponding files in new module

---

## Common Mistakes to Avoid

### 🔴 Critical Errors:

1. **Missing Form Wrapper**: Always create `[entity]-form-wrapper.tsx` - this is NOT optional
   - Wraps the form with PageContainer
   - Provides action buttons for edit mode (View + Save at top)
   - Manages loading state

2. **Wrong Redirection Pattern**:
   - ✅ CORRECT: After UPDATE → `router.refresh()` (stays on edit page)
   - ✅ CORRECT: After CREATE → `router.push(\`/[entities]/\${newEntity.id}\`)` (goes to view page)
   - ❌ WRONG: Using `router.push()` after update (loses unsaved context)
   - ❌ WRONG: Staying on create page after creation

3. **Incorrect Type Usage**:
   - ✅ Form must accept `[Entity]WithRelations` type (not base `[Entity]`)
   - ✅ View pages must fetch using `get[Entity]WithRelations(id)`
   - ❌ Using base type causes missing nested data (people, events, readings)

4. **Missing Template ID Check**:
   - ✅ View client must use: `const templateId = entity.[entity]_template_id || 'default-template-id'`
   - ✅ Pass templateId to: `build[Entity]Liturgy(entity, templateId)`
   - ❌ Hard-coding template ID prevents users from selecting different templates

5. **File Structure Deviations**:
   - Always create ALL files that exist in the wedding module
   - Use exact same naming patterns (`[entities]-list-client.tsx` with plural)
   - Follow exact same component structure and props
