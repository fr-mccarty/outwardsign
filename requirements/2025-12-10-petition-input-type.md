# Petition Input Type for Scripts

**Created:** 2025-12-10
**Status:** Ready for Development
**Agent:** brainstorming-agent, requirements-agent

## Feature Overview

Add 'petition' as a new input field type for liturgical scripts, allowing parish staff to create and edit custom petitions (Prayer of the Faithful) directly within event forms.

## Problem Statement

Parish staff need to create custom petitions for liturgical events (weddings, funerals, baptisms, etc.). Currently, there's no streamlined way to integrate petition creation into the script preparation workflow. Staff need a way to:
- Create event-specific petitions while preparing scripts
- Start from templates or use AI assistance
- Edit petitions inline within the event context
- Include petitions in exported/printed scripts

## User Stories

- As a parish staff member preparing a wedding script, I want to create custom Prayer of the Faithful petitions so that they reflect the specific couple and their circumstances.

- As a staff member, I want to start from a petition template and customize it so that I don't have to write petitions from scratch every time.

- As a staff member, I want to use AI assistance to generate petition suggestions based on the event details so that I can save time and get creative ideas.

- As a staff member, I want to edit petitions directly within the event form so that I don't have to navigate to a separate petition management interface.

- As a staff member, I want petitions to appear in the exported/printed script so that the presider has everything they need in one document.

- As a staff member, I want to tag petitions with categories (wedding, funeral, seasonal, etc.) so that I can easily find relevant petition templates when creating new events.

- As a staff member, I want to filter petition templates by tags so that I can quickly find the right starting point for my event.

## Success Criteria

What does "done" look like?

- [ ] Staff can create petitions from within an event form using a petition input field
- [ ] Empty petition fields show clear options: "Create from template", "Generate with AI", or "Write from scratch"
- [ ] Clicking any creation option opens the petition editor in a modal
- [ ] Staff can edit existing petitions by clicking "Edit" button
- [ ] Petition preview appears in the event form after creation
- [ ] Petitions are included in exported/printed scripts with appropriate formatting
- [ ] Petition content is stored in the petitions table and referenced from event_field_values
- [ ] AI wizard receives full event context to generate relevant suggestions
- [ ] Staff can delete petitions and start over if needed
- [ ] Shared category tags system is implemented (category_tags + tag_assignments tables)
- [ ] Staff can tag petitions and content library items with shared tags
- [ ] Template picker can filter by tags to find relevant petition templates
- [ ] Existing content_tags tables are migrated to new shared structure

## Scope

### In Scope (MVP)

**Input Field Type:**
- Add 'petition' as a new InputFieldType option
- Petition fields can be added to script templates like other input types
- One petition field per script (typically labeled "Prayer of the Faithful")
- Petition fields are optional (not required)

**User Interface:**
- Empty state with three clear creation options:
  - "Create from template" - Choose from petition templates
  - "Generate with AI" - Use AI wizard with event context
  - "Write from scratch" - Open blank editor
- Populated state shows:
  - Preview of petition text
  - "Edit" button to reopen editor
  - "Delete" button to remove petitions

**Petition Editor Integration:**
- Reuse existing petition-editor.tsx component
- Open editor in a modal dialog
- Always show template/AI/scratch options (even when editing)
- Editor supports rich text formatting
- Petition content stored as one big formatted text block (keep it simple)

**Storage:**
- Store petition content in petitions table
- Store petition ID reference in event_field_values
- Auto-populate metadata from event context:
  - parish_id (current parish)
  - date (event date)
  - language (event language setting)
- No need for editable metadata fields

**AI Wizard:**
- Pass full event context to AI (couple names, event type, date, language, notes, etc.)
- AI generates contextually relevant petition suggestions
- Uses existing petition-wizard.tsx component

**Export/Print:**
- Petitions included in script exports (PDF, Word, print view)
- Follow existing section break settings (use "break after" setting)
- No special formatting rules for petitions (use standard liturgical styling)

**Permissions:**
- Follow existing permission patterns for event editing
- No special permission handling needed for petition fields

**Language:**
- Petitions have a language setting (staff can set English or Spanish)
- For bilingual events, staff manually handle language as needed

**Shared Category Tags System:**
- Implement shared tagging system for organizing petitions and content library items
- Database structure (polymorphic approach):
  - `category_tags` table - Shared tag definitions across all entities
    - id, parish_id, name, slug, sort_order, color (optional), created_at
  - `tag_assignments` table - Polymorphic many-to-many relationships
    - tag_id (→ category_tags)
    - entity_type (enum: 'content', 'petition')
    - entity_id (UUID of the content or petition)
- Tags are truly shared - one "Wedding" tag can be applied to both content items AND petitions
- Staff can tag petitions for easier organization and discovery
- Template picker can filter by tags (e.g., show only "Wedding" petition templates)
- Migrate existing `content_tags` and `content_tag_assignments` tables to new shared structure
- Tag management UI in settings (create/edit/delete tags)
- Inline tag assignment when creating/editing petitions

### Out of Scope (Future Enhancements)

**Advanced Tagging Features:**
- Tagging additional entity types beyond content and petitions (groups, documents, etc.)
- Hierarchical tags (parent-child relationships)
- Tag suggestions based on content analysis
- Auto-tagging based on patterns

**Advanced Features:**
- Version history for petitions
- Soft delete with recovery
- Multiple petition fields per script
- Pre-filled default petitions in templates
- Auto-copying petitions when duplicating events
- Bilingual petition handling (side-by-side or linked)
- Required petition fields
- Template auto-filtering by event type

**Edge Cases:**
- Copying events with petitions
- Sharing petitions across events
- Petition reuse patterns
- Advanced metadata management

## Key User Flows

### Primary Flow: Creating Petitions for the First Time

1. Staff member opens an event (e.g., Martinez-Johnson wedding)
2. Staff navigates to the script section
3. Staff encounters empty petition field labeled "Prayer of the Faithful"
4. Staff sees three options:
   - [Create from template]
   - [Generate with AI]
   - [Write from scratch]
5. Staff clicks "Create from template"
6. Modal opens with petition editor
7. Template picker shows available petition templates
8. Staff selects "Standard Wedding Petitions (English)"
9. Editor pre-fills with template text containing placeholders
10. Staff customizes text:
    - Replaces [Bride] and [Groom] with actual names
    - Adds specific intentions (e.g., sick family member)
    - Adjusts language to match couple's preferences
11. Staff clicks "Save"
12. Modal closes
13. Event form now shows petition preview with [Edit] and [Delete] buttons

### Alternative Flow: Using AI Wizard

1. Staff clicks "Generate with AI" instead of template
2. Modal opens with AI wizard
3. AI wizard receives event context (couple names, date, event type, language, etc.)
4. AI generates petition suggestions based on context
5. Staff reviews and customizes AI-generated text
6. Staff saves, modal closes
7. Preview appears in event form

### Alternative Flow: Writing from Scratch

1. Staff clicks "Write from scratch"
2. Modal opens with blank petition editor
3. Staff writes petition text using rich text editor
4. Staff saves, modal closes
5. Preview appears in event form

### Editing Flow

1. Staff clicks [Edit] button on populated petition field
2. Modal reopens with existing petition content
3. Editor shows template/AI/scratch options again (staff can restart if desired)
4. Staff edits text
5. Staff saves, modal closes
6. Updated preview appears in event form

### Deleting Flow

1. Staff clicks [Delete] button
2. Simple confirmation dialog: "Delete these petitions?"
3. Staff confirms
4. Petition record deleted from database
5. Field returns to empty state with creation options

## Integration Points

**Existing Components to Reuse:**
- `petition-editor.tsx` - Main petition editing interface
- `petition-wizard.tsx` - AI-assisted petition generation
- Existing modal/dialog components
- Existing rich text editor components

**Database:**
- `petitions` table (existing) - Stores petition content and metadata
- `event_field_values` table (existing) - Stores reference to petition ID
- `script_input_fields` table (existing) - Defines petition fields in templates
- `category_tags` table (migration from content_tags) - Shared tag definitions
- `tag_assignments` table (migration from content_tag_assignments) - Polymorphic tag relationships

**Script System:**
- Script template builder (add 'petition' as field type option)
- Script rendering/export system (render petition content in appropriate section)
- PDF/Word export API routes (include petition text)
- Print view (display petition content with liturgical styling)

**Content System:**
- Petition templates (stored in settings or content library)
- Template picker/selector UI
- AI integration for suggestion generation

---

## TECHNICAL REQUIREMENTS
(Added by requirements-agent)

### Answers to Open Questions

**Storage Implementation:**
- `event_field_values.value` stores ONLY the petition UUID (string)
- Petition `title` field auto-generated using format: `"{Event Type Name} - {Primary Occasion Date}"` (e.g., "Wedding - 2025-07-15")
- No special validation on petition content (keep simple for MVP)

**UI/UX Details:**
- Preview shows first 3 petition lines (truncated with "...")
- "View All" link expands to show full petition text in a collapsible section
- Preview is collapsible/expandable using Accordion component

**Petition Editor Integration:**
- Existing `petition-editor.tsx` DOES NOT need modifications
- Event context passed via new `PetitionPickerField` wrapper component
- Save behavior is IDENTICAL for both standalone and event-context usage (save to `petitions` table, return petition object)

**Template System:**
- Templates stored in `petition_templates` table (already exists at `/Users/joshmccarty/Code-2022M1/outwardsign/supabase/migrations/20251110000007_create_petition_templates_table.sql`)
- Staff manages templates via Settings > Petitions
- Templates are parish-specific (parish_id scoped)

**Export/Print:**
- Petition content rendered using existing petition section builder from `src/lib/content-builders/shared/builders/petitions.ts`
- Page breaks follow existing `page_break_after` setting on section
- Petition section heading comes FROM the script template (not auto-generated)

**Permissions:**
- Petition creation/editing follows SAME permissions as event field editing (Staff, Admin can edit)
- No special permission handling needed

**Language Handling:**
- Petition language setting is independent (staff sets per petition)
- For bilingual events, staff creates ONE petition and manually handles bilingual content if needed
- Template picker auto-filters by event language if available

**AI Wizard:**
- Event context passed: event_type.name, key person names, primary occasion date, all text fields
- Privacy/security: NO sensitive fields excluded (parish context only)
- Bilingual events: AI uses event language setting to determine output language

**Error Handling:**
- Petition creation failure: Show toast error, keep modal open, allow retry
- Modal close without saving: No changes persisted, petition remains unchanged
- Orphaned petition reference: Handled gracefully with null check in `getEventWithRelations`, show "Petition deleted" message

**Category Tags Implementation:**
- NEW migration file (do not modify existing content_tags migration)
- Migration creates `category_tags` and `tag_assignments`, migrates data from `content_tags`/`content_tag_assignments`, then drops old tables
- Tag filtering: Multi-select dropdown (using shadcn/ui Select component)
- Tag assignment UI: Appears in petition editor modal (below content, above save button)
- Tags are OPTIONAL on petitions
- Tag management UI: Settings > Tags (CRUD operations using existing admin-only pattern)

**Future Considerations:**
- UI is designed for single petition field only (no multi-field support needed now)
- Version history NOT considered in architecture (can be added later without breaking changes)

### Database Schema

**No new tables needed - using existing structure:**

1. **petitions table** (already exists)
   - Stores petition content and metadata
   - Used by standalone petition feature and now by events
   - Fields: id, parish_id, title, date, language, text, details, template, created_at, updated_at

2. **event_field_values** (conceptual - stored as JSONB in events.field_values)
   - When field type is 'petition', value is petition.id (UUID string)

3. **petition_templates table** (already exists)
   - Stores reusable petition templates
   - Fields: id, parish_id, title, description, context, module, language, is_default, created_at, updated_at, deleted_at

**New tables for shared category tags:**

4. **category_tags table** (replaces content_tags)
```
TABLE: category_tags
  - id: UUID primary key
  - parish_id: UUID foreign key to parishes (ON DELETE CASCADE)
  - name: TEXT (display name, e.g., "Wedding", "Funeral")
  - slug: TEXT (URL-safe identifier, e.g., "wedding", "funeral")
  - sort_order: INTEGER (for ordering in UI)
  - color: TEXT (optional, for UI badges - can be NULL)
  - created_at: TIMESTAMPTZ
  - updated_at: TIMESTAMPTZ
  - created_by: UUID foreign key to auth.users
  - UNIQUE constraint on (parish_id, slug)

INDEXES:
  - idx_category_tags_parish_id ON (parish_id)
  - idx_category_tags_sort_order ON (parish_id, sort_order)
  - idx_category_tags_slug ON (parish_id, slug)

RLS POLICIES:
  - SELECT: All parish members can read tags for their parish
  - INSERT: Admin only can create tags
  - UPDATE: Admin only can update tags
  - DELETE: Admin only can delete tags (with usage check)
```

5. **tag_assignments table** (replaces content_tag_assignments)
```
TABLE: tag_assignments
  - id: UUID primary key
  - tag_id: UUID foreign key to category_tags (ON DELETE CASCADE)
  - entity_type: TEXT (enum: 'content', 'petition', 'petition_template')
  - entity_id: UUID (polymorphic reference to content/petition/template)
  - created_at: TIMESTAMPTZ
  - UNIQUE constraint on (tag_id, entity_type, entity_id)

INDEXES:
  - idx_tag_assignments_tag_id ON (tag_id)
  - idx_tag_assignments_entity ON (entity_type, entity_id)
  - idx_tag_assignments_composite ON (tag_id, entity_type, entity_id)

RLS POLICIES:
  - SELECT: Parish members can read assignments for their parish entities
  - INSERT: Admin and Staff can create assignments for their parish entities
  - DELETE: Admin and Staff can delete assignments for their parish entities
```

**Migration Strategy:**

1. Create new `category_tags` table with same structure as `content_tags`
2. Create new `tag_assignments` table with polymorphic structure
3. Migrate data:
   ```sql
   -- Copy all content tags to category tags
   INSERT INTO category_tags (id, parish_id, name, slug, sort_order, color, created_at, updated_at, created_by)
   SELECT id, parish_id, name, slug, sort_order, color, created_at, updated_at, created_by
   FROM content_tags;

   -- Copy all content tag assignments to tag assignments
   INSERT INTO tag_assignments (id, tag_id, entity_type, entity_id, created_at)
   SELECT id, tag_id, 'content', content_id, created_at
   FROM content_tag_assignments;
   ```
4. Drop old tables: `content_tag_assignments`, `content_tags` (CASCADE will handle foreign keys)
5. Update RLS policies on new tables
6. Create triggers for updated_at on category_tags

### Type Definitions

**Update existing types in /Users/joshmccarty/Code-2022M1/outwardsign/src/lib/types/event-types.ts:**

```typescript
export type InputFieldType =
  | 'person'
  | 'group'
  | 'location'
  | 'event_link'
  | 'list_item'
  | 'document'
  | 'text'
  | 'rich_text'
  | 'content'
  | 'date'
  | 'time'
  | 'datetime'
  | 'number'
  | 'yes_no'
  | 'petition'  // <-- NEW
```

**Add new types in /Users/joshmccarty/Code-2022M1/outwardsign/src/lib/types.ts:**

```typescript
// Category Tags (shared tagging system)
export interface CategoryTag {
  id: string
  parish_id: string
  name: string
  slug: string
  sort_order: number
  color: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface CategoryTagWithUsageCount extends CategoryTag {
  usage_count: number
}

export interface CreateCategoryTagData {
  name: string
  slug?: string
  sort_order?: number
  color?: string | null
}

export interface UpdateCategoryTagData {
  name?: string
  slug?: string
  sort_order?: number
  color?: string | null
}

// Tag Assignments (polymorphic)
export type TagEntityType = 'content' | 'petition' | 'petition_template'

export interface TagAssignment {
  id: string
  tag_id: string
  entity_type: TagEntityType
  entity_id: string
  created_at: string
}

export interface CreateTagAssignmentData {
  tag_id: string
  entity_type: TagEntityType
  entity_id: string
}

// Petition with tags
export interface PetitionWithTags extends Petition {
  tags?: CategoryTag[]
}

// Petition Template with tags
export interface PetitionTemplateWithTags extends PetitionContextTemplate {
  tags?: CategoryTag[]
}

// Content with tags (update existing to use CategoryTag)
export interface ContentWithTags extends Content {
  tags?: CategoryTag[]  // Changed from ContentTag to CategoryTag
}
```

### Server Actions

**New actions file: /Users/joshmccarty/Code-2022M1/outwardsign/src/lib/actions/category-tags.ts**

All CRUD operations for category tags (identical structure to content-tags.ts):
- `getCategoryTags(sortBy?: 'sort_order' | 'name'): Promise<CategoryTag[]>`
- `getCategoryTagsWithUsageCount(): Promise<CategoryTagWithUsageCount[]>`
- `getCategoryTagById(tagId: string): Promise<CategoryTag | null>`
- `createCategoryTag(input: CreateCategoryTagData): Promise<CategoryTag>`
- `updateCategoryTag(tagId: string, input: UpdateCategoryTagData): Promise<CategoryTag>`
- `deleteCategoryTag(tagId: string): Promise<{ success: boolean }>` (checks usage before delete)
- `reorderCategoryTags(tagIdsInOrder: string[]): Promise<CategoryTag[]>`

**New actions file: /Users/joshmccarty/Code-2022M1/outwardsign/src/lib/actions/tag-assignments.ts**

All operations for tag assignments (polymorphic):
- `getTagAssignments(entityType: TagEntityType, entityId: string): Promise<TagAssignment[]>`
- `getTagsForEntity(entityType: TagEntityType, entityId: string): Promise<CategoryTag[]>` (resolves tags)
- `assignTag(data: CreateTagAssignmentData): Promise<TagAssignment>`
- `unassignTag(tagId: string, entityType: TagEntityType, entityId: string): Promise<void>`
- `bulkAssignTags(entityType: TagEntityType, entityId: string, tagIds: string[]): Promise<void>` (replaces all tags for entity)

**Update existing actions file: /Users/joshmccarty/Code-2022M1/outwardsign/src/lib/actions/dynamic-events.ts**

Add petition resolution in `getEventWithRelations`:

```typescript
// Inside the field resolution switch statement (line ~424):

case 'petition': {
  const { data: petition } = await supabase
    .from('petitions')
    .select('*')
    .eq('id', rawValue)
    .single()
  resolvedField.resolved_value = petition as Petition | null
  break
}
```

**Update existing actions: /Users/joshmccarty/Code-2022M1/outwardsign/src/lib/actions/petitions.ts**

Add helper for creating petition from event context:

```typescript
export async function createPetitionFromEvent(data: {
  eventId: string
  eventTypeName: string
  occasionDate: string
  language: LiturgicalLanguage
  templateId?: string
  details?: string
}): Promise<Petition> {
  const supabase = await createClient()
  const selectedParishId = await requireSelectedParish()

  // Auto-generate title from event context
  const title = `${data.eventTypeName} - ${data.occasionDate}`

  // If template provided, fetch it
  let templateContent = null
  if (data.templateId) {
    const template = await getPetitionTemplate(data.templateId)
    templateContent = template?.context
  }

  // Create petition with auto-populated metadata
  const { data: petition, error } = await supabase
    .from('petitions')
    .insert({
      parish_id: selectedParishId,
      title,
      date: data.occasionDate,
      language: data.language,
      text: '', // Empty initially, will be filled by editor
      details: data.details || null,
      template: templateContent
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create petition')
  }

  return petition
}
```

**Update existing actions: /Users/joshmccarty/Code-2022M1/outwardsign/src/lib/actions/petition-templates.ts**

Add tag resolution to template fetching:

```typescript
export async function getPetitionTemplatesWithTags(): Promise<PetitionTemplateWithTags[]> {
  const templates = await getPetitionTemplates()

  // Fetch tags for each template
  const templatesWithTags = await Promise.all(
    templates.map(async (template) => {
      const tags = await getTagsForEntity('petition_template', template.id)
      return { ...template, tags }
    })
  )

  return templatesWithTags
}
```

### UI Components

**New component: /Users/joshmccarty/Code-2022M1/outwardsign/src/components/petition-picker-field.tsx**

Wrapper component following existing picker field pattern (similar to ContentPickerField):

```typescript
COMPONENT: PetitionPickerField

PROPS:
  - label: string
  - value: Petition | null
  - onValueChange: (petition: Petition | null) => void
  - showPicker: boolean
  - onShowPickerChange: (show: boolean) => void
  - description?: string
  - placeholder?: string
  - required?: boolean
  - eventContext?: {
      eventId: string
      eventTypeName: string
      occasionDate: string
      keyPersonNames: string[]
      language: LiturgicalLanguage
    }

STRUCTURE:
  - Uses PickerField as wrapper (handles common layout)
  - Renders petition preview with first 3 lines truncated
  - Empty state shows three buttons:
    - "Create from Template" -> Opens PetitionTemplatePickerDialog
    - "Generate with AI" -> Opens PetitionWizard
    - "Write from Scratch" -> Opens PetitionEditor with blank state
  - Populated state shows:
    - Petition preview (first 3 lines)
    - "View All" expandable accordion
    - "Edit" button -> Opens PetitionEditor with existing petition
    - "Delete" button -> Confirms, then deletes petition and sets value to null

BEHAVIOR:
  - When template selected: Creates new petition, opens editor with template pre-filled
  - When AI generates: Creates new petition with AI content
  - When writing from scratch: Creates new petition, opens editor blank
  - All creation paths auto-populate metadata from eventContext
  - Editor save updates petition record, returns updated petition object
  - Delete removes petition from database
```

**New component: /Users/joshmccarty/Code-2022M1/outwardsign/src/components/petition-template-picker-dialog.tsx**

Template selection dialog with tag filtering:

```typescript
COMPONENT: PetitionTemplatePickerDialog

PROPS:
  - open: boolean
  - onOpenChange: (open: boolean) => void
  - onSelect: (template: PetitionTemplateWithTags) => void
  - language?: LiturgicalLanguage (pre-filter by language)

STRUCTURE:
  - Dialog with searchable list of templates
  - Multi-select dropdown for tag filtering (at top)
  - Template list filtered by:
    - Language (if provided)
    - Selected tags (AND logic - must have ALL selected tags)
    - Search query (matches title/description)
  - Each template shows:
    - Title
    - Description (truncated)
    - Language badge
    - Tag badges
  - Click template to select

BEHAVIOR:
  - Fetches templates with tags on mount
  - Applies filters client-side
  - Returns selected template to parent
```

**New component: /Users/joshmccarty/Code-2022M1/outwardsign/src/components/tag-selector.tsx**

Reusable multi-select tag component:

```typescript
COMPONENT: TagSelector

PROPS:
  - selectedTags: CategoryTag[]
  - onTagsChange: (tags: CategoryTag[]) => void
  - availableTags: CategoryTag[]
  - label?: string
  - placeholder?: string

STRUCTURE:
  - Multi-select dropdown using shadcn/ui Select
  - Shows selected tags as badges
  - Remove tag by clicking X on badge
  - Add tag from dropdown

BEHAVIOR:
  - Manages tag selection state
  - Supports keyboard navigation
  - Sorts tags by sort_order
```

**Update existing component: /Users/joshmccarty/Code-2022M1/outwardsign/src/app/(main)/events/[event_type_id]/dynamic-event-form.tsx**

Add petition field rendering in the `renderField` switch statement (around line 162):

```typescript
case 'petition':
  return (
    <PetitionPickerField
      key={field.id}
      label={field.name}
      value={pickerValues[field.name] as Petition | null}
      onValueChange={(petition) => updatePickerValue(field.name, petition)}
      showPicker={pickerOpen[field.name] || false}
      onShowPickerChange={(open) => setPickerOpen(prev => ({ ...prev, [field.name]: open }))}
      required={field.required}
      placeholder={`Select or create ${field.name}`}
      eventContext={{
        eventId: event?.id,
        eventTypeName: eventType.name,
        occasionDate: occasion.date,
        keyPersonNames: extractKeyPersonNames(eventType, fieldValues),
        language: detectLanguage(eventType, fieldValues) || 'en'
      }}
    />
  )
```

### File Structure

**New files to create:**

```
/src/components/
  petition-picker-field.tsx           # Main petition field wrapper
  petition-template-picker-dialog.tsx # Template selection dialog
  tag-selector.tsx                    # Reusable multi-select tag component

/src/lib/actions/
  category-tags.ts                    # Category tag CRUD operations
  tag-assignments.ts                  # Tag assignment operations

/src/app/(main)/settings/
  tags/
    page.tsx                          # Settings > Tags landing page (list)
    create/page.tsx                   # Create new tag
    [id]/page.tsx                     # View tag (shows usage)
    [id]/edit/page.tsx                # Edit tag
    tags-list-client.tsx              # Client component for tag list
    tag-form.tsx                      # Unified create/edit form

/supabase/migrations/
  20251210000013_migrate_to_category_tags.sql  # Migration to shared tags
```

**Files to modify:**

```
/src/lib/types/event-types.ts
  - Add 'petition' to InputFieldType union

/src/lib/types.ts
  - Add CategoryTag interfaces
  - Add TagAssignment interfaces
  - Update ContentWithTags to use CategoryTag
  - Add PetitionWithTags, PetitionTemplateWithTags

/src/lib/actions/dynamic-events.ts
  - Add petition resolution in getEventWithRelations (case 'petition')

/src/lib/actions/petitions.ts
  - Add createPetitionFromEvent helper

/src/lib/actions/petition-templates.ts
  - Add getPetitionTemplatesWithTags function

/src/app/(main)/events/[event_type_id]/dynamic-event-form.tsx
  - Add petition field rendering in renderField switch
  - Import PetitionPickerField
  - Update pickerValues state to include Petition type

/src/components/petition-editor.tsx
  - Add tag selector integration (optional tags below content)

/src/components/petition-wizard.tsx
  - Pass eventContext to AI generation
```

### Testing Requirements

**Unit Tests:**
- Server action: `createPetitionFromEvent` with various event contexts
- Server action: `getCategoryTags` with sort options
- Server action: `assignTag`, `unassignTag`, `bulkAssignTags`
- Tag filtering logic in template picker

**Integration Tests:**
- Create event with petition field -> verify petition stored and referenced
- Edit petition from event form -> verify updates saved
- Delete petition -> verify orphaned reference handled gracefully
- Template picker with tag filtering -> verify correct templates shown
- Migrate content tags to category tags -> verify data integrity

**E2E Tests (Playwright):**
- Complete petition creation flow (template path)
- Complete petition creation flow (AI path)
- Complete petition creation flow (scratch path)
- Edit existing petition from event
- Delete petition from event
- Tag filtering in template picker

### Documentation Updates

**MODULE_REGISTRY.md:**
- Add Settings > Tags route to settings modules

**COMPONENT_REGISTRY.md:**
- Add PetitionPickerField to picker components section
- Add TagSelector to form components section
- Add PetitionTemplatePickerDialog to dialog components section

**DATABASE.md:**
- Document category_tags and tag_assignments tables
- Document migration from content_tags to category_tags
- Add notes on polymorphic tag assignments

**ARCHITECTURE.md:**
- Add polymorphic tagging pattern to data architecture section
- Document petition resolution in WithRelations pattern

### Security Considerations

**Authentication:**
- All petition operations require authenticated user
- Parish scoping enforced via requireSelectedParish() on all operations

**Authorization:**
- Staff and Admin can create/edit petitions via event forms
- Admin only can manage tags (create/edit/delete)
- Staff and Admin can assign tags to petitions

**Data Validation:**
- Petition title auto-generated (not user input)
- Petition date must match occasion date format (YYYY-MM-DD)
- Language must be valid LiturgicalLanguage enum value
- Tag slug uniqueness enforced at database level (parish_id, slug)

**RLS Policies:**
- category_tags: SELECT (all parish members), INSERT/UPDATE/DELETE (admin only)
- tag_assignments: SELECT (all parish members), INSERT/DELETE (staff/admin)
- petitions: Existing RLS policies apply (parish-scoped)

### Implementation Complexity

**Complexity Rating:** Medium

**Reason:**
- Database migration from content_tags to category_tags requires careful data preservation
- Polymorphic tag_assignments table is new pattern for codebase
- Integration with existing petition editor/wizard requires event context passing
- Dynamic event form already supports picker fields, so petition field follows existing pattern
- No breaking changes to existing petition functionality

**Risk Areas:**
- Data migration from content_tags could lose data if not tested thoroughly
- Orphaned petition references need graceful handling in all views
- Tag filtering logic could be complex with multi-select AND behavior

### Dependencies and Blockers

**Dependencies:**
- Existing petition-editor.tsx and petition-wizard.tsx must remain functional
- Dynamic event form must support new picker field type
- Category tags migration must complete before tag assignments can be used

**Blockers:**
- None identified

### Documentation Inconsistencies Found

**Issue 1: Petition table structure**
- Documentation: No formal documentation of petitions table schema exists in /docs/DATABASE.md
- Code: Petitions table is referenced in actions but schema is not documented
- Resolution: Add petitions table schema to DATABASE.md during implementation

**Issue 2: InputFieldType documentation**
- Documentation: No comprehensive list of InputFieldType values exists in MODULE_DEVELOPMENT.md
- Code: InputFieldType is defined in event-types.ts but not documented
- Resolution: Add InputFieldType reference table to MODULE_DEVELOPMENT.md

**Issue 3: Picker field pattern**
- Documentation: No general documentation of picker field pattern exists
- Code: Multiple picker fields follow same pattern (PersonPickerField, ContentPickerField, etc.)
- Resolution: Create PICKER_FIELD_PATTERN.md in /docs/ to document the standard pattern

### Next Steps

**Status updated to "Ready for Development"**

Hand off to developer-agent for implementation with this priority order:

1. **Database Migration** (FIRST)
   - Create migration file: 20251210000013_migrate_to_category_tags.sql
   - Test migration on dev database
   - Verify data integrity after migration

2. **Type Definitions** (SECOND)
   - Update event-types.ts with 'petition' InputFieldType
   - Add CategoryTag and TagAssignment types to types.ts

3. **Server Actions** (THIRD)
   - Create category-tags.ts and tag-assignments.ts
   - Update dynamic-events.ts with petition resolution
   - Add createPetitionFromEvent to petitions.ts

4. **UI Components** (FOURTH)
   - Create PetitionPickerField component
   - Create PetitionTemplatePickerDialog component
   - Create TagSelector component
   - Update dynamic-event-form.tsx with petition field rendering

5. **Settings UI** (FIFTH)
   - Create Tags settings pages (list, create, edit)
   - Add tag management functionality

6. **Testing** (SIXTH)
   - Write unit tests for server actions
   - Write integration tests for petition creation flow
   - Write E2E tests for complete user flows

7. **Documentation** (SEVENTH)
   - Update MODULE_REGISTRY.md, COMPONENT_REGISTRY.md, DATABASE.md
   - Create PICKER_FIELD_PATTERN.md
