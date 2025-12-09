# User-Defined Event Types - Requirements Document

**Status:** Ready for Development
**Created:** 2024 (brainstorming-agent)
**Technical Requirements Added:** 2025-12-09 (requirements-agent)

---

## Context

USCCB denied permission to use liturgical texts. This requires removing hardcoded liturgical content and creating a flexible system where users define their own event structures and templates.

## Core Terminology

| Term | Definition |
|------|------------|
| **Event Type** | User-defined category (Wedding, Funeral, Baptism, etc.) |
| **Input Field** | Data field for an event type (Person, Text, Date, etc.) |
| **Custom List** | Parish-defined option set (songs, readings, etc.) |
| **Section** | Rich text block with placeholders, belongs to one script |
| **Script** | Ordered collection of sections, exportable document |
| **Occasion** | Date/time/location entry attached to an event |
| **Event** | Instance of an event type |

## Key Decisions

### Architecture
- **Fully flexible** - No hardcoded event structure
- **Template-only** - No per-event customization of structure
- **Clean break** - Delete all old module code
- **One event type, multiple scripts** - For bilingual parishes

### Event Types
- Fully user-defined
- Has icon (from Lucide icon library)
- Has ordered input field definitions
- Has ordered scripts
- Order controlled by admin (for sidebar display)

### Input Field Types

| Type | Storage |
|------|---------|
| Person | References `people` table |
| Group | References `groups` table |
| Location | References `locations` table |
| Event Link | References `events` table (filtered by specified event type) |
| List Item | References `custom_list_items` table |
| Document | References `documents` table |
| Text | JSON |
| Rich Text | JSON |
| Date | JSON |
| Time | JSON |
| DateTime | JSON |
| Number | JSON |
| Yes/No | JSON |

### Input Field Properties
- Name (user-defined label)
- Type (from list above)
- Required (yes/no)
- List reference (if type is List Item)
- Event type filter (if type is Event Link)
- Key Person (checkbox, for Person type only - marks as searchable in list view)
- Order (drag to reorder)

### Sections
- Belong to one script only (not reusable across scripts)
- Properties:
  - Name
  - Content (Markdown with custom syntax)
  - Page break after (yes/no toggle)
  - Order

### Scripts
- Ordered collection of sections
- Belong to one event type
- Can have multiple scripts per event type (e.g., English Program, Spanish Program)
- Export formats: PDF, Word, Print, Text
- Order controlled by admin

### Occasions
- Attached to events
- Properties:
  - Label (e.g., "Rehearsal", "Ceremony", "Reception")
  - Date
  - Time
  - Location (references `locations` table)
  - Is Primary (boolean) - one occasion marked as primary per event
- Event does NOT have its own date/time - relies on occasions

### Documents
- Document is an input field type only
- No general attachments area
- File types: DOCX, PDF, and similar
- Documents are for reference only, not rendered in scripts

### Custom Lists
- Parish-defined option sets
- Managed in separate admin area
- Can also create inline while defining input fields
- Properties:
  - Name
  - Items (ordered list of values)

## Rich Text Editor (for Sections)

### Features
- Bold, italic, underline
- Headings (H1, H2, H3) - no manual font sizes
- Alignment (left, center, right)
- Lists (bullet, numbered)
- Text color (black/red only - liturgical colors)
- Insert Field button (shows available fields)

### Storage
- Markdown internally
- Custom syntax for red text: `{red}text{/red}`
- Text export outputs Markdown as-is
- PDF/Word/Print render Markdown to formatted output

### Placeholder Insertion
- Button/menu approach (not autocomplete)
- Click "Insert Field" -> see list -> click to insert `{{Field Name}}`

## Database Structure

### Tables

1. **event_types**
   - id, parish_id, name, icon, order, deleted_at

2. **input_field_definitions**
   - id, event_type_id, name, type, required, list_id (nullable), event_type_filter_id (nullable), is_key_person, order, deleted_at

3. **custom_lists**
   - id, parish_id, name, deleted_at

4. **custom_list_items**
   - id, list_id, value, order, deleted_at

5. **scripts**
   - id, event_type_id, name, order, deleted_at

6. **sections**
   - id, script_id, name, content (markdown), page_break_after, order, deleted_at

7. **events**
   - id, parish_id, event_type_id, field_values (JSON), created_at, updated_at, deleted_at

8. **occasions**
   - id, event_id, label, date, time, location_id, is_primary, deleted_at

9. **documents**
   - id, parish_id, file_path, file_name, file_type, uploaded_at, deleted_at

### Existing Tables (add deleted_at)
- people
- locations
- groups
- profiles
- (all other existing tables)

### JSON Column (field_values)
```json
{
  "Bride": "person_uuid",
  "Groom": "person_uuid",
  "Opening Song": "list_item_uuid",
  "Wedding Notes": "Some text here"
}
```

## Admin UI

### Sidebar (Admin Area)
- Event Types
- Custom Lists
- (existing admin items)

### Event Types List
- Shows all event types for parish
- Add new, reorder, edit, delete

### Event Type Detail
**Note:** Do NOT use horizontal tabs - use separate pages for mobile-friendliness.

Separate pages for:
- `/settings/event-types/[id]` - Settings (name, icon)
- `/settings/event-types/[id]/fields` - Input Fields (add/edit/reorder fields)
- `/settings/event-types/[id]/scripts` - Scripts (create/edit scripts)

### Script Builder
1. Name the script
2. Add sections (create new inline)
3. Drag to reorder sections
4. Preview rendered output
5. Export options

### Input Field Editor
1. Enter name
2. Pick type
3. If List type, select Custom List (or create new)
4. If Event Link type, select which event type to filter by
5. If Person type, checkbox for "Key Person"
6. Mark required or not
7. Save

### Deleting Event Types
- Warning dialog: "This will delete all events of this type. This cannot be undone."
- Hard delete for now (events, occasions, documents for those events)
- Database prepared for soft delete (deleted_at column) for future

### Editing Event Types (Removing Fields)
- Warning: "X events have data in this field. Data will be lost."
- Proceed or cancel
- If proceed, data stays in JSON but field no longer renders

## Sidebar Navigation (Main App)

- Dynamic based on parish's event types
- Flat list (no groupings)
- Order controlled by admin
- Every event type shows (no hiding option)

## Event Form (Create/Edit)

### Field Rendering
Form fields generated dynamically from event type's input field definitions:
- Person → PersonPickerField
- Group → GroupPicker
- Location → LocationPickerField
- Event Link → EventPickerField (filtered by specified event type)
- List Item → Dropdown from custom list
- Document → File upload
- Text → Text input
- Rich Text → Text area
- Date → Date picker
- Time → Time picker
- DateTime → DateTime picker
- Number → Number input
- Yes/No → Toggle/checkbox

### Occasions Section
- Separate area on form
- Add occasion button
- Each occasion: label, date, time, location picker
- Mark one as primary
- Drag to reorder

## Event View Page

### Header
- Event type icon + name
- Primary occasion date/time/location
- Action buttons (Edit, Delete, Export scripts)

### Field Values Section
- Flat list in admin-defined order
- Person fields show name
- Location fields show location name
- List items show selected value
- Documents show filename with download link

### Occasions Section
- List of all occasions
- Each shows: label, date, time, location
- Primary marked (badge or star)

### Scripts Section
- List available scripts for this event type
- Preview button for each
- Export buttons (PDF, Word, Print, Text)

## Event List Page

### Display
- Columns: Primary occasion date + Key person names
- No admin configuration needed

### Filtering
- Date range (based on primary occasion)
- Search text (searches key person names)

## Onboarding (New Parishes)

**Starter templates approach:**
- Pre-built event types (Wedding, Funeral, Baptism, Quinceañera, Presentation, etc.)
- Input fields already defined
- Scripts with sections containing public domain prayers/texts
- Custom lists pre-populated where possible
- User can modify or delete anything

Include actual content where rights allow:
- Quinceañera prayer
- Presentation prayer
- Other public domain texts

## Modules That Remain

The following modules stay as separate sections (reference data):
- People
- Groups
- Locations

## Calendar Integration

Deferred until core system works.

## Migration Plan

Delete all old module code (Weddings, Funerals, Baptisms, etc.). Clean break.

---

## TECHNICAL REQUIREMENTS
(Added by requirements-agent)

### Database Schema

#### New Tables

**1. event_types**
```
TABLE: event_types
  - id: UUID primary key
  - parish_id: UUID foreign key to parishes (NOT NULL)
  - name: TEXT (NOT NULL) - user-defined name like "Wedding", "Funeral", etc.
  - icon: TEXT (NOT NULL) - Lucide icon name (e.g., "Heart", "Cross", "Droplet")
  - order: INTEGER (NOT NULL) - controls sidebar display order
  - deleted_at: TIMESTAMPTZ (nullable) - for soft delete (future use)
  - created_at: TIMESTAMPTZ (NOT NULL, default now())
  - updated_at: TIMESTAMPTZ (NOT NULL, default now())

INDEXES:
  - idx_event_types_parish_id ON parish_id
  - idx_event_types_order ON (parish_id, order) WHERE deleted_at IS NULL

RLS POLICIES:
  - Parish members can read event types for their parish
  - Admin role can create/update/delete event types
  - Staff and Ministry-Leader roles: read-only access

CONSTRAINTS:
  - UNIQUE (parish_id, name) WHERE deleted_at IS NULL
  - CHECK (order >= 0)
```

**2. input_field_definitions**
```
TABLE: input_field_definitions
  - id: UUID primary key
  - event_type_id: UUID foreign key to event_types (NOT NULL, ON DELETE CASCADE)
  - name: TEXT (NOT NULL) - user-defined field label like "Bride", "Deceased", "Opening Song"
  - type: TEXT (NOT NULL) - one of: 'person', 'group', 'location', 'event_link', 'list_item', 'document', 'text', 'rich_text', 'date', 'time', 'datetime', 'number', 'yes_no'
  - required: BOOLEAN (NOT NULL, default false)
  - list_id: UUID foreign key to custom_lists (nullable, ON DELETE SET NULL) - for 'list_item' type
  - event_type_filter_id: UUID foreign key to event_types (nullable, ON DELETE SET NULL) - for 'event_link' type
  - is_key_person: BOOLEAN (NOT NULL, default false) - only for 'person' type, marks as searchable
  - order: INTEGER (NOT NULL) - controls form field display order
  - deleted_at: TIMESTAMPTZ (nullable)
  - created_at: TIMESTAMPTZ (NOT NULL, default now())
  - updated_at: TIMESTAMPTZ (NOT NULL, default now())

INDEXES:
  - idx_input_field_definitions_event_type_id ON event_type_id
  - idx_input_field_definitions_list_id ON list_id
  - idx_input_field_definitions_order ON (event_type_id, order) WHERE deleted_at IS NULL

RLS POLICIES:
  - Parish members can read field definitions for their parish's event types
  - Admin role can create/update/delete field definitions
  - Staff and Ministry-Leader roles: read-only access

CONSTRAINTS:
  - CHECK (type IN ('person', 'group', 'location', 'event_link', 'list_item', 'document', 'text', 'rich_text', 'date', 'time', 'datetime', 'number', 'yes_no'))
  - CHECK (order >= 0)
  - CHECK (is_key_person = false OR type = 'person') - is_key_person only allowed for person type
```

**3. custom_lists**
```
TABLE: custom_lists
  - id: UUID primary key
  - parish_id: UUID foreign key to parishes (NOT NULL)
  - name: TEXT (NOT NULL) - user-defined name like "Wedding Songs", "Readings"
  - deleted_at: TIMESTAMPTZ (nullable)
  - created_at: TIMESTAMPTZ (NOT NULL, default now())
  - updated_at: TIMESTAMPTZ (NOT NULL, default now())

INDEXES:
  - idx_custom_lists_parish_id ON parish_id

RLS POLICIES:
  - Parish members can read custom lists for their parish
  - Admin role can create/update/delete custom lists
  - Staff and Ministry-Leader roles can create/update/delete (needed for inline creation)

CONSTRAINTS:
  - UNIQUE (parish_id, name) WHERE deleted_at IS NULL
```

**4. custom_list_items**
```
TABLE: custom_list_items
  - id: UUID primary key
  - list_id: UUID foreign key to custom_lists (NOT NULL, ON DELETE CASCADE)
  - value: TEXT (NOT NULL) - the option text
  - order: INTEGER (NOT NULL) - controls dropdown order
  - deleted_at: TIMESTAMPTZ (nullable)
  - created_at: TIMESTAMPTZ (NOT NULL, default now())

INDEXES:
  - idx_custom_list_items_list_id ON list_id
  - idx_custom_list_items_order ON (list_id, order) WHERE deleted_at IS NULL

RLS POLICIES:
  - Parish members can read list items for their parish's lists
  - Admin role can create/update/delete list items
  - Staff and Ministry-Leader roles can create/update/delete

CONSTRAINTS:
  - CHECK (order >= 0)
```

**5. scripts**
```
TABLE: scripts
  - id: UUID primary key
  - event_type_id: UUID foreign key to event_types (NOT NULL, ON DELETE CASCADE)
  - name: TEXT (NOT NULL) - e.g., "English Program", "Spanish Program", "Bulletin Notice"
  - order: INTEGER (NOT NULL) - controls display order in UI
  - deleted_at: TIMESTAMPTZ (nullable)
  - created_at: TIMESTAMPTZ (NOT NULL, default now())
  - updated_at: TIMESTAMPTZ (NOT NULL, default now())

INDEXES:
  - idx_scripts_event_type_id ON event_type_id
  - idx_scripts_order ON (event_type_id, order) WHERE deleted_at IS NULL

RLS POLICIES:
  - Parish members can read scripts for their parish's event types
  - Admin role can create/update/delete scripts
  - Staff and Ministry-Leader roles: read-only access

CONSTRAINTS:
  - CHECK (order >= 0)
```

**6. sections**
```
TABLE: sections
  - id: UUID primary key
  - script_id: UUID foreign key to scripts (NOT NULL, ON DELETE CASCADE)
  - name: TEXT (NOT NULL) - section heading like "Opening Prayer", "Readings"
  - content: TEXT (NOT NULL) - Markdown with custom syntax and {{Field Name}} placeholders
  - page_break_after: BOOLEAN (NOT NULL, default false) - insert page break after this section
  - order: INTEGER (NOT NULL) - controls section order in script
  - deleted_at: TIMESTAMPTZ (nullable)
  - created_at: TIMESTAMPTZ (NOT NULL, default now())
  - updated_at: TIMESTAMPTZ (NOT NULL, default now())

INDEXES:
  - idx_sections_script_id ON script_id
  - idx_sections_order ON (script_id, order) WHERE deleted_at IS NULL

RLS POLICIES:
  - Parish members can read sections for their parish's scripts
  - Admin role can create/update/delete sections
  - Staff and Ministry-Leader roles: read-only access

CONSTRAINTS:
  - CHECK (order >= 0)
```

**7. events (REPLACES existing events table)**
```
TABLE: events
  - id: UUID primary key
  - parish_id: UUID foreign key to parishes (NOT NULL)
  - event_type_id: UUID foreign key to event_types (NOT NULL, ON DELETE RESTRICT)
  - field_values: JSONB (NOT NULL, default '{}') - dynamic key-value pairs
  - created_at: TIMESTAMPTZ (NOT NULL, default now())
  - updated_at: TIMESTAMPTZ (NOT NULL, default now())
  - deleted_at: TIMESTAMPTZ (nullable)

INDEXES:
  - idx_events_parish_id ON parish_id
  - idx_events_event_type_id ON event_type_id
  - GIN index on field_values for JSON queries

RLS POLICIES:
  - Parish members can read events for their parish
  - Admin, Staff, and Ministry-Leader (with module access) can create/update/delete
  - Parishioner role: read-only for shared events only

CONSTRAINTS:
  - ON DELETE RESTRICT for event_type_id (prevent deletion of event types with events)

NOTES:
  - This replaces the existing generic 'events' table
  - Old 'events' table columns (event_type_id, start_date, end_date, location_id, etc.) are now replaced by field_values JSON + occasions
```

**8. occasions**
```
TABLE: occasions
  - id: UUID primary key
  - event_id: UUID foreign key to events (NOT NULL, ON DELETE CASCADE)
  - label: TEXT (NOT NULL) - e.g., "Ceremony", "Rehearsal", "Reception"
  - date: DATE (nullable)
  - time: TIME (nullable)
  - location_id: UUID foreign key to locations (nullable, ON DELETE SET NULL)
  - is_primary: BOOLEAN (NOT NULL, default false) - one primary occasion per event
  - deleted_at: TIMESTAMPTZ (nullable)
  - created_at: TIMESTAMPTZ (NOT NULL, default now())

INDEXES:
  - idx_occasions_event_id ON event_id
  - idx_occasions_date ON (event_id, date) WHERE deleted_at IS NULL
  - idx_occasions_primary ON event_id WHERE is_primary = true AND deleted_at IS NULL

RLS POLICIES:
  - Inherits from parent event (users with event access can access occasions)

CONSTRAINTS:
  - UNIQUE index on (event_id, is_primary) WHERE is_primary = true AND deleted_at IS NULL
    (ensures only one primary occasion per event)
```

**9. documents**
```
TABLE: documents
  - id: UUID primary key
  - parish_id: UUID foreign key to parishes (NOT NULL)
  - file_path: TEXT (NOT NULL) - Supabase Storage path
  - file_name: TEXT (NOT NULL) - original filename
  - file_type: TEXT (NOT NULL) - MIME type
  - file_size: INTEGER (NOT NULL) - bytes
  - uploaded_at: TIMESTAMPTZ (NOT NULL, default now())
  - deleted_at: TIMESTAMPTZ (nullable)

INDEXES:
  - idx_documents_parish_id ON parish_id

RLS POLICIES:
  - Parish members can read documents for their parish
  - Admin, Staff, and Ministry-Leader roles can upload/delete documents

STORAGE BUCKET:
  - Bucket name: 'event-documents'
  - Path structure: {parish_id}/{document_id}/{filename}
  - Public access: false (authenticated only)
```

#### Existing Tables - Add deleted_at Column

All existing tables need a `deleted_at TIMESTAMPTZ` column for soft delete support:
- people
- locations
- groups
- group_members
- group_roles
- parish_users
- parishes
- parish_settings
- user_settings
- readings
- masses
- mass_types
- mass_roles
- mass_role_members
- mass_role_templates
- mass_role_template_items
- mass_times_templates
- mass_times_template_items
- mass_intentions
- petition_templates
- (any other existing tables)

**Migration Strategy:**
```sql
-- Example migration for adding deleted_at to existing tables
ALTER TABLE people ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
-- Repeat for all tables
```

**Important Notes:**
- Do NOT add deleted_at to pivot/join tables like group_members, mass_role_template_items
- Update all RLS policies to exclude deleted_at IS NOT NULL records
- Update all queries to filter WHERE deleted_at IS NULL

### Server Actions

All server actions follow the pattern from `/Users/joshmccarty/Code-2022M1/outwardsign/src/lib/actions/weddings.ts`

#### Location: `src/lib/actions/event-types.ts`

**CRUD Operations:**
```
FUNCTION getEventTypes(filters?: EventTypeFilterParams)
  1. Require selected parish and JWT claims
  2. Query event_types table filtered by parish_id
  3. Apply filters: search (by name), sort (by order, name, created_at)
  4. Filter WHERE deleted_at IS NULL
  5. Return EventType[]
END FUNCTION

FUNCTION getEventType(id: string)
  1. Require selected parish and JWT claims
  2. Query single event_type by id
  3. Verify belongs to user's parish
  4. Return EventType | null
END FUNCTION

FUNCTION getEventTypeWithRelations(id: string)
  1. Fetch base event type
  2. Use Promise.all to fetch in parallel:
     - input_field_definitions (ordered by 'order')
     - scripts (ordered by 'order')
  3. For each input field definition of type 'list_item', fetch custom_list
  4. Return EventTypeWithRelations
END FUNCTION

FUNCTION createEventType(data: CreateEventTypeData)
  1. Check permissions: requireManageParishSettings (admin only)
  2. Validate with Zod schema
  3. Get max order from existing event types, increment by 1
  4. Insert into event_types with parish_id, order
  5. Revalidate paths: /settings/event-types, /dashboard
  6. Return EventType
END FUNCTION

FUNCTION updateEventType(id: string, data: UpdateEventTypeData)
  1. Check permissions: requireManageParishSettings (admin only)
  2. Validate with Zod schema
  3. Update event_type record
  4. Revalidate paths: /settings/event-types/{id}, /settings/event-types
  5. Return EventType
END FUNCTION

FUNCTION deleteEventType(id: string)
  1. Check permissions: requireManageParishSettings (admin only)
  2. Check for existing events: SELECT COUNT from events WHERE event_type_id = id
  3. IF count > 0 THEN
       Throw error: "Cannot delete event type with existing events. Delete events first."
     END IF
  4. Hard delete: DELETE FROM event_types WHERE id = id
  5. Cascade will delete: input_field_definitions, scripts, sections
  6. Revalidate path: /settings/event-types
  7. Return void
END FUNCTION

FUNCTION reorderEventTypes(orderedIds: string[])
  1. Check permissions: requireManageParishSettings (admin only)
  2. For each id in orderedIds:
       UPDATE event_types SET order = index WHERE id = id
     END FOR
  3. Revalidate path: /settings/event-types, /dashboard
  4. Return void
END FUNCTION
```

**TypeScript Interfaces:**
```typescript
export interface EventType {
  id: string
  parish_id: string
  name: string
  icon: string
  order: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface EventTypeWithRelations extends EventType {
  input_field_definitions: InputFieldDefinition[]
  scripts: Script[]
}

export interface CreateEventTypeData {
  name: string
  icon: string
  // order calculated automatically
}

export interface UpdateEventTypeData {
  name?: string
  icon?: string
}
```

#### Location: `src/lib/actions/input-field-definitions.ts`

**CRUD Operations:**
```
FUNCTION getInputFieldDefinitions(eventTypeId: string)
  1. Require selected parish and JWT claims
  2. Query input_field_definitions WHERE event_type_id = eventTypeId
  3. Order by 'order' ASC
  4. Filter WHERE deleted_at IS NULL
  5. Return InputFieldDefinition[]
END FUNCTION

FUNCTION getInputFieldDefinitionWithRelations(id: string)
  1. Fetch base field definition
  2. IF type = 'list_item' AND list_id IS NOT NULL THEN
       Fetch custom_list and custom_list_items
     END IF
  3. IF type = 'event_link' AND event_type_filter_id IS NOT NULL THEN
       Fetch event_type
     END IF
  4. Return InputFieldDefinitionWithRelations
END FUNCTION

FUNCTION createInputFieldDefinition(data: CreateInputFieldDefinitionData)
  1. Check permissions: requireManageParishSettings (admin only)
  2. Validate with Zod schema
  3. IF type = 'person' AND is_key_person = true THEN
       Valid (is_key_person only for person type)
     ELSE IF type != 'person' AND is_key_person = true THEN
       Throw error: "is_key_person only valid for person type"
     END IF
  4. Get max order for event_type_id, increment by 1
  5. Insert into input_field_definitions
  6. Revalidate paths: /settings/event-types/{event_type_id}
  7. Return InputFieldDefinition
END FUNCTION

FUNCTION updateInputFieldDefinition(id: string, data: UpdateInputFieldDefinitionData)
  1. Check permissions: requireManageParishSettings (admin only)
  2. Validate with Zod schema
  3. Update field definition
  4. Revalidate paths
  5. Return InputFieldDefinition
END FUNCTION

FUNCTION deleteInputFieldDefinition(id: string)
  1. Check permissions: requireManageParishSettings (admin only)
  2. Get event_type_id from field definition
  3. Query events WHERE event_type_id matches
  4. Count events where field_values JSON contains this field's name
  5. IF count > 0 THEN
       Show warning: "X events have data in this field. Data will be lost."
       User must confirm
     END IF
  6. Hard delete: DELETE FROM input_field_definitions WHERE id = id
  7. Data remains in field_values JSON but won't render
  8. Revalidate paths
  9. Return void
END FUNCTION

FUNCTION reorderInputFieldDefinitions(eventTypeId: string, orderedIds: string[])
  1. Check permissions: requireManageParishSettings (admin only)
  2. For each id in orderedIds:
       UPDATE input_field_definitions SET order = index
       WHERE id = id AND event_type_id = eventTypeId
     END FOR
  3. Revalidate paths
  4. Return void
END FUNCTION
```

**TypeScript Interfaces:**
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
  order: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface InputFieldDefinitionWithRelations extends InputFieldDefinition {
  custom_list?: CustomList | null
  event_type_filter?: EventType | null
}

export interface CreateInputFieldDefinitionData {
  event_type_id: string
  name: string
  type: InputFieldType
  required: boolean
  list_id?: string | null
  event_type_filter_id?: string | null
  is_key_person?: boolean
}

export interface UpdateInputFieldDefinitionData {
  name?: string
  type?: InputFieldType
  required?: boolean
  list_id?: string | null
  event_type_filter_id?: string | null
  is_key_person?: boolean
}
```

#### Location: `src/lib/actions/custom-lists.ts`

**CRUD Operations:**
```
FUNCTION getCustomLists(filters?: CustomListFilterParams)
  1. Require selected parish and JWT claims
  2. Query custom_lists filtered by parish_id
  3. Apply filters: search (by name), sort
  4. Filter WHERE deleted_at IS NULL
  5. Return CustomList[]
END FUNCTION

FUNCTION getCustomListWithItems(id: string)
  1. Fetch custom_list
  2. Fetch custom_list_items WHERE list_id = id, ordered by 'order'
  3. Return CustomListWithItems
END FUNCTION

FUNCTION createCustomList(data: CreateCustomListData)
  1. Check permissions: requireEditSharedResources (admin, staff, ministry-leader)
  2. Validate with Zod schema
  3. Insert into custom_lists with parish_id
  4. Return CustomList
END FUNCTION

FUNCTION updateCustomList(id: string, data: UpdateCustomListData)
  1. Check permissions: requireEditSharedResources
  2. Validate with Zod schema
  3. Update custom_list
  4. Return CustomList
END FUNCTION

FUNCTION deleteCustomList(id: string)
  1. Check permissions: requireEditSharedResources
  2. Check for usage: SELECT COUNT from input_field_definitions WHERE list_id = id
  3. IF count > 0 THEN
       Throw error: "Cannot delete custom list in use by field definitions"
     END IF
  4. Hard delete: DELETE FROM custom_lists WHERE id = id
  5. Cascade will delete: custom_list_items
  6. Return void
END FUNCTION
```

#### Location: `src/lib/actions/custom-list-items.ts`

**CRUD Operations:**
```
FUNCTION createCustomListItem(listId: string, data: CreateCustomListItemData)
  1. Check permissions: requireEditSharedResources
  2. Get max order for list_id, increment by 1
  3. Insert into custom_list_items
  4. Return CustomListItem
END FUNCTION

FUNCTION updateCustomListItem(id: string, data: UpdateCustomListItemData)
  1. Check permissions: requireEditSharedResources
  2. Update custom_list_item
  3. Return CustomListItem
END FUNCTION

FUNCTION deleteCustomListItem(id: string)
  1. Check permissions: requireEditSharedResources
  2. Check for usage in events' field_values JSON
  3. IF used THEN
       Show warning: "X events use this value. Data will be affected."
       User must confirm
     END IF
  4. Hard delete: DELETE FROM custom_list_items WHERE id = id
  5. Events will show NULL or empty for this value
  6. Return void
END FUNCTION

FUNCTION reorderCustomListItems(listId: string, orderedIds: string[])
  1. Check permissions: requireEditSharedResources
  2. For each id in orderedIds:
       UPDATE custom_list_items SET order = index WHERE id = id AND list_id = listId
     END FOR
  3. Return void
END FUNCTION
```

#### Location: `src/lib/actions/scripts.ts`

**CRUD Operations:**
```
FUNCTION getScripts(eventTypeId: string)
  1. Require selected parish and JWT claims
  2. Query scripts WHERE event_type_id = eventTypeId
  3. Order by 'order' ASC
  4. Filter WHERE deleted_at IS NULL
  5. Return Script[]
END FUNCTION

FUNCTION getScriptWithSections(id: string)
  1. Fetch base script
  2. Fetch sections WHERE script_id = id, ordered by 'order'
  3. Return ScriptWithSections
END FUNCTION

FUNCTION createScript(data: CreateScriptData)
  1. Check permissions: requireManageParishSettings (admin only)
  2. Get max order for event_type_id, increment by 1
  3. Insert into scripts
  4. Return Script
END FUNCTION

FUNCTION updateScript(id: string, data: UpdateScriptData)
  1. Check permissions: requireManageParishSettings
  2. Update script
  3. Return Script
END FUNCTION

FUNCTION deleteScript(id: string)
  1. Check permissions: requireManageParishSettings
  2. Hard delete: DELETE FROM scripts WHERE id = id
  3. Cascade will delete: sections
  4. Return void
END FUNCTION

FUNCTION reorderScripts(eventTypeId: string, orderedIds: string[])
  1. Check permissions: requireManageParishSettings
  2. For each id in orderedIds:
       UPDATE scripts SET order = index WHERE id = id AND event_type_id = eventTypeId
     END FOR
  3. Return void
END FUNCTION
```

#### Location: `src/lib/actions/sections.ts`

**CRUD Operations:**
```
FUNCTION createSection(scriptId: string, data: CreateSectionData)
  1. Check permissions: requireManageParishSettings
  2. Get max order for script_id, increment by 1
  3. Insert into sections
  4. Return Section
END FUNCTION

FUNCTION updateSection(id: string, data: UpdateSectionData)
  1. Check permissions: requireManageParishSettings
  2. Update section (name, content, page_break_after)
  3. Return Section
END FUNCTION

FUNCTION deleteSection(id: string)
  1. Check permissions: requireManageParishSettings
  2. Hard delete: DELETE FROM sections WHERE id = id
  3. Return void
END FUNCTION

FUNCTION reorderSections(scriptId: string, orderedIds: string[])
  1. Check permissions: requireManageParishSettings
  2. For each id in orderedIds:
       UPDATE sections SET order = index WHERE id = id AND script_id = scriptId
     END FOR
  3. Return void
END FUNCTION
```

#### Location: `src/lib/actions/dynamic-events.ts` (NEW - replaces all module actions)

**CRUD Operations:**
```
FUNCTION getEvents(eventTypeId: string, filters?: EventFilterParams)
  1. Require selected parish and JWT claims
  2. Query events WHERE parish_id = parish AND event_type_id = eventTypeId
  3. Filter WHERE deleted_at IS NULL
  4. Apply pagination (offset, limit)
  5. For search filter:
     - Get input field definitions for this event type WHERE is_key_person = true
     - For each key person field:
       - Extract person_id from field_values JSON
       - Fetch person record
       - Search on person.full_name
  6. For date range filter:
     - Join with occasions table WHERE is_primary = true
     - Filter on occasions.date
  7. Return Event[]
END FUNCTION

FUNCTION getEvent(id: string)
  1. Require selected parish and JWT claims
  2. Query single event by id
  3. Verify belongs to user's parish
  4. Return Event | null
END FUNCTION

FUNCTION getEventWithRelations(id: string)
  1. Fetch base event
  2. Fetch event_type with input_field_definitions
  3. Fetch occasions for this event (ordered by date)
  4. For each field in field_values JSON:
     - Get field definition from input_field_definitions
     - IF type = 'person' THEN fetch person record
     - IF type = 'group' THEN fetch group record
     - IF type = 'location' THEN fetch location record
     - IF type = 'event_link' THEN fetch linked event
     - IF type = 'list_item' THEN fetch custom_list_item
     - IF type = 'document' THEN fetch document
  5. Return EventWithRelations (includes resolved references)
END FUNCTION

FUNCTION createEvent(eventTypeId: string, data: CreateEventData)
  1. Check permissions: requireModuleAccess (check if user has access to this event type)
  2. Validate required fields against input_field_definitions
  3. Insert into events with parish_id, event_type_id, field_values JSON
  4. IF occasions provided THEN
       Insert occasions (ensure one is marked is_primary = true)
     END IF
  5. Revalidate paths: /events/{event_type_id}
  6. Return Event
END FUNCTION

FUNCTION updateEvent(id: string, data: UpdateEventData)
  1. Check permissions: requireModuleAccess
  2. Validate field_values against input_field_definitions
  3. Update events record
  4. IF occasions provided THEN
       Update/delete/insert occasions as needed
       Ensure one occasion is marked is_primary = true
     END IF
  5. Revalidate paths
  6. Return Event
END FUNCTION

FUNCTION deleteEvent(id: string)
  1. Check permissions: requireModuleAccess
  2. Hard delete: DELETE FROM events WHERE id = id
  3. Cascade will delete: occasions
  4. Documents remain (may be referenced by other events)
  5. Revalidate paths
  6. Return void
END FUNCTION
```

**TypeScript Interfaces:**
```typescript
export interface Event {
  id: string
  parish_id: string
  event_type_id: string
  field_values: Record<string, any> // JSON object
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface EventWithRelations extends Event {
  event_type: EventType
  occasions: Occasion[]
  resolved_fields: Record<string, ResolvedFieldValue> // field_values with references resolved
}

export interface ResolvedFieldValue {
  field_name: string
  field_type: InputFieldType
  raw_value: any
  resolved_value?: Person | Group | Location | Event | CustomListItem | Document | null
}

export interface CreateEventData {
  field_values: Record<string, any>
  occasions?: CreateOccasionData[]
}

export interface UpdateEventData {
  field_values?: Record<string, any>
  occasions?: (CreateOccasionData | UpdateOccasionData)[]
}
```

#### Location: `src/lib/actions/occasions.ts`

**CRUD Operations:**
```
FUNCTION getOccasions(eventId: string)
  1. Require selected parish and JWT claims
  2. Query occasions WHERE event_id = eventId
  3. Order by date ASC, then created_at ASC
  4. Filter WHERE deleted_at IS NULL
  5. For each occasion, fetch location if location_id present
  6. Return Occasion[]
END FUNCTION

FUNCTION createOccasion(eventId: string, data: CreateOccasionData)
  1. Check permissions: requireModuleAccess (check access to parent event)
  2. IF is_primary = true THEN
       UPDATE occasions SET is_primary = false WHERE event_id = eventId
     END IF
  3. Insert into occasions
  4. Return Occasion
END FUNCTION

FUNCTION updateOccasion(id: string, data: UpdateOccasionData)
  1. Check permissions: requireModuleAccess
  2. IF is_primary = true THEN
       Get event_id from this occasion
       UPDATE occasions SET is_primary = false WHERE event_id = event_id AND id != id
     END IF
  3. Update occasion
  4. Return Occasion
END FUNCTION

FUNCTION deleteOccasion(id: string)
  1. Check permissions: requireModuleAccess
  2. Get occasion to check if is_primary
  3. IF is_primary = true THEN
       Get event_id
       Count remaining occasions for event
       IF count > 1 THEN
         Throw error: "Cannot delete primary occasion. Mark another as primary first."
       END IF
     END IF
  4. Hard delete: DELETE FROM occasions WHERE id = id
  5. Return void
END FUNCTION
```

#### Location: `src/lib/actions/documents.ts`

**CRUD Operations:**
```
FUNCTION uploadDocument(file: File, parishId: string)
  1. Check permissions: requireEditSharedResources
  2. Validate file type (allow: .docx, .pdf, common office formats)
  3. Validate file size (max: 10MB)
  4. Generate unique document ID
  5. Upload to Supabase Storage:
       Bucket: 'event-documents'
       Path: {parish_id}/{document_id}/{filename}
  6. Insert into documents table
  7. Return Document
END FUNCTION

FUNCTION getDocumentSignedUrl(documentId: string)
  1. Require selected parish and JWT claims
  2. Fetch document record
  3. Verify belongs to user's parish
  4. Get signed URL from Supabase Storage (expires in 60 minutes)
  5. Return signed URL string
END FUNCTION

FUNCTION deleteDocument(id: string)
  1. Check permissions: requireEditSharedResources
  2. Fetch document to get file_path
  3. Delete from Supabase Storage
  4. Delete from documents table
  5. Note: field_values JSON will contain null/invalid reference
  6. Return void
END FUNCTION
```

### UI Components

#### Admin Area - Event Types Management

**Location: `/Users/joshmccarty/Code-2022M1/outwardsign/src/app/(admin)/settings/event-types/`**

**Note:** Admin area does not currently exist. Need to create `(admin)` route group with admin-only middleware.

**Files Needed:**
1. `page.tsx` (server) - Event types list page
2. `event-types-list-client.tsx` (client) - List UI with drag-and-drop reordering
3. `create/page.tsx` (server) - Create new event type
4. `[id]/page.tsx` (server) - Event type detail with tabs
5. `[id]/event-type-detail-client.tsx` (client) - Tabbed interface
6. `[id]/edit/page.tsx` (server) - Edit event type settings

**Event Types List (`event-types-list-client.tsx`):**
```
COMPONENT EventTypesListClient
  Props: initialEventTypes: EventType[]

  State:
    - eventTypes (optimistic updates during reorder)
    - draggedItem

  UI STRUCTURE:
    - PageContainer with title "Event Types"
    - Empty state: "No event types yet. Create your first event type to get started."
    - List of event type cards (drag-and-drop enabled)
    - Each card shows:
      - Drag handle (GripVertical icon)
      - Event type icon (from Lucide)
      - Event type name
      - Edit button (navigate to detail page)
      - Delete button (with confirmation dialog)
    - "Create Event Type" button (bottom or top)

  DRAG-AND-DROP:
    - Use @dnd-kit/core and @dnd-kit/sortable
    - Pattern from /Users/joshmccarty/Code-2022M1/outwardsign/docs/DRAG_AND_DROP.md
    - On drag end: call reorderEventTypes server action
    - Optimistic UI update

  DELETE CONFIRMATION:
    - Dialog: "This will delete all events of this type. This cannot be undone."
    - If events exist for this type: "X events will be deleted"
    - Require explicit confirmation
END COMPONENT
```

**Event Type Detail - Settings Page (`[id]/page.tsx` and `event-type-settings-client.tsx`):**
```
COMPONENT EventTypeSettingsClient
  Props: eventType: EventType

  UI STRUCTURE:
    - PageContainer with title "Event Type Settings"
    - Navigation links to other pages (Fields, Scripts)
    - Event type name (text input)
    - Icon selector (dropdown of Lucide icon names with preview)
    - Save button
    - Delete Event Type button (with confirmation dialog)
END COMPONENT
```

**Event Type Detail - Input Fields Page (`[id]/fields/page.tsx` and `event-type-fields-client.tsx`):**
```
COMPONENT EventTypeFieldsClient
  Props: eventType: EventType, inputFields: InputFieldDefinition[]

  UI STRUCTURE:
    - PageContainer with title "Input Fields"
    - Navigation links to other pages (Settings, Scripts)
    - List of input field definitions (drag-and-drop enabled)
    - Each field shows:
      - Drag handle
      - Field name
      - Field type badge
      - Required badge (if required)
      - Key Person badge (if is_key_person = true)
      - Edit button
      - Delete button
    - "Add Input Field" button
    - Opens modal/dialog for field editor

  INPUT FIELD EDITOR DIALOG:
    - Field name (text input)
    - Field type (select dropdown with all types)
    - Required checkbox
    - IF type = 'person' THEN
        Show "Key Person" checkbox
      END IF
    - IF type = 'list_item' THEN
        Show custom list selector
        Show "Create New List" inline option
      END IF
    - IF type = 'event_link' THEN
        Show event type filter selector
      END IF
    - Save button
    - Cancel button

  DELETE FIELD CONFIRMATION:
    - Check if field is used in events
    - IF used THEN
        Dialog: "X events have data in this field. Data will be lost."
      ELSE
        Dialog: "Delete this field?"
      END IF
    - Require confirmation
END COMPONENT
```

**Event Type Detail - Scripts Page (`[id]/scripts/page.tsx` and `event-type-scripts-client.tsx`):**
```
COMPONENT EventTypeScriptsClient
  Props: eventType: EventType, scripts: Script[]

  UI STRUCTURE:
    - PageContainer with title "Scripts"
    - Navigation links to other pages (Settings, Fields)
    - List of scripts (drag-and-drop enabled)
    - Each script shows:
      - Drag handle
      - Script name
      - Section count
      - Edit button (navigate to script builder)
      - Delete button
    - "Create Script" button
END COMPONENT
```

**Script Builder (`[id]/scripts/[script_id]/page.tsx` and client):**
```
COMPONENT ScriptBuilderClient
  Props: script: ScriptWithSections, inputFields: InputFieldDefinition[]

  UI STRUCTURE:
    - PageContainer with title "Script Builder: {script.name}"
    - Script name input (editable)
    - Section list (drag-and-drop enabled)
    - Each section shows:
      - Drag handle
      - Section name
      - Content preview (first 100 chars)
      - Page break indicator (if page_break_after = true)
      - Edit button (opens section editor)
      - Delete button
    - "Add Section" button
    - "Preview Script" button (shows rendered output)

  SECTION EDITOR DIALOG:
    - Section name (text input)
    - Rich text editor (see Rich Text Editor section below)
    - "Insert Field" button (shows dropdown of available fields)
    - Page break after checkbox
    - Save button
    - Cancel button

  PREVIEW DIALOG:
    - Full-width dialog
    - Shows rendered script with all sections
    - Placeholders replaced with sample data or {{Field Name}} if no data
    - Page breaks shown as horizontal lines
    - Export buttons (PDF, Word, Print) - disabled in preview
END COMPONENT
```

#### Admin Area - Custom Lists Management

**Location: `/Users/joshmccarty/Code-2022M1/outwardsign/src/app/(admin)/settings/custom-lists/`**

**Files Needed:**
1. `page.tsx` (server) - Custom lists list page
2. `custom-lists-list-client.tsx` (client) - List UI
3. `[id]/page.tsx` (server) - Custom list detail with items
4. `[id]/custom-list-detail-client.tsx` (client) - Manage list items with drag-and-drop

**Custom Lists List (`custom-lists-list-client.tsx`):**
```
COMPONENT CustomListsListClient
  Props: initialLists: CustomList[]

  UI STRUCTURE:
    - PageContainer with title "Custom Lists"
    - Empty state: "No custom lists yet. Create a list to use in event fields."
    - DataTable or cards showing:
      - List name
      - Item count
      - Edit button
      - Delete button (if not in use)
    - "Create Custom List" button

  CREATE/EDIT DIALOG:
    - List name (text input)
    - Save button
END COMPONENT
```

**Custom List Detail (`custom-list-detail-client.tsx`):**
```
COMPONENT CustomListDetailClient
  Props: customList: CustomListWithItems

  UI STRUCTURE:
    - PageContainer with title "{list.name}"
    - List name (editable inline)
    - List items (drag-and-drop enabled)
    - Each item shows:
      - Drag handle
      - Item value
      - Edit button (inline edit)
      - Delete button
    - "Add Item" button

  DRAG-AND-DROP:
    - Use @dnd-kit for reordering
    - Call reorderCustomListItems on drag end

  DELETE ITEM CONFIRMATION:
    - Check if item is used in events
    - IF used THEN
        Dialog: "X events use this value. They will show empty/null."
      END IF
    - Require confirmation
END COMPONENT
```

#### Main App - Dynamic Event Management

**Location: `/Users/joshmccarty/Code-2022M1/outwardsign/src/app/(main)/events/[event_type_slug]/`**

**Note:** Route structure changes from module-based (`/weddings/`, `/funerals/`) to event-type-based (`/events/wedding/`, `/events/funeral/`)

**Files Needed:**
1. `page.tsx` (server) - Event list page for this type
2. `events-list-client.tsx` (client) - Dynamic list with search/filter
3. `create/page.tsx` (server) - Create new event
4. `[id]/page.tsx` (server) - Event view page
5. `[id]/edit/page.tsx` (server) - Edit event page
6. `dynamic-event-form.tsx` (client) - Dynamic form generator
7. `dynamic-event-view-client.tsx` (client) - Dynamic view renderer

**Dynamic Event Form (`dynamic-event-form.tsx`):**
```
COMPONENT DynamicEventForm
  Props:
    - eventType: EventTypeWithRelations
    - event?: EventWithRelations (for edit mode)
    - onSubmit: (data) => Promise<void>

  State:
    - fieldValues: Record<string, any> (matches field_values JSON structure)
    - occasions: Occasion[]
    - validation errors

  FORM STRUCTURE:
    - For each input field definition (ordered by 'order'):
      CASE field.type:
        'person' => Render PersonPickerField
        'group' => Render GroupPicker
        'location' => Render LocationPickerField
        'event_link' => Render EventPickerField (filtered by event_type_filter_id)
        'list_item' => Render Select dropdown from custom_list_items
        'document' => Render File upload
        'text' => Render Input
        'rich_text' => Render Textarea
        'date' => Render DatePickerField
        'time' => Render time input
        'datetime' => Render DatePickerField with time
        'number' => Render Input type="number"
        'yes_no' => Render Checkbox or Switch
      END CASE

      - IF field.required THEN
          Add validation: field must have value
        END IF

  OCCASIONS SECTION:
    - FormSectionCard title="Occasions"
    - List of occasions (drag-and-drop enabled for reordering)
    - Each occasion:
      - Label input
      - DatePickerField for date
      - Time input
      - LocationPickerField
      - "Primary" checkbox (radio behavior - only one can be primary)
      - Delete button
    - "Add Occasion" button
    - Validation: at least one occasion required
    - Validation: exactly one occasion must be marked primary

  SUBMIT BEHAVIOR:
    1. Validate all required fields have values
    2. Validate occasions (count >= 1, one primary)
    3. Build field_values JSON object
    4. Call onSubmit with { field_values, occasions }
    5. On success: redirect to view page
    6. On error: show toast with error message
END COMPONENT
```

**Dynamic Event View (`dynamic-event-view-client.tsx`):**
```
COMPONENT DynamicEventViewClient
  Props: event: EventWithRelations

  UI STRUCTURE:
    - ModuleViewContainer pattern from existing modules
    - Header:
      - Event type icon (from Lucide)
      - Event type name
      - Primary occasion date/time/location formatted
    - ModuleViewPanel (right sidebar):
      - Edit button
      - Delete button (with confirmation)
      - Export dropdown (per-script: PDF, Word, Print, Text)

    - Main content area (left):

      SECTION 1: Field Values
        - FormSectionCard title="Details"
        - For each field in event.resolved_fields (ordered by field definition order):
          CASE field.field_type:
            'person' => Show person.full_name with link to /people/{id}
            'group' => Show group.name with link to /groups/{id}
            'location' => Show location.name with link to /locations/{id}
            'event_link' => Show linked event name with link
            'list_item' => Show item.value
            'document' => Show filename with download link (signed URL)
            'text', 'rich_text' => Show text value
            'date' => formatDatePretty()
            'time' => format time
            'datetime' => formatDatePretty() with time
            'number' => Show number
            'yes_no' => Show "Yes" or "No"
          END CASE

      SECTION 2: Occasions
        - FormSectionCard title="Occasions"
        - For each occasion (sorted by date):
          - Occasion label (bold if is_primary)
          - Date formatted with formatDatePretty()
          - Time formatted
          - Location name with link
          - Primary badge if is_primary

      SECTION 3: Scripts
        - FormSectionCard title="Scripts & Programs"
        - For each script for this event type:
          - Script name
          - Preview button (opens dialog with rendered script)
          - Export buttons (PDF, Word, Print, Text)
END COMPONENT
```

**Event List (`events-list-client.tsx`):**
```
COMPONENT EventsListClient
  Props:
    - eventType: EventType
    - initialEvents: EventWithRelations[]

  UI STRUCTURE:
    - PageContainer with title "{eventType.name} Events"
    - SearchCard with:
      - Text search (searches key person full names)
      - Date range filter (primary occasion date)
      - Status filter (if status field exists in field definitions)
    - DataTable or ContentCard grid showing:
      - Primary occasion date (formatted)
      - Key person names (from is_key_person fields)
      - Event type icon
      - Click to navigate to view page
    - "Create {Event Type}" button
    - Pagination or infinite scroll
END COMPONENT
```

#### Sidebar Navigation Changes

**Location: `/Users/joshmccarty/Code-2022M1/outwardsign/src/components/main-sidebar.tsx`**

**Current State:**
- Hardcoded modules: Weddings, Funerals, Baptisms, etc.
- Each has CollapsibleNavSection with icon and submenu

**Required Changes:**
```
FUNCTION MainSidebar
  Props: userParish: UserParishRole | null

  FETCH dynamic event types on server side:
    - Query event_types for selected parish
    - Order by 'order' ASC
    - Filter WHERE deleted_at IS NULL

  RENDER sidebar:
    - Application section (always visible):
      - Dashboard
      - Calendar
      - (People, Groups, Locations remain as-is)

    - Dynamic Event Types section:
      FOR each eventType in eventTypes:
        - CollapsibleNavSection
        - Icon: get Lucide icon by name from eventType.icon
        - Title: eventType.name
        - Items:
          - "Our {eventType.name}s" -> /events/{eventType.slug}
          - "New {eventType.name}" -> /events/{eventType.slug}/create
      END FOR

    - Settings section (bottom):
      - Parish Settings (admin only)
        - Event Types -> /settings/event-types
        - Custom Lists -> /settings/custom-lists
      - User Settings
END FUNCTION
```

**Icon Mapping:**
```
CONSTANT LUCIDE_ICON_MAP
  - Store mapping of icon name strings to Lucide icon components
  - Example:
    'Heart' => Heart
    'Cross' => Cross
    'Droplet' => Droplet
    'VenusAndMars' => VenusAndMars
    'BookHeart' => BookHeart
    'Flame' => Flame
    (and all other Lucide icons)

  FUNCTION getLucideIcon(iconName: string)
    1. Return LUCIDE_ICON_MAP[iconName]
    2. IF not found THEN return default icon (FileText)
  END FUNCTION
END CONSTANT
```

### Rich Text Editor Implementation

**Purpose:** Allow admins to create script sections with formatted text and field placeholders

**Component:** `MarkdownEditor` (new component)

**Location:** `/Users/joshmccarty/Code-2022M1/outwardsign/src/components/markdown-editor.tsx`

**Library Options (Research Required):**
1. **react-markdown-editor-lite** - Lightweight, supports custom syntax
2. **@uiw/react-md-editor** - Popular, supports dark mode
3. **react-mde** - Simple, customizable
4. **Custom implementation** - Textarea with toolbar buttons

**Recommended Approach: Custom Implementation with Textarea + Toolbar**

```
COMPONENT MarkdownEditor
  Props:
    - value: string (markdown content)
    - onChange: (value: string) => void
    - availableFields: InputFieldDefinition[] (for placeholder insertion)
    - placeholder?: string

  State:
    - cursorPosition: number
    - showFieldMenu: boolean

  UI STRUCTURE:
    - Toolbar (buttons for formatting):
      - Bold button (wraps selection with **)
      - Italic button (wraps selection with *)
      - Underline button (wraps selection with <u></u> HTML)
      - H1, H2, H3 buttons (adds # at line start)
      - Alignment buttons (left, center, right) - uses HTML
      - Bullet list button (adds - at line start)
      - Numbered list button (adds 1. at line start)
      - Red text button (wraps selection with {red}{/red})
      - "Insert Field" dropdown:
        - Shows list of available fields from eventType.input_field_definitions
        - On click: insert {{Field Name}} at cursor position

    - Textarea:
      - Large textarea (min-height: 400px)
      - Monospace font for editing
      - Track cursor position for insertions
      - Value bound to markdown string

    - Live Preview (split view or toggle):
      - Render markdown to HTML
      - Custom parser for {red}{/red} -> <span style="color: red">
      - Show {{Field Name}} as highlighted placeholders
      - Use react-markdown or custom parser

  FORMATTING FUNCTIONS:
    FUNCTION applyFormat(format: 'bold' | 'italic' | 'underline' | 'red')
      1. Get textarea selection
      2. Get selected text
      3. Wrap with appropriate syntax:
         - bold: **text**
         - italic: *text*
         - underline: <u>text</u>
         - red: {red}text{/red}
      4. Update value
      5. Restore cursor position
    END FUNCTION

    FUNCTION insertField(fieldName: string)
      1. Get cursor position in textarea
      2. Insert {{fieldName}} at position
      3. Update value
      4. Move cursor after insertion
    END FUNCTION

    FUNCTION applyHeading(level: 1 | 2 | 3)
      1. Get current line
      2. Add appropriate # at line start
      3. Update value
    END FUNCTION

    FUNCTION toggleList(type: 'bullet' | 'numbered')
      1. Get current line or selection
      2. For each line:
         IF bullet THEN add "- " at start
         IF numbered THEN add "1. " at start (or increment)
      3. Update value
    END FUNCTION
END COMPONENT
```

**Markdown Storage Format:**
```
Example section content:

# Welcome

Please join us in celebrating the wedding of {{Bride}} and {{Groom}}.

**Date:** {{Wedding Date}}
**Location:** {{Ceremony Location}}

{red}Please silence your phones{/red}

## Order of Service

1. Processional
2. Opening Prayer
3. First Reading: {{First Reading}}
```

**Markdown to HTML Rendering (for preview and export):**
```
FUNCTION renderMarkdownToHTML(markdown: string, fieldValues: Record<string, any>)
  1. Replace {{Field Name}} with actual values from fieldValues
     IF fieldValue is person/group/location reference THEN
       Fetch entity and use name
     ELSE
       Use value directly
     END IF

  2. Parse custom {red}{/red} syntax:
     Replace {red}text{/red} with <span style="color: #c41e3a">text</span>

  3. Use react-markdown or marked.js to convert standard markdown to HTML:
     - **text** => <strong>text</strong>
     - *text* => <em>text</em>
     - # Heading => <h1>Heading</h1>
     - etc.

  4. Return HTML string or React elements
END FUNCTION
```

**Custom Syntax Reference:**
- `{{Field Name}}` - Placeholder for field value
- `{red}text{/red}` - Red text (liturgical color)
- Standard markdown for all other formatting

### Export System Architecture

**Purpose:** Generate PDF, Word, Print, and Text exports of scripts with field values replaced

**Current System Reference:** `/Users/joshmccarty/Code-2022M1/outwardsign/docs/RENDERER.md`

**Export Formats:**
1. **PDF** - Generate PDF using pdfmake
2. **Word** - Generate .docx using docx library
3. **Print** - HTML page optimized for browser print
4. **Text** - Plain text markdown output

#### PDF Export

**API Route:** `/Users/joshmccarty/Code-2022M1/outwardsign/src/app/api/events/[event_type_id]/[event_id]/scripts/[script_id]/export/pdf/route.ts`

```
FUNCTION GET(request, params)
  1. Authenticate user and check permissions
  2. Fetch event with relations
  3. Fetch script with sections
  4. Fetch event type with input field definitions

  5. Build document structure:
     FOR each section in script.sections (ordered by 'order'):
       a. Get section content (markdown)
       b. Replace {{Field Name}} with actual values from event.field_values
       c. Convert markdown to pdfmake format:
          - Parse markdown to AST
          - Convert to pdfmake content blocks
          - Apply styles from ELEMENT_STYLES
          - Handle {red}{/red} => { text: 'text', color: '#c41e3a' }
          - Handle headings => { text: 'heading', fontSize: X, bold: true }
          - Handle lists => { ul: [...] } or { ol: [...] }
       d. IF section.page_break_after THEN
            Add page break: { text: '', pageBreak: 'after' }
          END IF
     END FOR

  6. Generate PDF using pdfmake:
     - Define document: { content: [...], styles: {...}, pageSize: 'LETTER' }
     - Use standard liturgy font
     - Use styles from liturgical-script-styles.ts

  7. Return PDF as response:
     - Content-Type: application/pdf
     - Content-Disposition: attachment; filename="{event-type}-{event-id}-{script-name}.pdf"
END FUNCTION
```

**Dependencies:**
- pdfmake (already in use)
- marked or markdown-it (for markdown parsing)

#### Word Export

**API Route:** `/Users/joshmccarty/Code-2022M1/outwardsign/src/app/api/events/[event_type_id]/[event_id]/scripts/[script_id]/export/docx/route.ts`

```
FUNCTION GET(request, params)
  1. Authenticate user and check permissions
  2. Fetch event with relations
  3. Fetch script with sections
  4. Fetch event type with input field definitions

  5. Build document structure:
     FOR each section in script.sections:
       a. Get section content (markdown)
       b. Replace {{Field Name}} with actual values
       c. Convert markdown to docx paragraphs:
          - Parse markdown to AST
          - Convert to docx Paragraph objects
          - Apply styles (bold, italic, underline, font size, color)
          - Handle {red}{/red} => new TextRun({ text: 'text', color: 'C41E3A' })
          - Handle headings => new Paragraph({ text: 'heading', heading: HeadingLevel.HEADING_1 })
          - Handle lists => use NumberingFormat
       d. IF section.page_break_after THEN
            Add page break
          END IF
     END FOR

  6. Generate .docx using docx library:
     - Create Document with sections
     - Use standard fonts
     - Apply styles from liturgical-script-styles.ts (convert points to twips)

  7. Return .docx as response:
     - Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
     - Content-Disposition: attachment; filename="{event-type}-{event-id}-{script-name}.docx"
END FUNCTION
```

**Dependencies:**
- docx (already in use)
- marked or markdown-it (for markdown parsing)

#### Print Export

**Page Route:** `/Users/joshmccarty/Code-2022M1/outwardsign/src/app/print/events/[event_type_id]/[event_id]/scripts/[script_id]/page.tsx`

```
FUNCTION PrintScriptPage(params)
  1. Fetch event with relations (server side)
  2. Fetch script with sections
  3. Fetch event type with input field definitions

  4. Render HTML page:
     - No navigation, no header, no footer
     - Print-optimized CSS:
       * @media print rules
       * Page breaks: page-break-after: always
       * Standard liturgy font
       * Black and white with red text support

     FOR each section in script.sections:
       a. Render section as HTML
       b. Replace {{Field Name}} with values
       c. Convert markdown to HTML:
          - Use react-markdown or custom parser
          - Handle {red}{/red} => <span style="color: #c41e3a">text</span>
          - Apply styles from liturgical-script-styles.ts
       d. IF section.page_break_after THEN
            Add <div style="page-break-after: always;"></div>
          END IF
     END FOR

  5. Browser's native print dialog handles printing
END FUNCTION
```

#### Text Export

**API Route:** `/Users/joshmccarty/Code-2022M1/outwardsign/src/app/api/events/[event_type_id]/[event_id]/scripts/[script_id]/export/txt/route.ts`

```
FUNCTION GET(request, params)
  1. Authenticate user and check permissions
  2. Fetch event with relations
  3. Fetch script with sections
  4. Fetch event type with input field definitions

  5. Build plain text output:
     text = ""
     FOR each section in script.sections:
       a. Get section content (markdown)
       b. Replace {{Field Name}} with actual values
       c. Keep markdown as-is (do not convert to HTML)
       d. Remove {red}{/red} tags (plain text doesn't support color)
       e. Append to text with section separator
       f. IF section.page_break_after THEN
            Add page break indicator: "\n\n--- PAGE BREAK ---\n\n"
          END IF
     END FOR

  6. Return text as response:
     - Content-Type: text/plain; charset=utf-8
     - Content-Disposition: attachment; filename="{event-type}-{event-id}-{script-name}.txt"
END FUNCTION
```

**Export Button UI:**
```
COMPONENT ExportButtons
  Props: eventId, eventTypeId, scriptId, scriptName

  UI:
    - Dropdown menu with options:
      - Download PDF
      - Download Word
      - Print
      - Download Text

  ACTIONS:
    - PDF: Fetch /api/events/{eventTypeId}/{eventId}/scripts/{scriptId}/export/pdf
    - Word: Fetch /api/events/{eventTypeId}/{eventId}/scripts/{scriptId}/export/docx
    - Print: Open /print/events/{eventTypeId}/{eventId}/scripts/{scriptId} in new tab
    - Text: Fetch /api/events/{eventTypeId}/{eventId}/scripts/{scriptId}/export/txt
END COMPONENT
```

### Onboarding Strategy for New Parishes

**Purpose:** Pre-populate new parishes with starter event types, fields, scripts, and custom lists

**Location:** `/Users/joshmccarty/Code-2022M1/outwardsign/src/lib/seed/event-types-seed.ts`

**Execution:** Run during parish creation (in createParishWithAdmin function)

```
FUNCTION seedEventTypesForParish(parishId: string)
  1. Create base event types:
     - Wedding (icon: 'Heart')
     - Funeral (icon: 'Cross')
     - Baptism (icon: 'Droplet')
     - Quinceañera (icon: 'Sparkles' or 'Heart')
     - Presentation (icon: 'Baby' or 'Heart')

  2. For each event type:
     a. Create event_type record
     b. Create input field definitions (see below)
     c. Create custom lists (if needed)
     d. Create default scripts with sections

  3. Return void
END FUNCTION
```

**Wedding Seed Example:**
```
EVENT TYPE: Wedding
  Icon: 'Heart'

  INPUT FIELDS:
    1. Bride (type: person, required: true, is_key_person: true)
    2. Groom (type: person, required: true, is_key_person: true)
    3. Wedding Date (type: date, required: true)
    4. Ceremony Location (type: location, required: true)
    5. Presider (type: person, required: false)
    6. Reception Location (type: location, required: false)
    7. Opening Song (type: list_item, list: "Wedding Songs")
    8. First Reading (type: text, required: false)
    9. Gospel Reading (type: text, required: false)
    10. Unity Candle (type: yes_no, required: false)
    11. Special Instructions (type: rich_text, required: false)

  CUSTOM LISTS:
    - Wedding Songs (items: traditional wedding song titles)

  SCRIPTS:
    1. English Wedding Program
       Sections:
         - Welcome (content: "Please join us...")
         - Order of Service (content: "1. Processional\n2. Opening Prayer...")
         - Readings (content: "First Reading: {{First Reading}}")
         - Ceremony (content: "Exchange of Vows...")
         - Closing (content: "Reception to follow at {{Reception Location}}")

    2. Spanish Wedding Program
       (Same structure, Spanish text)
```

**Funeral Seed Example:**
```
EVENT TYPE: Funeral
  Icon: 'Cross'

  INPUT FIELDS:
    1. Deceased (type: person, required: true, is_key_person: true)
    2. Date of Death (type: date, required: false)
    3. Funeral Date (type: date, required: true)
    4. Funeral Location (type: location, required: true)
    5. Presider (type: person, required: false)
    6. Burial Location (type: location, required: false)
    7. Visitation Location (type: location, required: false)
    8. Opening Song (type: list_item, list: "Funeral Songs")
    9. First Reading (type: text, required: false)
    10. Psalm (type: text, required: false)
    11. Gospel Reading (type: text, required: false)
    12. Eulogy Speaker (type: person, required: false)
    13. Special Instructions (type: rich_text, required: false)

  CUSTOM LISTS:
    - Funeral Songs (items: traditional funeral hymns)

  SCRIPTS:
    1. Funeral Program
       Sections:
         - In Loving Memory (content: "{{Deceased}}\n{{Date of Death}}")
         - Service Details (content: "Funeral Mass: {{Funeral Date}} at {{Funeral Location}}")
         - Order of Service (content: liturgical order)
         - Readings (content: placeholders)
         - Burial Information (content: "{{Burial Location}}")

    2. Bulletin Notice
       Sections:
         - Short notice (content: "Please pray for {{Deceased}}...")
```

**Baptism Seed Example:**
```
EVENT TYPE: Baptism
  Icon: 'Droplet'

  INPUT FIELDS:
    1. Child (type: person, required: true, is_key_person: true)
    2. Parents (type: group, required: false) - or two separate person fields
    3. Godparents (type: group, required: false) - or separate fields
    4. Baptism Date (type: date, required: true)
    5. Baptism Location (type: location, required: true)
    6. Presider (type: person, required: false)
    7. Special Instructions (type: rich_text, required: false)

  SCRIPTS:
    1. Baptism Certificate (template with official wording)
    2. Baptism Program (order of service)
```

**Public Domain Content:**
Include prayers and texts that are not copyrighted:
- Traditional prayers (Glory Be, Hail Mary, Our Father)
- Quinceañera prayer (if public domain)
- Presentation prayer (if public domain)
- Generic liturgical responses
- Structure/order of services (not copyrighted text)

**User Customization:**
- All seeded data can be edited or deleted by admin
- Encourage parishes to customize scripts with their preferred texts
- Provide blank templates for parishes to add their own content

### Testing Requirements

**Test Files Needed:**

1. **Event Types CRUD** - `tests/e2e/admin/event-types.spec.ts`
   - Create event type
   - Edit event type (name, icon)
   - Delete event type (with confirmation)
   - Reorder event types
   - View event type detail with tabs

2. **Input Field Definitions** - `tests/e2e/admin/input-field-definitions.spec.ts`
   - Add field to event type (all types)
   - Edit field definition
   - Delete field (with data warning)
   - Reorder fields
   - Field type validation (is_key_person only for person type)

3. **Custom Lists** - `tests/e2e/admin/custom-lists.spec.ts`
   - Create custom list
   - Add items to list
   - Reorder list items
   - Delete list item (with usage warning)
   - Delete list (with usage check)

4. **Scripts** - `tests/e2e/admin/scripts.spec.ts`
   - Create script for event type
   - Add sections to script
   - Edit section content (markdown editor)
   - Insert field placeholder
   - Reorder sections
   - Delete section
   - Preview script

5. **Dynamic Events** - `tests/e2e/events/dynamic-events.spec.ts`
   - Create event with dynamic form (all field types)
   - Edit event
   - View event with resolved field values
   - Delete event
   - List events with search and filters

6. **Occasions** - `tests/e2e/events/occasions.spec.ts`
   - Add occasion to event
   - Mark occasion as primary
   - Edit occasion
   - Delete occasion (prevent deleting last primary)
   - Reorder occasions

7. **Export System** - `tests/e2e/events/exports.spec.ts`
   - Export script as PDF (verify download)
   - Export script as Word (verify download)
   - Open print view (verify page loads)
   - Export script as Text (verify content)

8. **Sidebar Navigation** - `tests/e2e/navigation/dynamic-sidebar.spec.ts`
   - Verify dynamic event types appear in sidebar
   - Verify sidebar order matches event type order
   - Verify clicking event type navigates to list page

9. **Onboarding** - `tests/e2e/onboarding/seed-event-types.spec.ts`
   - Create new parish
   - Verify seeded event types exist
   - Verify seeded input fields exist
   - Verify seeded scripts exist
   - Verify seeded custom lists exist

**Testing Patterns:**
- Follow patterns from `/Users/joshmccarty/Code-2022M1/outwardsign/docs/TESTING_GUIDE.md`
- Use role-based selectors first, then test IDs
- Pre-authenticated tests (auth handled automatically)
- Test both create and edit modes for forms
- Test delete confirmations and warnings
- Test drag-and-drop reordering (simulate drag events)

### Documentation Updates

**Files That Need Updates:**

1. **MODULE_REGISTRY.md** - Update to reflect new architecture
   - Remove hardcoded module list
   - Add "Event Types (Dynamic)" section
   - Document event-type-based routing
   - Update sidebar structure documentation

2. **COMPONENT_REGISTRY.md** - Add new components
   - MarkdownEditor
   - DynamicEventForm
   - DynamicEventViewClient
   - EventTypesListClient
   - ScriptBuilderClient
   - CustomListDetailClient

3. **ARCHITECTURE.md** - Add dynamic event type architecture
   - JSON field_values storage pattern
   - Dynamic form generation
   - Script rendering system
   - Export system architecture

4. **DATABASE.md** - Add new tables documentation
   - event_types, input_field_definitions, custom_lists, etc.
   - Soft delete pattern (deleted_at column)
   - JSON field_values structure

5. **AGENT_WORKFLOWS.md** - Update workflow
   - Remove references to hardcoded modules
   - Add event type management workflow

6. **RENDERER.md** - Update for markdown rendering
   - Custom syntax: {{Field Name}}, {red}{/red}
   - Markdown to HTML/PDF/Word/Text conversion
   - Field value replacement logic

7. **FORMS.md** - Add dynamic form generation
   - DynamicEventForm component
   - Field type to component mapping
   - Validation for dynamic fields

8. **USER_PERMISSIONS.md** - Update permissions
   - Admin: manage event types, custom lists
   - Staff/Ministry-Leader: use event types, read-only on templates
   - Parishioner: view shared events

### Security Considerations

**Permission Checks:**
1. **Event Types Management** - Admin only
   - Creating, editing, deleting event types: requireManageParishSettings
   - Creating, editing, deleting input fields: requireManageParishSettings
   - Creating, editing, deleting scripts: requireManageParishSettings

2. **Custom Lists Management** - Admin, Staff, Ministry-Leader
   - Creating, editing, deleting lists: requireEditSharedResources
   - Needed for inline list creation during field definition

3. **Event Management** - Based on role
   - Admin: full access to all events
   - Staff: full access to all events
   - Ministry-Leader: access only to event types they're enabled for
   - Parishioner: read-only access to shared events

4. **Document Upload** - Admin, Staff, Ministry-Leader
   - File type validation: only .docx, .pdf, etc.
   - File size limit: 10MB max
   - Storage path: {parish_id}/{document_id}/{filename}
   - RLS policies on storage bucket

**Data Validation:**
1. **Input Field Definitions**
   - Validate is_key_person only for person type
   - Validate list_id provided for list_item type
   - Validate event_type_filter_id provided for event_link type

2. **Occasions**
   - Validate one occasion marked as primary
   - Prevent deleting last occasion
   - Prevent deleting primary occasion without replacement

3. **Field Values JSON**
   - Validate against input field definitions
   - Ensure required fields have values
   - Type checking: person => UUID, text => string, number => number, etc.

4. **Markdown Content**
   - Sanitize HTML in markdown to prevent XSS
   - Only allow safe HTML tags (<u>, <strong>, <em>, <h1>, <span>)
   - Strip <script>, <iframe>, and other dangerous tags

**RLS Policies:**
- All tables: filter by parish_id
- All tables: filter WHERE deleted_at IS NULL
- event_types: admin can CRUD, others read-only
- custom_lists: admin/staff/ministry-leader can CRUD
- events: role-based access (admin/staff/ministry-leader with module access)

### Implementation Complexity

**Complexity Rating:** High

**Reason:** This is a major architectural change affecting:
- Database schema (9 new tables + deleted_at on all existing tables)
- Complete removal of hardcoded modules (weddings, funerals, baptisms, etc.)
- Dynamic form generation system
- Rich text editor with custom syntax
- Export system with markdown-to-format conversion
- Dynamic sidebar navigation
- Onboarding/seeding system

**Focus on WHAT needs to be done:**

1. **Database Layer**
   - Create 9 new tables with proper indexes, constraints, and RLS policies
   - Add deleted_at column to all existing tables
   - Update RLS policies to filter deleted_at IS NULL

2. **Server Actions Layer**
   - Implement CRUD for: event_types, input_field_definitions, custom_lists, custom_list_items, scripts, sections, dynamic events, occasions, documents
   - Implement reorder functions for drag-and-drop
   - Implement validation logic (required fields, is_key_person constraints, occasion primary constraint)

3. **Admin UI Layer**
   - Create admin area with event types management, custom lists management
   - Implement event type detail with tabs (settings, input fields, scripts)
   - Implement script builder with section editor
   - Implement markdown editor with toolbar and field insertion
   - Implement drag-and-drop reordering for: event types, input fields, scripts, sections, custom list items

4. **Main App UI Layer**
   - Implement dynamic event form generator (maps field types to components)
   - Implement dynamic event view renderer (resolves field values and displays)
   - Implement dynamic event list with search/filter
   - Implement occasions management (add, edit, delete, reorder, mark primary)

5. **Navigation Layer**
   - Update sidebar to dynamically load event types
   - Implement icon mapping (string to Lucide icon component)
   - Update routing from module-based to event-type-based

6. **Export System Layer**
   - Implement PDF export (markdown to pdfmake)
   - Implement Word export (markdown to docx)
   - Implement print view (markdown to HTML with print CSS)
   - Implement text export (markdown as-is)
   - Implement field value replacement logic
   - Handle custom syntax: {{Field Name}}, {red}{/red}

7. **Onboarding Layer**
   - Create seed data for 5 event types (Wedding, Funeral, Baptism, Quinceañera, Presentation)
   - Create seed input field definitions for each type
   - Create seed custom lists (songs, readings)
   - Create seed scripts with sections (public domain content)
   - Integrate into parish creation function

8. **Migration Layer**
   - Delete old module code (all files in weddings/, funerals/, baptisms/, etc.)
   - Delete old action files (weddings.ts, funerals.ts, baptisms.ts, etc.)
   - Update all documentation references
   - Clean up unused constants, types, schemas

### Dependencies and Blockers

**External Dependencies:**
1. **Lucide React** - Already installed, used for icons
2. **@dnd-kit** - Already installed, used for drag-and-drop
3. **pdfmake** - Already installed, used for PDF generation
4. **docx** - Already installed, used for Word generation
5. **react-markdown** OR **marked.js** - Need to choose one for markdown parsing
6. **Supabase Storage** - Already configured, need to create 'event-documents' bucket

**Internal Dependencies:**
1. **Admin area** - Does not currently exist, need to create (admin) route group
2. **Soft delete pattern** - Need to add deleted_at to all tables and update all queries
3. **Permission system** - Already exists, need to extend for event type access

**Blockers:**
1. **USCCB copyright** - Cannot include copyrighted liturgical texts in seed data
2. **Markdown editor choice** - Need to decide on library or custom implementation
3. **Migration strategy** - Need to decide: clean break (delete old data) or data migration (convert old events to new format)

**Recommended Approach:**
- **Clean break** - Delete all old module code and data
- Inform users this is a breaking change
- Provide export option before migration
- Start fresh with new event types system
- Parishes re-enter events using new system

### Documentation Inconsistencies Found

None discovered during analysis. This is a new feature with no existing implementation.

### Next Steps

1. **Phase 1: Database Layer**
   - Create migration files for 9 new tables
   - Add deleted_at column to all existing tables
   - Update RLS policies
   - Test migrations on local database

2. **Phase 2: Server Actions**
   - Implement all CRUD server actions
   - Implement validation logic
   - Test with Postman or similar tool

3. **Phase 3: Admin UI - Event Types**
   - Create admin route group
   - Implement event types list with drag-and-drop
   - Implement event type detail with tabs
   - Implement input field editor
   - Test create/edit/delete/reorder flows

4. **Phase 4: Admin UI - Scripts**
   - Implement scripts tab
   - Implement script builder
   - Implement section editor with markdown editor
   - Implement field insertion
   - Test script creation and preview

5. **Phase 5: Admin UI - Custom Lists**
   - Implement custom lists list
   - Implement custom list detail with items
   - Implement drag-and-drop reordering
   - Test create/edit/delete flows

6. **Phase 6: Main App UI - Dynamic Events**
   - Implement dynamic event form generator
   - Implement dynamic event view renderer
   - Implement event list with search/filter
   - Implement occasions management
   - Test create/edit/view/delete flows for various event types

7. **Phase 7: Navigation**
   - Update sidebar to load event types dynamically
   - Implement icon mapping
   - Update routing structure
   - Test navigation and permissions

8. **Phase 8: Export System**
   - Implement markdown to format converters
   - Implement field value replacement
   - Implement API routes for PDF, Word, Text exports
   - Implement print view
   - Test exports for various scripts

9. **Phase 9: Onboarding**
   - Create seed data for 5 event types
   - Integrate into parish creation
   - Test new parish has seeded data

10. **Phase 10: Migration & Cleanup**
    - Delete old module code
    - Delete old action files
    - Update all documentation
    - Run tests on entire system
    - Deploy to staging
    - Final QA

**Status:** Ready for Development
**Next Agent:** developer-agent (reads technical specifications and implements in phases)
