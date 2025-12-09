# User-Defined Event Types - Brainstorming Document

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
Tabs/sections for:
- **Settings** - name, icon
- **Input Fields** - add/edit/reorder fields
- **Scripts** - create/edit scripts

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
- Person → PersonPicker
- Group → GroupPicker
- Location → LocationPicker
- Event Link → EventPicker (filtered by specified event type)
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
