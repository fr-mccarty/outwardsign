# Event Types Detail Page

**Created:** 2025-12-23
**Status:** Ready for Development
**Agents:** brainstorming-agent → devils-advocate-agent → requirements-agent

## Feature Overview

Create the missing `/settings/event-types/{slug}` detail page that allows parish admins to view and edit event type configurations, including custom fields and printable script templates.

## Three Systems at Stake

This feature involves three distinct but interconnected systems:

### 1. Custom Field Definitions
**What it does:** Defines what data to collect for each event type
- Admin configures which fields appear on event creation/edit forms
- Each event type has its own set of custom fields
- 16 field types available (person, text, date, content picker, etc.)
- Fields are stored in `input_field_definitions` table
- **Works the same for ALL three event types** (masses, special-liturgies, parish-events)

### 2. Script Definitions
**What it does:** Defines the structure of printable scripts
- **SPECIAL LITURGIES ONLY:** Full drag-and-drop ceremony builder with sections (cover page, readings, ceremony, etc.)
- **MASSES & PARISH EVENTS:** Simple output - custom fields printed in the order they were defined (no drag-and-drop builder needed)
- Scripts are stored in `scripts` table, sections in `sections` table

### 3. Output System
**What it does:** Renders scripts to various formats
- Takes a script template + event data → produces output
- Supports HTML (web view), PDF (print), Word (download)
- **SPECIAL LITURGIES:** Complex section rendering with placeholder expansion
- **MASSES & PARISH EVENTS:** Code-based content builder that prints custom fields in their defined order
- Uses existing content builders and renderer infrastructure

**Key insight:** Only special liturgies need the full ceremony script builder. Masses and parish events use a simpler approach where custom fields are printed in the order they were inputted.

## Problem Statement

The `/settings/event-types/{slug}` route currently returns 404. Three settings pages (masses, events, special-liturgies) link to this route when users click on an event type, but the page doesn't exist.

**Current State:**
- Users can create, reorder, and delete event types from list pages
- Users CANNOT view or edit existing event type details
- Clicking an event type name results in a 404 error

**Who has this problem:**
Parish admins who need to configure event types with custom fields and printable scripts for their parish's sacramental and liturgical workflow.

## User Stories

- As a parish admin, I want to define custom fields for an event type so that staff can capture the specific information needed for that type of event (bride/groom names for weddings, deceased name for funerals, etc.)

- As a parish admin, I want to create multiple script templates for an event type so that our priests and deacons have different ceremony options to choose from (Full Wedding Ceremony, Simple Wedding Ceremony, Wedding with Mass)

- As a parish admin, I want script templates to automatically include information from custom fields so that printed scripts show the couple's names, selected readings, and ceremony details without manual copying

- As a parish admin, I want to edit existing event type configurations so that I can refine custom fields and scripts as our parish workflow evolves

- As a parish staff member, I want custom fields to appear on event creation forms so that I can enter all the required information for that type of event in one place

## Success Criteria

What does "done" look like?

- [ ] Clicking an event type name from any settings page (masses/events/special-liturgies) navigates to a working detail page (no 404)
- [ ] Admin can view all custom fields defined for an event type
- [ ] Admin can add, edit, reorder, and delete custom fields
- [ ] Admin can view all script templates defined for an event type
- [ ] Admin can add, edit, reorder, and delete script templates
- [ ] Script templates can reference custom fields using slug-based placeholders like `{{bride.first_name}}`
- [ ] Custom fields appear on event creation/edit forms for that event type
- [ ] Script templates render correctly with custom field data when printed/exported

## Scope

### In Scope (MVP)

**Custom Fields:**
- Define custom fields with 16 available field types
- Configure field properties (label, type, required/optional, type-specific config)
- Reorder custom fields (affects form display order)
- Delete custom fields

**Script Templates:**
- Create multiple script templates per event type
- Build templates by stacking pre-defined section types
- Use slug-based placeholders to reference custom fields
- Reorder and delete script templates

**UI/Navigation:**
- Detail page accessible from all three settings pages (masses, events, special-liturgies)
- Consistent with existing settings page patterns
- Back navigation to parent settings page

### Out of Scope (Future)

**Settings and Defaults:**
- Default duration, location, permissions
- Visual styling (colors, icons beyond what's set at creation)
- Required vs optional fields enforcement (beyond basic required flag)

**Advanced Features:**
- Shared/reusable custom fields across event types
- Script template preview/testing
- Conditional sections (show section only if field has value)
- Script versioning/history

## Key User Flows

### Primary Flow: Add Custom Field to Event Type

1. Admin navigates to Settings → Events (or Masses/Special Liturgies)
2. Admin clicks on an event type name (e.g., "Wedding")
3. System displays event type detail page
4. Admin clicks "Add Custom Field" button
5. Admin fills in field definition form:
   - Field label (e.g., "Bride")
   - Field type (select from 16 types: person, text, date, etc.)
   - Required/optional toggle
   - Type-specific config (e.g., `list_id` for list_item type, `input_filter_tags` for content picker)
   - Special flags if applicable (`is_key_person`, `is_primary`)
6. Admin saves custom field
7. System generates field slug from label (e.g., "bride" from "Bride")
8. Custom field appears in the event type's field list
9. When staff create/edit events of this type, the custom field appears on the form

### Alternative Flow: Create Script Template

1. Admin navigates to event type detail page
2. Admin clicks "Add Script Template" button
3. Admin enters template name (e.g., "Full Wedding Ceremony")
4. Admin builds template by adding sections:
   - Clicks "Add Section" → selects section type (Cover Page, Reading, Psalm, Ceremony, etc.)
   - Configures section content (static text or references to custom fields)
   - Uses `{{custom_field_slug}}` placeholders for dynamic content (e.g., `{{bride.first_name}}`)
   - Reorders sections via drag-and-drop
5. Admin saves script template
6. Template appears in event type's template list
7. When staff view/print events of this type, they can select this template for printing

### Edge Cases to Consider

**Custom Fields:**
- What happens to existing event data if a custom field is deleted?
- What if two fields have similar names that generate the same slug?
- Can admins edit a field's type after creation, or only label/required status?
- How are type-specific configs (like `list_id`, `input_filter_tags`) presented in the UI?

**Script Templates:**
- What happens if a template references a custom field that gets deleted?
- How does the system validate that placeholder slugs match existing custom fields?
- Can templates reference standard event fields (like event date, location) in addition to custom fields?
- What if a section type requires configuration (like which reading to display)?

**Cross-Type Consistency:**
- Should all three system types (mass, event, special_liturgy) have identical detail pages?
- Or do special liturgies need more complex script capabilities than parish events?

## Custom Fields - Detailed Requirements

### The 16 Field Types

Custom fields can be any of these types:

**Reference Types (select existing records):**
- `person` - PersonPickerField (UUID) - can be marked as "Key Person" for search
- `group` - GroupPickerField (UUID)
- `location` - LocationPickerField (UUID)
- `list_item` - ListItemField (UUID) - requires `list_id` to specify which custom list
- `document` - DocumentPickerField (UUID)
- `content` - ContentPickerField (UUID) - supports `input_filter_tags`
- `petition` - PetitionPickerField (UUID) - supports `input_filter_tags`
- `mass-intention` - MassIntentionField (string)

**Data Entry Types:**
- `text` - Input (string)
- `rich_text` - Textarea (string)
- `date` - DatePicker (ISO date)
- `time` - TimePicker (time string)
- `datetime` - DateTimePicker (ISO datetime)
- `number` - Input number
- `yes_no` - Switch (boolean)

**Special Types:**
- `calendar_event` - Date/time/location bundle - shows in calendar, can be marked "Primary"
- `spacer` - Visual separator, no data

### Field Configuration

Each custom field has:
- **Label** (string) - Display name shown to users (e.g., "Bride", "Groom", "Rehearsal Date")
- **Slug** (string) - Auto-generated from label (e.g., "bride", "groom", "rehearsal_date") - used in script placeholders
- **Type** (enum) - One of the 16 field types
- **Required** (boolean) - Whether field must be filled in
- **Type-specific config:**
  - `list_id` (UUID) - For `list_item` type only
  - `input_filter_tags` (array of tag slugs) - For `content` and `petition` types
- **Special flags:**
  - `is_key_person` (boolean) - For `person` type - makes field searchable in list view
  - `is_primary` (boolean) - For `calendar_event` type - marks main occurrence

### Free-Form Definition

- Custom fields are **NOT shared** between event types
- Each event type has its own independent set of custom fields
- Admins define fields from scratch each time (no reusable field library)
- Fields can be reordered to control display order on event forms

### How Custom Fields Appear on Forms

When staff create or edit an event of a specific type:
1. Event form loads with standard fields (event name, date, location, etc.)
2. Custom fields for that event type appear below standard fields
3. Custom fields render using their configured field type (text input, person picker, date picker, etc.)
4. Required fields are marked and validated
5. Field order matches the order defined on the event type detail page

## Script Templates - Detailed Requirements

### Multiple Templates Per Event Type

Each event type can have multiple script templates:
- **Wedding** might have: "Full Wedding Ceremony", "Simple Wedding Ceremony", "Wedding with Mass"
- **Funeral** might have: "Funeral Mass", "Funeral Liturgy without Mass", "Graveside Service"
- **Baptism** might have: "Infant Baptism", "Adult Baptism", "Emergency Baptism"

When viewing/printing an event, staff select which template to use.

### Pre-defined Section Types

Scripts are built by stacking **pre-defined section types** from the existing liturgical script system:

- **Cover Page** - Title, date, location, celebrant info
- **Reading** - Scripture readings from content library
- **Psalm** - Responsorial psalm from content library
- **Petitions** - Prayers of the faithful from petition library
- **Announcements** - Parish announcements
- **Ceremony** - Custom ceremony text (vows, rituals, instructions)
- **Custom Text** - Free-form text sections

Each section type has its own rules and configuration options (see CONTENT_BUILDER_SECTIONS.md for complete details).

### Building a Script Template

Admin workflow:
1. Create new template (give it a name)
2. Add sections one by one:
   - Click "Add Section"
   - Select section type (Reading, Ceremony, Custom Text, etc.)
   - Configure section content (see below)
3. Reorder sections via drag-and-drop
4. Save template

### Slug-based Placeholders for Dynamic Content

Script templates use **slug-based placeholders** to reference custom fields:

**Syntax:** `{{custom_field_slug}}`

**Examples:**
- `{{bride.first_name}}` - First name from "Bride" person picker field
- `{{groom.last_name}}` - Last name from "Groom" person picker field
- `{{rehearsal_date}}` - Date from "Rehearsal Date" date picker field
- `{{deceased_name}}` - Text from "Deceased Name" text field

**Where placeholders are used:**
- In **Ceremony** sections (custom ceremony text with dynamic data)
- In **Custom Text** sections (free-form text with placeholders)
- Possibly in **Cover Page** sections (event-specific titles)

**How placeholders work:**
1. Admin writes template with placeholders: "We gather today to celebrate the marriage of {{bride.first_name}} and {{groom.first_name}}..."
2. When rendering the script, system looks up the custom field by slug
3. System retrieves the value from the event's custom field data
4. System replaces placeholder with actual value
5. Rendered script shows: "We gather today to celebrate the marriage of Maria and José..."

### Template Rendering

When staff view/print an event:
1. Select which script template to use
2. System builds the script:
   - Renders each section in order
   - Replaces all `{{placeholders}}` with actual event data
   - Applies formatting and styling
3. Script is displayed/printed/exported (PDF, Word, etc.)

## Integration Points

### Existing Features This Touches

**Settings Pages:**
- `/settings/masses` - Mass types list
- `/settings/events` - Event types list
- `/settings/special-liturgies` - Special liturgy types list
- All three pages link to the new detail page

**Event Creation/Edit Forms:**
- Custom fields must dynamically appear on forms based on event type
- Forms must validate required custom fields
- Forms must save custom field values to database

**Liturgical Script System:**
- Script templates use existing section types from CONTENT_BUILDER_SECTIONS.md
- Rendering system must support slug-based placeholders
- Export system (PDF, Word) must render templates correctly

**Event View Pages:**
- Must allow selecting which script template to use for printing
- Must display rendered script with custom field data

### Existing Components to Reuse

- **Form components** - Use existing FormField, Input, DatePicker, PersonPickerField, etc. (see FORMS.md)
- **Section builders** - Reuse existing liturgical script section components (see CONTENT_BUILDER_SECTIONS.md)
- **Drag-and-drop** - Use @dnd-kit for reordering fields and sections (see DRAG_AND_DROP.md)
- **Export buttons** - Use existing PDF/Word export patterns (see EXPORT_BUTTONS.md)

### Existing Patterns to Follow

- **Module structure** - Follow 8-file module pattern (see MODULE_COMPONENT_PATTERNS.md)
- **Form patterns** - Use unified form with isEditing pattern (see FORMS.md)
- **Styling** - Dark mode support with semantic tokens (see STYLES.md)
- **Bilingual** - All UI text must have English and Spanish translations (see CODE_CONVENTIONS.md)

## Open Questions for Requirements-Agent

### Database Schema

1. Where should custom field definitions be stored?
   - New table `event_type_custom_fields`?
   - JSONB column on existing `event_types` table?
   - How to handle field ordering?

2. Where should custom field VALUES be stored for individual events?
   - JSONB column on event tables (masses, events, etc.)?
   - Separate polymorphic table for custom field values?
   - How to handle different data types (UUID vs string vs date)?

3. Where should script templates be stored?
   - New table `event_type_script_templates`?
   - How to store section configuration (which sections, in what order)?
   - How to store placeholder mappings?

### Technical Implementation

4. How are field slugs generated and validated?
   - Auto-generate from label on creation?
   - Ensure uniqueness within event type?
   - Allow manual editing of slugs?

5. How does the form builder dynamically render custom fields?
   - Server component that fetches field definitions?
   - Client component with conditional rendering based on field type?
   - How to handle type-specific configs (list_id, input_filter_tags)?

6. How does the script renderer resolve placeholders?
   - Regex-based replacement?
   - Template engine (Handlebars, Mustache)?
   - How to handle nested properties ({{bride.first_name}})?
   - Error handling for missing fields or invalid slugs?

7. How are script templates selected at print time?
   - Dropdown on event view page?
   - Default template per event type?
   - Can users switch templates after viewing?

### UI/UX Details

8. ~~What does the detail page layout look like?~~ **RESOLVED**
   - **Answer:** Three-page structure (hub → fields → scripts) - see Wisdom Agent Review Notes

9. How are custom fields created/edited?
   - Inline editing in a list?
   - Modal dialog form?
   - Separate "Add Custom Field" page?

10. How are script templates built? **(Special liturgies only)**
    - Visual section builder (drag-and-drop sections)?
    - Form-based (select sections from dropdown)?
    - Rich text editor with section insertion?

11. How are placeholders inserted into script templates? **(Special liturgies only)**
    - Manual typing of {{slug}}?
    - Dropdown/autocomplete of available custom fields?
    - Visual placeholder insertion button?

### Cross-Type Behavior

12. ~~Do all three system types (mass, event, special_liturgy) use the same detail page?~~ **RESOLVED**
    - **Answer:** Same hub and fields pages for all types. Scripts page shows full builder for special liturgies, simple message for masses/events.

### Data Migration

13. Do any existing event types already have custom fields or scripts?
    - Are we starting from scratch?
    - Any legacy data to migrate?

## Next Steps

Hand off to requirements-agent for technical analysis.

Requirements-agent should:
1. Analyze database schema options for custom fields and script templates
2. Define server actions for CRUD operations on custom fields and templates
3. Specify component structure for the detail page (following 8-file module pattern)
4. Detail the script rendering system with placeholder resolution
5. Define validation rules for field slugs and template placeholders
6. Specify how custom fields integrate with existing event creation/edit forms
7. Detail the UI flow for building script templates with sections

---

## TECHNICAL REQUIREMENTS
(Added by requirements-agent on 2025-12-23)

### Database Infrastructure - Already Exists

**VERIFIED: All necessary database tables and columns already exist. No new migrations needed except for one constraint expansion.**

**Existing Tables:**
1. **`event_types`** - Stores event type metadata
   - Columns: `id`, `parish_id`, `name`, `description`, `icon`, `order`, `slug`, `system_type`, timestamps
   - Constraint: `system_type IN ('mass', 'special-liturgy', 'event')`
   - Migration: `20251031000002_create_event_types_table.sql`

2. **`input_field_definitions`** - Stores custom field definitions
   - Columns: `id`, `event_type_id`, `name`, `property_name`, `type`, `required`, `list_id`, `is_key_person`, `is_primary`, `is_per_calendar_event`, `order`, `input_filter_tags`, timestamps
   - Constraint: `type IN ('person', 'group', 'location', 'list_item', 'document', 'text', 'rich_text', 'content', 'petition', 'calendar_event', 'date', 'time', 'datetime', 'number', 'yes_no', 'mass-intention', 'spacer')`
   - Migration: `20251210000004_create_input_field_definitions_table.sql`

3. **`scripts`** - Stores script templates for special liturgies
   - Columns: `id`, `event_type_id`, `name`, `description`, `order`, timestamps
   - Migration: `20251210000005_create_scripts_table.sql`

4. **`sections`** - Stores script sections
   - Columns: `id`, `script_id`, `name`, `section_type`, `content`, `page_break_after`, `order`, timestamps
   - **CONSTRAINT ISSUE:** Currently only allows `section_type IN ('text', 'petition')`
   - Migration: `20251210000006_create_sections_table.sql`

5. **`master_events`** - Stores individual events with custom field values
   - Columns: `id`, `parish_id`, `event_type_id`, `field_values` (JSONB), `status`, timestamps
   - Migration: `20251210000007_create_master_events_table.sql`

**Required Database Migration:**

**Migration: Expand `sections.section_type` constraint**
```sql
-- Migration file: 2025MMDD_expand_sections_section_type_constraint.sql
-- Purpose: Support all section types for script templates

ALTER TABLE sections DROP CONSTRAINT check_section_type_valid;

ALTER TABLE sections ADD CONSTRAINT check_section_type_valid
  CHECK (section_type IN (
    'text',
    'petition',
    'cover_page',
    'reading',
    'psalm',
    'ceremony',
    'petitions',
    'announcements',
    'custom_text'
  ));
```

### Server Actions - Verification

**VERIFIED: All necessary CRUD operations already exist. No new server actions needed.**

**Existing Server Actions:**

1. **Event Types** (`/src/lib/actions/event-types.ts`)
   - ✅ `getEventTypes(filters?)` - List all event types with filtering
   - ✅ `getEventType(id)` - Get single event type by ID
   - ✅ `getEventTypeBySlug(slug)` - Get single event type by slug
   - ✅ `getEventTypeWithRelations(id)` - Get event type with input fields and scripts
   - ✅ `getEventTypeWithRelationsBySlug(slug)` - Get event type with relations by slug
   - ✅ `createEventType(data)` - Create new event type
   - ✅ `updateEventType(id, data)` - Update event type
   - ✅ `deleteEventType(id)` - Delete event type
   - ✅ `reorderEventTypes(orderedIds)` - Reorder event types

2. **Input Field Definitions** (`/src/lib/actions/input-field-definitions.ts`)
   - ✅ `getInputFieldDefinitions(eventTypeId)` - List fields for event type
   - ✅ `getInputFieldDefinitionWithRelations(id)` - Get single field with custom list
   - ✅ `createInputFieldDefinition(data)` - Create new field
   - ✅ `updateInputFieldDefinition(id, data)` - Update field
   - ✅ `deleteInputFieldDefinition(id)` - Delete field (needs usage check enhancement)
   - ✅ `reorderInputFieldDefinitions(eventTypeId, orderedIds)` - Reorder fields

3. **Scripts** (`/src/lib/actions/scripts.ts`)
   - ✅ `getScripts(eventTypeId)` - List scripts for event type
   - ✅ `getScript(id)` - Get single script
   - ✅ `getScriptWithSections(id)` - Get script with all sections
   - ✅ `createScript(data)` - Create new script
   - ✅ `updateScript(id, data)` - Update script
   - ✅ `deleteScript(id)` - Delete script (cascades to sections)
   - ✅ `reorderScripts(eventTypeId, orderedIds)` - Reorder scripts

4. **Sections** (`/src/lib/actions/sections.ts`)
   - ✅ `getSections(scriptId)` - List sections for script
   - ✅ `getSection(id)` - Get single section
   - ✅ `createSection(scriptId, data)` - Create new section
   - ✅ `updateSection(id, data)` - Update section
   - ✅ `deleteSection(id)` - Delete section
   - ✅ `reorderSections(scriptId, orderedIds)` - Reorder sections

**Required Server Action Enhancements:**

1. **`deleteInputFieldDefinition` - Add usage validation**
   - CURRENT: Deletes field without checking usage (data remains orphaned in `field_values` JSONB)
   - REQUIRED: Count events using this field before allowing deletion
   - PSEUDO-CODE:
   ```
   FUNCTION deleteInputFieldDefinition(id)
     1. Get field definition (event_type_id, property_name)
     2. Query master_events table for events with this event_type_id
     3. FOR EACH event:
          Check if field_values JSONB contains property_name key
          IF found THEN increment usage_count
     4. IF usage_count > 0 THEN
          Throw error: "Cannot delete field '{name}'. It is used in {usage_count} event(s). Remove the field from all events before deleting the definition."
     5. ELSE
          Delete field definition
   END FUNCTION
   ```

2. **NEW: `countFieldUsage` helper (optional)**
   - Purpose: Count how many events use a specific custom field
   - Returns: Number of events where `field_values->>property_name IS NOT NULL`
   - Used by deletion validation

### UI Component Structure

**Three-Page Architecture (Mobile-Friendly, No Tabs)**

```
/settings/event-types/{slug}/              → Hub Page (overview + navigation)
/settings/event-types/{slug}/fields/       → Custom Fields Page
/settings/event-types/{slug}/scripts/      → Scripts Page
```

#### Page 1: Hub Page (`/settings/event-types/{slug}/page.tsx`)

**Purpose:** Overview and navigation hub for event type configuration

**Server Component:**
```
FILE: /src/app/(main)/settings/event-types/[slug]/page.tsx

FUNCTION HubPage({ params })
  1. Await params.slug
  2. Fetch event type using getEventTypeBySlug(slug)
  3. If not found → return notFound()
  4. Check admin permissions using checkSettingsAccess()
  5. Build breadcrumbs array
  6. Render PageContainer with:
     - Event type name, icon, description
     - Two navigation cards (Manage Custom Fields, Manage Scripts)
     - Back button to parent settings page
  7. Conditionally hide "Manage Scripts" card if system_type is 'mass' or 'event'
END FUNCTION

LAYOUT:
- PageContainer with event type name as title
- Description text
- Two large navigation cards (ContentCard components):
  1. "Manage Custom Fields" → /settings/event-types/{slug}/fields
  2. "Manage Scripts" → /settings/event-types/{slug}/scripts (only shown for special-liturgy)
- Back button to parent settings page (/settings/masses, /settings/events, or /settings/special-liturgies)
```

**Conditional Navigation Logic:**
```
IF event_type.system_type === 'special-liturgy' THEN
  Show both "Manage Custom Fields" and "Manage Scripts" cards
ELSE IF event_type.system_type IN ('mass', 'event') THEN
  Show only "Manage Custom Fields" card (Scripts card hidden)
```

#### Page 2: Custom Fields Page (`/settings/event-types/{slug}/fields/page.tsx`)

**Purpose:** Manage custom field definitions for this event type

**Server Component Structure:**
```
FILE: /src/app/(main)/settings/event-types/[slug]/fields/page.tsx

FUNCTION FieldsPage({ params })
  1. Await params.slug
  2. Fetch event type with relations using getEventTypeWithRelationsBySlug(slug)
  3. If not found → return notFound()
  4. Check admin permissions
  5. Extract input_field_definitions array
  6. Build breadcrumbs
  7. Render PageContainer with:
     - Title: "{Event Type Name} - Custom Fields"
     - Primary action: "Add Custom Field" button
     - FieldsListClient component (client component for drag-and-drop)
END FUNCTION
```

**Client Component:**
```
FILE: /src/app/(main)/settings/event-types/[slug]/fields/fields-list-client.tsx

COMPONENT FieldsListClient({ eventType, initialFields })
  STATE: items (field definitions array)
  STATE: dialogOpen (add/edit dialog visibility)
  STATE: fieldToEdit (selected field for editing)
  STATE: deleteDialogOpen
  STATE: fieldToDelete

  RENDER:
    1. Explanatory Alert: "Custom fields define what data to collect for {event type name}"
    2. DndContext (drag-and-drop wrapper using @dnd-kit)
    3. SortableContext with verticalListSortingStrategy
    4. FOR EACH field in items:
         SortableFieldItem component with:
           - Drag handle (GripVertical icon)
           - Field name and type
           - Edit button → opens dialog with field form
           - Delete button → opens confirmation dialog
    5. Empty state if no fields: "No custom fields defined. Click Add Custom Field to get started."
    6. Add/Edit Field Dialog (FieldFormDialog component)
    7. Delete Confirmation Dialog

  HANDLERS:
    - handleDragEnd: Reorder fields optimistically, call reorderInputFieldDefinitions
    - handleSave: Call createInputFieldDefinition or updateInputFieldDefinition
    - handleDelete: Call deleteInputFieldDefinition (may throw error if field is used)
END COMPONENT
```

**Field Form Dialog:**
```
COMPONENT FieldFormDialog({ field, eventType, open, onOpenChange, onSave })
  FORM FIELDS:
    1. Field Label (text input) - e.g., "Bride", "Groom", "Deceased"
    2. Field Type (select dropdown) - 16 options
    3. Required toggle (Switch)
    4. Type-specific config (conditional rendering):
       - IF type === 'list_item' THEN show ListPicker for list_id
       - IF type IN ('content', 'petition') THEN show tag input for input_filter_tags
       - IF type === 'person' THEN show "Key Person" checkbox (is_key_person)
       - IF type === 'calendar_event' THEN show "Primary Event" checkbox (is_primary)
    5. Property Name (auto-generated from label, shown as read-only or editable)

  VALIDATION:
    - Label is required
    - Property name must be unique within event type
    - Property name must match format: lowercase, starts with letter, allows underscores
    - IF is_primary AND type !== 'calendar_event' THEN error
    - IF is_key_person AND type !== 'person' THEN error

  ON SAVE:
    1. Generate property_name slug from label if creating new field
    2. Call onSave callback with field data
    3. Close dialog
END COMPONENT
```

**Property Name Slug Generation:**
```
FUNCTION generatePropertyName(label)
  1. Convert label to lowercase
  2. Replace spaces with underscores
  3. Remove special characters except underscores
  4. Ensure starts with a letter
  5. Return slug (e.g., "Bride and Groom" → "bride_and_groom")
END FUNCTION
```

#### Page 3: Scripts Page (`/settings/event-types/{slug}/scripts/page.tsx`)

**Purpose:** Manage script templates (special liturgies only)

**Server Component Structure:**
```
FILE: /src/app/(main)/settings/event-types/[slug]/scripts/page.tsx

FUNCTION ScriptsPage({ params })
  1. Await params.slug
  2. Fetch event type with relations using getEventTypeWithRelationsBySlug(slug)
  3. If not found → return notFound()
  4. Check admin permissions
  5. Build breadcrumbs
  6. IF event_type.system_type === 'special-liturgy' THEN
       Render ScriptsListClient (full script builder)
     ELSE
       Render simple message: "Scripts for {event type name} are auto-generated from custom fields"
END FUNCTION
```

**Scripts List Client (Special Liturgies Only):**
```
FILE: /src/app/(main)/settings/event-types/[slug]/scripts/scripts-list-client.tsx

COMPONENT ScriptsListClient({ eventType, initialScripts })
  STATE: scripts (array of script templates)
  STATE: editingScriptId (selected script for editing)

  RENDER:
    1. Explanatory Alert: "Script templates define the structure of printable ceremony scripts"
    2. List of script templates (drag-and-drop reordering)
    3. FOR EACH script:
         - Script name
         - Description
         - "Edit" button → navigate to /settings/event-types/{slug}/scripts/{script_id}
         - "Delete" button → confirmation dialog
    4. Empty state: "No script templates. Click Add Script Template to create one."
    5. "Add Script Template" button → creates new script, navigates to edit page

  HANDLERS:
    - handleReorder: Call reorderScripts
    - handleDelete: Call deleteScript
    - handleCreate: Call createScript, navigate to edit page
END COMPONENT
```

**Script Builder Page (Special Liturgies Only):**
```
FILE: /src/app/(main)/settings/event-types/[slug]/scripts/[script_id]/page.tsx

SERVER COMPONENT ScriptBuilderPage({ params })
  1. Await params
  2. Fetch event type by slug
  3. Fetch script with sections using getScriptWithSections(script_id)
  4. Fetch all input field definitions for event type
  5. Render ScriptBuilderClient
END SERVER COMPONENT

CLIENT COMPONENT ScriptBuilderClient({ script, eventType, inputFields })
  STATE: sections (array of script sections)
  STATE: editingSectionId
  STATE: sectionDialogOpen

  RENDER:
    1. Script name and description (editable inline)
    2. Section builder area:
       - DndContext for drag-and-drop sections
       - SortableContext for sections
       - FOR EACH section:
           SortableSectionItem with:
             - Drag handle
             - Section name and type
             - Content preview (first 100 chars)
             - Edit button → opens section dialog
             - Delete button → confirmation
       - "Add Section" button → opens section dialog
    3. Section Form Dialog
    4. Placeholder Reference Panel (shows available {{placeholders}} from input fields)

  SECTION TYPES:
    - 'cover_page' - Title page with event details
    - 'reading' - Scripture reading from content library
    - 'psalm' - Responsorial psalm
    - 'ceremony' - Custom ceremony text (vows, blessings, rituals)
    - 'petitions' - Prayers of the faithful
    - 'announcements' - Parish announcements
    - 'custom_text' - Free-form text section

  HANDLERS:
    - handleReorderSections: Call reorderSections
    - handleSaveSection: Call createSection or updateSection
    - handleDeleteSection: Call deleteSection
END CLIENT COMPONENT
```

**Section Form Dialog:**
```
COMPONENT SectionFormDialog({ section, inputFields, open, onOpenChange, onSave })
  FORM FIELDS:
    1. Section Name (text input)
    2. Section Type (select dropdown) - 7 options
    3. Content (rich text editor with markdown support)
       - Toolbar with placeholder insertion button
       - Dropdown showing available placeholders from inputFields
       - Click placeholder → inserts {{property_name}} into content
    4. Page Break After (checkbox)

  PLACEHOLDER PANEL:
    - Show all input fields from event type
    - FOR EACH field:
        Display: field.name (field.type)
        Placeholder: {{field.property_name}}
        Click to copy: Copy "{{field.property_name}}" to clipboard
    - Standard placeholders also available:
        {{event_date}}, {{event_time}}, {{event_location}}

  ON SAVE:
    1. Validate section name is not empty
    2. Validate content is not empty (unless section_type is 'spacer')
    3. Call onSave callback with section data
    4. Close dialog
END COMPONENT
```

### Code-Based Content Builder (Masses & Parish Events)

**Purpose:** Generate printable scripts for masses and parish events without using database script templates

**Location:** `/src/lib/content-builders/simple-event-script/`

**Implementation:**
```
FILE: /src/lib/content-builders/simple-event-script/index.ts

FUNCTION buildSimpleEventScript(event: MasterEventWithRelations, eventType: EventTypeWithRelations)
  1. Validate inputs (event must have field_values, eventType must have input_field_definitions)
  2. Create script sections array
  3. Add cover page section:
       - Event type name as title
       - Event date and time (from primary calendar_event field)
       - Event location (from primary calendar_event field)
  4. Add custom fields section:
       - FOR EACH field in eventType.input_field_definitions (ordered by field.order):
           IF field.type !== 'spacer' AND field_values[field.property_name] exists THEN
             Format field value based on type:
               - 'person' → resolved person.full_name
               - 'location' → resolved location.name
               - 'content' → resolved content title
               - 'date' → formatDatePretty(value)
               - 'time' → formatTimePretty(value)
               - 'text', 'rich_text' → value as-is
               - 'yes_no' → "Yes" or "No"
             Add to section content: "**{field.name}:** {formatted_value}"
           IF field.type === 'spacer' THEN
             Add visual separator
  5. Return script object:
       name: "{Event Type Name} Script"
       sections: [cover_page_section, custom_fields_section]
END FUNCTION
```

**Integration Point:**
```
FILE: /src/app/(main)/events/[event_type_id]/[id]/page.tsx (or masses equivalent)

When user clicks "Print" or "View Script":
  IF event_type.system_type === 'special-liturgy' THEN
    Show script template selector (user picks from database scripts)
    Use DynamicScriptViewer component
  ELSE IF event_type.system_type IN ('mass', 'event') THEN
    Call buildSimpleEventScript(event, eventType)
    Render script using generic ScriptRenderer component
```

**Example Output (Masses/Events):**
```
================================
Wedding Script
================================
Date: Saturday, June 15, 2025
Time: 2:00 PM
Location: St. Mary's Church

--------------------------------

**Bride:** Maria Garcia
**Groom:** José Rodriguez
**Wedding Date:** June 15, 2025
**Rehearsal Date:** June 14, 2025 at 6:00 PM
**Officiant:** Fr. John Smith
**Best Man:** Carlos Rodriguez
**Maid of Honor:** Ana Garcia
**First Reading:** 1 Corinthians 13:1-13
**Gospel:** John 15:9-12
**Special Music:** Ave Maria by Schubert
```

### Validation Rules

**1. Property Name Slug Generation:**
```
RULES:
  - Auto-generated from field label on creation
  - Lowercase only
  - Replace spaces with underscores
  - Remove special characters (except underscores)
  - Must start with a letter (prepend 'field_' if starts with number)
  - Must be unique within event type (enforced by database constraint)
  - Format regex: ^[a-z][a-z0-9_]*$

EXAMPLES:
  "Bride" → "bride"
  "Groom's Father" → "grooms_father"
  "Rehearsal Date" → "rehearsal_date"
  "1st Reading" → "field_1st_reading"
```

**2. Custom Field Deletion Validation:**
```
FUNCTION deleteInputFieldDefinition(id)
  STEP 1: Get field definition
    - Retrieve field.event_type_id, field.property_name, field.name

  STEP 2: Count usage in events
    - Query master_events table WHERE event_type_id = field.event_type_id
    - FOR EACH event:
        Check if field_values JSONB contains property_name key
        Use PostgreSQL: field_values ? 'property_name'
    - Count total events using this field

  STEP 3: Validation
    - IF usage_count > 0 THEN
        Throw error: "Cannot delete field '{field.name}'. It is used in {usage_count} event(s). Please remove this field from all events before deleting the definition."
    - ELSE
        Proceed with deletion (hard delete from database)

  STEP 4: Revalidate paths
    - revalidatePath('/settings/event-types/{slug}/fields')
    - revalidatePath('/settings/event-types/{slug}')
END FUNCTION
```

**3. Primary Calendar Event Validation:**
```
RULE: Only ONE calendar_event field can be marked as is_primary per event type

ENFORCEMENT:
  - Database: Unique constraint idx_input_field_definitions_primary_calendar_event
  - Server action: createInputFieldDefinition checks for existing primary before insert
  - Server action: updateInputFieldDefinition checks before setting is_primary = true
  - UI: Field form shows warning if trying to mark as primary when one already exists
```

**4. Section Type Validation (Special Liturgies):**
```
ALLOWED VALUES:
  - 'text' - Free-form markdown text
  - 'petition' - Reference to petition set
  - 'cover_page' - Event title page
  - 'reading' - Scripture reading reference
  - 'psalm' - Responsorial psalm reference
  - 'ceremony' - Ceremony instructions and text
  - 'petitions' - Prayers of the faithful
  - 'announcements' - Parish announcements
  - 'custom_text' - Custom freeform content

ENFORCEMENT:
  - Database: CHECK constraint on sections.section_type column
  - UI: Dropdown limited to these options
```

### Custom Fields Integration with Event Forms

**How Custom Fields Dynamically Appear on Event Forms:**

**Existing Implementation (Verified):**
```
FILE: /src/app/(main)/events/[event_type_id]/master-event-form.tsx (already exists)

COMPONENT MasterEventForm({ event, eventType })
  1. Extract input_field_definitions from eventType
  2. Initialize field_values state from event.field_values JSONB or empty
  3. FOR EACH field in input_field_definitions (ordered by field.order):
       Render field based on field.type:
         - 'person' → PersonPickerField
         - 'group' → GroupPickerField
         - 'location' → LocationPickerField
         - 'list_item' → ListItemPickerField (requires field.list_id)
         - 'document' → DocumentPickerField
         - 'text' → FormInput
         - 'rich_text' → Textarea
         - 'content' → ContentPickerField (uses field.input_filter_tags)
         - 'petition' → PetitionPickerField (uses field.input_filter_tags)
         - 'calendar_event' → CalendarEventFieldView (composite field)
         - 'date' → DatePickerField
         - 'time' → TimePickerField
         - 'datetime' → DateTimePickerField
         - 'number' → Input type="number"
         - 'yes_no' → Switch
         - 'mass-intention' → MassIntentionField
         - 'spacer' → Visual separator (no input)
  4. Store field values in state keyed by field.property_name
  5. On form submit:
       - Collect all field_values as JSONB object
       - Call createEvent or updateEvent with field_values
END COMPONENT
```

**No New Implementation Needed:** Event forms already dynamically render custom fields based on `input_field_definitions` array. This existing pattern works perfectly for the feature.

### Script Rendering with Placeholder Expansion

**Existing Implementation (Verified):**
```
FILE: /src/components/dynamic-script-viewer.tsx (already exists)
FILE: /src/lib/utils/markdown-processor.ts (referenced)

COMPONENT DynamicScriptViewer({ script, event })
  1. Call processScriptForRendering(script, event)
  2. FOR EACH section in script.sections:
       - Replace {{property_name}} placeholders with values from event.field_values
       - Replace {{person_field.full_name}} with resolved person data
       - Replace {{location_field.name}} with resolved location data
       - Replace standard placeholders: {{event_date}}, {{event_time}}, {{event_location}}
       - Convert markdown to HTML
       - Apply liturgical styling (e.g., {red}text{/red})
  3. Render processed sections with HTML content
END COMPONENT
```

**No New Implementation Needed:** Placeholder expansion already works via `DynamicScriptViewer` component.

### Testing Requirements

**User Consultation Needed:** Discuss with user whether tests should be created for this feature.

**If tests are approved, suggested test scenarios:**

**Unit Tests:**
- Property name slug generation (various inputs)
- Field deletion validation (with/without usage)
- Primary calendar event uniqueness
- Placeholder expansion logic

**E2E Tests:**
- Create event type → add custom fields → create event → verify fields appear on form
- Create script template → add sections → view script with placeholders replaced
- Delete field that's in use → verify error message
- Reorder custom fields → verify order persists

### Project Documentation Updates

**Files to Update:**

1. **MODULE_REGISTRY.md**
   - Add entry for event-types detail pages:
     ```
     /settings/event-types/{slug}/ - Event Type Configuration Hub
     /settings/event-types/{slug}/fields/ - Custom Field Definitions
     /settings/event-types/{slug}/scripts/ - Script Templates (Special Liturgies)
     ```

2. **COMPONENT_REGISTRY.md**
   - Add new components:
     - FieldsListClient (custom fields drag-and-drop list)
     - FieldFormDialog (add/edit field dialog)
     - ScriptsListClient (script templates list)
     - ScriptBuilderClient (script section builder)
     - SectionFormDialog (add/edit section dialog)
     - PlaceholderReferencePanel (shows available placeholders)

3. **CONTENT_BUILDER_SECTIONS.md**
   - Document new section types: cover_page, ceremony, custom_text
   - Add section type reference table

4. **FORMATTERS.md**
   - Document generatePropertyName() helper function

5. **Create new file: EVENT_TYPE_CONFIGURATION.md**
   - Comprehensive guide to event type configuration system
   - Three-page architecture overview
   - Custom fields system (16 field types)
   - Script templates system (special liturgies only)
   - Code-based content builder (masses/events)
   - Placeholder syntax reference
   - Examples and best practices

### User Documentation Updates

**Needed:** Yes

**Pages to add/update in `/src/app/documentation/content/`:**

1. **en/admin/event-types-overview.md** (new)
   - What are event types?
   - Three system types (mass, special-liturgy, event)
   - How to configure event types
   - When to use custom fields vs script templates

2. **en/admin/custom-fields-guide.md** (new)
   - How to add custom fields
   - 16 field types explained with examples
   - Field ordering and required fields
   - Property names and slugs

3. **en/admin/script-templates-guide.md** (new)
   - How to create script templates (special liturgies only)
   - Section types explained
   - Using placeholders in scripts
   - Page breaks and formatting

4. **es/admin/tipos-de-eventos-resumen.md** (new)
   - Spanish translation of event-types-overview.md

5. **es/admin/campos-personalizados-guia.md** (new)
   - Spanish translation of custom-fields-guide.md

6. **es/admin/plantillas-de-guion-guia.md** (new)
   - Spanish translation of script-templates-guide.md

**Bilingual Content Required:** All 6 files (3 English + 3 Spanish)

### Home Page Impact

**Needed:** No

**Reason:** This is a settings/admin feature. No dashboard widgets or home page elements needed. Event type configuration is accessed via Settings navigation.

### README Updates

**Needed:** No

**Reason:** This is not a major architectural change or new module. It's a UI layer for existing database infrastructure. No README changes needed.

### Security Considerations

**Authentication & Authorization:**
- All event type configuration pages require admin role (enforced via `checkSettingsAccess()`)
- RLS policies on all tables ensure parish isolation
- Server actions check `requireManageParishSettings(user.id, parishId)` before mutations

**Data Validation:**
- Property name format validation (regex: ^[a-z][a-z0-9_]*$)
- Uniqueness validation for property names within event type
- Type-specific flag validation (is_key_person only for person type, is_primary only for calendar_event)
- Field deletion usage validation prevents orphaned data

**Content Security:**
- Section content sanitized via `sanitizeSectionContent()` (strips HTML tags, preserves markdown)
- Placeholder expansion uses safe string replacement (no code execution)
- JSONB field_values validated on server side

### Database Changes

**Migration Required:** Yes (1 migration)

**Migration Details:**
```
FILE: supabase/migrations/2025MMDD_expand_sections_section_type_constraint.sql

PURPOSE: Expand sections.section_type CHECK constraint to support all section types

CONTENT:
  1. DROP existing constraint check_section_type_valid
  2. ADD new constraint allowing: 'text', 'petition', 'cover_page', 'reading', 'psalm', 'ceremony', 'petitions', 'announcements', 'custom_text'

ROLLBACK: Revert to original constraint (only 'text', 'petition')

TESTING: Verify section creation with new types succeeds
```

### Implementation Complexity

**Complexity Rating:** Medium

**Reason:**
- Database infrastructure already exists (minimal changes needed)
- Server actions already exist (only 1 enhancement needed for deletion validation)
- Most complexity is in UI layer (3 new pages, drag-and-drop, dialogs)
- Existing patterns to follow (masses settings pages, drag-and-drop in event types lists)
- Script builder for special liturgies is most complex component (section editor with placeholder insertion)
- Code-based content builder for masses/events is straightforward (read fields in order, format values)

**What Makes It Medium (Not Low):**
- Three separate pages with different UIs (hub, fields, scripts)
- Conditional rendering logic (scripts page shows different UI based on system_type)
- Drag-and-drop section builder with rich text editing
- Placeholder reference panel with copy functionality
- Field deletion validation requires JSONB querying
- Bilingual user documentation (6 pages)

**What Keeps It Medium (Not High):**
- No new database schema (except 1 constraint change)
- No new server actions (except 1 validation enhancement)
- Event form integration already works
- Script rendering already works
- Can reuse existing components (ContentCard, ConfirmationDialog, FormField, @dnd-kit patterns)
- Clear reference implementation (masses settings pages, event types lists)

### Dependencies and Blockers

**Dependencies:**
1. **Database Migration** - Must expand sections.section_type constraint before script builder can use new section types
2. **Admin Permission Check** - All pages depend on checkSettingsAccess() function
3. **Existing Components** - Depends on ContentCard, ConfirmationDialog, FormField, drag-and-drop patterns from @dnd-kit
4. **Translations** - Requires i18n translations for all UI text (English and Spanish)

**Blockers:**
- None identified - all infrastructure exists, only UI layer needs to be built

### Documentation Inconsistencies Found

**1. Section Type Constraint Mismatch**
- **Location:** `supabase/migrations/20251210000006_create_sections_table.sql` line 17
- **Inconsistency:** Database constraint only allows `section_type IN ('text', 'petition')` but vision document references 7 section types (cover_page, reading, psalm, ceremony, petitions, announcements, custom_text)
- **Impact:** Cannot create sections with new types until constraint is expanded
- **Suggested Fix:** Migration to expand constraint (documented above)

**2. Event Form Component Location**
- **Location:** `/src/app/(main)/events/[event_type_id]/master-event-form.tsx`
- **Inconsistency:** File is located in events directory but also used by masses and special-liturgies (assumed based on pattern)
- **Impact:** Minor - component works correctly but location may cause confusion
- **Suggested Fix:** Consider moving to shared location like `/src/components/master-event-form.tsx` or documenting in COMPONENT_REGISTRY.md that this component is shared across modules

**3. Property Name Terminology**
- **Location:** `input_field_definitions` table uses `property_name`, vision document uses "slug"
- **Inconsistency:** Mixing "property_name" (database) and "slug" (vision doc) for same concept
- **Impact:** Minor - just terminology, functionality is clear
- **Suggested Fix:** Standardize on "property_name" in technical docs, "slug" in user-facing docs

### Next Steps

**Status Updated:** Ready for Development

**Hand off to developer-agent for implementation.**

**Developer-agent should implement in this order:**

1. **Phase 1: Database Migration**
   - Create migration to expand sections.section_type constraint
   - Run migration locally
   - Verify section creation with new types works

2. **Phase 2: Server Action Enhancement**
   - Update deleteInputFieldDefinition to add usage validation
   - Test deletion of used vs unused fields

3. **Phase 3: Hub Page**
   - Create /settings/event-types/[slug]/page.tsx
   - Implement conditional navigation (hide Scripts for masses/events)
   - Test navigation to fields and scripts pages

4. **Phase 4: Custom Fields Page**
   - Create /settings/event-types/[slug]/fields/page.tsx (server)
   - Create fields-list-client.tsx (client with drag-and-drop)
   - Create field-form-dialog.tsx (add/edit dialog)
   - Test field CRUD operations and reordering

5. **Phase 5: Scripts Page (Special Liturgies)**
   - Create /settings/event-types/[slug]/scripts/page.tsx (server)
   - Create scripts-list-client.tsx (client with script list)
   - Create /settings/event-types/[slug]/scripts/[script_id]/page.tsx (script builder)
   - Create script-builder-client.tsx (section editor)
   - Create section-form-dialog.tsx (add/edit sections)
   - Create placeholder-reference-panel.tsx (shows available placeholders)
   - Test script and section CRUD operations

6. **Phase 6: Code-Based Content Builder (Masses/Events)**
   - Create /src/lib/content-builders/simple-event-script/index.ts
   - Integrate with event view pages
   - Test script generation from custom fields

7. **Phase 7: Testing**
   - Consult user on test requirements
   - Create tests if approved (unit + E2E)

8. **Phase 8: Documentation**
   - Update MODULE_REGISTRY.md, COMPONENT_REGISTRY.md
   - Create EVENT_TYPE_CONFIGURATION.md
   - Hand off to user-documentation-writer for bilingual user guides

---

## Review Notes
(Added by devils-advocate-agent on 2025-12-23)

### Questions & Answers

**Q1: Custom Field Definitions Already Exist - What's Actually Missing?**

A: This is purely a UI/UX problem. The database infrastructure already exists:
- `input_field_definitions` table has all 16 field types
- Server actions likely exist or need minor updates
- The `/settings/event-types/{slug}` detail page UI is what's missing (currently returns 404)

**Q2: Script Templates vs Master Event Templates - Are These the Same Thing?**

A: No, they are two different features:
- **Master event templates** (`master_event_templates` table) = saved configurations for creating new events quickly (which fields to pre-fill)
- **Script templates** (`scripts` table) = printable ceremony scripts (what goes in the binder for the priest - the assemblage of sections)

**Q3: Where Do Script Templates Live in the Database?**

A: Script templates already exist in the database:
- `scripts` table - Stores script templates (name, description, order) linked to `event_type_id`
- `sections` table - Stores individual sections within a script (name, section_type, content with placeholders, order)
- Server actions exist at `/src/lib/actions/scripts.ts` with full CRUD operations
- `DynamicScriptViewer` component exists to render scripts with placeholder replacement

**Q4: Section Types Mismatch - Database vs Documentation vs Vision**

A: CONFIRMED ISSUE - The `sections` table constraint needs to be expanded:
- Current: `CHECK (section_type IN ('text', 'petition'))`
- Needed: Support for section types like `'cover_page'`, `'reading'`, `'psalm'`, `'ceremony'`, `'petitions'`, `'announcements'`, `'custom_text'`

This will require a database migration to update the constraint.

**Q5: Template-based Scripts vs Code-based Content Builders - Are These Two Different Systems?**

A: Yes, two systems that will coexist:
- **System A: Database-driven script templates** (what this feature builds) - Admin-configurable via UI
- **System B: Code-based content builders** - Still needed for rendering outputs (Word, HTML, PDF)

Parts of System B are legacy, but the rendering infrastructure is essential.

**Q6: How Do Dynamic Scripts Reference Content Library Items?**

A: Sections use placeholders that reference field values:
- Cover page section: Markdown with many `{{placeholders}}` like `{{event_date}}`, `{{bride.full_name}}`, `{{location.name}}`
- Reading section: Content references `{{first_reading}}` to expand the full reading from the content library, plus `{{lector.full_name}}` for the reader's name
- The renderer expands all placeholders automatically

**Q7: What parts of a script need to be dynamic vs. configurable?**

A: ALL OF THE ABOVE - Order, content, and inclusion all vary between parishes:
- Order varies (some parishes do vows before rings, others do rings before vows)
- Content varies (each parish has their own blessing wording)
- Inclusion varies (some weddings have readings, some don't)

This confirms that granular sections with drag-and-drop reordering are necessary.

**Q8: How do readings/psalms/petitions get into scripts?**

A: Use a section type that references dynamic field values:
- Section type `'reading'` pulls from content library based on `field_values.first_reading_id`
- Section content uses placeholders like `{{first_reading}}` that the renderer expands
- Can also reference person fields like `{{lector.full_name}}` for customization

**Q9: What's the 80/20 rule here?**

A: Mix of standard templates and customized per-event:
- Some parishes use standard templates that rarely change
- Some events need customized scripts
- The system needs to support both use cases

**Q10: Section Type Configuration - How Complex Should It Be?**

A: Start simple (Option C) - Just section_type and content (markdown with placeholders):
- Cover page: Heavily dynamic with many placeholders
- Reading page: Mostly standard, just needs reader's name as a tweak
- Renderer handles all placeholder expansion

More complex type-specific configs (show citation, include dialogue markers) can be added later if needed.

**Q11: Custom Field Deletion - What happens to existing master_events when a custom field is deleted?**

A: **Option D - Prevent deletion if field is used in any events**
- Show error message telling the user they have to go through and remove all instances (e.g., "bride" field) from events if they wish to delete the field definition
- This prevents orphaned data in `master_events.field_values` JSONB column
- Protects script templates that reference `{{field_slug}}` from breaking

**Q12: How does "simple output" actually work for masses/events?**

A: **Code-based content builder that reads `input_field_definitions` in sort order**
- Not a database-driven script template (no records in `scripts` table for masses/events)
- Code reads the `input_field_definitions.order` column and renders fields in that sequence
- When staff clicks Print on a mass/event, the system bypasses the scripts system and uses a dedicated content builder

**Q13: Should the Hub page conditionally show the "Manage Scripts" link?**

A: **Option B - Conditionally hide the Scripts link for masses/events**
- Hub page shows "Manage Scripts" link ONLY for special liturgies (`system_type = 'special-liturgy'`)
- For masses and events, Scripts link is hidden (custom fields are the only configuration needed)
- Simpler UX - don't show a link that leads to "Not applicable"

### Resolved Concerns

- **Custom fields infrastructure exists** - Just needs UI layer
- **Script templates infrastructure exists** - Just needs UI layer for building/editing
- **Two template systems clarified** - Master event templates (reusable event configs) vs Script templates (printable ceremony scripts)
- **Section approach validated** - Granular sections with drag-and-drop is the right approach
- **Placeholder expansion pattern confirmed** - Use markdown with `{{placeholders}}` that renderer expands
- **Custom field deletion behavior** - Prevent deletion if field is used (Option D)
- **Simple output implementation** - Code-based content builder reading `input_field_definitions.order`
- **Hub page navigation** - Conditionally hide Scripts link for masses/events (Option B)

### Unresolved Concerns for Requirements-Agent

- **Database migration required** - `sections.section_type` constraint needs to be updated to support all section types (cover_page, reading, psalm, ceremony, petitions, announcements, custom_text)

- **Section type rendering logic** - Requirements-agent needs to specify how different section types render:
  - `reading` type: How does renderer know to fetch from content library using `field_values.first_reading_id`?
  - `psalm` type: How does renderer know to fetch psalm content?
  - `petition` type: How does renderer know to fetch petition set?
  - `cover_page` type: Standard placeholder expansion
  - `ceremony` type: Standard placeholder expansion
  - `custom_text` type: Standard placeholder expansion

- **Server actions for input_field_definitions** - Verify that CRUD operations exist or need to be created for managing custom fields on the detail page

- **UI component structure unclear** - Requirements-agent needs to specify:
  - Should this follow the 8-file module pattern? (Probably not - this is a settings page, not a module)
  - ~~What's the page structure?~~ **RESOLVED:** Three-page structure (hub → fields → scripts)
  - How are custom fields created/edited? (Modal dialog? Inline editing? Separate page?)
  - How are script templates built? (Visual section builder with drag-and-drop? Form-based?)
  - How are placeholders inserted into sections? (Manual typing? Autocomplete? Dropdown?)

- **Event form integration** - How do custom fields dynamically appear on event creation/edit forms?
  - Server component that fetches field definitions?
  - Client component with conditional rendering?
  - How to handle type-specific configs (list_id, input_filter_tags)?

- **Validation and slug generation** - How are field slugs generated and validated?
  - Auto-generate from label on creation? (e.g., "Bride" → "bride")
  - Ensure uniqueness within event type?
  - Allow manual editing of slugs?
  - What happens if two fields generate the same slug?

- **Deletion behavior** - What happens to existing data when custom fields or sections are deleted?
  - ~~Custom field deleted: How are `field_values` in existing events affected?~~ **RESOLVED:** Prevent deletion if field is used in any events (show error message)
  - Script template deleted: Any impact on events using that template?
  - Section deleted from script: Any validation needed?

### Key Decisions Made

1. **Keep the sections table** - Granular sections with drag-and-drop reordering are necessary (for special liturgies)
2. **Expand section_type constraint** - Support cover_page, reading, psalm, ceremony, petitions, announcements, custom_text
3. **Use simple section structure for MVP** - Just section_type and content (markdown with placeholders)
4. **Placeholder-based rendering** - All section types use `{{placeholder}}` syntax that renderer expands
5. **Two template systems coexist** - Master event templates for reusable configs, Script templates for printable scripts
6. **This is primarily a UI problem** - Database infrastructure exists, needs UI layer for admin configuration
7. **Differentiated script approach by system type:**
   - **Special liturgies:** Full drag-and-drop script builder with sections
   - **Masses & parish events:** Simple output - custom fields printed in defined order (no builder needed)
8. **Custom field deletion protection** - Prevent deletion if field is used in any events (show error message requiring manual cleanup)
9. **Simple output implementation for masses/events** - Code-based content builder that reads `input_field_definitions.order` (no script templates in database)
10. **Conditional Hub navigation** - Show "Manage Scripts" link ONLY for special liturgies (hide for masses/events)

---

## Wisdom Agent Review Notes
(Added by wisdom-agent on 2025-12-23)

### Architecture Decision: Three-Page Structure

After reviewing the plan, we decided on a **three-page structure** instead of tabs (tabs don't work well on mobile):

```
/settings/event-types/{slug}         → Hub page (overview + links)
/settings/event-types/{slug}/fields  → Custom Fields management
/settings/event-types/{slug}/scripts → Scripts/Output configuration
```

**Hub Page (`/settings/event-types/{slug}`):**
- Event type overview (name, icon, description)
- Link to "Manage Custom Fields"
- Link to "Manage Scripts"
- Back navigation to parent settings page

**Fields Page (`/settings/event-types/{slug}/fields`):**
- Add/edit/reorder/delete custom fields
- Same UI for ALL three system types (masses, special-liturgies, parish-events)
- Drag-and-drop reordering

**Scripts Page (`/settings/event-types/{slug}/scripts`):**
- **Special liturgies:** Full drag-and-drop script builder with sections
- **Masses & parish events:** Simple message: "Scripts will print custom fields in their defined order"

### Why This Architecture

1. **Mobile-friendly** - No tabs, just linked pages
2. **Clean separation** - Each page does one thing
3. **Simpler code** - No complex conditionals on a single page
4. **Natural workflow** - "Define fields first, then configure output"

### Scope Simplification

The original vision was "build three complex systems for all three event types."

The clarified vision is:
- **Custom fields:** One robust system that works for all three types
- **Script builder:** Full feature for special liturgies only
- **Simple output:** Masses and parish events just print fields in order

This significantly reduces scope while still meeting real user needs.

---

## Architectural Simplification
(Added by wisdom-agent on 2025-12-23 - Final Session)

### The Key Insight: Script → Sections → Content

After further discussion, the architecture was simplified to:

```
Script
  └── Sections (ordered list)
        └── Each section holds a reference to Content Library item
```

**What this means:**
- **Scripts** are just ordered collections of sections (like a "playlist")
- **Sections** reference content from the Content Library (readings, prayers, ceremony texts)
- **Custom fields** (bride name, groom name, etc.) are NOT stored in sections - they're stored on the event itself and merged at render time via placeholder expansion

**Why this is simpler:**
1. **No section_type complexity** - Sections don't need type-specific behavior; they're just containers for content
2. **Content Library is the source of truth** - All readings, prayers, ceremony texts live in one place
3. **Clean separation** - Content (what to print) vs. Data (event-specific values) are kept separate
4. **Placeholder expansion at render time** - The renderer merges `{{bride.first_name}}` with event data when printing

### How It Works

1. **Admin creates script template:**
   - Adds sections in order (drag-and-drop)
   - Each section points to a Content Library item (e.g., "Wedding Vows - Traditional")
   - Content can include placeholders like `{{bride.first_name}}`

2. **Staff creates event:**
   - Fills in custom fields (bride, groom, etc.)
   - Selects script template for printing

3. **Renderer produces output:**
   - Loads script sections in order
   - Fetches content from Content Library for each section
   - Expands placeholders with event field values
   - Outputs HTML/PDF/Word

### Updated Database Understanding

**Existing tables:**
- `scripts` - Script templates (name, description, order)
- `sections` - Ordered sections within a script
- `content_library` - Readings, prayers, ceremony texts
- `input_field_definitions` - Custom field definitions per event type
- `master_events.field_values` - Event-specific custom field values (JSONB)

**Section structure (simplified):**
```sql
sections (
  id UUID,
  script_id UUID,      -- which script this belongs to
  name VARCHAR,        -- display name for admin
  content_id UUID,     -- reference to content_library item (NEW understanding)
  content TEXT,        -- OR inline markdown with placeholders
  page_break_after BOOLEAN,
  order INTEGER
)
```

**Note:** Some sections reference Content Library items; others have inline content. Both support `{{placeholder}}` syntax.

### Custom Fields and Placeholder Expansion

Custom fields live on the event type (`input_field_definitions`), and their values live on the event (`master_events.field_values`).

At render time, the renderer:
1. Loads section content (from content_id or inline content)
2. Finds all `{{placeholder}}` patterns
3. Looks up placeholder in `field_values` JSONB
4. Replaces placeholder with actual value
5. Handles nested properties: `{{bride.first_name}}` → looks up `bride` field → gets person record → extracts `first_name`

**This existing pattern is correct and doesn't need to change.**

### What This Means for Implementation

**For the Scripts Page (Special Liturgies):**
- Section builder shows Content Library items to choose from
- Admin can also add inline text sections with placeholders
- Drag-and-drop reordering of sections

**For Masses & Parish Events:**
- No script builder needed
- Code-based content builder reads custom fields in order
- Auto-generates a simple printable output

**The section_type field is optional metadata:**
- All sections are just containers for content
- Rendering behavior is driven by the content itself (markdown formatting, special liturgical markers)
- The renderer treats all sections the same way: expand placeholders, convert markdown, apply styling
- **Decision:** Keep the column in the database but remove the CHECK constraint. The column is now nullable and can be any value or null. It provides optional categorization hints but is not required for functionality
- **Migration updated:** Removed `NOT NULL DEFAULT 'text'` and `CHECK` constraint from `sections.section_type`

---

## Final Devil's Advocate Review
(Added by devils-advocate-agent on 2025-12-23)

### Summary of Final Review

After reviewing the updated requirements document with the three-page architecture and simplified scope, I identified three critical areas needing clarification:

1. **Custom field deletion behavior** - RESOLVED: Prevent deletion if field is used in any events
2. **Simple output implementation** - RESOLVED: Code-based content builder reading `input_field_definitions.order`
3. **Hub page navigation logic** - RESOLVED: Conditionally hide Scripts link for masses/events

All three questions have been answered and documented in the Review Notes above.

### Document Status

**READY FOR REQUIREMENTS-AGENT**

The requirements document is now complete with:
- Clear three-page architecture (hub → fields → scripts)
- Simplified scope (full script builder only for special liturgies)
- Deletion protection strategy (prevent deletion if field is used)
- Simple output implementation (code-based content builder for masses/events)
- Conditional navigation (Scripts link only shown for special liturgies)

### Critical Items for Requirements-Agent

The requirements-agent should pay special attention to:

1. **Custom field deletion validation** - Must implement a check to count usage before allowing deletion
2. **Code-based content builder** - Needs to be created for masses/events that reads `input_field_definitions.order`
3. **Conditional UI rendering** - Hub page must check `system_type` to show/hide Scripts link
4. **Database migration** - `sections.section_type` constraint needs expansion (already documented)

No major gaps, ambiguities, or unresolved concerns remain that would block implementation.

---
