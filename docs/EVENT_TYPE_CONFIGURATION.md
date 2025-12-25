# Event Type Configuration System

> **Purpose:** Complete guide to configuring event types with custom fields and script templates through the `/settings/event-types/{slug}` detail pages.

---

## Table of Contents

- [Overview](#overview)
- [Three-Page Architecture](#three-page-architecture)
- [Custom Fields System](#custom-fields-system)
- [Script Templates System](#script-templates-system)
- [Content Builders](#content-builders)
- [Placeholder Syntax](#placeholder-syntax)
- [Database Schema](#database-schema)
- [Server Actions](#server-actions)
- [Validation Rules](#validation-rules)
- [Integration Points](#integration-points)
- [Examples and Best Practices](#examples-and-best-practices)

---

## Overview

The Event Type Configuration system allows parish administrators to customize how events are created and printed across all three system types (masses, special liturgies, and parish events).

### Key Capabilities

**Custom Fields:**
- Define what data to collect for each event type
- 16 field types available (person, text, date, content picker, etc.)
- Drag-and-drop ordering controls form display
- Fields appear dynamically on event creation/edit forms

**Script Templates:**
- **Special liturgies only:** Full drag-and-drop ceremony builder with sections
- **Masses & parish events:** Auto-generated scripts from custom fields (no builder needed)
- Placeholder expansion system merges custom field data into templates

**Route Structure:**
```
/settings/event-types/{slug}/         → Hub page (overview + navigation)
/settings/event-types/{slug}/fields   → Custom fields management
/settings/event-types/{slug}/scripts  → Script templates (special liturgies only)
```

---

## Three-Page Architecture

### Hub Page (`/settings/event-types/{slug}`)

**Purpose:** Navigation hub for event type configuration

**Server Component:** `src/app/(main)/settings/event-types/[slug]/page.tsx`

**Layout:**
1. Event type name, icon, and description
2. Navigation cards:
   - "Manage Custom Fields" → `/settings/event-types/{slug}/fields`
   - "Manage Scripts" → `/settings/event-types/{slug}/scripts` (only shown for special liturgies)
3. Back button to parent settings page

**Conditional Navigation:**
```typescript
if (eventType.system_type === 'special-liturgy') {
  // Show both "Manage Custom Fields" and "Manage Scripts" cards
} else {
  // Show only "Manage Custom Fields" card (hide Scripts card)
}
```

**Key Features:**
- Simple, mobile-friendly navigation
- Consistent with settings pages pattern
- Breadcrumbs integration

---

### Fields Page (`/settings/event-types/{slug}/fields`)

**Purpose:** Manage custom field definitions for this event type

**Server Component:** `src/app/(main)/settings/event-types/[slug]/fields/page.tsx`

**Client Component:** `src/app/(main)/settings/event-types/[slug]/fields/fields-list-client.tsx`

**Layout:**
1. Explanatory alert: "Custom fields define what data to collect for {event type name}"
2. Drag-and-drop field list with edit/delete buttons
3. Empty state: "No custom fields defined. Click Add Custom Field to get started."
4. "Add Custom Field" button (primary action)
5. Field form dialog (add/edit)

**Drag-and-Drop Reordering:**
- Uses `@dnd-kit` for reordering
- Order determines display sequence on event forms
- Calls `reorderInputFieldDefinitions()` server action

**Field Form Dialog:**

Required fields:
- **Field Label** (text) - Display name (e.g., "Bride", "Groom", "Deceased")
- **Field Type** (select) - One of 16 types
- **Required** (toggle) - Whether field must be filled

Conditional fields (based on type):
- `list_item` → Show ListPicker for `list_id`
- `content` or `petition` → Show tag input for `input_filter_tags`
- `person` → Show "Key Person" checkbox (`is_key_person`)
- `calendar_event` → Show "Primary Event" checkbox (`is_primary`)

Auto-generated field:
- **Property Name** (slug) - Auto-generated from label, shown as read-only

**Validation:**
- Label is required
- Property name must be unique within event type
- Property name format: `^[a-z][a-z0-9_]*$`
- Type-specific flags: `is_primary` only for `calendar_event`, `is_key_person` only for `person`

---

### Scripts Page (`/settings/event-types/{slug}/scripts`)

**Purpose:** Manage script templates (special liturgies only)

**Server Component:** `src/app/(main)/settings/event-types/[slug]/scripts/page.tsx`

**Two UI Modes:**

#### Special Liturgies (Full Script Builder)

**Client Component:** `src/app/(main)/settings/event-types/[slug]/scripts/scripts-list-client.tsx`

**Layout:**
1. Explanatory alert: "Script templates define the structure of printable ceremony scripts"
2. List of script templates with drag-and-drop reordering
3. For each script:
   - Script name and description
   - "Edit" button → `/settings/event-types/{slug}/scripts/{script_id}`
   - "Delete" button → confirmation dialog
4. "Add Script Template" button

**Script Builder Page:** `/settings/event-types/{slug}/scripts/[scriptId]`

**Server Component:** `src/app/(main)/settings/event-types/[slug]/scripts/[scriptId]/page.tsx`

**Client Component:** `src/app/(main)/settings/event-types/[slug]/scripts/[scriptId]/script-builder-client.tsx`

**Two-Column Layout:**
1. **Left Column:** Sections list with drag-and-drop
2. **Right Column:** Placeholder reference panel

**Sections List:**
- Drag-and-drop reordering (uses `@dnd-kit`)
- Each section shows: name, type, content preview (first 100 chars)
- Edit button → opens section dialog
- Delete button → confirmation dialog
- "Add Section" button

**Section Form Dialog:**

Fields:
- **Section Name** (text) - Display name
- **Section Type** (select) - 7 options (cover_page, reading, psalm, ceremony, petitions, announcements, custom_text)
- **Content** (rich text/markdown) - Section content with placeholder support
- **Page Break After** (checkbox) - Insert page break after this section

**Placeholder Insertion:**
- Toolbar button shows dropdown of available placeholders
- Click placeholder → inserts `{{property_name}}` into content
- For `person` fields: Shows nested properties (first_name, last_name, full_name)

**Placeholder Reference Panel:**

Shows:
- All custom fields from event type
- For each field: name, type, placeholder syntax
- Click to copy placeholder to clipboard
- Standard placeholders: `{{event_date}}`, `{{event_time}}`, `{{event_location}}`

#### Masses & Parish Events (Simple Message)

**Layout:**
Simple message: "Scripts for {event type name} are auto-generated from custom fields in their defined order."

No script builder interface needed - uses code-based content builder instead.

---

## Custom Fields System

### The 16 Field Types

**Reference Types (select existing records):**
- `person` - PersonPickerField (UUID)
- `group` - GroupPickerField (UUID)
- `location` - LocationPickerField (UUID)
- `list_item` - ListItemField (UUID) - requires `list_id`
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

- **Label** (string) - Display name shown to users
- **Property Name** (string) - Auto-generated slug from label
- **Type** (enum) - One of the 16 field types
- **Required** (boolean) - Whether field must be filled
- **Order** (integer) - Controls display sequence on forms

**Type-Specific Config:**
- `list_id` (UUID) - For `list_item` type only
- `input_filter_tags` (array) - For `content` and `petition` types

**Special Flags:**
- `is_key_person` (boolean) - For `person` type - makes field searchable in list view
- `is_primary` (boolean) - For `calendar_event` type - marks main occurrence

### Property Name Slug Generation

**Rules:**
- Auto-generated from field label on creation
- Lowercase only
- Replace spaces with underscores
- Remove special characters (except underscores)
- Must start with a letter (prepend 'field_' if starts with number)
- Must be unique within event type
- Format: `^[a-z][a-z0-9_]*$`

**Examples:**
```
"Bride" → "bride"
"Groom's Father" → "grooms_father"
"Rehearsal Date" → "rehearsal_date"
"1st Reading" → "field_1st_reading"
```

**Implementation:** See `generatePropertyName()` in field utilities

### How Custom Fields Appear on Event Forms

When staff create or edit an event:

1. Event form loads with standard fields (event name, date, location, etc.)
2. Custom fields for that event type appear below standard fields
3. Custom fields render using their configured field type
4. Required fields are marked and validated
5. Field order matches the order defined on the event type detail page

**Implementation:** `src/app/(main)/events/[event_type_id]/master-event-form.tsx`

The form component:
1. Extracts `input_field_definitions` from `eventType`
2. Initializes `field_values` from event or empty
3. For each field (ordered by `field.order`):
   - Renders field based on `field.type`
   - Stores values in state keyed by `field.property_name`
4. On submit: Collects all `field_values` as JSONB object

### Field Deletion Protection

**Rule:** Cannot delete a custom field if it's used in any events

**Validation Logic:**
1. Get field definition (`event_type_id`, `property_name`, `name`)
2. Query `master_events` table for events with this `event_type_id`
3. For each event: Check if `field_values` JSONB contains `property_name` key
4. If usage count > 0: Throw error
5. Else: Proceed with deletion

**Error Message:**
```
"Cannot delete field '{field.name}'. It is used in {usage_count} event(s).
Please remove this field from all events before deleting the definition."
```

**Implementation:** Enhanced `deleteInputFieldDefinition()` server action includes `countFieldUsage()` helper

---

## Script Templates System

### Overview

**Two Approaches Based on System Type:**

| System Type | Script Approach | Builder UI | Output System |
|-------------|----------------|------------|---------------|
| **Special Liturgies** | Database templates | Full builder with sections | Template-based (scripts table) |
| **Masses** | Code-based | No builder (hidden) | Auto-generated from fields |
| **Parish Events** | Code-based | No builder (hidden) | Auto-generated from fields |

### Database-Driven Templates (Special Liturgies)

**Tables Used:**
- `scripts` - Script templates (name, description, order)
- `sections` - Individual sections within a script (name, section_type, content, order, page_break_after)

**Section Types:**
- `cover_page` - Title page with event details
- `reading` - Scripture reading from content library
- `psalm` - Responsorial psalm
- `ceremony` - Custom ceremony text (vows, blessings, rituals)
- `petitions` - Prayers of the faithful
- `announcements` - Parish announcements
- `custom_text` - Free-form text section

**Note:** `section_type` is optional metadata (nullable, no constraint). All sections are just containers for content. Rendering behavior is driven by the content itself (markdown formatting, special liturgical markers).

**How It Works:**

1. Admin creates script template
2. Adds sections in desired order (drag-and-drop)
3. Each section has:
   - Name (display name)
   - Content (markdown with `{{placeholders}}`)
   - Optional page break flag
4. Sections are rendered in order when printing

**Placeholder Expansion:**

All placeholders use `{{property_name}}` syntax:
- `{{bride.first_name}}` - Nested property from person field
- `{{rehearsal_date}}` - Direct field value
- `{{event_date}}` - Standard placeholder

Renderer expands placeholders at render time by looking up values from event's `field_values` JSONB.

### Code-Based Auto-Generation (Masses & Parish Events)

**Location:** `/src/lib/content-builders/simple-event-script/`

**How It Works:**

1. No database script templates needed
2. Content builder reads `input_field_definitions` in order
3. For each field:
   - If field has a value in `field_values`
   - Format value based on type (person → full_name, date → formatDatePretty, etc.)
   - Add to output: `**{field.name}:** {formatted_value}`
4. Return script object with sections

**Example Output:**
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
**First Reading:** 1 Corinthians 13:1-13
**Gospel:** John 15:9-12
```

**Integration Point:**

Event view pages check `system_type`:
- If `special-liturgy` → Show script template selector
- If `mass` or `event` → Call `buildSimpleEventScript()`

---

## Content Builders

### Simple Event Script Builder

**Purpose:** Auto-generate printable scripts for masses and parish events

**Location:** `src/lib/content-builders/simple-event-script/index.ts`

**Function Signature:**
```typescript
function buildSimpleEventScript(
  event: MasterEventWithRelations,
  eventType: EventTypeWithRelations
): ScriptOutput
```

**Process:**
1. Validate inputs (event has `field_values`, eventType has `input_field_definitions`)
2. Create cover page section with event metadata
3. Add custom fields section:
   - Loop through `input_field_definitions` ordered by `field.order`
   - For each field with a value in `field_values`:
     - Format value based on type
     - Add to content: `**{field.name}:** {formatted_value}`
   - Skip spacer fields
4. Return script object with sections array

**Field Value Formatting:**
- `person` → resolved `person.full_name`
- `location` → resolved `location.name`
- `content` → resolved content title
- `date` → `formatDatePretty(value)`
- `time` → `formatTimePretty(value)`
- `text`, `rich_text` → value as-is
- `yes_no` → "Yes" or "No"

### Script Template Builder

**Purpose:** Render database-driven script templates for special liturgies

**Location:** Existing `DynamicScriptViewer` component

**Component:** `src/components/dynamic-script-viewer.tsx`

**Process:**
1. Call `processScriptForRendering(script, event)`
2. For each section in `script.sections`:
   - Replace `{{property_name}}` placeholders with values from `event.field_values`
   - Replace `{{person_field.full_name}}` with resolved person data
   - Replace `{{location_field.name}}` with resolved location data
   - Replace standard placeholders: `{{event_date}}`, `{{event_time}}`, `{{event_location}}`
   - Convert markdown to HTML
   - Apply liturgical styling (e.g., `{red}text{/red}`)
3. Render processed sections with HTML content

**See Also:** [RENDERER.md](./RENDERER.md) for complete rendering documentation

---

## Placeholder Syntax

### Syntax Reference

**Basic Placeholder:**
```
{{property_name}}
```

**Nested Properties (Person Fields):**
```
{{bride.first_name}}
{{bride.last_name}}
{{bride.full_name}}
{{groom.first_name}}
{{officiant.full_name}}
```

**Location Fields:**
```
{{ceremony_location.name}}
{{ceremony_location.address}}
```

**Standard Placeholders:**
```
{{event_date}}        - Primary calendar event date
{{event_time}}        - Primary calendar event time
{{event_location}}    - Primary calendar event location
```

**Direct Field Values:**
```
{{rehearsal_date}}     - Date field
{{special_music}}      - Text field
{{reception_details}}  - Rich text field
```

### How Placeholders Work

1. **Admin writes template:**
   ```
   We gather today to celebrate the marriage of {{bride.first_name}}
   and {{groom.first_name}} at {{ceremony_location.name}}.
   ```

2. **System looks up values:**
   - Find `bride` in event's `field_values` JSONB
   - Get person record, extract `first_name`
   - Find `groom`, repeat process
   - Find `ceremony_location`, get location record

3. **Rendered output:**
   ```
   We gather today to celebrate the marriage of Maria
   and José at St. Mary's Church.
   ```

### Placeholder Reference Panel

**Purpose:** Help admins discover available placeholders

**Location:** Script builder page (right column)

**Shows:**
- All custom fields from event type
- For each field:
  - Field name and type
  - Placeholder syntax: `{{property_name}}`
  - For person fields: nested options (first_name, last_name, full_name)
  - Click to copy button

**Standard placeholders section:**
- `{{event_date}}`
- `{{event_time}}`
- `{{event_location}}`

---

## Database Schema

### Existing Tables

**Event Types:**
```sql
event_types (
  id UUID,
  parish_id UUID,
  name VARCHAR,
  slug VARCHAR,
  system_type VARCHAR CHECK (system_type IN ('mass-liturgy', 'special-liturgy', 'parish-event')),
  icon VARCHAR,
  order INTEGER
)
```

**Custom Field Definitions:**
```sql
input_field_definitions (
  id UUID,
  event_type_id UUID,
  name VARCHAR,                    -- Display label
  property_name VARCHAR,           -- Slug for placeholders
  type VARCHAR,                    -- One of 16 types
  required BOOLEAN,
  order INTEGER,
  list_id UUID,                    -- For list_item type
  input_filter_tags JSONB,         -- For content/petition types
  is_key_person BOOLEAN,           -- For person type
  is_primary BOOLEAN,              -- For calendar_event type
  is_per_calendar_event BOOLEAN
)
```

**Script Templates:**
```sql
scripts (
  id UUID,
  event_type_id UUID,
  name VARCHAR,
  description TEXT,
  order INTEGER
)
```

**Script Sections:**
```sql
sections (
  id UUID,
  script_id UUID,
  name VARCHAR,
  section_type VARCHAR NULLABLE,  -- Optional metadata (no constraint)
  content TEXT,                   -- Markdown with placeholders
  page_break_after BOOLEAN,
  order INTEGER
)
```

**Master Events (stores custom field values):**
```sql
master_events (
  id UUID,
  parish_id UUID,
  event_type_id UUID,
  field_values JSONB,             -- Custom field data
  status VARCHAR
)
```

### Database Migration (Completed)

**Migration:** Removed `NOT NULL` constraint and `CHECK` constraint from `sections.section_type`

**Reason:** `section_type` is optional metadata. All sections are containers for content; rendering behavior is driven by content itself.

---

## Server Actions

### Event Types

**Location:** `src/lib/actions/event-types.ts`

**Actions:**
- `getEventTypeBySlug(slug)` - Get event type by slug
- `getEventTypeWithRelationsBySlug(slug)` - Get event type with input fields and scripts
- `createEventType(data)` - Create new event type
- `updateEventType(id, data)` - Update event type
- `deleteEventType(id)` - Delete event type
- `reorderEventTypes(orderedIds)` - Reorder event types

### Input Field Definitions

**Location:** `src/lib/actions/input-field-definitions.ts`

**Actions:**
- `getInputFieldDefinitions(eventTypeId)` - List fields for event type
- `getInputFieldDefinitionWithRelations(id)` - Get single field with custom list
- `createInputFieldDefinition(data)` - Create new field
- `updateInputFieldDefinition(id, data)` - Update field
- `deleteInputFieldDefinition(id)` - Delete field (with usage validation)
- `reorderInputFieldDefinitions(eventTypeId, orderedIds)` - Reorder fields
- `countFieldUsage(eventTypeId, propertyName)` - Count events using field

**Enhanced Deletion:**

The `deleteInputFieldDefinition()` action now includes usage validation:

```typescript
async function deleteInputFieldDefinition(id: string) {
  // 1. Get field definition
  const field = await getFieldDefinition(id);

  // 2. Count usage
  const usageCount = await countFieldUsage(
    field.event_type_id,
    field.property_name
  );

  // 3. Validate
  if (usageCount > 0) {
    throw new Error(
      `Cannot delete field '${field.name}'. It is used in ${usageCount} event(s).`
    );
  }

  // 4. Delete
  await deleteField(id);
}
```

### Scripts

**Location:** `src/lib/actions/scripts.ts`

**Actions:**
- `getScripts(eventTypeId)` - List scripts for event type
- `getScript(id)` - Get single script
- `getScriptWithSections(id)` - Get script with all sections
- `createScript(data)` - Create new script
- `updateScript(id, data)` - Update script
- `deleteScript(id)` - Delete script (cascades to sections)
- `reorderScripts(eventTypeId, orderedIds)` - Reorder scripts

### Sections

**Location:** `src/lib/actions/sections.ts`

**Actions:**
- `getSections(scriptId)` - List sections for script
- `getSection(id)` - Get single section
- `createSection(scriptId, data)` - Create new section
- `updateSection(id, data)` - Update section
- `deleteSection(id)` - Delete section
- `reorderSections(scriptId, orderedIds)` - Reorder sections

---

## Validation Rules

### Property Name Slug Validation

**Format:** `^[a-z][a-z0-9_]*$`

**Rules:**
- Lowercase only
- Must start with a letter
- Allows letters, numbers, underscores
- No spaces or special characters

**Uniqueness:** Must be unique within event type (database constraint)

### Field Type Flag Validation

**`is_key_person`:**
- Only valid for `person` type
- Server action validates before save

**`is_primary`:**
- Only valid for `calendar_event` type
- Only ONE field per event type can be marked primary
- Database: Unique constraint `idx_input_field_definitions_primary_calendar_event`
- Server action: Checks before setting `is_primary = true`

### Custom Field Deletion Validation

**Implemented in:** `deleteInputFieldDefinition()`

**Process:**
1. Count events using this field (check JSONB for `property_name` key)
2. If count > 0: Throw error with usage count
3. Else: Proceed with deletion

**PostgreSQL Query:**
```sql
SELECT COUNT(*)
FROM master_events
WHERE event_type_id = $1
  AND field_values ? $2  -- JSONB contains key operator
```

---

## Integration Points

### Event Creation/Edit Forms

**How custom fields integrate:**

1. Event form component fetches event type with relations
2. Extracts `input_field_definitions` array
3. For each field (ordered by `field.order`):
   - Renders appropriate field component based on `field.type`
   - Binds to `field_values` state object
4. On submit: Saves `field_values` as JSONB

**File:** `src/app/(main)/events/[event_type_id]/master-event-form.tsx`

**Dynamic rendering logic:**
```typescript
{inputFieldDefinitions.map((field) => {
  switch (field.type) {
    case 'person':
      return <PersonPickerField key={field.id} {...fieldProps} />;
    case 'text':
      return <FormInput key={field.id} {...fieldProps} />;
    case 'date':
      return <DatePickerField key={field.id} {...fieldProps} />;
    // ... 13 more types
  }
})}
```

### Event View/Print Pages

**Script selection logic:**

```typescript
if (eventType.system_type === 'special-liturgy') {
  // Show script template selector
  // User picks from available templates
  // Render using DynamicScriptViewer
} else {
  // Call buildSimpleEventScript(event, eventType)
  // Render using generic ScriptRenderer
}
```

**Files:**
- `src/app/(main)/events/[event_type_id]/[id]/page.tsx`
- `src/app/(main)/mass-liturgies/[id]/page.tsx`

### Settings Navigation

**Parent settings pages link to detail hub:**

**Masses Settings:** `/settings/mass-liturgies`
- Each mass type has "View Details" link → `/settings/event-types/{slug}`

**Events Settings:** `/settings/events`
- Each event type has "View Details" link → `/settings/event-types/{slug}`

**Special Liturgies Settings:** `/settings/special-liturgies`
- Each special liturgy has "View Details" link → `/settings/event-types/{slug}`

---

## Examples and Best Practices

### Example 1: Wedding Event Type

**Custom Fields:**
1. Bride (person, required, is_key_person)
2. Groom (person, required, is_key_person)
3. Wedding Date (calendar_event, required, is_primary)
4. Rehearsal Date (calendar_event, required)
5. Officiant (person, required)
6. Best Man (person)
7. Maid of Honor (person)
8. First Reading (content, input_filter_tags: ['wedding', 'first-reading'])
9. Gospel (content, input_filter_tags: ['wedding', 'gospel'])
10. Special Music (text)

**Script Template (Special Liturgy):**

Section 1: Cover Page
```markdown
# Wedding Ceremony
## {{bride.first_name}} {{bride.last_name}} & {{groom.first_name}} {{groom.last_name}}

**Date:** {{event_date}}
**Time:** {{event_time}}
**Location:** {{event_location}}
**Officiant:** {{officiant.full_name}}
```

Section 2: First Reading
```markdown
## First Reading
{{first_reading}}

**Reader:** {{maid_of_honor.full_name}}
```

Section 3: Gospel
```markdown
## Gospel
{{gospel}}
```

Section 4: Ceremony (Vows)
```markdown
## Exchange of Vows

**Officiant:** {{bride.first_name}} and {{groom.first_name}},
have you come here to enter into Marriage without coercion,
freely and wholeheartedly?

**Bride and Groom:** We have.

---

**{{groom.first_name}}:** I, {{groom.first_name}}, take you, {{bride.first_name}},
to be my wife. I promise to be faithful to you, in good times and in bad,
in sickness and in health, to love you and to honor you all the days of my life.

**{{bride.first_name}}:** I, {{bride.first_name}}, take you, {{groom.first_name}},
to be my husband. I promise to be faithful to you, in good times and in bad,
in sickness and in health, to love you and to honor you all the days of my life.
```

### Example 2: Funeral Event Type (Parish Event)

**Custom Fields:**
1. Deceased Name (person, required, is_key_person)
2. Funeral Date (calendar_event, required, is_primary)
3. Visitation Date (calendar_event)
4. Family Contact (person, required)
5. Officiant (person, required)
6. Special Requests (rich_text)

**Auto-Generated Script (Code-Based):**

Since this is a parish event (not special liturgy), no script builder is needed.
The system auto-generates:

```
================================
Funeral Service
================================
Date: Monday, June 17, 2025
Time: 10:00 AM
Location: St. Mary's Church

--------------------------------

**Deceased Name:** John Doe
**Funeral Date:** June 17, 2025 at 10:00 AM
**Visitation Date:** June 16, 2025 at 7:00 PM
**Family Contact:** Jane Doe
**Officiant:** Fr. John Smith
**Special Requests:** Family requests donations to
St. Vincent de Paul Society in lieu of flowers.
```

### Best Practices

**Custom Fields:**

1. **Order matters:** Fields appear on forms in the order you define
2. **Mark key people:** Use `is_key_person` for searchable participants
3. **Use descriptive labels:** "Bride" not "Person 1"
4. **Group related fields:** Put all date/time fields together
5. **Use spacers:** Visual separators improve form readability

**Script Templates:**

1. **Start with cover page:** Always include event metadata
2. **Use nested properties:** `{{bride.first_name}}` not just `{{bride}}`
3. **Test placeholders:** Verify all placeholders resolve before publishing
4. **Add page breaks:** Use `page_break_after` to control layout
5. **Keep sections focused:** One liturgical element per section

**Field Naming:**

1. **Singular labels:** "Bride" not "Brides"
2. **Avoid special characters:** Use simple, clear names
3. **Be specific:** "Wedding Date" not just "Date"
4. **Consider placeholders:** "grooms_father" reads better than "person_2"

**Deletion Safety:**

1. **Check usage first:** View how many events use a field before deleting
2. **Clean up data:** Remove field from events before deleting definition
3. **Communicate changes:** Notify staff before removing fields

---

## Related Documentation

- **[INPUT_FIELD_TYPES_QUICK_REFERENCE.md](./INPUT_FIELD_TYPES_QUICK_REFERENCE.md)** - Complete field type reference
- **[CONTENT_BUILDER_SECTIONS.md](./CONTENT_BUILDER_SECTIONS.md)** - Section system documentation
- **[RENDERER.md](./RENDERER.md)** - Script rendering system
- **[TAG_SYSTEM.md](./TAG_SYSTEM.md)** - Tag filtering for content pickers
- **[DRAG_AND_DROP.md](./DRAG_AND_DROP.md)** - Drag-and-drop implementation
- **[MODULE_REGISTRY.md](./MODULE_REGISTRY.md)** - All routes and modules
- **[SCRIPT_TEMPLATING.md](./SCRIPT_TEMPLATING.md)** - Placeholder syntax, security considerations, resolution strategy
