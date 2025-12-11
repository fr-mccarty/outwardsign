# Content Library System

**Created:** 2025-12-10
**Status:** Ready for Development
**Agent:** brainstorming-agent → requirements-agent

## Feature Overview

A reusable content library system that allows parish staff to create, organize, search, and select liturgical content (readings, prayers, ceremony text) for use in event scripts. This evolves the v1 "reading picker" concept into a comprehensive "content picker" that supports rich text, tagging, filtering, and parish-specific customization.

## Problem Statement

Currently, staff preparing liturgical events (funerals, weddings, baptisms) must manually enter or copy-paste readings, prayers, and ceremonial text into free-form text fields. This leads to:

- **Duplication of effort** - Staff re-type the same readings for multiple events
- **Inconsistency** - Same reading may be formatted differently across events
- **No reusability** - Content entered for one event cannot be reused for another
- **Poor discovery** - No way to search or browse previously used readings
- **Lost formatting** - Rich text formatting is not preserved when copy-pasting

**Who experiences this problem:**
- Parish staff preparing event scripts (funerals, weddings, baptisms)
- Admins setting up initial parish content libraries
- Ministry leaders searching for appropriate liturgical texts

## User Stories

### Core User Stories

**As a parish staff member preparing a funeral,**
- I want to search for funeral-appropriate first readings
- So that I can quickly find and select a reading without typing it from scratch

**As a parish staff member,**
- I want to filter readings by tags (sacrament type, section type, theme)
- So that I see only relevant options for the event I'm preparing

**As a parish admin,**
- I want to create reusable content (readings, prayers, ceremony text) with formatting
- So that staff can select from a curated library instead of recreating content each time

**As a parish staff member,**
- I want to create new content on-the-fly when I can't find what I need
- So that I'm not blocked from completing my work, and the library grows organically

**As a parish staff member,**
- I want selected content to be immutable in the event
- So that changes to the library don't break past events, and I can export to Word for customization if needed

### Secondary User Stories

**As a parish admin during onboarding,**
- I want a pre-seeded library of common liturgical tags (sacrament types, section types, themes)
- So that I can start organizing content immediately without creating a tagging structure

**As a bilingual parish,**
- I want to create English and Spanish versions of the same reading
- So that I can serve both language communities with appropriate content

**As a parish staff member,**
- I want to see which tags are applied to content
- So that I understand how content is categorized and can find similar items

## Success Criteria

What does "done" look like?

- [x] Staff can create reusable content with title, body (markdown), language, and tags
- [x] Staff can search/filter content by tags using toggle UI (similar to GlobalLiturgicalEventPicker)
- [x] Content is selectable via a picker in event forms (replaces free-form text fields)
- [x] Selected content is stored as a reference (UUID) in event field values
- [x] Script placeholders fetch and render content body when displaying events
- [x] Tags are sortable and seeded during parish onboarding
- [x] Existing events with text-based readings continue to work (hybrid renderer)
- [x] Content is immutable once selected (no editing within the event)
- [x] Bilingual parishes can manage English and Spanish content separately

## Scope

### In Scope (MVP)

**Data Model:**
- `contents` table (parish-scoped, title, body, language, description)
- `content_tags` table (flat tags with sort_order for ordering)
- `content_tag_assignments` table (many-to-many relationships)

**Content Management:**
- Create/edit/delete content items (Admin/Staff)
- Add/remove tags from content
- Bilingual support (separate EN/ES records)
- Markdown formatting in content body

**Tag Management:**
- Seed default tags during parish onboarding (sacrament, section, theme, testament types)
- Sortable tags (sort_order field)
- Parish-specific tags (no shared global tags)

**Content Discovery:**
- Content picker component for input fields
- Filter by tags (AND logic - must match all active tags)
- Toggle UI for tag filtering (similar to GlobalLiturgicalEventPicker)
- Search by title or body text

**Integration with Scripts:**
- New input field type: `'content'` (replaces `'text'` for readings/prayers)
- Field definition includes default filter tags (e.g., `filter_tags: ['funeral', 'first-reading']`)
- Field values store UUID reference to `contents.id`
- Placeholder renderer fetches content body from `contents` table

**Migration Support:**
- Hybrid renderer: detect string (old text) vs UUID (new content reference) in field values
- Old events continue to work without migration
- New events use content picker

### Out of Scope (Future)

**Not included in MVP:**
- Shared global content library across parishes
- Content versioning or revision history
- Collaborative editing of content
- Bulk import of readings from external sources
- Advanced search (fuzzy matching, semantic search)
- Content analytics (usage tracking, popularity)
- Content approval workflows
- Override/customization of content within events (use Word export instead)
- Hierarchical tags or tag types (flat tags only for MVP)
- Translation linking (linking EN/ES versions of same content)

## Key User Flows

### Primary Flow: Selecting Content for an Event

**Staff member preparing a funeral:**

1. Opens funeral form in create or edit mode
2. Scrolls to "First Reading" field (type: `'content'`)
3. Clicks the field → Content picker dialog opens
4. Dialog shows:
   - Title: "Choose First Reading"
   - Default filters active: `funeral`, `first-reading` (from field definition)
   - List of content items matching those tags
   - Tag toggles at top (user can toggle tags on/off to refine)
   - Search box (optional to use)
5. User scans the list, sees "Wisdom 3:1-6, 9 - The souls of the just..."
6. Clicks the content item → Selected (checkmark or highlight)
7. Clicks "Use This Content" button
8. Dialog closes, field now displays: "Wisdom 3:1-6, 9"
9. User can click to change selection if needed
10. Saves event → Field value stores UUID reference to content

**Alternative path: Content not found**

5. User searches/filters but doesn't find what they need
6. Clicks "Add New Content" button in picker
7. Dialog switches to content creation form:
   - Title field (e.g., "Romans 8:31-39")
   - Body field (markdown editor)
   - Language dropdown (English/Spanish)
   - Tag selector (pre-filled with active filters: `funeral`, `first-reading`)
8. User pastes reading text, adds additional tags (e.g., `hope`, `new-testament`)
9. Clicks "Create & Use This Content"
10. Content is created in library AND selected for this event
11. Dialog closes, field displays the new content title

### Secondary Flow: Admin Creating Content Library

**Admin setting up parish content library:**

1. Goes to Settings → Content Library (new settings page)
2. Sees list of existing content items (empty for new parish)
3. Clicks "Create Content" button
4. Fills out form:
   - Title: "Wisdom 3:1-6, 9"
   - Body: (pastes reading text with markdown formatting)
   - Language: English
   - Tags: Selects `funeral`, `first-reading`, `old-testament`, `hope`, `resurrection`
5. Clicks "Save"
6. Content appears in list
7. Repeats for multiple readings, prayers, etc.
8. When staff prepare events, they can now select from this library

### Tertiary Flow: Rendering Scripts with Content

**System rendering a funeral script:**

1. Event has field value: `first_reading_id = "uuid-123"`
2. Script section contains placeholder: `{{First Reading}}`
3. Renderer encounters placeholder:
   - Checks field value for "First Reading"
   - Detects it's a UUID (not plain text)
   - Fetches content from `contents` table: `SELECT body FROM contents WHERE id = 'uuid-123'`
   - Replaces placeholder with content body (markdown)
4. Markdown is rendered to HTML/PDF/Word
5. Reading appears in script with proper formatting

**Alternative: Old event with text-based reading**

1. Event has field value: `first_reading = "A reading from the Book of Wisdom..."`
2. Script section contains placeholder: `{{First Reading}}`
3. Renderer encounters placeholder:
   - Checks field value for "First Reading"
   - Detects it's a string (not UUID)
   - Uses string directly as content
4. Text is rendered as-is (backward compatibility)

## Integration Points

### Existing Features This Touches

**Input Field Definitions (`input_field_definitions` table):**
- New field type: `'content'`
- Field definition includes `filter_tags` (array of tag slugs to pre-filter content)
- Replaces existing `'text'` type for readings, prayers, ceremony instructions

**Scripts and Sections (`scripts`, `sections` tables):**
- Sections already support placeholders (e.g., `{{First Reading}}`)
- Renderer must be updated to handle UUID references in field values
- Fetch content from `contents` table and replace placeholder with body

**Event Field Values (`events.field_values` JSON):**
- Currently stores text strings for readings
- Will store UUID references to `contents.id` for new events
- Renderer must support both (hybrid mode)

**Markdown System:**
- Content body uses existing markdown editor (`markdown-editor.tsx`)
- Content rendering uses existing markdown processor (`markdown-processor.ts`)
- No new markdown syntax needed

**Parish Onboarding:**
- Must seed default tags during parish creation (`seedEventTypesForParish`)
- Tags seeded in both onboarding flow and dev seeder

### Existing Components to Reuse

**Pickers:**
- Follow existing picker patterns (e.g., `GlobalLiturgicalEventPicker`)
- Use toggle UI for tag filtering
- Modal/dialog pattern for content selection

**Markdown Editor:**
- Use `markdown-editor.tsx` for content body editing
- Supports formatting, preview, syntax highlighting

**Form Components:**
- Use `FormField` component for content picker integration
- Follow standard form validation patterns

**Data Table:**
- Content library list page can use `DataTable` component
- Supports sorting, filtering, pagination

### Existing Patterns to Follow

**Module Structure:**
- If content library gets its own management UI, follow 8-file module pattern
- List page, create page, edit page, view page, unified form, etc.

**Parish Scoping:**
- All content is parish-scoped (required `parish_id`)
- RLS policies enforce parish isolation
- No cross-parish content sharing

**Bilingual Implementation:**
- Separate records for EN/ES (not dual columns)
- Language selector in forms
- Filter by language in picker

---
## TECHNICAL REQUIREMENTS
(Added by requirements-agent)

### Answers to Open Questions

#### Data Model Questions

**1. Input field definition schema for `filter_tags`:**

The `filter_tags` field will be added to `input_field_definitions` as a PostgreSQL TEXT ARRAY column.

```sql
-- In migration for input_field_definitions
filter_tags TEXT[] DEFAULT ARRAY[]::TEXT[]
```

TypeScript interface will be:
```typescript
export interface InputFieldDefinition {
  // ... existing fields
  filter_tags?: string[] | null  // Array of tag slugs
}
```

Example usage in seed:
```typescript
{
  name: 'First Reading',
  type: 'content',
  filter_tags: ['funeral', 'first-reading'],
  required: false
}
```

**2. Hybrid rendering UUID vs string detection:**

The renderer will use UUID validation regex pattern to detect whether a field value is a UUID (content reference) or plain text (legacy).

UUID validation pattern (PostgreSQL standard):
```typescript
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isUUID(value: any): boolean {
  return typeof value === 'string' && UUID_REGEX.test(value)
}
```

Renderer logic:
```
FUNCTION resolveFieldValue(fieldName, fieldValue, fieldDef)
  IF fieldDef.type === 'content' THEN
    IF isUUID(fieldValue) THEN
      // New content reference - fetch from database
      content = FETCH FROM contents WHERE id = fieldValue
      RETURN content.body
    ELSE
      // Legacy text value - use as-is
      RETURN String(fieldValue)
    END IF
  ELSE
    // Other field types use existing logic
    RETURN existing getDisplayValue(fieldValue, fieldDef)
  END IF
END FUNCTION
```

No schema version or migration flag needed. The UUID pattern is distinctive enough to auto-detect reliably.

**3. Tag seeding - complete list:**

Tags will be seeded in 4 categories with distinct sort_order ranges:

**Sacrament Tags (sort_order 1-10):**
- Wedding (slug: `wedding`, sort: 1)
- Funeral (slug: `funeral`, sort: 2)
- Baptism (slug: `baptism`, sort: 3)
- Presentation (slug: `presentation`, sort: 4)
- Quinceañera (slug: `quinceanera`, sort: 5)

**Section Tags (sort_order 11-30):**
- First Reading (slug: `first-reading`, sort: 11)
- Second Reading (slug: `second-reading`, sort: 12)
- Psalm (slug: `psalm`, sort: 13)
- Gospel (slug: `gospel`, sort: 14)
- Opening Prayer (slug: `opening-prayer`, sort: 15)
- Closing Prayer (slug: `closing-prayer`, sort: 16)
- Prayers of the Faithful (slug: `prayers-of-the-faithful`, sort: 17)
- Ceremony Instructions (slug: `ceremony-instructions`, sort: 18)
- Announcements (slug: `announcements`, sort: 19)

**Theme Tags (sort_order 31-50):**
- Hope (slug: `hope`, sort: 31)
- Resurrection (slug: `resurrection`, sort: 32)
- Love (slug: `love`, sort: 33)
- Eternal Life (slug: `eternal-life`, sort: 34)
- Comfort (slug: `comfort`, sort: 35)
- Joy (slug: `joy`, sort: 36)
- Peace (slug: `peace`, sort: 37)
- Faith (slug: `faith`, sort: 38)
- Community (slug: `community`, sort: 39)
- Family (slug: `family`, sort: 40)

**Testament Tags (sort_order 51-60):**
- Old Testament (slug: `old-testament`, sort: 51)
- New Testament (slug: `new-testament`, sort: 52)
- Psalms (slug: `psalms`, sort: 53)
- Gospels (slug: `gospels`, sort: 54)

Tags will NOT have colors in MVP. The `color` column is optional and will be NULL for all seeded tags.

**4. Content description field:**

The `description` field is **user-entered and optional**. It serves as preview text in the picker to help users understand what the content is about without reading the full body.

Usage:
- Admin/staff can optionally enter a short description (e.g., "The souls of the just are in the hand of God")
- NOT auto-generated from body
- Displayed in picker list as subtitle under title
- NULL/empty is acceptable - picker will show title only

#### Implementation Questions

**5. Content picker component structure:**

The content picker will be **two separate components** following existing picker patterns:

1. **ContentPicker** - Generic modal/dialog component
   - Similar to `GlobalLiturgicalEventPicker` (dialog-based)
   - Displays content list with tag filters
   - Search functionality
   - Pagination for large libraries (20 items per page)
   - "Add New Content" button at bottom

2. **ContentPickerField** - Form field wrapper component
   - Similar to `PersonPickerField`
   - Integrates ContentPicker with React Hook Form via FormField
   - Displays selected content title
   - Click to open ContentPicker dialog

Pagination: YES - Large libraries (100+ readings) will need pagination. Use 20 items per page with server-side filtering/search.

**6. Tag management UI:**

Tags will be managed in **two ways**:

1. **Admin tag management page** (Settings → Content Tags)
   - Admin-only access
   - CRUD operations for tags
   - Drag-and-drop reordering (updates sort_order)
   - Edit tag name/slug/color

2. **Inline tag selection** (when creating/editing content)
   - Multi-select dropdown showing existing tags
   - Staff CANNOT create new tags inline (must use existing tags)
   - Only Admins can create new tags via Settings page

Rationale: Prevents tag proliferation. Keeps taxonomy controlled by admins while allowing staff to use any existing tag.

**7. Content library UI location:**

Content management will be a **Settings page** (not a main module):

**Location:** `/settings/content-library`

**Rationale:**
- Content is supporting infrastructure, not a primary parish activity (like weddings/funerals)
- Keeps main sidebar focused on event/ministry modules
- Follows pattern of other parish-wide resources (Locations, Groups)

**Access control:**
- Admin: Full CRUD on contents and tags
- Staff: Full CRUD on contents, read-only on tags
- Ministry-Leader: Read-only (can view library, cannot edit)
- Parishioner: No access

**8. Permissions - who can create/edit/delete:**

**Content CRUD:**
- Admin: Full CRUD (create, read, update, delete)
- Staff: Full CRUD (create, read, update, delete)
- Ministry-Leader: Read-only (can view library in picker, cannot manage)
- Parishioner: No access

**Tag CRUD:**
- Admin: Full CRUD (create, read, update, delete, reorder)
- Staff: Read-only (can view and apply tags, cannot create/edit/delete)
- Ministry-Leader: Read-only
- Parishioner: No access

**Content Library Page Access:**
- Admin: Can access `/settings/content-library`
- Staff: Can access `/settings/content-library`
- Ministry-Leader: No access (use picker only)
- Parishioner: No access

Rationale: Staff need to maintain content library as they prepare events. Admins control tag taxonomy to prevent proliferation.

#### Migration Questions

**9. Migration strategy - migrate existing text or hybrid approach:**

**Decision: Hybrid approach - NO migration of existing data**

Existing events will keep text-based field values. New events will use content picker and store UUID references. The hybrid renderer will support both indefinitely.

**Rationale:**
- Safer - no risk of data loss during migration
- Simpler - no migration script needed
- Preserves history - old events remain exactly as created
- Staff can gradually build library as they create new events

**Migration script:** NONE needed. Renderer handles both formats transparently.

**10. Migration scope - which fields migrate from 'text' to 'content':**

**Fields that should change from 'text' to 'content' type:**

**All event types:**
- First Reading
- Second Reading
- Psalm
- Gospel Reading
- Opening Prayer
- Closing Prayer
- Prayers of the Faithful
- Ceremony Instructions (ceremonial text)

**NOT changed to 'content':**
- Announcements (event-specific, not reusable)
- Notes/special instructions (event-specific)
- Custom fields (user-defined, may not fit content library)

**Implementation approach:**

This will be a **manual configuration per event type** during Phase 2 (after content library is built). The developer-agent will:

1. Update `seedEventTypesForParish` to create new input fields with type 'content'
2. Add filter_tags to each field (e.g., `['wedding', 'first-reading']`)
3. Keep existing 'text' type fields as-is for backward compatibility

Example seed change:
```typescript
// OLD
{ name: 'First Reading', type: 'text', required: false, order: 7 }

// NEW
{
  name: 'First Reading',
  type: 'content',
  filter_tags: ['wedding', 'first-reading'],
  required: false,
  order: 7
}
```

**Hybrid rendering handles both automatically** - no data migration needed.

#### UX/Discovery Questions

**11. Default filters - toggleable or hard filters:**

**Decision: Pre-selected toggleable filters (user can turn them off)**

When ContentPicker opens for a field with `filter_tags: ['funeral', 'first-reading']`:

1. Tag toggle UI shows all available tags
2. 'funeral' and 'first-reading' toggles are **pre-selected** (active)
3. User can click to **deactivate** those tags (broaden search)
4. User can click to **activate** additional tags (narrow search)
5. AND logic applies: content must match ALL active tags

**Rationale:**
- Better UX - user can broaden search if nothing found
- Follows pattern of GlobalLiturgicalEventPicker (toggleable filters)
- Prevents "no results found" dead-ends

**Empty state fallback:** If no tags are active, show ALL content (unfiltered). This allows user to see entire library if needed.

**12. Empty state - no content matches filters:**

**Empty state UI will show:**

1. Message: "No content found matching your filters."
2. Suggestion: "Try removing some tags or search by title."
3. **Primary CTA:** "Add New Content" button (same as normal state)
4. **Secondary action:** Link to clear all filters ("Show all content")

**Behavior:**
- User can click "Add New Content" to create content that matches filters
- New content will have filter tags pre-applied (from field definition)
- User can adjust tags before saving

**No automatic filter relaxation** - user controls filters manually. System doesn't guess user intent.

**13. Content creation in picker - auto-apply filter tags:**

**YES - auto-apply active filter tags, with user editing allowed**

When user clicks "Add New Content" from picker:

1. Modal switches to creation form (within same dialog)
2. Tag selector is **pre-filled** with active filter tags
3. User CAN edit tags:
   - Remove pre-filled tags
   - Add additional tags
4. User enters title, body, language
5. Clicks "Create & Use This Content"
6. Content is created AND selected for event
7. Dialog closes, field shows new content

**Modal vs redirect:**
- Creation happens **in modal** (no redirect)
- Uses same dialog pattern as GlobalLiturgicalEventPicker (toggle between list view and details view)
- Keeps user in flow, prevents loss of event form data

#### Technical Questions

**14. Placeholder syntax - stays the same:**

**NO CHANGE to placeholder syntax**

Placeholders remain as field names: `{{First Reading}}`, `{{Gospel Reading}}`, etc.

The renderer maps placeholder to field name, looks up field value, then resolves UUID or text:

```
Placeholder: {{First Reading}}
  → Field name: "First Reading"
  → Field value: "uuid-123" or "A reading from..."
  → Resolved content: (fetch from contents table) or (use text as-is)
```

**No new syntax needed** - existing `{{Field Name}}` pattern works with hybrid renderer.

**15. Content immutability - updates affect past events or not:**

**DECISION: Edits DO update in all past events (not truly immutable)**

When admin edits a content item, the change applies to ALL events that reference it (past and future).

**Rationale:**
- Simpler implementation (no versioning needed)
- True immutability requires complex version history system (out of scope)
- Staff can export to Word for event-specific customization (workaround)

**Guidance to admins:**
- Editing content will update it in all events that use it
- If you need event-specific wording, export to Word and customize there
- Create new content item instead of editing if you want variants

**Future enhancement:** Content versioning system (copy-on-write, revision history) for true immutability.

**16. Word export customization - how does it work:**

**Word export is completely separate from content system**

The Word export workflow:

1. Staff prepares event with content picker selections
2. Staff generates Word export of script
3. Word doc contains **resolved content** (text from contents.body)
4. Staff edits Word doc locally (customizes wording, formatting)
5. Word doc is saved/printed/distributed

**Key points:**
- Edits to Word doc do NOT update the content library
- Edits to Word doc do NOT update the event in database
- Word export is a **one-way export** for final production/printing
- Content references in database remain unchanged

**If staff wants to save customizations:**
- They can create a NEW content item with customized text
- Then update the event to reference the new content
- OR they can just keep the Word doc as the final artifact

**Word export is an escape hatch** for one-off customizations without polluting the reusable library.

### Database Schema

#### Table: `contents`

**Purpose:** Reusable liturgical content (readings, prayers, ceremony text)

```sql
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,

  -- Core fields
  title TEXT NOT NULL,
  body TEXT NOT NULL, -- Markdown
  language TEXT NOT NULL CHECK (language IN ('en', 'es')),
  description TEXT, -- Optional short preview (user-entered)

  -- Standard fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_contents_parish_id ON contents(parish_id);
CREATE INDEX idx_contents_language ON contents(parish_id, language);
CREATE INDEX idx_contents_title_search ON contents USING gin(to_tsvector('english', title));
CREATE INDEX idx_contents_body_search ON contents USING gin(to_tsvector('english', body));

-- RLS Policies
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- SELECT: Parish members can read contents for their parish
CREATE POLICY contents_select_policy ON contents
  FOR SELECT
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
    )
  );

-- INSERT: Admin and Staff can create contents
CREATE POLICY contents_insert_policy ON contents
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles) OR 'staff' = ANY(pu.roles))
    )
  );

-- UPDATE: Admin and Staff can update contents
CREATE POLICY contents_update_policy ON contents
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles) OR 'staff' = ANY(pu.roles))
    )
  );

-- DELETE: Admin and Staff can delete contents
CREATE POLICY contents_delete_policy ON contents
  FOR DELETE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles) OR 'staff' = ANY(pu.roles))
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER contents_updated_at
  BEFORE UPDATE ON contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Table: `content_tags`

**Purpose:** Flat tags for categorizing content (sacrament, section, theme, testament)

```sql
CREATE TABLE content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,

  -- Tag details
  name TEXT NOT NULL, -- Display name (e.g., "Funeral", "First Reading")
  slug TEXT NOT NULL, -- URL-safe identifier (e.g., "funeral", "first-reading")
  sort_order INTEGER NOT NULL DEFAULT 0, -- For ordering in UI (1-10 sacrament, 11-30 section, etc.)

  -- Optional display
  color TEXT, -- Optional: for UI badges (NULL in MVP)

  -- Standard fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),

  -- Unique constraint
  UNIQUE(parish_id, slug)
);

-- Indexes
CREATE INDEX idx_content_tags_parish_id ON content_tags(parish_id);
CREATE INDEX idx_content_tags_sort_order ON content_tags(parish_id, sort_order);
CREATE INDEX idx_content_tags_slug ON content_tags(parish_id, slug);

-- RLS Policies
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;

-- SELECT: Parish members can read tags for their parish
CREATE POLICY content_tags_select_policy ON content_tags
  FOR SELECT
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
    )
  );

-- INSERT: Admin only can create tags
CREATE POLICY content_tags_insert_policy ON content_tags
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles))
    )
  );

-- UPDATE: Admin only can update tags
CREATE POLICY content_tags_update_policy ON content_tags
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles))
    )
  );

-- DELETE: Admin only can delete tags
CREATE POLICY content_tags_delete_policy ON content_tags
  FOR DELETE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles))
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER content_tags_updated_at
  BEFORE UPDATE ON content_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Table: `content_tag_assignments`

**Purpose:** Many-to-many relationship between contents and tags

```sql
CREATE TABLE content_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicates
  UNIQUE(content_id, tag_id)
);

-- Indexes
CREATE INDEX idx_content_tag_assignments_content_id ON content_tag_assignments(content_id);
CREATE INDEX idx_content_tag_assignments_tag_id ON content_tag_assignments(tag_id);

-- RLS Policies
ALTER TABLE content_tag_assignments ENABLE ROW LEVEL SECURITY;

-- SELECT: Parish members can read assignments for their parish's contents
CREATE POLICY content_tag_assignments_select_policy ON content_tag_assignments
  FOR SELECT
  USING (
    content_id IN (
      SELECT c.id
      FROM contents c
      JOIN parish_users pu ON c.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
    )
  );

-- INSERT: Admin and Staff can create assignments for their parish's contents
CREATE POLICY content_tag_assignments_insert_policy ON content_tag_assignments
  FOR INSERT
  WITH CHECK (
    content_id IN (
      SELECT c.id
      FROM contents c
      JOIN parish_users pu ON c.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles) OR 'staff' = ANY(pu.roles))
    )
  );

-- DELETE: Admin and Staff can delete assignments for their parish's contents
CREATE POLICY content_tag_assignments_delete_policy ON content_tag_assignments
  FOR DELETE
  USING (
    content_id IN (
      SELECT c.id
      FROM contents c
      JOIN parish_users pu ON c.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND ('admin' = ANY(pu.roles) OR 'staff' = ANY(pu.roles))
    )
  );
```

#### Migration: Update `input_field_definitions` table

**Purpose:** Add `filter_tags` column to support content picker default filters

```sql
-- Add filter_tags column to input_field_definitions table
ALTER TABLE input_field_definitions
ADD COLUMN filter_tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update CHECK constraint to include 'content' type
ALTER TABLE input_field_definitions
DROP CONSTRAINT check_input_field_type;

ALTER TABLE input_field_definitions
ADD CONSTRAINT check_input_field_type CHECK (
  type IN (
    'person', 'group', 'location', 'event_link', 'list_item', 'document',
    'text', 'rich_text', 'content', -- 'content' is NEW
    'date', 'time', 'datetime', 'number', 'yes_no'
  )
);
```

### TypeScript Interfaces

**Location:** `/src/lib/types.ts`

```typescript
// Content Library Types

export interface Content {
  id: string
  parish_id: string
  title: string
  body: string // Markdown
  language: 'en' | 'es'
  description: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface ContentTag {
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

export interface ContentTagAssignment {
  id: string
  content_id: string
  tag_id: string
  created_at: string
}

// WithRelations types

export interface ContentWithTags extends Content {
  tags: ContentTag[] // Joined via content_tag_assignments
}

export interface ContentTagWithUsageCount extends ContentTag {
  usage_count: number // Count of content items with this tag
}

// Create/Update data types

export interface CreateContentData {
  title: string
  body: string
  language: 'en' | 'es'
  description?: string | null
  tag_ids?: string[] // Array of tag IDs to assign
}

export interface UpdateContentData {
  title?: string
  body?: string
  language?: 'en' | 'es'
  description?: string | null
  tag_ids?: string[] // Replaces all existing tag assignments
}

export interface CreateContentTagData {
  name: string
  slug?: string // Auto-generated from name if not provided
  sort_order?: number // Auto-calculated if not provided
  color?: string | null
}

export interface UpdateContentTagData {
  name?: string
  slug?: string
  sort_order?: number
  color?: string | null
}
```

**Update existing interface:** `/src/lib/types/event-types.ts`

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
  | 'content'      // NEW TYPE
  | 'date'
  | 'time'
  | 'datetime'
  | 'number'
  | 'yes_no'

export interface InputFieldDefinition {
  id: string
  event_type_id: string
  name: string
  type: InputFieldType
  required: boolean
  list_id: string | null
  event_type_filter_id: string | null
  is_key_person: boolean
  filter_tags?: string[] | null  // NEW FIELD - Array of tag slugs for 'content' type
  order: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}
```

### Server Actions

**Location:** `/src/lib/actions/contents.ts`

```
MODULE: contents
PURPOSE: CRUD operations for content library

FUNCTION getContents(filters)
  INPUT:
    - search: optional string (searches title and body)
    - tag_slugs: optional array of tag slugs (AND filtering)
    - language: optional 'en' | 'es'
    - limit: number (default 20, max 100)
    - offset: number (default 0)
  PROCESS:
    1. Get selected parish ID via requireSelectedParish()
    2. Build query with filters:
       - parish_id = selected parish
       - Full-text search on title/body if search provided
       - JOIN content_tag_assignments and filter by tag_slugs (AND logic)
       - Filter by language if provided
    3. Apply pagination (limit/offset)
    4. Fetch contents with tags (LEFT JOIN for tags)
    5. Return { items: ContentWithTags[], totalCount: number }
  OUTPUT: { items: ContentWithTags[], totalCount: number }
  ERRORS: Return error if parish not selected or query fails

FUNCTION getContentById(contentId)
  INPUT: contentId (UUID string)
  PROCESS:
    1. Get selected parish ID via requireSelectedParish()
    2. Fetch content by ID, verify parish_id matches
    3. Fetch associated tags via content_tag_assignments JOIN
    4. Return ContentWithTags or null
  OUTPUT: ContentWithTags | null
  ERRORS: Return error if parish not selected

FUNCTION createContent(data)
  INPUT: CreateContentData { title, body, language, description?, tag_ids? }
  PROCESS:
    1. Validate required fields (title, body, language)
    2. Get selected parish ID via requireSelectedParish()
    3. Check user has admin or staff role (permission check)
    4. Insert into contents table with parish_id
    5. If tag_ids provided, insert into content_tag_assignments
    6. Return created content with tags
  OUTPUT: ContentWithTags
  ERRORS: Return error if validation fails, permission denied, or insert fails

FUNCTION updateContent(contentId, data)
  INPUT: contentId (UUID), UpdateContentData { title?, body?, language?, description?, tag_ids? }
  PROCESS:
    1. Get selected parish ID via requireSelectedParish()
    2. Check user has admin or staff role
    3. Verify content exists and belongs to parish
    4. Update content fields (only provided fields)
    5. If tag_ids provided:
       - DELETE all existing content_tag_assignments for this content
       - INSERT new content_tag_assignments for provided tag_ids
    6. Return updated content with tags
  OUTPUT: ContentWithTags
  ERRORS: Return error if content not found, permission denied, or update fails

FUNCTION deleteContent(contentId)
  INPUT: contentId (UUID)
  PROCESS:
    1. Get selected parish ID via requireSelectedParish()
    2. Check user has admin or staff role
    3. Verify content exists and belongs to parish
    4. DELETE from contents (CASCADE deletes content_tag_assignments)
  OUTPUT: { success: true }
  ERRORS: Return error if content not found, permission denied, or delete fails

FUNCTION searchContentByText(searchTerm, language?, limit?)
  INPUT: searchTerm (string), language? ('en' | 'es'), limit? (number)
  PROCESS:
    1. Get selected parish ID via requireSelectedParish()
    2. Use PostgreSQL full-text search on title and body
    3. Filter by language if provided
    4. Order by relevance (ts_rank)
    5. Apply limit (default 20, max 100)
  OUTPUT: ContentWithTags[]
  ERRORS: Return error if parish not selected or search fails
```

**Location:** `/src/lib/actions/content-tags.ts`

```
MODULE: content-tags
PURPOSE: CRUD operations for content tags

FUNCTION getContentTags(sortBy?)
  INPUT: sortBy? ('sort_order' | 'name', default 'sort_order')
  PROCESS:
    1. Get selected parish ID via requireSelectedParish()
    2. Fetch all tags for parish_id
    3. Sort by specified field
    4. Return tags
  OUTPUT: ContentTag[]
  ERRORS: Return error if parish not selected

FUNCTION getContentTagsWithUsageCount()
  INPUT: none
  PROCESS:
    1. Get selected parish ID via requireSelectedParish()
    2. Fetch tags with COUNT of associated content_tag_assignments
    3. Return ContentTagWithUsageCount[]
  OUTPUT: ContentTagWithUsageCount[]
  ERRORS: Return error if parish not selected

FUNCTION createContentTag(data)
  INPUT: CreateContentTagData { name, slug?, sort_order?, color? }
  PROCESS:
    1. Validate name is provided
    2. Get selected parish ID via requireSelectedParish()
    3. Check user has admin role (permission check)
    4. Generate slug from name if not provided (using generateSlug utility)
    5. Calculate sort_order if not provided (MAX + 1)
    6. Insert into content_tags table
    7. Return created tag
  OUTPUT: ContentTag
  ERRORS: Return error if validation fails, permission denied, slug conflict, or insert fails

FUNCTION updateContentTag(tagId, data)
  INPUT: tagId (UUID), UpdateContentTagData { name?, slug?, sort_order?, color? }
  PROCESS:
    1. Get selected parish ID via requireSelectedParish()
    2. Check user has admin role
    3. Verify tag exists and belongs to parish
    4. Update tag fields (only provided fields)
    5. Return updated tag
  OUTPUT: ContentTag
  ERRORS: Return error if tag not found, permission denied, slug conflict, or update fails

FUNCTION deleteContentTag(tagId)
  INPUT: tagId (UUID)
  PROCESS:
    1. Get selected parish ID via requireSelectedParish()
    2. Check user has admin role
    3. Verify tag exists and belongs to parish
    4. Check if tag is assigned to any content (usage_count > 0)
    5. If tag is in use, return error "Cannot delete tag in use"
    6. DELETE from content_tags
  OUTPUT: { success: true }
  ERRORS: Return error if tag not found, tag in use, permission denied, or delete fails

FUNCTION reorderContentTags(tagIdsInOrder)
  INPUT: tagIdsInOrder (array of UUIDs in desired sort order)
  PROCESS:
    1. Get selected parish ID via requireSelectedParish()
    2. Check user has admin role
    3. Verify all tag IDs belong to parish
    4. Update sort_order for each tag (index + 1)
    5. Return updated tags
  OUTPUT: ContentTag[]
  ERRORS: Return error if permission denied or update fails
```

### Component Specifications

#### Component: `ContentPicker`

**File:** `/src/components/content-picker.tsx`

**Purpose:** Modal dialog for selecting content from library with tag filtering and search

**Similar to:** `GlobalLiturgicalEventPicker` (dialog-based with toggle filters)

**Props:**
```typescript
interface ContentPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (content: ContentWithTags) => void
  selectedContentId?: string
  defaultFilterTags?: string[] // Pre-selected tag slugs from field definition
  language?: 'en' | 'es' // Filter by language
  emptyMessage?: string
}
```

**UI Structure:**

```
DIALOG LAYOUT:
  HEADER:
    - Title: "Choose Content"
    - Close button (X)

  FILTER SECTION:
    - Tag Toggle UI (similar to GlobalLiturgicalEventPicker view mode toggle)
      - Horizontal row of tag buttons
      - Grouped by category (Sacrament | Section | Theme | Testament)
      - Active tags highlighted (primary color)
      - Click to toggle on/off
      - Shows tag count (e.g., "Funeral (12)")
    - Search input (search title and body text)
    - Language selector (English | Spanish | Both)

  CONTENT LIST (scrollable):
    - List of content items (20 per page)
    - Each item shows:
      - Title (bold)
      - Description (muted text, if present)
      - Tag badges (small, colored chips)
      - Checkmark if selected
    - Click item to select
    - Empty state: "No content found. Try adjusting filters or add new content."

  FOOTER (fixed):
    - "Add New Content" button (ghost, left side)
    - Pagination controls (center)
    - "Use This Content" button (primary, right side, disabled if none selected)
```

**Behavior:**

1. **On open:**
   - Pre-select tags from `defaultFilterTags` prop
   - Set language filter if provided
   - Load content matching active filters
   - Reset to page 1

2. **Tag filtering:**
   - Click tag button to toggle active/inactive
   - AND logic: content must match ALL active tags
   - Updates content list in real-time
   - Resets to page 1

3. **Search:**
   - Debounced input (300ms delay)
   - Full-text search on title and body
   - Combines with tag filters (AND logic)
   - Resets to page 1

4. **Selection:**
   - Click content item to select (single selection)
   - Visual highlight + checkmark
   - "Use This Content" button becomes enabled
   - Click "Use This Content" to confirm and close

5. **Add New Content:**
   - Click "Add New Content" button
   - Dialog switches to creation form (inline modal)
   - Form pre-fills active filter tags
   - On save, creates content AND selects it
   - Returns to list view

6. **Pagination:**
   - Server-side pagination (20 per page)
   - Previous/Next buttons
   - Shows "Page X of Y (Z total)"

**State Management:**

```typescript
const [contentItems, setContentItems] = useState<ContentWithTags[]>([])
const [loading, setLoading] = useState(false)
const [currentPage, setCurrentPage] = useState(1)
const [totalCount, setTotalCount] = useState(0)
const [activeTags, setActiveTags] = useState<string[]>(defaultFilterTags || [])
const [searchTerm, setSearchTerm] = useState('')
const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es' | 'both'>(language || 'both')
const [selectedContent, setSelectedContent] = useState<ContentWithTags | null>(null)
const [showCreateForm, setShowCreateForm] = useState(false)
```

**Data Fetching:**

```typescript
// Load contents when filters change
useEffect(() => {
  if (open) {
    loadContents(currentPage, activeTags, searchTerm, selectedLanguage)
  }
}, [open, currentPage, activeTags, searchTerm, selectedLanguage])

const loadContents = async (page: number, tags: string[], search: string, language: string) => {
  setLoading(true)
  const result = await getContents({
    tag_slugs: tags.length > 0 ? tags : undefined,
    search: search || undefined,
    language: language === 'both' ? undefined : language,
    limit: 20,
    offset: (page - 1) * 20
  })
  setContentItems(result.items)
  setTotalCount(result.totalCount)
  setLoading(false)
}
```

#### Component: `ContentPickerField`

**File:** `/src/components/content-picker-field.tsx`

**Purpose:** Form field wrapper that integrates ContentPicker with React Hook Form

**Similar to:** `PersonPickerField`, `LocationPickerField`

**Props:**
```typescript
interface ContentPickerFieldProps {
  label: string
  value: ContentWithTags | null
  onValueChange: (content: ContentWithTags | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  placeholder?: string
  required?: boolean
  defaultFilterTags?: string[] // From input field definition
  language?: 'en' | 'es'
}
```

**UI Structure:**

```
FIELD LAYOUT (using PickerField component):
  - Label (with required asterisk if required)
  - Description (muted text below label)
  - Selected value display:
    - Icon: FileText
    - Content title (truncated if long)
    - Clear button (X) if value exists
  - Click anywhere to open picker
  - Placeholder: "Select Content" if no value

DIALOG:
  - ContentPicker component (controlled by showPicker prop)
```

**Usage in Dynamic Event Form:**

```typescript
// In dynamic-event-form.tsx
const contentField = inputFieldDefinitions.find(f => f.type === 'content')

<ContentPickerField
  label={contentField.name}
  value={resolvedFieldValues[contentField.name] || null}
  onValueChange={(content) => handleFieldChange(contentField.name, content?.id || null)}
  showPicker={showContentPicker}
  onShowPickerChange={setShowContentPicker}
  required={contentField.required}
  defaultFilterTags={contentField.filter_tags || []}
  language={eventLanguage}
/>
```

**Integration with FormField:**

Uses existing `FormField` component from React Hook Form:

```typescript
<FormField
  control={form.control}
  name={fieldName}
  render={({ field }) => (
    <ContentPickerField
      label={label}
      value={field.value}
      onValueChange={field.onChange}
      showPicker={showPicker}
      onShowPickerChange={setShowPicker}
      required={required}
      defaultFilterTags={defaultFilterTags}
      language={language}
    />
  )}
/>
```

#### Component: `ContentForm`

**File:** `/src/components/content-form.tsx`

**Purpose:** Unified form for creating and editing content (used in picker and settings page)

**Props:**
```typescript
interface ContentFormProps {
  content?: ContentWithTags | null // If provided, edit mode; otherwise, create mode
  onSave: (data: CreateContentData | UpdateContentData) => Promise<void>
  onCancel: () => void
  defaultTags?: string[] // Pre-selected tag IDs (from picker filters)
  defaultLanguage?: 'en' | 'es'
}
```

**Form Fields:**

1. **Title** - Text input (required)
   - Label: "Title"
   - Placeholder: "e.g., Wisdom 3:1-6, 9"
   - Validation: Required, max 200 chars

2. **Body** - Markdown editor (required)
   - Label: "Content"
   - Uses `MarkdownEditor` component
   - Placeholder: "Enter the reading, prayer, or ceremony text..."
   - Supports formatting: bold, italic, headings, lists
   - Validation: Required, max 10,000 chars

3. **Language** - Select dropdown (required)
   - Label: "Language"
   - Options: English, Spanish
   - Default: from `defaultLanguage` prop or 'en'

4. **Description** - Text input (optional)
   - Label: "Description (optional)"
   - Placeholder: "Brief preview text shown in picker"
   - Validation: Max 200 chars

5. **Tags** - Multi-select component (optional)
   - Label: "Tags"
   - Shows all available tags grouped by category
   - Pre-selected from `defaultTags` prop
   - User can add/remove tags
   - Uses existing tag component pattern

**Buttons:**
- "Save" (primary) - Creates or updates content
- "Cancel" (ghost) - Closes form without saving

**Validation:**

```typescript
const contentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().min(1, 'Content is required').max(10000),
  language: z.enum(['en', 'es']),
  description: z.string().max(200).nullable().optional(),
  tag_ids: z.array(z.string().uuid()).optional()
})
```

### Tag Seeding

**Location:** `/src/lib/seeding/content-tags-seed.ts`

**Function:** `seedContentTagsForParish(supabase, parishId)`

**Purpose:** Seed default content tags during parish onboarding

```
FUNCTION seedContentTagsForParish(supabase, parishId)
  INPUT:
    - supabase: SupabaseClient
    - parishId: UUID string
  PROCESS:
    1. Define tag seed data (see below)
    2. For each tag category (Sacrament, Section, Theme, Testament):
       - INSERT tags into content_tags table
       - Set parish_id, name, slug, sort_order
       - color = NULL for all tags (MVP)
    3. Handle errors with descriptive messages
  OUTPUT: void (throws error if seeding fails)
```

**Tag Seed Data:**

```typescript
const SACRAMENT_TAGS = [
  { name: 'Wedding', slug: 'wedding', sort_order: 1 },
  { name: 'Funeral', slug: 'funeral', sort_order: 2 },
  { name: 'Baptism', slug: 'baptism', sort_order: 3 },
  { name: 'Presentation', slug: 'presentation', sort_order: 4 },
  { name: 'Quinceañera', slug: 'quinceanera', sort_order: 5 },
]

const SECTION_TAGS = [
  { name: 'First Reading', slug: 'first-reading', sort_order: 11 },
  { name: 'Second Reading', slug: 'second-reading', sort_order: 12 },
  { name: 'Psalm', slug: 'psalm', sort_order: 13 },
  { name: 'Gospel', slug: 'gospel', sort_order: 14 },
  { name: 'Opening Prayer', slug: 'opening-prayer', sort_order: 15 },
  { name: 'Closing Prayer', slug: 'closing-prayer', sort_order: 16 },
  { name: 'Prayers of the Faithful', slug: 'prayers-of-the-faithful', sort_order: 17 },
  { name: 'Ceremony Instructions', slug: 'ceremony-instructions', sort_order: 18 },
  { name: 'Announcements', slug: 'announcements', sort_order: 19 },
]

const THEME_TAGS = [
  { name: 'Hope', slug: 'hope', sort_order: 31 },
  { name: 'Resurrection', slug: 'resurrection', sort_order: 32 },
  { name: 'Love', slug: 'love', sort_order: 33 },
  { name: 'Eternal Life', slug: 'eternal-life', sort_order: 34 },
  { name: 'Comfort', slug: 'comfort', sort_order: 35 },
  { name: 'Joy', slug: 'joy', sort_order: 36 },
  { name: 'Peace', slug: 'peace', sort_order: 37 },
  { name: 'Faith', slug: 'faith', sort_order: 38 },
  { name: 'Community', slug: 'community', sort_order: 39 },
  { name: 'Family', slug: 'family', sort_order: 40 },
]

const TESTAMENT_TAGS = [
  { name: 'Old Testament', slug: 'old-testament', sort_order: 51 },
  { name: 'New Testament', slug: 'new-testament', sort_order: 52 },
  { name: 'Psalms', slug: 'psalms', sort_order: 53 },
  { name: 'Gospels', slug: 'gospels', sort_order: 54 },
]

const ALL_TAGS = [
  ...SACRAMENT_TAGS,
  ...SECTION_TAGS,
  ...THEME_TAGS,
  ...TESTAMENT_TAGS
]
```

**Integration Points:**

1. **Parish Onboarding** (`seedEventTypesForParish` in `/src/lib/seeding/event-types-seed.ts`):
   ```typescript
   export async function seedEventTypesForParish(supabase, parishId) {
     // ... existing event type seeding

     // NEW: Seed content tags
     await seedContentTagsForParish(supabase, parishId)
   }
   ```

2. **Dev Seeder** (`scripts/dev-seed.ts`):
   ```typescript
   // After seeding event types
   console.log('Seeding content tags...')
   await seedContentTagsForParish(supabaseAdmin, parishId)
   console.log('Content tags seeded successfully')
   ```

### Hybrid Renderer Logic

**Location:** `/src/lib/utils/markdown-renderer.ts`

**Updates to existing `getDisplayValue` function:**

```typescript
// NEW: UUID validation helper
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isUUID(value: any): boolean {
  return typeof value === 'string' && UUID_REGEX.test(value)
}

// UPDATED: getDisplayValue function (add 'content' case)
function getDisplayValue(
  rawValue: any,
  fieldDef: InputFieldDefinition,
  resolvedEntities?: RenderMarkdownOptions['resolvedEntities']
): string {
  switch (fieldDef.type) {
    // ... existing cases (person, group, location, etc.)

    case 'content': {
      // NEW CASE: Handle content references
      if (isUUID(rawValue)) {
        // New content reference - fetch from resolvedEntities
        const content = resolvedEntities?.contents?.[rawValue]
        return content?.body || ''
      } else {
        // Legacy text value - use as-is
        return String(rawValue || '')
      }
    }

    case 'text':
    case 'rich_text': {
      // rawValue is string (legacy text fields)
      return String(rawValue || '')
    }

    // ... remaining cases
  }
}
```

**Updates to `RenderMarkdownOptions` interface:**

```typescript
export interface RenderMarkdownOptions {
  fieldValues: Record<string, any>
  inputFieldDefinitions: InputFieldDefinition[]
  resolvedEntities?: {
    people?: Record<string, Person>
    locations?: Record<string, any>
    groups?: Record<string, any>
    listItems?: Record<string, any>
    documents?: Record<string, any>
    contents?: Record<string, Content>  // NEW: Content lookup map
  }
  parish?: ParishInfo
  format?: 'html' | 'pdf' | 'word' | 'text'
}
```

**Server Action Updates** (`/src/lib/actions/dynamic-events.ts`):

The `getDynamicEventWithRelations` function must be updated to fetch and resolve content references:

```
FUNCTION getDynamicEventWithRelations(eventId)
  EXISTING LOGIC:
    - Fetch event
    - Fetch event_type with input_field_definitions
    - Resolve person/group/location/event_link/list_item/document references

  NEW LOGIC (add to resolution step):
    - Identify 'content' type fields
    - Extract content UUIDs from field_values
    - Fetch contents by IDs (WHERE id IN (...))
    - Add to resolvedEntities.contents map { [contentId]: Content }

  RETURN:
    - DynamicEventWithRelations (now includes resolvedEntities.contents)
```

**Pseudo-code for content resolution:**

```
// In getDynamicEventWithRelations function
const contentFieldDefs = inputFieldDefinitions.filter(def => def.type === 'content')
const contentIds = contentFieldDefs
  .map(def => event.field_values[def.name])
  .filter(isUUID) // Only fetch valid UUIDs (ignore legacy text)

IF contentIds.length > 0 THEN
  contents = FETCH FROM contents WHERE id IN (contentIds)
  resolvedEntities.contents = contents.reduce((map, content) => {
    map[content.id] = content
    return map
  }, {})
END IF
```

**Backward Compatibility:**

- Old events with text values: Renderer sees non-UUID string, uses it directly
- New events with content references: Renderer sees UUID, looks up in resolvedEntities.contents
- Mixed events: Some fields text, some content - works seamlessly
- No migration script needed - data remains as-is

### Settings Page Structure

**Location:** `/src/app/(main)/settings/content-library/`

**Page Structure:**

Following the standard 8-file module pattern (adapted for settings context):

1. **List Page (Server)** - `page.tsx`
   - Fetches contents with filters (search, language, tag)
   - Passes to client component

2. **List Client** - `contents-list-client.tsx`
   - Search/filter UI
   - Content grid with DataTable
   - Delete/Edit actions

3. **Create Page (Server)** - `create/page.tsx`
   - Auth + breadcrumbs
   - Renders ContentFormWrapper

4. **View Page (Server)** - `[id]/page.tsx`
   - Fetches content with tags
   - Displays content details + actions

5. **Edit Page (Server)** - `[id]/edit/page.tsx`
   - Fetches content with tags
   - Renders ContentFormWrapper

6. **Form Wrapper (Client)** - `content-form-wrapper.tsx`
   - PageContainer for form
   - Handles create/edit modes

7. **Unified Form (Client)** - `content-form.tsx`
   - Reusable form component (also used in picker)

8. **View Client** - `[id]/content-view-client.tsx`
   - Displays content details
   - Edit/Delete actions

**Additional Settings Sub-page:**

**Location:** `/src/app/(main)/settings/content-tags/`

Purpose: Admin-only tag management (CRUD, reorder)

Structure:
- `page.tsx` - List of tags with drag-and-drop reordering
- `create/page.tsx` - Create tag form
- `[id]/edit/page.tsx` - Edit tag form

**Navigation:**

Settings sidebar gets new items:

```typescript
{
  title: "Content Library",
  href: "/settings/content-library",
  icon: FileText,
  roles: ["admin", "staff"]
},
{
  title: "Content Tags",
  href: "/settings/content-tags",
  icon: Tag,
  roles: ["admin"]  // Admin only
}
```

### Testing Requirements

**Test Files:**

1. **`tests/content-library.spec.ts`** - E2E tests for content management
   - Create content with tags
   - Edit content and update tags
   - Delete content
   - Search and filter content
   - Tag management (admin only)

2. **`tests/content-picker.spec.ts`** - E2E tests for content picker
   - Open picker from event form
   - Filter by tags
   - Search content
   - Select content
   - Create new content from picker

3. **`tests/content-rendering.spec.ts`** - E2E tests for hybrid rendering
   - Create event with content reference
   - Export script with content placeholder
   - Verify content body appears in script
   - Test backward compatibility with text fields

**Test Scenarios:**

```
SCENARIO: Admin creates reusable content
  1. Navigate to Settings → Content Library
  2. Click "Create Content"
  3. Fill form: title, body (markdown), language, tags
  4. Save
  5. VERIFY: Content appears in list
  6. VERIFY: Tags displayed correctly

SCENARIO: Staff selects content in event form
  1. Navigate to Events → Create Funeral
  2. Scroll to "First Reading" field
  3. Click field to open picker
  4. VERIFY: Tags pre-selected (funeral, first-reading)
  5. VERIFY: Content list shows matching items
  6. Click content item
  7. Click "Use This Content"
  8. VERIFY: Field shows content title
  9. Save event
  10. VERIFY: Field value is UUID (not text)

SCENARIO: Hybrid rendering - new content reference
  1. Create event with content reference
  2. Export script as PDF
  3. VERIFY: Content body appears in PDF (not UUID)

SCENARIO: Hybrid rendering - legacy text value
  1. Load old event with text-based reading
  2. Export script as PDF
  3. VERIFY: Text appears in PDF (backward compatibility)

SCENARIO: Tag filtering with AND logic
  1. Open content picker
  2. Activate tags: funeral, first-reading, hope
  3. VERIFY: Only content with ALL 3 tags appears
  4. Deactivate one tag
  5. VERIFY: Content list updates

SCENARIO: Create content from picker
  1. Open content picker
  2. Click "Add New Content"
  3. VERIFY: Form pre-fills active filter tags
  4. Fill form and save
  5. VERIFY: Content created AND selected for event
```

### Documentation Updates

**Files to create/update:**

1. **NEW:** `/docs/CONTENT_LIBRARY.md`
   - Overview of content library system
   - Content management workflows
   - Tag taxonomy and usage
   - Picker integration patterns
   - Hybrid rendering logic

2. **UPDATE:** `/docs/MODULE_REGISTRY.md`
   - Add Settings → Content Library entry
   - Add Settings → Content Tags entry

3. **UPDATE:** `/docs/COMPONENT_REGISTRY.md`
   - Add ContentPicker component
   - Add ContentPickerField component
   - Add ContentForm component

4. **UPDATE:** `/docs/FORMS.md`
   - Add ContentPickerField usage pattern
   - Add example of 'content' type field in dynamic forms

5. **UPDATE:** `CLAUDE.md`
   - Add reference to CONTENT_LIBRARY.md in documentation section
   - Add content library to project features list

### Security Considerations

**RLS Policies:**

All tables enforce parish isolation:
- `contents`: Parish-scoped, Admin/Staff can CRUD
- `content_tags`: Parish-scoped, Admin can CRUD, Staff read-only
- `content_tag_assignments`: Parish-scoped, follows content permissions

**Permission Checks:**

Server actions verify:
- User is authenticated
- User belongs to parish
- User has required role (Admin or Staff for CRUD)

**Data Validation:**

- Title: Max 200 chars (prevent abuse)
- Body: Max 10,000 chars (reasonable for readings)
- Description: Max 200 chars
- Tag slug: Unique per parish (prevent duplicates)
- Language: Enum validation ('en' | 'es' only)

**Content Immutability Caveat:**

Edits to content items affect ALL events that reference them (see Q15). This is acceptable for MVP but should be documented clearly in UI with warning message:

> "Editing this content will update it in all events that use it. To create a variation, add a new content item instead."

### Implementation Complexity

**Complexity Rating:** Medium

**Reason:**

**Moderate complexity due to:**
- New database tables with many-to-many relationships (3 tables)
- RLS policies for multi-table structure
- Tag filtering with AND logic (requires JOIN queries)
- Hybrid renderer logic (UUID detection and content resolution)
- Content picker UI with toggle filters and pagination
- Integration with existing dynamic event system

**Reduced complexity because:**
- Follows existing patterns (pickers, form fields, settings pages)
- No versioning or revision history (deferred to future)
- No shared global library (parish-scoped only)
- Flat tag taxonomy (no hierarchies)
- Straightforward CRUD operations

**Key Technical Challenges:**

1. **Tag filtering performance** - AND logic with multiple JOINs may be slow with large content libraries (mitigated by indexes)
2. **Content resolution in renderer** - Must fetch contents for UUID placeholders without N+1 queries (batch fetch by IDs)
3. **Tag toggle UI** - Complex state management for active/inactive tags with real-time filtering
4. **Inline content creation in picker** - Modal state management for form within picker dialog

**Estimated Development Phases:**

1. Database migrations + seed data (1-2 days)
2. Server actions for contents and tags (2-3 days)
3. Content picker components (3-4 days)
4. Settings pages for content management (2-3 days)
5. Hybrid renderer updates (1-2 days)
6. Testing and refinement (2-3 days)

**Total: ~10-15 development days** (not including code review, documentation, or user testing)

### Dependencies and Blockers

**Dependencies:**

- Dynamic event system must be fully implemented (DONE - already in codebase)
- Input field definitions must support custom properties (DONE - `filter_tags` can be added)
- Markdown editor component exists (DONE - `markdown-editor.tsx`)
- Markdown renderer supports placeholder resolution (DONE - `markdown-renderer.ts`)

**Blockers:**

NONE - all prerequisites are met. Ready for implementation.

**Nice-to-Have (Future Enhancements):**

- Content versioning (copy-on-write for true immutability)
- Shared global library across parishes (requires new data model)
- Translation linking (link EN/ES versions of same content)
- Bulk import from external sources (Bible APIs, etc.)
- Content analytics (usage tracking, popularity)
- Advanced search (fuzzy matching, semantic search)

### Next Steps

**Status:** Ready for Development

**Hand-off to developer-agent:**

1. Review technical requirements in this document
2. Create database migration files:
   - `create_contents_table.sql`
   - `create_content_tags_table.sql`
   - `create_content_tag_assignments_table.sql`
   - `update_input_field_definitions_add_filter_tags.sql`
3. Implement TypeScript interfaces in `/src/lib/types.ts`
4. Implement server actions:
   - `/src/lib/actions/contents.ts`
   - `/src/lib/actions/content-tags.ts`
5. Create tag seeding function:
   - `/src/lib/seeding/content-tags-seed.ts`
6. Update markdown renderer:
   - Add 'content' case to `getDisplayValue`
   - Add content resolution to `getDynamicEventWithRelations`
7. Build picker components:
   - `/src/components/content-picker.tsx`
   - `/src/components/content-picker-field.tsx`
   - `/src/components/content-form.tsx`
8. Build settings pages:
   - `/src/app/(main)/settings/content-library/` (8-file structure)
   - `/src/app/(main)/settings/content-tags/` (CRUD pages)
9. Update event type seeding to include 'content' fields with filter_tags
10. Write E2E tests (3 test files)
11. Update documentation (5 files)

**Testing Checklist:**

- [ ] Create content with tags
- [ ] Edit content and update tags
- [ ] Delete content
- [ ] Admin-only tag management
- [ ] Content picker opens from event form
- [ ] Tag filtering (AND logic)
- [ ] Search content
- [ ] Select content and save event
- [ ] Create content from picker
- [ ] Export script with content reference (PDF/Word)
- [ ] Verify hybrid rendering (UUID vs text)
- [ ] Backward compatibility with old events

**Documentation Checklist:**

- [ ] Create CONTENT_LIBRARY.md
- [ ] Update MODULE_REGISTRY.md
- [ ] Update COMPONENT_REGISTRY.md
- [ ] Update FORMS.md
- [ ] Update CLAUDE.md
